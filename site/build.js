#!/usr/bin/env node
/* ============================================================
   SCRAWL / site / build — draw the website's pictures once
   ------------------------------------------------------------
   The website doesn't run the drawing engine to show its
   pictures: that would make every visitor, on every old laptop,
   parse half a megabyte of generators before seeing a peacock.
   Instead this script runs the editor's own generators here, in
   Node, and writes plain SVG files into site/art/. It also fills
   the tradition cards and the library counts in site/index.html.

   Run it after adding or changing a tradition:
       node site/build.js

   Only the "Have a go" demo loads the real engine, and only when
   a visitor scrolls near it.
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
const C = { paper: '#FBF6EE', sand: '#F3E8D8', ink: '#22160F', geru: '#A63D1E', turmeric: '#F2B233' };

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
const sizes = {};
const W = (name, ...a) => { sizes[name] = file(name, ...a); };

/* ---------- the hero: a tarpa dance on a red-earth wall ---------- */
{
  const onEarth = [C.paper, C.turmeric, C.paper, C.paper, C.geru];
  const ring = compose([{ pre: pre('Tarpa dance', 'warli'), box: { x: 0, y: 0, w: 800, h: 800 }, o: { weight: 4.2 } }], onEarth);
  W('ring.svg', 800, 800, ring.body, { defs: ring.defs, label: 'A Warli tarpa dance: figures holding hands in a ring around a musician playing the tarpa' });
  const ground = compose([{ pre: pre('Triangle border', 'warli'), box: { x: 0, y: 0, w: 2400, h: 70 } }], onEarth);
  W('ground.svg', 2400, 70, ground.body, { defs: ground.defs });
}

/* ---------- the crew: Scrawl's Warli mascots, for the makers' note ---------- */
{
  const poses = ['Waving', 'Drummer', 'Dancing', 'Water carrier', 'Tarpa player', 'Leaping', 'Dancer with knot', 'Archer', 'Pointing'];
  const w = 1800, step = w / poses.length, h = step;
  const items = poses.map((n, i) => ({ pre: pre(n, 'warli'), box: { x: i * step + 4, y: 4, w: step - 8, h: step - 8 } }));
  const m = compose(items, [C.ink, C.geru, C.ink, C.ink, C.paper]);
  W('crew.svg', w, h, m.body, { defs: m.defs, label: 'Nine Warli figures in a row: waving, drumming, dancing, carrying water, playing the tarpa, leaping, dancing, drawing a bow and pointing' });
}

/* ---------- the chain: footer band ---------- */
{
  const m = compose([{ pre: pre('Long chain', 'warli'), box: { x: 0, y: 0, w: 2400, h: 200 } }], [C.paper, C.turmeric, C.paper, C.paper, C.ink]);
  W('chain.svg', 2400, 200, m.body, { defs: m.defs });
}

/* ---------- small figures for the three steps ---------- */
[['step-pick.svg', 'Pointing', 'A Warli figure pointing'], ['step-make.svg', 'Working', 'A Warli figure at work'], ['step-take.svg', 'Walking with a pot', 'A Warli figure walking off with a pot']].forEach(([f, n, label]) => {
  const m = compose([{ pre: pre(n, 'warli'), box: { x: 0, y: 0, w: 400, h: 400 }, o: { weight: 3.4 } }], [C.ink, C.geru, C.ink, C.ink, C.sand]);
  W(f, 400, 400, m.body, { defs: m.defs, label });
});

/* ---------- one card per tradition: its peacock, on its own ground ---------- */
const keys = R.styleKeys();
const cards = keys.map(k => {
  const st = S.STYLES[k], t = TRAD[k] || {};
  const pal = palOf(k, t.pal);
  const p = (t.peacock && R.findPreset(t.peacock, k)) ||
    R.presetsOf(k).find(p => isSquare(p) && /peacock|bird/i.test(p.name)) || R.presetsOf(k).find(isSquare);
  const m = R.pieceMarkup(p, { x: 40, y: 40, w: 520, h: 520 }, { colors: pal.colors, detail: .8 });
  const label = `${p.name}, drawn by Scrawl in the ${st.name} style`;
  W(`trad-${k}.svg`, 600, 600, m.body, { defs: m.defs, ground: pal.paper, label });
  const rule = t.rule || String(st.note || '').split(/(?<=\.)\s/)[0];
  const n = R.presetsOf(k).length, np = S.stylePalettes(k).length;
  const nt = S.TEMPLATES.filter(x => (x.style || 'sketch') === k && (x.items || []).length).length;
  return `      <li class="trad" style="--tg:${pal.paper};--tf:${pal.colors[0]}">
        <img src="art/trad-${k}.svg" alt="${esc(label)}" width="600" height="600" loading="lazy" decoding="async">
        <div class="trad-body">
          <p class="trad-where">${esc(st.where || t.medium || '')}</p>
          <h3>${esc(st.name)}</h3>
          <p class="trad-rule">${esc(rule)}</p>
          <p class="trad-meta">${n} motifs · ${np} palettes · ${nt} templates</p>
          <a class="trad-try" href="#try" data-trad="${k}">Try ${esc(st.name)}<span class="visually-hidden"> in the demo</span> <span aria-hidden="true">→</span></a>
        </div>
      </li>`;
}).join('\n');

/* ---------- write cards and counts into the page ---------- */
const counts = {
  traditions: keys.length,
  motifs: S.PRESETS.filter(p => keys.includes(p.style)).length,
  templates: S.TEMPLATES.filter(t => (t.items || []).length).length,
  palettes: keys.reduce((a, k) => a + S.stylePalettes(k).length, 0),
};
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
let page = fs.readFileSync(PAGE, 'utf8');
page = page.replace(/(<!-- build:traditions -->)[\s\S]*?(\s*<!-- \/build:traditions -->)/, `$1\n${cards}$2`);
page = page.replace(/(<([a-z]+)[^>]*\bdata-count="(\w+)"[^>]*>)[^<]*(<\/\2>)/g, (all, open, tag, key, close) => {
  if (key === 'traditions-word') return open + WORDS[counts.traditions] + close;
  return counts[key] != null ? open + counts[key].toLocaleString('en-US') + close : all;
});
fs.writeFileSync(PAGE, page);

const kb = n => (n / 1024).toFixed(1) + ' KB';
console.log('traditions:', keys.join(', '));
console.log('counts:', JSON.stringify(counts));
Object.keys(sizes).forEach(k => console.log(k.padEnd(20), kb(sizes[k])));
console.log('total'.padEnd(20), kb(Object.values(sizes).reduce((a, b) => a + b, 0)));
