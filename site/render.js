/* ============================================================
   SCRAWL / site / render — the editor's own pen, outside the editor
   ------------------------------------------------------------
   Everything on the website is drawn by the same generators the
   editor uses. This file is the thin layer between a library
   preset and an <svg>: it mirrors how app.js turns a preset into
   paths (roles → palette slots, stroke weight against a 1080px
   board) so a piece here looks exactly like it does in the editor.
   ============================================================ */
(function () {
  const S = window.SCRAWL;
  const { Hand, GENS, PRESETS } = S;
  let uidN = 0;

  const styleKeys = () => Object.keys(S.STYLES);
  const presetsOf = k => PRESETS.filter(p => p.style === k);
  const findPreset = (name, style) =>
    PRESETS.find(p => p.name === name && p.style === style) ||
    (style ? null : PRESETS.find(p => p.name === name));

  /* [name, ground, pigment, accent, alt, alt2] → what a document holds */
  function palette(style, i) {
    const pals = S.stylePalettes(style);
    const p = pals[(((i || 0) % pals.length) + pals.length) % pals.length];
    return { name: p[0], paper: p[1], colors: [p[2], p[3], p[4], p[5], p[1]] };
  }

  /* the same dial-shuffle the editor's variants browser uses */
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

  function handOf(pre, over) {
    const st = S.styleOf(GENS[pre.gen].style);
    return Object.assign({ rough: 1, bow: 1, passes: 2, weight: 3, fillMode: 'none' }, st.hand, over || {});
  }

  /* A square generator is fitted into the largest centred square of
     its box; a free one fills the box and is told its aspect. */
  function fit(g, box) {
    if (g.aspect === 'free') return box;
    const s = Math.min(box.w, box.h);
    return { x: box.x + (box.w - s) / 2, y: box.y + (box.h - s) / 2, w: s, h: s };
  }

  /* One piece as SVG markup placed in `box` (units of a 1080px board).
     o.colors: [ink, accent, alt, alt2, paper]; o.slots: {c, a, f}. */
  function pieceMarkup(pre, box, o) {
    o = o || {};
    const g = GENS[pre.gen];
    if (!g) return { defs: '', body: '' };
    const b = fit(g, box);
    const hand = handOf(pre, o.hand);
    const h = new Hand(o.seed != null ? o.seed : pre.seed, {
      rough: hand.rough, bow: hand.bow, passes: hand.passes,
      fillMode: hand.fillMode, fillGap: 4.5, fillAngle: -40, detail: o.detail != null ? o.detail : 1,
    });
    const params = Object.assign({}, pre.params, o.params || {});
    if (g.aspect === 'free') params._ar = Math.max(.05, Math.min(20, b.w / b.h));
    if (g.cat === 'Patterns') h.clipStart('M0 0H100V100H0Z');
    try { g.draw(h, params); } catch (e) { console.warn('gen', pre.gen, e); }
    h.clipEnd();

    const cols = o.colors, slot = Object.assign({ c: 0, a: 1, f: 4 }, o.slots || {});
    const weight = o.weight != null ? o.weight : hand.weight;
    const sw = weight / (((b.w + b.h) / 200) || 1);
    const n = h.strokes.length;
    let defs = '', body = '';
    h.strokes.forEach((st, i) => {
      let ca = '';
      if (st.clip) { const id = 'k' + (uidN++); defs += `<clipPath id="${id}"><path d="${st.clip}"/></clipPath>`; ca = ` clip-path="url(#${id})"`; }
      const stroke = cols[st.role === 'accent' ? slot.a : st.role === 'fill' ? slot.f : slot.c];
      const fill = st.fill === 'none' ? 'none' : cols[st.fill === 'accent' ? slot.a : st.fill === 'fill' ? slot.f : slot.c];
      const anim = o.animate ? ` pathLength="1" style="--i:${(i / Math.max(1, n - 1)).toFixed(3)}"` : '';
      body += `<path d="${st.d}" fill="${fill}" stroke="${stroke}" stroke-width="${(st.w * sw).toFixed(3)}" stroke-linecap="${st.cap}" stroke-linejoin="round"${st.op !== 1 ? ` opacity="${st.op}"` : ''}${ca}${anim}/>`;
    });
    const rot = o.rot ? ` rotate(${o.rot} ${b.w / 2} ${b.h / 2})` : '';
    return {
      defs,
      body: `<g transform="translate(${b.x.toFixed(2)} ${b.y.toFixed(2)})${rot} scale(${(b.w / 100).toFixed(5)} ${(b.h / 100).toFixed(5)})">${body}</g>`,
      count: n,
    };
  }

  /* A single piece as a standalone <svg>. `size` is how big the piece
     would be on a 1080px board, which sets how heavy the line reads. */
  function piece(pre, o) {
    o = o || {};
    const w = o.w || o.size || 520, h = o.h || o.size || 520;
    const pad = (o.pad != null ? o.pad : .05) * Math.max(w, h);
    const m = pieceMarkup(pre, { x: 0, y: 0, w, h }, o);
    const cls = ['piece', o.animate ? 'draw' : '', o.cls || ''].join(' ').trim();
    const par = o.slice ? 'xMidYMid slice' : 'xMidYMid meet';
    return `<svg class="${cls}" viewBox="${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}" preserveAspectRatio="${par}" role="img" aria-label="${esc(o.label || pre.name)}">${m.defs ? `<defs>${m.defs}</defs>` : ''}${m.body}</svg>`;
  }

  /* ground texture, the same fractal noise the editor lays over a board */
  function texture(kind, amt, w, h) {
    if (!kind || kind === 'none' || !amt) return { defs: '', rect: '' };
    const bf = { grain: '0.9', rough: '0.34', fibre: '0.02 0.85', blotch: '0.05' }[kind] || '0.8';
    const oct = { grain: 4, rough: 5, fibre: 3, blotch: 2 }[kind] || 3;
    const id = 'tx' + (uidN++);
    return {
      defs: `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${bf}" numOctaves="${oct}" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>`,
      rect: `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${amt}" style="mix-blend-mode:multiply"/>`,
    };
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

  /* A whole template, rendered as a finished poster. Text is laid out
     roughly here and fitted to its box after it lands in the page
     (see fitText), the way the editor auto-fits a text box. */
  function template(tpl, o) {
    o = o || {};
    const style = tpl.style || 'sketch';
    const pal = palette(style, o.pal != null ? o.pal : tpl.pal);
    const W = tpl.w, H = tpl.h;
    const hand = S.styleOf(style).hand;
    const weight = (W + H) / 2160 * hand.weight;
    const tx = texture(tpl.texture, tpl.amt, W, H);
    let defs = tx.defs, body = '';
    (tpl.items || []).forEach((sl, i) => {
      const box = { x: sl.x / 100 * W, y: sl.y / 100 * H, w: sl.w / 100 * W, h: sl.h / 100 * H };
      const c = pal.colors[sl.c != null ? sl.c : 0];
      if (sl.t !== undefined) {
        const lines = String(sl.caps ? String(sl.t).toUpperCase() : sl.t).split('\n');
        const lh = sl.lh || 1.08, fs = box.h / (lines.length * lh);
        const anchor = sl.align || 'middle';
        const ax = anchor === 'start' ? box.x : anchor === 'end' ? box.x + box.w : box.x + box.w / 2;
        body += `<g class="fit" data-x="${box.x}" data-y="${box.y}" data-w="${box.w}" data-h="${box.h}"${sl.op != null ? ` opacity="${sl.op}"` : ''}>` + lines.map((l, k) =>
          `<text x="${ax.toFixed(1)}" y="${(box.y + fs * .82 + k * fs * lh).toFixed(1)}" text-anchor="${anchor}" font-size="${fs.toFixed(1)}" letter-spacing="${((sl.ls || 0) * fs / 100).toFixed(2)}" fill="${c}" style="font-family:'${sl.font || 'DM Sans'}',sans-serif">${esc(l)}</text>`).join('') + '</g>';
        return;
      }
      const pre = findPreset(sl.p, style) || findPreset(sl.p);
      if (!pre) return;
      const slots = { c: sl.c != null ? sl.c : 0, a: sl.a != null ? sl.a : 1, f: sl.f != null ? sl.f : 4 };
      const m = pieceMarkup(pre, box, {
        colors: pal.colors, slots, weight, rot: sl.rot, detail: o.detail != null ? o.detail : .6,
        hand: sl.fill ? { fillMode: sl.fill } : null, animate: o.animate,
      });
      defs += m.defs;
      body += sl.op != null ? `<g opacity="${sl.op}">${m.body}</g>` : m.body;
    });
    return `<svg class="poster${o.animate ? ' draw' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tpl.name)} template"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="${pal.paper}"/>${body}${tx.rect}</svg>`;
  }

  /* Shrink each laid-out text block until it sits inside its box. */
  function fitText(root) {
    root.querySelectorAll('g.fit').forEach(g => {
      const bw = +g.dataset.w, bh = +g.dataset.h;
      let bb; try { bb = g.getBBox(); } catch (e) { return; }
      if (!bb.width) return;
      const k = Math.min(1, bw / bb.width, bh / bb.height);
      if (k < .999) g.querySelectorAll('text').forEach(t => {
        const fs = +t.getAttribute('font-size');
        t.setAttribute('font-size', (fs * k).toFixed(1));
        t.setAttribute('letter-spacing', (+t.getAttribute('letter-spacing') * k).toFixed(2));
        /* keep the block vertically centred where the box was */
        const y = +t.getAttribute('y'), top = +g.dataset.y;
        t.setAttribute('y', (top + (y - top) * k + bh * (1 - k) / 2).toFixed(1));
      });
    });
  }

  window.SITE = { palette, piece, pieceMarkup, template, fitText, findPreset, presetsOf, styleKeys, randParams, esc };
})();
