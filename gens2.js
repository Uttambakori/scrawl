/* ============================================================
   SCRAWL / gens2 — design elements
   The pieces you actually build layouts out of: ornaments, rules,
   containers, badges, icons. Same 0..100 box, same Hand.
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
     ICONS — one generator, a whole sheet of subjects
     ========================================================== */
  const ICONS = {
    bolt: h => h.shape([[58, 6], [30, 52], [47, 52], [40, 94], [70, 44], [53, 44]], { closed: true, sharp: true }),
    flame: h => {
      h.shape([[50, 94], [26, 76], [25, 52], [40, 32], [43, 46], [57, 8], [66, 36], [76, 54], [74, 76]], { closed: true });
      h.curve([[50, 90], [40, 78], [42, 62], [52, 50], [58, 64], [58, 78]], { closed: true, role: 'accent' });
    },
    // the near-tip pair keeps the point sharp through the smoothing
    drop: h => h.shape([[50, 6], [53, 12], [66, 32], [76, 54], [72, 74], [56, 90], [44, 90], [28, 74], [24, 54], [34, 32], [47, 12]], { closed: true }),
    eye: h => {
      h.shape([[10, 50], [30, 26], [50, 21], [70, 26], [90, 50], [70, 74], [50, 79], [30, 74]], { closed: true });
      h.ellipse(50, 50, 15, 15); h.dot(50, 50, 6);
      h.curve([[26, 30], [34, 20], [46, 16]], { role: 'accent', passes: 1 });
    },
    key: h => {
      h.ellipse(30, 34, 16, 16); h.ellipse(30, 34, 7, 7);
      h.line(41, 45, 80, 84); h.line(70, 74, 62, 82); h.line(78, 82, 70, 90);
    },
    lock: h => {
      h.shape([[24, 46], [76, 46], [76, 90], [24, 90]], { closed: true, sharp: true });
      h.curve(h.arcPts(50, 46, 18, 20, Math.PI, TAU, 12));
      h.dot(50, 64, 4); h.line(50, 66, 50, 78);
    },
    gear: h => {
      const pts = [];
      for (let i = 0; i < 24; i++) { const t = (i / 24) * TAU, r = (i % 4 < 2) ? 44 : 34; pts.push([50 + Math.cos(t) * r, 50 + Math.sin(t) * r]); }
      h.shape(pts, { closed: true, sharp: true });
      h.ellipse(50, 50, 15, 15);
    },
    pencil: h => {
      h.shape([[20, 84], [64, 16], [80, 27], [36, 95], [17, 97]], { closed: true, sharp: true });
      h.line(24, 87, 33, 93); h.line(62, 20, 78, 31);
      h.shape([[17, 97], [20, 84], [30, 91]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'accent' });
    },
    scissors: h => {
      h.shape([[24, 10], [31, 8], [58, 58], [50, 62]], { closed: true });
      h.shape([[76, 10], [69, 8], [42, 58], [50, 62]], { closed: true });
      h.line(56, 60, 64, 72); h.line(44, 60, 36, 72);
      h.ellipse(30, 80, 13, 11); h.ellipse(70, 80, 13, 11);
      h.dot(50, 56, 3.4);
    },
    camera: h => {
      h.shape([[10, 34], [32, 34], [38, 24], [62, 24], [68, 34], [90, 34], [90, 84], [10, 84]], { closed: true, sharp: true });
      h.ellipse(50, 58, 19, 19); h.ellipse(50, 58, 10, 10, { role: 'accent' });
      h.dot(80, 42, 3, { role: 'accent' });
    },
    music: h => {
      h.ellipse(28, 78, 13, 10); h.ellipse(72, 68, 13, 10);
      h.line(40, 76, 40, 20); h.line(84, 66, 84, 12);
      h.curve([[40, 20], [62, 14], [84, 12]]); h.curve([[40, 30], [62, 24], [84, 22]]);
    },
    chat: h => {
      h.shape([[10, 16], [90, 16], [90, 68], [44, 68], [26, 88], [28, 68], [10, 68]], { closed: true });
      h.dot(34, 42, 4); h.dot(50, 42, 4); h.dot(66, 42, 4);
    },
    globe: h => {
      h.ellipse(50, 50, 42, 42); h.ellipse(50, 50, 16, 42); h.line(8, 50, 92, 50);
      h.curve([[14, 32], [50, 24], [86, 32]]); h.curve([[14, 68], [50, 76], [86, 68]]);
    },
    rocket: h => {
      h.shape([[50, 6], [66, 30], [68, 66], [32, 66], [34, 30]], { closed: true });
      h.ellipse(50, 34, 10, 10, { role: 'accent' });
      h.shape([[32, 46], [16, 74], [32, 66]], { closed: true, sharp: true });
      h.shape([[68, 46], [84, 74], [68, 66]], { closed: true, sharp: true });
      h.curve([[40, 68], [46, 92], [50, 78], [54, 92], [60, 68]], { role: 'accent' });
    },
    crown: h => {
      h.shape([[12, 78], [18, 26], [34, 48], [50, 18], [66, 48], [82, 26], [88, 78]], { closed: true, sharp: true });
      h.line(14, 66, 86, 66);
      h.dot(50, 74, 4, { role: 'accent' }); h.dot(30, 74, 3, { role: 'accent' }); h.dot(70, 74, 3, { role: 'accent' });
    },
    anchor: h => {
      h.ellipse(50, 18, 10, 10); h.line(50, 28, 50, 88); h.line(26, 40, 74, 40);
      h.curve([[16, 60], [18, 80], [50, 90], [82, 80], [84, 60]]);
      h.line(16, 60, 10, 66); h.line(16, 60, 24, 64); h.line(84, 60, 90, 66); h.line(84, 60, 76, 64);
    },
    compass: h => {
      h.ellipse(50, 50, 42, 42); h.ellipse(50, 50, 34, 34, { passes: 1 });
      h.shape([[50, 22], [60, 50], [50, 78], [40, 50]], { closed: true, sharp: true });
      h.dot(50, 50, 3);
      for (let i = 0; i < 4; i++) { const t = i * Math.PI / 2; h.line(50 + Math.cos(t) * 43, 50 + Math.sin(t) * 43, 50 + Math.cos(t) * 50, 50 + Math.sin(t) * 50); }
    },
    umbrella: h => {
      h.curve(h.arcPts(50, 52, 44, 40, Math.PI, TAU, 14));
      h.curve([[6, 52], [18, 62], [30, 52], [42, 62], [50, 52], [58, 62], [70, 52], [82, 62], [94, 52]]);
      h.line(50, 52, 50, 86); h.curve([[50, 86], [50, 94], [40, 94], [38, 86]]);
      h.line(30, 52, 50, 14); h.line(70, 52, 50, 14);
    },
    gift: h => {
      h.shape([[14, 38], [86, 38], [86, 92], [14, 92]], { closed: true, sharp: true });
      h.line(12, 38, 88, 38); h.line(12, 52, 88, 52);
      h.line(50, 38, 50, 92, { role: 'accent' });
      h.curve([[50, 38], [30, 30], [32, 16], [48, 30]], { closed: true, role: 'accent' });
      h.curve([[50, 38], [70, 30], [68, 16], [52, 30]], { closed: true, role: 'accent' });
    },
    ghost: h => {
      h.shape([[12, 92], [12, 46], [50, 12], [88, 46], [88, 92], [76, 80], [64, 92], [50, 80], [36, 92], [24, 80]], { closed: true });
      h.dot(38, 48, 5); h.dot(64, 48, 5);
      h.curve([[44, 64], [51, 70], [58, 64]]);
    },
    skull: h => {
      h.shape([[50, 10], [80, 24], [86, 52], [72, 70], [70, 84], [30, 84], [28, 70], [14, 52], [20, 24]], { closed: true });
      h.ellipse(36, 48, 11, 12, { fill: 'line', passes: 1 }); h.ellipse(64, 48, 11, 12, { fill: 'line', passes: 1 });
      h.shape([[50, 60], [56, 70], [44, 70]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'line' });
      h.line(40, 84, 40, 74); h.line(50, 84, 50, 74); h.line(60, 84, 60, 74);
    },
    planet: h => {
      h.ellipse(50, 46, 30, 30);
      h.ellipse(50, 52, 47, 14, { role: 'accent' });
      h.dot(38, 36, 4, { op: .5 }); h.dot(58, 54, 5, { op: .5 });
    },
    mushroom: h => {
      h.shape([[8, 50], [22, 22], [50, 12], [78, 22], [92, 50], [50, 58]], { closed: true });
      h.dot(28, 38, 6, { role: 'accent', fill: 'accent' }); h.dot(56, 30, 7, { role: 'accent', fill: 'accent' }); h.dot(72, 44, 5, { role: 'accent', fill: 'accent' });
      h.curve([[38, 54], [36, 84], [42, 92], [58, 92], [64, 84], [62, 54]]);
    },
    cactus: h => {
      h.curve([[38, 76], [37, 30], [50, 16], [63, 30], [62, 76]], { closed: false });
      h.curve([[37, 52], [22, 50], [20, 34], [26, 32], [28, 46], [37, 46]], { closed: true });
      h.curve([[63, 46], [78, 44], [82, 28], [76, 26], [72, 40], [63, 40]], { closed: true });
      h.shape([[32, 76], [68, 76], [64, 94], [36, 94]], { closed: true, sharp: true });
      h.line(30, 76, 70, 76);
    },
    star4: h => h.shape([[50, 4], [58, 42], [96, 50], [58, 58], [50, 96], [42, 58], [4, 50], [42, 42]], { closed: true }),
  };

  def('icon', 'Icons', 'Icon', [O('kind', 'Icon', Object.keys(ICONS), 0)],
    (h, p) => { const k = Object.keys(ICONS)[p.kind] || 'bolt'; ICONS[k](h); });

  /* ==========================================================
     TYPOGRAPHIC ORNAMENT
     ========================================================== */
  def('quote', 'Ornament', 'Quote marks', [O('kind', 'Style', ['heavy', 'curly', 'angle', 'ticks'], 0), B('close', 'Closing pair', false), N('gap', 'Gap', 4, 40, 18)],
    (h, p) => {
      // a quote mark is two commas; draw one comma, then mirror the pair
      const comma = (x, flip) => {
        const F = v => x + (v - x) * flip;
        if (p.kind === 0) {
          h.shape(h.ring(x, 34, 12, 12, 10, 0, .04), { closed: true, forceFill: 'solid', fillRole: 'line', outline: false });
          h.shape([[F(x - 11), 38], [F(x + 12), 34], [F(x - 1), 72]].map(q => [q[0], q[1]]), { closed: true, sharp: true, forceFill: 'solid', fillRole: 'line', outline: false });
        }
        if (p.kind === 1) h.curve([[F(x + 11), 26], [F(x - 9), 38], [F(x - 7), 56], [F(x + 8), 58], [F(x + 11), 44], [F(x - 1), 43]]);
        if (p.kind === 2) { h.line(F(x + 12), 26, F(x - 9), 50); h.line(F(x - 9), 50, F(x + 12), 74); }
        if (p.kind === 3) { h.line(F(x - 3), 26, F(x - 9), 56); h.line(F(x + 12), 26, F(x + 6), 56); }
      };
      const pair = (cx, flip) => { comma(cx - p.gap * .55, flip); comma(cx + p.gap * .55, flip); };
      if (p.close) { pair(26, 1); pair(74, -1); } else pair(50, 1);
    });

  def('divider', 'Ornament', 'Divider', [O('style', 'Style', ['dots', 'diamond', 'wave', 'braid', 'arrows', 'rule', 'leaf'], 0), N('count', 'Repeats', 1, 20, 5), N('scale', 'Size', 3, 22, 8)],
    (h, p) => {
      const y = 50, s = p.scale;
      if (p.style === 5) { h.line(4, y - s * .4, 96, y - s * .4); h.line(4, y + s * .4, 96, y + s * .4); return; }
      if (p.style !== 0 && p.style !== 1) { h.line(4, y, 30, y); h.line(70, y, 96, y); }
      for (let i = 0; i < p.count; i++) {
        const x = p.count === 1 ? 50 : 50 + (i - (p.count - 1) / 2) * (s * 2.4);
        if (p.style === 0) h.dot(x, y, s * .28);
        if (p.style === 1) h.shape([[x, y - s], [x + s * .7, y], [x, y + s], [x - s * .7, y]], { closed: true, sharp: true });
        if (p.style === 2) h.curve([[x - s, y], [x - s / 2, y - s * .7], [x, y], [x + s / 2, y + s * .7], [x + s, y]]);
        if (p.style === 3) { h.curve(h.arcPts(x, y, s * .7, s * .7, Math.PI, TAU, 8)); h.curve(h.arcPts(x + s * .7, y, s * .7, s * .7, 0, Math.PI, 8)); }
        if (p.style === 4) { h.line(x - s, y - s * .6, x, y); h.line(x, y, x - s, y + s * .6); }
        if (p.style === 6) h.curve([[x, y], [x - s * .5, y - s * .8], [x - s, y], [x - s * .5, y + s * .8]], { closed: true });
      }
    });

  def('corner', 'Ornament', 'Corner', [O('style', 'Style', ['bracket', 'flourish', 'stack', 'fan', 'notch'], 0), N('size', 'Size', 20, 90, 55), N('corners', 'Corners', 1, 4, 4)],
    (h, p) => {
      const S = p.size;
      const one = (sx, sy, ox, oy) => {
        const X = v => ox + v * sx, Y = v => oy + v * sy;
        if (p.style === 0) { h.line(X(4), Y(4), X(4 + S), Y(4)); h.line(X(4), Y(4), X(4), Y(4 + S)); }
        if (p.style === 1) { h.curve([[X(4 + S), Y(4)], [X(4 + S * .35), Y(4 + S * .1)], [X(4 + S * .1), Y(4 + S * .35)], [X(4), Y(4 + S)]]); h.curve([[X(4 + S * .5), Y(4 + S * .1)], [X(4 + S * .18), Y(4 + S * .18)], [X(4 + S * .1), Y(4 + S * .5)]]); }
        if (p.style === 2) for (let i = 0; i < 3; i++) { h.line(X(4 + i * 5), Y(4 + i * 5), X(4 + S - i * 9), Y(4 + i * 5)); h.line(X(4 + i * 5), Y(4 + i * 5), X(4 + i * 5), Y(4 + S - i * 9)); }
        if (p.style === 3) for (let i = 0; i <= 5; i++) { const t = (i / 5) * Math.PI / 2; h.line(X(4), Y(4), X(4 + Math.cos(t) * S), Y(4 + Math.sin(t) * S)); }
        if (p.style === 4) { h.line(X(4), Y(4 + S * .4), X(4), Y(4)); h.line(X(4), Y(4), X(4 + S * .4), Y(4)); h.line(X(4 + S * .18), Y(4 + S * .18), X(4 + S * .5), Y(4 + S * .18)); h.line(X(4 + S * .18), Y(4 + S * .18), X(4 + S * .18), Y(4 + S * .5)); }
      };
      const spots = [[1, 1, 0, 0], [-1, 1, 100, 0], [-1, -1, 100, 100], [1, -1, 0, 100]];
      for (let i = 0; i < p.corners; i++) one(...spots[i]);
    });

  def('laurel', 'Ornament', 'Laurel', [N('leaves', 'Leaves per side', 3, 14, 8), N('open', 'Opening', 0, 120, 50), N('size', 'Leaf size', 5, 20, 10)],
    (h, p) => {
      const half = (dir) => {
        const a0 = Math.PI / 2 + (p.open / 2) * D * dir, a1 = Math.PI / 2 + (360 - p.open / 2) * D * dir;
        const stem = h.arcPts(50, 50, 40, 42, a0, a0 + (a1 - a0) * .5 * dir * dir, 14);
        h.curve(stem, { passes: 1 });
        for (let i = 0; i < p.leaves; i++) {
          const t = a0 + ((i + .5) / p.leaves) * ((a1 - a0) * .5);
          const bx = 50 + Math.cos(t) * 40, by = 50 + Math.sin(t) * 42;
          const out = t + Math.PI / 2 * dir, s = p.size;
          h.curve([[bx, by], [bx + Math.cos(out - .5) * s, by + Math.sin(out - .5) * s],
          [bx + Math.cos(out) * s * 1.5, by + Math.sin(out) * s * 1.5],
          [bx + Math.cos(out + .5) * s, by + Math.sin(out + .5) * s]], { closed: true });
        }
      };
      half(1); half(-1);
    });

  def('sunburst', 'Ornament', 'Sunburst', [N('rays', 'Rays', 6, 48, 16), N('inner', 'Inner radius', 0, 70, 14), B('solid', 'Filled wedges', true)],
    (h, p) => {
      const ri = p.inner / 2;
      for (let i = 0; i < p.rays; i++) {
        const a0 = (i / p.rays) * TAU, a1 = ((i + (p.solid ? 0.5 : 0.02)) / p.rays) * TAU;
        if (p.solid && i % 2) continue;
        const pts = [[50 + Math.cos(a0) * ri, 50 + Math.sin(a0) * ri], [50 + Math.cos(a0) * 48, 50 + Math.sin(a0) * 48],
        [50 + Math.cos(a1) * 48, 50 + Math.sin(a1) * 48], [50 + Math.cos(a1) * ri, 50 + Math.sin(a1) * ri]];
        h.shape(pts, { closed: true, sharp: true, forceFill: p.solid ? 'solid' : null, fillRole: 'line', outline: !p.solid });
      }
      if (ri > 2) h.ellipse(50, 50, ri, ri);
    });

  /* ==========================================================
     CONTAINERS & LAYOUT
     ========================================================== */
  def('callout', 'Frames', 'Callout box', [O('kind', 'Shape', ['soft', 'sharp', 'torn', 'double'], 0), N('r', 'Corner', 0, 30, 10), B('shadow', 'Offset shadow', false)],
    (h, p) => {
      const draw = (dx, dy, role) => {
        if (p.kind === 2) {
          const pts = [];
          for (let i = 0; i <= 40; i++) {
            const side = Math.floor(i / 10), u = (i % 10) / 10;
            let x, y;
            if (side === 0) { x = 8 + u * 84; y = 12; } else if (side === 1) { x = 92; y = 12 + u * 76; }
            else if (side === 2) { x = 92 - u * 84; y = 88; } else { x = 8; y = 88 - u * 76; }
            pts.push([x + dx + h.j(2.2), y + dy + h.j(2.2)]);
          }
          h.curve(pts, { closed: true, role });
        } else if (p.r > 1 && p.kind !== 1) h.rect(8 + dx, 12 + dy, 84, 76, { r: p.r, role });
        else h.curve([[8 + dx, 12 + dy], [92 + dx, 12 + dy], [92 + dx, 88 + dy], [8 + dx, 88 + dy]], { closed: true, sharp: true, role });
      };
      if (p.shadow) draw(5, 5, 'accent');
      draw(0, 0, 'line');
      if (p.kind === 3) draw(4, 4, 'line');
    });

  def('window', 'Frames', 'Arch frame', [O('kind', 'Shape', ['arch', 'round', 'gothic', 'square'], 0), N('panes', 'Panes', 0, 4, 0), N('sill', 'Base', 0, 20, 0)],
    (h, p) => {
      const top = p.kind === 1 ? 50 : 44, L = 14, R = 86, B_ = 92 - p.sill;
      let pts;
      if (p.kind === 3) pts = [[L, 8], [R, 8], [R, B_], [L, B_]];
      else if (p.kind === 2) pts = [[L, 46], [L, B_], [R, B_], [R, 46], [50, 6]];
      else pts = h.arcPts(50, top, 36, 36, Math.PI, TAU, 14)
        // duplicate anchors at the springing line keep the corners square
        .concat([[R, top + 2], [R, B_ - 2], [R, B_], [L, B_], [L, B_ - 2], [L, top + 2]]);
      h.shape(pts, { closed: true, sharp: p.kind === 3 || p.kind === 2 });
      for (let i = 1; i <= p.panes; i++) { const y = top + (B_ - top) * (i / (p.panes + 1)); h.line(L, y, R, y, { passes: 1 }); }
      if (p.panes > 0) h.line(50, p.kind === 3 ? 8 : top - 30, 50, B_, { passes: 1 });
      if (p.sill > 0) { h.line(8, B_, 92, B_); h.line(8, B_, 8, 92); h.line(92, B_, 92, 92); h.line(8, 92, 92, 92); }
    });

  def('ticket', 'Frames', 'Ticket', [N('perf', 'Perforation', 0, 100, 66), N('notch', 'Notch size', 0, 14, 6), B('stub', 'Stub line', true)],
    (h, p) => {
      const y0 = 26, y1 = 74, px = 6 + p.perf * .88;
      h.shape([[6, y0], [94, y0], [94, y1], [6, y1]], { closed: true, sharp: true });
      if (p.notch > 0) { h.ellipse(px, y0, p.notch, p.notch * .55, { role: 'line' }); h.ellipse(px, y1, p.notch, p.notch * .55); }
      if (p.stub) for (let y = y0 + 5; y < y1 - 3; y += 5) h.line(px, y, px, y + 2.5, { passes: 1, role: 'accent' });
    });

  def('tape', 'Ornament', 'Tape strip', [N('angle', 'Angle', -45, 45, -8), N('width', 'Width', 10, 44, 22), O('ends', 'Ends', ['torn', 'cut', 'zigzag'], 0)],
    (h, p) => {
      const a = p.angle * D, w = p.width / 2;
      const P = (t, e) => [50 + Math.cos(a) * t - Math.sin(a) * e, 50 + Math.sin(a) * t + Math.cos(a) * e];
      const top = [], bot = [];
      for (let i = 0; i <= 10; i++) {
        const t = -46 + (i / 10) * 92;
        top.push(P(t, -w)); bot.unshift(P(t, w));
      }
      const endPts = (t, dir) => {
        const o = [];
        for (let i = 0; i <= 5; i++) {
          const e = -w + (i / 5) * w * 2;
          const jag = p.ends === 0 ? h.j(3.5) : p.ends === 2 ? (i % 2 ? 4 : -4) : 0;
          o.push(P(t + jag * dir, e));
        }
        return o;
      };
      h.shape(top.concat(endPts(46, 1), bot, endPts(-46, -1)), { closed: true });
      for (let i = 0; i < 3; i++) h.line(...P(-30 + i * 30, -w * .5), ...P(-24 + i * 30, w * .5), { passes: 1, role: 'accent', op: .5 });
    });

  def('pin', 'Ornament', 'Pin & clip', [O('kind', 'Kind', ['pushpin', 'paperclip', 'thumbtack', 'staple'], 0), N('rot', 'Rotation', 0, 360, 0), N('size', 'Size', 30, 100, 70)],
    (h, p) => {
      const r = p.rot * D, s = p.size / 70;
      const T = (x, y) => { const X = (x - 50) * s, Y = (y - 50) * s; return [50 + X * Math.cos(r) - Y * Math.sin(r), 50 + X * Math.sin(r) + Y * Math.cos(r)]; };
      if (p.kind === 0) { h.shape([[38, 14], [62, 14], [58, 40], [70, 52], [30, 52], [42, 40]].map(q => T(...q)), { closed: true, sharp: true }); h.line(...T(50, 52), ...T(50, 86)); }
      if (p.kind === 1) { h.curve([[38, 84], [38, 26], [58, 26], [58, 74], [46, 74], [46, 34], [52, 34], [52, 66]].map(q => T(...q))); }
      if (p.kind === 2) { h.ellipse(...T(50, 34), 20 * s, 14 * s); h.ellipse(...T(50, 30), 20 * s, 13 * s); h.line(...T(50, 44), ...T(50, 84)); }
      if (p.kind === 3) { h.line(...T(30, 34), ...T(30, 66)); h.line(...T(30, 34), ...T(70, 34)); h.line(...T(70, 34), ...T(70, 66)); }
    });

  def('numbadge', 'Frames', 'Number badge', [O('shape', 'Shape', ['circle', 'shield', 'seal', 'square', 'ribbon'], 0), N('rings', 'Rings', 0, 3, 1), N('scallops', 'Seal points', 8, 32, 16)],
    (h, p) => {
      if (p.shape === 0) h.shape(h.ring(50, 50, 44, 44, 16, 0, .02), { closed: true });
      if (p.shape === 1) h.shape([[14, 12], [86, 12], [86, 56], [50, 92], [14, 56]], { closed: true });
      if (p.shape === 2) { const pts = []; for (let i = 0; i < p.scallops * 2; i++) { const t = (i / (p.scallops * 2)) * TAU; const rr = i % 2 ? 36 : 46; pts.push([50 + Math.cos(t) * rr, 50 + Math.sin(t) * rr]); } h.shape(pts, { closed: true, sharp: true }); }
      if (p.shape === 3) h.shape([[10, 10], [90, 10], [90, 90], [10, 90]], { closed: true, sharp: true });
      if (p.shape === 4) { h.shape([[16, 14], [84, 14], [84, 66], [50, 54], [16, 66]], { closed: true, sharp: true }); h.shape([[26, 66], [40, 92], [50, 78], [60, 92], [74, 66]], { closed: true, sharp: true }); }
      for (let i = 1; i <= p.rings; i++) h.ellipse(50, 50, 38 - i * 5, 38 - i * 5, { passes: 1 });
    });

  def('checklist', 'Frames', 'Checklist', [N('rows', 'Rows', 2, 10, 4), N('checked', 'Ticked', 0, 10, 2), O('box', 'Box', ['square', 'circle', 'dash', 'star'], 0)],
    (h, p) => {
      const gap = 88 / p.rows;
      for (let i = 0; i < p.rows; i++) {
        const y = 10 + gap * (i + .5), bs = Math.min(gap * .5, 9);
        if (p.box === 0) h.curve([[8, y - bs], [8 + bs * 2, y - bs], [8 + bs * 2, y + bs], [8, y + bs]], { closed: true, sharp: true });
        if (p.box === 1) h.ellipse(8 + bs, y, bs, bs);
        if (p.box === 2) h.line(8, y, 8 + bs * 2, y);
        if (p.box === 3) h.shape(h.ring(8 + bs, y, bs, bs, 10, -Math.PI / 2), { closed: true, sharp: true });
        if (i < p.checked && p.box !== 2) h.curve([[8 + bs * .4, y], [8 + bs, y + bs * .7], [8 + bs * 2.1, y - bs * .8]], { sharp: true, role: 'accent' });
        h.line(14 + bs * 2, y, 92 - (i % 3) * 9, y, { role: 'line', op: .75 });
      }
    });

  def('starrating', 'Frames', 'Rating', [N('total', 'Stars', 1, 10, 5), N('filled', 'Filled', 0, 10, 3), N('points', 'Points', 4, 8, 5)],
    (h, p) => {
      const gap = 92 / p.total, R = Math.min(gap * .44, 22);
      for (let i = 0; i < p.total; i++) {
        const cx = 4 + gap * (i + .5), pts = [];
        for (let k = 0; k < p.points * 2; k++) { const t = (k / (p.points * 2)) * TAU - Math.PI / 2; pts.push([cx + Math.cos(t) * (k % 2 ? R * .42 : R), 50 + Math.sin(t) * (k % 2 ? R * .42 : R)]); }
        h.shape(pts, { closed: true, sharp: true, forceFill: i < p.filled ? 'solid' : null, fillRole: 'accent' });
      }
    });

  def('pricetag', 'Frames', 'Price tag', [O('dir', 'Point', ['left', 'right', 'both'], 0), B('hole', 'Hole', true), N('lines', 'Text lines', 0, 4, 2)],
    (h, p) => {
      const d = 18;
      let pts;
      if (p.dir === 0) pts = [[6, 50], [24, 20], [94, 20], [94, 80], [24, 80]];
      else if (p.dir === 1) pts = [[6, 20], [76, 20], [94, 50], [76, 80], [6, 80]];
      else pts = [[6, 50], [24, 20], [76, 20], [94, 50], [76, 80], [24, 80]];
      h.shape(pts, { closed: true, sharp: true });
      if (p.hole) h.ellipse(p.dir === 1 ? 84 : 22, 50, 4.5, 4.5);
      for (let i = 0; i < p.lines; i++) { const y = 42 + i * 12; h.line(p.dir === 1 ? 16 : 34, y, 78, y, { role: 'accent', op: .8 }); }
    });

  def('filmstrip', 'Frames', 'Film strip', [N('frames', 'Frames', 2, 8, 4), O('dir', 'Direction', ['horizontal', 'vertical'], 0), N('holes', 'Sprockets', 2, 10, 5)],
    (h, p) => {
      const horiz = p.dir === 0;
      const W = horiz ? 96 : 62, H = horiz ? 62 : 96;
      const x0 = 50 - W / 2, y0 = 50 - H / 2;
      h.curve([[x0, y0], [x0 + W, y0], [x0 + W, y0 + H], [x0, y0 + H]], { closed: true, sharp: true });
      const band = horiz ? 11 : 11;
      if (horiz) { h.line(x0, y0 + band, x0 + W, y0 + band); h.line(x0, y0 + H - band, x0 + W, y0 + H - band); }
      else { h.line(x0 + band, y0, x0 + band, y0 + H); h.line(x0 + W - band, y0, x0 + W - band, y0 + H); }
      for (let i = 0; i < p.holes; i++) {
        const u = (i + .5) / p.holes;
        if (horiz) { const x = x0 + u * W; h.curve([[x - 4, y0 + 3], [x + 4, y0 + 3], [x + 4, y0 + band - 3], [x - 4, y0 + band - 3]], { closed: true, sharp: true, passes: 1 }); h.curve([[x - 4, y0 + H - 3], [x + 4, y0 + H - 3], [x + 4, y0 + H - band + 3], [x - 4, y0 + H - band + 3]], { closed: true, sharp: true, passes: 1 }); }
        else { const y = y0 + u * H; h.curve([[x0 + 3, y - 4], [x0 + band - 3, y - 4], [x0 + band - 3, y + 4], [x0 + 3, y + 4]], { closed: true, sharp: true, passes: 1 }); h.curve([[x0 + W - 3, y - 4], [x0 + W - band + 3, y - 4], [x0 + W - band + 3, y + 4], [x0 + W - 3, y + 4]], { closed: true, sharp: true, passes: 1 }); }
      }
      for (let i = 1; i < p.frames; i++) {
        const u = i / p.frames;
        if (horiz) h.line(x0 + u * W, y0 + band, x0 + u * W, y0 + H - band);
        else h.line(x0 + band, y0 + u * H, x0 + W - band, y0 + u * H);
      }
    });

  def('barcode', 'Frames', 'Bar code', [N('bars', 'Bars', 8, 60, 26), N('height', 'Height', 20, 90, 56), B('vary', 'Vary heights', true)],
    (h, p) => {
      const H = p.height, y0 = 50 - H / 2;
      let x = 6;
      const step = 88 / p.bars;
      for (let i = 0; i < p.bars; i++) {
        const w = step * (0.25 + h.rng() * 0.55);
        const hh = p.vary && i % 7 === 0 ? H * 1.12 : H;
        h.shape([[x, y0], [x + w, y0], [x + w, y0 + hh], [x, y0 + hh]], { closed: true, sharp: true, forceFill: 'solid', fillRole: 'line', outline: false });
        x += step;
      }
    });

  /* ==========================================================
     BACKGROUNDS
     ========================================================== */
  def('blobstack', 'Patterns', 'Blob stack', [N('layers', 'Layers', 2, 8, 3), N('offset', 'Offset', 1, 16, 6), N('lumps', 'Lumps', 4, 14, 8)],
    (h, p) => {
      for (let i = p.layers - 1; i >= 0; i--) {
        const o = i * p.offset;
        h.shape(h.ring(50 + o * .6, 50 + o * .6, 40 - i * 1.5, 40 - i * 1.5, p.lumps, h.rng() * TAU, .2),
          { closed: true, role: i === 0 ? 'line' : 'accent', op: i === 0 ? 1 : .8 });
      }
    });

  def('wavestack', 'Patterns', 'Wave stack', [N('layers', 'Layers', 2, 10, 4), N('amp', 'Amplitude', 3, 26, 10), N('waves', 'Waves', 1, 6, 2)],
    (h, p) => {
      for (let i = 0; i < p.layers; i++) {
        const y = 14 + (i / (p.layers - 1 || 1)) * 72, pts = [];
        for (let k = 0; k <= 24; k++) pts.push([-4 + (k / 24) * 108, y + Math.sin((k / 24) * TAU * p.waves + i) * p.amp / 2]);
        pts.push([104, 104], [-4, 104]);
        h.shape(pts, { closed: true, role: i % 2 ? 'accent' : 'line', op: .9 });
      }
    });

  def('halftone', 'Patterns', 'Halftone', [O('dir', 'Gradient', ['top', 'bottom', 'left', 'radial'], 0), N('gap', 'Gap', 3, 16, 7), N('max', 'Max dot', 1, 8, 3.4, .1)],
    (h, p) => {
      const g = Math.max(1, p.gap);
      for (let y = g / 2; y < 100; y += g) for (let x = g / 2; x < 100; x += g) {
        let u;
        if (p.dir === 0) u = 1 - y / 100; else if (p.dir === 1) u = y / 100;
        else if (p.dir === 2) u = 1 - x / 100; else u = 1 - Math.hypot(x - 50, y - 50) / 70;
        u = Math.max(0, Math.min(1, u));
        const r = p.max * u;
        if (r > 0.18) h.dot(x, y, r);
      }
    });

  def('columns', 'Patterns', 'Column guides', [N('cols', 'Columns', 2, 14, 6), N('gutter', 'Gutter', 0, 14, 4), N('margin', 'Margin', 0, 26, 8)],
    (h, p) => {
      const inner = 100 - p.margin * 2, cw = (inner - p.gutter * (p.cols - 1)) / p.cols;
      for (let i = 0; i < p.cols; i++) {
        const x = p.margin + i * (cw + p.gutter);
        h.curve([[x, p.margin], [x + cw, p.margin], [x + cw, 100 - p.margin], [x, 100 - p.margin]], { closed: true, sharp: true, passes: 1, op: .8 });
      }
    });

  /* aspect hints for the new ones */
  const FREE2 = ['divider', 'callout', 'ticket', 'tape', 'checklist', 'starrating', 'pricetag',
    'filmstrip', 'barcode', 'wavestack', 'halftone', 'columns', 'corner', 'quote'];
  FREE2.forEach(k => { if (G[k]) G[k].aspect = 'free'; });
  Object.values(G).forEach(g => { if (!g.aspect) g.aspect = 'square'; });

  window.SCRAWL.CATS = [...new Set(Object.values(G).map(g => g.cat))];
  window.SCRAWL.ICON_KINDS = Object.keys(ICONS);
})();
