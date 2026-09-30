/* ============================================================
   SCRAWL / site — the little bit of behaviour the page needs
   ------------------------------------------------------------
   Everything you see is plain HTML and pre-drawn SVG (see
   build.js), so the page is readable before, and without, this
   script. Here: the phone menu, pricing links, and the "Have a
   go" demo, which loads the editor's real engine only when a
   visitor gets near it.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    editor: '../index.html',
    /* When billing exists, put the checkout pages here. Until then
       the Pro buttons say "Free during beta" and open the studio. */
    checkout: { monthly: '', lifetime: '' },
    /* the template each tradition opens with in the demo */
    firstTemplate: { warli: 'Village wall', gond: 'Tree of life', madhubani: 'Two fish', pattachitra: 'Guardian lions', kalamkari: 'Palampore', sketch: 'Event poster' },
    /* faces the templates set their words in; loaded with the demo */
    templateFonts: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&family=Bebas+Neue&family=Anton&family=Archivo+Black&family=Caveat:wght@700&family=Chivo+Mono:wght@500&family=Alfa+Slab+One&family=Bricolage+Grotesque:wght@700&family=Space+Grotesk:wght@600&family=Syne:wght@700&family=Unbounded:wght@700&family=Playfair+Display:wght@700&family=Fraunces:wght@600&family=Cormorant+Garamond:wght@600&display=swap',
    /* used only if the editor's own script list can't be read */
    fallbackScripts: ['engine.js', 'icons.js', 'gens.js', 'gens2.js', 'gens3.js', 'gens4.js', 'presets.js', 'presets2.js', 'presets3.js',
      'warli.js', 'warli-presets.js', 'gond.js', 'gond-presets.js', 'madhubani.js', 'madhubani-presets.js', 'pattachitra.js', 'pattachitra-presets.js',
      'kalamkari.js', 'kalamkari-presets.js', 'styles.js', 'templates.js', 'templates2.js', 'warli-templates.js', 'gond-templates.js',
      'madhubani-templates.js', 'pattachitra-templates.js', 'kalamkari-templates.js', 'data.js'],
  };

  function $(q, r) { return (r || document).querySelector(q); }
  function $$(q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  each($$('[data-editor]'), function (a) { a.href = CONFIG.editor; });
  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- pricing: checkout links, when there are any ---------- */
  var live = CONFIG.checkout.monthly || CONFIG.checkout.lifetime;
  if (live) {
    var beta = $('#betaNote'); if (beta) beta.hidden = true;
    each($$('[data-buy]'), function (b) {
      var href = CONFIG.checkout[b.getAttribute('data-buy')];
      if (!href) return;
      b.removeAttribute('data-editor');
      b.href = href;
      b.textContent = b.getAttribute('data-buy') === 'lifetime' ? 'Get Pro for life' : 'Go Pro monthly';
    });
  }

  /* ---------- phone menu ---------- */
  var btn = $('#menuBtn'), menu = $('#menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('open', open);
    btn.firstElementChild.textContent = open ? 'Close' : 'Menu';
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.top')) setMenu(false);
    });
  }

  /* ================= HAVE A GO: the live demo ================= */
  var demo = $('#demo');
  if (!demo) return;
  var status = $('#demoStatus'), board = $('#demoBoard'), shuffle = $('#demoShuffle');
  var wanted = null, loading = false, ready = false, api = null;

  /* the "Try Gond" links on the cards pick a tradition for the demo */
  each($$('[data-trad]'), function (a) {
    a.addEventListener('click', function () {
      wanted = a.getAttribute('data-trad');
      if (ready) api.setTrad(wanted); else load();
    });
  });

  function script(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = ok; s.onerror = function () { fail(new Error(src)); };
      document.body.appendChild(s);
    });
  }
  function scriptList() {
    return fetch(CONFIG.editor).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
      var list = [], re = /<script\s+src="([^"]+)"/g, m;
      while ((m = re.exec(html))) {
        if (m[1] === 'app.js') break;
        if (!/^(https?:)?\/\//.test(m[1])) list.push(m[1]);
      }
      return list.length ? list : CONFIG.fallbackScripts;
    }).catch(function () { return CONFIG.fallbackScripts; });
  }
  function load() {
    if (loading) return;
    loading = true;
    status.textContent = 'Loading the studio…';
    var fonts = document.createElement('link');
    fonts.rel = 'stylesheet'; fonts.href = CONFIG.templateFonts;
    document.head.appendChild(fonts);
    var base = CONFIG.editor.replace(/[^/]*$/, '');
    scriptList().then(function (list) {
      /* async=false keeps them in order while they download together */
      return Promise.all(list.map(function (f) { return script(base + f); }).concat([script('render.js')]));
    }).then(function () {
      api = start();
      ready = true;
      demo.setAttribute('data-state', 'ready');
      api.setTrad(wanted || api.first);
    }).catch(function (e) {
      console.warn('demo', e);
      demo.setAttribute('data-state', 'failed');
      status.textContent = 'The live demo could not load here. The full studio will still open.';
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
    }, { rootMargin: '400px 0px' });
    io.observe(demo);
  } else load();

  function start() {
    var S = window.SCRAWL, R = window.SITE;
    var keys = R.styleKeys();
    var st = { k: null, tpl: null, pal: 0, seed: 0 };
    var trads = $('#demoTrads'), tpls = $('#demoTpls'), pals = $('#demoPals');

    function tplsOf(k) { return S.TEMPLATES.filter(function (t) { return (t.style || 'sketch') === k && (t.items || []).length; }); }
    function palsFor(k) {
      var n = S.stylePalettes(k).length, all = [];
      for (var i = 0; i < n; i++) all.push(i);
      return (k === 'sketch' ? [26, 1, 3, 9, 14, 21, 7, 0, 2, 4, 5, 6] : all).filter(function (i) { return i < n; }).slice(0, 12);
    }
    function vars(p) { return '--g:' + p.paper + ';--f:' + p.colors[0] + ';--a:' + p.colors[1]; }
    function esc(s) { return R.esc(s); }

    trads.innerHTML = keys.map(function (k) {
      return '<button type="button" class="chip" aria-pressed="false" data-k="' + k + '" style="' + vars(R.palette(k, 0)) + '"><span class="dot" aria-hidden="true"></span>' + esc(S.STYLES[k].name) + '</button>';
    }).join('');

    function pressed(list, fn) { each(list, function (b) { b.setAttribute('aria-pressed', fn(b) ? 'true' : 'false'); }); }
    function setTrad(k) {
      if (keys.indexOf(k) < 0) k = keys[0];
      st.k = k;
      pressed($$('.chip[data-k]', trads), function (b) { return b.getAttribute('data-k') === k; });
      var list = tplsOf(k);
      tpls.innerHTML = list.map(function (t, i) { return '<button type="button" class="chip chip--plain" aria-pressed="false" data-i="' + i + '">' + esc(t.name) + '</button>'; }).join('');
      pals.innerHTML = palsFor(k).map(function (i) {
        var p = R.palette(k, i);
        return '<button type="button" class="sw" aria-pressed="false" data-i="' + i + '" style="' + vars(p) + '" aria-label="' + esc(p.name) + '" title="' + esc(p.name) + '"></button>';
      }).join('');
      var first = list.filter(function (t) { return t.name === CONFIG.firstTemplate[k]; })[0] || list[0];
      $('#demoRule').textContent = S.STYLES[k].note || '';
      setTpl(first);
    }
    function setTpl(t) {
      st.tpl = t; st.seed = 0;
      st.pal = t && t.pal != null ? t.pal : 0;
      var list = tplsOf(st.k);
      pressed($$('.chip', tpls), function (b) { return list[+b.getAttribute('data-i')] === t; });
      render();
    }
    function markPal() {
      var found = false;
      pressed($$('.sw', pals), function (b) { var on = +b.getAttribute('data-i') === st.pal; found = found || on; return on; });
      if (!found) {
        var p = R.palette(st.k, st.pal);
        pals.insertAdjacentHTML('afterbegin', '<button type="button" class="sw" aria-pressed="true" data-i="' + st.pal + '" style="' + vars(p) + '" aria-label="' + esc(p.name) + '" title="' + esc(p.name) + '"></button>');
      }
      $('#palName').textContent = R.palette(st.k, st.pal).name;
    }
    function fit() {
      var svg = $('svg', board), t = st.tpl;
      if (!svg || !t) return;
      var w = board.clientWidth, h = board.clientHeight, s = Math.min(w / t.w, h / t.h);
      svg.style.width = Math.floor(t.w * s) + 'px';
      svg.style.height = Math.floor(t.h * s) + 'px';
    }
    function render() {
      var t = st.tpl;
      markPal();
      if (!t) { board.innerHTML = ''; return; }
      board.innerHTML = R.template(t, { pal: st.pal, seed: st.seed, detail: .6 });
      fit();
      R.fitText(board);
      status.textContent = t.name + ', ' + S.STYLES[st.k].name + ', in the ' + R.palette(st.k, st.pal).name + ' palette.';
    }

    trads.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b && b.getAttribute('data-k') !== st.k) setTrad(b.getAttribute('data-k')); });
    tpls.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) setTpl(tplsOf(st.k)[+b.getAttribute('data-i')]); });
    pals.addEventListener('click', function (e) { var b = e.target.closest('.sw'); if (!b) return; st.pal = +b.getAttribute('data-i'); render(); });
    shuffle.disabled = false;
    shuffle.addEventListener('click', function () { st.seed = 1 + Math.floor(Math.random() * 999998); render(); });
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(board);
    else window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { R.fitText(board); });

    return { setTrad: setTrad, first: keys[0] };
  }
})();
