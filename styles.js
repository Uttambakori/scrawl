/* ============================================================
   SCRAWL / styles — art traditions as rendering disciplines
   ------------------------------------------------------------
   A tradition is not a folder of clipart. It is a set of rules
   about ground, pigment, line and fill. Warli is solid white rice
   paste on a cow-dung and earth ground, painted with confidence —
   so it wants near-zero wobble and filled silhouettes. Gond is the
   exact opposite and is built the opposite way in code: a clean
   outline with a signature packed inside it (comb lines, rows of
   seeds, bands of dots), where the fill carries the authorship.

   Each pack sets:
     palettes  the grounds and pigments the tradition actually used
     hand      how the brush behaves (wobble, bend, passes, weight)
     fill      the default fill discipline
     canvas    a sensible starting format
   ============================================================ */
(function () {
  const S = window.SCRAWL;

  const STYLES = {

    warli: {
      key: 'warli',
      name: 'Warli',
      where: 'Maharashtra, India',
      note: 'White rice paste on an earth ground. Circle, triangle, square — a person is two triangles meeting at their tips. No figure is drawn larger than another.',
      /* [name, ground, pigment, accent, alt, alt2] */
      palettes: [
        ['Mud wall', '#8C4A2F', '#F4EDE2', '#E8CBA8', '#5E2E1B', '#8C4A2F'],
        ['Cow dung & earth', '#7A5230', '#F6F1E6', '#D9B98C', '#4A301A', '#7A5230'],
        ['Red ochre', '#9E4B33', '#FAF5EC', '#E2B98F', '#63281A', '#9E4B33'],
        ['Terracotta', '#B4603C', '#FCF7EE', '#EBD3B4', '#6E3320', '#B4603C'],
        ['Night wall', '#3A2A20', '#F2EADC', '#C79B6B', '#1E140E', '#3A2A20'],
        ['Fresh plaster', '#E7D8BF', '#3A2216', '#9E4B33', '#7A5230', '#E7D8BF'],
      ],
      hand: { rough: 0.28, bow: 0.35, passes: 1, weight: 2.6, fillMode: 'none' },
      canvas: ['Square 1080', 1080, 1080],
      texture: 'rough', textureAmt: 0.16,
      cats: ['Figures', 'Compositions', 'Nature', 'Animals', 'Village', 'Borders'],
    },

    gond: {
      key: 'gond',
      name: 'Gond',
      where: 'Madhya Pradesh, India',
      note: 'A clean outline packed with a signature — dots, a comb of rake lines, crescents, seeds. The fill is not decoration on the drawing, it is the part that says whose drawing it is.',
      /* Earth pigment first — chui mitti clay, geru laterite, charcoal,
         ramraj ochre — then the saturated grounds Pardhan Gond has
         painted on since it moved from the wall to paper. */
      palettes: [
        ['Chui mitti', '#EFE3CB', '#2B2118', '#B4432B', '#3E6B4A', '#D18A2B'],
        ['Geru wall', '#B4603C', '#F6ECD9', '#2B2118', '#D18A2B', '#3E6B4A'],
        ['Charcoal ground', '#1E1B18', '#F2E6CE', '#E2603C', '#3E8A78', '#D9A72B'],
        ['Indigo night', '#1E2E4A', '#F0E7D2', '#E86A3C', '#5FB3A6', '#E0B33C'],
        ['Jangarh bright', '#123A5C', '#F5EEDC', '#D6336C', '#F2A93B', '#3EA88A'],
        ['Ramraj yellow', '#E0B33C', '#241C14', '#B4432B', '#2E6B5A', '#7A4A9E'],
        ['Forest', '#24402E', '#EFE6CE', '#E0A03C', '#C9503C', '#7FB08A'],
      ],
      /* brush on paper, not a finger on a wall: still confident, but it
         breathes a little more than Warli does */
      hand: { rough: 0.45, bow: 0.5, passes: 1, weight: 2.2, fillMode: 'none' },
      canvas: ['Post 4:5', 1080, 1350],
      texture: 'grain', textureAmt: 0.12,
      cats: ['Figures', 'Animals', 'Birds', 'Nature', 'Compositions', 'Borders'],
    },

    madhubani: {
      key: 'madhubani',
      name: 'Madhubani',
      where: 'Mithila, Bihar',
      note: 'Every contour drawn twice, and the channel between the lines filled — hatched in kachni, solid colour in bharni. Faces in profile with one great fish eye. No ground is left bare.',
      /* handmade paper and cow-dung washes; lamp-black line, sindoor
         red, turmeric, leaf green, indigo — then the black-and-red
         kachni palette, and the bright pinks of recent bharni work */
      palettes: [
        ['Handmade paper', '#F2E6CC', '#1E1712', '#C8321E', '#E8A620', '#2E7D4F'],
        ['Cow-dung wash', '#D8C096', '#231A12', '#B22A1C', '#E9B23A', '#1F5A8A'],
        ['Kachni', '#F4EBDA', '#1A1411', '#A8251A', '#F4EBDA', '#A8251A'],
        ['Bharni bright', '#F8EDD6', '#1C1410', '#E0336E', '#F2B41C', '#1E8C6E'],
        ['Sindoor ground', '#B8331F', '#1A120D', '#F2C230', '#F5EAD2', '#2F6B3A'],
        ['Indigo line', '#F3E6CC', '#1B2A4E', '#D9481E', '#F0B429', '#2F7A55'],
        ['Tantric night', '#1C1714', '#F2E3C4', '#E0402A', '#E9B23A', '#3E9A6A'],
      ],
      /* a nib, held steady: less wobble than Gond, one pass */
      hand: { rough: 0.3, bow: 0.35, passes: 1, weight: 2.4, fillMode: 'none' },
      /* the `fill` role is the third pigment here, not the paper */
      slots: { fill: 2 },
      canvas: ['Post 4:5', 1080, 1350],
      texture: 'fibre', textureAmt: 0.1,
      cats: ['Figures', 'Animals', 'Birds', 'Nature', 'Compositions', 'Borders'],
    },

    pattachitra: {
      key: 'pattachitra',
      name: 'Pattachitra',
      where: 'Puri, Odisha',
      note: 'A flat enamel of mineral colour, a heavy black contour, and a row of beads just inside it. The border is half the painting, and the ground behind a figure is never left empty.',
      /* hingula red, haritala yellow, conch-shell white, lamp-black,
         a little indigo — then the palm-leaf engraving's tan */
      palettes: [
        ['Hingula red', '#A8281C', '#15100C', '#F4EEDC', '#E3B23C', '#1F3E6E'],
        ['Haritala yellow', '#E1B13A', '#15100C', '#F4EEDC', '#A8281C', '#1F3E6E'],
        ['Conch white', '#F2ECDD', '#15100C', '#A8281C', '#E3B23C', '#2A4E7A'],
        ['Temple indigo', '#1C2B4A', '#0E0A08', '#F2E8CF', '#E3B23C', '#C8352A'],
        ['Green lac', '#2F5A3A', '#130F0B', '#F1E6CC', '#E3B23C', '#A8281C'],
        ['Palm leaf', '#D6B67A', '#1B130D', '#F1E3BE', '#D6B67A', '#6B3A1E'],
      ],
      /* a fine squirrel-hair brush over a flat ground: steady, heavy */
      hand: { rough: 0.2, bow: 0.3, passes: 1, weight: 2.4, fillMode: 'none' },
      slots: { fill: 2 },
      canvas: ['Post 4:5', 1080, 1350],
      texture: 'grain', textureAmt: 0.1,
      cats: ['Figures', 'Animals', 'Birds', 'Nature', 'Compositions', 'Borders'],
    },

    kalamkari: {
      key: 'kalamkari',
      name: 'Kalamkari',
      where: 'Srikalahasti, Andhra Pradesh',
      note: 'Drawn with a bamboo pen that swells and thins, then dyed madder, indigo and myrobalan — the dye stopping just short of the line. Paisleys, flowering trees, a hillock of rocks.',
      /* unbleached cotton, iron-black, madder, indigo, myrobalan
         yellow; then the dyed grounds of the palampore trade */
      palettes: [
        ['Ecru cotton', '#EFE3C8', '#231A14', '#9E2B20', '#2D4A6B', '#C9962E'],
        ['Myrobalan', '#E3C98E', '#231A14', '#8E2A1E', '#2D4A6B', '#EFE3C8'],
        ['Madder ground', '#8E2A1E', '#1B1310', '#E9D8B4', '#C9962E', '#2D4A6B'],
        ['Indigo ground', '#223756', '#F1E4C6', '#C4553A', '#D4A13A', '#F1E4C6'],
        ['Iron black', '#1D1A17', '#E9D9B6', '#B5402E', '#C9962E', '#6E8A5A'],
        ['Faded tea', '#E3CFA6', '#3A2A1E', '#A0452E', '#5C7A55', '#2D4A6B'],
      ],
      /* the pen is a ribbon, not a stroke, so weight matters little;
         wobble is low — this is a practised hand */
      hand: { rough: 0.22, bow: 0.3, passes: 1, weight: 1.6, fillMode: 'none' },
      slots: { fill: 2 },
      canvas: ['Post 4:5', 1080, 1350],
      texture: 'fibre', textureAmt: 0.12,
      cats: ['Paisley', 'Flora', 'Birds', 'Animals', 'Compositions', 'Borders'],
    },

    sketch: {
      key: 'sketch',
      name: 'Sketchbook',
      where: 'the original Scrawl library',
      note: 'Loose pen-and-ink. Everything is drawn twice with a shaky hand.',
      palettes: null,           // uses the general palette list
      hand: { rough: 1.1, bow: 1, passes: 2, weight: 3.2, fillMode: 'none' },
      canvas: ['Post 4:5', 1080, 1350],
      texture: 'grain', textureAmt: 0.12,
      cats: null,               // everything not claimed by another pack
    },
  };

  /* every generator without a style belongs to the sketchbook */
  Object.values(S.GENS).forEach(g => { if (!g.style) g.style = 'sketch'; });

  S.STYLES = STYLES;
  S.styleOf = k => STYLES[k] || STYLES.sketch;
  S.stylePalettes = k => {
    const st = STYLES[k];
    return (st && st.palettes) ? st.palettes : S.DATA.PALETTES;
  };
})();
