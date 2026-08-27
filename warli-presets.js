/* ============================================================
   MOTIFS / warli-presets — the browsable Warli library
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }

  /* ---- figures ---- */
  P('wFigure', 'Standing', { pose: 0 }, 'person figure');
  P('wFigure', 'Walking', { pose: 1 }, 'person figure');
  P('wFigure', 'Running', { pose: 2 }, 'person figure');
  P('wFigure', 'Dancing', { pose: 3 }, 'person figure dance');
  P('wFigure', 'Sitting', { pose: 4 }, 'person figure');
  P('wFigure', 'Working', { pose: 5, lean: 12 }, 'person figure farm');
  P('wFigure', 'Arms out', { pose: 6 }, 'person figure');
  P('wFigure', 'Waving', { pose: 7 }, 'person figure');
  P('wFigure', 'Pointing', { pose: 8 }, 'person figure');
  P('wFigure', 'Leaping', { pose: 9 }, 'person figure jump dance');
  P('wFigure', 'Woman with top knot', { pose: 0, knot: 1 }, 'person figure woman');
  P('wFigure', 'Dancer with knot', { pose: 3, knot: 1 }, 'person figure dance woman');
  P('wFigure', 'Water carrier', { pose: 0, prop: 1, knot: 1 }, 'person pot water woman');
  P('wFigure', 'Walking with a pot', { pose: 1, prop: 1, knot: 1 }, 'person pot water woman');
  P('wFigure', 'With a staff', { pose: 0, prop: 2 }, 'person stick herder');
  P('wFigure', 'Drummer', { pose: 0, prop: 3 }, 'person drum dhol music');
  P('wFigure', 'Tarpa player', { pose: 0, prop: 4 }, 'person tarpa music');
  P('wFigure', 'Archer', { pose: 8, prop: 5 }, 'person bow hunt');
  P('wFigure', 'Basket on the head', { pose: 1, prop: 6 }, 'person basket carry');
  P('wFigure', 'Mother and child', { pose: 0, prop: 7, knot: 1 }, 'person child woman');
  P('wFigure', 'With an axe', { pose: 0, prop: 8 }, 'person axe wood');
  P('wFigure', 'With a sickle', { pose: 5, prop: 9, lean: 10 }, 'person sickle harvest');
  P('wFigure', 'Leaning into the wind', { pose: 1, lean: 22 }, 'person figure');

  P('wChain', 'Human chain', { people: 5, pose: 1 }, 'dance chain people');
  P('wChain', 'Long chain', { people: 9, pose: 1 }, 'dance chain people');
  P('wChain', 'Standing row', { people: 4, pose: 0, joined: 0 }, 'people row');
  P('wChain', 'Swaying chain', { people: 7, pose: 1, alt: 1 }, 'dance chain people');
  P('wChain', 'Walking line', { people: 6, pose: 2, joined: 0 }, 'people walk row');

  P('wDrum', 'Drummers', { players: 3, kind: 0 }, 'music drum dhol');
  P('wDrum', 'Tarpa players', { players: 3, kind: 1 }, 'music tarpa');
  P('wDrum', 'The band', { players: 5, kind: 2 }, 'music drum tarpa');

  /* ---- compositions ---- */
  P('wTarpa', 'Tarpa dance', { dancers: 12, rings: 1 }, 'dance circle music');
  P('wTarpa', 'Double ring dance', { dancers: 18, rings: 2 }, 'dance circle music');
  P('wTarpa', 'Great spiral', { dancers: 24, rings: 3, player: 0 }, 'dance circle music');
  P('wTarpa', 'Ring without player', { dancers: 10, rings: 1, player: 0 }, 'dance circle');
  P('wTarpa', 'Small ring', { dancers: 7, rings: 1 }, 'dance circle');

  P('wChauk', 'Devchauk', { bands: 2, inside: 0 }, 'sacred square goddess palaghata');
  P('wChauk', 'Palaghata', { bands: 1, inside: 0, teeth: 22 }, 'goddess mother palaghata');
  P('wChauk', 'Wedding chauk', { bands: 2, inside: 4 }, 'sacred square horse panchsirya wedding');
  P('wChauk', 'Marriage couple', { bands: 2, inside: 5 }, 'sacred square wedding couple');
  P('wChauk', 'Empty chauk', { bands: 2, inside: 1 }, 'sacred square frame');
  P('wChauk', 'Sun chauk', { bands: 3, inside: 2 }, 'sacred square sun');
  P('wChauk', 'Tree chauk', { bands: 1, inside: 3 }, 'sacred square tree');

  P('wScene', 'Village field', { density: 14 }, 'scene village wall composition');
  P('wScene', 'Crowded wall', { density: 26 }, 'scene village wall composition');
  P('wScene', 'A gathering', { density: 16, mix: 1 }, 'scene people composition');
  P('wScene', 'The herd', { density: 12, mix: 2 }, 'scene animals composition');
  P('wScene', 'Huts and trees', { density: 10, mix: 3 }, 'scene village composition');
  P('wScene', 'Terraced field', { density: 18, ground: 1 }, 'scene village farm composition');

  P('wHunt', 'The hunt', { hunters: 2, quarry: 0 }, 'hunt deer bow forest');
  P('wHunt', 'Tiger hunt', { hunters: 3, quarry: 2 }, 'hunt tiger waghoba forest');

  /* ---- nature ---- */
  P('wTree', 'Branching tree', { kind: 0 }, 'tree nature');
  P('wTree', 'Conical tree', { kind: 1 }, 'tree nature');
  P('wTree', 'Palm', { kind: 2 }, 'tree nature palm');
  P('wTree', 'Fruiting tree', { kind: 3 }, 'tree nature fruit mango');
  P('wTree', 'Tree with birds', { kind: 0, life: 1 }, 'tree nature bird');
  P('wTree', 'Monkeys in a tree', { kind: 0, life: 2 }, 'tree nature monkey');
  P('wTree', 'Sapling', { kind: 1, size: 48 }, 'tree nature plant');

  P('wSun', 'Sun', { kind: 0, rays: 12 }, 'sun sky');
  P('wSun', 'Fine sun', { kind: 0, rays: 20, size: 56 }, 'sun sky');
  P('wSun', 'Moon', { kind: 1 }, 'moon sky night crescent');
  P('wSun', 'Sun and moon', { kind: 2, rays: 14 }, 'sun moon sky');

  P('wHill', 'Hills', { peaks: 3 }, 'landscape hill');
  P('wHill', 'Range', { peaks: 6, height: 62 }, 'landscape hill mountain');
  P('wHill', 'Hill with sun', { peaks: 2, sun: 1 }, 'landscape hill sun');

  P('wRiver', 'River', { lines: 3, waves: 5 }, 'water river');
  P('wRiver', 'Wide water', { lines: 6, waves: 4 }, 'water river sea');
  P('wRiver', 'River with fish', { lines: 3, waves: 5, life: 1 }, 'water river fish');
  P('wRiver', 'The crossing', { lines: 4, waves: 4, life: 2 }, 'water river boat');

  /* ---- animals ---- */
  P('wAnimal', 'Cow', { kind: 0 }, 'animal cattle');
  P('wAnimal', 'Bull', { kind: 1 }, 'animal cattle');
  P('wAnimal', 'Goat', { kind: 2 }, 'animal');
  P('wAnimal', 'Deer', { kind: 3 }, 'animal forest');
  P('wAnimal', 'Elephant', { kind: 4 }, 'animal');
  P('wAnimal', 'Dog', { kind: 5, size: 56 }, 'animal');
  P('wAnimal', 'Horse', { kind: 6 }, 'animal');
  P('wAnimal', 'Tiger', { kind: 7 }, 'animal waghoba forest');
  P('wAnimal', 'Cow and calf', { kind: 0, calf: 1 }, 'animal cattle');
  P('wAnimal', 'Rider on a horse', { kind: 6, rider: 1 }, 'animal horse rider');

  P('wBird', 'Bird', { kind: 0 }, 'bird');
  P('wBird', 'Peacock', { kind: 1, feathers: 12 }, 'bird peacock');
  P('wBird', 'Wide peacock', { kind: 1, feathers: 19 }, 'bird peacock');
  P('wBird', 'Hen', { kind: 2 }, 'bird hen cock');
  P('wBird', 'Bird in flight', { kind: 3 }, 'bird flying');
  P('wBird', 'Flock', { kind: 4 }, 'bird flock birds');

  P('wFish', 'Fish', { count: 1, size: 80 }, 'fish water');
  P('wFish', 'Three fish', { count: 3 }, 'fish water pattern');
  P('wFish', 'Shoal', { count: 6, size: 44, lay: 2 }, 'fish water pattern');
  P('wFish', 'Rising fish', { count: 4, size: 50, lay: 1 }, 'fish water');

  /* ---- village ---- */
  P('wHut', 'Hut', { roof: 0 }, 'house village');
  P('wHut', 'Gabled hut', { roof: 1 }, 'house village');
  P('wHut', 'Round roof hut', { roof: 2 }, 'house village');
  P('wHut', 'Three huts', { roof: 0, count: 3 }, 'house village hamlet');

  P('wPot', 'Water pots', { kind: 0, count: 2 }, 'pot water village');
  P('wPot', 'Row of pots', { kind: 0, count: 4 }, 'pot water village');
  P('wPot', 'Carrying yoke', { kind: 1 }, 'pot water village');
  P('wPot', 'Grinding stone', { kind: 2 }, 'work village grain');
  P('wPot', 'Stacked pots', { kind: 3, count: 3 }, 'pot village');
  P('wPot', 'The well', { kind: 4 }, 'well water village');

  P('wLadder', 'Ladder', { kind: 0 }, 'village ladder');
  P('wLadder', 'Fence', { kind: 1, rungs: 9 }, 'village fence');
  P('wLadder', 'Granary', { kind: 2 }, 'village grain store');
  P('wLadder', 'Trap', { kind: 3 }, 'village hunt trap');

  P('wToddy', 'Toddy tapper', {}, 'palm climb village work');
  P('wToddy', 'Tall palm', { height: 100, fronds: 9 }, 'palm climb village work');
  P('wCart', 'Bullock cart', {}, 'cart bullock village');
  P('wCart', 'Loaded cart', { load: 1 }, 'cart bullock village harvest');
  P('wPlough', 'Ploughing', {}, 'farm plough ox village');
  P('wPlough', 'Single ox plough', { two: 0 }, 'farm plough ox village');
  P('wNet', 'Cast net', { kind: 0 }, 'fishing net water');
  P('wNet', 'Net between poles', { kind: 1 }, 'fishing net water');
  P('wNet', 'Basket trap', { kind: 2 }, 'fishing trap water');

  /* ---- borders ---- */
  P('wBorder', 'Triangle border', { kind: 0 }, 'border pattern band');
  P('wBorder', 'Fine triangle border', { kind: 0, repeat: 34 }, 'border pattern band');
  P('wBorder', 'Alternating triangles', { kind: 1 }, 'border pattern band');
  P('wBorder', 'Dot border', { kind: 2 }, 'border pattern band');
  P('wBorder', 'Comb border', { kind: 3, repeat: 30 }, 'border pattern band');
  P('wBorder', 'Zigzag border', { kind: 4 }, 'border pattern band');
  P('wBorder', 'Diamond border', { kind: 5 }, 'border pattern band');
  P('wBorder', 'Chain border', { kind: 6 }, 'border pattern band');
  P('wBorder', 'Wave border', { kind: 7 }, 'border pattern band water');
  P('wBorder', 'Chevron border', { kind: 8 }, 'border pattern band');
  P('wBorder', 'Block border', { kind: 9 }, 'border pattern band');
  P('wBorder', 'Cross border', { kind: 10 }, 'border pattern band');
  P('wBorder', 'Dancing border', { kind: 11 }, 'border pattern band people dance');
  P('wBorder', 'Bird border', { kind: 12 }, 'border pattern band bird');
  P('wBorder', 'Tree border', { kind: 13 }, 'border pattern band tree');
  P('wBorder', 'Fish border', { kind: 14 }, 'border pattern band fish');
  P('wBorder', 'Hut border', { kind: 15 }, 'border pattern band village');
  P('wBorder', 'Double band', { kind: 0, rows: 2, second: 3 }, 'border pattern band');
  P('wBorder', 'Triple band', { kind: 2, rows: 3, second: 1 }, 'border pattern band');
  P('wBorder', 'Dancers over triangles', { kind: 11, rows: 2, second: 1 }, 'border pattern band dance');

  P('wFrame', 'Triangle frame', { kind: 0 }, 'frame border');
  P('wFrame', 'Dot frame', { kind: 1, repeat: 14 }, 'frame border');
  P('wFrame', 'Comb frame', { kind: 2, repeat: 18 }, 'frame border');
  P('wFrame', 'Zigzag frame', { kind: 3, repeat: 12 }, 'frame border');
  P('wFrame', 'Diamond frame', { kind: 4, repeat: 9 }, 'frame border');
  P('wFrame', 'Block frame', { kind: 5, repeat: 12 }, 'frame border');
  P('wFrame', 'Inward teeth', { kind: 0, inward: 1, inset: 12 }, 'frame border');

  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.style = g.style; e.id = 'w' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
  /* every earlier preset belongs to the sketchbook */
  PRESETS.forEach(e => { if (!e.style) e.style = 'sketch'; });
})();
