/* ============================================================
   SCRAWL / site — the page
   Every drawing here is generated live by the editor's own
   generators (render.js is the bridge). Traditions, palettes,
   pieces and counts are read from the loaded packs, so a new
   tradition added to the editor turns up here on its own.
   ============================================================ */
(function () {
  const S = window.SCRAWL, R = window.SITE;
  const $ = (q, r) => (r || document).querySelector(q);
  const $$ = (q, r) => [...(r || document).querySelectorAll(q)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = () => Math.floor(Math.random() * 1e6);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const nf = n => n.toLocaleString('en-US');
  const esc = R.esc;
  const STYLES = S.STYLES, KEYS = R.styleKeys();
  const nameOf = k => STYLES[k].name;
  const isSquare = p => S.GENS[p.gen].aspect !== 'free';

  /* ---------- colour per tradition ----------
     bg: the wall; head: the type painted on it; ink: pigments a
     stamp may be drawn in; acc: its accents; pal: the palette the
     tradition's own panels open on. Unknown traditions fall back
     to their first palette. */
  const THEME = {
    warli: { bg: '#B4603C', head: '#1F0F09', ink: ['#FCF7EE'], acc: ['#EBD3B4', '#FCF7EE'], pal: 3 },
    gond: { bg: '#123A5C', head: '#F2A93B', ink: ['#F5EEDC', '#F2A93B', '#3EA88A'], acc: ['#D6336C', '#F2A93B', '#3EA88A'], pal: 4 },
    sketch: { bg: '#F4FF6B', head: '#FF2D55', ink: ['#101010'], acc: ['#FF2D55', '#101010'], pal: 26 },
  };
  function theme(k) {
    if (THEME[k]) return THEME[k];
    const p = R.palette(k, 0);
    return { bg: p.paper, head: p.colors[1], ink: [p.colors[0]], acc: [p.colors[1]], pal: 0 };
  }
  const cols = (k, ink, acc) => { const t = theme(k); return [ink || t.ink[0], acc || t.acc[0], t.acc[1] || t.acc[0], t.ink[0], t.bg]; };

  const WALL = {
    warli: ['Tarpa dance', 'Tree with birds', 'Peacock', 'Bullock cart', 'Water carrier', 'Sun and moon', 'Three huts', 'Rider on a horse'],
    gond: ['Tree of life with deer', 'Great peacock', 'Coiled serpent', 'Mahua in flower', 'Dotted owl', 'Seeded elephant', 'Facing fish', 'Combed deer'],
    sketch: ['Cat, sitting', 'Sunflower', 'Rocket', 'Espresso cup', 'Delighted', 'Mushroom', 'Potted plant', 'Paper lantern'],
  };
  const STAMP_CATS = ['Figures', 'Animals', 'Birds', 'Nature', 'Village', 'Characters', 'Icons', 'Objects'];
  const RULE = {
    warli: 'Solid white silhouettes, painted with confidence. A person is two triangles meeting at their tips.',
    gond: 'A clean outline packed with a signature fill of dots, combs and seeds. The fill says whose drawing it is.',
    sketch: 'Loose pen and ink, every stroke drawn twice by a shaky hand.',
  };

  /* Draw something only when it nears the viewport, so the draw-in
     plays where somebody can see it. */
  const later = new Map();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const fn = later.get(e.target); later.delete(e.target); io.unobserve(e.target); fn && fn();
  }), { rootMargin: '200px 0px' }) : null;
  const whenSeen = (node, fn) => { if (!io) return fn(); later.set(node, fn); io.observe(node); };

  /* ---------- stretch type to fill a box ----------
     One size for every line of a heading (the largest that lets the
     longest line fit at its narrowest width), then each line is
     widened on the variable width axis until it meets the edge. */
  function fitLines(box, cap) {
    const lines = $$('.fit', box), W = box.clientWidth;
    if (!W || !lines.length) return;
    const probe = 100;
    lines.forEach(l => { l.style.display = 'inline-block'; l.style.letterSpacing = ''; l.style.fontSize = probe + 'px'; l.style.fontStretch = '50%'; });
    let fs = cap;
    lines.forEach(l => { fs = Math.min(fs, probe * W / l.getBoundingClientRect().width); });
    fs = Math.floor(fs * .995);
    lines.forEach(l => {
      l.style.fontSize = fs + 'px';
      let lo = 50, hi = 150;
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        l.style.fontStretch = mid + '%';
        if (l.getBoundingClientRect().width <= W) lo = mid; else hi = mid;
      }
      l.style.fontStretch = lo.toFixed(1) + '%';
      /* a short line that is still short at full width gets a little
         air between its letters, never more than a tenth of an em */
      l.style.letterSpacing = '';
      const short = W - l.getBoundingClientRect().width, n = l.textContent.length - 1;
      if (short > 2 && n > 0) l.style.letterSpacing = Math.min(fs * .1, short / n).toFixed(2) + 'px';
      l.style.display = '';
    });
  }
  function fitAll() {
    const hero = $('#hero'), bar = $('.hero-bar'), type = $('#heroType');
    const room = hero.clientHeight - 84 - bar.offsetHeight - 30;
    fitLines(type, Math.max(60, Math.min(room, hero.clientHeight * .64)) / 3 / .8);
    $$('.fitline').forEach(h => fitLines(h, Math.min(220, h.clientWidth * .16)));
    fitGiant();
  }

  /* ================= hero: the wall you paint ================= */
  const hero = $('#hero'), wall = $('#wall'), nav = $('#nav');
  let heroStyle = KEYS.includes('warli') ? 'warli' : KEYS[0];
  let stamps = [], last = null, ghost = null;
  const small = () => innerWidth < 700;
  const pool = {};
  function stampPool(k) {
    if (!pool[k]) {
      pool[k] = R.presetsOf(k).filter(p => isSquare(p) && STAMP_CATS.includes(p.cat));
      if (!pool[k].length) pool[k] = R.presetsOf(k).filter(isSquare);
    }
    return pool[k];
  }
  function themeHero() {
    const t = theme(heroStyle);
    hero.style.setProperty('--bg', t.bg);
    hero.style.setProperty('--head', t.head);
    nav.style.setProperty('--navInk', t.head);
    nav.style.setProperty('--navBg', t.bg);
    $('meta[name="theme-color"]').setAttribute('content', t.bg);
    $$('#heroStyles button').forEach(b => b.setAttribute('aria-checked', b.dataset.k === heroStyle));
  }
  function stamp(x, y, animate) {
    const pre = pick(stampPool(heroStyle)), t = theme(heroStyle), seed = rnd();
    const base = small() ? 78 : 124, s = Math.round(base * (.72 + Math.random() * .62));
    const d = el('div', 'stamp');
    d.style.left = x + 'px'; d.style.top = y + 'px';
    d.style.setProperty('--s', s + 'px');
    d.style.setProperty('--r', (Math.random() * 28 - 14).toFixed(1) + 'deg');
    d.innerHTML = R.piece(pre, { seed, size: Math.max(s, 110), detail: .55, pad: .02, colors: cols(heroStyle, pick(t.ink), pick(t.acc)), animate: animate && !reduced });
    const svg = d.firstChild; svg.style.setProperty('--span', '.45s'); svg.style.setProperty('--dur', '.55s');
    wall.appendChild(d); stamps.push(d);
    const max = small() ? 38 : 80;
    while (stamps.length > max) { const o = stamps.shift(); o.classList.add('gone'); setTimeout(() => o.remove(), 800); }
    $('#readout').textContent = `#${String(seed).padStart(6, '0')} · ${pre.name}`;
  }
  function wash() {
    stamps.forEach(o => { o.classList.add('gone'); setTimeout(() => o.remove(), 800); });
    stamps = [];
  }
  /* a ghost hand paints a figure-eight so the wall is never empty */
  function ghostPaint(n) {
    stopGhost();
    const W = hero.clientWidth, H = hero.clientHeight;
    const at = i => {
      const t = i / n * Math.PI * 2 + .6;
      return [W * (.5 + .42 * Math.sin(t)), H * (.42 + .3 * Math.sin(t * 2))];
    };
    if (reduced) { for (let i = 0; i < n; i++) stamp(...at(i), false); return; }
    let i = 0;
    ghost = setInterval(() => { if (i >= n) return stopGhost(); stamp(...at(i++), true); }, 95);
  }
  function stopGhost() { if (ghost) { clearInterval(ghost); ghost = null; } }
  const onBar = e => e.target.closest('.hero-bar, .nav');
  hero.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || onBar(e)) return;
    const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const gap = small() ? 60 : 92;
    if (!last || Math.hypot(x - last[0], y - last[1]) > gap) { stopGhost(); stamp(x, y, true); last = [x, y]; }
  });
  hero.addEventListener('pointerleave', () => { last = null; });
  hero.addEventListener('pointerdown', e => {
    if (onBar(e)) return;
    stopGhost();
    const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (e.pointerType === 'touch') {
      for (let k = 0; k < 3; k++) { const a = Math.random() * 6.28, d = 30 + Math.random() * 40; stamp(x + Math.cos(a) * d, y + Math.sin(a) * d, true); }
    } else stamp(x, y, true);
  });
  $('#heroStyles').innerHTML = KEYS.map(k => `<button role="radio" data-k="${k}">${esc(nameOf(k))}</button>`).join('');
  $('#heroStyles').onclick = e => {
    const b = e.target.closest('button'); if (!b || b.dataset.k === heroStyle) return;
    heroStyle = b.dataset.k; themeHero(); wash(); ghostPaint(small() ? 12 : 18);
  };
  $('#clearWall').onclick = () => { stopGhost(); wash(); $('#readout').textContent = ''; };
  themeHero();

  /* nav turns solid once the wall has scrolled away */
  const onScroll = () => nav.classList.toggle('solid', scrollY > hero.offsetHeight - 70);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ================= ticker ================= */
  (function () {
    const gens = Object.keys(S.GENS).length, pieces = S.PRESETS.length;
    const words = KEYS.map(nameOf).concat([`${gens} generators`, `${nf(pieces)} pieces`, '0 servers', 'nothing is clip art']);
    const mark = (k, c) => {
      const p = R.findPreset('Sun', k) || R.presetsOf(k).find(isSquare);
      return `<i>${R.piece(p, { size: 200, seed: rnd(), detail: .5, pad: 0, colors: [c, c, c, c, 'transparent'] })}</i>`;
    };
    const row = (flip, c) => words.map((w, i) => `<span class="${(i + flip) % 2 ? 'o' : ''}">${esc(w)}</span>${mark(KEYS[i % KEYS.length], c)}`).join('');
    const a = row(0, '#F4FF6B'), b = row(1, '#121110');
    $('#tickA').innerHTML = a + a;
    $('#tickB').innerHTML = b + b;
  })();

  /* ================= versus ================= */
  (function () {
    const [A, B] = KEYS.includes('warli') && KEYS.includes('gond') ? ['warli', 'gond'] : KEYS.slice(0, 2);
    const vs = $('#vs');
    if (!B) { $('#versus').hidden = true; return; }
    const names = p => new Set(R.presetsOf(p).filter(isSquare).map(x => x.name));
    const na = names(A), nb = names(B);
    const lead = ['Deer', 'Peacock', 'Water carrier', 'Tiger', 'Elephant', 'Dancing', 'Fish', 'Horse', 'Bird', 'Sun and moon', 'Bull', 'Walking'];
    const shared = [...na].filter(n => nb.has(n));
    const subjects = lead.filter(n => shared.includes(n)).concat(shared.filter(n => !lead.includes(n))).slice(0, 10);
    const ta = theme(A), tb = theme(B);
    vs.style.setProperty('--ca', ta.head); vs.style.setProperty('--cb', tb.head);
    $('#vsA').style.setProperty('--g', ta.bg); $('#vsB').style.setProperty('--g', tb.bg);
    $('#vsTagA').innerHTML = `${esc(nameOf(A))}<small>${esc(RULE[A] || STYLES[A].note || '')}</small>`;
    $('#vsTagB').innerHTML = `${esc(nameOf(B))}<small>${esc(RULE[B] || STYLES[B].note || '')}</small>`;
    function show(n, animate) {
      $$('#subjects button').forEach(b => b.setAttribute('aria-checked', b.dataset.n === n));
      const seed = rnd();
      $('#vsA').innerHTML = `<div>${R.piece(R.findPreset(n, A), { seed, size: 620, colors: cols(A), animate: animate && !reduced })}</div>`;
      $('#vsB').innerHTML = `<div>${R.piece(R.findPreset(n, B), { seed, size: 620, colors: cols(B, theme(B).ink[0], theme(B).acc[0]), animate: animate && !reduced })}</div>`;
    }
    $('#subjects').innerHTML = subjects.map(n => `<button role="radio" data-n="${esc(n)}">${esc(n)}</button>`).join('');
    $('#subjects').onclick = e => { const b = e.target.closest('button'); if (b) show(b.dataset.n, true); };

    const handle = $('#vsHandle');
    const setX = p => { p = Math.max(4, Math.min(96, p)); vs.style.setProperty('--x', p + '%'); handle.setAttribute('aria-valuenow', Math.round(p)); };
    let drag = false;
    const fromEvent = e => { const r = vs.getBoundingClientRect(); setX((e.clientX - r.left) / r.width * 100); };
    vs.addEventListener('pointerdown', e => { if (e.target.closest('.vs-handle') || e.pointerType !== 'touch') { drag = true; vs.setPointerCapture(e.pointerId); fromEvent(e); } });
    vs.addEventListener('pointermove', e => { if (drag) fromEvent(e); });
    vs.addEventListener('pointerup', () => { drag = false; });
    vs.addEventListener('pointercancel', () => { drag = false; });
    handle.addEventListener('keydown', e => {
      const now = +handle.getAttribute('aria-valuenow');
      if (e.key === 'ArrowLeft') { setX(now - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setX(now + 4); e.preventDefault(); }
    });
    whenSeen(vs, () => {
      show(subjects[0], true);
      if (reduced) return;
      /* one slow sweep, so it is obvious the line moves */
      const t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1800); setX(50 + Math.sin(k * Math.PI * 2) * 22); if (k < 1 && !drag) requestAnimationFrame(step); };
      setTimeout(() => requestAnimationFrame(step), 900);
    });
  })();

  /* ================= traditions accordion ================= */
  (function () {
    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    $('#tradCount').textContent = `${words[KEYS.length] || KEYS.length} rulebook${KEYS.length === 1 ? '' : 's'}`;
    const host = $('#accordion');
    const PICK_PALS = { sketch: [26, 1, 3, 9, 14, 21, 7] };
    KEYS.forEach((k, i) => {
      const st = STYLES[k], all = S.stylePalettes(k);
      const palIdx = (PICK_PALS[k] || all.map((_, j) => j)).slice(0, 7);
      const t = theme(k);
      let cur = palIdx.includes(t.pal) ? t.pal : palIdx[0];
      const gens = Object.values(S.GENS).filter(g => g.style === k).length;
      const pieces = R.presetsOf(k).length;
      const tpls = S.TEMPLATES.filter(x => (x.style || 'sketch') === k).length;
      const f = el('article', 'fold' + (i === 0 ? ' open' : ''));
      f.id = 'tradition-' + k;
      f.innerHTML = `
        <button class="fold-tab" aria-expanded="${i === 0}" aria-controls="fb-${k}">
          <span class="num">${String(i + 1).padStart(2, '0')}</span><span class="vname${st.name.length > 6 ? ' long' : ''}">${esc(st.name)}</span><span class="plus" aria-hidden="true">+</span>
        </button>
        <div class="fold-body" id="fb-${k}">
          <div class="fold-info">
            <h3 class="fold-name${st.name.length > 7 ? ' long' : ''}">${esc(st.name)}</h3>
            <p class="fold-where">${esc(st.where)}</p>
            <p class="fold-note">${esc(st.note || '')}</p>
            <ul class="rules">
              <li><span>generators</span><b>${gens}</b></li>
              <li><span>pieces</span><b>${pieces}</b></li>
              <li><span>layouts</span><b>${tpls}</b></li>
            </ul>
            <div class="fold-swatches" role="radiogroup" aria-label="${esc(st.name)} palettes">
              ${palIdx.map(j => { const p = all[j]; return `<button role="radio" data-j="${j}" aria-checked="${j === cur}" aria-label="${esc(p[0])}" title="${esc(p[0])}" style="--p1:${p[1]};--p2:${p[2]};--p3:${p[3]}"></button>`; }).join('')}
            </div>
            <div class="fold-actions"><a class="pill" href="../index.html">Paint in ${esc(st.name)} ↗</a><span class="palname"></span></div>
          </div>
          <div class="fold-grid"></div>
        </div>`;
      host.appendChild(f);
      const grid = $('.fold-grid', f);
      let tiles = (WALL[k] || []).map(n => R.findPreset(n, k)).filter(Boolean);
      if (tiles.length < 8) {
        const rest = R.presetsOf(k).filter(p => isSquare(p) && !tiles.includes(p));
        while (tiles.length < 8 && rest.length) tiles.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
      }
      tiles = tiles.slice(0, 8);
      const seeds = tiles.map(() => rnd());
      const paint = animate => {
        const p = R.palette(k, cur);
        f.style.setProperty('--g', p.paper); f.style.setProperty('--c', p.colors[0]); f.style.setProperty('--a', p.colors[1]);
        $('.palname', f).textContent = p.name;
        grid.innerHTML = tiles.map((pre, j) => `<button data-j="${j}" aria-label="${esc(pre.name)}, click to redraw">${R.piece(pre, { seed: seeds[j], size: j ? 360 : 620, detail: j ? .6 : .9, colors: p.colors, animate })}<span class="cap">${esc(pre.name)}</span></button>`).join('');
      };
      grid.onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        const j = +b.dataset.j, pre = tiles[j]; seeds[j] = rnd();
        b.innerHTML = R.piece(pre, { seed: seeds[j], size: j ? 360 : 620, detail: j ? .6 : .9, colors: R.palette(k, cur).colors, animate: !reduced }) + `<span class="cap">${esc(pre.name)}</span>`;
      };
      $('.fold-swatches', f).onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        cur = +b.dataset.j;
        $$('.fold-swatches button', f).forEach(x => x.setAttribute('aria-checked', x === b));
        paint(false);
      };
      $('.fold-tab', f).onclick = () => {
        $$('.fold', host).forEach(o => { const on = o === f; o.classList.toggle('open', on); $('.fold-tab', o).setAttribute('aria-expanded', on); });
        if (!grid.firstChild) paint(!reduced);
        else if (!reduced) paint(true);
      };
      const p0 = R.palette(k, cur);
      f.style.setProperty('--g', p0.paper); f.style.setProperty('--c', p0.colors[0]); f.style.setProperty('--a', p0.colors[1]);
      $('.palname', f).textContent = p0.name;
      if (i === 0) whenSeen(host, () => paint(!reduced));
    });
  })();

  /* ================= seed machine ================= */
  (function () {
    const OPTS = [['gond', 'Dotted bird'], ['warli', 'Tarpa dance'], ['gond', 'Great peacock'], ['warli', 'Tree with birds'], ['sketch', 'Cat, sitting']];
    const opts = OPTS.map(([k, n]) => R.findPreset(n, k)).filter(Boolean);
    KEYS.forEach(k => { if (!opts.some(p => p.style === k)) { const p = R.presetsOf(k).find(isSquare); if (p) opts.push(p); } });
    let cur = opts[0], seed = cur.seed % 1e6, turn = 0, first = true;
    const reels = $('#reels');
    reels.innerHTML = Array.from({ length: 6 }, () => `<div class="reel"><div class="reel-strip">${Array.from({ length: 40 }, (_, i) => `<span>${i % 10}</span>`).join('')}</div></div>`).join('');
    $('#piecePick').innerHTML = opts.map((p, i) => `<button role="radio" data-i="${i}">${esc(p.name)}</button>`).join('');
    function spin() {
      turn++;
      const digits = String(seed).padStart(6, '0').split('').map(Number);
      $$('.reel-strip', reels).forEach((s, i) => {
        s.style.transitionDelay = (reduced ? 0 : i * 90) + 'ms';
        s.style.setProperty('--d', (turn % 2 ? 20 : 10) + digits[i]);
      });
      $('#seedNow').textContent = 'Seed ' + digits.join('');
    }
    function draw(animate) {
      $$('#piecePick button').forEach(b => b.setAttribute('aria-checked', opts[+b.dataset.i] === cur));
      const k = cur.style, t = theme(k);
      const params = first ? null : R.randParams(S.GENS[cur.gen], S.rngFrom(seed));
      $('.seed-art').style.setProperty('--g', t.bg);
      $('#seedArt').innerHTML = R.piece(cur, { seed, params, size: 620, colors: cols(k), animate: animate && !reduced });
      $('#seedCap').textContent = `${cur.name} · ${nameOf(k)} · seed ${String(seed).padStart(6, '0')}`;
    }
    const pull = () => { first = false; seed = rnd(); spin(); setTimeout(() => draw(true), reduced ? 0 : 650); };
    $('#lever').onclick = pull;
    $('#seedArt').onclick = pull;
    $('#piecePick').onclick = e => { const b = e.target.closest('button'); if (!b) return; cur = opts[+b.dataset.i]; pull(); };
    whenSeen($('#seed'), () => { spin(); draw(true); });
  })();

  /* ================= mural ================= */
  (function () {
    const k = KEYS.includes('warli') ? 'warli' : KEYS[0];
    const H = 1000, W = 7200;
    const P = n => R.findPreset(n, k);
    /* two rows that advance independently; a ring now and then
       spans both, the way a tarpa circle takes over a wall */
    const up = ['Sun and moon', 'Branching tree', 'Flock', 'Peacock', 'Hills', 'Fruiting tree', 'Bird in flight', 'Tree with birds', 'Moon', 'Palm', 'Monkeys in a tree', 'Three huts'];
    const low = ['Hut', 'Cow and calf', 'Water carrier', 'Bullock cart', 'The well', 'Dancing', 'Ploughing', 'Gabled hut', 'Deer', 'Drummer', 'Rider on a horse', 'Water pots', 'Elephant', 'Toddy tapper', 'Basket on the head', 'Goat'];
    const big = ['Tarpa dance', 'Devchauk', 'Great spiral', 'Double ring dance'];
    function compose() {
      const p = R.palette(k, 2), c = p.colors;
      let defs = '', body = '';
      const put = (name, box, seed) => {
        const pre = P(name); if (!pre) return;
        const m = R.pieceMarkup(pre, box, { seed, colors: c, detail: .75, weight: 3.2 });
        defs += m.defs; body += m.body;
      };
      put('Triangle border', { x: 0, y: 0, w: W, h: 64 }, 11);
      put('Dancers over triangles', { x: 0, y: H - 130, w: W, h: 130 }, 12);
      let xu = 40, xl = 80, u = 0, l = 0, b = 0, next = 1300;
      while (Math.min(xu, xl) < W - 200) {
        const x = Math.min(xu, xl);
        if (x > next) {
          const s = 600, bx = Math.max(xu, xl) + 30;
          if (bx + s > W - 40) break;
          put(big[b++ % big.length], { x: bx, y: 110, w: s, h: s + 120 }, rnd());
          xu = xl = bx + s + 40; next = xu + 1500 + Math.random() * 600; continue;
        }
        if (xu <= xl) {
          const s = 230 + Math.random() * 120;
          put(up[u++ % up.length], { x: xu, y: 90 + Math.random() * (380 - s), w: s, h: s }, rnd());
          xu += s + 30 + Math.random() * 60;
        } else {
          const s = 250 + Math.random() * 120;
          put(low[l++ % low.length], { x: xl, y: 440 + Math.random() * (400 - s), w: s, h: s }, rnd());
          xl += s + 20 + Math.random() * 50;
        }
      }
      return `<svg class="piece" viewBox="0 0 ${W} ${H}" role="img" aria-label="A generated Warli wall"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="${p.paper}"/>${body}</svg>`;
    }
    const art = $('#muralArt'), sec = $('#mural'), scroller = $('#muralScroller');
    const driven = matchMedia('(min-width: 821px)');
    function onMove() {
      if (!driven.matches || !art.firstChild) return;
      const r = sec.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / (sec.offsetHeight - innerHeight)));
      const dx = art.getBoundingClientRect().width - scroller.clientWidth;
      art.style.transform = `translate3d(${(-p * Math.max(0, dx)).toFixed(1)}px,0,0)`;
    }
    whenSeen(sec, () => { art.innerHTML = compose(); art.style.width = (scroller.clientHeight * W / H) + 'px'; onMove(); });
    addEventListener('scroll', onMove, { passive: true });
    addEventListener('resize', () => { if (art.firstChild) art.style.width = (scroller.clientHeight * W / H) + 'px'; onMove(); });
  })();

  /* ================= studio bento ================= */
  (function () {
    /* recolour: same drawing, same seed, only the palette moves */
    const ck = KEYS.includes('gond') ? 'gond' : KEYS[0];
    const cpre = R.findPreset('Tree of life with deer', ck) || R.presetsOf(ck).find(isSquare);
    const pals = S.stylePalettes(ck).slice(0, 7), cseed = rnd();
    let cj = Math.min(theme(ck).pal, pals.length - 1);
    const tile = $('#tColour');
    const recolour = animate => {
      const p = R.palette(ck, cj);
      tile.style.setProperty('--g', p.paper); tile.style.setProperty('--c', p.colors[0]);
      $('#colourArt').innerHTML = R.piece(cpre, { seed: cseed, size: 700, colors: p.colors, animate });
      $$('#colourSwatches button').forEach(b => b.setAttribute('aria-checked', +b.dataset.j === cj));
    };
    $('#colourSwatches').innerHTML = pals.map((p, j) => `<button role="radio" data-j="${j}" aria-label="${esc(p[0])}" title="${esc(p[0])}" style="--p1:${p[1]};--p2:${p[2]};--p3:${p[3]}"></button>`).join('');
    $('#colourSwatches').onclick = e => { const b = e.target.closest('button'); if (b) { cj = +b.dataset.j; recolour(false); } };
    whenSeen(tile, () => recolour(!reduced));

    /* the hand: one dial, redrawn live */
    const hk = KEYS.includes('warli') ? 'warli' : KEYS[0];
    const hpre = R.findPreset('Dancing', hk) || R.presetsOf(hk).find(isSquare), hseed = 4242;
    const range = $('#handRange');
    range.value = S.styleOf(hk).hand.rough;
    const drawHand = () => {
      $('#handOut').textContent = (+range.value).toFixed(2);
      $('#handArt').innerHTML = R.piece(hpre, { seed: hseed, size: 300, colors: ['#FCF7EE', '#1F0F09', '#EBD3B4', '#FCF7EE', '#B4603C'], hand: { rough: +range.value, bow: +range.value * 1.2, passes: +range.value > 1 ? 2 : 1 } });
    };
    range.oninput = drawHand;
    whenSeen(range, drawHand);

    /* vector: zoom toward the pointer */
    const vk = KEYS.includes('gond') ? 'gond' : KEYS[0];
    const vpre = R.findPreset('Digna eyes', vk) || R.presetsOf(vk).find(isSquare);
    const vart = $('#vectorArt');
    whenSeen(vart, () => { vart.innerHTML = R.piece(vpre, { seed: rnd(), size: 500, colors: ['#F5EEDC', '#D6336C', '#F2A93B', '#3EA88A', '#123A5C'] }); });
    vart.addEventListener('pointermove', e => {
      const svg = vart.firstChild; if (!svg) return;
      const r = vart.getBoundingClientRect();
      svg.style.transformOrigin = `${((e.clientX - r.left) / r.width * 100).toFixed(1)}% ${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`;
      svg.style.transform = 'scale(3.4)';
    });
    vart.addEventListener('pointerleave', () => { if (vart.firstChild) vart.firstChild.style.transform = ''; });

    /* templates, fanned like prints on a table */
    const want = [['warli', 'Tarpa dance'], ['gond', 'Tree of life'], ['sketch', 'Gig poster']];
    let tpls = want.map(([k, n]) => S.TEMPLATES.find(t => (t.style || 'sketch') === k && t.name === n)).filter(Boolean);
    if (tpls.length < 3) tpls = tpls.concat(S.TEMPLATES.filter(t => !/blank/i.test(t.name) && !tpls.includes(t)).slice(0, 3 - tpls.length));
    const fan = $('#fan');
    whenSeen(fan, () => {
      fan.innerHTML = tpls.map(t => `<figure style="aspect-ratio:${t.w}/${t.h}">${R.template(t, { detail: .5 })}</figure>`).join('');
      const fit = () => R.fitText(fan);
      document.fonts && document.fonts.ready ? document.fonts.ready.then(fit) : fit();
    });

    /* numbers, counted from the packs actually loaded */
    const nums = [[Object.keys(S.GENS).length, 'generators'], [S.PRESETS.length, 'pieces'], [S.TEMPLATES.length, 'templates'], [KEYS.length, 'traditions']];
    const box = $('#numbers');
    box.innerHTML = nums.map(([n, l]) => `<div><b data-n="${n}">${nf(n)}</b><span>${l}</span></div>`).join('');
    whenSeen(box, () => {
      if (reduced) return;
      $$('b', box).forEach(b => {
        const n = +b.dataset.n, t0 = performance.now();
        const step = t => { const k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3); b.textContent = nf(Math.round(n * e)); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    });
  })();

  /* ================= giant wordmark ================= */
  const giant = $('#giant');
  const HUES = ['#F4FF6B', '#FF2D55', '#B4603C', '#3EA88A', '#F2A93B', '#D6336C'];
  giant.innerHTML = 'SCRAWL'.split('').map((c, i) => `<span style="--h:${HUES[i % HUES.length]}" aria-hidden="true">${c}</span>`).join('');
  function fitGiant() {
    const W = giant.clientWidth; if (!W) return;
    const spans = $$('span', giant);
    spans.forEach(s => { s.style.fontSize = '100px'; s.style.fontStretch = '112%'; });
    const tot = spans.reduce((a, s) => a + s.getBoundingClientRect().width, 0);
    spans.forEach(s => { s.style.fontSize = (100 * W / tot * .97).toFixed(1) + 'px'; s.style.fontStretch = ''; });
  }

  /* ================= layout ================= */
  fitAll();
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => { fitAll(); ghostPaint(small() ? 14 : 24); });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fitAll, 120); });
})();
