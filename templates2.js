/* ============================================================
   SCRAWL / templates2 — logos and more starting points
   Same shape as templates.js. Appended to the same list.
   ============================================================ */
(function () {
  const T = window.SCRAWL.TEMPLATES;
  const add = o => T.push(o);

  /* ---------------------------------------------------------
     LOGOS — mark + wordmark pairs, sized as a square lockup
     --------------------------------------------------------- */
  add({
    name: 'Stacked logo', cat: 'Logos', desc: 'Mark above, name below', w: 1080, h: 1080, pal: 0,
    texture: 'none', amt: 0,
    items: [
      { p: 'Fern', x: 36, y: 20, w: 28, h: 34 },
      { t: 'NORTHWOOD', x: 10, y: 60, w: 80, h: 11, font: 'Bebas Neue', caps: 1, ls: 10 },
      { p: 'Single rule', x: 32, y: 74, w: 36, h: 3, c: 1 },
      { t: 'field supply co.', x: 25, y: 80, w: 50, h: 5, font: 'DM Mono', ls: 6, c: 1 },
    ]
  });

  add({
    name: 'Badge logo', cat: 'Logos', desc: 'Seal with a mark inside', w: 1080, h: 1080, pal: 11,
    texture: 'grain', amt: 0.08,
    items: [
      { p: 'Seal', x: 6, y: 6, w: 88, h: 88, c: 0 },
      { p: 'Fine badge', x: 14, y: 14, w: 72, h: 72, c: 1, op: 0.55 },
      { p: 'Bee', x: 34, y: 28, w: 32, h: 30 },
      { t: 'HONEY & CO', x: 22, y: 60, w: 56, h: 8, font: 'Bebas Neue', caps: 1, ls: 8 },
      { t: 'est. 2019', x: 36, y: 72, w: 28, h: 4, font: 'DM Mono', ls: 8, c: 1 },
    ]
  });

  add({
    name: 'Horizontal logo', cat: 'Logos', desc: 'Mark left, name right', w: 1600, h: 600, pal: 2,
    texture: 'none', amt: 0,
    items: [
      { p: 'Paper lantern', x: 5, y: 10, w: 26, h: 80 },
      { t: 'LANTERN', x: 35, y: 24, w: 58, h: 26, font: 'Fraunces', caps: 1, align: 'start', ls: 1 },
      { t: 'slow software, made carefully', x: 35, y: 60, w: 52, h: 10, font: 'DM Sans', align: 'start', c: 1 },
    ]
  });

  add({
    name: 'Monogram', cat: 'Logos', desc: 'Two letters in a ring', w: 1080, h: 1080, pal: 13,
    texture: 'fibre', amt: 0.09,
    items: [
      { p: 'Double ring', x: 12, y: 12, w: 76, h: 76, c: 0 },
      { t: 'AV', x: 28, y: 32, w: 44, h: 34, font: 'Playfair Display', caps: 1 },
      { p: 'Leaf divider', x: 30, y: 68, w: 40, h: 7, c: 1 },
    ]
  });

  add({
    name: 'Emblem logo', cat: 'Logos', desc: 'Arch, mark, ribbon', w: 1080, h: 1080, pal: 17,
    texture: 'grain', amt: 0.1,
    items: [
      { p: 'Arch', x: 16, y: 6, w: 68, h: 60, c: 0 },
      { p: 'Pine forest', x: 26, y: 28, w: 48, h: 30 },
      { t: 'TRAILHEAD', x: 12, y: 70, w: 76, h: 12, font: 'Bebas Neue', caps: 1, ls: 8 },
      { t: 'WALK IT OFF', x: 30, y: 86, w: 40, h: 5, font: 'DM Mono', ls: 12, c: 1 },
    ]
  });

  add({
    name: 'Wordmark', cat: 'Logos', desc: 'Type only, one accent', w: 1600, h: 600, pal: 26,
    texture: 'none', amt: 0,
    items: [
      { t: 'bolt', x: 10, y: 16, w: 46, h: 46, font: 'Bricolage Grotesque', align: 'start' },
      { p: 'Lightning', x: 60, y: 14, w: 28, h: 50, c: 1 },
      { t: 'ELECTRIC ODD JOBS', x: 10, y: 72, w: 76, h: 10, font: 'Chivo Mono', ls: 14, align: 'start' },
    ]
  });

  add({
    name: 'Circle mark', cat: 'Logos', desc: 'Text around a ring', w: 1080, h: 1080, pal: 5,
    texture: 'grain', amt: 0.09,
    items: [
      { p: 'Fine sunburst', x: 14, y: 6, w: 72, h: 72, c: 1, op: 0.28 },
      { p: 'Circle', x: 20, y: 12, w: 60, h: 60, c: 0 },
      { p: 'Succulent', x: 31, y: 23, w: 38, h: 38 },
      { t: 'GROW SLOW', x: 16, y: 78, w: 68, h: 10, font: 'Space Grotesk', caps: 1, ls: 6 },
    ]
  });

  add({
    name: 'Hand-lettered logo', cat: 'Logos', desc: 'Script with an underline', w: 1600, h: 600, pal: 6,
    texture: 'rough', amt: 0.1,
    items: [
      { t: 'the spare hour', x: 10, y: 16, w: 80, h: 38, font: 'Caveat' },
      { p: 'Single rule', x: 22, y: 58, w: 56, h: 8, c: 1 },
      { t: 'CERAMICS · SMALL BATCHES', x: 16, y: 78, w: 68, h: 8, font: 'DM Mono', ls: 10 },
    ]
  });

  /* ---------------------------------------------------------
     MORE PRINT / SOCIAL / CARDS
     --------------------------------------------------------- */
  add({
    name: 'Gig poster', cat: 'Print', desc: 'Loud type over a burst', w: 1123, h: 1587, pal: 26,
    texture: 'rough', amt: 0.15,
    items: [
      { p: 'Sunburst', x: -6, y: 2, w: 112, h: 64, c: 0, op: 0.5 },
      { t: 'THE\nDRY\nSEASON', x: 6, y: 8, w: 88, h: 46, font: 'Alfa Slab One', caps: 1, lh: 0.92 },
      { p: 'Torn box', x: 10, y: 60, w: 80, h: 22, c: 0 },
      { t: 'SAT 14 · THE OLD BATHS · 8PM', x: 16, y: 65, w: 68, h: 5, font: 'Chivo Mono', ls: 2 },
      { t: 'tickets at the door', x: 28, y: 73, w: 44, h: 5, font: 'DM Sans' },
      { p: 'Bar code', x: 34, y: 86, w: 32, h: 10 },
    ]
  });

  add({
    name: 'Invitation', cat: 'Cards', desc: 'Arch, laurel, details', w: 1004, h: 1476, pal: 33,
    texture: 'fibre', amt: 0.11,
    items: [
      { p: 'Arched window', x: 10, y: 6, w: 80, h: 66, c: 0, op: 0.7 },
      { p: 'Laurel wreath', x: 36, y: 16, w: 28, h: 26, c: 1 },
      { t: 'You are\ninvited', x: 18, y: 46, w: 64, h: 18, font: 'Cormorant Garamond', lh: 1.1 },
      { p: 'Diamond divider', x: 34, y: 70, w: 32, h: 4, c: 1 },
      { t: 'SATURDAY THE ELEVENTH', x: 14, y: 78, w: 72, h: 4, font: 'DM Mono', ls: 10 },
      { t: 'seven in the evening', x: 24, y: 85, w: 52, h: 5, font: 'DM Sans', c: 1 },
    ]
  });

  add({
    name: 'Story post', cat: 'Social', desc: 'Vertical, big type, one mark', w: 1080, h: 1920, pal: 21,
    texture: 'grain', amt: 0.09,
    items: [
      { p: 'Confetti', x: 0, y: 0, w: 100, h: 100, c: 3, op: 0.3 },
      { p: 'Balloons', x: 26, y: 14, w: 48, h: 30 },
      { t: 'ONE\nYEAR', x: 8, y: 48, w: 84, h: 22, font: 'Unbounded', caps: 1, lh: 0.98 },
      { t: 'thank you for the noise', x: 16, y: 74, w: 68, h: 5, font: 'DM Sans' },
      { p: 'Dot divider', x: 40, y: 82, w: 20, h: 3, c: 1 },
    ]
  });

  add({
    name: 'Price list', cat: 'Print', desc: 'Services and numbers', w: 794, h: 1123, pal: 30,
    texture: 'lines', amt: 0.07,
    items: [
      { p: 'Scissors', x: 40, y: 5, w: 20, h: 16 },
      { t: 'PRICES', x: 14, y: 23, w: 72, h: 8, font: 'Bebas Neue', caps: 1, ls: 12 },
      { p: 'Double rule', x: 14, y: 34, w: 72, h: 2.5 },
      { t: 'Dry cut\nWash & cut\nColour\nFringe trim', x: 14, y: 40, w: 44, h: 26, font: 'DM Sans', align: 'start', lh: 1.6 },
      { t: '28\n40\nfrom 65\n10', x: 66, y: 40, w: 20, h: 26, font: 'DM Mono', align: 'end', lh: 1.6 },
      { p: 'Leaf divider', x: 28, y: 72, w: 44, h: 6, c: 1 },
      { t: 'walk-ins if the light is on', x: 16, y: 82, w: 68, h: 4, font: 'DM Mono', ls: 4 },
    ]
  });

  add({
    name: 'Postcard back', cat: 'Cards', desc: 'Stamp, rules, address block', w: 1476, h: 1004, pal: 15,
    texture: 'fibre', amt: 0.1,
    items: [
      { p: 'Plain frame', x: 4, y: 5, w: 92, h: 90, c: 0, op: 0.5 },
      { p: 'Ticket', x: 74, y: 10, w: 20, h: 20, c: 0 },
      { p: 'Map pin', x: 8, y: 12, w: 14, h: 22, c: 1 },
      { t: 'Wish you were\nsomewhere', x: 8, y: 40, w: 40, h: 16, font: 'Caveat', align: 'start', lh: 1.15 },
      { p: 'Single rule', x: 55, y: 48, w: 38, h: 3, c: 0 },
      { p: 'Single rule', x: 55, y: 60, w: 38, h: 3, c: 0 },
      { p: 'Single rule', x: 55, y: 72, w: 38, h: 3, c: 0 },
    ]
  });

  add({
    name: 'Zine spread', cat: 'Print', desc: 'Two columns and a mark', w: 1587, h: 1123, pal: 23,
    texture: 'rough', amt: 0.13,
    items: [
      { p: 'Diagonal lines', x: 0, y: 0, w: 100, h: 100, c: 3, op: 0.22 },
      { t: 'FIELD\nNOTES', x: 6, y: 8, w: 40, h: 22, font: 'Archivo Black', caps: 1, align: 'start', lh: 0.95 },
      { t: 'Everything here was made\nin one afternoon and\nnothing was planned.', x: 6, y: 38, w: 40, h: 16, font: 'DM Sans', align: 'start', lh: 1.55 },
      { p: 'Corner brackets', x: 52, y: 8, w: 42, h: 60, c: 1 },
      { p: 'Constellation', x: 56, y: 14, w: 34, h: 34 },
      { t: 'no. 03', x: 6, y: 86, w: 20, h: 6, font: 'Chivo Mono', align: 'start', ls: 8 },
    ]
  });

  add({
    name: 'Coaster', cat: 'Print', desc: 'Round, badge, short words', w: 900, h: 900, pal: 19,
    texture: 'grain', amt: 0.12,
    items: [
      { p: 'Scalloped badge', x: 4, y: 4, w: 92, h: 92, c: 0 },
      { p: 'Wheat', x: 36, y: 18, w: 28, h: 32, c: 1 },
      { t: 'ONE MORE', x: 20, y: 54, w: 60, h: 12, font: 'Alfa Slab One', caps: 1 },
      { t: 'and then home', x: 32, y: 68, w: 36, h: 5, font: 'DM Mono', ls: 6 },
    ]
  });

  window.SCRAWL.TEMPLATE_CATS = ['All', ...new Set(T.map(t => t.cat || 'Print'))];
})();
