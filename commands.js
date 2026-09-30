/* ============================================================
   SCRAWL / commands — menu bar, command search, tooltips
   ------------------------------------------------------------
   Everything here reads the one action list app.js publishes as
   SCRAWL.studio, so a command added there shows up in the menus,
   in the search and on the keyboard at once.
   ============================================================ */
(function () {
  const S = window.SCRAWL;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let ST = null;

  /* ==========================================================
     MENU BAR
     Click a title to open it; once one is open, moving across the
     bar switches menus, the way a desktop menu bar behaves.
     ========================================================== */
  let openMenu = null, drop = null, hi = -1;

  function buildBar() {
    const bar = $('#menubar'); if (!bar) return;
    bar.innerHTML = '';
    ST.menus.forEach(([name]) => {
      const b = document.createElement('button');
      b.className = 'mbtn'; b.textContent = name; b.dataset.menu = name;
      b.onpointerdown = e => { e.preventDefault(); openMenu === name ? closeMenus() : showMenu(name); };
      b.onmouseenter = () => { if (openMenu && openMenu !== name) showMenu(name); };
      bar.appendChild(b);
    });
  }

  function rowsFor(name) {
    const m = ST.menus.find(x => x[0] === name);
    return m ? m[1] : [];
  }

  function showMenu(name) {
    closeMenus(true);
    const anchor = $(`#menubar [data-menu="${name}"]`); if (!anchor) return;
    openMenu = name; anchor.classList.add('on');
    drop = document.createElement('div');
    drop.className = 'mdrop';
    rowsFor(name).forEach(id => {
      if (id === '-') { drop.appendChild(Object.assign(document.createElement('div'), { className: 'ctxsep' })); return; }
      const a = ST.byId[id];
      const on = a.checked ? a.checked() : null;
      const b = document.createElement('button');
      b.className = 'ctxitem' + (on ? ' checked' : '');
      b.dataset.id = id;
      const lead = on !== null ? (on ? S.icon('check', 15) : '<i class="icspace"></i>') : (a.icon ? S.icon(a.icon, 15) : '<i class="icspace"></i>');
      b.innerHTML = `${lead}<span>${esc(a.label)}</span>${a.key ? `<kbd>${esc(ST.fmtKey(a.key))}</kbd>` : ''}`;
      if (a.enabled && !a.enabled()) b.disabled = true;
      b.onclick = () => { closeMenus(); ST.run(id); };
      b.onmouseenter = () => setHi([...drop.querySelectorAll('.ctxitem')].indexOf(b));
      drop.appendChild(b);
    });
    document.body.appendChild(drop);
    const r = anchor.getBoundingClientRect();
    drop.style.left = Math.min(r.left, innerWidth - drop.offsetWidth - 8) + 'px';
    drop.style.top = (r.bottom + 4) + 'px';
    hi = -1;
  }
  function closeMenus(keepState) {
    if (drop) { drop.remove(); drop = null; }
    document.querySelectorAll('#menubar .mbtn.on').forEach(b => b.classList.remove('on'));
    if (!keepState) openMenu = null;
  }
  function setHi(i) {
    const items = [...drop.querySelectorAll('.ctxitem')];
    items.forEach((b, k) => b.classList.toggle('hi', k === i));
    hi = i;
  }
  function menuKeys(e) {
    if (!openMenu) return;
    const items = drop ? [...drop.querySelectorAll('.ctxitem')] : [];
    const names = ST.menus.map(m => m[0]);
    const move = d => { let i = hi; for (let n = 0; n < items.length; n++) { i = (i + d + items.length) % items.length; if (!items[i].disabled) break; } setHi(i); };
    const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if (e.key === 'Escape') { stop(); closeMenus(); }
    else if (e.key === 'ArrowDown') { stop(); move(1); }
    else if (e.key === 'ArrowUp') { stop(); move(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { stop(); const i = names.indexOf(openMenu); showMenu(names[(i + (e.key === 'ArrowRight' ? 1 : -1) + names.length) % names.length]); }
    else if (e.key === 'Enter' && items[hi]) { stop(); items[hi].click(); }
  }

  /* ==========================================================
     COMMAND SEARCH — Ctrl K
     Every command, every library piece for the current tradition.
     Letters only need to appear in order, and word starts count most.
     ========================================================== */
  const RKEY = 'scrawl.cmd.recent';
  const recent = () => { try { return JSON.parse(localStorage.getItem(RKEY) || '[]'); } catch (e) { return []; } };
  const remember = id => { try { localStorage.setItem(RKEY, JSON.stringify([id, ...recent().filter(x => x !== id)].slice(0, 6))); } catch (e) { } };

  function score(q, text) {
    const t = text.toLowerCase();
    if (!q) return 1;
    const at = t.indexOf(q);
    if (at === 0) return 100 - t.length * .1;
    if (at > 0) return (/\s|-/.test(t[at - 1]) ? 80 : 60) - at * .2;
    let i = 0, s = 0, prev = -2;
    for (let k = 0; k < t.length && i < q.length; k++) {
      if (t[k] === q[i]) { s += (k === 0 || /\s|-/.test(t[k - 1])) ? 6 : (k === prev + 1 ? 3 : 1); prev = k; i++; }
    }
    return i === q.length ? s : 0;
  }

  let cmd = null;
  function openCommands() {
    if (cmd) return;
    closeMenus();
    const node = document.createElement('div');
    node.id = 'cmdk';
    node.innerHTML = `<div class="cmdbox"><div class="cmdin">${S.icon('search', 16)}<input type="text" placeholder="Search commands and pieces…" spellcheck="false"><kbd>Esc</kbd></div><div class="cmdlist"></div></div>`;
    document.body.appendChild(node);
    const input = node.querySelector('input'), list = node.querySelector('.cmdlist');
    let rows = [], sel = 0;
    const pieces = ST.pieces();

    function entries(q) {
      const acts = ST.actions.map(a => ({
        id: a.id, label: a.label, sub: a.menu || (a.tool ? 'Tool' : 'Action'), key: a.key, icon: a.icon,
        disabled: a.enabled ? !a.enabled() : false, on: a.checked ? a.checked() : null, run: () => ST.run(a.id),
      }));
      if (!q) {
        const r = recent().map(id => acts.find(a => a.id === id)).filter(Boolean);
        const common = ['export', 'font', 'rulers', 'layout', 'tRect', 'paste', 'zoomSel', 'keys'].map(id => acts.find(a => a.id === id)).filter(Boolean);
        return [...r.map(a => Object.assign({}, a, { group: 'Recent' })), ...common.filter(a => !r.includes(a)).map(a => Object.assign({}, a, { group: 'Suggested' }))];
      }
      const pool = acts.concat(pieces.map(p => ({ id: 'piece:' + p.label, label: 'Place ' + p.label, sub: p.sub, icon: 'shapes', run: p.run })));
      return pool.map(e => Object.assign(e, { s: Math.max(score(q, e.label), score(q, e.sub || '') * .5) }))
        .filter(e => e.s > 0).sort((a, b) => (a.disabled - b.disabled) || b.s - a.s).slice(0, 40);
    }
    function draw() {
      const q = input.value.trim().toLowerCase();
      const es = entries(q);
      list.innerHTML = ''; rows = [];
      let group = null;
      es.forEach(e => {
        if (e.group && e.group !== group) { group = e.group; list.appendChild(Object.assign(document.createElement('div'), { className: 'cmdsec', textContent: group })); }
        const b = document.createElement('button');
        b.className = 'cmdrow';
        b.disabled = !!e.disabled;
        const lead = e.on !== null && e.on !== undefined ? (e.on ? S.icon('check', 15) : S.icon(e.icon || 'check', 15)) : (e.icon ? S.icon(e.icon, 15) : '<i class="icspace"></i>');
        b.innerHTML = `${lead}<span class="cl">${esc(e.label)}${e.on ? ' <em>on</em>' : ''}</span><span class="cs">${esc(e.sub || '')}</span>${e.key ? `<kbd>${esc(ST.fmtKey(e.key))}</kbd>` : ''}`;
        b.onclick = () => pick(e);
        b.onmouseenter = () => setSel(rows.indexOf(b), true);
        b._e = e;
        list.appendChild(b); rows.push(b);
      });
      if (!es.length) list.appendChild(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'Nothing matches. Try “export”, “font”, “guide” or a piece name.' }));
      setSel(rows.findIndex(r => !r.disabled));
    }
    function setSel(i, mouse) {
      sel = i; rows.forEach((r, k) => r.classList.toggle('hi', k === i));
      if (!mouse && rows[i]) rows[i].scrollIntoView({ block: 'nearest' });
    }
    function pick(e) {
      if (e.disabled) return;
      closeCommands();
      if (!String(e.id).startsWith('piece:')) remember(e.id);
      setTimeout(() => e.run(), 0);
    }
    input.oninput = draw;
    input.onkeydown = e => {
      e.stopPropagation();
      if (e.key === 'ArrowDown') { e.preventDefault(); let i = sel; do { i = Math.min(rows.length - 1, i + 1); } while (rows[i] && rows[i].disabled && i < rows.length - 1); setSel(i); }
      if (e.key === 'ArrowUp') { e.preventDefault(); let i = sel; do { i = Math.max(0, i - 1); } while (rows[i] && rows[i].disabled && i > 0); setSel(i); }
      if (e.key === 'Enter' && rows[sel]) { e.preventDefault(); pick(rows[sel]._e); }
      if (e.key === 'Escape') { e.preventDefault(); closeCommands(); }
    };
    node.onpointerdown = e => { if (e.target === node) closeCommands(); };
    cmd = node;
    draw();
    setTimeout(() => input.focus(), 10);
  }
  function closeCommands() { if (cmd) { cmd.remove(); cmd = null; } }

  /* ==========================================================
     TOOLTIPS
     Native titles take a second to appear and can't show a key.
     These appear quickly, sit clear of the pointer and put the
     shortcut in a key cap.
     ========================================================== */
  let tip = null, tipT = null, tipFor = null;
  const KEYISH = /^((?:Ctrl|Shift|Alt|Ctrl\/⌘)\s)*[^\s()]{1,6}$/;
  function parseTip(t) {
    let m = t.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
    if (m && KEYISH.test(m[2].trim())) return [m[1], m[2].trim()];
    m = t.match(/^(.*?)\s+—\s+(.+)$/);
    if (m && KEYISH.test(m[2].trim())) return [m[1], m[2].trim()];
    return [t, ''];
  }
  function showTip(elm) {
    const text = elm.dataset.tip; if (!text) return;
    if (!tip) { tip = document.createElement('div'); tip.id = 'tip'; document.body.appendChild(tip); }
    const [label, key] = parseTip(text);
    tip.innerHTML = `<span>${esc(label)}</span>${key ? `<kbd>${esc(/^[A-Z0-9[\]\\;',./=-]$|^(Ctrl|Shift|Alt)\s/.test(key) ? ST.fmtKey(key) : key)}</kbd>` : ''}`;
    tip.classList.add('on');
    const r = elm.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    const below = r.bottom + th + 12 < innerHeight && r.top < innerHeight * .7;
    tip.style.left = Math.max(6, Math.min(innerWidth - tw - 6, r.left + r.width / 2 - tw / 2)) + 'px';
    tip.style.top = (below ? r.bottom + 7 : r.top - th - 7) + 'px';
  }
  function hideTip() { clearTimeout(tipT); tipFor = null; if (tip) tip.classList.remove('on'); }
  function bindTips() {
    document.addEventListener('mouseover', e => {
      const t = e.target instanceof Element ? e.target.closest('[title],[data-tip]') : null;
      if (!t || t.closest('#wrap') || t.matches('input[type=color],select,input[type=text],textarea,.libcell') || t.closest('.fontpk')) { if (!t) hideTip(); return; }
      if (t.hasAttribute('title')) { t.dataset.tip = t.getAttribute('title'); t.removeAttribute('title'); }
      if (tipFor === t) return;
      hideTip(); tipFor = t;
      tipT = setTimeout(() => { if (tipFor === t && t.isConnected) showTip(t); }, tip && tip.classList.contains('was') ? 60 : 380);
    });
    document.addEventListener('mouseout', e => {
      if (tipFor && e.target instanceof Element && tipFor.contains(e.target) && !(e.relatedTarget && tipFor.contains(e.relatedTarget))) {
        if (tip && tip.classList.contains('on')) { tip.classList.add('was'); setTimeout(() => tip && tip.classList.remove('was'), 500); }
        hideTip();
      }
    });
    addEventListener('pointerdown', hideTip, true);
    addEventListener('wheel', hideTip, { passive: true, capture: true });
  }

  /* ---------------- wiring ---------------- */
  S.openCommands = openCommands;
  S.initStudioUI = studio => {
    ST = studio;
    buildBar();
    bindTips();
    const k = $('#cmdKey'); if (k) k.textContent = ST.fmtKey('Ctrl K');
    addEventListener('keydown', menuKeys, true);
    addEventListener('pointerdown', e => {
      if (!openMenu) return;
      const t = e.target;
      if (t instanceof Element && (t.closest('.mdrop') || t.closest('#menubar'))) return;
      closeMenus();
    }, true);
    addEventListener('blur', () => closeMenus());
    addEventListener('resize', () => closeMenus());
  };
})();
