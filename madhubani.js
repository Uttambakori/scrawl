/* ============================================================
   MOTIFS / madhubani — the Mithila visual grammar
   ------------------------------------------------------------
   Madhubani (Mithila painting, Bihar) is drawn with a nib or a
   bamboo twig, and the whole tradition rests on one move:

     EVERY CONTOUR IS DRAWN TWICE.

   An outer line, an inner line a few millimetres inside it, and
   the channel between them filled — with hatching (kachni, the
   line style of the Kayastha painters), with solid colour
   (bharni, the colour style of the Brahmin painters), with
   dots or a row of teeth. The double line is to Madhubani what
   the joint table is to Warli and the tube is to Gond, so it is
   the one mechanism here: `dline` takes any closed contour,
   insets it, fills the channel and packs the interior.

   Four rules the code has to keep:

   1. THE CHANNEL IS THE SIGNATURE. `band` picks what lives
      between the two lines. Change it and the same fish is a
      different village's fish.

   2. NO EMPTY GROUND. Mithila painting abhors a bare surface:
      interiors are hatched, scaled, dotted or washed with
      colour, and compositions scatter flowers into the gaps.

   3. FACES IN PROFILE, EYES FRONTAL. A person or an animal is
      seen from the side, but the eye is the large almond "fish
      eye" drawn as if from the front, with a pupil pushed up
      against the upper lid. That eye is the most recognisable
      single mark in the tradition.

   4. THREE PIGMENTS PER PIECE. Lamp-black for the line, the
      accent (sindoor red) for channels and ornament, and a
      third pigment — turmeric, leaf green, indigo — on the
      `fill` role. The style row claims palette slot 2 for that
      role, so a piece arrives in three colours, not two.
   ============================================================ */
