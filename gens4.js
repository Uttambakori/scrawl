/* ============================================================
   SCRAWL / gens4 — food, tools, weather, transport, marks
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
     FOOD
     ========================================================== */
  def('cake', 'Objects', 'Cake', [N('layers', 'Layers', 1, 4, 2), N('candles', 'Candles', 0, 8, 3), B('plate', 'Plate', true)],
    (h, p) => {
      const bot = p.plate ? 84 : 92, tot = 52, lh = tot / p.layers;
      for (let i = 0; i < p.layers; i++) {
        const y = bot - (i + 1) * lh, wd = 34 - i * 3;
        h.shape([[50 - wd, y], [50 + wd, y], [50 + wd, y + lh], [50 - wd, y + lh]], { closed: true, sharp: true });
        for (let k = 0; k < 5; k++) h.curve([[50 - wd + 2, y + 3], [50 - wd + wd * .5, y + 7], [50, y + 3], [50 + wd * .5, y + 7], [50 + wd - 2, y + 3]], { passes: 1, role: 'accent' });
      }
      const top = bot - tot;
      for (let i = 0; i < p.candles; i++) {
        const x = 50 + (i - (p.candles - 1) / 2) * 11;
        h.line(x, top, x, top - 13);
        h.curve([[x, top - 13], [x + 2.6, top - 17], [x, top - 22], [x - 2.6, top - 17]], { closed: true, role: 'accent' });
      }
      if (p.plate) { h.curve([[16, 84], [26, 92], [74, 92], [84, 84]]); h.line(12, 84, 88, 84); }
    });

  def('slice', 'Objects', 'Pizza slice', [N('bits', 'Toppings', 0, 10, 5), B('crust', 'Crust line', true), N('angle', 'Width', 24, 80, 48)],
    (h, p) => {
      const a = p.angle / 2 * D;
      const L = [50 - Math.sin(a) * 74, 16 + Math.cos(a) * 74];
      const R = [50 + Math.sin(a) * 74, 16 + Math.cos(a) * 74];
      h.shape([[50, 14], R, [50, 92], L], { closed: true });
      if (p.crust) h.curve([[L[0] + 3, L[1] - 6], [50, 84], [R[0] - 3, R[1] - 6]]);
      for (let i = 0; i < p.bits; i++) {
        const t = .25 + h.rng() * .55, sp = (h.rng() - .5) * 2;
        h.dot(50 + sp * 20 * t, 20 + t * 58, 3.4, { role: 'accent', fill: 'accent' });
      }
    });

  def('icecream', 'Objects', 'Ice cream', [N('scoops', 'Scoops', 1, 4, 2), O('base', 'Base', ['cone', 'cup', 'stick'], 0), B('drip', 'Drip', false)],
    (h, p) => {
      // the base first, then scoops stacked so they overlap it and each other
      const rim = p.base === 2 ? 52 : 60;
      if (p.base === 0) {
        h.shape([[24, rim], [76, rim], [50, 98]], { closed: true, sharp: true });
        for (let i = 1; i <= 3; i++) {
          const u = i / 4;
          h.line(24 + u * 26, rim + u * 38, 76 - u * 26, rim + u * 38, { passes: 1, op: .8 });
        }
      }
      if (p.base === 1) { h.shape([[26, rim], [74, rim], [64, 96], [36, 96]], { closed: true, sharp: true }); h.line(23, rim, 77, rim); }
      if (p.base === 2) h.line(50, rim + 6, 50, 97);
      const step = 17;
      for (let i = p.scoops - 1; i >= 0; i--) {
        const r = 21 - i * 1.6;
        const y = rim - 8 - i * step;
        h.shape(h.ring(50 + (i % 2 ? 4 : -4), y, r, r * .92, 11, 0, .1), { closed: true, role: i % 2 ? 'accent' : 'line' });
      }
      if (p.drip) h.curve([[34, rim - 10], [30, rim + 4], [35, rim + 9], [38, rim - 3]], { closed: true, role: 'accent' });
    });

  def('bread', 'Objects', 'Bread', [O('kind', 'Kind', ['loaf', 'baguette', 'roll'], 0), N('slashes', 'Slashes', 0, 6, 3), B('board', 'Board', false)],
    (h, p) => {
      if (p.kind === 1) {
        // long and low, or it looks like every other loaf
        h.shape([[4, 54], [16, 42], [50, 38], [84, 42], [96, 54], [84, 66], [50, 70], [16, 66]], { closed: true });
        for (let i = 0; i < p.slashes; i++) {
          const x = 20 + (i + .5) * (60 / Math.max(1, p.slashes));
          h.line(x - 5, 58, x + 5, 46);
        }
      } else if (p.kind === 2) {
        h.shape(h.ring(50, 56, 27, 23, 11, 0, .07), { closed: true });
        h.curve([[34, 46], [66, 66]], { passes: 1 });
        h.curve([[66, 46], [34, 66]], { passes: 1 });
      } else {
        h.shape([[16, 78], [16, 50], [26, 34], [50, 28], [74, 34], [84, 50], [84, 78]], { closed: true });
        h.line(14, 78, 86, 78);
        for (let i = 0; i < p.slashes; i++) { const x = 30 + i * (40 / Math.max(1, p.slashes)); h.line(x, 44, x + 8, 36); }
      }
      if (p.board) { h.curve([[6, 82], [94, 82], [90, 92], [10, 92]], { closed: true, role: 'accent' }); }
    });

  def('fruit', 'Nature', 'Fruit', [O('kind', 'Kind', ['apple', 'pear', 'lemon', 'cherry', 'strawberry'], 0), B('leaf', 'Leaf', true), N('seeds', 'Marks', 0, 12, 0)],
    (h, p) => {
      if (p.kind === 0) { h.shape([[50, 26], [72, 30], [80, 52], [72, 80], [50, 90], [28, 80], [20, 52], [28, 30]], { closed: true }); h.line(50, 26, 50, 14); }
      if (p.kind === 1) { h.shape([[50, 20], [62, 34], [66, 54], [76, 74], [64, 90], [36, 90], [24, 74], [34, 54], [38, 34]], { closed: true }); h.line(50, 20, 50, 10); }
      if (p.kind === 2) { h.shape(h.ring(50, 54, 32, 24, 12, 0, .03), { closed: true }); h.curve([[18, 54], [10, 52]]); h.curve([[82, 54], [90, 52]]); }
      if (p.kind === 3) {
        h.ellipse(36, 72, 15, 15, { role: 'accent' }); h.ellipse(66, 76, 13, 13, { role: 'accent' });
        h.curve([[36, 57], [44, 34], [56, 24]]); h.curve([[66, 63], [62, 40], [56, 24]]);
      }
      if (p.kind === 4) {
        h.shape([[50, 92], [26, 66], [24, 46], [38, 32], [62, 32], [76, 46], [74, 66]], { closed: true });
        h.curve([[38, 32], [50, 22], [62, 32], [50, 36]], { closed: true, role: 'accent' });
        for (let i = 0; i < 9; i++) h.dot(34 + (i % 3) * 16, 44 + Math.floor(i / 3) * 14, 1.4, { role: 'accent' });
      }
      if (p.leaf && p.kind < 3) h.curve([[50, 18], [62, 10], [70, 18], [56, 24]], { closed: true, role: 'accent' });
      for (let i = 0; i < p.seeds; i++) h.dot(38 + h.rng() * 24, 44 + h.rng() * 30, 1.3, { role: 'accent' });
    });

  /* ==========================================================
     TOOLS & MAKING
     ========================================================== */
  def('brush', 'Objects', 'Brush', [O('kind', 'Kind', ['paint', 'ink', 'roller'], 0), N('rot', 'Rotation', 0, 360, 20), B('mark', 'Paint mark', true)],
    (h, p) => {
      const r = p.rot * D;
      const T = (x, y) => [50 + (x - 50) * Math.cos(r) - (y - 50) * Math.sin(r), 50 + (x - 50) * Math.sin(r) + (y - 50) * Math.cos(r)];
      if (p.kind === 2) {
        h.shape([[26, 24], [74, 24], [74, 40], [26, 40]].map(q => T(...q)), { closed: true });
        h.line(...T(50, 40), ...T(50, 56)); h.line(...T(50, 56), ...T(64, 56));
        h.line(...T(64, 56), ...T(64, 92));
      } else {
        h.shape([[42, 8], [58, 8], [58, 56], [42, 56]].map(q => T(...q)), { closed: true, sharp: true });
        h.shape([[40, 56], [60, 56], [58, 68], [42, 68]].map(q => T(...q)), { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' });
        const tip = p.kind === 0 ? [[42, 68], [58, 68], [56, 92], [44, 92]] : [[42, 68], [58, 68], [50, 96]];
        h.shape(tip.map(q => T(...q)), { closed: true });
      }
      if (p.mark) h.curve([[8, 88], [26, 80], [40, 92], [58, 84]], { role: 'accent' });
    });

  def('palette', 'Objects', 'Paint palette', [N('wells', 'Wells', 3, 9, 5), B('brush', 'Brush', true), N('thumb', 'Thumb hole', 6, 22, 13)],
    (h, p) => {
      h.shape(h.ring(48, 56, 40, 32, 13, .3, .07), { closed: true });
      h.ellipse(30, 66, p.thumb / 2, p.thumb / 2 * .8);
      for (let i = 0; i < p.wells; i++) {
        const t = -2.5 + (i / Math.max(1, p.wells - 1)) * 2.6;
        h.ellipse(50 + Math.cos(t) * 26, 52 + Math.sin(t) * 20, 6, 5.4, { role: i % 2 ? 'accent' : 'line' });
      }
      if (p.brush) { h.line(72, 30, 94, 8); h.shape([[68, 34], [76, 26], [64, 40]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' }); }
    });

  def('hammer', 'Objects', 'Tool', [O('kind', 'Kind', ['hammer', 'wrench', 'screwdriver', 'ruler'], 0), N('rot', 'Rotation', 0, 360, 30), B('shine', 'Spark', false)],
    (h, p) => {
      const r = p.rot * D;
      const T = (x, y) => [50 + (x - 50) * Math.cos(r) - (y - 50) * Math.sin(r), 50 + (x - 50) * Math.sin(r) + (y - 50) * Math.cos(r)];
      if (p.kind === 0) {
        h.shape([[26, 18], [74, 18], [70, 36], [58, 36], [56, 30], [44, 30], [42, 36], [30, 36]].map(q => T(...q)), { closed: true });
        h.shape([[44, 36], [56, 36], [54, 92], [46, 92]].map(q => T(...q)), { closed: true, sharp: true });
      }
      if (p.kind === 1) {
        h.shape([[38, 8], [50, 16], [62, 8], [66, 24], [56, 32], [56, 88], [44, 88], [44, 32], [34, 24]].map(q => T(...q)), { closed: true });
        h.ellipse(...T(50, 20), 6, 6);
      }
      if (p.kind === 2) {
        h.shape([[42, 10], [58, 10], [58, 42], [42, 42]].map(q => T(...q)), { closed: true, sharp: true });
        h.line(...T(50, 42), ...T(50, 82));
        h.shape([[46, 82], [54, 82], [52, 94], [48, 94]].map(q => T(...q)), { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' });
      }
      if (p.kind === 3) {
        h.shape([[10, 40], [90, 40], [90, 60], [10, 60]].map(q => T(...q)), { closed: true, sharp: true });
        for (let i = 1; i < 8; i++) h.line(...T(10 + i * 10, 40), ...T(10 + i * 10, i % 2 ? 48 : 52), { passes: 1 });
      }
      if (p.shine) { h.line(...T(80, 14), ...T(90, 6)); h.line(...T(86, 22), ...T(96, 18)); }
    });

  def('needle', 'Objects', 'Needle & thread', [N('loops', 'Loops', 1, 6, 3), N('rot', 'Rotation', 0, 360, 30), B('spool', 'Spool', false)],
    (h, p) => {
      const r = p.rot * D;
      const T = (x, y) => [50 + (x - 50) * Math.cos(r) - (y - 50) * Math.sin(r), 50 + (x - 50) * Math.sin(r) + (y - 50) * Math.cos(r)];
      h.shape([[48, 8], [52, 8], [54, 76], [50, 92], [46, 76]].map(q => T(...q)), { closed: true });
      h.ellipse(...T(50, 18), 3.4, 6);
      const pts = [];
      for (let i = 0; i <= p.loops * 8; i++) {
        const u = i / (p.loops * 8);
        pts.push(T(50 + Math.sin(u * TAU * p.loops) * 26 - u * 4, 20 + u * 62));
      }
      h.curve(pts, { role: 'accent', passes: 1 });
      if (p.spool) { h.shape([[14, 62], [30, 62], [30, 90], [14, 90]].map(q => T(...q)), { closed: true, sharp: true }); h.line(...T(11, 62), ...T(33, 62)); h.line(...T(11, 90), ...T(33, 90)); }
    });

  /* ==========================================================
     WEATHER & SKY
     ========================================================== */
  def('weather', 'Nature', 'Weather', [O('kind', 'Kind', ['sunny', 'rain', 'storm', 'snow', 'wind', 'partly'], 0), N('bits', 'Drops / flakes', 0, 14, 6), N('cloud', 'Cloud size', 40, 100, 74)],
    (h, p) => {
      const cw = p.cloud / 2;
      const cloud = (cx, cy, s) => {
        const pts = [[cx - cw * s, cy]];
        for (let k = 0; k < 3; k++) {
          const bx = cx - cw * s * .6 + k * cw * s * .6;
          for (let t = Math.PI; t <= TAU; t += Math.PI / 6) pts.push([bx + Math.cos(t) * cw * s * .46, cy + Math.sin(t) * cw * s * .62]);
        }
        pts.push([cx + cw * s, cy]);
        h.shape(pts, { closed: true });
      };
      if (p.kind === 0) {
        h.shape(h.ring(50, 44, 20, 20, 12, 0, .03), { closed: true, role: 'accent' });
        for (let i = 0; i < 12; i++) { const t = i / 12 * TAU; h.line(50 + Math.cos(t) * 25, 44 + Math.sin(t) * 25, 50 + Math.cos(t) * 36, 44 + Math.sin(t) * 36, { role: 'accent' }); }
        return;
      }
      if (p.kind === 5) { h.ellipse(70, 30, 15, 15, { role: 'accent' }); cloud(45, 54, 1); return; }
      cloud(50, 48, 1);
      for (let i = 0; i < p.bits; i++) {
        const x = 22 + (i / Math.max(1, p.bits - 1)) * 56 + h.j(3), y = 62 + (i % 3) * 10;
        if (p.kind === 1) h.line(x, y, x - 4, y + 12, { role: 'accent', passes: 1 });
        if (p.kind === 3) { h.line(x - 4, y + 5, x + 4, y + 5, { role: 'accent', passes: 1 }); h.line(x, y + 1, x, y + 9, { role: 'accent', passes: 1 }); }
        if (p.kind === 4) h.curve([[x - 12, y + 4], [x + 4, y], [x + 12, y + 6]], { role: 'accent', passes: 1 });
      }
      if (p.kind === 2) h.shape([[54, 60], [40, 80], [50, 80], [44, 96], [64, 74], [53, 74]], { closed: true, sharp: true, role: 'accent', forceFill: 'solid', fillRole: 'accent' });
    });

  /* ==========================================================
     TRANSPORT
     ========================================================== */
  def('vehicle', 'Objects', 'Vehicle', [O('kind', 'Kind', ['bike', 'van', 'boat', 'plane', 'train'], 0), B('motion', 'Motion lines', false), N('detail', 'Detail', 0, 6, 3)],
    (h, p) => {
      if (p.kind === 0) {
        h.ellipse(24, 68, 18, 18); h.ellipse(76, 68, 18, 18);
        h.line(24, 68, 44, 68); h.line(44, 68, 56, 40); h.line(56, 40, 76, 68);
        h.line(44, 68, 60, 68); h.line(60, 68, 56, 40);
        h.line(50, 34, 64, 34); h.line(56, 40, 56, 34);
        h.curve([[70, 40], [80, 38], [82, 44]]); h.line(76, 68, 78, 42);
      }
      if (p.kind === 1) {
        h.shape([[8, 44], [56, 44], [70, 56], [92, 56], [92, 78], [8, 78]], { closed: true, sharp: true });
        h.ellipse(28, 78, 11, 11); h.ellipse(74, 78, 11, 11);
        h.curve([[58, 48], [68, 56], [58, 56]], { closed: true, role: 'accent' });
        for (let i = 0; i < p.detail; i++) h.line(14, 52 + i * 6, 40, 52 + i * 6, { passes: 1, op: .7 });
      }
      if (p.kind === 2) {
        h.shape([[10, 66], [90, 66], [78, 86], [22, 86]], { closed: true, sharp: true });
        h.line(50, 62, 50, 20);
        h.shape([[52, 22], [82, 58], [52, 58]], { closed: true, sharp: true });
        h.shape([[48, 30], [24, 58], [48, 58]], { closed: true, sharp: true, role: 'accent' });
        h.curve([[4, 90], [24, 86], [46, 92], [68, 86], [96, 92]], { role: 'accent' });
      }
      if (p.kind === 3) {
        h.shape([[12, 52], [64, 44], [88, 48], [88, 58], [64, 62], [12, 56]], { closed: true });
        h.shape([[40, 50], [58, 20], [66, 20], [54, 50]], { closed: true, sharp: true });
        h.shape([[40, 56], [58, 84], [66, 84], [54, 56]], { closed: true, sharp: true });
        for (let i = 0; i < p.detail; i++) h.dot(24 + i * 7, 53, 1.8, { role: 'accent' });
      }
      if (p.kind === 4) {
        h.shape([[10, 36], [62, 36], [62, 76], [10, 76]], { closed: true, sharp: true });
        h.shape([[62, 44], [88, 44], [92, 76], [62, 76]], { closed: true, sharp: true });
        for (let i = 0; i < Math.max(1, p.detail); i++) h.shape([[16 + i * 15, 44], [28 + i * 15, 44], [28 + i * 15, 58], [16 + i * 15, 58]], { closed: true, sharp: true, passes: 1 });
        h.ellipse(26, 80, 8, 8); h.ellipse(52, 80, 8, 8); h.ellipse(78, 80, 8, 8);
      }
      if (p.motion) for (let i = 0; i < 3; i++) h.line(2, 30 + i * 8, 18 - i * 4, 30 + i * 8, { role: 'accent', passes: 1 });
    });

  /* ==========================================================
     MARKS & UI
     ========================================================== */
  def('cursorMark', 'Marks', 'Cursor', [O('kind', 'Kind', ['arrow', 'hand', 'crosshair', 'target'], 0), N('rot', 'Rotation', 0, 360, 0), B('trail', 'Trail', false)],
    (h, p) => {
      const r = p.rot * D;
      const T = (x, y) => [50 + (x - 50) * Math.cos(r) - (y - 50) * Math.sin(r), 50 + (x - 50) * Math.sin(r) + (y - 50) * Math.cos(r)];
      if (p.kind === 0) { h.shape([[30, 12], [76, 52], [54, 55], [64, 82], [52, 86], [42, 60], [28, 72]].map(q => T(...q)), { closed: true }); }
      if (p.kind === 1) { h.shape([[38, 88], [30, 60], [34, 54], [40, 60], [40, 22], [48, 22], [48, 50], [54, 50], [54, 28], [62, 28], [62, 52], [68, 52], [68, 34], [76, 34], [74, 78], [64, 90]].map(q => T(...q)), { closed: true }); }
      if (p.kind === 2) { h.line(...T(50, 10), ...T(50, 90)); h.line(...T(10, 50), ...T(90, 50)); h.ellipse(50, 50, 16, 16); }
      if (p.kind === 3) { h.ellipse(50, 50, 40, 40); h.ellipse(50, 50, 24, 24); h.dot(50, 50, 5, { role: 'accent', fill: 'accent' }); h.line(50, 4, 50, 20); h.line(50, 80, 50, 96); h.line(4, 50, 20, 50); h.line(80, 50, 96, 50); }
      if (p.trail) h.curve([[6, 92], [22, 80], [16, 66], [34, 56]], { role: 'accent', passes: 1 });
    });

  def('label', 'Frames', 'Label strip', [N('rows', 'Rows', 1, 5, 2), O('shape', 'Shape', ['pill', 'box', 'cut', 'wave'], 0), N('fill', 'Row width', 40, 100, 84)],
    (h, p) => {
      const gh = 84 / p.rows;
      for (let i = 0; i < p.rows; i++) {
        const y = 8 + i * gh, hh = gh * .68, wd = (p.fill / 100) * 92 * (1 - (i % 2) * .18);
        const x = 50 - wd / 2;
        if (p.shape === 0) h.rect(x, y, wd, hh, { r: hh / 2, role: i % 2 ? 'accent' : 'line' });
        if (p.shape === 1) h.shape([[x, y], [x + wd, y], [x + wd, y + hh], [x, y + hh]], { closed: true, sharp: true, role: i % 2 ? 'accent' : 'line' });
        if (p.shape === 2) h.shape([[x + hh * .4, y], [x + wd, y], [x + wd - hh * .4, y + hh], [x, y + hh]], { closed: true, sharp: true, role: i % 2 ? 'accent' : 'line' });
        if (p.shape === 3) {
          const pts = [];
          for (let k = 0; k <= 10; k++) pts.push([x + (k / 10) * wd, y + Math.sin(k / 10 * TAU) * 2]);
          for (let k = 10; k >= 0; k--) pts.push([x + (k / 10) * wd, y + hh + Math.sin(k / 10 * TAU) * 2]);
          h.shape(pts, { closed: true, role: i % 2 ? 'accent' : 'line' });
        }
      }
    });

  def('speechPair', 'Frames', 'Conversation', [N('bubbles', 'Bubbles', 2, 5, 3), O('side', 'Start side', ['left', 'right'], 0), N('lines', 'Lines each', 0, 4, 2)],
    (h, p) => {
      const gh = 92 / p.bubbles;
      for (let i = 0; i < p.bubbles; i++) {
        const left = (i % 2 === 0) === (p.side === 0);
        const y = 4 + i * gh, hh = gh * .74, wd = 58 - (i % 3) * 8;
        const x = left ? 6 : 94 - wd;
        h.rect(x, y, wd, hh, { r: Math.min(10, hh / 2.2), role: left ? 'line' : 'accent' });
        const tx = left ? x + 8 : x + wd - 8;
        h.curve([[tx, y + hh], [tx + (left ? -6 : 6), y + hh + 7], [tx + (left ? 7 : -7), y + hh - 1]], { closed: true, role: left ? 'line' : 'accent' });
        for (let k = 0; k < p.lines; k++) h.line(x + 7, y + 8 + k * (hh - 12) / Math.max(1, p.lines), x + wd - 9 - (k % 2) * 8, y + 8 + k * (hh - 12) / Math.max(1, p.lines), { passes: 1, op: .7 });
      }
    });

  def('chart', 'Frames', 'Chart', [O('kind', 'Kind', ['bars', 'line', 'pie', 'dots'], 0), N('points', 'Points', 3, 12, 6), B('axes', 'Axes', true)],
    (h, p) => {
      if (p.axes && p.kind !== 2) { h.line(12, 88, 92, 88); h.line(12, 88, 12, 10); }
      if (p.kind === 0) {
        const bw = 74 / p.points;
        for (let i = 0; i < p.points; i++) {
          const hh = 14 + h.rng() * 60;
          h.shape([[16 + i * bw, 88 - hh], [16 + i * bw + bw * .68, 88 - hh], [16 + i * bw + bw * .68, 88], [16 + i * bw, 88]], { closed: true, sharp: true, role: i % 3 === 2 ? 'accent' : 'line' });
        }
      }
      if (p.kind === 1) {
        const pts = [];
        for (let i = 0; i < p.points; i++) pts.push([14 + (i / (p.points - 1)) * 76, 80 - h.rng() * 60]);
        h.curve(pts, { role: 'accent' });
        pts.forEach(q => h.dot(q[0], q[1], 2.6));
      }
      if (p.kind === 2) {
        h.ellipse(50, 50, 38, 38);
        let a = -Math.PI / 2;
        for (let i = 0; i < p.points; i++) {
          const step = TAU / p.points;
          h.line(50, 50, 50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38);
          a += step;
        }
      }
      if (p.kind === 3) for (let i = 0; i < p.points * 3; i++) h.dot(16 + h.rng() * 74, 16 + h.rng() * 70, 2.4, { role: i % 4 === 0 ? 'accent' : 'line' });
    });

  ['label', 'speechPair', 'chart'].forEach(k => { if (G[k]) G[k].aspect = 'free'; });
  Object.values(G).forEach(g => { if (!g.aspect) g.aspect = 'square'; });
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
