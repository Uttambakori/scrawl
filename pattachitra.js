/* ============================================================
   MOTIFS / pattachitra — the Odisha cloth-painting grammar
   ------------------------------------------------------------
   Pattachitra (Puri and Raghurajpur, Odisha) is painted on a
   cloth primed with chalk and tamarind gum, in a handful of
   mineral pigments: hingula red, haritala yellow, conch-shell
   white, lamp-black, a little indigo. Where Madhubani draws a
   line twice, Pattachitra paints a flat colour and then works
   over it:

     A FLAT ENAMEL OF COLOUR, A HEAVY BLACK CONTOUR, AND A ROW OF
     BEADS JUST INSIDE IT.

   That inner row of dots — white on yellow, yellow on white —
   runs along a crown, a sash, the rim of a chariot wheel, the
   edge of every border band, and it is the thing that makes a
   piece read as Odia at a glance. `enamel` is the one mechanism
   here and every shape goes through it.

   Three rules the code has to keep:

   1. COLOUR FIRST, LINE LAST. Fill, then the cloth pattern (the
      stripes and butis of a dhoti), then the contour, then the
      beads. Never an outline with nothing inside it.

   2. THE BORDER IS HALF THE PAINTING. A patta is framed by two
      or three nested bands — a creeper (lata), a row of petals,
      a row of beads — and the frame is drawn with the same care
      as the subject.

   3. THE GROUND IS NEVER EMPTY. Behind a figure the painter runs
      a scrolling creeper of leaves and flowers. `pLata` is that
      background as a piece of its own.

   Geometry (smoothing, insetting, tubes, squeezing a free piece)
   is borrowed from the Madhubani pack, which loads first.
   ============================================================ */
