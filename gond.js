/* ============================================================
   MOTIFS / gond — the Gond visual grammar
   ------------------------------------------------------------
   Gond is the opposite discipline to Warli, and the code has to
   be built the opposite way round.

   Warli fills a silhouette and draws nothing inside it. Gond
   draws a clean continuous OUTLINE and then packs the inside
   with a signature — a repeated small mark that belongs to the
   painter, not to the subject. Jangarh Singh Shyam's dots, a
   comb of rake lines, rows of crescents, seeds, fish-scales.
   Change the signature and the same deer is a different
   painter's deer. That is the whole tradition in one dial, so
   `sig` is a parameter on nearly every generator here.

   Three rules the code has to keep:

   1. EVERY FORM IS A TUBE. A deer, a branch, a snake, an arm are
      all a spine of [x, y, radius] swept into a closed contour.
      One builder (`tube`) makes all of them, so a body always
      closes cleanly and the signature always has somewhere to
      live. Nothing here is a polygon with corners — Gond has no
      corners.

   2. THE SIGNATURE IS CLIPPED, NEVER PAINTED FREEHAND. `infill`
      takes the contour's own continuous path as a clip and lays
      the pattern across its bounding box. Marks that wander
      outside the animal are the one thing that reads instantly
      as wrong.

   3. PANELS BEFORE FILLS. A Gond body is divided into bands and
      each band gets its own signature. `panels` cuts the contour
      with chords and fills the pieces separately, which is why
      an elephant here has a striped flank and not one flat
      texture.
   ============================================================ */
