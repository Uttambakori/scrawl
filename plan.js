/* ============================================================
   SCRAWL / plan — Free and Pro, in one place
   ------------------------------------------------------------
   Every paid feature is named once in FEATURES. The editor asks
   PLAN.can(id) before doing it and PLAN.badge(id) to mark it, so
   switching gating on later is a one-line change here, not a hunt
   through the code.

   Tiers
     beta — everything unlocked, Pro features wear a quiet badge
     free — Pro features open the upgrade sheet instead of running
     pro  — everything unlocked, no badges

   While there is no billing, the tier defaults to beta. To try the
   free experience: localStorage.setItem('scrawl.plan', 'free').
   ============================================================ */
(function () {
  const S = window.SCRAWL = window.SCRAWL || {};
  const KEY = 'scrawl.plan';

  const PRICES = {
    monthly: { label: 'Pro monthly', price: '$9', per: '/ month', note: 'Cancel any time' },
    lifetime: { label: 'Pro for life', price: '$49', per: 'once', note: 'Pay once, keep every update' },
  };

  /* what Pro adds; the first line of each is what the badge and sheet say */
  const FEATURES = {
    hiresExport: { label: 'Export at 3× and 4×', pro: true },
    transparent: { label: 'Transparent backgrounds', pro: true },
    vector: { label: 'SVG and PDF export', pro: true },
    print: { label: 'Print with bleed and crop marks', pro: true },
    brandKit: { label: 'Brand kit: your colours and fonts, one click away', pro: true },
  };
  const FREE = [
    'Every tradition, library piece and template',
    'All 217 fonts, including Indian scripts',
    'PNG, JPG and WebP export up to 2×',
    'Unlimited files, saved in your browser',
  ];

  /* when billing exists, point these at the checkout pages */
  const CHECKOUT = { monthly: '', lifetime: '' };

  function tier() {
    try { const t = localStorage.getItem(KEY); if (t === 'free' || t === 'pro' || t === 'beta') return t; } catch (e) { }
    return 'beta';
  }
  const isPro = id => !!(FEATURES[id] && FEATURES[id].pro);
  const can = id => !isPro(id) || tier() !== 'free';
  const badge = id => isPro(id) && tier() !== 'pro'
    ? `<span class="probadge" title="${tier() === 'beta' ? 'Pro — free while Motifs is in beta' : 'Part of Motifs Pro'}">Pro</span>` : '';

  /* run fn if allowed, otherwise explain what Pro unlocks */
  function gate(id, fn) {
    if (can(id)) return fn();
    openUpgrade(id);
  }

  let sheet = null;
  function closeUpgrade() { if (sheet) { sheet.remove(); sheet = null; document.removeEventListener('keydown', onKey, true); } }
  function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeUpgrade(); } }

  function openUpgrade(id) {
    closeUpgrade();
    const t = tier();
    const ic = (n, s) => S.icon ? S.icon(n, s || 15) : '';
    const why = id && FEATURES[id] ? `<p class="upwhy">${ic('lock', 14)}<span>${FEATURES[id].label} is part of Motifs Pro.</span></p>` : '';
    const lead = t === 'pro' ? 'You have Motifs Pro. Thank you for backing the work.'
      : t === 'beta' ? 'Everything below is free while Motifs is in beta. When it launches, Pro keeps it unlocked.'
        : 'Free covers everything you need to make the work. Pro is for getting it out into the world.';
    const plan = k => {
      const p = PRICES[k], href = CHECKOUT[k];
      const cta = t === 'pro' ? '<button class="bordered" disabled>Your plan</button>'
        : href ? `<a class="upbuy" href="${href}" target="_blank" rel="noopener">Choose ${p.label.toLowerCase()}</a>`
          : `<button class="bordered" data-close>${t === 'beta' ? 'Free during beta' : 'Coming soon'}</button>`;
      return `<div class="upplan${k === 'lifetime' ? ' best' : ''}">
        ${k === 'lifetime' ? '<em>Best value</em>' : ''}
        <b>${p.label}</b>
        <div class="upprice"><span>${p.price}</span><small>${p.per}</small></div>
        <p>${p.note}</p>${cta}</div>`;
    };
    sheet = document.createElement('div');
    sheet.id = 'upgrade';
    sheet.innerHTML = `<div class="upsheet" role="dialog" aria-label="Motifs Pro">
      <button class="ico upx" data-close title="Close">${ic('close', 16)}</button>
      <div class="uphead"><span class="probadge big">Pro</span><h3>Motifs Pro</h3><p>${lead}</p></div>
      ${why}
      <div class="upcols">
        <div class="upfeat"><h4>Free</h4><ul>${FREE.map(f => `<li>${ic('check', 14)}<span>${f}</span></li>`).join('')}</ul></div>
        <div class="upfeat pro"><h4>Pro adds</h4><ul>${Object.values(FEATURES).filter(f => f.pro).map(f => `<li>${ic('check', 14)}<span>${f.label}</span></li>`).join('')}</ul></div>
      </div>
      <div class="upplans">${plan('monthly')}${plan('lifetime')}</div>
    </div>`;
    sheet.addEventListener('pointerdown', e => { if (e.target === sheet) closeUpgrade(); });
    sheet.querySelectorAll('[data-close]').forEach(b => b.onclick = closeUpgrade);
    document.body.appendChild(sheet);
    document.addEventListener('keydown', onKey, true);
  }

  S.PLAN = { tier, can, isPro, badge, gate, openUpgrade, closeUpgrade, FEATURES, PRICES, CHECKOUT, get open() { return !!sheet; } };
})();
