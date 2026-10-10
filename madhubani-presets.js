/* ============================================================
   MOTIFS / madhubani-presets — the browsable Mithila library
   ------------------------------------------------------------
   A Madhubani entry is a subject plus a way of filling the
   double line. The same fish in kachni (hatched, black and red)
   and in bharni (solid colour) are two entries on purpose: they
   are the two schools of the tradition, not two colourways.
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }
  /* channel and interior indices, so the entries below read as words */
  const HATCHED = 0, SOLID = 1, DOTTED = 2, TEETH = 3, TRIPLE = 4, OPEN = 5, SINGLE = 6;
  const COLOUR = 0, HATCH = 1, CROSS = 2, SCALES = 3, DOTS = 4, FLORETS = 5, WAVES = 6, PLAIN = 7;
  const kachni = 'kachni line black red', bharni = 'bharni colour';

  /* ---- figures ---- */
  P('mFigure', 'Mithila woman', { pose: 0 }, 'woman figure lady ' + bharni);
  P('mFigure', 'Water carrier', { pose: 1 }, 'woman pot water kalash');
  P('mFigure', 'Offering a lamp', { pose: 2 }, 'woman diya lamp puja');
  P('mFigure', 'Dancer', { pose: 3 }, 'woman dance');
  P('mFigure', 'Woman with lotus', { pose: 4 }, 'woman flower lotus');
  P('mFigure', 'Woman with fan', { pose: 5 }, 'woman fan pankha');
  P('mFigure', 'Kachni woman', { pose: 0, fill: HATCH, band: HATCHED }, 'woman ' + kachni);
  P('mFigure', 'Kachni water carrier', { pose: 1, fill: CROSS, band: HATCHED }, 'woman pot ' + kachni);
  P('mFigure', 'Kachni dancer', { pose: 3, fill: HATCH, band: TRIPLE }, 'woman dance ' + kachni);
  P('mFigure', 'Flowered woman', { pose: 4, fill: FLORETS, tint: 1 }, 'woman flower pattern');
  P('mFigure', 'Dotted woman', { pose: 2, fill: DOTS, tint: 1, band: DOTTED }, 'woman dots godna');
  P('mFigure', 'Scaled dancer', { pose: 3, fill: SCALES, tint: 1, band: SOLID }, 'woman dance');
  P('mFigure', 'Woman facing left', { pose: 1, dir: 1 }, 'woman pot left');
  P('mFigure', 'Outline woman', { pose: 0, fill: PLAIN, band: OPEN }, 'woman outline plain');

  P('mCouple', 'Bride and groom', {}, 'wedding couple marriage vivah dulha dulhan');
  P('mCouple', 'Kachni couple', { fill: HATCH }, 'wedding couple ' + kachni);
  P('mCouple', 'Flowered couple', { fill: FLORETS, tint: 1, band: DOTTED }, 'wedding couple');
  P('mCouple', 'Couple without garland', { garland: 0, band: SOLID }, 'wedding couple');

  P('mProcession', 'Procession', { people: 4 }, 'women row people festival');
  P('mProcession', 'Water carriers', { people: 4, pose: 2 }, 'women pots row');
  P('mProcession', 'Dancers in a row', { people: 5, pose: 4, fill: HATCH }, 'women dance row ' + kachni);
  P('mProcession', 'Lamp bearers', { people: 3, pose: 3, band: DOTTED }, 'women diya row puja');
  P('mProcession', 'Long procession', { people: 7, pose: 0, fill: SCALES, ground: 0 }, 'women row');

  /* ---- animals ---- */
  P('mFish', 'Fish', { kind: 0 }, 'fish machh auspicious');
  P('mFish', 'Pair of fish', { kind: 0, lay: 1 }, 'fish pair wedding fertility');
  P('mFish', 'Circling fish', { kind: 0, lay: 2 }, 'fish pair circle wedding');
  P('mFish', 'Shoal', { kind: 1, lay: 3 }, 'fish shoal river');
  P('mFish', 'Slim fish', { kind: 1 }, 'fish');
  P('mFish', 'Round fish', { kind: 2, fill: CROSS }, 'fish');
  P('mFish', 'Kachni fish', { kind: 0, fill: HATCH, band: HATCHED }, 'fish ' + kachni);
  P('mFish', 'Kachni pair', { kind: 1, lay: 1, fill: CROSS }, 'fish pair ' + kachni);
  P('mFish', 'Dotted fish', { kind: 0, fill: DOTS, band: DOTTED }, 'fish dots');
  P('mFish', 'Flowered fish', { kind: 2, fill: FLORETS, band: SOLID }, 'fish flower');
  P('mFish', 'Toothed fish', { kind: 0, band: TEETH, fill: SCALES }, 'fish');
  P('mFish', 'Wave fish', { kind: 1, lay: 2, fill: WAVES }, 'fish pair water');

  P('mBeast', 'Elephant', { kind: 0 }, 'elephant hathi');
  P('mBeast', 'Elephant with rider', { kind: 0, rider: 1 }, 'elephant hathi rider procession');
  P('mBeast', 'Kachni elephant', { kind: 0, fill: HATCH }, 'elephant ' + kachni);
  P('mBeast', 'Flowered elephant', { kind: 0, fill: FLORETS, tint: 1, band: DOTTED }, 'elephant flower');
  P('mBeast', 'Horse', { kind: 1 }, 'horse ghoda');
  P('mBeast', 'Horse and rider', { kind: 1, rider: 1 }, 'horse ghoda groom baraat');
  P('mBeast', 'Kachni horse', { kind: 1, fill: CROSS }, 'horse ' + kachni);
  P('mBeast', 'Tiger', { kind: 2 }, 'tiger bagh');
  P('mBeast', 'Deer', { kind: 3 }, 'deer hiran');
  P('mBeast', 'Dotted deer', { kind: 3, fill: DOTS, band: DOTTED }, 'deer spotted');
  P('mBeast', 'Cow', { kind: 4 }, 'cow gai');
  P('mBeast', 'Kachni cow', { kind: 4, fill: HATCH }, 'cow ' + kachni);
  P('mBeast', 'Elephant facing left', { kind: 0, dir: 1, band: SOLID }, 'elephant hathi left');

  P('mTurtle', 'Turtle', {}, 'turtle kachhua');
  P('mTurtle', 'Pair of turtles', { count: 2 }, 'turtle kachhua pair');
  P('mTurtle', 'Kachni turtle', { fill: CROSS }, 'turtle ' + kachni);
  P('mTurtle', 'Flowered turtle', { fill: FLORETS, band: SOLID }, 'turtle flower');

  P('mSnake', 'Serpent', { lay: 0 }, 'snake naag serpent');
  P('mSnake', 'Coiled serpent', { lay: 1 }, 'snake coil');
  P('mSnake', 'Naga', { lay: 2 }, 'snake naag cobra hood');
  P('mSnake', 'Kachni serpent', { lay: 0, fill: HATCH, waves: 4 }, 'snake ' + kachni);
  P('mSnake', 'Scaled serpent', { lay: 0, fill: SCALES, band: SOLID, waves: 2 }, 'snake');

  /* ---- birds ---- */
  P('mBird', 'Parrot', { kind: 0 }, 'parrot suga tota bird');
  P('mBird', 'Kachni parrot', { kind: 0, fill: HATCH }, 'parrot bird ' + kachni);
  P('mBird', 'Parrot facing left', { kind: 0, dir: 1, band: SOLID }, 'parrot bird');
  P('mBird', 'Maina', { kind: 1 }, 'maina myna bird');
  P('mBird', 'Dotted maina', { kind: 1, fill: DOTS, tint: 1 }, 'maina bird dots');
  P('mBird', 'Crane', { kind: 2 }, 'crane bagula bird water');
  P('mBird', 'Duck', { kind: 3 }, 'duck hans bird water');
  P('mBird', 'Flying bird', { kind: 4 }, 'bird flying wings');
  P('mBird', 'Scaled bird', { kind: 4, fill: SCALES, tint: 1 }, 'bird flying');

  P('mPeacock', 'Peacock', { tail: 0 }, 'peacock mor bird');
  P('mPeacock', 'Peacock in display', { tail: 1, feathers: 11 }, 'peacock mor fan');
  P('mPeacock', 'Kachni peacock', { tail: 0, fill: HATCH }, 'peacock ' + kachni);
  P('mPeacock', 'Great peacock', { tail: 1, feathers: 15, band: SOLID }, 'peacock mor fan');
  P('mPeacock', 'Peacock facing left', { tail: 0, dir: 1, band: DOTTED }, 'peacock mor');

  P('mBirds', 'Pair of parrots', { kind: 0 }, 'parrot pair birds love');
  P('mBirds', 'Pair of peacocks', { kind: 1 }, 'peacock pair birds');
  P('mBirds', 'Pair of mainas', { kind: 2, fill: DOTS, tint: 1 }, 'maina pair birds');
  P('mBirds', 'Pair of cranes', { kind: 3, flower: 0 }, 'crane pair birds');

  /* ---- nature ---- */
  P('mTree', 'Tree of life', {}, 'tree life kalpavriksha parrots');
  P('mTree', 'Kachni tree', { fill: HATCH, band: HATCHED }, 'tree ' + kachni);
  P('mTree', 'Bare tree of life', { birds: 0, flowers: 0 }, 'tree');
  P('mTree', 'Small tree', { branches: 3, birds: 0 }, 'tree sapling');
  P('mTree', 'Great tree', { branches: 8, band: SOLID }, 'tree large');

  P('mBamboo', 'Bamboo grove', { stalks: 3 }, 'bamboo bans grove kohbar');
  P('mBamboo', 'Single bamboo', { stalks: 1 }, 'bamboo bans');
  P('mBamboo', 'Dense bamboo', { stalks: 6, fill: CROSS }, 'bamboo bans grove');

  P('mLotus', 'Lotus', { view: 0 }, 'lotus kamal flower');
  P('mLotus', 'Lotus from above', { view: 1, rings: 3 }, 'lotus kamal mandala');
  P('mLotus', 'Lotus bud', { view: 2 }, 'lotus bud');
  P('mLotus', 'Kachni lotus', { view: 0, fill: HATCH }, 'lotus ' + kachni);
  P('mLotus', 'Great lotus ring', { view: 1, rings: 4, petals: 10, band: SOLID }, 'lotus kamal mandala kohbar');
  P('mLotus', 'Open lotus ring', { view: 1, rings: 2, petals: 7, fill: CROSS }, 'lotus mandala');
  P('mLotus', 'Lotus without pads', { view: 0, leaves: 0, band: DOTTED }, 'lotus flower');

  P('mSky', 'Sun', { kind: 0 }, 'sun surya face sky');
  P('mSky', 'Moon', { kind: 1 }, 'moon chand face night');
  P('mSky', 'Sun and moon', { kind: 2 }, 'sun moon sky');
  P('mSky', 'Kachni sun', { kind: 0, band: HATCHED, rays: 20 }, 'sun ' + kachni);
  P('mSky', 'Blazing sun', { kind: 0, rays: 26, band: TEETH }, 'sun rays');
  P('mSky', 'Hatched moon', { kind: 1, fill: HATCH }, 'moon ' + kachni);

  P('mFlower', 'Rosette', { kind: 0 }, 'flower phool rosette filler');
  P('mFlower', 'Flower bud', { kind: 1 }, 'flower bud filler');
  P('mFlower', 'Leaf spray', { kind: 2 }, 'leaf plant filler');
  P('mFlower', 'Star flower', { kind: 3, petals: 10 }, 'flower star filler');
  P('mFlower', 'Kalash', { kind: 4 }, 'kalash pot ritual puja');
  P('mFlower', 'Diya', { kind: 5 }, 'diya lamp puja');
  P('mFlower', 'Kachni rosette', { kind: 0, fill: HATCH, petals: 10 }, 'flower ' + kachni);

  /* ---- compositions ---- */
  P('mKohbar', 'Kohbar', {}, 'kohbar marriage chamber wedding lotus bamboo');
  P('mKohbar', 'Kachni kohbar', { fill: HATCH, band: HATCHED }, 'kohbar wedding ' + kachni);
  P('mKohbar', 'Kohbar without frame', { frame: 0, band: SOLID }, 'kohbar wedding');

  P('mPond', 'Lotus pond', {}, 'pond lotus fish water pokhar');
  P('mPond', 'Fish pond', { lotus: 1, fish: 5 }, 'pond fish water');
  P('mPond', 'Still pond', { fish: 0, lotus: 4, turtle: 0 }, 'pond lotus');

  P('mRoundel', 'Lotus mandala', {}, 'mandala lotus circle roundel');
  P('mRoundel', 'Kachni mandala', { fill: HATCH, band: HATCHED }, 'mandala ' + kachni);
  P('mRoundel', 'Open mandala', { rings: 2, border: 0 }, 'mandala lotus');
  P('mRoundel', 'Fine mandala', { rings: 4, petals: 14, band: SOLID }, 'mandala lotus');

  /* ---- borders ---- */
  P('mBorder', 'Hatched border', { kind: 0, repeat: 16 }, 'border band ' + kachni);
  P('mBorder', 'Teeth border', { kind: 1, repeat: 18 }, 'border band triangle zigzag');
  P('mBorder', 'Petal border', { kind: 2, repeat: 14 }, 'border band lotus petal');
  P('mBorder', 'Vine border', { kind: 3, repeat: 10 }, 'border band leaf creeper bel');
  P('mBorder', 'Scallop border', { kind: 4, repeat: 14 }, 'border band arch');
  P('mBorder', 'Loop border', { kind: 5, repeat: 16 }, 'border band chain');
  P('mBorder', 'Check border', { kind: 6, repeat: 20 }, 'border band checker');
  P('mBorder', 'Fish border', { kind: 7, repeat: 8 }, 'border band fish');
  P('mBorder', 'Bud border', { kind: 8, repeat: 16 }, 'border band bud flower');
  P('mBorder', 'Deep petal border', { kind: 2, repeat: 10, height: 86, band: SOLID }, 'border band lotus');

  P('mFrame', 'Teeth frame', { kind: 1, repeat: 10 }, 'frame border triangle');
  P('mFrame', 'Petal frame', { kind: 2, repeat: 8 }, 'frame border lotus');
  P('mFrame', 'Vine frame', { kind: 3, repeat: 6 }, 'frame border leaf creeper');
  P('mFrame', 'Hatched frame', { kind: 0, repeat: 10, depth: 6 }, 'frame border ' + kachni);
  P('mFrame', 'Fish frame', { kind: 7, repeat: 5, depth: 10 }, 'frame border fish');
  P('mFrame', 'Scallop frame', { kind: 4, repeat: 9 }, 'frame border arch');
  P('mFrame', 'Check frame', { kind: 6, repeat: 12, depth: 6 }, 'frame border checker');

  P('mField', 'Hatch field', { fill: 0 }, 'pattern fill ' + kachni);
  P('mField', 'Cross-hatch field', { fill: 1, dens: 4 }, 'pattern fill ' + kachni);
  P('mField', 'Scale field', { fill: 2, dens: 7 }, 'pattern fill fish scales');
  P('mField', 'Dot field', { fill: 3, dens: 5 }, 'pattern fill dots godna');
  P('mField', 'Floret field', { fill: 4, dens: 9, tint: 1 }, 'pattern fill flower');
  P('mField', 'Wave field', { fill: 5, dens: 7, ang: 0 }, 'pattern fill water');

  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.style = g.style; e.id = 'mb' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
})();
