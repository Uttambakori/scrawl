/* ============================================================
   MOTIFS / kalamkari-templates — designed Srikalahasti starting points
   ------------------------------------------------------------
   The palampore is the model: a tree of life on a rocky hillock,
   a deep border of flowers round it, butis scattered in the
   ground. Temple cloths put a figure under a cusped arch.
   ============================================================ */
(function () {
  const T = window.SCRAWL.TEMPLATES;
  const add = o => { o.style = 'kalamkari'; T.push(o); };

  add({
    name: 'Palampore', cat: 'Kalamkari', desc: 'The trade-cloth tree of life inside a flower border',
    w: 1080, h: 1350, pal: 0, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Flower frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Great tree of life', x: 10, y: 9, w: 80, h: 82 },
    ]
  });

  add({
    name: 'Paisley medallion', cat: 'Kalamkari', desc: 'A round of paisleys on madder',
    w: 1080, h: 1080, pal: 2, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Paisley frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Fine medallion', x: 14, y: 14, w: 72, h: 72 },
    ]
  });

  add({
    name: 'Temple arch', cat: 'Kalamkari', desc: 'A vase of flowers under a cusped arch',
    w: 1080, h: 1350, pal: 1, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Arch with vase', x: 8, y: 8, w: 84, h: 78 },
      { p: 'Leaf chain', x: 2, y: 88, w: 96, h: 9 },
      { p: 'Dot border', x: 2, y: 2, w: 96, h: 5 },
    ]
  });

  add({
    name: 'Pair of peacocks', cat: 'Kalamkari', desc: 'Two peacocks and a lotus between two borders',
    w: 1587, h: 1123, pal: 0, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Paisley border', x: 1, y: 2, w: 98, h: 13 },
      { p: 'Peacock', x: 4, y: 17, w: 40, h: 66 },
      { p: 'Lotus', x: 40, y: 38, w: 20, h: 28 },
      { p: 'Peacock facing left', x: 56, y: 17, w: 40, h: 66 },
      { p: 'Paisley border', x: 1, y: 85, w: 98, h: 13, rot: 180 },
    ]
  });

  add({
    name: 'Buti yardage', cat: 'Kalamkari', desc: 'Block-printed paisleys by the metre, with a selvedge',
    w: 1080, h: 1350, pal: 5, texture: 'fibre', amt: 0.14,
    items: [
      { p: 'Paisley butis', x: 2, y: 12, w: 96, h: 76 },
      { p: 'Mango border', x: 1, y: 1, w: 98, h: 10 },
      { p: 'Mango border', x: 1, y: 89, w: 98, h: 10, rot: 180 },
    ]
  });

  add({
    name: 'Elephant', cat: 'Kalamkari', desc: 'A caparisoned elephant on indigo',
    w: 1587, h: 1123, pal: 3, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Vine frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Leaf spray', x: 8, y: 14, w: 20, h: 70 },
      { p: 'Elephant', x: 26, y: 14, w: 48, h: 72 },
      { p: 'Leaf spray', x: 72, y: 14, w: 20, h: 70 },
    ]
  });

  add({
    name: 'Tree on black', cat: 'Kalamkari', desc: 'A tree of life drawn light on an iron-black cloth',
    w: 1080, h: 1350, pal: 4, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Triangle frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Tree of life', x: 9, y: 8, w: 82, h: 84 },
    ]
  });

  add({
    name: 'Rosette tile', cat: 'Kalamkari', desc: 'A rosette on flower butis, for a square post',
    w: 1080, h: 1080, pal: 0, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Flower butis', x: 14, y: 14, w: 72, h: 72, op: .45 },
      { p: 'Arch frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Paisley rosette', x: 20, y: 20, w: 60, h: 60 },
    ]
  });

  window.SCRAWL.TEMPLATE_CATS = ['All', ...new Set(T.map(t => t.cat || 'Print'))];
})();
