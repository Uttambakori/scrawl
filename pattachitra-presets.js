/* ============================================================
   MOTIFS / pattachitra-presets — the browsable Odisha library
   ------------------------------------------------------------
   A Pattachitra entry is a subject plus the cloth it wears: the
   same dancer in a striped dhoti and in a buti-sprigged one are
   two entries, the way a painter's pattern books keep them.
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }
  const PLAIN = 0, STRIPES = 1, CHECKS = 2, BUTIS = 3, DOTS = 4, CHEV = 5, SCALES = 6;
  const LATA = 0, PETALS = 1, BEADS = 2, TRI = 3, WAVES = 4, DIAM = 5, LOTUS = 6, LEAVES = 7;

  /* ---- figures ---- */
  P('pFigure', 'Dancer', { pose: 0 }, 'dancer odissi tribhanga figure');
  P('pFigure', 'Flute player', { pose: 1 }, 'flute bansuri musician figure');
  P('pFigure', 'Drummer', { pose: 2 }, 'drum mardala musician figure');
  P('pFigure', 'Devotee', { pose: 3 }, 'folded hands namaskar figure');
  P('pFigure', 'Figure with lotus', { pose: 4 }, 'lotus flower figure');
  P('pFigure', 'White dancer', { pose: 0, skin: 1, cloth: BUTIS }, 'dancer white conch');
  P('pFigure', 'White flute player', { pose: 1, skin: 1, cloth: CHECKS }, 'flute white');
  P('pFigure', 'Checked drummer', { pose: 2, cloth: CHECKS }, 'drum musician');
  P('pFigure', 'Sprigged devotee', { pose: 3, cloth: BUTIS, skin: 1 }, 'devotee buti');
  P('pFigure', 'Chevron dancer', { pose: 0, cloth: CHEV }, 'dancer zigzag');
  P('pFigure', 'Dotted flute player', { pose: 1, cloth: DOTS, dir: 1 }, 'flute left');
  P('pFigure', 'Dancer without plume', { pose: 0, plume: 0, cloth: SCALES }, 'dancer');
  P('pFigure', 'Dancer facing left', { pose: 0, dir: 1 }, 'dancer left');

  P('pMusicians', 'Musicians', { people: 3 }, 'musicians band row procession');
  P('pMusicians', 'Temple procession', { people: 5, cloth: BUTIS }, 'procession row temple');
  P('pMusicians', 'Duet', { people: 2, cloth: CHECKS, ground: 0 }, 'pair duet musicians');
  P('pMusicians', 'Six players', { people: 6, cloth: DOTS }, 'row musicians');

  /* ---- animals ---- */
  P('pBeast', 'Lion', { kind: 0 }, 'lion simha konark rampant');
  P('pBeast', 'White lion', { kind: 0, tone: 1 }, 'lion simha white');
  P('pBeast', 'Lion facing left', { kind: 0, dir: 1 }, 'lion simha left');
  P('pBeast', 'Elephant', { kind: 1 }, 'elephant gaja hathi procession');
  P('pBeast', 'White elephant', { kind: 1, tone: 1, cloth: CHECKS }, 'elephant airavata white');
  P('pBeast', 'Striped elephant', { kind: 1, cloth: STRIPES }, 'elephant');
  P('pBeast', 'Elephant facing left', { kind: 1, dir: 1, cloth: DOTS }, 'elephant left');
  P('pBeast', 'Horse', { kind: 2 }, 'horse ashwa prancing');
  P('pBeast', 'White horse', { kind: 2, tone: 1, cloth: CHEV }, 'horse white');
  P('pBeast', 'Deer', { kind: 3 }, 'deer mriga spotted');
  P('pBeast', 'White deer', { kind: 3, tone: 1 }, 'deer white');
  P('pBeast', 'Cow', { kind: 4 }, 'cow gai kamadhenu');
  P('pBeast', 'White cow', { kind: 4, tone: 1, cloth: STRIPES }, 'cow white');

  P('pPair', 'Facing lions', { kind: 0 }, 'lions pair tree guardian');
  P('pPair', 'Facing elephants', { kind: 1 }, 'elephants pair tree');
  P('pPair', 'Facing deer', { kind: 3 }, 'deer pair tree');
  P('pPair', 'Facing horses', { kind: 2, tree: 0, cloth: CHECKS }, 'horses pair');
  P('pPair', 'Facing cows', { kind: 4, cloth: DOTS }, 'cows pair tree');

  P('pFish', 'Fish', { lay: 0 }, 'fish matsya');
  P('pFish', 'Pair of fish', { lay: 1 }, 'fish pair');
  P('pFish', 'Three fish', { lay: 2 }, 'fish three shoal');
  P('pFish', 'White fish', { lay: 0, tone: 1 }, 'fish white');

  /* ---- birds ---- */
  P('pBird', 'Peacock', { kind: 0 }, 'peacock mayura bird');
  P('pBird', 'Great peacock', { kind: 0, feathers: 11 }, 'peacock mayura bird tail');
  P('pBird', 'White peacock', { kind: 0, tone: 1, dir: 1 }, 'peacock white left');
  P('pBird', 'Parrot', { kind: 1 }, 'parrot suka bird');
  P('pBird', 'White parrot', { kind: 1, tone: 1, dir: 1 }, 'parrot white');
  P('pBird', 'Swan', { kind: 2 }, 'swan hansa bird water');
  P('pBird', 'White swan', { kind: 2, tone: 1 }, 'swan hansa white');
  P('pBird', 'Crane', { kind: 3 }, 'crane bird water');

  /* ---- nature ---- */
  P('pTree', 'Tree', { lobes: 5 }, 'tree kadamba');
  P('pTree', 'Tree with birds', { lobes: 5, birds: 1 }, 'tree parrots birds');
  P('pTree', 'Great tree', { lobes: 8 }, 'tree large canopy');
  P('pTree', 'Small tree', { lobes: 3, fruit: 0 }, 'tree small');

  P('pLotus', 'Lotus', { rings: 2 }, 'lotus padma');
  P('pLotus', 'Great lotus', { rings: 4, petals: 10 }, 'lotus padma mandala');
  P('pLotus', 'White lotus', { rings: 2, tone: 1 }, 'lotus white');
  P('pLotus', 'Simple lotus', { rings: 1, petals: 8 }, 'lotus simple');

  /* ---- compositions ---- */
  P('pWheel', 'Konark wheel', {}, 'wheel chakra konark sun temple chariot');
  P('pWheel', 'Plain wheel', { medallions: 0 }, 'wheel chakra chariot');
  P('pWheel', 'Six-spoked wheel', { spokes: 6, fine: 0 }, 'wheel chakra');
  P('pWheel', 'Twelve-spoked wheel', { spokes: 12, fine: 0 }, 'wheel chakra');

  P('pRingDance', 'Ring dance', { people: 8 }, 'rasa ring circle dance');
  P('pRingDance', 'Small ring dance', { people: 5, cloth: BUTIS }, 'rasa ring dance');
  P('pRingDance', 'Great ring dance', { people: 12, cloth: CHECKS, lotus: 0 }, 'rasa ring dance');

  /* ---- borders ---- */
  P('pBorder', 'Creeper border', { kind: LATA, repeat: 10 }, 'border band lata creeper');
  P('pBorder', 'Petal border', { kind: PETALS, repeat: 14 }, 'border band petals');
  P('pBorder', 'Bead border', { kind: BEADS, repeat: 30, beads: 0, height: 40 }, 'border band beads');
  P('pBorder', 'Triangle border', { kind: TRI, repeat: 18 }, 'border band triangles temple');
  P('pBorder', 'Wave border', { kind: WAVES, repeat: 10 }, 'border band wave');
  P('pBorder', 'Diamond border', { kind: DIAM, repeat: 16 }, 'border band diamond');
  P('pBorder', 'Lotus border', { kind: LOTUS, repeat: 10 }, 'border band lotus');
  P('pBorder', 'Leaf border', { kind: LEAVES, repeat: 12 }, 'border band leaf');
  P('pBorder', 'Deep creeper border', { kind: LATA, repeat: 8, height: 88 }, 'border band lata');
  P('pBorder', 'Bare petal border', { kind: PETALS, repeat: 16, beads: 0 }, 'border band petals');

  P('pFrame', 'Creeper frame', { kind: LATA, repeat: 7 }, 'frame border lata');
  P('pFrame', 'Petal frame', { kind: PETALS, repeat: 9 }, 'frame border petals');
  P('pFrame', 'Triangle frame', { kind: TRI, repeat: 12 }, 'frame border temple');
  P('pFrame', 'Lotus frame', { kind: LOTUS, repeat: 6, depth: 12 }, 'frame border lotus');
  P('pFrame', 'Diamond frame', { kind: DIAM, repeat: 10 }, 'frame border diamond');
  P('pFrame', 'Wave frame', { kind: WAVES, repeat: 7, depth: 8 }, 'frame border wave');
  P('pFrame', 'Deep creeper frame', { kind: LATA, repeat: 5, depth: 16 }, 'frame border lata');

  P('pLata', 'Creeper ground', {}, 'lata background fill creeper pattern');
  P('pLata', 'Fine creeper', { dens: 9 }, 'lata background fine');
  P('pLata', 'Open creeper', { dens: 22, flowers: 0 }, 'lata background');
  P('pLata', 'Yellow creeper', { tone: 1 }, 'lata background yellow');
  P('pLata', 'White creeper', { tone: 2 }, 'lata background white');

  P('pArch', 'Temple arch', {}, 'arch doorway temple frame');
  P('pArch', 'Creeper arch', { kind: LATA, repeat: 12 }, 'arch doorway lata');
  P('pArch', 'Bare arch', { kind: TRI, repeat: 20, pillars: 0 }, 'arch doorway');

  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.style = g.style; e.id = 'pc' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
})();
