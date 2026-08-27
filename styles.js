/* ============================================================
   SCRAWL / styles — art traditions as rendering disciplines
   ------------------------------------------------------------
   A tradition is not a folder of clipart. It is a set of rules
   about ground, pigment, line and fill. Warli is solid white rice
   paste on a cow-dung and earth ground, painted with confidence —
   so it wants near-zero wobble and filled silhouettes. Gond is the
   opposite: clean outlines packed with signature fills (comb
   lines, rows of ovals, bands of dots).

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
