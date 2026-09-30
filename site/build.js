#!/usr/bin/env node
/* ============================================================
   SCRAWL / site / build — draw the website's pictures once
   ------------------------------------------------------------
   The website doesn't run the drawing engine to show its
   pictures: that would make every visitor, on every old laptop,
   parse half a megabyte of generators before seeing a peacock.
   Instead this script runs the editor's own generators here, in
   Node, and writes plain SVG files into site/art/. It also fills
   the tradition index and the library counts in site/index.html.

   Run it after adding or changing a tradition:
       node site/build.js

   What it draws:
     draw-<tradition>.svg  the peacock each tradition stands for,
                           marked up to draw itself line by line
     made-<name>.svg       finished templates for the "made in an
                           afternoon" wall
     chain.svg             the Warli chain that walks along the foot

   Only the "Shuffle the hand" demo loads the real engine, and only
   when a visitor scrolls near it.
   ============================================================ */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'art');
const PAGE = path.join(__dirname, 'index.html');

/* ---- load the editor's packs, in the order the editor loads them ---- */
const ctx = { console, Math, Object, Array, JSON, String, Number, Date, parseInt, parseFloat, isFinite, Set, Map };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const list = [];
for (const m of html.matchAll(/<script\s+src="([^"]+)"/g)) {
  if (m[1] === 'app.js') break;
  if (!/^(https?:)?\/\//.test(m[1])) list.push(m[1]);
}
for (const f of list) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'render.js'), 'utf8'), ctx, { filename: 'render.js' });
const S = ctx.SCRAWL, R = ctx.SITE;

/* ---- the site's own colours (see :root in site.css) ---- */
const C = { night: '#0E0D0B', bone: '#F3EDE2', sindoor: '#FF5A1F', turmeric: '#F2B233' };

/* ---- per tradition: palette, the peacock that stands for it, its rule ---- */
const TRAD = {
  warli: { pal: 3, peacock: 'Peacock', rule: 'No figure is larger than another.', medium: 'Rice paste on an earth wall' },
  gond: { pal: 6, peacock: 'Great peacock', rule: 'The fill is the signature.', medium: 'Pigment dots and dashes' },
  madhubani: { pal: 0, peacock: 'Peacock in display', rule: 'No ground is left bare.', medium: 'Lamp-black and pigment on paper' },
  pattachitra: { pal: 1, peacock: 'Great peacock', rule: 'The border is half the painting.', medium: 'Mineral colour on primed cloth' },
  kalamkari: { pal: 3, peacock: 'Peacock', rule: 'The pen draws. The dye decides.', medium: 'Bamboo pen and vegetable dye' },
  sketch: { pal: 1, peacock: 'Crested bird', rule: 'Everything is drawn twice.', medium: 'Pen and ink, with a loose hand' },
};

const esc = R.esc;
const isSquare = p => S.GENS[p.gen] && S.GENS[p.gen].aspect !== 'free';
const pre = (name, style) => {
  const p = R.findPreset(name, style);
  if (!p) throw new Error(`no piece called "${name}" in ${style}`);
  return p;
};
const palOf = (k, i) => R.palette(k, (i || 0) < S.stylePalettes(k).length ? (i || 0) : 0);
/* path coordinates are in a 0..100 box, so one decimal is under a pixel */
const fmt = s => s.replace(/ d="([^"]*)"/g, (m, d) => ` d="${d.replace(/(\d+)\.(\d)\d*/g, (x, a, b) => b === '0' ? a : a + '.' + b)}"`);

