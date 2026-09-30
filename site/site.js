/* ============================================================
   SCRAWL / site — the page
   Every drawing here is generated live by the editor's own
   generators (render.js is the bridge). Traditions, palettes,
   pieces, templates and counts are read from the loaded packs,
   so a tradition added to the editor turns up here on its own.

   Everything a person might want to change without reading the
   code is in CONFIG below: links, prices, plan features, and the
   optional per-tradition picks. Anything left out falls back.
   ============================================================ */
(function () {
  const S = window.SCRAWL, R = window.SITE;
  const STYLES = S.STYLES, KEYS = R.styleKeys();
  const nf = n => n.toLocaleString('en-US');
  const count = k => S.PRESETS.filter(p => p.style === k).length;
  const tplsOf = k => S.TEMPLATES.filter(t => (t.style || 'sketch') === k && (t.items || []).length);
  const TOTAL = {
    trads: KEYS.length,
    pieces: S.PRESETS.length,
    gens: Object.keys(S.GENS).length,
    tpls: S.TEMPLATES.filter(t => (t.items || []).length).length,
    pals: KEYS.reduce((n, k) => n + S.stylePalettes(k).length, 0),
  };

  /* ================= CONFIG ================= */
  const CONFIG = {
    editor: '../index.html',
    /* Traditions that were added most recently; named in the hero badge. */
    newest: ['madhubani', 'pattachitra', 'kalamkari'],

    /* Optional per-tradition picks. Anything not listed falls back to
       the tradition's own first palette, templates and pieces. */
    trad: {
      warli: { pal: 3, hero: 'Village wall', pieces: ['Tarpa dance', 'Tree with birds', 'Peacock', 'Bullock cart', 'Water carrier', 'Sun and moon'] },
      gond: { pal: 4, hero: 'Tree of life', pieces: ['Tree of life with deer', 'Great peacock', 'Coiled serpent', 'Dotted owl', 'Seeded elephant', 'Mahua in flower'] },
      madhubani: { pal: 0, hero: 'Two fish', pieces: ['Pair of fish', 'Bride and groom', 'Elephant with rider', 'Circling fish', 'Mithila woman', 'Turtle'] },
      pattachitra: { pal: 1, hero: 'Guardian lions', pieces: ['Great peacock', 'Facing lions', 'Flute player', 'Dancer', 'Tree with birds', 'Facing elephants'] },
      kalamkari: { pal: 0, hero: 'Palampore', pieces: ['Paisley rosette', 'Pair of peacocks', 'Paisley on a vine', 'Peacock', 'Lotus', 'Pomegranate'] },
      sketch: { pal: 26, hero: 'Event poster', pals: [26, 1, 3, 9, 14, 21, 7, 0, 2, 4, 5, 6], pieces: ['Cat, sitting', 'Sunflower', 'Rocket', 'Espresso cup', 'Mushroom', 'Potted plant'] },
    },

    /* Plans mirror plan.js in the editor. When the editor ships plan.js
       it is loaded here too and read directly (SCRAWL.PLAN), so prices,
       Pro features and checkout links live in one place. These are the
       fallback when it is not there. */
    plan: {
      prices: {
        monthly: { label: 'Pro monthly', price: '$9', per: '/ month', note: 'Cancel any time' },
        lifetime: { label: 'Pro for life', price: '$49', per: 'once', note: 'Pay once, keep every update' },
      },
      free: [
        'Every tradition, library piece and template',
        'All 217 fonts, including Indian scripts',
        'PNG, JPG and WebP export up to 2×',
        'Unlimited files, saved in your browser',
      ],
      pro: ['Export at 3× and 4×', 'Transparent backgrounds', 'SVG and PDF export', 'Print with bleed and crop marks', 'Brand kit: your colours and fonts, one click away'],
      checkout: { monthly: '', lifetime: '' },
    },
    faq: [
      ['Do I need an account?', 'No. Scrawl runs in your browser and saves your work there. Nothing is uploaded unless you export it.'],
      ['What is free during the beta?', 'Everything. While Scrawl is in beta every Pro feature is unlocked and wears a small Pro badge. At launch, Free keeps every tradition, library piece, template and font.'],
      ['What does Pro for life include?', 'Everything in Pro for a single payment, with every update that comes after you buy.'],
      ['Can I cancel Pro monthly?', 'Any time. You keep Pro until the end of the month you paid for, and your files stay yours.'],
      ['Where do the traditions come from?', 'Each one is encoded from the visual rules of a living tradition: its grounds, pigments, line and fill. They are made and kept alive by communities of artists across India, so if you love the look, buy work from the artists themselves.'],
      ['Does it work on a tablet?', 'Scrawl runs in any modern browser. It is at its best on a laptop or desktop, with a mouse or trackpad.'],
    ],
  };

  /* ================= helpers ================= */
  const $ = (q, r) => (r || document).querySelector(q);
  const $$ = (q, r) => [...(r || document).querySelectorAll(q)];
  const esc = R.esc;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = () => 1 + Math.floor(Math.random() * 999998);
  const nameOf = k => STYLES[k].name;
  const isSquare = p => S.GENS[p.gen] && S.GENS[p.gen].aspect !== 'free';
  const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  const word = n => WORDS[n] || String(n);
  const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const cfg = k => CONFIG.trad[k] || {};
  const palIdx = k => { const n = S.stylePalettes(k).length, p = cfg(k).pal || 0; return p < n ? p : 0; };
  const palsFor = (k, max) => {
    const n = S.stylePalettes(k).length;
    const pick = (cfg(k).pals || [...Array(n).keys()]).filter(i => i < n);
    return pick.slice(0, max);
  };
  function piecesFor(k, want) {
    const out = (cfg(k).pieces || []).map(n => R.findPreset(n, k)).filter(p => p && isSquare(p));
    const rest = R.presetsOf(k).filter(p => isSquare(p) && !out.includes(p));
    while (out.length < want && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    return out;
  }
  function whenSeen(elm, fn, margin) {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin || '200px' });
    io.observe(elm);
  }
  function draw(pre, k, pal, o) {
    const p = R.palette(k, pal);
    return R.piece(pre, Object.assign({ colors: p.colors, pad: .02, size: 520 }, o || {}));
  }
  const ICON = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };

  /* ================= editor links ================= */
  $$('[data-editor]').forEach(a => a.href = CONFIG.editor);
  $('#year').textContent = new Date().getFullYear();

  /* ================= nav ================= */
  const nav = $('#nav'), menu = $('#navMenu'), links = $('#navLinks');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = open => { links.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); };
  menu.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ================= hero copy ================= */
  (function () {
    const names = KEYS.map(k => k === 'sketch' ? 'sketchbook' : nameOf(k));
    $('#heroLede').textContent = `Scrawl is a design studio for ${list(names)} art. Every mark is generated from the rules of its tradition, so no two drawings are the same, and it all runs in your browser.`;
    const fresh = CONFIG.newest.filter(k => STYLES[k]).map(nameOf);
    $('#eyebrow').textContent = fresh.length ? `New: ${list(fresh)}` : `${word(TOTAL.trads)} traditions, one studio`;
  })();

  /* ================= the live app ================= */
  (function app() {
    const board = $('#board'), art = $('#boardArt'), canvas = $('#appCanvas');
    const st = { k: KEYS[0], tpl: null, pal: 0, seed: 0, base: 0, wobble: 0 };
    let touched = false, timer = 0, visible = true;

    $('#appTrads').innerHTML = KEYS.map(k => {
      const p = R.palette(k, palIdx(k));
      return `<button class="trad-tab" role="tab" data-k="${k}" aria-selected="false">
        <span class="sw" style="background:${p.paper}"><svg viewBox="0 0 22 22"><circle cx="9.5" cy="9.5" r="5" fill="${p.colors[0]}"/><circle cx="15" cy="15" r="3" fill="${p.colors[1]}"/></svg></span>
        ${esc(nameOf(k))}<span class="n">${count(k)}</span></button>`;
    }).join('');

    function heroTpl(k) {
      const all = tplsOf(k);
      return all.find(t => t.name === cfg(k).hero) || all[0] || null;
    }
    function baseSeed(tpl) { let h = 7; for (const c of tpl.name) h = (h * 31 + c.charCodeAt(0)) % 999983; return 100000 + h % 900000; }

    function setTrad(k, animate) {
      st.k = k; st.wobble = S.styleOf(k).hand.rough;
      $$('.trad-tab').forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
      const sel = $(`.trad-tab[data-k="${k}"]`);
      if (sel && innerWidth <= 900) { const r = sel.parentNode; r.scrollTo({ left: sel.offsetLeft - 10, behavior: reduced ? 'auto' : 'smooth' }); }
      $('#appTradName').textContent = nameOf(k);
      $('#appNote').textContent = STYLES[k].note || '';
      const tpls = tplsOf(k);
      $('#appTpls').innerHTML = tpls.map((t, i) => `<button class="tpl-item ${t.w / t.h > 1.15 ? 'wide' : t.w / t.h > .9 ? 'sq' : ''}" role="option" data-i="${i}">${esc(t.name)}</button>`).join('');
      buildPals();
      setTpl(heroTpl(k), animate);
    }
    function setTpl(tpl, animate) {
      st.tpl = tpl;
      if (!tpl) { art.innerHTML = ''; return; }
      st.pal = tpl.pal || 0; st.base = baseSeed(tpl); st.seed = st.base;
      $$('.tpl-item').forEach(b => b.setAttribute('aria-selected', tplsOf(st.k)[b.dataset.i] === tpl));
      $('#appFile').textContent = tpl.name;
      markPal();
      paint(animate);
    }
    function buildPals() {
      const k = st.k;
      $('#appPals').innerHTML = palsFor(k, 12).map(i => {
        const p = R.palette(k, i);
        return `<button class="pal" role="radio" data-i="${i}" aria-label="${esc(p.name)}" title="${esc(p.name)}" style="background:${p.paper}"><i style="background:${p.colors[0]}"></i><i style="background:${p.colors[1]}"></i></button>`;
      }).join('');
    }
    function markPal() {
      let found = false;
      $$('.pal').forEach(b => { const on = +b.dataset.i === st.pal; found = found || on; b.setAttribute('aria-checked', on); });
      if (!found) { /* the template's own palette is outside the shortlist: show it first */
        const p = R.palette(st.k, st.pal), b = document.createElement('button');
        b.className = 'pal'; b.setAttribute('role', 'radio'); b.dataset.i = st.pal; b.setAttribute('aria-checked', 'true');
        b.title = p.name; b.setAttribute('aria-label', p.name); b.style.background = p.paper;
        b.innerHTML = `<i style="background:${p.colors[0]}"></i><i style="background:${p.colors[1]}"></i>`;
        $('#appPals').prepend(b);
      }
      $('#palName').textContent = R.palette(st.k, st.pal).name;
    }
    function fit() {
      const t = st.tpl; if (!t) return;
      const cs = getComputedStyle(canvas);
      const w = canvas.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = canvas.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const s = Math.min(w / t.w, h / t.h);
      board.style.width = Math.floor(t.w * s) + 'px';
      board.style.height = Math.floor(t.h * s) + 'px';
      $('#boardLabel').textContent = `${t.name}  ·  ${t.w} × ${t.h}`;
    }
    function paint(animate) {
      const t = st.tpl; if (!t) return;
      fit();
      art.innerHTML = R.template(t, { pal: st.pal, seed: st.seed === st.base ? 0 : st.seed, hand: { rough: st.wobble }, animate: animate && !reduced, detail: .8 });
      const svg = art.querySelector('svg'); svg.style.setProperty('--span', '1.2s'); svg.style.setProperty('--dur', '.8s');
      R.fitText(art);
      $('#appSeed').textContent = String(st.seed).padStart(6, '0');
      $('#appWobble').value = st.wobble; $('#appWobbleOut').textContent = st.wobble.toFixed(2);
      if (animate) { board.classList.remove('swap'); void board.offsetWidth; board.classList.add('swap'); }
    }
    let raf = 0;
    const repaint = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => paint(false)); };

    const stop = () => { touched = true; clearInterval(timer); };
    $('#app').addEventListener('pointerdown', stop);
    $('#app').addEventListener('keydown', stop);
    $('#appTrads').addEventListener('click', e => { const b = e.target.closest('.trad-tab'); if (b && b.dataset.k !== st.k) setTrad(b.dataset.k, true); });
    $('#appTrads').addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const i = KEYS.indexOf(st.k), d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
      setTrad(KEYS[(i + d + KEYS.length) % KEYS.length], true); $(`.trad-tab[data-k="${st.k}"]`).focus();
    });
    $('#appTpls').addEventListener('click', e => { const b = e.target.closest('.tpl-item'); if (b) setTpl(tplsOf(st.k)[b.dataset.i], true); });
    $('#appPals').addEventListener('click', e => { const b = e.target.closest('.pal'); if (!b) return; st.pal = +b.dataset.i; markPal(); repaint(); });
    $('#appWobble').addEventListener('input', e => { st.wobble = +e.target.value; repaint(); });
    $('#appShuffle').addEventListener('click', () => { st.seed = rnd(); paint(true); });
    if ('ResizeObserver' in window) new ResizeObserver(() => fit()).observe(canvas); else addEventListener('resize', fit);
    if (document.fonts) document.fonts.ready.then(() => R.fitText(art));

    setTrad(st.k, true);

    /* until someone touches it, the app walks through the traditions */
    if (!reduced) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .35 }).observe($('#app'));
      timer = setInterval(() => {
        if (touched || !visible || document.hidden) return;
        setTrad(KEYS[(KEYS.indexOf(st.k) + 1) % KEYS.length], true);
      }, 6000);
    }
  })();

  /* ================= stats ================= */
  (function () {
    const items = [[TOTAL.trads, 'art traditions'], [TOTAL.pieces, 'pieces that draw themselves'], [TOTAL.tpls, 'finished templates'], [TOTAL.pals, 'historical palettes']];
    $('#stats').innerHTML = items.map(([n, l]) => `<div class="stat"><b data-n="${n}">${nf(n)}</b><span>${l}</span></div>`).join('');
    if (reduced) return;
    whenSeen($('#stats'), () => $$('#stats b').forEach(b => {
      const n = +b.dataset.n, t0 = performance.now(), d = 1100;
      const tick = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); b.textContent = nf(Math.round(n * e)); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), '-10% 0px');
  })();

  /* ================= traditions ================= */
  (function () {
    $('#tradTitle').textContent = `${word(TOTAL.trads)} traditions. Each with its own rules.`;
    const grid = $('#tradGrid');
    KEYS.forEach(k => {
      const pals = palsFor(k, 5); let pal = palIdx(k); if (!pals.includes(pal)) pals[pals.length - 1] = pal;
      const pieces = piecesFor(k, 6); let at = 0, seed = null;
      const card = document.createElement('article');
      card.className = 'trad rise';
      card.innerHTML = `
        <button class="trad-art" aria-label="Redraw the ${esc(nameOf(k))} example"></button>
        <div class="trad-body">
          <div class="trad-top"><h3>${esc(nameOf(k))}</h3><span class="trad-where">${esc(STYLES[k].where || '')}</span></div>
          <p class="trad-note">${esc(STYLES[k].note || '')}</p>
          <div class="trad-foot">
            <span class="trad-meta">${count(k)} pieces · ${tplsOf(k).length} templates</span>
            <div class="trad-sws" role="group" aria-label="${esc(nameOf(k))} palettes">${pals.map(i => { const p = R.palette(k, i); return `<button data-i="${i}" title="${esc(p.name)}" aria-label="${esc(p.name)}" aria-pressed="${i === pal}" style="background:linear-gradient(135deg, ${p.paper} 50%, ${p.colors[0]} 50%)"></button>`; }).join('')}</div>
          </div>
        </div>`;
      grid.appendChild(card);
      const box = $('.trad-art', card);
      const paint = animate => {
        const pre = pieces[at]; if (!pre) return;
        box.style.setProperty('--g', R.palette(k, pal).paper);
        box.innerHTML = draw(pre, k, pal, { animate: animate && !reduced, seed });
      };
      box.addEventListener('click', () => { at = (at + 1) % pieces.length; seed = null; paint(true); });
      $('.trad-sws', card).addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        pal = +b.dataset.i; $$('.trad-sws button', card).forEach(x => x.setAttribute('aria-pressed', x === b)); paint(false);
      });
      box.style.setProperty('--g', R.palette(k, pal).paper);
      whenSeen(card, () => paint(true), '0px');
    });
  })();

  /* ================= library marquee ================= */
  (function () {
    $('#libLede').textContent = `${nf(TOTAL.pieces)} pieces across ${TOTAL.gens} generators. Every piece is a small program, not a picture: change a dial or a seed and it draws again, in the same hand.`;
    const mq = $('#marquee');
    whenSeen(mq, () => {
      const pool = KEYS.flatMap(k => piecesFor(k, 6).map(p => [k, p]));
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const half = Math.ceil(pool.length / 2);
      [pool.slice(0, half), pool.slice(half)].forEach((row, r) => {
        const tiles = row.map(([k, p]) => {
          const pals = palsFor(k, 8), pal = pals[Math.floor(Math.random() * pals.length)], c = R.palette(k, pal);
          return `<div class="mq-tile" style="--g:${c.paper};--f:${c.colors[0]}">${R.piece(p, { colors: c.colors, pad: .02, size: 300, detail: .7 })}<span>${esc(p.name)}</span></div>`;
        }).join('');
        const el = document.createElement('div');
        el.className = 'mq-row' + (r ? ' rev' : ''); el.style.setProperty('--t', (row.length * 4.2) + 's');
        el.innerHTML = tiles + tiles;
        mq.appendChild(el);
      });
    }, '400px');
  })();

  /* ================= steps ================= */
  (function () {
    const one = k => piecesFor(k, 1)[0];
    /* 1: the traditions */
    const t = $('#stepTrads');
    whenSeen(t, () => {
      t.innerHTML = KEYS.slice(0, 6).map(k => {
        const p = R.palette(k, palIdx(k)), pre = one(k);
        return `<div class="st-card" style="--g:${p.paper};--f:${p.colors[0]}">${pre ? draw(pre, k, palIdx(k), { size: 260 }) : ''}<b>${esc(nameOf(k))}</b></div>`;
      }).join('');
    });
    /* 2: a seed you can shuffle */
    const sv = $('#stepSeed');
    const sk = STYLES.gond ? 'gond' : KEYS[0];
    const spre = R.findPreset('Great peacock', sk) || one(sk);
    const spal = palIdx(sk);
    let sseed = spre ? spre.seed : 0;
    const spaint = animate => {
      if (!spre) return;
      sv.style.setProperty('--g', R.palette(sk, spal).paper);
      sv.innerHTML = draw(spre, sk, spal, { seed: sseed, animate: animate && !reduced, size: 420 }) + `<span class="seed-chip">seed ${String(sseed).padStart(6, '0')}</span>`;
    };
    const shuffle = () => { sseed = rnd(); spaint(true); };
    sv.addEventListener('click', shuffle);
    sv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shuffle(); } });
    $('#stepShuffle').addEventListener('click', shuffle);
    whenSeen(sv, () => spaint(true), '0px');
    /* 3: export, with crop marks */
    const ex = $('#stepExport');
    const ek = STYLES.madhubani ? 'madhubani' : KEYS[0];
    const epre = one(ek), ep = R.palette(ek, palIdx(ek));
    const L = 12, G = 6;
    const marks = [
      [`left:-${L + G}px;top:0;width:${L}px;height:1px`], [`left:0;top:-${L + G}px;width:1px;height:${L}px`],
      [`right:-${L + G}px;top:0;width:${L}px;height:1px`], [`right:0;top:-${L + G}px;width:1px;height:${L}px`],
      [`left:-${L + G}px;bottom:0;width:${L}px;height:1px`], [`left:0;bottom:-${L + G}px;width:1px;height:${L}px`],
      [`right:-${L + G}px;bottom:0;width:${L}px;height:1px`], [`right:0;bottom:-${L + G}px;width:1px;height:${L}px`],
    ].map(([s]) => `<i style="position:absolute;background:#141312;${s}"></i>`).join('');
    ex.innerHTML = `<div class="ex-sheet" style="--g:${ep.paper}"><div class="ex-art">${epre ? R.piece(epre, { colors: ep.colors, pad: .02, size: 300 }) : ''}</div>${marks}</div>
      <div class="ex-fmts"><span>PNG · JPG · WebP</span><span>SVG <b class="pro">Pro</b></span><span>PDF + bleed <b class="pro">Pro</b></span><span>4× <b class="pro">Pro</b></span></div>`;
    whenSeen(ex, () => ex.classList.add('in'), '-15% 0px');
  })();

  /* ================= templates ================= */
  (function () {
    const rail = $('#tplRail'), filter = $('#tplFilter');
    const keys = KEYS.filter(k => tplsOf(k).length);
    $('#tplTitle').textContent = `Start from ${TOTAL.tpls} finished designs.`;
    filter.innerHTML = [['all', 'All']].concat(keys.map(k => [k, nameOf(k)])).map(([k, n], i) => `<button class="chip" role="tab" data-k="${k}" aria-selected="${i === 0}">${esc(n)}</button>`).join('');
    /* "All" deals the traditions out in turn, so the first screen shows each of them */
    const dealt = () => { const ls = keys.map(tplsOf), out = []; for (let i = 0; ls.some(l => l[i]); i++) ls.forEach(l => l[i] && out.push(l[i])); return out; };
    let io = null;
    function show(k) {
      const ts = k === 'all' ? dealt() : tplsOf(k);
      if (io) io.disconnect();
      rail.innerHTML = ts.map((t, i) => {
        const tk = t.style || 'sketch', p = R.palette(tk, t.pal || 0);
        return `<a class="tpl" href="${CONFIG.editor}" data-i="${i}"><div class="tpl-frame" style="aspect-ratio:${t.w}/${t.h};--g:${p.paper}"></div><div class="tpl-cap"><b>${esc(t.name)}</b><span>${esc(nameOf(tk))}</span></div></a>`;
      }).join('');
      rail.scrollLeft = 0;
      io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        const f = $('.tpl-frame', e.target); f.innerHTML = R.template(ts[e.target.dataset.i], { detail: .7 }); R.fitText(f);
      }), { root: rail, rootMargin: '0px 600px' }) : null;
      $$('.tpl', rail).forEach(a => io ? io.observe(a) : ($('.tpl-frame', a).innerHTML = R.template(ts[a.dataset.i], { detail: .7 })));
      navState();
    }
    filter.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', filter).forEach(x => x.setAttribute('aria-selected', x === b)); show(b.dataset.k);
    });
    const prev = $('#tplPrev'), next = $('#tplNext');
    function navState() { prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4; }
    rail.addEventListener('scroll', navState, { passive: true });
    prev.addEventListener('click', () => rail.scrollBy({ left: -rail.clientWidth * .8, behavior: reduced ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: rail.clientWidth * .8, behavior: reduced ? 'auto' : 'smooth' }));
    whenSeen(rail, () => show('all'), '600px');
    if (document.fonts) document.fonts.ready.then(() => R.fitText(rail));
  })();

  /* ================= features ================= */
  (function () {
    const F = [
      ['M12 20l-7-7 3-9h8l3 9z M12 20V11 M12 11a1.6 1.6 0 1 0 0-.01', 'Vector to the core', 'Every line is a real path, so SVG and PDF exports print sharp, cut on a vinyl cutter and scale to a billboard.', 1],
      ['M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z M7.5 11.5h.01 M9.5 7.5h.01 M14.5 7.5h.01', 'Recolour anything', 'Pieces draw with roles, not fixed colours. Pick a palette and the whole page repaints at once.'],
      ['M5 4h14v16l-7-4-7 4z', 'Your brand kit', 'Save your palette and two typefaces once, and every new file starts on brand.', 1],
      ['M7 9V3h10v6 M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3 M7 14h10v7H7z', 'Print-ready PDF', 'Export at print resolution with bleed and crop marks, ready to hand to a printer.', 1],
      ['M6 11V8a6 6 0 0 1 12 0v3 M5 11h14v10H5z M12 15v2', 'Private by default', 'No account and no upload. Your work saves in your browser and stays on your machine.'],
      ['M4 4h16v16H4z M9 9h.01 M15 15h.01 M15 9h.01 M9 15h.01 M12 12h.01', 'Same seed, same drawing', 'A drawing is a number. Keep the seed and you can always draw the exact same piece again.'],
    ];
    $('#feats').innerHTML = F.map(([d, h, p, pro]) => `<div class="feat rise"><div class="feat-ic"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></div><h3>${h}${pro ? ' <span class="pro">Pro</span>' : ''}</h3><p>${p}</p></div>`).join('');
  })();

  /* ================= pricing ================= */
  (function () {
    const P = S.PLAN || {}, C = CONFIG.plan;
    const prices = P.PRICES || C.prices;
    const free = P.FREE || C.free;
    const pro = P.FEATURES ? Object.values(P.FEATURES).filter(f => f.pro).map(f => f.label) : C.pro;
    const checkout = P.CHECKOUT || C.checkout;
    /* no checkout link yet means the beta: every Pro feature is open */
    const beta = !checkout.monthly && !checkout.lifetime;
    const m = prices.monthly, l = prices.lifetime;
    const plans = [
      { id: 'free', name: 'Free', price: '$0', per: 'forever', blurb: 'Everything you need to make the work.', href: CONFIG.editor, cta: 'Start drawing', small: 'No account needed.', features: free },
      { id: 'monthly', name: m.label, price: m.price, per: m.per, blurb: 'For getting the work out into the world.', href: checkout.monthly, cta: `Choose ${m.label.toLowerCase()}`, small: m.note, lead: 'Everything in Free, plus', features: pro },
      { id: 'lifetime', name: l.label, price: l.price, per: l.per, tag: 'Best value', pick: true, blurb: 'All of Pro for one payment, with every update after.', href: checkout.lifetime, cta: `Choose ${l.label.toLowerCase()}`, small: l.note, lead: 'Everything in Pro, plus', features: ['Every future update', 'No subscription to manage'] },
    ];
    if (beta) plans.forEach(p => { if (p.id !== 'free') { p.cta = 'Free during beta'; p.href = CONFIG.editor; p.small = 'Every Pro feature is open until launch.'; } });
    const tick = ICON.check;
    $('#planBeta').hidden = !beta;
    $('#plans').innerHTML = plans.map(p => `
      <article class="plan${p.pick ? ' plan--pick' : ''} rise" id="plan-${p.id}">
        <div class="plan-top"><h3 class="plan-name">${esc(p.name)}</h3>${p.tag ? `<span class="plan-tag">${esc(p.tag)}</span>` : ''}</div>
        <div class="plan-price"><b>${esc(p.price)}</b><span>${esc(p.per)}</span></div>
        <p class="plan-blurb">${esc(p.blurb)}</p>
        <a class="btn ${p.pick ? '' : 'btn--on-dark'}" href="${esc(p.href)}"${/^https?:/.test(p.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(p.cta)}</a>
        <p class="plan-small">${esc(p.small || '')}</p>
        <ul class="plan-list">${p.lead ? `<li class="lead">${esc(p.lead)}</li>` : ''}${p.features.map(f => `<li>${tick}<span>${esc(f)}</span></li>`).join('')}</ul>
      </article>`).join('');
    const cell = v => v === true ? `<svg class="y" viewBox="0 0 24 24" aria-label="Included"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>` : v === false ? '<span class="no" aria-label="Not included">—</span>' : esc(v);
    const rows = free.map(f => [f, true, true, true]).concat(pro.map(f => [f, false, true, true]), [['Billing', 'Free', m.per.replace(/^\/\s*/, 'Every '), 'Once']]);
    $('#compare').innerHTML = `<thead><tr><th scope="col"><span class="sr-only">Feature</span></th>${plans.map(p => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map(v => `<td>${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    $('#faqList').innerHTML = CONFIG.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  })();

  /* ================= close ================= */
  (function () {
    const box = $('#closeArt');
    const k = STYLES.warli ? 'warli' : KEYS[0];
    const t = tplsOf(k).find(x => x.name === 'Tarpa dance') || tplsOf(k)[0];
    if (!t) return;
    const pal = 2 < S.stylePalettes(k).length ? 2 : 0;
    box.style.setProperty('--g', R.palette(k, pal).paper);
    whenSeen(box, () => { box.innerHTML = R.template(t, { pal, animate: !reduced, detail: .8 }); const s = $('svg', box); s.style.setProperty('--span', '1.6s'); }, '0px');
  })();

  /* ================= entrance ================= */
  $$('.sec-head, .step, .stat').forEach(e => e.classList.add('rise'));
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rise').forEach(e => io.observe(e));
  } else $$('.rise').forEach(e => e.classList.add('in'));
})();
