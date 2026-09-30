/* ============================================================
   MOTIFS / madhubani-templates — designed Mithila starting points
   ------------------------------------------------------------
   Gond leaves a creature alone on its ground. Madhubani does not:
   a Mithila painting is framed, banded and filled to the edge, and
   its subjects are the ones painted for a wedding — the Kohbar,
   the couple, the fish, the lotus, the sun and moon as witnesses.
   ============================================================ */
(function () {
  const T = window.SCRAWL.TEMPLATES;
  const add = o => { o.style = 'madhubani'; T.push(o); };

  add({
    name: 'Kohbar', cat: 'Madhubani', desc: 'The marriage-chamber painting',
    w: 1080, h: 1080, pal: 0, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Kohbar', x: 2, y: 2, w: 96, h: 96 },
    ]
  });

  add({
    name: 'Wedding', cat: 'Madhubani', desc: 'Bride, groom, and the sun and moon as witness',
    w: 1080, h: 1350, pal: 3, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Petal frame', x: 1.5, y: 1.2, w: 97, h: 97.6 },
      { p: 'Sun and moon', x: 30, y: 8, w: 40, h: 17 },
      { p: 'Bride and groom', x: 14, y: 25, w: 72, h: 56 },
      { p: 'Fish border', x: 12, y: 83, w: 76, h: 8 },
    ]
  });

  add({
    name: 'Two fish', cat: 'Madhubani', desc: 'The auspicious pair, in black and red',
    w: 1080, h: 1080, pal: 2, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Hatched frame', x: 2, y: 2, w: 96, h: 96 },
      { p: 'Circling fish', x: 14, y: 14, w: 72, h: 72 },
      { p: 'Kachni rosette', x: 9, y: 9, w: 13, h: 13 },
      { p: 'Kachni rosette', x: 78, y: 9, w: 13, h: 13 },
      { p: 'Kachni rosette', x: 9, y: 78, w: 13, h: 13 },
      { p: 'Kachni rosette', x: 78, y: 78, w: 13, h: 13 },
    ]
  });

  add({
    name: 'Tree of life', cat: 'Madhubani', desc: 'Parrots in the branches, a pond at the root',
    w: 1080, h: 1350, pal: 0, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Vine border', x: 2, y: 2, w: 96, h: 7 },
      { p: 'Tree of life', x: 6, y: 9, w: 88, h: 68 },
      { p: 'Lotus pond', x: 4, y: 74, w: 92, h: 16 },
      { p: 'Vine border', x: 2, y: 91, w: 96, h: 7 },
    ]
  });

  add({
    name: 'Procession', cat: 'Madhubani', desc: 'An elephant and the women who walk with it',
    w: 1587, h: 1123, pal: 1, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Teeth border', x: 1, y: 2, w: 98, h: 8 },
      { p: 'Elephant with rider', x: 3, y: 16, w: 38, h: 66 },
      { p: 'Water carriers', x: 42, y: 14, w: 55, h: 70 },
      { p: 'Bud border', x: 1, y: 88, w: 98, h: 9 },
    ]
  });

  add({
    name: 'Peacock', cat: 'Madhubani', desc: 'One bird in display, framed in arches',
    w: 1080, h: 1080, pal: 5, texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Scallop frame', x: 2, y: 2, w: 96, h: 96 },
      { p: 'Peacock in display', x: 14, y: 12, w: 72, h: 76 },
    ]
  });

  add({
    name: 'Lotus mandala', cat: 'Madhubani', desc: 'The Kohbar lotus on its own, on a dark ground',
    w: 1080, h: 1080, pal: 6, texture: 'fibre', amt: 0.08,
    items: [
      { p: 'Check frame', x: 2, y: 2, w: 96, h: 96 },
      { p: 'Fine mandala', x: 10, y: 10, w: 80, h: 80 },
    ]
  });

  add({
    name: 'Surya poster', cat: 'Madhubani', desc: 'The sun with a face, on a sindoor ground',
    w: 1080, h: 1350, pal: 4, texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Deep petal border', x: 2, y: 2, w: 96, h: 9 },
      { p: 'Blazing sun', x: 12, y: 14, w: 76, h: 60 },
      { t: 'MITHILA', x: 10, y: 77, w: 80, h: 10, font: 'Playfair Display', caps: 1, ls: 12 },
      { p: 'Deep petal border', x: 2, y: 89, w: 96, h: 9 },
    ]
  });

  window.SCRAWL.TEMPLATE_CATS = ['All', ...new Set(T.map(t => t.cat || 'Print'))];
})();