(function () {
  const { TAU } = window.SCRAWL;
  const G = window.SCRAWL.GENS;
  const D = Math.PI / 180;

  function def(key, cat, label, params, draw) {
    G[key] = { key, cat, label, params, draw, style: 'gond', aspect: 'square' };
  }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ============================================================
     THE SIGNATURE
     ------------------------------------------------------------
     Ten fill vocabularies. Each one is handed the bounding box of
     the shape it is filling and a step size; the caller has
     already clipped. `step` is in box units, so a signature is the
     same size in a small bird and a large elephant — which is
     correct: the mark belongs to the hand, not to the subject.
     ============================================================ */
  const SIG_NAMES = ['dots', 'comb', 'crescents', 'scales', 'seeds',
    'chevrons', 'dashes', 'rings', 'ripples', 'plain'];

  function sigMarks(h, bb, kind, step, ang) {
    const [x, y, w, hh] = bb;
    const a = (ang || 0) * D, ca = Math.cos(a), sa = Math.sin(a);
    /* work in a rotated frame that is guaranteed to cover the box */
    const R = Math.hypot(w, hh) * 0.62, cx = x + w / 2, cy = y + hh / 2;
    const T = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
    const span = R * 2;
    const rowKind = (kind === 1 || kind === 8);

    /* A signature finer than the eye can separate is not a finer
       signature, it is a grey wash — and at poster scale it turns to
       mush, the same reason the engine clamps jitter. So the mark
       budget is fixed and the step opens up to meet it, rather than
       the generator emitting ten thousand invisible ellipses. */
    const det = h.detail ?? 1;
    let g = Math.max(0.6, step / Math.max(.25, det));
    if (rowKind) { const cap = Math.max(8, 110 * det); if (span / g > cap) g = span / cap; }
    else {
      const cap = Math.max(36, 900 * det);            // marks, not rows
      const side = Math.sqrt(cap);
      if (span / g > side) g = span / side;
    }

    const rows = Math.ceil(span / g), cols = Math.ceil(span / g);
    const acc = { role: 'accent', fill: 'accent' };
    const accLine = { role: 'accent', passes: 1, w: 0.55 };
    /* the rotated frame circumscribes the box, so a third of every
       sweep lands outside the clip. Drop those before drawing them. */
    const support = (Math.abs(sa) * w + Math.abs(ca) * hh) / 2 + g;
    const inBox = p => p[0] > x - g && p[0] < x + w + g && p[1] > y - g && p[1] < y + hh + g;

    for (let r = 0; r <= rows; r++) {
      const v = -R + r * g;
      if (Math.abs(v) > support) continue;
      const stagger = (r % 2) ? g / 2 : 0;

      if (kind === 1) {                                   // comb — unbroken rake lines
        const p0 = T(-R, v), p1 = T(R, v);
        h.line(p0[0], p0[1], p1[0], p1[1], accLine);
        continue;
      }
      if (kind === 8) {                                   // ripples — one wavy line per row
        const pts = [];
        for (let i = 0; i <= 18; i++) {
          const u = -R + (i / 18) * R * 2;
          pts.push(T(u, v + Math.sin(i / 18 * TAU * 2.2 + r) * g * 0.3));
        }
        h.curve(pts, accLine);
        continue;
      }

      for (let c = 0; c <= cols; c++) {
        const u = -R + c * g + stagger;
        const p = T(u, v);
        if (!inBox(p)) continue;
        switch (kind) {
          case 0: h.dot(p[0], p[1], g * 0.19, acc); break;                     // dots
          case 2: {                                                            // crescents
            const arc = h.arcPts(p[0], p[1], g * 0.34, g * 0.34, Math.PI + a, TAU + a, 6);
            h.curve(arc, accLine); break;
          }
          case 3: {                                                            // fish scales
            const arc = h.arcPts(p[0], p[1], g * 0.5, g * 0.42, Math.PI + a, TAU + a, 8);
            h.curve(arc, accLine); break;
          }
          case 4: {                                                            // seeds
            const q = [];
            for (let i = 0; i <= 8; i++) {
              const t = (i / 8) * TAU;
              q.push(T(u + Math.cos(t) * g * 0.16, v + Math.sin(t) * g * 0.32));
            }
            h.curve(q, { closed: true, role: 'accent', fill: 'accent', passes: 1 });
            break;
          }
          case 5: {                                                            // chevrons
            const l = T(u - g * 0.28, v + g * 0.22), m = T(u, v - g * 0.22), rr = T(u + g * 0.28, v + g * 0.22);
            h.curve([l, m, rr], accLine); break;
          }
          case 6: {                                                            // dashes
            const p0 = T(u - g * 0.3, v), p1 = T(u + g * 0.3, v);
            h.line(p0[0], p0[1], p1[0], p1[1], accLine); break;
          }
          case 7: h.ellipse(p[0], p[1], g * 0.26, g * 0.26, { role: 'accent', passes: 1, w: 0.5, exact: true }); break;
        }
      }
    }
  }

  /* Outline a contour and pack it with a signature.
     `h.shape(pts, {outline:false, forceFill:'none'})` draws nothing but
     leaves the tidy continuous path in `h.lastD`, which is exactly the
     clip the signature needs. */
  function skin(h, pts, o) {
    o = o || {};
    const sig = o.sig === undefined ? 0 : o.sig;
    /* Building the clip is not free, so an unfilled shape — 'plain', or
       a stalk drawn with sig -1 — never asks for one. */
    let clip = null;
    if (sig >= 0 && sig < SIG_NAMES.length - 1) {
      h.shape(pts, { outline: false, forceFill: 'none' });
      clip = h.lastD;
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const bb = [Math.min(...xs), Math.min(...ys),
      Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
      h.clipStart(clip);
      sigMarks(h, bb, sig, o.step || 5, o.ang || 0);
      h.clipEnd();
    }
    if (o.outline !== false) {
      h.curve(pts, { closed: true, passes: o.passes || 1, w: o.w || 1.15, role: o.role || 'line' });
    }
    return clip;
  }

  /* ============================================================
     THE TUBE
     ------------------------------------------------------------
     spine: [[x, y, r], ...]. Offsetting each point along the local
     normal and walking back down the other side gives a closed
     contour with no corners — the shape of every living thing in
     this pack.
     ============================================================ */
  function tube(spine, capA, capB) {
    const n = spine.length;
    if (n < 2) return [];
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const p = spine[i];
      const q = spine[Math.min(i + 1, n - 1)], o = spine[Math.max(i - 1, 0)];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const len = Math.hypot(dx, dy) || 1e-4; dx /= len; dy /= len;
      L.push([p[0] - dy * p[2], p[1] + dx * p[2]]);
      R.push([p[0] + dy * p[2], p[1] - dx * p[2]]);
    }
    /* round the ends when they are blunt, so a body reads as a body
       and not as a cut pipe */
    const cap = (i, j, rev) => {
      const p = spine[i], q = spine[j];
      if (p[2] < 0.4) return [];
      let dx = p[0] - q[0], dy = p[1] - q[1];
      const len = Math.hypot(dx, dy) || 1e-4; dx /= len; dy /= len;
      const a0 = Math.atan2(dx, -dy), out = [];
      for (let k = 1; k < 6; k++) {
        const t = a0 + (rev ? -1 : 1) * (k / 6) * Math.PI;
        out.push([p[0] + Math.cos(t) * p[2], p[1] + Math.sin(t) * p[2]]);
      }
      return out;
    };
    const endCap = capB === false ? [] : cap(n - 1, n - 2, true);
    const startCap = capA === false ? [] : cap(0, 1, true);
    return L.concat(endCap, R.reverse(), startCap);
  }

  /* a spine from a list of [x, y] plus a radius profile 0..1 */
  function spine(pts, r0, r1, bulge) {
    const n = pts.length;
    return pts.map((p, i) => {
      const u = n < 2 ? 0 : i / (n - 1);
      const b = bulge === undefined ? 0 : bulge * Math.sin(u * Math.PI);
      return [p[0], p[1], r0 + (r1 - r0) * u + b];
    });
  }

  /* a limb: two segments with a bend, tapering to the foot */
  function limb(h, a, knee, foot, r, o) {
    const s = [[a[0], a[1], r], [knee[0], knee[1], r * 0.7], [foot[0], foot[1], r * 0.42]];
    skin(h, tube(s, false, true), o);
  }

  /* an eye — the one solid mark Gond allows inside an outline */
  function eye(h, x, y, r) {
    h.ellipse(x, y, r, r, { role: 'line', passes: 1, w: 0.8, exact: true });
    h.dot(x, y, r * 0.42, { role: 'line', fill: 'line' });
  }

  /* ============================================================
     FIGURES
     ============================================================ */
  const F_POSES = ['standing', 'walking', 'dancing', 'seated', 'reaching', 'carrying'];

  function person(h, cx, cy, s, pose, o) {
    o = o || {};
    const ar = o.ar || 1;
    const P = (u, v) => [cx + u * s / ar, cy + v * s];
    const sg = { sig: o.sig, step: (o.step || 5) * s, ang: o.ang || 0 };
    const pz = ((pose % F_POSES.length) + F_POSES.length) % F_POSES.length;

    /* torso — a tube that narrows at the waist and flares at the hip */
    const lean = pz === 1 ? 3 : pz === 2 ? -4 : 0;
    const torso = [[lean, -22, 7.5], [lean * .6, -12, 8.6], [0, -2, 6.2], [-lean * .4, 8, 8.2]].map(p => {
      const q = P(p[0], p[1]); return [q[0], q[1], p[2] * s / Math.sqrt(ar)];
    });
    skin(h, tube(torso), sg);

    /* head — an egg, not a circle */
    const hd = P(lean * 1.2, -32);
    const hr = 6.4 * s;
    const headPts = [];
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * TAU;
      headPts.push([hd[0] + Math.cos(t) * hr * 0.86 / ar, hd[1] + Math.sin(t) * hr * (t > Math.PI ? 1.06 : 0.94)]);
    }
    skin(h, headPts, sg);
    eye(h, hd[0] - 1.6 * s / ar, hd[1] - 0.8 * s, 1.5 * s);

    /* headdress — a fan of plumes, the Gond answer to Warli's top knot */
    if (o.crown) {
      for (let i = 0; i < 5; i++) {
        const t = -Math.PI * 0.82 + (i / 4) * Math.PI * 0.64;
        const tip = [hd[0] + Math.cos(t) * hr * 2.5 / ar, hd[1] + Math.sin(t) * hr * 2.5];
        const base = [hd[0] + Math.cos(t) * hr * 0.9 / ar, hd[1] + Math.sin(t) * hr * 0.9];
        skin(h, tube([[base[0], base[1], 1.5 * s], [tip[0], tip[1], 0.3 * s]], false, false),
          { sig: -1, w: 0.9 });
      }
    }

    /* arms and legs — joint tables, one row per pose */
    const A = [
      /* standing */[[-13, -12], [-15, 2], [13, -12], [15, 2]],
      /* walking  */[[-14, -12], [-17, -1], [13, -14], [17, -22]],
      /* dancing  */[[-15, -26], [-19, -36], [15, -26], [19, -36]],
      /* seated   */[[-13, -10], [-16, 1], [13, -10], [16, 1]],
      /* reaching */[[-12, -10], [-14, 3], [16, -22], [24, -30]],
      /* carrying */[[-14, -21], [-21, -24], [14, -21], [21, -24]],
    ][pz];
    const Lg = [
      [[-6, 22], [-7, 38], [6, 22], [7, 38]],
      [[-10, 21], [-15, 37], [6, 23], [9, 38]],
      [[-11, 21], [-15, 36], [11, 21], [15, 36]],
      [[-14, 18], [-3, 27], [14, 18], [3, 27]],
      [[-7, 22], [-8, 38], [7, 22], [8, 38]],
      [[-6, 22], [-7, 38], [6, 22], [7, 38]],
    ][pz];
    const armR = 2.5 * s, legR = 3 * s;
    limb(h, P(-6, -19), P(A[0][0], A[0][1]), P(A[1][0], A[1][1]), armR, sg);
    limb(h, P(6, -19), P(A[2][0], A[2][1]), P(A[3][0], A[3][1]), armR, sg);
    limb(h, P(-4, 8), P(Lg[0][0], Lg[0][1]), P(Lg[1][0], Lg[1][1]), legR, sg);
    limb(h, P(4, 8), P(Lg[2][0], Lg[2][1]), P(Lg[3][0], Lg[3][1]), legR, sg);

    if (pz === 5) {                                  // a pot carried on the head
      const c = P(lean * 1.2, -44);
      skin(h, h.ring(c[0], c[1], 8 * s / ar, 5.5 * s, 14, 0, .02), sg);
    }
    return { hand: [P(A[1][0], A[1][1]), P(A[3][0], A[3][1])], head: hd };
  }

  def('gFigure', 'Figures', 'Figure', [
    O('pose', 'Pose', F_POSES, 0),
    O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 12, 5),
    B('crown', 'Plumed headdress', false),
  ], (h, p) => {
    const ar = p._ar || 1;
    h.fitDraw({ x: 5, y: 4, w: 90, h: 92 }, (hh, cx, cy, s) =>
      person(hh, cx, cy, s, p.pose, { ar, sig: p.sig, step: p.dens, crown: p.crown }));
  });

  def('gDancers', 'Figures', 'Dancers', [
    N('people', 'People', 2, 8, 4), O('pose', 'Pose', ['dancing', 'standing', 'walking'], 0),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 12, 5),
    B('joined', 'Hands joined', true),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = p.people, gap = 96 / n;
    const s = Math.min(1.1, (gap * ar) / 34);
    const pose = [2, 0, 1][p.pose];
    const made = [];
    for (let i = 0; i < n; i++) {
      made.push(person(h, 2 + gap * (i + .5), 56, s, pose, { ar, sig: p.sig, step: p.dens }));
    }
    if (p.joined) for (let i = 0; i < n - 1; i++) {
      const a = made[i].hand[1], b = made[i + 1].hand[0];
      h.line(a[0], a[1], b[0], b[1], { passes: 1, w: Math.max(.6, s) });
    }
  });

  /* ============================================================
     ANIMALS
     ------------------------------------------------------------
     One quadruped, six proportions. Body, neck and head are one
     continuous spine so the contour never shows a seam; the legs
     are separate tubes drawn behind it.
     ============================================================ */
  const BEASTS = ['deer', 'tiger', 'elephant', 'horse', 'bull', 'boar', 'monkey', 'dog'];

  /* [bodyLen, bodyR, neckUp, headR, legLen, tail, ears] */
  const BEAST_P = {
    0: { len: 30, r: 9, neck: 20, hr: 5.0, leg: 20, tail: 9, horn: 'antler' },
    1: { len: 34, r: 11, neck: 8, hr: 6.4, leg: 16, tail: 18, horn: null },
    2: { len: 34, r: 14, neck: 8, hr: 8.0, leg: 19, tail: 8, horn: 'trunk' },
    3: { len: 32, r: 10, neck: 18, hr: 5.6, leg: 21, tail: 12, horn: 'mane' },
    4: { len: 32, r: 12, neck: 12, hr: 6.2, leg: 17, tail: 13, horn: 'horns' },
    5: { len: 28, r: 11, neck: 7, hr: 6.0, leg: 13, tail: 6, horn: 'tusk' },
    6: { len: 22, r: 8, neck: 12, hr: 5.4, leg: 15, tail: 20, horn: null },
    7: { len: 27, r: 8, neck: 12, hr: 4.8, leg: 15, tail: 11, horn: null },
  };

  function beast(h, cx, cy, s, kind, o) {
    o = o || {};
    const ar = o.ar || 1;
    const k = ((kind % BEASTS.length) + BEASTS.length) % BEASTS.length;
    const B_ = BEAST_P[k];
    const P = (u, v) => [cx + u * s / ar, cy + v * s];
    const R = r => r * s / Math.sqrt(ar);
    const sg = { sig: o.sig, step: (o.step || 5) * s, ang: o.ang || 0 };

    const L = B_.len, r = B_.r;
    /* legs first, so the body outline sits over their tops */
    const lg = B_.leg;
    [-L * .32, L * .30].forEach((hx, i) => {
      [-1, 1].forEach(side => {
        const off = side * L * .07;
        limb(h, P(hx + off, r * .6), P(hx + off + side * 1.5, r * .6 + lg * .55),
          P(hx + off + side * 2.5, r * .6 + lg), R(r * .30), sg);
      });
    });

    /* body + neck + head as one spine */
    const neckUp = B_.neck;
    const sp = [
      [-L * .5, 0, R(r * .72)],
      [-L * .22, -r * .1 * s, R(r)],
      [L * .12, -r * .12 * s, R(r * .95)],
      [L * .40, -r * .3 * s, R(r * .72)],
      [L * .50, -(r * .3 + neckUp * .45) * s, R(r * .48)],
      [L * .56, -(r * .3 + neckUp * .9) * s, R(B_.hr * .78)],
    ].map((q, i) => i < 4 ? [cx + q[0] * s / ar, cy + q[1], q[2]] : [cx + q[0] * s / ar, cy + q[1], q[2]]);
    skin(h, tube(sp), sg);

    /* head — an egg on the end of the neck, pointing forward */
    const hd = P(L * .62, -(r * .3 + neckUp) - B_.hr * .2);
    const hr = B_.hr * s;
    const hp = [];
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * TAU;
      hp.push([hd[0] + Math.cos(t) * hr * 1.22 / ar, hd[1] + Math.sin(t) * hr * 0.86]);
    }
    skin(h, hp, sg);
    eye(h, hd[0] + hr * .35 / ar, hd[1] - hr * .18, Math.max(.5, hr * .22));

    /* tail */
    const tl = B_.tail;
    const tp = [];
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      tp.push([cx + (-L * .5 - tl * u) * s / ar,
      cy + (-r * .3 + Math.sin(u * Math.PI * .8) * tl * .55) * s,
      R(r * .22 * (1 - u * .7))]);
    }
    skin(h, tube(tp, false, true), { sig: -1, w: 1 });

    /* the piece that says which animal this is */
    switch (B_.horn) {
      case 'antler': {
        for (let side = -1; side <= 1; side += 2) {
          const base = [hd[0] + side * hr * .3 / ar, hd[1] - hr * .7];
          const tip = [base[0] + side * hr * 1.5 / ar, base[1] - hr * 2.4];
          skin(h, tube([[base[0], base[1], R(1.1)], [tip[0], tip[1], R(.3)]], false, false), { sig: -1, w: .9 });
          for (let b = 1; b <= 2; b++) {
            const f = b / 3;
            const a0 = [base[0] + (tip[0] - base[0]) * f, base[1] + (tip[1] - base[1]) * f];
            h.line(a0[0], a0[1], a0[0] + side * hr * .9 / ar, a0[1] - hr * .8, { passes: 1, w: .8 });
          }
        }
        break;
      }
      case 'horns': {
        /* one horn sweeps forward, one back — a hairline arc disappears
           at thumbnail size, so both are tapered tubes like every other
           limb in the pack */
        [1, -1].forEach(dir => {
          const bx = hd[0] - hr * .2 / ar, by = hd[1] - hr * .55;
          const sp0 = [];
          for (let q = 0; q <= 6; q++) {
            const u = q / 6;
            sp0.push([bx + dir * u * hr * 1.4 / ar,
            by - u * hr * 1.8 - dir * u * u * hr * .35,
            R(1.7 * (1 - u * .8))]);
          }
          skin(h, tube(sp0, false, false), { sig: -1, w: .9 });
        });
        break;
      }
      case 'trunk': {
        const tr = [];
        for (let i = 0; i <= 7; i++) {
          const u = i / 7;
          tr.push([hd[0] + (hr * 1.1 + Math.sin(u * Math.PI * .7) * hr * .7) / ar,
          hd[1] + hr * .3 + u * hr * 3.2, R(1.9 * (1 - u * .65))]);
        }
        skin(h, tube(tr, false, true), sg);
        /* the ear is the elephant: a panelled fan set BACK on the head,
           so the eye and the trunk still read */
        const ear = [];
        for (let i = 0; i < 14; i++) {
          const t = (i / 14) * TAU;
          ear.push([hd[0] - hr * 1.3 / ar + Math.cos(t) * hr * .9 / ar, hd[1] + hr * .25 + Math.sin(t) * hr * 1.1]);
        }
        skin(h, ear, { sig: o.sig, step: (o.step || 5) * s * .7 });
        [-.25, .25].forEach(off => {                             // tusks
          const b0 = [hd[0] + hr * .75 / ar, hd[1] + hr * (.45 + off)];
          skin(h, tube([[b0[0], b0[1], R(1.3)],
          [b0[0] + hr * 1.1 / ar, b0[1] + hr * .55, R(.9)],
          [b0[0] + hr * 1.9 / ar, b0[1] + hr * .25, R(.3)]], false, false), { sig: -1, w: .9 });
        });
        break;
      }
      case 'mane': {
        for (let i = 0; i <= 6; i++) {
          const u = i / 6;
          const a0 = [sp[4][0] + (sp[5][0] - sp[4][0]) * u, sp[4][1] + (sp[5][1] - sp[4][1]) * u];
          h.line(a0[0], a0[1], a0[0] - hr * .9 / ar, a0[1] - hr * .55, { passes: 1, w: .7, role: 'accent' });
        }
        break;
      }
      case 'tusk': {
        h.curve([[hd[0] + hr / ar, hd[1] + hr * .3], [hd[0] + hr * 1.3 / ar, hd[1] - hr * .2],
        [hd[0] + hr * 1.1 / ar, hd[1] - hr * .8]], { passes: 1, w: 1 });
        break;
      }
    }
    /* Ears, for everything that is not an elephant. The animal is in
       profile, so the far ear sits BEHIND the near one along the head
       axis — offsetting them in y instead stacks them into one spike. */
    if (B_.horn !== 'trunk') {
      [[.10, .10], [.62, .42]].forEach(([back, splay]) => {
        const b0 = [hd[0] - hr * back / ar, hd[1] - hr * .5];
        skin(h, tube([[b0[0], b0[1], R(1.6)],
        [b0[0] - hr * splay / ar, b0[1] - hr * 1.5, R(.4)]], false, false),
          { sig: -1, w: .85 });
      });
    }
    return { head: hd, back: [cx, cy - r * s], len: L * s };
  }

  def('gBeast', 'Animals', 'Animal', [
    O('kind', 'Kind', BEASTS, 0),
    O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 12, 5),
    N('ang', 'Signature angle', 0, 180, 0),
  ], (h, p) => {
    const ar = p._ar || 1;
    h.fitDraw({ x: 4, y: 6, w: 92, h: 88 }, (hh, cx, cy, s) =>
      beast(hh, cx, cy, s, p.kind, { ar, sig: p.sig, step: p.dens, ang: p.ang }));
  });

  def('gHerd', 'Animals', 'Herd', [
    N('count', 'Animals', 2, 6, 3), O('kind', 'Kind', BEASTS, 0),
    O('lay', 'Arranged', ['in a row', 'stepped', 'facing in'], 0),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 12, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = p.count, gap = 96 / n;
    const s = Math.min(.9, (gap * ar) / 46);
    for (let i = 0; i < n; i++) {
      const y = p.lay === 1 ? 40 + (i % 2 ? 16 : -6) : 50;
      beast(h, 2 + gap * (i + .5), y, s, p.kind,
        { ar, sig: p.sig, step: p.dens, flip: p.lay === 2 && i >= n / 2 });
    }
  });

  def('gSnake', 'Animals', 'Serpent', [
    O('lay', 'Shape', ['waving', 'coiled', 'rising'], 0),
    N('waves', 'Waves', 2, 8, 4), O('sig', 'Signature', SIG_NAMES, 3),
    N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { sig: p.sig, step: p.dens };
    const sp = [];
    const M = 34;
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      let x, y;
      if (p.lay === 1) {                                  // coiled — a shrinking spiral
        const t = u * TAU * 2.1, rr = 40 * (1 - u * .78);
        x = 50 + Math.cos(t) * rr / ar; y = 50 + Math.sin(t) * rr * .8;
      } else if (p.lay === 2) {                           // rising
        x = 50 + Math.sin(u * Math.PI * p.waves) * 26 / ar; y = 94 - u * 84;
      } else {                                            // waving across
        x = 6 + u * 88 / ar * ar; y = 50 + Math.sin(u * Math.PI * p.waves) * 26;
      }
      sp.push([x, y, 6.5 * (1 - u * .72) + 1]);
    }
    skin(h, tube(sp, true, false), sg);
    const hd = sp[0];
    const hp = [];
    for (let i = 0; i < 12; i++) {
      const t = (i / 12) * TAU;
      hp.push([hd[0] + Math.cos(t) * 7 / ar, hd[1] + Math.sin(t) * 5.4]);
    }
    skin(h, hp, sg);
    eye(h, hd[0] + 2 / ar, hd[1] - 1.4, 1.4);
    h.line(hd[0] + 6 / ar, hd[1] + 1, hd[0] + 12 / ar, hd[1] + 3, { passes: 1, w: .7 });
  });

  def('gTurtle', 'Animals', 'Turtle', [
    N('rings', 'Shell rings', 1, 4, 2), O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 10, 4), N('plates', 'Shell plates', 4, 12, 7),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { sig: p.sig, step: p.dens };
    /* flippers and head first */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const b0 = [50 + sx * 26 / ar, 50 + sy * 20];
      skin(h, tube([[b0[0], b0[1], 5], [b0[0] + sx * 16 / ar, b0[1] + sy * 14, 2.5]], false, true), sg);
    });
    const hd = [50 + 40 / ar, 50];
    skin(h, h.ring(hd[0], hd[1], 8 / ar, 6.5, 12), sg);
    eye(h, hd[0] + 2 / ar, hd[1] - 1.6, 1.4);
    skin(h, tube([[50 - 30 / ar, 50, 3.4], [50 - 42 / ar, 50, 1]], false, false), { sig: -1 });
    /* the shell — concentric bands, each with its own signature */
    const rings = Math.max(1, p.rings);
    for (let r = rings; r >= 1; r--) {
      const f = r / rings;
      skin(h, h.ring(50, 50, 34 * f / ar, 27 * f, 20),
        { sig: r % 2 ? p.sig : (p.sig + 3) % (SIG_NAMES.length - 1), step: p.dens * f });
    }
    /* plate divisions read as spokes on the outer band */
    const n = Math.max(3, p.plates);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      h.line(50 + Math.cos(t) * 34 / rings / ar, 50 + Math.sin(t) * 27 / rings,
        50 + Math.cos(t) * 34 / ar, 50 + Math.sin(t) * 27, { passes: 1, w: .8 });
    }
  });

  def('gFish', 'Animals', 'Fish', [
    N('count', 'Fish', 1, 6, 3), O('lay', 'Arranged', ['in a row', 'shoaling', 'facing'], 0),
    O('sig', 'Signature', SIG_NAMES, 3), N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = p.count;
    const one = (cx, cy, s, dir) => {
      const sg = { sig: p.sig, step: p.dens * s };
      const bp = [];
      for (let i = 0; i < 16; i++) {
        const t = (i / 16) * TAU;
        bp.push([cx + Math.cos(t) * 20 * s * dir / ar, cy + Math.sin(t) * 10 * s]);
      }
      skin(h, bp, sg);
      /* The contour is smoothed, so a three-point tail rounds off into a
         paddle. Repeating a point pulls the curve tight against it, which
         is how the fork and the fin tips stay sharp. */
      const X = u => cx + u * s * dir / ar, Y = v => cy + v * s;
      skin(h, [[X(-19), Y(-3)], [X(-32), Y(-13)], [X(-32), Y(-13)],
      [X(-25), Y(0)], [X(-32), Y(13)], [X(-32), Y(13)], [X(-19), Y(3)]], sg);
      skin(h, [[X(-4), Y(-9)], [X(1), Y(-17)], [X(1), Y(-17)], [X(8), Y(-8)]], sg);
      skin(h, [[X(-2), Y(9)], [X(2), Y(14)], [X(2), Y(14)], [X(7), Y(8)]], sg);
      eye(h, X(12), Y(-2), Math.max(.6, 1.7 * s));
    };
    if (n === 1) { one(50, 50, 1.9, 1); return; }
    /* A fish reaches from -32 to +20 across and ±19 down at scale 1, so
       the scale comes from the slot it has to sit in. Sizing from the
       column count alone piles a row of six on top of each other. */
    if (p.lay === 0) {
      const w = 92 / n;
      for (let i = 0; i < n; i++) one(4 + w * (i + .5), 50, Math.min(1.5, w / 54), 1);
      return;
    }
    const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
    const s = Math.min(1.4, Math.min((88 / cols) / 54, (78 / rows) / 40));
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = (i / cols) | 0;
      one(6 + (c + .5) * (88 / cols), 12 + (r + .5) * (78 / rows), s, p.lay === 2 && i % 2 ? -1 : 1);
    }
  });

  /* ============================================================
     BIRDS — what Gond is best known for
     ============================================================ */
  const BIRDS = ['bird', 'peacock', 'hornbill', 'owl', 'crane', 'flying'];

  function bird(h, cx, cy, s, kind, o) {
    o = o || {};
    const ar = o.ar || 1;
    const k = ((kind % BIRDS.length) + BIRDS.length) % BIRDS.length;
    const sg = { sig: o.sig, step: (o.step || 5) * s };
    const P = (u, v) => [cx + u * s / ar, cy + v * s];
    const R = r => r * s / Math.sqrt(ar);

    if (k === 5) {                                        // flying — wings spread wide
      const bp = [];
      for (let i = 0; i < 14; i++) { const t = (i / 14) * TAU; bp.push(P(Math.cos(t) * 13, Math.sin(t) * 7)); }
      skin(h, bp, sg);
      for (let side = -1; side <= 1; side += 2) {
        skin(h, [P(0, -3), P(side * 22, -20), P(side * 40, -14), P(side * 24, 0), P(side * 8, 4)], sg);
      }
      const hd = P(15, -8);
      skin(h, h.ring(hd[0], hd[1], 6 * s / ar, 5.4 * s, 12), sg);
      eye(h, hd[0] + 1.6 * s / ar, hd[1] - 1, Math.max(.5, 1.4 * s));
      h.curve([P(20, -7), P(28, -5), P(20, -3)], { passes: 1, w: .9 });
      return;
    }

    /* legs */
    for (let side = -1; side <= 1; side += 2) {
      const x = 2 + side * 4;
      h.line(...P(x, 10), ...P(x + side * 2, 10 + (k === 4 ? 26 : 12)), { passes: 1, w: R(.9) });
      h.line(...P(x + side * 2, 10 + (k === 4 ? 26 : 12)), ...P(x + side * 5, 12 + (k === 4 ? 27 : 13)), { passes: 1, w: R(.7) });
    }
    /* body — an upright egg */
    const bodyH = k === 3 ? 17 : 15, bodyW = k === 3 ? 14 : 11;
    const bp = [];
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * TAU;
      bp.push(P(Math.cos(t) * bodyW, Math.sin(t) * bodyH * (Math.sin(t) < 0 ? .9 : 1)));
    }
    skin(h, bp, sg);
    /* Wing — a panel carrying its own signature, the way Gond birds are
       built. A blunt closed polygon smooths into a blob, so it is a
       pointed leaf swept back and down along its own axis. */
    {
      const wing = [], wa = 38 * D, cw = Math.cos(wa), sw = Math.sin(wa);
      for (let i = 0; i <= 24; i++) {
        const u = i / 24, t = u * TAU;
        const half = Math.sin(u * Math.PI) * 5.6;
        const lx = Math.cos(t) * half, ly = (u - .5) * 23;
        wing.push(P(1 + lx * cw - ly * sw, -1 + lx * sw + ly * cw));
      }
      skin(h, wing, { sig: (o.sig + 4) % (SIG_NAMES.length - 1), step: (o.step || 5) * s * .8, w: 1 });
    }

    /* neck + head */
    const neck = k === 4 ? 24 : k === 2 ? 12 : 9;
    skin(h, tube([[...P(3, -12), R(4)], [...P(5, -12 - neck * .6), R(3.4)], [...P(6, -12 - neck), R(3.2)]], false, false), sg);
    const hd = P(7, -14 - neck - 3);
    const hr = (k === 3 ? 8 : 6.2) * s;
    skin(h, h.ring(hd[0], hd[1], hr / ar, hr * (k === 3 ? .95 : .88), 12), sg);
    eye(h, hd[0] + hr * .3 / ar, hd[1] - hr * .1, Math.max(.5, hr * (k === 3 ? .3 : .22)));
    if (k === 3) eye(h, hd[0] - hr * .5 / ar, hd[1] - hr * .1, Math.max(.5, hr * .3));

    /* beak */
    if (k === 2) {                                        // hornbill — the casque and the great bill
      skin(h, [[hd[0] + hr * .5 / ar, hd[1] - hr * .1], [hd[0] + hr * 3.4 / ar, hd[1] + hr * .35],
      [hd[0] + hr * .5 / ar, hd[1] + hr * .8]], sg);
      h.curve([[hd[0] + hr * .4 / ar, hd[1] - hr * .45], [hd[0] + hr * 1.8 / ar, hd[1] - hr * .95],
      [hd[0] + hr * 2.4 / ar, hd[1] - hr * .1]], { passes: 1, w: .9 });
    } else {
      h.curve([[hd[0] + hr * .6 / ar, hd[1] - hr * .2], [hd[0] + hr * 1.9 / ar, hd[1] + hr * .1],
      [hd[0] + hr * .6 / ar, hd[1] + hr * .5]], { closed: true, passes: 1, w: .9 });
    }

    /* crest / tail */
    if (k === 1) {                                        // peacock — the fan is the whole bird
      const fe = Math.max(3, o.feathers || 11);
      for (let i = 0; i < fe; i++) {
        const t = Math.PI * .62 + (i / (fe - 1)) * Math.PI * .76;
        const len = 34 + Math.sin(i / (fe - 1) * Math.PI) * 12;
        const tip = P(-4 + Math.cos(t) * len, 2 + Math.sin(t) * len * .82);
        const mid = P(-4 + Math.cos(t) * len * .5, 2 + Math.sin(t) * len * .42);
        skin(h, tube([[...P(-6, 2), R(1.5)], [...mid, R(1.4)], [...tip, R(1.1)]], false, false),
          { sig: -1, w: .85 });
        skin(h, h.ring(tip[0], tip[1], 4.6 * s / ar, 3.6 * s, 10), { sig: o.sig, step: 3 * s });
        h.dot(tip[0], tip[1], 1.4 * s, { role: 'line', fill: 'line' });
      }
      for (let i = 0; i < 3; i++) {                       // head crest
        const t = -Math.PI * .72 + i * .22;
        h.line(hd[0], hd[1] - hr * .7, hd[0] + Math.cos(t) * hr * 1.5 / ar, hd[1] - hr * .7 + Math.sin(t) * hr * 1.5, { passes: 1, w: .7 });
        h.dot(hd[0] + Math.cos(t) * hr * 1.7 / ar, hd[1] - hr * .7 + Math.sin(t) * hr * 1.7, 1.1 * s, { role: 'accent', fill: 'accent' });
      }
    } else {
      const tl = k === 4 ? 14 : 22;
      skin(h, [P(-10, 4), P(-10 - tl, -4), P(-12 - tl, 6), P(-9, 11)], sg);
    }
  }

  def('gBird', 'Birds', 'Bird', [
    O('kind', 'Kind', BIRDS, 0),
    O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 12, 5),
    N('feathers', 'Tail feathers', 5, 17, 11),
  ], (h, p) => {
    const ar = p._ar || 1;
    h.fitDraw({ x: 5, y: 5, w: 90, h: 90 }, (hh, cx, cy, s) =>
      bird(hh, cx, cy, s, p.kind, { ar, sig: p.sig, step: p.dens, feathers: p.feathers }));
  });

  def('gFlock', 'Birds', 'Flock', [
    N('count', 'Birds', 2, 8, 4), O('kind', 'Kind', BIRDS, 5),
    O('lay', 'Arranged', ['scattered', 'in a row', 'rising'], 0),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = p.count, s = Math.min(.85, 2.6 / Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const u = n < 2 ? .5 : i / (n - 1);
      const x = 14 + u * 72;
      const y = p.lay === 1 ? 50 : p.lay === 2 ? 84 - u * 66 : 24 + ((i * 37) % 5) * 12;
      bird(h, x, y, s, p.kind, { ar, sig: p.sig, step: p.dens });
    }
  });

  /* ============================================================
     NATURE
     ============================================================ */
  def('gTree', 'Nature', 'Tree', [
    N('branches', 'Branches', 2, 8, 5), N('spread', 'Spread', 20, 70, 46),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 12, 5),
    O('crop', 'In the branches', ['leaves', 'flowers', 'fruit', 'nothing'], 0),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { sig: p.sig, step: p.dens };
    /* trunk */
    skin(h, tube([[50, 96, 7 / ar], [50, 74, 6 / ar], [49, 56, 4.6 / ar]], false, false), sg);
    const n = Math.max(1, p.branches);
    for (let i = 0; i < n; i++) {
      const u = i / Math.max(1, n - 1);
      const side = i % 2 ? 1 : -1;
      const base = [50, 66 - u * 22];
      const t = -Math.PI * .5 + side * (0.35 + u * 0.5);
      const len = p.spread * (0.55 + u * 0.55);
      const mid = [base[0] + Math.cos(t) * len * .5 / ar, base[1] + Math.sin(t) * len * .5];
      const tip = [base[0] + Math.cos(t - side * .35) * len / ar, base[1] + Math.sin(t - side * .35) * len];
      skin(h, tube([[base[0], base[1], 3.4 / ar], [mid[0], mid[1], 2.4 / ar], [tip[0], tip[1], 1.2 / ar]], false, false),
        { sig: -1, w: 1 });
      if (p.crop === 3) continue;
      for (let j = 0; j < 3; j++) {
        const f = .55 + j * .22;
        const at = [base[0] + (tip[0] - base[0]) * f, base[1] + (tip[1] - base[1]) * f];
        if (p.crop === 0) {                                // leaves — pointed ovals
          const lp = [];
          for (let q = 0; q < 10; q++) {
            const a = (q / 10) * TAU;
            lp.push([at[0] + Math.cos(a) * 6 / ar, at[1] + Math.sin(a) * 3.4]);
          }
          skin(h, lp, { sig: p.sig, step: p.dens * .55, w: .9 });
        } else if (p.crop === 1) {                         // flowers
          for (let q = 0; q < 5; q++) {
            const a = (q / 5) * TAU;
            h.dot(at[0] + Math.cos(a) * 3.4 / ar, at[1] + Math.sin(a) * 3.4, 1.7, { role: 'accent', fill: 'accent' });
          }
          h.dot(at[0], at[1], 1.5, { role: 'line', fill: 'line' });
        } else {                                           // fruit
          h.ellipse(at[0], at[1], 3.4 / ar, 3.4, { passes: 1, w: .9, exact: true });
          h.dot(at[0], at[1], 1.5, { role: 'accent', fill: 'accent' });
        }
      }
    }
  });

  def('gTreeOfLife', 'Compositions', 'Tree of life', [
    N('branches', 'Branches', 3, 9, 6),
    O('life', 'Living in it', ['birds', 'birds and deer', 'birds and snakes'], 0),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 10, 4),
    B('roots', 'Roots', true),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { sig: p.sig, step: p.dens };
    /* the trunk is the spine of the whole picture */
    skin(h, tube([[50, 92, 8 / ar], [50, 68, 7 / ar], [49, 44, 5 / ar], [50, 30, 3.4 / ar]], false, false), sg);
    if (p.roots) for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 2; i++) {
        const sp0 = 8 + i * 9;
        skin(h, tube([[50, 90, 3 / ar], [50 + side * sp0 / ar, 94, 2.2 / ar], [50 + side * (sp0 + 8) / ar, 98, 1 / ar]], false, false),
          { sig: -1, w: .9 });
      }
    }
    /* Branches fan wide at the bottom and stand up at the top. An
       earlier version drew one big filled cloud over the top of them,
       which buried the branches and left every creature in a huddle —
       so the crown IS the branches and what sits on them. */
    const n = Math.max(2, p.branches);
    const tips = [];
    for (let i = 0; i < n; i++) {
      const u = n < 2 ? 0 : i / (n - 1);
      const side = i % 2 ? 1 : -1;
      const base = [50, 80 - u * 46];
      const t = -Math.PI * .5 + side * (0.98 - u * 0.62);
      const len = 27 + (1 - u) * 15;
      const mid = [base[0] + Math.cos(t) * len * .55 / ar, base[1] + Math.sin(t) * len * .55];
      const tip = [base[0] + Math.cos(t - side * .22) * len / ar, base[1] + Math.sin(t - side * .22) * len];
      skin(h, tube([[base[0], base[1], 3.2 / ar], [mid[0], mid[1], 2.3 / ar], [tip[0], tip[1], 1 / ar]], false, false),
        { sig: -1, w: 1 });
      tips.push([tip, side, u]);
    }
    /* a rosette of leaves at every tip — the canopy, made of parts */
    tips.forEach(([tip]) => {
      for (let q = 0; q < 3; q++) {
        const a = -Math.PI * .5 + (q - 1) * .8;
        const c = [tip[0] + Math.cos(a) * 5 / ar, tip[1] + Math.sin(a) * 5];
        const lp = [];
        for (let z = 0; z < 10; z++) {
          const b = (z / 10) * TAU;
          lp.push([c[0] + Math.cos(b) * 3.6 / ar, c[1] + Math.sin(b) * 5.2]);
        }
        skin(h, lp, { sig: p.sig, step: p.dens * .5, w: .85 });
      }
    });
    /* and the creatures that live in it, one per branch tip */
    tips.forEach(([tip, side], i) => {
      if (p.life === 1 && i % 3 === 2) { beast(h, tip[0], tip[1] + 9, .30, 0, { ar, sig: p.sig, step: p.dens }); return; }
      if (p.life === 2 && i % 3 === 2) {
        const sp0 = [];
        for (let q = 0; q <= 14; q++) {
          const u = q / 14;
          sp0.push([tip[0] + Math.sin(u * Math.PI * 2) * 6 / ar, tip[1] - 2 + u * 16, 2.2 * (1 - u * .7) + .6]);
        }
        skin(h, tube(sp0, true, false), { sig: p.sig, step: p.dens * .6 });
        return;
      }
      bird(h, tip[0] + side * 5 / ar, tip[1] - 9, .28, side > 0 ? 0 : 1, { ar, sig: p.sig, step: p.dens });
    });
  });

  def('gLeaf', 'Nature', 'Leaf', [
    O('kind', 'Kind', ['pointed', 'round', 'lobed', 'frond'], 0),
    O('sig', 'Signature', SIG_NAMES, 1), N('dens', 'Signature scale', 2, 12, 4),
    B('vein', 'Centre vein', true),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { sig: p.sig, step: p.dens };
    const pts = [];
    const k = p.kind;
    for (let i = 0; i <= 30; i++) {
      const u = i / 30, t = u * TAU;
      let w;
      if (k === 0) w = Math.sin(u * Math.PI) * 26;
      else if (k === 1) w = Math.sin(u * Math.PI) * 34;
      else if (k === 2) w = Math.sin(u * Math.PI) * 30 * (1 + Math.sin(u * Math.PI * 5) * .3);
      else w = Math.sin(u * Math.PI) * 18 * (1 + Math.sin(u * Math.PI * 9) * .45);
      pts.push([50 + Math.cos(t) * w / ar, 50 + (u - .5) * (k === 1 ? 62 : 82)]);
    }
    skin(h, pts, sg);
    if (p.vein) {
      h.line(50, 12, 50, 88, { passes: 1, w: 1 });
      for (let i = 1; i < 7; i++) {
        const y = 12 + (i / 7) * 76;
        const w = Math.sin((i / 7) * Math.PI) * 22;
        h.line(50, y, 50 - w / ar, y - 6, { passes: 1, w: .6, role: 'accent' });
        h.line(50, y, 50 + w / ar, y - 6, { passes: 1, w: .6, role: 'accent' });
      }
    }
  });

  def('gMahua', 'Nature', 'Mahua', [
    N('clusters', 'Clusters', 2, 8, 4), N('flowers', 'Flowers each', 3, 9, 5),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    /* the mahua is a food tree and a drink tree; the flower cluster is
       the part that matters, so it is drawn large and the branch small */
    skin(h, tube([[50, 96, 5 / ar], [50, 74, 4 / ar], [50, 58, 2.6 / ar]], false, false),
      { sig: p.sig, step: p.dens });
    const n = Math.max(1, p.clusters);
    for (let i = 0; i < n; i++) {
      const t = -Math.PI * .5 + (i - (n - 1) / 2) * (Math.PI * .9 / Math.max(1, n));
      const c = [50 + Math.cos(t) * 30 / ar, 56 + Math.sin(t) * 30];
      h.line(50, 60, c[0], c[1], { passes: 1, w: 1 });
      const f = Math.max(3, p.flowers);
      for (let q = 0; q < f; q++) {
        const a = (q / f) * TAU;
        const fx = c[0] + Math.cos(a) * 8 / ar, fy = c[1] + Math.sin(a) * 8;
        const pet = [];
        for (let z = 0; z < 10; z++) {
          const b = (z / 10) * TAU;
          pet.push([fx + Math.cos(b) * 4.2 / ar, fy + Math.sin(b) * 5.4]);
        }
        skin(h, pet, { sig: p.sig, step: p.dens * .5, w: .8 });
      }
      h.dot(c[0], c[1], 2.6, { role: 'line', fill: 'line' });
    }
  });

  def('gSun', 'Nature', 'Sun & moon', [
    O('kind', 'Kind', ['sun', 'moon', 'both'], 0),
    N('rays', 'Rays', 0, 28, 16), O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { sig: p.sig, step: p.dens };
    const disc = (cx, cy, r) => {
      skin(h, h.ring(cx, cy, r / ar, r, 18), sg);
      const n = Math.max(0, p.rays);
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU;
        const a = [cx + Math.cos(t) * r / ar, cy + Math.sin(t) * r];
        const b = [cx + Math.cos(t) * (r + r * .55) / ar, cy + Math.sin(t) * (r + r * .55)];
        skin(h, tube([[a[0], a[1], r * .10 / ar], [b[0], b[1], r * .03 / ar]], false, false), { sig: -1, w: .9 });
      }
    };
    if (p.kind === 2) {
      disc(32, 38, 20);
      const cr = [];
      for (let i = 0; i <= 20; i++) { const t = Math.PI * .35 + (i / 20) * Math.PI * 1.3; cr.push([70 + Math.cos(t) * 18 / ar, 66 + Math.sin(t) * 18]); }
      for (let i = 20; i >= 0; i--) { const t = Math.PI * .35 + (i / 20) * Math.PI * 1.3; cr.push([70 + Math.cos(t) * 11 / ar + 5 / ar, 66 + Math.sin(t) * 11]); }
      skin(h, cr, sg);
    } else if (p.kind === 1) {
      const cr = [];
      for (let i = 0; i <= 24; i++) { const t = Math.PI * .3 + (i / 24) * Math.PI * 1.4; cr.push([54 + Math.cos(t) * 34 / ar, 50 + Math.sin(t) * 34]); }
      for (let i = 24; i >= 0; i--) { const t = Math.PI * .3 + (i / 24) * Math.PI * 1.4; cr.push([54 + Math.cos(t) * 21 / ar + 10 / ar, 50 + Math.sin(t) * 21]); }
      skin(h, cr, sg);
    } else disc(50, 50, 26);
  });

  def('gHills', 'Nature', 'Hills & river', [
    N('peaks', 'Peaks', 1, 7, 3), B('river', 'River below', true),
    O('sig', 'Signature', SIG_NAMES, 5), N('dens', 'Signature scale', 2, 12, 5),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = Math.max(1, p.peaks);
    const base = p.river ? 66 : 88;
    for (let i = 0; i < n; i++) {
      const w = 100 / n, cx = w * (i + .5);
      const top = 22 + (i % 2 ? 12 : 0);
      const pts = [[cx - w * .62, base]];
      for (let q = 0; q <= 12; q++) {
        const u = q / 12;
        pts.push([cx - w * .62 + u * w * 1.24, base - Math.sin(u * Math.PI) * (base - top)]);
      }
      skin(h, pts, { sig: (p.sig + i) % (SIG_NAMES.length - 1), step: p.dens });
    }
    if (p.river) {
      const band = [];
      for (let q = 0; q <= 16; q++) { const u = q / 16; band.push([u * 100, 72 + Math.sin(u * TAU * 1.5) * 4]); }
      for (let q = 16; q >= 0; q--) { const u = q / 16; band.push([u * 100, 96 + Math.sin(u * TAU * 1.5 + 1) * 4]); }
      skin(h, band, { sig: 8, step: p.dens * 1.4 });
    }
  });

  /* ============================================================
     COMPOSITIONS
     ============================================================ */
  def('gDigna', 'Compositions', 'Digna', [
    N('grid', 'Grid', 2, 7, 4), O('motif', 'Motif', ['diamond', 'flower', 'star', 'eye', 'wave'], 0),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 8, 3),
    B('rule', 'Grid lines', true),
  ], (h, p) => {
    /* the digna is the ritual diagram drawn on a floor or wall: a grid
       of dots with one motif repeated between them. It is the only
       thing in Gond that is laid out rather than grown. */
    const n = Math.max(1, p.grid), cell = 100 / n;
    if (p.rule) for (let i = 0; i <= n; i++) {
      h.line(0, i * cell, 100, i * cell, { passes: 1, w: .7, role: 'accent' });
      h.line(i * cell, 0, i * cell, 100, { passes: 1, w: .7, role: 'accent' });
    }
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const cx = (c + .5) * cell, cy = (r + .5) * cell, s = cell * .38;
      const sg = { sig: p.sig, step: p.dens * (cell / 25), w: .9 };
      switch (p.motif) {
        /* Contours are smoothed, so a four-point diamond comes out a
           circle. Repeating each corner pulls the curve into the point. */
        case 0: skin(h, [[cx, cy - s], [cx, cy - s], [cx + s, cy], [cx + s, cy],
        [cx, cy + s], [cx, cy + s], [cx - s, cy], [cx - s, cy]], sg); break;
        case 1: {
          for (let q = 0; q < 6; q++) {
            const t = (q / 6) * TAU;
            const px = cx + Math.cos(t) * s * .55, py = cy + Math.sin(t) * s * .55;
            skin(h, h.ring(px, py, s * .42, s * .42, 9), { sig: -1, w: .8 });
          }
          h.dot(cx, cy, s * .3, { role: 'line', fill: 'line' });
          break;
        }
        case 2: {
          const st = [];
          for (let q = 0; q < 12; q++) {
            const t = (q / 12) * TAU;
            const rr = q % 2 ? s * .42 : s;
            const pt = [cx + Math.cos(t) * rr, cy + Math.sin(t) * rr];
            st.push(pt); if (!(q % 2)) st.push(pt);   // sharpen the points
          }
          skin(h, st, sg); break;
        }
        case 3: {
          const ey = [];
          for (let q = 0; q <= 18; q++) { const t = (q / 18) * TAU; ey.push([cx + Math.cos(t) * s, cy + Math.sin(t) * s * .55]); }
          skin(h, ey, sg);
          h.dot(cx, cy, s * .26, { role: 'line', fill: 'line' });
          break;
        }
        default: {
          const wv = [];
          for (let q = 0; q <= 12; q++) { const u = q / 12; wv.push([cx - s + u * s * 2, cy - Math.sin(u * TAU) * s * .5]); }
          for (let q = 12; q >= 0; q--) { const u = q / 12; wv.push([cx - s + u * s * 2, cy - Math.sin(u * TAU) * s * .5 + s * .5]); }
          skin(h, wv, sg);
        }
      }
    }
  });

  def('gScene', 'Compositions', 'Forest', [
    N('trees', 'Trees', 1, 4, 2), N('animals', 'Animals', 0, 4, 2),
    B('birds', 'Birds', true), O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const sg = { ar, sig: p.sig, step: p.dens };
    const nt = Math.max(1, p.trees);
    for (let i = 0; i < nt; i++) {
      const cx = (i + .5) * (100 / nt);
      /* a small tree, drawn inline so it can sit anywhere in the band */
      skin(h, tube([[cx, 88, 4 / ar], [cx, 66, 3.2 / ar], [cx, 50, 2 / ar]], false, false), { sig: p.sig, step: p.dens });
      const canopy = [];
      for (let q = 0; q < 16; q++) {
        const t = (q / 16) * TAU;
        canopy.push([cx + Math.cos(t) * 17 / ar, 44 + Math.sin(t) * 13]);
      }
      skin(h, canopy, { sig: p.sig, step: p.dens * 1.2, w: 1.1 });
    }
    const na = Math.max(0, p.animals);
    for (let i = 0; i < na; i++) {
      beast(h, 14 + i * (72 / Math.max(1, na)), 80, .4, i % BEASTS.length, sg);
    }
    if (p.birds) for (let i = 0; i < 3; i++) {
      bird(h, 18 + i * 32, 16 + (i % 2) * 8, .3, 5, sg);
    }
  });

  /* ============================================================
     BORDERS — bands and frames built from the signature vocabulary
     ============================================================ */
  const BAND_KINDS = ['dots', 'crescents', 'leaves', 'chevrons', 'eyes', 'combs', 'diamonds', 'birds'];

  function bandRow(h, x0, x1, y, hgt, kind, n, sig, dens) {
    const w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const cx = x0 + w * (i + .5), s = Math.min(w, hgt) * .44;
      switch (((kind % BAND_KINDS.length) + BAND_KINDS.length) % BAND_KINDS.length) {
        case 0: h.dot(cx, y, s * .5, { role: 'accent', fill: 'accent' }); break;
        case 1: h.curve(h.arcPts(cx, y, s, s, Math.PI, TAU, 8), { passes: 1, w: .9 }); break;
        case 2: {
          const lp = [];
          for (let q = 0; q < 10; q++) { const t = (q / 10) * TAU; lp.push([cx + Math.cos(t) * s * .5, y + Math.sin(t) * s]); }
          skin(h, lp, { sig, step: dens * .5, w: .8 });
          break;
        }
        case 3: h.curve([[cx - s, y + s * .6], [cx, y - s * .6], [cx + s, y + s * .6]], { passes: 1, w: .9 }); break;
        case 4: {
          const ey = [];
          for (let q = 0; q <= 14; q++) { const t = (q / 14) * TAU; ey.push([cx + Math.cos(t) * s, y + Math.sin(t) * s * .55]); }
          h.curve(ey, { closed: true, passes: 1, w: .9 });
          h.dot(cx, y, s * .26, { role: 'accent', fill: 'accent' });
          break;
        }
        case 5: for (let q = 0; q < 3; q++) h.line(cx - s * .5 + q * s * .5, y - s, cx - s * .5 + q * s * .5, y + s, { passes: 1, w: .6, role: 'accent' }); break;
        case 6: h.curve([[cx, y - s], [cx + s * .7, y], [cx, y + s], [cx - s * .7, y]], { closed: true, passes: 1, w: .9 }); break;
        default: bird(h, cx, y, Math.min(w, hgt) / 46, 5, { sig, step: dens }); break;
      }
    }
  }

  def('gBorder', 'Borders', 'Border band', [
    O('kind', 'Motif', BAND_KINDS, 0), N('repeat', 'Repeats', 3, 30, 12),
    B('rule', 'Rules above and below', true),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    /* a band has to look like a band at 8:1, so it measures itself
       against the box it was actually given */
    const ar = p._ar || 1;
    const hgt = Math.min(70, 100 / Math.max(.12, ar) * 1.6);
    const mid = 50;
    if (p.rule) {
      h.line(0, mid - hgt * .5, 100, mid - hgt * .5, { passes: 1, w: 1 });
      h.line(0, mid + hgt * .5, 100, mid + hgt * .5, { passes: 1, w: 1 });
    }
    bandRow(h, 2, 98, mid, hgt * .8, p.kind, Math.max(1, p.repeat), p.sig, p.dens);
  });

  def('gFrame', 'Borders', 'Frame', [
    O('kind', 'Motif', BAND_KINDS, 0), N('repeat', 'Repeats per side', 3, 20, 9),
    N('inset', 'Inset', 0, 20, 6), B('rule', 'Rules', true),
    O('sig', 'Signature', SIG_NAMES, 0), N('dens', 'Signature scale', 2, 10, 4),
  ], (h, p) => {
    const ar = p._ar || 1;
    const i0 = p.inset, i1 = 100 - p.inset;
    const band = 11;
    if (p.rule) {
      h.curve([[i0, i0], [i1, i0], [i1, i1], [i0, i1]], { closed: true, sharp: true, passes: 1, w: 1.1 });
      h.curve([[i0 + band, i0 + band], [i1 - band, i0 + band], [i1 - band, i1 - band], [i0 + band, i1 - band]],
        { closed: true, sharp: true, passes: 1, w: 1.1 });
    }
    /* A tooth has to be the same size on every side. `repeat` counts the
       teeth DOWN the side (as it does in the Warli frame), and the top
       and bottom get more of them in proportion to how wide the box is —
       the local box is always 100x100, so the real aspect is `_ar`.
       Both counts are capped: past forty a side the band is a texture,
       and every tooth here carries its own signature fill. */
    const side = i1 - i0;
    const ny = Math.max(1, Math.min(40, Math.round(p.repeat)));
    const nx = Math.max(1, Math.min(40, Math.round(p.repeat * Math.max(.05, ar))));
    bandRow(h, i0, i1, i0 + band * .5, band, p.kind, nx, p.sig, p.dens);
    bandRow(h, i0, i1, i1 - band * .5, band, p.kind, nx, p.sig, p.dens);
    for (let i = 0; i < ny; i++) {
      const y = i0 + band + ((i + .5) / ny) * (side - band * 2);
      bandRow(h, i0, i0 + band, y, band, p.kind, 1, p.sig, p.dens);
      bandRow(h, i1 - band, i1, y, band, p.kind, 1, p.sig, p.dens);
    }
  });

  /* the field IS the signature, so 'plain' is not on offer here —
     it would place an item with nothing in it */
  def('gField', 'Borders', 'Signature field', [
    O('sig', 'Signature', SIG_NAMES.slice(0, -1), 0), N('dens', 'Signature scale', 2, 16, 6),
    N('ang', 'Angle', 0, 180, 0),
  ], (h, p) => {
    h.clipStart('M0 0H100V100H0Z');
    sigMarks(h, [0, 0, 100, 100], p.sig, p.dens, p.ang);
    h.clipEnd();
  });

  def('gRoundel', 'Compositions', 'Roundel', [
    N('rings', 'Rings', 2, 6, 4), O('sig', 'Signature', SIG_NAMES, 0),
    N('dens', 'Signature scale', 2, 10, 4), B('spokes', 'Spokes', true),
  ], (h, p) => {
    const ar = p._ar || 1;
    const n = Math.max(1, p.rings);
    for (let r = n; r >= 1; r--) {
      const f = r / n;
      skin(h, h.ring(50, 50, 46 * f / ar, 46 * f, 22),
        { sig: (p.sig + (n - r)) % (SIG_NAMES.length - 1), step: p.dens * Math.max(.35, f) });
    }
    if (p.spokes) {
      const k = 16;
      for (let i = 0; i < k; i++) {
        const t = (i / k) * TAU;
        h.line(50 + Math.cos(t) * 46 / n / ar, 50 + Math.sin(t) * 46 / n,
          50 + Math.cos(t) * 46 / ar, 50 + Math.sin(t) * 46, { passes: 1, w: .6, role: 'accent' });
      }
    }
    h.dot(50, 50, 3.4, { role: 'line', fill: 'line' });
  });

  /* Pieces that stretch, and the shape they want to arrive at. */
  ['gBorder', 'gFrame', 'gField', 'gHills', 'gScene', 'gDancers', 'gHerd', 'gFlock', 'gSnake'].forEach(k => { G[k].aspect = 'free'; });
  G.gBorder.place = { w: .92, h: .11 };
  G.gFrame.place = { w: .88, h: .88 };
  G.gField.place = { w: .9, h: .9 };
  G.gHills.place = { w: .92, h: .3 };
  G.gScene.place = { w: .92, h: .5 };
  G.gDancers.place = { w: .88, h: .3 };
  G.gHerd.place = { w: .88, h: .26 };
  G.gFlock.place = { w: .8, h: .4 };
  G.gSnake.place = { w: .8, h: .4 };

  window.SCRAWL.GOND = { skin, tube, spine, sigMarks, person, beast, bird, bandRow, SIG_NAMES, BEASTS, BIRDS, BAND_KINDS, F_POSES };
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
