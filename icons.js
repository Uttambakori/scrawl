/* ============================================================
   SCRAWL / icons — 24px stroke icons, currentColor
   ============================================================ */
(function () {
  const P = {
    cursor: 'M5.5 3.2 18 11.4l-5.3 1-2.6 5.1z',
    hand: 'M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-.5V5.2a1.5 1.5 0 0 1 3 0V11m0-.7V6.6a1.5 1.5 0 0 1 3 0V13m0-3.2a1.5 1.5 0 0 1 3 0v4.9c0 2.9-2.2 5.3-5 5.3h-1c-2.8 0-4-1.5-5.4-3.4l-2-2.9a1.5 1.5 0 0 1 2.3-1.9L7 13.4',
    text: 'M5 5h14M12 5v14M9 19h6',
    pen: 'M4 20 8 19l10.6-10.6a2.1 2.1 0 0 0-3-3L5 16zM14.5 6.5l3 3',
    brush: 'M3.5 16.5c2.4-4.6 4.4-7.6 5.9-6.3s-1.6 6.1.6 7.1 3.8-7.7 6-7.2-.3 5.7 1.3 6.6 3.2-1.2 3.2-1.2',
    shapes: 'M4 13h7v7H4zM15 4l5 8h-10z',
    frame: 'M7 3v18M17 3v18M3 7h18M3 17h18',
    image: 'M4 5h16v14H4zM4 15l4.5-4.5L14 16M15 9.5h.01',
    undo: 'M4 9h10a5 5 0 0 1 0 10h-4M4 9l4-4M4 9l4 4',
    redo: 'M20 9H10a5 5 0 0 0 0 10h4M20 9l-4-4M20 9l-4 4',
    alignL: 'M4 3v18M8 8h11M8 16h7',
    alignCH: 'M12 3v18M7 8h10M9 16h6',
    alignR: 'M20 3v18M5 8h11M9 16h7',
    alignT: 'M3 4h18M8 8v11M16 8v7',
    alignCV: 'M3 12h18M8 7v10M16 9v6',
    alignB: 'M3 20h18M8 5v11M16 9v7',
    front: 'M12 3 4 7l8 4 8-4zM4 12l8 4 8-4M4 17l8 4 8-4',
    back: 'M4 7l8 4 8-4M4 12l8 4 8-4M12 17l-8 4 8 4',
    up: 'M12 19V5M6 11l6-6 6 6',
    down: 'M12 5v14M6 13l6 6 6-6',
    eye: 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z M12 14.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
    eyeOff: 'M4 4l16 16M9.6 9.7a2.4 2.4 0 0 0 3.3 3.4M6.4 6.6C3.6 8.4 2 12 2 12s3.6 6.5 10 6.5c1.7 0 3.2-.4 4.4-1M11 5.5c.3 0 .7 0 1 0 6.4 0 10 6.5 10 6.5s-.8 1.4-2.2 2.9',
    lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
    unlock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 5.7-1.3',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16.2 16.2 21 21',
    close: 'M6 6l12 12M18 6 6 18',
    chevD: 'M6 9l6 6 6-6',
    chevR: 'M9 6l6 6-6 6',
    chevL: 'M15 6l-6 6 6 6',
    download: 'M12 3v12M7 11l5 5 5-5M4 20h16',
    upload: 'M12 16V4M7 8l5-5 5 5M4 20h16',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4',
    files: 'M4 5h6l2 2h8v12H4zM4 5v14',
    trash: 'M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14M10 10v6M14 10v6',
    copy: 'M9 9h11v11H9zM5 15V4h11',
    panelL: 'M3 4h18v16H3zM9 4v16',
    panelR: 'M3 4h18v16H3zM15 4v16',
    fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z',
    keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M17 10h.01M7 14h10',
    sparkle: 'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
    refresh: 'M20 12a8 8 0 1 1-2.6-5.9M20 3v5h-5',
    palette: 'M12 21a9 9 0 1 1 0-18c5 0 9 3.6 9 8 0 2.5-2 4-4.4 4H15a2 2 0 0 0-1.4 3.4A1.9 1.9 0 0 1 12 21zM7.5 12h.01M9.5 8h.01M14 7h.01M17.5 10h.01',
    layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
    more: 'M6 12h.01M12 12h.01M18 12h.01',
    check: 'M5 12.5 10 17.5 19 7',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    home: 'M4 11 12 4l8 7v9H4zM10 20v-6h4v6',
    star: 'M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.9 9.4 9z',
    code: 'M9 7l-5 5 5 5M15 7l5 5-5 5',
    magnet: 'M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4',
    swatch: 'M4 4h7v16a3.5 3.5 0 0 1-7 0zM11 8.5 15 4.5l4.5 4.5-8.5 8.5M9 17h11v3.5H9',
    type: 'M4 7V5h16v2M12 5v14M9 19h6',
    duplicate: 'M8 8h12v12H8zM4 16V4h12',
    ungroup: 'M4 4h5v5H4zM15 15h5v5h-5zM9 6.5h6M6.5 9v6',
    distH: 'M4 3v18M20 3v18M9 8h6v8H9z',
    distV: 'M3 4h18M3 20h18M8 9v6h8V9z',
    group: 'M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4zM8 6h8M6 8v8M18 8v8M8 18h8',
    /* studio: type, transform, tools */
    link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
    unlink: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66M3.5 3.5l3 3M17.5 17.5l3 3',
    dropper: 'M13 7l4 4M16.5 3.5a2.1 2.1 0 0 1 3 3L17 9l-3-3zM14 6 5 15v4h4l9-9',
    flipH: 'M12 3v18M9 7 4 17h5zM15 7l5 10h-5z',
    flipV: 'M3 12h18M7 9l10-5v5zM7 15l10 5v-5z',
    stretchH: 'M3 5v14M21 5v14M7 12h10M10 9l-3 3 3 3M14 9l3 3-3 3',
    stretchV: 'M5 3h14M5 21h14M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3',
    italic: 'M10 4h8M6 20h8M14 4l-4 16',
    underline: 'M7 4v7a5 5 0 0 0 10 0V4M5 20h14',
    strike: 'M4 12h16M16.5 7c-.7-1.6-2.4-2.5-4.5-2.5-2.5 0-4.5 1.3-4.5 3.3 0 1 .4 1.7 1.2 2.2M8 16.5c.8 1.9 2.6 3 4.8 3 2.6 0 4.5-1.4 4.5-3.5 0-.7-.2-1.3-.6-1.8',
    tAlignL: 'M4 6h16M4 10h10M4 14h16M4 18h10',
    tAlignC: 'M4 6h16M7 10h10M4 14h16M7 18h10',
    tAlignR: 'M4 6h16M10 10h10M4 14h16M10 18h10',
    fontSize: 'M3 19 8 5l5 14M4.8 14h6.4M15 19l3-8 3 8M15.9 16.5h4.2',
    leading: 'M9 4h12M9 20h12M12 9h6M12 15h6M4.5 5v14M2.5 7l2-2 2 2M2.5 17l2 2 2-2',
    tracking: 'M3 4v16M21 4v16M8 17l4-10 4 10M9.3 14h5.4',
    hollow: 'M5 20 12 3l7 17h-3.2l-1.4-3.8H9.6L8.2 20zM10.6 13.4h2.8L12 9.4z',
    arc: 'M3.5 17a10 10 0 0 1 17 0M7.6 11.2 6.4 9.6M12 9.2V7.2M16.4 11.2l1.2-1.6',
    ruler: 'M3 16 16 3l5 5L8 21zM7 12l2 2M10 9l2 2M13 6l2 2',
    layout: 'M4 4h16v16H4zM9.3 4v16M14.7 4v16',
    rect: 'M4 6h16v12H4z',
    ellipse: 'M12 19c4.4 0 8-3.1 8-7s-3.6-7-8-7-8 3.1-8 7 3.6 7 8 7z',
    lineTool: 'M5 19 19 5',
    command: 'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
    paste: 'M9 3h6v3H9zM9 4.5H6V21h12V4.5h-3',
    cut: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.1 7.9 20 19M8.1 16.1 20 5',
    target: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M9 9h6v6H9z',
    save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
    guide: 'M3 12h18M12 3v18',
  };

  // icons whose paths want a fill instead of a stroke
  const FILLED = new Set(['cursor']);

  function icon(name, size = 16, extra = '') {
    const d = P[name];
    if (!d) return '';
    const fill = FILLED.has(name) ? 'currentColor' : 'none';
    const stroke = FILLED.has(name) ? 'currentColor' : 'currentColor';
    return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}><path d="${d}"/></svg>`;
  }

  /* swap any [data-icon] element for its icon */
  function paintIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(n => {
      const [name, size] = n.dataset.icon.split(':');
      const label = n.dataset.label;
      n.innerHTML = icon(name, +size || 16) + (label ? `<span>${label}</span>` : '');
    });
  }

  window.SCRAWL.icon = icon;
  window.SCRAWL.paintIcons = paintIcons;
  window.SCRAWL.ICON_PATHS = P;
})();
