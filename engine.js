/* ============================================================
   SCRAWL / engine — the hand
   Clean geometry in, drawn line out. Deterministic per seed.
   No dependencies.
   ============================================================ */

function rngFrom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 2166136261;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const n2 = v => Math.round(v * 100) / 100;
const TAU = Math.PI * 2;

/* ------------------------------------------------------------
   Hand
   Draws into a 0..100 x 0..100 local box (y down).
   Roles: 'line' | 'accent' | 'fill'  -> app maps them to colours.
   ------------------------------------------------------------ */
class Hand {
  constructor(seed, opts = {}) {
    this.seed = seed >>> 0;
    this.rng = rngFrom(this.seed);
    this.rough = opts.rough ?? 1.0;
    this.bow = opts.bow ?? 1.0;
    this.passes = opts.passes ?? 2;
    this.fillMode = opts.fillMode ?? 'none';   // none | solid | hatch | scribble | dots
    this.fillGap = opts.fillGap ?? 4;
    this.fillAngle = opts.fillAngle ?? -40;
    this.strokes = [];
    this._clip = null;
    this.lastD = '';
  }

  j(a) { return (this.rng() * 2 - 1) * a; }
  pick(arr) { return arr[(this.rng() * arr.length) | 0]; }

  push(d, o = {}) {
    if (!d) return this;
    this.strokes.push({
      d,
      role: o.role || 'line',
      fill: o.fill || 'none',
      w: o.w ?? 1,
      cap: o.cap || 'round',
      op: o.op ?? 1,
      clip: this._clip,
      dash: o.dash || null,
    });
    this.lastD = d;
    return this;
  }

  clipStart(d) { this._clip = d; return this; }
  clipEnd() { this._clip = null; return this; }

