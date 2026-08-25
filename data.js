/* ============================================================
   SCRAWL / data — palettes, canvases, type, textures, layouts
   ============================================================ */
(function () {

  /* ---------- palettes: [paper, ink, accent, alt1, alt2] ---------- */
  const PALETTES = [
    ['Newsprint', '#EFEBE3', '#141414', '#141414', '#6E6A63', '#9C978E'],
    ['Riso Red', '#F2EDE4', '#141414', '#E01E37', '#8C1122', '#F5A3AE'],
    ['Cobalt', '#F1ECE2', '#12205E', '#2C46C4', '#7A8FE8', '#0A1233'],
    ['Poster Red', '#FBF7F0', '#D92B24', '#D92B24', '#7C1A16', '#F3A69F'],
    ['Midnight', '#131313', '#F0EBE1', '#E8B84B', '#A8794F', '#6B6862'],
    ['Sage', '#DDE2D4', '#22261E', '#B4552D', '#6E7A5C', '#EFF2E9'],
    ['Peach', '#F6DCC8', '#3B1E33', '#C64C6A', '#8C5A7A', '#FFF1E4'],
    ['Blueprint', '#1B3A5C', '#DDE8F2', '#7FB2D9', '#0E2439', '#FFFFFF'],
    ['Bone', '#FFFFFF', '#000000', '#000000', '#777777', '#CCCCCC'],
    ['Mustard', '#F2C14E', '#22201C', '#8C2F1B', '#4E4632', '#FFF3D6'],
    ['Mint', '#D6EDE4', '#123B33', '#E86A4B', '#3E7D6E', '#FAFFFC'],
    ['Ink & Rust', '#EAE4D8', '#1E1B18', '#A8452A', '#5C4632', '#C9B99C'],
    ['Grape', '#EDE6F5', '#331B52', '#7B3FBF', '#B490E0', '#150A24'],
    ['Terracotta', '#F0E0D2', '#4A281B', '#C1613C', '#7E4A32', '#FFF6EE'],
    ['Neon Night', '#0D0F14', '#E6F0FF', '#3DF2A0', '#F23D6D', '#5A6478'],
    ['Sand', '#E8DCC4', '#2E2A22', '#7A6A4F', '#B5A183', '#FBF6EA'],
    ['Cherry', '#FFF0F2', '#2B0A12', '#E11D48', '#7A1330', '#FFC2CE'],
    ['Forest', '#E4EADD', '#1B2E1F', '#3F7A48', '#7FA06A', '#0C160E'],
    ['Slate', '#E3E5E8', '#22262B', '#4A5A6B', '#8A97A6', '#FFFFFF'],
    ['Sunburst', '#FFF4E0', '#3A2410', '#F2851C', '#C2410C', '#FFD9A0'],
    ['Lagoon', '#E0F2F4', '#083344', '#0E7490', '#5EBFD0', '#FFFFFF'],
    ['Bubblegum', '#FFE8F3', '#3D0A2B', '#FF4D9D', '#B0175F', '#FFB8D9'],
    ['Charcoal', '#2A2A2E', '#EDEAE4', '#D9694A', '#8A8A92', '#F5F3EF'],
    ['Olive', '#E9E5D0', '#33361F', '#7C8A3E', '#B8A15A', '#FDFCF4'],
    ['Ice', '#F0F6FF', '#0F2540', '#3B82F6', '#93C5FD', '#001028'],
    ['Clay', '#DCCBBB', '#3B2F2A', '#8C5A3C', '#B98A63', '#F7EFE7'],
    ['Acid', '#F4FF6B', '#101010', '#FF2D55', '#2E2E00', '#FFFFFF'],
    ['Plum Ink', '#F5EFF7', '#2A1233', '#6D2E7A', '#A86BB5', '#12060F'],
    ['Copper', '#F5EDE3', '#2B211A', '#B87333', '#7A4A20', '#E3CDB0'],
    ['Steel Blue', '#DEE6EC', '#16242E', '#37627E', '#7FA3BC', '#FBFDFF'],
    ['Cocoa', '#EFE3D8', '#3A2419', '#6F4128', '#A97B53', '#FFF8F1'],
    ['Chartreuse', '#EFF5D6', '#1F2A0C', '#7FA61F', '#4A5C18', '#FBFFE9'],
    ['Dusk', '#3B3153', '#EDE7F5', '#F2A65A', '#9A86C4', '#1C1630'],
    ['Coral', '#FFF1EC', '#40201A', '#FF6B4A', '#B03A24', '#FFCBBB'],
    ['Moss', '#D9DCC8', '#2A2E1F', '#5E6B3A', '#8E9B63', '#F4F6EC'],
    ['Indigo', '#E8E9F5', '#1A1B4B', '#4338CA', '#A5A8E8', '#0B0C24'],
    ['Butter', '#FFF8DC', '#3A3218', '#C9A227', '#7A6414', '#FFFDF2'],
    ['Rose Grey', '#EDE6E4', '#2E2622', '#9C6B62', '#C4A49C', '#FAF6F5'],
    ['Deep Sea', '#0B1F2A', '#DCEEF5', '#2EC4B6', '#F0A202', '#3A5A68'],
    ['Paper Bag', '#C8A87C', '#2B1E12', '#7A2E1E', '#5C4630', '#EADBC2'],
  ];

  /* ---------- canvas presets ---------- */
  const CANVASES = [
    ['A4 Portrait', 794, 1123], ['A4 Landscape', 1123, 794],
    ['A3 Portrait', 1123, 1587], ['A2 Poster', 1587, 2245],
    ['Square 1080', 1080, 1080], ['Story 9:16', 1080, 1920],
    ['Post 4:5', 1080, 1350], ['Wide 16:9', 1920, 1080],
    ['Postcard', 1476, 1004], ['Business card', 1050, 600],
    ['Sticker 3in', 900, 900], ['Banner 3:1', 1800, 600],
    ['Letter', 816, 1056], ['Tall 1:2', 800, 1600],
    ['Tabloid', 1224, 1584], ['Icon 512', 512, 512],
    ['Zine half', 840, 1080], ['Ticket', 1200, 480],
  ];

  /* ---------- typefaces ---------- */
  const FONTS = [
    ['Archivo Black', 'Archivo+Black', 400],
    ['Anton', 'Anton', 400],
    ['Bebas Neue', 'Bebas+Neue', 400],
    ['Caveat', 'Caveat:wght@700', 700],
    ['Permanent Marker', 'Permanent+Marker', 400],
    ['Gloria Hallelujah', 'Gloria+Hallelujah', 400],
    ['Space Grotesk', 'Space+Grotesk:wght@700', 700],
    ['DM Mono', 'DM+Mono:wght@500', 500],
    ['DM Sans', 'DM+Sans:wght@700', 700],
    ['Playfair Display', 'Playfair+Display:wght@700', 700],
    ['Libre Baskerville', 'Libre+Baskerville:wght@700', 700],
    ['Rock Salt', 'Rock+Salt', 400],
    ['Shadows Into Light', 'Shadows+Into+Light', 400],
    ['Bungee', 'Bungee', 400],
    ['Righteous', 'Righteous', 400],
    ['Syne', 'Syne:wght@800', 800],
    ['Instrument Serif', 'Instrument+Serif', 400],
    ['Fraunces', 'Fraunces:opsz,wght@9..144,700', 700],
    ['Bricolage Grotesque', 'Bricolage+Grotesque:wght@800', 800],
    ['Unbounded', 'Unbounded:wght@700', 700],
    ['Chivo Mono', 'Chivo+Mono:wght@500', 500],
    ['Sora', 'Sora:wght@700', 700],
    ['Outfit', 'Outfit:wght@700', 700],
    ['Lora', 'Lora:wght@600', 600],
    ['Cormorant Garamond', 'Cormorant+Garamond:wght@700', 700],
    ['Alfa Slab One', 'Alfa+Slab+One', 400],
    ['Abril Fatface', 'Abril+Fatface', 400],
    ['Kalam', 'Kalam:wght@700', 700],
    ['Patrick Hand', 'Patrick+Hand', 400],
    ['Architects Daughter', 'Architects+Daughter', 400],
    ['Special Elite', 'Special+Elite', 400],
    ['Silkscreen', 'Silkscreen', 400],
  ];

  /* ---------- paper textures ---------- */
  const TEXTURES = ['none', 'grain', 'rough', 'fibre', 'blotch', 'dots', 'grid', 'lines', 'crosshatch'];

  /* ---------- fill styles ---------- */
  const FILLS = ['none', 'solid', 'hatch', 'cross', 'scribble', 'dots'];

  /* ---------- composition recipes for Surprise ---------- */
  /* Slot flags: text:'head'|'sub'  big  frame  pattern
     Text slot height is a CAP on the type size, so give headlines room. */
  const COMPOSITIONS = [
    { name: 'Hero', place: () => [{ x: 16, y: 6, w: 68, h: 50, big: 1 }, { x: 8, y: 60, w: 84, h: 20, text: 'head' }, { x: 18, y: 84, w: 64, h: 7, text: 'sub' }] },
    { name: 'Stack', place: () => [{ x: 8, y: 5, w: 84, h: 18, text: 'head' }, { x: 22, y: 27, w: 56, h: 42, big: 1 }, { x: 14, y: 74, w: 72, h: 8, text: 'sub' }, { x: 34, y: 86, w: 32, h: 9 }] },
    { name: 'Grid nine', place: () => { const o = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) o.push({ x: 10 + x * 27, y: 8 + y * 26, w: 22, h: 22 }); o.push({ x: 10, y: 88, w: 80, h: 9, text: 'sub' }); return o; } },
    { name: 'Grid four', place: () => { const o = []; for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) o.push({ x: 13 + x * 39, y: 8 + y * 35, w: 34, h: 34 }); o.push({ x: 8, y: 80, w: 84, h: 15, text: 'head' }); return o; } },
    { name: 'Scatter', place: (r) => { const o = []; const n = 5 + (r() * 6 | 0); for (let i = 0; i < n; i++) { const s = 14 + r() * 24; o.push({ x: r() * (86 - s) + 4, y: r() * (80 - s) + 4, w: s, h: s }); } o.push({ x: 8, y: 82, w: 84, h: 14, text: 'head' }); return o; } },
    { name: 'Framed', place: () => [{ x: 4, y: 4, w: 92, h: 92, frame: 1 }, { x: 27, y: 14, w: 46, h: 42, big: 1 }, { x: 12, y: 60, w: 76, h: 18, text: 'head' }, { x: 22, y: 82, w: 56, h: 6, text: 'sub' }] },
    { name: 'Split', place: () => [{ x: 5, y: 16, w: 42, h: 56, big: 1 }, { x: 52, y: 14, w: 43, h: 22, text: 'head' }, { x: 52, y: 40, w: 43, h: 7, text: 'sub' }, { x: 54, y: 52, w: 34, h: 30 }] },
    { name: 'Diagonal', place: () => { const o = []; for (let i = 0; i < 4; i++) o.push({ x: 7 + i * 20, y: 6 + i * 19, w: 27, h: 27 }); o.push({ x: 8, y: 85, w: 84, h: 11, text: 'head' }); return o; } },
    { name: 'Column', place: () => { const o = []; for (let i = 0; i < 3; i++) o.push({ x: 35, y: 5 + i * 25, w: 30, h: 24 }); o.push({ x: 12, y: 80, w: 76, h: 15, text: 'head' }); return o; } },
    { name: 'Wallpaper', place: () => [{ x: 0, y: 0, w: 100, h: 100, pattern: 1 }, { x: 10, y: 38, w: 80, h: 24, text: 'head' }, { x: 25, y: 66, w: 50, h: 6, text: 'sub' }] },
    { name: 'Badge', place: () => [{ x: 10, y: 8, w: 80, h: 80, frame: 1 }, { x: 33, y: 22, w: 34, h: 32, big: 1 }, { x: 22, y: 58, w: 56, h: 16, text: 'head' }, { x: 30, y: 78, w: 40, h: 5, text: 'sub' }] },
    { name: 'Row', place: () => { const o = []; for (let i = 0; i < 3; i++) o.push({ x: 7 + i * 30, y: 22, w: 26, h: 26 }); o.push({ x: 8, y: 58, w: 84, h: 20, text: 'head' }); o.push({ x: 20, y: 84, w: 60, h: 6, text: 'sub' }); return o; } },
    { name: 'Big type', place: () => [{ x: 6, y: 10, w: 88, h: 40, text: 'head' }, { x: 30, y: 56, w: 40, h: 32, big: 1 }, { x: 20, y: 91, w: 60, h: 5, text: 'sub' }] },
    { name: 'Margin note', place: () => [{ x: 6, y: 8, w: 52, h: 52, big: 1 }, { x: 62, y: 14, w: 32, h: 32 }, { x: 6, y: 66, w: 60, h: 18, text: 'head' }, { x: 68, y: 70, w: 26, h: 6, text: 'sub' }] },
  ];

  const WORDS = ['MAKE', 'SLOW DOWN', 'HELLO.', 'ordinary magic', 'NO RUSH', 'keep going', 'BRAND NEW', 'a good day', 'STAY WEIRD', 'draft one', 'FOUND OBJECT', 'quiet hours', 'BEGIN AGAIN', 'small things', 'OFF MENU', 'notes to self', 'ROUGH CUT', 'first light', 'HOLD ON', 'nothing fancy'];
  const SUBS = ['made by hand, mostly', 'volume one', 'no. 004', 'draft, not final', 'printed while you wait', 'edition of one', 'you had to be there', 'assembled this morning', 'more or less', 'as found'];

  window.SCRAWL.DATA = { PALETTES, CANVASES, FONTS, TEXTURES, FILLS, COMPOSITIONS, WORDS, SUBS };
})();
