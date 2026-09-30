/* ============================================================
   SCRAWL / site — behaviour
   ------------------------------------------------------------
   The page is plain HTML and pre-drawn art (see build.js), so it
   reads fine before, and without, this script. Here: the kinetic
   type, the hero drawing machine, the rulebook index, the belts,
   the phone menu, pricing links, and the "Shuffle the hand" demo,
   which loads the editor's real engine only when a visitor gets
   near it. Loops pause off screen, and everything that moves by
   itself stops for anyone who prefers reduced motion.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    editor: '../index.html',
    /* When billing exists, put the checkout pages here. Until then
       the Pro buttons say "Free during beta" and open the studio. */
    checkout: { monthly: '', lifetime: '' },
    /* how long each tradition stays in the hero */
    heroHold: 6500,
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
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  function seen(el, fn, margin, once) {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { fn(e.isIntersecting, e); if (e.isIntersecting && once) io.disconnect(); });
    }, { rootMargin: margin || '0px' });
    io.observe(el);
  }
  function pad6(n) { return ('000000' + n).slice(-6); }
  function rnd() { return 1 + Math.floor(Math.random() * 999998); }

  each($$('[data-editor]'), function (a) { a.href = CONFIG.editor; });
  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- pricing: checkout links, when there are any ---------- */
  if (CONFIG.checkout.monthly || CONFIG.checkout.lifetime) {
    var beta = $('#betaNote'); if (beta) beta.hidden = true;
    each($$('[data-buy]'), function (b) {
      var href = CONFIG.checkout[b.getAttribute('data-buy')];
      if (!href) return;
      b.removeAttribute('data-editor');
      b.href = href;
      b.firstElementChild.textContent = b.getAttribute('data-buy') === 'lifetime' ? 'Get Pro for life' : 'Go Pro monthly';
    });
  }

  /* ---------- nav: solid once the hero has gone by ---------- */
  var nav = $('#nav'), hero = $('.hero');
  if (nav && hero) seen(hero, function (vis) { nav.classList.toggle('solid', !vis); }, '-80px 0px 0px 0px');

  /* ---------- phone menu ---------- */
  var btn = $('#menuBtn'), menu = $('#menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.firstElementChild.textContent = open ? 'Close' : 'Menu';
    menu.classList.toggle('open', open);
    nav.classList.toggle('open', open);
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
  }

  /* ---------- kinetic type ---------- */
  /* the hero title: every letter its own span, read out as one line */
  var title = $('.kinetic');
  if (title) {
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    var n = 0;
    each($$('[data-split]', title), function (line) {
      var text = line.textContent;
      line.innerHTML = '<span class="ln" aria-hidden="true">' + text.split('').map(function (c) {
        return c === ' ' ? ' ' : '<span class="ch" style="--n:' + (n++) + '">' + c + '</span>';
      }).join('') + '</span>';
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { title.classList.add('in'); }); });
  }
  /* section titles: word by word, as they come into view */
  each($$('.reveal'), function (h) {
    var k = 0;
    (function walk(node) {
      each(Array.prototype.slice.call(node.childNodes), function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'), i = document.createElement('span');
            o.className = 'w'; i.textContent = w; i.style.setProperty('--n', k++);
            o.appendChild(i); frag.appendChild(o);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(h);
    seen(h, function (vis) { if (vis) h.classList.add('in'); }, '0px 0px -10% 0px', true);
  });

  /* ---------- loops pause when nobody can see them ---------- */
  each($$('.band, .belts, .chain, .stage'), function (el) {
    seen(el, function (vis) { el.classList.toggle('off', !vis); });
  });

  /* ---------- drawings: fetched once, drawn on every time ---------- */
  var svgCache = {};
  function getArt(k) {
    if (!svgCache[k]) svgCache[k] = fetch('art/draw-' + k + '.svg').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); });
    return svgCache[k];
  }
  function drawInto(el, k, span) {
    return getArt(k).then(function (txt) {
      el.innerHTML = txt;
      var svg = $('svg', el);
      if (svg) {
        svg.removeAttribute('width'); svg.removeAttribute('height');
        svg.setAttribute('aria-hidden', 'true');
        var paths = svg.querySelectorAll('path').length;
        /* many-marked pieces draw faster per mark so every piece takes about as long */
        svg.style.setProperty('--span', (span || 2.4) + 's');
        svg.style.setProperty('--dur', (paths > 60 ? .7 : 1.1) + 's');
      }
    });
  }

  var seq = [];
  try { seq = JSON.parse($('#seq').textContent || '[]'); } catch (e) { }

  /* ---------- hero: the machine draws one peacock after another ---------- */
  (function () {
    var arch = $('#arch'), art = $('#heroArt'), dots = $('#heroDots'), pause = $('#heroPause');
    if (!arch || !seq.length) return;
    var at = 0, timer = 0, paused = reduced, visible = true, tick = 0;
    dots.innerHTML = seq.map(function (s, i) {
      return '<li><button type="button" class="dot" aria-pressed="false" data-i="' + i + '" style="--g:' + s.g + ';--f:' + s.f + '" aria-label="Draw it as ' + s.name + '"></button></li>';
    }).join('');
    function seed() {
      var target = rnd(), t = 0;
      clearInterval(tick);
      if (reduced) { $('#heroSeed').textContent = pad6(target); return; }
      tick = setInterval(function () {
        t++;
        $('#heroSeed').textContent = pad6(t >= 18 ? target : rnd());
        if (t >= 18) clearInterval(tick);
      }, 45);
    }
    function show(i) {
      at = (i + seq.length) % seq.length;
      var s = seq[at];
      arch.style.setProperty('--g', s.g);
      $('#heroName').textContent = s.name;
      $('#heroRule').textContent = s.rule;
      art.setAttribute('aria-label', s.label);
      each($$('.dot', dots), function (d, j) { d.setAttribute('aria-pressed', j === at ? 'true' : 'false'); });
      seed();
      drawInto(art, s.k, 2.4);
      getArt(seq[(at + 1) % seq.length].k); /* warm the next one */
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      if (!paused && visible && !document.hidden) timer = setTimeout(function () { show(at + 1); }, CONFIG.heroHold);
    }
    dots.addEventListener('click', function (e) { var d = e.target.closest('.dot'); if (d) show(+d.getAttribute('data-i')); });
    pause.addEventListener('click', function () {
      paused = !paused;
      pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pause.firstElementChild.textContent = paused ? 'Play' : 'Pause';
      schedule();
    });
    if (reduced) { pause.setAttribute('aria-pressed', 'true'); pause.firstElementChild.textContent = 'Play'; }
    seen($('#stage'), function (vis) { visible = vis; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    show(0);
  })();

  /* ---------- the rulebook index ---------- */
  (function () {
    var rows = $$('.rb'), preview = $('#rbPreview'), canvas = $('#rbCanvas');
    if (!rows.length) return;
    var wide = window.matchMedia('(min-width: 1000px)'), current = null, hoverT = 0;
    function place() {
      /* on a wide screen the drawing sits in the sticky frame beside the
         list; on a narrow one it moves into the open row */
      if (wide.matches) { if (canvas.parentNode !== preview) preview.appendChild(canvas); }
      else if (current) $('.rb-art', current).appendChild(canvas);
    }
    function open(row, force) {
      if (row === current && !force) return;
      current = row;
      rows.forEach(function (r) {
        var on = r === row;
        r.classList.toggle('on', on);
        $('.rb-head', r).setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      preview.style.setProperty('--g', getComputedStyle(row).getPropertyValue('--tg'));
      place();
      drawInto(canvas, row.getAttribute('data-k'), 1.8);
    }
    rows.forEach(function (r) {
      $('.rb-head', r).addEventListener('click', function () { open(r); });
      r.addEventListener('mouseenter', function () {
        if (!wide.matches) return;
        clearTimeout(hoverT);
        hoverT = setTimeout(function () { open(r); }, 90);
      });
    });
    if (wide.addEventListener) wide.addEventListener('change', place);
    seen($('#rules'), function (vis) { if (vis) open(rows[0], true); }, '200px 0px', true);
  })();

  /* ---------- belts: doubled so they loop, pausable ---------- */
  (function () {
    var belts = $('#belts'), pb = $('#beltPause');
    if (!belts) return;
    if (!reduced) each($$('.belt-track', belts), function (track) {
      $$('li', track).forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      });
    });
    if (reduced || root.classList.contains('lite')) { pb.hidden = true; return; }
    pb.addEventListener('click', function () {
      var p = belts.classList.toggle('paused');
      pb.setAttribute('aria-pressed', p ? 'true' : 'false');
      pb.firstElementChild.textContent = p ? 'Play' : 'Pause';
    });
  })();

  /* ================= SHUFFLE THE HAND: the live demo ================= */
  var demo = $('#demo');
  if (!demo) return;
  var status = $('#demoStatus'), board = $('#demoBoard'), shuffle = $('#demoShuffle');
  var loading = false;

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
    var fonts = document.createElement('link');
    fonts.rel = 'stylesheet'; fonts.href = CONFIG.templateFonts;
    document.head.appendChild(fonts);
    var base = CONFIG.editor.replace(/[^/]*$/, '');
    scriptList().then(function (list) {
      /* async=false keeps them in order while they download together */
      return Promise.all(list.map(function (f) { return script(base + f); }).concat([script('render.js')]));
    }).then(function () {
      var api = start();
      demo.setAttribute('data-state', 'ready');
      api.setTrad(api.first);
    }).catch(function (e) {
      console.warn('demo', e);
      demo.setAttribute('data-state', 'failed');
      status.textContent = 'The live demo could not load here. The full studio will still open.';
    });
  }
  seen(demo, function (vis) { if (vis) load(); }, '500px 0px', true);

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
    var esc = R.esc;
    function pressed(list, fn) { each(list, function (b) { b.setAttribute('aria-pressed', fn(b) ? 'true' : 'false'); }); }

    trads.innerHTML = keys.map(function (k) {
      return '<button type="button" class="chip" aria-pressed="false" data-k="' + k + '" style="' + vars(R.palette(k, 0)) + '"><span class="cdot" aria-hidden="true"></span>' + esc(S.STYLES[k].name) + '</button>';
    }).join('');

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
      setTpl(list.filter(function (t) { return t.name === CONFIG.firstTemplate[k]; })[0] || list[0]);
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
      var s = Math.min(board.clientWidth / t.w, board.clientHeight / t.h);
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
      $('#demoSeed').textContent = pad6(st.seed || 0);
      status.textContent = t.name + ', ' + S.STYLES[st.k].name + ', ' + R.palette(st.k, st.pal).name + ' palette.';
    }

    trads.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b && b.getAttribute('data-k') !== st.k) setTrad(b.getAttribute('data-k')); });
    tpls.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) setTpl(tplsOf(st.k)[+b.getAttribute('data-i')]); });
    pals.addEventListener('click', function (e) { var b = e.target.closest('.sw'); if (!b) return; st.pal = +b.getAttribute('data-i'); render(); });
    shuffle.disabled = false;
    shuffle.addEventListener('click', function () { st.seed = rnd(); render(); });
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(board);
    else window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { R.fitText(board); });
    return { setTrad: setTrad, first: keys[0] };
  }
})();
