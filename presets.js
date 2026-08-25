/* ============================================================
   SCRAWL / presets — the browsable library
   Each entry is a generator locked to chosen params and given a name.
   Params are partial; the generator's defaults fill the rest.
   ============================================================ */
(function () {
  const { GENS, hashStr, ICON_KINDS } = window.SCRAWL;
  const LIB = [];

  /* P(gen, name, params, tags) */
  function P(gen, name, params, tags) {
    if (!GENS[gen]) { console.warn('preset for missing gen', gen); return; }
    LIB.push({ gen, name, params: params || {}, tags: tags || '', seed: hashStr(gen + '|' + name) % 99999 });
  }

  /* ---------------------------------------------------------
     MARKS
     --------------------------------------------------------- */
  P('scribble', 'Loose scribble', { lines: 6, spread: 55, angle: 20 }, 'sketch');
  P('scribble', 'Tight scribble', { lines: 14, spread: 40, angle: 90 }, 'sketch dense');
  P('scribble', 'Single sweep', { lines: 2, spread: 80, angle: 10 }, 'stroke');
  P('scribble', 'Wide swipe', { lines: 4, spread: 92, angle: 0 }, 'stroke');
  P('scribble', 'Scratch out', { lines: 10, spread: 70, angle: 45 }, 'delete cross');

  P('zigzag', 'Zigzag', { teeth: 8, amp: 18 }, 'line');
  P('zigzag', 'Fine zigzag', { teeth: 22, amp: 10 }, 'line');
  P('zigzag', 'Big teeth', { teeth: 4, amp: 40 }, 'line');
  P('zigzag', 'Zigzag block', { teeth: 10, amp: 14, rows: 5 }, 'pattern');

  P('wave', 'Wave line', { waves: 3, amp: 14 }, 'line');
  P('wave', 'Ripple', { waves: 8, amp: 8 }, 'line water');
  P('wave', 'Long swell', { waves: 1, amp: 34 }, 'line');
  P('wave', 'Wave stack', { waves: 3, amp: 12, rows: 6 }, 'pattern water');
  P('wave', 'Squiggle rows', { waves: 6, amp: 16, rows: 3 }, 'pattern');

  P('spiral', 'Spiral', { turns: 4, open: 45 }, 'swirl');
  P('spiral', 'Tight coil', { turns: 9, open: 46 }, 'swirl');
  P('spiral', 'Loose curl', { turns: 2, open: 44 }, 'swirl');
  P('spiral', 'Flat spiral', { turns: 5, squish: 35, open: 46 }, 'swirl');

  P('burst', 'Burst', { rays: 12, inner: 12 }, 'star pop');
  P('burst', 'Dense burst', { rays: 34, inner: 8, vary: 10 }, 'star pop');
  P('burst', 'Ragged burst', { rays: 14, inner: 20, vary: 50 }, 'star pop');
  P('burst', 'Halo', { rays: 24, inner: 52, vary: 6 }, 'ring');
  P('burst', 'Four spark', { rays: 4, inner: 6, vary: 0 }, 'sparkle');

  P('asterisk', 'Asterisk', { arms: 3, len: 70 }, 'star');
  P('asterisk', 'Plus', { arms: 2, rot: 90, len: 74 }, 'cross');
  P('asterisk', 'Six arm', { arms: 6, len: 80 }, 'star snow');
  P('asterisk', 'Fine star', { arms: 8, len: 60 }, 'star');

  P('dotfield', 'Dot spray', { count: 40, size: 1.8 }, 'texture');
  P('dotfield', 'Fine spray', { count: 200, size: 0.8 }, 'texture noise');
  P('dotfield', 'Big dots', { count: 14, size: 5 }, 'texture');
  P('dotfield', 'Tight cluster', { count: 60, size: 1.6, spread: 40 }, 'texture');
  P('dotfield', 'Scattered few', { count: 8, size: 3 }, 'texture');

  P('underline', 'Underline', { lines: 2, sweep: 22 }, 'rule emphasis');
  P('underline', 'Single rule', { lines: 1, sweep: 10 }, 'rule');
  P('underline', 'Triple rule', { lines: 3, sweep: 30, gap: 7 }, 'rule');
  P('underline', 'Swoosh', { lines: 1, sweep: 90 }, 'rule');
  P('underline', 'Emphasis stack', { lines: 5, sweep: 40, gap: 5 }, 'rule');

  P('tick', 'Check', { kind: 0 }, 'yes done');
  P('tick', 'Cross', { kind: 1 }, 'no close');
  P('tick', 'Plus', { kind: 2 }, 'add');
  P('tick', 'Minus', { kind: 3 }, 'remove');
  P('tick', 'Question', { kind: 4 }, 'help');
  P('tick', 'Exclamation', { kind: 5 }, 'alert');
  P('tick', 'Arrow up', { kind: 6 }, 'direction');
  P('tick', 'Small heart', { kind: 7 }, 'love');

  /* ---------------------------------------------------------
     SHAPES
     --------------------------------------------------------- */
  const POLY = ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Heptagon', 'Octagon', 'Nonagon', 'Decagon', 'Hendecagon', 'Dodecagon'];
  POLY.forEach((n, i) => P('polygon', n, { sides: i + 3, rot: 270 }, 'geometry'));
  P('polygon', 'Soft triangle', { sides: 3, round: 1 }, 'geometry');
  P('polygon', 'Soft hexagon', { sides: 6, round: 1 }, 'geometry');
  P('polygon', 'Soft octagon', { sides: 8, round: 1 }, 'geometry');
  P('polygon', 'Diamond', { sides: 4, rot: 0 }, 'geometry');

  P('star', 'Five point star', { points: 5, inner: 40 }, 'star');
  P('star', 'Six point star', { points: 6, inner: 50 }, 'star');
  P('star', 'Eight point star', { points: 8, inner: 55 }, 'star');
  P('star', 'Twelve point', { points: 12, inner: 68 }, 'star');
  P('star', 'Sharp star', { points: 5, inner: 20 }, 'star');
  P('star', 'Chunky star', { points: 5, inner: 62 }, 'star');
  P('star', 'Spiky sun', { points: 16, inner: 72 }, 'star sun');
  P('star', 'Four point', { points: 4, inner: 26 }, 'star sparkle');

  P('blob', 'Blob', { lumps: 7, wob: 22 }, 'organic');
  P('blob', 'Smooth blob', { lumps: 5, wob: 8 }, 'organic');
  P('blob', 'Lumpy blob', { lumps: 12, wob: 45 }, 'organic');
  P('blob', 'Pebble', { lumps: 6, wob: 14, squish: 62 }, 'organic');
  P('blob', 'Wide blob', { lumps: 8, wob: 26, squish: 45 }, 'organic');
  P('blob', 'Puddle', { lumps: 14, wob: 34, squish: 35 }, 'organic');

  P('rings', 'Circle', { count: 1 }, 'geometry');
  P('rings', 'Double ring', { count: 2, gap: 6 }, 'geometry');
  P('rings', 'Target', { count: 5, gap: 9 }, 'geometry');
  P('rings', 'Oval', { count: 1, squish: 55 }, 'geometry');
  P('rings', 'Ripple rings', { count: 8, gap: 5 }, 'geometry water');

  P('rectsh', 'Rectangle', { inset: 4 }, 'geometry');
  P('rectsh', 'Inset box', { inset: 16 }, 'geometry');
  P('rectsh', 'Nested boxes', { inset: 4, extra: 3 }, 'geometry');
  P('rectsh', 'Thin frame', { inset: 2, extra: 1 }, 'geometry');

  P('arcband', 'Arc', { start: 180, sweep: 180 }, 'curve');
  P('arcband', 'Quarter arc', { start: 180, sweep: 90 }, 'curve');
  P('arcband', 'Thick arc', { start: 180, sweep: 180, thick: 20 }, 'curve');
  P('arcband', 'Half moon', { start: 90, sweep: 180, thick: 34 }, 'curve');
  P('arcband', 'Rainbow', { start: 180, sweep: 180, thick: 30 }, 'curve');

  P('grid', 'Grid', { cols: 4, rows: 4 }, 'layout');
  P('grid', 'Fine grid', { cols: 10, rows: 10 }, 'layout');
  P('grid', 'Columns', { cols: 3, rows: 1 }, 'layout');
  P('grid', 'Rows', { cols: 1, rows: 6 }, 'layout');

  P('stripes', 'Stripes', { count: 8, angle: 90 }, 'pattern');
  P('stripes', 'Fine stripes', { count: 24, angle: 90 }, 'pattern');
  P('stripes', 'Diagonal stripes', { count: 12, angle: 45 }, 'pattern');
  P('stripes', 'Tapered stripes', { count: 10, angle: 90, taper: 80 }, 'pattern');
  P('stripes', 'Horizon lines', { count: 7, angle: 0 }, 'pattern');

  P('ribbon', 'Ribbon', { waves: 2, width: 16 }, 'banner');
  P('ribbon', 'Wide ribbon', { waves: 1, width: 34 }, 'banner');
  P('ribbon', 'Streamer', { waves: 4, width: 10, taper: 70 }, 'banner');
  P('ribbon', 'Flat band', { waves: 1, width: 24, taper: 0 }, 'banner');

  /* ---------------------------------------------------------
     FRAMES & UI
     --------------------------------------------------------- */
  ['Plain frame', 'Double frame', 'Ticked frame', 'Dashed frame', 'Scalloped frame', 'Corner marks', 'Rope frame']
    .forEach((n, i) => P('frame', n, { style: i, inset: 5 }, 'border'));
  P('frame', 'Tight double', { style: 1, inset: 12 }, 'border');
  P('frame', 'Wide corners', { style: 5, inset: 10 }, 'border');

  P('bubble', 'Speech bubble', { kind: 0 }, 'chat');
  P('bubble', 'Boxy bubble', { kind: 1 }, 'chat');
  P('bubble', 'Shout bubble', { kind: 2 }, 'chat comic');
  P('bubble', 'Thought bubble', { kind: 3 }, 'chat');
  P('bubble', 'Cloud bubble', { kind: 4 }, 'chat');
  P('bubble', 'Right tail', { kind: 0, tail: 78 }, 'chat');

  P('banner', 'Banner', { folds: 12, height: 34 }, 'ribbon title');
  P('banner', 'Flat banner', { folds: 0, height: 26, notch: 0 }, 'ribbon title');
  P('banner', 'Deep banner', { folds: 22, height: 50 }, 'ribbon title');
  P('banner', 'Slim banner', { folds: 8, height: 18 }, 'ribbon title');

  P('tag', 'Tag left', { dir: 0 }, 'label');
  P('tag', 'Tag right', { dir: 1 }, 'label');
  P('tag', 'Tag up', { dir: 2 }, 'label');
  P('tag', 'Blunt tag', { dir: 0, point: 6, hole: 0 }, 'label');

  P('badge', 'Scalloped badge', { scallops: 16, rings: 1 }, 'seal stamp');
  P('badge', 'Fine badge', { scallops: 34, rings: 0, depth: 3 }, 'seal stamp');
  P('badge', 'Bold badge', { scallops: 10, rings: 2, depth: 9 }, 'seal stamp');
  P('badge', 'Triple ring badge', { scallops: 20, rings: 3, depth: 4 }, 'seal stamp');

  P('arrow', 'Curved arrow', { bend: 20, head: 0 }, 'direction pointer');
  P('arrow', 'Straight arrow', { bend: 0, head: 0 }, 'direction pointer');
  P('arrow', 'Solid head arrow', { bend: 14, head: 1 }, 'direction pointer');
  P('arrow', 'Thin arrow', { bend: 30, head: 2 }, 'direction pointer');
  P('arrow', 'Dot arrow', { bend: 24, head: 3 }, 'direction pointer');
  P('arrow', 'Double arrow', { bend: 0, head: 0, heads: 2 }, 'direction');
  P('arrow', 'Big loop', { bend: 58, head: 0 }, 'direction');
  P('arrow', 'Back bend', { bend: -46, head: 1 }, 'direction');

  P('bracket', 'Curly brackets', { kind: 0, side: 2 }, 'grouping');
  P('bracket', 'Square brackets', { kind: 1, side: 2 }, 'grouping');
  P('bracket', 'Round brackets', { kind: 2, side: 2 }, 'grouping');
  P('bracket', 'Single curly', { kind: 0, side: 0 }, 'grouping');

  P('callout', 'Soft box', { kind: 0, r: 12 }, 'container');
  P('callout', 'Sharp box', { kind: 1 }, 'container');
  P('callout', 'Torn box', { kind: 2 }, 'container');
  P('callout', 'Double box', { kind: 3, r: 0 }, 'container');
  P('callout', 'Shadow box', { kind: 0, r: 8, shadow: 1 }, 'container');
  P('callout', 'Pill', { kind: 0, r: 30 }, 'container');

  P('window', 'Arch', { kind: 0 }, 'frame');
  P('window', 'Round window', { kind: 1 }, 'frame');
  P('window', 'Gothic arch', { kind: 2 }, 'frame');
  P('window', 'Panelled window', { kind: 3, panes: 2, sill: 8 }, 'frame');
  P('window', 'Arched window', { kind: 0, panes: 2, sill: 6 }, 'frame');

  P('ticket', 'Ticket', { perf: 66, notch: 6 }, 'stub pass');
  P('ticket', 'Centre tear', { perf: 50, notch: 8 }, 'stub pass');
  P('ticket', 'No notch', { perf: 70, notch: 0 }, 'stub pass');

  P('numbadge', 'Circle badge', { shape: 0, rings: 1 }, 'number label');
  P('numbadge', 'Shield', { shape: 1, rings: 0 }, 'number label');
  P('numbadge', 'Seal', { shape: 2, rings: 1 }, 'number label');
  P('numbadge', 'Square badge', { shape: 3, rings: 1 }, 'number label');
  P('numbadge', 'Award ribbon', { shape: 4, rings: 0 }, 'number label prize');

  P('checklist', 'Checklist', { rows: 4, checked: 2 }, 'list todo');
  P('checklist', 'Long list', { rows: 8, checked: 3 }, 'list todo');
  P('checklist', 'Circle list', { rows: 5, checked: 2, box: 1 }, 'list todo');
  P('checklist', 'Dash list', { rows: 5, checked: 0, box: 2 }, 'list');
  P('checklist', 'Star list', { rows: 4, checked: 4, box: 3 }, 'list');

  P('starrating', 'Three of five', { total: 5, filled: 3 }, 'rating review');
  P('starrating', 'Full marks', { total: 5, filled: 5 }, 'rating review');
  P('starrating', 'Ten scale', { total: 10, filled: 7 }, 'rating review');

  P('pricetag', 'Price tag', { dir: 0 }, 'label sale');
  P('pricetag', 'Right tag', { dir: 1 }, 'label sale');
  P('pricetag', 'Double point', { dir: 2, hole: 0 }, 'label sale');

  P('filmstrip', 'Film strip', { frames: 4 }, 'photo cinema');
  P('filmstrip', 'Tall strip', { frames: 4, dir: 1 }, 'photo cinema');

  P('barcode', 'Bar code', { bars: 26 }, 'retail');
  P('barcode', 'Dense code', { bars: 52, height: 44 }, 'retail');
  P('barcode', 'Short code', { bars: 14, height: 76 }, 'retail');

  /* ---------------------------------------------------------
     NATURE
     --------------------------------------------------------- */
  P('leaf', 'Leaf', { veins: 5, curl: 12 }, 'plant');
  P('leaf', 'Slim leaf', { veins: 7, curl: 26, width: 22 }, 'plant');
  P('leaf', 'Round leaf', { veins: 3, curl: 0, width: 62 }, 'plant');
  P('leaf', 'Plain leaf', { veins: 0, curl: 18 }, 'plant');

  P('sprig', 'Sprig', { leaves: 8, bend: 14 }, 'plant branch');
  P('sprig', 'Tall sprig', { leaves: 14, bend: 4, size: 8 }, 'plant branch');
  P('sprig', 'Curved sprig', { leaves: 6, bend: 34, size: 14 }, 'plant branch');
  P('sprig', 'Bare stem', { leaves: 2, bend: 20, size: 18 }, 'plant branch');

  P('flower', 'Daisy', { petals: 8, shape: 0, center: 16 }, 'plant bloom');
  P('flower', 'Five petal', { petals: 5, shape: 0, center: 14 }, 'plant bloom');
  P('flower', 'Pointed bloom', { petals: 6, shape: 1, center: 12 }, 'plant bloom');
  P('flower', 'Heart petals', { petals: 6, shape: 2, center: 14 }, 'plant bloom');
  P('flower', 'Aster', { petals: 16, shape: 3, center: 20 }, 'plant bloom');
  P('flower', 'Sunflower', { petals: 14, shape: 1, center: 34 }, 'plant bloom');
  P('flower', 'Clover', { petals: 3, shape: 0, center: 8 }, 'plant');
  P('flower', 'Wheel bloom', { petals: 12, shape: 3, center: 6 }, 'plant bloom');

  P('tree', 'Round tree', { kind: 0 }, 'plant nature');
  P('tree', 'Pine', { kind: 1 }, 'plant nature');
  P('tree', 'Palm', { kind: 2 }, 'plant nature');
  P('tree', 'Bare tree', { kind: 3, branches: 4 }, 'plant nature');
  P('tree', 'Topiary', { kind: 4 }, 'plant nature');

  P('mountain', 'Mountains', { peaks: 3, snow: 1 }, 'landscape');
  P('mountain', 'Single peak', { peaks: 1, snow: 1, rough: 4 }, 'landscape');
  P('mountain', 'Range', { peaks: 5, snow: 0, rough: 24 }, 'landscape');
  P('mountain', 'Rolling hills', { peaks: 4, snow: 0, rough: 0 }, 'landscape');

  P('cloud', 'Cloud', { lumps: 4 }, 'weather sky');
  P('cloud', 'Big cloud', { lumps: 3, puff: 110 }, 'weather sky');
  P('cloud', 'Flat cloud', { lumps: 6, puff: 44 }, 'weather sky');
  P('cloud', 'Rain cloud', { lumps: 4, rain: 8 }, 'weather sky');

  P('sun', 'Sun', { rays: 12, inner: 30 }, 'weather sky');
  P('sun', 'Sun with face', { rays: 16, inner: 40, face: 1 }, 'weather sky');
  P('sun', 'Fine rays', { rays: 28, inner: 24 }, 'weather sky');
  P('sun', 'Plain disc', { rays: 0, inner: 58 }, 'weather sky moon');

  P('seawaves', 'Sea', { rows: 4, amp: 6 }, 'water');
  P('seawaves', 'Choppy sea', { rows: 7, amp: 12, density: 8 }, 'water');
  P('seawaves', 'Calm sea', { rows: 2, amp: 3, density: 4 }, 'water');

  P('sparkle', 'Sparkles', { count: 4, points: 4 }, 'shine magic');
  P('sparkle', 'Single sparkle', { count: 1, points: 4 }, 'shine magic');
  P('sparkle', 'Star dust', { count: 12, points: 4, spread: 96 }, 'shine magic');
  P('sparkle', 'Six point sparkles', { count: 5, points: 6 }, 'shine magic');

  /* ---------------------------------------------------------
     OBJECTS
     --------------------------------------------------------- */
  P('cup', 'Espresso cup', { kind: 0, steam: 2 }, 'coffee drink');
  P('cup', 'Mug', { kind: 1, steam: 2, saucer: 0 }, 'coffee drink');
  P('cup', 'Takeaway cup', { kind: 2, steam: 0 }, 'coffee drink');
  P('cup', 'Glass', { kind: 3, steam: 0, saucer: 0 }, 'drink');

  P('bottle', 'Bottle', { neck: 20 }, 'drink');
  P('bottle', 'Long neck', { neck: 36, shoulder: 10 }, 'drink');
  P('bottle', 'Plain bottle', { neck: 14, label: 0 }, 'drink');

  P('book', 'Closed book', { open: 0, pages: 4 }, 'read');
  P('book', 'Open book', { open: 1, pages: 5 }, 'read');
  P('book', 'Leaning book', { open: 0, pages: 3, lean: 14 }, 'read');

  P('bulb', 'Light bulb', { rays: 8 }, 'idea');
  P('bulb', 'Bright idea', { rays: 16 }, 'idea');
  P('bulb', 'Dim bulb', { rays: 0, filament: 1 }, 'idea');

  P('clock', 'Clock', { hour: 10, minute: 10 }, 'time');
  P('clock', 'Midnight', { hour: 0, minute: 0 }, 'time');
  P('clock', 'Plain clock', { numerals: 0, hour: 3, minute: 30 }, 'time');

  P('envelope', 'Envelope', { open: 0 }, 'mail');
  P('envelope', 'Open envelope', { open: 1 }, 'mail');
  P('envelope', 'Sealed letter', { open: 0, seal: 12 }, 'mail');

  P('box3d', 'Box', { depth: 18 }, 'parcel');
  P('box3d', 'Open box', { depth: 16, open: 1 }, 'parcel');
  P('box3d', 'Flat box', { depth: 6, tape: 2 }, 'parcel');

  P('heart', 'Heart', {}, 'love');
  P('heart', 'Wide heart', { width: 96, pinch: 26 }, 'love');
  P('heart', 'Nested hearts', { rings: 3 }, 'love');

  P('plantpot', 'Potted plant', { leaves: 5 }, 'plant');
  P('plantpot', 'Round pot', { leaves: 7, pot: 1, spread: 76 }, 'plant');
  P('plantpot', 'Tall plant', { leaves: 3, pot: 2, spread: 26 }, 'plant');

  /* ---------------------------------------------------------
     CHARACTERS
     --------------------------------------------------------- */
  P('face', 'Delighted', { eyes: 1, mouth: 3, brows: 2, hair: 1 }, 'person emoji');
  P('face', 'Winking', { eyes: 2, mouth: 0, hair: 1 }, 'person emoji');
  P('face', 'Sleepy', { eyes: 3, mouth: 1, brows: 0, hair: 3 }, 'person emoji');
  P('face', 'Starstruck', { eyes: 4, mouth: 2, hair: 2 }, 'person emoji');
  P('face', 'Unimpressed', { eyes: 0, mouth: 1, brows: 3, hair: 7 }, 'person emoji');
  P('face', 'Shades', { extra: 1, mouth: 0, hair: 2 }, 'person cool');
  P('face', 'Moustache', { extra: 4, mouth: 1, hair: 7 }, 'person');
  P('face', 'Top knot', { hair: 5, eyes: 6, mouth: 0 }, 'person');
  P('face', 'Curls', { hair: 4, eyes: 1, mouth: 0 }, 'person');
  P('face', 'Bob cut', { hair: 3, eyes: 0, mouth: 0 }, 'person');
  P('face', 'Cap', { hair: 6, eyes: 0, mouth: 4 }, 'person');
  P('face', 'Freckles', { extra: 2, eyes: 1, mouth: 0, hair: 1 }, 'person');
  P('face', 'Blushing', { extra: 3, eyes: 3, mouth: 0, hair: 3 }, 'person');
  P('face', 'Spiky hair', { hair: 2, eyes: 5, mouth: 2 }, 'person');
  P('face', 'Square jaw', { head: 2, eyes: 0, mouth: 1, brows: 1, hair: 7 }, 'person');
  P('face', 'Long face', { head: 4, eyes: 6, mouth: 5, hair: 3 }, 'person');
  P('face', 'Blob head', { head: 3, eyes: 1, mouth: 3, hair: 1 }, 'person');
  P('face', 'Whistling', { mouth: 6, eyes: 3, brows: 2, hair: 6 }, 'person');
  P('face', 'Cross', { brows: 3, mouth: 5, eyes: 0, hair: 2 }, 'person angry');
  P('face', 'Wavy brows', { brows: 4, eyes: 1, mouth: 4, hair: 4 }, 'person');
  P('face', 'Earrings', { extra: 5, hair: 3, eyes: 1, mouth: 0 }, 'person');
  P('face', 'Side part', { hair: 7, eyes: 0, mouth: 0, brows: 1 }, 'person');
  P('face', 'Wide eyed', { eyes: 5, mouth: 2, brows: 2, hair: 1 }, 'person surprised');
  P('face', 'Big grin', { mouth: 3, eyes: 2, hair: 1, brows: 2 }, 'person');

  P('critter', 'Cat, sitting', { ears: 0, body: 0, tail: 0, face: 0 }, 'animal pet');
  P('critter', 'Cat loaf', { ears: 0, body: 2, tail: 3, face: 3 }, 'animal pet');
  P('critter', 'Cat, standing', { ears: 0, body: 1, tail: 1, face: 0 }, 'animal pet');
  P('critter', 'Dog, sitting', { ears: 1, body: 0, tail: 1, face: 1 }, 'animal pet');
  P('critter', 'Dog, standing', { ears: 1, body: 1, tail: 0, face: 1 }, 'animal pet');
  P('critter', 'Bear', { ears: 2, body: 3, tail: 3, face: 2 }, 'animal');
  P('critter', 'Bunny', { ears: 3, body: 0, tail: 2, face: 4 }, 'animal');
  P('critter', 'Fox', { ears: 0, body: 1, tail: 2, face: 2 }, 'animal');
  P('critter', 'Blob beast', { ears: 4, body: 3, tail: 3, face: 3 }, 'animal');
  P('critter', 'Horned', { ears: 5, body: 0, tail: 1, face: 2 }, 'animal');
  P('critter', 'Big head', { ears: 2, body: 2, tail: 2, face: 4, headsize: 40 }, 'animal');
  P('critter', 'Long tail', { ears: 0, body: 1, tail: 4, face: 0 }, 'animal');

  P('bird', 'Bird', { beak: 0 }, 'animal');
  P('bird', 'Long beak', { beak: 1, tail: 2 }, 'animal');
  P('bird', 'Crested bird', { beak: 2, crest: 4, tail: 1 }, 'animal');

  P('figure', 'Standing', { pose: 0 }, 'person body');
  P('figure', 'Waving', { pose: 1 }, 'person body');
  P('figure', 'Walking', { pose: 2 }, 'person body');
  P('figure', 'Sitting', { pose: 3 }, 'person body');
  P('figure', 'Cheering', { pose: 4 }, 'person body');
  P('figure', 'Thinking', { pose: 5 }, 'person body');
  P('figure', 'Running', { pose: 6 }, 'person body');

  P('hand', 'Pointing', { gesture: 0 }, 'gesture');
  P('hand', 'Open palm', { gesture: 1 }, 'gesture');
  P('hand', 'OK sign', { gesture: 2 }, 'gesture');
  P('hand', 'Peace', { gesture: 3 }, 'gesture');
  P('hand', 'Fist', { gesture: 4 }, 'gesture');
  P('hand', 'Pointing down', { gesture: 0, rot: 180 }, 'gesture');

  /* ---------------------------------------------------------
     ICONS  (one preset per drawing)
     --------------------------------------------------------- */
  const ICON_LABEL = {
    bolt: 'Lightning', flame: 'Flame', drop: 'Droplet', eye: 'Eye', key: 'Key', lock: 'Padlock',
    gear: 'Cog', pencil: 'Pencil', scissors: 'Scissors', camera: 'Camera', music: 'Music',
    chat: 'Message', globe: 'Globe', rocket: 'Rocket', crown: 'Crown', anchor: 'Anchor',
    compass: 'Compass', umbrella: 'Umbrella', gift: 'Gift', ghost: 'Ghost', skull: 'Skull',
    planet: 'Planet', mushroom: 'Mushroom', cactus: 'Cactus', star4: 'Four star',
  };
  (ICON_KINDS || []).forEach((k, i) => P('icon', ICON_LABEL[k] || k, { kind: i }, 'icon ' + k));

  /* ---------------------------------------------------------
     ORNAMENT
     --------------------------------------------------------- */
  P('quote', 'Heavy quotes', { kind: 0 }, 'typography');
  P('quote', 'Curly quotes', { kind: 1 }, 'typography');
  P('quote', 'Angle quotes', { kind: 2 }, 'typography');
  P('quote', 'Tick quotes', { kind: 3 }, 'typography');
  P('quote', 'Heavy pair', { kind: 0, close: 1 }, 'typography');
  P('quote', 'Curly pair', { kind: 1, close: 1 }, 'typography');
  P('quote', 'Guillemets', { kind: 2, close: 1 }, 'typography');

  P('divider', 'Dot divider', { style: 0, count: 5 }, 'rule separator');
  P('divider', 'Diamond divider', { style: 1, count: 3 }, 'rule separator');
  P('divider', 'Wave divider', { style: 2, count: 3 }, 'rule separator');
  P('divider', 'Braid divider', { style: 3, count: 4 }, 'rule separator');
  P('divider', 'Arrow divider', { style: 4, count: 3 }, 'rule separator');
  P('divider', 'Double rule', { style: 5 }, 'rule separator');
  P('divider', 'Leaf divider', { style: 6, count: 3 }, 'rule separator');
  P('divider', 'Single dot', { style: 0, count: 1, scale: 14 }, 'rule separator');

  P('corner', 'Corner brackets', { style: 0, corners: 4, size: 28 }, 'frame');
  P('corner', 'Flourish corners', { style: 1, corners: 4 }, 'frame');
  P('corner', 'Stacked corners', { style: 2, corners: 4, size: 34 }, 'frame');
  P('corner', 'Fan corners', { style: 3, corners: 4, size: 40 }, 'frame');
  P('corner', 'Notch corners', { style: 4, corners: 4, size: 32 }, 'frame');
  P('corner', 'Single bracket', { style: 0, corners: 1, size: 80 }, 'frame');

  P('laurel', 'Laurel wreath', { leaves: 8, open: 50 }, 'award');
  P('laurel', 'Full wreath', { leaves: 12, open: 0, size: 9 }, 'award');
  P('laurel', 'Open laurel', { leaves: 6, open: 100, size: 13 }, 'award');

  P('sunburst', 'Sunburst', { rays: 16, inner: 14 }, 'radial retro');
  P('sunburst', 'Fine sunburst', { rays: 40, inner: 8 }, 'radial retro');
  P('sunburst', 'Open sunburst', { rays: 20, inner: 44 }, 'radial retro');
  P('sunburst', 'Line burst', { rays: 24, inner: 10, solid: 0 }, 'radial retro');

  P('tape', 'Tape strip', { angle: -8 }, 'collage');
  P('tape', 'Cut tape', { angle: 12, ends: 1, width: 16 }, 'collage');
  P('tape', 'Zigzag tape', { angle: -20, ends: 2, width: 28 }, 'collage');

  P('pin', 'Push pin', { kind: 0 }, 'collage');
  P('pin', 'Paperclip', { kind: 1 }, 'collage');
  P('pin', 'Thumbtack', { kind: 2 }, 'collage');
  P('pin', 'Staple', { kind: 3 }, 'collage');

  /* ---------------------------------------------------------
     PATTERNS
     --------------------------------------------------------- */
  P('patDots', 'Dot grid', { gap: 9, size: 1.4 }, 'background');
  P('patDots', 'Fine dots', { gap: 5, size: 0.8 }, 'background');
  P('patDots', 'Big polka', { gap: 20, size: 4.5 }, 'background');
  P('patDots', 'Aligned dots', { gap: 10, size: 1.6, stagger: 0 }, 'background');

  P('patLines', 'Vertical lines', { gap: 7, angle: 0 }, 'background');
  P('patLines', 'Horizontal rule', { gap: 7, angle: 90 }, 'background paper');
  P('patLines', 'Diagonal lines', { gap: 6, angle: 45 }, 'background');
  P('patLines', 'Wavy lines', { gap: 8, angle: 90, wob: 60 }, 'background');
  P('patLines', 'Wide rules', { gap: 16, angle: 90 }, 'background paper');

  P('patChecks', 'Checkerboard', { n: 6 }, 'background');
  P('patChecks', 'Fine check', { n: 14 }, 'background');
  P('patChecks', 'Grid boxes', { n: 6, alt: 0 }, 'background');
  P('patChecks', 'Big check', { n: 3 }, 'background');

  P('patConfetti', 'Confetti', { count: 40, size: 6 }, 'background party');
  P('patConfetti', 'Dashes', { count: 60, size: 8, kind: 1 }, 'background');
  P('patConfetti', 'Speckles', { count: 80, size: 5, kind: 2 }, 'background');
  P('patConfetti', 'Crosses', { count: 40, size: 7, kind: 3 }, 'background');
  P('patConfetti', 'Triangles', { count: 34, size: 8, kind: 4 }, 'background');

  P('patScales', 'Scales', { cols: 6, rows: 6 }, 'background');
  P('patScales', 'Fine scales', { cols: 12, rows: 12 }, 'background');
  P('patScales', 'Arches', { cols: 4, rows: 4, depth: 100 }, 'background');

  P('patNoise', 'Speckle', { count: 200, size: 0.7 }, 'texture');
  P('patNoise', 'Heavy grain', { count: 500, size: 0.5 }, 'texture');
  P('patNoise', 'Centre clump', { count: 260, size: 0.9, clump: 70 }, 'texture');

  P('blobstack', 'Blob stack', { layers: 3, offset: 6 }, 'background');
  P('blobstack', 'Deep stack', { layers: 6, offset: 4 }, 'background');
  P('blobstack', 'Offset pair', { layers: 2, offset: 14 }, 'background');

  P('wavestack', 'Wave stack', { layers: 4, amp: 10 }, 'background');
  P('wavestack', 'Deep waves', { layers: 8, amp: 16, waves: 1 }, 'background');
  P('wavestack', 'Ripple stack', { layers: 6, amp: 5, waves: 4 }, 'background');

  P('halftone', 'Halftone fade', { dir: 0, gap: 7 }, 'background gradient');
  P('halftone', 'Rise', { dir: 1, gap: 6 }, 'background gradient');
  P('halftone', 'Side fade', { dir: 2, gap: 7 }, 'background gradient');
  P('halftone', 'Radial halftone', { dir: 3, gap: 6, max: 4 }, 'background gradient');

  P('columns', 'Six columns', { cols: 6 }, 'layout guide');
  P('columns', 'Three columns', { cols: 3, gutter: 6 }, 'layout guide');
  P('columns', 'Twelve columns', { cols: 12, gutter: 2 }, 'layout guide');

  /* ---------------------------------------------------------
     finish: resolve full param sets + attach category
     --------------------------------------------------------- */
  LIB.forEach((e, i) => {
    const g = GENS[e.gen];
    const full = {};
    g.params.forEach(pa => full[pa.k] = (e.params[pa.k] !== undefined ? e.params[pa.k] : pa.def));
    e.params = full;
    e.cat = g.cat;
    e.id = 'p' + i;
    e.search = (e.name + ' ' + e.tags + ' ' + g.label + ' ' + g.cat).toLowerCase();
  });

  window.SCRAWL.PRESETS = LIB;
  window.SCRAWL.PRESET_CATS = [...new Set(LIB.map(e => e.cat))];
})();
