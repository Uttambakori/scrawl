/* ============================================================
   SCRAWL / site — the painted desktop
   ------------------------------------------------------------
   On a big screen the page becomes a desktop: windows get a
   hand-drawn outline, can be dragged by their bars, rolled up,
   closed and reopened from the icons or the menus. On a phone, or
   before this runs, the same windows are a plain column.
   Scrawl Paint shows pre-drawn peacocks until someone touches a
   control; only then does it load the real engine.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    editor: '../index.html',
    /* When billing exists, put the checkout pages here. Until then
       the Register button says Pro is free in beta and opens the studio. */
    checkout: { monthly: '', lifetime: '' },
    /* how long Scrawl Paint stays on each tradition before the next */
    hold: 6500,
    /* the desktop needs at least this much room; less and windows stack */
    minW: 900, minH: 600,
    /* faces the templates set their words in; loaded with the engine */
    templateFonts: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&family=Bebas+Neue&family=Anton&family=Archivo+Black&family=Caveat:wght@700&family=Chivo+Mono:wght@500&family=Alfa+Slab+One&family=Bricolage+Grotesque:wght@700&family=Space+Grotesk:wght@600&family=Syne:wght@700&family=Unbounded:wght@700&family=Playfair+Display:wght@700&family=Fraunces:wght@600&family=Cormorant+Garamond:wght@600&display=swap',
    /* used only if the editor's own script list can't be read */
    fallbackScripts: ['engine.js', 'icons.js', 'gens.js', 'gens2.js', 'gens3.js', 'gens4.js', 'presets.js', 'presets2.js', 'presets3.js',
      'warli.js', 'warli-presets.js', 'gond.js', 'gond-presets.js', 'madhubani.js', 'madhubani-presets.js', 'pattachitra.js', 'pattachitra-presets.js',
      'kalamkari.js', 'kalamkari-presets.js', 'styles.js', 'templates.js', 'templates2.js', 'warli-templates.js', 'gond-templates.js',
      'madhubani-templates.js', 'pattachitra-templates.js', 'kalamkari-templates.js', 'data.js'],
  };

  var root = document.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lite = root.classList.contains('lite');
  var calm = reduced || lite;
  function $(q, r) { return (r || document).querySelector(q); }
  function $$(q, r) { return Array.prototype.slice.call((r || document).querySelectorAll(q)); }
  function pad6(n) { return ('000000' + n).slice(-6); }
  function rnd() { return 1 + Math.floor(Math.random() * 999998); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  $$('[data-editor]').forEach(function (a) { a.href = CONFIG.editor; });
  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- the clock in the menu bar ---------- */
  var clock = $('#clock');
  function tick() {
    var d = new Date();
    clock.textContent = d.toLocaleDateString([], { weekday: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (clock) { tick(); setInterval(tick, 20000); }

  /* ============================================================
     Windows
     ============================================================ */
  var desk = $('#desk');
  var wins = $$('[data-win]');
  var byId = {};
  wins.forEach(function (w, i) {
    byId[w.id] = w;
    w.__s = { x: 0, y: 0, seed: 7 + i * 131 };
    var t = $('.win-title', w); if (t) t.setAttribute('tabindex', '-1');
  });
  var isDesk = null, z = 20, touched = false, opener = {};

  /* an outline drawn twice by a loose hand, like the sketchbook style */
  function rng(s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f1(n) { return Math.round(n * 10) / 10; }
  function outline(w, h, seed) {
    var r = rng(seed), o = 5, d = '';
    var pts = [[o, o], [w + o, o], [w + o, h + o], [o, h + o]];
    function j(a) { return (r() - .5) * 2 * a; }
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < 4; i++) {
        var a = pts[i], b = pts[(i + 1) % 4];
        var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
        var jit = pass ? 1.5 : 1, over = 2 + r() * 4, bow = Math.min(3.5, len / 140) * (pass ? 1.3 : 1);
        var sx = a[0] - ux * over + j(jit), sy = a[1] - uy * over + j(jit);
        var ex = b[0] + ux * over + j(jit), ey = b[1] + uy * over + j(jit);
        var mx = (sx + ex) / 2 - uy * j(bow), my = (sy + ey) / 2 + ux * j(bow);
        d += 'M' + f1(sx) + ' ' + f1(sy) + 'Q' + f1(mx) + ' ' + f1(my) + ' ' + f1(ex) + ' ' + f1(ey);
      }
    }
    return d;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function frame(w) {
    var W = w.offsetWidth, H = w.offsetHeight;
    if (!W || !H) return;
    var s = w.__s;
    if (s.fw === W && s.fh === H) return;
    s.fw = W; s.fh = H;
    var svg = s.frame;
    if (!svg) {
      svg = s.frame = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'win-frame');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('preserveAspectRatio', 'none');
      var p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('pathLength', '1');
      svg.appendChild(p);
      w.appendChild(svg);
      w.classList.add('framed');
    }
    svg.setAttribute('viewBox', '0 0 ' + (W + 10) + ' ' + (H + 10));
    svg.firstChild.setAttribute('d', outline(W, H, s.seed));
  }
  function frameAll() { wins.forEach(frame); }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (es) { es.forEach(function (e) { frame(e.target); }); });
    wins.forEach(function (w) { ro.observe(w); });
  } else window.addEventListener('resize', frameAll);

  /* ---------- the desktop's bookkeeping ---------- */
  function deskSize() { return { W: desk.clientWidth, H: desk.clientHeight }; }
  function place(w) {
    var s = w.__s;
    w.style.transform = 'translate(' + Math.round(s.x) + 'px,' + Math.round(s.y) + 'px)';
  }
  function fitBody(w) {
    var H = deskSize().H;
    w.style.setProperty('--body-h', Math.max(160, H - w.__s.y - 70) + 'px');
  }
  /* keep a window that just grew (opened, unrolled) inside the desktop */
  function keepIn(w) {
    if (!isDesk) return;
    var d = deskSize(), s = w.__s;
    w.style.removeProperty('--body-h');
    var ww = w.offsetWidth, hh = Math.min(w.offsetHeight, d.H - 24);
    /* clear of the icons when there is room for that */
    var maxX = d.W - 130 - ww >= 12 ? d.W - 130 - ww : d.W - ww - 12;
    s.x = clamp(s.x, 12, Math.max(12, maxX));
    s.y = clamp(s.y, 12, Math.max(12, d.H - hh - 12));
    place(w); fitBody(w);
  }
  function front(w) {
    if (!isDesk || !w) return;
    wins.forEach(function (o) { o.classList.toggle('front', o === w); });
    w.style.zIndex = ++z;
  }
  function setShade(w, on) {
    var b = $('.win-shade', w), body = $('.win-body', w);
    w.classList.toggle('shaded', on);
    if (b) {
      b.setAttribute('aria-expanded', on ? 'false' : 'true');
      b.setAttribute('aria-label', (on ? 'Unroll ' : 'Roll up ') + ($('.win-title', w).firstChild.textContent.trim()));
    }
    if (body) body.hidden = on && isDesk;
  }
  function zoom(from, to) {
    if (calm || !from || !to || !from.getBoundingClientRect || !document.body.animate) return;
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    if (!a.width || !b.width) return;
    var z = document.createElement('div');
    z.className = 'zoom';
    z.style.width = b.width + 'px'; z.style.height = b.height + 'px';
    document.body.appendChild(z);
    var anim = z.animate([
      { transform: 'translate(' + a.left + 'px,' + a.top + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')', opacity: 1 },
      { transform: 'translate(' + b.left + 'px,' + b.top + 'px) scale(1,1)', opacity: .2 },
    ], { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' });
    anim.onfinish = function () { z.remove(); };
  }
  function focusTitle(w) {
    var t = $('.win-title', w);
    if (t) try { t.focus({ preventScroll: isDesk }); } catch (e) { t.focus(); }
  }

  function openWin(id, from) {
    var w = byId[id];
    if (!w) return;
    if (from) opener[id] = from;
    if (w.id === 'viewer') w.classList.add('open');
    if (!isDesk) {
      w.hidden = false;
      w.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      focusTitle(w);
      return;
    }
    var was = w.hidden, rolled = w.classList.contains('shaded');
    w.hidden = false;
    setShade(w, false);
    if (rolled && !was) keepIn(w);
    if (was) {
      /* a window that was closed comes back where it was, or near the middle */
      var d = deskSize(), s = w.__s;
      if (!s.placed) {
        s.x = clamp((d.W - w.offsetWidth) / 2 + (Math.random() * 80 - 40), 16, d.W - w.offsetWidth - 16);
        s.y = clamp((d.H - w.offsetHeight) / 3, 16, Math.max(16, d.H - 200));
        s.placed = true;
      }
      place(w); keepIn(w);
      var fr = s.frame; if (fr && !calm) { fr.classList.remove('fresh'); void fr.getBoundingClientRect(); fr.classList.add('fresh'); }
    }
    front(w);
    zoom(from, w);
    focusTitle(w);
  }
  function closeWin(w) {
    if (!isDesk) {
      if (w.id === 'viewer') w.classList.remove('open');
      else if (w.hasAttribute('data-closed')) w.hidden = true;
    } else {
      w.hidden = true;
      if (w.id === 'viewer') w.classList.remove('open');
    }
    var back = opener[w.id] || $('.ico[data-open="' + w.id + '"]');
    if (back && back.offsetParent) back.focus();
  }

  /* ---------- where everything starts ---------- */
  /* Paint on the left, Welcome beside it. Pro opens too when there is
     room for it; the other windows wait rolled up under Welcome, where
     their bars say what they are, and the note finds a free corner.
     On a small screen they stay closed: the icons open them. */
  function layout() {
    var d = deskSize(), R = d.W - 130;
    var P = {}, shaded = [];
    var paint = byId.paint, wel = byId.welcome, reg = byId.register, note = byId.note;
    var welW = d.W >= 1280 ? 440 : 410;
    desk.style.setProperty('--wel-w', welW + 'px');
    /* the canvas is as big as it can be while leaving a column for the
       note; on a smaller screen the tools move into a row above it */
    var cv = Math.min(d.H - 240, R - welW - 424), row = cv < 330;
    if (row) cv = Math.min(d.H - 300, R - welW - 100);
    cv = clamp(cv, 240, 560);
    paint.classList.toggle('paint--row', row);
    desk.style.setProperty('--cv', cv + 'px');
    wins.forEach(function (w) {
      w.hidden = w.hasAttribute('data-closed');
      if (w.id === 'viewer') w.classList.remove('open');
      setShade(w, false);
      w.__s.placed = true;
    });
    /* shrink the canvas until Paint fits the screen */
    paint.style.removeProperty('--body-h');
    for (var k = 0, over; k < 3 && (over = paint.offsetHeight - (d.H - 36)) > 0; k++) {
      cv = Math.max(220, cv - over - 4);
      desk.style.setProperty('--cv', cv + 'px');
    }
    P.paint = [24, 18];
    var x2 = Math.min(24 + paint.offsetWidth + 26, R - welW);
    P.welcome = [x2, 28];
    var welB = 28 + wel.offsetHeight, x3 = x2 + welW + 28, room = R - x3;
    var regOpen = room >= reg.offsetWidth;
    if (regOpen) P.register = [x3, 42];
    else reg.hidden = true;
    var rolled = ['gallery', 'rules'].concat(regOpen ? [] : ['register'], ['help']);
    var bh = 46, below = d.H - welB - 16, SW = 220;
    if (!regOpen && room >= SW) {
      rolled.forEach(function (id, i) { P[id] = [R - SW, d.H - 16 - (rolled.length - i) * bh]; shaded.push(id); });
    } else if (below >= rolled.length * bh + 8) {
      rolled.forEach(function (id, i) { P[id] = [x2 + 10 + i * 12, welB + 16 + i * bh]; shaded.push(id); });
    }
    rolled.forEach(function (id) { if (shaded.indexOf(id) < 0) byId[id].hidden = true; else { byId[id].hidden = false; setShade(byId[id], true); } });
    var paintB = 18 + paint.offsetHeight, nh = note.offsetHeight + 10;
    if (!regOpen && room >= SW) P.note = [x3 + 6, 60];
    else if (d.H - paintB >= nh + 20) P.note = [60, paintB + 22];
    else note.hidden = true;
    /* closed ones get a sensible spot for when they open */
    P.viewer = [Math.max(40, (d.W - 480) / 2), 30];
    P.trash = [R - 340, d.H - 300];
    P.about = [Math.max(40, (d.W - 360) / 2), 90];
    var order = ['paint', 'welcome', 'register'].concat(shaded, ['note']);
    wins.forEach(function (w) {
      var p = P[w.id] || [60, 60];
      w.__s.x = clamp(p[0], 8, Math.max(8, d.W - 120));
      w.__s.y = clamp(p[1], 8, Math.max(8, d.H - 44));
      place(w); fitBody(w);
    });
    order.forEach(function (id) { if (byId[id]) front(byId[id]); });
    touched = false;
  }

  function setMode() {
    var want = window.innerWidth >= CONFIG.minW && window.innerHeight >= CONFIG.minH;
    if (want === isDesk) {
      if (isDesk) {
        if (!touched) layout();
        else wins.forEach(function (w) {
          var d = deskSize(), s = w.__s;
          s.x = clamp(s.x, -(w.offsetWidth - 90), d.W - 90); s.y = clamp(s.y, 0, d.H - 44);
          place(w); fitBody(w);
        });
      }
      return;
    }
    isDesk = want;
    root.classList.toggle('desktop', isDesk);
    if (isDesk) layout();
    else wins.forEach(function (w) {
      w.style.transform = ''; w.style.zIndex = '';
      w.classList.remove('front');
      setShade(w, false);
      w.hidden = w.hasAttribute('data-closed') && w.id !== 'about';
    });
    frameAll();
  }

  /* ---------- dragging, rolling up, closing ---------- */
  wins.forEach(function (w) {
    var bar = $('.win-bar', w);
    w.addEventListener('pointerdown', function () { front(w); });
    w.addEventListener('focusin', function () { front(w); });
    var c = $('.win-close', w), sh = $('.win-shade', w);
    if (c) c.addEventListener('click', function () { closeWin(w); });
    function toggle() { var on = !w.classList.contains('shaded'); setShade(w, on); if (!on) { front(w); keepIn(w); } }
    if (sh) sh.addEventListener('click', toggle);
    if (!bar) return;
    bar.addEventListener('dblclick', function (e) { if (isDesk && sh && !e.target.closest('button')) toggle(); });
    var drag = null, raf = 0;
    bar.addEventListener('pointerdown', function (e) {
      if (!isDesk || e.button !== 0 || e.target.closest('button')) return;
      drag = { px: e.clientX, py: e.clientY, x: w.__s.x, y: w.__s.y };
      w.classList.add('dragging');
      try { bar.setPointerCapture(e.pointerId); } catch (err) { }
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var d = deskSize();
      w.__s.x = clamp(drag.x + e.clientX - drag.px, -(w.offsetWidth - 90), d.W - 90);
      w.__s.y = clamp(drag.y + e.clientY - drag.py, 0, d.H - 44);
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; place(w); });
    });
    function end() {
      if (!drag) return;
      drag = null; touched = true;
      w.classList.remove('dragging');
      fitBody(w);
    }
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  });

  /* ---------- anything that opens a window ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open]');
    if (!a) return;
    var id = a.getAttribute('data-open'), w = byId[id];
    if (!w) return;
    /* on the stacked page a plain anchor already scrolls to open windows */
    if (!isDesk && !w.hidden && w.id !== 'viewer' && a.tagName === 'A') { closeMenus(); return; }
    e.preventDefault();
    closeMenus();
    $$('.ico.sel').forEach(function (o) { o.classList.remove('sel'); });
    if (a.classList.contains('ico')) a.classList.add('sel');
    openWin(id, a.closest('.mn') ? null : a);
  });

  /* ---------- menus ---------- */
  var menus = $$('.mn');
  function closeMenus(except) {
    menus.forEach(function (m) {
      if (m === except) return;
      var b = $('.mn-btn', m); b.setAttribute('aria-expanded', 'false');
      $('.mn-list', m).hidden = true;
    });
  }
  menus.forEach(function (m) {
    var b = $('.mn-btn', m), list = $('.mn-list', m);
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      closeMenus(m);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      list.hidden = !open;
      if (open && b.__kb) { var first = $('a, button', list); if (first) first.focus(); }
    });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') b.__kb = true; });
    b.addEventListener('pointerdown', function () { b.__kb = false; });
    /* with one menu open, pointing at another opens that instead */
    b.addEventListener('pointerenter', function () {
      if (menus.some(function (o) { return o !== m && $('.mn-btn', o).getAttribute('aria-expanded') === 'true'; })) {
        closeMenus(m); b.setAttribute('aria-expanded', 'true'); list.hidden = false;
      }
    });
    list.addEventListener('keydown', function (e) {
      var items = $$('a, button', list), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
  });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.mn')) closeMenus(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = menus.filter(function (m) { return $('.mn-btn', m).getAttribute('aria-expanded') === 'true'; })[0];
    if (open) { closeMenus(); $('.mn-btn', open).focus(); }
  });
  $$('[data-tidy]').forEach(function (b) { b.addEventListener('click', function () { closeMenus(); if (isDesk) layout(); }); });

  /* ============================================================
     Scrawl Paint
     ============================================================ */
  var seq = [];
  try { seq = JSON.parse($('#seq').textContent || '[]'); } catch (e) { }
  var tools = $('#tools'), canvas = $('#canvas'), art = $('#art'), sws = $('#swatches'), sel = $('#tpl');
  var statusEl = $('#status'), seedEl = $('#seed'), auto = $('#auto'), shuffle = $('#shuffle');
  var st = { i: 0, pal: null, tpl: '', seed: 0 };
  var playing = !calm, user = false, timer = 0, visible = true;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var cache = {};
  function getArt(k) {
    if (!cache[k]) cache[k] = fetch('art/draw-' + k + '.svg').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); });
    return cache[k];
  }
  function drawable(svg, span) {
    if (!svg) return;
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    var n = svg.querySelectorAll('path').length;
    svg.style.setProperty('--span', (span || 2.4) + 's');
    svg.style.setProperty('--dur', (n > 60 ? .7 : 1.1) + 's');
  }

  /* ---------- the engine, fetched the first time a control is used ---------- */
  var engine = null;
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
  function loadEngine() {
    if (engine) return engine;
    var fonts = document.createElement('link');
    fonts.rel = 'stylesheet'; fonts.href = CONFIG.templateFonts;
    document.head.appendChild(fonts);
    var base = CONFIG.editor.replace(/[^/]*$/, '');
    engine = scriptList().then(function (list) {
      /* async=false keeps them in order while they download together */
      return Promise.all(list.map(function (f) { return script(base + f); }).concat([script('render.js')]));
    });
    return engine;
  }

  function trad() { return seq[st.i] || {}; }
  function palRow(t, i) { return (t.pals || []).filter(function (p) { return p[0] === i; })[0]; }

  function paintTools() {
    tools.innerHTML = seq.map(function (t, i) {
      return '<button type="button" class="tool" data-i="' + i + '" aria-pressed="false" aria-label="' + esc(t.name) + '"><img src="art/tool-' + t.k + '.webp" alt="" width="44" height="44"><span class="tip-name" aria-hidden="true">' + esc(t.name) + '</span></button>';
    }).join('');
  }
  function paintControls() {
    var t = trad();
    $$('.tool', tools).forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-i') === st.i ? 'true' : 'false'); });
    var cur = st.pal == null ? t.pal : st.pal;
    sws.innerHTML = (t.pals || []).map(function (p) {
      return '<button type="button" class="sw" data-p="' + p[0] + '" aria-pressed="' + (p[0] === cur) + '" aria-label="' + esc(p[1]) + ' palette" title="' + esc(p[1]) + '" style="--g:' + p[2] + ';--f:' + p[3] + ';--a:' + p[4] + '"></button>';
    }).join('');
    sel.innerHTML = '<option value="">The peacock</option>' + (t.tpls || []).map(function (n) {
      return '<option' + (n === st.tpl ? ' selected' : '') + '>' + esc(n) + '</option>';
    }).join('');
  }
  function say(text) { statusEl.textContent = text; }

  var drawToken = 0;
  function render() {
    var t = trad(), my = ++drawToken;
    var cur = st.pal == null ? t.pal : st.pal, row = palRow(t, cur);
    seedEl.textContent = 'seed ' + pad6(st.seed);
    canvas.style.setProperty('--g', row ? row[2] : t.g);
    art.classList.toggle('draw', !calm);
    /* untouched: the peacock drawn ahead of time */
    if (!st.tpl && st.pal == null && !st.seed) {
      art.setAttribute('role', 'img');
      art.setAttribute('aria-label', t.label || t.name);
      getArt(t.k).then(function (txt) {
        if (my !== drawToken) return;
        art.innerHTML = txt;
        drawable($('svg', art), 2.4);
      }).catch(function () { });
      say(t.name + ' · ' + t.rule);
      return;
    }
    canvas.classList.add('busy');
    loadEngine().then(function () {
      if (my !== drawToken) return;
      canvas.classList.remove('busy');
      var S = window.SCRAWL, R = window.SITE, pal = R.palette(t.k, cur);
      canvas.style.setProperty('--g', pal.paper);
      if (!st.tpl) {
        var pre = R.findPreset(t.peacock, t.k);
        art.innerHTML = R.piece(pre, { size: 540, colors: pal.colors, seed: st.seed || null, animate: !calm, detail: .8, label: t.label });
        drawable($('svg', art), 1.8);
        art.setAttribute('aria-label', pre.name + ', ' + t.name + ', ' + pal.name + ' palette');
        say(t.name + ' · peacock · ' + pal.name + ' palette');
      } else {
        var tpl = S.TEMPLATES.filter(function (x) { return (x.style || 'sketch') === t.k && x.name === st.tpl; })[0];
        if (!tpl) return;
        art.classList.remove('draw');
        art.innerHTML = R.template(tpl, { pal: cur, seed: st.seed, detail: .6 });
        var svg = $('svg', art); if (svg) { svg.setAttribute('aria-hidden', 'true'); svg.classList.add('fade-in'); }
        R.fitText(art);
        art.setAttribute('aria-label', tpl.name + ' template, ' + t.name + ', ' + pal.name + ' palette');
        say(t.name + ' · ' + tpl.name + ' · ' + pal.name + ' palette');
      }
    }).catch(function (e) {
      console.warn('engine', e);
      canvas.classList.remove('busy');
      say('The live pen could not load here. The full studio will still open.');
    });
  }
  function setTrad(i) {
    st.i = (i + seq.length) % seq.length; st.pal = null; st.tpl = ''; st.seed = 0;
    paintControls(); render();
  }

  /* ---------- the slideshow, until someone picks up the pen ---------- */
  function schedule() {
    clearTimeout(timer);
    if (playing && !user && visible && !document.hidden) timer = setTimeout(function () { setTrad(st.i + 1); schedule(); }, CONFIG.hold);
  }
  function setPlaying(on) {
    playing = on;
    auto.textContent = on ? 'Pause' : 'Play';
    auto.setAttribute('aria-pressed', on ? 'false' : 'true');
    auto.setAttribute('aria-label', on ? 'Pause the slideshow' : 'Play the slideshow');
    if (on) user = false;
    schedule();
  }
  function takeOver() { if (!user) { user = true; setPlaying(false); } }

  if (tools && seq.length) {
    paintTools(); paintControls();
    setPlaying(playing);
    render();
    tools.addEventListener('click', function (e) { var b = e.target.closest('.tool'); if (!b) return; takeOver(); setTrad(+b.getAttribute('data-i')); });
    sws.addEventListener('click', function (e) {
      var b = e.target.closest('.sw'); if (!b) return;
      takeOver(); st.pal = +b.getAttribute('data-p');
      $$('.sw', sws).forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      render();
    });
    sel.addEventListener('change', function () { takeOver(); st.tpl = sel.value; st.seed = 0; render(); });
    shuffle.addEventListener('click', function () { takeOver(); st.seed = rnd(); render(); });
    auto.addEventListener('click', function () { setPlaying(!playing); if (playing) setTrad(st.i + 1); });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }).observe(canvas);
  }

  /* ============================================================
     Gallery → viewer
     ============================================================ */
  var vImg = $('#viewer-img'), vCap = $('#viewer-cap'), vName = $('#viewer-name');
  $$('.file').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      $$('.file.sel').forEach(function (o) { o.classList.remove('sel'); });
      a.classList.add('sel');
      var name = $('span', a).textContent, tr = a.getAttribute('data-trad'), tp = a.getAttribute('data-tpl');
      vImg.src = a.getAttribute('href');
      vImg.alt = name.replace(/\.png$/, '').replace(/-/g, ' ') + ', made from the ' + tp + ' template in the ' + tr + ' style';
      vCap.textContent = tr + ' · ' + tp + ' template';
      vName.textContent = name;
      openWin('viewer', a);
    });
  });

  /* ============================================================
     Register Pro
     ============================================================ */
  var buy = $('#buy');
  function plan() {
    var on = $('.plans input:checked');
    $$('.plan').forEach(function (l) { l.classList.toggle('on', $('input', l).checked); });
    var v = on ? on.value : 'lifetime', href = CONFIG.checkout[v];
    if (href) { buy.href = href; buy.textContent = v === 'lifetime' ? 'Register for $49' : 'Register for $9 a month'; }
    else { buy.href = CONFIG.editor; buy.textContent = 'Use Pro free during the beta'; }
  }
  $$('.plans input').forEach(function (i) { i.addEventListener('change', plan); });
  if (buy) plan();

  /* ============================================================
     Start: pick a mode, draw the frames, boot
     ============================================================ */
  wins.forEach(function (w, i) { w.style.setProperty('--n', i); });
  setMode();
  frameAll();
  if (isDesk && !calm) {
    root.classList.add('booting');
    setTimeout(function () { root.classList.remove('booting'); }, 1500);
  }
  var hello = $('.hello');
  if (hello && !calm) {
    setTimeout(function () { hello.classList.add('bounce'); }, isDesk ? 700 : 200);
    hello.addEventListener('animationend', function () { hello.classList.remove('bounce'); });
    hello.addEventListener('pointerenter', function () { hello.classList.add('bounce'); });
  }
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setMode, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (isDesk && !touched) layout(); frameAll(); });
  /* a link to a window (…/site/#register) opens it */
  var h = location.hash.slice(1);
  if (h && byId[h] && isDesk) openWin(h);
})();
