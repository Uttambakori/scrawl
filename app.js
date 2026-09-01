/* ============================================================
   SCRAWL / app — the editor
   ============================================================ */
(function () {
  const S = window.SCRAWL, { Hand, GENS, hashStr, PRESETS, TEMPLATES, icon, paintIcons } = S;
  const { PALETTES, CANVASES, FONTS, TEXTURES, FILLS, COMPOSITIONS, WORDS, SUBS } = S.DATA;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(rnd(a, b + 1));
  const pickOf = a => a[Math.floor(Math.random() * a.length)];
  const uid = () => (Date.now() % 1e7) * 1000 + Math.floor(Math.random() * 1000);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------------- a generator for hand-drawn custom paths ------------- */
  GENS.custom = {
    key: 'custom', cat: 'Custom', label: 'Drawing', aspect: 'free',
    params: [{ k: 'closed', label: 'Close the path', type: 'bool', def: 1 },
    { k: 'smooth', label: 'Smoothing', type: 'num', min: 0, max: 100, def: 70, step: 1 }],
    draw(h, p) {
      const pts = p._pts || [];
      if (pts.length < 2) return;
      if (p.smooth > 40) h.shape(pts, { closed: !!p.closed });
      else h.shape(pts, { closed: !!p.closed, sharp: true });
    }
  };

  /* ---------------- state ---------------- */
  let doc = null, sel = new Set(), view = { z: 1, ox: 0, oy: 0 };
  let history = [], hi = -1, editing = null, guides = [], pen = null;
  let tool = 'select', snapOn = true;
  const penOpts = { smooth: 1, closed: 1 };

  const presetByName = n => PRESETS.find(p => p.name === n);
  function baseWeight(d) { const dd = d || doc; return +(((dd ? dd.w + dd.h : 2160) / 2) / 1080 * 3.2).toFixed(2); }
  function defaultStyle(d) {
    const hh = (S.STYLES && S.styleOf(libStyle).hand) || { rough: 1.1, bow: 1, passes: 2, weight: 3.2, fillMode: 'none' };
    return {
      stroke: 0, fill: 4, accent: 1,
      weight: +(baseWeight(d) * (hh.weight / 3.2)).toFixed(2),
      rough: hh.rough, bow: hh.bow, passes: hh.passes,
      fillMode: hh.fillMode, fillGap: 4.5, fillAngle: -40, opacity: 1, wobble: 0,
    };
  }
  function fitBox(genKey, box, d, keepSize) {
    const g = GENS[genKey];
    if (!g) return box;
    /* free pieces know the shape they want to arrive at — a border is
       born long, a frame is born big, instead of everything landing
       as the same square. A template already gave real coordinates,
       so it passes keepSize and those win. Size against the document
       being built, not whichever one happens to be open. */
    if (g.aspect === 'free') {
      const dd = d || doc;
      if (keepSize || !g.place || !dd) return box;
      const w = dd.w * g.place.w, h = dd.h * g.place.h;
      return { x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - h / 2, w, h };
    }
    const s = Math.min(box.w, box.h);
    return { x: box.x + (box.w - s) / 2, y: box.y + (box.h - s) / 2, w: s, h: s };
  }
  function paletteAt(i) { const p = PALETTES[i % PALETTES.length]; return { name: p[0], paper: p[1], colors: [p[2], p[3], p[4], p[5], p[1]] }; }

  function newDoc(w = 1080, h = 1350, palIdx = 0, name = 'Untitled') {
    const bk = brand();
    const p = bk ? { paper: bk.paper, colors: bk.colors } : paletteAt(palIdx);
    return {
      id: 'd' + uid(), name, w, h, palIdx: bk ? -1 : palIdx,
      paper: p.paper, colors: p.colors.slice(), texture: 'grain', textureAmt: .12, textureScale: 1,
      items: [], boards: [{ id: 'b' + uid(), name: 'Board 1', x: 0, y: 0, w, h }], active: 0,
    };
  }

  /* ---------------- artboards ----------------
     Boards are rectangles on one infinite canvas. Items carry absolute
     coordinates and simply sit wherever they sit; a board is the paper under
     them and the region an export crops to. doc.w/doc.h track the active one
     so every existing size control keeps working. */
  function migrateBoards(d) {
    if (!d.boards || !d.boards.length) {
      d.boards = [{ id: 'b' + uid(), name: 'Board 1', x: 0, y: 0, w: d.w, h: d.h }];
      d.active = 0;
    }
    d.active = clamp(d.active | 0, 0, d.boards.length - 1);
    const b = d.boards[d.active];
    d.w = b.w; d.h = b.h;
    return d;
  }
  const board = () => doc.boards[doc.active];
  function syncActiveBoard() { const b = board(); if (b) { b.w = doc.w; b.h = doc.h; } }

  function boardsBounds(d) {
    const bs = (d || doc).boards;
    return {
      x: Math.min(...bs.map(b => b.x)), y: Math.min(...bs.map(b => b.y)),
      r: Math.max(...bs.map(b => b.x + b.w)), b: Math.max(...bs.map(b => b.y + b.h)),
    };
  }

  function addBoard(preset) {
    const bs = doc.boards;
    const bb = boardsBounds();
    const src = board();
    const w = preset ? preset[1] : src.w, h = preset ? preset[2] : src.h;
    const nb = { id: 'b' + uid(), name: 'Board ' + (bs.length + 1), x: bb.r + 80, y: bb.y, w, h };
    bs.push(nb);
    doc.active = bs.length - 1; doc.w = w; doc.h = h;
    sel.clear(); commit(); render(); fitView(); refreshPanels();
    toast('Added ' + nb.name);
  }
  function removeBoard(i) {
    if (doc.boards.length < 2) { toast('A file needs at least one board'); return; }
    const b = doc.boards[i];
    if (!confirm(`Delete "${b.name}"? Anything on it stays on the canvas.`)) return;
    doc.boards.splice(i, 1);
    doc.active = clamp(doc.active, 0, doc.boards.length - 1);
    const a = board(); doc.w = a.w; doc.h = a.h;
    commit(); render(); fitView(); refreshPanels();
  }
  function setActiveBoard(i) {
    if (i === doc.active) return;
    doc.active = i;
    const b = board(); doc.w = b.w; doc.h = b.h;
    render(); refreshPanels();
  }
  /* which board is under a point — used so clicking empty paper switches board */
  function boardAt(p) {
    for (let i = doc.boards.length - 1; i >= 0; i--) {
      const b = doc.boards[i];
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return i;
    }
    return -1;
  }
  function makeItem(genKey, box, d) {
    const g = GENS[genKey], params = {};
    g.params.forEach(pa => params[pa.k] = pa.def);
    return { id: uid(), type: 'shape', gen: genKey, params, seed: rint(0, 99999), x: box.x, y: box.y, w: box.w, h: box.h, rot: 0, st: defaultStyle(d), hidden: 0, locked: 0, name: g.label };
  }
  function makeText(txt, box, d) {
    return { id: uid(), type: 'text', text: txt || 'Text', font: 'Archivo Black', align: 'middle', letter: 0, lineH: 1.08, caps: 0, fit: 1, size: 80, x: box.x, y: box.y, w: box.w, h: box.h, rot: 0, st: Object.assign(defaultStyle(d), { wobble: 0 }), hidden: 0, locked: 0, name: 'Text' };
  }
  function itemFromPreset(pre, box, d, keepSize) {
    const it = makeItem(pre.gen, fitBox(pre.gen, box, d, keepSize), d);
    it.params = Object.assign({}, pre.params);
    it.seed = pre.seed; it.name = pre.name;
    return it;
  }

  /* ---------------- stroke cache ---------------- */
  const cache = new Map();
  function strokesFor(it) {
    const g = GENS[it.gen];
    // A free-aspect item scales x and y differently, which squashes whatever it
    // contains. Hand the generator its aspect so it can compensate.
    const free = g.aspect === 'free';
    const ar = free ? Math.max(.05, Math.min(20, (it.w || 1) / (it.h || 1))) : 1;
    const k = it.gen + '|' + it.seed + '|' + JSON.stringify(it.params) + '|' + (free ? ar.toFixed(2) : '') + '|' + it.st.rough + '|' + it.st.bow + '|' + it.st.passes + '|' + it.st.fillMode + '|' + it.st.fillGap + '|' + it.st.fillAngle;
    if (cache.has(k)) return cache.get(k);
    const h = new Hand(it.seed, { rough: it.st.rough, bow: it.st.bow, passes: it.st.passes, fillMode: it.st.fillMode, fillGap: it.st.fillGap, fillAngle: it.st.fillAngle });
    if (g.cat === 'Patterns') h.clipStart('M0 0H100V100H0Z');
    const params = free ? Object.assign({}, it.params, { _ar: ar }) : it.params;
    try { g.draw(h, params); } catch (e) { console.warn('gen', it.gen, e); }
    h.clipEnd();
    if (cache.size > 1400) cache.clear();
    cache.set(k, h.strokes);
    return h.strokes;
  }

  /* ---------------- render ---------------- */
  let clipN = 0, NS = 's', nsN = 0;
  const col = (c, d) => { const dd = d || doc; return typeof c === 'number' ? (dd.colors[c] || '#000') : c; };

  function itemMarkup(it, d) {
    d = d || doc;
    if (it.hidden) return '';
    const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
    const FL = (it.flipX || it.flipY) ? ` scale(${it.flipX ? -1 : 1} ${it.flipY ? -1 : 1})` : '';
    const T = `translate(${cx} ${cy}) rotate(${it.rot})${FL} translate(${-it.w / 2} ${-it.h / 2})`;
    const filt = it.st.wobble > 0 ? ` filter="url(#w${NS}_${it.id})"` : '';
    const op = ` opacity="${it._edit ? 0 : it.st.opacity}"`;

    if (it.type === 'text' && it.arc) {
      // text on a path: a circular arc, which is what badges and seals want
      const fs = it.size, r = Math.min(it.w, it.h) / 2 - fs * .1;
      const sweep = Math.max(10, Math.min(350, it.arcSweep || 180));
      const flip = it.arcFlip ? 1 : 0;
      const cx = it.w / 2, cy = it.h / 2;
      // top text runs clockwise over the top; bottom text runs the other way
      // under the bottom, so it still reads left to right and stays upright
      const mid = flip ? 90 : -90, half = sweep / 2;
      const A0 = flip ? mid + half : mid - half;
      const A1 = flip ? mid - half : mid + half;
      const a0 = A0 * Math.PI / 180, a1 = A1 * Math.PI / 180;
      const rr = flip ? r - fs * .9 : r;
      const p0 = [cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr];
      const p1 = [cx + Math.cos(a1) * rr, cy + Math.sin(a1) * rr];
      const large = sweep > 180 ? 1 : 0;
      const pid = 'arc' + NS + '_' + it.id;
      const arcD = `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${rr.toFixed(2)} ${rr.toFixed(2)} 0 ${large} ${flip ? 0 : 1} ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
      const words = esc(it.caps ? String(it.text).toUpperCase() : String(it.text)).replace(/\n/g, ' ');
      return `<g data-id="${it.id}" transform="${T}"${filt}${op}><defs><path id="${pid}" d="${arcD}"/></defs>` +
        `<text font-size="${fs.toFixed(2)}" letter-spacing="${(it.letter * fs / 100).toFixed(2)}" fill="${col(it.st.stroke, d)}" style="font-family:'${it.font}',sans-serif">` +
        `<textPath href="#${pid}" startOffset="50%" text-anchor="middle">${words}</textPath></text></g>`;
    }

    if (it.type === 'text') {
      const lines = String(it.text).split('\n'), fs = it.size;
      // _tx/_ty let the box hug the ink without the ink moving (see tighten)
      const ax = (it.align === 'start' ? 0 : it.align === 'end' ? it.w : it.w / 2) + (it._tx || 0);
      const ty = (it._ty || 0);
      const ls = (it.letter * fs / 100).toFixed(2);
      const body = lines.map((l, i) =>
        `<text x="${ax.toFixed(2)}" y="${(ty + fs * .82 + i * fs * it.lineH).toFixed(2)}" text-anchor="${it.align}" font-size="${fs.toFixed(2)}" letter-spacing="${ls}" fill="${col(it.st.stroke, d)}" style="font-family:'${it.font}',sans-serif">${esc(it.caps ? l.toUpperCase() : l)}</text>`).join('');
      return `<g data-id="${it.id}" transform="${T}"${filt}${op}>${body}</g>`;
    }
    if (it.type === 'svg') {
      return `<g data-id="${it.id}" transform="${T}"${filt}${op}><svg x="0" y="0" width="${it.w}" height="${it.h}" viewBox="${it.viewBox}" preserveAspectRatio="none" overflow="visible">${it.markup}</svg></g>`;
    }
    const sc = `scale(${(it.w / 100).toFixed(5)} ${(it.h / 100).toFixed(5)})`;
    const avg = (Math.abs(it.w) + Math.abs(it.h)) / 200 || 1;
    const sw = it.st.weight / avg;
    let clips = '', body = '';
    (it.type === 'path' ? it.strokes : strokesFor(it)).forEach(st => {
      let ca = '';
      if (st.clip) { const id = 'c' + NS + (clipN++); clips += `<clipPath id="${id}"><path d="${st.clip}"/></clipPath>`; ca = ` clip-path="url(#${id})"`; }
      const stroke = col(st.role === 'accent' ? it.st.accent : st.role === 'fill' ? it.st.fill : it.st.stroke, d);
      const fill = st.fill === 'none' ? 'none' : col(st.fill === 'accent' ? it.st.accent : st.fill === 'fill' ? it.st.fill : it.st.stroke, d);
      body += `<path d="${st.d}" fill="${fill}" stroke="${stroke}" stroke-width="${(st.w * sw).toFixed(3)}" stroke-linecap="${st.cap}" stroke-linejoin="round"${st.op !== 1 ? ` opacity="${st.op}"` : ''}${ca}/>`;
    });
    return `${clips ? `<defs>${clips}</defs>` : ''}<g data-id="${it.id}" transform="${T} ${sc}"${filt}${op}>${body}</g>`;
  }

  function texDefs(d) {
    const t = d.texture, s = d.textureScale;
    if (t === 'none') return { defs: '', rect: '' };
    if (['grain', 'rough', 'fibre', 'blotch'].includes(t)) {
      const bf = { grain: '0.9', rough: '0.34', fibre: '0.02 0.85', blotch: '0.05' }[t];
      const oct = { grain: 4, rough: 5, fibre: 3, blotch: 2 }[t];
      return {
        defs: `<filter id="tex${NS}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${bf}" numOctaves="${oct}" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>`,
        rect: b => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" filter="url(#tex${NS})" opacity="${d.textureAmt}" style="mix-blend-mode:multiply"/>`
      };
    }
    const g = 14 * s, c = d.colors[0];
    let inner = '';
    if (t === 'dots') inner = `<circle cx="${g / 2}" cy="${g / 2}" r="${1.1 * s}" fill="${c}"/>`;
    if (t === 'grid') inner = `<path d="M0 0H${g}M0 0V${g}" stroke="${c}" stroke-width="${.7 * s}" fill="none"/>`;
    if (t === 'lines') inner = `<path d="M0 ${g / 2}H${g}" stroke="${c}" stroke-width="${.7 * s}" fill="none"/>`;
    if (t === 'crosshatch') inner = `<path d="M0 0L${g} ${g}M${g} 0L0 ${g}" stroke="${c}" stroke-width="${.6 * s}" fill="none"/>`;
    return {
      defs: `<pattern id="tex${NS}" width="${g}" height="${g}" patternUnits="userSpaceOnUse">${inner}</pattern>`,
      rect: b => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="url(#tex${NS})" opacity="${d.textureAmt * 3}"/>`
    };
  }

  function wobDefs(d) {
    return d.items.filter(i => i.st.wobble > 0).map(i =>
      `<filter id="w${NS}_${i.id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${(.006 + i.st.wobble * .0016).toFixed(4)}" numOctaves="2" seed="${i.id % 9999}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${(i.st.wobble * 1.4).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('');
  }

  /* `crop` limits the output to one board; without it you get every board.
     `viewRect` widens the visible area beyond that, which print needs so the
     crop marks have somewhere to sit. */
  function buildSVG(d, forExport, crop, viewRect) {
    d = migrateBoards(d || doc); clipN = 0; NS = forExport ? 'x' + (++nsN) : 's';
    const tex = texDefs(d);
    const bb = boardsBounds(d);
    const view = viewRect ? viewRect : crop
      ? { x: crop.x, y: crop.y, w: crop.w, h: crop.h }
      : { x: bb.x, y: bb.y, w: bb.r - bb.x, h: bb.b - bb.y };
    const boards = crop ? [crop] : d.boards;
    const paper = boards.map(b => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${d.paper}"/>`).join('');
    const grain = tex.rect ? boards.map(b => tex.rect(b)).join('') : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" ${forExport ? '' : 'id="stage" '}width="${Math.round(view.w)}" height="${Math.round(view.h)}" viewBox="${view.x} ${view.y} ${view.w} ${view.h}">
<defs>${tex.defs}${wobDefs(d)}</defs>
${paper}
${forExport ? '<g>' : '<g id="art">'}${d.items.map(i => itemMarkup(i, d)).join('')}</g>
${grain}
${forExport ? '' : '<g id="ui"></g>'}</svg>`;
  }

  let awaitingFonts = false;
  function render() {
    $('#wrap').innerHTML = buildSVG(doc, false);
    fitTexts(); drawUI(); applyView();
    if (editing) syncEditor();
    $('#zoomLbl').textContent = Math.round(view.z * 100) + '%';
    // a webfont that lands after this render changes the metrics text was
    // measured against, so measure again once it has
    if (document.fonts && document.fonts.status === 'loading' && !awaitingFonts) {
      awaitingFonts = true;
      document.fonts.ready.then(() => { awaitingFonts = false; render(); });
    }
  }

  function fitTexts() {
    const svg = $('#stage'); if (!svg) return;
    // arc text sizes itself off its box, so neither fit nor tighten apply
    doc.items.filter(i => i.type === 'text' && !i.hidden && !i.arc).forEach(it => {
      // 1. `fit` runs once, when the item is first laid into a slot: pick the
      //    type size that fills it. After that the size is the user's.
      if (it.fit) {
        for (let pass = 0; pass < 2; pass++) {
          const g = svg.querySelector(`g[data-id="${it.id}"]`); if (!g) return;
          g.removeAttribute('filter');
          let bb; try { bb = g.getBBox(); } catch (e) { return; }
          if (!bb.width || !bb.height) return;
          const k = Math.min(it.w / bb.width, it.h / bb.height);
          const ns = clamp(it.size * k, 1, 6000);
          if (Math.abs(ns - it.size) < .4) break;
          it.size = ns; g.outerHTML = itemMarkup(it, doc);
        }
        it.fit = 0;
      }
      // 2. shrink the box onto the ink so the selection matches what you see
      if (!it.rot) tighten(it, svg);
      const g2 = svg.querySelector(`g[data-id="${it.id}"]`);
      if (g2 && it.st.wobble > 0) g2.setAttribute('filter', `url(#w${NS}_${it.id})`);
    });
  }

  /* Move the box onto the ink while leaving the ink exactly where it is:
     shift the box by the ink offset, and shift the text back by the same
     amount (plus whatever the anchor moved when the width changed). */
  function tighten(it, svg) {
    for (let pass = 0; pass < 3; pass++) {
      const g = svg.querySelector(`g[data-id="${it.id}"]`); if (!g) return;
      g.removeAttribute('filter');
      let bb; try { bb = g.getBBox(); } catch (e) { return; }
      if (!bb.width || !bb.height) return;
      if (Math.abs(bb.x) < .6 && Math.abs(bb.y) < .6 &&
        Math.abs(bb.width - it.w) < 1 && Math.abs(bb.height - it.h) < 1) return;
      const anchorOld = it.align === 'start' ? 0 : it.align === 'end' ? it.w : it.w / 2;
      const anchorNew = it.align === 'start' ? 0 : it.align === 'end' ? bb.width : bb.width / 2;
      it._tx = (it._tx || 0) - bb.x - (anchorNew - anchorOld);
      it._ty = (it._ty || 0) - bb.y;
      it.x += bb.x; it.y += bb.y;
      it.w = bb.width; it.h = bb.height;
      g.outerHTML = itemMarkup(it, doc);
    }
  }

  /* ---------------- viewport ---------------- */
  function applyView() {
    const w = $('#wrap'), bb = boardsBounds();
    w.style.transform = `translate(${view.ox}px,${view.oy}px) scale(${view.z})`;
    w.style.width = (bb.r - bb.x) + 'px'; w.style.height = (bb.b - bb.y) + 'px';
  }
  function fitView() {
    const vp = $('#viewport').getBoundingClientRect(), bb = boardsBounds();
    const W = bb.r - bb.x, H = bb.b - bb.y;
    view.z = Math.min((vp.width - 120) / W, (vp.height - 140) / H);
    view.ox = (vp.width - W * view.z) / 2 - bb.x * view.z;
    view.oy = (vp.height - H * view.z) / 2 - 12 - bb.y * view.z;
    applyView(); drawUI();
    $('#zoomLbl').textContent = Math.round(view.z * 100) + '%';
  }
  function toDoc(e) {
    const r = $('#viewport').getBoundingClientRect(), bb = boardsBounds();
    return { x: (e.clientX - r.left - view.ox) / view.z + bb.x, y: (e.clientY - r.top - view.oy) / view.z + bb.y };
  }
  function toScreen(x, y) {
    const r = $('#viewport').getBoundingClientRect(), bb = boardsBounds();
    return { x: r.left + view.ox + (x - bb.x) * view.z, y: r.top + view.oy + (y - bb.y) * view.z };
  }

  /* ==========================================================
     SMART GUIDES — Figma-style snapping
     ========================================================== */
  function snapTargets(excludeIds) {
    const b = board();
    const V = [{ v: b.x }, { v: b.x + b.w / 2 }, { v: b.x + b.w }];
    const H = [{ v: b.y }, { v: b.y + b.h / 2 }, { v: b.y + b.h }];
    doc.items.forEach(it => {
      if (excludeIds.has(it.id) || it.hidden) return;
      V.push({ v: it.x, it }, { v: it.x + it.w / 2, it }, { v: it.x + it.w, it });
      H.push({ v: it.y, it }, { v: it.y + it.h / 2, it }, { v: it.y + it.h, it });
    });
    return { V, H };
  }

  /* returns {dx, dy} plus fills `guides` with lines to draw */
  function snapBox(box, targets, edges) {
    const tol = 7 / view.z;
    guides = [];
    let dx = 0, dy = 0, bestX = tol, bestY = tol;
    const xs = edges ? edges.xs : [box.x, box.x + box.w / 2, box.x + box.w];
    const ys = edges ? edges.ys : [box.y, box.y + box.h / 2, box.y + box.h];
    xs.forEach(x => targets.V.forEach(t => {
      const d = t.v - x;
      if (Math.abs(d) < bestX) { bestX = Math.abs(d); dx = d; }
    }));
    ys.forEach(y => targets.H.forEach(t => {
      const d = t.v - y;
      if (Math.abs(d) < bestY) { bestY = Math.abs(d); dy = d; }
    }));
    // record the guide lines that actually matched after snapping
    const fx = xs.map(x => x + dx), fy = ys.map(y => y + dy);
    targets.V.forEach(t => { if (fx.some(x => Math.abs(x - t.v) < .5)) guides.push({ x: t.v }); });
    targets.H.forEach(t => { if (fy.some(y => Math.abs(y - t.v) < .5)) guides.push({ y: t.v }); });
    return { dx, dy };
  }

  /* ---------------- selection chrome ---------------- */
  const HANDLES = [[0, 0], [.5, 0], [1, 0], [1, .5], [1, 1], [.5, 1], [0, 1], [0, .5]];
  /* canvas chrome reads from the same palette as the interface */
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let SEL = '#2B5FD9', GUIDE = '#D2432B';
  function syncChromeColours() { SEL = css('--accent') || SEL; GUIDE = css('--guide') || GUIDE; }
  function drawUI() {
    const ui = $('#ui'); if (!ui) return;
    const k = 1 / view.z; let s = '';

    guides.forEach(g => {
      if (g.x !== undefined) s += `<line x1="${g.x}" y1="${-4000}" x2="${g.x}" y2="${doc.h + 4000}" stroke="${GUIDE}" stroke-width="${1 * k}"/>`;
      else s += `<line x1="${-4000}" y1="${g.y}" x2="${doc.w + 4000}" y2="${g.y}" stroke="${GUIDE}" stroke-width="${1 * k}"/>`;
    });

    doc.items.forEach(it => {
      if (!sel.has(it.id)) return;
      const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      s += `<g transform="translate(${cx} ${cy}) rotate(${it.rot})">
        <rect x="${-it.w / 2}" y="${-it.h / 2}" width="${it.w}" height="${it.h}" fill="none" stroke="${SEL}" stroke-width="${1.5 * k}"/>`;
      if (sel.size === 1 && !it.locked && !editing) {
        const hs = 8 * k;
        HANDLES.forEach(([hx, hy]) => {
          s += `<rect x="${-it.w / 2 + it.w * hx - hs / 2}" y="${-it.h / 2 + it.h * hy - hs / 2}" width="${hs}" height="${hs}" rx="${1.5 * k}" fill="#fff" stroke="${SEL}" stroke-width="${1.4 * k}"/>`;
        });
        s += `<line x1="0" y1="${-it.h / 2}" x2="0" y2="${-it.h / 2 - 26 * k}" stroke="${SEL}" stroke-width="${1.4 * k}"/><circle cx="0" cy="${-it.h / 2 - 30 * k}" r="${5.5 * k}" fill="#fff" stroke="${SEL}" stroke-width="${1.4 * k}"/>`;
      }
      s += '</g>';
    });


    // an empty page should say what to do next
    if (!doc.items.length && !pen) {
      const cx = doc.w / 2, cy = doc.h / 2, fs = 15 * k;
      s += `<g opacity=".45" style="font-family:'DM Sans',sans-serif">
        <text x="${cx}" y="${cy - fs * .6}" font-size="${fs}" text-anchor="middle" fill="${doc.colors[0]}">Click a piece in the Library to place it</text>
        <text x="${cx}" y="${cy + fs * 1.1}" font-size="${fs * .88}" text-anchor="middle" fill="${doc.colors[0]}">or press ✦ Surprise for a whole composition</text>
      </g>`;
    }

    if (marquee) s += `<rect x="${Math.min(marquee.x0, marquee.x1)}" y="${Math.min(marquee.y0, marquee.y1)}" width="${Math.abs(marquee.x1 - marquee.x0)}" height="${Math.abs(marquee.y1 - marquee.y0)}" fill="${SEL}22" stroke="${SEL}" stroke-width="${1.2 * k}"/>`;

    if (nodeEdit) {
      if (nodeEdit.gen === 'custom') {
        const pts = nodeEdit.params._pts || [];
        const d = pts.map((q, i) => { const P = genToDoc(nodeEdit, q[0], q[1]); return (i ? 'L' : 'M') + P.x + ' ' + P.y; }).join('');
        s += `<path d="${d}${nodeEdit.params.closed ? 'Z' : ''}" fill="none" stroke="${SEL}" stroke-width="${1.2 * k}" stroke-dasharray="${4 * k} ${3 * k}"/>`;
      }
      if (nodeEdit.type === 'path' && nodeEdit.strokes[activeStroke]) {
        s += `<path d="${nodeEdit.strokes[activeStroke].d}" fill="none" stroke="${SEL}" stroke-width="${1.6 * k * 100 / nodeEdit.w}" opacity=".9" transform="translate(${nodeEdit.x} ${nodeEdit.y}) scale(${nodeEdit.w / 100} ${nodeEdit.h / 100})"/>`;
      }
      const r = (nodeList.length > 60 ? 3.6 : 4.8) * k;
      nodeList.forEach((h, i) => {
        const P = genToDoc(nodeEdit, h.x, h.y);
        s += `<circle cx="${P.x}" cy="${P.y}" r="${i === dragNode ? r * 1.5 : r}" fill="${i === dragNode ? '${SEL}' : '#fff'}" stroke="${SEL}" stroke-width="${1.5 * k}"/>`;
      });
    }

    if (pen && pen.pts.length > 1 && pen.free) {
      const d = pen.pts.map((q, i) => (i ? 'L' : 'M') + q.x + ' ' + q.y).join('');
      s += `<path d="${d}" fill="none" stroke="${SEL}" stroke-width="${1.8 * k}" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (pen && pen.pts.length) {
      const d = pen.pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join('');
      s += `<path d="${d}${pen.hover ? 'L' + pen.hover.x + ' ' + pen.hover.y : ''}" fill="none" stroke="${SEL}" stroke-width="${1.6 * k}" stroke-dasharray="${5 * k} ${4 * k}"/>`;
      pen.pts.forEach((p, i) => s += `<circle cx="${p.x}" cy="${p.y}" r="${(i === 0 ? 6 : 4) * k}" fill="#fff" stroke="${SEL}" stroke-width="${1.6 * k}"/>`);
    }
    ui.innerHTML = s;
  }

  /* box coords (0..w, 0..h) -> document coords; the inverse of localOf */
  function boxToDoc(it, bx, by) {
    const a = it.rot * Math.PI / 180, dx = bx - it.w / 2, dy = by - it.h / 2;
    return { x: it.x + it.w / 2 + dx * Math.cos(a) - dy * Math.sin(a),
             y: it.y + it.h / 2 + dx * Math.sin(a) + dy * Math.cos(a) };
  }
  /* a generator's 0..100 space -> document coords */
  const genToDoc = (it, lx, ly) => boxToDoc(it, lx * it.w / 100, ly * it.h / 100);
  const docToGen = (it, p) => { const L = localOf(it, p); return { x: L.x * 100 / it.w, y: L.y * 100 / it.h }; };

  function localOf(it, p) {
    const cx = it.x + it.w / 2, cy = it.y + it.h / 2, a = -it.rot * Math.PI / 180;
    const dx = p.x - cx, dy = p.y - cy;
    return { x: dx * Math.cos(a) - dy * Math.sin(a) + it.w / 2, y: dx * Math.sin(a) + dy * Math.cos(a) + it.h / 2 };
  }
  function hitHandle(p) {
    if (sel.size !== 1 || editing) return null;
    const it = doc.items.find(i => sel.has(i.id)); if (!it || it.locked) return null;
    const L = localOf(it, p), tol = 11 / view.z;
    if (Math.hypot(L.x - it.w / 2, L.y + 30 / view.z) < tol) return { it, mode: 'rot' };
    for (let i = 0; i < HANDLES.length; i++) {
      const [hx, hy] = HANDLES[i];
      if (Math.abs(L.x - it.w * hx) < tol && Math.abs(L.y - it.h * hy) < tol) return { it, mode: 'scale', hx, hy, idx: i };
    }
    return null;
  }
  function hitItem(p) {
    for (let i = doc.items.length - 1; i >= 0; i--) {
      const it = doc.items[i]; if (it.hidden || it.locked) continue;
      const L = localOf(it, p);
      if (L.x >= -4 && L.x <= it.w + 4 && L.y >= -4 && L.y <= it.h + 4) return it;
    }
    return null;
  }

  /* ---------------- cursors ---------------- */
  const CURSOR_FOR_HANDLE = ['nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize'];
  function updateCursor(e) {
    const vp = $('#viewport');
    if (drag) { vp.dataset.cursor = drag.mode === 'pan' ? 'grabbing' : drag.mode === 'move' ? 'grabbing' : 'default'; return; }
    if (tool === 'hand' || space) { vp.dataset.cursor = 'grab'; return; }
    if (tool === 'pen' || tool === 'pencil') { vp.dataset.cursor = 'cross'; return; }
    if (tool === 'text') { vp.dataset.cursor = 'text'; return; }
    if (!e) { vp.dataset.cursor = 'default'; return; }
    const p = toDoc(e);
    const hh = hitHandle(p);
    if (hh) {
      if (hh.mode === 'rot') { vp.dataset.cursor = 'rotate'; return; }
      const it = hh.it, base = hh.idx;
      const turn = Math.round(((it.rot % 360) + 360) % 360 / 45);
      vp.style.cursor = CURSOR_FOR_HANDLE[(base + turn) % 8];
      vp.dataset.cursor = 'custom'; return;
    }
    vp.style.cursor = '';
    vp.dataset.cursor = hitItem(p) ? 'move' : 'default';
  }

  /* ---------------- pointer ---------------- */
  let drag = null, marquee = null, space = false, nodeEdit = null, dragNode = -1;
  let lastTap = { id: null, t: 0, x: 0, y: 0 };

  /* what a double-click opens, by what you double-clicked */
  let lastEditPoint = null;
  function editItem(it, p) {
    lastEditPoint = p ? docToGen(it, p) : null;
    sel.clear(); sel.add(it.id);
    if (it.type === 'text') return startEdit(it);
    if (it.type === 'shape' || it.type === 'path') return startNodeEdit(it, lastEditPoint);
    openSVGEditor(it);
  }

  /* ==========================================================
     PATH DATA — parse, drag an anchor, serialise back
     Our generators only ever emit M / L / C / Z.
     ========================================================== */
  function parseD(d) {
    const cmds = [], re = /([MLCZ])([^MLCZ]*)/gi;
    let m;
    while ((m = re.exec(d))) {
      cmds.push({
        op: m[1].toUpperCase(),
        nums: (m[2].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number)
      });
    }
    return cmds;
  }
  const n2 = v => Math.round(v * 100) / 100;
  const serialiseD = cmds => cmds.map(c => c.op + c.nums.map(n2).join(' ')).join('');

  /* the on-curve points — the ones worth showing as handles */
  function anchorsOf(cmds) {
    const out = [];
    cmds.forEach((c, ci) => {
      if (c.op === 'M' || c.op === 'L') { for (let k = 0; k + 1 < c.nums.length; k += 2) out.push({ ci, ni: k }); }
      else if (c.op === 'C') { for (let k = 0; k + 5 < c.nums.length; k += 6) out.push({ ci, ni: k + 4 }); }
    });
    return out;
  }

  /* move an anchor and carry its neighbouring control points with it, so the
     curve keeps its shape instead of kinking */
  function moveAnchor(cmds, ci, ni, dx, dy) {
    const c = cmds[ci];
    c.nums[ni] += dx; c.nums[ni + 1] += dy;
    if (c.op === 'C' && ni >= 2) { c.nums[ni - 2] += dx; c.nums[ni - 1] += dy; }
    const nxt = cmds[ci + 1];
    if (nxt && nxt.op === 'C' && nxt.nums.length >= 2) { nxt.nums[0] += dx; nxt.nums[1] += dy; }
  }

  /* Freeze a generated shape into plain editable paths. Appearance is
     identical; the shape dials go away, which is the honest trade. */
  function freezeToPath(it) {
    if (it.type === 'path') return;
    it.strokes = strokesFor(it).map(s => ({ d: s.d, role: s.role, fill: s.fill, w: s.w, cap: s.cap, op: s.op, clip: s.clip }));
    it.type = 'path';
    delete it.gen; delete it.params;
    it._cmds = null;
  }

  /* Handles for ONE path at a time. A sketchy drawing is a dozen overlapping
     strokes; showing every anchor at once is unusable. */
  let activeStroke = 0;
  function nodeHandles(it) {
    if (it.gen === 'custom') return (it.params._pts || []).map((p, i) => ({ kind: 'pt', i, x: p[0], y: p[1] }));
    if (it.type === 'path') {
      if (!it._cmds) it._cmds = it.strokes.map(s => parseD(s.d));
      const si = Math.max(0, Math.min(it._cmds.length - 1, activeStroke));
      const cmds = it._cmds[si];
      if (!cmds) return [];
      return anchorsOf(cmds).map(an => ({ kind: 'anchor', si, ci: an.ci, ni: an.ni, x: cmds[an.ci].nums[an.ni], y: cmds[an.ci].nums[an.ni + 1] }));
    }
    return [];
  }

  /* which stroke of a frozen path sits closest to a point (0..100 space) */
  function nearestStroke(it, g) {
    if (!it._cmds) it._cmds = it.strokes.map(s => parseD(s.d));
    let best = 0, bestD = Infinity;
    it._cmds.forEach((cmds, si) => {
      anchorsOf(cmds).forEach(an => {
        const dx = cmds[an.ci].nums[an.ni] - g.x, dy = cmds[an.ci].nums[an.ni + 1] - g.y;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = si; }
      });
    });
    return best;
  }

  function moveHandle(it, h, gx, gy) {
    if (h.kind === 'pt') {
      const pts = it.params._pts.slice();
      pts[h.i] = [gx, gy];
      it.params = Object.assign({}, it.params, { _pts: pts });
    } else {
      moveAnchor(it._cmds[h.si], h.ci, h.ni, gx - h.x, gy - h.y);
      it.strokes[h.si].d = serialiseD(it._cmds[h.si]);
    }
    h.x = gx; h.y = gy;
  }

  function simplifyPts(pts, tol) {
    if (pts.length < 3) return pts;
    const seg = (p, a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1);
      const u = Math.max(0, Math.min(1, t));
      const cx = a.x + u * dx, cy = a.y + u * dy;
      return (p.x - cx) ** 2 + (p.y - cy) ** 2;
    };
    const rec = (s, e) => {
      let idx = -1, max = 0;
      for (let i = s + 1; i < e; i++) { const d = seg(pts[i], pts[s], pts[e]); if (d > max) { max = d; idx = i; } }
      if (max > tol * tol && idx > 0) return rec(s, idx).concat(rec(idx, e).slice(1));
      return [pts[s], pts[e]];
    };
    return rec(0, pts.length - 1);
  }

  /* ---- point editing on a drawn path ---- */
  let nodeList = [];
  function startNodeEdit(it, at) {
    if (!it || (it.type !== 'shape' && it.type !== 'path')) return false;
    const wasGenerated = it.type === 'shape' && it.gen !== 'custom';
    if (wasGenerated) freezeToPath(it);
    stopEdit(); nodeEdit = it; sel.clear(); sel.add(it.id);
    activeStroke = at ? nearestStroke(it, at) : 0;
    nodeList = nodeHandles(it);
    if (!nodeList.length) { nodeEdit = null; toast('nothing to edit on this layer'); return false; }
    $('#nodeHint').classList.add('on');
    if (wasGenerated) commit();
    const many = it.type === 'path' && it._cmds.length > 1;
    toast(nodeList.length + ' points' + (many ? ' · click another stroke to switch' : '') );
    render(); refreshPanels(); return true;
  }
  function stopNodeEdit() {
    if (!nodeEdit) return;
    nodeEdit._cmds = null;
    nodeEdit = null; dragNode = -1; nodeList = [];
    $('#nodeHint').classList.remove('on');
    commit(); render(); refreshPanels();
  }
  function hitNode(p) {
    if (!nodeEdit) return -1;
    const tol = 9 / view.z;
    let best = -1, bestD = tol;
    nodeList.forEach((h, i) => {
      const P = genToDoc(nodeEdit, h.x, h.y);
      const d = Math.hypot(P.x - p.x, P.y - p.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  function onDown(e) {
    hideMenu();
    if (e.button === 2) return;
    if (e.button === 1 || space || tool === 'hand') { drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, ox: view.ox, oy: view.oy }; updateCursor(); return; }
    const p = toDoc(e);

    if (nodeEdit) {
      const ni = hitNode(p);
      if (ni >= 0) {
        if (e.altKey && nodeEdit.gen === 'custom' && (nodeEdit.params._pts || []).length > 2) {
          const pts = nodeEdit.params._pts.slice(); pts.splice(nodeList[ni].i, 1);
          nodeEdit.params = Object.assign({}, nodeEdit.params, { _pts: pts });
          nodeList = nodeHandles(nodeEdit);
          commit(); render(); return;
        }
        dragNode = ni; drag = { mode: 'node' }; drawUI(); return;
      }
      if (hitItem(p) !== nodeEdit) { stopNodeEdit(); }
      else {
        if (nodeEdit.type === 'path' && nodeEdit._cmds.length > 1) {
          const si = nearestStroke(nodeEdit, docToGen(nodeEdit, p));
          if (si !== activeStroke) { activeStroke = si; nodeList = nodeHandles(nodeEdit); drawUI(); }
        }
        return;
      }
    }

    if (tool === 'pen') { penClick(p); return; }
    if (tool === 'pencil') { pen = { pts: [p], free: 1 }; drag = { mode: 'draw' }; drawUI(); return; }
    if (tool === 'text') {
      const it = makeText('Text', { x: p.x, y: p.y, w: doc.w * .5, h: doc.h * .09 });
      addItem(it); setTool('select'); setTimeout(() => startEdit(it), 40); return;
    }

    if (editing) { const t = hitItem(p); if (t !== editing) stopEdit(); }
    const hh = hitHandle(p);
    if (hh) { drag = { mode: hh.mode, it: hh.it, hx: hh.hx, hy: hh.hy, start: p, snap: snapshot() }; return; }
    const it = hitItem(p);
    if (!it) {
      const bi = boardAt(p);
      if (bi >= 0 && bi !== doc.active) setActiveBoard(bi);
      if (!e.shiftKey) { sel.clear(); refreshPanels(); }
      marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; drag = { mode: 'marquee' };
      drawUI(); return;
    }
    // Own the double-click rather than relying on the browser's dblclick,
    // which the canvas redraw can break.
    const now = Date.now();
    if (lastTap.id === it.id && now - lastTap.t < 450 &&
      Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 10 / view.z) {
      lastTap = { id: null, t: 0, x: 0, y: 0 };
      drag = null;
      return editItem(it, p);
    }
    lastTap = { id: it.id, t: now, x: p.x, y: p.y };

    const family = withGroup(it);
    if (e.shiftKey) {
      const on = sel.has(it.id);
      family.forEach(f => on ? sel.delete(f.id) : sel.add(f.id));
    } else if (!sel.has(it.id)) {
      sel.clear(); family.forEach(f => sel.add(f.id));
    }
    if (e.altKey) duplicateSel();
    drag = { mode: 'move', start: p, snap: snapshot(), targets: snapTargets(sel) };
    refreshPanels(); drawUI(); updateCursor();
  }

  function onMove(e) {
    if (!drag) { updateCursor(e); if (pen) { pen.hover = toDoc(e); drawUI(); } return; }
    if (drag.mode === 'pan') { view.ox = drag.ox + (e.clientX - drag.sx); view.oy = drag.oy + (e.clientY - drag.sy); applyView(); return; }
    const p = toDoc(e);

    if (drag.mode === 'draw') {
      const last = pen.pts[pen.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) > 3 / view.z) { pen.pts.push({ x: p.x, y: p.y }); drawUI(); }
      return;
    }
    if (drag.mode === 'node') {
      const g = docToGen(nodeEdit, p);
      moveHandle(nodeEdit, nodeList[dragNode], g.x, g.y);
      render(); return;
    }

    if (drag.mode === 'marquee') {
      marquee.x1 = p.x; marquee.y1 = p.y;
      const x0 = Math.min(marquee.x0, marquee.x1), x1 = Math.max(marquee.x0, marquee.x1);
      const y0 = Math.min(marquee.y0, marquee.y1), y1 = Math.max(marquee.y0, marquee.y1);
      sel.clear();
      doc.items.forEach(it => { if (it.x + it.w > x0 && it.x < x1 && it.y + it.h > y0 && it.y < y1 && !it.hidden) sel.add(it.id); });
      drawUI(); return;
    }

    let dx = p.x - drag.start.x, dy = p.y - drag.start.y;

    if (drag.mode === 'move') {
      guides = [];
      if (snapOn && !e.metaKey && !e.ctrlKey) {
        // union bbox of the moving selection
        const moving = doc.items.filter(i => sel.has(i.id));
        const s0 = drag.snap;
        const bx = Math.min(...moving.map(i => s0[i.id].x)) + dx;
        const by = Math.min(...moving.map(i => s0[i.id].y)) + dy;
        const bw = Math.max(...moving.map(i => s0[i.id].x + s0[i.id].w)) + dx - bx;
        const bh = Math.max(...moving.map(i => s0[i.id].y + s0[i.id].h)) + dy - by;
        const off = snapBox({ x: bx, y: by, w: bw, h: bh }, drag.targets);
        dx += off.dx; dy += off.dy;
      }
      doc.items.forEach(it => { if (sel.has(it.id)) { const s = drag.snap[it.id]; it.x = s.x + dx; it.y = s.y + dy; } });
    }

    if (drag.mode === 'scale') {
      const it = drag.it, s = drag.snap[it.id], a = -it.rot * Math.PI / 180;
      let lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      let nw = s.w, nh = s.h, nx = s.x, ny = s.y;
      if (drag.hx === 0) { nw = s.w - lx; nx = s.x + lx; } if (drag.hx === 1) nw = s.w + lx;
      if (drag.hy === 0) { nh = s.h - ly; ny = s.y + ly; } if (drag.hy === 1) nh = s.h + ly;
      if (e.shiftKey && drag.hx !== .5 && drag.hy !== .5) {
        const k = Math.max(nw / s.w, nh / s.h); nw = s.w * k; nh = s.h * k;
        if (drag.hx === 0) nx = s.x + s.w - nw; if (drag.hy === 0) ny = s.y + s.h - nh;
      }
      it.w = Math.max(8, nw); it.h = Math.max(8, nh); it.x = nx; it.y = ny;
      if (it.type === 'text' && s.h) it.size = Math.max(1, s.size * (it.h / s.h));
      // snap the edge being dragged
      guides = [];
      if (snapOn && !it.rot && !e.metaKey && !e.ctrlKey) {
        const t = snapTargets(new Set([it.id]));
        const xs = drag.hx === .5 ? [] : [drag.hx === 0 ? it.x : it.x + it.w];
        const ys = drag.hy === .5 ? [] : [drag.hy === 0 ? it.y : it.y + it.h];
        const off = snapBox(it, t, { xs, ys });
        if (drag.hx === 0) { it.x += off.dx; it.w -= off.dx; } else if (drag.hx === 1) it.w += off.dx;
        if (drag.hy === 0) { it.y += off.dy; it.h -= off.dy; } else if (drag.hy === 1) it.h += off.dy;
      }
    }

    if (drag.mode === 'rot') {
      const it = drag.it, cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
      if (e.shiftKey) a = Math.round(a / 15) * 15;
      it.rot = Math.round(a * 10) / 10;
    }
    render();
  }

  function onUp() {
    if (drag && drag.mode === 'draw') {
      drag = null;
      const raw = pen ? pen.pts : [];
      pen = { pts: simplifyPts(raw, 2.2 / view.z) };
      const first = pen.pts[0], last = pen.pts[pen.pts.length - 1];
      const shut = penOpts.closed && first && last && Math.hypot(last.x - first.x, last.y - first.y) < 22 / view.z;
      finishPen(shut ? 1 : 0);
      return;
    }
    // Never rebuild the artwork here. onMove has already drawn the result, and
    // replacing the SVG between press and release stops the browser ever
    // pairing two clicks into a double-click.
    if (drag && drag.mode === 'node') { dragNode = -1; drag = null; commit(); drawUI(); return; }
    if (drag && ['move', 'scale', 'rot'].includes(drag.mode)) commit();
    if (drag && drag.mode === 'marquee') { marquee = null; refreshPanels(); }
    drag = null; guides = []; drawUI(); updateCursor();
  }
  function snapshot() { const o = {}; doc.items.forEach(i => o[i.id] = { x: i.x, y: i.y, w: i.w, h: i.h, rot: i.rot, size: i.size }); return o; }

  /* ==========================================================
     PEN TOOL — draw your own element
     ========================================================== */
  function penClick(p) {
    if (!pen) pen = { pts: [] };
    const first = pen.pts[0];
    if (first && pen.pts.length > 2 && Math.hypot(p.x - first.x, p.y - first.y) < 12 / view.z) return finishPen(true);
    pen.pts.push({ x: p.x, y: p.y });
    drawUI();
  }
  function finishPen(closed) {
    if (!pen || pen.pts.length < 2) { pen = null; setTool('select'); drawUI(); return; }
    const xs = pen.pts.map(p => p.x), ys = pen.pts.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = Math.max(x1 - x0, 8), h = Math.max(y1 - y0, 8);
    const local = pen.pts.map(p => [((p.x - x0) / w) * 100, ((p.y - y0) / h) * 100]);
    const it = makeItem('custom', { x: x0, y: y0, w, h });
    it.params = { closed: closed ? 1 : 0, smooth: penOpts.smooth ? 70 : 0, _pts: local };
    it.name = 'Drawing';
    pen = null; setTool('select');
    addItem(it);
    toast('Drawing added — tune it in Properties');
  }

  /* ---------------- inline text editing ---------------- */
  function startEdit(it) {
    if (!it || it.type !== 'text' || it.locked) return;
    stopEdit();
    editing = it; it._edit = 1;
    sel.clear(); sel.add(it.id);
    const ta = el('textarea', 'inlineEdit');
    ta.value = it.text; ta.spellcheck = false;
    ta.oninput = () => { it.text = ta.value; render(); };
    ta.onkeydown = ev => {
      ev.stopPropagation();
      if (ev.key === 'Escape') { ev.preventDefault(); stopEdit(); }
      if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); stopEdit(); }
    };
    ta.onblur = () => stopEdit();
    $('#viewport').appendChild(ta);
    render(); refreshPanels();
    ta.focus(); ta.select();
    $('#editHint').classList.add('on');
  }
  function syncEditor() {
    const ta = $('.inlineEdit'), it = editing; if (!ta || !it) return;
    const vp = $('#viewport').getBoundingClientRect(), s = toScreen(it.x, it.y);
    Object.assign(ta.style, {
      left: (s.x - vp.left) + 'px', top: (s.y - vp.top) + 'px',
      width: (it.w * view.z) + 'px', height: (it.h * view.z) + 'px',
      fontFamily: `'${it.font}', sans-serif`, fontSize: (it.size * view.z) + 'px',
      lineHeight: it.lineH, letterSpacing: (it.letter * it.size * view.z / 100) + 'px',
      color: col(it.st.stroke),
      textAlign: it.align === 'start' ? 'left' : it.align === 'end' ? 'right' : 'center',
      textTransform: it.caps ? 'uppercase' : 'none',
      transform: `rotate(${it.rot}deg)`, transformOrigin: 'center',
      paddingTop: (it.size * view.z * .06) + 'px',
    });
  }
  function stopEdit() {
    const ta = $('.inlineEdit');
    if (ta) { ta.onblur = null; ta.remove(); }
    if (editing) { delete editing._edit; editing = null; commit(); render(); refreshPanels(); }
    $('#editHint').classList.remove('on');
  }

  /* ---------------- history + files ---------------- */
  const FKEY = 'scrawl.files.v2';
  function store() { try { return JSON.parse(localStorage.getItem(FKEY) || '{"docs":{},"order":[],"cur":null}'); } catch (e) { return { docs: {}, order: [], cur: null }; } }
  function writeStore(s) { try { localStorage.setItem(FKEY, JSON.stringify(s)); } catch (e) { toast('storage full — use Export › Project file'); } }

  let saveTimer = null;
  function saveCurrent(now) {
    clearTimeout(saveTimer);
    const write = () => {
      const s = store();
      s.docs[doc.id] = { name: doc.name, updated: Date.now(), doc };
      if (!s.order.includes(doc.id)) s.order.unshift(doc.id);
      s.cur = doc.id; writeStore(s);
    };
    if (now) write(); else saveTimer = setTimeout(write, 500);
  }
  function commit() {
    const snap = JSON.stringify({ d: doc, s: [...sel] });
    if (history[hi] === snap) return;
    history = history.slice(0, hi + 1); history.push(snap); hi = history.length - 1;
    if (history.length > 80) { history.shift(); hi--; }
    saveCurrent(); updateHistoryButtons();
  }
  function restore(snap) {
    const s = JSON.parse(snap);
    doc = migrateBoards(s.d); sel = new Set((s.s || []).filter(id => doc.items.some(i => i.id === id)));
    render(); refreshPanels(); saveCurrent();
    $('#docName').textContent = doc.name; updateHistoryButtons();
  }
  function undo() { if (hi > 0) { hi--; restore(history[hi]); } }
  function redo() { if (hi < history.length - 1) { hi++; restore(history[hi]); } }
  function updateHistoryButtons() {
    $('#btnUndo').disabled = hi <= 0;
    $('#btnRedo').disabled = hi >= history.length - 1;
  }

  function openDoc(d, resetHistory) {
    stopEdit(); if (doc) saveCurrent(true);
    doc = migrateBoards(d); sel.clear();
    if (resetHistory !== false) { history = []; hi = -1; }
    buildStylePicker(); buildPalettes(); buildLibrary(); refreshPanels(); render(); fitView(); commit();
    $('#docName').textContent = doc.name;
    closeHome();
  }

  /* ---------------- templates ---------------- */
  function docFromTemplate(tpl) {
    if (tpl.style && tpl.style !== libStyle) applyStyle(tpl.style);
    const d = newDoc(tpl.w, tpl.h, tpl.pal, tpl.name === 'Blank canvas' ? 'Untitled' : tpl.name);
    const pals = S.stylePalettes(tpl.style || libStyle);
    const pr = pals[(tpl.pal || 0) % pals.length];
    d.paper = pr[1]; d.colors = [pr[2], pr[3], pr[4], pr[5], pr[1]]; d.palIdx = tpl.pal || 0;
    d.texture = tpl.texture; d.textureAmt = tpl.amt; d.textureScale = 1;
    (tpl.items || []).forEach(sl => {
      const box = { x: sl.x / 100 * d.w, y: sl.y / 100 * d.h, w: sl.w / 100 * d.w, h: sl.h / 100 * d.h };
      let it;
      if (sl.t !== undefined) {
        it = makeText(sl.t, box, d);
        it.font = sl.font || 'DM Sans'; it.caps = sl.caps || 0;
        it.align = sl.align || 'middle'; it.letter = sl.ls || 0; it.lineH = sl.lh || 1.08;
      } else {
        const pre = presetByName(sl.p); if (!pre) return;
        it = itemFromPreset(pre, box, d, true);
      }
      if (sl.c !== undefined) it.st.stroke = sl.c;
      if (sl.a !== undefined) it.st.accent = sl.a;
      if (sl.f !== undefined) it.st.fill = sl.f;
      if (sl.fill) it.st.fillMode = sl.fill;
      if (sl.op !== undefined) it.st.opacity = sl.op;
      if (sl.rot) it.rot = sl.rot;
      d.items.push(it);
    });
    return d;
  }

  /* ---------------- item ops ---------------- */
  function addItem(it, center) {
    if (center) {
      const vp = $('#viewport').getBoundingClientRect();
      const cx = (vp.width / 2 - view.ox) / view.z, cy = (vp.height / 2 - view.oy) / view.z;
      it.x = cx - it.w / 2; it.y = cy - it.h / 2;
    }
    doc.items.push(it); sel.clear(); sel.add(it.id);
    commit(); render(); refreshPanels();
  }
  function duplicateSel() {
    const add = [], remap = {};
    doc.items.forEach(it => { if (sel.has(it.id)) { const c = JSON.parse(JSON.stringify(it)); c.id = uid(); c.x += 20; c.y += 20;
      if (c.g) { remap[c.g] = remap[c.g] || 'g' + uid(); c.g = remap[c.g]; }
      add.push(c); } });
    if (!add.length) return;
    doc.items.push(...add); sel.clear(); add.forEach(a => sel.add(a.id));
    commit(); render(); refreshPanels();
  }
  function deleteSel() { if (!sel.size) return; doc.items = doc.items.filter(i => !sel.has(i.id)); sel.clear(); commit(); render(); refreshPanels(); }

  /* ---------------- groups ----------------
     A group is a shared id on the members, not a container. Clicking any member
     selects the whole group; everything else (move, align, delete) already
     works on a multi-selection. */
  function groupSel() {
    const items = doc.items.filter(i => sel.has(i.id));
    if (items.length < 2) { toast('Select two or more to group'); return; }
    const gid = 'g' + uid();
    items.forEach(i => i.g = gid);
    // keep members contiguous in z-order so the group reads as one thing
    const rest = doc.items.filter(i => !sel.has(i.id));
    const at = Math.max(...items.map(i => doc.items.indexOf(i)));
    const before = rest.filter(i => doc.items.indexOf(i) < at);
    doc.items = before.concat(items, rest.filter(i => doc.items.indexOf(i) > at));
    commit(); render(); refreshPanels();
    toast('Grouped ' + items.length + ' layers');
  }
  function ungroupSel() {
    const items = doc.items.filter(i => sel.has(i.id) && i.g);
    if (!items.length) { toast('Nothing grouped here'); return; }
    const gone = new Set(items.map(i => i.g));
    doc.items.forEach(i => { if (gone.has(i.g)) delete i.g; });
    commit(); render(); refreshPanels();
    toast('Ungrouped');
  }
  /* ---------------- repeat ----------------
     Makes real copies, so every one stays editable afterwards. */
  function repeatSel(opts) {
    const src = doc.items.filter(i => sel.has(i.id));
    if (!src.length) { toast('Select something to repeat'); return; }
    const b = selBounds(src);
    const cx = (b.x + b.r) / 2, cy = (b.y + b.b) / 2;
    const w = b.r - b.x, h = b.b - b.y;
    const made = [];
    const gid = src.length > 1 || opts.group ? 'g' + uid() : null;

    const clone = (dx, dy, rot) => {
      src.forEach(it => {
        const c = JSON.parse(JSON.stringify(it));
        c.id = uid();
        if (rot) {
          // orbit the copy around the centre and turn it to face outward
          const a = rot * Math.PI / 180;
          const ox = (it.x + it.w / 2) - cx, oy = (it.y + it.h / 2) - cy;
          c.x = cx + ox * Math.cos(a) - oy * Math.sin(a) - it.w / 2 + dx;
          c.y = cy + ox * Math.sin(a) + oy * Math.cos(a) - it.h / 2 + dy;
          c.rot = (it.rot || 0) + (opts.turn ? rot : 0);
        } else { c.x = it.x + dx; c.y = it.y + dy; }
        if (gid) c.g = gid;
        made.push(c);
      });
    };

    if (opts.mode === 'radial') {
      const n = Math.max(2, opts.count);
      for (let i = 1; i < n; i++) {
        const step = 360 / n * i;
        const a = step * Math.PI / 180;
        clone(Math.cos(a - Math.PI / 2) * opts.radius, Math.sin(a - Math.PI / 2) * opts.radius, step);
      }
      if (opts.radius) src.forEach(it => { it.y -= opts.radius; });
    } else if (opts.mode === 'grid') {
      for (let r = 0; r < opts.rows; r++) for (let c = 0; c < opts.cols; c++) {
        if (!r && !c) continue;
        clone(c * (w + opts.gap), r * (h + opts.gap), 0);
      }
    } else {
      const a = (opts.angle || 0) * Math.PI / 180;
      for (let i = 1; i < Math.max(2, opts.count); i++) {
        clone(Math.cos(a) * (w + opts.gap) * i, Math.sin(a) * (h + opts.gap) * i, 0);
      }
    }

    if (gid) src.forEach(it => it.g = gid);
    doc.items.push(...made);
    sel.clear(); src.concat(made).forEach(i => sel.add(i.id));
    commit(); render(); refreshPanels();
    toast(made.length + ' copies');
  }

  function openRepeat() {
    if (!sel.size) { toast('Select something to repeat'); return; }
    const o = { mode: 'radial', count: 8, radius: Math.round(Math.min(doc.w, doc.h) * .18), turn: 1, cols: 3, rows: 3, gap: 30, angle: 0, group: 1 };
    modal('Repeat', body => {
      body.appendChild(el('p', 'hint', 'Real copies, so you can still edit each one afterwards.'));
      const modeSel = el('div', 'chips');
      const rows = el('div');
      const build = () => {
        rows.innerHTML = '';
        if (o.mode === 'radial') {
          rows.appendChild(ctrlNum('Copies', o.count, 2, 48, 1, v => o.count = v));
          rows.appendChild(ctrlNum('Radius', o.radius, 0, Math.round(Math.min(doc.w, doc.h) * .5), 1, v => o.radius = v));
          rows.appendChild(ctrlBool('Turn each copy', o.turn, v => o.turn = v));
        } else if (o.mode === 'grid') {
          rows.appendChild(ctrlNum('Columns', o.cols, 1, 12, 1, v => o.cols = v));
          rows.appendChild(ctrlNum('Rows', o.rows, 1, 12, 1, v => o.rows = v));
          rows.appendChild(ctrlNum('Gap', o.gap, 0, 300, 1, v => o.gap = v));
        } else {
          rows.appendChild(ctrlNum('Copies', o.count, 2, 40, 1, v => o.count = v));
          rows.appendChild(ctrlNum('Gap', o.gap, -200, 300, 1, v => o.gap = v));
          rows.appendChild(ctrlNum('Angle', o.angle, -180, 180, 1, v => o.angle = v));
        }
        rows.appendChild(ctrlBool('Group the result', o.group, v => o.group = v));
      };
      [['radial', 'Radial'], ['grid', 'Grid'], ['line', 'Along a line']].forEach(([k, label]) => {
        const b = el('button', 'chip' + (o.mode === k ? ' on' : ''), label);
        b.onclick = () => { o.mode = k; [...modeSel.children].forEach(c => c.classList.toggle('on', c === b)); build(); };
        modeSel.appendChild(b);
      });
      body.append(modeSel, rows);
      build();
      const go = el('button', 'wide solid', 'Repeat');
      go.onclick = () => { repeatSel(o); closeModal(); };
      body.appendChild(go);
    });
  }

  /* expand a click on one member into the whole group */
  function withGroup(it) {
    if (!it || !it.g) return [it];
    return doc.items.filter(i => i.g === it.g);
  }
  function orderSel(dir) {
    const idx = doc.items.map((it, i) => sel.has(it.id) ? i : -1).filter(i => i >= 0);
    if (!idx.length) return;
    if (dir === 'front') { const m = doc.items.filter(i => sel.has(i.id)); doc.items = doc.items.filter(i => !sel.has(i.id)).concat(m); }
    if (dir === 'back') { const m = doc.items.filter(i => sel.has(i.id)); doc.items = m.concat(doc.items.filter(i => !sel.has(i.id))); }
    if (dir === 'up') idx.reverse().forEach(i => { if (i < doc.items.length - 1) { const t = doc.items[i]; doc.items[i] = doc.items[i + 1]; doc.items[i + 1] = t; } });
    if (dir === 'down') idx.forEach(i => { if (i > 0) { const t = doc.items[i]; doc.items[i] = doc.items[i - 1]; doc.items[i - 1] = t; } });
    commit(); render(); refreshPanels();
  }
  /* One object aligns to the page. Two or more align to each other — which is
     what you actually want most of the time. */
  function selBounds(items) {
    return {
      x: Math.min(...items.map(i => i.x)), y: Math.min(...items.map(i => i.y)),
      r: Math.max(...items.map(i => i.x + i.w)), b: Math.max(...items.map(i => i.y + i.h)),
    };
  }
  function alignSel(mode) {
    const items = doc.items.filter(i => sel.has(i.id) && !i.locked);
    if (!items.length) return;
    const box = items.length > 1
      ? selBounds(items)
      : (bd => ({ x: bd.x, y: bd.y, r: bd.x + bd.w, b: bd.y + bd.h }))(board());
    items.forEach(it => {
      if (mode === 'l') it.x = box.x;
      if (mode === 'r') it.x = box.r - it.w;
      if (mode === 'cx') it.x = (box.x + box.r - it.w) / 2;
      if (mode === 't') it.y = box.y;
      if (mode === 'b') it.y = box.b - it.h;
      if (mode === 'cy') it.y = (box.y + box.b - it.h) / 2;
    });
    commit(); render();
    toast(items.length > 1 ? 'Aligned to selection' : 'Aligned to page');
  }

  /* equal gaps between edges, the way a designer means it */
  function distributeSel(axis) {
    const items = doc.items.filter(i => sel.has(i.id) && !i.locked);
    if (items.length < 3) { toast('Select three or more to distribute'); return; }
    const horiz = axis === 'h';
    const size = it => horiz ? it.w : it.h;
    const pos = it => horiz ? it.x : it.y;
    items.sort((a, b) => pos(a) - pos(b));
    const first = items[0], last = items[items.length - 1];
    const span = (pos(last) + size(last)) - pos(first);
    const used = items.reduce((s, it) => s + size(it), 0);
    const gap = (span - used) / (items.length - 1);
    let cur = pos(first);
    items.forEach(it => {
      if (horiz) it.x = cur; else it.y = cur;
      cur += size(it) + gap;
    });
    commit(); render();
    toast('Distributed ' + (horiz ? 'horizontally' : 'vertically'));
  }

  /* ==========================================================
     CONTEXT MENU
     ========================================================== */
  function hideMenu() { const m = $('#ctxmenu'); if (m) m.classList.remove('on'); }
  function showMenu(x, y, groups) {
    const m = $('#ctxmenu'); m.innerHTML = '';
    groups.forEach((grp, gi) => {
      if (gi) m.appendChild(el('div', 'ctxsep'));
      grp.forEach(row => {
        if (row.swatches) {
          const w = el('div', 'ctxrow');
          w.innerHTML = `<span class="ctxlbl">${row.label}</span>`;
          const line = el('div', 'ctxcolors');
          doc.colors.forEach((c, i) => {
            const b = el('button', 'cdot' + (row.current === i ? ' on' : ''));
            b.style.background = c; b.title = ['Ink', 'Accent', 'Alt', 'Alt 2', 'Paper'][i];
            b.onclick = () => { row.pick(i); hideMenu(); };
            line.appendChild(b);
          });
          w.appendChild(line); m.appendChild(w);
          return;
        }
        const b = el('button', 'ctxitem' + (row.danger ? ' danger' : ''));
        b.innerHTML = `${row.icon ? icon(row.icon, 15) : '<i class="icspace"></i>'}<span>${row.label}</span>${row.key ? `<kbd>${row.key}</kbd>` : ''}`;
        b.onclick = () => { hideMenu(); row.fn(); };
        m.appendChild(b);
      });
    });
    m.classList.add('on');
    m.style.left = '0px'; m.style.top = '0px';
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, innerWidth - r.width - 8) + 'px';
    m.style.top = Math.min(y, innerHeight - r.height - 8) + 'px';
  }

  function onContext(e) {
    e.preventDefault();
    const p = toDoc(e);
    const it = hitItem(p);
    if (it && !sel.has(it.id)) { sel.clear(); sel.add(it.id); render(); refreshPanels(); }
    const items = doc.items.filter(i => sel.has(i.id));

    if (!items.length) {
      showMenu(e.clientX, e.clientY, [
        [{ label: 'Paste SVG code…', icon: 'code', fn: openPasteSVG },
        { label: 'Place SVG file…', icon: 'upload', fn: () => $('#fileIn').click() }],
        [{ label: 'Select all', icon: 'group', key: 'Ctrl A', fn: () => { sel.clear(); doc.items.forEach(i => sel.add(i.id)); render(); refreshPanels(); } },
        { label: 'Surprise me', icon: 'sparkle', fn: () => surprise() }],
        [{ label: 'Fit to screen', icon: 'fit', key: '0', fn: fitView }],
      ]);
      return;
    }
    const one = items[0];
    const groups = [
      [{ label: 'Duplicate', icon: 'duplicate', key: 'Ctrl D', fn: duplicateSel },
      one.g ? { label: 'Ungroup', icon: 'group', key: 'Ctrl ⇧ G', fn: ungroupSel } : { label: 'Group', icon: 'group', key: 'Ctrl G', fn: groupSel },
      { label: 'Repeat…', icon: 'grid', key: 'Ctrl R', fn: openRepeat },
      { label: one.type === 'text' ? 'Edit text' : 'New hand', icon: one.type === 'text' ? 'type' : 'refresh', key: one.type === 'text' ? '' : 'R', fn: () => one.type === 'text' ? startEdit(one) : (items.forEach(i => i.seed = rint(0, 99999)), commit(), render()) }].concat(one.type === 'text' ? [] : [{ label: 'Edit points', icon: 'pen', fn: () => startNodeEdit(one) }, { label: 'Edit SVG code…', icon: 'code', fn: () => openSVGEditor(one) }]),
      [{ label: 'Stroke', swatches: 1, current: one.st.stroke, pick: v => { items.forEach(i => i.st.stroke = v); commit(); render(); refreshPanels(); } }],
    ];
    if (one.type === 'shape') {
      groups.push([{ label: 'Fill', swatches: 1, current: one.st.fill, pick: v => { items.forEach(i => i.st.fill = v); commit(); render(); refreshPanels(); } },
      { label: 'Accent', swatches: 1, current: one.st.accent, pick: v => { items.forEach(i => i.st.accent = v); commit(); render(); refreshPanels(); } }]);
    }
    groups.push(
      [{ label: 'Bring to front', icon: 'front', fn: () => orderSel('front') },
      { label: 'Forward', icon: 'up', key: ']', fn: () => orderSel('up') },
      { label: 'Backward', icon: 'down', key: '[', fn: () => orderSel('down') },
      { label: 'Send to back', icon: 'back', fn: () => orderSel('back') }],
      [{ label: one.locked ? 'Unlock' : 'Lock', icon: one.locked ? 'unlock' : 'lock', fn: () => { items.forEach(i => i.locked = i.locked ? 0 : 1); commit(); refreshPanels(); } },
      { label: one.hidden ? 'Show' : 'Hide', icon: one.hidden ? 'eye' : 'eyeOff', fn: () => { items.forEach(i => i.hidden = i.hidden ? 0 : 1); commit(); render(); refreshPanels(); } }],
      [{ label: 'Delete', icon: 'trash', key: 'Del', danger: 1, fn: deleteSel }]
    );
    showMenu(e.clientX, e.clientY, groups);
  }

  /* ==========================================================
     LIBRARY
     ========================================================== */
  let libCat = null, libQuery = '', libStyle = 'warli';

  /* Switching tradition swaps the whole discipline, not just the icons:
     its palette, its ground, and how the brush behaves. */
  function styleCats(k) {
    return [...new Set(PRESETS.filter(p => p.style === k).map(p => p.cat))];
  }
  function applyStyle(k, opts) {
    libStyle = k; libCat = null;
    const st = S.styleOf(k);
    if (opts && opts.paint) {
      const pals = S.stylePalettes(k);
      const p = pals[0];
      doc.palIdx = st.palettes ? -1 : 0;
      doc.paper = p[1];
      doc.colors = [p[2], p[3], p[4], p[5], p[1]];
      doc.texture = st.texture; doc.textureAmt = st.textureAmt;
      commit(); render();
    }
    buildPalettes(); buildLibrary(); refreshPanels();
  }
  function buildStylePicker() {
    const sel = $('#styleSel'); if (!sel) return;
    sel.innerHTML = Object.values(S.STYLES).map(s =>
      `<option value="${s.key}"${s.key === libStyle ? ' selected' : ''}>${s.name} — ${s.where}</option>`).join('');
    sel.onchange = e => applyStyle(e.target.value, { paint: true });
  }
  let thumbN = 0;
  function thumbFor(pre, colors, paper) {
    const h = new Hand(pre.seed, { rough: 1.05, bow: 1, passes: 2, fillMode: 'none' });
    if (GENS[pre.gen].cat === 'Patterns') h.clipStart('M0 0H100V100H0Z');
    try { GENS[pre.gen].draw(h, pre.params); } catch (e) { }
    h.clipEnd();
    let clips = '', body = '', n = 0;
    h.strokes.forEach(st => {
      let ca = '';
      if (st.clip) { const id = 't' + (thumbN++) + '_' + (n++); clips += `<clipPath id="${id}"><path d="${st.clip}"/></clipPath>`; ca = ` clip-path="url(#${id})"`; }
      const sc = st.role === 'accent' ? colors[1] : colors[0];
      const fc = st.fill === 'none' ? 'none' : (st.fill === 'accent' ? colors[1] : st.fill === 'fill' ? paper : colors[0]);
      body += `<path d="${st.d}" fill="${fc}" stroke="${sc}" stroke-width="${(st.w * 1.9).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${ca}/>`;
    });
    return `<svg viewBox="-8 -8 116 116">${clips ? `<defs>${clips}</defs>` : ''}${body}</svg>`;
  }

  function buildLibrary() {
    const cats = styleCats(libStyle);
    if (!libCat || !cats.includes(libCat)) libCat = cats[0];
    const host = $('#lib'); host.innerHTML = '';
    const colors = [doc.colors[0], doc.colors[1]], paper = doc.paper;

    if (!libQuery) {
      const tabs = el('div', 'chips');
      cats.forEach(c => {
        const t = el('button', 'chip' + (c === libCat ? ' on' : ''), c);
        t.onclick = () => { libCat = c; buildLibrary(); };
        tabs.appendChild(t);
      });
      host.appendChild(tabs);
    }
    const q = libQuery.trim().toLowerCase();
    const mine = PRESETS.filter(p => p.style === libStyle);
    { const sb = $('#libSearch'); if (sb) sb.placeholder = 'Search ' + mine.length + ' pieces…'; }
    const list = q ? mine.filter(p => p.search.includes(q)) : mine.filter(p => p.cat === libCat);
    host.appendChild(el('div', 'libmeta', q ? `${list.length} match${list.length === 1 ? '' : 'es'}` : `${list.length} in ${libCat}`));
    if (!q) { const st = S.styleOf(libStyle); if (st.note) host.appendChild(el('p', 'styleNote', st.note)); }

    const grid = el('div', 'libgrid');
    list.forEach(pre => {
      const cell = el('button', 'libcell');
      cell.style.background = paper;
      cell.innerHTML = thumbFor(pre, colors, paper) + `<span>${pre.name}</span>`;
      cell.title = pre.name + ' — click to place, right-click for variants';
      cell.onclick = () => {
        const s = Math.min(doc.w, doc.h) * .4;
        addItem(itemFromPreset(pre, { x: 0, y: 0, w: s, h: s }), true);
      };
      cell.oncontextmenu = ev => { ev.preventDefault(); openVariants(pre); };
      grid.appendChild(cell);
    });
    host.appendChild(grid);
    if (!list.length) host.appendChild(el('p', 'hint', 'Nothing matches. Try “arrow”, “leaf”, “border”, “cat”…'));
  }

  function randParams(g, rf) {
    const o = {};
    g.params.forEach(pa => {
      if (pa.k.startsWith('_')) return;
      if (pa.type === 'num') { const v = pa.min + rf() * (pa.max - pa.min); o[pa.k] = pa.step >= 1 ? Math.round(v) : Math.round(v / pa.step) * pa.step; }
      else if (pa.type === 'opt') o[pa.k] = Math.floor(rf() * pa.options.length);
      else o[pa.k] = rf() > .5 ? 1 : 0;
    });
    return o;
  }

  function openVariants(pre) {
    const g = GENS[pre.gen];
    modal(g.label + ' variants', body => {
      body.appendChild(el('p', 'hint', 'Same generator, different dials. Click one to place it.'));
      const grid = el('div', 'libgrid vgrid');
      for (let i = 0; i < 60; i++) {
        const seed = rint(0, 999999);
        const params = i === 0 ? pre.params : randParams(g, S.rngFrom(seed));
        const cell = el('button', 'libcell');
        cell.style.background = doc.paper;
        cell.innerHTML = thumbFor({ id: 'v' + i, gen: pre.gen, params, seed }, [doc.colors[0], doc.colors[1]], doc.paper);
        cell.onclick = () => {
          const s = Math.min(doc.w, doc.h) * .4;
          addItem(itemFromPreset({ gen: pre.gen, params, seed, name: pre.name }, { x: 0, y: 0, w: s, h: s }), true);
          closeModal();
        };
        grid.appendChild(cell);
      }
      body.appendChild(grid);
    }, [{ label: 'Shuffle again', fn: () => openVariants(pre) }]);
  }

  /* ==========================================================
     INSPECTOR — collapsible groups
     ========================================================== */
  const OPENKEY = 'scrawl.groups';
  function groupState() { try { return JSON.parse(localStorage.getItem(OPENKEY) || '{}'); } catch (e) { return {}; } }
  function setGroup(k, v) { const s = groupState(); s[k] = v; localStorage.setItem(OPENKEY, JSON.stringify(s)); }

  function group(host, title, key, defOpen) {
    const st = groupState();
    const open = st[key] === undefined ? defOpen !== false : !!st[key];
    const wrap = el('div', 'grp' + (open ? ' open' : ''));
    const head = el('button', 'grphead');
    head.innerHTML = `${icon('chevD', 14, 'class="ic caret"')}<span>${title}</span>`;
    const body = el('div', 'grpbody');
    head.onclick = () => { const now = !wrap.classList.contains('open'); wrap.classList.toggle('open', now); setGroup(key, now); };
    wrap.append(head, body); host.appendChild(wrap);
    return body;
  }

  function ctrlNum(label, val, min, max, step, onIn) {
    const w = el('div', 'ctl');
    w.innerHTML = `<div class="ctop"><span>${label}</span><b>${(+val).toFixed(step < 1 ? 2 : 0)}</b></div><input type="range" min="${min}" max="${max}" step="${step}" value="${val}">`;
    const i = w.querySelector('input'), b = w.querySelector('b');
    i.oninput = () => { b.textContent = (+i.value).toFixed(step < 1 ? 2 : 0); onIn(parseFloat(i.value)); };
    i.onchange = commit;
    return w;
  }
  function ctrlSel(label, opts, val, onCh) {
    const w = el('div', 'ctl');
    w.innerHTML = `<div class="ctop"><span>${label}</span></div><select>${opts.map((o, i) => `<option value="${i}"${i == val ? ' selected' : ''}>${o}</option>`).join('')}</select>`;
    w.querySelector('select').onchange = e => { onCh(parseInt(e.target.value)); commit(); };
    return w;
  }
  function ctrlBool(label, val, onCh) {
    const w = el('div', 'ctl row2');
    w.innerHTML = `<span>${label}</span><label class="sw"><input type="checkbox"${val ? ' checked' : ''}><i></i></label>`;
    w.querySelector('input').onchange = e => { onCh(e.target.checked ? 1 : 0); commit(); };
    return w;
  }
  function colorRow(label, cur, onPick) {
    const w = el('div', 'ctl');
    w.innerHTML = `<div class="ctop"><span>${label}</span></div>`;
    const row = el('div', 'crow');
    doc.colors.forEach((c, i) => {
      const s = el('button', 'cdot' + (cur === i ? ' on' : ''));
      s.style.background = c; s.title = ['Ink', 'Accent', 'Alt', 'Alt 2', 'Paper'][i];
      s.onclick = () => { onPick(i); commit(); };
      row.appendChild(s);
    });
    const custom = el('input'); custom.type = 'color'; custom.className = 'cpick';
    custom.value = typeof cur === 'string' ? cur : (doc.colors[cur] || '#000000');
    custom.oninput = e => onPick(e.target.value); custom.onchange = commit;
    row.appendChild(custom);
    w.appendChild(row); return w;
  }

  function refreshPanels() { buildInspector(); buildLayers(); }

  function buildInspector() {
    const host = $('#insp'); host.innerHTML = '';
    const items = doc.items.filter(i => sel.has(i.id));

    if (!items.length) {
      const gB = group(host, 'Artboards', 'boards', true);
      doc.boards.forEach((b, i) => {
        const row = el('div', 'boardrow' + (i === doc.active ? ' on' : ''));
        row.innerHTML = `<i>${icon('frame', 14)}</i><span>${esc(b.name)}</span><em>${b.w}×${b.h}</em>`;
        row.querySelector('span').onclick = () => setActiveBoard(i);
        row.querySelector('i').onclick = () => setActiveBoard(i);
        row.querySelector('span').ondblclick = () => {
          const nm = prompt('Name this board', b.name);
          if (nm) { b.name = nm; commit(); refreshPanels(); }
        };
        const del = el('button', 'ico'); del.innerHTML = icon('trash', 13); del.title = 'Delete board';
        del.onclick = e => { e.stopPropagation(); removeBoard(i); };
        row.appendChild(del);
        gB.appendChild(row);
      });
      const addRow = el('div', 'row');
      const addSame = el('button', 'ghost', '+ Same size');
      addSame.onclick = () => addBoard(null);
      const addOther = el('select', '');
      addOther.innerHTML = '<option value="-1">+ New size…</option>' + CANVASES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join('');
      addOther.onchange = e => { const i = +e.target.value; if (i >= 0) addBoard(CANVASES[i]); e.target.value = -1; };
      addRow.append(addSame, addOther);
      gB.appendChild(addRow);

      const g1 = group(host, 'Board size', 'canvas', true);
      const sizeSel = el('select', 'wide');
      sizeSel.innerHTML = CANVASES.map((c, i) => `<option value="${i}">${c[0]} · ${c[1]}×${c[2]}</option>`).join('') + '<option value="-1">Custom</option>';
      sizeSel.value = CANVASES.findIndex(c => c[1] === doc.w && c[2] === doc.h);
      sizeSel.onchange = e => { const i = +e.target.value; if (i >= 0) { doc.w = CANVASES[i][1]; doc.h = CANVASES[i][2]; syncActiveBoard(); commit(); render(); fitView(); refreshPanels(); } };
      g1.appendChild(sizeSel);
      const wh = el('div', 'row');
      wh.innerHTML = `<div class="field"><label>W</label><input id="cw" type="number" value="${doc.w}"></div><div class="field"><label>H</label><input id="ch" type="number" value="${doc.h}"></div>`;
      wh.querySelectorAll('input').forEach(inp => inp.onchange = () => { doc.w = clamp(+$('#cw').value, 80, 8000); doc.h = clamp(+$('#ch').value, 80, 8000); syncActiveBoard(); commit(); render(); fitView(); });
      g1.appendChild(wh);
      const swap = el('button', 'wide ghost', 'Swap width & height');
      swap.onclick = () => { const t = doc.w; doc.w = doc.h; doc.h = t; syncActiveBoard(); commit(); render(); fitView(); refreshPanels(); };
      g1.appendChild(swap);

      const g2 = group(host, 'Paper', 'paper', true);
      const pc = el('input'); pc.type = 'color'; pc.value = doc.paper; pc.className = 'cpick wide';
      pc.oninput = e => { doc.paper = e.target.value; doc.colors[4] = e.target.value; render(); }; pc.onchange = commit;
      g2.appendChild(pc);
      g2.appendChild(ctrlSel('Texture', TEXTURES, TEXTURES.indexOf(doc.texture), v => { doc.texture = TEXTURES[v]; render(); }));
      g2.appendChild(ctrlNum('Texture amount', doc.textureAmt, 0, .6, .01, v => { doc.textureAmt = v; render(); }));
      g2.appendChild(ctrlNum('Texture scale', doc.textureScale, .3, 4, .1, v => { doc.textureScale = v; render(); }));

      const g3 = group(host, 'Generate', 'gen', true);
      const p1 = el('button', 'wide solid', 'Surprise me');
      p1.onclick = () => surprise(); g3.appendChild(p1);
      const p2 = el('button', 'wide ghost', 'Reroll every hand');
      p2.onclick = () => { doc.items.forEach(i => i.seed = rint(0, 99999)); commit(); render(); }; g3.appendChild(p2);
      host.appendChild(el('p', 'hint', 'Nothing selected. Click something on the canvas, or add from the library.'));
      paintIcons(host); return;
    }

    const it = items[0];
    host.appendChild(el('div', 'selname', esc(items.length > 1 ? items.length + ' items selected' : it.name)));

    /* --- position & size --- */
    const gT = group(host, 'Position & size', 'transform', true);
    const tf = el('div', 'grid4');
    [['X', 'x'], ['Y', 'y'], ['W', 'w'], ['H', 'h']].forEach(([lbl, k]) => {
      const f = el('div', 'field');
      f.innerHTML = `<label>${lbl}</label><input type="number" value="${Math.round(it[k])}">`;
      f.querySelector('input').onchange = e => { items.forEach(i => i[k] = parseFloat(e.target.value)); if (it.type === 'text') items.forEach(i => i.fit = 1); commit(); render(); };
      tf.appendChild(f);
    });
    gT.appendChild(tf);
    gT.appendChild(ctrlNum('Rotation', it.rot, -180, 180, 1, v => { items.forEach(i => i.rot = v); render(); }));
    /* what you most often do to the selected thing, one click away */
    const qa = el('div', 'btnrow');
    const q = (label, title, fn) => { const b = el('button', 'ghost', label); b.title = title; b.onclick = () => { fn(); commit(); render(); refreshPanels(); }; qa.appendChild(b); };
    q('Flip ↔', 'Mirror horizontally', () => items.forEach(i => { i.flipX = !i.flipX; }));
    q('Flip ↕', 'Mirror vertically', () => items.forEach(i => { i.flipY = !i.flipY; }));
    const b0 = board() || { x: 0, y: 0, w: doc.w, h: doc.h };
    q('↔ Board', 'Stretch across the board', () => items.forEach(i => { i.x = b0.x + b0.w * .03; i.w = b0.w * .94; }));
    q('↕ Board', 'Stretch down the board', () => items.forEach(i => { i.y = b0.y + b0.h * .03; i.h = b0.h * .94; }));
    gT.appendChild(qa);
    const ord = el('div', 'btnrow');
    [['front', 'Bring to front'], ['up', 'Forward'], ['down', 'Backward'], ['back', 'Send to back']].forEach(([d, t]) => {
      const b = el('button', 'ghost'); b.title = t; b.dataset.icon = d + ':15'; b.onclick = () => orderSel(d); ord.appendChild(b);
    });
    gT.appendChild(ord);

    /* --- content --- */
    if (it.type === 'text') {
      const g = group(host, 'Text', 'text', true);
      const ed = el('button', 'wide solid', 'Edit on canvas');
      ed.onclick = () => startEdit(it); g.appendChild(ed);
      const ta = el('textarea'); ta.value = it.text; ta.rows = 2;
      ta.oninput = e => { it.text = e.target.value; render(); }; ta.onchange = commit;
      g.appendChild(ta);
      const fs = el('select', 'wide');
      fs.innerHTML = FONTS.map(f => `<option${f[0] === it.font ? ' selected' : ''}>${f[0]}</option>`).join('');
      fs.onchange = e => { it.font = e.target.value; render(); commit(); };
      g.appendChild(fs);
      const maxSize = Math.max(400, Math.round(Math.min(doc.w, doc.h) * .8));
      g.appendChild(ctrlNum('Size', Math.round(it.size), 6, maxSize, 1, v => { items.forEach(i => { if (i.type === 'text') i.size = v; }); render(); }));
      g.appendChild(ctrlBool('Curve onto an arc', it.arc ? 1 : 0, v => {
        it.arc = v;
        if (v) { it.fit = 0; const s = Math.max(it.w, it.h, it.size * 4); it.w = s; it.h = s; it._tx = 0; it._ty = 0; }
        render(); refreshPanels();
      }));
      if (it.arc) {
        g.appendChild(ctrlNum('Arc sweep', it.arcSweep || 180, 20, 350, 5, v => { it.arcSweep = v; render(); }));
        g.appendChild(ctrlBool('Read along the bottom', it.arcFlip ? 1 : 0, v => { it.arcFlip = v; render(); }));
      }
      g.appendChild(ctrlSel('Align', ['Left', 'Centre', 'Right'], ['start', 'middle', 'end'].indexOf(it.align), v => { it.align = ['start', 'middle', 'end'][v]; render(); }));
      g.appendChild(ctrlNum('Letter spacing %', it.letter, -12, 45, .5, v => { it.letter = v; render(); }));
      g.appendChild(ctrlNum('Line height', it.lineH, .7, 2.2, .05, v => { it.lineH = v; render(); }));
      g.appendChild(ctrlBool('Uppercase', it.caps, v => { it.caps = v; render(); }));
    } else if (it.type === 'shape') {
      const g = group(host, 'Shape', 'shape', true);
      GENS[it.gen].params.forEach(pa => {
        if (pa.k.startsWith('_')) return;
        const apply = v => { items.forEach(i => { if (i.gen === it.gen) i.params[pa.k] = v; }); render(); };
        if (pa.type === 'num') g.appendChild(ctrlNum(pa.label, it.params[pa.k], pa.min, pa.max, pa.step, apply));
        if (pa.type === 'opt') g.appendChild(ctrlSel(pa.label, pa.options, it.params[pa.k], apply));
        if (pa.type === 'bool') g.appendChild(ctrlBool(pa.label, it.params[pa.k], apply));
      });
      const rr = el('button', 'wide ghost', 'New hand (R)');
      rr.onclick = () => { items.forEach(i => i.seed = rint(0, 99999)); commit(); render(); };
      g.appendChild(rr);
    }

    /* --- colour --- */
    if (it.type !== 'svg') {
      const g = group(host, 'Colour', 'colour', true);
      g.appendChild(colorRow(it.type === 'text' ? 'Text' : 'Stroke', it.st.stroke, v => { items.forEach(i => i.st.stroke = v); render(); }));
      if (it.type === 'shape' || it.type === 'path') {
        g.appendChild(colorRow('Fill', it.st.fill, v => { items.forEach(i => i.st.fill = v); render(); }));
        g.appendChild(colorRow('Accent', it.st.accent, v => { items.forEach(i => i.st.accent = v); render(); }));
      }
      g.appendChild(ctrlNum('Opacity', it.st.opacity, .05, 1, .05, v => { items.forEach(i => i.st.opacity = v); render(); }));
    }

    /* --- the hand --- */
    const gH = group(host, 'The hand', 'hand', false);
    if (it.type !== 'svg') gH.appendChild(ctrlNum('Pen weight', it.st.weight, .3, 16, .1, v => { items.forEach(i => i.st.weight = v); render(); }));
    if (it.type === 'shape') {
      gH.appendChild(ctrlNum('Shakiness', it.st.rough, 0, 4, .05, v => { items.forEach(i => i.st.rough = v); render(); }));
      gH.appendChild(ctrlNum('Bend', it.st.bow, 0, 3, .05, v => { items.forEach(i => i.st.bow = v); render(); }));
      gH.appendChild(ctrlNum('Strokes per line', it.st.passes, 1, 4, 1, v => { items.forEach(i => i.st.passes = v); render(); }));
      gH.appendChild(ctrlSel('Fill style', FILLS, FILLS.indexOf(it.st.fillMode), v => { items.forEach(i => i.st.fillMode = FILLS[v]); render(); }));
      gH.appendChild(ctrlNum('Fill density', it.st.fillGap, 1.5, 14, .5, v => { items.forEach(i => i.st.fillGap = v); render(); }));
      gH.appendChild(ctrlNum('Fill angle', it.st.fillAngle, -90, 90, 5, v => { items.forEach(i => i.st.fillAngle = v); render(); }));
    }
    gH.appendChild(ctrlNum('Marker bleed', it.st.wobble, 0, 16, .5, v => { items.forEach(i => i.st.wobble = v); render(); }));
    paintIcons(host);
  }

  /* ---------------- layers, with drag to reorder ---------------- */
  let dragLayer = null;
  function buildLayers() {
    const host = $('#layers'); host.innerHTML = '';
    [...doc.items].reverse().forEach((it, ri) => {
      const row = el('div', 'layer' + (sel.has(it.id) ? ' on' : ''));
      row.draggable = true;
      row.dataset.id = it.id;
      const label = it.type === 'text' ? String(it.text).split('\n')[0].slice(0, 20) || 'Text' : it.name;
      const kind = it.type === 'text' ? 'type' : it.type === 'svg' ? 'image' : it.type === 'path' ? 'pen' : 'shapes';
      row.innerHTML = `<i class="lgrip" title="Drag to reorder">${icon('more', 13)}</i>
        <i class="lkind">${icon(kind, 14)}</i><span>${esc(label)}</span>
        <button class="lbtn eye" title="Show / hide">${icon(it.hidden ? 'eyeOff' : 'eye', 14)}</button>
        <button class="lbtn lock${it.locked ? ' on' : ''}" title="Lock">${icon(it.locked ? 'lock' : 'unlock', 14)}</button>`;
      row.querySelector('span').onclick = e => { if (!e.shiftKey) sel.clear(); withGroup(it).forEach(f => sel.add(f.id)); render(); refreshPanels(); };
      row.querySelector('span').ondblclick = () => { if (it.type === 'text') startEdit(it); };
      row.querySelector('.eye').onclick = e => { e.stopPropagation(); it.hidden = it.hidden ? 0 : 1; commit(); render(); refreshPanels(); };
      row.querySelector('.lock').onclick = e => { e.stopPropagation(); it.locked = it.locked ? 0 : 1; commit(); refreshPanels(); };
      row.ondragstart = e => { dragLayer = it.id; row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; };
      row.ondragend = () => { dragLayer = null; $$('.layer').forEach(r => r.classList.remove('dragging', 'over')); };
      row.ondragover = e => { e.preventDefault(); row.classList.add('over'); };
      row.ondragleave = () => row.classList.remove('over');
      row.ondrop = e => {
        e.preventDefault(); row.classList.remove('over');
        if (!dragLayer || dragLayer === it.id) return;
        const from = doc.items.findIndex(x => x.id === dragLayer);
        const to = doc.items.findIndex(x => x.id === it.id);
        if (from < 0 || to < 0) return;
        const [m] = doc.items.splice(from, 1);
        doc.items.splice(to, 0, m);
        commit(); render(); refreshPanels();
      };
      host.appendChild(row);
    });
    if (!doc.items.length) host.appendChild(el('p', 'hint', 'Nothing here yet.'));
    $('#layerCount').textContent = doc.items.length;
  }

  /* ---------------- palettes ---------------- */
  function buildPalettes() {
    const host = $('#pals'); host.innerHTML = '';
    S.stylePalettes(libStyle).forEach((p, i) => {
      const s = el('button', 'pal' + (doc.palIdx === i ? ' on' : ''));
      s.title = p[0]; s.style.background = p[1];
      s.innerHTML = `<i style="background:${p[2]}"></i><i style="background:${p[3]}"></i><i style="background:${p[4]}"></i>`;
      s.onclick = () => applyPalette(i);
      host.appendChild(s);
    });
    buildBrandBar();
  }
  function applyPalette(i) {
    const pal = S.stylePalettes(libStyle)[i];
    const p = { name: pal[0], paper: pal[1], colors: [pal[2], pal[3], pal[4], pal[5], pal[1]] };
    doc.palIdx = i; doc.paper = p.paper; doc.colors = p.colors.slice();
    commit(); render(); buildPalettes(); buildLibrary(); refreshPanels();
  }
  /* Items reference palette *slots*, so changing palette recolours everything —
     unless someone picked a literal colour. This puts them all back on slots,
     and can reshuffle which slot each one uses. */
  function recolourAll(shuffle) {
    let fixed = 0;
    doc.items.forEach(it => {
      const st = it.st;
      if (typeof st.stroke === 'string' || typeof st.fill === 'string' || typeof st.accent === 'string') fixed++;
      if (shuffle) {
        st.stroke = Math.random() > .78 ? 1 : 0;
        st.accent = Math.random() > .3 ? 1 : 2;
        st.fill = Math.random() > .68 ? 1 : 4;
      } else {
        if (typeof st.stroke === 'string') st.stroke = 0;
        if (typeof st.accent === 'string') st.accent = 1;
        if (typeof st.fill === 'string') st.fill = 4;
      }
    });
    commit(); render(); refreshPanels();
    toast(shuffle ? 'Colours reshuffled' : (fixed ? fixed + ' layers put back on the palette' : 'Everything already follows the palette'));
  }

  /* ---------------- clipboard ---------------- */
  async function copyAsSVG() {
    stopEdit();
    const items = doc.items.filter(i => sel.has(i.id));
    const svg = await exportSVG(items.length ? items : null);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({
          'image/svg+xml': new Blob([svg], { type: 'image/svg+xml' }),
          'text/plain': new Blob([svg], { type: 'text/plain' }),
        })]);
      } else {
        await navigator.clipboard.writeText(svg);
      }
      toast(items.length ? `Copied ${items.length} layer${items.length > 1 ? 's' : ''} as SVG` : 'Copied canvas as SVG');
    } catch (e) {
      try { await navigator.clipboard.writeText(svg); toast('Copied as SVG text'); }
      catch (e2) { toast('clipboard blocked by the browser'); }
    }
  }

  /* ---------------- brand kit ----------------
     A locked palette + two typefaces that new documents and Surprise inherit,
     so a studio's work stays on-brand without re-picking every time. */
  const BKEY = 'scrawl.brand';
  function brand() { try { return JSON.parse(localStorage.getItem(BKEY) || 'null'); } catch (e) { return null; } }
  function setBrand(b) { try { b ? localStorage.setItem(BKEY, JSON.stringify(b)) : localStorage.removeItem(BKEY); } catch (e) { } buildPalettes(); }

  function saveBrand() {
    const heads = doc.items.filter(i => i.type === 'text');
    const b = {
      paper: doc.paper, colors: doc.colors.slice(),
      head: heads[0] ? heads[0].font : 'Archivo Black',
      body: heads[1] ? heads[1].font : 'DM Sans',
      locked: 1,
    };
    setBrand(b);
    toast('Brand kit saved — new files will use it');
  }
  function applyBrand() {
    const b = brand(); if (!b) return;
    doc.palIdx = -1; doc.paper = b.paper; doc.colors = b.colors.slice();
    doc.items.filter(i => i.type === 'text').forEach((t, i) => { t.font = i === 0 ? b.head : b.body; });
    commit(); render(); buildPalettes(); buildLibrary(); refreshPanels();
    toast('Brand applied');
  }
  function toggleBrandLock() {
    const b = brand(); if (!b) { toast('Save a brand kit first'); return; }
    b.locked = b.locked ? 0 : 1; setBrand(b);
    toast(b.locked ? 'Brand locked — Surprise will keep these colours' : 'Brand unlocked');
  }

  function buildBrandBar() {
    const host = $('#brandbar'); if (!host) return;
    const b = brand();
    host.innerHTML = '';
    if (!b) {
      const save = el('button', 'wide ghost', 'Save this as my brand kit');
      save.onclick = saveBrand; host.appendChild(save);
      return;
    }
    const row = el('div', 'brandrow');
    const sw = el('div', 'brandsw');
    sw.style.background = b.paper;
    b.colors.slice(0, 3).forEach(c => { const i = el('i'); i.style.background = c; sw.appendChild(i); });
    row.appendChild(sw);
    const meta = el('div', 'brandmeta', `<b>Brand kit</b><span>${esc(b.head)} · ${esc(b.body)}</span>`);
    row.appendChild(meta);
    const lock = el('button', 'ico' + (b.locked ? ' on' : ''));
    lock.innerHTML = icon(b.locked ? 'lock' : 'unlock', 15);
    lock.title = b.locked ? 'Locked — Surprise keeps these colours' : 'Unlocked';
    lock.onclick = toggleBrandLock;
    row.appendChild(lock);
    host.appendChild(row);
    const btns = el('div', 'row');
    const use = el('button', 'ghost', 'Apply'); use.onclick = applyBrand;
    const re = el('button', 'ghost', 'Update'); re.onclick = saveBrand;
    const rm = el('button', 'ghost danger', 'Remove'); rm.onclick = () => { setBrand(null); buildBrandBar(); toast('Brand kit removed'); };
    btns.append(use, re, rm); host.appendChild(btns);
  }

  function randomPalette() {
    const h = Math.random() * 360, warm = Math.random() > .5;
    const paper = `hsl(${(h + rnd(-14, 14) + 360) % 360} ${rnd(12, 34)}% ${rnd(88, 96)}%)`;
    doc.palIdx = -1; doc.paper = paper;
    doc.colors = [
      `hsl(${(h + rnd(-20, 20) + 360) % 360} ${rnd(18, 55)}% ${rnd(8, 22)}%)`,
      `hsl(${(h + (warm ? 150 : 200) + rnd(-25, 25) + 360) % 360} ${rnd(55, 88)}% ${rnd(40, 58)}%)`,
      `hsl(${(h + rnd(-30, 30) + 360) % 360} ${rnd(25, 50)}% ${rnd(32, 48)}%)`,
      `hsl(${(h + rnd(-30, 30) + 360) % 360} ${rnd(20, 45)}% ${rnd(62, 78)}%)`, paper];
    commit(); render(); buildPalettes(); buildLibrary(); refreshPanels();
  }

  /* ==========================================================
     SURPRISE
     ========================================================== */
  function surprise(opts = {}) {
    const cv = opts.keepCanvas ? [null, doc.w, doc.h] : pickOf(CANVASES);
    const bk = brand();
    const onBrand = bk && bk.locked;
    const pals = S.stylePalettes(libStyle);
    const palIdx = rint(0, pals.length - 1);
    const pr = pals[palIdx];
    const p = { name: pr[0], paper: pr[1], colors: [pr[2], pr[3], pr[4], pr[5], pr[1]] };
    doc.w = cv[1]; doc.h = cv[2]; syncActiveBoard();
    if (onBrand) { doc.palIdx = -1; doc.paper = bk.paper; doc.colors = bk.colors.slice(); }
    else { doc.palIdx = palIdx; doc.paper = p.paper; doc.colors = p.colors.slice(); }
    const stx = S.styleOf(libStyle);
    doc.texture = stx.texture || pickOf(TEXTURES);
    doc.textureAmt = stx.textureAmt || +rnd(.04, .2).toFixed(2);
    doc.textureScale = +rnd(.8, 1.6).toFixed(1);
    // clear only what sits on this board
    { const bd = board();
      doc.items = doc.items.filter(i => !(i.x + i.w / 2 >= bd.x && i.x + i.w / 2 <= bd.x + bd.w && i.y + i.h / 2 >= bd.y && i.y + i.h / 2 <= bd.y + bd.h)); }

    const comp = pickOf(COMPOSITIONS), slots = comp.place(Math.random), bw = baseWeight();
    const sh = S.styleOf(libStyle).hand;
    const hand = {
      rough: +(sh.rough * rnd(.7, 1.4)).toFixed(2), bow: +(sh.bow * rnd(.7, 1.4)).toFixed(2),
      passes: sh.passes, weight: +(bw * (sh.weight / 3.2) * rnd(.8, 1.3)).toFixed(2),
      wobble: sh.rough < .5 ? 0 : (Math.random() > .6 ? +rnd(1, 6).toFixed(1) : 0),
    };
    const fillMode = pickOf(FILLS);
    const font = onBrand ? bk.head : pickOf(FONTS)[0];
    const bodyFont = onBrand ? bk.body : font;
    const mine = PRESETS.filter(x => x.style === libStyle);
    const cats = [...new Set(mine.map(x => x.cat))].filter(c => c !== 'Patterns' && c !== 'Frames' && c !== 'Borders' && c !== 'Custom');
    const theme = [pickOf(cats), pickOf(cats)];
    const pool = mine.filter(x => theme.includes(x.cat));
    const heavy = mine.filter(x => ['Characters', 'Objects', 'Nature', 'Shapes', 'Icons', 'Figures', 'Animals', 'Village', 'Compositions'].includes(x.cat));
    const patPool = mine.filter(x => x.cat === 'Patterns' || x.cat === 'Borders');
    const framePool = mine.filter(x => x.cat === 'Frames' || x.cat === 'Borders');
    const strong = pool.filter(x => x.cat !== 'Marks');
    const anchor = pickOf(strong.length ? strong : heavy);
    const cohesion = Math.random();

    slots.forEach(sl => {
      const bd = board();
      const box = { x: bd.x + sl.x / 100 * doc.w, y: bd.y + sl.y / 100 * doc.h, w: sl.w / 100 * doc.w, h: sl.h / 100 * doc.h };
      if (sl.text) {
        const t = makeText(sl.text === 'head' ? pickOf(WORDS) : pickOf(SUBS), box);
        t.font = sl.text === 'head' ? font : bodyFont;
        t.caps = sl.text === 'head' ? (Math.random() > .45 ? 1 : 0) : (Math.random() > .7 ? 1 : 0);
        t.st.stroke = sl.text === 'head' ? 0 : (Math.random() > .6 ? 1 : 0);
        t.st.weight = hand.weight; t.st.wobble = hand.wobble * .6;
        t.letter = sl.text === 'sub' ? rnd(2, 16) : rnd(-2, 9);
        doc.items.push(t); return;
      }
      let pre;
      if (sl.pattern) pre = pickOf(patPool);
      else if (sl.frame) pre = pickOf(framePool);
      else if (sl.big) pre = Math.random() < .5 ? anchor : pickOf(heavy);
      else pre = Math.random() < cohesion ? anchor : pickOf(pool.length ? pool : heavy);

      const it = itemFromPreset(pre, box);
      it.seed = rint(0, 99999);
      Object.assign(it.st, hand);
      it.st.fillMode = Math.random() > .6 ? fillMode : 'none';
      it.st.fillGap = +rnd(2.5, 9).toFixed(1); it.st.fillAngle = rint(-80, 80);
      it.st.stroke = 0; it.st.accent = Math.random() > .3 ? 1 : 2; it.st.fill = Math.random() > .65 ? 1 : 4;
      it.rot = Math.random() > .75 ? +rnd(-10, 10).toFixed(1) : 0;
      if (sl.frame) { it.rot = 0; it.st.fillMode = 'none'; }
      if (sl.pattern) { it.st.opacity = +rnd(.14, .42).toFixed(2); it.st.stroke = 3; it.st.fillMode = 'none'; it.rot = 0; }
      doc.items.push(it);
    });
    sel.clear(); commit(); render(); fitView(); buildPalettes(); buildLibrary(); refreshPanels();
    toast(comp.name + ' · ' + (onBrand ? 'your brand' : p.name));
  }

  /* ==========================================================
     MODAL + HOME
     ========================================================== */
  function modal(title, build, actions) {
    $('#modalTitle').textContent = title;
    const body = $('#modalBody'); body.innerHTML = '';
    build(body);
    const bar = $('#modalActions'); bar.innerHTML = '';
    (actions || []).forEach(a => { const b = el('button', 'bordered', a.label); b.onclick = a.fn; bar.appendChild(b); });
    $('#modal').classList.add('on');
    paintIcons($('#modal'));
  }
  function closeModal() { $('#modal').classList.remove('on'); }

  function docPreview(d) {
    const box = el('div', 'tplprev');
    box.innerHTML = buildSVG(d, true);
    const sv = box.querySelector('svg');
    sv.removeAttribute('width'); sv.removeAttribute('height');
    sv.style.width = '100%'; sv.style.height = '100%';
    return box;
  }

  let homeTab = 'files', tplCat = 'All';
  function openHome(tab) {
    homeTab = tab || homeTab;
    saveCurrent(true);
    $('#home').classList.add('on');
    renderHome();
  }
  function closeHome() { $('#home').classList.remove('on'); }

  function renderHome() {
    const s = store();
    $$('#homeNav button').forEach(b => b.classList.toggle('on', b.dataset.tab === homeTab));
    const grid = $('#homeGrid'); grid.innerHTML = '';
    const q = ($('#homeSearch').value || '').trim().toLowerCase();

    const filterHost = $('#homeFilters'); filterHost.innerHTML = '';
    if (homeTab === 'templates') {
      $('#homeTitle').textContent = 'Start from a template';
      const myCats = ['All', ...new Set(TEMPLATES.filter(t => (t.style || 'sketch') === libStyle).map(t => t.cat || 'Print'))];
      if (!myCats.includes(tplCat)) tplCat = 'All';
      myCats.forEach(c => {
        const b = el('button', 'chip' + (c === tplCat ? ' on' : ''), c);
        b.onclick = () => { tplCat = c; renderHome(); };
        filterHost.appendChild(b);
      });
      TEMPLATES
        .filter(t => (t.style || 'sketch') === libStyle)
        .filter(t => tplCat === 'All' || (t.cat || 'Print') === tplCat)
        .filter(t => !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
        .forEach(tpl => {
        const card = el('button', 'filecard');
        card.appendChild(docPreview(docFromTemplate(tpl)));
        card.appendChild(el('div', 'fileinfo', `<b>${esc(tpl.name)}</b><span>${esc(tpl.desc)}</span>`));
        card.onclick = () => openDoc(docFromTemplate(tpl));
        grid.appendChild(card);
      });
      return;
    }

    $('#homeTitle').textContent = 'Your files';
    const ids = s.order.filter(id => s.docs[id]).filter(id => !q || s.docs[id].name.toLowerCase().includes(q));
    if (!ids.length) {
      grid.appendChild(el('p', 'hint', q ? 'No file by that name.' : 'No files yet — start from a template.'));
      return;
    }
    ids.forEach(id => {
      const rec = s.docs[id];
      const card = el('div', 'filecard' + (id === doc.id ? ' cur' : ''));
      const prev = docPreview(rec.doc);
      prev.onclick = () => openDoc(JSON.parse(JSON.stringify(rec.doc)));
      card.appendChild(prev);
      const when = new Date(rec.updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const info = el('div', 'fileinfo', `<b>${esc(rec.name)}</b><span>${rec.doc.w}×${rec.doc.h} · ${when}</span>`);
      info.onclick = () => openDoc(JSON.parse(JSON.stringify(rec.doc)));
      card.appendChild(info);
      const kebab = el('button', 'filemore'); kebab.innerHTML = icon('more', 16);
      kebab.onclick = ev => {
        ev.stopPropagation();
        const r = kebab.getBoundingClientRect();
        showMenu(r.left - 120, r.bottom + 4, [[
          { label: 'Open', icon: 'file', fn: () => openDoc(JSON.parse(JSON.stringify(rec.doc))) },
          { label: 'Duplicate', icon: 'duplicate', fn: () => { const c = JSON.parse(JSON.stringify(rec.doc)); c.id = 'd' + uid(); c.name = rec.name + ' copy'; openDoc(c); } },
          { label: 'Rename…', icon: 'type', fn: () => { const n = prompt('Name this file', rec.name); if (n) { const st = store(); st.docs[id].name = n; st.docs[id].doc.name = n; writeStore(st); if (doc.id === id) { doc.name = n; $('#docName').textContent = n; } renderHome(); } } },
        ], [
          { label: 'Delete', icon: 'trash', danger: 1, fn: () => { if (!confirm(`Delete “${rec.name}”?`)) return; const st = store(); delete st.docs[id]; st.order = st.order.filter(x => x !== id); writeStore(st); renderHome(); } },
        ]]);
      };
      card.appendChild(kebab);
      grid.appendChild(card);
    });
  }

  function openShortcuts() {
    modal('Keyboard', body => {
      const rows = [['V', 'Select'], ['H', 'Pan'], ['T', 'Text'], ['P', 'Pen — draw your own'],
      ['Double-click', 'Edit text on the canvas'], ['Right-click', 'Context menu'],
      ['Space + drag', 'Pan'], ['Scroll', 'Zoom'], ['0', 'Fit to screen'],
      ['Ctrl/⌘ Z', 'Undo'], ['Ctrl/⌘ ⇧ Z', 'Redo'], ['Ctrl/⌘ D', 'Duplicate'], ['Ctrl/⌘ A', 'Select all'],
      ['Delete', 'Delete'], ['R', 'Reroll the hand'], ['[ / ]', 'Backward / forward'],
      ['Arrows', 'Nudge (⇧ for 10×)'], ['Alt + drag', 'Duplicate as you drag'],
      ['⇧ + resize', 'Keep proportions'], ['Ctrl/⌘ + drag', 'Ignore snapping']];
      const t = el('div', 'keys');
      rows.forEach(([k, v]) => t.innerHTML += `<kbd>${k}</kbd><span>${v}</span>`);
      body.appendChild(t);
    });
  }

  /* the SVG behind any element, editable */
  function itemSVGSource(it) {
    if (it.type === 'svg') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${it.viewBox}">\n${it.markup}\n</svg>`;
    const sw = it.st.weight / ((Math.abs(it.w) + Math.abs(it.h)) / 200 || 1);
    const body = (it.type === 'path' ? it.strokes : strokesFor(it)).map(st => {
      const stroke = col(st.role === 'accent' ? it.st.accent : st.role === 'fill' ? it.st.fill : it.st.stroke);
      const fill = st.fill === 'none' ? 'none' : col(st.fill === 'accent' ? it.st.accent : st.fill === 'fill' ? it.st.fill : it.st.stroke);
      return `  <path d="${st.d}" fill="${fill}" stroke="${stroke}" stroke-width="${(st.w * sw).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('\n');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n${body}\n</svg>`;
  }

  function openSVGEditor(it) {
    modal('Edit SVG — ' + it.name, body => {
      body.appendChild(el('p', 'hint', it.type === 'svg'
        ? 'The raw SVG for this layer. Edit and apply.'
        : 'The generated SVG for this shape. Applying turns it into a plain SVG layer — you keep move, scale and rotate, but the shape dials and palette colours are baked in. Cancel to keep it editable.'));
      const ta = el('textarea'); ta.rows = 14; ta.value = itemSVGSource(it);
      ta.style.fontFamily = "'DM Mono',monospace"; ta.style.fontSize = '11.5px';
      body.appendChild(ta);
      const go = el('button', 'wide solid', 'Apply');
      go.onclick = () => {
        try {
          const parsed = new DOMParser().parseFromString(ta.value, 'image/svg+xml');
          const svg = parsed.querySelector('svg');
          if (!svg || parsed.querySelector('parsererror')) return toast('that SVG has an error in it');
          const vb = svg.getAttribute('viewBox') || '0 0 100 100';
          Object.assign(it, { type: 'svg', markup: svg.innerHTML, viewBox: vb });
          delete it.gen; delete it.params;
          it.name = it.name + ' (svg)';
          commit(); render(); refreshPanels(); closeModal(); toast('applied');
        } catch (er) { toast('that SVG has an error in it'); }
      };
      body.appendChild(go);
    });
  }

  function openPasteSVG() {
    modal('Paste SVG code', body => {
      body.appendChild(el('p', 'hint', 'Paste the contents of an .svg file — from Illustrator, Figma, Noun Project, anywhere. It becomes a layer you can move, scale and recolour.'));
      const ta = el('textarea'); ta.rows = 10; ta.placeholder = '<svg viewBox="0 0 24 24">…</svg>';
      ta.style.fontFamily = "'DM Mono',monospace";
      body.appendChild(ta);
      const go = el('button', 'wide solid', 'Place it');
      go.onclick = () => { if (placeSVGText(ta.value, 'Pasted')) closeModal(); };
      body.appendChild(go);
      setTimeout(() => ta.focus(), 60);
    });
  }

  /* ==========================================================
     EXPORT / IMPORT
     ========================================================== */
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 1700); };

  let fontCache = {};
  async function inlineFonts(fams) {
    const key = fams.slice().sort().join(',');
    if (fontCache[key] !== undefined) return fontCache[key];
    try {
      const spec = fams.map(f => 'family=' + (FONTS.find(x => x[0] === f) || [, 'DM+Sans'])[1]).join('&');
      let css = await (await fetch(`https://fonts.googleapis.com/css2?${spec}&display=swap`)).text();
      const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map(m => m[1]))];
      for (const u of urls) {
        const blob = await (await fetch(u)).blob();
        const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
        css = css.split(u).join(data);
      }
      fontCache[key] = css; return css;
    } catch (e) { fontCache[key] = ''; return ''; }
  }
  /* Pass a subset to export just those layers, cropped to their bounds — that's
     what "copy as SVG" needs so it pastes at a sane size elsewhere. */
  async function exportSVG(subset) {
    const list = subset && subset.length ? subset : doc.items;
    const fams = [...new Set(list.filter(i => i.type === 'text').map(i => i.font))];
    let svg;
    if (subset && subset.length) {
      const b = selBounds(list), pad = 2;
      const view = { x: b.x - pad, y: b.y - pad, w: (b.r - b.x) + pad * 2, h: (b.b - b.y) + pad * 2 };
      const sub = Object.assign({}, doc, { items: list, texture: 'none' });
      const inner = buildSVG(sub, true);
      const body = inner.slice(inner.indexOf('<defs>'), inner.lastIndexOf('</svg>'))
        .replace(/<rect width="\d+" height="\d+" fill="[^"]*"\/>/, '');
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(view.w)}" height="${Math.round(view.h)}" viewBox="${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}">${body}</svg>`;
    } else {
      svg = buildSVG(doc, true, board());
    }
    if (fams.length) { const css = await inlineFonts(fams); if (css) svg = svg.replace('<defs>', `<defs><style>${css}</style>`); }
    return svg;
  }
  function saveBlob(b, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
  const slug = () => (doc.name || 'motifs').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'motifs';

  async function doExport(kind) {
    stopEdit(); toast('preparing…');
    if (kind === 'json') { saveBlob(new Blob([JSON.stringify(doc)], { type: 'application/json' }), slug() + '.json'); toast('project file saved'); return; }
    const svg = await exportSVG();
    if (kind === 'svg') { saveBlob(new Blob([svg], { type: 'image/svg+xml' }), slug() + '.svg'); toast('SVG saved'); return; }
    const scale = kind === 'png4' ? 4 : kind === 'png2' ? 2 : 1;
    const img = new Image();
    img.onload = () => {
      const bd = board();
      const c = document.createElement('canvas'); c.width = bd.w * scale; c.height = bd.h * scale;
      const g = c.getContext('2d'); g.scale(scale, scale); g.drawImage(img, 0, 0, bd.w, bd.h);
      c.toBlob(b => { saveBlob(b, slug() + '.png'); toast('PNG saved'); });
    };
    img.onerror = () => toast('render failed — try SVG');
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  /* ---------------- print ----------------
     Bleed extends the artwork past the trim so the guillotine can't leave a
     white sliver; the marks tell the printer where the trim is. */
  function cropMarks(trim, len, off, w) {
    const x0 = trim.x, y0 = trim.y, x1 = trim.x + trim.w, y1 = trim.y + trim.h;
    const out = [];
    const ln = (a, b, c, e) => out.push(`<line x1="${a}" y1="${b}" x2="${c}" y2="${e}" stroke="#000" stroke-width="${w}"/>`);
    [y0, y1].forEach(y => { ln(x0 - off - len, y, x0 - off, y); ln(x1 + off, y, x1 + off + len, y); });
    [x0, x1].forEach(x => { ln(x, y0 - off - len, x, y0 - off); ln(x, y1 + off, x, y1 + off + len); });
    return out.join('');
  }

  async function buildPrintSVG(o) {
    const b = board();
    const bleedR = { x: b.x - o.bleed, y: b.y - o.bleed, w: b.w + o.bleed * 2, h: b.h + o.bleed * 2 };
    const markLen = o.marks ? Math.max(12, Math.min(b.w, b.h) * .035) : 0;
    const markOff = o.marks ? markLen * .5 : 0;
    const pad = o.bleed + markLen + markOff + (o.marks ? 6 : 0);
    const viewRect = { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
    let svg = buildSVG(doc, true, bleedR, viewRect);
    if (o.marks) {
      const mw = Math.max(.4, Math.min(b.w, b.h) * .0012);
      svg = svg.replace('</svg>', cropMarks(b, markLen, markOff, mw) + '</svg>');
    }
    const fams = [...new Set(doc.items.filter(i => i.type === 'text').map(i => i.font))];
    if (fams.length) { const css = await inlineFonts(fams); if (css) svg = svg.replace('<defs>', `<defs><style>${css}</style>`); }
    return { svg, viewRect };
  }

  /* A single-page PDF wrapping one JPEG. Hand-rolled, because pulling in a PDF
     library for one image would be silly. */
  function makePDF(jpegBytes, pxW, pxH, dpi) {
    const ptW = +(pxW / dpi * 72).toFixed(2), ptH = +(pxH / dpi * 72).toFixed(2);
    const enc = new TextEncoder();
    const parts = [], offsets = [];
    let len = 0;
    const push = chunk => {
      const bytes = typeof chunk === 'string' ? enc.encode(chunk) : chunk;
      parts.push(bytes); len += bytes.length;
    };
    const obj = (n, body) => { offsets[n] = len; push(`${n} 0 obj\n${body}\nendobj\n`); };

    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, '<</Type/Catalog/Pages 2 0 R>>');
    obj(2, '<</Type/Pages/Kids[3 0 R]/Count 1>>');
    obj(3, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${ptW} ${ptH}]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>`);

    offsets[4] = len;
    push(`4 0 obj\n<</Type/XObject/Subtype/Image/Width ${pxW}/Height ${pxH}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpegBytes.length}>>\nstream\n`);
    push(jpegBytes);
    push('\nendstream\nendobj\n');

    const content = `q\n${ptW} 0 0 ${ptH} 0 0 cm\n/Im0 Do\nQ\n`;
    obj(5, `<</Length ${content.length}>>\nstream\n${content}endstream`);

    const xref = len;
    let table = `xref\n0 6\n0000000000 65535 f \n`;
    for (let i = 1; i <= 5; i++) table += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    push(table);
    push(`trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`);

    const out = new Uint8Array(len);
    let at = 0;
    parts.forEach(p => { out.set(p, at); at += p.length; });
    return out;
  }

  async function exportPrint(o) {
    toast('rendering for print…');
    const { svg, viewRect } = await buildPrintSVG(o);
    const scale = o.dpi / 72 * (72 / 96) * o.dpi / o.dpi;   // px per document unit
    const k = o.dpi / 96;                                    // documents are authored at ~96dpi
    const pxW = Math.round(viewRect.w * k), pxH = Math.round(viewRect.h * k);
    const img = new Image();
    const ok = await new Promise(r => {
      img.onload = () => r(1); img.onerror = () => r(0);
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    });
    if (!ok) { toast('render failed'); return; }
    const c = document.createElement('canvas');
    c.width = pxW; c.height = pxH;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, pxW, pxH);
    g.drawImage(img, 0, 0, pxW, pxH);
    void scale;

    if (o.format === 'pdf') {
      const dataUrl = c.toDataURL('image/jpeg', 0.94);
      const bin = atob(dataUrl.split(',')[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const pdf = makePDF(bytes, pxW, pxH, o.dpi);
      saveBlob(new Blob([pdf], { type: 'application/pdf' }), slug() + '-print.pdf');
      toast(`PDF saved · ${(pxW / o.dpi).toFixed(2)}×${(pxH / o.dpi).toFixed(2)} in @ ${o.dpi}dpi`);
    } else if (o.format === 'svg') {
      saveBlob(new Blob([svg], { type: 'image/svg+xml' }), slug() + '-print.svg');
      toast('Print SVG saved');
    } else {
      c.toBlob(b2 => { saveBlob(b2, slug() + '-print.png'); toast(`PNG saved · ${pxW}×${pxH}`); });
    }
  }

  function openPrint() {
    const b = board();
    const o = { bleed: Math.round(Math.min(b.w, b.h) * .02), marks: 1, dpi: 300, format: 'pdf' };
    modal('Print setup', body => {
      body.appendChild(el('p', 'hint', 'Bleed extends the artwork past the trim so a slight miscut still shows ink, not paper. Crop marks show the printer where to cut.'));
      const fmt = el('div', 'chips');
      [['pdf', 'PDF'], ['png', 'PNG'], ['svg', 'SVG']].forEach(([k, label]) => {
        const btn = el('button', 'chip' + (o.format === k ? ' on' : ''), label);
        btn.onclick = () => { o.format = k; [...fmt.children].forEach(c => c.classList.toggle('on', c === btn)); info(); };
        fmt.appendChild(btn);
      });
      body.appendChild(fmt);
      body.appendChild(ctrlNum('Bleed', o.bleed, 0, Math.round(Math.min(b.w, b.h) * .1), 1, v => { o.bleed = v; info(); }));
      body.appendChild(ctrlBool('Crop marks', o.marks, v => { o.marks = v; info(); }));
      body.appendChild(ctrlSel('Resolution', ['150 dpi — proof', '300 dpi — print', '600 dpi — fine'], 1, v => { o.dpi = [150, 300, 600][v]; info(); }));
      const out = el('p', 'hint');
      body.appendChild(out);
      function info() {
        const pad = o.bleed + (o.marks ? Math.max(12, Math.min(b.w, b.h) * .035) * 1.5 + 6 : 0);
        const w = (b.w + pad * 2) / 96, h = (b.h + pad * 2) / 96;
        out.textContent = o.format === 'svg'
          ? `Vector, ${Math.round(b.w + pad * 2)}×${Math.round(b.h + pad * 2)} units. Trim ${b.w}×${b.h}.`
          : `Sheet ${w.toFixed(2)}×${h.toFixed(2)} in at ${o.dpi} dpi — ${Math.round(w * o.dpi)}×${Math.round(h * o.dpi)} px. Trim ${b.w}×${b.h}.`;
      }
      info();
      const go = el('button', 'wide solid', 'Export for print');
      go.onclick = () => { closeModal(); exportPrint(o); };
      body.appendChild(go);
    });
  }

  function openExportMenu() {
    const r = $('#btnExport').getBoundingClientRect();
    showMenu(r.right - 240, r.bottom + 6, [[
      { label: 'PNG · 2× (recommended)', icon: 'image', fn: () => doExport('png2') },
      { label: 'PNG · 4× for print', icon: 'image', fn: () => doExport('png4') },
      { label: 'PNG · actual size', icon: 'image', fn: () => doExport('png1') },
    ], [
      { label: 'SVG · vector, editable', icon: 'code', fn: () => doExport('svg') },
    ], [
      { label: 'Print — bleed & crop marks…', icon: 'frame', fn: openPrint },
    ], [
      { label: 'Copy as SVG', icon: 'copy', key: 'Ctrl ⇧ C', fn: copyAsSVG },
    ], [
      { label: 'Project file · .json', icon: 'file', fn: () => doExport('json') },
    ]]);
  }

  function placeSVGText(text, name) {
    try {
      const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = parsed.querySelector('svg');
      if (!svg || parsed.querySelector('parsererror')) { toast('could not read that SVG'); return false; }
      if (svg.innerHTML.length > 600000) { toast(`too big to embed (${Math.round(svg.innerHTML.length / 1024)}kb)`); return false; }
      let vb = svg.getAttribute('viewBox');
      if (!vb) { const w = parseFloat(svg.getAttribute('width')) || 100, h = parseFloat(svg.getAttribute('height')) || 100; vb = `0 0 ${w} ${h}`; }
      const parts = vb.split(/[\s,]+/).map(Number);
      const ar = (parts[2] || 100) / (parts[3] || 100);
      const size = Math.min(doc.w, doc.h) * .45;
      addItem({
        id: uid(), type: 'svg', markup: svg.innerHTML, viewBox: vb,
        x: 0, y: 0, w: ar >= 1 ? size : size * ar, h: ar >= 1 ? size / ar : size, rot: 0,
        st: defaultStyle(), hidden: 0, locked: 0, name: (name || 'SVG').slice(0, 22),
      }, true);
      toast('placed');
      return true;
    } catch (e) { toast('could not read that SVG'); return false; }
  }

  /* ==========================================================
     THEME, PANELS, TOOLS
     ========================================================== */
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    syncChromeColours();
    localStorage.setItem('scrawl.theme', t);
    $('#themeBtn').innerHTML = icon(t === 'dark' ? 'sun' : 'moon', 16);
    $('#themeBtn').title = t === 'dark' ? 'Light mode' : 'Dark mode';
  }
  const toggleTheme = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  function togglePanel(side) { document.body.classList.toggle('no-' + side); setTimeout(drawUI, 30); }

  function setTool(t) {
    // any tool change abandons a half-drawn path — picking up the pen again
    // must start a fresh one, not continue yesterday's
    if (pen) { pen = null; drawUI(); }
    tool = t;
    $$('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    updateCursor();
    $('#penHint').classList.toggle('on', t === 'pen');
    $('#pencilHint').classList.toggle('on', t === 'pencil');
    $('#toolOpts').classList.toggle('on', t === 'pen' || t === 'pencil');
  }

  /* ==========================================================
     WIRING
     ========================================================== */
  function bind() {
    const vp = $('#viewport');
    // The dock and the panel tabs live inside #viewport. Capturing the pointer
    // here retargets the follow-up click to #viewport, so those buttons never
    // fire — only take the event when it really started on the canvas.
    vp.addEventListener('pointerdown', e => {
      const t = e.target;
      const onCanvas = t === vp || (t instanceof Element && t.closest('#wrap'));
      if (!onCanvas) return;
      try { vp.setPointerCapture(e.pointerId); } catch (er) { }
      onDown(e);
    });
    vp.addEventListener('pointermove', onMove);
    vp.addEventListener('pointerup', onUp);
    vp.addEventListener('contextmenu', onContext);
    vp.addEventListener('dblclick', e => { if (tool === 'pen') finishPen(false); });
    vp.addEventListener('wheel', e => {
      e.preventDefault();
      const r = vp.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      if (e.ctrlKey || e.metaKey || !e.shiftKey) {
        const k = Math.exp(-e.deltaY * .0016), nz = clamp(view.z * k, .03, 10);
        view.ox = mx - (mx - view.ox) * (nz / view.z); view.oy = my - (my - view.oy) * (nz / view.z);
        view.z = nz;
      } else { view.ox -= e.deltaX; view.oy -= e.deltaY; }
      applyView(); drawUI();
      $('#zoomLbl').textContent = Math.round(view.z * 100) + '%';
    }, { passive: false });

    addEventListener('pointerdown', e => {
      const t = e.target;
      if (!(t instanceof Element) || !t.closest('#ctxmenu')) hideMenu();
    }, true);

    addEventListener('keydown', e => {
      if (/input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable) return;
      const meta = e.ctrlKey || e.metaKey;
      if (e.code === 'Space') { space = true; updateCursor(); e.preventDefault(); }
      if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (meta && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSel(); return; }
      if (meta && e.key.toLowerCase() === 'g') { e.preventDefault(); e.shiftKey ? ungroupSel() : groupSel(); return; }
      if (meta && e.key.toLowerCase() === 'r') { e.preventDefault(); openRepeat(); return; }
      if (meta && e.key.toLowerCase() === 'a') { e.preventDefault(); sel.clear(); doc.items.forEach(i => sel.add(i.id)); render(); refreshPanels(); return; }
      if (meta && e.key.toLowerCase() === 'e') { e.preventDefault(); openExportMenu(); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copyAsSVG(); return; }
      if (meta) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSel(); }
      if (e.key === 'Enter' && pen) { e.preventDefault(); finishPen(false); }
      if (e.key === 'Escape') { if (nodeEdit) { stopNodeEdit(); return; } if (pen) { pen = null; setTool('select'); drawUI(); return; } hideMenu(); closeModal(); stopEdit(); sel.clear(); render(); refreshPanels(); }
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'h' || e.key === 'H') setTool('hand');
      if (e.key === 't' || e.key === 'T') setTool('text');
      if (e.key === 'p' || e.key === 'P') setTool('pen');
      if (e.key === 'b' || e.key === 'B') setTool('pencil');
      if (e.key === ']') orderSel('up'); if (e.key === '[') orderSel('down');
      if (e.key === 'r' || e.key === 'R') { doc.items.forEach(i => { if (sel.has(i.id)) i.seed = rint(0, 99999); }); commit(); render(); }
      if (e.key === '0') fitView();
      if (e.key.startsWith('Arrow')) {
        e.preventDefault(); const n = e.shiftKey ? 20 : 2;
        doc.items.forEach(i => {
          if (!sel.has(i.id)) return;
          if (e.key === 'ArrowLeft') i.x -= n; if (e.key === 'ArrowRight') i.x += n;
          if (e.key === 'ArrowUp') i.y -= n; if (e.key === 'ArrowDown') i.y += n;
        });
        render();
      }
    });
    addEventListener('keyup', e => { if (e.code === 'Space') { space = false; updateCursor(); commit(); } });

    $('#libSearch').oninput = e => { libQuery = e.target.value; buildLibrary(); };
    $$('[data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool));
    $$('#toolOpts [data-opt]').forEach(b => b.onclick = () => {
      const k = b.dataset.opt;
      penOpts[k] = penOpts[k] ? 0 : 1;
      b.classList.toggle('on', !!penOpts[k]);
    });
    $('#btnSurprise').onclick = () => surprise();
    $('#btnFit').onclick = fitView;
    $('#btnZoomIn').onclick = () => { view.z = clamp(view.z * 1.25, .03, 10); applyView(); drawUI(); $('#zoomLbl').textContent = Math.round(view.z * 100) + '%'; };
    $('#btnZoomOut').onclick = () => { view.z = clamp(view.z / 1.25, .03, 10); applyView(); drawUI(); $('#zoomLbl').textContent = Math.round(view.z * 100) + '%'; };
    $('#btnSnap').onclick = () => { snapOn = !snapOn; $('#btnSnap').classList.toggle('on', snapOn); toast(snapOn ? 'Snapping on' : 'Snapping off'); };

    $('#btnUndo').onclick = undo; $('#btnRedo').onclick = redo;
    $('#btnHome').onclick = () => openHome('files');
    $$('.brand').forEach(b => { if (!b.closest('#home')) { b.style.cursor = 'pointer'; b.title = 'Your files'; b.onclick = () => openHome('files'); } });
    $('#btnNew').onclick = () => openHome('templates');
    $('#btnKeys').onclick = openShortcuts;
    $('#themeBtn').onclick = toggleTheme;
    $('#btnPalRand').onclick = randomPalette;
    $('#btnRecolour').onclick = e => recolourAll(e.shiftKey);
    $('#toggleLeft').onclick = () => togglePanel('left');
    $('#toggleRight').onclick = () => togglePanel('right');
    $$('[data-align]').forEach(b => b.onclick = () => alignSel(b.dataset.align));
    $$('[data-dist]').forEach(b => b.onclick = () => distributeSel(b.dataset.dist));
    $('#btnGroup').onclick = groupSel;
    $('#btnUngroup').onclick = ungroupSel;
    $('#btnExport').onclick = openExportMenu;

    $('#docName').onblur = () => { doc.name = $('#docName').textContent.trim() || 'Untitled'; saveCurrent(true); };
    $('#docName').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); $('#docName').blur(); } };

    $('#btnImport').onclick = () => $('#fileIn').click();
    $('#fileIn').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const fr = new FileReader();
      if (/\.svg$/i.test(f.name)) { fr.onload = () => placeSVGText(fr.result, f.name.replace(/\.svg$/i, '')); fr.readAsText(f); }
      else { fr.onload = () => { try { const d = JSON.parse(fr.result); d.id = d.id || 'd' + uid(); openDoc(d); toast('opened'); } catch (er) { toast('bad file'); } }; fr.readAsText(f); }
      e.target.value = '';
    };
    $('#modalClose').onclick = closeModal;
    $('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };

    $('#homeBack').onclick = closeHome;
    $('#homeSearch').oninput = renderHome;
    $$('#homeNav button').forEach(b => b.onclick = () => { homeTab = b.dataset.tab; renderHome(); });
    $('#homeNew').onclick = () => { homeTab = 'templates'; renderHome(); };

    addEventListener('resize', () => { drawUI(); if (editing) syncEditor(); });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    setTheme(localStorage.getItem('scrawl.theme') || 'light');
    const s = store();
    const rec = s.cur && s.docs[s.cur];
    const firstWarli = TEMPLATES.findIndex(t => t.style === 'warli');
    doc = migrateBoards(rec ? rec.doc : docFromTemplate(TEMPLATES[firstWarli >= 0 ? firstWarli : 0]));
    bind(); setTool('select'); paintIcons();
    $('#btnSnap').classList.toggle('on', snapOn);
    buildStylePicker(); buildPalettes(); buildLibrary(); refreshPanels(); render(); fitView(); commit();
    $('#docName').textContent = doc.name;
    document.fonts.ready.then(() => render());
    if (!rec) openHome('templates');
  }

  window.__scrawl = {
    get doc() { return doc; }, get sel() { return sel; }, get view() { return view; }, get tool() { return tool; },
    hitHandle, localOf, render, surprise, exportSVG, openHome, startEdit, buildSVG, docFromTemplate,
    setTool, finishPen, penClick, snapTargets, applyStyle, get libStyle(){return libStyle}, styleCats, startNodeEdit, stopNodeEdit, openSVGEditor, itemSVGSource, buildPrintSVG, makePDF, openPrint, exportPrint, repeatSel, groupSel, ungroupSel, distributeSel, alignSel, recolourAll, copyAsSVG, addBoard, setActiveBoard, boardsBounds, brand, saveBrand, get nodeEdit(){return nodeEdit}, get lastTap(){return lastTap}, get nodeList(){return nodeList}, editItem, freezeToPath, nodeHandles, PRESETS,
  };
  window.addEventListener('load', boot);
})();
