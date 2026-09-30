/* ============================================================
   SCRAWL / site — the page
   Everything that looks drawn is drawn, live, by the editor's
   generators (see render.js). The traditions, their palettes and
   their pieces are read from the loaded packs, so a new tradition
   added to the editor shows up here without touching this file.
   ============================================================ */
(function () {
  const S = window.SCRAWL, R = window.SITE;
  const $ = (q, r) => (r || document).querySelector(q);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = () => Math.floor(Math.random() * 1e6);
  const STYLES = S.STYLES, KEYS = R.styleKeys();
  const nf = n => n.toLocaleString('en-US');

  /* Pieces worth leading with, per tradition. Anything not named here
     (a tradition added later) falls back to what its library holds. */
  const HERO = { warli: 'Tarpa dance', gond: 'Tree of life with deer', sketch: 'Sunburst' };
  /* which of a tradition's palettes each section opens on */
  const HERO_PAL = { gond: 4 }, CHAPTER_PAL = { gond: 3 };
  const HAND = { warli: 'Deer', gond: 'Peacock', sketch: 'Bird' };
  const BAND = { warli: 'Dancers over triangles', gond: 'Bird border', sketch: null };
  const WALL = {
    warli: ['Dancing', 'Tree with birds', 'Peacock', 'The well', 'Bullock cart', 'Sun and moon', 'Three huts', 'Rider on a horse', 'Water carrier', 'Elephant'],
    sketch: ['Cat, sitting', 'Sunflower', 'Rocket', 'Espresso cup', 'Delighted', 'Laurel wreath', 'Mushroom', 'Potted plant', 'Fox', 'Paper lantern'],
    gond: ['Combed deer', 'Great peacock', 'Coiled serpent', 'Mahua in flower', 'Dotted owl', 'Seeded elephant', 'Facing fish', 'Digna eyes', 'Ringed hornbill', 'Scaled tiger'],
  };
  const SEEDPIECES = [['gond', 'Dotted bird'], ['warli', 'Tree with birds'], ['warli', 'Dancing'], ['gond', 'Combed deer'], ['gond', 'Roundel'], ['warli', 'Hut'], ['sketch', 'Sunburst']];
  const RULE = {
    warli: 'Solid white silhouette. A person is two triangles meeting at their tips.',
    gond: 'A clean outline packed with a signature fill of dots, combs and seeds.',
    sketch: 'Loose pen and ink, drawn twice with a shaky hand.',
  };

  const nameOf = k => STYLES[k].name;
  const pick = (arr, n) => arr.slice().sort(() => Math.random() - .5).slice(0, n);
  function heroPreset(k) {
    const all = R.presetsOf(k);
    return R.findPreset(HERO[k], k) || all.find(p => p.cat === 'Compositions') || all[0];
  }
  function firstPreset(k, names) {
    for (const n of names || []) { const p = R.findPreset(n, k); if (p) return p; }
    return null;
  }
  const isSquare = p => S.GENS[p.gen].aspect !== 'free';
  function wallPresets(k) {
    const named = (WALL[k] || []).map(n => R.findPreset(n, k)).filter(Boolean);
    if (named.length >= 8) return named;
    /* a tradition with no curated wall: one square piece from each category */
    const all = R.presetsOf(k).filter(isSquare), out = [];
    const cats = [...new Set(all.map(p => p.cat))];
    for (let r = 0; out.length < 10 && r < 4; r++) cats.forEach(c => {
      const inCat = all.filter(p => p.cat === c && !out.includes(p));
      if (inCat.length && out.length < 10) out.push(inCat[Math.floor(Math.random() * inCat.length)]);
    });
    return out;
  }
  function bandPreset(k) {
    return firstPreset(k, [BAND[k]]) || R.presetsOf(k).find(p => p.cat === 'Borders' && !isSquare(p)) || null;
  }
  function setVars(node, k, palIdx) {
    const p = R.palette(k, palIdx);
    node.style.setProperty('--ground', p.paper);
    node.style.setProperty('--ink', p.colors[0]);
    node.style.setProperty('--accent', p.colors[1]);
    node.style.setProperty('--alt', p.colors[2]);
    return p;
  }

  /* Draw into a node only once it scrolls near the viewport, so the
     draw-on animation plays where somebody can see it. */
  const later = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const fn = later.get(e.target); later.delete(e.target); io.unobserve(e.target); fn && fn();
  }), { rootMargin: '120px 0px' }) : null;
  function whenSeen(node, fn) { if (!io) return fn(); later.set(node, fn); io.observe(node); }

  /* ================= brand mark ================= */
  (function () {
    const p = R.findPreset('Standing', 'warli') || R.presetsOf(KEYS[0])[0];
    $('#brandMark').innerHTML = R.piece(p, { size: 160, seed: 7, colors: ['currentColor', 'currentColor', 'currentColor', 'currentColor', 'var(--paper)'], pad: 0 });
  })();

  /* ================= hero ================= */
  const hero = $('#hero'), heroArt = $('#heroArt');
  const FIRST_SEED = 48213;
  let heroStyle = KEYS.includes('warli') ? 'warli' : KEYS[0], heroSeed = FIRST_SEED;
  const seedInput = $('#seedInput');

  function paintHero(animate) {
    const pre = heroPreset(heroStyle);
    const pal = setVars(hero, heroStyle, HERO_PAL[heroStyle] || 0);
    hero.dataset.style = heroStyle;
    const nav = $('#nav');
    nav.style.setProperty('--navInk', pal.colors[0]);
    nav.style.setProperty('--navGround', pal.paper);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', pal.paper);
    /* the number drives the dials as well as the hand, so every seed
       is a different drawing, not just a different wobble */
    const params = heroSeed === FIRST_SEED ? null : R.randParams(S.GENS[pre.gen], S.rngFrom(heroSeed));
    heroArt.innerHTML = R.piece(pre, { seed: heroSeed, params, size: 760, colors: pal.colors, animate: animate && !reduced, cls: heroStyle === 'warli' ? 'spin' : '' });
    heroArt.dataset.name = pre.name;
    $('#heroCap').innerHTML = `<b>${R.esc(pre.name)}</b> · ${R.esc(nameOf(heroStyle))} · seed ${String(heroSeed).padStart(6, '0')}`;
    seedInput.value = String(heroSeed).padStart(6, '0');
    const band = bandPreset(heroStyle);
    const hb = $('#heroBand');
    hb.innerHTML = band ? marquee(band, pal.colors, heroSeed) : '';
    hb.hidden = !band;
  }
  function marquee(pre, colors, seed) {
    /* two identical strips scroll by exactly one strip width, so the
       loop never shows a seam */
    const strip = R.piece(pre, { w: 2400, h: 140, seed, colors, pad: 0, detail: .8, cls: 'strip' });
    return `<div class="band-track">${strip}${strip}</div>`;
  }
  const tabs = $('#heroTabs');
  tabs.innerHTML = '<span class="painter-label">Paint it as</span>' + KEYS.map(k =>
    `<button role="tab" data-k="${k}" aria-selected="${k === heroStyle}">${R.esc(nameOf(k))}</button>`).join('');
  tabs.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    heroStyle = b.dataset.k;
    tabs.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', x === b));
    paintHero(true);
  };
  const setSeed = v => { heroSeed = ((v % 1e6) + 1e6) % 1e6; paintHero(true); };
  $('#seedUp').onclick = () => setSeed(heroSeed + 1);
  $('#seedDown').onclick = () => setSeed(heroSeed - 1);
  $('#seedRoll').onclick = () => setSeed(rnd());
  seedInput.addEventListener('input', () => {
    const v = parseInt(seedInput.value.replace(/\D/g, ''), 10);
    if (!isNaN(v)) { heroSeed = v; clearTimeout(seedInput._t); seedInput._t = setTimeout(() => paintHero(true), 260); }
  });
  seedInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { e.preventDefault(); setSeed(heroSeed + 1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSeed(heroSeed - 1); }
  });
  paintHero(true);

  /* ================= same subject, opposite rule ================= */
  (function () {
    /* a subject is any preset name that two or more traditions share */
    const byName = new Map();
    S.PRESETS.forEach(p => {
      if (!isSquare(p)) return;
      if (!byName.has(p.name)) byName.set(p.name, new Map());
      const m = byName.get(p.name); if (!m.has(p.style)) m.set(p.style, p);
    });
    const lead = ['Deer', 'Peacock', 'Water carrier', 'Tiger', 'Elephant', 'Dancing', 'Fish', 'Bird', 'Sun and moon', 'Horse', 'Walking', 'Bull'];
    const shared = [...byName.keys()].filter(n => byName.get(n).size >= 2);
    const subjects = lead.filter(n => shared.includes(n)).concat(shared.filter(n => !lead.includes(n))).slice(0, 14);
    const chips = $('#subjectChips'), tri = $('#triptych');
    let current = subjects[0];

    function show(name, animate) {
      current = name;
      chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.n === name));
      const m = byName.get(name);
      tri.innerHTML = '';
      tri.style.setProperty('--n', m.size);
      KEYS.filter(k => m.has(k)).forEach(k => {
        const pre = m.get(k), seed = rnd();
        const panel = el('button', 'panel');
        panel.setAttribute('aria-label', `${name} drawn as ${nameOf(k)}. Click to redraw.`);
        const pal = setVars(panel, k, 0);
        const h = S.styleOf(k).hand;
        panel.innerHTML = `<div class="panel-art">${R.piece(pre, { seed, size: 560, colors: pal.colors, animate: animate && !reduced })}</div>
          <div class="panel-cap"><span class="panel-name">${R.esc(nameOf(k))}</span><span class="panel-where">${R.esc(STYLES[k].where)}</span>
          <span class="panel-rule">${R.esc(RULE[k] || STYLES[k].note || '')}</span>
          <span class="panel-hand">wobble ${h.rough} · bend ${h.bow} · ${h.passes} pass${h.passes === 1 ? '' : 'es'}</span></div>`;
        panel.onclick = () => { panel.querySelector('.panel-art').innerHTML = R.piece(pre, { seed: rnd(), size: 560, colors: pal.colors, animate: !reduced }); };
        tri.appendChild(panel);
      });
    }
    chips.innerHTML = subjects.map(n => `<button role="tab" data-n="${R.esc(n)}">${R.esc(n)}</button>`).join('');
    chips.onclick = e => { const b = e.target.closest('button'); if (b) show(b.dataset.n, true); };
    whenSeen(tri, () => show(current, true));
  })();

  /* ================= tradition chapters ================= */
  (function () {
    const host = $('#chapters');
    KEYS.forEach((k, i) => {
      const st = STYLES[k];
      const gens = Object.values(S.GENS).filter(g => g.style === k).length;
      const pieces = R.presetsOf(k).length;
      const tpls = S.TEMPLATES.filter(t => (t.style || 'sketch') === k).length;
      const pals = S.stylePalettes(k).slice(0, 7);
      const ch = el('article', 'chapter' + (i % 2 ? ' chapter--flip' : ''));
      ch.id = 'tradition-' + k;
      let palIdx = Math.min(CHAPTER_PAL[k] || 0, pals.length - 1);
      setVars(ch, k, palIdx);
      ch.innerHTML = `
        <div class="ch-head">
          <p class="ch-no">${String(i + 1).padStart(2, '0')} / ${String(KEYS.length).padStart(2, '0')}</p>
          <h3 class="ch-name${st.name.length > 7 ? ' ch-name--long' : ''}">${R.esc(st.name)}</h3>
          <p class="ch-where">${R.esc(st.where)}</p>
          <blockquote class="ch-note">${R.esc(st.note || '')}</blockquote>
          <dl class="ch-stats">
            <div><dt>generators</dt><dd>${gens}</dd></div>
            <div><dt>pieces</dt><dd>${pieces}</dd></div>
            <div><dt>layouts</dt><dd>${tpls}</dd></div>
          </dl>
          <div class="swatches" role="radiogroup" aria-label="${R.esc(st.name)} palettes">
            ${pals.map((p, j) => `<button role="radio" aria-checked="${j === palIdx}" data-j="${j}" title="${R.esc(p[0])}" aria-label="${R.esc(p[0])}" style="--a:${p[1]};--b:${p[2]};--c:${p[3]}"></button>`).join('')}
          </div>
          <p class="ch-palname">${R.esc(pals[palIdx][0])}</p>
          <a class="btn btn-onground" href="../index.html">Paint in ${R.esc(st.name)} <span aria-hidden="true">→</span></a>
        </div>
        <div class="ch-wall"></div>`;
      host.appendChild(ch);
      const wall = $('.ch-wall', ch);
      const tiles = wallPresets(k);
      const seeds = tiles.map(() => rnd());
      function drawWall(animate) {
        const pal = R.palette(k, palIdx);
        wall.innerHTML = '';
        tiles.forEach((pre, j) => {
          const t = el('button', 'tile');
          t.setAttribute('aria-label', `${pre.name}. Click to redraw.`);
          t.innerHTML = `<span class="tile-art">${R.piece(pre, { seed: seeds[j], size: 420, detail: .7, colors: pal.colors, animate })}</span><span class="tile-cap"><span>${R.esc(pre.name)}</span><i>${R.esc(pre.cat)}</i></span>`;
          t.onclick = () => { seeds[j] = rnd(); $('.tile-art', t).innerHTML = R.piece(pre, { seed: seeds[j], size: 420, detail: .7, colors: R.palette(k, palIdx).colors, animate: !reduced }); };
          wall.appendChild(t);
        });
      }
      $('.swatches', ch).onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        palIdx = +b.dataset.j;
        ch.querySelectorAll('.swatches button').forEach(x => x.setAttribute('aria-checked', x === b));
        $('.ch-palname', ch).textContent = pals[palIdx][0];
        setVars(ch, k, palIdx);
        drawWall(false);
      };
      whenSeen(wall, () => drawWall(!reduced));
    });
  })();

  /* ================= the hand ================= */
  (function () {
    const DIALS = [
      ['rough', 'Wobble', 0, 2.5, .01, 'how far the pen strays from the line'],
      ['bow', 'Bend', 0, 2.5, .01, 'how much a straight stroke bows'],
      ['passes', 'Passes', 1, 4, 1, 'how many times each stroke is drawn'],
      ['weight', 'Weight', .6, 7, .1, 'how heavy the brush is'],
    ];
    let k = KEYS.includes('gond') ? 'gond' : KEYS[0], hand = {}, seed = 311;
    const art = $('#handArt'), dials = $('#dials'), tabsH = $('#handTabs');
    const pre = () => R.findPreset(HAND[k], k) || R.presetsOf(k).find(isSquare);

    dials.innerHTML = DIALS.map(([key, label, min, max, step, hint]) => `
      <label class="dial"><span class="dial-top"><span>${label}</span><output id="o_${key}"></output></span>
      <input type="range" id="d_${key}" min="${min}" max="${max}" step="${step}" aria-describedby="h_${key}">
      <span class="dial-hint" id="h_${key}">${hint}</span></label>`).join('') +
      `<button class="btn btn-small btn-ghost" id="handSeed"><span aria-hidden="true">⟳</span> Same hand, new seed</button>`;

    function draw(animate) {
      const pal = R.palette(k, 0);
      art.style.setProperty('--ground', pal.paper);
      art.innerHTML = R.piece(pre(), { seed, size: 640, colors: pal.colors, hand, weight: hand.weight, animate: animate && !reduced });
      $('#handReadout').textContent = `${pre().name} · ${nameOf(k)} palette · seed ${seed}`;
      DIALS.forEach(([key]) => { $('#o_' + key).textContent = (+hand[key]).toFixed(key === 'passes' ? 0 : 2); });
    }
    function load(key) {
      k = key;
      const h = S.styleOf(k).hand;
      hand = { rough: h.rough, bow: h.bow, passes: h.passes, weight: h.weight, fillMode: h.fillMode };
      DIALS.forEach(([dk]) => { $('#d_' + dk).value = hand[dk]; });
      tabsH.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
      draw(true);
    }
    tabsH.innerHTML = '<span class="painter-label">Load the hand of</span>' + KEYS.map(x => `<button role="tab" data-k="${x}">${R.esc(nameOf(x))}</button>`).join('');
    tabsH.onclick = e => { const b = e.target.closest('button'); if (b) load(b.dataset.k); };
    DIALS.forEach(([dk]) => $('#d_' + dk).addEventListener('input', e => { hand[dk] = +e.target.value; draw(false); }));
    $('#handSeed').onclick = () => { seed = rnd(); draw(true); };
    whenSeen(art, () => load(k));
  })();

  /* ================= seeds ================= */
  (function () {
    const $sel = $('#seedPiece'), wall = $('#seedWall'), dialsBox = $('#seedDials');
    const opts = SEEDPIECES.map(([k, n]) => R.findPreset(n, k)).filter(Boolean);
    KEYS.forEach(k => { if (!opts.some(p => p.style === k)) { const p = R.presetsOf(k).find(isSquare); if (p) opts.push(p); } });
    $sel.innerHTML = opts.map((p, i) => `<option value="${i}">${R.esc(p.name)} · ${R.esc(nameOf(p.style))}</option>`).join('');
    const count = () => (innerWidth < 640 ? 12 : 24);
    function draw(animate) {
      const pre = opts[+$sel.value], g = S.GENS[pre.gen];
      const pal = R.palette(pre.style, 0);
      wall.style.setProperty('--ground', pal.paper);
      wall.style.setProperty('--ink', pal.colors[0]);
      wall.innerHTML = '';
      for (let i = 0; i < count(); i++) {
        const seed = i === 0 ? pre.seed : rnd();
        const params = dialsBox.checked && i > 0 ? Object.assign({}, pre.params, R.randParams(g, S.rngFrom(seed))) : null;
        const c = el('figure', 'seedcell');
        c.innerHTML = R.piece(pre, { seed, params, size: 360, detail: .5, colors: pal.colors, animate: animate && !reduced }) +
          `<figcaption>${i === 0 ? 'the library’s own' : '#' + String(seed).padStart(6, '0')}</figcaption>`;
        c.style.setProperty('--delay', (i * 40) + 'ms');
        wall.appendChild(c);
      }
    }
    $sel.onchange = () => draw(true);
    dialsBox.onchange = () => draw(true);
    $('#seedShuffle').onclick = () => draw(true);
    whenSeen(wall, () => draw(true));
  })();

  /* ================= templates ================= */
  (function () {
    const host = $('#posters');
    const PREF = { warli: ['Village wall', 'Tarpa dance', 'Wedding chauk'], gond: ['Tree of life', 'Deer and serpent', 'Digna panel'], sketch: ['Gig poster', 'Coaster', 'Badge logo'] };
    const chosen = [];
    KEYS.forEach(k => {
      const mine = S.TEMPLATES.filter(t => (t.style || 'sketch') === k && !/blank/i.test(t.name));
      const pref = (PREF[k] || []).map(n => mine.find(t => t.name === n)).filter(Boolean);
      (pref.length ? pref : mine.slice(0, 3)).forEach(t => chosen.push(t));
    });
    /* interleave traditions so the wall reads as a mix */
    chosen.sort((a, b) => chosen.filter(t => t.style === a.style).indexOf(a) - chosen.filter(t => t.style === b.style).indexOf(b));
    chosen.forEach((t, i) => {
      const f = el('figure', 'poster-card');
      f.style.setProperty('--tilt', ((i % 3) - 1) * 1.6 + 'deg');
      f.style.setProperty('--ar', t.w / t.h);
      f.innerHTML = `<div class="poster-frame"></div><figcaption><b>${R.esc(t.name)}</b><span>${R.esc(t.desc || '')}</span><i>${R.esc(nameOf(t.style || 'sketch'))} · ${t.w}×${t.h}</i></figcaption>`;
      host.appendChild(f);
      whenSeen(f, () => {
        const fr = $('.poster-frame', f);
        fr.innerHTML = R.template(t, { animate: !reduced });
        const fit = () => R.fitText(fr);
        document.fonts && document.fonts.ready ? document.fonts.ready.then(fit) : fit();
      });
    });
  })();

  /* ================= stats + fact marks ================= */
  (function () {
    const gens = Object.keys(S.GENS).length, pieces = S.PRESETS.length, tpls = S.TEMPLATES.length;
    const box = $('#stats');
    box.innerHTML = [[gens, 'generators'], [pieces, 'library pieces'], [tpls, 'templates'], [KEYS.length, 'traditions'], [0, 'servers']]
      .map(([n, l]) => `<div class="stat"><b data-n="${n}">${nf(n)}</b><span>${l}</span></div>`).join('');
    whenSeen(box, () => {
      if (reduced) return;
      box.querySelectorAll('b').forEach(b => {
        const n = +b.dataset.n, t0 = performance.now();
        const step = t => { const k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3); b.textContent = nf(Math.round(n * e)); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    });
    document.querySelectorAll('.fact-art').forEach(sp => {
      const [k, n] = sp.dataset.piece.split(':');
      const pre = R.findPreset(n, k); if (!pre) return;
      const pal = R.palette(k, 0);
      sp.style.setProperty('--ground', pal.paper);
      whenSeen(sp, () => { sp.innerHTML = R.piece(pre, { seed: rnd(), size: 300, detail: .6, colors: pal.colors, animate: !reduced }); });
    });
  })();

  /* ================= close ================= */
  (function () {
    const k = KEYS.includes('warli') ? 'warli' : KEYS[0];
    const pal = setVars($('#close'), k, 4);
    const scene = R.findPreset('Crowded wall', k) || R.presetsOf(k).find(p => p.cat === 'Compositions');
    const art = $('#closeArt');
    whenSeen(art, () => { art.innerHTML = R.piece(scene, { w: 1600, h: 900, seed: rnd(), colors: pal.colors, slice: true, pad: 0, detail: .8, animate: !reduced }); });
    const band = bandPreset(k);
    if (band) $('#footBand').innerHTML = marquee(band, pal.colors, 91);
  })();

  /* ================= nav ================= */
  (function () {
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > innerHeight * .75);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  })();
})();
