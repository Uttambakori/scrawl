/* ============================================================
   MOTIFS / kalamkari — the Srikalahasti pen-and-dye grammar
   ------------------------------------------------------------
   Kalamkari (Srikalahasti, Andhra Pradesh) is drawn freehand
   with a kalam — a bamboo pen wrapped in wool that holds a
   reservoir of iron-black — on cotton that is then dyed madder
   red, indigo and myrobalan yellow, one dye bath at a time.

   Two things make it look like itself, and `kalam` does both:

   1. THE LINE SWELLS AND THINS. A broad pen held at a fixed angle
      draws a heavy stroke going one way and a hair going the
      other. Every contour here is a filled ribbon whose width is
      set by its direction against the nib, not a stroke of one
      weight.

   2. THE DYE STOPS SHORT OF THE LINE. Colour is painted into the
      shape, not up to it, so a thin reserve of undyed cotton runs
      just inside every outline. Here the dye is inset from the
      contour and the ground shows through the gap.

   Inside the dye goes the pen work: veins in a leaf, stippling in
   a petal, echo lines following a paisley round. The vocabulary
   is floral — the paisley (kalka), the flowering tree on its
   hillock, the lotus, the cusped arch — with birds and animals
   walking through it.

   Geometry is borrowed from the Madhubani pack, which loads first.
   ============================================================ */
