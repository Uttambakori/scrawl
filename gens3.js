/* ============================================================
   SCRAWL / gens3 — more nature, creatures, and objects
   ============================================================ */
(function () {
  const { TAU } = window.SCRAWL;
  const G = window.SCRAWL.GENS;
  const D = Math.PI / 180;
  function def(key, cat, label, params, draw) { G[key] = { key, cat, label, params, draw }; }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ==========================================================
     NATURE
     ========================================================== */
  def('fern', 'Nature', 'Fern', [N('pairs', 'Leaf pairs', 4, 18, 10), N('bend', 'Bend', -40, 40, 18), N('taper', 'Taper', 0, 100, 70)],
    (h, p) => {
      const stem = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12; stem.push([50 + Math.sin(u * 1.6) * p.bend * u, 96 - u * 90]); }
      h.curve(stem);
      for (let i = 0; i < p.pairs; i++) {
        const u = 0.08 + (i / p.pairs) * 0.88;
        const b = stem[Math.max(0, Math.min(12, Math.round(u * 12)))];
        const s = 22 * (1 - (p.taper / 100) * u);
        [-1, 1].forEach(dir => {
          const pts = [b];
          for (let k = 1; k <= 4; k++) pts.push([b[0] + dir * s * (k / 4), b[1] - s * 0.42 * (k / 4) - (k === 4 ? 0 : 2)]);
          h.curve(pts, { passes: 1 });
          for (let k = 1; k <= 4; k++) h.line(b[0] + dir * s * (k / 4) * 0.95, b[1] - s * 0.4 * (k / 4), b[0] + dir * s * (k / 4) * 1.05, b[1] - s * 0.4 * (k / 4) - 4, { passes: 1 });
        });
      }
    });

  def('monstera', 'Nature', 'Monstera', [N('splits', 'Splits', 2, 7, 4), N('stem', 'Stem', 0, 40, 22), N('width', 'Width', 40, 96, 72)],
    (h, p) => {
      const w = p.width / 2, top = 8, bot = 96 - p.stem;
      // one profile function drives BOTH the outline and the notches, so the
      // splits land exactly on the rim instead of floating over the leaf
      const HW = u => w * Math.sin((.12 + clamp01(u) * .80) * Math.PI);
      const Y = u => top + (bot - top) * clamp01(u);
      function clamp01(v) { return Math.max(0, Math.min(1, v)); }

      const right = [], left = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12; right.push([50 + HW(u), Y(u)]); left.unshift([50 - HW(u), Y(u)]); }
      h.shape(right.concat(left), { closed: true });
      h.curve([[50, top + 5], [50, bot - 3]]);

      const du = .34 / (p.splits + 1);
      for (let i = 1; i <= p.splits; i++) {
        const u = i / (p.splits + 1);
        [-1, 1].forEach(dir => {
          h.curve([[50 + dir * HW(u - du), Y(u - du)],
          [50 + dir * HW(u) * .2, Y(u)],
          [50 + dir * HW(u + du), Y(u + du)]]);
        });
      }
      if (p.stem > 0) h.curve([[50, bot], [51.5, bot + p.stem * .6], [49, 97]]);
    });

  def('grass', 'Nature', 'Grass tuft', [N('blades', 'Blades', 3, 20, 9), N('spread', 'Spread', 20, 96, 62), N('curl', 'Curl', 0, 60, 26)],
    (h, p) => {
      for (let i = 0; i < p.blades; i++) {
        const u = p.blades === 1 ? .5 : i / (p.blades - 1);
        const x = 50 + (u - .5) * p.spread;
        const dir = u < .5 ? -1 : 1;
        const tall = 78 * (0.5 + 0.5 * (1 - Math.abs(u - .5) * 1.6));
        h.curve([[x, 96], [x + dir * p.curl * .12, 96 - tall * .55], [x + dir * p.curl * .4, 96 - tall]]);
      }
      h.line(50 - p.spread / 2 - 4, 96, 50 + p.spread / 2 + 4, 96, { passes: 1 });
    });

  def('wheat', 'Nature', 'Wheat', [N('grains', 'Grains', 4, 16, 9), N('bend', 'Bend', -30, 30, 10), B('awns', 'Whiskers', true)],
    (h, p) => {
      const stem = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8; stem.push([50 + Math.sin(u * 1.4) * p.bend * u, 98 - u * 56]); }
      h.curve(stem);
      const top = stem[8];
      for (let i = 0; i < p.grains; i++) {
        const u = i / p.grains, y = top[1] - u * 34, x = top[0] + (top[0] - 50) * u * .3;
        [-1, 1].forEach(dir => {
          h.curve([[x, y], [x + dir * 8, y - 3], [x + dir * 6, y - 10], [x, y - 7]], { closed: true, passes: 1 });
          if (p.awns) h.line(x + dir * 6, y - 10, x + dir * 11, y - 22, { passes: 1 });
        });
      }
    });

  def('lavender', 'Nature', 'Lavender', [N('stalks', 'Stalks', 1, 6, 3), N('buds', 'Buds', 4, 16, 9), N('spread', 'Spread', 0, 60, 28)],
    (h, p) => {
      for (let s = 0; s < p.stalks; s++) {
        const u = p.stalks === 1 ? .5 : s / (p.stalks - 1);
        const lean = (u - .5) * p.spread;
        const topY = 14 + Math.abs(u - .5) * 20;
        h.curve([[50, 98], [50 + lean * .5, 60], [50 + lean, topY + 26]]);
        for (let i = 0; i < p.buds; i++) {
          const v = i / p.buds, y = topY + 26 - v * 26;
          const x = 50 + lean + (v * 2);
          h.ellipse(x + (i % 2 ? 2.5 : -2.5), y, 3.4, 4.4, { role: 'accent' });
        }
      }
    });

  def('dandelion', 'Nature', 'Dandelion', [N('seeds', 'Seeds', 10, 60, 30), N('blown', 'Blown away', 0, 12, 4), N('head', 'Head size', 16, 50, 30)],
    (h, p) => {
      const R = p.head / 2, cy = 34;
      h.curve([[50, 96], [52, 70], [50, cy + R]]);
      for (let i = 0; i < p.seeds; i++) {
        const t = (i / p.seeds) * TAU + h.j(.06);
        if (Math.sin(t) > .3 && i % 3 === 0) continue;
        h.line(50, cy, 50 + Math.cos(t) * R, cy + Math.sin(t) * R, { passes: 1 });
        h.dot(50 + Math.cos(t) * R, cy + Math.sin(t) * R, 1.4);
      }
      for (let i = 0; i < p.blown; i++) {
        const x = 62 + h.rng() * 34, y = 10 + h.rng() * 44;
        h.dot(x, y, 1.3, { role: 'accent' });
        for (let k = 0; k < 4; k++) { const t = k / 4 * TAU; h.line(x, y, x + Math.cos(t) * 4, y + Math.sin(t) * 4, { passes: 1, role: 'accent' }); }
      }
    });

  def('vine', 'Nature', 'Vine', [N('leaves', 'Leaves', 3, 18, 8), N('waves', 'Waves', 1, 5, 2), N('size', 'Leaf size', 5, 20, 11)],
    (h, p) => {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([4 + u * 92, 50 + Math.sin(u * TAU * p.waves) * 26]); }
      h.curve(pts);
      for (let i = 0; i < p.leaves; i++) {
        const u = (i + .5) / p.leaves, idx = Math.max(0, Math.min(24, Math.round(u * 24))), b = pts[idx];
        const dir = i % 2 ? 1 : -1, s = p.size;
        h.curve([b, [b[0] - s * .3, b[1] + dir * s * .5], [b[0] + s * .2, b[1] + dir * s * 1.2], [b[0] + s * .7, b[1] + dir * s * .4]], { closed: true });
      }
    });

  def('succulent', 'Nature', 'Succulent', [N('rings', 'Rings', 2, 5, 3), N('petals', 'Leaves per ring', 5, 12, 7), N('fat', 'Fatness', 30, 100, 62)],
    (h, p) => {
      for (let r = p.rings - 1; r >= 0; r--) {
        const R = 12 + r * (34 / p.rings), w = (p.fat / 100) * R * .62;
        for (let i = 0; i < p.petals; i++) {
          const t = (i / p.petals) * TAU + r * .4;
          const tip = [50 + Math.cos(t) * (R + 10), 50 + Math.sin(t) * (R + 10)];
          const nx = -Math.sin(t) * w, ny = Math.cos(t) * w;
          h.curve([[50 + Math.cos(t) * 4, 50 + Math.sin(t) * 4], [50 + Math.cos(t) * R * .6 + nx, 50 + Math.sin(t) * R * .6 + ny],
          tip, [50 + Math.cos(t) * R * .6 - nx, 50 + Math.sin(t) * R * .6 - ny]], { closed: true, passes: 1 });
        }
      }
    });

  def('butterfly', 'Nature', 'Butterfly', [N('spots', 'Spots', 0, 8, 3), N('span', 'Wing span', 50, 100, 82), B('antennae', 'Antennae', true)],
    (h, p) => {
      const w = p.span / 2;
      [-1, 1].forEach(d => {
        h.shape([[50, 44], [50 + d * w * .5, 20], [50 + d * w, 26], [50 + d * w * .8, 48], [50, 52]], { closed: true });
        h.shape([[50, 52], [50 + d * w * .75, 56], [50 + d * w * .6, 78], [50 + d * w * .2, 72], [50, 60]], { closed: true });
        for (let i = 0; i < p.spots; i++) {
          const t = i / Math.max(1, p.spots);
          h.dot(50 + d * w * (.35 + t * .4), 30 + t * 18, 2.4, { role: 'accent', fill: 'accent' });
        }
      });
      h.curve([[50, 26], [52, 44], [51, 66], [50, 78], [48, 66], [49, 44], [50, 26]], { closed: true });
      if (p.antennae) { h.curve([[50, 27], [44, 16], [40, 12]]); h.curve([[50, 27], [56, 16], [60, 12]]); h.dot(40, 12, 1.6); h.dot(60, 12, 1.6); }
    });

  def('bee', 'Nature', 'Bee', [N('stripes', 'Stripes', 2, 6, 3), B('trail', 'Flight trail', false), N('wings', 'Wing size', 10, 34, 22)],
    (h, p) => {
      h.shape(h.ring(52, 56, 24, 18, 12, 0, .04), { closed: true });
      for (let i = 1; i <= p.stripes; i++) {
        const x = 40 + i * (28 / (p.stripes + 1));
        h.curve([[x, 40], [x + 2, 56], [x, 72]], { role: 'accent' });
      }
      h.ellipse(26, 50, 11, 10);
      h.dot(22, 48, 2);
      h.curve([[24, 42], [18, 32]]); h.curve([[29, 40], [28, 28]]);
      h.dot(18, 32, 1.6); h.dot(28, 28, 1.6);
      h.shape(h.ring(48, 32, p.wings * .5, p.wings * .34, 10, -.4, .05), { closed: true, op: .8 });
      h.shape(h.ring(62, 34, p.wings * .42, p.wings * .28, 10, .4, .05), { closed: true, op: .8 });
      h.curve([[74, 60], [82, 66], [78, 72]]);
      if (p.trail) h.curve([[4, 84], [18, 76], [10, 68], [26, 66]], { role: 'accent', passes: 1 });
    });

  def('snail', 'Nature', 'Snail', [N('turns', 'Shell turns', 2, 6, 3), B('eyes', 'Eye stalks', true), N('shell', 'Shell size', 30, 70, 48)],
    (h, p) => {
      const R = p.shell / 2, cx = 56, cy = 46;
      const pts = [], steps = p.turns * 14;
      for (let i = 0; i <= steps; i++) { const t = (i / steps) * TAU * p.turns, r = (i / steps) * R; pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); }
      h.curve(pts);
      h.ellipse(cx, cy, R, R);
      h.curve([[cx - R, cy + 6], [20, 62], [12, 74], [18, 82], [70, 82], [cx + R - 2, cy + R - 2]]);
      h.line(14, 83, 76, 83, { passes: 1 });
      if (p.eyes) { h.curve([[20, 66], [14, 52], [12, 44]]); h.curve([[24, 64], [22, 50], [22, 42]]); h.dot(12, 43, 2); h.dot(22, 41, 2); }
    });

  def('fish', 'Nature', 'Fish', [O('tail', 'Tail', ['fan', 'fork', 'round'], 0), N('fins', 'Fins', 0, 4, 2), N('scales', 'Scales', 0, 5, 0)],
    (h, p) => {
      h.shape([[16, 50], [34, 28], [62, 26], [78, 44], [78, 56], [62, 74], [34, 72]], { closed: true });
      if (p.tail === 0) h.shape([[78, 44], [96, 30], [94, 50], [96, 70], [78, 56]], { closed: true });
      if (p.tail === 1) h.shape([[78, 44], [96, 32], [88, 50], [96, 68], [78, 56]], { closed: true });
      if (p.tail === 2) h.shape([[78, 44], [95, 40], [95, 60], [78, 56]], { closed: true });
      h.dot(30, 44, 2.4); h.curve([[20, 52], [30, 58], [24, 62]]);
      if (p.fins > 0) h.shape([[46, 27], [56, 12], [64, 28]], { closed: true });
      if (p.fins > 1) h.shape([[46, 73], [54, 88], [62, 72]], { closed: true });
      if (p.fins > 2) h.shape([[40, 56], [44, 68], [52, 58]], { closed: true, role: 'accent' });
      for (let r = 0; r < p.scales; r++) for (let c = 0; c < 4; c++) {
        const x = 40 + c * 10, y = 38 + r * 7;
        h.curve(h.arcPts(x, y, 5, 5, Math.PI * .1, Math.PI * .9, 6), { passes: 1, op: .7 });
      }
    });

  def('shell', 'Nature', 'Shell', [N('ribs', 'Ribs', 4, 16, 8), O('kind', 'Kind', ['scallop', 'conch', 'spiral'], 0), N('hinge', 'Hinge', 0, 14, 6)],
    (h, p) => {
      if (p.kind === 2) {
        const pts = [];
        for (let i = 0; i <= 60; i++) { const t = (i / 60) * TAU * 3, r = (i / 60) * 40; pts.push([50 + Math.cos(t) * r, 50 + Math.sin(t) * r * .8]); }
        h.curve(pts); h.ellipse(50, 50, 42, 34);
        return;
      }
      // a fan swept from a narrow hinge, with a scalloped rim
      const hx = 50, hy = 22 + p.hinge, R = 68;
      const at = (u, r) => { const a = Math.PI * (.10 + u * .80); return [hx - Math.cos(a) * r * .74, hy + Math.sin(a) * r * .95]; };
      const pts = [[hx - 8, hy]];
      for (let i = 0; i <= p.ribs; i++) pts.push(at(i / p.ribs, R + (i % 2 ? 0 : -6)));
      pts.push([hx + 8, hy]);
      h.shape(pts, { closed: true });
      for (let i = 1; i < p.ribs; i++) {
        const e = at(i / p.ribs, R - 4);
        h.curve([[hx, hy + 3], [(hx + e[0]) / 2, (hy + e[1]) / 2], e], { passes: 1 });
      }
      if (p.hinge > 0) h.curve([[hx - 8, hy + 1], [hx, hy - p.hinge], [hx + 8, hy + 1]], { closed: true });
    });

  def('feather', 'Nature', 'Feather', [N('barbs', 'Barbs', 6, 30, 16), N('curl', 'Curl', -30, 30, 10), N('width', 'Width', 14, 50, 28)],
    (h, p) => {
      const spine = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10; spine.push([50 + Math.sin(u * 2) * p.curl * u, 94 - u * 86]); }
      h.curve(spine);
      for (let i = 0; i < p.barbs; i++) {
        const u = .08 + (i / p.barbs) * .88;
        const b = spine[Math.max(0, Math.min(10, Math.round(u * 10)))];
        const s = (p.width / 2) * Math.sin(u * Math.PI) * 1.35;
        [-1, 1].forEach(d => h.curve([b, [b[0] + d * s * .7, b[1] - s * .2], [b[0] + d * s, b[1] - s * .55]], { passes: 1 }));
      }
    });

  def('snowflake', 'Nature', 'Snowflake', [N('arms', 'Arms', 4, 12, 6), N('branches', 'Branches', 0, 5, 3), N('tips', 'Tip size', 0, 16, 7)],
    (h, p) => {
      for (let i = 0; i < p.arms; i++) {
        const t = (i / p.arms) * TAU;
        const tip = [50 + Math.cos(t) * 44, 50 + Math.sin(t) * 44];
        h.line(50, 50, tip[0], tip[1]);
        for (let b = 1; b <= p.branches; b++) {
          const u = b / (p.branches + 1), bx = 50 + Math.cos(t) * 44 * u, by = 50 + Math.sin(t) * 44 * u;
          const len = 13 * (1 - u * .5);
          [-1, 1].forEach(d => h.line(bx, by, bx + Math.cos(t + d * .8) * len, by + Math.sin(t + d * .8) * len, { passes: 1 }));
        }
        if (p.tips > 0) [-1, 1].forEach(d => h.line(tip[0], tip[1], tip[0] + Math.cos(t + d * .9) * p.tips, tip[1] + Math.sin(t + d * .9) * p.tips, { passes: 1 }));
      }
    });

  def('rainbow', 'Nature', 'Rainbow', [N('bands', 'Bands', 2, 8, 5), N('gap', 'Band gap', 3, 12, 6), B('clouds', 'Clouds', true)],
    (h, p) => {
      for (let i = 0; i < p.bands; i++) {
        const r = 46 - i * p.gap;
        if (r < 4) break;
        h.curve(h.arcPts(50, 78, r, r, Math.PI, TAU, 16), { role: i % 2 ? 'accent' : 'line' });
      }
      if (p.clouds) {
        [[14, 76], [86, 76]].forEach(([x, y]) => {
          const pts = [[x - 14, y]];
          for (let k = 0; k < 3; k++) { const cx = x - 8 + k * 8; for (let t = Math.PI; t <= TAU; t += Math.PI / 5) pts.push([cx + Math.cos(t) * 7, y + Math.sin(t) * 9]); }
          pts.push([x + 14, y]);
          h.shape(pts, { closed: true });
        });
      }
    });

  def('hills', 'Nature', 'Hills', [N('layers', 'Layers', 2, 6, 3), N('bumps', 'Bumps', 1, 5, 2), B('sun', 'Sun', true)],
    (h, p) => {
      if (p.sun) h.ellipse(72, 22, 11, 11, { role: 'accent' });
      // each hill is a half-ellipse sitting on its layer's ground line —
      // far more reliable than trying to wiggle one polyline into shape
      for (let l = 0; l < p.layers; l++) {
        const base = 94 - l * (46 / p.layers);
        const span = 116 / p.bumps;
        for (let i = 0; i < p.bumps; i++) {
          const cx = -8 + (i + .5) * span + (l % 2 ? span * .3 : 0);
          const ry = 16 + l * 5 + h.rng() * 7;
          h.curve(h.arcPts(cx, base, span * .62, ry, Math.PI, TAU, 12), { role: l % 2 ? 'accent' : 'line' });
        }
        h.line(-4, base, 104, base, { role: l % 2 ? 'accent' : 'line', passes: 1 });
      }
    });

  def('forest', 'Nature', 'Forest', [N('trees', 'Trees', 3, 12, 6), O('kind', 'Kind', ['pine', 'round', 'mixed'], 0), N('vary', 'Height variance', 0, 60, 30)],
    (h, p) => {
      for (let i = 0; i < p.trees; i++) {
        const x = 8 + (i / (p.trees - 1 || 1)) * 84;
        const hgt = 40 + (h.rng() * p.vary);
        const k = p.kind === 2 ? (i % 2) : p.kind;
        const base = 92;
        h.line(x, base, x, base - hgt * .22);
        if (k === 0) for (let t = 0; t < 3; t++) {
          const y = base - hgt * .2 - t * hgt * .26, w = (10 - t * 2.4) * (hgt / 55);
          h.shape([[x, y - hgt * .3], [x + w, y], [x - w, y]], { closed: true, sharp: true });
        } else h.shape(h.ring(x, base - hgt * .62, hgt * .28, hgt * .3, 9, 0, .12), { closed: true });
      }
      h.line(2, 92, 98, 92);
    });

  def('stones', 'Nature', 'Stone stack', [N('stones', 'Stones', 2, 7, 4), N('wob', 'Irregularity', 5, 50, 22), N('lean', 'Lean', -20, 20, 6)],
    (h, p) => {
      let y = 92;
      for (let i = 0; i < p.stones; i++) {
        const u = i / p.stones;
        const w = 34 * (1 - u * .55), hh = 12 + (1 - u) * 8;
        const x = 50 + p.lean * u;
        h.shape(h.ring(x, y - hh / 2, w / 2, hh / 2, 9, 0, p.wob / 100), { closed: true });
        y -= hh + 2;
      }
      h.line(14, 93, 86, 93, { passes: 1 });
    });

  def('constellation', 'Nature', 'Constellation', [N('stars', 'Stars', 4, 14, 7), B('lines', 'Join the dots', true), N('extra', 'Background stars', 0, 40, 12)],
    (h, p) => {
      const pts = [];
      for (let i = 0; i < p.stars; i++) {
        const t = (i / p.stars) * TAU + h.rng() * .6;
        const r = 18 + h.rng() * 26;
        pts.push([50 + Math.cos(t) * r, 50 + Math.sin(t) * r * .9]);
      }
      if (p.lines) for (let i = 0; i < pts.length - 1; i++) h.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { passes: 1, op: .8 });
      pts.forEach(q => { h.dot(q[0], q[1], 2.4, { role: 'accent', fill: 'accent' }); });
      for (let i = 0; i < p.extra; i++) h.dot(h.rng() * 100, h.rng() * 100, .8 + h.rng(), { op: .6 });
    });

  def('moonphase', 'Nature', 'Moon phases', [N('phases', 'Phases', 3, 8, 5), N('size', 'Size', 8, 26, 14), B('faces', 'Crescent only', false)],
    (h, p) => {
      const gap = 96 / p.phases, R = Math.min(p.size / 2, gap * .42);
      for (let i = 0; i < p.phases; i++) {
        const cx = 2 + gap * (i + .5), u = i / (p.phases - 1 || 1);
        h.ellipse(cx, 50, R, R);
        if (p.faces || (u > .05 && u < .95)) {
          const k = Math.cos(u * Math.PI);
          const pts = h.arcPts(cx, 50, R, R, -Math.PI / 2, Math.PI / 2, 10)
            .concat(h.arcPts(cx, 50, R * Math.abs(k), R, Math.PI / 2, -Math.PI / 2, 10).map(q => [k > 0 ? q[0] : 2 * cx - q[0], q[1]]));
          h.shape(pts, { closed: true, forceFill: 'solid', fillRole: 'accent', outline: false });
        }
      }
    });

  def('berry', 'Nature', 'Berry branch', [N('berries', 'Berries', 3, 14, 7), N('leaves', 'Leaves', 0, 8, 3), N('bend', 'Bend', -30, 30, 12)],
    (h, p) => {
      const stem = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10; stem.push([50 + Math.sin(u * 1.5) * p.bend * u, 96 - u * 86]); }
      h.curve(stem);
      for (let i = 0; i < p.berries; i++) {
        const u = .15 + (i / p.berries) * .8, b = stem[Math.max(0, Math.min(10, Math.round(u * 10)))];
        const d = i % 2 ? 1 : -1;
        h.line(b[0], b[1], b[0] + d * 9, b[1] - 4, { passes: 1 });
        h.ellipse(b[0] + d * 12, b[1] - 6, 5, 5, { role: 'accent', fill: 'accent' });
      }
      for (let i = 0; i < p.leaves; i++) {
        const u = .2 + (i / Math.max(1, p.leaves)) * .7, b = stem[Math.max(0, Math.min(10, Math.round(u * 10)))];
        const d = i % 2 ? -1 : 1, s = 13;
        h.curve([b, [b[0] + d * s * .4, b[1] - s * .7], [b[0] + d * s * 1.2, b[1] - s * .4], [b[0] + d * s * .4, b[1] + s * .2]], { closed: true });
      }
    });

  def('pinecone', 'Nature', 'Pine cone', [N('rows', 'Rows', 4, 10, 6), N('perRow', 'Per row', 3, 8, 5), B('stem', 'Stem', true)],
    (h, p) => {
      for (let r = 0; r < p.rows; r++) {
        const u = r / (p.rows - 1 || 1);
        const y = 20 + u * 64;
        const w = 30 * Math.sin((0.18 + u * .8) * Math.PI);
        for (let i = 0; i < p.perRow; i++) {
          const v = p.perRow === 1 ? .5 : i / (p.perRow - 1);
          const x = 50 + (v - .5) * w * 2 + (r % 2 ? w / p.perRow : 0);
          if (Math.abs(x - 50) > w) continue;
          h.curve([[x, y], [x + 5, y + 4], [x, y + 9], [x - 5, y + 4]], { closed: true, passes: 1 });
        }
      }
      if (p.stem) h.line(50, 20, 50, 8);
    });

  /* ==========================================================
     OBJECTS
     ========================================================== */
  def('calendar', 'Objects', 'Calendar', [N('cols', 'Columns', 3, 7, 5), N('rows', 'Rows', 2, 6, 4), N('marked', 'Marked days', 0, 6, 1)],
    (h, p) => {
      h.curve([[8, 18], [92, 18], [92, 92], [8, 92]], { closed: true, sharp: true });
      h.line(8, 34, 92, 34);
      h.line(26, 22, 26, 10); h.line(74, 22, 74, 10);
      const cw = 84 / p.cols, ch = 58 / p.rows;
      let m = 0;
      for (let r = 0; r < p.rows; r++) for (let c = 0; c < p.cols; c++) {
        const x = 8 + c * cw + cw / 2, y = 34 + r * ch + ch / 2;
        if (m < p.marked && (r * p.cols + c) % 5 === 2) { h.ellipse(x, y, cw * .3, ch * .3, { role: 'accent' }); m++; }
        else h.dot(x, y, 1.3, { op: .7 });
      }
    });

  def('clipboard', 'Objects', 'Clipboard', [N('lines', 'Lines', 2, 8, 4), B('clip', 'Clip', true), N('ticks', 'Ticked', 0, 6, 0)],
    (h, p) => {
      h.curve([[16, 14], [84, 14], [84, 94], [16, 94]], { closed: true, sharp: true });
      if (p.clip) { h.curve([[38, 18], [62, 18], [62, 8], [38, 8]], { closed: true, sharp: true }); h.ellipse(50, 6, 6, 5); }
      const gap = 66 / p.lines;
      for (let i = 0; i < p.lines; i++) {
        const y = 30 + gap * (i + .4);
        if (i < p.ticks) { h.curve([[24, y], [28, y + 4], [34, y - 5]], { sharp: true, role: 'accent' }); h.line(38, y, 76 - (i % 3) * 8, y, { op: .8 }); }
        else { h.curve([[24, y - 4], [32, y - 4], [32, y + 4], [24, y + 4]], { closed: true, sharp: true, passes: 1 }); h.line(38, y, 76 - (i % 3) * 8, y, { op: .8 }); }
      }
    });

  def('mappin', 'Objects', 'Map pin', [O('kind', 'Kind', ['drop', 'flag', 'signpost'], 0), B('shadow', 'Ground mark', true), N('holes', 'Inner dot', 0, 20, 10)],
    (h, p) => {
      if (p.kind === 0) {
        h.shape([[50, 92], [26, 56], [24, 40], [34, 24], [50, 18], [66, 24], [76, 40], [74, 56]], { closed: true });
        if (p.holes > 2) h.ellipse(50, 40, p.holes / 2, p.holes / 2);
      }
      if (p.kind === 1) { h.line(30, 94, 30, 10); h.shape([[30, 12], [76, 20], [76, 44], [30, 36]], { closed: true, sharp: true }); }
      if (p.kind === 2) {
        h.line(50, 94, 50, 14);
        h.shape([[16, 24], [72, 24], [82, 34], [72, 44], [16, 44]], { closed: true, sharp: true });
        h.shape([[84, 54], [28, 54], [18, 64], [28, 74], [84, 74]], { closed: true, sharp: true });
      }
      if (p.shadow) h.ellipse(50, 95, 16, 4, { role: 'accent', op: .6 });
    });

  def('balloon', 'Objects', 'Balloon', [N('count', 'Balloons', 1, 5, 3), N('spread', 'Spread', 20, 96, 62), B('knot', 'Knots', true)],
    (h, p) => {
      const R = Math.min(15, p.count > 1 ? (p.spread / (p.count - 1)) * .48 : 16);
      for (let i = 0; i < p.count; i++) {
        const u = p.count === 1 ? .5 : i / (p.count - 1);
        const x = 50 + (u - .5) * p.spread;
        const y = 8 + Math.abs(u - .5) * 26;
        h.shape([[x, y], [x + R, y + R * .95], [x + R * .55, y + R * 2], [x, y + R * 2.3],
        [x - R * .55, y + R * 2], [x - R, y + R * .95]], { closed: true, role: i % 2 ? 'accent' : 'line' });
        const kx = x, ky = y + R * 2.3;
        if (p.knot) h.curve([[kx - 2.5, ky], [kx + 2.5, ky], [kx, ky + 4]], { closed: true });
        // strings hang, they don't cross — drift only slightly toward centre
        h.curve([[kx, ky + 3], [kx + (50 - kx) * .18, ky + (96 - ky) * .55], [kx + (50 - kx) * .35, 96]], { passes: 1 });
      }
    });

  def('lantern', 'Objects', 'Lantern', [N('ribs', 'Ribs', 3, 10, 5), B('tassel', 'Tassel', true), O('kind', 'Kind', ['paper', 'lamp'], 0)],
    (h, p) => {
      if (p.kind === 0) {
        h.shape(h.ring(50, 50, 32, 30, 14, 0, .02), { closed: true });
        h.curve([[36, 22], [64, 22]]); h.curve([[36, 78], [64, 78]]);
        for (let i = 1; i < p.ribs; i++) { const u = i / p.ribs; h.curve([[36 + u * 28, 22], [30 + u * 40 - 6 + (u - .5) * -8, 50], [36 + u * 28, 78]], { passes: 1 }); }
        h.line(50, 22, 50, 8);
        if (p.tassel) for (let i = 0; i < 5; i++) h.line(44 + i * 3, 80, 43 + i * 3.5, 96, { passes: 1, role: 'accent' });
      } else {
        h.shape([[34, 30], [66, 30], [72, 76], [28, 76]], { closed: true, sharp: true });
        h.line(30, 30, 70, 30); h.line(26, 76, 74, 76);
        h.curve([[42, 30], [42, 18], [58, 18], [58, 30]]);
        h.line(50, 18, 50, 6);
        h.ellipse(50, 54, 9, 12, { role: 'accent' });
      }
    });

  /* aspect hints */
  ['vine', 'moonphase', 'rainbow', 'hills', 'forest', 'constellation'].forEach(k => { if (G[k]) G[k].aspect = 'free'; });
  Object.values(G).forEach(g => { if (!g.aspect) g.aspect = 'square'; });
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
