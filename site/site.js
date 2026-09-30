/* ============================================================
   SCRAWL / site — an exhibition that draws itself
   Every drawing here is generated live by the editor's own
   generators (render.js is the bridge). Rooms, palettes, pieces
   and counts are read from the loaded packs, so a tradition added
   to the editor gets a room here on its own (a plain one, until it
   is given its own entry in CONFIG.trad and, if it deserves one,
   its own room builder below).
   ============================================================ */
(function () {
  const S = window.SCRAWL, R = window.SITE;
  const STYLES = S.STYLES, KEYS = R.styleKeys();
  const N = KEYS.length;

  /* ================= CONFIG ================= */
  const CONFIG = {
    editor: '../index.html',
    /* per tradition: pal = the palette its room is painted in; acc = which
       palette colour the opening uses for type (default 1); peacock = the
       piece drawn in the opening; rule = the one line its room is built on;
       medium = the placard line. Anything left out falls back. */
    trad: {
      warli: { pal: 3, peacock: 'Peacock', rule: 'No figure is larger than another.', medium: 'Rice paste on an earth wall' },
      gond: { pal: 4, peacock: 'Great peacock', rule: 'The fill is the signature.', medium: 'Pigment on a mud wall, now on paper' },
      madhubani: { pal: 0, peacock: 'Peacock in display', rule: 'No ground is left bare.', medium: 'Lamp-black and pigment on handmade paper' },
      pattachitra: { pal: 1, acc: 3, peacock: 'Great peacock', rule: 'The border is half the painting.', medium: 'Mineral colour on primed cloth' },
      kalamkari: { pal: 3, cloth: 0, peacock: 'Peacock', rule: 'The pen draws. The dye decides.', medium: 'Bamboo pen and vegetable dye on cotton' },
      sketch: { pal: 26, peacock: 'Crested bird', rule: 'Everything is drawn twice.', medium: 'Pen and ink, with a shaky hand' },
    },
    /* Plans mirror plan.js in the editor. When the editor ships plan.js it
       is loaded here too and read directly (SCRAWL.PLAN), so prices, Pro
       features and checkout links live in one place. This is the fallback. */
    plan: {
      prices: {
        monthly: { label: 'Pro monthly', price: '$9', per: '/ month', note: 'Cancel any time' },
        lifetime: { label: 'Pro for life', price: '$49', per: 'once', note: 'Pay once, keep every update' },
      },
      free: ['Every tradition, library piece and template', 'All 217 fonts, including Indian scripts', 'PNG, JPG and WebP export up to 2×', 'Unlimited files, saved in your browser'],
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
  const nf = n => n.toLocaleString('en-US');
  const two = n => String(n).padStart(2, '0');
  const nameOf = k => STYLES[k].name;
  const cfg = k => CONFIG.trad[k] || {};
  const count = k => S.PRESETS.filter(p => p.style === k).length;
  const tplsOf = k => S.TEMPLATES.filter(t => (t.style || 'sketch') === k && (t.items || []).length);
  const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  const word = n => WORDS[n] || String(n);
  const isSquare = p => S.GENS[p.gen] && S.GENS[p.gen].aspect !== 'free';
  const isFree = p => S.GENS[p.gen] && S.GENS[p.gen].aspect === 'free';
  const safePal = (k, i) => (i || 0) < S.stylePalettes(k).length ? (i || 0) : 0;
  /* a room's colours: ground, figure, accent, and the palette itself */
  function colours(k, i) {
    const p = R.palette(k, safePal(k, i != null ? i : cfg(k).pal));
    return { g: p.paper, f: p.colors[0], a: p.colors[cfg(k).acc || 1], p };
  }
  const paint = (el, c) => { el.style.setProperty('--g', c.g); el.style.setProperty('--f', c.f); el.style.setProperty('--a', c.a); };
  /* find a piece by name, then by pattern, then anything that fits */
  function find(k, names, test) {
    for (const n of [].concat(names || [])) { const p = R.findPreset(n, k); if (p && (!test || test(p))) return p; }
    return null;
  }
  function pick(k, names, want, test) {
    test = test || isSquare;
    const out = (names || []).map(n => R.findPreset(n, k)).filter(p => p && test(p));
    const rest = R.presetsOf(k).filter(p => test(p) && !out.includes(p));
    while (out.length < want && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    return out.slice(0, want);
  }
  const anyFree = (k, re) => R.presetsOf(k).find(p => isFree(p) && re.test(p.name));
  function whenSeen(el, fn, margin) {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margin || '150px' });
    io.observe(el);
  }
  const draw = (pre, colors, o) => R.piece(pre, Object.assign({ colors, pad: .02, size: 520 }, o || {}));
  function placard(k, no) {
    const c = cfg(k), n = S.stylePalettes(k).length;
    return `<dl class="placard">
      <dt>Room</dt><dd>${two(no)} of ${two(N)}</dd>
      <dt>Tradition</dt><dd>${esc(nameOf(k))}</dd>
      ${STYLES[k].where ? `<dt>Region</dt><dd>${esc(STYLES[k].where)}</dd>` : ''}
      ${c.medium ? `<dt>Medium</dt><dd>${esc(c.medium)}</dd>` : ''}
      <dt>Library</dt><dd>${count(k)} pieces · ${n} palettes · ${tplsOf(k).length} templates</dd>
    </dl>`;
  }
  const ruleOf = k => cfg(k).rule || String(STYLES[k].note || '').split(/(?<=\.)\s/)[0];
  const roomNo = (no, k, extra) => `<p class="room-no cat"><span><span class="rn">${two(no)}</span> ${esc(nameOf(k))}</span>${extra || ''}</p>`;

  /* fit a wall title to its box: width, or height when it runs vertically */
  function fit(el) {
    const span = el.firstElementChild; if (!span) return;
    const vertical = getComputedStyle(el).writingMode.startsWith('vertical');
    el.style.fontSize = '100px';
    const r = span.getBoundingClientRect();
    const avail = vertical ? el.clientHeight : el.clientWidth, got = vertical ? r.height : r.width;
    if (got && avail) el.style.fontSize = (100 * avail / got * .995).toFixed(2) + 'px';
  }
  const fitAll = () => $$('.fitw').forEach(fit);

  $$('[data-editor]').forEach(a => a.href = CONFIG.editor);
  $('#year').textContent = new Date().getFullYear();

  /* ================= OPENING: one peacock, six rulebooks ================= */
  (function () {
    const op = $('#top'), art = $('#opArt'), stops = $('#opStops');
    const seq = KEYS.map(k => ({
      k, c: colours(k),
      pre: find(k, cfg(k).peacock, isSquare) || R.presetsOf(k).find(p => isSquare(p) && /peacock|bird/i.test(p.name)) || R.presetsOf(k).find(isSquare),
    })).filter(s => s.pre);
    const T = 5200;
    $('#opCount').textContent = `${word(seq.length)} rulebooks.`;
    stops.style.setProperty('--n', seq.length);
    stops.style.setProperty('--t', T + 'ms');
    stops.innerHTML = seq.map((s, i) => `<li><button data-i="${i}" aria-label="Draw it as ${esc(nameOf(s.k))}"><span>${two(i + 1)} ${esc(nameOf(s.k))}</span></button></li>`).join('');
    let at = 0, auto = !reduced, timer = 0, visible = true;
    function show(i) {
      at = i; const s = seq[i];
      paint(op, s.c);
      art.innerHTML = draw(s.pre, s.c.p.colors, { size: 700, animate: !reduced, label: `${s.pre.name}, drawn as ${nameOf(s.k)}` });
      const svg = $('svg', art); svg.style.setProperty('--span', '1.5s'); svg.style.setProperty('--dur', '.9s');
      $('#opName').textContent = nameOf(s.k);
      $('#opWhere').textContent = STYLES[s.k].where || '';
      $('#opRule').textContent = STYLES[s.k].note || '';
      $('#opCap').textContent = `Fig. ${two(i + 1)} · ${s.pre.name} · ${nameOf(s.k)} · seed ${s.pre.seed}`;
      const bs = $$('button', stops);
      bs.forEach((b, j) => { b.classList.remove('on'); b.classList.toggle('done', j < i || !auto); });
      void stops.offsetWidth;
      bs[i].classList.add('on');
    }
    stops.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      auto = false; clearInterval(timer); show(+b.dataset.i);
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .3 }).observe(op);
    show(0);
    if (auto) timer = setInterval(() => { if (auto && visible && !document.hidden) show((at + 1) % seq.length); }, T);
  })();

  /* ================= ROOMS ================= */
  const BUILD = {
    /* 01 — a ring of identical dancers: nobody is bigger than anybody */
    warli(room, k, no, c) {
      room.className = 'room r-warli';
      room.innerHTML = `
        <div class="w-copy rise">
          ${roomNo(no, k)}
          <h2 class="mega fitw"><span>${esc(nameOf(k))}</span></h2>
          <p class="rule">${esc(ruleOf(k))}</p>
          <p class="body">${esc(STYLES[k].note || '')}</p>
          ${placard(k, no)}
        </div>
        <div class="w-ring" role="img" aria-label="A ring of identical Warli dancers around a tarpa player"><svg viewBox="0 0 1000 1000"></svg><div class="w-centre"></div></div>`;
      const ring = $('.w-ring svg', room), centre = $('.w-centre', room);
      const dancer = find(k, ['Dancing', 'Arms out', 'Standing'], isSquare) || R.presetsOf(k).find(isSquare);
      const player = find(k, ['Tarpa player', 'Drummer'], isSquare);
      whenSeen(room, () => {
        let body = '', defs = '';
        const rings = [[372, 16, 150], [236, 11, 118]];
        rings.forEach(([r, n, s], ri) => {
          for (let j = 0; j < n; j++) {
            const t = j / n * Math.PI * 2 + ri * .14;
            const m = R.pieceMarkup(dancer, { x: 500 + r * Math.cos(t) - s / 2, y: 500 + r * Math.sin(t) - s / 2, w: s, h: s }, { colors: c.p.colors, rot: t * 180 / Math.PI + 90, animate: !reduced });
            defs += m.defs; body += `<g style="--d:${((ri * n + j) * .05).toFixed(2)}s">${m.body}</g>`;
          }
        });
        ring.innerHTML = `<defs>${defs}</defs>${body}`;
        ring.classList.add('draw'); ring.style.setProperty('--span', '.8s');
        if (player) centre.innerHTML = draw(player, c.p.colors, { size: 300, animate: !reduced });
      }, '0px');
      SCROLL.push(() => {
        const r = room.getBoundingClientRect(), p = (innerHeight - r.top) / (innerHeight + r.height);
        if (p > -.1 && p < 1.1) ring.style.transform = `rotate(${(p * 72).toFixed(2)}deg)`;
      });
    },

    /* 02 — one outline, and the fill says whose it is */
    gond(room, k, no, c) {
      room.className = 'room r-gond';
      const tree = find(k, ['Tree of life with deer', 'Tree of life'], isSquare) || pick(k, [], 1)[0];
      const trio = [['Outline deer', 'Bare outline'], ['Dotted deer', 'Dots'], ['Combed deer', 'Comb lines']].map(([n, l]) => [R.findPreset(n, k), l]).filter(x => x[0]);
      room.innerHTML = `
        <div class="g-title mega fitw"><span>${esc(nameOf(k))}</span></div>
        <div class="g-tree" role="button" tabindex="0" aria-label="Redraw the tree"><div></div></div>
        <div class="g-side rise">
          ${roomNo(no, k, '<span class="hint">Click the tree</span>')}
          <p class="rule">${esc(ruleOf(k))}</p>
          <p class="body">${esc(STYLES[k].note || '')}</p>
          ${trio.length ? `<div class="g-trio">${trio.map(([p, l]) => `<figure><div data-n="${esc(p.name)}"></div><figcaption>${esc(l)}</figcaption></figure>`).join('')}</div>` : ''}
          ${placard(k, no)}
        </div>`;
      const box = $('.g-tree > div', room);
      let seed = null;
      const grow = () => { if (tree) { box.innerHTML = draw(tree, c.p.colors, { size: 900, seed, animate: !reduced }); $('svg', box).style.setProperty('--span', '1.6s'); } };
      const again = () => { seed = rnd(); grow(); };
      $('.g-tree', room).addEventListener('click', again);
      $('.g-tree', room).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); again(); } });
      whenSeen(room, () => {
        grow();
        $$('.g-trio [data-n]', room).forEach((d, i) => { d.innerHTML = draw(trio[i][0], c.p.colors, { size: 260, animate: !reduced }); });
      }, '0px');
    },

    /* 03 — a wall packed edge to edge; every tile edge drawn twice */
    madhubani(room, k, no, c) {
      room.className = 'room r-madhubani';
      const big = find(k, ['Bride and groom', 'Pair of fish'], isSquare);
      const strip = find(k, ['Fish border', 'Petal border'], isFree) || anyFree(k, /border/i);
      const singles = pick(k, ['Pair of fish', 'Elephant with rider', 'Peacock in display', 'Mithila woman', 'Circling fish', 'Turtle', 'Water carrier', 'Tiger'].filter(n => !big || n !== big.name), 7);
      const cols = c.p.colors;
      const tiles = [];
      tiles.push(`<div class="m-t m-head rise">${roomNo(no, k)}<h2 class="mega fitw"><span>${esc(nameOf(k))}</span></h2><p class="rule">${esc(ruleOf(k))}</p></div>`);
      if (big) tiles.push(`<div class="m-t big" data-p="big"></div>`);
      singles.forEach((p, i) => {
        const fill = i === 1 ? ` fill" style="--tile:${cols[2]}` : i === 5 ? ` fill" style="--tile:${cols[3]}` : '';
        tiles.push(`<div class="m-t${i === 6 ? ' opt' : ''}${fill}" data-p="s${i}"></div>`);
        if (i === 2) tiles.push('<div class="m-t kachni"></div>');
        if (i === 4) tiles.push('<div class="m-t kachni-r"></div>');
      });
      if (strip) tiles.push(`<div class="m-t wide" data-p="strip"></div>`);
      tiles.push(`<div class="m-t m-label">${placard(k, no)}</div>`);
      room.innerHTML = `<div class="m-wall">${tiles.join('')}</div>`;
      whenSeen(room, () => {
        const put = (sel, pre, o) => { const t = $(`[data-p="${sel}"]`, room); if (t && pre) t.innerHTML = draw(pre, o.cols || cols, Object.assign({ animate: !reduced }, o)); };
        put('big', big, { size: 520 });
        singles.forEach((p, i) => put('s' + i, p, { size: 260 }));
        if (strip) { const t = $('[data-p="strip"]', room); t.innerHTML = draw(strip, cols, { w: 1200, h: 240, size: 600, animate: !reduced }); }
      }, '100px');
    },

    /* 04 — a painted border takes half the room */
    pattachitra(room, k, no, c) {
      room.className = 'room r-pattachitra';
      const frame = find(k, ['Deep creeper frame', 'Creeper frame', 'Lotus frame'], isFree) || anyFree(k, /frame|border/i);
      const edge = find(k, ['Deep creeper border', 'Creeper border', 'Lotus border'], isFree) || anyFree(k, /border/i);
      const scene = find(k, ['Facing lions', 'Great peacock', 'Dancer'], isSquare) || pick(k, [], 1)[0];
      room.innerHTML = `
        <div class="p-frame" aria-hidden="true"></div>
        <div class="p-inner">
          <div class="p-scene" role="button" tabindex="0" aria-label="Redraw the painting"></div>
          <div class="p-copy rise">
            ${roomNo(no, k)}
            <h2 class="mega fitw"><span>${esc(nameOf(k))}</span></h2>
            <p class="rule">${esc(ruleOf(k))}</p>
            <p class="body">${esc(STYLES[k].note || '')}</p>
            ${placard(k, no)}
          </div>
        </div>`;
      const fr = $('.p-frame', room), sc = $('.p-scene', room);
      let seed = null, lastW = 0, lastH = 0, seen = false;
      const drawFrame = animate => {
        if (!frame) return;
        const w = room.clientWidth, h = room.clientHeight;
        if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
        lastW = w; lastH = h;
        const inner = $('.p-inner', room);
        if (w < 700 && edge) {
          /* on a narrow screen a full frame would eat the room: keep the
             painted bands top and bottom, which is how a scroll is read */
          const bh = Math.round(w * .2);
          fr.classList.add('strips');
          fr.innerHTML = R.piece(edge, { w, h: bh, pad: 0, size: 700, colors: c.p.colors, animate }) + R.piece(edge, { w, h: bh, pad: 0, size: 700, colors: c.p.colors, animate });
          inner.style.margin = `${bh + 28}px 20px`;
        } else {
          fr.classList.remove('strips');
          fr.innerHTML = R.piece(frame, { w, h, pad: 0, size: 1100, colors: c.p.colors, animate });
          /* keep the painting inside the band the frame actually drew */
          const m = Math.round(Math.min(w, h) * .19 + 28);
          inner.style.margin = `${m}px ${m + 8}px`;
        }
        $$('.fitw', room).forEach(fit);
      };
      const paintScene = () => { if (scene) sc.innerHTML = draw(scene, c.p.colors, { size: 620, seed, animate: !reduced }); };
      const again = () => { seed = rnd(); paintScene(); };
      sc.addEventListener('click', again);
      sc.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); again(); } });
      whenSeen(room, () => { seen = true; drawFrame(!reduced); paintScene(); }, '0px');
      RESIZE.push(() => { if (seen) drawFrame(false); });
    },

    /* 05 — a length of cloth unrolls sideways as you scroll */
    kalamkari(room, k, no, c) {
      room.className = 'room r-kalamkari';
      const cloth = colours(k, cfg(k).cloth != null ? cfg(k).cloth : 0).p.colors;
      room.innerHTML = `
        <div class="k-stick">
          <div class="k-top">
            <div class="rise">${roomNo(no, k)}<h2 class="mega fitw"><span>${esc(nameOf(k))}</span></h2></div>
            <div class="rise"><p class="rule">${esc(ruleOf(k))}</p></div>
            ${placard(k, no)}
          </div>
          <div class="k-cloth" tabindex="0" aria-label="A length of Kalamkari cloth"><div class="k-strip"></div><div class="k-progress"><i></i></div></div>
        </div>`;
      const strip = $('.k-strip', room), bar = $('.k-progress i', room), wrap = $('.k-cloth', room);
      whenSeen(room, () => {
        const W = 6400, H = 1000;
        const border = find(k, ['Paisley border', 'Flower border', 'Vine border'], isFree) || anyFree(k, /border/i);
        const ground = find(k, ['Paisley butis', 'Flower butis', 'Leaf butis'], isFree);
        const motifs = pick(k, ['Pair of peacocks', 'Paisley rosette', 'Pomegranate', 'Peacock', 'Paisley on a vine', 'Lotus', 'Madder peacock', 'Rosette'], 8);
        let defs = '', body = `<rect width="${W}" height="${H}" fill="${cloth[4]}"/>`;
        const add = (pre, box, o) => { if (!pre) return; const m = R.pieceMarkup(pre, box, Object.assign({ colors: cloth }, o)); defs += m.defs; body += m.body; };
        if (ground) body += `<g opacity=".3">`, add(ground, { x: 0, y: 150, w: W, h: 700 }), body += '</g>';
        if (border) { add(border, { x: 0, y: 14, w: W, h: 120 }); add(border, { x: 0, y: 866, w: W, h: 120 }); }
        motifs.forEach((p, i) => add(p, { x: 260 + i * 780, y: i % 2 ? 250 : 180, w: 580, h: 580 }));
        strip.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kalamkari cloth"><defs>${defs}</defs>${body}</svg>`;
      }, '400px');
      SCROLL.push(() => {
        if (innerWidth <= 820) return;
        const r = room.getBoundingClientRect(), navh = $('#nav').offsetHeight;
        const span = room.offsetHeight - (innerHeight - navh);
        const p = Math.min(1, Math.max(0, (navh - r.top) / span));
        const travel = Math.max(0, strip.offsetWidth - wrap.clientWidth + 2 * parseFloat(getComputedStyle(strip).left));
        strip.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`;
        bar.style.transform = `scaleX(${p.toFixed(3)})`;
      });
    },

    /* 06 — loose pages on a desk; pick anything up and move it */
    sketch(room, k, no, c) {
      room.className = 'room r-sketch';
      room.innerHTML = `
        <div class="s-head">
          <div class="rise">${roomNo(no, k, '<span class="hint">Drag anything</span>')}<h2 class="mega fitw"><span>${esc(nameOf(k))}</span></h2><p class="rule" style="margin-top:18px">${esc(ruleOf(k))}</p></div>
          ${placard(k, no)}
        </div>
        <div class="s-desk"></div>`;
      const desk = $('.s-desk', room);
      const LAY = [[3, 8, 15, -8], [19, 42, 13, 6], [33, 4, 12, 4], [46, 38, 16, -5], [62, 6, 12, 9], [76, 34, 15, -4], [88, 2, 11, 7], [8, 56, 12, 5], [58, 58, 12, -9], [83, 64, 12, 3]];
      const pieces = pick(k, ['Cat, sitting', 'Sunflower', 'Rocket', 'Crested bird', 'Espresso cup', 'Mushroom', 'Potted plant', 'Delighted', 'Paper lantern', 'Bunny'], LAY.length);
      whenSeen(room, () => {
        desk.innerHTML = pieces.map((p, i) => { const [x, y, s, r] = LAY[i]; return `<div class="doodle" style="left:${x}%;top:${y}%;--s:${s}%;--r:${r}deg" aria-label="${esc(p.name)}">${draw(p, c.p.colors, { size: 300, animate: !reduced, pad: .06 })}</div>`; }).join('');
        let z = 10;
        $$('.doodle', desk).forEach(d => {
          d.addEventListener('pointerdown', e => {
            e.preventDefault(); d.setPointerCapture(e.pointerId); d.classList.add('drag'); d.style.zIndex = ++z;
            const dr = desk.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, ox = d.offsetLeft, oy = d.offsetTop;
            const move = ev => {
              const x = Math.min(dr.width - d.offsetWidth * .5, Math.max(-d.offsetWidth * .5, ox + ev.clientX - sx));
              const y = Math.min(dr.height - d.offsetHeight * .5, Math.max(-d.offsetHeight * .3, oy + ev.clientY - sy));
              d.style.left = (x / dr.width * 100) + '%'; d.style.top = (y / dr.height * 100) + '%';
            };
            const up = () => { d.classList.remove('drag'); d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up); };
            d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
          });
        });
      }, '0px');
    },
  };
  /* any tradition without a room of its own gets a plain one */
  function generic(room, k, no, c) {
    room.className = 'room r-generic';
    const ps = pick(k, [], 6);
    room.innerHTML = `
      <div class="rise" style="display:flex;flex-direction:column;gap:24px">${roomNo(no, k)}<h2 class="mega fitw"><span>${esc(nameOf(k))}</span></h2><p class="rule">${esc(ruleOf(k))}</p><p class="body">${esc(STYLES[k].note || '')}</p>${placard(k, no)}</div>
      <div class="gen-grid">${ps.map((p, i) => `<div data-i="${i}" role="button" tabindex="0" aria-label="Redraw ${esc(p.name)}"></div>`).join('')}</div>`;
    const put = (d, seed) => { d.innerHTML = draw(ps[d.dataset.i], c.p.colors, { size: 300, seed, animate: !reduced }); };
    $$('.gen-grid > div', room).forEach(d => d.addEventListener('click', () => put(d, rnd())));
    whenSeen(room, () => $$('.gen-grid > div', room).forEach(d => put(d)), '0px');
  }

  const SCROLL = [], RESIZE = [];
  const roomsEl = $('#rooms');
  KEYS.forEach((k, i) => {
    const room = document.createElement('section'), c = colours(k);
    room.id = 'room-' + k; room.dataset.room = nameOf(k); room.dataset.no = two(i + 1);
    room.setAttribute('aria-label', `Room ${i + 1}: ${nameOf(k)}`);
    paint(room, c);
    roomsEl.appendChild(room);
    (BUILD[k] || generic)(room, k, i + 1, c);
  });
  $('#studioNo').textContent = two(N + 1);
  $('#admNo').textContent = two(N + 2);

  /* ================= NAV: floor plan follows the page ================= */
  const nav = $('#nav');
  const secs = $$('main > section, #rooms > section');
  const stopsFor = secs.filter(s => s.dataset.room && s.id !== 'top' && s.id !== 'info' && s.id !== 'exit');
  const planHTML = stopsFor.map(s => {
    const no = s.dataset.no || (s.id === 'studio' ? two(N + 1) : s.id === 'admission' ? two(N + 2) : '');
    return `<a href="#${s.id}" data-id="${s.id}"><b>${no}</b>${esc(s.dataset.room)}</a>`;
  }).join('');
  $('#plan').innerHTML = planHTML;
  $('#planSheet').innerHTML = `<a href="#top" data-id="top"><b>00</b>Opening</a>` + planHTML;
  $('#planSheet').addEventListener('click', e => { if (e.target.closest('a')) $('#planSm').open = false; });
  let current = null;
  function theme() {
    const y = nav.offsetHeight + 1;
    const s = secs.find(x => { const r = x.getBoundingClientRect(); return r.top <= y && r.bottom > y; }) || secs[0];
    if (s === current) return;
    current = s;
    const cs = getComputedStyle(s);
    let bg = cs.backgroundColor;
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = getComputedStyle(document.body).backgroundColor;
    document.documentElement.style.setProperty('--nav-g', bg);
    document.documentElement.style.setProperty('--nav-f', cs.color);
    $$('#plan a, #planSheet a').forEach(a => a.classList.toggle('on', a.dataset.id === s.id));
    $('#planNow').textContent = (s.dataset.no ? s.dataset.no + ' ' : '') + (s.dataset.room || 'Scrawl');
  }
  /* the opening changes colour on its own, so re-read it when it does */
  new MutationObserver(() => { if (current && current.id === 'top') { current = null; theme(); } }).observe($('#top'), { attributes: true, attributeFilter: ['style'] });

  /* ================= STUDIO: the live editor ================= */
  (function app() {
    const board = $('#board'), art = $('#boardArt'), canvas = $('#appCanvas');
    const heroTpl = { warli: 'Village wall', gond: 'Tree of life', madhubani: 'Two fish', pattachitra: 'Guardian lions', kalamkari: 'Palampore', sketch: 'Event poster' };
    const palsFor = k => { const n = S.stylePalettes(k).length; return (k === 'sketch' ? [26, 1, 3, 9, 14, 21, 7, 0, 2, 4, 5, 6] : [...Array(n).keys()]).filter(i => i < n).slice(0, 12); };
    const st = { k: KEYS[0], tpl: null, pal: 0, seed: 0, base: 0, wobble: 0 };
    $('#appTrads').innerHTML = KEYS.map(k => {
      const p = colours(k).p;
      return `<button class="trad-tab" role="tab" data-k="${k}" aria-selected="false"><span class="sw" style="background:${p.paper}"><svg viewBox="0 0 22 22"><circle cx="9.5" cy="9.5" r="5" fill="${p.colors[0]}"/><circle cx="15" cy="15" r="3" fill="${p.colors[1]}"/></svg></span>${esc(nameOf(k))}<span class="n">${count(k)}</span></button>`;
    }).join('');
    const firstTpl = k => { const all = tplsOf(k); return all.find(t => t.name === heroTpl[k]) || all[0] || null; };
    const baseSeed = t => { let h = 7; for (const ch of t.name) h = (h * 31 + ch.charCodeAt(0)) % 999983; return 100000 + h % 900000; };
    function setTrad(k, animate) {
      st.k = k; st.wobble = S.styleOf(k).hand.rough;
      $$('.trad-tab').forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
      const sel = $(`.trad-tab[data-k="${k}"]`);
      if (sel && innerWidth <= 900) sel.parentNode.scrollTo({ left: sel.offsetLeft - 10, behavior: reduced ? 'auto' : 'smooth' });
      $('#appTradName').textContent = nameOf(k);
      $('#appNote').textContent = STYLES[k].note || '';
      $('#appTpls').innerHTML = tplsOf(k).map((t, i) => `<button class="tpl-item ${t.w / t.h > 1.15 ? 'wide' : t.w / t.h > .9 ? 'sq' : ''}" role="option" data-i="${i}">${esc(t.name)}</button>`).join('');
      $('#appPals').innerHTML = palsFor(k).map(i => { const p = R.palette(k, i); return `<button class="pal" role="radio" data-i="${i}" aria-label="${esc(p.name)}" title="${esc(p.name)}" style="background:${p.paper}"><i style="background:${p.colors[0]}"></i><i style="background:${p.colors[1]}"></i></button>`; }).join('');
      setTpl(firstTpl(k), animate);
    }
    function setTpl(t, animate) {
      st.tpl = t; if (!t) { art.innerHTML = ''; return; }
      st.pal = t.pal || 0; st.base = baseSeed(t); st.seed = st.base;
      $$('.tpl-item').forEach(b => b.setAttribute('aria-selected', tplsOf(st.k)[b.dataset.i] === t));
      $('#appFile').textContent = t.name;
      markPal(); render(animate);
    }
    function markPal() {
      let found = false;
      $$('.pal').forEach(b => { const on = +b.dataset.i === st.pal; found = found || on; b.setAttribute('aria-checked', on); });
      if (!found) {
        const p = R.palette(st.k, st.pal), b = document.createElement('button');
        b.className = 'pal'; b.setAttribute('role', 'radio'); b.dataset.i = st.pal; b.setAttribute('aria-checked', 'true');
        b.title = p.name; b.setAttribute('aria-label', p.name); b.style.background = p.paper;
        b.innerHTML = `<i style="background:${p.colors[0]}"></i><i style="background:${p.colors[1]}"></i>`;
        $('#appPals').prepend(b);
      }
      $('#palName').textContent = R.palette(st.k, st.pal).name;
    }
    function fitBoard() {
      const t = st.tpl; if (!t) return;
      const cs = getComputedStyle(canvas);
      const w = canvas.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = canvas.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const s = Math.min(w / t.w, h / t.h);
      board.style.width = Math.floor(t.w * s) + 'px'; board.style.height = Math.floor(t.h * s) + 'px';
      $('#boardLabel').textContent = `${t.name}  ·  ${t.w} × ${t.h}`;
    }
    function render(animate) {
      const t = st.tpl; if (!t) return;
      fitBoard();
      art.innerHTML = R.template(t, { pal: st.pal, seed: st.seed === st.base ? 0 : st.seed, hand: { rough: st.wobble }, animate: animate && !reduced, detail: .8 });
      const svg = $('svg', art); svg.style.setProperty('--span', '1.2s'); svg.style.setProperty('--dur', '.8s');
      R.fitText(art);
      $('#appSeed').textContent = String(st.seed).padStart(6, '0');
      $('#appWobble').value = st.wobble; $('#appWobbleOut').textContent = st.wobble.toFixed(2);
      if (animate) { board.classList.remove('swap'); void board.offsetWidth; board.classList.add('swap'); }
    }
    let raf = 0;
    const repaint = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => render(false)); };
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
    $('#appShuffle').addEventListener('click', () => { st.seed = rnd(); render(true); });
    if ('ResizeObserver' in window) new ResizeObserver(fitBoard).observe(canvas);
    if (document.fonts) document.fonts.ready.then(() => R.fitText(art));
    whenSeen($('#app'), () => setTrad(st.k, true), '200px');
  })();

  /* ================= ADMISSION: tickets ================= */
  (function () {
    const P = S.PLAN || {}, C = CONFIG.plan;
    const prices = P.PRICES || C.prices, free = P.FREE || C.free;
    const pro = P.FEATURES ? Object.values(P.FEATURES).filter(f => f.pro).map(f => f.label) : C.pro;
    const checkout = P.CHECKOUT || C.checkout;
    /* no checkout link yet means the beta: every Pro feature is open */
    const beta = !checkout.monthly && !checkout.lifetime;
    const m = prices.monthly, l = prices.lifetime;
    const band = (k, names) => STYLES[k] ? (find(k, names, isFree) || anyFree(k, /border/i)) : null;
    const T = [
      { id: 'free', name: 'Free pass', price: '$0', per: 'forever', blurb: 'Everything you need to make the work.', features: free, href: CONFIG.editor, cta: 'Start drawing', note: 'No account needed', serial: '000000',
        tg: '#FBF8F1', tf: '#121110', acc: '#D6336C', tilt: -1.4, band: band('warli', ['Fine triangle border', 'Triangle border']) },
      { id: 'monthly', name: m.label, price: m.price, per: m.per, blurb: 'For getting the work out into the world.', lead: 'Everything in Free, plus', features: pro, href: checkout.monthly, cta: `Choose ${m.label.toLowerCase()}`, note: m.note, serial: '000009',
        tg: '#123A5C', tf: '#F5EEDC', acc: '#F2A93B', tilt: .9, band: band('gond', ['Dot border', 'Crescent border']) },
      { id: 'lifetime', name: l.label, price: l.price, per: l.per, blurb: 'All of Pro for one payment, with every update after.', lead: 'Everything in Pro, plus', features: ['Every future update', 'No subscription to manage'], href: checkout.lifetime, cta: `Choose ${l.label.toLowerCase()}`, note: l.note, serial: '000049', best: true,
        tg: '#B4603C', tf: '#FCF7EE', acc: '#1F0F09', tilt: -.6, band: band('madhubani', ['Fish border', 'Petal border']) || band('warli', ['Triangle border']) },
    ];
    if (beta) T.forEach(t => { if (t.id !== 'free') { t.cta = 'Free during beta'; t.href = CONFIG.editor; } });
    if (beta) $('.adm-head').insertAdjacentHTML('beforeend', '<p class="beta-flag">Beta · every Pro feature is free until launch</p>');
    $('#tickets').innerHTML = T.map(t => `
      <article class="ticket rise" style="--tg:${t.tg};--tf:${t.tf};--tilt:${t.tilt}deg" aria-label="${esc(t.name)} ticket">
        <div class="t-band" data-band="${t.id}"></div>
        <div class="t-main">
          <p class="t-admit"><span>Admit one</span><span>${t.best ? 'Best value' : 'Scrawl'}</span></p>
          <h3 class="t-name">${esc(t.name)}</h3>
          <p class="t-price"><b>${esc(t.price)}</b><span>${esc(t.per)}</span>${beta && t.id !== 'free' ? '<span class="stamp" style="--stamp:#F4FF6B">Free<br>during<br>beta</span>' : ''}</p>
          <p class="t-blurb">${esc(t.blurb)}</p>
          <ul class="t-list">${t.lead ? `<li class="lead">${esc(t.lead)}</li>` : ''}${t.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        </div>
        <div class="t-perf" aria-hidden="true"></div>
        <div class="t-stub">
          <a class="btn" href="${esc(t.href)}"${/^https?:/.test(t.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(t.cta)}</a>
          <p class="t-meta"><span>No. ${t.serial}</span><span>${esc(t.note || '')}</span></p>
        </div>
      </article>`).join('');
    whenSeen($('#tickets'), () => T.forEach(t => {
      if (!t.band) return;
      $(`[data-band="${t.id}"]`).innerHTML = R.piece(t.band, { w: 800, h: 90, pad: 0, size: 500, colors: [t.tf, t.acc, t.tf, t.acc, t.tg], slice: true });
    }));
    const cell = v => v === true ? '<span class="y" aria-label="Included"></span>' : v === false ? '<span class="no" aria-label="Not included">—</span>' : esc(v);
    const rows = free.map(f => [f, true, true, true]).concat(pro.map(f => [f, false, true, true]), [['Billing', 'Free', m.per.replace(/^\/\s*/, 'Every '), 'Once']]);
    $('#compare').innerHTML = `<thead><tr><th scope="col"><span class="sr-only">Feature</span></th>${T.map(t => `<th scope="col">${esc(t.name)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map(v => `<td>${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    $('#faqList').innerHTML = CONFIG.faq.map(([q, a], i) => `<details><summary><b>${two(i + 1)}</b><span>${esc(q)}</span></summary><p>${esc(a)}</p></details>`).join('');
  })();

  /* ================= EXIT: the chain walks on ================= */
  (function () {
    const k = STYLES.warli ? 'warli' : KEYS[0];
    const chain = find(k, ['Long chain', 'Human chain', 'Walking line'], isFree) || anyFree(k, /chain|line|row/i);
    if (!chain) return;
    whenSeen($('#exitBand'), () => {
      const one = R.piece(chain, { w: 2400, h: 240, pad: 0, size: 900, colors: ['#EEE8DC', '#F4FF6B', '#EEE8DC', '#EEE8DC', '#121110'] });
      $('#exitBand').innerHTML = `<div class="row">${one}${one}</div>`;
    });
  })();

  /* ================= wiring ================= */
  let ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; SCROLL.forEach(f => f()); theme(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitAll(); RESIZE.forEach(f => f()); onScroll(); }, 120); });
  fitAll(); onScroll();
  if (document.fonts) document.fonts.ready.then(() => { fitAll(); onScroll(); });

  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rise').forEach(e => io.observe(e));
  } else $$('.rise').forEach(e => e.classList.add('in'));
})();
