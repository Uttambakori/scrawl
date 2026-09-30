/* ============================================================
   SCRAWL / fonts — the type library
   ------------------------------------------------------------
   A curated set of Google Fonts, fetched only when a file or the
   picker asks for one. Nothing here is loaded up front: the page
   ships with its interface faces and pulls a family the first
   time a text layer wants it.

   Each entry: [family, kind, weights, has italic, Indian script]
   weights is "100-900" for a full run or "400,700" for a list.
   Every weight and script was checked against the Fonts API.
   ============================================================ */
(function () {
  const S = window.SCRAWL;

  const LIB = [
    ["DM Sans", "sans", "100-900", 1],
    ["Inter", "sans", "100-900", 1],
    ["Manrope", "sans", "200-800", 0],
    ["Plus Jakarta Sans", "sans", "200-800", 1],
    ["Space Grotesk", "sans", "300-700", 0],
    ["Work Sans", "sans", "100-900", 1],
    ["Outfit", "sans", "100-900", 0],
    ["Sora", "sans", "100-800", 0],
    ["Figtree", "sans", "300-900", 1],
    ["Onest", "sans", "100-900", 0],
    ["Urbanist", "sans", "100-900", 1],
    ["Lexend", "sans", "100-900", 0],
    ["Poppins", "sans", "100-900", 1, "devanagari"],
    ["Montserrat", "sans", "100-900", 1],
    ["Raleway", "sans", "100-900", 1],
    ["Archivo", "sans", "100-900", 1],
    ["Archivo Narrow", "sans", "400-700", 1],
    ["Barlow", "sans", "100-900", 1],
    ["Barlow Condensed", "sans", "100-900", 1],
    ["IBM Plex Sans", "sans", "100-700", 1],
    ["Instrument Sans", "sans", "400-700", 1],
    ["Schibsted Grotesk", "sans", "400-900", 1],
    ["Hanken Grotesk", "sans", "100-900", 1],
    ["Familjen Grotesk", "sans", "400-700", 1],
    ["Bricolage Grotesque", "sans", "200-800", 0],
    ["Syne", "sans", "400-800", 0],
    ["Unbounded", "sans", "200-900", 0],
    ["Red Hat Display", "sans", "300-900", 1],
    ["Nunito", "sans", "200-900", 1],
    ["Rubik", "sans", "300-900", 1],
    ["Karla", "sans", "200-800", 1],
    ["Jost", "sans", "100-900", 1],
    ["Josefin Sans", "sans", "100-700", 1],
    ["Oswald", "sans", "200-700", 0],
    ["Big Shoulders Display", "sans", "100-900", 0],
    ["Mona Sans", "sans", "200-900", 1],
    ["Geist", "sans", "100-900", 1],
    ["Playfair Display", "serif", "400-900", 1],
    ["Libre Baskerville", "serif", "400-700", 1],
    ["Fraunces", "serif", "100-900", 1],
    ["Instrument Serif", "serif", "400", 1],
    ["Lora", "serif", "400-700", 1],
    ["Cormorant Garamond", "serif", "300-700", 1],
    ["EB Garamond", "serif", "400-800", 1],
    ["DM Serif Display", "serif", "400", 1],
    ["DM Serif Text", "serif", "400", 1],
    ["Newsreader", "serif", "200-800", 1],
    ["Source Serif 4", "serif", "200-900", 1],
    ["Crimson Pro", "serif", "200-900", 1],
    ["Libre Caslon Text", "serif", "400,700", 1],
    ["Bodoni Moda", "serif", "400-900", 1],
    ["Young Serif", "serif", "400", 0],
    ["Gloock", "serif", "400", 0],
    ["Spectral", "serif", "200-800", 1],
    ["Merriweather", "serif", "300-900", 1],
    ["Literata", "serif", "200-900", 1],
    ["Italiana", "serif", "400", 0],
    ["Cinzel", "serif", "400-900", 0],
    ["Marcellus", "serif", "400", 0],
    ["Rozha One", "serif", "400", 0, "devanagari"],
    ["Yeseva One", "serif", "400", 0],
    ["Archivo Black", "display", "400", 0],
    ["Anton", "display", "400", 0],
    ["Bebas Neue", "display", "400", 0],
    ["Alfa Slab One", "display", "400", 0],
    ["Abril Fatface", "display", "400", 0],
    ["Bungee", "display", "400", 0],
    ["Bungee Shade", "display", "400", 0],
    ["Righteous", "display", "400", 0],
    ["Monoton", "display", "400", 0],
    ["Rubik Mono One", "display", "400", 0],
    ["Dela Gothic One", "display", "400", 0],
    ["Shrikhand", "display", "400", 0, "gujarati"],
    ["Chango", "display", "400", 0],
    ["Titan One", "display", "400", 0],
    ["Rammetto One", "display", "400", 0],
    ["Climate Crisis", "display", "400", 0],
    ["Bowlby One", "display", "400", 0],
    ["Ultra", "display", "400", 0],
    ["Staatliches", "display", "400", 0],
    ["Black Ops One", "display", "400", 0],
    ["Fascinate", "display", "400", 0],
    ["Rye", "display", "400", 0],
    ["Limelight", "display", "400", 0],
    ["Poiret One", "display", "400", 0],
    ["Syncopate", "display", "400,700", 0],
    ["Major Mono Display", "display", "400", 0],
    ["Silkscreen", "display", "400,700", 0],
    ["Press Start 2P", "display", "400", 0],
    ["Bagel Fat One", "display", "400", 0],
    ["Gasoek One", "display", "400", 0],
    ["Chonburi", "display", "400", 0],
    ["Pacifico", "script", "400", 0],
    ["Lobster", "script", "400", 0],
    ["Dancing Script", "script", "400-700", 0],
    ["Great Vibes", "script", "400", 0],
    ["Sacramento", "script", "400", 0],
    ["Allura", "script", "400", 0],
    ["Parisienne", "script", "400", 0],
    ["Yellowtail", "script", "400", 0],
    ["Satisfy", "script", "400", 0],
    ["Kaushan Script", "script", "400", 0],
    ["Mr Dafoe", "script", "400", 0],
    ["Monsieur La Doulaise", "script", "400", 0],
    ["Pinyon Script", "script", "400", 0],
    ["Alex Brush", "script", "400", 0],
    ["Birthstone", "script", "400", 0],
    ["Style Script", "script", "400", 0],
    ["Meow Script", "script", "400", 0],
    ["Leckerli One", "script", "400", 0],
    ["Courgette", "script", "400", 0],
    ["Caveat", "hand", "400-700", 0],
    ["Caveat Brush", "hand", "400", 0],
    ["Permanent Marker", "hand", "400", 0],
    ["Gloria Hallelujah", "hand", "400", 0],
    ["Rock Salt", "hand", "400", 0],
    ["Shadows Into Light", "hand", "400", 0],
    ["Kalam", "hand", "300,400,700", 0, "devanagari"],
    ["Patrick Hand", "hand", "400", 0],
    ["Architects Daughter", "hand", "400", 0],
    ["Indie Flower", "hand", "400", 0],
    ["Reenie Beanie", "hand", "400", 0],
    ["Nanum Pen Script", "hand", "400", 0],
    ["Covered By Your Grace", "hand", "400", 0],
    ["Just Another Hand", "hand", "400", 0],
    ["Homemade Apple", "hand", "400", 0],
    ["Nothing You Could Do", "hand", "400", 0],
    ["Gochi Hand", "hand", "400", 0],
    ["Amatic SC", "hand", "400,700", 0],
    ["Schoolbell", "hand", "400", 0],
    ["Sue Ellen Francisco", "hand", "400", 0],
    ["Coming Soon", "hand", "400", 0],
    ["Walter Turncoat", "hand", "400", 0],
    ["Loved by the King", "hand", "400", 0],
    ["Cabin Sketch", "hand", "400,700", 0],
    ["Fredericka the Great", "hand", "400", 0],
    ["Londrina Sketch", "hand", "400", 0],
    ["Rubik Scribble", "hand", "400", 0],
    ["Special Elite", "hand", "400", 0],
    ["DM Mono", "mono", "300-500", 1],
    ["Chivo Mono", "mono", "100-900", 1],
    ["JetBrains Mono", "mono", "100-800", 1],
    ["IBM Plex Mono", "mono", "100-700", 1],
    ["Space Mono", "mono", "400,700", 1],
    ["Fira Code", "mono", "300-700", 0],
    ["Martian Mono", "mono", "100-800", 0],
    ["Courier Prime", "mono", "400,700", 1],
    ["Victor Mono", "mono", "100-700", 1],
    ["Syne Mono", "mono", "400", 0],
    ["Tiro Devanagari Hindi", "indic", "400", 1, "devanagari"],
    ["Tiro Devanagari Sanskrit", "indic", "400", 1, "devanagari"],
    ["Tiro Devanagari Marathi", "indic", "400", 1, "devanagari"],
    ["Noto Sans Devanagari", "indic", "100-900", 0, "devanagari"],
    ["Noto Serif Devanagari", "indic", "100-900", 0, "devanagari"],
    ["Yatra One", "indic", "400", 0, "devanagari"],
    ["Martel", "indic", "200,300,400,600,700,800,900", 0, "devanagari"],
    ["Hind", "indic", "300-700", 0, "devanagari"],
    ["Mukta", "indic", "200-800", 0, "devanagari"],
    ["Baloo 2", "indic", "400-800", 0, "devanagari"],
    ["Amita", "indic", "400,700", 0, "devanagari"],
    ["Sahitya", "indic", "400,700", 0, "devanagari"],
    ["Teko", "indic", "300-700", 0, "devanagari"],
    ["Rajdhani", "indic", "300-700", 0, "devanagari"],
    ["Khand", "indic", "300-700", 0, "devanagari"],
    ["Laila", "indic", "300-700", 0, "devanagari"],
    ["Karma", "indic", "300-700", 0, "devanagari"],
    ["Eczar", "indic", "400-800", 0, "devanagari"],
    ["Gotu", "indic", "400", 0, "devanagari"],
    ["Kurale", "indic", "400", 0, "devanagari"],
    ["Sarpanch", "indic", "400-900", 0, "devanagari"],
    ["Modak", "indic", "400", 0, "devanagari"],
    ["Palanquin Dark", "indic", "400-700", 0, "devanagari"],
    ["Biryani", "indic", "200,300,400,600,700,800,900", 0, "devanagari"],
    ["Halant", "indic", "300-700", 0, "devanagari"],
    ["Kadwa", "indic", "400,700", 0, "devanagari"],
    ["Arya", "indic", "400,700", 0, "devanagari"],
    ["Pragati Narrow", "indic", "400,700", 0, "devanagari"],
    ["Sura", "indic", "400,700", 0, "devanagari"],
    ["Vesper Libre", "indic", "400,500,700,900", 0, "devanagari"],
    ["Jaini", "indic", "400", 0, "devanagari"],
    ["Jaini Purva", "indic", "400", 0, "devanagari"],
    ["Rhodium Libre", "indic", "400", 0, "devanagari"],
    ["Inknut Antiqua", "indic", "300-900", 0, "devanagari"],
    ["Hind Siliguri", "indic", "300-700", 0, "bengali"],
    ["Baloo Da 2", "indic", "400-800", 0, "bengali"],
    ["Tiro Bangla", "indic", "400", 1, "bengali"],
    ["Noto Serif Bengali", "indic", "100-900", 0, "bengali"],
    ["Galada", "indic", "400", 0, "bengali"],
    ["Atma", "indic", "300-700", 0, "bengali"],
    ["Mina", "indic", "400,700", 0, "bengali"],
    ["Catamaran", "indic", "100-900", 0, "tamil"],
    ["Mukta Malar", "indic", "200-800", 0, "tamil"],
    ["Pavanam", "indic", "400", 0, "tamil"],
    ["Baloo Thambi 2", "indic", "400-800", 0, "tamil"],
    ["Hind Madurai", "indic", "300-700", 0, "tamil"],
    ["Meera Inimai", "indic", "400", 0, "tamil"],
    ["Hind Vadodara", "indic", "300-700", 0, "gujarati"],
    ["Mukta Vaani", "indic", "200-800", 0, "gujarati"],
    ["Baloo Bhai 2", "indic", "400-800", 0, "gujarati"],
    ["Farsan", "indic", "400", 0, "gujarati"],
    ["Rasa", "indic", "300-700", 1, "gujarati"],
    ["Baloo Paaji 2", "indic", "400-800", 0, "gurmukhi"],
    ["Mukta Mahee", "indic", "200-800", 0, "gurmukhi"],
    ["Tiro Gurmukhi", "indic", "400", 1, "gurmukhi"],
    ["Ramaraja", "indic", "400", 0, "telugu"],
    ["Mandali", "indic", "400", 0, "telugu"],
    ["NTR", "indic", "400", 0, "telugu"],
    ["Baloo Tammudu 2", "indic", "400-800", 0, "telugu"],
    ["Suravaram", "indic", "400", 0, "telugu"],
    ["Baloo Tamma 2", "indic", "400-800", 0, "kannada"],
    ["Tiro Kannada", "indic", "400", 1, "kannada"],
    ["Manjari", "indic", "100,400,700", 0, "malayalam"],
    ["Baloo Chettan 2", "indic", "400-800", 0, "malayalam"],
    ["Gayathri", "indic", "100,400,700", 0, "malayalam"],
    ["Baloo Bhaina 2", "indic", "400-800", 0, "oriya"],
    ["Noto Sans Ol Chiki", "indic", "400-700", 0, "ol-chiki"],
    ["Noto Sans Oriya", "indic", "100-900", 0, "oriya"],
  ];

  const KINDS = [
    ['sans', 'Sans'], ['serif', 'Serif'], ['display', 'Display'], ['script', 'Script'],
    ['hand', 'Handwritten'], ['mono', 'Mono'], ['indic', 'Indian scripts'],
  ];

  /* the script's own word for "letter", so a preview shows real glyphs */
  const SCRIPTS = {
    devanagari: ['Devanagari', 'अक्षर कला'], bengali: ['Bengali', 'অক্ষর'], tamil: ['Tamil', 'எழுத்து'],
    gujarati: ['Gujarati', 'અક્ષર'], gurmukhi: ['Gurmukhi', 'ਅੱਖਰ'], telugu: ['Telugu', 'అక్షరం'],
    kannada: ['Kannada', 'ಅಕ್ಷರ'], malayalam: ['Malayalam', 'അക്ഷരം'], oriya: ['Odia', 'ଅକ୍ଷର'],
    'ol-chiki': ['Ol Chiki', 'ᱚᱞ ᱪᱤᱠᱤ'],
  };

  /* faces that sit well next to each tradition's line */
  const SUGGEST = {
    warli: ['Kalam', 'Amita', 'Yatra One', 'Rozha One', 'Tiro Devanagari Marathi', 'Baloo 2', 'Caveat Brush', 'Patrick Hand', 'Eczar', 'Martel', 'Noto Sans Ol Chiki', 'Gotu'],
    gond: ['Baloo 2', 'Rozha One', 'Eczar', 'Laila', 'Kurale', 'Yatra One', 'Tiro Devanagari Hindi', 'Fraunces', 'Shrikhand', 'Modak', 'Sahitya', 'Amita'],
    sketch: ['Caveat', 'Permanent Marker', 'Gloria Hallelujah', 'Archivo Black', 'Anton', 'DM Mono', 'Instrument Serif', 'Fraunces', 'Space Grotesk', 'Bricolage Grotesque', 'Rock Salt', 'Special Elite'],
    madhubani: ['Rozha One', 'Tiro Devanagari Hindi', 'Kurale', 'Amita', 'Sahitya', 'Laila', 'Kalam', 'Eczar', 'Yatra One', 'Martel', 'Cinzel', 'Shrikhand'],
  };
  const SUGGEST_ANY = ['Kalam', 'Rozha One', 'Yatra One', 'Amita', 'Baloo 2', 'Eczar', 'Fraunces', 'Instrument Serif', 'Archivo Black', 'Caveat', 'DM Sans', 'Space Grotesk'];

  /* Files made before the library existed only ever loaded one weight of
     these, so that is the weight they were drawn in. */
  const LEGACY = {
    'Caveat': 700, 'Playfair Display': 700, 'Libre Baskerville': 700, 'Syne': 800, 'Fraunces': 700,
    'Bricolage Grotesque': 800, 'Unbounded': 700, 'Chivo Mono': 500, 'Sora': 700, 'Outfit': 700,
    'Lora': 600, 'Cormorant Garamond': 700, 'Kalam': 700,
  };

  const WNAMES = { 100: 'Thin', 200: 'Extra light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' };

  const byName = {};
  LIB.forEach(f => { byName[f[0]] = f; });

  function weightsOf(fam) {
    const f = byName[fam]; if (!f) return [400];
    const w = f[2];
    if (w.includes('-')) { const [a, b] = w.split('-').map(Number); const o = []; for (let v = a; v <= b; v += 100) o.push(v); return o; }
    return w.split(',').map(Number);
  }
  const hasItalic = fam => !!(byName[fam] && byName[fam][3]);
  const scriptOf = fam => (byName[fam] && byName[fam][4]) || '';
  function nearestWeight(fam, w) {
    const ws = weightsOf(fam);
    return ws.reduce((best, v) => Math.abs(v - w) < Math.abs(best - w) ? v : best, ws[0]);
  }
  function defaultWeight(fam) {
    if (LEGACY[fam]) return LEGACY[fam];
    const ws = weightsOf(fam);
    return ws.includes(400) ? 400 : ws[0];
  }

  /* ---------------- loading ----------------
     The css is fetched rather than linked so a failure is visible and a
     family that never arrives doesn't hold text back forever. */
  const API = 'https://fonts.googleapis.com/css2?';
  const q = fam => fam.replace(/ /g, '+');
  const state = {};            // family|ital -> 'loading' | 'ok' | 'fail'
  const pending = {};
  const listeners = new Set();
  const notify = () => listeners.forEach(fn => { try { fn(); } catch (e) { } });

  function addCSS(css) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  async function fetchCSS(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }
  function request(fam, italic) {
    const key = fam + '|' + (italic ? 1 : 0);
    if (pending[key]) return pending[key];
    // a family with no italic has nothing to fetch; the browser slants the roman
    if (italic && byName[fam] && !byName[fam][3]) { state[key] = 'fail'; return (pending[key] = Promise.resolve(false)); }
    state[key] = 'loading';
    const ws = weightsOf(fam).join(';');
    const tries = italic
      ? [`${API}family=${q(fam)}:ital,wght@${weightsOf(fam).map(w => '1,' + w).join(';')}&display=swap`, `${API}family=${q(fam)}:ital@1&display=swap`]
      : [byName[fam] && weightsOf(fam).length > 1 ? `${API}family=${q(fam)}:wght@${ws}&display=swap` : `${API}family=${q(fam)}&display=swap`];
    pending[key] = (async () => {
      for (const u of tries) {
        try { addCSS(await fetchCSS(u)); state[key] = 'ok'; return true; } catch (e) { }
      }
      state[key] = 'fail'; return false;
    })().then(ok => { notify(); return ok; });
    return pending[key];
  }
  const spec = (fam, w, it) => `${it ? 'italic ' : ''}${w || 400} 40px "${fam}"`;

  /* Is this face ready to be measured? Asking starts the load. A family
     that failed counts as ready, so layout falls back instead of waiting. */
  function isReady(fam, w, it, text) {
    const key = fam + '|' + (it ? 1 : 0);
    if (!state[key]) { request(fam, it); return false; }
    if (state[key] === 'fail') return true;
    if (state[key] === 'loading') return false;
    try { return document.fonts.check(spec(fam, w, it), text || 'Aa'); } catch (e) { return true; }
  }
  function ready(fam, w, it, text) {
    return request(fam, it).then(ok => ok ? document.fonts.load(spec(fam, w, it), text || 'Aa').catch(() => []) : []);
  }
  const onChange = fn => listeners.add(fn);

  /* css for an export, with only the faces actually used, fonts inlined
     by the caller. uses: [{ family, weight, italic }] */
  function cssQuery(uses) {
    const by = {};
    uses.forEach(u => {
      const fam = u.family; (by[fam] = by[fam] || new Set()).add((u.italic && hasItalic(fam) ? 1 : 0) + ',' + nearestWeight(fam, u.weight || defaultWeight(fam)));
    });
    return Object.keys(by).map(fam => {
      if (!byName[fam]) return 'family=' + q(fam);
      const tuples = [...by[fam]].map(t => t.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const anyItal = tuples.some(t => t[0]);
      return 'family=' + q(fam) + (anyItal ? ':ital,wght@' + tuples.map(t => t.join(',')).join(';') : ':wght@' + tuples.map(t => t[1]).join(';'));
    }).join('&');
  }

  /* ---------------- previews ----------------
     The picker draws each name in its own face. Asking the API for just
     the letters of that name keeps each preview to a few kilobytes; the
     face is registered under its own alias so it never stands in for the
     full family on the canvas. */
  const previewState = {};
  function previewText(f) { return f[4] ? f[0] + ' ' + SCRIPTS[f[4]][1] : f[0]; }
  function loadPreview(fam) {
    if (previewState[fam]) return previewState[fam];
    const f = byName[fam]; if (!f) return Promise.resolve(false);
    const w = defaultWeight(fam);
    const url = `${API}family=${q(fam)}${weightsOf(fam).length > 1 ? ':wght@' + w : ''}&text=${encodeURIComponent(previewText(f))}`;
    previewState[fam] = fetchCSS(url).then(css => {
      const srcs = [...css.matchAll(/src:\s*url\(([^)]+)\)/g)].map(m => m[1]);
      return Promise.all(srcs.map(u => new FontFace('pv ' + fam, `url(${u})`, { weight: String(w) }).load().then(ff => document.fonts.add(ff))));
    }).then(() => true, () => false);
    return previewState[fam];
  }

  /* ---------------- recents ---------------- */
  const RKEY = 'scrawl.fonts.recent';
  function recent() { try { return JSON.parse(localStorage.getItem(RKEY) || '[]').filter(f => byName[f]); } catch (e) { return []; } }
  function pushRecent(fam) { try { localStorage.setItem(RKEY, JSON.stringify([fam, ...recent().filter(f => f !== fam)].slice(0, 10))); } catch (e) { } }

  /* ==========================================================
     THE PICKER
     A popover anchored to whatever opened it. Hovering a row
     previews it on the canvas; Esc or clicking away puts it back.
     ========================================================== */
  let pk = null;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KEYTAB = 'scrawl.fonts.tab';

  function closePicker(picked) {
    if (!pk) return;
    const p = pk; pk = null;
    p.node.remove();
    removeEventListener('pointerdown', p.outside, true);
    if (!picked && p.onHover) p.onHover(null);
    if (p.onClose) p.onClose();
  }

  function openPicker(o) {
    closePicker();
    const node = document.createElement('div');
    node.className = 'fontpk';
    node.innerHTML = `<div class="fpsearch">${S.icon('search', 15)}<input type="text" placeholder="Search ${LIB.length} fonts" spellcheck="false"></div>
      <div class="fptabs"></div><div class="fpscripts"></div><div class="fplist" tabindex="-1"></div>
      <div class="fpfoot"><span></span><label class="fpsample"><input type="checkbox"> Preview my text</label></div>`;
    document.body.appendChild(node);
    const input = node.querySelector('input[type=text]');
    const tabsHost = node.querySelector('.fptabs'), scriptHost = node.querySelector('.fpscripts');
    const list = node.querySelector('.fplist'), foot = node.querySelector('.fpfoot span');
    const sampleBox = node.querySelector('.fpsample input');
    let tab = (() => { try { return localStorage.getItem(KEYTAB) || 'suggested'; } catch (e) { return 'suggested'; } })();
    let script = '', hi = -1, rows = [], sample = false;

    const suggested = () => (SUGGEST[o.style] || SUGGEST_ANY).filter(f => byName[f]);
    const TABS = [['suggested', 'Suggested'], ['all', 'All'], ...KINDS];

    function families() {
      const t = input.value.trim().toLowerCase();
      if (t) return LIB.filter(f => f[0].toLowerCase().includes(t) || f[1].includes(t) || (f[4] && (f[4].includes(t) || SCRIPTS[f[4]][0].toLowerCase().includes(t)))).map(f => f[0]);
      if (tab === 'suggested') { const r = recent(); return [...r, ...suggested().filter(f => !r.includes(f))]; }
      if (tab === 'all') return LIB.map(f => f[0]);
      if (tab === 'indic') return LIB.filter(f => f[4] && (!script || f[4] === script)).map(f => f[0]);
      return LIB.filter(f => f[1] === tab).map(f => f[0]);
    }

    function drawTabs() {
      tabsHost.innerHTML = '';
      TABS.forEach(([k, label]) => {
        const b = document.createElement('button');
        b.className = 'chip' + (k === tab && !input.value ? ' on' : ''); b.textContent = label;
        b.onclick = () => { tab = k; input.value = ''; try { localStorage.setItem(KEYTAB, k); } catch (e) { } draw(); };
        tabsHost.appendChild(b);
      });
      scriptHost.innerHTML = '';
      scriptHost.style.display = tab === 'indic' && !input.value ? '' : 'none';
      if (tab === 'indic') [['', 'Every script'], ...Object.entries(SCRIPTS).map(([k, v]) => [k, v[0]])].forEach(([k, label]) => {
        const b = document.createElement('button');
        b.className = 'chip' + (k === script ? ' on' : ''); b.textContent = label;
        b.onclick = () => { script = k; draw(); };
        scriptHost.appendChild(b);
      });
    }

    const io = new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return;
      const r = en.target; io.unobserve(r);
      loadPreview(r.dataset.fam).then(ok => { if (ok) r.classList.add('ready'); });
    }), { root: list, rootMargin: '120px' });

    function draw() {
      drawTabs();
      const fams = families();
      list.innerHTML = '';
      rows = [];
      const recents = recent();
      if (!input.value && tab === 'suggested' && recents.length) list.appendChild(sec('Recent'));
      fams.forEach((fam, i) => {
        if (!input.value && tab === 'suggested' && i === recents.length) list.appendChild(sec('Suits ' + ((S.STYLES && S.STYLES[o.style] && S.STYLES[o.style].name) || 'this piece')));
        const f = byName[fam];
        const r = document.createElement('button');
        r.className = 'fprow' + (fam === o.current ? ' cur' : '');
        r.dataset.fam = fam;
        const txt = sample && o.sampleText ? o.sampleText : previewText(f);
        const face = sample && o.sampleText ? `'${fam}'` : `'pv ${fam}'`;
        const n = weightsOf(fam).length;
        r.innerHTML = `<span class="fpname" style="font-family:${face},'DM Sans',sans-serif">${esc(txt)}</span>
          <span class="fpmeta">${esc(fam)} · ${(KINDS.find(k => k[0] === f[1]) || [, ''])[1]}${n > 1 ? ' · ' + n + ' weights' : ''}${f[3] ? ' · italic' : ''}${f[4] ? ' · ' + SCRIPTS[f[4]][0] : ''}</span>
          ${fam === o.current ? S.icon('check', 15) : ''}`;
        r.onmouseenter = () => { setHi(rows.indexOf(r), true); };
        r.onclick = () => pick(fam);
        list.appendChild(r); rows.push(r);
        if (sample && o.sampleText) request(fam, false); else io.observe(r);
      });
      if (!fams.length) list.appendChild(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'No font by that name.' }));
      foot.textContent = fams.length + ' font' + (fams.length === 1 ? '' : 's');
      hi = rows.findIndex(r => r.dataset.fam === o.current);
      if (hi >= 0) rows[hi].scrollIntoView({ block: 'center' });
    }
    function sec(t) { const h = document.createElement('div'); h.className = 'fpsec'; h.textContent = t; return h; }
    let hoverT = null;
    function setHi(i, fromMouse) {
      rows.forEach((r, k) => r.classList.toggle('hi', k === i));
      hi = i;
      const r = rows[i]; if (!r) return;
      if (!fromMouse) r.scrollIntoView({ block: 'nearest' });
      if (o.onHover) { clearTimeout(hoverT); hoverT = setTimeout(() => { if (pk && rows[hi] === r) o.onHover(r.dataset.fam); }, fromMouse ? 90 : 0); }
    }
    function pick(fam) { pushRecent(fam); clearTimeout(hoverT); if (o.onPick) o.onPick(fam); closePicker(true); }

    input.oninput = () => draw();
    input.onkeydown = e => {
      e.stopPropagation();
      if (e.key === 'ArrowDown') { e.preventDefault(); setHi(Math.min(rows.length - 1, hi + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHi(Math.max(0, hi - 1)); }
      if (e.key === 'Enter' && rows[hi]) { e.preventDefault(); pick(rows[hi].dataset.fam); }
      if (e.key === 'Escape') { e.preventDefault(); closePicker(); }
    };
    list.onmouseleave = () => { clearTimeout(hoverT); if (o.onHover) o.onHover(null); };
    sampleBox.parentElement.style.display = o.sampleText ? '' : 'none';
    sampleBox.onchange = () => { sample = sampleBox.checked; draw(); };

    // place it beside the anchor, kept on screen
    const a = o.anchor.getBoundingClientRect();
    const W = 340, H = Math.min(520, innerHeight - 24);
    node.style.width = W + 'px'; node.style.height = H + 'px';
    let x = a.left - W - 10; if (x < 8) x = Math.min(a.left, innerWidth - W - 8);
    let y = Math.min(Math.max(8, a.top - 80), innerHeight - H - 8);
    node.style.left = x + 'px'; node.style.top = y + 'px';

    const outside = e => { if (!node.contains(e.target) && !(o.anchor && o.anchor.contains(e.target))) closePicker(); };
    addEventListener('pointerdown', outside, true);
    pk = { node, outside, onHover: o.onHover, onClose: o.onClose };
    draw();
    setTimeout(() => input.focus(), 20);
  }

  S.TYPE = {
    LIB, KINDS, SCRIPTS, WNAMES, byName, weightsOf, hasItalic, scriptOf, nearestWeight, defaultWeight,
    request, ready, isReady, onChange, cssQuery, openPicker, closePicker, recent, pushRecent,
    get open() { return !!pk; },
  };
})();
