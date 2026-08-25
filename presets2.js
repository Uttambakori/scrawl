/* ============================================================
   SCRAWL / presets2 — library entries for gens3
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }

  P('fern', 'Fern', { pairs: 10, bend: 18 }, 'plant leaf');
  P('fern', 'Tall fern', { pairs: 16, bend: 4, taper: 55 }, 'plant leaf');
  P('fern', 'Curved fern', { pairs: 8, bend: 36, taper: 85 }, 'plant leaf');

  P('monstera', 'Monstera', { splits: 4 }, 'plant leaf tropical');
  P('monstera', 'Split leaf', { splits: 6, width: 88 }, 'plant leaf tropical');
  P('monstera', 'Young monstera', { splits: 2, width: 58, stem: 30 }, 'plant leaf');

  P('grass', 'Grass tuft', { blades: 9 }, 'plant lawn');
  P('grass', 'Wild grass', { blades: 16, spread: 88, curl: 46 }, 'plant lawn');
  P('grass', 'Sparse grass', { blades: 4, spread: 40, curl: 12 }, 'plant lawn');

  P('wheat', 'Wheat', { grains: 9 }, 'plant harvest');
  P('wheat', 'Barley', { grains: 14, awns: 1, bend: 22 }, 'plant harvest');
  P('wheat', 'Plain ear', { grains: 7, awns: 0 }, 'plant harvest');

  P('lavender', 'Lavender', { stalks: 3, buds: 9 }, 'plant flower');
  P('lavender', 'Single stem', { stalks: 1, buds: 12, spread: 0 }, 'plant flower');
  P('lavender', 'Bunch', { stalks: 5, buds: 8, spread: 50 }, 'plant flower');

  P('dandelion', 'Dandelion', { seeds: 30, blown: 4 }, 'plant flower wish');
  P('dandelion', 'Full clock', { seeds: 52, blown: 0 }, 'plant flower');
  P('dandelion', 'Blowing away', { seeds: 18, blown: 10 }, 'plant flower wish');

  P('vine', 'Vine', { leaves: 8, waves: 2 }, 'plant border');
  P('vine', 'Long vine', { leaves: 14, waves: 4, size: 8 }, 'plant border');
  P('vine', 'Simple trail', { leaves: 5, waves: 1, size: 15 }, 'plant border');

  P('succulent', 'Succulent', { rings: 3, petals: 7 }, 'plant');
  P('succulent', 'Echeveria', { rings: 4, petals: 9, fat: 80 }, 'plant');
  P('succulent', 'Aloe', { rings: 2, petals: 6, fat: 38 }, 'plant');

  P('butterfly', 'Butterfly', { spots: 3 }, 'insect animal');
  P('butterfly', 'Plain wings', { spots: 0, span: 92 }, 'insect animal');
  P('butterfly', 'Spotted moth', { spots: 7, span: 64 }, 'insect animal');

  P('bee', 'Bee', { stripes: 3 }, 'insect animal');
  P('bee', 'Busy bee', { stripes: 4, trail: 1 }, 'insect animal');

  P('snail', 'Snail', { turns: 3 }, 'animal');
  P('snail', 'Big shell', { turns: 5, shell: 64 }, 'animal');

  P('fish', 'Fish', { fins: 2 }, 'animal sea');
  P('fish', 'Forked tail', { tail: 1, fins: 3, scales: 3 }, 'animal sea');
  P('fish', 'Round tail', { tail: 2, fins: 1 }, 'animal sea');

  P('shell', 'Scallop shell', { kind: 0, ribs: 8 }, 'sea beach');
  P('shell', 'Fine scallop', { kind: 0, ribs: 14, hinge: 10 }, 'sea beach');
  P('shell', 'Spiral shell', { kind: 2 }, 'sea beach');

  P('feather', 'Feather', { barbs: 16 }, 'bird');
  P('feather', 'Wide feather', { barbs: 24, width: 44, curl: 22 }, 'bird');
  P('feather', 'Quill', { barbs: 8, width: 18 }, 'bird');

  P('snowflake', 'Snowflake', { arms: 6, branches: 3 }, 'winter weather');
  P('snowflake', 'Simple flake', { arms: 6, branches: 1, tips: 0 }, 'winter weather');
  P('snowflake', 'Eight point flake', { arms: 8, branches: 4, tips: 10 }, 'winter weather');

  P('rainbow', 'Rainbow', { bands: 5 }, 'weather sky');
  P('rainbow', 'Wide rainbow', { bands: 7, gap: 5, clouds: 0 }, 'weather sky');
  P('rainbow', 'Arc pair', { bands: 2, gap: 10 }, 'weather sky');

  P('hills', 'Hills', { layers: 3, bumps: 2 }, 'landscape');
  P('hills', 'Deep hills', { layers: 5, bumps: 3, sun: 0 }, 'landscape');
  P('hills', 'Sunset hills', { layers: 2, bumps: 1 }, 'landscape');

  P('forest', 'Pine forest', { trees: 6, kind: 0 }, 'landscape trees');
  P('forest', 'Mixed forest', { trees: 8, kind: 2, vary: 44 }, 'landscape trees');
  P('forest', 'Tree row', { trees: 4, kind: 1, vary: 10 }, 'landscape trees');

  P('stones', 'Stone stack', { stones: 4 }, 'zen balance');
  P('stones', 'Tall cairn', { stones: 7, wob: 14 }, 'zen balance');
  P('stones', 'Two stones', { stones: 2, wob: 40 }, 'zen balance');

  P('constellation', 'Constellation', { stars: 7 }, 'night sky stars');
  P('constellation', 'Star field', { stars: 5, lines: 0, extra: 34 }, 'night sky stars');
  P('constellation', 'Seven stars', { stars: 7, extra: 0 }, 'night sky stars');

  P('moonphase', 'Moon phases', { phases: 5 }, 'night sky');
  P('moonphase', 'Full cycle', { phases: 8, size: 20 }, 'night sky');

  P('berry', 'Berry branch', { berries: 7, leaves: 3 }, 'plant fruit');
  P('berry', 'Heavy berries', { berries: 12, leaves: 5 }, 'plant fruit');

  P('pinecone', 'Pine cone', { rows: 6 }, 'plant winter');
  P('pinecone', 'Long cone', { rows: 9, perRow: 4 }, 'plant winter');

  P('calendar', 'Calendar', { cols: 5, rows: 4, marked: 1 }, 'date time');
  P('calendar', 'Busy month', { cols: 7, rows: 5, marked: 5 }, 'date time');

  P('clipboard', 'Clipboard', { lines: 4 }, 'list notes');
  P('clipboard', 'Checked off', { lines: 6, ticks: 4 }, 'list notes');

  P('mappin', 'Map pin', { kind: 0 }, 'location place');
  P('mappin', 'Flag', { kind: 1 }, 'location place');
  P('mappin', 'Signpost', { kind: 2 }, 'location place');

  P('balloon', 'Balloons', { count: 3 }, 'party');
  P('balloon', 'Single balloon', { count: 1 }, 'party');
  P('balloon', 'Bunch', { count: 5, spread: 62 }, 'party');

  P('lantern', 'Paper lantern', { kind: 0 }, 'light');
  P('lantern', 'Lamp', { kind: 1 }, 'light');

  /* resolve + append */
  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.id = 'q' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
  window.SCRAWL.PRESET_CATS = [...new Set(PRESETS.map(e => e.cat))];
})();
