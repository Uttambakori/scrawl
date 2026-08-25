/* ============================================================
   SCRAWL / gens — the parametric library
   Every generator draws into a 0..100 box. Its params are the
   knobs the inspector exposes. params x seed = thousands of things.
   ============================================================ */
(function () {
  const { TAU } = window.SCRAWL;
  const G = {};
  const D = Math.PI / 180;

  /* helper to declare a generator */
  function def(key, cat, label, params, draw) { G[key] = { key, cat, label, params, draw }; }
  const N = (k, label, min, max, def_, step = 1) => ({ k, label, type: 'num', min, max, def: def_, step });
  const O = (k, label, options, def_ = 0) => ({ k, label, type: 'opt', options, def: def_ });
  const B = (k, label, def_ = true) => ({ k, label, type: 'bool', def: def_ ? 1 : 0 });

  /* ==========================================================
     MARKS
     ========================================================== */
  def('scribble', 'Marks', 'Scribble', [N('lines', 'Passes', 1, 16, 6), N('spread', 'Spread', 6, 95, 55), N('angle', 'Angle', 0, 180, 20)],
    (h, p) => {
      const a = p.angle * D, cx = 50, cy = 50;
      const pts = [];
      for (let i = 0; i <= p.lines; i++) {
        const t = (i / p.lines - 0.5) * p.spread;
        const e = p.spread * 0.5 * (0.8 + h.rng() * 0.4) * (i % 2 ? 1 : -1);
        pts.push([cx + Math.cos(a) * t - Math.sin(a) * e, cy + Math.sin(a) * t + Math.cos(a) * e]);
      }
      h.curve(pts);
    });

  def('zigzag', 'Marks', 'Zigzag', [N('teeth', 'Teeth', 2, 30, 8), N('amp', 'Height', 3, 46, 18), N('rows', 'Rows', 1, 6, 1)],
    (h, p) => {
      for (let r = 0; r < p.rows; r++) {
        const y = p.rows === 1 ? 50 : 18 + (r / (p.rows - 1)) * 64;
        const pts = [];
        for (let i = 0; i <= p.teeth; i++) pts.push([8 + (i / p.teeth) * 84, y + (i % 2 ? -p.amp / 2 : p.amp / 2)]);
        h.curve(pts, { sharp: true });
      }
    });

  def('wave', 'Marks', 'Wave line', [N('waves', 'Waves', 1, 12, 3), N('amp', 'Height', 2, 44, 14), N('rows', 'Rows', 1, 9, 1)],
    (h, p) => {
      for (let r = 0; r < p.rows; r++) {
        const y = p.rows === 1 ? 50 : 14 + (r / (p.rows - 1)) * 72;
        const pts = [];
        const steps = p.waves * 6;
        for (let i = 0; i <= steps; i++) pts.push([6 + (i / steps) * 88, y + Math.sin((i / steps) * TAU * p.waves) * p.amp / 2]);
        h.curve(pts);
      }
    });

  def('spiral', 'Marks', 'Spiral', [N('turns', 'Turns', 1, 10, 4), N('squish', 'Squish', 20, 100, 100), N('open', 'Openness', 10, 100, 45)],
    (h, p) => {
      const pts = [], steps = p.turns * 14;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * TAU * p.turns, r = (i / steps) * p.open;
        pts.push([50 + Math.cos(t) * r, 50 + Math.sin(t) * r * (p.squish / 100)]);
      }
      h.curve(pts);
    });

  def('burst', 'Marks', 'Burst', [N('rays', 'Rays', 3, 48, 12), N('inner', 'Inner gap', 0, 70, 12), N('vary', 'Ray variance', 0, 60, 18)],
    (h, p) => {
      for (let i = 0; i < p.rays; i++) {
        const t = (i / p.rays) * TAU + h.j(0.05);
        const r0 = p.inner / 2, r1 = 46 - h.rng() * p.vary * 0.5;
        h.line(50 + Math.cos(t) * r0, 50 + Math.sin(t) * r0, 50 + Math.cos(t) * r1, 50 + Math.sin(t) * r1);
      }
    });

  def('star', 'Marks', 'Star', [N('points', 'Points', 3, 16, 5), N('inner', 'Waist', 10, 90, 40), N('rot', 'Rotation', 0, 360, 270)],
    (h, p) => {
      const pts = [];
      for (let i = 0; i < p.points * 2; i++) {
        const t = p.rot * D + (i / (p.points * 2)) * TAU;
        const r = i % 2 ? 46 * p.inner / 100 : 46;
        pts.push([50 + Math.cos(t) * r, 50 + Math.sin(t) * r]);
      }
      h.shape(pts, { closed: true, sharp: true });
    });

  def('asterisk', 'Marks', 'Asterisk', [N('arms', 'Arms', 2, 12, 3), N('rot', 'Rotation', 0, 180, 0), N('len', 'Length', 20, 96, 70)],
    (h, p) => {
      for (let i = 0; i < p.arms; i++) {
        const t = p.rot * D + (i / p.arms) * Math.PI, r = p.len / 2;
        h.line(50 - Math.cos(t) * r, 50 - Math.sin(t) * r, 50 + Math.cos(t) * r, 50 + Math.sin(t) * r);
      }
    });

  def('dotfield', 'Marks', 'Dot field', [N('count', 'Count', 2, 260, 40), N('size', 'Dot size', 0.4, 7, 1.8, 0.1), N('spread', 'Spread', 20, 100, 90)],
    (h, p) => {
      for (let i = 0; i < p.count; i++) {
        const t = h.rng() * TAU, r = Math.sqrt(h.rng()) * p.spread / 2;
        h.dot(50 + Math.cos(t) * r, 50 + Math.sin(t) * r, p.size * (0.6 + h.rng() * 0.8));
      }
    });

  def('underline', 'Marks', 'Underline', [N('lines', 'Lines', 1, 6, 2), N('sweep', 'Sweep', 0, 100, 22), N('gap', 'Gap', 2, 20, 6)],
    (h, p) => {
      for (let i = 0; i < p.lines; i++) {
        const y = 50 + i * p.gap;
        h.curve([[6, y + p.sweep * 0.08], [30, y - p.sweep * 0.06], [70, y - p.sweep * 0.02], [94, y + p.sweep * 0.1]]);
      }
    });

  def('tick', 'Marks', 'Symbol', [O('kind', 'Symbol', ['check', 'cross', 'plus', 'minus', 'question', 'bang', 'arrowUp', 'heartSm'], 0)],
    (h, p) => {
      const k = p.kind;
      if (k === 0) h.curve([[20, 52], [40, 74], [82, 24]], { sharp: true });
      if (k === 1) { h.line(22, 22, 78, 78); h.line(78, 22, 22, 78); }
      if (k === 2) { h.line(50, 18, 50, 82); h.line(18, 50, 82, 50); }
      if (k === 3) h.line(16, 50, 84, 50);
      if (k === 4) { h.curve([[34, 34], [42, 22], [58, 24], [62, 38], [50, 48], [50, 60]]); h.dot(50, 74, 3); }
      if (k === 5) { h.curve([[50, 16], [52, 56], [48, 56], [50, 16]], { closed: true, fill: 'line' }); h.dot(50, 76, 3.5); }
      if (k === 6) { h.line(50, 84, 50, 20); h.line(50, 20, 32, 38); h.line(50, 20, 68, 38); }
      if (k === 7) h.shape([[50, 82], [20, 52], [20, 34], [34, 24], [50, 36], [66, 24], [80, 34], [80, 52]], { closed: true });
    });

  /* ==========================================================
     GEOMETRY
     ========================================================== */
  def('blob', 'Shapes', 'Blob', [N('lumps', 'Lumps', 3, 16, 7), N('wob', 'Irregularity', 0, 60, 22), N('squish', 'Squish', 25, 100, 100)],
    (h, p) => h.shape(h.ring(50, 50, 45, 45 * p.squish / 100, p.lumps, h.rng() * TAU, p.wob / 100), { closed: true }));

  def('polygon', 'Shapes', 'Polygon', [N('sides', 'Sides', 3, 16, 6), N('rot', 'Rotation', 0, 360, 270), B('round', 'Rounded', false)],
    (h, p) => h.shape(h.ring(50, 50, 46, 46, p.sides, p.rot * D), { closed: true, sharp: !p.round }));

  def('rings', 'Shapes', 'Rings', [N('count', 'Rings', 1, 10, 3), N('gap', 'Gap', 3, 22, 9), N('squish', 'Squish', 25, 100, 100)],
    (h, p) => { for (let i = 0; i < p.count; i++) { const r = 46 - i * p.gap; if (r > 1) h.ellipse(50, 50, r, r * p.squish / 100); } });

  def('rectsh', 'Shapes', 'Rectangle', [N('r', 'Corner radius', 0, 45, 0), N('inset', 'Inset', 0, 40, 4), N('extra', 'Inner frames', 0, 5, 0)],
    (h, p) => {
      for (let i = 0; i <= p.extra; i++) {
        const k = p.inset + i * 7;
        h.shape([[k, k], [100 - k, k], [100 - k, 100 - k], [k, 100 - k]], { closed: true, sharp: p.r < 3, outline: true });
      }
    });

  def('arcband', 'Shapes', 'Arc', [N('start', 'Start°', 0, 360, 180), N('sweep', 'Sweep°', 20, 360, 180), N('thick', 'Thickness', 0, 40, 0)],
    (h, p) => {
      const a0 = p.start * D, a1 = (p.start + p.sweep) * D;
      if (p.thick < 2) h.curve(h.arcPts(50, 50, 44, 44, a0, a1, 20));
      else {
        const o = h.arcPts(50, 50, 44, 44, a0, a1, 18), i = h.arcPts(50, 50, 44 - p.thick, 44 - p.thick, a1, a0, 18);
        h.shape(o.concat(i), { closed: true });
      }
    });

  def('grid', 'Shapes', 'Grid', [N('cols', 'Columns', 1, 14, 4), N('rows', 'Rows', 1, 14, 4), N('inset', 'Inset', 0, 30, 6)],
    (h, p) => {
      const a = p.inset, b = 100 - p.inset;
      for (let i = 0; i <= p.cols; i++) { const x = a + (i / p.cols) * (b - a); h.line(x, a, x, b); }
      for (let i = 0; i <= p.rows; i++) { const y = a + (i / p.rows) * (b - a); h.line(a, y, b, y); }
    });

  def('stripes', 'Shapes', 'Stripes', [N('count', 'Count', 2, 34, 8), N('angle', 'Angle', 0, 180, 90), N('taper', 'Taper', 0, 100, 0)],
    (h, p) => {
      const a = p.angle * D;
      for (let i = 0; i < p.count; i++) {
        const t = (i / (p.count - 1 || 1) - 0.5) * 88;
        const e = 46 * (1 - (p.taper / 100) * Math.abs(i / (p.count - 1 || 1) - 0.5) * 2);
        h.line(50 + Math.cos(a) * t - Math.sin(a) * e, 50 + Math.sin(a) * t + Math.cos(a) * e,
          50 + Math.cos(a) * t + Math.sin(a) * e, 50 + Math.sin(a) * t - Math.cos(a) * e);
      }
    });

  def('ribbon', 'Shapes', 'Ribbon', [N('waves', 'Waves', 1, 7, 2), N('width', 'Width', 4, 40, 16), N('taper', 'Taper', 0, 100, 30)],
    (h, p) => {
      const top = [], bot = [], steps = 26;
      for (let i = 0; i <= steps; i++) {
        const x = 4 + (i / steps) * 92, u = i / steps;
        const y = 50 + Math.sin(u * TAU * p.waves) * 18;
        const w = p.width / 2 * (1 - (p.taper / 100) * Math.abs(u - 0.5) * 2);
        top.push([x, y - w]); bot.unshift([x, y + w]);
      }
      h.shape(top.concat(bot), { closed: true });
    });

  /* ==========================================================
     FRAMES & UI
     ========================================================== */
  def('frame', 'Frames', 'Frame', [O('style', 'Style', ['plain', 'double', 'ticks', 'dashes', 'scallop', 'corners', 'rope'], 0), N('inset', 'Inset', 0, 30, 5)],
    (h, p) => {
      const a = p.inset, b = 100 - a, s = p.style;
      const box = (k) => h.curve([[k, k], [b - (k - a), k], [b - (k - a), b - (k - a)], [k, b - (k - a)]], { closed: true, sharp: true });
      if (s === 0) box(a);
      if (s === 1) { box(a); box(a + 4); }
      if (s === 2) {
        box(a);
        for (let i = 0; i <= 16; i++) { const t = a + (i / 16) * (b - a); h.line(t, a, t, a + 4, { passes: 1 }); h.line(t, b, t, b - 4, { passes: 1 }); h.line(a, t, a + 4, t, { passes: 1 }); h.line(b, t, b - 4, t, { passes: 1 }); }
      }
      if (s === 3) {
        const dash = (x1, y1, x2, y2) => { const n = 14; for (let i = 0; i < n; i += 2) h.line(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, x1 + (x2 - x1) * (i + 1) / n, y1 + (y2 - y1) * (i + 1) / n, { passes: 1 }); };
        dash(a, a, b, a); dash(b, a, b, b); dash(b, b, a, b); dash(a, b, a, a);
      }
      if (s === 4) {
        const n = 40, pts = [];
        for (let i = 0; i < n; i++) {
          const side = Math.floor(i / (n / 4)), u = (i % (n / 4)) / (n / 4);
          let x, y;
          if (side === 0) { x = a + u * (b - a); y = a; } else if (side === 1) { x = b; y = a + u * (b - a); }
          else if (side === 2) { x = b - u * (b - a); y = b; } else { x = a; y = b - u * (b - a); }
          const bump = (i % 2) ? 3 : -1;
          pts.push([x + (side === 3 ? -bump : side === 1 ? bump : 0), y + (side === 0 ? -bump : side === 2 ? bump : 0)]);
        }
        h.curve(pts, { closed: true });
      }
      if (s === 5) {
        const L = 22;
        [[a, a, 1, 1], [b, a, -1, 1], [b, b, -1, -1], [a, b, 1, -1]].forEach(([x, y, sx, sy]) => { h.line(x, y, x + sx * L, y); h.line(x, y, x, y + sy * L); });
      }
      if (s === 6) {
        const n = 56, pts = [];
        for (let i = 0; i <= n; i++) {
          const side = Math.floor(i / (n / 4)), u = (i % (n / 4)) / (n / 4);
          let x, y;
          if (side === 0) { x = a + u * (b - a); y = a; } else if (side === 1) { x = b; y = a + u * (b - a); }
          else if (side === 2) { x = b - u * (b - a); y = b; } else { x = a; y = b - u * (b - a); }
          pts.push([x, y]);
        }
        h.curve(pts, { closed: true });
        for (let i = 0; i < n; i += 2) { const q = pts[i], r = pts[(i + 2) % n]; h.line((q[0] + r[0]) / 2 - 2, (q[1] + r[1]) / 2 - 2, (q[0] + r[0]) / 2 + 2, (q[1] + r[1]) / 2 + 2, { passes: 1 }); }
      }
    });

  def('bubble', 'Frames', 'Speech bubble', [O('kind', 'Shape', ['round', 'rect', 'burst', 'thought', 'cloud'], 0), N('tail', 'Tail position', 0, 100, 30), N('pad', 'Roundness', 0, 40, 18)],
    (h, p) => {
      const tx = 10 + p.tail * 0.8;
      if (p.kind === 0 || p.kind === 3 || p.kind === 4) {
        const lumps = p.kind === 4 ? 12 : 14;
        h.shape(h.ring(50, 42, 46, 32, lumps, 0, p.kind === 4 ? 0.1 : 0.03), { closed: true });
      } else if (p.kind === 1) {
        h.shape([[6, 10], [94, 10], [94, 72], [6, 72]], { closed: true, sharp: true });
      } else {
        h.shape(h.ring(50, 42, 46, 34, 20, 0, 0.22), { closed: true, sharp: true });
      }
      if (p.kind === 3) { h.ellipse(tx - 4, 82, 6, 5); h.ellipse(tx - 14, 93, 3.5, 3); }
      else h.curve([[tx, 70], [tx - 3, 94], [tx + 16, 71]], { closed: true, sharp: true });
    });

  def('banner', 'Frames', 'Banner', [N('folds', 'Fold depth', 0, 24, 12), N('height', 'Height', 14, 70, 34), B('notch', 'Notched ends', true)],
    (h, p) => {
      const y0 = 50 - p.height / 2, y1 = 50 + p.height / 2, f = p.folds;
      const pts = [[6, y0], [50, y0 - 3], [94, y0]];
      if (p.notch) pts.push([94 - f * 0.4, (y0 + y1) / 2]);
      pts.push([94, y1], [50, y1 + 3], [6, y1]);
      if (p.notch) pts.push([6 + f * 0.4, (y0 + y1) / 2]);
      h.shape(pts, { closed: true });
      if (f > 4) { h.curve([[16, y0 - 1], [14, y1 + 4], [6, y1 + 8], [8, y0 + 2]], { closed: true }); h.curve([[84, y0 - 1], [86, y1 + 4], [94, y1 + 8], [92, y0 + 2]], { closed: true }); }
    });

  def('tag', 'Frames', 'Tag', [B('hole', 'Punch hole', true), N('point', 'Point depth', 0, 40, 20), O('dir', 'Direction', ['left', 'right', 'up'], 0)],
    (h, p) => {
      const d = p.point;
      let pts;
      if (p.dir === 0) pts = [[8 + d, 14], [92, 14], [92, 86], [8 + d, 86], [8, 50]];
      else if (p.dir === 1) pts = [[8, 14], [92 - d, 14], [92, 50], [92 - d, 86], [8, 86]];
      else pts = [[50, 8], [92, 14 + d], [92, 92], [8, 92], [8, 14 + d]];
      h.shape(pts, { closed: true, sharp: true });
      if (p.hole) h.ellipse(p.dir === 0 ? 20 + d : 20, p.dir === 2 ? 26 + d : 50, 4, 4);
    });

  def('badge', 'Frames', 'Badge', [N('scallops', 'Scallops', 6, 40, 16), N('rings', 'Inner rings', 0, 4, 1), N('depth', 'Scallop depth', 1, 12, 4)],
    (h, p) => {
      const pts = [];
      for (let i = 0; i < p.scallops * 2; i++) {
        const t = (i / (p.scallops * 2)) * TAU, r = 46 - (i % 2 ? p.depth : 0);
        pts.push([50 + Math.cos(t) * r, 50 + Math.sin(t) * r]);
      }
      h.shape(pts, { closed: true });
      for (let i = 1; i <= p.rings; i++) h.ellipse(50, 50, 44 - p.depth - i * 5, 44 - p.depth - i * 5);
    });

  def('arrow', 'Frames', 'Arrow', [N('bend', 'Bend', -60, 60, 20), O('head', 'Head', ['barb', 'triangle', 'thin', 'dot'], 0), N('heads', 'Heads', 1, 2, 1)],
    (h, p) => {
      const a = [8, 70], b = [92, 34];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      const c = [mx - dy / L * p.bend, my + dx / L * p.bend];
      h.curve([a, c, b]);
      const drawHead = (tip, from) => {
        const t = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
        if (p.head === 3) { h.dot(tip[0], tip[1], 4); return; }
        const s = p.head === 2 ? 10 : 14, spread = p.head === 0 ? 0.55 : 0.42;
        const p1 = [tip[0] - Math.cos(t - spread) * s, tip[1] - Math.sin(t - spread) * s];
        const p2 = [tip[0] - Math.cos(t + spread) * s, tip[1] - Math.sin(t + spread) * s];
        if (p.head === 1) h.shape([tip, p1, p2], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'line' });
        else { h.line(tip[0], tip[1], p1[0], p1[1]); h.line(tip[0], tip[1], p2[0], p2[1]); }
      };
      drawHead(b, c);
      if (p.heads > 1) drawHead(a, c);
    });

  def('bracket', 'Frames', 'Bracket', [O('kind', 'Kind', ['curly', 'square', 'round'], 0), O('side', 'Side', ['left', 'right', 'both'], 0), N('inset', 'Inset', 0, 30, 10)],
    (h, p) => {
      const one = (x, dir) => {
        const t = p.inset, b = 100 - p.inset;
        if (p.kind === 1) { h.line(x, t, x + 16 * dir, t); h.line(x, t, x, b); h.line(x, b, x + 16 * dir, b); }
        else if (p.kind === 2) h.curve([[x + 16 * dir, t], [x, 50], [x + 16 * dir, b]]);
        else h.curve([[x + 16 * dir, t], [x + 6 * dir, t + 12], [x + 8 * dir, 42], [x, 50], [x + 8 * dir, 58], [x + 6 * dir, b - 12], [x + 16 * dir, b]]);
      };
      if (p.side !== 1) one(10, 1);
      if (p.side !== 0) one(90, -1);
    });

  /* ==========================================================
     NATURE
     ========================================================== */
  def('leaf', 'Nature', 'Leaf', [N('veins', 'Veins', 0, 12, 5), N('curl', 'Curl', -40, 40, 12), N('width', 'Width', 15, 70, 40)],
    (h, p) => {
      const w = p.width / 2;
      const tipx = 50 + p.curl * 0.4;
      h.shape([[50, 92], [50 - w, 60], [tipx - w * 0.5, 26], [tipx, 8], [tipx + w * 0.5, 26], [50 + w, 60]], { closed: true });
      h.curve([[50, 92], [50, 60], [tipx, 30], [tipx, 10]]);
      for (let i = 1; i <= p.veins; i++) {
        const u = i / (p.veins + 1), y = 92 - u * 78, sx = (1 - Math.abs(u - 0.45) * 1.6) * w * 0.8;
        h.line(50 + (tipx - 50) * u, y, 50 + (tipx - 50) * u - sx, y - 7, { passes: 1 });
        h.line(50 + (tipx - 50) * u, y, 50 + (tipx - 50) * u + sx, y - 7, { passes: 1 });
      }
    });

  def('sprig', 'Nature', 'Sprig', [N('leaves', 'Leaves', 2, 18, 8), N('bend', 'Bend', -40, 40, 14), N('size', 'Leaf size', 4, 22, 11)],
    (h, p) => {
      const stem = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10; stem.push([50 + Math.sin(u * 2.2) * p.bend * u, 96 - u * 90]); }
      h.curve(stem);
      for (let i = 0; i < p.leaves; i++) {
        const u = 0.15 + (i / p.leaves) * 0.8, idx = Math.round(u * 10);
        const base = stem[Math.max(0, Math.min(10, idx))], s = p.size * (1 - u * 0.4), dir = i % 2 ? 1 : -1;
        h.curve([base, [base[0] + dir * s, base[1] - s * 0.3], [base[0] + dir * s * 1.4, base[1] - s * 1.1], [base[0] + dir * s * 0.3, base[1] - s * 0.9], base], { closed: true });
      }
    });

  def('flower', 'Nature', 'Flower', [N('petals', 'Petals', 3, 16, 6), O('shape', 'Petal', ['round', 'point', 'heart', 'strip'], 0), N('center', 'Centre', 4, 40, 12)],
    (h, p) => {
      const R = 46 - p.center * 0.3;
      for (let i = 0; i < p.petals; i++) {
        const t = (i / p.petals) * TAU - Math.PI / 2;
        const c = [50 + Math.cos(t) * R * 0.62, 50 + Math.sin(t) * R * 0.62];
        const nx = -Math.sin(t), ny = Math.cos(t);
        const w = R * (p.shape === 3 ? 0.14 : 0.34), l = R * 0.52;
        const tip = [50 + Math.cos(t) * R, 50 + Math.sin(t) * R];
        if (p.shape === 1) h.shape([[50 + Math.cos(t) * p.center * 0.5, 50 + Math.sin(t) * p.center * 0.5], [c[0] + nx * w, c[1] + ny * w], tip, [c[0] - nx * w, c[1] - ny * w]], { closed: true });
        else if (p.shape === 2) h.shape([[50 + Math.cos(t) * p.center * 0.5, 50 + Math.sin(t) * p.center * 0.5], [c[0] + nx * w, c[1] + ny * w], [tip[0] + nx * w * 0.6, tip[1] + ny * w * 0.6], [tip[0] - Math.cos(t) * l * 0.18, tip[1] - Math.sin(t) * l * 0.18], [tip[0] - nx * w * 0.6, tip[1] - ny * w * 0.6], [c[0] - nx * w, c[1] - ny * w]], { closed: true });
        else h.shape([[50 + Math.cos(t) * p.center * 0.5, 50 + Math.sin(t) * p.center * 0.5], [c[0] + nx * w, c[1] + ny * w], tip, [c[0] - nx * w, c[1] - ny * w]], { closed: true });
      }
      h.ellipse(50, 50, p.center / 2, p.center / 2, { role: 'accent' });
    });

  def('tree', 'Nature', 'Tree', [O('kind', 'Kind', ['round', 'pine', 'palm', 'bare', 'topiary'], 0), N('branches', 'Branches', 0, 8, 3), N('trunk', 'Trunk width', 2, 22, 7)],
    (h, p) => {
      const tw = p.trunk / 2;
      h.curve([[50 - tw, 96], [50 - tw * 0.7, 62], [50 + tw * 0.7, 62], [50 + tw, 96]], { closed: false });
      h.line(50 - tw, 96, 50 + tw, 96);
      if (p.kind === 0) h.shape(h.ring(50, 38, 34, 30, 10, 0, 0.14), { closed: true });
      if (p.kind === 1) for (let i = 0; i < 3; i++) { const y = 20 + i * 20, w = 14 + i * 10; h.shape([[50, y], [50 + w, y + 22], [50 - w, y + 22]], { closed: true, sharp: true }); }
      if (p.kind === 2) for (let i = 0; i < 6; i++) { const t = -Math.PI + (i / 5) * Math.PI; h.curve([[50, 60], [50 + Math.cos(t) * 22, 60 + Math.sin(t) * 22], [50 + Math.cos(t) * 40, 60 + Math.sin(t) * 26 + 8]]); }
      if (p.kind === 3) for (let i = 0; i < 5; i++) { const t = -Math.PI * 0.85 + (i / 4) * Math.PI * 0.7; h.line(50, 64, 50 + Math.cos(t) * 34, 64 + Math.sin(t) * 34); }
      if (p.kind === 4) { h.shape(h.ring(50, 26, 22, 20, 9, 0, 0.1), { closed: true }); h.shape(h.ring(50, 54, 28, 16, 9, 0, 0.1), { closed: true }); }
      for (let i = 0; i < p.branches; i++) { const y = 66 + i * 6, dir = i % 2 ? 1 : -1; h.line(50, y, 50 + dir * 12, y - 8, { passes: 1 }); }
    });

  def('mountain', 'Nature', 'Mountains', [N('peaks', 'Peaks', 1, 6, 3), B('snow', 'Snow caps', true), N('rough', 'Jaggedness', 0, 40, 12)],
    (h, p) => {
      const pts = [[2, 88]];
      for (let i = 0; i < p.peaks; i++) {
        const x0 = 2 + (i / p.peaks) * 96, x1 = 2 + ((i + 1) / p.peaks) * 96;
        const peak = 26 + h.rng() * p.rough;
        pts.push([(x0 + x1) / 2, peak], [x1, 88 - h.rng() * 8]);
      }
      pts.push([98, 88]);
      h.shape(pts, { closed: true, sharp: true });
      if (p.snow) for (let i = 0; i < p.peaks; i++) {
        const px = pts[1 + i * 2][0], py = pts[1 + i * 2][1], w = 11;
        h.curve([[px, py], [px - w, py + 16], [px - w * 0.55, py + 11], [px - w * 0.1, py + 15], [px + w * 0.45, py + 10], [px + w, py + 16]], { closed: true, role: 'accent', sharp: true });
      }
    });

  def('cloud', 'Nature', 'Cloud', [N('lumps', 'Lumps', 2, 9, 4), N('rain', 'Rain drops', 0, 12, 0), N('puff', 'Puffiness', 30, 120, 80)],
    (h, p) => {
      const base = 64, x0 = 8, x1 = 92, n = p.lumps;
      const pts = [[x0, base]];
      for (let i = 0; i < n; i++) {
        const a = x0 + (i / n) * (x1 - x0), b = x0 + ((i + 1) / n) * (x1 - x0);
        const cx = (a + b) / 2, r = (b - a) / 2;
        const tall = (p.puff / 100) * (0.85 + (i === (n >> 1) ? 0.55 : h.rng() * 0.25));
        for (let t = Math.PI; t <= TAU - 0.01; t += Math.PI / 7) pts.push([cx + Math.cos(t) * r * 1.06, base + Math.sin(t) * r * 1.9 * tall]);
      }
      pts.push([x1, base]);
      h.shape(pts, { closed: true });
      for (let i = 0; i < p.rain; i++) { const x = 16 + h.rng() * 68, y = 70 + h.rng() * 18; h.line(x, y, x - 3, y + 9, { role: 'accent', passes: 1 }); }
    });

  def('sun', 'Nature', 'Sun', [N('rays', 'Rays', 0, 32, 12), B('face', 'Face', false), N('inner', 'Disc size', 10, 60, 30)],
    (h, p) => {
      const R = p.inner / 2;
      h.shape(h.ring(50, 50, R, R, 14, 0, 0.03), { closed: true });
      for (let i = 0; i < p.rays; i++) { const t = (i / p.rays) * TAU; h.line(50 + Math.cos(t) * (R + 4), 50 + Math.sin(t) * (R + 4), 50 + Math.cos(t) * 47, 50 + Math.sin(t) * 47); }
      if (p.face) { h.dot(50 - R * 0.35, 50 - R * 0.15, 1.6); h.dot(50 + R * 0.35, 50 - R * 0.15, 1.6); h.curve([[50 - R * 0.35, 50 + R * 0.25], [50, 50 + R * 0.5], [50 + R * 0.35, 50 + R * 0.25]]); }
    });

  def('seawaves', 'Nature', 'Sea', [N('rows', 'Rows', 1, 10, 4), N('amp', 'Amplitude', 2, 18, 6), N('density', 'Density', 2, 12, 5)],
    (h, p) => {
      for (let r = 0; r < p.rows; r++) {
        const y = 20 + (r / (p.rows - 1 || 1)) * 62;
        for (let i = 0; i < p.density; i++) {
          const x = 8 + (i / p.density) * 84 + (r % 2 ? 5 : 0);
          h.curve([[x, y], [x + 5, y - p.amp], [x + 10, y], [x + 15, y + p.amp * 0.4]], { passes: 1 });
        }
      }
    });

  def('sparkle', 'Nature', 'Sparkles', [N('count', 'Count', 1, 14, 4), N('points', 'Points', 4, 10, 4), N('spread', 'Spread', 20, 100, 80)],
    (h, p) => {
      for (let i = 0; i < p.count; i++) {
        const cx = 50 + h.j(p.spread / 2), cy = 50 + h.j(p.spread / 2), R = 6 + h.rng() * 14;
        const pts = [];
        for (let k = 0; k < p.points * 2; k++) { const t = (k / (p.points * 2)) * TAU - Math.PI / 2; pts.push([cx + Math.cos(t) * (k % 2 ? R * 0.18 : R), cy + Math.sin(t) * (k % 2 ? R * 0.18 : R)]); }
        h.shape(pts, { closed: true });
      }
    });

  /* ==========================================================
     OBJECTS
     ========================================================== */
  def('cup', 'Objects', 'Cup', [B('saucer', 'Saucer', true), N('steam', 'Steam', 0, 5, 2), O('kind', 'Kind', ['espresso', 'mug', 'takeaway', 'glass'], 0)],
    (h, p) => {
      if (p.kind === 2) {
        h.shape([[30, 32], [70, 32], [64, 88], [36, 88]], { closed: true, sharp: true });
        h.curve([[26, 32], [50, 28], [74, 32], [50, 36]], { closed: true });
        h.curve([[32, 22], [50, 18], [68, 22], [68, 30], [32, 30]], { closed: true, role: 'accent' });
      } else if (p.kind === 3) {
        h.shape([[32, 26], [68, 26], [60, 86], [40, 86]], { closed: true, sharp: true });
        h.curve([[34, 50], [66, 50]], { role: 'accent' });
      } else {
        const top = p.kind === 1 ? 30 : 38;
        h.shape([[30, top], [32, 62], [40, 72], [60, 72], [68, 62], [70, top]], { closed: false });
        h.curve([[26, top], [48, top - 3], [74, top]], { closed: true });
        h.curve([[70, top + 6], [84, top + 5], [86, top + 18], [73, top + 22]]);
      }
      if (p.saucer && p.kind < 2) { h.curve([[18, 80], [28, 86], [72, 86], [82, 80]]); h.curve([[14, 79], [50, 75], [86, 79]]); }
      for (let i = 0; i < p.steam; i++) {
        const x = 38 + i * (24 / Math.max(1, p.steam - 1 || 1));
        h.curve([[x, 24], [x + 5, 17], [x - 2, 10], [x + 4, 3]], { role: 'accent' });
      }
    });

  def('bottle', 'Objects', 'Bottle', [N('neck', 'Neck length', 5, 40, 20), B('label', 'Label', true), N('shoulder', 'Shoulder', 0, 40, 18)],
    (h, p) => {
      const ny = 12 + p.neck;
      h.shape([[42, 10], [58, 10], [58, ny], [58 + p.shoulder * 0.7, ny + 12], [72, 92], [28, 92], [42 - p.shoulder * 0.7 + p.shoulder * 0.7, ny + 12], [42, ny]], { closed: true });
      h.line(40, 10, 60, 10);
      h.line(40, 16, 60, 16);
      if (p.label) { h.curve([[30, 50], [70, 50]], { role: 'accent' }); h.curve([[30, 70], [70, 70]], { role: 'accent' }); h.curve([[36, 60], [64, 60]], { role: 'accent', passes: 1 }); }
    });

  def('book', 'Objects', 'Book', [B('open', 'Open', false), N('pages', 'Page lines', 0, 10, 4), N('lean', 'Lean', -20, 20, 0)],
    (h, p) => {
      if (p.open) {
        h.curve([[6, 30], [50, 38], [94, 30], [94, 76], [50, 84], [6, 76]], { closed: true });
        h.curve([[50, 38], [50, 84]]);
        for (let i = 1; i <= p.pages; i++) { const y = 44 + i * 6; if (y < 78) { h.line(14, y, 44, y + 2, { passes: 1 }); h.line(56, y + 2, 86, y, { passes: 1 }); } }
      } else {
        const l = p.lean * 0.5;
        h.shape([[26 + l, 12], [74 + l, 12], [74 - l, 88], [26 - l, 88]], { closed: true, sharp: true });
        h.line(34 + l, 13, 34 - l, 88);
        for (let i = 1; i <= p.pages; i++) { const y = 24 + i * 9; if (y < 84) h.line(42, y, 66, y, { passes: 1, role: 'accent' }); }
      }
    });

  def('bulb', 'Objects', 'Light bulb', [N('rays', 'Rays', 0, 16, 8), B('filament', 'Filament', true), N('base', 'Base height', 6, 30, 16)],
    (h, p) => {
      h.shape([[50, 18], [70, 26], [72, 44], [62, 58], [60, 66], [40, 66], [38, 58], [28, 44], [30, 26]], { closed: true });
      for (let i = 0; i < 3; i++) h.line(40, 68 + i * (p.base / 3), 60, 68 + i * (p.base / 3), { passes: 1 });
      h.line(43, 68 + p.base, 57, 68 + p.base);
      if (p.filament) h.curve([[43, 56], [46, 44], [50, 50], [54, 44], [57, 56]]);
      for (let i = 0; i < p.rays; i++) { const t = -Math.PI * 0.95 + (i / (p.rays - 1 || 1)) * Math.PI * 0.9; h.line(50 + Math.cos(t) * 30, 40 + Math.sin(t) * 30, 50 + Math.cos(t) * 44, 40 + Math.sin(t) * 44, { role: 'accent' }); }
    });

  def('clock', 'Objects', 'Clock', [B('numerals', 'Tick marks', true), N('hour', 'Hour', 0, 11, 10), N('minute', 'Minute', 0, 59, 10)],
    (h, p) => {
      h.shape(h.ring(50, 50, 44, 44, 16, 0, 0.02), { closed: true });
      if (p.numerals) for (let i = 0; i < 12; i++) { const t = (i / 12) * TAU - Math.PI / 2; h.line(50 + Math.cos(t) * 36, 50 + Math.sin(t) * 36, 50 + Math.cos(t) * (i % 3 ? 40 : 42), 50 + Math.sin(t) * (i % 3 ? 40 : 42), { passes: 1 }); }
      const ha = ((p.hour % 12) / 12 + p.minute / 720) * TAU - Math.PI / 2;
      const ma = (p.minute / 60) * TAU - Math.PI / 2;
      h.line(50, 50, 50 + Math.cos(ha) * 22, 50 + Math.sin(ha) * 22);
      h.line(50, 50, 50 + Math.cos(ma) * 32, 50 + Math.sin(ma) * 32, { role: 'accent' });
      h.dot(50, 50, 2);
    });

  def('envelope', 'Objects', 'Envelope', [B('open', 'Open flap', false), N('seal', 'Seal size', 0, 16, 0), N('h', 'Height', 30, 80, 56)],
    (h, p) => {
      const y0 = 50 - p.h / 2, y1 = 50 + p.h / 2;
      h.shape([[8, y0], [92, y0], [92, y1], [8, y1]], { closed: true, sharp: true });
      if (p.open) { h.curve([[8, y0], [50, y0 - 26], [92, y0]]); h.line(8, y0, 50, y0 + 14); h.line(92, y0, 50, y0 + 14); }
      else { h.line(8, y0, 50, y0 + p.h * 0.48); h.line(92, y0, 50, y0 + p.h * 0.48); }
      if (p.seal > 0) h.ellipse(50, y0 + p.h * 0.45, p.seal / 2, p.seal / 2, { role: 'accent', fill: 'accent' });
    });

  def('box3d', 'Objects', 'Box', [N('depth', 'Depth', 4, 34, 18), B('open', 'Open lid', false), N('tape', 'Tape lines', 0, 3, 1)],
    (h, p) => {
      const d = p.depth;
      h.shape([[20, 34], [70, 34], [70, 86], [20, 86]], { closed: true, sharp: true });
      h.line(20, 34, 20 + d, 34 - d); h.line(70, 34, 70 + d, 34 - d); h.line(70, 86, 70 + d, 86 - d);
      h.line(20 + d, 34 - d, 70 + d, 34 - d); h.line(70 + d, 34 - d, 70 + d, 86 - d);
      if (p.open) { h.line(20, 34, 8, 22); h.line(70 + d, 34 - d, 84 + d, 22 - d); }
      for (let i = 0; i < p.tape; i++) h.line(20, 46 + i * 12, 70, 46 + i * 12, { role: 'accent' });
    });

  def('heart', 'Objects', 'Heart', [N('pinch', 'Pinch', 0, 40, 18), N('width', 'Width', 40, 100, 76), N('rings', 'Outlines', 1, 4, 1)],
    (h, p) => {
      for (let k = 0; k < p.rings; k++) {
        const s = 1 - k * 0.14, w = p.width / 2 * s;
        h.shape([[50, 88 * s + 50 * (1 - s)], [50 - w, 52], [50 - w, 32], [50 - w * 0.5, 22], [50, 34 - p.pinch * 0.2], [50 + w * 0.5, 22], [50 + w, 32], [50 + w, 52]], { closed: true });
      }
    });

  def('plantpot', 'Objects', 'Plant', [N('leaves', 'Leaves', 2, 12, 5), O('pot', 'Pot', ['taper', 'round', 'square'], 0), N('spread', 'Spread', 20, 90, 55)],
    (h, p) => {
      if (p.pot === 0) h.shape([[32, 62], [68, 62], [62, 94], [38, 94]], { closed: true, sharp: true });
      else if (p.pot === 1) h.shape(h.ring(50, 78, 20, 17, 12, 0, 0.03), { closed: true });
      else h.shape([[32, 62], [68, 62], [68, 94], [32, 94]], { closed: true, sharp: true });
      h.line(30, 62, 70, 62);
      for (let i = 0; i < p.leaves; i++) {
        const u = p.leaves === 1 ? 0.5 : i / (p.leaves - 1);
        const t = -Math.PI / 2 + (u - 0.5) * (p.spread / 100) * Math.PI;
        const tip = [50 + Math.cos(t) * 40, 62 + Math.sin(t) * 46];
        const mid = [50 + Math.cos(t) * 22, 62 + Math.sin(t) * 26];
        h.curve([[50, 62], [mid[0] - 7, mid[1]], tip, [mid[0] + 7, mid[1]], [50, 62]], { closed: true });
      }
    });

  /* ==========================================================
     CREATURES  — the combinatorial ones
     ========================================================== */
  def('face', 'Characters', 'Face', [
    O('head', 'Head', ['round', 'oval', 'square', 'blobby', 'long'], 0),
    O('eyes', 'Eyes', ['dots', 'circles', 'wink', 'closed', 'stars', 'wide', 'sleepy'], 0),
    O('brows', 'Brows', ['none', 'flat', 'raised', 'angry', 'wavy'], 0),
    O('mouth', 'Mouth', ['smile', 'flat', 'open', 'grin', 'squiggle', 'frown', 'whistle'], 0),
    O('hair', 'Hair', ['none', 'squiggle', 'spikes', 'bob', 'curls', 'bun', 'cap', 'parted'], 0),
    O('extra', 'Extra', ['none', 'glasses', 'freckles', 'blush', 'moustache', 'earrings'], 0),
  ], (h, p) => {
    const HW = [30, 26, 30, 30, 25][p.head], HH = [30, 32, 30, 30, 36][p.head];
    const cy = 52;
    // head
    if (p.head === 2) h.shape([[50 - HW, cy - HH], [50 + HW, cy - HH], [50 + HW, cy + HH * 0.9], [50 - HW, cy + HH * 0.9]], { closed: true, sharp: true });
    else if (p.head === 3) h.shape(h.ring(50, cy, HW, HH, 9, 0, 0.09), { closed: true });
    else h.shape(h.ring(50, cy, HW, HH, 14, 0, 0.02), { closed: true });
    // ears
    h.curve([[50 - HW, cy - 3], [50 - HW - 6, cy - 2], [50 - HW - 6, cy + 7], [50 - HW, cy + 7]]);
    h.curve([[50 + HW, cy - 3], [50 + HW + 6, cy - 2], [50 + HW + 6, cy + 7], [50 + HW, cy + 7]]);
    const ex = 11, ey = cy - 6;
    // eyes
    const eye = (x, kind) => {
      if (kind === 0) h.dot(x, ey, 2.2);
      if (kind === 1) h.ellipse(x, ey, 4, 4.4, { exact: true });
      if (kind === 2) h.curve([[x - 4, ey + 1], [x, ey - 3], [x + 4, ey + 1]]);
      if (kind === 3) h.curve([[x - 4, ey - 1], [x, ey + 3], [x + 4, ey - 1]]);
      if (kind === 4) { h.line(x - 4, ey, x + 4, ey); h.line(x, ey - 4, x, ey + 4); h.line(x - 3, ey - 3, x + 3, ey + 3); }
      if (kind === 5) { h.ellipse(x, ey, 5.5, 6, { exact: true }); h.dot(x + 1.5, ey + 1, 2.4); }
      if (kind === 6) { h.curve([[x - 5, ey - 2], [x, ey + 2], [x + 5, ey - 2]]); }
    };
    eye(50 - ex, p.eyes); eye(50 + ex, p.eyes === 2 ? 3 : p.eyes);
    // brows
    if (p.brows === 1) { h.line(50 - ex - 5, ey - 9, 50 - ex + 5, ey - 9); h.line(50 + ex - 5, ey - 9, 50 + ex + 5, ey - 9); }
    if (p.brows === 2) { h.curve([[50 - ex - 5, ey - 9], [50 - ex, ey - 13], [50 - ex + 5, ey - 9]]); h.curve([[50 + ex - 5, ey - 9], [50 + ex, ey - 13], [50 + ex + 5, ey - 9]]); }
    if (p.brows === 3) { h.line(50 - ex - 5, ey - 12, 50 - ex + 5, ey - 7); h.line(50 + ex + 5, ey - 12, 50 + ex - 5, ey - 7); }
    if (p.brows === 4) { h.curve([[50 - ex - 5, ey - 10], [50 - ex, ey - 6], [50 - ex + 5, ey - 11]]); h.curve([[50 + ex - 5, ey - 10], [50 + ex, ey - 6], [50 + ex + 5, ey - 11]]); }
    // nose
    h.curve([[50 - 1, cy - 1], [50 - 3, cy + 6], [50 + 2, cy + 7]]);
    // mouth
    const my = cy + 16;
    if (p.mouth === 0) h.curve([[50 - 9, my - 3], [50, my + 3], [50 + 9, my - 3]]);
    if (p.mouth === 1) h.line(50 - 8, my, 50 + 8, my);
    if (p.mouth === 2) h.shape(h.ring(50, my, 6, 7, 10, 0, 0.05), { closed: true });
    if (p.mouth === 3) { h.curve([[50 - 12, my - 4], [50, my + 6], [50 + 12, my - 4], [50 - 12, my - 4]], { closed: true }); h.line(50 - 8, my - 2, 50 + 8, my - 2, { passes: 1 }); }
    if (p.mouth === 4) h.curve([[50 - 10, my], [50 - 4, my - 3], [50 + 2, my + 3], [50 + 10, my - 1]]);
    if (p.mouth === 5) h.curve([[50 - 9, my + 3], [50, my - 3], [50 + 9, my + 3]]);
    if (p.mouth === 6) h.ellipse(50 + 2, my, 3.5, 3, { exact: true });
    // hair
    if (p.hair === 1) { h.curve([[50 - HW + 2, cy - HH + 4], [50 - 12, cy - HH - 8], [50, cy - HH - 2], [50 + 12, cy - HH - 9], [50 + HW - 2, cy - HH + 5]]); }
    if (p.hair === 2) for (let i = 0; i < 7; i++) { const x = 50 - HW + (i / 6) * HW * 2; h.line(x, cy - HH + 4, x + h.j(4), cy - HH - 11); }
    if (p.hair === 3) h.curve([[50 - HW - 3, cy + 6], [50 - HW - 4, cy - HH], [50, cy - HH - 10], [50 + HW + 4, cy - HH], [50 + HW + 3, cy + 6]]);
    if (p.hair === 4) for (let i = 0; i < 8; i++) { const t = Math.PI + (i / 7) * Math.PI; h.ellipse(50 + Math.cos(t) * HW * 0.95, cy + Math.sin(t) * HH * 0.95, 6, 5); }
    if (p.hair === 5) { h.curve([[50 - HW, cy - HH + 6], [50, cy - HH - 4], [50 + HW, cy - HH + 6]]); h.ellipse(50, cy - HH - 12, 10, 8); }
    if (p.hair === 6) { h.curve([[50 - HW - 4, cy - HH + 8], [50, cy - HH - 12], [50 + HW + 4, cy - HH + 8]], { closed: true, role: 'accent' }); h.line(50 - HW - 4, cy - HH + 8, 50 + HW + 4, cy - HH + 8, { role: 'accent' }); }
    if (p.hair === 7) { h.curve([[50 - HW - 2, cy - 2], [50 - HW - 2, cy - HH - 2], [50 - 4, cy - HH - 6]]); h.curve([[50 - 4, cy - HH - 6], [50 + 14, cy - HH - 2], [50 + HW + 2, cy - 4]]); }
    // extras
    if (p.extra === 1) { h.ellipse(50 - ex, ey, 8, 7); h.ellipse(50 + ex, ey, 8, 7); h.line(50 - 3, ey, 50 + 3, ey); h.line(50 - ex - 8, ey - 1, 50 - HW, ey - 3); h.line(50 + ex + 8, ey - 1, 50 + HW, ey - 3); }
    if (p.extra === 2) for (let i = 0; i < 8; i++) h.dot(50 + h.j(HW * 0.9), cy + 4 + h.j(7), 0.8, { role: 'accent' });
    if (p.extra === 3) { h.ellipse(50 - HW * 0.65, cy + 8, 6, 4, { role: 'accent' }); h.ellipse(50 + HW * 0.65, cy + 8, 6, 4, { role: 'accent' }); }
    if (p.extra === 4) h.curve([[50 - 11, cy + 10], [50 - 4, cy + 7], [50, cy + 9], [50 + 4, cy + 7], [50 + 11, cy + 10], [50, cy + 13]], { closed: true, role: 'accent' });
    if (p.extra === 5) { h.dot(50 - HW - 4, cy + 8, 2.2, { role: 'accent' }); h.dot(50 + HW + 4, cy + 8, 2.2, { role: 'accent' }); }
  });

  def('critter', 'Characters', 'Critter', [
    O('ears', 'Ears', ['pointy', 'floppy', 'round', 'long', 'none', 'horns'], 0),
    O('body', 'Body', ['sitting', 'standing', 'loaf', 'round'], 0),
    O('tail', 'Tail', ['curl', 'straight', 'puff', 'none', 'long'], 0),
    O('face', 'Face', ['cat', 'dog', 'dots', 'sleepy', 'happy'], 0),
    N('headsize', 'Head size', 18, 42, 26),
  ], (h, p) => {
    const HR = p.headsize / 2, hx = 50, hy = 30;
    // body
    if (p.body === 0) {
      h.shape([[hx - 19, 90], [hx - 20, 70], [hx - 15, 54], [hx - 8, 44], [hx + 8, 44], [hx + 15, 54], [hx + 20, 70], [hx + 19, 90]], { closed: true });
      h.ellipse(hx - 11, 88, 6, 3.4); h.ellipse(hx + 11, 88, 6, 3.4);
    }
    if (p.body === 1) { h.shape([[hx - 16, 88], [hx - 15, 58], [hx + 15, 58], [hx + 16, 88]], { closed: true }); h.line(hx - 8, 88, hx - 8, 74, { passes: 1 }); h.line(hx + 8, 88, hx + 8, 74, { passes: 1 }); }
    if (p.body === 2) h.shape(h.ring(hx, 74, 30, 18, 12, 0, 0.05), { closed: true });
    if (p.body === 3) h.shape(h.ring(hx, 68, 26, 26, 12, 0, 0.06), { closed: true });
    // head
    h.shape(h.ring(hx, hy, HR, HR * 0.92, 12, 0, 0.04), { closed: true });
    // ears
    const eo = HR * 0.72;
    if (p.ears === 0) { h.shape([[hx - eo - 5, hy - HR * 0.6], [hx - eo - 3, hy - HR - 12], [hx - eo + 7, hy - HR * 0.85]], { closed: true, sharp: true }); h.shape([[hx + eo + 5, hy - HR * 0.6], [hx + eo + 3, hy - HR - 12], [hx + eo - 7, hy - HR * 0.85]], { closed: true, sharp: true }); }
    if (p.ears === 1) { h.shape([[hx - eo - 2, hy - HR * 0.7], [hx - eo - 10, hy - HR * 0.2], [hx - eo - 6, hy + HR * 0.4], [hx - eo + 3, hy - HR * 0.5]], { closed: true }); h.shape([[hx + eo + 2, hy - HR * 0.7], [hx + eo + 10, hy - HR * 0.2], [hx + eo + 6, hy + HR * 0.4], [hx + eo - 3, hy - HR * 0.5]], { closed: true }); }
    if (p.ears === 2) { h.ellipse(hx - eo - 3, hy - HR * 0.7, 7, 7); h.ellipse(hx + eo + 3, hy - HR * 0.7, 7, 7); }
    if (p.ears === 3) { h.shape([[hx - 8, hy - HR * 0.7], [hx - 13, hy - HR - 20], [hx - 4, hy - HR - 18], [hx - 2, hy - HR * 0.8]], { closed: true }); h.shape([[hx + 8, hy - HR * 0.7], [hx + 13, hy - HR - 20], [hx + 4, hy - HR - 18], [hx + 2, hy - HR * 0.8]], { closed: true }); }
    if (p.ears === 5) { h.curve([[hx - eo, hy - HR * 0.7], [hx - eo - 6, hy - HR - 12], [hx - eo + 2, hy - HR - 6]]); h.curve([[hx + eo, hy - HR * 0.7], [hx + eo + 6, hy - HR - 12], [hx + eo - 2, hy - HR - 6]]); }
    // face
    const ex = HR * 0.42, ey = hy - 2;
    if (p.face === 0 || p.face === 1 || p.face === 2) { h.dot(hx - ex, ey, 2); h.dot(hx + ex, ey, 2); }
    if (p.face === 3) { h.curve([[hx - ex - 4, ey], [hx - ex, ey + 3], [hx - ex + 4, ey]]); h.curve([[hx + ex - 4, ey], [hx + ex, ey + 3], [hx + ex + 4, ey]]); }
    if (p.face === 4) { h.curve([[hx - ex - 4, ey + 2], [hx - ex, ey - 3], [hx - ex + 4, ey + 2]]); h.curve([[hx + ex - 4, ey + 2], [hx + ex, ey - 3], [hx + ex + 4, ey + 2]]); }
    h.shape([[hx - 2.5, ey + 7], [hx + 2.5, ey + 7], [hx, ey + 10]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' });
    h.curve([[hx, ey + 10], [hx - 4, ey + 13], [hx - 6, ey + 10]]);
    h.curve([[hx, ey + 10], [hx + 4, ey + 13], [hx + 6, ey + 10]]);
    if (p.face === 0) { for (let s of [-1, 1]) for (let i = 0; i < 2; i++) h.line(hx + s * 7, ey + 8 + i * 2.5, hx + s * (HR + 10), ey + 6 + i * 5, { passes: 1 }); }
    if (p.face === 1) h.ellipse(hx, ey + 9, 7, 5);
    // tail
    if (p.tail === 0) h.curve([[hx + 18, 86], [hx + 31, 88], [hx + 38, 78], [hx + 34, 68], [hx + 27, 71]]);
    if (p.tail === 1) h.curve([[hx + 18, 86], [hx + 33, 78], [hx + 41, 62]]);
    if (p.tail === 2) h.shape(h.ring(hx + 27, 82, 10, 9, 9, 0, 0.16), { closed: true });
    if (p.tail === 4) h.curve([[hx + 18, 88], [hx + 36, 90], [hx + 45, 76], [hx + 39, 56], [hx + 29, 48]]);
  });

  def('bird', 'Characters', 'Bird', [O('beak', 'Beak', ['short', 'long', 'hooked'], 0), N('crest', 'Crest', 0, 6, 0), O('tail', 'Tail', ['fan', 'point', 'long'], 0)],
    (h, p) => {
      h.shape(h.ring(48, 56, 24, 20, 12, 0, 0.05), { closed: true });
      h.shape(h.ring(36, 32, 13, 12, 11, 0, 0.04), { closed: true });
      h.dot(32, 30, 2);
      if (p.beak === 0) h.shape([[24, 32], [12, 36], [24, 39]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' });
      if (p.beak === 1) h.shape([[24, 32], [2, 40], [24, 39]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' });
      if (p.beak === 2) h.shape([[24, 31], [10, 34], [16, 42], [24, 39]], { closed: true, forceFill: 'solid', fillRole: 'accent' });
      for (let i = 0; i < p.crest; i++) h.line(34 + i * 2, 21, 32 + i * 3, 10 - i);
      h.curve([[42, 50], [58, 46], [66, 58], [52, 66]], { closed: true });
      if (p.tail === 0) for (let i = 0; i < 4; i++) h.line(70, 62, 92, 50 + i * 7);
      if (p.tail === 1) h.shape([[68, 58], [94, 48], [88, 70]], { closed: true, sharp: true });
      if (p.tail === 2) h.curve([[68, 60], [88, 56], [96, 34]]);
      h.line(42, 76, 40, 92); h.line(54, 76, 56, 92);
      h.line(40, 92, 32, 94); h.line(56, 92, 64, 94);
    });

  def('figure', 'Characters', 'Figure', [O('pose', 'Pose', ['stand', 'wave', 'walk', 'sit', 'cheer', 'think', 'run'], 0), N('head', 'Head size', 8, 24, 13), B('outline', 'Body outline', false)],
    (h, p) => {
      const hr = p.head / 2, hy = 14 + hr;
      h.shape(h.ring(50, hy, hr, hr, 11, 0, 0.03), { closed: true });
      const neck = hy + hr, hip = 64;
      h.line(50, neck, 50, hip);
      const P = p.pose;
      const arm = (dir, ax, ay) => h.curve([[50, neck + 5], [50 + dir * 10, neck + 12], [ax, ay]]);
      if (P === 0) { arm(-1, 30, hip - 2); arm(1, 70, hip - 2); h.line(50, hip, 40, 94); h.line(50, hip, 60, 94); }
      if (P === 1) { arm(-1, 32, hip); arm(1, 76, 22); h.line(50, hip, 40, 94); h.line(50, hip, 60, 94); }
      if (P === 2) { arm(-1, 34, 56); arm(1, 66, hip + 4); h.line(50, hip, 34, 92); h.line(50, hip, 64, 88); }
      if (P === 3) { arm(-1, 32, 62); arm(1, 68, 62); h.line(50, hip, 34, 70); h.line(34, 70, 34, 92); h.line(50, hip, 66, 72); h.line(66, 72, 66, 92); }
      if (P === 4) { arm(-1, 24, 20); arm(1, 76, 20); h.line(50, hip, 36, 94); h.line(50, hip, 64, 94); }
      if (P === 5) { arm(-1, 34, 58); h.curve([[50, neck + 6], [62, 52], [56, hy + hr - 2]]); h.line(50, hip, 42, 94); h.line(50, hip, 58, 94); }
      if (P === 6) { arm(-1, 28, 48); arm(1, 72, 60); h.line(50, hip, 30, 84); h.line(30, 84, 24, 94); h.line(50, hip, 68, 78); h.line(68, 78, 74, 92); }
      if (p.outline) h.curve([[42, neck + 2], [40, hip], [60, hip], [58, neck + 2]], { closed: true });
    });

  def('hand', 'Characters', 'Hand', [O('gesture', 'Gesture', ['point', 'open', 'ok', 'peace', 'fist'], 0), N('rot', 'Rotation', 0, 360, 0), B('cuff', 'Cuff', true)],
    (h, p) => {
      const r = p.rot * D;
      const T = (x, y) => [50 + (x - 50) * Math.cos(r) - (y - 60) * Math.sin(r), 60 + (x - 50) * Math.sin(r) + (y - 60) * Math.cos(r)];
      const PT = 58, PB = 86;
      // palm, open at the top so fingers sit on it
      h.curve([[33, PB], [31, 70], [33, PT]].map(q => T(q[0], q[1])), { closed: false });
      h.curve([[67, PT], [69, 70], [67, PB]].map(q => T(q[0], q[1])), { closed: false });
      h.line(...T(33, PB), ...T(67, PB));
      // one finger = a capsule standing on the palm
      const F = (x, top, w = 8.4) => {
        const rr = w / 2, pts = [[x - rr, PT + 2]];
        for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += Math.PI / 6) pts.push([x + Math.cos(a) * rr, top + rr + Math.sin(a) * rr]);
        pts.push([x + rr, PT + 2]);
        h.curve(pts.map(q => T(q[0], q[1])), { closed: false });
      };
      const thumb = (dir) => h.curve([[50 - dir * 17, 76], [50 - dir * 27, 68], [50 - dir * 30, 60], [50 - dir * 24, 57], [50 - dir * 16, 64]].map(q => T(q[0], q[1])), { closed: true });
      const g = p.gesture;
      if (g === 0) { F(53, 48); F(61, 50); F(43, 14, 9); thumb(1); }
      if (g === 1) { F(37, 30, 8); F(46, 22); F(55, 24); F(64, 32, 8); thumb(1); }
      if (g === 2) { F(54, 26); F(62, 30, 8); h.ellipse(...T(40, 44), 9, 9); thumb(1); }
      if (g === 3) { F(59, 50); F(66, 52, 8); F(41, 16, 8.6); F(51, 13, 8.6); thumb(1); }
      if (g === 4) { for (let i = 0; i < 4; i++) F(37 + i * 8.6, 48 + (i % 2) * 2, 8); thumb(1); }
      if (p.cuff) { h.line(...T(31, PB + 3), ...T(69, PB + 3)); h.line(...T(31, PB + 9), ...T(69, PB + 9)); }
    });

  /* ==========================================================
     PATTERNS — tile the whole box, good as backgrounds
     ========================================================== */
  def('patDots', 'Patterns', 'Dot grid', [N('gap', 'Gap', 3, 26, 9), N('size', 'Size', 0.4, 6, 1.4, 0.1), B('stagger', 'Stagger', true)],
    (h, p) => { let r = 0; for (let y = p.gap / 2; y < 100; y += p.gap, r++) for (let x = p.gap / 2 + (p.stagger && r % 2 ? p.gap / 2 : 0); x < 100; x += p.gap) h.dot(x, y, p.size); });

  def('patLines', 'Patterns', 'Line field', [N('gap', 'Gap', 2, 26, 7), N('angle', 'Angle', 0, 180, 0), N('wob', 'Waviness', 0, 100, 0)],
    (h, p) => {
      const a = p.angle * D;
      for (let t = -70; t <= 70; t += p.gap) {
        const pts = [];
        for (let i = 0; i <= 8; i++) {
          const e = -70 + (i / 8) * 140, off = Math.sin(i / 8 * TAU * 1.5 + t) * p.wob * 0.06;
          pts.push([50 + Math.cos(a) * (t + off) - Math.sin(a) * e, 50 + Math.sin(a) * (t + off) + Math.cos(a) * e]);
        }
        h.curve(pts, { passes: 1 });
      }
    });

  def('patChecks', 'Patterns', 'Checks', [N('n', 'Divisions', 2, 16, 6), B('alt', 'Fill alternate', true), N('inset', 'Inset', 0, 20, 0)],
    (h, p) => {
      const s = (100 - p.inset * 2) / p.n;
      for (let y = 0; y < p.n; y++) for (let x = 0; x < p.n; x++) {
        if (p.alt && (x + y) % 2) continue;
        const X = p.inset + x * s, Y = p.inset + y * s;
        h.shape([[X, Y], [X + s, Y], [X + s, Y + s], [X, Y + s]],
          { closed: true, sharp: true, outline: !p.alt, forceFill: p.alt && h.fillMode === 'none' ? 'solid' : null, fillRole: 'line' });
      }
    });

  def('patConfetti', 'Patterns', 'Confetti', [N('count', 'Count', 4, 160, 40), N('size', 'Size', 2, 16, 6), O('kind', 'Shapes', ['mixed', 'dashes', 'dots', 'crosses', 'triangles'], 0)],
    (h, p) => {
      for (let i = 0; i < p.count; i++) {
        const x = h.rng() * 100, y = h.rng() * 100, s = p.size * (0.5 + h.rng()), t = h.rng() * TAU;
        const k = p.kind === 0 ? (h.rng() * 4 | 0) + 1 : p.kind;
        if (k === 1) h.line(x - Math.cos(t) * s / 2, y - Math.sin(t) * s / 2, x + Math.cos(t) * s / 2, y + Math.sin(t) * s / 2, { passes: 1, role: i % 3 ? 'line' : 'accent' });
        if (k === 2) h.dot(x, y, s / 3, { role: i % 3 ? 'line' : 'accent' });
        if (k === 3) { h.line(x - s / 2, y - s / 2, x + s / 2, y + s / 2, { passes: 1 }); h.line(x + s / 2, y - s / 2, x - s / 2, y + s / 2, { passes: 1, role: i % 3 ? 'line' : 'accent' }); }
        if (k === 4) h.curve([[x, y - s / 2], [x + s / 2, y + s / 2], [x - s / 2, y + s / 2]], { closed: true, sharp: true, passes: 1, role: i % 3 ? 'line' : 'accent' });
      }
    });

  def('patScales', 'Patterns', 'Scales', [N('cols', 'Columns', 2, 16, 6), N('rows', 'Rows', 2, 16, 6), N('depth', 'Depth', 40, 100, 70)],
    (h, p) => {
      const w = 100 / p.cols, ht = 100 / p.rows;
      for (let r = 0; r < p.rows; r++) for (let c = 0; c <= p.cols; c++) {
        const x = c * w + (r % 2 ? 0 : w / 2), y = r * ht;
        h.curve(h.arcPts(x, y, w * 0.55, ht * (p.depth / 100), Math.PI, TAU, 8).reverse(), { passes: 1 });
      }
    });

  def('patNoise', 'Patterns', 'Speckle', [N('count', 'Count', 20, 600, 200), N('size', 'Size', 0.2, 3, 0.7, 0.1), N('clump', 'Clumping', 0, 100, 0)],
    (h, p) => {
      for (let i = 0; i < p.count; i++) {
        let x = h.rng() * 100, y = h.rng() * 100;
        if (p.clump > 0) { const t = h.rng() * TAU, r = Math.pow(h.rng(), 1 + p.clump / 40) * 50; x = 50 + Math.cos(t) * r; y = 50 + Math.sin(t) * r; }
        h.dot(x, y, p.size * (0.5 + h.rng()));
      }
    });

  /* ----------------------------------------------------------
     Aspect hint: 'square' shapes look wrong when stretched, so the
     composer fits them into a square. 'free' ones are meant to
     stretch (frames, patterns, rules, banners).
     ---------------------------------------------------------- */
  const FREE = new Set(['frame', 'banner', 'ribbon', 'stripes', 'grid', 'arrow', 'underline',
    'bracket', 'seawaves', 'wave', 'zigzag', 'rectsh', 'scribble', 'dotfield', 'bubble', 'tag',
    'patDots', 'patLines', 'patChecks', 'patConfetti', 'patScales', 'patNoise']);
  Object.values(G).forEach(g => g.aspect = FREE.has(g.key) ? 'free' : 'square');

  /* ---------------------------------------------------------- */
  window.SCRAWL.GENS = G;
  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
})();
