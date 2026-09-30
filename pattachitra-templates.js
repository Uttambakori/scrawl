/* ============================================================
   MOTIFS / pattachitra-templates — designed Odisha starting points
   ------------------------------------------------------------
   A patta is framed before it is painted: nested bands, a lotus
   in each corner, and a creeper ground behind whatever stands in
   the middle. These layouts start from the frame inward.
   ============================================================ */
(function () {
  const T = window.SCRAWL.TEMPLATES;
  const add = o => { o.style = 'pattachitra'; T.push(o); };

  add({
    name: 'Dancer in a doorway', cat: 'Pattachitra', desc: 'A temple arch, a creeper ground, one dancer',
    w: 1080, h: 1350, pal: 0, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Creeper ground', x: 10, y: 8, w: 80, h: 84, op: .55 },
      { p: 'Temple arch', x: 12, y: 8, w: 76, h: 84 },
      { p: 'Dancer', x: 22, y: 34, w: 56, h: 56 },
      { p: 'Creeper frame', x: 1, y: 1, w: 98, h: 98 },
    ]
  });

  add({
    name: 'Konark wheel', cat: 'Pattachitra', desc: 'The sun-temple wheel on a yellow ground',
    w: 1080, h: 1080, pal: 1, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Petal frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Konark wheel', x: 13, y: 13, w: 74, h: 74 },
    ]
  });

  add({
    name: 'Guardian lions', cat: 'Pattachitra', desc: 'Two lions facing across a tree',
    w: 1587, h: 1123, pal: 0, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Triangle border', x: 1, y: 2, w: 98, h: 10 },
      { p: 'Facing lions', x: 6, y: 13, w: 88, h: 74 },
      { p: 'Triangle border', x: 1, y: 88, w: 98, h: 10, rot: 180 },
    ]
  });

  add({
    name: 'Ring dance', cat: 'Pattachitra', desc: 'Dancers round a lotus, on temple indigo',
    w: 1080, h: 1080, pal: 3, texture: 'grain', amt: 0.08,
    items: [
      { p: 'Lotus frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Ring dance', x: 13, y: 13, w: 74, h: 74 },
    ]
  });

  add({
    name: 'Procession', cat: 'Pattachitra', desc: 'An elephant and the musicians who walk ahead of it',
    w: 1587, h: 1123, pal: 2, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Creeper border', x: 1, y: 2, w: 98, h: 11 },
      { p: 'Elephant', x: 3, y: 18, w: 40, h: 64 },
      { p: 'Musicians', x: 44, y: 14, w: 54, h: 70 },
      { p: 'Bead border', x: 1, y: 88, w: 98, h: 6 },
    ]
  });

  add({
    name: 'Peacock', cat: 'Pattachitra', desc: 'One bird on a creeper ground, green lac',
    w: 1080, h: 1350, pal: 4, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Fine creeper', x: 8, y: 7, w: 84, h: 86, op: .5 },
      { p: 'Great peacock', x: 10, y: 16, w: 80, h: 68 },
      { p: 'Diamond frame', x: 1, y: 1, w: 98, h: 98 },
    ]
  });

  add({
    name: 'Palm-leaf strip', cat: 'Pattachitra', desc: 'Tala pattachitra: a long leaf of engraved figures',
    w: 1800, h: 560, pal: 5, texture: 'fibre', amt: 0.14,
    items: [
      { p: 'Bead border', x: 1, y: 3, w: 98, h: 9 },
      { p: 'Temple procession', x: 4, y: 14, w: 92, h: 72 },
      { p: 'Bead border', x: 1, y: 88, w: 98, h: 9 },
    ]
  });

  add({
    name: 'Deer under a tree', cat: 'Pattachitra', desc: 'Two deer and a kadamba tree, framed in waves',
    w: 1080, h: 1080, pal: 2, texture: 'grain', amt: 0.1,
    items: [
      { p: 'Wave frame', x: 1, y: 1, w: 98, h: 98 },
      { p: 'Facing deer', x: 10, y: 12, w: 80, h: 76 },
    ]
  });

  window.SCRAWL.TEMPLATE_CATS = ['All', ...new Set(T.map(t => t.cat || 'Print'))];
})();