(function () {
  const { TAU, Hand, n2 } = window.SCRAWL;
  const G = window.SCRAWL.GENS;
  const D = Math.PI / 180;

  function def(key, cat, label, params, draw) {
    G[key] = { key, cat, label, params, draw, style: 'madhubani', aspect: 'square' };
  }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ============================================================
     GEOMETRY
     ============================================================ */

  /* Catmull-Rom through the control points, sampled densely, so a
     contour can be inset point by point. Repeat a point to pin a
     corner, as everywhere else in the engine. */
  function smooth(pts, closed, k) {
    k = k || 6;
    const n = pts.length;
    if (n < 3) return pts.slice();
    const at = i => closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const out = [];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      for (let s = 0; s < k; s++) {
        const t = s / k, t2 = t * t, t3 = t2 * t;
        const f = j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t +
          (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
        out.push([f(0), f(1)]);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }

  function perimeter(pts, closed) {
    let L = 0;
    const m = pts.length, last = closed ? m : m - 1;
    for (let i = 0; i < last; i++) {
      const a = pts[i], b = pts[(i + 1) % m];
      L += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return L;
  }

  /* n points evenly spaced along the polyline. Even spacing is what
     makes an inset honest and a row of hatch marks regular. */
  function resample(pts, closed, n) {
    const m = pts.length, last = closed ? m : m - 1;
    const segs = []; let L = 0;
    for (let i = 0; i < last; i++) {
      const a = pts[i], b = pts[(i + 1) % m], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push([a, b, l]); L += l;
    }
    if (L <= 0 || !segs.length) return pts.slice();
    n = Math.max(3, n | 0);
    const step = L / (closed ? n : n - 1), out = [];
    let si = 0, acc = 0;
    for (let k = 0; k < n; k++) {
      const d = k * step;
      while (si < segs.length - 1 && acc + segs[si][2] < d) { acc += segs[si][2]; si++; }
      const [a, b, l] = segs[si], t = l > 0 ? Math.min(1, (d - acc) / l) : 0;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return out;
  }

  function area(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a / 2;
  }

  function offsetPts(pts, d) {
    const n = pts.length;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1e-4;
      return [p[0] - ty / l * d, p[1] + tx / l * d];
    });
  }

  /* inset works whichever way round the contour was wound — a
     mirrored figure winds its outline backwards */
  function inset(pts, d) {
    const q = offsetPts(pts, d);
    return Math.abs(area(q)) < Math.abs(area(pts)) ? q : offsetPts(pts, -d);
  }

  /* the part of segment a-b inside box [x, y, w, h] (Liang-Barsky).
     A fill line swept across a rotated frame is far longer than the
     shape it is clipped to; trimming it first keeps a fitted piece's
     measured bounds honest and saves the renderer the overhang. */
  function clipSeg(a, b, bb) {
    let t0 = 0, t1 = 1;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const P = [-dx, dx, -dy, dy], Q = [a[0] - bb[0], bb[0] + bb[2] - a[0], a[1] - bb[1], bb[1] + bb[3] - a[1]];
    for (let i = 0; i < 4; i++) {
      if (P[i] === 0) { if (Q[i] < 0) return null; continue; }
      const r = Q[i] / P[i];
      if (P[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
      else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
    return [[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]];
  }

  function bounds(pts) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    return [x0, y0, x1 - x0, y1 - y0];
  }

  /* figure units -> page: scale, mirror, bend and turn. `bend` arches
     a long body (a fish curling round its partner) without anyone
     having to redraw it. */
  function place(cx, cy, s, dir, rot, bend) {
    const c = Math.cos(rot || 0), sn = Math.sin(rot || 0), d = dir || 1, b = bend || 0;
    return p => {
      const u = p[0] * d * s, v = (p[1] + b * p[0] * p[0]) * s;
      return [cx + u * c - v * sn, cy + u * sn + v * c];
    };
  }

  /* a closed contour round a spine of [x, y, r] — arms, stems,
     trunks, a snake. Same idea as Gond's tube, built for insetting. */
  function tube(spine, k) {
    const sp = spine.length > 2 ? smoothSpine(spine, k || 4) : spine;
    const n = sp.length;
    if (n < 2) return [];
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const p = sp[i], q = sp[Math.min(i + 1, n - 1)], o = sp[Math.max(i - 1, 0)];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const len = Math.hypot(dx, dy) || 1e-4; dx /= len; dy /= len;
      L.push([p[0] - dy * p[2], p[1] + dx * p[2]]);
      R.push([p[0] + dy * p[2], p[1] - dx * p[2]]);
    }
    const cap = (i, j) => {
      const p = sp[i], q = sp[j];
      let dx = p[0] - q[0], dy = p[1] - q[1];
      const len = Math.hypot(dx, dy) || 1e-4; dx /= len; dy /= len;
      const out = [];
      for (let k2 = 1; k2 < 5; k2++) {
        const t = Math.atan2(dx, -dy) - (k2 / 5) * Math.PI;
        out.push([p[0] + Math.cos(t) * p[2], p[1] + Math.sin(t) * p[2]]);
      }
      return out;
    };
    return L.concat(cap(n - 1, n - 2), R.reverse(), cap(0, 1));
  }
  function smoothSpine(sp, k) {
    const xy = smooth(sp.map(p => [p[0], p[1]]), false, k);
    const m = xy.length;
    return xy.map((p, i) => {
      const u = (i / (m - 1)) * (sp.length - 1), i0 = Math.floor(u), i1 = Math.min(sp.length - 1, i0 + 1);
      return [p[0], p[1], sp[i0][2] + (sp[i1][2] - sp[i0][2]) * (u - i0)];
    });
  }

  /* ============================================================
     MARKS
     ============================================================ */
  /* A nib line: steady, a fraction of the sketchbook's wobble. */
  const ink = (h, pts, closed, w, role) => h.push(h._curveD(pts, !!closed, .5), { role: role || 'line', w: w || 1 });
  const seg = (h, a, b, w, role) => h.line(a[0], a[1], b[0], b[1], { passes: 1, w: w || .8, role: role || 'line' });
  const dot = (h, p, r, role) => h.dot(p[0], p[1], r, { role: role || 'line', fill: role || 'line' });
  const solid = (h, pts, role) => h.push(h._curveD(pts, true, .4), { role: role || 'line', fill: role || 'line', w: .25 });
  const ring = (h, p, r, w, role) => h.ellipse(p[0], p[1], r, r, { role: role || 'line', passes: 1, w: w || .8, exact: true });
  const circ = (c, r, n, ry) => { const o = []; for (let i = 0; i < n; i++) { const t = (i / n) * TAU; o.push([c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * (ry || r)]); } return o; };

  /* ============================================================
     THE CHANNEL AND THE INTERIOR
     ============================================================ */
  const BANDS = ['hatched', 'solid', 'dotted', 'teeth', 'triple', 'open', 'single'];
  const FILLS = ['colour', 'hatch', 'cross', 'scales', 'dots', 'florets', 'waves', 'plain'];
  const B_HATCH = 0, B_SOLID = 1, B_DOT = 2, B_TEETH = 3, B_TRIPLE = 4, B_OPEN = 5, B_SINGLE = 6;
  const F_COLOUR = 0, F_HATCH = 1, F_CROSS = 2, F_SCALES = 3, F_DOTS = 4, F_FLORETS = 5, F_WAVES = 6, F_PLAIN = 7;

  /* The interior vocabulary. Caller has clipped. Like Gond's
     signature, the mark budget is fixed and the step opens up to
     meet it, so a thumbnail is not ten thousand invisible ticks. */
  function pattern(h, bb, kind, step, ang) {
    if (kind === F_COLOUR || kind >= F_PLAIN) return;
    const [x, y, w, hh] = bb;
    const a = (ang || 0) * D, ca = Math.cos(a), sa = Math.sin(a);
    const R = Math.hypot(w, hh) * 0.52, cx = x + w / 2, cy = y + hh / 2;
    const T = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
    const det = h.detail ?? 1;
    const lined = kind === F_HATCH || kind === F_CROSS || kind === F_WAVES;
    let g = Math.max(.7, step / Math.max(.3, det));
    if (lined) { const cap = Math.max(8, 90 * det); if (2 * R / g > cap) g = 2 * R / cap; }
    else { const cap = Math.max(30, (kind === F_FLORETS ? 260 : 700) * det), side = Math.sqrt(cap); if (2 * R / g > side) g = 2 * R / side; }
    const support = (Math.abs(sa) * w + Math.abs(ca) * hh) / 2 + g;
    const inBox = p => p[0] > x - g && p[0] < x + w + g && p[1] > y - g && p[1] < y + hh + g;
    const lw = { passes: 1, w: .42 };

    const rows = Math.ceil(2 * R / g);
    for (let r = 0; r <= rows; r++) {
      const v = -R + r * g;
      if (Math.abs(v) > support) continue;
      if (kind === F_HATCH || kind === F_CROSS) {
        const c = clipSeg(T(-R, v), T(R, v), bb);
        if (c) h.line(c[0][0], c[0][1], c[1][0], c[1][1], lw);
        if (kind === F_CROSS) {
          const q = clipSeg(T(v, -R), T(v, R), bb);
          if (q) h.line(q[0][0], q[0][1], q[1][0], q[1][1], lw);
        }
        continue;
      }
      if (kind === F_WAVES) {
        const c = clipSeg(T(-R, v), T(R, v), bb);
        if (!c) continue;
        const ua = (c[0][0] - cx) * ca + (c[0][1] - cy) * sa, ub = (c[1][0] - cx) * ca + (c[1][1] - cy) * sa;
        const pts = [];
        for (let i = 0; i <= 12; i++) { const u = ua + (i / 12) * (ub - ua); pts.push(T(u, v + Math.sin(u / g * 1.6) * g * .28)); }
        h.curve(pts, { passes: 1, w: .45, role: 'accent' });
        continue;
      }
      const stag = (r % 2) ? g / 2 : 0;
      for (let c = 0; c <= rows; c++) {
        const u = -R + c * g + stag, p = T(u, v);
        if (!inBox(p)) continue;
        if (kind === F_SCALES) h.curve(h.arcPts(p[0], p[1] - g * .2, g * .5, g * .5, a, Math.PI + a, 7), lw);
        else if (kind === F_DOTS) h.dot(p[0], p[1], g * .14, { role: 'line', fill: 'line' });
        else if (kind === F_FLORETS) {
          h.ellipse(p[0], p[1], g * .26, g * .26, { role: 'accent', passes: 1, w: .45, exact: true });
          h.dot(p[0], p[1], g * .09, { role: 'line', fill: 'line' });
        }
      }
    }
  }

  /* What lives between the two lines. */
  function channel(h, outer, inner, kind, gap, tone) {
    const n = outer.length;
    const det = h.detail ?? 1;
    const P = perimeter(outer, true);
    const other = tone === 'accent' ? 'fill' : 'accent';
    const want = Math.max(6, Math.min(P / Math.max(.5, gap * .8), Math.max(16, 180 * det)));
    const every = Math.max(1, Math.round(n / want));
    if (kind === B_HATCH) {
      for (let i = 0; i < n; i += every) seg(h, outer[i], inner[(i + Math.max(1, every >> 1)) % n], .45);
    } else if (kind === B_SOLID) {
      h.push(h._curveD(outer, true, .3) + h._curveD(inner.slice().reverse(), true, .3), { role: other, fill: other, w: .2 });
    } else if (kind === B_DOT) {
      const ev = Math.max(1, Math.round(every * 1.5));
      for (let i = 0; i < n; i += ev) dot(h, [(outer[i][0] + inner[i][0]) / 2, (outer[i][1] + inner[i][1]) / 2], gap * .24, 'accent');
    } else if (kind === B_TEETH) {
      const ev = Math.max(1, Math.round(every * 1.2));
      for (let i = 0; i + 2 * ev <= n; i += 2 * ev) {
        h.curve([outer[i], inner[(i + ev) % n], outer[(i + 2 * ev) % n]], { closed: true, sharp: true, passes: 1, role: other, fill: other, w: .3 });
      }
    } else if (kind === B_TRIPLE) {
      ink(h, outer.map((p, i) => [(p[0] + inner[i][0]) / 2, (p[1] + inner[i][1]) / 2]), true, .5, 'accent');
    }
  }

  /* THE DOUBLE LINE.
     o.band   channel kind (BANDS)       o.fill  interior kind (FILLS)
     o.gap    channel width              o.step  interior pattern size
     o.tone   'fill' | 'accent' — which pigment washes the interior
     o.tint   wash the interior under the pattern too
     o.sharp  the points are already a polygon; don't round them */
  function dline(h, pts, o) {
    o = o || {};
    const dense = o.sharp ? pts : smooth(pts, true, o.k || 5);
    const P = perimeter(dense, true);
    const n = Math.max(16, Math.min(220, Math.round(P / .9)));
    const outer = resample(dense, true, n);
    const bb = bounds(outer), minDim = Math.min(bb[2], bb[3]);
    const band = o.band === undefined ? B_HATCH : o.band;
    const fill = o.fill === undefined ? F_COLOUR : o.fill;
    const tone = o.tone || 'fill';
    const gap = Math.min(o.gap === undefined ? 2 : o.gap, minDim * .2);
    const inner = (band === B_SINGLE || gap < .3) ? null : inset(outer, gap);
    const core = inner || outer;
    const coreD = h._curveD(core, true, .3);

    if (fill === F_COLOUR || (o.tint && fill !== F_PLAIN)) h.push(coreD, { role: tone, fill: tone, w: .2 });
    if (fill !== F_COLOUR && fill !== F_PLAIN) {
      h.clipStart(coreD);
      pattern(h, bounds(core), fill, o.step || 3, o.ang === undefined ? 45 : o.ang);
      h.clipEnd();
    }
    if (inner) channel(h, outer, inner, band, gap, tone);
    const w = o.w || 1.05;
    ink(h, outer, true, w);
    if (inner) ink(h, inner, true, w * .7);
    return { outer, core };
  }

  /* per-piece dials, handed down to every part */
  const look = (p, s, extra) => Object.assign({
    band: p.band === undefined ? B_HATCH : p.band,
    fill: p.fill === undefined ? F_COLOUR : p.fill,
    tint: !!p.tint, gap: 1.9 * s, step: (p.dens || 3) * s,
  }, extra || {});

  /* ============================================================
     THE FISH EYE
     ------------------------------------------------------------
     Profile face, frontal eye: a long almond, sharp at both ends,
     with the pupil pushed up hard against the upper lid and a
     kohl line flicking back from the outer corner.
     ============================================================ */
  function fishEye(h, f, c, len, ht, o) {
    o = o || {};
    const up = [], lo = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, x = c[0] - len / 2 + t * len;
      up.push([x, c[1] - Math.sin(t * Math.PI) * ht * (1 - t * .15)]);
      lo.push([x, c[1] + Math.sin(t * Math.PI) * ht * .62]);
    }
    const back = up[0], front = up[10];
    const pts = [back, back].concat(up.slice(1, 10), [front, front], lo.slice(1, 10).reverse());
    ink(h, pts.map(f), true, o.w || .85);
    const pup = [c[0] + len * .1, c[1] - ht * .38];
    dot(h, f(pup), ht * .62 * (o.s || 1), 'line');
    if (o.kohl !== false) seg(h, f(back), f([back[0] - len * .32, back[1] - ht * .5]), .7);
    if (o.brow !== false) ink(h, [[c[0] - len * .45, c[1] - ht * 1.35], [c[0], c[1] - ht * 1.95], [c[0] + len * .42, c[1] - ht * 1.55]].map(f), false, .75);
  }

  /* ============================================================
     FIGURES
     ------------------------------------------------------------
     A Mithila woman, facing right in figure units: head at about
     y -45, feet at +34. Frontal shoulders, profile face, a flared
     skirt with a hem band, a drape (aanchal) flowing behind. The
     groom swaps the skirt for a dhoti and the bun for a paag.
     ============================================================ */
  const POSES = ['standing', 'water carrier', 'offering', 'dancing', 'with flower', 'with fan'];
  /* [shoulder, elbow, wrist] for the back arm, then the front arm */
  const ARMS = [
    [[-6.8, -23.6], [-9.8, -14], [-9.4, -4], [7.8, -23.6], [10.8, -14], [10.4, -4]],
    [[-6.8, -23.6], [-12.6, -16], [-6, -10.5], [7.8, -23.6], [12.4, -33.5], [6.4, -47]],
    [[-6.8, -23.6], [-5.4, -15], [7.4, -17], [7.8, -23.6], [11.2, -15.4], [15.6, -19.4]],
    [[-6.8, -23.6], [-14.6, -28.6], [-13.4, -39.4], [7.8, -23.6], [14.8, -19], [20.6, -25.4]],
    [[-6.8, -23.6], [-9.8, -14], [-9.4, -4], [7.8, -23.6], [13.2, -17.4], [13.6, -28.6]],
    [[-6.8, -23.6], [-9.8, -14], [-9.4, -4], [7.8, -23.6], [12.8, -16], [16.4, -24]],
  ];

  const HEAD = [[0, -45.5], [3.4, -44.8], [6.2, -42.6], [7.6, -39.8], [8.2, -37.6], [9.2, -35.8], [10.6, -33.4], [10.6, -33.4],
  [9, -32.8], [8.4, -32.4], [9, -31.6], [8.4, -30.9], [8.8, -30.2], [8, -29], [6.4, -28.3], [4.2, -28.4], [2.4, -29.6],
  [0.2, -30.6], [-3, -31.2], [-5.6, -33], [-6.8, -36.4], [-6.4, -40.4], [-4.2, -43.8]];
  const HAIR = [[5.9, -42.9], [3.2, -44.9], [0, -45.6], [-4.2, -43.9], [-6.5, -40.4], [-6.9, -36.4], [-5.8, -32.8], [-3.2, -31.2],
  [-1.6, -31.8], [-1.4, -34.4], [-2.4, -37], [-1, -40], [1.8, -41.8], [4.4, -42]];
  const TORSO = [[-2, -26.6], [-6, -25.8], [-7.8, -23.6], [-7, -19], [-5, -14.8], [-5.2, -12], [6.4, -12], [6.2, -14.8], [8.2, -19], [9, -23.6], [7.2, -25.8], [3.4, -26.6]];
  const SKIRT = [[-5.6, -12.4], [6.8, -12.4], [8.8, -2], [12.6, 12], [18.4, 28.6], [10, 31.2], [1, 31.8], [-8, 31.2], [-16.8, 28.6], [-11.2, 12], [-7.6, -2]];
  const HEM = [[-15.4, 23.8], [-6.6, 26.2], [1, 26.8], [9, 26.2], [16.6, 23.8], [18.4, 28.6], [10, 31.2], [1, 31.8], [-8, 31.2], [-16.8, 28.6]];
  const DHOTI = [[-5.6, -12.4], [6.8, -12.4], [9.4, 2], [9, 14], [3, 15], [1.2, 5], [-.6, 15], [-7, 14], [-8.4, 2]];
  const DRAPE = [[-6, -25.6], [-9.4, -24], [-13.6, -16], [-17.4, -4], [-20.4, 8], [-22, 16], [-17.6, 15], [-15.4, 6], [-12.6, -4], [-9.4, -14], [-7, -20]];
  const PAAG = [[-6.6, -40.6], [-6.2, -45], [-3, -48.8], [1.6, -50.2], [6, -48.4], [8.4, -44], [7.8, -41.2], [3, -42.4], [-2, -42.2]];
  const FOOT = [[-1.6, 0], [3, .4], [4.8, 1.6], [3.8, 2.8], [-1.8, 2.8]];

  function limb(h, f, j, r0, r1, o) {
    const sp = [[j[0][0], j[0][1], r0], [j[1][0], j[1][1], (r0 + r1) / 2], [j[2][0], j[2][1], r1]];
    const pts = tube(sp.map(q => { const p = f(q); return [p[0], p[1], q[2] * o.s]; }), 4);
    dline(h, pts, { band: B_SINGLE, fill: F_COLOUR, tone: o.tone || 'fill', sharp: true, w: .9 });
    /* bangles: three short strokes across the forearm, near the wrist */
    for (let k = 0; k < 3; k++) {
      const t = .66 + k * .08, a = j[1], b = j[2];
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l * r1 * 1.25, ny = dx / l * r1 * 1.25;
      seg(h, f([p[0] - nx, p[1] - ny]), f([p[0] + nx, p[1] + ny]), .9, 'accent');
    }
    dline(h, circ(f(j[2]), r1 * 1.25 * o.s, 10), { band: B_SINGLE, fill: F_COLOUR, tone: o.tone || 'fill', sharp: true, w: .8 });
  }

  function kalash(h, f, s, lk, leaves) {
    /* body, neck, rim — each double-lined; mango leaves if it is a
       ritual pot rather than a water pot */
    const body = circ([0, 0], 6.4, 18, 5.4);
    if (leaves) for (let i = 0; i < 5; i++) {
      const t = -Math.PI / 2 + (i - 2) * .42;
      const base = [Math.cos(t) * 1.5, -8.6], tip = [Math.cos(t) * 9, -8.6 + Math.sin(t) * 7.2];
      const mid = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2];
      const nx = -(tip[1] - base[1]) * .18, ny = (tip[0] - base[0]) * .18;
      dline(h, [base, base, [mid[0] + nx, mid[1] + ny], tip, tip, [mid[0] - nx, mid[1] - ny]].map(f),
        { band: B_SINGLE, fill: F_HATCH, step: 1.4 * s, tone: 'fill', w: .8 });
    }
    dline(h, body.map(f), Object.assign({}, lk, { tone: 'accent', gap: 1.3 * s, fill: lk.fill === F_COLOUR ? F_COLOUR : lk.fill }));
    ink(h, [[-5.8, -1], [0, 1.2], [5.8, -1]].map(f), false, .7);
    dline(h, [[-2.6, -5], [2.6, -5], [2.8, -7.6], [-2.8, -7.6]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .8 });
    dline(h, circ([0, -8.4], 3.8, 12, 1.1).map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', sharp: true, w: .8 });
  }

  function diya(h, f) {
    dline(h, [[-4.4, 0], [4.4, 0], [3, 2.6], [-3, 2.6]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .8 });
    solid(h, [[0, -5.6], [1.3, -2.6], [.8, -.6], [-.8, -.6], [-1.3, -2.6]].map(f), 'accent');
  }

  function bloom(h, f, s, lk, petals) {
    /* a lotus seen from the side: a fan of pointed petals on a cup */
    const n = petals || 5;
    for (let i = 0; i < n; i++) {
      const t = -Math.PI / 2 + (i - (n - 1) / 2) * (1.9 / n);
      const tip = [Math.cos(t) * 9, Math.sin(t) * 9 - 1], w = 2.3;
      const nx = -Math.sin(t) * w, ny = Math.cos(t) * w;
      dline(h, [[0, 1], [0, 1], [tip[0] * .5 + nx, tip[1] * .5 + ny], tip, tip, [tip[0] * .5 - nx, tip[1] * .5 - ny]].map(f),
        Object.assign({}, lk, { tone: i % 2 ? 'accent' : 'fill', gap: .9 * s, band: lk.band === B_SINGLE ? B_SINGLE : B_HATCH }));
    }
    dline(h, circ([0, 1.6], 3.6, 12, 1.8).map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
  }

  function person(h, cx, cy, s, pose, o) {
    o = o || {};
    const pz = ((pose % POSES.length) + POSES.length) % POSES.length;
    const f = place(cx, cy, s, o.dir || 1);
    const lk = look(o, s);
    const groom = !!o.groom;
    const A = ARMS[pz];

    /* the drape flows behind everything */
    if (!groom) {
      dline(h, DRAPE.map(f), Object.assign({}, lk, { tone: 'accent', fill: lk.fill === F_COLOUR ? F_HATCH : lk.fill, gap: 1.3 * s }));
      for (let i = 0; i < 5; i++) seg(h, f([-21.8 + i * 1.1, 15.8 - i * .3]), f([-22.4 + i * 1.1, 18.6 - i * .3]), .6);
    }
    /* back arm */
    limb(h, f, A.slice(0, 3), 1.9, 1.3, { s, tone: 'fill' });

    if (groom) {
      dline(h, DHOTI.map(f), Object.assign({}, lk, { tone: 'fill' }));
      [[-3.6, 14.4], [4.2, 14.4]].forEach((k, i) => {
        const pts = tube([[k[0], k[1], 2], [k[0] + .3, 23, 1.7], [k[0] + .6, 31, 1.4]].map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4);
        dline(h, pts, { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', sharp: true, w: .9 });
        dline(h, FOOT.map(p => f([p[0] + k[0], p[1] + 31.4])), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
      });
    } else {
      [-5, 4].forEach(x => dline(h, FOOT.map(p => f([p[0] + x, p[1] + 31.2])), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .8 }));
      dline(h, SKIRT.map(f), Object.assign({}, lk, { tone: 'fill' }));
      if (lk.fill === F_COLOUR || lk.fill === F_PLAIN) [-5, 0, 5].forEach((x, i) =>
        ink(h, [[x * .5, -9], [x * .9, 8], [x * 1.4, 24]].map(f), false, .6, i === 1 ? 'accent' : 'line'));
      dline(h, HEM.map(f), { band: B_TEETH, fill: F_COLOUR, tone: 'accent', gap: 1.8 * s, w: .9 });
    }
    /* torso, waistband, necklace */
    dline(h, TORSO.map(f), Object.assign({}, lk, { tone: 'accent', gap: 1.3 * s }));
    dline(h, [[-5.4, -13.4], [6.6, -13.4], [6.9, -10.6], [-5.8, -10.6]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .8 });
    for (let i = 0; i <= 6; i++) { const t = i / 6; dot(h, f([-3.4 + t * 8.6, -25.8 + Math.sin(t * Math.PI) * 3.2]), .5 * s, 'line'); }
    /* neck, head */
    dline(h, [[-.9, -30.4], [3.3, -30.2], [3.5, -26.2], [-.9, -26.2]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .8 });
    dline(h, HEAD.map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: 1, k: 4 });
    if (groom) {
      dline(h, PAAG.map(f), Object.assign({}, lk, { tone: 'accent', fill: F_HATCH, gap: 1.2 * s, band: B_DOT }));
      ink(h, [[7.8, -42], [10.4, -47], [9, -51]].map(f), false, .8);
      ink(h, [[8.8, -32], [6.8, -31.4], [5.2, -32.4]].map(f), false, 1.1);          // moustache
      solid(h, [[-5.8, -40.6], [-6.8, -36.4], [-5.6, -33], [-3.2, -31.4], [-2.4, -35], [-3, -38.6]].map(f), 'line');
    } else {
      solid(h, HAIR.map(f), 'line');
      dline(h, circ([-8.8, -34.6], 3.3, 14).map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .8 });
      for (let i = 0; i < 5; i++) { const t = (i / 5) * TAU; dot(h, f([-8.8 + Math.cos(t) * 1.8, -34.6 + Math.sin(t) * 1.8]), .45 * s, 'accent'); }
      ink(h, [[5.4, -42.8], [3, -44.6], [.6, -45.2]].map(f), false, 1.2, 'accent');   // sindoor in the parting
      ring(h, f([9.8, -32.2]), 1.5 * s, .7, 'accent');                                // nath
    }
    fishEye(h, f, [5.1, -37.2], 5.2, 1.9, { s });
    dot(h, f([7.1, -40.9]), .6 * s, 'accent');                                         // bindi
    ring(h, f([-.8, -31.4]), 1 * s, .7, 'accent'); dot(h, f([-.8, -29.4]), .5 * s, 'accent');

    /* front arm, over the body, and what it holds */
    limb(h, f, A.slice(3, 6), 1.9, 1.3, { s, tone: 'fill' });
    const hand = A[5];
    if (pz === 1) kalash(h, place(...f([1.4, -52.6]), s, o.dir || 1), s, lk, false);
    if (pz === 2) { diya(h, place(...f([hand[0], hand[1] - 2.6]), s, o.dir || 1)); }
    if (pz === 4) bloom(h, place(...f([hand[0] + .2, hand[1] - 4.4]), s * .5, o.dir || 1), s * .5, lk, 5);
    if (pz === 5) {
      const g = place(...f([hand[0], hand[1]]), s, o.dir || 1);
      seg(h, g([0, 0]), g([0, -8]), 1);
      dline(h, [[0, -7.6], [8, -8.6], [8.4, -15], [0, -14.2]].map(g), { band: B_TEETH, fill: F_COLOUR, tone: 'fill', gap: 1.4 * s, sharp: true, w: .9 });
    }
    return { hand: f(hand), back: f(A[2]), top: f([1, -46]) };
  }

  def('mFigure', 'Figures', 'Figure', [
    O('pose', 'Pose', POSES, 0), O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0),
    B('tint', 'Colour under pattern', false), N('dens', 'Pattern scale', 1.5, 8, 3, .5), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 6, y: 3, w: 88, h: 94 }, (hh, cx, cy, s) =>
      person(hh, cx, cy, s, p.pose, { band: p.band, fill: p.fill, tint: p.tint, dens: p.dens, dir: p.dir ? -1 : 1 }));
  });

  def('mCouple', 'Figures', 'Bride & groom', [
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), B('tint', 'Colour under pattern', false),
    N('dens', 'Pattern scale', 1.5, 8, 3, .5), B('garland', 'Garland between them', true),
  ], (h, p) => {
    h.fitDraw({ x: 3, y: 4, w: 94, h: 92 }, (hh, cx, cy, s) => {
      const o = { band: p.band, fill: p.fill, tint: p.tint, dens: p.dens };
      const a = person(hh, cx - 17 * s, cy, s, 2, Object.assign({ groom: 1, dir: 1 }, o));
      const b = person(hh, cx + 17 * s, cy, s, 0, Object.assign({ dir: -1 }, o));
      if (p.garland) {
        const g = [], n = 14;
        for (let i = 0; i <= n; i++) { const t = i / n; g.push([a.hand[0] + (b.top[0] - a.hand[0]) * t, a.hand[1] + (b.hand[1] - a.hand[1]) * t + Math.sin(t * Math.PI) * 9 * s]); }
        g.forEach((q, i) => i % 2 ? dot(hh, q, 1 * s, 'accent') : dline(hh, circ(q, 1.3 * s, 8), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .7 }));
      }
    });
  });

  def('mProcession', 'Figures', 'Procession', [
    N('people', 'People', 2, 7, 4), O('pose', 'Pose', ['mixed', ...POSES], 0), O('band', 'Double line', BANDS, 0),
    O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 8, 3, .5), B('ground', 'Ground band', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const n = Math.max(1, p.people), cell = W / n;
    const s = Math.min(.95, cell / 40);
    const mixed = [1, 4, 2, 5, 0, 3];
    for (let i = 0; i < n; i++) {
      const pose = p.pose ? p.pose - 1 : mixed[i % mixed.length];
      person(hh, cell * (i + .5) + 2 * s, 50 + 3 * s, s, pose, { band: p.band, fill: p.fill, dens: p.dens });
    }
    if (p.ground) bandStrip(hh, 0, 50 + 38 * s, W, Math.max(3, 5 * s), 0, Math.round(W / 6), { band: p.band });
  }));

  /* Draw in real proportions, then squeeze into the 100-wide box the
     item will be stretched out of. Every free piece in this pack is
     drawn in true units — a lotus in a long border stays round. */
  function squeeze(h, ar, draw) {
    const W = 100 * ar;
    if (Math.abs(ar - 1) < 1e-3) { draw(h, 100); return; }
    const probe = new Hand((h.seed ^ 0x2545f491) >>> 0, {
      rough: h.rough, bow: h.bow, passes: h.passes, fillMode: h.fillMode,
      fillGap: h.fillGap, fillAngle: h.fillAngle, detail: h.detail,
    });
    draw(probe, W);
    const map = d => { let i = 0; return d.replace(/-?\d+(?:\.\d+)?/g, m => n2((i++ % 2 === 0) ? parseFloat(m) / ar : parseFloat(m))); };
    probe.strokes.forEach(st => { st.d = map(st.d); st.clip = st.clip ? map(st.clip) : h._clip; h.strokes.push(st); });
  }

  /* ============================================================
     FISH — the auspicious pair, painted at every wedding
     ============================================================ */
  const FISH = ['rohu', 'slim', 'round'];
  const FISH_H = [1, .66, 1.3];
  function fish(h, f, s, kind, lk) {
    const k = FISH_H[((kind % 3) + 3) % 3];
    const Y = p => [p[0], p[1] * k];
    const body = [[30, 0], [30, 0], [24, -8], [10, -13], [-8, -12], [-20, -6], [-25, 0], [-20, 6], [-8, 12], [10, 13], [24, 8]].map(Y);
    const tail = [[-23, 0], [-23, 0], [-37, -14], [-37, -14], [-34.5, -6], [-32.5, 0], [-34.5, 6], [-37, 14], [-37, 14]].map(Y);
    const dorsal = [[5, -12.4], [5, -12.4], [-3, -19.5], [-3, -19.5], [-10.5, -11.4]].map(Y);
    const belly = [[3, 12.4], [3, 12.4], [-3, 18.2], [-3, 18.2], [-9.5, 11.6]].map(Y);
    const head = [[16, -11], [16, -11], [24, -8], [30, 0], [30, 0], [24, 8], [16, 11], [16, 11], [13.2, 4], [12.6, 0], [13.2, -4]].map(Y);

    dline(h, tail.map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.4 * s, ang: 0, tone: 'accent', w: .9 });
    for (let i = -2; i <= 2; i++) seg(h, f(Y([-26, i * .6])), f(Y([-35, i * 5])), .5, 'accent');
    dline(h, dorsal.map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.2 * s, ang: 80, tone: 'accent', w: .85 });
    dline(h, belly.map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.2 * s, ang: 100, tone: 'accent', w: .85 });
    dline(h, body.map(f), Object.assign({}, lk, { fill: lk.fill === F_COLOUR ? F_SCALES : lk.fill, tint: true, tone: 'fill' }));
    dline(h, head.map(f), Object.assign({}, lk, { fill: F_COLOUR, tone: 'accent', gap: lk.gap * .8 }));
    const eye = f(Y([21.6, -2]));
    dline(h, circ(eye, 3 * s * Math.min(1, k), 12), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .8 });
    dot(h, f(Y([22.2, -2.4])), 1.4 * s * Math.min(1, k), 'line');
    seg(h, f(Y([30, 0])), f(Y([26.6, 1.4])), .8);
  }

  const FISH_LAY = ['single', 'pair', 'circling', 'shoal'];
  def('mFish', 'Animals', 'Fish', [
    O('kind', 'Kind', FISH, 0), O('lay', 'Arrangement', FISH_LAY, 0), O('band', 'Double line', BANDS, 0),
    O('fill', 'Interior', FILLS, 3), N('dens', 'Pattern scale', 1.5, 8, 3, .5),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 4, w: 92, h: 92 }, (hh, cx, cy, s) => {
      const lk = look(p, s);
      if (p.lay === 1) {
        fish(hh, place(cx, cy - 16 * s, s, 1), s, p.kind, lk);
        fish(hh, place(cx, cy + 16 * s, s, -1), s, p.kind, lk);
      } else if (p.lay === 2) {
        fish(hh, place(cx + 2 * s, cy - 15 * s, s, 1, .1, .012), s, p.kind, lk);
        fish(hh, place(cx - 2 * s, cy + 15 * s, s, -1, .1, -.012), s, p.kind, lk);
      } else if (p.lay === 3) {
        [[-14, -30, 1], [16, -2, -1], [-12, 26, 1]].forEach(q => fish(hh, place(cx + q[0] * s, cy + q[1] * s, s * .8, q[2]), s * .8, p.kind, lk));
      } else fish(hh, place(cx, cy, s, 1), s, p.kind, lk);
    });
  });

  /* ============================================================
     TURTLE and SERPENT — the other creatures of the Kohbar
     ============================================================ */
  function turtle(h, f, s, lk) {
    /* flippers: paddles reaching out of the shell on the diagonals */
    [-.7, .7, Math.PI - .7, Math.PI + .7].forEach((t, i) => {
      const d = [Math.cos(t), Math.sin(t)], nx = -d[1], ny = d[0];
      const b = [d[0] * 11, d[1] * 14], tip = [d[0] * 23 + (i < 2 ? 0 : 0), d[1] * 25];
      const w = 3.4, m = [(b[0] + tip[0]) / 2, (b[1] + tip[1]) / 2];
      dline(h, [[b[0] + nx * w, b[1] + ny * w], [m[0] + nx * w * 1.2, m[1] + ny * w * 1.2], tip, tip, [m[0] - nx * w * .8, m[1] - ny * w * .8], [b[0] - nx * w, b[1] - ny * w]].map(f),
        { band: B_SINGLE, fill: F_HATCH, step: 1.3 * s, ang: t / D + 90, tone: 'accent', w: .85 });
    });
    dline(h, [[0, 24.5], [-2.4, 16], [2.4, 16]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', sharp: true, w: .8 });
    dline(h, [[-2.6, -16], [2.6, -16], [2.4, -20], [-2.4, -20]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .8 });
    const head = circ([0, -22], 4, 12, 5.2);
    dline(h, head.map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .9 });
    dot(h, f([-1.6, -23.4]), .9 * s); dot(h, f([1.6, -23.4]), .9 * s);
    const shell = circ([0, 0], 14, 26, 18);
    const r = dline(h, shell.map(f), Object.assign({}, lk, { tone: 'fill', fill: lk.fill === F_COLOUR ? F_SCALES : lk.fill, tint: true }));
    const inner = circ([0, 0], 8, 18, 11).map(f);
    dline(h, inner, { band: B_TEETH, fill: F_COLOUR, tone: 'accent', gap: 1.5 * s, w: .8 });
    return r;
  }
  def('mTurtle', 'Animals', 'Turtle', [
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 3), N('dens', 'Pattern scale', 1.5, 8, 3, .5), N('count', 'Turtles', 1, 2, 1),
  ], (h, p) => {
    h.fitDraw({ x: 6, y: 5, w: 88, h: 90 }, (hh, cx, cy, s) => {
      if (p.count > 1) {
        turtle(hh, place(cx - 18 * s, cy, s, 1, -.35), s, look(p, s));
        turtle(hh, place(cx + 18 * s, cy, s, 1, .35), s, look(p, s));
      } else turtle(hh, place(cx, cy, s, 1), s, look(p, s));
    });
  });

  const SNAKE_LAY = ['wave', 'coil', 'hooded'];
  function serpent(h, spine, s, lk, hood) {
    const pts = tube(spine, 5);
    dline(h, pts, Object.assign({}, lk, { tone: 'fill', fill: lk.fill === F_COLOUR ? F_CROSS : lk.fill, tint: true, sharp: true, gap: lk.gap * .75 }));
    const hd = spine[spine.length - 1], pv = spine[spine.length - 2];
    const ang = Math.atan2(hd[1] - pv[1], hd[0] - pv[0]);
    const g = place(hd[0], hd[1], s, 1, ang);
    if (hood) {
      dline(h, [[-4, -7.6], [3, -6.4], [7.6, -2.4], [8.4, 0], [7.6, 2.4], [3, 6.4], [-4, 7.6], [-1, 0]].map(g),
        Object.assign({}, lk, { fill: F_COLOUR, tone: 'accent', band: B_DOT }));
      for (let i = -1; i <= 1; i++) ink(h, [[0, i * 4], [3, i * 3.4], [5, i * 1.8]].map(g), false, .6);
    }
    dline(h, circ([7.4, 0], 3.4, 12, 2.6).map(g), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .9 });
    dot(h, g([8.2, -1.2]), .8 * s);
    ink(h, [[10.6, 0], [13, 0], [14.4, -1]].map(g), false, .6, 'accent'); seg(h, g([13, 0]), g([14.4, 1]), .6, 'accent');
  }
  def('mSnake', 'Animals', 'Serpent', [
    O('lay', 'Lay', SNAKE_LAY, 0), O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 2),
    N('dens', 'Pattern scale', 1.5, 8, 2.5, .5), N('waves', 'Waves', 1, 5, 3),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const lk = look(p, 1);
    const sp = [];
    if (p.lay === 1) {
      for (let i = 0; i <= 36; i++) { const t = i / 36, a = t * TAU * 2.2, r = 40 - t * 30; sp.push([W / 2 + Math.cos(a) * r, 50 + Math.sin(a) * r * .8, 5.4 - t * 1.6]); }
      serpent(hh, sp.reverse(), 1, lk, false);
    } else if (p.lay === 2) {
      for (let i = 0; i <= 24; i++) { const t = i / 24; sp.push([W / 2 + Math.sin(t * Math.PI * p.waves) * 12 * (1 - t * .5), 94 - t * 76, 3 + t * 2.6]); }
      serpent(hh, sp, 1.4, lk, true);
    } else {
      const m = Math.max(1, p.waves);
      for (let i = 0; i <= 30; i++) { const t = i / 30; sp.push([6 + t * (W - 24), 52 + Math.sin(t * Math.PI * m) * 26, 2.2 + Math.sin(t * Math.PI) * 3.4]); }
      serpent(hh, sp, 1.2, lk, false);
    }
  }));

  /* ============================================================
     ANIMALS — profile body, frontal eye, a decorated back
     ============================================================ */
  const BEASTS = ['elephant', 'horse', 'tiger', 'deer', 'cow'];

  function leg(h, f, top, foot, r0, r1, tone) {
    const pts = tube([[top[0], top[1], r0], [(top[0] + foot[0]) / 2, (top[1] + foot[1]) / 2, (r0 + r1) / 2], [foot[0], foot[1], r1]].map(q => { const p = f(q); return [p[0], p[1], q[2] * f.s]; }), 3);
    dline(h, pts, { band: B_SINGLE, fill: F_COLOUR, tone: tone || 'fill', sharp: true, w: .9 });
  }

  function beast(h, cx, cy, s, kind, lk, o) {
    o = o || {};
    const k = ((kind % BEASTS.length) + BEASTS.length) % BEASTS.length;
    const f = place(cx, cy, s, o.dir || 1); f.s = s;
    const bodyLook = Object.assign({}, lk, { tone: 'fill' });

    if (k === 0) {                                              /* elephant */
      if (o.rider) person(h, ...f([-1, -8]), s * .55, 3, { band: lk.band, fill: lk.fill, dir: o.dir || 1 });
      [[-15, 1], [-7, 3]].forEach(q => leg(h, f, [q[0], q[1]], [q[0] - .5, 25], 3.6, 3.4, 'accent'));
      dline(h, [[-20, -10], [-8, -15.6], [8, -15.6], [16, -11], [18.6, 2], [14, 10], [-16, 10], [-22.4, 2]].map(f), bodyLook);
      [[6, 3], [13, 1]].forEach(q => leg(h, f, [q[0], q[1]], [q[0] + .5, 25], 3.6, 3.4, 'fill'));
      [-15.5, -7.5, 6.5, 13.5].forEach(x => ink(h, h.arcPts(...f([x, 25]), 1.8 * s, 1.2 * s, Math.PI, TAU, 6), false, .6));
      seg(h, f([-22, 1]), f([-25, 12]), .9); dot(h, f([-25.2, 13]), 1 * s, 'accent');
      /* caparison, with tassels */
      dline(h, [[-13, -15.4], [9, -15.4], [11, 5], [-15, 5]].map(f), { band: B_TEETH, fill: F_FLORETS, tint: true, tone: 'accent', gap: 2.4 * s, step: 3.4 * s, sharp: true });
      for (let i = 0; i <= 8; i++) { const x = -15 + i * 3.25; seg(h, f([x, 5]), f([x, 8]), .7); dot(h, f([x, 8.4]), .7 * s, 'accent'); }
      /* head, trunk, ear, tusk */
      dline(h, tube([[28.4, 1, 3.6], [30, 9, 3], [28.6, 17, 2.2], [24.6, 21, 1.6], [22.6, 18.6, 1.2]].map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4),
        { band: B_SINGLE, fill: F_HATCH, step: 1.6 * s, ang: 0, tone: 'fill', sharp: true, w: .9 });
      dline(h, [[14, -12], [20, -18.4], [28, -16.6], [31.6, -8], [30.4, 2], [26.6, 6.4], [21.6, 5.6], [16.6, 4]].map(f), bodyLook);
      dline(h, [[27, 5.4], [27, 5.4], [33.6, 8.6], [34.2, 6.6]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .8 });
      dline(h, [[15.4, -11], [21, -9.6], [22.2, -1], [18, 6], [14, 2.4]].map(f), Object.assign({}, lk, { tone: 'accent', gap: 1.4 * s, fill: F_HATCH }));
      fishEye(h, f, [26, -9.6], 4, 1.4, { s: s * .9, brow: false });
      return;
    }
    if (k === 1) {                                              /* horse */
      if (o.rider) person(h, ...f([-1, -3.4]), s * .5, 0, { band: lk.band, fill: lk.fill, dir: o.dir || 1, groom: 1 });
      const legs = [[-12, 3, -13, 24], [-7, 4, -5, 24], [8, 3, 10, 24], [12, 2, 15, 23]];
      legs.forEach((q, i) => leg(h, f, [q[0], q[1]], [q[2], q[3]], 2.6, 1.6, i % 2 ? 'fill' : 'accent'));
      ink(h, [[-18, -3], [-26, 4], [-25, 14], [-22, 16]].map(f), false, 1.4);
      dline(h, [[-17, -6], [-2, -9.6], [12, -8.6], [17, -1], [12, 6.4], [-14, 6.4], [-19.6, 0]].map(f), bodyLook);
      dline(h, [[-8, -9.4], [6, -9.4], [6.6, 2], [-9, 2]].map(f), { band: B_DOT, fill: F_CROSS, tone: 'accent', tint: true, gap: 2 * s, step: 2 * s });
      dline(h, [[10, -8], [15.6, -20], [21, -27.4], [27.4, -24.6], [30.6, -18.6], [29.6, -16], [24, -16.6], [19.4, -6]].map(f), bodyLook);
      for (let i = 0; i < 6; i++) { const t = i / 5; const b = [11 + t * 9, -9.6 - t * 17]; dline(h, [b, b, [b[0] - 4, b[1] + 1], [b[0] - 1.6, b[1] + 3.4]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .7 }); }
      dline(h, [[21.6, -27.6], [21.6, -27.6], [22.6, -31.6], [24.2, -27]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', w: .7 });
      fishEye(h, f, [23.8, -22], 3.4, 1.2, { s: s * .8, brow: false });
      return;
    }
    if (k === 2) {                                              /* tiger */
      [[-13, 3, -15, 22], [-8, 4, -7, 22], [9, 3, 10, 22], [13, 2, 16, 22]].forEach((q, i) => leg(h, f, [q[0], q[1]], [q[2], q[3]], 2.8, 2.2, i % 2 ? 'fill' : 'accent'));
      dline(h, tube([[-19, -2, 1.6], [-27, -6, 1.3], [-29, -16, 1.1], [-25, -21, .9]].map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4),
        { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .8 });
      dline(h, [[-20, -4], [-4, -8.4], [12, -8], [18, -2], [14, 6], [-16, 6.4], [-21, 1]].map(f), Object.assign({}, lk, { tone: 'fill', fill: F_WAVES, tint: true, ang: 90 }));
      for (let i = 0; i < 6; i++) { const x = -15 + i * 5.4; ink(h, [[x - 1, -7], [x + 1, -2], [x - .6, 3.6]].map(f), false, 1.4); }
      dline(h, circ([21, -8], 8, 16, 7.2).map(f), Object.assign({}, lk, { tone: 'fill', fill: F_COLOUR }));
      [[15.4, -14.4], [22, -15.6]].forEach(q => dline(h, circ(q, 2.4, 8).map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 }));
      fishEye(h, f, [23.6, -9.4], 3.6, 1.3, { s: s * .9, brow: false });
      ink(h, [[28.4, -5], [26.4, -3.4], [24, -4]].map(f), false, .8);
      for (let i = -1; i <= 1; i++) seg(h, f([26.6, -5 + i]), f([31.6, -6 + i * 2.2]), .5);
      return;
    }
    if (k === 3) {                                              /* deer */
      [[-11, 2, -12, 24], [-7, 3, -5, 24], [8, 2, 9, 24], [11, 1, 14, 23]].forEach((q, i) => leg(h, f, [q[0], q[1]], [q[2], q[3]], 1.9, 1.1, i % 2 ? 'fill' : 'accent'));
      dline(h, [[-16, -4], [-2, -7.6], [10, -7], [15, -1], [10, 5], [-12, 5], [-17, 0]].map(f), Object.assign({}, lk, { tone: 'fill', fill: lk.fill === F_COLOUR ? F_DOTS : lk.fill, tint: true }));
      dline(h, [[-16, -4], [-16, -4], [-20, -7], [-18.6, -1.4]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
      dline(h, [[9, -6.6], [13, -16], [17, -23.4], [23.6, -22], [26.4, -17.6], [21, -16.6], [16.6, -6]].map(f), bodyLook);
      [[1, 1], [-1, .6]].forEach(([sd, sc]) => {
        const b = [18.4 + sd * .6, -23.6];
        ink(h, [b, [b[0] - 2 * sc, b[1] - 6], [b[0] - 1 * sc, b[1] - 12], [b[0] + 2 * sc, b[1] - 16]].map(f), false, 1.2);
        ink(h, [[b[0] - 1.6 * sc, b[1] - 6], [b[0] - 5 * sc, b[1] - 8.6]].map(f), false, 1);
        ink(h, [[b[0] - 1 * sc, b[1] - 11], [b[0] + 3 * sc, b[1] - 12.6]].map(f), false, 1);
      });
      fishEye(h, f, [20.6, -19.6], 3.2, 1.1, { s: s * .8, brow: false });
      return;
    }
    /* cow: a hump, horns, and bells */
    [[-13, 3, -13.6, 23], [-8, 4, -7, 23], [8, 3, 9, 23], [12, 2, 14, 23]].forEach((q, i) => leg(h, f, [q[0], q[1]], [q[2], q[3]], 2.4, 1.6, i % 2 ? 'fill' : 'accent'));
    ink(h, [[-19, -2], [-22, 8], [-21, 16]].map(f), false, 1); dot(h, f([-21, 17]), 1.2 * s, 'line');
    dline(h, [[-19, -5], [-6, -8.6], [2, -12.6], [8, -9], [15, -5], [16, 3], [12, 7], [-15, 7], [-20, 1]].map(f), bodyLook);
    dline(h, [[-12, -8], [6, -8], [7, 3], [-13, 3]].map(f), { band: B_TEETH, fill: F_FLORETS, tone: 'accent', tint: true, gap: 2 * s, step: 3 * s, sharp: true });
    dline(h, [[13, -6], [19, -12], [25, -11], [28, -4], [25, -1.6], [20, -1], [16, 3]].map(f), bodyLook);
    [[1, 1], [-1, .7]].forEach(([sd, sc]) => ink(h, [[19 + sd, -11.6], [17.6 + sd, -16.6 * sc], [20.6 + sd * 1.4, -19 * sc]].map(f), false, 1.3));
    fishEye(h, f, [22, -7.6], 3.2, 1.1, { s: s * .8, brow: false });
    ink(h, [[15, 1], [13.6, 6], [11, 8]].map(f), false, .8, 'accent'); dot(h, f([12.6, 8.4]), 1.2 * s, 'accent');
  }

  def('mBeast', 'Animals', 'Animal', [
    O('kind', 'Kind', BEASTS, 0), O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0),
    B('tint', 'Colour under pattern', false), N('dens', 'Pattern scale', 1.5, 8, 3, .5), B('rider', 'Rider (elephant, horse)', false),
    O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 6, w: 92, h: 88 }, (hh, cx, cy, s) =>
      beast(hh, cx, cy, s, p.kind, look(p, s), { rider: p.rider, dir: p.dir ? -1 : 1 }));
  });

  /* ============================================================
     BIRDS
     ============================================================ */
  const BIRDS = ['parrot', 'maina', 'crane', 'duck', 'flying'];

  function wing(h, f, pts, s, lk) {
    dline(h, pts.map(f), Object.assign({}, lk, { tone: 'accent', fill: F_HATCH, step: 1.3 * s, ang: -30, gap: 1.2 * s }));
  }

  function bird(h, cx, cy, s, kind, lk, o) {
    o = o || {};
    const k = ((kind % BIRDS.length) + BIRDS.length) % BIRDS.length;
    const f = place(cx, cy, s, o.dir || 1);
    const body = lk2 => Object.assign({}, lk, { tone: 'fill' }, lk2 || {});
    const feet = (x0, x1, y, top) => [x0, x1].forEach(x => { seg(h, f([x, top === undefined ? y - 5 : top]), f([x, y]), .9); ink(h, [[x - 2, y + 1], [x, y], [x + 2.4, y + .6]].map(f), false, .8); });

    if (k === 0) {                                              /* parrot on a stem */
      ink(h, [[-16, 16.6], [0, 15], [16, 16]].map(f), false, 1.3);
      dline(h, [[-3.6, 10], [-8.6, 29], [-5.4, 30], [.4, 12]].map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.2 * s, ang: 0, tone: 'accent', w: .8 });
      feet(-1, 3, 15.6);
      dline(h, [[4, -10], [8, -3], [7, 5], [2.6, 11.6], [-3.4, 13], [-5.6, 8], [-4, 0], [-1, -7]].map(f), body());
      wing(h, f, [[-1.6, -4], [4.4, 0], [3, 8], [-3, 13.4], [-4.4, 4]], s, lk);
      dline(h, circ([4.6, -13], 5.4, 14).map(f), body({ fill: F_COLOUR }));
      dline(h, [[9.4, -15.2], [9.4, -15.2], [13.6, -13.6], [13.6, -13.6], [12.6, -9.2], [10.6, -11.2]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
      ink(h, h.arcPts(...f([4.6, -12.4]), 5 * s, 4 * s, .25, 1.6, 8), false, 1, 'accent');
      fishEye(h, f, [5.8, -14.4], 3, 1.1, { s: s * .8, brow: false, kohl: false });
      return;
    }
    if (k === 1) {                                              /* maina */
      dline(h, [[-8, -2], [-8, -2], [-19, -10], [-20, -4], [-18, 2]].map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.2 * s, tone: 'accent', w: .8 });
      feet(-2, 3, 13);
      dline(h, circ([0, 0], 10, 18, 7.6).map(f), body());
      wing(h, f, [[-6, -3], [3, -4], [5, 1], [-3, 5], [-9, 2]], s, lk);
      dline(h, circ([9, -8], 4.4, 12).map(f), body({ fill: F_COLOUR }));
      dline(h, [[12.8, -9.6], [12.8, -9.6], [17.8, -8], [17.8, -8], [12.6, -6.6]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
      fishEye(h, f, [9.6, -9], 2.8, 1, { s: s * .75, brow: false, kohl: false });
      return;
    }
    if (k === 2) {                                              /* crane */
      feet(-2, 3, 30, 7);
      dline(h, [[-6, 0], [-6, 0], [-18, 6], [-12, 8], [-4, 7]].map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.2 * s, tone: 'accent', w: .8 });
      dline(h, tube([[6, -2, 2.4], [9, -10, 1.8], [7, -18, 1.6], [9, -24, 1.8]].map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4),
        { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .9 });
      dline(h, circ([0, 2], 11, 18, 7).map(f), body());
      wing(h, f, [[-6, -1], [6, -2], [4, 4], [-8, 6]], s, lk);
      dline(h, circ([10, -25.6], 3.4, 12).map(f), body({ fill: F_COLOUR }));
      dline(h, [[13, -26.6], [13, -26.6], [23, -24.6], [23, -24.6], [13, -24]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', sharp: true, w: .8 });
      fishEye(h, f, [10.4, -26], 2.6, .9, { s: s * .7, brow: false, kohl: false });
      return;
    }
    if (k === 3) {                                              /* duck on water */
      for (let i = 0; i < 2; i++) { const pts = []; for (let q = 0; q <= 12; q++) pts.push([-18 + q * 3, 11 + i * 3.4 + Math.sin(q * 1.3 + i) * 1]); ink(h, pts.map(f), false, .8, 'accent'); }
      dline(h, [[-14, 0], [-14, 0], [-20, -8], [-12, -4], [-4, -5], [8, -4], [12, 2], [6, 8], [-10, 8]].map(f), body());
      wing(h, f, [[-10, 0], [2, -3], [5, 2], [-6, 5]], s, lk);
      dline(h, tube([[7, -3, 2.2], [9, -9, 1.9], [9.4, -13, 2.4]].map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4),
        { band: B_SINGLE, fill: F_COLOUR, tone: 'fill', sharp: true, w: .9 });
      dline(h, circ([10, -14.4], 3.8, 12).map(f), body({ fill: F_COLOUR }));
      dline(h, [[13, -15.4], [13, -15.4], [18.4, -14.2], [18.4, -14.2], [18, -12.4], [13.4, -12.6]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
      fishEye(h, f, [10.4, -15], 2.6, .9, { s: s * .7, brow: false, kohl: false });
      return;
    }
    /* flying: wings up in a V */
    wing(h, f, [[-2, -2], [-2, -2], [-14, -12], [-24, -24], [-16, -22], [-6, -12], [2, -4]], s, lk);
    dline(h, [[-10, 2], [-10, 2], [-20, 8], [-18, 2], [-20, -2]].map(f), { band: B_SINGLE, fill: F_HATCH, step: 1.2 * s, tone: 'accent', w: .8 });
    dline(h, circ([0, 0], 11, 16, 5.6).map(f), body());
    wing(h, f, [[2, -2], [2, -2], [8, -14], [10, -26], [14, -20], [10, -8], [6, -2]], s, lk);
    dline(h, circ([11.6, -3], 3.8, 12).map(f), body({ fill: F_COLOUR }));
    dline(h, [[15, -4], [15, -4], [19.6, -2.6], [19.6, -2.6], [15, -1.4]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
    fishEye(h, f, [12, -3.6], 2.6, .9, { s: s * .7, brow: false, kohl: false });
  }

  def('mBird', 'Birds', 'Bird', [
    O('kind', 'Kind', BIRDS, 0), O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0),
    B('tint', 'Colour under pattern', false), N('dens', 'Pattern scale', 1.5, 8, 2.5, .5), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 6, y: 6, w: 88, h: 88 }, (hh, cx, cy, s) => bird(hh, cx, cy, s, p.kind, look(p, s), { dir: p.dir ? -1 : 1 }));
  });

  /* THE PEACOCK. Two tails: a trailing plume that sweeps down
     behind it, packed with eyes, or a raised fan of quills. */
  function peacock(h, cx, cy, s, fan, feathers, lk, o) {
    o = o || {};
    const f = place(cx, cy, s, o.dir || 1);
    const eyeAt = (c, r, ang) => {
      const g = place(...c, r, 1, ang);
      dline(h, circ([0, 0], 1, 12, .72).map(g), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .7 });
      dot(h, g([.1, 0]), .36 * r, 'line');
    };
    const nF = Math.max(3, feathers | 0);
    if (fan) {
      for (let i = 0; i < nF; i++) {
        const t = Math.PI + .1 + (i / (nF - 1)) * (Math.PI - .2);
        const tip = [Math.cos(t) * 34, Math.sin(t) * 30 - 2], base = [Math.cos(t) * 6, Math.sin(t) * 5 + 2];
        const nx = -Math.sin(t) * 2.4, ny = Math.cos(t) * 2.4;
        dline(h, [base, [base[0] * .5 + tip[0] * .5 + nx, base[1] * .5 + tip[1] * .5 + ny], tip, tip, [base[0] * .5 + tip[0] * .5 - nx, base[1] * .5 + tip[1] * .5 - ny]].map(f),
          { band: B_SINGLE, fill: F_HATCH, step: 1.1 * s, ang: t / D, tone: 'accent', w: .75 });
        eyeAt(f([tip[0] * .9, tip[1] * .9]), 3 * s, (o.dir || 1) > 0 ? t : Math.PI - t);
      }
    } else {
      const plume = [[-4, 2], [-18, -1], [-34, 5], [-46, 17], [-50, 30], [-44, 35], [-31, 27], [-17, 15], [-5, 10]];
      dline(h, plume.map(f), Object.assign({}, lk, { tone: 'fill', fill: lk.fill === F_COLOUR ? F_COLOUR : lk.fill }));
      for (let i = 0; i < nF; i++) {
        const t = (i + .5) / nF;
        const c = [-8 - t * 38, 5 + t * t * 24 + (i % 2 ? 2.6 : -2.6) * (1 - t * .4)];
        ink(h, [[c[0] + 5, c[1] - 2], c].map(f), false, .5);
        eyeAt(f(c), (2.4 + t * 1.6) * s, (o.dir || 1) > 0 ? .5 + t * .6 : Math.PI - .5 - t * .6);
      }
    }
    [[-1, 22], [3, 22]].forEach(q => { seg(h, f([q[0] + .4, 8]), f(q), .9); ink(h, [[q[0] - 2.4, q[1] + 1], q, [q[0] + 2.4, q[1] + 1]].map(f), false, .8); });
    dline(h, tube([[3, -6, 3.4], [7.6, -14, 2.4], [8.6, -21, 2]].map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4),
      { band: B_SINGLE, fill: F_SCALES, step: 1.3 * s, tint: true, tone: 'fill', sharp: true, w: .9 });
    const bodyP = [[10, -4], [8, 4], [2, 10], [-6, 10], [-9, 4], [-6, -3], [2, -7]];
    dline(h, bodyP.map(f), Object.assign({}, lk, { tone: 'fill', fill: lk.fill === F_COLOUR ? F_SCALES : lk.fill, tint: true }));
    wing(h, f, [[-5, -1], [3, -3], [5, 3], [-2, 8], [-7, 5]], s, lk);
    dline(h, circ([9.6, -23.6], 3.4, 12).map(f), Object.assign({}, lk, { band: B_SINGLE, fill: F_COLOUR, tone: 'fill' }));
    dline(h, [[12.6, -24.4], [12.6, -24.4], [16.4, -23], [16.4, -23], [12.4, -22]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .8 });
    for (let i = -1; i <= 1; i++) { const tip = [9.6 + i * 2.2, -32.6]; seg(h, f([9.6, -26.6]), f(tip), .6); dot(h, f(tip), .9 * s, 'accent'); }
    fishEye(h, f, [10.2, -24], 2.6, .95, { s: s * .75, brow: false, kohl: false });
  }

  def('mPeacock', 'Birds', 'Peacock', [
    O('tail', 'Tail', ['trailing', 'fan'], 0), N('feathers', 'Feathers', 4, 16, 8),
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 8, 2.5, .5),
    O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 4, w: 92, h: 92 }, (hh, cx, cy, s) =>
      peacock(hh, cx, cy, s, p.tail === 1, p.feathers, look(p, s), { dir: p.dir ? -1 : 1 }));
  });

  def('mBirds', 'Birds', 'Pair of birds', [
    O('kind', 'Kind', ['parrots', 'peacocks', 'mainas', 'cranes'], 0), O('band', 'Double line', BANDS, 0),
    O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 8, 2.5, .5), B('flower', 'Flower between', true),
  ], (h, p) => {
    h.fitDraw({ x: 3, y: 6, w: 94, h: 88 }, (hh, cx, cy, s) => {
      const lk = look(p, s);
      const gap = [20, 26, 16, 26][p.kind];
      if (p.kind === 1) {
        peacock(hh, cx - gap * s, cy, s * .7, false, 6, lk, { dir: -1 });
        peacock(hh, cx + gap * s, cy, s * .7, false, 6, lk, { dir: 1 });
      } else {
        const kd = [0, 0, 1, 2][p.kind];
        bird(hh, cx - gap * s, cy, s, kd, lk, { dir: 1 });
        bird(hh, cx + gap * s, cy, s, kd, lk, { dir: -1 });
      }
      if (p.flower) bloom(hh, place(cx, cy - 6 * s, s * .8, 1), s * .8, lk, 5);
    });
  });

  /* ============================================================
     NATURE
     ============================================================ */
  function leaf(h, base, tip, wd, s, lk, tone) {
    const mid = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2];
    const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l * wd, ny = dx / l * wd;
    const pts = [base, base, [mid[0] + nx, mid[1] + ny], tip, tip, [mid[0] - nx, mid[1] - ny]];
    dline(h, pts, Object.assign({}, lk, { tone: tone || 'fill', gap: Math.min(lk.gap, wd * .4), fill: lk.fill === F_COLOUR ? F_COLOUR : F_HATCH, ang: Math.atan2(dy, dx) / D + 60 }));
    ink(h, [base, tip], false, .55);
  }

  function tree(h, cx, cy, s, branches, lk, o) {
    o = o || {};
    const f = place(cx, cy, s, 1);
    const n = Math.max(2, branches | 0);
    const T = sp => tube(sp.map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4);
    /* a mound at the foot, rippled like water or earth */
    dline(h, [[-18, 40], [-9, 33], [0, 32], [9, 33], [18, 40]].map(f), Object.assign({}, lk, { tone: 'accent', fill: F_WAVES, tint: true, gap: 1.4 * s }));
    /* branches fan out of the crown — the outer ones leave the trunk
       lower and reach further, so the tree reads as a canopy */
    const tips = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? .5 : i / (n - 1), off = u - .5;
      const ang = -Math.PI / 2 + off * 2.7;
      const y0 = -6 + Math.abs(off) * 26;
      const end = [Math.cos(ang) * 31, -12 + Math.sin(ang) * 26];
      const mid = [end[0] * .62, (y0 + end[1]) / 2 + Math.abs(off) * 6];
      dline(h, T([[off * 3, y0, 2.6], mid.concat(1.9), end.concat(1.1)]), { band: B_SINGLE, fill: F_COLOUR, tone: i % 2 ? 'accent' : 'fill', sharp: true, w: .9 });
      tips.push({ end, mid, ang, i });
    }
    dline(h, T([[0, 38, 5.6], [0, 20, 4.6], [0, 4, 3.8], [0, -8, 3]]), Object.assign({}, lk, { tone: 'accent', fill: F_HATCH, ang: 0, sharp: true, gap: 1.2 * s }));
    tips.forEach(({ end, mid, ang, i }) => {
      /* leaves along the branch as well as at its tip — a Mithila
         canopy is packed, not a bare fan */
      [-1, 1].forEach(sd => {
        const a = ang + sd * 1.1, b = [mid[0] + (end[0] - mid[0]) * .2, mid[1] + (end[1] - mid[1]) * .2];
        leaf(h, f(b), f([b[0] + Math.cos(a) * 9, b[1] + Math.sin(a) * 9]), 2.6 * s, s, lk, (i + sd) % 2 ? 'accent' : 'fill');
      });
      for (let q = -1; q <= 1; q++) {
        const a = ang + q * .75, len = q ? 11 : 14;
        leaf(h, f(end), f([end[0] + Math.cos(a) * len, end[1] + Math.sin(a) * len]), 3.6 * s, s, lk, (i + q) % 2 ? 'fill' : 'accent');
      }
      if (o.flowers) {
        dline(h, circ(f(end), 2.6 * s, 10), { band: B_DOT, fill: F_COLOUR, tone: 'accent', gap: .8 * s, w: .8 });
        dot(h, f(end), .7 * s, 'line');
      }
    });
    if (o.birds && tips.length >= 2) {
      const L = tips[0], R = tips[tips.length - 1];
      bird(h, ...f([R.mid[0] + 2, R.mid[1] - 8]), s * .42, 0, lk, { dir: 1 });
      bird(h, ...f([L.mid[0] - 2, L.mid[1] - 8]), s * .42, 0, lk, { dir: -1 });
    }
  }
  def('mTree', 'Nature', 'Tree of life', [
    N('branches', 'Branches', 2, 9, 7), B('birds', 'Parrots', true), B('flowers', 'Flowers', true),
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 8, 2.5, .5),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 3, w: 92, h: 94 }, (hh, cx, cy, s) => tree(hh, cx, cy, s, p.branches, look(p, s), p));
  });

  function bamboo(h, x, y0, y1, s, lk, seed) {
    const r = 2.2 * s, nodes = Math.max(3, Math.round((y0 - y1) / (9 * s)));
    for (let i = 0; i < nodes; i++) {
      const a = y0 - (i / nodes) * (y0 - y1), b = y0 - ((i + 1) / nodes) * (y0 - y1) + .6 * s;
      dline(h, [[x - r, a], [x + r, a], [x + r * .9, b], [x - r * .9, b]], Object.assign({}, lk, { tone: i % 2 ? 'fill' : 'accent', band: B_SINGLE, fill: F_COLOUR, sharp: true }));
      ink(h, [[x - r * 1.2, b], [x + r * 1.2, b]], false, .9);
      if (i > 0 && (i + seed) % 2 === 0) {
        const sd = (i + seed) % 4 ? 1 : -1;
        leaf(h, [x + sd * r, b], [x + sd * (r + 10 * s), b - 6 * s], 1.8 * s, s, lk, 'fill');
      }
    }
    leaf(h, [x, y1], [x + 2 * s, y1 - 9 * s], 1.8 * s, s, lk, 'fill');
  }
  def('mBamboo', 'Nature', 'Bamboo grove', [
    N('stalks', 'Stalks', 1, 7, 3), O('band', 'Leaf line', BANDS, 0), O('fill', 'Leaf interior', FILLS, 1), N('dens', 'Pattern scale', 1.5, 6, 2, .5),
  ], (h, p) => {
    const n = Math.max(1, p.stalks), lk = look(p, 1);
    for (let i = 0; i < n; i++) {
      const x = 50 + (i - (n - 1) / 2) * Math.min(14, 76 / n);
      bamboo(h, x, 96, 12 + (i % 2) * 10 + (i === Math.floor(n / 2) ? -6 : 0), 1, lk, i);
    }
  });

  function lotusTop(h, cx, cy, R, rings, petals, s, lk) {
    /* the Kohbar lotus: rings of petals round a seeded centre */
    for (let r = rings; r >= 1; r--) {
      const rr = R * (r / rings), n = petals + (r - 1) * 4, w = Math.PI / n;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU + (r % 2 ? w : 0);
        const tip = [cx + Math.cos(t) * rr, cy + Math.sin(t) * rr];
        const b0 = [cx + Math.cos(t - w * .95) * rr * .55, cy + Math.sin(t - w * .95) * rr * .55];
        const b1 = [cx + Math.cos(t + w * .95) * rr * .55, cy + Math.sin(t + w * .95) * rr * .55];
        const m0 = [cx + Math.cos(t - w * .7) * rr * .82, cy + Math.sin(t - w * .7) * rr * .82];
        const m1 = [cx + Math.cos(t + w * .7) * rr * .82, cy + Math.sin(t + w * .7) * rr * .82];
        dline(h, [b0, m0, tip, tip, m1, b1], Object.assign({}, lk, { tone: r % 2 ? 'fill' : 'accent', gap: Math.min(lk.gap, rr * .06), band: lk.band === B_SOLID ? B_HATCH : lk.band, fill: r === rings ? lk.fill : F_COLOUR }));
      }
    }
    const core = R / (rings + 1) * .9;
    dline(h, circ([cx, cy], core, 20), Object.assign({}, lk, { tone: 'accent', fill: F_COLOUR, band: B_TEETH, gap: core * .22 }));
    const k = Math.max(3, Math.round(core / (2.4 * s)));
    for (let i = 0; i < k; i++) { const t = (i / k) * TAU; dot(h, [cx + Math.cos(t) * core * .45, cy + Math.sin(t) * core * .45], core * .09, 'line'); }
    dot(h, [cx, cy], core * .14, 'line');
  }

  def('mLotus', 'Nature', 'Lotus', [
    O('view', 'View', ['bloom', 'from above', 'bud'], 0), N('petals', 'Petals', 5, 14, 8), N('rings', 'Rings (from above)', 1, 4, 3),
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 6, 2, .5), B('leaves', 'Pads and stem', true),
  ], (h, p) => {
    if (p.view === 1) {
      const lk = look(p, 1);
      lotusTop(h, 50, 50, 46, Math.max(1, p.rings), Math.max(5, p.petals), 1, lk);
      return;
    }
    h.fitDraw({ x: 6, y: 4, w: 88, h: 92 }, (hh, cx, cy, s) => {
      const lk = look(p, s);
      if (p.leaves) {
        ink(hh, [[cx, cy + 4 * s], [cx - 2 * s, cy + 20 * s], [cx + 1 * s, cy + 36 * s]], false, 1.6);
        [[-1, 30], [1, 24]].forEach(([sd, y]) => {
          const c = [cx + sd * 13 * s, cy + y * s];
          dline(hh, [c, [c[0] + sd * 4 * s, c[1] - 5 * s], [c[0] + sd * 12 * s, c[1] - 4 * s], [c[0] + sd * 14 * s, c[1] + 1 * s], [c[0] + sd * 6 * s, c[1] + 3 * s], c],
            Object.assign({}, lk, { tone: 'fill', fill: F_WAVES, tint: true, gap: 1.2 * s }));
          ink(hh, [[cx - 1 * s, c[1] + 4 * s], [c[0], c[1] + 1 * s]], false, .9);
        });
      }
      if (p.view === 2) {
        const g = place(cx, cy - 4 * s, s * 1.6, 1);
        dline(hh, [[0, 8], [-5, 2], [-4, -6], [0, -12], [0, -12], [4, -6], [5, 2]].map(g), Object.assign({}, lk, { tone: 'accent', gap: 1.4 * s }));
        [[-1], [1]].forEach(([sd]) => dline(hh, [[0, 8], [sd * 6, 4], [sd * 8, -2], [sd * 7, -5], [sd * 3, 2]].map(g), Object.assign({}, lk, { tone: 'fill', gap: 1.2 * s, fill: F_COLOUR })));
      } else bloom(hh, place(cx, cy, s * 1.8, 1), s * 1.8, lk, Math.max(3, Math.min(9, Math.round(p.petals * .7))));
    });
  });

  function sunFace(h, c, R, s, rays, lk) {
    const n = Math.max(6, rays | 0);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU - Math.PI / 2, w = Math.PI / n * .8;
      const pts = [[c[0] + Math.cos(t - w) * R * .96, c[1] + Math.sin(t - w) * R * .96], [c[0] + Math.cos(t) * R * 1.6, c[1] + Math.sin(t) * R * 1.6],
      [c[0] + Math.cos(t + w) * R * .96, c[1] + Math.sin(t + w) * R * .96]];
      dline(h, pts, Object.assign({}, lk, { tone: i % 2 ? 'fill' : 'accent', sharp: true, gap: Math.min(lk.gap, R * .07), band: lk.band === B_SOLID ? B_HATCH : lk.band, fill: F_COLOUR }));
    }
    dline(h, circ(c, R, 28), Object.assign({}, lk, { tone: 'fill', fill: F_COLOUR, band: B_TEETH, gap: R * .16 }));
    /* a frontal face: two fish eyes, a nose, a mouth */
    const f = place(c[0], c[1], R / 10, 1);
    fishEye(h, f, [-3.6, -1.4], 4.6, 1.6, { s: R / 10, kohl: false });
    fishEye(h, place(c[0], c[1], R / 10, -1), [-3.6, -1.4], 4.6, 1.6, { s: R / 10, kohl: false });
    ink(h, [[0, -1.6], [-.6, 2.2], [.8, 2.6]].map(f), false, .8);
    dline(h, [[-2.2, 4.6], [0, 4.2], [2.2, 4.6], [0, 5.8]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .7 });
    dot(h, f([0, -4.4]), .6 * R / 10, 'accent');
  }

  function moon(h, c, R, s, lk) {
    const pts = [];
    /* a thick crescent, horns to the right, with a face in the
       thick of it looking out of the hollow */
    const a0 = Math.PI * .28, a1 = Math.PI * 1.72;
    for (let i = 0; i <= 18; i++) { const t = a0 + (i / 18) * (a1 - a0); pts.push([c[0] + Math.cos(t) * R, c[1] + Math.sin(t) * R]); }
    const ic = [c[0] + R * .5, c[1]], ir = R * .74;
    for (let i = 18; i >= 0; i--) { const t = Math.PI * .44 + (i / 18) * Math.PI * 1.12; pts.push([ic[0] + Math.cos(t) * ir, ic[1] + Math.sin(t) * ir]); }
    dline(h, pts, Object.assign({}, lk, { tone: 'fill', fill: lk.fill }));
    const f = place(c[0] - R * .6, c[1], R / 16, 1);
    fishEye(h, f, [0, -1], 5, 1.7, { s: R / 16 });
    dot(h, f([1, -7.4]), .8 * R / 16, 'accent');
    dline(h, [[-1.6, 6], [0, 5.4], [1.6, 6], [0, 7]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: 'accent', w: .7 });
  }

  def('mSky', 'Nature', 'Sun & moon', [
    O('kind', 'Kind', ['sun', 'moon', 'sun and moon'], 0), N('rays', 'Rays', 8, 28, 16),
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 6, 2, .5),
  ], (h, p) => {
    const lk = look(p, 1);
    if (p.kind === 1) { moon(h, [50, 50], 42, 1, lk); return; }
    if (p.kind === 2) { sunFace(h, [34, 38], 17, .6, p.rays, look(p, .6)); moon(h, [74, 70], 22, .6, look(p, .6)); return; }
    sunFace(h, [50, 50], 29, 1, p.rays, lk);
  });

  /* space fillers — what a painter drops into every gap */
  const FILLERS = ['rosette', 'bud', 'leaf spray', 'star flower', 'kalash', 'lamp'];
  def('mFlower', 'Nature', 'Flowers & fillers', [
    O('kind', 'Kind', FILLERS, 0), N('petals', 'Petals', 4, 12, 8), O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 6, 2, .5),
  ], (h, p) => {
    h.fitDraw({ x: 8, y: 8, w: 84, h: 84 }, (hh, cx, cy, s) => {
      const lk = look(p, s * 1.6), n = Math.max(4, p.petals);
      if (p.kind === 0 || p.kind === 3) {
        for (let i = 0; i < n; i++) {
          const t = (i / n) * TAU, w = Math.PI / n * (p.kind === 3 ? .5 : .9), R = 30 * s;
          const tip = [cx + Math.cos(t) * R, cy + Math.sin(t) * R];
          const a = [cx + Math.cos(t - w) * R * .5, cy + Math.sin(t - w) * R * .5], b = [cx + Math.cos(t + w) * R * .5, cy + Math.sin(t + w) * R * .5];
          dline(hh, p.kind === 3 ? [[cx, cy], a, tip, tip, b] : [[cx, cy], a, tip, b], Object.assign({}, lk, { tone: i % 2 ? 'accent' : 'fill', gap: 1.8 * s }));
        }
        dline(hh, circ([cx, cy], 8 * s, 14), { band: B_DOT, fill: F_COLOUR, tone: 'accent', gap: 1.8 * s });
      } else if (p.kind === 1) {
        bloom(hh, place(cx, cy, s * 3, 1), s * 3, lk, 3);
        ink(hh, [[cx, cy + 6 * s], [cx, cy + 30 * s]], false, 1.2);
        leaf(hh, [cx, cy + 20 * s], [cx - 14 * s, cy + 12 * s], 3.6 * s, s, lk, 'fill');
        leaf(hh, [cx, cy + 26 * s], [cx + 14 * s, cy + 18 * s], 3.6 * s, s, lk, 'accent');
      } else if (p.kind === 2) {
        ink(hh, [[cx, cy + 30 * s], [cx + 2 * s, cy], [cx, cy - 30 * s]], false, 1.2);
        for (let i = 0; i < n; i++) {
          const y = cy + 24 * s - i * (50 * s / n), sd = i % 2 ? 1 : -1;
          leaf(hh, [cx + 1 * s, y], [cx + sd * 16 * s, y - 9 * s], 3.4 * s, s, lk, i % 2 ? 'fill' : 'accent');
        }
      } else if (p.kind === 4) kalash(hh, place(cx, cy + 4 * s, s * 3.2, 1), s * 3.2, lk, true);
      else diya(hh, place(cx, cy + 6 * s, s * 5, 1));
    });
  });

  /* ============================================================
     COMPOSITIONS
     ============================================================ */
  /* THE KOHBAR — the marriage chamber painting: a great lotus ring
     at the centre, bamboo on either side, fish, turtles, the sun and
     the moon keeping watch. Every gap gets a flower. */
  def('mKohbar', 'Compositions', 'Kohbar', [
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 6, 2, .5),
    N('rings', 'Lotus rings', 1, 4, 3), B('frame', 'Frame', true),
  ], (h, p) => {
    const lk = look(p, .55);
    if (p.frame) frameBand(h, 1, 1, 98, 98, 5.4, 1, 6, { band: p.band });
    lotusTop(h, 50, 46, 22, Math.max(1, p.rings), 8, .55, look(p, .55));
    ink(h, [[50, 68], [49, 78], [50, 86]], false, 1.2);
    bamboo(h, 16, 90, 12, .5, lk, 0); bamboo(h, 23, 90, 22, .5, lk, 1);
    bamboo(h, 84, 90, 12, .5, lk, 1); bamboo(h, 77, 90, 22, .5, lk, 0);
    sunFace(h, [33, 16], 5.4, .3, 12, look(p, .3));
    moon(h, [67, 16], 6.6, .3, look(p, .3));
    fish(h, place(38, 80, .3, 1, -.2, .01), .3, 0, look(p, .3));
    fish(h, place(62, 80, .3, -1, .2, .01), .3, 0, look(p, .3));
    turtle(h, place(50, 88, .2, 1, 0), .2, look(p, .2));
    [[31, 30], [69, 30], [30, 64], [70, 64]].forEach((q, i) => {
      const f = place(q[0], q[1], .22, 1);
      for (let k = 0; k < 6; k++) { const t = (k / 6) * TAU; dline(h, [[0, 0], [Math.cos(t - .4) * 5, Math.sin(t - .4) * 5], [Math.cos(t) * 10, Math.sin(t) * 10], [Math.cos(t + .4) * 5, Math.sin(t + .4) * 5]].map(f), { band: B_SINGLE, fill: F_COLOUR, tone: (k + i) % 2 ? 'fill' : 'accent', w: .7 }); }
      dot(h, f([0, 0]), .7, 'line');
    });
  });

  def('mPond', 'Compositions', 'Lotus pond', [
    N('fish', 'Fish', 0, 6, 3), N('lotus', 'Lotus', 0, 5, 3), B('turtle', 'Turtle', true),
    O('band', 'Double line', BANDS, 0), O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 6, 2, .5),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const lk = look(p, .5);
    /* water: rows of waves in the accent, then the creatures in it */
    for (let r = 0; r < 6; r++) {
      const pts = [], y = 44 + r * 10;
      for (let q = 0; q <= 40; q++) pts.push([q * W / 40, y + Math.sin(q * .9 + r * 1.3) * 1.6]);
      ink(hh, pts, false, .8, 'accent');
    }
    const nl = Math.max(0, p.lotus);
    for (let i = 0; i < nl; i++) {
      const x = W * (i + .5) / nl, y = 24 + (i % 2) * 5;
      ink(hh, [[x, y + 6], [x + 2, y + 16], [x, 46]], false, 1.2);
      bloom(hh, place(x, y, 2.4, 1), 1.2, lk, 5);
    }
    const nf = Math.max(0, p.fish);
    for (let i = 0; i < nf; i++) {
      const x = W * (i + .5) / nf + (nl ? W / nl * .25 : 0), y = 64 + (i % 2) * 18;
      fish(hh, place(x, y, .5, i % 2 ? -1 : 1), .5, i % 3, look(p, .5));
    }
    if (p.turtle) turtle(hh, place(Math.min(W - 16, W * .5 + W / Math.max(1, nf) * .5), 70, .55, 1, Math.PI / 2), .55, look(p, .55));
  }));

  def('mRoundel', 'Compositions', 'Lotus mandala', [
    N('rings', 'Rings', 1, 4, 3), N('petals', 'Petals', 6, 16, 10), O('band', 'Double line', BANDS, 0),
    O('fill', 'Interior', FILLS, 0), N('dens', 'Pattern scale', 1.5, 6, 2, .5), B('border', 'Outer band', true),
  ], (h, p) => {
    const lk = look(p, .8);
    if (p.border) {
      const outer = circ([50, 50], 48, 64), innerR = circ([50, 50], 42, 64);
      dline(h, outer, Object.assign({}, lk, { fill: F_PLAIN, band: B_SINGLE }));
      ink(h, innerR, true, .8);
      for (let i = 0; i < 24; i++) {
        const t = (i / 24) * TAU;
        dline(h, circ([50 + Math.cos(t) * 45, 50 + Math.sin(t) * 45], 2, 8), { band: B_SINGLE, fill: F_COLOUR, tone: i % 2 ? 'accent' : 'fill', w: .7 });
      }
    }
    lotusTop(h, 50, 50, p.border ? 40 : 47, Math.max(1, p.rings), Math.max(6, p.petals), .8, lk);
  });

  /* ============================================================
     BORDERS
     ------------------------------------------------------------
     A Mithila border is a strip between two double lines, packed
     with one repeating unit. Bands and frames share `unit`, which
     draws one repeat in strip coordinates (u along, v across).
     ============================================================ */
  const UNITS = ['hatched', 'teeth', 'petals', 'vine', 'scallops', 'loops', 'checks', 'fish', 'buds'];

  function unit(h, M, kind, u0, u1, v0, v1, i, lk) {
    const w = u1 - u0, hgt = v1 - v0, um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    const s = Math.min(w, hgt) / 10;
    switch (((kind % UNITS.length) + UNITS.length) % UNITS.length) {
      case 0: {
        const n = 3;
        for (let q = 0; q < n; q++) { const a = u0 + (q / n) * w; seg(h, M(a, v1), M(a + w / n * 1.6, v0), .5); }
        break;
      }
      case 1: {
        dline(h, [M(u0, v1), M(um, v0), M(u1, v1)], { band: B_SINGLE, fill: F_COLOUR, tone: i % 2 ? 'fill' : 'accent', sharp: true, w: .8 });
        break;
      }
      case 2: {
        const pts = [M(um - w * .38, v1), M(um - w * .4, vm), M(um, v0 + hgt * .06), M(um, v0 + hgt * .06), M(um + w * .4, vm), M(um + w * .38, v1)];
        dline(h, pts, Object.assign({}, lk, { tone: i % 2 ? 'fill' : 'accent', gap: Math.min(lk.gap, s * 1.1), fill: F_COLOUR }));
        break;
      }
      case 3: {
        /* the bel: a creeper swinging along the band, one leaf and one
           bud per repeat, on alternate sides */
        const sd = i % 2 ? 1 : -1, amp = hgt * .16;
        const pts = [];
        for (let q = 0; q <= 8; q++) { const t = q / 8; pts.push(M(u0 + t * w, vm + Math.sin(t * TAU + (i % 2) * Math.PI) * amp)); }
        ink(h, pts, false, 1.1);
        const b = M(u0 + w * .25, vm + sd * amp), tp = M(u0 + w * .62, vm - sd * hgt * .4);
        const mid = [(b[0] + tp[0]) / 2, (b[1] + tp[1]) / 2], dx = tp[0] - b[0], dy = tp[1] - b[1], l = Math.hypot(dx, dy) || 1, k2 = l * .3;
        dline(h, [b, b, [mid[0] - dy / l * k2, mid[1] + dx / l * k2], tp, tp, [mid[0] + dy / l * k2, mid[1] - dx / l * k2]],
          { band: B_SINGLE, fill: F_COLOUR, tone: i % 2 ? 'fill' : 'accent', w: .8 });
        ink(h, [b, tp], false, .5);
        const bud = M(u0 + w * .8, vm + sd * hgt * .3);
        seg(h, M(u0 + w * .72, vm + sd * amp * .3), bud, .7);
        dline(h, circ(bud, s * 1.3, 10), { band: B_SINGLE, fill: F_COLOUR, tone: i % 2 ? 'accent' : 'fill', w: .7 });
        break;
      }
      case 4: {
        const pts = [];
        for (let q = 0; q <= 10; q++) { const t = Math.PI + (q / 10) * Math.PI; pts.push(M(um + Math.cos(t) * w * .5, v1 + Math.sin(t) * hgt * .82)); }
        dline(h, pts, Object.assign({}, lk, { tone: i % 2 ? 'fill' : 'accent', gap: Math.min(lk.gap, s * 1.2), fill: F_COLOUR, band: B_HATCH }));
        dot(h, M(um, v1 - hgt * .3), s * .8, 'line');
        break;
      }
      case 5: {
        const pts = [];
        for (let q = 0; q < 16; q++) { const t = (q / 16) * TAU; pts.push(M(um + Math.cos(t) * w * .62, vm + Math.sin(t) * hgt * .32)); }
        ink(h, pts, true, .8, i % 2 ? 'accent' : 'line');
        dot(h, M(um, vm), s * .7, 'accent');
        break;
      }
      case 6: {
        [[v0, vm], [vm, v1]].forEach(([a, b], r) => {
          if ((i + r) % 2) h.curve([M(u0, a), M(u1, a), M(u1, b), M(u0, b)], { closed: true, sharp: true, passes: 1, role: 'accent', fill: 'accent', w: .3 });
          else { const c = M(um, (a + b) / 2); dot(h, c, s * .5, 'line'); }
        });
        break;
      }
      case 7: {
        const g = p => M(um + p[0] * w / 80, vm + p[1] * hgt / 34);
        const pts = [[30, 0], [24, -8], [10, -13], [-8, -12], [-20, -6], [-25, 0], [-25, 0], [-35, -11], [-33, 0], [-35, 11], [-25, 0], [-25, 0], [-20, 6], [-8, 12], [10, 13], [24, 8]];
        dline(h, pts.map(g), { band: B_SINGLE, fill: F_SCALES, tint: true, step: s * 1.3, tone: i % 2 ? 'fill' : 'accent', w: .75 });
        dot(h, g([20, -2]), s * .55, 'line');
        break;
      }
      default: {
        const pts = [M(um, v1), M(um - w * .26, vm + hgt * .1), M(um, v0 + hgt * .08), M(um, v0 + hgt * .08), M(um + w * .26, vm + hgt * .1)];
        dline(h, pts, Object.assign({}, lk, { tone: i % 2 ? 'fill' : 'accent', gap: Math.min(lk.gap, s), fill: F_COLOUR, band: B_SINGLE }));
        seg(h, M(u0 + w * .05, v1), M(u1 - w * .05, v1), .6);
      }
    }
  }

  /* a strip along u, `n` units, double-ruled both sides */
  function bandStrip(h, x, y, len, hgt, kind, n, lk, M0) {
    const M = M0 || ((u, v) => [x + u, y + v]);
    const rule = Math.max(.6, hgt * .1);
    const edge = (v, w) => ink(h, [M(0, v), M(len * .5, v), M(len, v)], false, w);
    edge(0, 1); edge(rule, .7); edge(hgt, 1); edge(hgt - rule, .7);
    const k = Math.max(1, Math.round(n));
    const um = len / k;
    for (let i = 0; i < k; i++) unit(h, M, kind, i * um, (i + 1) * um, rule * 1.3, hgt - rule * 1.3, i, Object.assign({ band: B_HATCH, fill: F_COLOUR, gap: hgt * .08 }, lk || {}));
  }

  /* frame: four strips, a rosette in each corner. Drawn in true
     units (the caller squeezes), so a corner is always square. */
  function frameBand(h, x, y, w, hh, t, kind, n, lk) {
    const lenX = w - 2 * t, lenY = hh - 2 * t;
    const ny = Math.max(1, Math.round(n)), nx = Math.max(1, Math.round(n * lenX / Math.max(1, lenY)));
    bandStrip(h, 0, 0, lenX, t, kind, nx, lk, (u, v) => [x + t + u, y + v]);
    bandStrip(h, 0, 0, lenX, t, kind, nx, lk, (u, v) => [x + w - t - u, y + hh - v]);
    bandStrip(h, 0, 0, lenY, t, kind, ny, lk, (u, v) => [x + w - v, y + t + u]);
    bandStrip(h, 0, 0, lenY, t, kind, ny, lk, (u, v) => [x + v, y + hh - t - u]);
    [[x, y], [x + w - t, y], [x, y + hh - t], [x + w - t, y + hh - t]].forEach(c => {
      const cc = [c[0] + t / 2, c[1] + t / 2], R = t * .46;
      ink(h, [c, [c[0] + t, c[1]], [c[0] + t, c[1] + t], [c[0], c[1] + t]], true, 1);
      for (let q = 0; q < 8; q++) {
        const a = (q / 8) * TAU, P = (r, da) => [cc[0] + Math.cos(a + da) * r, cc[1] + Math.sin(a + da) * r];
        dline(h, [cc, P(R * .5, -.34), P(R * .95, 0), P(R * .5, .34)], { band: B_SINGLE, fill: F_COLOUR, tone: q % 2 ? 'fill' : 'accent', w: .6 });
      }
      dot(h, cc, R * .16, 'line');
    });
  }

  def('mBorder', 'Borders', 'Border band', [
    O('kind', 'Unit', UNITS, 0), N('repeat', 'Repeats', 3, 40, 14), O('band', 'Double line', BANDS, 0), N('height', 'Band height', 20, 90, 60),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const hgt = Math.max(10, Math.min(90, p.height));
    bandStrip(hh, 1, 50 - hgt / 2, W - 2, hgt, p.kind, p.repeat, { band: p.band, gap: hgt * .06 });
  }));

  def('mFrame', 'Borders', 'Frame', [
    O('kind', 'Unit', UNITS, 1), N('repeat', 'Repeats per side', 3, 24, 10), N('depth', 'Depth', 4, 16, 8), O('band', 'Double line', BANDS, 0),
  ], (h, p) => {
    const b = Math.max(3, p.depth);
    squeeze(h, p._ar || 1, (hh, W) => frameBand(hh, 1, 1, W - 2, 98, b, p.kind, p.repeat, { band: p.band, gap: b * .08 }));
  });

  def('mField', 'Borders', 'Pattern field', [
    O('fill', 'Pattern', FILLS.slice(1, -1), 0), N('dens', 'Scale', 2, 12, 5), N('ang', 'Angle', 0, 180, 45), B('tint', 'Colour wash', false),
  ], (h, p) => {
    if (p.tint) h.push('M0 0L100 0L100 100L0 100Z', { role: 'fill', fill: 'fill', w: .1 });
    h.clipStart('M0 0L100 0L100 100L0 100Z');
    pattern(h, [0, 0, 100, 100], p.fill + 1, p.dens, p.ang);
    h.clipEnd();
  });

  /* Pieces that stretch, and the shape they want to arrive at. */
  ['mBorder', 'mFrame', 'mField', 'mProcession', 'mSnake', 'mPond'].forEach(k => { G[k].aspect = 'free'; });
  G.mBorder.place = { w: .92, h: .09 };
  G.mFrame.place = { w: .9, h: .9 };
  G.mField.place = { w: .9, h: .9 };
  G.mProcession.place = { w: .9, h: .36 };
  G.mSnake.place = { w: .8, h: .36 };
  G.mPond.place = { w: .92, h: .4 };

  window.SCRAWL.MADHUBANI = { dline, clipSeg, tube, smooth, resample, inset, place, perimeter, bounds, circ, ink, seg, dot, pattern, person, fish, bird, peacock, beast, turtle, fishEye, lotusTop, bandStrip, frameBand, squeeze, BANDS, FILLS, UNITS };
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
