/* ============================================================
   MOTIFS / gond-presets — the browsable Gond library
   ------------------------------------------------------------
   A Gond preset is a subject plus a signature. The same deer
   under four different fills is four entries here on purpose:
   in this tradition the fill is not decoration applied to a
   drawing, it is the part that says whose drawing it is.
   ============================================================ */
(function () {
  const { GENS, hashStr, PRESETS } = window.SCRAWL;
  const NEW = [];
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('missing gen', gen); return; }
    NEW.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }
  /* signature indices, so the entries below read as words */
  const DOTS = 0, COMB = 1, CRESC = 2, SCALE = 3, SEED = 4, CHEV = 5, DASH = 6, RING = 7, RIPPLE = 8, PLAIN = 9;

  /* ---- figures ---- */
  P('gFigure', 'Standing', { pose: 0, sig: DOTS }, 'person figure');
  P('gFigure', 'Walking', { pose: 1, sig: DOTS }, 'person figure');
  P('gFigure', 'Dancing', { pose: 2, sig: DOTS }, 'person figure dance');
  P('gFigure', 'Seated', { pose: 3, sig: DOTS }, 'person figure sitting');
  P('gFigure', 'Reaching', { pose: 4, sig: DOTS }, 'person figure');
  P('gFigure', 'Water carrier', { pose: 5, sig: DOTS }, 'person pot water');
  P('gFigure', 'Combed figure', { pose: 0, sig: COMB, dens: 4 }, 'person figure line');
  P('gFigure', 'Scaled figure', { pose: 0, sig: SCALE }, 'person figure');
  P('gFigure', 'Seeded figure', { pose: 1, sig: SEED }, 'person figure');
  P('gFigure', 'Rippled figure', { pose: 4, sig: RIPPLE }, 'person figure water');
  P('gFigure', 'Plumed dancer', { pose: 2, sig: CRESC, crown: 1 }, 'person dance headdress crown');
  P('gFigure', 'Plumed elder', { pose: 0, sig: RING, crown: 1 }, 'person headdress crown');
  P('gFigure', 'Outline figure', { pose: 0, sig: PLAIN }, 'person figure plain');

  P('gDancers', 'Two dancers', { people: 2, pose: 0, sig: DOTS }, 'dance people');
  P('gDancers', 'Four dancers', { people: 4, pose: 0, sig: DOTS }, 'dance people');
  P('gDancers', 'Six dancers', { people: 6, pose: 0, sig: CRESC, dens: 4 }, 'dance people');
  P('gDancers', 'Line of figures', { people: 5, pose: 1, sig: COMB, joined: 0 }, 'people row');
  P('gDancers', 'Walking together', { people: 4, pose: 2, sig: SCALE, joined: 0 }, 'people walk');

  /* ---- animals ---- */
  P('gBeast', 'Deer', { kind: 0, sig: DOTS }, 'deer stag forest');
  P('gBeast', 'Dotted deer', { kind: 0, sig: DOTS, dens: 3 }, 'deer stag');
  P('gBeast', 'Combed deer', { kind: 0, sig: COMB, dens: 3 }, 'deer stag');
  /* vertical rake lines ARE stripes — the signature does the work */
  P('gBeast', 'Tiger', { kind: 1, sig: COMB, dens: 4, ang: 90 }, 'tiger cat stripes');
  P('gBeast', 'Scaled tiger', { kind: 1, sig: SCALE }, 'tiger cat');
  P('gBeast', 'Elephant', { kind: 2, sig: DOTS }, 'elephant hathi');
  P('gBeast', 'Combed elephant', { kind: 2, sig: COMB, dens: 4 }, 'elephant hathi');
  P('gBeast', 'Seeded elephant', { kind: 2, sig: SEED }, 'elephant hathi');
  P('gBeast', 'Horse', { kind: 3, sig: CRESC }, 'horse ghoda');
  P('gBeast', 'Rippled horse', { kind: 3, sig: RIPPLE }, 'horse ghoda');
  P('gBeast', 'Bull', { kind: 4, sig: DOTS }, 'bull ox cattle');
  P('gBeast', 'Ringed bull', { kind: 4, sig: RING }, 'bull ox cattle');
  P('gBeast', 'Boar', { kind: 5, sig: CHEV }, 'boar pig hunt');
  P('gBeast', 'Monkey', { kind: 6, sig: DOTS }, 'monkey bandar');
  P('gBeast', 'Dog', { kind: 7, sig: DASH }, 'dog village');
  P('gBeast', 'Outline deer', { kind: 0, sig: PLAIN }, 'deer plain');

  P('gHerd', 'Herd of deer', { count: 3, kind: 0, sig: DOTS }, 'deer herd group');
  P('gHerd', 'Line of horses', { count: 4, kind: 3, sig: CRESC, dens: 3 }, 'horse herd group');
  P('gHerd', 'Stepped herd', { count: 4, kind: 0, lay: 1, sig: COMB, dens: 3 }, 'deer herd group');
  P('gHerd', 'Two elephants', { count: 2, kind: 2, sig: SEED }, 'elephant pair');
  P('gHerd', 'Cattle', { count: 3, kind: 4, sig: RING, dens: 3 }, 'bull ox herd');

  P('gSnake', 'Serpent', { lay: 0, sig: SCALE }, 'snake nag serpent');
  P('gSnake', 'Coiled serpent', { lay: 1, sig: SCALE }, 'snake nag coil');
  P('gSnake', 'Rising serpent', { lay: 2, sig: CRESC }, 'snake nag rise');
  P('gSnake', 'Dotted serpent', { lay: 0, sig: DOTS, waves: 6 }, 'snake nag');

  P('gTurtle', 'Turtle', { rings: 2, sig: DOTS }, 'turtle tortoise kachua');
  P('gTurtle', 'Great turtle', { rings: 4, sig: SCALE, plates: 10 }, 'turtle tortoise');
  P('gTurtle', 'Combed turtle', { rings: 2, sig: COMB, dens: 3 }, 'turtle tortoise');

  P('gFish', 'Fish', { count: 1, sig: SCALE }, 'fish river machli');
  P('gFish', 'Three fish', { count: 3, sig: SCALE }, 'fish river');
  P('gFish', 'Shoal', { count: 6, lay: 1, sig: DOTS, dens: 3 }, 'fish river shoal');
  P('gFish', 'Facing fish', { count: 4, lay: 2, sig: CRESC }, 'fish river pair');

  /* ---- birds ---- */
  P('gBird', 'Bird', { kind: 0, sig: DOTS }, 'bird chidiya');
  P('gBird', 'Dotted bird', { kind: 0, sig: DOTS, dens: 3 }, 'bird chidiya');
  P('gBird', 'Combed bird', { kind: 0, sig: COMB, dens: 3 }, 'bird chidiya');
  P('gBird', 'Peacock', { kind: 1, sig: DOTS }, 'peacock mor bird');
  P('gBird', 'Great peacock', { kind: 1, sig: SCALE, feathers: 15 }, 'peacock mor bird');
  P('gBird', 'Seeded peacock', { kind: 1, sig: SEED, feathers: 9 }, 'peacock mor bird');
  P('gBird', 'Hornbill', { kind: 2, sig: DASH }, 'hornbill bird beak');
  P('gBird', 'Ringed hornbill', { kind: 2, sig: RING }, 'hornbill bird');
  P('gBird', 'Owl', { kind: 3, sig: CRESC }, 'owl ullu bird night');
  P('gBird', 'Dotted owl', { kind: 3, sig: DOTS, dens: 3 }, 'owl ullu bird');
  P('gBird', 'Crane', { kind: 4, sig: RIPPLE }, 'crane heron bird water');
  P('gBird', 'Flying bird', { kind: 5, sig: DOTS }, 'bird flying wings');
  P('gBird', 'Scaled flyer', { kind: 5, sig: SCALE }, 'bird flying wings');
  P('gBird', 'Outline bird', { kind: 0, sig: PLAIN }, 'bird plain');

  P('gFlock', 'Flock', { count: 4, kind: 5, sig: DOTS }, 'birds flock sky');
  P('gFlock', 'Birds rising', { count: 5, kind: 5, lay: 2, sig: DOTS, dens: 3 }, 'birds flock sky');
  P('gFlock', 'Row of birds', { count: 4, kind: 0, lay: 1, sig: CRESC }, 'birds row perch');
  P('gFlock', 'Peacocks', { count: 3, kind: 1, lay: 1, sig: SCALE, dens: 3 }, 'peacock birds row');

  /* ---- nature ---- */
  P('gTree', 'Tree', { branches: 5, sig: DOTS }, 'tree ped plant');
  P('gTree', 'Flowering tree', { branches: 5, crop: 1, sig: DOTS }, 'tree flower blossom');
  P('gTree', 'Fruit tree', { branches: 6, crop: 2, sig: SEED }, 'tree fruit');
  P('gTree', 'Bare tree', { branches: 4, crop: 3, sig: COMB, dens: 4 }, 'tree bare winter');
  P('gTree', 'Wide tree', { branches: 8, spread: 66, sig: CRESC, dens: 4 }, 'tree wide');
  P('gTree', 'Sapling', { branches: 2, spread: 26, sig: DOTS }, 'tree small plant young');

  P('gLeaf', 'Pointed leaf', { kind: 0, sig: COMB, dens: 3 }, 'leaf plant');
  P('gLeaf', 'Round leaf', { kind: 1, sig: DOTS }, 'leaf plant');
  P('gLeaf', 'Lobed leaf', { kind: 2, sig: SEED }, 'leaf plant');
  P('gLeaf', 'Frond', { kind: 3, sig: COMB, dens: 3 }, 'leaf palm frond');
  P('gLeaf', 'Scaled leaf', { kind: 0, sig: SCALE, vein: 0 }, 'leaf plant');

  P('gMahua', 'Mahua', { clusters: 4, sig: DOTS }, 'mahua flower tree');
  P('gMahua', 'Mahua in flower', { clusters: 6, flowers: 7, sig: RING, dens: 3 }, 'mahua flower tree');
  P('gMahua', 'Young mahua', { clusters: 2, flowers: 4, sig: SEED }, 'mahua flower tree');

  P('gSun', 'Sun', { kind: 0, sig: DOTS }, 'sun suraj sky');
  P('gSun', 'Combed sun', { kind: 0, sig: COMB, dens: 3, rays: 24 }, 'sun suraj sky');
  P('gSun', 'Moon', { kind: 1, sig: SCALE }, 'moon chand night sky');
  P('gSun', 'Sun and moon', { kind: 2, sig: DOTS }, 'sun moon sky day night');

  P('gHills', 'Hills', { peaks: 3, river: 0, sig: CHEV }, 'hills mountain land');
  P('gHills', 'Hills and river', { peaks: 3, river: 1, sig: CHEV }, 'hills river water land');
  P('gHills', 'Many peaks', { peaks: 6, river: 1, sig: COMB, dens: 3 }, 'hills mountain range');
  P('gHills', 'One hill', { peaks: 1, river: 0, sig: SCALE }, 'hill mountain');

  /* ---- compositions ---- */
  P('gTreeOfLife', 'Tree of life', { branches: 6, life: 0, sig: DOTS }, 'tree life birds jeevan');
  P('gTreeOfLife', 'Tree of life with deer', { branches: 6, life: 1, sig: DOTS }, 'tree life deer');
  P('gTreeOfLife', 'Tree of life with serpents', { branches: 7, life: 2, sig: SCALE }, 'tree life snake');
  P('gTreeOfLife', 'Combed tree of life', { branches: 5, life: 0, sig: COMB, dens: 3 }, 'tree life birds');

  P('gDigna', 'Digna diamonds', { grid: 4, motif: 0, sig: DOTS }, 'digna floor pattern ritual');
  P('gDigna', 'Digna flowers', { grid: 3, motif: 1, sig: DOTS }, 'digna floor pattern ritual');
  P('gDigna', 'Digna stars', { grid: 4, motif: 2, sig: COMB, dens: 3 }, 'digna floor pattern');
  P('gDigna', 'Digna eyes', { grid: 5, motif: 3, sig: DOTS, dens: 3 }, 'digna floor pattern eye');
  P('gDigna', 'Digna waves', { grid: 4, motif: 4, sig: RIPPLE }, 'digna floor pattern water');
  P('gDigna', 'Fine digna', { grid: 7, motif: 0, sig: PLAIN, dens: 3 }, 'digna floor pattern dense');
  P('gDigna', 'Open digna', { grid: 2, motif: 1, sig: SCALE, rule: 0 }, 'digna pattern');

  P('gScene', 'Forest', { trees: 2, animals: 2, sig: DOTS }, 'forest jungle scene');
  P('gScene', 'Deep forest', { trees: 4, animals: 4, sig: COMB, dens: 3 }, 'forest jungle scene');
  P('gScene', 'Quiet forest', { trees: 2, animals: 0, birds: 1, sig: CRESC }, 'forest trees birds');

  P('gRoundel', 'Roundel', { rings: 4, sig: DOTS }, 'circle mandala roundel');
  P('gRoundel', 'Fine roundel', { rings: 6, sig: DOTS, dens: 3 }, 'circle mandala roundel');
  P('gRoundel', 'Open roundel', { rings: 2, sig: SCALE, spokes: 0 }, 'circle mandala roundel');
  P('gRoundel', 'Combed roundel', { rings: 5, sig: COMB, dens: 3 }, 'circle mandala roundel');

  /* ---- borders ---- */
  P('gBorder', 'Dot border', { kind: 0, repeat: 18 }, 'border band edge');
  P('gBorder', 'Crescent border', { kind: 1, repeat: 14 }, 'border band edge');
  P('gBorder', 'Leaf border', { kind: 2, repeat: 12, sig: COMB, dens: 3 }, 'border band leaf');
  P('gBorder', 'Chevron border', { kind: 3, repeat: 16 }, 'border band zigzag');
  P('gBorder', 'Eye border', { kind: 4, repeat: 10 }, 'border band eye');
  P('gBorder', 'Comb border', { kind: 5, repeat: 14 }, 'border band line');
  P('gBorder', 'Diamond border', { kind: 6, repeat: 12 }, 'border band diamond');
  P('gBorder', 'Bird border', { kind: 7, repeat: 7, sig: DOTS }, 'border band bird');
  P('gBorder', 'Open dot rule', { kind: 0, repeat: 26, rule: 0 }, 'border band rule');

  P('gFrame', 'Dot frame', { kind: 0, repeat: 11 }, 'frame border edge');
  P('gFrame', 'Crescent frame', { kind: 1, repeat: 9 }, 'frame border edge');
  P('gFrame', 'Leaf frame', { kind: 2, repeat: 8, sig: COMB, dens: 3 }, 'frame border leaf');
  P('gFrame', 'Diamond frame', { kind: 6, repeat: 10 }, 'frame border diamond');
  P('gFrame', 'Eye frame', { kind: 4, repeat: 7 }, 'frame border eye');
  P('gFrame', 'Deep frame', { kind: 3, repeat: 12, inset: 2 }, 'frame border');

  P('gField', 'Dot field', { sig: DOTS, dens: 6 }, 'pattern fill ground');
  P('gField', 'Comb field', { sig: COMB, dens: 5 }, 'pattern fill ground line');
  P('gField', 'Crescent field', { sig: CRESC, dens: 6 }, 'pattern fill ground');
  P('gField', 'Scale field', { sig: SCALE, dens: 7 }, 'pattern fill ground fish');
  P('gField', 'Seed field', { sig: SEED, dens: 6 }, 'pattern fill ground');
  P('gField', 'Chevron field', { sig: CHEV, dens: 6 }, 'pattern fill ground');
  P('gField', 'Dash field', { sig: DASH, dens: 5, ang: 30 }, 'pattern fill ground');
  P('gField', 'Ring field', { sig: RING, dens: 7 }, 'pattern fill ground circle');
  P('gField', 'Ripple field', { sig: RIPPLE, dens: 7 }, 'pattern fill ground water');
  P('gField', 'Diagonal comb', { sig: COMB, dens: 5, ang: 45 }, 'pattern fill ground line');

  const start = PRESETS.length;
  NEW.forEach((e, i) => {
    const g = GENS[e.gen], full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full; e.cat = g.cat; e.style = g.style; e.id = 'g' + (start + i);
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
    PRESETS.push(e);
  });
})();
