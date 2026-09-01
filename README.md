# Motifs

**Pattern from a rule.**

A drawing machine for folk art traditions. Every mark is generated from a
number, so nothing in here is a stock asset — change the number and you get a
hand that has never drawn before. Same seed, same drawing, forever.

Open `index.html`. No build step, no dependencies, no server required (a static
server is nicer — Google Fonts load over the network).

---

## Traditions, not folders of clipart

The thing this project is actually about: **an art tradition is a set of rules,
not a set of shapes.** Warli and Gond draw many of the same subjects — a deer, a
tree, a person, a border — and look nothing alike, because the rules underneath
are opposite.

| | **Warli** | **Gond** | **Sketchbook** |
|---|---|---|---|
| Where | Maharashtra | Madhya Pradesh | the original library |
| Ground | red-ochre earth wall | paper, or a saturated colour | white |
| Mark | solid white silhouette | clean outline + a signature fill | pen drawn twice |
| A person is | two triangles meeting at their tips | a flowing tube with joints | whatever you like |
| Wobble | almost none — it is painted with confidence | a little, brush on paper | plenty |
| Pieces | 139 | 133 | 524 |

Switching tradition in the Library dropdown swaps the whole discipline at once:
its palettes, its ground, its texture, how the brush behaves, and which pieces
are on offer. It is not a filter over one shared library.