(function () {
  const { TAU } = window.SCRAWL;
  const G = window.SCRAWL.GENS;
  const M = window.SCRAWL.MADHUBANI;
  const { smooth, resample, inset, place, perimeter, bounds, circ, tube, squeeze, ink, seg, clipSeg } = M;
  /* a dab of dye or a pen-prick: its outline must stay finer than the
     dab itself, or small stippling turns to a black smudge */
  const dot = (h, p, r, role) => h.dot(p[0], p[1], r, { role: role || 'line', fill: role || 'line', w: Math.min(.9, r * .5) });
  const D = Math.PI / 180;

  function def(key, cat, label, params, draw) {
    G[key] = { key, cat, label, params, draw, style: 'kalamkari', aspect: 'square' };
  }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ============================================================
     THE PEN AND THE DYE
     ============================================================ */
  const NIB = 38 * D;
  const DETAILS = ['plain', 'veins', 'stipple', 'hatch', 'echo', 'scales', 'florets'];
  const K_PLAIN = 0, K_VEINS = 1, K_STIPPLE = 2, K_HATCH = 3, K_ECHO = 4, K_SCALES = 5, K_FLORETS = 6;
  const other = t => t === 'accent' ? 'fill' : 'accent';

  /* a ribbon along the points: wide across the nib, a hair along it */
  function ribbon(h, pts, closed, w0, role) {
    const n = pts.length;
    if (n < 2) return;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1e-4;
      const ang = Math.atan2(ty, tx);
      let w = w0 * (.28 + .72 * Math.abs(Math.sin(ang - NIB)));
      if (!closed) w *= Math.min(1, Math.sin(Math.PI * Math.max(.04, i / (n - 1))) * 1.6 + .25);
      const nx = -ty / l * w / 2, ny = tx / l * w / 2;
      L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]);
    }
    const d = closed
      ? h._curveD(L, true, .25) + h._curveD(R.slice().reverse(), true, .25)
      : h._curveD(L.concat(R.slice().reverse()), true, .25);
    h.push(d, { role: role || 'line', fill: role || 'line', w: .05 });
  }

  /* a pen stroke along an open path */
  function pen(h, pts, w, role) {
    const dense = pts.length > 2 ? smooth(pts, false, 5) : pts;
    const P = perimeter(dense, false);
    ribbon(h, resample(dense, false, Math.max(6, Math.min(80, Math.round(P / 1.2)))), false, w || 1, role);
  }

  /* the pen work inside the dye — clipped by the caller */
  function detail(h, core, kind, o) {
    if (kind === K_PLAIN) return;
    const bb = bounds(core), [x, y, w, hh] = bb;
    const det = h.detail ?? 1;
    const step = o.step || 2.4;
    if (kind === K_ECHO) {
      const minDim = Math.min(w, hh);
      for (let k = 1; k <= 3; k++) {
        const g = k * Math.max(step * .9, minDim * .1);
        if (g > minDim * .42) break;
        ink(h, inset(core, g), true, .5, k % 2 ? 'line' : 'accent');
      }
      return;
    }
    if (kind === K_VEINS) {
      const ax = o.axis || [[x + w / 2, y + hh], [x + w / 2, y]];
      const [a, b] = ax, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l;
      ink(h, [a, b], false, .7);
      const k = Math.max(3, Math.min(Math.round(l / Math.max(1.2, step)), Math.round(24 * det) + 3));
      for (let i = 1; i < k; i++) {
        const t = i / k, p = [a[0] + dx * t, a[1] + dy * t], r = l * .6;
        [-1, 1].forEach(sd => {
          const vx = ux * .75 - sd * uy * .66, vy = uy * .75 + sd * ux * .66;
          ink(h, [p, [p[0] + vx * r * .5, p[1] + vy * r * .5], [p[0] + vx * r, p[1] + vy * r]], false, .4);
        });
      }
      return;
    }
    /* grid kinds, budgeted like every fill in the engine */
    const R = Math.hypot(w, hh) * .52, cx = x + w / 2, cy = y + hh / 2;
    const a = (o.ang === undefined ? 45 : o.ang) * D, ca = Math.cos(a), sa = Math.sin(a);
    const T = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
    let g = Math.max(.7, Math.min(w, hh) / 12, step / Math.max(.3, det));
    if (kind === K_HATCH) { const cap = Math.max(6, 70 * det); if (2 * R / g > cap) g = 2 * R / cap; }
    else { const cap = Math.max(24, (kind === K_FLORETS ? 160 : 600) * det), side = Math.sqrt(cap); if (2 * R / g > side) g = 2 * R / side; }
    const rows = Math.ceil(2 * R / g);
    const inBox = p => p[0] > x - g && p[0] < x + w + g && p[1] > y - g && p[1] < y + hh + g;
    for (let r = 0; r <= rows; r++) {
      const v = -R + r * g;
      if (kind === K_HATCH) { const c = clipSeg(T(-R, v), T(R, v), bb); if (c) h.line(c[0][0], c[0][1], c[1][0], c[1][1], { passes: 1, w: .4 }); continue; }
      for (let c = 0; c <= rows; c++) {
        const jit = kind === K_STIPPLE ? [h.j(g * .3), h.j(g * .3)] : [0, 0];
        const p = T(-R + c * g + (r % 2 ? g / 2 : 0) + jit[0], v + jit[1]);
        if (!inBox(p)) continue;
        if (kind === K_STIPPLE) dot(h, p, g * .12, 'line');
        else if (kind === K_SCALES) ink(h, h.arcPts(p[0], p[1] - g * .2, g * .5, g * .5, 0, Math.PI, 6), false, .4);
        else if (kind === K_FLORETS) {
          for (let q = 0; q < 5; q++) { const t = q / 5 * TAU; dot(h, [p[0] + Math.cos(t) * g * .18, p[1] + Math.sin(t) * g * .18], g * .1, other(o.tone || 'fill')); }
          dot(h, p, g * .07, 'line');
        }
      }
    }
  }

  /* THE KALAM.
     o.tone     'fill' | 'accent' | 'none' — the dye
     o.detail   pen work inside the dye (DETAILS)
     o.reserve  the undyed gap between contour and dye
     o.w        the pen's broad width
     o.axis     [base, tip] for veins */
  function kalam(h, pts, o) {
    o = o || {};
    const dense = o.sharp ? pts : smooth(pts, true, o.k || 5);
    const P = perimeter(dense, true);
    const n = Math.max(14, Math.min(180, Math.round(P / 1)));
    const outer = resample(dense, true, n);
    const bb = bounds(outer), minDim = Math.min(bb[2], bb[3]);
    const tone = o.tone || 'fill';
    const rs = Math.min(o.reserve === undefined ? .9 : o.reserve, minDim * .12);
    const core = rs > .15 ? inset(outer, rs) : outer;
    const cd = h._curveD(core, true, .25);
    if (tone !== 'none') h.push(cd, { role: tone, fill: tone, w: .05 });
    const kind = o.detail || K_PLAIN;
    if (kind) { h.clipStart(cd); detail(h, core, kind, o); h.clipEnd(); }
    /* a tiny motif in a border can't take a full-width pen stroke:
       it would drown in its own outline */
    ribbon(h, outer, true, Math.min(o.w || 1.3, Math.max(.25, minDim * .09)), 'line');
    return core;
  }

  const Tb = (f, s, sp) => tube(sp.map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4);

  /* a leaf: base to tip, pointed, veined */
  function leaf(h, base, tip, wd, o) {
    o = o || {};
    const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l * wd, ny = dx / l * wd, bend = o.bend || .15;
    const P = (t, k) => [base[0] + dx * t + nx * k + dx * 0, base[1] + dy * t + ny * k];
    const pts = [base, base, P(.3, 1 + bend), P(.65, .8 + bend), tip, tip, P(.65, -.8 + bend * .3), P(.3, -1 + bend * .3)];
    kalam(h, pts, { tone: o.tone || 'fill', detail: o.detail === undefined ? (wd < 2.6 ? K_PLAIN : K_VEINS) : o.detail, axis: [base, tip], step: Math.max(1, l / 7), w: o.w || .9, reserve: wd * .16 });
  }

  /* ============================================================
     THE PAISLEY — kalka, the mango-seed teardrop with its tip
     curled over. Nested paisleys, florets inside, a vine round.
     ============================================================ */
  const PAISLEY = [[0, 22], [-9, 19], [-14, 10], [-13.6, -2], [-8, -12], [0, -19], [8, -24], [15, -27], [18, -24], [16, -20], [12, -18.6], [10, -14], [13, -6], [14.6, 4], [12, 14], [7, 20]];
  const PAISLEY_KINDS = ['nested', 'flowered', 'veined', 'stippled', 'plain'];

  function paisley(h, f, s, kind, o) {
    o = o || {};
    const k = ((kind % PAISLEY_KINDS.length) + PAISLEY_KINDS.length) % PAISLEY_KINDS.length;
    const tone = o.tone || 'accent';
    const core = kalam(h, PAISLEY.map(f), { tone, w: 1.5 * s, reserve: 1.2 * s, detail: k === 3 ? K_STIPPLE : k === 2 ? K_HATCH : K_PLAIN, step: 1.8 * s, ang: -30 });
    if (k === 0) {
      /* two smaller paisleys inside, alternating dyes */
      [[.68, other(tone)], [.4, tone]].forEach(([sc, tn]) => {
        const g = p => f([p[0] * sc + 1 * (1 - sc), p[1] * sc + 4 * (1 - sc)]);
        kalam(h, PAISLEY.map(g), { tone: tn, w: 1.1 * s * sc + .4, reserve: .8 * s, detail: sc < .5 ? K_STIPPLE : K_PLAIN, step: 1.3 * s });
      });
    } else if (k === 1) {
      const c = f([0, 8]);
      flower(h, c, 8 * s, 8, other(tone), s);
      [[-6, -6], [4, -14]].forEach((q, i) => dot(h, f(q), 1.4 * s, i ? 'fill' : 'line'));
    } else if (k === 4) {
      ink(h, inset(core, 2.2 * s), true, .6);
    }
    /* the fringe of little petals round the outside */
    if (o.fringe !== false) {
      const out = resample(smooth(PAISLEY.map(f), true, 5), true, 40);
      const inw = inset(out, -2.4 * s);
      for (let i = 0; i < 40; i += 2) dot(h, inw[i], .9 * s, i % 4 ? 'accent' : 'line');
    }
  }

  /* a round kalam flower: petals round a seeded disc */
  function flower(h, c, R, n, tone, s) {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU, w = Math.PI / n;
      const P = (a, r) => [c[0] + Math.cos(t + a) * r, c[1] + Math.sin(t + a) * r];
      kalam(h, [P(-w * .9, R * .3), P(-w * .7, R * .78), P(0, R), P(w * .7, R * .78), P(w * .9, R * .3)], { tone: i % 2 ? tone : other(tone), w: .8 * s + .15, reserve: .5 * s, detail: R < 9 ? K_PLAIN : K_VEINS, axis: [P(0, R * .3), P(0, R)], step: R * .2 });
    }
    kalam(h, circ(c, R * .34, 14), { tone: 'fill', w: .8 * s + .15, reserve: .4 * s, detail: R < 9 ? K_PLAIN : K_STIPPLE, step: R * .1 });
  }

  def('kPaisley', 'Paisley', 'Paisley', [
    O('kind', 'Inside', PAISLEY_KINDS, 0), O('lay', 'Arrangement', ['single', 'pair', 'four', 'with vine'], 0),
    O('tone', 'Dye', ['madder', 'indigo'], 0), B('fringe', 'Petal fringe', true),
  ], (h, p) => {
    h.fitDraw({ x: 6, y: 6, w: 88, h: 88 }, (hh, cx, cy, s) => {
      const o = { tone: p.tone ? 'fill' : 'accent', fringe: !!p.fringe };
      if (p.lay === 1) {
        paisley(hh, place(cx - 8 * s, cy - 4 * s, s * .9, 1, .5), s * .9, p.kind, o);
        paisley(hh, place(cx + 8 * s, cy + 4 * s, s * .9, 1, .5 + Math.PI), s * .9, p.kind, Object.assign({}, o, { tone: other(o.tone) }));
      } else if (p.lay === 2) {
        for (let i = 0; i < 4; i++) {
          const t = i / 4 * TAU;
          paisley(hh, place(cx + Math.cos(t) * 16 * s, cy + Math.sin(t) * 16 * s, s * .6, 1, t + Math.PI / 2), s * .6, p.kind, Object.assign({}, o, { tone: i % 2 ? other(o.tone) : o.tone }));
        }
        flower(hh, [cx, cy], 7 * s, 8, o.tone, s * .6);
      } else if (p.lay === 3) {
        const pts = [];
        for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([cx - 30 * s + t * 60 * s, cy + 26 * s + Math.sin(t * TAU) * 5 * s]); }
        pen(hh, pts, 1.6 * s);
        [[-18, 1], [18, -1]].forEach(([x, sd]) => leaf(hh, [cx + x * s, cy + 26 * s], [cx + (x + sd * 8) * s, cy + 36 * s], 3 * s, { tone: 'fill' }));
        paisley(hh, place(cx, cy - 4 * s, s * .9, 1), s * .9, p.kind, o);
      } else paisley(hh, place(cx, cy, s, 1), s, p.kind, o);
    });
  });

  /* ============================================================
     FLOWERS, FRUIT AND LEAVES
     ============================================================ */
  const FLOWERS = ['rosette', 'lotus', 'carnation', 'poppy', 'pomegranate', 'mango', 'bud'];

  function bloom(h, f, s, kind, tone) {
    const k = ((kind % FLOWERS.length) + FLOWERS.length) % FLOWERS.length;
    if (k === 0) { flower(h, f([0, 0]), 20 * s, 10, tone, s); return; }
    if (k === 1) {
      /* side-view lotus: back petals, front petals, a seed-pod cup */
      [[-1, 'b'], [1, 'b'], [-1, 'f'], [1, 'f'], [0, 'f']].forEach(([sd, layer], i) => {
        const back = layer === 'b', ang = sd * (back ? .95 : .5), L = back ? 20 : 22;
        const tip = [Math.sin(ang) * L, 4 - Math.cos(ang) * L];
        const base = [sd * 3, 8], m = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2], wd = sd === 0 ? 6.4 : 5;
        const nx = Math.cos(ang) * wd, ny = Math.sin(ang) * wd;
        kalam(h, [base, [m[0] - nx, m[1] - ny], tip, tip, [m[0] + nx, m[1] + ny]].map(f), { tone: back ? other(tone) : tone, detail: K_VEINS, axis: [f(base), f(tip)], step: 3 * s, w: 1.1 * s + .3, reserve: .7 * s });
      });
      kalam(h, [[-10, 6], [10, 6], [7, 12], [-7, 12]].map(f), { tone: 'fill', detail: K_STIPPLE, step: 1.6 * s, w: 1.1 * s + .3 });
      return;
    }
    if (k === 2) {
      /* carnation: a fan of frilled petals over a calyx */
      const fr = [];
      for (let i = 0; i <= 14; i++) { const t = Math.PI * (1.12 + i / 14 * .76); const r = 20 + (i % 2) * 3.6; fr.push([Math.cos(t) * r, 6 + Math.sin(t) * r]); }
      kalam(h, [[-8, 6]].concat(fr, [[8, 6]]).map(f), { tone, detail: K_ECHO, step: 2.2 * s, w: 1.2 * s + .3, sharp: true });
      kalam(h, [[-7, 6], [7, 6], [4, 18], [-4, 18]].map(f), { tone: 'fill', detail: K_HATCH, step: 1.4 * s, w: 1.1 * s + .3 });
      return;
    }
    if (k === 3) {
      for (let i = 0; i < 4; i++) {
        const t = -Math.PI / 2 + (i - 1.5) * .72, c = [Math.cos(t) * 9, 2 + Math.sin(t) * 9];
        kalam(h, circ(c, 10, 14).map(f), { tone: i % 2 ? tone : other(tone), detail: K_VEINS, axis: [f([0, 4]), f([c[0] * 2, c[1] * 2])], step: 3 * s, w: 1.1 * s + .3 });
      }
      kalam(h, circ([0, 6], 6, 12).map(f), { tone: 'fill', detail: K_STIPPLE, step: 1.4 * s, w: 1.1 * s + .3 });
      return;
    }
    if (k === 4) {
      const c = circ([0, 4], 18, 22);
      kalam(h, c.map(f), { tone, detail: K_PLAIN, w: 1.4 * s + .3, reserve: 1 * s });
      kalam(h, [[-6, -12], [-7, -19], [-3, -16], [0, -21], [3, -16], [7, -19], [6, -12]].map(f), { tone: 'fill', w: 1.1 * s + .3, sharp: true });
      for (let r = 0; r < 4; r++) for (let q = 0; q < 5 - Math.abs(r - 1.5); q++) {
        const x = (q - (4 - Math.abs(r - 1.5)) / 2) * 6, y = -4 + r * 7;
        kalam(h, circ([x, y], 2.4, 8).map(f), { tone: 'fill', w: .6 * s + .2, reserve: .3 * s });
      }
      return;
    }
    if (k === 5) {
      /* mango: the fruit the paisley is named after, with two leaves */
      kalam(h, [[0, 20], [-11, 14], [-14, 2], [-10, -10], [-2, -18], [6, -20], [9, -14], [11, -2], [10, 12]].map(f), { tone, detail: K_STIPPLE, step: 1.8 * s, w: 1.4 * s + .3 });
      pen(h, [[4, -19], [6, -24], [10, -26]].map(f), 1.2 * s);
      leaf(h, f([8, -25]), f([22, -30]), 4 * s, { tone: 'fill' });
      leaf(h, f([8, -25]), f([-6, -34]), 3.6 * s, { tone: 'fill', bend: -.1 });
      return;
    }
    pen(h, [[0, 24], [1, 10], [0, 2]].map(f), 1.4 * s);
    kalam(h, [[0, 4], [-7, -2], [-6, -12], [0, -22], [6, -12], [7, -2]].map(f), { tone, detail: K_ECHO, step: 2 * s, w: 1.2 * s + .3 });
    leaf(h, f([.6, 14]), f([-12, 8]), 3.4 * s, { tone: 'fill' }); leaf(h, f([.6, 18]), f([12, 12]), 3.4 * s, { tone: 'fill' });
  }

  def('kFlower', 'Flora', 'Flower & fruit', [
    O('kind', 'Kind', FLOWERS, 0), O('tone', 'Dye', ['madder', 'indigo'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 8, y: 6, w: 84, h: 88 }, (hh, cx, cy, s) => bloom(hh, place(cx, cy, s, 1), s, p.kind, p.tone ? 'fill' : 'accent'));
  });

  def('kLeaf', 'Flora', 'Leaf spray', [
    N('leaves', 'Leaves', 3, 11, 7), O('detail', 'Pen work', DETAILS, 1), O('tone', 'Dye', ['indigo', 'madder', 'both'], 2), B('bud', 'Bud at the tip', true),
  ], (h, p) => {
    h.fitDraw({ x: 10, y: 4, w: 80, h: 92 }, (hh, cx, cy, s) => {
      const stem = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; stem.push([cx + Math.sin(t * Math.PI * 1.3) * 6 * s, cy + 40 * s - t * 72 * s]); }
      pen(hh, stem, 1.6 * s);
      const n = Math.max(2, p.leaves);
      for (let i = 0; i < n; i++) {
        const t = .12 + i / n * .78, q = stem[Math.min(10, Math.round(t * 10))], sd = i % 2 ? 1 : -1;
        const tn = p.tone === 0 ? 'fill' : p.tone === 1 ? 'accent' : (i % 2 ? 'fill' : 'accent');
        leaf(hh, q, [q[0] + sd * (20 - t * 8) * s, q[1] - (8 + t * 4) * s], (4.2 - t * 1.4) * s, { tone: tn, detail: p.detail, bend: sd * .1 });
      }
      if (p.bud) bloom(hh, place(stem[10][0], stem[10][1] - 6 * s, s * .4, 1), s * .4, 6, 'accent');
    });
  });

  /* ============================================================
     THE TREE OF LIFE — the palampore's centre: a hillock of
     scalloped rocks, a sinuous trunk, branches bearing flowers
     that no single tree could grow.
     ============================================================ */
  function hillock(h, x0, x1, y, hgt, s, tone) {
    const n = Math.max(3, Math.round((x1 - x0) / (hgt * .9)));
    for (let r = 2; r >= 0; r--) {
      const m = n - r, w = (x1 - x0) / m;
      for (let i = 0; i < m; i++) {
        const cx = x0 + w * (i + .5) + r * w * .5 * 0, cy = y - r * hgt * .38;
        const arc = h.arcPts(cx, cy, w * .55, hgt * .55, Math.PI, TAU, 10);
        kalam(h, arc.concat([[cx + w * .55, cy + hgt * .2], [cx - w * .55, cy + hgt * .2]]), { tone: (i + r) % 2 ? tone : other(tone), detail: K_ECHO, step: hgt * .14, w: .9 * s + .3, reserve: .5 * s, sharp: true });
      }
    }
  }

  function tree(h, cx, cy, s, branches, o) {
    o = o || {};
    const f = place(cx, cy, s, 1);
    const n = Math.max(2, branches | 0);
    kalam(h, Tb(f, s, [[0, 40, 5.4], [-3, 24, 4.2], [3, 8, 3.6], [-1, -6, 3], [0, -20, 2.2]]), { tone: 'none', detail: K_HATCH, ang: 80, step: 1.6 * s, w: 1.3 * s + .3, sharp: true });
    const tips = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? .5 : i / (n - 1), off = u - .5;
      const y0 = 20 - (i % 2 ? 22 : 8) - Math.abs(off) * 6;
      const end = [off * 64, -22 + Math.abs(off) * 20 - (1 - Math.abs(off) * 2) * 14];
      const mid = [end[0] * .45, (y0 + end[1]) / 2 + 8];
      kalam(h, Tb(f, s, [[off * 4, y0, 1.8], mid.concat(1.3), end.concat(.8)]), { tone: 'none', w: .9 * s + .3, sharp: true, reserve: 0 });
      tips.push({ end, mid, off, i });
    }
    tips.forEach(({ end, mid, off, i }) => {
      const sd = off < 0 ? -1 : 1;
      leaf(h, f(mid), f([mid[0] + sd * 10, mid[1] - 7]), 3 * s, { tone: i % 2 ? 'accent' : 'fill' });
      leaf(h, f(mid), f([mid[0] - sd * 4, mid[1] - 11]), 2.6 * s, { tone: i % 2 ? 'fill' : 'accent' });
      bloom(h, place(...f(end), s * .42, 1, off * 1.2), s * .42, [0, 3, 2, 4, 1, 6][i % 6], i % 2 ? 'fill' : 'accent');
    });
    bloom(h, place(...f([0, -26]), s * .5, 1), s * .5, 1, 'accent');
    hillock(h, f([-30, 0])[0], f([30, 0])[0], f([0, 46])[1], 9 * s, s, 'accent');
    if (o.birds) {
      const L = tips[0], R = tips[tips.length - 1];
      bird(h, ...f([R.mid[0] + 4, R.mid[1] - 12]), s * .38, 1, { dir: -1 });
      bird(h, ...f([L.mid[0] - 4, L.mid[1] - 12]), s * .38, 1, { dir: 1, tone: 'accent' });
      bird(h, ...f([-20, 30]), s * .42, 0, { dir: 1 });
    }
  }

  def('kTree', 'Compositions', 'Tree of life', [
    N('branches', 'Branches', 2, 8, 6), B('birds', 'Birds', true),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 3, w: 92, h: 94 }, (hh, cx, cy, s) => tree(hh, cx, cy, s, p.branches, p));
  });

  /* ============================================================
     BIRDS
     ============================================================ */
  const BIRDS = ['peacock', 'parrot', 'swan', 'rooster', 'flying'];
  function bird(h, cx, cy, s, kind, o) {
    o = o || {};
    const f = place(cx, cy, s, o.dir || 1);
    const k = ((kind % BIRDS.length) + BIRDS.length) % BIRDS.length;
    const tone = o.tone || 'fill', w = 1.1 * s + .3;
    const legs = (y0, y1) => [-1, 3].forEach(x => { pen(h, [[x, y0], [x, y1]].map(f), .8 * s + .3); pen(h, [[x - 2.4, y1 + 1], [x, y1], [x + 2.6, y1 + .8]].map(f), .6 * s + .3); });
    if (k === 0) {
      /* the tail: a long sweep of feathers, each tipped with an eye */
      const n = o.feathers || 7;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), a = Math.PI * .7 + t * .55, L = 32 + (1 - Math.abs(t - .5) * 2) * 10;
        const base = [-6, 6], tip = [base[0] + Math.cos(a) * L, base[1] + Math.sin(a) * L * .6];
        pen(h, [base, [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2 + 2], tip].map(f), .7 * s + .3);
        for (let q = 1; q < 6; q++) {
          const u = q / 6, p0 = [base[0] + (tip[0] - base[0]) * u, base[1] + (tip[1] - base[1]) * u];
          pen(h, [p0, [p0[0] - 1.5, p0[1] + 2.6]].map(f), .4 * s + .2); pen(h, [p0, [p0[0] + .6, p0[1] - 2.8]].map(f), .4 * s + .2);
        }
        kalam(h, circ(f(tip), 3.4 * s, 12, 2.6 * s), { tone: i % 2 ? 'accent' : 'fill', w: .7 * s + .3, reserve: .5 * s });
        dot(h, f(tip), 1.1 * s, 'line');
      }
      legs(8, 20);
      kalam(h, Tb(f, s, [[3, -6, 3.4], [7.6, -14, 2.4], [8.6, -21, 2]]), { tone, detail: K_SCALES, step: 1.5 * s, w, sharp: true, reserve: .5 * s });
      kalam(h, [[10, -4], [8, 4], [2, 10], [-8, 10], [-11, 4], [-6, -3], [2, -7]].map(f), { tone, detail: K_SCALES, step: 2 * s, w });
      leaf(h, f([-9, 3]), f([6, -2]), 4 * s, { tone: other(tone), detail: K_HATCH, bend: .3 });
      kalam(h, circ(f([9.6, -23.6]), 3.4 * s, 12), { tone, w, reserve: .4 * s });
      kalam(h, [[12.6, -24.4], [12.6, -24.4], [16.4, -23], [16.4, -23], [12.4, -22]].map(f), { tone: 'accent', w: .7 * s + .2, reserve: 0 });
      for (let i = -1; i <= 1; i++) { const tip = [9.6 + i * 2.2, -32.6]; pen(h, [[9.6, -26.6], tip].map(f), .5 * s + .2); dot(h, f(tip), 1 * s, 'accent'); }
      dot(h, f([10.4, -24]), .8 * s, 'line');
      return;
    }
    if (k === 1) {
      pen(h, [[-16, 16.6], [0, 15], [16, 16]].map(f), 1.4 * s);
      leaf(h, f([-1, 11]), f([-8, 31]), 3 * s, { tone: other(tone), detail: K_HATCH });
      legs(12, 15.6);
      kalam(h, [[4, -10], [8, -3], [7, 5], [2.6, 11.6], [-3.4, 13], [-5.6, 8], [-4, 0], [-1, -7]].map(f), { tone, w, detail: K_STIPPLE, step: 1.4 * s });
      leaf(h, f([-3, -3]), f([-2, 13]), 3.6 * s, { tone: other(tone), detail: K_SCALES, bend: .3 });
      kalam(h, circ(f([4.6, -13]), 5.4 * s, 14), { tone, w });
      kalam(h, [[9.4, -15.2], [9.4, -15.2], [13.6, -13.6], [13.6, -13.6], [12.6, -9.2], [10.6, -11.2]].map(f), { tone: 'accent', w: .8 * s + .2, reserve: 0 });
      dot(h, f([6, -14.4]), 1 * s, 'line');
      pen(h, h.arcPts(...f([4.6, -12.4]), 5 * s, 4 * s, .3, 1.5, 8), 1 * s, 'accent');
      return;
    }
    if (k === 2) {
      for (let i = 0; i < 2; i++) { const pts = []; for (let q = 0; q <= 12; q++) pts.push([-20 + q * 3.4, 11 + i * 3.4 + Math.sin(q * 1.3 + i) * 1]); pen(h, pts.map(f), .8 * s, 'fill'); }
      kalam(h, [[-14, 0], [-14, 0], [-22, -10], [-12, -5], [-4, -5], [8, -4], [12, 2], [6, 8], [-10, 8]].map(f), { tone, w, detail: K_ECHO, step: 1.6 * s });
      leaf(h, f([-12, 1]), f([5, -1]), 3.6 * s, { tone: other(tone), detail: K_SCALES, bend: .2 });
      kalam(h, Tb(f, s, [[7, -3, 2.4], [11, -12, 1.8], [8, -20, 2], [10, -24, 2.6]]), { tone, w, sharp: true, reserve: .4 * s });
      kalam(h, [[12.6, -25], [12.6, -25], [17.6, -23.4], [17.6, -23.4], [12.6, -22.4]].map(f), { tone: 'accent', w: .7 * s + .2, reserve: 0 });
      dot(h, f([10.6, -24.6]), .8 * s, 'line');
      return;
    }
    if (k === 3) {
      /* rooster: a comb, wattles, and a tail of sickle feathers */
      legs(8, 20);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI * .95 + i * .22, L = 20 - i * 1.4;
        const base = [-7, 0], tip = [base[0] + Math.cos(a) * L, base[1] + Math.sin(a) * L];
        const pts = [base, [base[0] + Math.cos(a - .5) * L * .6, base[1] + Math.sin(a - .5) * L * .6 - 2], tip];
        pen(h, pts.map(f), 1.6 * s, i % 2 ? 'accent' : 'fill');
      }
      kalam(h, [[9, -10], [10, -2], [6, 7], [-4, 9], [-10, 3], [-8, -5], [0, -8]].map(f), { tone, w, detail: K_SCALES, step: 1.8 * s });
      leaf(h, f([-7, 0]), f([6, 3]), 3.6 * s, { tone: other(tone), detail: K_HATCH, bend: .3 });
      kalam(h, circ(f([9, -14]), 4 * s, 12), { tone, w });
      kalam(h, [[6, -17], [7, -21], [9, -18.6], [11, -22], [12, -17.4]].map(f), { tone: 'accent', w: .7 * s + .2, sharp: true, reserve: 0 });
      kalam(h, [[12.6, -14.6], [12.6, -14.6], [16, -13.6], [12.4, -12.4]].map(f), { tone: 'fill', w: .6 * s + .2, reserve: 0 });
      kalam(h, circ(f([11.4, -9.6]), 1.6 * s, 8, 2.4 * s), { tone: 'accent', w: .6 * s + .2, reserve: 0 });
      dot(h, f([10, -14.6]), .8 * s, 'line');
      return;
    }
    leaf(h, f([-2, -2]), f([-20, -24]), 6 * s, { tone: other(tone), detail: K_VEINS, bend: .2 });
    leaf(h, f([2, -2]), f([12, -28]), 6 * s, { tone: other(tone), detail: K_VEINS, bend: -.2 });
    kalam(h, [[-10, 2], [-10, 2], [-20, 8], [-18, 2], [-20, -2]].map(f), { tone: 'accent', w, sharp: true });
    kalam(h, circ(f([0, 0]), 11 * s, 16, 5.6 * s), { tone, w, detail: K_STIPPLE, step: 1.4 * s });
    kalam(h, circ(f([11.6, -3]), 3.8 * s, 12), { tone, w });
    kalam(h, [[15, -4], [15, -4], [19.6, -2.6], [19.6, -2.6], [15, -1.4]].map(f), { tone: 'accent', w: .7 * s + .2, reserve: 0 });
    dot(h, f([12.4, -3.6]), .8 * s, 'line');
  }

  def('kBird', 'Birds', 'Bird', [
    O('kind', 'Kind', BIRDS, 0), O('tone', 'Dye', ['indigo', 'madder'], 0), N('feathers', 'Tail feathers (peacock)', 4, 12, 7), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 5, y: 5, w: 90, h: 90 }, (hh, cx, cy, s) => bird(hh, cx, cy, s, p.kind, { tone: p.tone ? 'accent' : 'fill', feathers: p.feathers, dir: p.dir ? -1 : 1 }));
  });

  def('kBirds', 'Birds', 'Pair of birds', [
    O('kind', 'Kind', BIRDS.slice(0, 4), 0), B('flower', 'Flower between', true),
  ], (h, p) => {
    h.fitDraw({ x: 3, y: 6, w: 94, h: 88 }, (hh, cx, cy, s) => {
      const gap = [30, 20, 24, 22][p.kind];
      bird(hh, cx - gap * s, cy, s * .8, p.kind, { dir: -1 * (p.kind === 0 ? 1 : -1), tone: 'fill' });
      bird(hh, cx + gap * s, cy, s * .8, p.kind, { dir: 1 * (p.kind === 0 ? 1 : -1), tone: 'accent' });
      if (p.flower) bloom(hh, place(cx, cy - 10 * s, s * .45, 1), s * .45, 1, 'accent');
    });
  });

  /* ============================================================
     ANIMALS — outlined in the swelling pen, stippled not striped
     ============================================================ */
  const BEASTS = ['elephant', 'horse', 'lion', 'deer'];
  function beast(h, cx, cy, s, kind, o) {
    o = o || {};
    const f = place(cx, cy, s, o.dir || 1);
    const k = ((kind % BEASTS.length) + BEASTS.length) % BEASTS.length;
    const tone = o.tone || 'fill', w = 1.3 * s + .3;
    const leg = (a, b, c, r0, r1, tn) => kalam(h, Tb(f, s, [[a[0], a[1], r0], [b[0], b[1], (r0 + r1) / 2], [c[0], c[1], r1]]), { tone: tn, w, sharp: true, reserve: .5 * s });
    if (k === 0) {
      [[-15, 1], [-7, 3]].forEach(q => leg(q, [q[0], 14], [q[0] - .4, 25], 3.8, 3.6, other(tone)));
      kalam(h, [[-20, -10], [-8, -15.6], [8, -15.6], [16, -11], [18.6, 2], [14, 10], [-16, 10], [-22.4, 2]].map(f), { tone, w, detail: K_STIPPLE, step: 2 * s });
      [[6, 3], [13, 1]].forEach(q => leg(q, [q[0], 14], [q[0] + .4, 25], 3.8, 3.6, tone));
      kalam(h, [[-13, -15.4], [9, -15.4], [11, 6], [6, 9], [-2, 6], [-10, 9], [-15, 6]].map(f), { tone: 'accent', w, detail: K_ECHO, step: 2 * s });
      paisley(h, place(...f([-2, -4]), s * .3, 1, 0), s * .3, 1, { tone: 'fill', fringe: false });
      kalam(h, Tb(f, s, [[28.4, 1, 3.6], [30, 9, 3], [28.6, 17, 2.2], [24.6, 21, 1.6], [22.6, 18.6, 1.2]]), { tone, w, detail: K_HATCH, ang: 0, step: 1.6 * s, sharp: true });
      kalam(h, [[14, -12], [20, -18.4], [28, -16.6], [31.6, -8], [30.4, 2], [26.6, 6.4], [21.6, 5.6], [16.6, 4]].map(f), { tone, w, detail: K_STIPPLE, step: 2 * s });
      kalam(h, [[27, 5.4], [27, 5.4], [33.6, 8.6], [34.2, 6.6]].map(f), { tone: 'none', w: .8 * s + .3, reserve: 0 });
      leaf(h, f([16, -8]), f([19, 5]), 4 * s, { tone: other(tone), detail: K_VEINS });
      dot(h, f([26, -9.6]), 1 * s, 'line'); pen(h, [[23.4, -9.6], [26, -11], [28.4, -9.8]].map(f), .6 * s + .2);
      pen(h, [[-22, 1], [-25, 12]].map(f), .9 * s);
      return;
    }
    if (k === 1) {
      leg([-12, 3], [-14, 13], [-12, 24], 2.6, 1.6, other(tone));
      leg([-7, 4], [-6, 14], [-8, 24], 2.6, 1.6, tone);
      for (let i = 0; i < 4; i++) pen(h, [[-17, -3], [-24 - i, 3 + i * 2], [-25 - i, 14 + i * 2]].map(f), .9 * s, i % 2 ? 'line' : 'accent');
      kalam(h, [[-17, -6], [-2, -9.6], [12, -9], [17, -2], [12, 6.4], [-14, 6.4], [-19.6, 0]].map(f), { tone, w, detail: K_STIPPLE, step: 2 * s });
      leg([9, 3], [14, 12], [16, 22], 2.6, 1.6, other(tone));
      leg([12, 1], [19, 9], [23, 16], 2.6, 1.6, tone);
      kalam(h, [[-8, -9.4], [6, -9.4], [7, 4], [-9, 4]].map(f), { tone: 'accent', w, detail: K_FLORETS, step: 3 * s, sharp: true });
      kalam(h, [[10, -8], [15.6, -20], [21, -27.4], [27.4, -24.6], [30.6, -18.6], [29.6, -16], [24, -16.6], [19.4, -6]].map(f), { tone, w });
      for (let i = 0; i < 7; i++) { const t = i / 6, b = [11 + t * 10, -8 - t * 19]; pen(h, [b, [b[0] - 4, b[1] + 1.4], [b[0] - 5.4, b[1] + 4]].map(f), 1 * s, i % 2 ? 'accent' : 'line'); }
      dot(h, f([24, -22]), .9 * s, 'line');
      return;
    }
    if (k === 2) {
      leg([-10, 4], [-14, 14], [-11, 24], 3, 2.2, tone);
      leg([-4, 5], [-2, 15], [-4, 24], 3, 2.1, other(tone));
      pen(h, [[-16, -2], [-24, -8], [-24, -20], [-18, -24], [-16, -20]].map(f), 1.4 * s);
      kalam(h, [[-16, -2], [-6, -8], [6, -12], [12, -6], [10, 4], [2, 8], [-12, 7]].map(f), { tone, w, detail: K_STIPPLE, step: 2 * s });
      leg([8, 0], [14, 8], [12, 20], 2.8, 2, tone);
      leg([10, -4], [19, -6], [23, -14], 2.8, 2, other(tone));
      for (let i = 0; i < 9; i++) {
        const t = -Math.PI * .95 + (i / 8) * Math.PI * 1.25, c = [15, -15];
        leaf(h, f([c[0] + Math.cos(t) * 5, c[1] + Math.sin(t) * 5]), f([c[0] + Math.cos(t) * 12, c[1] + Math.sin(t) * 12]), 2.4 * s, { tone: i % 2 ? 'accent' : 'fill', detail: K_PLAIN });
      }
      kalam(h, [[12, -20], [18, -22], [23, -19], [25, -14], [24, -9], [19, -8], [13, -10]].map(f), { tone, w });
      dot(h, f([19.6, -16.6]), .9 * s, 'line');
      pen(h, [[25, -12], [22.6, -11], [24.6, -9.4]].map(f), .7 * s);
      return;
    }
    [[-11, 2, -12, 24], [-7, 3, -5, 24], [8, 2, 9, 24], [11, 1, 14, 23]].forEach((q, i) => leg([q[0], q[1]], [(q[0] + q[2]) / 2, 13], [q[2], q[3]], 1.9, 1.1, i % 2 ? tone : other(tone)));
    kalam(h, [[-16, -4], [-2, -7.6], [10, -7], [15, -1], [10, 5], [-12, 5], [-17, 0]].map(f), { tone, w, detail: K_FLORETS, step: 3 * s });
    kalam(h, [[9, -6.6], [13, -16], [17, -23.4], [23.6, -22], [26.4, -17.6], [21, -16.6], [16.6, -6]].map(f), { tone, w });
    [[1, 1], [-1, .6]].forEach(([sd, sc]) => {
      const b = [18.4 + sd * .6, -23.6];
      pen(h, [b, [b[0] - 2 * sc, b[1] - 6], [b[0] - 1 * sc, b[1] - 12], [b[0] + 2 * sc, b[1] - 16]].map(f), 1.2 * s);
      pen(h, [[b[0] - 1.6 * sc, b[1] - 6], [b[0] - 5 * sc, b[1] - 8.6]].map(f), 1 * s);
    });
    dot(h, f([20.6, -19.6]), .8 * s, 'line');
  }

  def('kBeast', 'Animals', 'Animal', [
    O('kind', 'Kind', BEASTS, 0), O('tone', 'Dye', ['indigo', 'madder'], 0), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 6, w: 92, h: 88 }, (hh, cx, cy, s) => beast(hh, cx, cy, s, p.kind, { tone: p.tone ? 'accent' : 'fill', dir: p.dir ? -1 : 1 }));
  });

  /* ============================================================
     MEDALLION and ARCH
     ============================================================ */
  def('kMedallion', 'Compositions', 'Medallion', [
    N('paisleys', 'Paisleys', 4, 16, 8), B('petals', 'Outer petals', true), O('tone', 'Dye', ['madder', 'indigo'], 0),
  ], (h, p) => {
    const tn = p.tone ? 'fill' : 'accent', n = Math.max(3, p.paisleys);
    if (p.petals) {
      const m = n * 3;
      for (let i = 0; i < m; i++) {
        const t = (i / m) * TAU, w = Math.PI / m;
        const P = (a, r) => [50 + Math.cos(t + a) * r, 50 + Math.sin(t + a) * r];
        kalam(h, [P(-w * .9, 38), P(-w * .6, 44), P(0, 47), P(w * .6, 44), P(w * .9, 38)], { tone: i % 2 ? tn : other(tn), w: .8, reserve: .5 });
      }
      kalam(h, circ([50, 50], 38.4, 60), { tone: 'none', w: 1.2, reserve: 0 });
    }
    const s = Math.min(.55, 7 / n + .1);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      paisley(h, place(50 + Math.cos(t) * 24, 50 + Math.sin(t) * 24, s, 1, t - Math.PI / 2), s, i % 2 ? 3 : 0, { tone: i % 2 ? other(tn) : tn, fringe: false });
    }
    flower(h, [50, 50], 12, 10, tn, .6);
  });

  def('kArch', 'Compositions', 'Cusped arch', [
    O('inside', 'Inside the arch', ['flowering vase', 'tree of life', 'nothing'], 0), N('cusps', 'Cusps', 3, 9, 7), B('columns', 'Columns', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    /* the mihrab: a pointed arch whose inner edge breaks into lobes */
    const x0 = 6, x1 = W - 6, top = 6, spring = 40, R = (x1 - x0) / 2, cx = W / 2;
    const outer = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30, a = Math.PI + t * Math.PI, u = Math.cos(a);
      outer.push([cx + u * R, spring + Math.sin(a) * (spring - top) * (1 - .2 * Math.abs(u)) - (1 - Math.abs(u)) * 8]);
    }
    const n = Math.max(3, p.cusps), lobes = [];
    for (let i = 0; i < n; i++) {
      const a0 = Math.round(i / n * 30), a1 = Math.round((i + 1) / n * 30);
      const A = outer[a0], Bp = outer[a1];
      const m = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2], dx = Bp[0] - A[0], dy = Bp[1] - A[1], l = Math.hypot(dx, dy) || 1;
      const inw = [(-dy / l), (dx / l)];
      const toC = (cx - m[0]) * inw[0] + (spring - m[1]) * inw[1] > 0 ? 1 : -1;
      const P = (t, k) => [A[0] + dx * t + inw[0] * toC * (k + 6), A[1] + dy * t + inw[1] * toC * (k + 6)];
      lobes.push(P(0, 0), P(.25, l * .28), P(.5, l * .36), P(.75, l * .28));
    }
    lobes.push([x1 - 6, spring + 2]);
    const band = outer.concat([[x1, 96], [x1 - R * .22, 96], [x1 - R * .22, spring + 2]], lobes.reverse(), [[x0 + R * .22, spring + 2], [x0 + R * .22, 96], [x0, 96]]);
    kalam(hh, band, { tone: 'accent', w: 1.6, reserve: 1, detail: K_FLORETS, step: 5, sharp: true });
    if (p.columns) [[x0, x0 + R * .22], [x1 - R * .22, x1]].forEach(([a, b]) => {
      kalam(hh, [[a - 1, spring - 2], [b + 1, spring - 2], [b + 1, spring + 3], [a - 1, spring + 3]], { tone: 'fill', w: 1.2, sharp: true });
      kalam(hh, [[a - 1, 91], [b + 1, 91], [b + 1, 97], [a - 1, 97]], { tone: 'fill', w: 1.2, sharp: true });
    });
    if (p.inside === 0) {
      const c = [cx, 78];
      kalam(hh, circ(c, 11, 18, 9), { tone: 'fill', w: 1.4, detail: K_ECHO, step: 2.4 });
      kalam(hh, [[cx - 5, 70], [cx + 5, 70], [cx + 6, 66], [cx - 6, 66]], { tone: 'accent', w: 1.1, sharp: true });
      [[-1, 0], [0, 1], [1, 2]].forEach(([sd, kd]) => {
        const tip = [cx + sd * 14, 40 + Math.abs(sd) * 8];
        pen(hh, [[cx, 66], [cx + sd * 6, 56], tip], 1.2);
        bloom(hh, place(tip[0], tip[1], .36, 1, sd * .3), .36, [3, 1, 2][kd], sd ? 'accent' : 'fill');
      });
      leaf(hh, [cx, 62], [cx - 14, 58], 3, { tone: 'fill' }); leaf(hh, [cx, 62], [cx + 14, 58], 3, { tone: 'fill' });
    } else if (p.inside === 1) tree(hh, cx, 60, .6, 5, {});
  }));

  /* ============================================================
     BORDERS
     ============================================================ */
  const UNITS = ['paisleys', 'flowers', 'leaf chain', 'arches', 'mangoes', 'triangles', 'vine', 'dots'];
  function unit(h, Mp, kind, u0, u1, v0, v1, i) {
    const w = u1 - u0, hgt = v1 - v0, um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    const tn = i % 2 ? 'fill' : 'accent';
    /* motifs from the flower and paisley vocabularies are drawn in
       their own units, then moved into the strip */
    const at = (sc, rot) => { return p => { const c2 = Math.cos(rot || 0), s2 = Math.sin(rot || 0); const u = p[0] * sc, v = p[1] * sc; return Mp(um + u * c2 - v * s2, vm + u * s2 + v * c2); }; };
    switch (((kind % UNITS.length) + UNITS.length) % UNITS.length) {
      case 0: paisley(h, at(Math.min(w, hgt) / 58, i % 2 ? .6 : -.6), Math.min(w, hgt) / 58, i % 3 === 0 ? 0 : 3, { tone: tn, fringe: false }); break;
      case 1: flower(h, Mp(um, vm), Math.min(w, hgt) * .42, 8, tn, Math.min(w, hgt) / 50); break;
      case 2: {
        const sd = i % 2 ? 1 : -1;
        leaf(h, Mp(u0 + w * .05, vm), Mp(u1 - w * .05, vm + sd * hgt * .05), hgt * .3, { tone: tn, bend: sd * .2 });
        break;
      }
      case 3: {
        const pts = [];
        for (let q = 0; q <= 12; q++) { const t = Math.PI + q / 12 * Math.PI; pts.push(Mp(um + Math.cos(t) * w * .46, v1 + Math.sin(t) * hgt * .86)); }
        kalam(h, pts, { tone: tn, w: .9, reserve: .6, detail: K_ECHO, step: hgt * .12 });
        dot(h, Mp(um, v1 - hgt * .3), hgt * .06, 'line');
        break;
      }
      case 4: bloom(h, at(Math.min(w, hgt) / 62, i % 2 ? .4 : -.4), Math.min(w, hgt) / 62, 5, tn); break;
      case 5: kalam(h, [Mp(u0, v1), Mp(um, v0), Mp(u1, v1)], { tone: tn, w: .8, reserve: .5, detail: K_STIPPLE, step: hgt * .1, sharp: true }); break;
      case 6: {
        const pts = [];
        for (let q = 0; q <= 8; q++) { const t = q / 8; pts.push(Mp(u0 + t * w, vm + Math.sin(t * TAU) * hgt * .22)); }
        pen(h, pts, Math.max(.6, hgt * .04));
        leaf(h, Mp(u0 + w * .25, vm + hgt * .22), Mp(u0 + w * .45, v0 + hgt * .05), hgt * .12, { tone: tn });
        const fc = Mp(u0 + w * .75, vm - hgt * .22);
        for (let q = 0; q < 5; q++) { const t = q / 5 * TAU; dot(h, [fc[0] + Math.cos(t) * hgt * .12, fc[1] + Math.sin(t) * hgt * .12], hgt * .07, other(tn)); }
        dot(h, fc, hgt * .05, 'line');
        break;
      }
      default: dot(h, Mp(um, vm), Math.min(w, hgt) * .26, tn); ink(h, circ(Mp(um, vm), Math.min(w, hgt) * .38, 12), true, .5); break;
    }
  }

  function strip(h, x, y, len, hgt, kind, n, Mp0) {
    const Mp = (u, v) => Mp0(x + u, y + v);
    pen(h, [Mp(0, 0), Mp(len / 2, 0), Mp(len, 0)], Math.max(.8, hgt * .05));
    pen(h, [Mp(0, hgt), Mp(len / 2, hgt), Mp(len, hgt)], Math.max(.8, hgt * .05));
    const r = hgt * .08, k = Math.max(1, Math.round(n)), um = len / k;
    for (let i = 0; i < k; i++) unit(h, Mp, kind, i * um, (i + 1) * um, r, hgt - r, i);
  }

  def('kBorder', 'Borders', 'Border band', [
    O('kind', 'Unit', UNITS, 0), N('repeat', 'Repeats', 3, 40, 10), N('height', 'Band height', 30, 94, 70), B('edge', 'Dotted edges', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const H = Math.max(20, Math.min(94, p.height)), y0 = 50 - H / 2, e = p.edge ? H * .12 : 0;
    const id = (u, v) => [u, v];
    if (e) [y0 + e * .5, y0 + H - e * .5].forEach(y => { const k = Math.round((W - 2) / (e * 1.2)); for (let i = 0; i < k; i++) dot(hh, [1 + (i + .5) * (W - 2) / k, y], e * .24, i % 2 ? 'accent' : 'line'); });
    strip(hh, 1, y0 + e, W - 2, H - 2 * e, p.kind, p.repeat, id);
  }));

  def('kFrame', 'Borders', 'Frame', [
    O('kind', 'Unit', UNITS, 1), N('repeat', 'Repeats per side', 3, 20, 7), N('depth', 'Depth', 5, 18, 10),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const t = Math.max(4, p.depth), x = 1, y = 1, w = W - 2, H = 98;
    const lx = w - 2 * t, ly = H - 2 * t, ny = Math.max(1, Math.round(p.repeat)), nx = Math.max(1, Math.round(p.repeat * lx / ly));
    strip(hh, 0, 0, lx, t, p.kind, nx, (u, v) => [x + t + u, y + v]);
    strip(hh, 0, 0, lx, t, p.kind, nx, (u, v) => [x + w - t - u, y + H - v]);
    strip(hh, 0, 0, ly, t, p.kind, ny, (u, v) => [x + w - v, y + t + u]);
    strip(hh, 0, 0, ly, t, p.kind, ny, (u, v) => [x + v, y + H - t - u]);
    [[x, y], [x + w - t, y], [x, y + H - t], [x + w - t, y + H - t]].forEach((c, i) => flower(hh, [c[0] + t / 2, c[1] + t / 2], t * .44, 8, i % 2 ? 'fill' : 'accent', t / 30));
  }));

  /* butis: one small motif repeated in a half-drop grid, the way a
     block-printed yardage is laid out */
  def('kField', 'Borders', 'Buti field', [
    O('kind', 'Buti', ['paisley', 'flower', 'leaf', 'mango', 'dot'], 0), N('dens', 'Spacing', 10, 40, 20), B('alternate', 'Alternate dyes', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const det = hh.detail ?? 1;
    const g = Math.max(p.dens, Math.sqrt(W * 100 / Math.max(10, 90 * det)));
    for (let r = 0, y = g / 2; y < 100 + g / 2; r++, y += g * .86) {
      for (let c = 0, x = (r % 2) * g / 2; x < W + g / 2; c++, x += g) {
        const tn = p.alternate && (r + c) % 2 ? 'fill' : 'accent', sc = g / 64;
        if (x < -g * .4 || x > W + g * .4 || y > 100 + g * .4) continue;
        if (p.kind === 0) paisley(hh, place(x, y, sc, 1, -.3), sc, 3, { tone: tn, fringe: false });
        else if (p.kind === 1) flower(hh, [x, y], g * .3, 6, tn, sc);
        else if (p.kind === 2) leaf(hh, [x - g * .25, y + g * .15], [x + g * .25, y - g * .15], g * .12, { tone: tn });
        else if (p.kind === 3) bloom(hh, place(x, y, sc * .9, 1, .3), sc * .9, 5, tn);
        else { dot(hh, [x, y], g * .12, tn); ink(hh, circ([x, y], g * .2, 12), true, .5); }
      }
    }
  }));

  ['kBorder', 'kFrame', 'kField', 'kArch'].forEach(k => { G[k].aspect = 'free'; });
  G.kBorder.place = { w: .92, h: .1 };
  G.kFrame.place = { w: .9, h: .9 };
  G.kField.place = { w: .9, h: .9 };
  G.kArch.place = { w: .7, h: .9 };

  window.SCRAWL.KALAMKARI = { kalam, pen, ribbon, leaf, paisley, flower, bloom, tree, bird, beast, strip, DETAILS, FLOWERS, UNITS };
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
