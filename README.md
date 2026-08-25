# Scrawl

**Draw with a seed.**

A drawing machine. Every mark is generated from a number, so nothing in here is
a stock asset — change the number and you get a hand that has never drawn
before. Same seed, same drawing, forever.

Open `index.html`. No build step, no dependencies, no server required (a static
server is nicer — Google Fonts load over the network).

---

## Why it works this way

The hand-drawn feeling isn't a style you can copy from a PNG. It's **controlled
imperfection**: a straight line that bows slightly, a circle whose pen overshoots
the join, a shape drawn twice with a small offset. Cheap to compute, impossible
to repeat by hand.

Clean geometry goes in, a seeded PRNG corrupts it, SVG comes out. Vector the
whole way — prints, cuts on a vinyl cutter, scales to a billboard, stays a few
kilobytes.

---

## The files

| File | What lives there |
|---|---|
| `engine.js` | `Hand` — the pen. Seeded RNG plus `line / curve / ellipse / rect / shape / hatch`. |
| `icons.js` | The interface icon set. 24px, stroke, `currentColor`. |
| `gens.js` | 54 parametric generators: marks, shapes, frames, nature, objects, characters, patterns. |
| `gens2.js` | 25 more for layout work: icons, ornaments, dividers, containers, badges. |
| `gens3.js` | 24 more: plants, insects, landscape, and everyday objects. |
| `presets.js` / `presets2.js` | 467 named library entries — a generator locked to chosen params. |
| `templates.js` | 13 designed starting documents. |
| `data.js` | 40 palettes, 18 canvas sizes, 32 typefaces, textures, `Surprise` recipes. |
| `app.js` | The editor. |
| `index.html` | Shell and styling. |

---

## Using it

**Files** is the home screen — your saved work and the template gallery, with
live previews. Everything autosaves.

**Library** (left) holds 467 pieces across nine categories. Search it. Click to
place. Right-click any tile for 60 live variants of the same generator.

**Properties** (right) is grouped and collapsible — position, content, colour,
and *The hand*, which is where roughness, bend, stroke count, fill style and
marker bleed live. Your open/closed choices are remembered.

**Draw your own** with the pen tool (`P`): click points, click the first point
to close. It becomes a normal layer with the full hand treatment. Or paste SVG
code straight in (right-click the canvas) and place any vector you already have.

**Text** — press `T` and click, or double-click any text on the canvas to edit
it in place.

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

**Roles, not colours.** Draw with `role: 'line'` (default) or `role: 'accent'`;
fill with `fill: 'fill' | 'accent' | 'line'`. The app maps those to the document
palette, so every piece recolours itself when the palette changes.

**Use `h.shape()` for anything fillable.** It respects the user's fill style
(none / solid / hatch / cross / scribble / dots). `h.curve()` only outlines.

**Aspect.** Square-ish subjects get fitted into a square. Things meant to stretch
(frames, rules, patterns) belong in the `FREE` sets in `gens.js` / `gens2.js`.

**Clamp your index lookups.** If you sample a polyline with
`pts[Math.round(u * N)]`, clamp it — the variants browser feeds generators
out-of-range values on purpose.

---

## Adding a template

Coordinates are percentages of the canvas. `p` places a library preset by name,
`t` places text.

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

## Adding a palette

`data.js`, one row: `['Name', paper, ink, accent, alt, alt2]`.

---

## Notes on the engine

Four details matter more than they look:

- **Jitter is clamped to the feature size.** A pattern of 3-unit dots scaled to
  a 1080px poster would otherwise wobble by 30 pixels and turn to mush.
- **Sharp corners have a fillable twin.** `_sharpD` emits one `M` per edge —
  right for a drawn outline, useless as a fill or clip. `_sharpContD` emits the
  same path as one continuous subpath.
- **Every render namespaces its defs.** Template previews and the live canvas
  are all in one document; without unique ids, `url(#tex)` resolves to whichever
  came first.
- **Letter spacing is stored as a % of the em**, so text auto-fit converges in
  one pass instead of oscillating.

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

`V` select · `H` pan · `T` text · `P` pen · double-click to edit text
`Space`+drag pan · scroll zoom · `0` fit · right-click for the context menu
`Ctrl+Z` / `Ctrl+Shift+Z` · `Ctrl+D` duplicate · `Ctrl+A` all · `Ctrl+E` export
`Delete` · `R` reroll the hand · `[` `]` layer order · arrows nudge
`Alt`+drag duplicate · `Shift`+resize keeps proportions · `Ctrl`+drag ignores snapping

---

## Putting it online

It's static. Drop the folder on Netlify, Vercel, GitHub Pages, or any host.
Nothing runs server-side and nothing leaves the browser.
"# scrawl" 
"# scrawl" 
