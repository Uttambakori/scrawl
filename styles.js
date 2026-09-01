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
