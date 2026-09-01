/* ============================================================
   SCRAWL / warli-templates — designed Warli starting points
   Warli has no hero and no foreground: everything sits at roughly
   one scale, woven across the whole surface. These layouts follow
   that, rather than centring a single subject.
   ============================================================ */
(function () {
  const T = window.SCRAWL.TEMPLATES;
  const add = o => { o.style = 'warli'; T.push(o); };

  add({
    name: 'Tarpa dance', cat: 'Warli', desc: 'The circle with no beginning or end',
    w: 1080, h: 1080, pal: 0, texture: 'rough', amt: 0.16,
    items: [
      { p: 'Triangle frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Tarpa dance', x: 12, y: 12, w: 76, h: 76 },
    ]
  });

  add({
    name: 'Village wall', cat: 'Warli', desc: 'Huts, fields and animals across one surface',
    w: 1587, h: 1123, pal: 1, texture: 'rough', amt: 0.15,
    items: [
      { p: 'Triangle border', x: 0, y: 1, w: 100, h: 9 },
      { p: 'Sun', x: 78, y: 12, w: 18, h: 18 },
      { p: 'Hills', x: 2, y: 13, w: 44, h: 22 },
      { p: 'Hut', x: 4, y: 34, w: 30, h: 30 },
      { p: 'Gabled hut', x: 34, y: 38, w: 25, h: 25 },
      { p: 'Branching tree', x: 60, y: 30, w: 26, h: 34 },
      { p: 'Cow and calf', x: 62, y: 62, w: 34, h: 24 },
      { p: 'Human chain', x: 3, y: 66, w: 40, h: 22 },
      { p: 'Water carrier', x: 45, y: 64, w: 14, h: 24 },
      { p: 'Water pots', x: 47, y: 86, w: 16, h: 11 },
      { p: 'Dot border', x: 0, y: 92, w: 100, h: 7 },
    ]
  });

  add({
    name: 'Wedding chauk', cat: 'Warli', desc: 'Palaghata in the sacred square',
    w: 1080, h: 1350, pal: 2, texture: 'rough', amt: 0.15,
    items: [
      { p: 'Devchauk', x: 8, y: 6, w: 84, h: 66 },
      { p: 'Human chain', x: 6, y: 76, w: 88, h: 14 },
      { p: 'Triangle border', x: 0, y: 92, w: 100, h: 6 },
    ]
  });

  add({
    name: 'Harvest', cat: 'Warli', desc: 'The bargain between work, field and rain',
    w: 1080, h: 1350, pal: 3, texture: 'rough', amt: 0.14,
    items: [
      { p: 'Comb border', x: 0, y: 2, w: 100, h: 7 },
      { p: 'Sun', x: 70, y: 11, w: 22, h: 22 },
      { p: 'Conical tree', x: 6, y: 11, w: 24, h: 26 },
      { p: 'Working', x: 8, y: 39, w: 18, h: 26 },
      { p: 'Working', x: 28, y: 39, w: 18, h: 26 },
      { p: 'Bull', x: 50, y: 40, w: 44, h: 26 },
      { p: 'Grinding stone', x: 6, y: 68, w: 26, h: 20 },
      { p: 'Carrying yoke', x: 36, y: 68, w: 30, h: 20 },
      { p: 'Water pots', x: 70, y: 69, w: 24, h: 18 },
      { p: 'Triangle border', x: 0, y: 91, w: 100, h: 7 },
    ]
  });

  add({
    name: 'Festival panel', cat: 'Warli', desc: 'A long band of dancers',
    w: 1800, h: 600, pal: 0, texture: 'rough', amt: 0.16,
    items: [
      { p: 'Triangle border', x: 0, y: 2, w: 100, h: 14 },
      { p: 'Long chain', x: 2, y: 22, w: 60, h: 56 },
      { p: 'Tree with birds', x: 64, y: 18, w: 17, h: 62 },
      { p: 'Peacock', x: 81, y: 24, w: 18, h: 54 },
      { p: 'Zigzag border', x: 0, y: 84, w: 100, h: 14 },
    ]
  });

  add({
    name: 'Pattern sampler', cat: 'Warli', desc: 'Every border band, stacked',
    w: 1080, h: 1350, pal: 4, texture: 'rough', amt: 0.14,
    items: [
      { p: 'Triangle border', x: 4, y: 5, w: 92, h: 9 },
      { p: 'Dot border', x: 4, y: 17, w: 92, h: 9 },
      { p: 'Zigzag border', x: 4, y: 29, w: 92, h: 9 },
      { p: 'Comb border', x: 4, y: 41, w: 92, h: 9 },
      { p: 'Diamond border', x: 4, y: 53, w: 92, h: 9 },
      { p: 'Chain border', x: 4, y: 65, w: 92, h: 9 },
      { p: 'Wave border', x: 4, y: 77, w: 92, h: 9 },
      { p: 'Three fish', x: 30, y: 88, w: 40, h: 9 },
    ]
  });

  add({
    name: 'Forest', cat: 'Warli', desc: 'Trees, birds and animals at one scale',
    w: 1080, h: 1350, pal: 5, texture: 'rough', amt: 0.12,
    items: [
      { p: 'Branching tree', x: 4, y: 8, w: 26, h: 34 },
      { p: 'Palm', x: 36, y: 10, w: 22, h: 30 },
      { p: 'Tree with birds', x: 64, y: 6, w: 30, h: 38 },
      { p: 'Deer', x: 6, y: 46, w: 28, h: 20 },
      { p: 'Bird', x: 42, y: 48, w: 16, h: 14 },
      { p: 'Goat', x: 66, y: 46, w: 28, h: 20 },
      { p: 'Conical tree', x: 12, y: 68, w: 20, h: 26 },
      { p: 'Elephant', x: 40, y: 70, w: 32, h: 22 },
      { p: 'Sapling', x: 80, y: 72, w: 14, h: 22 },
    ]
  });

  add({
    name: 'Blank wall', cat: 'Warli', desc: 'Just the earth ground and a border',
    w: 1080, h: 1350, pal: 0, texture: 'rough', amt: 0.16,
    items: [
      { p: 'Triangle frame', x: 2, y: 2, w: 96, h: 96 },
    ]
  });

  /* everything defined before this file belongs to the sketchbook */
  T.forEach(t => { if (!t.style) t.style = 'sketch'; });
  window.SCRAWL.TEMPLATE_CATS = ['All', ...new Set(T.map(t => t.cat || 'Print'))];
})();