/* a standalone SVG file */
function file(name, w, h, body, o) {
  o = o || {};
  const label = o.label ? ` role="img" aria-label="${esc(o.label)}"` : ' aria-hidden="true"';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${label}>` +
    (o.label ? `<title>${esc(o.label)}</title>` : '') +
    (o.defs ? `<defs>${o.defs}</defs>` : '') + (o.ground ? `<rect width="${w}" height="${h}" fill="${o.ground}"/>` : '') + body + '</svg>';
  const out = fmt(svg);
  fs.writeFileSync(path.join(OUT, name), out);
  return out.length;
}
/* pieces placed in boxes, all drawn with one set of colours */
function compose(items, colors, o) {
  let defs = '', body = '';
  items.forEach(it => {
    const m = R.pieceMarkup(it.pre, it.box, Object.assign({ colors, detail: o && o.detail != null ? o.detail : .8 }, it.o || {}));
    defs += m.defs; body += m.body;
  });
  return { defs, body };
}

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.svg')) fs.unlinkSync(path.join(OUT, f));
const sizes = {};
const W = (name, ...a) => { sizes[name] = file(name, ...a); };
const keys = R.styleKeys();

/* ---------- one peacock per tradition, ready to draw itself ---------- */
const trads = keys.map(k => {
  const st = S.STYLES[k], t = TRAD[k] || {};
  const pal = palOf(k, t.pal);
  const p = (t.peacock && R.findPreset(t.peacock, k)) ||
    R.presetsOf(k).find(p => isSquare(p) && /peacock|bird/i.test(p.name)) || R.presetsOf(k).find(isSquare);
  const m = R.pieceMarkup(p, { x: 30, y: 30, w: 540, h: 540 }, { colors: pal.colors, detail: .8, animate: true });
  const label = `${p.name}, drawn by Scrawl in the ${st.name} style`;
  W(`draw-${k}.svg`, 600, 600, m.body, { defs: m.defs, label });
  return {
    k, name: st.name, where: st.where || t.medium || '', medium: t.medium || '', label,
    rule: t.rule || String(st.note || '').split(/(?<=\.)\s/)[0],
    ground: pal.paper, ink: pal.colors[0], accent: pal.colors[1],
    motifs: R.presetsOf(k).length, palettes: S.stylePalettes(k).length,
    templates: S.TEMPLATES.filter(x => (x.style || 'sketch') === k && (x.items || []).length).length,
  };
});

/* ---------- finished pieces for the "made in an afternoon" wall ----------
   These are whole templates, thousands of marks each: as SVG they would
   weigh megabytes and be slow to paint. They are rasterised to small
   WebP images instead, with Playwright's Chromium when it is installed
   (the rest of the build doesn't need it). */
const MADE = [
  ['invite', 'madhubani', 'Wedding'],
  ['post', 'warli', 'Tarpa dance'],
  ['album', 'gond', 'Peacock'],
  ['tote', 'kalamkari', 'Paisley medallion'],
  ['print', 'pattachitra', 'Dancer in a doorway'],
  ['book', 'kalamkari', 'Tree on black'],
  ['tea', 'madhubani', 'Two fish'],
  ['poster', 'gond', 'Tree of life'],
];
const made = MADE.map(([name, style, tname]) => {
  const tpl = S.TEMPLATES.find(t => (t.style || 'sketch') === style && t.name === tname);
  if (!tpl) { console.warn('no template', style, tname); return null; }
  /* no paper grain: a noise filter is slow to paint */
  const svg = R.template(Object.assign({}, tpl, { texture: 'none' }), { detail: .8 })
    .replace('<svg class="poster"', `<svg xmlns="http://www.w3.org/2000/svg" width="${tpl.w}" height="${tpl.h}"`);
  return { name, svg: fmt(svg), w: tpl.w, h: tpl.h };
}).filter(Boolean);
const madeDone = (async () => {
  let pw;
  for (const where of [process.env.PLAYWRIGHT, 'playwright', '/opt/node22/lib/node_modules/playwright']) {
    if (!where) continue;
    try { pw = require(where); break; } catch (e) { }
  }
  if (!pw) { console.warn('Playwright not found: kept the existing made-*.webp images'); return; }
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  for (const m of made) {
    const width = 720, height = Math.round(width * m.h / m.w);
    const data = await page.evaluate(async ({ svg, width, height }) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode();
      const c = document.createElement('canvas'); c.width = width; c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      return c.toDataURL('image/webp', .8);
    }, { svg: m.svg, width, height });
    const buf = Buffer.from(data.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, `made-${m.name}.webp`), buf);
    sizes[`made-${m.name}.webp`] = buf.length;
  }
  await browser.close();
})();

/* ---------- the chain: walks along the foot of the page ---------- */
{
  const m = compose([{ pre: pre('Long chain', 'warli'), box: { x: 0, y: 0, w: 2400, h: 200 } }], [C.bone, C.sindoor, C.bone, C.bone, C.night]);
  W('chain.svg', 2400, 200, m.body, { defs: m.defs });
}

/* ---------- the tradition index ---------- */
const two = n => String(n).padStart(2, '0');
const rows = trads.map((t, i) => `        <li class="rb" style="--tg:${t.ground};--tf:${t.ink};--ta:${t.accent}" data-k="${t.k}" data-label="${esc(t.label)}">
          <button class="rb-head" type="button" aria-expanded="${i === 0}" aria-controls="rb-${t.k}">
            <span class="rb-no">${two(i + 1)}</span>
            <span class="rb-name">${esc(t.name)}</span>
            <span class="rb-where">${esc(t.where)}</span>
          </button>
          <div class="rb-body" id="rb-${t.k}">
            <p class="rb-rule">${esc(t.rule)}</p>
            <p class="rb-meta">${t.motifs} motifs · ${t.palettes} palettes · ${t.templates} templates</p>
            <div class="rb-art" aria-hidden="true"></div>
          </div>
        </li>`).join('\n');

/* the hero's sequence, as data the page script reads */
const seq = trads.map(t => ({ k: t.k, name: t.name, where: t.where, rule: t.rule, g: t.ground, f: t.ink, a: t.accent, label: t.label }));

/* ---------- write the index, the sequence and the counts into the page ---------- */
const counts = {
  traditions: keys.length,
  motifs: S.PRESETS.filter(p => keys.includes(p.style)).length,
  templates: S.TEMPLATES.filter(t => (t.items || []).length).length,
  palettes: keys.reduce((a, k) => a + S.stylePalettes(k).length, 0),
};
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
let page = fs.readFileSync(PAGE, 'utf8');
page = page.replace(/(<!-- build:traditions -->)[\s\S]*?(\s*<!-- \/build:traditions -->)/, `$1\n${rows}$2`);
page = page.replace(/(<script type="application\/json" id="seq">)[\s\S]*?(<\/script>)/, `$1${JSON.stringify(seq).replace(/</g, '\\u003c')}$2`);
page = page.replace(/(<([a-z]+)[^>]*\bdata-count="([\w-]+)"[^>]*>)[^<]*(<\/\2>)/g, (all, open, tag, key, close) => {
  if (key === 'traditions-word') return open + WORDS[counts.traditions] + close;
  return counts[key] != null ? open + counts[key].toLocaleString('en-US') + close : all;
});
fs.writeFileSync(PAGE, page);

madeDone.then(() => {
const kb = n => (n / 1024).toFixed(1) + ' KB';
console.log('traditions:', keys.join(', '));
console.log('counts:', JSON.stringify(counts));
Object.keys(sizes).forEach(k => console.log(k.padEnd(22), kb(sizes[k])));
console.log('total'.padEnd(22), kb(Object.values(sizes).reduce((a, b) => a + b, 0)));
});
