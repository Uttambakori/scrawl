/* ============================================================
   MOTIFS / warli — the Warli visual grammar
   ------------------------------------------------------------
   Warli is not a clipart set, it is a construction system:

     circle    sun, moon, the head — cyclical time
     triangle  mountain, tree, and half a body
     square    the chauk, a sacred enclosure

   A person is TWO TRIANGLES MEETING AT THEIR TIPS — trunk above,
   pelvis below. The balance point is the point: it stands for the
   balance of the universe and of the couple. Everything is painted
   in white rice paste on a red-ochre earth ground, and nothing is
   drawn larger than anything else — Warli has no hero and no
   foreground.

   So these generators paint SOLID silhouettes with almost no
   wobble, not sketchy outlines.

   Two rules the code has to keep:

   1. A figure is a SKELETON, not a drawing. Every pose is a table
      of joint positions in figure units, so a figure can be leant,
      scaled, squeezed into a wide band or set on a ring and still
      be the same person. Props hang off the hand positions the
      skeleton already knows.

   2. A band FILLS its box. A border placed 8:1 has to look like a
      border, not a thin motif stranded in a tall empty box — so
      bands measure themselves against `_ar`, and frames count
      their teeth per side so a tooth is the same size all round.
   ============================================================ */
(function () {
  const { TAU } = window.SCRAWL;
  const G = window.SCRAWL.GENS;
  const D = Math.PI / 180;

  function def(key, cat, label, params, draw) {
    G[key] = { key, cat, label, params, draw, style: 'warli', aspect: 'square' };
  }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ---- the marks Warli is actually made of ---- */
  const solid = (h, pts, o) => h.shape(pts, Object.assign({ closed: true, sharp: true, forceFill: 'solid', fillRole: 'line', outline: false }, o));
  const blob = (h, pts, o) => h.shape(pts, Object.assign({ closed: true, forceFill: 'solid', fillRole: 'line', outline: false }, o));
  const disc = (h, cx, cy, rx, ry) => h.ellipse(cx, cy, rx, ry === undefined ? rx : ry, { fill: 'line', passes: 1, exact: true });
  const stroke = (h, a, b, w) => h.line(a[0], a[1], b[0], b[1], { passes: 1, w: w || 1 });
  /* A mark drawn on top of a filled silhouette is the same colour as the
     silhouette and disappears. Tiger stripes, an elephant's ear, the ribs
     of a mane: all of these are cut back to the ground, not painted on. */
  const carve = (h, a, b, w) => h.line(a[0], a[1], b[0], b[1], { passes: 1, w: w || 1, role: 'fill' });

  /* ============================================================
     THE FIGURE
     ------------------------------------------------------------
     Joint tables, in figure units, y down, the waist near zero.
     Each row is [elbowL, handL, elbowR, handR, kneeL, footL, kneeR, footR].
     Everything else — head, the two triangles — is fixed, because
     in Warli it is fixed.
     ============================================================ */
  const HEAD_Y = -28.6, HEAD_R = 5.2;
  const SHOULDER_Y = -24, SHOULDER = 9;
  const WAIST_Y = -1, HIP_Y = 18, HIP = 7.6;
  const ARM_X = 8, LEG_X = 5.5;

  const POSES = [
    /* standing */[[-14, -13], [-16, 0], [14, -13], [16, 0], [-6, 32], [-7, 47], [6, 32], [7, 47]],
    /* walking  */[[-14, -14], [-18, -3], [13, -16], [17, -27], [-12, 31], [-17, 47], [6, 32], [8, 47]],
    /* running  */[[-16, -21], [-22, -30], [15, -10], [20, 1], [-15, 27], [-24, 38], [9, 33], [17, 47]],
    /* dancing  */[[-15, -31], [-20, -41], [15, -31], [20, -41], [-11, 31], [-15, 47], [11, 31], [15, 47]],
    /* sitting  */[[-14, -10], [-17, 2], [14, -10], [17, 2], [-16, 26], [-3, 33], [16, 26], [3, 33]],
    /* working  */[[-15, 2], [-19, 15], [13, 3], [16, 16], [-8, 31], [-11, 47], [7, 32], [10, 47]],
    /* carrying */[[-16, -24], [-25, -25], [16, -24], [25, -25], [-6, 32], [-7, 47], [6, 32], [7, 47]],
    /* waving   */[[-14, -12], [-16, 0], [15, -33], [19, -44], [-6, 32], [-7, 47], [6, 32], [7, 47]],
    /* pointing */[[-13, -11], [-15, 1], [17, -24], [27, -27], [-6, 32], [-7, 47], [7, 32], [8, 47]],
    /* leaping  */[[-17, -28], [-24, -36], [17, -28], [24, -36], [-16, 28], [-22, 42], [16, 28], [22, 42]],
  ];
  const POSE_NAMES = ['standing', 'walking', 'running', 'dancing', 'sitting', 'working', 'carrying', 'waving', 'pointing', 'leaping'];
  const PROP_NAMES = ['none', 'pot on head', 'staff', 'drum', 'tarpa', 'bow', 'basket', 'child', 'axe', 'sickle'];

  /* One figure. Everything goes through P(u, v), so lean, scale and the
     horizontal squeeze of a wide box are all applied in one place. */
  function fig(h, cx, cy, s, pose, o) {
    o = o || {};
    const ar = o.ar || 1;
    const a = (o.lean || 0) * D, ca = Math.cos(a), sa = Math.sin(a);
    const P = (u, v) => {                        // figure units -> box units
      const du = u, dv = v - WAIST_Y;            // lean pivots on the waist
      return [cx + (du * ca - dv * sa) * s / ar, cy + (du * sa + dv * ca) * s];
    };
    const J = POSES[((pose % POSES.length) + POSES.length) % POSES.length];
    const lw = Math.max(.5, 1.0 * s);

    /* head — sits ON the shoulder line, never floating above it */
    const hd = P(0, HEAD_Y);
    disc(h, hd[0], hd[1], HEAD_R * s / ar, HEAD_R * s);
    if (o.knot) { const k = P(3.6, HEAD_Y - 5.4); disc(h, k[0], k[1], HEAD_R * .52 * s / ar, HEAD_R * .52 * s); }

    /* the two triangles, tip to tip */
    solid(h, [P(-SHOULDER, SHOULDER_Y), P(SHOULDER, SHOULDER_Y), P(0, WAIST_Y)]);
    solid(h, [P(0, WAIST_Y), P(HIP, HIP_Y), P(-HIP, HIP_Y)]);

    /* limbs bend at a joint — a straight stick reads as furniture */
    const shL = P(-ARM_X, SHOULDER_Y + .5), shR = P(ARM_X, SHOULDER_Y + .5);
    const hpL = P(-LEG_X, HIP_Y), hpR = P(LEG_X, HIP_Y);
    const eL = P(J[0][0], J[0][1]), haL = P(J[1][0], J[1][1]);
    const eR = P(J[2][0], J[2][1]), haR = P(J[3][0], J[3][1]);
    const kL = P(J[4][0], J[4][1]), ftL = P(J[5][0], J[5][1]);
    const kR = P(J[6][0], J[6][1]), ftR = P(J[7][0], J[7][1]);
    stroke(h, shL, eL, lw); stroke(h, eL, haL, lw);
    stroke(h, shR, eR, lw); stroke(h, eR, haR, lw);
    stroke(h, hpL, kL, lw); stroke(h, kL, ftL, lw);
    stroke(h, hpR, kR, lw); stroke(h, kR, ftR, lw);

    /* props hang off joints the skeleton already knows */
    switch (o.prop || 0) {
      case 1: {                                  // pot balanced on the head
        const c = P(0, HEAD_Y - 8.5);
        blob(h, h.ring(c[0], c[1], 8 * s / ar, 4.6 * s, 12, 0, .02));
        stroke(h, P(-8.6, HEAD_Y - 12), P(8.6, HEAD_Y - 12), lw);
        break;
      }
      case 2: stroke(h, P(J[3][0], J[3][1] - 26), P(J[3][0] + 2, J[3][1] + 24), lw * 1.3); break;
      case 3: {                                  // dhol, slung at the hip
        const c = P(13, 6);
        blob(h, h.ring(c[0], c[1], 8 * s / ar, 6.5 * s, 12, 0, .02));
        stroke(h, P(-9, -19), P(13, 1), lw * .7);
        break;
      }
      case 4: {                                  // the tarpa: gourd and pipe
        stroke(h, P(6, -14), P(19, -25), lw * 1.2);
        const g0 = P(23, -28); disc(h, g0[0], g0[1], 4.4 * s / ar, 4.4 * s);
        stroke(h, P(19, -25), P(10, -20), lw * .8);
        break;
      }
      case 5: {                                  // a drawn bow
        const bx = [];
        for (let i = 0; i <= 10; i++) { const t = -Math.PI * .45 + (i / 10) * Math.PI * .9; bx.push(P(19 + Math.cos(t) * 4, -8 + Math.sin(t) * 19)); }
        h.curve(bx, { passes: 1, w: lw });
        stroke(h, bx[0], bx[bx.length - 1], lw * .7);
        stroke(h, P(11, -8), P(26, -8), lw * .7);
        break;
      }
      case 6: solid(h, [P(-9.5, HEAD_Y - 13), P(9.5, HEAD_Y - 13), P(6, HEAD_Y - 4), P(-6, HEAD_Y - 4)]); break;
      case 7: { const c = P(15, 6); fig(h, c[0], c[1], s * .42, 0, { ar }); break; }
      case 8: {
        stroke(h, haR, P(J[3][0] + 6, J[3][1] - 14), lw);
        solid(h, [P(J[3][0] + 4, J[3][1] - 14), P(J[3][0] + 12, J[3][1] - 18), P(J[3][0] + 9, J[3][1] - 10)]);
        break;
      }
      case 9: {
        const cu = [];
        for (let i = 0; i <= 8; i++) { const t = Math.PI * .1 + (i / 8) * Math.PI * .8; cu.push(P(J[3][0] + 3 + Math.cos(t) * 9, J[3][1] - 2 - Math.sin(t) * 9)); }
        h.curve(cu, { passes: 1, w: lw });
        break;
      }
    }
    return { hand: [haL, haR], head: hd, shoulder: [shL, shR], foot: [ftL, ftR] };
  }

  def('wFigure', 'Figures', 'Figure', [
    O('pose', 'Pose', POSE_NAMES, 0),
    O('prop', 'Carrying', PROP_NAMES, 0),
    B('knot', 'Top knot', false), N('lean', 'Lean', -35, 35, 0),
  ], (h, p) => {
    /* Poses and props change the figure's extent — dancing arms reach
       higher than a pot does — so measure it and fit, rather than
       guessing one scale that suits none of them. */
    const o = { knot: p.knot, prop: p.prop, lean: p.lean, ar: p._ar || 1 };
    h.fitDraw({ x: 4, y: 4, w: 92, h: 92 }, (hh, cx, cy, s) => fig(hh, cx, cy, s, p.pose, o));
  });

  /* a row of figures holding hands — the human chain */
  def('wChain', 'Figures', 'Human chain', [
    N('people', 'People', 2, 12, 5), O('pose', 'Pose', ['standing', 'dancing', 'walking'], 1),
    B('joined', 'Hands joined', true), B('alt', 'Alternate the lean', false),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = p.people, gap = 96 / n;
    const s = Math.min(1.05, (gap * ar) / 30);
    const pose = [0, 3, 1][p.pose];
    const made = [];
    for (let i = 0; i < n; i++) {
      made.push(fig(h, 2 + gap * (i + .5), 50, s, pose, { ar, lean: p.alt ? (i % 2 ? 7 : -7) : 0 }));
    }
    if (p.joined) for (let i = 0; i < n - 1; i++) stroke(h, made[i].hand[1], made[i + 1].hand[0], Math.max(.5, s));
  });

  /* ============================================================
     TARPA DANCE — the spiral with no beginning and no end
     ============================================================ */
  def('wTarpa', 'Compositions', 'Tarpa dance', [
    N('dancers', 'Dancers', 5, 26, 12), N('rings', 'Rings', 1, 3, 1),
    B('player', 'Tarpa player', true), B('joined', 'Hands joined', true),
  ], (h, p) => {
    /* a dancer has to fit the gap beside it AND stay inside the box,
       so the ring radius is set from whichever is tighter */
    const outer = 34;
    for (let r = 0; r < p.rings; r++) {
      const R = outer - r * (outer / (p.rings + .6));
      const n = Math.max(4, Math.round(p.dancers * (R / outer) * .9));
      const s = Math.min(.34, (TAU * R) / n / 34, R / 46);
      const made = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU - Math.PI / 2;
        made.push(fig(h, 50 + Math.cos(t) * R, 50 + Math.sin(t) * R, s, 3));
      }
      if (p.joined) for (let i = 0; i < n; i++) stroke(h, made[i].hand[1], made[(i + 1) % n].hand[0], Math.max(.4, s));
    }
    if (p.player) fig(h, 50, 50, Math.min(.30, outer / (p.rings * 2.4 + 2)), 0, { prop: 4 });
  });

  /* ============================================================
     CHAUK — the sacred square
     Devchauk holds Palaghata, the mother goddess. The wedding chauk
     holds Panchsirya, the five-headed horse that carries the groom.
     ============================================================ */
  function palaghata(h, cx, cy, s) {
    /* the goddess is drawn squared and frontal, not as a dancer:
       a lattice body, arms out, and a crown of shoots */
    const u = v => cy + v * s, x = v => cx + v * s;
    solid(h, [[x(-13), u(-16)], [x(13), u(-16)], [x(0), u(4)]]);
    solid(h, [[x(0), u(4)], [x(11), u(22)], [x(-11), u(22)]]);
    disc(h, x(0), u(-24), 5.4 * s);
    for (let i = 0; i < 5; i++) {                      // the crown of shoots
      const t = -Math.PI * .88 + (i / 4) * Math.PI * .76;
      stroke(h, [x(Math.cos(t) * 5), u(-24 + Math.sin(t) * 5)], [x(Math.cos(t) * 15), u(-24 + Math.sin(t) * 15)], s);
      disc(h, x(Math.cos(t) * 17), u(-24 + Math.sin(t) * 17), 2 * s);
    }
    stroke(h, [x(-11), u(-14)], [x(-22), u(-14)], s); stroke(h, [x(-22), u(-14)], [x(-24), u(-2)], s);
    stroke(h, [x(11), u(-14)], [x(22), u(-14)], s); stroke(h, [x(22), u(-14)], [x(24), u(-2)], s);
    stroke(h, [x(-7), u(22)], [x(-10), u(38)], s); stroke(h, [x(7), u(22)], [x(10), u(38)], s);
    stroke(h, [x(-16), u(38)], [x(16), u(38)], s);
  }

  function panchsirya(h, cx, cy, s) {
    /* five-headed horse: one body, five necks fanned from the withers */
    const x = v => cx + v * s, u = v => cy + v * s;
    solid(h, [[x(-20), u(-4)], [x(16), u(-4)], [x(14), u(8)], [x(-18), u(8)]]);
    for (let i = 0; i < 5; i++) {
      const t = -Math.PI * .80 + (i / 4) * Math.PI * .66;
      const nx = 13 + Math.cos(t) * 27, ny = -5 + Math.sin(t) * 27;
      stroke(h, [x(13), u(-4)], [x(nx), u(ny)], s * 1.3);
      solid(h, [[x(nx - 3), u(ny + 3.4)], [x(nx + 7), u(ny + 1)], [x(nx + 5.5), u(ny - 2.6)], [x(nx - 2.6), u(ny - 3.6)]]);
    }
    [-.7, -.25, .25, .7].forEach(f => stroke(h, [x(f * 17), u(8)], [x(f * 17 + f * 3), u(24)], s));
    h.curve([[x(-20), u(-2)], [x(-30), u(-8)], [x(-29), u(6)]], { passes: 1, w: s });
  }

  def('wChauk', 'Compositions', 'Chauk', [
    N('bands', 'Border bands', 1, 4, 2),
    O('inside', 'Inside', ['Palaghata', 'empty', 'sun', 'tree', 'Panchsirya', 'a couple'], 0),
    N('teeth', 'Border teeth', 6, 34, 16), B('toothed', 'Toothed edge', true),
  ], (h, p) => {
    const k0 = 7;
    for (let b = 0; b < p.bands; b++) {
      const k = k0 + b * 6;
      h.curve([[k, k], [100 - k, k], [100 - k, 100 - k], [k, 100 - k]], { closed: true, sharp: true, passes: 1 });
    }
    if (p.toothed) {
      const span = (100 - k0 * 2) / p.teeth, d = 4.5;
      for (let i = 0; i < p.teeth; i++) {
        const a = k0 + i * span, b2 = a + span, m = (a + b2) / 2;
        solid(h, [[a, k0], [b2, k0], [m, k0 - d]]);
        solid(h, [[a, 100 - k0], [b2, 100 - k0], [m, 100 - k0 + d]]);
        solid(h, [[k0, a], [k0, b2], [k0 - d, m]]);
        solid(h, [[100 - k0, a], [100 - k0, b2], [100 - k0 + d, m]]);
      }
    }
    const c = 50, inner = k0 + p.bands * 6;
    const room = (100 - inner * 2) / 100;
    if (p.inside === 0) palaghata(h, c, c - 2, room * 1.05);
    if (p.inside === 2) {
      disc(h, c, c, 11 * room);
      for (let i = 0; i < 12; i++) {
        const t = i / 12 * TAU;
        stroke(h, [c + Math.cos(t) * 14 * room, c + Math.sin(t) * 14 * room], [c + Math.cos(t) * 21 * room, c + Math.sin(t) * 21 * room], 1);
      }
    }
    if (p.inside === 3) treeAt(h, c, c + 30 * room, room * 1.15, 0);
    if (p.inside === 4) panchsirya(h, c, c, room * 1.15);
    if (p.inside === 5) { fig(h, c - 15 * room, c, room * .78, 0); fig(h, c + 15 * room, c, room * .78, 0, { knot: 1 }); }
  });

  /* ============================================================
     NATURE
     ============================================================ */
  function treeAt(h, cx, base, s, kind) {
    const H = 46 * s;
    stroke(h, [cx, base], [cx, base - H * .5], 1.3);
    if (kind === 0) {                    // branching
      for (let i = 0; i < 5; i++) {
        const t = -Math.PI * .82 + (i / 4) * Math.PI * .64;
        const y0 = base - H * .5 - i * 1.5;
        stroke(h, [cx, y0], [cx + Math.cos(t) * H * .5, y0 + Math.sin(t) * H * .5], 1);
        for (let k = 1; k <= 2; k++) {
          const px = cx + Math.cos(t) * H * .5 * (k / 2), py = y0 + Math.sin(t) * H * .5 * (k / 2);
          stroke(h, [px, py], [px + Math.cos(t - .7) * H * .16, py + Math.sin(t - .7) * H * .16], 1);
        }
      }
    }
    if (kind === 1) solid(h, [[cx, base - H * 1.05], [cx + H * .34, base - H * .45], [cx - H * .34, base - H * .45]]);
    if (kind === 2) {                    // palm fan
      for (let i = 0; i < 7; i++) {
        const t = -Math.PI + (i / 6) * Math.PI;
        h.curve([[cx, base - H * .5], [cx + Math.cos(t) * H * .3, base - H * .5 + Math.sin(t) * H * .34],
        [cx + Math.cos(t) * H * .52, base - H * .5 + Math.sin(t) * H * .3 + H * .1]], { passes: 1 });
      }
    }
    if (kind === 3) {                    // laden with fruit
      for (let i = 0; i < 5; i++) {
        const t = -Math.PI * .84 + (i / 4) * Math.PI * .68;
        const y0 = base - H * .5 - i * 1.5;
        const ex = cx + Math.cos(t) * H * .5, ey = y0 + Math.sin(t) * H * .5;
        stroke(h, [cx, y0], [ex, ey], 1);
        for (let k = 1; k <= 2; k++) {
          const px = cx + Math.cos(t) * H * .5 * (k / 2), py = y0 + Math.sin(t) * H * .5 * (k / 2);
          const qx = px + Math.cos(t - .8) * H * .14, qy = py + Math.sin(t - .8) * H * .14;
          stroke(h, [px, py], [qx, qy], 1);
          disc(h, qx, qy, H * .035);
        }
        disc(h, ex, ey, H * .04);
      }
    }
  }
  def('wTree', 'Nature', 'Tree', [
    O('kind', 'Kind', ['branching', 'conical', 'palm', 'fruiting'], 0),
    N('size', 'Height', 40, 100, 82), O('life', 'In its branches', ['nothing', 'birds', 'monkeys'], 0),
  ], (h, p) => {
    h.fitDraw({ x: 4, y: 4, w: 92, h: 92 }, (hh, cx, cy, s) => {
      treeAt(hh, cx, cy + 26 * s, s, p.kind);
      if (p.life === 1) { birdAt(hh, cx - 18 * s, cy - 14 * s, .5 * s); birdAt(hh, cx + 18 * s, cy - 22 * s, .45 * s); }
      if (p.life === 2) { monkeyAt(hh, cx - 20 * s, cy - 10 * s, .5 * s); monkeyAt(hh, cx + 20 * s, cy - 18 * s, .45 * s); }
    }, { scale: p.size / 82 });
  });

  def('wSun', 'Nature', 'Sun & moon', [O('kind', 'Kind', ['sun', 'moon', 'both'], 0), N('rays', 'Rays', 0, 24, 12), N('size', 'Size', 20, 70, 40)],
    (h, p) => {
      const R = p.size / 2;
      /* a real crescent: one arc, and a second arc cutting back across it */
      const crescent = (cx, cy, r) => blob(h,
        h.arcPts(cx, cy, r, r, Math.PI * .42, Math.PI * 1.58, 18)
          .concat(h.arcPts(cx - r * .52, cy, r * .94, r * .94, Math.PI * 1.58, Math.PI * .42, 18)));
      if (p.kind === 1) { crescent(54, 50, R); return; }
      disc(h, 50, 50, R * .62);
      for (let i = 0; i < p.rays; i++) {
        const t = i / p.rays * TAU;
        stroke(h, [50 + Math.cos(t) * R * .72, 50 + Math.sin(t) * R * .72], [50 + Math.cos(t) * R, 50 + Math.sin(t) * R], 1);
      }
      if (p.kind === 2) crescent(85, 20, 9);
    });

  def('wHill', 'Nature', 'Hills', [N('peaks', 'Peaks', 1, 8, 3), B('sun', 'Sun behind', false), N('height', 'Height', 20, 80, 52), B('ground', 'Ground line', true)],
    (h, p) => {
      const ar = p._ar || 1;
      const base = 88, span = 100 / p.peaks;
      if (p.sun) disc(h, 100 - span * .5, Math.max(10, base - p.height - 10), 8 / ar, 8);
      for (let i = 0; i < p.peaks; i++) {
        const cx = span * (i + .5);
        const hh = Math.min(p.height, span * ar * .78) * (i % 2 ? .74 : 1);
        solid(h, [[cx, base - hh], [cx + span * .56, base], [cx - span * .56, base]]);
      }
      if (p.ground) stroke(h, [0, base], [100, base], 1);
    });

  def('wRiver', 'Nature', 'River', [N('lines', 'Lines', 1, 8, 3), N('waves', 'Waves', 2, 14, 5), O('life', 'In the water', ['nothing', 'fish', 'a boat'], 0)],
    (h, p) => {
      const top = 26, bot = 74;
      for (let l = 0; l < p.lines; l++) {
        const y = p.lines === 1 ? 50 : top + l * ((bot - top) / (p.lines - 1));
        const pts = [];
        for (let i = 0; i <= p.waves * 4; i++) { const u = i / (p.waves * 4); pts.push([u * 100, y + Math.sin(u * TAU * p.waves) * 4]); }
        h.curve(pts, { passes: 1 });
      }
      if (p.life === 1) { fishAt(h, 28, 16, .7); fishAt(h, 66, 86, .6); }
      if (p.life === 2) {
        solid(h, [[32, 12], [68, 12], [62, 22], [38, 22]]);
        stroke(h, [50, 12], [50, -4], 1.2); fig(h, 44, 3, .26, 0);
      }
    });

  /* ============================================================
     ANIMALS
     A Warli beast is a small body on long thin legs, with a neck
     leaving the body's front corner. The old version drew the body
     as a table top; these proportions are the fix.
     ============================================================ */
  function beastAt(h, cx, cy, s, kind) {
    const L = 17 * s, Hb = 5.5 * s;              // body half-length, half-height
    const lw = Math.max(.5, s);
    const big = kind === 4;
    const bl = big ? L * 1.25 : L, bh = big ? Hb * 1.7 : Hb;
    solid(h, [[cx - bl, cy - bh], [cx + bl, cy - bh * 1.1], [cx + bl * .9, cy + bh], [cx - bl * .92, cy + bh]]);

    /* four legs, each with a knee */
    const legY = cy + bh, foot = legY + 17 * s;
    [-.72, -.36, .38, .74].forEach((f, i) => {
      const x0 = cx + bl * f, sw = (i < 2 ? -1 : 1) * 1.6 * s;
      stroke(h, [x0, legY], [x0 + sw, legY + 9 * s], lw);
      stroke(h, [x0 + sw, legY + 9 * s], [x0 + sw * 1.5, foot], lw);
    });

    /* neck and head leave the front top corner */
    const nx = cx + bl + 7 * s, ny = cy - bh - 10 * s;
    stroke(h, [cx + bl * .8, cy - bh * .6], [nx, ny], lw * 2.2);
    solid(h, [[nx - 3.5 * s, ny + 3.4 * s], [nx + 6.5 * s, ny + 1.4 * s], [nx + 5 * s, ny - 2.6 * s], [nx - 3 * s, ny - 3.6 * s]]);

    const tail = curl => curl
      ? h.curve([[cx - bl, cy - bh * .5], [cx - bl - 9 * s, cy - 11 * s], [cx - bl - 3 * s, cy - 16 * s]], { passes: 1, w: lw })
      : stroke(h, [cx - bl, cy - bh * .4], [cx - bl - 9 * s, cy + 9 * s], lw);

    if (kind === 0 || kind === 1) {                     // cow / bull
      stroke(h, [nx - 1 * s, ny - 5 * s], [nx - 6 * s, ny - 14 * s], lw);
      stroke(h, [nx + 2 * s, ny - 4 * s], [nx + 7 * s, ny - 13 * s], lw);
      if (kind === 1) solid(h, [[cx + bl * .1, cy - bh], [cx + bl * .62, cy - bh], [cx + bl * .36, cy - bh - 7 * s]]);
      tail(0);
    }
    if (kind === 2) {                                   // goat
      stroke(h, [nx, ny - 4 * s], [nx - 4 * s, ny - 12 * s], lw);
      stroke(h, [nx - 3 * s, ny + 4 * s], [nx - 4 * s, ny + 10 * s], lw);   // beard
      tail(1);
    }
    if (kind === 3) {                                   // deer
      [-1, 1].forEach(d => {
        stroke(h, [nx + d * 2 * s, ny - 5 * s], [nx + d * 6 * s, ny - 17 * s], lw);
        stroke(h, [nx + d * 4.5 * s, ny - 11 * s], [nx + d * 11 * s, ny - 14 * s], lw);
      });
      tail(0);
    }
    if (kind === 4) {                                   // elephant
      h.curve([[nx + 5 * s, ny + 2 * s], [nx + 13 * s, ny + 15 * s], [nx + 6 * s, ny + 28 * s]], { passes: 1, w: lw * 2.4 });
      solid(h, [[nx - 4 * s, ny - 4 * s], [nx - 15 * s, ny - 10 * s], [nx - 12 * s, ny + 8 * s]]);
      carve(h, [nx - 6 * s, ny - 5 * s], [nx - 11 * s, ny + 5 * s], lw * .8);   // the ear's fold
      stroke(h, [nx + 5 * s, ny + 4 * s], [nx + 14 * s, ny + 7 * s], lw * 1.2); // tusk
      tail(0);
    }
    if (kind === 5) tail(1);                            // dog — tail up
    if (kind === 6) {                                   // horse
      for (let i = 0; i < 4; i++) carve(h, [cx + bl * .74 - i * 2.6 * s, cy - bh], [nx - 5 * s - i * 1.6 * s, ny + 3 * s], lw * .7);
      h.curve([[cx - bl, cy - bh * .6], [cx - bl - 11 * s, cy - 2 * s], [cx - bl - 8 * s, cy + 13 * s]], { passes: 1, w: lw * 1.4 });
    }
    if (kind === 7) {                                   // tiger — Waghoba
      for (let i = 0; i < 5; i++) { const x0 = cx - bl * .7 + i * bl * .34; carve(h, [x0, cy - bh], [x0 - 1.5 * s, cy + bh], lw * .9); }
      h.curve([[cx - bl, cy - bh * .4], [cx - bl - 13 * s, cy - 4 * s], [cx - bl - 10 * s, cy - 16 * s]], { passes: 1, w: lw * 1.2 });
      stroke(h, [nx - 2 * s, ny - 5 * s], [nx - 5 * s, ny - 10 * s], lw);
      stroke(h, [nx + 3 * s, ny - 4 * s], [nx + 5 * s, ny - 10 * s], lw);
    }
  }
  const BEASTS = ['cow', 'bull', 'goat', 'deer', 'elephant', 'dog', 'horse', 'tiger'];
  def('wAnimal', 'Animals', 'Animal', [O('kind', 'Kind', BEASTS, 0), N('size', 'Size', 40, 100, 70), B('calf', 'With a young one', false), B('rider', 'With a rider', false)],
    (h, p) => {
      const k = p.size / 100 * 1.25;
      h.fitDraw({ x: 4, y: 6, w: 92, h: 88 }, (hh, cx, cy, s) => {
        const u = s * k;
        beastAt(hh, cx - (p.calf ? 14 : 0) * u, cy, u, p.kind);
        if (p.calf) beastAt(hh, cx + 30 * u, cy + 14 * u, u * .5, p.kind);
        if (p.rider) fig(hh, cx - (p.calf ? 14 : 0) * u, cy - 26 * u, u * .62, 4);
      }, { scale: p.size / 100 * 1.02 });
    });

  function monkeyAt(h, cx, cy, s) {
    solid(h, [[cx - 6 * s, cy - 5 * s], [cx + 6 * s, cy - 5 * s], [cx + 4 * s, cy + 7 * s], [cx - 4 * s, cy + 7 * s]]);
    disc(h, cx, cy - 10 * s, 3.6 * s);
    stroke(h, [cx - 5 * s, cy - 4 * s], [cx - 11 * s, cy + 4 * s], s);
    stroke(h, [cx + 5 * s, cy - 4 * s], [cx + 11 * s, cy - 10 * s], s);
    stroke(h, [cx - 3 * s, cy + 7 * s], [cx - 5 * s, cy + 15 * s], s);
    stroke(h, [cx + 3 * s, cy + 7 * s], [cx + 5 * s, cy + 15 * s], s);
    h.curve([[cx - 5 * s, cy + 2 * s], [cx - 13 * s, cy + 8 * s], [cx - 11 * s, cy - 3 * s]], { passes: 1, w: s * .9 });
  }

  function birdAt(h, cx, cy, s) {
    solid(h, [[cx - 10 * s, cy], [cx + 8 * s, cy - 5 * s], [cx + 6 * s, cy + 6 * s]]);
    disc(h, cx + 9 * s, cy - 6 * s, 3 * s);
    stroke(h, [cx + 12 * s, cy - 6 * s], [cx + 17 * s, cy - 5 * s], 1);
    stroke(h, [cx - 4 * s, cy + 5 * s], [cx - 4 * s, cy + 12 * s], 1);
    stroke(h, [cx + 2 * s, cy + 5 * s], [cx + 2 * s, cy + 12 * s], 1);
  }
  def('wBird', 'Animals', 'Bird', [O('kind', 'Kind', ['bird', 'peacock', 'hen', 'flying', 'flock'], 0), N('size', 'Size', 40, 100, 70), N('feathers', 'Tail feathers', 5, 20, 12)],
    (h, p) => {
      const s = p.size / 100 * 1.5;
      if (p.kind === 1) {
        /* peacock: a half-disc of quills behind a small body, all of it
           inside the box — the fan used to run off the left edge */
        const fx = 50, fy = 82, R = 40;
        for (let i = 0; i < p.feathers; i++) {
          const t = -Math.PI * .96 + (i / (p.feathers - 1)) * Math.PI * .92;
          const ex = fx + Math.cos(t) * R, ey = fy + Math.sin(t) * R * .96;
          stroke(h, [fx, fy], [ex, ey], 1);
          disc(h, ex, ey, 2.8);
        }
        h.ellipse(50, 80, 9, 7, { fill: 'line', passes: 1, exact: true });
        stroke(h, [55, 76], [61, 64], 1.6);
        disc(h, 62, 60, 4);
        stroke(h, [62, 55], [61, 49], 1); disc(h, 61, 47, 1.8);
        solid(h, [[66, 59], [73, 58], [66, 63]]);
        stroke(h, [47, 87], [45, 96], 1); stroke(h, [53, 87], [54, 96], 1);
        return;
      }
      if (p.kind === 2) {                                  // hen
        h.ellipse(44, 64, 16, 11, { fill: 'line', passes: 1, exact: true });
        stroke(h, [56, 57], [62, 45], 1.6);
        disc(h, 64, 41, 5);
        solid(h, [[60, 36], [64, 29], [68, 36]]);          // comb
        solid(h, [[69, 41], [78, 40], [69, 45]]);          // beak
        solid(h, [[30, 60], [16, 44], [33, 53]]);          // wing
        stroke(h, [40, 74], [38, 88], 1); stroke(h, [50, 74], [51, 88], 1);
        stroke(h, [34, 88], [43, 88], 1); stroke(h, [47, 88], [56, 88], 1);
        return;
      }
      if (p.kind === 3) {                                  // flying
        solid(h, [[38, 50], [12, 34], [30, 54]]);
        solid(h, [[62, 50], [88, 34], [70, 54]]);
        solid(h, [[38, 46], [62, 46], [56, 62], [44, 62]]);
        disc(h, 50, 40, 5);
        return;
      }
      if (p.kind === 4) {                                  // a flock, all one scale
        [[22, 30], [56, 20], [76, 44], [34, 62], [66, 78]].forEach((b, i) => birdAt(h, b[0], b[1], (i % 2 ? .45 : .5) * (p.size / 70)));
        return;
      }
      h.fitDraw({ x: 6, y: 6, w: 88, h: 88 }, (hh, cx, cy, k) => birdAt(hh, cx, cy, k * s), { scale: p.size / 70 * .8 });
    });

  function fishAt(h, cx, cy, s) {
    solid(h, [[cx - 14 * s, cy], [cx + 4 * s, cy - 8 * s], [cx + 14 * s, cy], [cx + 4 * s, cy + 8 * s]]);
    solid(h, [[cx + 13 * s, cy], [cx + 22 * s, cy - 7 * s], [cx + 22 * s, cy + 7 * s]]);
  }
  def('wFish', 'Animals', 'Fish', [N('count', 'Fish', 1, 8, 3), O('lay', 'Arranged', ['in a row', 'diagonally', 'shoaling'], 0), N('size', 'Size', 30, 100, 60)],
    (h, p) => {
      const s = p.size / 100 * 1.35;
      const reach = 22 * s;                      // keep the tail inside the box
      for (let i = 0; i < p.count; i++) {
        const u = p.count === 1 ? .5 : i / (p.count - 1);
        const x = reach + u * Math.max(0, 100 - reach * 2);
        const y = p.lay === 0 ? 50 : p.lay === 1 ? 20 + u * 60 : 24 + ((i * 37) % 56);
        fishAt(h, x, y, s);
      }
    });

  /* ============================================================
     VILLAGE
     ============================================================ */
  function hutAt(h, cx, base, s, roof, door) {
    const w = 22 * s, wallTop = base - 20 * s;
    h.curve([[cx - w, wallTop], [cx + w, wallTop], [cx + w, base], [cx - w, base]], { closed: true, sharp: true, passes: 1 });
    if (roof === 0) solid(h, [[cx, wallTop - 21 * s], [cx + w * 1.28, wallTop], [cx - w * 1.28, wallTop]]);
    if (roof === 1) { solid(h, [[cx, wallTop - 18 * s], [cx + w * 1.24, wallTop], [cx - w * 1.24, wallTop]]); stroke(h, [cx - w * 1.24, wallTop], [cx + w * 1.24, wallTop], 1); }
    if (roof === 2) blob(h, h.arcPts(cx, wallTop, w * 1.2, 19 * s, Math.PI, TAU, 16));
    if (door) solid(h, [[cx - 4.5 * s, base], [cx + 4.5 * s, base], [cx + 4.5 * s, base - 12 * s], [cx - 4.5 * s, base - 12 * s]]);
  }
  def('wHut', 'Village', 'Hut', [O('roof', 'Roof', ['thatch', 'gable', 'round'], 0), B('door', 'Door', true), N('size', 'Size', 40, 100, 72), N('count', 'Huts', 1, 3, 1)],
    (h, p) => {
      const s = p.size / 72 / (p.count > 1 ? p.count * .62 : 1);
      for (let i = 0; i < p.count; i++) {
        const cx = p.count === 1 ? 50 : 16 + i * (68 / (p.count - 1));
        hutAt(h, cx, 84 - (i % 2) * 6, s, p.roof, p.door);
      }
    });

  def('wPot', 'Village', 'Pots & water', [
    O('kind', 'Kind', ['pots in a row', 'carrying yoke', 'grinding stone', 'stacked pots', 'well'], 0),
    N('count', 'Count', 1, 5, 2), N('size', 'Size', 40, 100, 66),
  ], (h, p) => {
    const s = p.size / 66;
    const pot = (cx, cy, r) => {
      blob(h, h.ring(cx, cy, r, r * .94, 14, 0, .02));
      stroke(h, [cx - r * .78, cy - r * .82], [cx + r * .78, cy - r * .82], 1);
    };
    if (p.kind === 0) { const n = p.count, g = 76 / n; for (let i = 0; i < n; i++) pot(12 + g * (i + .5), 58, Math.min(11 * s, g * .40)); }
    if (p.kind === 1) {
      stroke(h, [14, 30], [86, 30], 1.4);
      stroke(h, [26, 30], [26, 46], 1); stroke(h, [74, 30], [74, 46], 1);
      pot(26, 58, 11 * s); pot(74, 58, 11 * s);
    }
    if (p.kind === 2) {
      blob(h, h.ring(50, 68, 24 * s, 9 * s, 16, 0, .02));
      blob(h, h.ring(50, 56, 16 * s, 6.5 * s, 16, 0, .02));
      stroke(h, [62, 53], [66, 34], 1.3); disc(h, 67, 31, 3.2 * s);
    }
    if (p.kind === 3) { for (let i = 0; i < p.count; i++) pot(50, 84 - i * 15 * s, (12 - i * 1.4) * s); }
    if (p.kind === 4) {
      h.curve([[32, 56], [68, 56], [68, 90], [32, 90]], { closed: true, sharp: true, passes: 1 });
      for (let i = 0; i < 4; i++) stroke(h, [32, 62 + i * 8], [68, 62 + i * 8], 1);
      stroke(h, [26, 40], [74, 40], 1.3); stroke(h, [32, 40], [32, 56], 1); stroke(h, [68, 40], [68, 56], 1);
      stroke(h, [50, 40], [50, 50], 1); pot(50, 54, 6 * s);
    }
  });

  def('wLadder', 'Village', 'Ladder & fence', [O('kind', 'Kind', ['ladder', 'fence', 'granary', 'trap'], 0), N('rungs', 'Rungs', 3, 14, 6), N('lean', 'Lean', -25, 25, 8)],
    (h, p) => {
      const ar = p._ar || 1;
      if (p.kind === 1) {
        for (let i = 0; i < p.rungs; i++) { const x = 6 + i * (88 / Math.max(1, p.rungs - 1)); stroke(h, [x, 26], [x, 84], 1); }
        stroke(h, [4, 40], [96, 40], 1); stroke(h, [4, 70], [96, 70], 1);
        return;
      }
      if (p.kind === 2) {                       // grain store on stilts
        blob(h, h.ring(50, 50, 28 / ar, 26, 16, 0, .03));
        solid(h, [[50, 8], [50 + 26 / ar, 26], [50 - 26 / ar, 26]]);
        stroke(h, [50 - 16 / ar, 74], [50 - 18 / ar, 94], 1.2);
        stroke(h, [50 + 16 / ar, 74], [50 + 18 / ar, 94], 1.2);
        return;
      }
      if (p.kind === 3) {                       // a spring trap
        h.curve([[20, 76], [50, 40], [80, 76]], { passes: 1 });
        stroke(h, [20, 76], [80, 76], 1);
        for (let i = 0; i < p.rungs; i++) { const u = (i + .5) / p.rungs; stroke(h, [20 + u * 60, 76], [20 + u * 60, 62 - Math.sin(u * Math.PI) * 14], 1); }
        return;
      }
      const t = p.lean * D;
      const x0 = 50 - Math.sin(t) * 26, x1 = 50 + Math.sin(t) * 26, w = 8 / ar;
      stroke(h, [x0 - w, 92], [x1 - w, 8], 1);
      stroke(h, [x0 + w, 92], [x1 + w, 8], 1);
      for (let i = 0; i < p.rungs; i++) {
        const u = (i + .5) / p.rungs, y = 92 - u * 84, xx = x0 + (x1 - x0) * u;
        stroke(h, [xx - w, y], [xx + w, y], 1);
      }
    });

  /* ============================================================
     WORK & RITUAL — the scenes Warli is actually about
     ============================================================ */
  def('wToddy', 'Village', 'Toddy tapper', [N('height', 'Palm height', 50, 100, 88), B('pots', 'Pots in the crown', true), N('fronds', 'Fronds', 4, 10, 7)],
    (h, p) => {
      /* a man climbing a palm to tap it — one of the great Warli subjects */
      const base = 98, top = base - p.height;
      stroke(h, [50, base], [50, top], 1.6);
      for (let i = 0; i < p.fronds; i++) {
        const t = -Math.PI + (i / (p.fronds - 1)) * Math.PI;
        h.curve([[50, top], [50 + Math.cos(t) * 22, top + Math.sin(t) * 20], [50 + Math.cos(t) * 34, top + Math.sin(t) * 16 + 10]], { passes: 1 });
      }
      if (p.pots) { blob(h, h.ring(40, top + 13, 5, 4.5, 10, 0, .03)); blob(h, h.ring(60, top + 13, 5, 4.5, 10, 0, .03)); }
      const climbY = top + (base - top) * .55;
      fig(h, 42, climbY, .32, 4, { lean: 12 });
      stroke(h, [46, climbY - 8], [50, climbY - 6], 1);      // arms round the trunk
      stroke(h, [46, climbY + 6], [50, climbY + 8], 1);
    });

  def('wCart', 'Village', 'Bullock cart', [N('spokes', 'Wheel spokes', 4, 12, 8), B('driver', 'Driver', true), B('load', 'Loaded', false)],
    (h, p) => {
      const wheel = (cx, cy, r) => {
        h.ellipse(cx, cy, r, r, { passes: 1, exact: true });
        for (let i = 0; i < p.spokes; i++) { const t = i / p.spokes * Math.PI; stroke(h, [cx - Math.cos(t) * r, cy - Math.sin(t) * r], [cx + Math.cos(t) * r, cy + Math.sin(t) * r], .8); }
      };
      h.curve([[22, 52], [62, 52], [62, 66], [22, 66]], { closed: true, sharp: true, passes: 1 });
      if (p.load) for (let i = 0; i < 3; i++) blob(h, h.ring(30 + i * 12, 46, 6, 6, 10, 0, .03));
      stroke(h, [62, 58], [84, 50], 1.3);
      wheel(32, 74, 9); wheel(54, 74, 9);
      beastAt(h, 82, 52, .48, 1);
      if (p.driver) fig(h, 40, 42, .28, 4);
    });

  def('wPlough', 'Village', 'Ploughing', [B('two', 'A pair of oxen', true), N('furrows', 'Furrows', 0, 6, 3)],
    (h, p) => {
      beastAt(h, 62, 44, .54, 0);
      if (p.two) beastAt(h, 58, 60, .54, 0);
      stroke(h, [44, 52], [22, 66], 1.4);           // the beam
      stroke(h, [22, 66], [20, 80], 1.4);           // the share
      solid(h, [[16, 80], [26, 80], [21, 90]]);
      fig(h, 24, 50, .40, 5, { lean: 14 });
      for (let i = 0; i < p.furrows; i++) {
        const y = 90 + i * 3; const pts = [];
        for (let k = 0; k <= 16; k++) pts.push([k * 6.25, y + Math.sin(k * .8) * 1.2]);
        h.curve(pts, { passes: 1, w: .8 });
      }
    });

  def('wHunt', 'Compositions', 'The hunt', [N('hunters', 'Hunters', 1, 3, 2), O('quarry', 'Quarry', ['deer', 'goat', 'tiger'], 0), B('trees', 'Trees', true)],
    (h, p) => {
      if (p.trees) { treeAt(h, 12, 92, .5, 0); treeAt(h, 90, 96, .42, 1); }
      beastAt(h, 72, 58, .5, [3, 2, 7][p.quarry]);
      for (let i = 0; i < p.hunters; i++) fig(h, 20 + i * 15, 50 + (i % 2) * 8, .36, 8, { prop: 5 });
    });

  def('wDrum', 'Figures', 'Drummers', [N('players', 'Players', 1, 5, 3), O('kind', 'Instrument', ['dhol', 'tarpa', 'both'], 0), B('row', 'In a row', true)],
    (h, p) => {
      const ar = p._ar || 1, n = p.players, gap = 96 / n;
      const s = Math.min(.9, (gap * ar) / 34);
      for (let i = 0; i < n; i++) {
        const prop = p.kind === 2 ? (i % 2 ? 4 : 3) : (p.kind === 0 ? 3 : 4);
        fig(h, 2 + gap * (i + .5), p.row ? 50 : 34 + (i % 2) * 26, s, 0, { ar, prop });
      }
    });

  def('wNet', 'Village', 'Fishing', [O('kind', 'Kind', ['cast net', 'net between poles', 'basket trap'], 0), N('mesh', 'Mesh', 3, 12, 6), B('fish', 'Fish', true)],
    (h, p) => {
      const ar = p._ar || 1;
      if (p.kind === 0) {
        fig(h, 22, 52, .40, 8);
        const cx = 62, cy = 38, R = 30;
        for (let i = 0; i <= p.mesh; i++) {
          const t = Math.PI * .06 + (i / p.mesh) * Math.PI * .88;
          stroke(h, [cx, cy], [cx + Math.cos(t) * R / ar, cy + Math.sin(t) * R], .8);
        }
        for (let r = 1; r <= 3; r++) {
          const pts = [];
          for (let i = 0; i <= p.mesh; i++) { const t = Math.PI * .06 + (i / p.mesh) * Math.PI * .88; pts.push([cx + Math.cos(t) * R * r / 3 / ar, cy + Math.sin(t) * R * r / 3]); }
          h.curve(pts, { passes: 1, w: .8 });
        }
      }
      if (p.kind === 1) {
        stroke(h, [14, 20], [14, 86], 1.3); stroke(h, [86, 20], [86, 86], 1.3);
        for (let i = 0; i <= p.mesh; i++) { const y = 30 + i * (48 / p.mesh); stroke(h, [14, y], [86, y], .8); }
        for (let i = 0; i <= p.mesh; i++) { const x = 14 + i * (72 / p.mesh); stroke(h, [x, 30], [x, 78], .8); }
      }
      if (p.kind === 2) {
        blob(h, h.ring(50, 58, 30 / ar, 22, 16, 0, .02));
        for (let i = 0; i < p.mesh; i++) stroke(h, [50 - 28 / ar + i * (56 / ar / p.mesh), 40], [50 - 24 / ar + i * (48 / ar / p.mesh), 76], .8);
      }
      if (p.fish) { fishAt(h, 30, 90, .45); fishAt(h, 68, 94, .4); }
    });

  /* ============================================================
     BORDERS & PATTERN BANDS
     ------------------------------------------------------------
     A band FILLS its box. The old version drew a thin strip down
     the middle of a square and left the rest empty, which is why a
     border placed 8:1 looked like nothing at all. Now the motif
     height IS the row height, and the repeat count defaults to
     whatever keeps the motif square at the box's aspect.
     ============================================================ */
  const BAND_KINDS = ['triangles', 'alternating triangles', 'dots', 'comb', 'zigzag', 'diamonds',
    'chain', 'waves', 'chevrons', 'blocks', 'crosses', 'dancers', 'birds', 'trees', 'fish', 'huts'];

  function bandRow(h, x0, x1, y0, y1, ar, kind, rep, rules) {
    const W = x1 - x0, Hh = y1 - y0;
    const m = Hh * .08, top = y0 + m, bot = y1 - m, H = bot - top, mid = (top + bot) / 2;
    const span = W / rep;
    const unit = Math.min(H, span * ar);          // the motif's rendered size
    const cell = (x, y, w, hh2) => ({ x, y, w, h: hh2 });
    if (rules) { stroke(h, [x0, y0], [x1, y0], .9); stroke(h, [x0, y1], [x1, y1], .9); }
    for (let i = 0; i < rep; i++) {
      const a = x0 + i * span, b = a + span, mx = (a + b) / 2;
      switch (kind) {
        case 0: solid(h, [[a + span * .04, bot], [b - span * .04, bot], [mx, top]]); break;
        case 1: (i % 2) ? solid(h, [[a + span * .04, top], [b - span * .04, top], [mx, bot]])
          : solid(h, [[a + span * .04, bot], [b - span * .04, bot], [mx, top]]); break;
        case 2: { const ry = Math.min(H * .40, span * .40 * ar); disc(h, mx, mid, ry / ar, ry); break; }
        case 3: stroke(h, [mx, top], [mx, bot], 1); break;
        case 4: stroke(h, [a, bot], [mx, top], 1); stroke(h, [mx, top], [b, bot], 1); break;
        case 5: solid(h, [[mx, top], [b - span * .06, mid], [mx, bot], [a + span * .06, mid]]); break;
        case 6: h.ellipse(mx, mid, span * .46, H * .46, { passes: 1, exact: true }); break;
        case 7: h.curve([[a, mid + H * .3], [mx, top], [b, mid + H * .3]], { passes: 1 }); break;
        case 8: stroke(h, [a, bot], [mx, mid], 1); stroke(h, [mx, mid], [b, bot], 1);
          stroke(h, [a, mid], [mx, top], 1); stroke(h, [mx, top], [b, mid], 1); break;
        case 9: (i % 2 === 0)
          ? solid(h, [[a + span * .08, top], [b - span * .08, top], [b - span * .08, bot], [a + span * .08, bot]])
          : (stroke(h, [a + span * .08, top], [b - span * .08, bot], .9), stroke(h, [b - span * .08, top], [a + span * .08, bot], .9)); break;
        case 10: stroke(h, [a + span * .1, top], [b - span * .1, bot], 1); stroke(h, [b - span * .1, top], [a + span * .1, bot], 1); break;
        /* Composite motifs draw in local units and would run right across
           the band; stamp squeezes each one into its own cell instead. */
        case 11: fig(h, mx, mid, unit / 78, i % 2 ? 3 : 0, { ar }); break;
        case 12: h.stamp(cell(a, top, span, H), hh => birdAt(hh, 0, 0, 1), { ar }); break;
        case 13: h.stamp(cell(a, top, span, H), hh => treeAt(hh, 0, 24, 1, i % 3), { ar }); break;
        case 14: h.stamp(cell(a, top, span, H), hh => fishAt(hh, 0, 0, 1), { ar, pad: .8 }); break;
        case 15: h.stamp(cell(a, top, span, H), hh => hutAt(hh, 0, 22, 1, i % 3, 1), { ar }); break;
      }
    }
  }

  def('wBorder', 'Borders', 'Border band', [
    O('kind', 'Motif', BAND_KINDS, 0),
    N('repeat', 'Repeats — 0 fits automatically', 0, 60, 0),
    N('rows', 'Stacked bands', 1, 3, 1),
    O('second', 'Second band', ['same as the first'].concat(BAND_KINDS), 0),
    B('rules', 'Rules between', true),
  ], (h, p) => {
    const ar = p._ar || 1, rows = p.rows, rowH = 100 / rows;
    /* automatic: as many motifs as fit while staying roughly square */
    const auto = Math.max(3, Math.round(ar * rows * 1.35));
    const rep = p.repeat > 0 ? p.repeat : auto;
    for (let r = 0; r < rows; r++) {
      const kind = (r % 2 === 1 && p.second > 0) ? p.second - 1 : p.kind;
      bandRow(h, 0, 100, r * rowH, (r + 1) * rowH, ar, kind, rep, p.rules);
    }
  });

  def('wFrame', 'Borders', 'Frame', [
    O('kind', 'Motif', ['triangles', 'dots', 'comb', 'zigzag', 'diamonds', 'blocks'], 0),
    N('repeat', 'Teeth down the side', 3, 30, 10),
    N('inset', 'Inset', 0, 22, 6), B('rule', 'Rule', true), B('inward', 'Point inward', false),
  ], (h, p) => {
    /* A tooth must be the same size on every side, so both the counts
       and the tooth depth are corrected for the box aspect. */
    const ar = p._ar || 1, k = p.inset;
    const nV = Math.max(2, p.repeat), nH = Math.max(2, Math.round(p.repeat * ar));
    const spanH = (100 - k * 2) / nH, spanV = (100 - k * 2) / nV;
    const dH = Math.min(spanH * ar * .9, 6), dV = dH / ar;
    const sgn = p.inward ? -1 : 1;
    if (p.rule) h.curve([[k, k], [100 - k, k], [100 - k, 100 - k], [k, 100 - k]], { closed: true, sharp: true, passes: 1 });

    const edge = (n, span, horiz) => {
      const d = horiz ? dH : dV;
      const P = horiz ? (x, y) => [x, y] : (x, y) => [y, x];
      for (let i = 0; i < n; i++) {
        const a = k + i * span, b = a + span, m = (a + b) / 2;
        [[k, -1], [100 - k, 1]].forEach(([base, dir]) => {
          const tip = base + dir * d * sgn;
          if (p.kind === 0) solid(h, [P(a, base), P(b, base), P(m, tip)]);
          if (p.kind === 1) { const r = Math.min(span * .3, d * .55); const c = P(m, base); disc(h, c[0], c[1], horiz ? r : r / ar, horiz ? r * ar : r); }
          if (p.kind === 2) stroke(h, P(m, base - dir * d * .55 * sgn), P(m, tip), 1);
          if (p.kind === 3) { stroke(h, P(a, base), P(m, tip), 1); stroke(h, P(m, tip), P(b, base), 1); }
          if (p.kind === 4) solid(h, [P(m, base - dir * d * .8 * sgn), P((m + b) / 2, base), P(m, tip), P((a + m) / 2, base)]);
          if (p.kind === 5 && i % 2 === 0) solid(h, [P(a, base), P(b, base), P(b, tip), P(a, tip)]);
        });
      }
    };
    edge(nH, spanH, true);
    edge(nV, spanV, false);
  });

  /* ============================================================
     THE WOVEN FIELD
     Warli's real form is not a single motif — it is a whole wall
     with everything at one scale and no empty middle. This builds
     one, deterministically, from the item's seed.
     ============================================================ */
  def('wScene', 'Compositions', 'Village field', [
    N('density', 'How full', 4, 30, 14),
    O('mix', 'Mostly', ['everything', 'people', 'animals', 'huts & trees'], 0),
    B('border', 'Border bands', true), B('ground', 'Ground lines', false),
  ], (h, p) => {
    const ar = p._ar || 1;
    const top = p.border ? 13 : 3, bot = p.border ? 87 : 97;
    if (p.border) {
      const rep = Math.max(4, Math.round(ar * 7));
      bandRow(h, 0, 100, 0, 10, ar, 0, rep, true);
      bandRow(h, 0, 100, 90, 100, ar, 0, rep, true);
    }
    /* a loose jittered grid — Warli fills a wall, it does not compose one */
    const n = p.density;
    const cols = Math.max(2, Math.round(Math.sqrt(n * ar)));
    const rows = Math.max(1, Math.ceil(n / cols));
    const cw = 100 / cols, ch = (bot - top) / rows;
    const s = Math.min(.42, Math.min(cw * ar, ch) / 62);
    let k = 0;
    for (let r = 0; r < rows && k < n; r++) {
      for (let c = 0; c < cols && k < n; c++, k++) {
        const cx = cw * (c + .5) + h.j(cw * .16), cy = top + ch * (r + .5) + h.j(ch * .14);
        const pick = h.rng();
        if (p.mix === 1 || (p.mix === 0 && pick < .42)) {
          fig(h, cx, cy, s, (h.rng() * POSES.length) | 0, { ar, prop: h.rng() > .78 ? 1 + ((h.rng() * 4) | 0) : 0 });
        } else if (p.mix === 2 || (p.mix === 0 && pick < .66)) {
          beastAt(h, cx, cy, s * .72, (h.rng() * BEASTS.length) | 0);
        } else if (p.mix === 3 || pick < .86) {
          if (h.rng() > .5) hutAt(h, cx, cy + 16 * s, s * .8, (h.rng() * 3) | 0, 1);
          else treeAt(h, cx, cy + 20 * s, s * .82, (h.rng() * 4) | 0);
        } else {
          if (h.rng() > .5) birdAt(h, cx, cy, s * .6); else fishAt(h, cx, cy, s * .5);
        }
        if (p.ground) stroke(h, [cx - cw * .45, top + ch * (r + 1) - 1], [cx + cw * .45, top + ch * (r + 1) - 1], .7);
      }
    }
  });

  /* Pieces that stretch, and how big they want to be when placed.
     `place` is a fraction of the board — a border wants to arrive as a
     border, not as a square with a stripe in it. */
  ['wChain', 'wBorder', 'wFrame', 'wRiver', 'wHill', 'wScene', 'wDrum', 'wNet', 'wLadder'].forEach(k => { G[k].aspect = 'free'; });
  G.wBorder.place = { w: .92, h: .11 };
  G.wChain.place = { w: .88, h: .26 };
  G.wDrum.place = { w: .8, h: .28 };
  G.wRiver.place = { w: .9, h: .22 };
  G.wHill.place = { w: .9, h: .26 };
  G.wFrame.place = { w: .86, h: .86 };
  G.wScene.place = { w: .9, h: .62 };
  G.wNet.place = { w: .5, h: .5 };
  G.wLadder.place = { w: .34, h: .6 };

  window.SCRAWL.WARLI = { fig, beastAt, treeAt, hutAt, birdAt, fishAt, bandRow, BAND_KINDS, POSE_NAMES, PROP_NAMES, BEASTS };
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
