/* ============================================================
   SCRAWL / presets3 — library entries for gens4
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }

  /* --- food --- */
  P('cake', 'Birthday cake', { layers: 2, candles: 3 }, 'food party');
  P('cake', 'Tall cake', { layers: 4, candles: 1 }, 'food party');
  P('cake', 'Plain cake', { layers: 2, candles: 0, plate: 1 }, 'food');

  P('slice', 'Pizza slice', { bits: 5 }, 'food');
  P('slice', 'Plain slice', { bits: 0, angle: 36 }, 'food');
  P('slice', 'Loaded slice', { bits: 10, angle: 66 }, 'food');

  P('icecream', 'Ice cream cone', { scoops: 2, base: 0 }, 'food summer');
  P('icecream', 'Triple scoop', { scoops: 3, base: 0, drip: 1 }, 'food summer');
  P('icecream', 'Sundae', { scoops: 2, base: 1 }, 'food summer');
  P('icecream', 'Lolly', { scoops: 1, base: 2 }, 'food summer');

  P('bread', 'Loaf', { kind: 0, slashes: 3 }, 'food bakery');
  P('bread', 'Baguette', { kind: 1, slashes: 4 }, 'food bakery');
  P('bread', 'Roll', { kind: 2, slashes: 2 }, 'food bakery');
  P('bread', 'Loaf on a board', { kind: 0, slashes: 3, board: 1 }, 'food bakery');

  P('fruit', 'Apple', { kind: 0 }, 'food plant');
  P('fruit', 'Pear', { kind: 1 }, 'food plant');
  P('fruit', 'Lemon', { kind: 2, leaf: 0 }, 'food plant');
  P('fruit', 'Cherries', { kind: 3, leaf: 0 }, 'food plant');
  P('fruit', 'Strawberry', { kind: 4, leaf: 0 }, 'food plant');

  /* --- tools --- */
  P('brush', 'Paint brush', { kind: 0 }, 'art tool');
  P('brush', 'Ink brush', { kind: 1, rot: 340 }, 'art tool');
  P('brush', 'Roller', { kind: 2, rot: 0, mark: 1 }, 'art tool');

  P('palette', 'Paint palette', { wells: 5 }, 'art');
  P('palette', 'Full palette', { wells: 9, brush: 0 }, 'art');

  P('hammer', 'Hammer', { kind: 0, rot: 30 }, 'tool build');
  P('hammer', 'Wrench', { kind: 1, rot: 320 }, 'tool build');
  P('hammer', 'Screwdriver', { kind: 2, rot: 40 }, 'tool build');
  P('hammer', 'Ruler', { kind: 3, rot: 0 }, 'tool measure');

  P('needle', 'Needle & thread', { loops: 3 }, 'craft sew');
  P('needle', 'Long thread', { loops: 6, spool: 1 }, 'craft sew');

  /* --- weather --- */
  P('weather', 'Sunny', { kind: 0 }, 'weather sky');
  P('weather', 'Rain', { kind: 1, bits: 6 }, 'weather sky');
  P('weather', 'Storm', { kind: 2, bits: 0 }, 'weather sky');
  P('weather', 'Snow', { kind: 3, bits: 7 }, 'weather sky winter');
  P('weather', 'Windy', { kind: 4, bits: 4 }, 'weather sky');
  P('weather', 'Partly cloudy', { kind: 5 }, 'weather sky');

  /* --- transport --- */
  P('vehicle', 'Bicycle', { kind: 0 }, 'transport');
  P('vehicle', 'Van', { kind: 1, detail: 3 }, 'transport');
  P('vehicle', 'Sailboat', { kind: 2 }, 'transport sea');
  P('vehicle', 'Plane', { kind: 3, detail: 5, motion: 1 }, 'transport');
  P('vehicle', 'Train', { kind: 4, detail: 3 }, 'transport');

  /* --- marks & UI --- */
  P('cursorMark', 'Cursor arrow', { kind: 0 }, 'ui pointer');
  P('cursorMark', 'Pointing hand', { kind: 1 }, 'ui pointer');
  P('cursorMark', 'Crosshair', { kind: 2 }, 'ui aim');
  P('cursorMark', 'Target', { kind: 3 }, 'ui aim');

  P('label', 'Pill labels', { rows: 2, shape: 0 }, 'ui tag');
  P('label', 'Box labels', { rows: 3, shape: 1 }, 'ui tag');
  P('label', 'Cut labels', { rows: 2, shape: 2 }, 'ui tag');
  P('label', 'Wavy labels', { rows: 3, shape: 3 }, 'ui tag');
  P('label', 'Single pill', { rows: 1, shape: 0 }, 'ui tag');

  P('speechPair', 'Conversation', { bubbles: 3 }, 'chat ui');
  P('speechPair', 'Long thread', { bubbles: 5, lines: 3 }, 'chat ui');
  P('speechPair', 'Two lines', { bubbles: 2, lines: 1 }, 'chat ui');

  P('chart', 'Bar chart', { kind: 0, points: 6 }, 'data graph');
  P('chart', 'Line chart', { kind: 1, points: 8 }, 'data graph');
  P('chart', 'Pie chart', { kind: 2, points: 5 }, 'data graph');
  P('chart', 'Scatter', { kind: 3, points: 8, axes: 1 }, 'data graph');

  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.id = 'r' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
  window.SCRAWL.PRESET_CATS = [...new Set(PRESETS.map(e => e.cat))];
})();