(function () {
  const { TAU } = window.SCRAWL;
  const G = window.SCRAWL.GENS;
  const M = window.SCRAWL.MADHUBANI;
  const { smooth, resample, inset, place, perimeter, bounds, circ, tube, squeeze, ink, seg, dot, clipSeg } = M;
  const D = Math.PI / 180;

  function def(key, cat, label, params, draw) {
    G[key] = { key, cat, label, params, draw, style: 'pattachitra', aspect: 'square' };
  }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ============================================================
     THE ENAMEL
     ============================================================ */
  const CLOTHS = ['plain', 'stripes', 'checks', 'butis', 'dots', 'chevrons', 'scales'];
  const C_PLAIN = 0, C_STRIPES = 1, C_CHECKS = 2, C_BUTIS = 3, C_DOTS = 4, C_CHEV = 5, C_SCALES = 6;
  const other = t => t === 'accent' ? 'fill' : 'accent';

  /* The cloth patterns a painter puts on a dhoti or a caparison.
     Clipped by the caller; budgeted like every fill in the engine. */
  function cloth(h, bb, kind, step, ang, tone) {
    if (kind === C_PLAIN) return;
    const [x, y, w, hh] = bb;
    const a = (ang || 0) * D, ca = Math.cos(a), sa = Math.sin(a);
    const R = Math.hypot(w, hh) * .52, cx = x + w / 2, cy = y + hh / 2;
    const T = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
    const det = h.detail ?? 1;
    const lined = kind === C_STRIPES || kind === C_CHECKS;
    let g = Math.max(.8, step / Math.max(.3, det));
    if (lined) { const cap = Math.max(6, 60 * det); if (2 * R / g > cap) g = 2 * R / cap; }
    else { const cap = Math.max(24, (kind === C_BUTIS ? 200 : 500) * det), side = Math.sqrt(cap); if (2 * R / g > side) g = 2 * R / side; }
    const rows = Math.ceil(2 * R / g);
    const inBox = p => p[0] > x - g && p[0] < x + w + g && p[1] > y - g && p[1] < y + hh + g;
    for (let r = 0; r <= rows; r++) {
      const v = -R + r * g;
      if (kind === C_STRIPES || kind === C_CHECKS) {
        /* a stripe is a broad band of the other pigment edged in black */
        if (r % 2) continue;
        const bx = [x - g, y - g, w + 2 * g, hh + 2 * g];
        const c0 = clipSeg(T(-R, v), T(R, v), bx), c1 = clipSeg(T(-R, v + g * .45), T(R, v + g * .45), bx);
        if (!c0 || !c1) continue;
        const U = p => (p[0] - cx) * ca + (p[1] - cy) * sa;
        const ua = Math.min(U(c0[0]), U(c0[1]), U(c1[0]), U(c1[1])), ub = Math.max(U(c0[0]), U(c0[1]), U(c1[0]), U(c1[1]));
        const q = [T(ua, v), T(ub, v), T(ub, v + g * .45), T(ua, v + g * .45)];
        h.curve(q, { closed: true, sharp: true, passes: 1, role: other(tone), fill: other(tone), w: .2 });
        seg(h, q[0], q[1], .45); seg(h, q[3], q[2], .45);
        if (kind === C_CHECKS) {
          const c = clipSeg(T(v, -R), T(v, R), bb);
          if (c) seg(h, c[0], c[1], .45);
        }
        continue;
      }
      const stag = (r % 2) ? g / 2 : 0;
      for (let c = 0; c <= rows; c++) {
        const p = T(-R + c * g + stag, v);
        if (!inBox(p)) continue;
        if (kind === C_DOTS) dot(h, p, g * .14, other(tone));
        else if (kind === C_BUTIS) {
          for (let k = 0; k < 4; k++) { const t = k / 4 * TAU + a; dot(h, [p[0] + Math.cos(t) * g * .16, p[1] + Math.sin(t) * g * .16], g * .1, other(tone)); }
          dot(h, p, g * .07, 'line');
        } else if (kind === C_CHEV) ink(h, [T(-R + c * g + stag - g * .3, v + g * .18), T(-R + c * g + stag, v - g * .18), T(-R + c * g + stag + g * .3, v + g * .18)], false, .45);
        else if (kind === C_SCALES) ink(h, h.arcPts(p[0], p[1] - g * .2, g * .5, g * .5, a, Math.PI + a, 6), false, .45);
      }
    }
  }

  /* THE ENAMEL.
     o.tone   'fill' | 'accent' | 'none'   o.cloth   interior pattern
     o.beads  a row of dots just inside the contour
     o.w      contour weight (Odia line is heavy) */
  function enamel(h, pts, o) {
    o = o || {};
    const dense = o.sharp ? pts : smooth(pts, true, o.k || 5);
    const P = perimeter(dense, true);
    const n = Math.max(12, Math.min(200, Math.round(P / 1)));
    const outer = resample(dense, true, n);
    const bb = bounds(outer), minDim = Math.min(bb[2], bb[3]);
    const tone = o.tone || 'fill';
    const d = h._curveD(outer, true, .3);
    if (tone !== 'none') h.push(d, { role: tone, fill: tone, w: .2 });
    if (o.cloth) {
      h.clipStart(d);
      cloth(h, bb, o.cloth, o.step || 3, o.ang === undefined ? 90 : o.ang, tone);
      h.clipEnd();
    }
    ink(h, outer, true, o.w || 1.4);
    if (o.beads && minDim > 2.4) {
      const gap = Math.min(o.gap || 1.3, minDim * .16);
      const inner = inset(outer, gap);
      const det = h.detail ?? 1;
      const step = Math.max(gap * 1.3, P / Math.max(10, 160 * det));
      const k = Math.max(6, Math.round(P / step)), ev = inner.length / k;
      const bead = o.beadTone || (tone === 'none' ? 'accent' : other(tone));
      for (let i = 0; i < k; i++) dot(h, inner[Math.floor(i * ev) % inner.length], gap * .34, bead);
    }
    return outer;
  }

  const T = (f, s, sp) => tube(sp.map(q => { const p = f(q); return [p[0], p[1], q[2] * s]; }), 4);

  /* The Odia eye: longer than the Mithila one, drawn right back to
     the ear, with a heavy upper lid and the pupil set in the middle. */
  function odiaEye(h, f, c, len, ht, s) {
    const up = [], lo = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, x = c[0] - len / 2 + t * len;
      up.push([x, c[1] - Math.sin(Math.pow(t, .8) * Math.PI) * ht]);
      lo.push([x, c[1] + Math.sin(Math.pow(t, .8) * Math.PI) * ht * .5]);
    }
    const back = up[0], front = up[10];
    enamel(h, [back, back].concat(up.slice(1, 10), [front, front], lo.slice(1, 10).reverse()).map(f), { tone: 'accent', beadTone: 'accent', w: .9 });
    ink(h, up.map(p => [p[0], p[1] - ht * .12]).map(f), false, 1.3);
    dot(h, f([c[0] + len * .08, c[1] - ht * .1]), ht * .55 * s, 'line');
    ink(h, [back, [back[0] - len * .4, back[1] - ht * .8]].map(f), false, .9);
    ink(h, [[c[0] - len * .45, c[1] - ht * 1.6], [c[0], c[1] - ht * 2.3], [c[0] + len * .5, c[1] - ht * 1.9]].map(f), false, 1);
  }

  /* ============================================================
     FIGURES — tribhanga, the thrice-bent dance stance of the
     temple sculpture: head, torso and hips each leaning a
     different way. Facing right, head near y -46, feet at +34.
     ============================================================ */
  const POSES = ['dancing', 'flute player', 'drummer', 'folded hands', 'with lotus'];
  /* [shoulder, elbow, wrist] back arm, then front arm */
  const ARMS = [
    [[-6.4, -23], [-13, -25], [-15, -34], [7.6, -23], [14, -18], [19, -24]],
    [[-6.4, -23], [-2, -18], [9, -31], [7.6, -23], [14, -24], [17, -30]],
    [[-6.4, -23], [-6, -14], [-2, -8], [7.6, -23], [12, -15], [11, -7]],
    [[-6.4, -23], [-2, -16], [7.6, -24.6], [7.6, -23], [11, -16], [8.4, -24.6]],
    [[-6.4, -23], [-10, -14], [-9, -5], [7.6, -23], [12.6, -17], [13, -29]],
  ];
  const LEGS = [
    [[-4, 10], [-8, 20], [-5, 32], [4, 10], [10, 20], [7, 32]],
    [[-3, 10], [-1, 21], [4, 32], [4, 10], [3, 21], [-3, 32]],
    [[-4, 10], [-6, 21], [-6, 32], [4, 10], [6, 21], [6, 32]],
    [[-4, 10], [-4, 21], [-4, 32], [4, 10], [4, 21], [4, 32]],
    [[-4, 10], [-5, 21], [-5, 32], [4, 10], [5, 21], [6, 32]],
  ];
  const HEAD = [[0, -45.5], [3.4, -44.8], [6.2, -42.6], [7.6, -39.8], [8, -37.6], [9.4, -35.4], [10.8, -33.6], [10.8, -33.6],
  [9, -33], [8.6, -32.4], [9.2, -31.6], [8.4, -30.9], [8.8, -30.2], [7.6, -28.8], [5.8, -28.2], [3.4, -28.6], [1.4, -30],
  [-2, -31], [-5, -33], [-6.6, -36.4], [-6.2, -40.4], [-4, -43.8]];
  const CROWN = [[-6.6, -40.6], [-6.8, -45.4], [-4.6, -50.6], [-1.6, -56], [.6, -61], [3, -55.6], [6.2, -50.4], [8.2, -45], [7.8, -41.2], [3.4, -42.6], [-1.6, -42.4]];

  function limb(h, f, s, j, r0, r1, tone) {
    enamel(h, T(f, s, [[j[0][0], j[0][1], r0], [j[1][0], j[1][1], (r0 + r1) / 2], [j[2][0], j[2][1], r1]]), { tone, sharp: true, w: 1.1 });
    /* armlet, bangles */
    const a = j[0], b = j[1], c = j[2];
    const ring = (p, q, t, r) => {
      const m = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
      const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const u = [-dy / l * r, dx / l * r];
      enamel(h, [[m[0] - u[0], m[1] - u[1]], [m[0] + u[0], m[1] + u[1]], [m[0] + u[0] + dx / l * .9, m[1] + u[1] + dy / l * .9], [m[0] - u[0] + dx / l * .9, m[1] - u[1] + dy / l * .9]].map(f),
        { tone: 'accent', sharp: true, w: .8 });
    };
    ring(a, b, .45, r0 * 1.15); ring(b, c, .78, r1 * 1.2);
  }

  function figure(h, cx, cy, s, pose, o) {
    o = o || {};
    const pz = ((pose % POSES.length) + POSES.length) % POSES.length;
    const f0 = place(cx, cy, s, o.dir || 1);
    /* tribhanga: the upper body leans one way about the waist */
    const lean = pz === 0 ? .14 : pz === 1 ? .1 : 0;
    const up = p => { const dx = p[0], dy = p[1] + 10, c = Math.cos(lean), sn = Math.sin(lean); return f0([dx * c - dy * sn + 1.6 * Math.sign(lean), dx * sn + dy * c - 10]); };
    const f = f0;
    const A = ARMS[pz], L = LEGS[pz];
    const skin = o.skin || 'fill', cl = o.cloth === undefined ? C_STRIPES : o.cloth;

    /* sash ends fly out behind, then the legs */
    [[-1, 0], [1, 1.2]].forEach(([sd, k]) => enamel(h, [[sd * 5, -9], [sd * 9, -5], [sd * 12.4, 4 * k], [sd * 12, 10 * k], [sd * 9.4, 8 * k], [sd * 8, 0], [sd * 5, -4]].map(f), { tone: 'accent', cloth: C_STRIPES, ang: 0, step: 1.4 * s, w: 1 }));
    [0, 3].forEach(k => {
      enamel(h, T(f, s, [[L[k][0], L[k][1], 2.8], [L[k + 1][0], L[k + 1][1], 2.2], [L[k + 2][0], L[k + 2][1], 1.6]]), { tone: skin, sharp: true, w: 1.1 });
      const ft = L[k + 2];
      enamel(h, [[ft[0] - 1.6, ft[1] - .6], [ft[0] + 3.4, ft[1]], [ft[0] + 5, ft[1] + 1.6], [ft[0] - 1.8, ft[1] + 2]].map(f), { tone: skin, w: 1 });
      for (let q = 0; q < 4; q++) dot(h, f([ft[0] - 1.2 + q * .9, ft[1] - 1.4]), .45 * s, 'accent');
    });
    /* dhoti: flared to the knee, with a fan of pleats hanging in front */
    enamel(h, [[-6.2, -12], [7.2, -12], [10.6, 0], [11.6, 10], [4, 12.6], [.6, 6], [-2.4, 12.6], [-10, 10.6], [-9.6, 0]].map(f), { tone: other(skin), cloth: cl, step: 2.6 * s, beads: 1 });
    enamel(h, [[-.4, -10], [3.4, -10], [5.2, 15], [1.6, 17.4], [-2, 15]].map(f), { tone: skin === 'fill' ? 'accent' : 'fill', cloth: C_STRIPES, ang: 0, step: 1.6 * s, w: 1.1 });
    /* torso and back arm */
    limb(h, up, s, A.slice(0, 3), 1.9, 1.3, skin);
    enamel(h, [[-2, -26.6], [-6, -25.8], [-7.6, -23.4], [-6.6, -18.6], [-4.6, -14], [-5.4, -11], [6.6, -11], [6, -14], [8, -18.6], [8.8, -23.4], [7, -25.8], [3.4, -26.6]].map(up), { tone: skin, w: 1.3 });
    enamel(h, [[-5.6, -13.6], [6.8, -13.6], [7, -10.4], [-5.8, -10.4]].map(up), { tone: 'accent', sharp: true, beads: 0, w: 1 });
    /* necklaces: two strands of beads */
    [3, 6].forEach((dp, k) => { for (let i = 0; i <= 8; i++) { const t = i / 8; dot(h, up([-4.4 + t * 10.4, -25.4 + Math.sin(t * Math.PI) * dp]), .55 * s, k ? 'accent' : 'line'); } });
    enamel(h, [[-.8, -30.2], [3.2, -30], [3.4, -26], [-.8, -26]].map(up), { tone: skin, sharp: true, w: 1 });
    enamel(h, HEAD.map(up), { tone: skin, w: 1.3, k: 4 });
    /* hair falling behind, then the crown with its beads */
    enamel(h, [[-4.6, -42.6], [-7, -38], [-9, -30], [-10.4, -22], [-7.6, -22.6], [-5, -30], [-4, -35]].map(up), { tone: 'none', w: 1 });
    solid(h, [[-4.6, -42.6], [-7, -38], [-9, -30], [-10.4, -22], [-7.6, -22.6], [-5, -30], [-4, -35]].map(up));
    enamel(h, CROWN.map(up), { tone: other(skin), cloth: C_CHEV, ang: 0, step: 2 * s, beads: 1, w: 1.3 });
    if (o.plume !== false) {
      const tip = up([-4, -63]), base = up([-.6, -58]);
      enamel(h, [base, [base[0] - 1.6 * s, base[1] - 2 * s], tip, tip, [base[0] + 1.4 * s, base[1] - 3.6 * s]], { tone: 'accent', w: .9 });
      dot(h, up([-3.2, -61.2]), .9 * s, 'line');
    }
    odiaEye(h, up, [4.2, -37.2], 6.6, 1.8, s);
    dot(h, up([7.3, -41.2]), .6 * s, 'accent');
    enamel(h, circ(up([-.4, -32]), 1.3 * s, 10), { tone: 'accent', w: .8 });
    /* front arm, and what it holds */
    limb(h, up, s, A.slice(3, 6), 1.9, 1.3, skin);
    if (pz === 1) {
      const a = up([-2, -32.6]), b = up([22, -30.4]);
      h.curve([a, b], { passes: 1, w: 2.2, role: 'line' });
      h.curve([a, b], { passes: 1, w: 1, role: 'accent' });
    }
    if (pz === 2) {
      enamel(h, [[-6, -13], [-4, -17.6], [10, -17.6], [12, -13], [10, -8.4], [-4, -8.4]].map(up), { tone: 'accent', cloth: C_STRIPES, ang: 90, step: 2.2 * s, w: 1.2 });
      ink(h, [[-5.6, -13], [11.6, -13]].map(up), false, .6);
    }
    if (pz === 4) {
      const c = up([13.2, -32.4]);
      for (let i = 0; i < 5; i++) {
        const t = -Math.PI / 2 + (i - 2) * .45, tp = [c[0] + Math.cos(t) * 5 * s, c[1] + Math.sin(t) * 5 * s];
        enamel(h, [c, [c[0] + Math.cos(t - .3) * 3 * s, c[1] + Math.sin(t - .3) * 3 * s], tp, tp, [c[0] + Math.cos(t + .3) * 3 * s, c[1] + Math.sin(t + .3) * 3 * s]], { tone: i % 2 ? 'accent' : 'fill', w: .8 });
      }
    }
    return { hand: up(A[5]), back: up(A[2]) };
  }
  const solid = (h, pts) => h.push(h._curveD(pts, true, .4), { role: 'line', fill: 'line', w: .2 });

  def('pFigure', 'Figures', 'Dancer', [
    O('pose', 'Pose', POSES, 0), O('cloth', 'Dhoti pattern', CLOTHS, 1), O('skin', 'Body pigment', ['yellow', 'white'], 0),
    B('plume', 'Peacock plume', true), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 6, y: 3, w: 88, h: 94 }, (hh, cx, cy, s) =>
      figure(hh, cx, cy, s, p.pose, { cloth: p.cloth, skin: p.skin ? 'accent' : 'fill', plume: !!p.plume, dir: p.dir ? -1 : 1 }));
  });

  def('pMusicians', 'Figures', 'Musicians', [
    N('people', 'People', 2, 6, 3), O('cloth', 'Dhoti pattern', CLOTHS, 1), B('ground', 'Ground band', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const n = Math.max(1, p.people), cell = W / n, s = Math.min(.9, cell / 34);
    const order = [1, 0, 2, 4, 3, 0];
    for (let i = 0; i < n; i++) figure(hh, cell * (i + .5), 52, s, order[i % order.length], { cloth: p.cloth, skin: i % 2 ? 'accent' : 'fill', dir: i < n / 2 ? 1 : -1 });
    if (p.ground) strip(hh, 0, 52 + 36 * s, W, Math.max(3, 5 * s), 2, Math.round(W / 5), (u, v) => [u, v]);
  }));

  /* RASA — the ring dance: figures round a circle, every one of
     them facing along it, a lotus at the centre. */
  def('pRingDance', 'Compositions', 'Ring dance', [
    N('people', 'Dancers', 4, 12, 8), O('cloth', 'Dhoti pattern', CLOTHS, 1), B('lotus', 'Lotus at the centre', true),
  ], (h, p) => {
    const n = Math.max(3, p.people), R = 30, s = Math.min(.42, 2 * Math.PI * R / n / 30);
    if (p.lotus) lotus(h, 50, 50, 12, 1, 8, 'accent');
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      const cx = 50 + Math.cos(t) * R, cy = 50 + Math.sin(t) * R;
      const f = place(cx, cy, 1, 1, t + Math.PI / 2);
      /* each dancer is drawn upright in its own frame, then turned so
         its feet point at the centre */
      const probe = (hh) => figure(hh, 0, 0, s, i % 2 ? 0 : 1, { cloth: p.cloth, skin: i % 2 ? 'accent' : 'fill', plume: false });
      turned(h, f, probe);
    }
  });

  /* draw into a scratch hand and move the paths through `f` */
  function turned(h, f, draw) {
    const probe = new window.SCRAWL.Hand(h.seed ^ 0x6a09e667, { rough: h.rough, bow: h.bow, passes: h.passes, detail: h.detail });
    draw(probe);
    const n2 = window.SCRAWL.n2, re = /-?\d+(?:\.\d+)?/g;
    const map = d => {
      const v = (d.match(re) || []).map(parseFloat), out = [];
      for (let i = 0; i + 1 < v.length; i += 2) { const q = f([v[i], v[i + 1]]); out.push(n2(q[0]), n2(q[1])); }
      let i = 0;
      return d.replace(re, () => out[i++]);
    };
    probe.strokes.forEach(st => { st.d = map(st.d); st.clip = st.clip ? map(st.clip) : h._clip; h.strokes.push(st); });
  }

  /* ============================================================
     ANIMALS
     ============================================================ */
  const BEASTS = ['lion', 'elephant', 'horse', 'deer', 'cow'];

  function leg(h, f, s, a, b, c, r0, r1, tone) {
    enamel(h, T(f, s, [[a[0], a[1], r0], [b[0], b[1], (r0 + r1) / 2], [c[0], c[1], r1]]), { tone, sharp: true, w: 1.1 });
  }

  function beast(h, cx, cy, s, kind, o) {
    o = o || {};
    const k = ((kind % BEASTS.length) + BEASTS.length) % BEASTS.length;
    const f = place(cx, cy, s, o.dir || 1);
    const tone = o.tone || 'fill', cl = o.cloth === undefined ? C_BUTIS : o.cloth;

    if (k === 0) {
      /* the Konark lion: rampant, one forepaw raised, the mane a
         ruff of flame-shaped locks and the tail curled up over its back */
      leg(h, f, s, [-10, 4], [-14, 14], [-11, 24], 3.2, 2.2, tone);
      leg(h, f, s, [-4, 5], [-2, 15], [-4, 24], 3, 2.1, other(tone));
      enamel(h, T(f, s, [[-16, -2, 1.6], [-24, -8, 1.4], [-24, -20, 1.2], [-18, -24, 1.4]]), { tone, sharp: true, w: 1 });
      enamel(h, circ(f([-17.4, -25]), 3 * s, 10), { tone: other(tone), cloth: C_DOTS, step: 1.2 * s, w: 1 });
      enamel(h, [[-16, -2], [-6, -8], [6, -12], [12, -6], [10, 4], [2, 8], [-12, 7]].map(f), { tone, cloth: C_PLAIN, beads: 1 });
      leg(h, f, s, [8, 0], [14, 8], [12, 20], 2.8, 2, tone);
      leg(h, f, s, [10, -4], [19, -6], [23, -14], 2.8, 2, other(tone));
      for (let i = 0; i < 10; i++) {
        const t = -Math.PI * .95 + (i / 9) * Math.PI * 1.25, c = [15, -15];
        const b0 = [c[0] + Math.cos(t - .22) * 6, c[1] + Math.sin(t - .22) * 6], b1 = [c[0] + Math.cos(t + .22) * 6, c[1] + Math.sin(t + .22) * 6];
        const tp = [c[0] + Math.cos(t + .12) * 12.4, c[1] + Math.sin(t + .12) * 12.4], mo = [c[0] + Math.cos(t - .12) * 10, c[1] + Math.sin(t - .12) * 10];
        enamel(h, [b0, mo, tp, tp, b1].map(f), { tone: i % 2 ? other(tone) : tone, w: .9 });
      }
      enamel(h, [[12, -20], [18, -22], [23, -19], [25, -14], [24, -9], [19, -8], [13, -10]].map(f), { tone, w: 1.3 });
      ink(h, [[25, -12], [22.6, -11], [24.6, -9.4]].map(f), false, 1);
      odiaEye(h, f, [19.6, -16.6], 4.4, 1.3, s * .8);
      return;
    }
    if (k === 1) {
      /* elephant in procession: a jewelled caparison, a bell, a howdah
         cloth with bead edges */
      [[-15, 1], [-7, 3]].forEach(q => leg(h, f, s, q, [q[0], 14], [q[0] - .4, 25], 3.8, 3.6, other(tone)));
      enamel(h, [[-20, -10], [-8, -15.6], [8, -15.6], [16, -11], [18.6, 2], [14, 10], [-16, 10], [-22.4, 2]].map(f), { tone, beads: 0 });
      [[6, 3], [13, 1]].forEach(q => leg(h, f, s, q, [q[0], 14], [q[0] + .4, 25], 3.8, 3.6, tone));
      [-15.4, -7.4, 6.4, 13.4].forEach(x => { for (let i = 0; i < 3; i++) dot(h, f([x - 1.8 + i * 1.8, 23]), .6 * s, 'accent'); });
      enamel(h, [[-13, -15.4], [9, -15.4], [11, 6], [-15, 6]].map(f), { tone: 'accent', cloth: cl, step: 3.4 * s, beads: 1, gap: 1.6 * s, sharp: true, w: 1.3 });
      for (let i = 0; i <= 8; i++) { const x = -15 + i * 3.25; seg(h, f([x, 6]), f([x, 9]), .8); dot(h, f([x, 9.6]), .8 * s, 'fill'); }
      enamel(h, T(f, s, [[28.4, 1, 3.6], [30, 9, 3], [28.6, 17, 2.2], [24.6, 21, 1.6], [22.6, 18.6, 1.2]]), { tone, cloth: C_STRIPES, ang: 0, step: 1.6 * s, sharp: true, w: 1.1 });
      enamel(h, [[14, -12], [20, -18.4], [28, -16.6], [31.6, -8], [30.4, 2], [26.6, 6.4], [21.6, 5.6], [16.6, 4]].map(f), { tone });
      enamel(h, [[18, -19], [24, -21], [27, -17], [22, -14]].map(f), { tone: 'accent', beads: 0, w: 1 });
      enamel(h, [[27, 5.4], [27, 5.4], [33.6, 8.6], [34.2, 6.6]].map(f), { tone: 'accent', w: 1 });
      enamel(h, [[15.4, -11], [21, -9.6], [22.2, -1], [18, 6], [14, 2.4]].map(f), { tone: other(tone), cloth: C_DOTS, step: 1.6 * s, beads: 1 });
      enamel(h, circ(f([16, 11]), 2.2 * s, 10), { tone: 'accent', w: 1 }); seg(h, f([16, 6]), f([16, 9]), .8);
      odiaEye(h, f, [26, -9.6], 4.4, 1.2, s * .8);
      return;
    }
    if (k === 2) {
      /* horse, prancing: forelegs lifted */
      leg(h, f, s, [-12, 3], [-14, 13], [-12, 24], 2.6, 1.6, other(tone));
      leg(h, f, s, [-7, 4], [-6, 14], [-8, 24], 2.6, 1.6, tone);
      enamel(h, T(f, s, [[-17, -3, 2], [-24, 2, 1.8], [-25, 12, 1.4], [-22, 17, 1]]), { tone: other(tone), cloth: C_STRIPES, ang: 20, step: 1.2 * s, sharp: true, w: 1 });
      enamel(h, [[-17, -6], [-2, -9.6], [12, -9], [17, -2], [12, 6.4], [-14, 6.4], [-19.6, 0]].map(f), { tone });
      leg(h, f, s, [9, 3], [14, 12], [16, 22], 2.6, 1.6, other(tone));
      leg(h, f, s, [12, 1], [19, 9], [23, 16], 2.6, 1.6, tone);
      enamel(h, [[-8, -9.4], [6, -9.4], [7, 4], [-9, 4]].map(f), { tone: 'accent', cloth: cl, step: 2.6 * s, beads: 1, sharp: true, w: 1.2 });
      enamel(h, [[10, -8], [15.6, -20], [21, -27.4], [27.4, -24.6], [30.6, -18.6], [29.6, -16], [24, -16.6], [19.4, -6]].map(f), { tone });
      for (let i = 0; i < 7; i++) { const t = i / 6, b = [11 + t * 10, -8 - t * 19]; enamel(h, [b, b, [b[0] - 4.4, b[1] + .6], [b[0] - 1.6, b[1] + 3]].map(f), { tone: other(tone), w: .8 }); }
      enamel(h, [[21.6, -27.6], [21.6, -27.6], [22.6, -32], [24.4, -27]].map(f), { tone, w: .9 });
      odiaEye(h, f, [24, -22], 3.8, 1.1, s * .75);
      return;
    }
    if (k === 3) {
      [[-11, 2, -12, 24], [-7, 3, -5, 24], [8, 2, 9, 24], [11, 1, 14, 23]].forEach((q, i) => leg(h, f, s, [q[0], q[1]], [(q[0] + q[2]) / 2, 13], [q[2], q[3]], 1.9, 1.1, i % 2 ? tone : other(tone)));
      enamel(h, [[-16, -4], [-2, -7.6], [10, -7], [15, -1], [10, 5], [-12, 5], [-17, 0]].map(f), { tone, cloth: C_DOTS, step: 2.4 * s, beads: 1 });
      enamel(h, [[9, -6.6], [13, -16], [17, -23.4], [23.6, -22], [26.4, -17.6], [21, -16.6], [16.6, -6]].map(f), { tone });
      [[1, 1], [-1, .6]].forEach(([sd, sc]) => {
        const b = [18.4 + sd * .6, -23.6];
        ink(h, [b, [b[0] - 2 * sc, b[1] - 6], [b[0] - 1 * sc, b[1] - 12], [b[0] + 2 * sc, b[1] - 16]].map(f), false, 1.4);
        ink(h, [[b[0] - 1.6 * sc, b[1] - 6], [b[0] - 5 * sc, b[1] - 8.6]].map(f), false, 1.1);
        ink(h, [[b[0] - 1 * sc, b[1] - 11], [b[0] + 3 * sc, b[1] - 12.6]].map(f), false, 1.1);
      });
      odiaEye(h, f, [20.6, -19.6], 3.4, 1, s * .7);
      return;
    }
    [[-13, 3, -13.6, 23], [-8, 4, -7, 23], [8, 3, 9, 23], [12, 2, 14, 23]].forEach((q, i) => leg(h, f, s, [q[0], q[1]], [(q[0] + q[2]) / 2, 13], [q[2], q[3]], 2.4, 1.6, i % 2 ? tone : other(tone)));
    ink(h, [[-19, -2], [-22, 8], [-21, 16]].map(f), false, 1.2); dot(h, f([-21, 17]), 1.3 * s, 'line');
    enamel(h, [[-19, -5], [-6, -8.6], [2, -12.6], [8, -9], [15, -5], [16, 3], [12, 7], [-15, 7], [-20, 1]].map(f), { tone });
    enamel(h, [[-12, -8], [6, -8], [7, 4], [-13, 4]].map(f), { tone: 'accent', cloth: cl, step: 3 * s, beads: 1, sharp: true, w: 1.2 });
    enamel(h, [[13, -6], [19, -12], [25, -11], [28, -4], [25, -1.6], [20, -1], [16, 3]].map(f), { tone });
    [[1, 1], [-1, .7]].forEach(([sd, sc]) => ink(h, [[19 + sd, -11.6], [17.6 + sd, -16.6 * sc], [20.6 + sd * 1.4, -19 * sc]].map(f), false, 1.5));
    odiaEye(h, f, [22, -7.6], 3.4, 1, s * .7);
    enamel(h, circ(f([13, 8.6]), 1.6 * s, 10), { tone: 'accent', w: .9 });
  }

  def('pBeast', 'Animals', 'Animal', [
    O('kind', 'Kind', BEASTS, 0), O('cloth', 'Caparison', CLOTHS, 3), O('tone', 'Body pigment', ['yellow', 'white'], 0), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 6, w: 92, h: 88 }, (hh, cx, cy, s) => beast(hh, cx, cy, s, p.kind, { cloth: p.cloth, tone: p.tone ? 'accent' : 'fill', dir: p.dir ? -1 : 1 }));
  });

  def('pPair', 'Animals', 'Facing pair', [
    O('kind', 'Kind', BEASTS, 0), O('cloth', 'Caparison', CLOTHS, 3), B('tree', 'Tree between', true),
  ], (h, p) => {
    h.fitDraw({ x: 2, y: 8, w: 96, h: 84 }, (hh, cx, cy, s) => {
      if (p.tree) tree(hh, cx, cy - 8 * s, s * 1.05, 5, {});
      beast(hh, cx - 38 * s, cy + 4 * s, s * .78, p.kind, { cloth: p.cloth, tone: 'fill', dir: 1 });
      beast(hh, cx + 38 * s, cy + 4 * s, s * .78, p.kind, { cloth: p.cloth, tone: 'accent', dir: -1 });
    });
  });

  /* ============================================================
     BIRDS AND FISH
     ============================================================ */
  const BIRDS = ['peacock', 'parrot', 'swan', 'crane'];
  function bird(h, cx, cy, s, kind, o) {
    o = o || {};
    const f = place(cx, cy, s, o.dir || 1);
    const k = ((kind % BIRDS.length) + BIRDS.length) % BIRDS.length;
    const tone = o.tone || 'fill';
    const feet = (y0, y1) => [-1, 3].forEach(x => { seg(h, f([x, y0]), f([x, y1]), 1); ink(h, [[x - 2, y1 + .8], [x, y1], [x + 2.4, y1 + .6]].map(f), false, .9); });
    if (k === 0) {
      /* the tail hangs in a long curve of feathers, each with its eye */
      const n = o.feathers || 7;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const a = Math.PI * .62 + t * .7, L = 30 + t * 10;
        const base = [-6, 6], tip = [base[0] + Math.cos(a) * L, base[1] + Math.sin(a) * L * .7];
        const nx = -Math.sin(a) * 2.4, ny = Math.cos(a) * 2.4;
        enamel(h, [base, [(base[0] + tip[0]) / 2 + nx, (base[1] + tip[1]) / 2 + ny], tip, tip, [(base[0] + tip[0]) / 2 - nx, (base[1] + tip[1]) / 2 - ny]].map(f), { tone: i % 2 ? tone : other(tone), w: .9 });
        enamel(h, circ(f(tip), 2.6 * s, 10, 2.1 * s), { tone: 'accent', w: .9 });
        dot(h, f(tip), 1.1 * s, 'line');
      }
      feet(8, 20);
      enamel(h, T(f, s, [[3, -6, 3.4], [7.6, -14, 2.4], [8.6, -21, 2]]), { tone, cloth: C_SCALES, step: 1.4 * s, ang: 0, sharp: true, w: 1.1 });
      enamel(h, [[10, -4], [8, 4], [2, 10], [-8, 10], [-11, 4], [-6, -3], [2, -7]].map(f), { tone, cloth: C_SCALES, step: 2 * s, ang: 0, beads: 1 });
      enamel(h, [[-6, -1], [3, -3], [5, 3], [-2, 8], [-9, 5]].map(f), { tone: other(tone), cloth: C_STRIPES, step: 1.6 * s, ang: -30, w: 1 });
      enamel(h, circ(f([9.6, -23.6]), 3.4 * s, 12), { tone, w: 1.2 });
      enamel(h, [[12.6, -24.4], [12.6, -24.4], [16.4, -23], [16.4, -23], [12.4, -22]].map(f), { tone: 'accent', w: .9 });
      for (let i = -1; i <= 1; i++) { const tip = [9.6 + i * 2.2, -32.6]; seg(h, f([9.6, -26.6]), f(tip), .7); dot(h, f(tip), 1 * s, 'accent'); }
      odiaEye(h, f, [9.6, -24], 3, 1, s * .6);
      return;
    }
    if (k === 1) {
      enamel(h, [[-3.6, 10], [-9, 30], [-5.4, 31], [.4, 12]].map(f), { tone: other(tone), cloth: C_STRIPES, step: 1.2 * s, ang: 0, w: 1 });
      ink(h, [[-16, 16.6], [0, 15], [16, 16]].map(f), false, 1.6);
      feet(12, 15.6);
      enamel(h, [[4, -10], [8, -3], [7, 5], [2.6, 11.6], [-3.4, 13], [-5.6, 8], [-4, 0], [-1, -7]].map(f), { tone, beads: 1 });
      enamel(h, [[-1.6, -4], [4.4, 0], [3, 8], [-3, 13.4], [-4.4, 4]].map(f), { tone: other(tone), cloth: C_SCALES, step: 1.6 * s, w: 1 });
      enamel(h, circ(f([4.6, -13]), 5.4 * s, 14), { tone, w: 1.2 });
      enamel(h, [[9.4, -15.2], [9.4, -15.2], [13.6, -13.6], [13.6, -13.6], [12.6, -9.2], [10.6, -11.2]].map(f), { tone: 'accent', w: 1 });
      ink(h, h.arcPts(...f([4.6, -12.4]), 5 * s, 4 * s, .25, 1.6, 8), false, 1.4);
      odiaEye(h, f, [5, -14.4], 3.6, 1.1, s * .7);
      return;
    }
    if (k === 2) {
      /* hansa: the swan, with a lotus in its beak */
      for (let i = 0; i < 2; i++) { const pts = []; for (let q = 0; q <= 12; q++) pts.push([-20 + q * 3.4, 11 + i * 3.4 + Math.sin(q * 1.3 + i) * 1]); ink(h, pts.map(f), false, 1, 'accent'); }
      enamel(h, [[-14, 0], [-14, 0], [-22, -10], [-12, -5], [-4, -5], [8, -4], [12, 2], [6, 8], [-10, 8]].map(f), { tone, beads: 1 });
      enamel(h, [[-12, 0], [0, -4], [5, 1], [-6, 5]].map(f), { tone: other(tone), cloth: C_SCALES, step: 1.6 * s, w: 1 });
      enamel(h, T(f, s, [[7, -3, 2.4], [11, -12, 1.8], [8, -20, 2], [10, -24, 2.6]]), { tone, sharp: true, w: 1.1 });
      enamel(h, [[12.6, -25], [12.6, -25], [17.6, -23.4], [17.6, -23.4], [12.6, -22.4]].map(f), { tone: 'accent', w: .9 });
      odiaEye(h, f, [10.2, -24.4], 2.8, .9, s * .55);
      return;
    }
    feet(4, 28);
    enamel(h, [[-6, 0], [-6, 0], [-18, 6], [-12, 8], [-4, 7]].map(f), { tone: other(tone), cloth: C_STRIPES, step: 1.2 * s, w: 1 });
    enamel(h, T(f, s, [[6, -2, 2.4], [9, -10, 1.8], [7, -18, 1.6], [9, -24, 1.8]]), { tone, sharp: true, w: 1.1 });
    enamel(h, circ(f([0, 2]), 11 * s, 18, 7 * s), { tone, beads: 1 });
    enamel(h, [[-6, -1], [6, -2], [4, 4], [-8, 6]].map(f), { tone: other(tone), cloth: C_SCALES, step: 1.6 * s, w: 1 });
    enamel(h, circ(f([10, -25.6]), 3.4 * s, 12), { tone, w: 1.1 });
    enamel(h, [[13, -26.6], [13, -26.6], [23, -24.6], [23, -24.6], [13, -24]].map(f), { tone: 'accent', sharp: true, w: .9 });
    odiaEye(h, f, [10.4, -26], 2.6, .9, s * .5);
  }
  def('pBird', 'Birds', 'Bird', [
    O('kind', 'Kind', BIRDS, 0), O('tone', 'Body pigment', ['yellow', 'white'], 0), N('feathers', 'Tail feathers', 4, 12, 7), O('dir', 'Facing', ['right', 'left'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 5, y: 5, w: 90, h: 90 }, (hh, cx, cy, s) => bird(hh, cx, cy, s, p.kind, { tone: p.tone ? 'accent' : 'fill', feathers: p.feathers, dir: p.dir ? -1 : 1 }));
  });

  function fish(h, f, s, tone) {
    const body = [[30, 0], [30, 0], [22, -9], [8, -13], [-8, -11], [-20, -5], [-25, 0], [-20, 5], [-8, 11], [8, 13], [22, 9]];
    enamel(h, [[-23, 0], [-23, 0], [-36, -13], [-32, 0], [-36, 13]].map(f), { tone: other(tone), cloth: C_STRIPES, ang: 0, step: 1.3 * s, w: 1 });
    enamel(h, [[4, -12.4], [4, -12.4], [-4, -19], [-10, -10.6]].map(f), { tone: other(tone), w: 1 });
    enamel(h, body.map(f), { tone, cloth: C_SCALES, step: 3 * s, ang: 0, beads: 1 });
    ink(h, [[15, -10.6], [12.4, 0], [15, 10.6]].map(f), false, 1.2);
    enamel(h, circ(f([21, -2]), 2.6 * s, 10), { tone: 'accent', w: 1 }); dot(h, f([21.4, -2.2]), 1.2 * s, 'line');
  }
  def('pFish', 'Animals', 'Fish', [
    O('lay', 'Arrangement', ['single', 'pair', 'three'], 0), O('tone', 'Body pigment', ['yellow', 'white'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 6, w: 92, h: 88 }, (hh, cx, cy, s) => {
      const t = p.tone ? 'accent' : 'fill';
      if (p.lay === 1) { fish(hh, place(cx, cy - 15 * s, s, 1), s, t); fish(hh, place(cx, cy + 15 * s, s, -1), s, other(t)); }
      else if (p.lay === 2) [-30, 0, 30].forEach((y, i) => fish(hh, place(cx + (i % 2 ? 8 : -8) * s, cy + y * s, s * .8, i % 2 ? -1 : 1), s * .8, i % 2 ? other(t) : t));
      else fish(hh, place(cx, cy, s, 1), s, t);
    });
  });

  /* ============================================================
     NATURE
     ============================================================ */
  /* a Pattachitra tree: a trunk and a rounded canopy of lobes,
     each lobe packed with its own leaves */
  function tree(h, cx, cy, s, lobes, o) {
    o = o || {};
    const f = place(cx, cy, s, 1);
    const n = Math.max(3, lobes | 0);
    enamel(h, T(f, s, [[0, 38, 4.4], [.6, 20, 3.4], [-.6, 4, 3], [0, -6, 2.6]]), { tone: 'accent', cloth: C_STRIPES, ang: 0, step: 1.6 * s, sharp: true, w: 1.2 });
    for (let i = 0; i < n; i++) {
      const t = -Math.PI + (i + .5) / n * Math.PI;
      const c = [Math.cos(t) * 20, -12 + Math.sin(t) * 22];
      enamel(h, T(f, s, [[0, -2, 1.6], [c[0] * .5, -6 + c[1] * .4, 1.2], [c[0], c[1], .8]]), { tone: 'accent', sharp: true, w: .9 });
      const r = 9;
      enamel(h, circ(f(c), r * s, 18), { tone: i % 2 ? 'fill' : 'none', beads: 1, w: 1.2 });
      const k = 7;
      for (let q = 0; q < k; q++) {
        const a = (q / k) * TAU, tip = [c[0] + Math.cos(a) * r * .8, c[1] + Math.sin(a) * r * .8];
        const b0 = [c[0] + Math.cos(a - .5) * r * .2, c[1] + Math.sin(a - .5) * r * .2], b1 = [c[0] + Math.cos(a + .5) * r * .2, c[1] + Math.sin(a + .5) * r * .2];
        enamel(h, [c, b0, tip, tip, b1].map(f), { tone: i % 2 ? 'accent' : 'fill', w: .7 });
      }
      if (o.fruit) dot(h, f(c), 1.6 * s, 'accent');
    }
  }
  def('pTree', 'Nature', 'Tree', [N('lobes', 'Canopy lobes', 3, 9, 5), B('fruit', 'Fruit', true), B('birds', 'Birds', false)], (h, p) => {
    h.fitDraw({ x: 6, y: 4, w: 88, h: 92 }, (hh, cx, cy, s) => {
      tree(hh, cx, cy, s, p.lobes, p);
      if (p.birds) { bird(hh, cx - 16 * s, cy + 30 * s, s * .4, 1, { dir: 1 }); bird(hh, cx + 16 * s, cy + 30 * s, s * .4, 1, { dir: -1, tone: 'accent' }); }
    });
  });

  function lotus(h, cx, cy, R, rings, petals, tone) {
    for (let r = rings; r >= 1; r--) {
      const rr = R * (.45 + .55 * r / rings), n = petals + (r - 1) * 4, w = Math.PI / n;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU + (r % 2 ? w : 0);
        const P = (a, k) => [cx + Math.cos(t + a) * rr * k, cy + Math.sin(t + a) * rr * k];
        enamel(h, [P(-w * .9, .4), P(-w * .7, .8), P(0, 1), P(0, 1), P(w * .7, .8), P(w * .9, .4)], { tone: (r + i) % 2 ? tone : other(tone), w: .9 });
      }
    }
    enamel(h, circ([cx, cy], R * .38, 18), { tone: 'accent', beads: 1, beadTone: 'line', w: 1.1 });
    dot(h, [cx, cy], R * .1, 'line');
  }
  def('pLotus', 'Nature', 'Lotus', [N('rings', 'Rings', 1, 4, 2), N('petals', 'Petals', 6, 16, 8), O('tone', 'Pigment', ['yellow', 'white'], 0)], (h, p) => {
    lotus(h, 50, 50, 46, Math.max(1, p.rings), Math.max(6, p.petals), p.tone ? 'accent' : 'fill');
  });

  /* ============================================================
     THE WHEEL — Konark's sun-temple wheel: a beaded rim, eight
     broad spokes and eight fine ones, medallions on the broad
     spokes, a lotus hub.
     ============================================================ */
  def('pWheel', 'Compositions', 'Chariot wheel', [
    N('spokes', 'Broad spokes', 4, 12, 8), B('fine', 'Fine spokes between', true), B('medallions', 'Medallions', true),
  ], (h, p) => {
    const c = [50, 50], n = Math.max(3, p.spokes);
    enamel(h, circ(c, 47, 60), { tone: 'fill', beads: 1, w: 1.6 });
    enamel(h, circ(c, 40, 60), { tone: 'accent', w: 1.2 });
    enamel(h, circ(c, 36, 60), { tone: 'none', w: 1.2 });
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU, w = .09;
      const P = (r, a) => [c[0] + Math.cos(t + a) * r, c[1] + Math.sin(t + a) * r];
      enamel(h, [P(10, -w * 2.2), P(36, -w * .8), P(36, w * .8), P(10, w * 2.2)], { tone: 'fill', cloth: C_CHEV, step: 2, ang: t / D, beads: 0, sharp: true, w: 1.2 });
      if (p.medallions) { enamel(h, circ(P(24, 0), 4.2, 14), { tone: 'accent', beads: 1, beadTone: 'fill', w: 1.1 }); dot(h, P(24, 0), 1.2, 'line'); }
      if (p.fine) { const q = t + Math.PI / n; ink(h, [[c[0] + Math.cos(q) * 10, c[1] + Math.sin(q) * 10], [c[0] + Math.cos(q) * 36, c[1] + Math.sin(q) * 36]], false, 1.2); }
    }
    lotus(h, 50, 50, 11, 1, 8, 'fill');
  });

  /* ============================================================
     BORDERS — nested bands, each ruled and beaded
     ============================================================ */
  const UNITS = ['lata', 'petals', 'beads', 'triangles', 'waves', 'diamonds', 'lotus chain', 'leaves'];

  function unit(h, Mp, kind, u0, u1, v0, v1, i) {
    const w = u1 - u0, hgt = v1 - v0, um = (u0 + u1) / 2, vm = (v0 + v1) / 2, s = Math.min(w, hgt) / 10;
    const tn = i % 2 ? 'fill' : 'accent';
    switch (((kind % UNITS.length) + UNITS.length) % UNITS.length) {
      case 0: {
        /* lata: the stem swings through the unit; a tendril curls off
           the crest, a leaf drops off the trough */
        creeper(h, Mp, u0, w, vm, hgt * .16, i, s);
        break;
      }
      case 1: {
        const P = (a, b) => Mp(um + a * w, v1 - b * hgt);
        enamel(h, [P(-.36, .02), P(-.4, .5), P(0, .96), P(0, .96), P(.4, .5), P(.36, .02)], { tone: tn, w: .9 });
        enamel(h, [P(-.16, .04), P(-.18, .4), P(0, .7), P(0, .7), P(.18, .4), P(.16, .04)], { tone: i % 2 ? 'accent' : 'fill', w: .7 });
        break;
      }
      case 2: dot(h, Mp(um, vm), Math.min(w, hgt) * .3, i % 2 ? 'accent' : 'fill'); ink(h, circ(Mp(um, vm), Math.min(w, hgt) * .3, 10), true, .7); break;
      case 3: h.curve([Mp(u0, v1), Mp(um, v0), Mp(u1, v1)], { closed: true, sharp: true, passes: 1, role: tn, fill: tn, w: .3 }); ink(h, [Mp(u0, v1), Mp(um, v0), Mp(u1, v1)], false, .9); break;
      case 4: {
        const pts = [];
        for (let q = 0; q <= 10; q++) { const t = q / 10; pts.push(Mp(u0 + t * w, vm + Math.sin(t * TAU) * hgt * .3)); }
        ink(h, pts, false, 1.2); dot(h, Mp(u0 + w * .25, vm + hgt * .3), s * .8, 'accent'); dot(h, Mp(u0 + w * .75, vm - hgt * .3), s * .8, 'fill');
        break;
      }
      case 5: {
        const pts = [Mp(um, v0), Mp(um + w * .45, vm), Mp(um, v1), Mp(um - w * .45, vm)];
        enamel(h, pts, { tone: tn, sharp: true, w: .9 }); dot(h, Mp(um, vm), s * .8, 'line');
        break;
      }
      case 6: {
        const P = (t, r) => Mp(um + Math.cos(t) * r * w * .5, vm + Math.sin(t) * r * hgt * .5);
        for (let q = 0; q < 8; q++) { const t = q / 8 * TAU; enamel(h, [P(t - .35, .35), P(t, .95), P(t, .95), P(t + .35, .35)], { tone: q % 2 ? 'fill' : 'accent', w: .6 }); }
        dot(h, Mp(um, vm), s * 1.2, 'line');
        break;
      }
      default: {
        const sd = i % 2 ? 1 : -1;
        const b = Mp(u0, vm), tp = Mp(u1, vm + sd * hgt * .05);
        const m1 = Mp(um, vm - hgt * .42), m2 = Mp(um, vm + hgt * .42);
        enamel(h, [b, b, m1, tp, tp, m2], { tone: tn, w: .8 });
        ink(h, [b, tp], false, .6);
      }
    }
  }

  /* one period of creeper in strip coordinates */
  function creeper(h, Mp, u0, w, vm, amp, i, s, tone) {
    const pts = [];
    for (let q = 0; q <= 10; q++) { const t = q / 10; pts.push(Mp(u0 + t * w, vm - Math.sin(t * TAU) * amp)); }
    ink(h, pts, false, 1.1);
    const crest = [u0 + w * .25, vm - amp], sp = [];
    for (let q = 0; q <= 12; q++) {
      const t = q / 12, a = Math.PI * (1 + t * 1.6), r = amp * 2.2 * (1 - t * .72);
      sp.push(Mp(crest[0] + r + Math.cos(a) * r, crest[1] - amp * .6 + Math.sin(a) * r));
    }
    ink(h, [Mp(crest[0], crest[1])].concat(sp), false, .9);
    const tr = [u0 + w * .75, vm + amp], tp = [tr[0] + w * .16, tr[1] + amp * 2.6];
    const b = Mp(tr[0], tr[1]), e = Mp(tp[0], tp[1]);
    const m = [(b[0] + e[0]) / 2, (b[1] + e[1]) / 2], dx = e[0] - b[0], dy = e[1] - b[1], l = Math.hypot(dx, dy) || 1, k = l * .34;
    enamel(h, [b, b, [m[0] - dy / l * k, m[1] + dx / l * k], e, e, [m[0] + dy / l * k, m[1] - dx / l * k]], { tone: tone || (i % 2 ? 'fill' : 'accent'), w: .8 });
    const fc = sp[sp.length - 1];
    for (let q = 0; q < 5; q++) { const t = q / 5 * TAU; dot(h, [fc[0] + Math.cos(t) * s * 1.1, fc[1] + Math.sin(t) * s * 1.1], s * .7, i % 2 ? 'accent' : 'fill'); }
    dot(h, fc, s * .45, 'line');
  }

  function strip(h, x, y, len, hgt, kind, n, Mp0) {
    const Mp = (u, v) => Mp0(x + u, y + v);
    const r = Math.max(.6, hgt * .12);
    const edge = v => ink(h, [Mp(0, v), Mp(len / 2, v), Mp(len, v)], false, 1.2);
    edge(0); edge(hgt);
    const k = Math.max(1, Math.round(n)), um = len / k;
    for (let i = 0; i < k; i++) unit(h, Mp, kind, i * um, (i + 1) * um, r, hgt - r, i);
  }

  /* a band of beads between two rules — Odia borders nest one of
     these between every pair of broader bands */
  function beadRule(h, x, y, len, hgt, Mp0) {
    const Mp = (u, v) => Mp0(x + u, y + v);
    ink(h, [Mp(0, 0), Mp(len, 0)], false, 1); ink(h, [Mp(0, hgt), Mp(len, hgt)], false, 1);
    const k = Math.max(3, Math.round(len / (hgt * 1.4)));
    for (let i = 0; i < k; i++) dot(h, Mp((i + .5) * len / k, hgt / 2), hgt * .28, 'accent');
  }

  def('pBorder', 'Borders', 'Border band', [
    O('kind', 'Main band', UNITS, 0), N('repeat', 'Repeats', 3, 40, 12), B('beads', 'Bead rules either side', true), N('height', 'Band height', 30, 90, 60),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const H = Math.max(20, Math.min(92, p.height)), b = p.beads ? H * .16 : 0, main = H - 2 * b, y0 = 50 - H / 2;
    const id = (u, v) => [u, v];
    if (b) { beadRule(hh, 1, y0, W - 2, b, id); beadRule(hh, 1, y0 + H - b, W - 2, b, id); }
    strip(hh, 1, y0 + b, W - 2, main, p.kind, p.repeat, id);
  }));

  /* the frame: an outer bead rule, a broad band, an inner bead rule */
  function frame(h, x, y, w, hh, t, kind, n, beads) {
    const b = beads ? t * .22 : 0, m = t - 2 * b;
    /* every ring runs between the four corner squares */
    const sides = (off, thick, fn) => {
      const lx = w - 2 * t, ly = hh - 2 * t;
      fn(lx, thick, (u, v) => [x + t + u, y + off + v]);
      fn(lx, thick, (u, v) => [x + w - t - u, y + hh - off - v]);
      fn(ly, thick, (u, v) => [x + w - off - v, y + t + u]);
      fn(ly, thick, (u, v) => [x + off + v, y + hh - t - u]);
    };
    if (beads) {
      sides(0, b, (len, th, Mp) => beadRule(h, 0, 0, len, th, Mp));
      sides(t - b, b, (len, th, Mp) => beadRule(h, 0, 0, len, th, Mp));
    }
    const ny = Math.max(1, Math.round(n)), nx = Math.max(1, Math.round(n * (w - 2 * t) / Math.max(1, hh - 2 * t)));
    let side = 0;
    sides(b, m, (len, th, Mp) => { strip(h, 0, 0, len, th, kind, side++ < 2 ? nx : ny, Mp); });
    [[x, y], [x + w - t, y], [x, y + hh - t], [x + w - t, y + hh - t]].forEach(c => {
      enamel(h, [c, [c[0] + t, c[1]], [c[0] + t, c[1] + t], [c[0], c[1] + t]], { tone: 'accent', sharp: true, w: 1.2 });
      lotus(h, c[0] + t / 2, c[1] + t / 2, t * .42, 1, 8, 'fill');
    });
  }

  def('pFrame', 'Borders', 'Frame', [
    O('kind', 'Main band', UNITS, 0), N('repeat', 'Repeats per side', 3, 24, 9), N('depth', 'Depth', 5, 18, 10), B('beads', 'Bead rules', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => frame(hh, 1, 1, W - 2, 98, Math.max(4, p.depth), p.kind, p.repeat, !!p.beads)));

  /* the scrolling creeper that fills every inch behind a figure */
  def('pLata', 'Borders', 'Creeper ground', [
    N('dens', 'Scale', 6, 30, 14), B('flowers', 'Flowers', true), O('tone', 'Leaf pigment', ['mixed', 'yellow', 'white'], 0),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const det = hh.detail ?? 1;
    const g = Math.max(p.dens, Math.sqrt(W * 100 / Math.max(16, 110 * det)));
    hh.clipStart(`M0 0L${W} 0L${W} 100L0 100Z`);
    const id = (u, v) => [u, v];
    for (let r = 0, y = g * .45; y < 100 + g; r++, y += g) {
      const off = (r % 2) * g / 2 - g;
      for (let c = 0, x = off; x < W + g; c++, x += g) {
        const tn = p.tone === 1 ? 'fill' : p.tone === 2 ? 'accent' : undefined;
        if (p.flowers) creeper(hh, id, x, g, y, g * .12, r + c, g / 16, tn);
        else {
          const pts = [];
          for (let q = 0; q <= 10; q++) { const t = q / 10; pts.push([x + t * g, y - Math.sin(t * TAU) * g * .12]); }
          ink(hh, pts, false, 1);
          const b = [x + g * .75, y + g * .12], e = [x + g * .9, y + g * .42];
          enamel(hh, [b, b, [x + g * .9, y + g * .2], e, e, [x + g * .74, y + g * .32]], { tone: tn || ((r + c) % 2 ? 'fill' : 'accent'), w: .8 });
        }
      }
    }
    hh.clipEnd();
  }));

  /* the temple doorway that frames a single subject */
  def('pArch', 'Borders', 'Temple arch', [
    O('kind', 'Band', UNITS, 1), N('repeat', 'Repeats', 6, 30, 16), B('pillars', 'Pillars', true),
  ], (h, p) => squeeze(h, p._ar || 1, (hh, W) => {
    const x0 = 4, x1 = W - 4, top = 4, spring = 36, R = (x1 - x0) / 2;
    const ar = [];
    for (let i = 0; i <= 40; i++) {
      const t = Math.PI + (i / 40) * Math.PI;
      /* an ogee: round shoulders pulled up into a point */
      const u = Math.cos(t), v = Math.sin(t);
      ar.push([W / 2 + u * R, spring + v * (spring - top) * (1 - .25 * Math.abs(u)) - (1 - Math.abs(u)) * 6]);
    }
    const inner = ar.map(q => [W / 2 + (q[0] - W / 2) * .82, spring + (q[1] - spring) * .78 + 4]);
    const n = Math.max(3, p.repeat);
    for (let i = 0; i < n; i++) {
      const a = ar[Math.round(i / n * 40)], b = ar[Math.round((i + 1) / n * 40)];
      const c = inner[Math.round((i + 1) / n * 40)], d = inner[Math.round(i / n * 40)];
      const Mp = (u, v) => { const t = u / 10, s = v / 10; const top0 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], bot = [d[0] + (c[0] - d[0]) * t, d[1] + (c[1] - d[1]) * t]; return [top0[0] + (bot[0] - top0[0]) * s, top0[1] + (bot[1] - top0[1]) * s]; };
      unit(hh, Mp, p.kind, 0, 10, 1, 9, i);
    }
    ink(hh, ar, false, 1.4); ink(hh, inner, false, 1.4);
    if (p.pillars) [[x0, x0 + R * .18], [x1 - R * .18, x1]].forEach(([a, b]) => {
      enamel(hh, [[a, spring], [b, spring], [b, 96], [a, 96]], { tone: 'fill', cloth: C_CHEV, ang: 0, step: 3, sharp: true, beads: 1, w: 1.4 });
      enamel(hh, [[a - 2, spring - 3], [b + 2, spring - 3], [b + 2, spring + 2], [a - 2, spring + 2]], { tone: 'accent', sharp: true, w: 1.2 });
      enamel(hh, [[a - 2, 93], [b + 2, 93], [b + 2, 98], [a - 2, 98]], { tone: 'accent', sharp: true, w: 1.2 });
    });
  }));

  ['pBorder', 'pFrame', 'pLata', 'pArch', 'pMusicians'].forEach(k => { G[k].aspect = 'free'; });
  G.pBorder.place = { w: .92, h: .1 };
  G.pFrame.place = { w: .9, h: .9 };
  G.pLata.place = { w: .9, h: .9 };
  G.pArch.place = { w: .7, h: .9 };
  G.pMusicians.place = { w: .9, h: .4 };

  window.SCRAWL.PATTACHITRA = { enamel, cloth, figure, beast, bird, fish, tree, lotus, strip, frame, CLOTHS, UNITS, BEASTS, POSES };
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
