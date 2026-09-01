/* ============================================================
   MOTIFS / gond-templates — designed Gond starting points
   ------------------------------------------------------------
   Warli covers a whole wall at one scale. Gond does the
   opposite: one subject, drawn large, sitting alone on a
   coloured ground with a band top and bottom. These layouts
   follow that — a single creature and room to breathe, not a
   crowded surface.
   ============================================================ */
(function () {
  const T = window.SCRAWL.TEMPLATES;
  const add = o => { o.style = 'gond'; T.push(o); };

  add({
    name: 'Tree of life', cat: 'Gond', desc: 'One tree, the birds that live in it',
    w: 1080, h: 1350, pal: 0, texture: 'grain', amt: 0.12,
    items: [
      { p: 'Dot border', x: 0, y: 2, w: 100, h: 7 },
      { p: 'Tree of life', x: 8, y: 12, w: 84, h: 74 },
      { p: 'Dot border', x: 0, y: 90, w: 100, h: 7 },
    ]
  });

  add({
    name: 'Peacock', cat: 'Gond', desc: 'The bird Gond is known for, drawn large',
    w: 1080, h: 1080, pal: 1, texture: 'grain', amt: 0.12,
    items: [
      { p: 'Crescent frame', x: 2, y: 2, w: 96, h: 96 },
      { p: 'Great peacock', x: 14, y: 16, w: 72, h: 68 },
    ]
  });

  add({
    name: 'Forest floor', cat: 'Gond', desc: 'Trees, animals and a band of birds',
    w: 1587, h: 1123, pal: 2, texture: 'grain', amt: 0.14,
    items: [
      { p: 'Comb border', x: 0, y: 2, w: 100, h: 8 },
      { p: 'Flock', x: 6, y: 12, w: 88, h: 18 },
      { p: 'Deep forest', x: 3, y: 30, w: 94, h: 46 },
      { p: 'Hills and river', x: 0, y: 76, w: 100, h: 20 },
    ]
  });

  add({
    name: 'Digna panel', cat: 'Gond', desc: 'The ritual diagram, filling the surface',
    w: 1080, h: 1080, pal: 3, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Digna diamonds', x: 6, y: 6, w: 88, h: 88 },
      { p: 'Dot frame', x: 1, y: 1, w: 98, h: 98 },
    ]
  });

  add({
    name: 'Deer and serpent', cat: 'Gond', desc: 'Two creatures, two signatures',
    w: 1080, h: 1350, pal: 4, texture: 'grain', amt: 0.12,
    items: [
      { p: 'Chevron border', x: 0, y: 3, w: 100, h: 6 },
      { p: 'Dotted deer', x: 10, y: 14, w: 80, h: 38 },
      { p: 'Serpent', x: 6, y: 56, w: 88, h: 30 },
      { p: 'Chevron border', x: 0, y: 90, w: 100, h: 6 },
    ]
  });

  add({
    name: 'Signature sampler', cat: 'Gond', desc: 'Every fill the tradition uses, side by side',
    w: 1080, h: 1350, pal: 0, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Dot field', x: 4, y: 4, w: 29, h: 21 },
      { p: 'Comb field', x: 35.5, y: 4, w: 29, h: 21 },
      { p: 'Crescent field', x: 67, y: 4, w: 29, h: 21 },
      { p: 'Scale field', x: 4, y: 27, w: 29, h: 21 },
      { p: 'Seed field', x: 35.5, y: 27, w: 29, h: 21 },
      { p: 'Chevron field', x: 67, y: 27, w: 29, h: 21 },
      { p: 'Dash field', x: 4, y: 50, w: 29, h: 21 },
      { p: 'Ring field', x: 35.5, y: 50, w: 29, h: 21 },
      { p: 'Ripple field', x: 67, y: 50, w: 29, h: 21 },
      { p: 'Bird border', x: 4, y: 75, w: 92, h: 20 },
    ]
  });

  add({
    name: 'Elephant', cat: 'Gond', desc: 'One animal, one ground, nothing else',
    w: 1080, h: 1080, pal: 5, texture: 'grain', amt: 0.12,
    items: [
      { p: 'Combed elephant', x: 8, y: 20, w: 84, h: 60 },
      { p: 'Open dot rule', x: 0, y: 86, w: 100, h: 6 },
    ]
  });

  add({
    name: 'Blank ground', cat: 'Gond', desc: 'Just the ground and a frame',
    w: 1080, h: 1350, pal: 0, texture: 'grain', amt: 0.12,
    items: [
      { p: 'Diamond frame', x: 2, y: 2, w: 96, h: 96 },
    ]
  });

  window.SCRAWL.TEMPLATE_CATS = ['All', ...new Set(T.map(t => t.cat || 'Print'))];
})();
