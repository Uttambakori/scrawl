/* ============================================================
   MOTIFS / kalamkari-presets — the browsable Srikalahasti library
   ------------------------------------------------------------
   Kalamkari is floral first: the paisley, the flowering tree,
   the lotus, the leaf spray. Birds and animals walk through it.
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }
  const NESTED = 0, FLOWERED = 1, VEINED = 2, STIPPLED = 3, PLAIN = 4;

  /* ---- paisley ---- */
  P('kPaisley', 'Paisley', { kind: NESTED }, 'paisley kalka buta mango');
  P('kPaisley', 'Flowered paisley', { kind: FLOWERED }, 'paisley kalka flower');
  P('kPaisley', 'Hatched paisley', { kind: VEINED }, 'paisley kalka');
  P('kPaisley', 'Stippled paisley', { kind: STIPPLED }, 'paisley kalka dots');
  P('kPaisley', 'Plain paisley', { kind: PLAIN, fringe: 0 }, 'paisley kalka simple');
  P('kPaisley', 'Indigo paisley', { kind: NESTED, tone: 1 }, 'paisley indigo blue');
  P('kPaisley', 'Paisley pair', { kind: NESTED, lay: 1 }, 'paisley pair yin');
  P('kPaisley', 'Stippled pair', { kind: STIPPLED, lay: 1, tone: 1 }, 'paisley pair');
  P('kPaisley', 'Paisley rosette', { kind: NESTED, lay: 2 }, 'paisley four rosette');
  P('kPaisley', 'Flowered rosette', { kind: FLOWERED, lay: 2, tone: 1 }, 'paisley four rosette');
  P('kPaisley', 'Paisley on a vine', { kind: FLOWERED, lay: 3 }, 'paisley vine creeper');
  P('kPaisley', 'Indigo on a vine', { kind: NESTED, lay: 3, tone: 1 }, 'paisley vine indigo');

  /* ---- flora ---- */
  P('kFlower', 'Rosette', { kind: 0 }, 'flower rosette phool');
  P('kFlower', 'Indigo rosette', { kind: 0, tone: 1 }, 'flower rosette indigo');
  P('kFlower', 'Lotus', { kind: 1 }, 'lotus padma flower');
  P('kFlower', 'Indigo lotus', { kind: 1, tone: 1 }, 'lotus indigo');
  P('kFlower', 'Carnation', { kind: 2 }, 'carnation flower');
  P('kFlower', 'Indigo carnation', { kind: 2, tone: 1 }, 'carnation indigo');
  P('kFlower', 'Poppy', { kind: 3 }, 'poppy flower');
  P('kFlower', 'Pomegranate', { kind: 4 }, 'pomegranate anar fruit');
  P('kFlower', 'Mango', { kind: 5 }, 'mango aam keri fruit');
  P('kFlower', 'Indigo mango', { kind: 5, tone: 1 }, 'mango fruit indigo');
  P('kFlower', 'Bud', { kind: 6 }, 'bud flower stem');
  P('kFlower', 'Indigo bud', { kind: 6, tone: 1 }, 'bud indigo');

  P('kLeaf', 'Leaf spray', {}, 'leaf spray branch');
  P('kLeaf', 'Indigo spray', { tone: 0 }, 'leaf spray indigo');
  P('kLeaf', 'Madder spray', { tone: 1, detail: 2 }, 'leaf spray red');
  P('kLeaf', 'Echo spray', { detail: 4, leaves: 5 }, 'leaf spray');
  P('kLeaf', 'Long spray', { leaves: 11, bud: 0 }, 'leaf spray long');
  P('kLeaf', 'Hatched spray', { detail: 3, leaves: 6 }, 'leaf spray hatch');

  /* ---- birds ---- */
  P('kBird', 'Peacock', { kind: 0 }, 'peacock mayura bird');
  P('kBird', 'Madder peacock', { kind: 0, tone: 1, feathers: 9 }, 'peacock bird red');
  P('kBird', 'Peacock facing left', { kind: 0, dir: 1 }, 'peacock bird left');
  P('kBird', 'Parrot', { kind: 1 }, 'parrot chiluka bird');
  P('kBird', 'Madder parrot', { kind: 1, tone: 1, dir: 1 }, 'parrot bird red');
  P('kBird', 'Swan', { kind: 2 }, 'swan hamsa bird water');
  P('kBird', 'Madder swan', { kind: 2, tone: 1 }, 'swan bird');
  P('kBird', 'Rooster', { kind: 3 }, 'rooster cock kodi bird');
  P('kBird', 'Madder rooster', { kind: 3, tone: 1, dir: 1 }, 'rooster bird');
  P('kBird', 'Bird in flight', { kind: 4 }, 'bird flying wings');

  P('kBirds', 'Pair of peacocks', { kind: 0 }, 'peacock pair birds');
  P('kBirds', 'Pair of parrots', { kind: 1 }, 'parrot pair birds');
  P('kBirds', 'Pair of swans', { kind: 2 }, 'swan pair birds');
  P('kBirds', 'Pair of roosters', { kind: 3, flower: 0 }, 'rooster pair birds');

  /* ---- animals ---- */
  P('kBeast', 'Elephant', { kind: 0 }, 'elephant enugu');
  P('kBeast', 'Madder elephant', { kind: 0, tone: 1 }, 'elephant red');
  P('kBeast', 'Elephant facing left', { kind: 0, dir: 1 }, 'elephant left');
  P('kBeast', 'Horse', { kind: 1 }, 'horse gurram');
  P('kBeast', 'Madder horse', { kind: 1, tone: 1, dir: 1 }, 'horse red');
  P('kBeast', 'Lion', { kind: 2 }, 'lion simham');
  P('kBeast', 'Madder lion', { kind: 2, tone: 1 }, 'lion red');
  P('kBeast', 'Deer', { kind: 3 }, 'deer jinka');
  P('kBeast', 'Madder deer', { kind: 3, tone: 1, dir: 1 }, 'deer red');

  /* ---- compositions ---- */
  P('kTree', 'Tree of life', {}, 'tree life palampore hillock');
  P('kTree', 'Bare tree of life', { birds: 0 }, 'tree life palampore');
  P('kTree', 'Small tree of life', { branches: 3 }, 'tree small');
  P('kTree', 'Great tree of life', { branches: 8 }, 'tree large palampore');

  P('kMedallion', 'Medallion', {}, 'medallion roundel mandala paisley');
  P('kMedallion', 'Indigo medallion', { tone: 1 }, 'medallion roundel indigo');
  P('kMedallion', 'Open medallion', { petals: 0, paisleys: 6 }, 'medallion roundel');
  P('kMedallion', 'Fine medallion', { paisleys: 14 }, 'medallion roundel fine');

  P('kArch', 'Arch with vase', { inside: 0 }, 'arch mihrab vase flowers');
  P('kArch', 'Arch with tree', { inside: 1 }, 'arch mihrab tree life');
  P('kArch', 'Empty arch', { inside: 2, cusps: 5 }, 'arch mihrab frame');

  /* ---- borders ---- */
  P('kBorder', 'Paisley border', { kind: 0, repeat: 10 }, 'border band paisley');
  P('kBorder', 'Flower border', { kind: 1, repeat: 12 }, 'border band flower rosette');
  P('kBorder', 'Leaf chain', { kind: 2, repeat: 12 }, 'border band leaf');
  P('kBorder', 'Arch border', { kind: 3, repeat: 12 }, 'border band arch scallop');
  P('kBorder', 'Mango border', { kind: 4, repeat: 10 }, 'border band mango');
  P('kBorder', 'Triangle border', { kind: 5, repeat: 16 }, 'border band triangle temple');
  P('kBorder', 'Vine border', { kind: 6, repeat: 8 }, 'border band vine creeper');
  P('kBorder', 'Dot border', { kind: 7, repeat: 24, height: 40, edge: 0 }, 'border band dots');
  P('kBorder', 'Deep paisley border', { kind: 0, repeat: 7, height: 90 }, 'border band paisley');

  P('kFrame', 'Flower frame', { kind: 1, repeat: 7 }, 'frame border flower');
  P('kFrame', 'Paisley frame', { kind: 0, repeat: 6 }, 'frame border paisley');
  P('kFrame', 'Vine frame', { kind: 6, repeat: 6, depth: 8 }, 'frame border vine');
  P('kFrame', 'Arch frame', { kind: 3, repeat: 9 }, 'frame border arch');
  P('kFrame', 'Leaf frame', { kind: 2, repeat: 8, depth: 8 }, 'frame border leaf');
  P('kFrame', 'Triangle frame', { kind: 5, repeat: 12, depth: 7 }, 'frame border triangle');

  P('kField', 'Paisley butis', { kind: 0 }, 'buti pattern paisley yardage');
  P('kField', 'Flower butis', { kind: 1 }, 'buti pattern flower');
  P('kField', 'Leaf butis', { kind: 2, dens: 16 }, 'buti pattern leaf');
  P('kField', 'Mango butis', { kind: 3 }, 'buti pattern mango');
  P('kField', 'Dot butis', { kind: 4, dens: 12 }, 'buti pattern dots');
  P('kField', 'Large paisley butis', { kind: 0, dens: 32, alternate: 0 }, 'buti pattern paisley');

  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.style = g.style; e.id = 'kk' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
})();
