/* ============================================================
   SCRAWL / templates — designed starting points
   Coordinates are percentages of the canvas.
   { p:'Preset name' } places a library preset.
   { t:'words' }      places text.
   ============================================================ */
(function () {
  const T = [];
  const add = (o) => T.push(o);

  /* handy style shorthands ------------------------------------
     c: stroke colour slot, a: accent slot, f: fill slot
     0 ink · 1 accent · 2 alt · 3 alt2 · 4 paper                */

  add({
    name: 'Event poster', cat: 'Print', desc: 'Big type, radial burst, small print', w: 1123, h: 1587, pal: 1,
    texture: 'grain', amt: 0.1,
    items: [
      { p: 'Fine sunburst', x: 8, y: 6, w: 84, h: 56, c: 1, op: 0.28 },
      { p: 'Cheering', x: 33, y: 16, w: 34, h: 34 },
      { t: 'NIGHT\nMARKET', x: 6, y: 56, w: 88, h: 20, font: 'Anton', caps: 1, ls: -1, lh: 0.92 },
      { p: 'Double rule', x: 14, y: 78, w: 72, h: 3, c: 1 },
      { t: 'Friday 8pm · Pier 4 · free entry', x: 10, y: 83, w: 80, h: 4, font: 'DM Mono', ls: 8 },
      { p: 'Dot divider', x: 40, y: 90, w: 20, h: 3, c: 1 },
    ]
  });

  add({
    name: 'Zine cover', cat: 'Print', desc: 'Torn box, loud headline, barcode', w: 840, h: 1080, pal: 26,
    texture: 'rough', amt: 0.16,
    items: [
      { p: 'Speckles', x: 0, y: 0, w: 100, h: 100, c: 0, op: 0.12 },
      { p: 'Torn box', x: 6, y: 8, w: 88, h: 58 },
      { p: 'Bear', x: 26, y: 12, w: 48, h: 44 },
      { t: 'ISSUE\nSEVEN', x: 10, y: 56, w: 62, h: 12, font: 'Archivo Black', caps: 1, align: 'start', lh: 0.95 },
      { t: 'nothing in here is finished', x: 10, y: 72, w: 62, h: 4, font: 'DM Sans', align: 'start' },
      { p: 'Short code', x: 62, y: 84, w: 32, h: 12 },
      { p: 'Tape strip', x: -4, y: 4, w: 34, h: 12, rot: -14, c: 1 },
    ]
  });

  add({
    name: 'Business card', cat: 'Cards', desc: 'Mark, name, one rule', w: 1050, h: 600, pal: 0,
    texture: 'fibre', amt: 0.09,
    items: [
      { p: 'Cog', x: 8, y: 22, w: 22, h: 38 },
      { t: 'Wren Ashby', x: 36, y: 30, w: 54, h: 13, font: 'Playfair Display', align: 'start' },
      { p: 'Single rule', x: 36, y: 47, w: 26, h: 4, c: 1 },
      { t: 'REPAIRS & STUBBORN OBJECTS', x: 36, y: 55, w: 54, h: 4, font: 'DM Mono', ls: 12, align: 'start' },
      { t: 'hello@wren.studio', x: 36, y: 68, w: 40, h: 4, font: 'DM Sans', align: 'start', c: 1 },
    ]
  });

  add({
    name: 'Quote post', cat: 'Social', desc: 'Centred quote in corner brackets', w: 1080, h: 1080, pal: 5,
    texture: 'grain', amt: 0.1,
    items: [
      { p: 'Corner brackets', x: 5, y: 5, w: 90, h: 90, c: 0 },
      { p: 'Heavy quotes', x: 42, y: 15, w: 16, h: 12, c: 1 },
      { t: 'Make it\nbadly, then\nmake it\nagain.', x: 12, y: 30, w: 76, h: 38, font: 'Playfair Display', lh: 1.14 },
      { p: 'Diamond divider', x: 35, y: 72, w: 30, h: 4, c: 1 },
      { t: 'FIELD NOTES, NO. 12', x: 25, y: 80, w: 50, h: 3.5, font: 'DM Mono', ls: 14 },
    ]
  });

  add({
    name: 'Menu board', cat: 'Print', desc: 'Heading, rules, priced rows', w: 794, h: 1123, pal: 11,
    texture: 'grain', amt: 0.12,
    items: [
      { p: 'Espresso cup', x: 38, y: 4, w: 24, h: 20 },
      { t: 'THE LIST', x: 12, y: 25, w: 76, h: 9, font: 'Bebas Neue', caps: 1, ls: 8 },
      { p: 'Double rule', x: 12, y: 36, w: 76, h: 2.5, c: 0 },
      { t: 'Espresso\nFlat white\nCold brew\nHouse blend', x: 12, y: 41, w: 46, h: 26, font: 'DM Sans', align: 'start', lh: 1.55 },
      { t: '3.0\n4.2\n5.0\n3.8', x: 68, y: 41, w: 20, h: 26, font: 'DM Mono', align: 'end', lh: 1.55 },
      { p: 'Dot divider', x: 12, y: 70, w: 76, h: 3, c: 1 },
      { t: 'oat milk free · no wifi · cash is fine', x: 10, y: 76, w: 80, h: 3.5, font: 'DM Mono', ls: 4 },
      { p: 'Sprig', x: 40, y: 82, w: 20, h: 16, c: 1 },
    ]
  });

  add({
    name: 'Sticker sheet', cat: 'Print', desc: 'Nine marks on a grid, ready to cut', w: 900, h: 900, pal: 3,
    texture: 'none', amt: 0,
    items: (() => {
      const names = ['Lightning', 'Flame', 'Eye', 'Padlock', 'Rocket', 'Crown', 'Ghost', 'Mushroom', 'Four star'];
      const out = [{ p: 'Dashed frame', x: 3, y: 3, w: 94, h: 94, c: 0, op: 0.5 }];
      names.forEach((n, i) => {
        out.push({ p: 'Circle', x: 10 + (i % 3) * 27, y: 10 + Math.floor(i / 3) * 27, w: 22, h: 22, c: 0, op: 0.35 });
        out.push({ p: n, x: 13 + (i % 3) * 27, y: 13 + Math.floor(i / 3) * 27, w: 16, h: 16 });
      });
      return out;
    })()
  });

  add({
    name: 'Certificate', cat: 'Print', desc: 'Laurel, rule, signature line', w: 1123, h: 794, pal: 28,
    texture: 'fibre', amt: 0.12,
    items: [
      { p: 'Rope frame', x: 4, y: 5, w: 92, h: 90 },
      { p: 'Laurel wreath', x: 40, y: 9, w: 20, h: 20, c: 1 },
      { t: 'CERTIFICATE', x: 15, y: 31, w: 70, h: 9, font: 'Playfair Display', caps: 1, ls: 6 },
      { t: 'of stubborn persistence', x: 25, y: 43, w: 50, h: 4, font: 'DM Sans', c: 1 },
      { p: 'Diamond divider', x: 38, y: 50, w: 24, h: 3.5, c: 1 },
      { t: 'awarded to', x: 40, y: 57, w: 20, h: 3, font: 'DM Mono', ls: 10 },
      { t: 'A. Nameless', x: 25, y: 62, w: 50, h: 8, font: 'Caveat' },
      { p: 'Single rule', x: 25, y: 72, w: 50, h: 3, c: 0 },
      { p: 'Seal', x: 76, y: 72, w: 15, h: 15, c: 1 },
    ]
  });

  add({
    name: 'Recipe card', cat: 'Cards', desc: 'Ingredient checklist with a sprig', w: 1476, h: 1004, pal: 13,
    texture: 'grain', amt: 0.1,
    items: [
      { p: 'Soft box', x: 4, y: 5, w: 92, h: 90, c: 0 },
      { p: 'Potted plant', x: 74, y: 12, w: 18, h: 26, c: 0 },
      { t: 'Burnt Butter\nSomething', x: 9, y: 12, w: 56, h: 16, font: 'Playfair Display', align: 'start', lh: 1.05 },
      { p: 'Single rule', x: 9, y: 32, w: 30, h: 3, c: 1 },
      { p: 'Long list', x: 8, y: 39, w: 40, h: 46 },
      { t: 'SERVES 4 · 25 MIN', x: 55, y: 45, w: 36, h: 3.5, font: 'DM Mono', ls: 10, align: 'start' },
      { t: 'Brown the butter until it smells\nlike toffee. Do not walk away.\nIt will burn the second you do.', x: 55, y: 53, w: 38, h: 16, font: 'DM Sans', align: 'start', lh: 1.5 },
    ]
  });

  add({
    name: 'Album cover', cat: 'Social', desc: 'Halftone field, heavy type', w: 1080, h: 1080, pal: 14,
    texture: 'none', amt: 0,
    items: [
      { p: 'Radial halftone', x: 0, y: 0, w: 100, h: 100, c: 1, op: 0.6 },
      { p: 'Blob', x: 26, y: 20, w: 48, h: 48, c: 0, f: 4, fill: 'solid' },
      { p: 'Planet', x: 34, y: 28, w: 32, h: 32, c: 1 },
      { t: 'SLOW\nMACHINE', x: 6, y: 72, w: 88, h: 17, font: 'Syne', caps: 1, lh: 0.94 },
      { t: 'side a — 33⅓ rpm', x: 6, y: 92, w: 44, h: 3.5, font: 'DM Mono', align: 'start', ls: 6, c: 1 },
    ]
  });

  add({
    name: 'Shop sign', cat: 'Print', desc: 'Arch, name, opening hours', w: 1800, h: 600, pal: 6,
    texture: 'rough', amt: 0.12,
    items: [
      { p: 'Arched window', x: 3, y: 6, w: 18, h: 88, c: 0, op: 0.6 },
      { p: 'Arched window', x: 79, y: 6, w: 18, h: 88, c: 0, op: 0.6 },
      { t: 'THE SPARE ROOM', x: 24, y: 22, w: 52, h: 24, font: 'Bebas Neue', caps: 1, ls: 4 },
      { p: 'Leaf divider', x: 32, y: 52, w: 36, h: 6, c: 1 },
      { t: 'open when the light is on', x: 26, y: 66, w: 48, h: 6, font: 'Caveat', c: 1 },
    ]
  });

  add({
    name: 'Notebook page', cat: 'Print', desc: 'Ruled paper, heading, to-do', w: 816, h: 1056, pal: 24,
    texture: 'lines', amt: 0.09,
    items: [
      { p: 'Vertical lines', x: 8, y: 0, w: 3, h: 100, c: 1, op: 0.6 },
      { t: 'Monday, probably', x: 14, y: 6, w: 60, h: 7, font: 'Caveat', align: 'start' },
      { p: 'Single rule', x: 14, y: 16, w: 40, h: 3, c: 1 },
      { p: 'Long list', x: 13, y: 22, w: 74, h: 46 },
      { p: 'Sprig', x: 72, y: 72, w: 20, h: 24, c: 1 },
      { t: 'none of this is urgent', x: 14, y: 88, w: 44, h: 4, font: 'DM Mono', align: 'start', ls: 4 },
    ]
  });

  add({
    name: 'Sale tag', cat: 'Social', desc: 'Burst, big number, price tag', w: 1080, h: 1080, pal: 9,
    texture: 'grain', amt: 0.1,
    items: [
      { p: 'Sunburst', x: 4, y: 4, w: 92, h: 92, c: 1, op: 0.45 },
      { p: 'Circle', x: 16, y: 16, w: 68, h: 68, c: 0, f: 4, fill: 'solid' },
      { t: 'HALF', x: 24, y: 28, w: 52, h: 13, font: 'Anton', caps: 1 },
      { t: 'PRICE', x: 20, y: 42, w: 60, h: 20, font: 'Anton', caps: 1, c: 1 },
      { t: 'everything must go, honestly', x: 24, y: 66, w: 52, h: 3.5, font: 'DM Mono', ls: 4 },
      { p: 'Price tag', x: 62, y: 74, w: 30, h: 16, rot: -12, c: 0 },
    ]
  });

  add({
    name: 'Blank canvas', cat: 'Blank', desc: 'Just paper. Start from nothing.', w: 1080, h: 1350, pal: 0,
    texture: 'grain', amt: 0.1, items: []
  });

  window.SCRAWL.TEMPLATES = T;
})();