Each pack is one file of generators, one of presets, one of templates, plus a
row in `styles.js`. Adding a fourth is the same four pieces — see
[Adding a tradition](#adding-a-tradition).

---

## Why it works this way

The hand-drawn feeling isn't a style you can copy from a PNG. It's **controlled
imperfection**: a straight line that bows slightly, a circle whose pen overshoots
the join, a shape drawn twice with a small offset — or, for a tradition that
paints with confidence, almost no imperfection at all and a rule about fill
instead.

Clean geometry goes in, a seeded PRNG corrupts it, SVG comes out. Vector the
whole way — prints, cuts on a vinyl cutter, scales to a billboard, stays a few
kilobytes.

---

## The files

| File | What lives there |
|---|---|
| `engine.js` | `Hand` — the pen. Seeded RNG plus `line / curve / ellipse / rect / shape / dot`, the fill engine, and `fitDraw / stamp / ring / arcPts`. |
| `icons.js` | The interface icon set. 24px, stroke, `currentColor`. |
| `styles.js` | The traditions: palettes, brush behaviour, ground, texture, categories. |
| `gens.js` `gens2.js` `gens3.js` `gens4.js` | 118 sketchbook generators: marks, shapes, frames, nature, objects, characters, icons, ornament, patterns. |
| `presets*.js` | 524 named sketchbook library entries — a generator locked to chosen params. |
| `templates.js` `templates2.js` | 28 designed sketchbook documents, including 8 logo lockups. |
| `warli.js` | 23 Warli generators, built on a joint-table figure skeleton. |
| `warli-presets.js` / `warli-templates.js` | 139 Warli pieces · 8 Warli layouts. |
| `gond.js` | 21 Gond generators, built on a swept-tube contour and a signature-fill system. |
| `gond-presets.js` / `gond-templates.js` | 133 Gond pieces · 8 Gond layouts. |
| `data.js` | 40 general palettes, 18 canvas sizes, 32 typefaces, 9 textures, `Surprise` recipes. |
| `app.js` | The editor. |
| `index.html` | Shell and styling. |

**162 generators · 796 library pieces · 44 templates · 3 traditions.**

---

## Using it

**Files** is the home screen — your saved work and the template gallery, with
live previews. Everything autosaves.

**Library** (left) opens on a tradition. Pick one from the dropdown at the top;
the categories, the palette and the ground all change with it. Search it. Click
to place. Right-click any tile for 60 live variants of the same generator.

**Properties** (right) is grouped and collapsible — position, content, colour,
and *The hand*, which is where roughness, bend, stroke count, fill style and
marker bleed live. Your open/closed choices are remembered.

**Draw your own** with the pen tool (`P`): click points, click the first point
to close.

**Double-click any shape to edit its points.** Handles appear on one stroke at
a time — a sketchy drawing is a dozen overlapping paths, so showing every anchor
at once is unusable. Click another part of the shape to switch stroke. A generated
shape is frozen into plain editable paths the first time you do this — the look is
identical, but the shape dials are baked in from then on. Undo puts them back. The
raw SVG source is still available under right-click › Edit SVG code.

**Text** — press `T` and click, or double-click any text on the canvas to edit
it in place. A text box always hugs its own letters, so the selection matches
what you see; drag a handle to scale the type, or set the size directly.

**Artboards.** One file holds several boards at different sizes — design a logo
once and see it on a card, a sign and a sticker. Add them from the Artboards
panel; click a board's paper to make it active. Export crops to the active board.

**Brand kit.** Save the current palette and typefaces as your brand, lock it,
and every new file and every Surprise inherits it instead of picking at random.

**Groups** `Ctrl G` · **Repeat** `Ctrl R` — radial, grid or along a line, as
real copies you can still edit. **Align** works between selected objects when
two or more are picked, and to the board when one is. **Distribute** needs three.

**Text on a path** — switch any text to *Curve onto an arc* for badges and seals;
sweep and top/bottom reading are adjustable.

**Print** — Export › Print gives bleed, crop marks, and PDF/PNG/SVG at 150–600 dpi.

**Snapping** is on by default: drag something near another object's edge or
centre and it sticks, with red guides. Hold `Ctrl`/`⌘` while dragging to ignore it.

**Export** is one button. It asks what you want — PNG at 1×/2×/4×, SVG, or the
project file.

---

## Adding a generator

A generator draws into a **0–100 box, y down**. Its `params` become the controls
in the Properties panel automatically.

```js
def('sunface', 'Nature', 'Sun face', [
  N('rays', 'Rays', 0, 30, 12),        // number  → slider
  O('mood', 'Mood', ['calm','cross']), // option  → dropdown
  B('halo', 'Halo', true),             // boolean → switch
], (h, p) => {
  h.shape(h.ring(50, 50, 26, 26, 14), { closed: true });
  for (let i = 0; i < p.rays; i++) {
    const t = (i / p.rays) * Math.PI * 2;
    h.line(50 + Math.cos(t) * 30, 50 + Math.sin(t) * 30,
           50 + Math.cos(t) * 46, 50 + Math.sin(t) * 46);
  }
  if (p.halo) h.ellipse(50, 50, 48, 48, { role: 'accent' });
});
```

Then give it named presets so it appears in the library:

```js
P('sunface', 'Calm sun',  { rays: 12, mood: 0 }, 'weather sky');
P('sunface', 'Cross sun', { rays: 24, mood: 1, halo: 0 }, 'weather');
```

**Roles, not colours.** Draw with `role: 'line'` (default), `'accent'` or
`'fill'`; fill with `fill: 'fill' | 'accent' | 'line'`. The app maps those to the
document palette, so every piece recolours itself when the palette changes.
`fill: 'fill'` resolves to the *paper* slot by default — use it for a hole, and
`'line'` for a solid dark mark.

**Use `h.shape()` for anything fillable.** It respects the user's fill style
(none / solid / hatch / cross / scribble / dots). `h.curve()` only outlines.

**Aspect.** Square-ish subjects get fitted into a square. Things meant to stretch
(frames, rules, patterns, bands) set `aspect = 'free'`, and are then handed their
real width-over-height as `p._ar` so they can compensate. A free piece can also
declare `place = { w, h }` — the fraction of the board it wants to arrive at when
clicked out of the library, so a border is born long instead of square.

**Clamp your index lookups.** If you sample a polyline with
`pts[Math.round(u * N)]`, clamp it — the variants browser feeds generators
out-of-range values on purpose.

**Never step a loop by a raw parameter.** `for (t = 0; t < 100; t += p.gap)`
hangs forever the moment `gap` reaches zero, and a saved file can carry any
number at all. `Math.max(1, p.gap)`.

**Watch the mark count.** A generator that emits many small marks should budget
them and read `h.detail` (see below), or a library page of it will stall.

---

## Adding a tradition

Four pieces. Working from `gond.js` is the shortest path, because it is the one
that had to invent a fill discipline from scratch.

**1. `mystyle.js` — the generators.** Same `def()` as above, but stamp the style
and give the pack its own key prefix:

```js
function def(key, cat, label, params, draw) {
  G[key] = { key, cat, label, params, draw, style: 'mystyle', aspect: 'square' };
}
```

Find the pack's *one mechanism* and build everything on it. Warli's is a joint
table: every pose is a list of joint positions in figure units, so a figure can
lean, scale, squeeze into a wide band or sit on a ring and still be the same
person. Gond's is a swept tube: a deer, a branch, an arm and a snake are all a
spine of `[x, y, radius]` pushed through one contour builder, so a body always
closes cleanly and a fill always has somewhere to live. Without that, a pack
becomes forty unrelated drawing functions and nothing in it looks related.

**2. `mystyle-presets.js` — the library.** Same `P()` as above, then the tail
that registers them:

```js
const start = PRESETS.length;
NEW.forEach((e, i) => {
  const g = GENS[e.gen], full = {};
  g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
  e.params = full; e.cat = g.cat; e.style = g.style; e.id = 'm' + (start + i);
  e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
  PRESETS.push(e);
});
```

Preset names only have to be unique *within* a tradition — Warli and Gond both
have a `Dot border`, and templates look up within their own style first.

**3. `mystyle-templates.js` — the layouts.** As below, with `o.style` stamped on
each one.

**4. A row in `styles.js`:**

```js
mystyle: {
  key: 'mystyle', name: 'My style', where: 'somewhere',
  note: 'One sentence a user reads at the top of the library.',
  palettes: [['Name', ground, pigment, accent, alt, alt2], …],  // or null for the general list
  hand: { rough: 0.45, bow: 0.5, passes: 1, weight: 2.2, fillMode: 'none' },
  canvas: ['Post 4:5', 1080, 1350],
  texture: 'grain', textureAmt: 0.12,
  cats: ['Figures', 'Animals', 'Borders'],
},
```

Then add the three `<script>` tags to `index.html` — generators and presets
**before** `styles.js`, templates **after** `templates2.js`.

---

## Adding a template

Coordinates are percentages of the canvas. `p` places a library preset by name,
`t` places text. A template's own `w`/`h` are honoured exactly — a free piece's
`place` hint does not override them.

```js
add({
  name: 'Flyer', desc: 'One image, one line', w: 794, h: 1123, pal: 3,
  texture: 'grain', amt: 0.1,
  items: [
    { p: 'Rocket', x: 30, y: 12, w: 40, h: 40 },
    { t: 'LIFT OFF', x: 8, y: 60, w: 84, h: 16, font: 'Anton', caps: 1 },
    { p: 'Dot divider', x: 40, y: 82, w: 20, h: 3, c: 1 },
  ]
});
```

Style shorthands on any item: `c` stroke, `a` accent, `f` fill (palette slots
0 ink, 1 accent, 2 alt, 3 alt2, 4 paper), `fill` fill style, `op` opacity,
`rot` rotation.

`pal` indexes the *tradition's* palette list, not the general one.

## Adding a palette

`data.js`, one row: `['Name', paper, ink, accent, alt, alt2]`. A tradition's own
palettes go in its `styles.js` row instead, same shape.

---

## Notes on the engine

Six details matter more than they look:

- **Jitter is clamped to the feature size.** A pattern of 3-unit dots scaled to
  a 1080px poster would otherwise wobble by 30 pixels and turn to mush.
- **Sharp corners have a fillable twin.** `_sharpD` emits one `M` per edge —
  right for a drawn outline, useless as a fill or clip. `_sharpContD` emits the
  same path as one continuous subpath.
- **Contours are smoothed, so repeat a point to sharpen it.** `_curveD` runs
  Catmull-Rom through the points, which turns a four-point diamond into a
  circle and a forked tail into a paddle. Pushing the same point twice pulls the
  curve tight against it. Gond's diamonds, stars and fish tails all rely on this.
- **Every render namespaces its defs.** Template previews and the live canvas
  are all in one document; without unique ids, `url(#tex)` resolves to whichever
  came first.
- **Letter spacing is stored as a % of the em**, so text auto-fit converges in
  one pass instead of oscillating.
- **`h.detail` is how big this drawing is about to be.** 1 on the canvas, 0.3
  for a library thumbnail. A generator that emits repeating small marks scales
  its budget by it: a thousand-dot fill at 64 pixels is a grey smudge that costs
  a thousand paths. Everything else can ignore it.

Text stays real `<text>`, not outlines, so it remains editable. Export inlines
the webfont as base64 so the SVG renders anywhere.

---

## Files and storage

Documents live in `localStorage` under `scrawl.files.v2` and save automatically
(debounced). Browser storage is a few megabytes — use **Export › Project file**
for anything you care about. Imported SVGs over ~600KB are refused rather than
silently blowing the quota.

---

## Keyboard

`V` select · `H` pan · `T` text · `P` pen · `B` pencil · double-click to edit points
`Space`+drag pan · scroll zoom · `0` fit · right-click for the context menu
`Ctrl+Z` / `Ctrl+Shift+Z` · `Ctrl+D` duplicate · `Ctrl+A` all · `Ctrl+E` export
`Ctrl+G` group · `Ctrl+Shift+G` ungroup · `Ctrl+R` repeat · `Ctrl+Shift+C` copy as SVG
`Delete` · `R` reroll the hand · `[` `]` layer order · arrows nudge
`Alt`+drag duplicate · `Shift`+resize keeps proportions · `Ctrl`+drag ignores snapping

---

## Putting it online

It's static. Drop the folder on Netlify, Vercel, GitHub Pages, or any host.
Nothing runs server-side and nothing leaves the browser.
