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

  const presetByName = n => PRESETS.find(p => p.name === n);
  function baseWeight(d) { const dd = d || doc; return +(((dd ? dd.w + dd.h : 2160) / 2) / 1080 * 3.2).toFixed(2); }
  function defaultStyle(d) {
    return { stroke: 0, fill: 4, accent: 1, weight: baseWeight(d), rough: 1.1, bow: 1, passes: 2, fillMode: 'none', fillGap: 4.5, fillAngle: -40, opacity: 1, wobble: 0 };
  }
  function fitBox(genKey, box) {
    const g = GENS[genKey];
    if (!g || g.aspect === 'free') return box;
    const s = Math.min(box.w, box.h);
    return { x: box.x + (box.w - s) / 2, y: box.y + (box.h - s) / 2, w: s, h: s };
  }
  function paletteAt(i) { const p = PALETTES[i % PALETTES.length]; return { name: p[0], paper: p[1], colors: [p[2], p[3], p[4], p[5], p[1]] }; }

  function newDoc(w = 1080, h = 1350, palIdx = 0, name = 'Untitled') {
    const p = paletteAt(palIdx);
    return { id: 'd' + uid(), name, w, h, palIdx, paper: p.paper, colors: p.colors.slice(), texture: 'grain', textureAmt: .12, textureScale: 1, items: [] };
  }
  function makeItem(genKey, box, d) {
    const g = GENS[genKey], params = {};
    g.params.forEach(pa => params[pa.k] = pa.def);
    return { id: uid(), type: 'shape', gen: genKey, params, seed: rint(0, 99999), x: box.x, y: box.y, w: box.w, h: box.h, rot: 0, st: defaultStyle(d), hidden: 0, locked: 0, name: g.label };
  }
  function makeText(txt, box, d) {
    return { id: uid(), type: 'text', text: txt || 'Text', font: 'Archivo Black', align: 'middle', letter: 0, lineH: 1.08, caps: 0, fit: 1, size: 80, x: box.x, y: box.y, w: box.w, h: box.h, rot: 0, st: Object.assign(defaultStyle(d), { wobble: 0 }), hidden: 0, locked: 0, name: 'Text' };
  }
  function itemFromPreset(pre, box, d) {
    const it = makeItem(pre.gen, fitBox(pre.gen, box), d);
    it.params = Object.assign({}, pre.params);
    it.seed = pre.seed; it.name = pre.name;
    return it;
  }

  /* ---------------- stroke cache ---------------- */
  const cache = new Map();
  function strokesFor(it) {
    const k = it.gen + '|' + it.seed + '|' + JSON.stringify(it.params) + '|' + it.st.rough + '|' + it.st.bow + '|' + it.st.passes + '|' + it.st.fillMode + '|' + it.st.fillGap + '|' + it.st.fillAngle;
    if (cache.has(k)) return cache.get(k);
    const h = new Hand(it.seed, { rough: it.st.rough, bow: it.st.bow, passes: it.st.passes, fillMode: it.st.fillMode, fillGap: it.st.fillGap, fillAngle: it.st.fillAngle });
    if (GENS[it.gen].cat === 'Patterns') h.clipStart('M0 0H100V100H0Z');
    try { GENS[it.gen].draw(h, it.params); } catch (e) { console.warn('gen', it.gen, e); }
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
    const T = `translate(${cx} ${cy}) rotate(${it.rot}) translate(${-it.w / 2} ${-it.h / 2})`;
    const filt = it.st.wobble > 0 ? ` filter="url(#w${NS}_${it.id})"` : '';
    const op = ` opacity="${it._edit ? 0 : it.st.opacity}"`;

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
    strokesFor(it).forEach(st => {
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
        rect: `<rect width="${d.w}" height="${d.h}" filter="url(#tex${NS})" opacity="${d.textureAmt}" style="mix-blend-mode:multiply"/>`
      };
    }
    const g = 14 * s, c = d.colors[0];
    let inner = '';
    if (t === 'dots') inner = `<circle cx="${g / 2}" cy="${g / 2}" r="${1.1 * s}" fill="${c}"/>`;
    if (t === 'grid') inner = `<path d="M0 0H${g}M0 0V${g}" stroke="${c}" stroke-width="${.7 * s}" fill="none"/>`;
    if (t === 'lines') inner = `<path d="M0 ${g / 2}H${g}" stroke="${c}" stroke-width="${.7 * s}" fill="none"/>`;
    if (t === 'crosshatch') inner = `<path d="M0 0L${g} ${g}M${g} 0L0 ${g}" stroke="${c}" stroke-width="${.6 * s}" fill="none"/>`;
    return { defs: `<pattern id="tex${NS}" width="${g}" height="${g}" patternUnits="userSpaceOnUse">${inner}</pattern>`, rect: `<rect width="${d.w}" height="${d.h}" fill="url(#tex${NS})" opacity="${d.textureAmt * 3}"/>` };
  }

  function wobDefs(d) {
    return d.items.filter(i => i.st.wobble > 0).map(i =>
      `<filter id="w${NS}_${i.id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${(.006 + i.st.wobble * .0016).toFixed(4)}" numOctaves="2" seed="${i.id % 9999}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${(i.st.wobble * 1.4).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('');
  }

  function buildSVG(d, forExport) {
    d = d || doc; clipN = 0; NS = forExport ? 'x' + (++nsN) : 's';
    const tex = texDefs(d);
    return `<svg xmlns="http://www.w3.org/2000/svg" ${forExport ? '' : 'id="stage" '}width="${d.w}" height="${d.h}" viewBox="0 0 ${d.w} ${d.h}">
<defs>${tex.defs}${wobDefs(d)}</defs>
<rect width="${d.w}" height="${d.h}" fill="${d.paper}"/>
${forExport ? '<g>' : '<g id="art">'}${d.items.map(i => itemMarkup(i, d)).join('')}</g>
${tex.rect}
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
    doc.items.filter(i => i.type === 'text' && !i.hidden).forEach(it => {
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
    const w = $('#wrap');
    w.style.transform = `translate(${view.ox}px,${view.oy}px) scale(${view.z})`;
    w.style.width = doc.w + 'px'; w.style.height = doc.h + 'px';
  }
  function fitView() {
    const vp = $('#viewport').getBoundingClientRect();
    view.z = Math.min((vp.width - 120) / doc.w, (vp.height - 140) / doc.h);
    view.ox = (vp.width - doc.w * view.z) / 2;
    view.oy = (vp.height - doc.h * view.z) / 2 - 12;
    applyView(); drawUI();
    $('#zoomLbl').textContent = Math.round(view.z * 100) + '%';
  }
  function toDoc(e) {
    const r = $('#viewport').getBoundingClientRect();
    return { x: (e.clientX - r.left - view.ox) / view.z, y: (e.clientY - r.top - view.oy) / view.z };
  }
  function toScreen(x, y) {
    const r = $('#viewport').getBoundingClientRect();
    return { x: r.left + view.ox + x * view.z, y: r.top + view.oy + y * view.z };
  }

  /* ==========================================================
     SMART GUIDES — Figma-style snapping
     ========================================================== */
  function snapTargets(excludeIds) {
    const V = [{ v: 0 }, { v: doc.w / 2 }, { v: doc.w }];
    const H = [{ v: 0 }, { v: doc.h / 2 }, { v: doc.h }];
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
  function drawUI() {
    const ui = $('#ui'); if (!ui) return;
    const k = 1 / view.z; let s = '';

    guides.forEach(g => {
      if (g.x !== undefined) s += `<line x1="${g.x}" y1="${-4000}" x2="${g.x}" y2="${doc.h + 4000}" stroke="#F24822" stroke-width="${1 * k}"/>`;
      else s += `<line x1="${-4000}" y1="${g.y}" x2="${doc.w + 4000}" y2="${g.y}" stroke="#F24822" stroke-width="${1 * k}"/>`;
    });

    doc.items.forEach(it => {
      if (!sel.has(it.id)) return;
      const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      s += `<g transform="translate(${cx} ${cy}) rotate(${it.rot})">
        <rect x="${-it.w / 2}" y="${-it.h / 2}" width="${it.w}" height="${it.h}" fill="none" stroke="#0D99FF" stroke-width="${1.5 * k}"/>`;
      if (sel.size === 1 && !it.locked && !editing) {
        const hs = 8 * k;
        HANDLES.forEach(([hx, hy]) => {
          s += `<rect x="${-it.w / 2 + it.w * hx - hs / 2}" y="${-it.h / 2 + it.h * hy - hs / 2}" width="${hs}" height="${hs}" rx="${1.5 * k}" fill="#fff" stroke="#0D99FF" stroke-width="${1.4 * k}"/>`;
        });
        s += `<line x1="0" y1="${-it.h / 2}" x2="0" y2="${-it.h / 2 - 26 * k}" stroke="#0D99FF" stroke-width="${1.4 * k}"/><circle cx="0" cy="${-it.h / 2 - 30 * k}" r="${5.5 * k}" fill="#fff" stroke="#0D99FF" stroke-width="${1.4 * k}"/>`;
      }
      s += '</g>';
    });

    // Figma-style dimension badge
    if (sel.size === 1 && !editing) {
      const it = doc.items.find(i => sel.has(i.id));
      if (it) {
        const bw = 58 * k, bh = 17 * k;
        const bx = it.x + it.w / 2 - bw / 2, by = it.y + it.h + 8 * k;
        s += `<g><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${3 * k}" fill="#0D99FF"/>
          <text x="${bx + bw / 2}" y="${by + bh * .72}" font-size="${11 * k}" fill="#fff" text-anchor="middle" style="font-family:'DM Sans',sans-serif;font-weight:500">${Math.round(it.w)} × ${Math.round(it.h)}</text></g>`;
      }
    }

    if (marquee) s += `<rect x="${Math.min(marquee.x0, marquee.x1)}" y="${Math.min(marquee.y0, marquee.y1)}" width="${Math.abs(marquee.x1 - marquee.x0)}" height="${Math.abs(marquee.y1 - marquee.y0)}" fill="#0D99FF22" stroke="#0D99FF" stroke-width="${1.2 * k}"/>`;

    if (nodeEdit) {
      const pts = nodeEdit.params._pts || [];
      const d = pts.map((q, i) => { const P = genToDoc(nodeEdit, q[0], q[1]); return (i ? 'L' : 'M') + P.x + ' ' + P.y; }).join('');
      s += `<path d="${d}${nodeEdit.params.closed ? 'Z' : ''}" fill="none" stroke="#0D99FF" stroke-width="${1.3 * k}" stroke-dasharray="${4 * k} ${3 * k}"/>`;
      pts.forEach((q, i) => {
        const P = genToDoc(nodeEdit, q[0], q[1]);
        s += `<rect x="${P.x - 5 * k}" y="${P.y - 5 * k}" width="${10 * k}" height="${10 * k}" rx="${5 * k}" fill="${i === dragNode ? '#0D99FF' : '#fff'}" stroke="#0D99FF" stroke-width="${1.6 * k}"/>`;
      });
    }

    if (pen && pen.pts.length) {
      const d = pen.pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join('');
      s += `<path d="${d}${pen.hover ? 'L' + pen.hover.x + ' ' + pen.hover.y : ''}" fill="none" stroke="#0D99FF" stroke-width="${1.6 * k}" stroke-dasharray="${5 * k} ${4 * k}"/>`;
      pen.pts.forEach((p, i) => s += `<circle cx="${p.x}" cy="${p.y}" r="${(i === 0 ? 6 : 4) * k}" fill="#fff" stroke="#0D99FF" stroke-width="${1.6 * k}"/>`);
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
    if (tool === 'pen') { vp.dataset.cursor = 'cross'; return; }
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

  /* ---- point editing on a drawn path ---- */
  function startNodeEdit(it) {
    if (!it || it.gen !== 'custom' || !it.params._pts) return false;
    stopEdit(); nodeEdit = it; sel.clear(); sel.add(it.id);
    $('#nodeHint').classList.add('on');
    render(); refreshPanels(); return true;
  }
  function stopNodeEdit() {
    if (!nodeEdit) return;
    nodeEdit = null; dragNode = -1;
    $('#nodeHint').classList.remove('on');
    commit(); render();
  }
  function hitNode(p) {
    if (!nodeEdit) return -1;
    const pts = nodeEdit.params._pts || [], tol = 9 / view.z;
    for (let i = 0; i < pts.length; i++) {
      const P = genToDoc(nodeEdit, pts[i][0], pts[i][1]);
      if (Math.hypot(P.x - p.x, P.y - p.y) < tol) return i;
    }
    return -1;
  }

  function onDown(e) {
    hideMenu();
    if (e.button === 2) return;
    if (e.button === 1 || space || tool === 'hand') { drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, ox: view.ox, oy: view.oy }; updateCursor(); return; }
    const p = toDoc(e);

    if (nodeEdit) {
      const ni = hitNode(p);
      if (ni >= 0) {
        if (e.altKey && (nodeEdit.params._pts || []).length > 2) {
          nodeEdit.params._pts.splice(ni, 1);
          nodeEdit.params = Object.assign({}, nodeEdit.params);   // bust the stroke cache
          commit(); render(); return;
        }
        dragNode = ni; drag = { mode: 'node' }; drawUI(); return;
      }
      if (hitItem(p) !== nodeEdit) { stopNodeEdit(); }
      else return;
    }

    if (tool === 'pen') { penClick(p); return; }
    if (tool === 'text') {
      const it = makeText('Text', { x: p.x, y: p.y, w: doc.w * .5, h: doc.h * .09 });
      addItem(it); setTool('select'); setTimeout(() => startEdit(it), 40); return;
    }

    if (editing) { const t = hitItem(p); if (t !== editing) stopEdit(); }
    const hh = hitHandle(p);
    if (hh) { drag = { mode: hh.mode, it: hh.it, hx: hh.hx, hy: hh.hy, start: p, snap: snapshot() }; return; }
    const it = hitItem(p);
    if (!it) {
      if (!e.shiftKey) { sel.clear(); refreshPanels(); }
      marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; drag = { mode: 'marquee' };
      drawUI(); return;
    }
    if (e.shiftKey) sel.has(it.id) ? sel.delete(it.id) : sel.add(it.id);
    else if (!sel.has(it.id)) { sel.clear(); sel.add(it.id); }
    if (e.altKey) duplicateSel();
    drag = { mode: 'move', start: p, snap: snapshot(), targets: snapTargets(sel) };
    refreshPanels(); drawUI(); updateCursor();
  }

  function onMove(e) {
    if (!drag) { updateCursor(e); if (pen) { pen.hover = toDoc(e); drawUI(); } return; }
    if (drag.mode === 'pan') { view.ox = drag.ox + (e.clientX - drag.sx); view.oy = drag.oy + (e.clientY - drag.sy); applyView(); return; }
    const p = toDoc(e);

    if (drag.mode === 'node') {
      const g = docToGen(nodeEdit, p);
      const pts = nodeEdit.params._pts.slice();
      pts[dragNode] = [g.x, g.y];
      nodeEdit.params = Object.assign({}, nodeEdit.params, { _pts: pts });
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
    if (drag && drag.mode === 'node') { dragNode = -1; drag = null; commit(); render(); return; }
    if (drag && ['move', 'scale', 'rot'].includes(drag.mode)) commit();
    if (drag && drag.mode === 'marquee') { marquee = null; refreshPanels(); }
    drag = null; guides = []; render(); updateCursor();
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
    it.params = { closed: closed ? 1 : 0, smooth: 70, _pts: local };
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
    doc = s.d; sel = new Set((s.s || []).filter(id => doc.items.some(i => i.id === id)));
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
    doc = d; sel.clear();
    if (resetHistory !== false) { history = []; hi = -1; }
    buildPalettes(); buildLibrary(); refreshPanels(); render(); fitView(); commit();
    $('#docName').textContent = doc.name;
    closeHome();
  }

  /* ---------------- templates ---------------- */
  function docFromTemplate(tpl) {
    const d = newDoc(tpl.w, tpl.h, tpl.pal, tpl.name === 'Blank canvas' ? 'Untitled' : tpl.name);
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
        it = itemFromPreset(pre, box, d);
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
    const add = [];
    doc.items.forEach(it => { if (sel.has(it.id)) { const c = JSON.parse(JSON.stringify(it)); c.id = uid(); c.x += 20; c.y += 20; add.push(c); } });
    if (!add.length) return;
    doc.items.push(...add); sel.clear(); add.forEach(a => sel.add(a.id));
    commit(); render(); refreshPanels();
  }
  function deleteSel() { if (!sel.size) return; doc.items = doc.items.filter(i => !sel.has(i.id)); sel.clear(); commit(); render(); refreshPanels(); }
  function orderSel(dir) {
    const idx = doc.items.map((it, i) => sel.has(it.id) ? i : -1).filter(i => i >= 0);
    if (!idx.length) return;
    if (dir === 'front') { const m = doc.items.filter(i => sel.has(i.id)); doc.items = doc.items.filter(i => !sel.has(i.id)).concat(m); }
    if (dir === 'back') { const m = doc.items.filter(i => sel.has(i.id)); doc.items = m.concat(doc.items.filter(i => !sel.has(i.id))); }
    if (dir === 'up') idx.reverse().forEach(i => { if (i < doc.items.length - 1) { const t = doc.items[i]; doc.items[i] = doc.items[i + 1]; doc.items[i + 1] = t; } });
    if (dir === 'down') idx.forEach(i => { if (i > 0) { const t = doc.items[i]; doc.items[i] = doc.items[i - 1]; doc.items[i - 1] = t; } });
    commit(); render(); refreshPanels();
  }
  function alignSel(mode) {
    const items = doc.items.filter(i => sel.has(i.id)); if (!items.length) return;
    items.forEach(it => {
      if (mode === 'l') it.x = 0; if (mode === 'r') it.x = doc.w - it.w; if (mode === 'cx') it.x = (doc.w - it.w) / 2;
      if (mode === 't') it.y = 0; if (mode === 'b') it.y = doc.h - it.h; if (mode === 'cy') it.y = (doc.h - it.h) / 2;
    });
    commit(); render();
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
      { label: one.type === 'text' ? 'Edit text' : 'New hand', icon: one.type === 'text' ? 'type' : 'refresh', key: one.type === 'text' ? '' : 'R', fn: () => one.type === 'text' ? startEdit(one) : (items.forEach(i => i.seed = rint(0, 99999)), commit(), render()) }].concat(one.type === 'text' ? [] : [one.gen === 'custom' ? { label: 'Edit points', icon: 'pen', fn: () => startNodeEdit(one) } : { label: 'Edit SVG…', icon: 'code', fn: () => openSVGEditor(one) }]),
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
  let libCat = null, libQuery = '';
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
    const cats = S.PRESET_CATS;
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
    const list = q ? PRESETS.filter(p => p.search.includes(q)) : PRESETS.filter(p => p.cat === libCat);
    host.appendChild(el('div', 'libmeta', q ? `${list.length} match${list.length === 1 ? '' : 'es'}` : `${list.length} in ${libCat}`));

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
      const g1 = group(host, 'Canvas', 'canvas', true);
      const sizeSel = el('select', 'wide');
      sizeSel.innerHTML = CANVASES.map((c, i) => `<option value="${i}">${c[0]} · ${c[1]}×${c[2]}</option>`).join('') + '<option value="-1">Custom</option>';
      sizeSel.value = CANVASES.findIndex(c => c[1] === doc.w && c[2] === doc.h);
      sizeSel.onchange = e => { const i = +e.target.value; if (i >= 0) { doc.w = CANVASES[i][1]; doc.h = CANVASES[i][2]; commit(); render(); fitView(); refreshPanels(); } };
      g1.appendChild(sizeSel);
      const wh = el('div', 'row');
      wh.innerHTML = `<div class="field"><label>W</label><input id="cw" type="number" value="${doc.w}"></div><div class="field"><label>H</label><input id="ch" type="number" value="${doc.h}"></div>`;
      wh.querySelectorAll('input').forEach(inp => inp.onchange = () => { doc.w = clamp(+$('#cw').value, 80, 8000); doc.h = clamp(+$('#ch').value, 80, 8000); commit(); render(); fitView(); });
      g1.appendChild(wh);
      const swap = el('button', 'wide ghost', 'Swap width & height');
      swap.onclick = () => { const t = doc.w; doc.w = doc.h; doc.h = t; commit(); render(); fitView(); refreshPanels(); };
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
      if (it.type === 'shape') {
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
      const kind = it.type === 'text' ? 'type' : it.type === 'svg' ? 'image' : 'shapes';
      row.innerHTML = `<i class="lgrip" title="Drag to reorder">${icon('more', 13)}</i>
        <i class="lkind">${icon(kind, 14)}</i><span>${esc(label)}</span>
        <button class="lbtn eye" title="Show / hide">${icon(it.hidden ? 'eyeOff' : 'eye', 14)}</button>
        <button class="lbtn lock${it.locked ? ' on' : ''}" title="Lock">${icon(it.locked ? 'lock' : 'unlock', 14)}</button>`;
      row.querySelector('span').onclick = e => { if (!e.shiftKey) sel.clear(); sel.add(it.id); render(); refreshPanels(); };
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
    PALETTES.forEach((p, i) => {
      const s = el('button', 'pal' + (doc.palIdx === i ? ' on' : ''));
      s.title = p[0]; s.style.background = p[1];
      s.innerHTML = `<i style="background:${p[2]}"></i><i style="background:${p[3]}"></i><i style="background:${p[4]}"></i>`;
      s.onclick = () => applyPalette(i);
      host.appendChild(s);
    });
  }
  function applyPalette(i) {
    const p = paletteAt(i);
    doc.palIdx = i; doc.paper = p.paper; doc.colors = p.colors.slice();
    commit(); render(); buildPalettes(); buildLibrary(); refreshPanels();
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
    const palIdx = rint(0, PALETTES.length - 1), p = paletteAt(palIdx);
    doc.w = cv[1]; doc.h = cv[2];
    doc.palIdx = palIdx; doc.paper = p.paper; doc.colors = p.colors.slice();
    doc.texture = pickOf(TEXTURES); doc.textureAmt = +rnd(.04, .2).toFixed(2); doc.textureScale = +rnd(.6, 2).toFixed(1);
    doc.items = [];

    const comp = pickOf(COMPOSITIONS), slots = comp.place(Math.random), bw = baseWeight();
    const hand = { rough: +rnd(.5, 2.1).toFixed(2), bow: +rnd(.3, 1.7).toFixed(2), passes: rint(1, 3), weight: +(bw * rnd(.6, 1.9)).toFixed(2), wobble: Math.random() > .6 ? +rnd(1, 6).toFixed(1) : 0 };
    const fillMode = pickOf(FILLS), font = pickOf(FONTS)[0];
    const cats = S.PRESET_CATS.filter(c => c !== 'Patterns' && c !== 'Frames' && c !== 'Custom');
    const theme = [pickOf(cats), pickOf(cats)];
    const pool = PRESETS.filter(x => theme.includes(x.cat));
    const heavy = PRESETS.filter(x => ['Characters', 'Objects', 'Nature', 'Shapes', 'Icons'].includes(x.cat));
    const patPool = PRESETS.filter(x => x.cat === 'Patterns');
    const framePool = PRESETS.filter(x => x.cat === 'Frames');
    const strong = pool.filter(x => x.cat !== 'Marks');
    const anchor = pickOf(strong.length ? strong : heavy);
    const cohesion = Math.random();

    slots.forEach(sl => {
      const box = { x: sl.x / 100 * doc.w, y: sl.y / 100 * doc.h, w: sl.w / 100 * doc.w, h: sl.h / 100 * doc.h };
      if (sl.text) {
        const t = makeText(sl.text === 'head' ? pickOf(WORDS) : pickOf(SUBS), box);
        t.font = font;
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

      const it = itemFromPreset(pre, fitBox(pre.gen, box));
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
    toast(comp.name + ' · ' + p.name);
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
      (S.TEMPLATE_CATS || ['All']).forEach(c => {
        const b = el('button', 'chip' + (c === tplCat ? ' on' : ''), c);
        b.onclick = () => { tplCat = c; renderHome(); };
        filterHost.appendChild(b);
      });
      TEMPLATES
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
    const body = strokesFor(it).map(st => {
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
  async function exportSVG() {
    const fams = [...new Set(doc.items.filter(i => i.type === 'text').map(i => i.font))];
    let svg = buildSVG(doc, true);
    if (fams.length) { const css = await inlineFonts(fams); if (css) svg = svg.replace('<defs>', `<defs><style>${css}</style>`); }
    return svg;
  }
  function saveBlob(b, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
  const slug = () => (doc.name || 'scrawl').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scrawl';

  async function doExport(kind) {
    stopEdit(); toast('preparing…');
    if (kind === 'json') { saveBlob(new Blob([JSON.stringify(doc)], { type: 'application/json' }), slug() + '.json'); toast('project file saved'); return; }
    const svg = await exportSVG();
    if (kind === 'svg') { saveBlob(new Blob([svg], { type: 'image/svg+xml' }), slug() + '.svg'); toast('SVG saved'); return; }
    const scale = kind === 'png4' ? 4 : kind === 'png2' ? 2 : 1;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = doc.w * scale; c.height = doc.h * scale;
      const g = c.getContext('2d'); g.scale(scale, scale); g.drawImage(img, 0, 0, doc.w, doc.h);
      c.toBlob(b => { saveBlob(b, slug() + '.png'); toast('PNG saved'); });
    };
    img.onerror = () => toast('render failed — try SVG');
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
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
    localStorage.setItem('scrawl.theme', t);
    $('#themeBtn').innerHTML = icon(t === 'dark' ? 'sun' : 'moon', 16);
    $('#themeBtn').title = t === 'dark' ? 'Light mode' : 'Dark mode';
  }
  const toggleTheme = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  function togglePanel(side) { document.body.classList.toggle('no-' + side); setTimeout(drawUI, 30); }

  function setTool(t) {
    if (tool === 'pen' && t !== 'pen' && pen) { pen = null; drawUI(); }
    tool = t;
    $$('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    updateCursor();
    $('#penHint').classList.toggle('on', t === 'pen');
  }

  /* ==========================================================
     WIRING
     ========================================================== */
  function bind() {
    const vp = $('#viewport');
    vp.addEventListener('pointerdown', e => { try { vp.setPointerCapture(e.pointerId); } catch (er) { } onDown(e); });
    vp.addEventListener('pointermove', onMove);
    vp.addEventListener('pointerup', onUp);
    vp.addEventListener('contextmenu', onContext);
    vp.addEventListener('dblclick', e => {
      if (tool === 'pen') return finishPen(false);
      const it = hitItem(toDoc(e));
      if (!it) return;
      if (it.type === 'text') return startEdit(it);
      if (it.type === 'shape' && it.gen === 'custom') return startNodeEdit(it);
      openSVGEditor(it);
    });
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
      if (meta && e.key.toLowerCase() === 'a') { e.preventDefault(); sel.clear(); doc.items.forEach(i => sel.add(i.id)); render(); refreshPanels(); return; }
      if (meta && e.key.toLowerCase() === 'e') { e.preventDefault(); openExportMenu(); return; }
      if (meta) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSel(); }
      if (e.key === 'Enter' && pen) { e.preventDefault(); finishPen(false); }
      if (e.key === 'Escape') { if (nodeEdit) { stopNodeEdit(); return; } if (pen) { pen = null; setTool('select'); drawUI(); return; } hideMenu(); closeModal(); stopEdit(); sel.clear(); render(); refreshPanels(); }
      if (e.key === 'v' || e.key === 'V') setTool('select');
      if (e.key === 'h' || e.key === 'H') setTool('hand');
      if (e.key === 't' || e.key === 'T') setTool('text');
      if (e.key === 'p' || e.key === 'P') setTool('pen');
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
    $('#toggleLeft').onclick = () => togglePanel('left');
    $('#toggleRight').onclick = () => togglePanel('right');
    $$('[data-align]').forEach(b => b.onclick = () => alignSel(b.dataset.align));
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
    doc = rec ? rec.doc : docFromTemplate(TEMPLATES[0]);
    bind(); setTool('select'); paintIcons();
    $('#btnSnap').classList.toggle('on', snapOn);
    buildPalettes(); buildLibrary(); refreshPanels(); render(); fitView(); commit();
    $('#docName').textContent = doc.name;
    document.fonts.ready.then(() => render());
    if (!rec) openHome('templates');
  }

  window.__scrawl = {
    get doc() { return doc; }, get sel() { return sel; }, get view() { return view; }, get tool() { return tool; },
    hitHandle, localOf, render, surprise, exportSVG, openHome, startEdit, buildSVG, docFromTemplate,
    setTool, finishPen, penClick, snapTargets, startNodeEdit, stopNodeEdit, openSVGEditor, itemSVGSource, get nodeEdit(){return nodeEdit}, PRESETS,
  };
  window.addEventListener('load', boot);
})();