  /* --- straight-ish line ----------------------------------- */
  _lineD(x1, y1, x2, y2, k) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1e-4;
    const stray = Math.min(this.rough * k, len / 3);
    const j = () => this.j(stray);
    const nx = -dy / len, ny = dx / len;
    const b = this.bow * this.rough * 0.6 * (this.rng() * 2 - 1) * Math.min(1, len / 35);
    const bx = nx * b, by = ny * b;
    const t1 = 0.28 + this.rng() * 0.16, t2 = 0.62 + this.rng() * 0.16;
    return `M${n2(x1 + j())} ${n2(y1 + j())}C${n2(x1 + dx * t1 + bx + j())} ${n2(y1 + dy * t1 + by + j())} ${n2(x1 + dx * t2 + bx + j())} ${n2(y1 + dy * t2 + by + j())} ${n2(x2 + j())} ${n2(y2 + j())}`;
  }

  line(x1, y1, x2, y2, o = {}) {
    const n = o.passes ?? this.passes;
    let d = '';
    for (let p = 0; p < n; p++) d += this._lineD(x1, y1, x2, y2, 1 + p * 0.45);
    return this.push(d, o);
  }

  /* --- smooth curve through points -------------------------- */
  _curveD(pts, closed, k) {
    const n0 = pts.length;
    // Jitter has to stay small relative to the feature, or a 3-unit dot in a
    // pattern turns into a blob once the item is scaled up to poster size.
    let mean = 0;
    for (let i = 1; i < n0; i++) mean += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    mean = n0 > 1 ? mean / (n0 - 1) : 100;
    const stray = Math.min(this.rough * 0.9 * k, mean * 0.4);
    const P = pts.map(p => [p[0] + this.j(stray), p[1] + this.j(stray)]);
    const n = P.length;
    if (n < 2) return '';
    const at = i => closed ? P[((i % n) + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    let d = `M${n2(at(0)[0])} ${n2(at(0)[1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${n2(p1[0] + (p2[0] - p0[0]) / 6)} ${n2(p1[1] + (p2[1] - p0[1]) / 6)} ${n2(p2[0] - (p3[0] - p1[0]) / 6)} ${n2(p2[1] - (p3[1] - p1[1]) / 6)} ${n2(p2[0])} ${n2(p2[1])}`;
    }
    if (closed) d += 'Z';
    return d;
  }

  _sharpD(pts, closed, k) {
    let d = '';
    for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      d += this._lineD(a[0], a[1], b[0], b[1], k);
    }
    return d;
  }

  /* One continuous subpath through sharp corners.
     _sharpD emits a separate M per edge, which is right for a drawn
     outline but unfillable and useless as a clip — this is the fillable twin. */
  _sharpContD(pts, closed, k) {
    const stray = this.rough * 0.7 * k;
    const P = pts.map(p => [p[0] + this.j(stray), p[1] + this.j(stray)]);
    const n = P.length;
    if (n < 2) return '';
    let d = `M${n2(P[0][0])} ${n2(P[0][1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const a = P[i], b = P[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      d += `C${n2(a[0] + dx * 0.33 + this.j(stray * 0.5))} ${n2(a[1] + dy * 0.33 + this.j(stray * 0.5))} ${n2(a[0] + dx * 0.66 + this.j(stray * 0.5))} ${n2(a[1] + dy * 0.66 + this.j(stray * 0.5))} ${n2(b[0])} ${n2(b[1])}`;
    }
    if (closed) d += 'Z';
    return d;
  }

  curve(pts, o = {}) {
    const solid = o.fill && o.fill !== 'none';
    const n = solid ? 1 : (o.passes ?? this.passes);
    const mk = o.sharp ? (solid ? this._sharpContD : this._sharpD).bind(this) : this._curveD.bind(this);
    let d = '';
    for (let p = 0; p < n; p++) d += mk(pts, !!o.closed, 1 + p * 0.5);
    return this.push(d, o);
  }

  ellipse(cx, cy, rx, ry, o = {}) {
    const steps = Math.max(9, Math.round(7 + (rx + ry) * 0.3));
    const build = k => {
      const start = this.rng() * TAU;
      const over = o.exact ? 0 : 0.1 + this.rng() * 0.25;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = start + (i / steps) * (TAU + over);
        const w = Math.min(this.rough * 0.5 * k, Math.min(rx, ry) * 0.3);
        pts.push([cx + Math.cos(t) * (rx + this.j(w)), cy + Math.sin(t) * (ry + this.j(w))]);
      }
      return this._curveD(pts, false, k);
    };
    const solid = o.fill && o.fill !== 'none';
    const n = solid ? 1 : (o.passes ?? this.passes);
    let d = '';
    for (let p = 0; p < n; p++) d += build(1 + p * 0.4);
    return this.push(d, o);
  }

  rect(x, y, w, h, o = {}) {
    const r = o.r || 0;
    if (!r) {
      const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      return this.curve(pts, { ...o, closed: true, sharp: true });
    }
    const pts = [];
    const corners = [[x + r, y + r, Math.PI, 1.5 * Math.PI], [x + w - r, y + r, 1.5 * Math.PI, TAU],
    [x + w - r, y + h - r, 0, 0.5 * Math.PI], [x + r, y + h - r, 0.5 * Math.PI, Math.PI]];
    corners.forEach(([cx, cy, a0, a1]) => {
      for (let i = 0; i <= 4; i++) { const t = a0 + (a1 - a0) * (i / 4); pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); }
    });
    return this.curve(pts, { ...o, closed: true });
  }

  dot(cx, cy, r, o = {}) {
    return this.ellipse(cx, cy, r, r * (0.85 + this.rng() * 0.3), { ...o, fill: o.fill || 'line', passes: 1 });
  }

  /* --- fills ------------------------------------------------- */
  _hatchLines(bbox, gap, angle) {
    const [x, y, w, h] = bbox;
    const rad = angle * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const cx = x + w / 2, cy = y + h / 2, diag = Math.hypot(w, h);
    const out = [];
    for (let t = -diag / 2; t <= diag / 2; t += gap) {
      const jx = this.j(gap * 0.15), jy = this.j(gap * 0.15);
      out.push([
        cx + cos * t - sin * diag / 2 + jx, cy + sin * t + cos * diag / 2 + jy,
        cx + cos * t + sin * diag / 2 + jx, cy + sin * t - cos * diag / 2 + jy,
      ]);
    }
    return out;
  }

  _scribbleD(bbox, gap, angle) {
    const [x, y, w, h] = bbox;
    const rad = angle * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const cx = x + w / 2, cy = y + h / 2, diag = Math.hypot(w, h);
    const pts = []; let flip = 1, i = 0;
    for (let t = -diag / 2; t <= diag / 2; t += gap, i++) {
      const e = diag / 2 * (0.98 + this.rng() * 0.06);
      const a = [cx + cos * t - sin * e * flip, cy + sin * t + cos * e * flip];
      const b = [cx + cos * t + sin * e * flip, cy + sin * t - cos * e * flip];
      pts.push(flip > 0 ? a : b, flip > 0 ? b : a);
      flip *= -1;
    }
    return this._curveD(pts, false, 1);
  }

  /* fillable shape: outline + whatever fill mode is active */
  shape(pts, o = {}) {
    const closed = o.closed !== false;
    const mk = o.sharp ? this._sharpD.bind(this) : this._curveD.bind(this);
    // clip + solid fill both need ONE continuous subpath, not one per edge
    const mkSolid = o.sharp ? this._sharpContD.bind(this) : this._curveD.bind(this);
    const clean = mkSolid(pts, closed, 0.4);         // tidy version used for clipping
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
    const mode = o.forceFill || this.fillMode;
    const fillRole = o.fillRole || 'fill';

    if (mode === 'solid') {
      this.push(mkSolid(pts, closed, 0.7), { role: fillRole, fill: fillRole, w: 0.35, op: o.fillOp ?? 1 });
    } else if (mode === 'hatch' || mode === 'cross') {
      this.clipStart(clean);
      this._hatchLines(bbox, this.fillGap, this.fillAngle).forEach(l => this.line(l[0], l[1], l[2], l[3], { role: fillRole, passes: 1, w: 0.6 }));
      if (mode === 'cross') this._hatchLines(bbox, this.fillGap, this.fillAngle + 82).forEach(l => this.line(l[0], l[1], l[2], l[3], { role: fillRole, passes: 1, w: 0.6 }));
      this.clipEnd();
    } else if (mode === 'scribble') {
      this.clipStart(clean);
      this.push(this._scribbleD(bbox, this.fillGap, this.fillAngle), { role: fillRole, w: 0.7 });
      this.clipEnd();
    } else if (mode === 'dots') {
      this.clipStart(clean);
      const g = this.fillGap * 1.15;
      for (let yy = bbox[1]; yy < bbox[1] + bbox[3]; yy += g)
        for (let xx = bbox[0]; xx < bbox[0] + bbox[2]; xx += g)
          this.dot(xx + this.j(g * 0.2), yy + this.j(g * 0.2), g * 0.16, { role: fillRole, fill: fillRole });
      this.clipEnd();
    }

    if (o.outline !== false) {
      let d = '';
      const n = o.passes ?? this.passes;
      for (let p = 0; p < n; p++) d += mk(pts, closed, 1 + p * 0.5);
      this.push(d, { role: o.role || 'line', w: o.w ?? 1 });
    }
    this.lastD = clean;
    return this;
  }

  /* --- point helpers ---------------------------------------- */
  ring(cx, cy, rx, ry, n, rot = 0, wob = 0) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const t = rot + (i / n) * TAU;
      const w = wob ? 1 + this.j(wob) : 1;
      p.push([cx + Math.cos(t) * rx * w, cy + Math.sin(t) * ry * w]);
    }
    return p;
  }

  arcPts(cx, cy, rx, ry, a0, a1, n = 14) {
    const p = [];
    for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * (i / n); p.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
    return p;
  }
}

window.SCRAWL = { rngFrom, hashStr, Hand, TAU };
