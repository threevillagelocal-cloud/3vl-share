/* Three Village Local - Company Digital Dashboards demo engine: Integrations screen (every industry).
   Data: assets/integrations-data.js (window.TVL_INTEG), only products with a real way in:
   api = public API or official sign-in (OAuth), feed = RESO/IDX, CalDAV, ICS or IMAP feed, export = official export/import.
   Connecting is simulated in this demo (nothing leaves the browser). */
(function () {
  'use strict';
  const T = window.TVL; const { icon, esc, ui } = T; const S = T.S; const A = T.actions;
  let cfg = null;
  const D = window.TVL_INTEG || { items: [], cats: [], pop: {}, conn: {}, v: '16.35.0' };
  const CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@' + D.v + '/icons/';
  const CAT = {}; D.cats.forEach((c) => { CAT[c[0]] = c[1]; });
  const IDX = {}; D.items.forEach((it, i) => { it.i = i; IDX[it.n] = it; });
  const TYPES = { api: ['Direct (API/OAuth)', 'b-green', 'shield'], feed: ['Via feed', 'b-blue', 'refresh'], export: ['Via export', '', 'download'], built: ['Built in', 'b-brand', 'sparkles'] };
  const KIND = { restaurant: 'restaurants', contractor: 'contractors', salon: 'salons & med spas', gym: 'gyms & studios', landscaper: 'landscapers' };
  const DEST = { pos: 'Finance and Command Center', acct: 'Finance', pay: 'Finance and Tasks & team', bank: 'Finance', book: 'Calendar', rest: 'Command Center and Finance', field: 'Jobs and Calendar', fit: 'Members and Calendar', re: 'Pipeline', med: 'Calendar', legal: 'Customers', auto: 'Customers', crm: 'Customers and Website leads', mkt: 'Marketing', social: 'Social studio and Analytics', rev: 'Reviews', web: 'Analytics', ads: 'Analytics and Marketing', prod: 'Tasks & team', sign: 'Customers', phone: 'Website leads and Customers', shop: 'Finance', ship: 'Calendar and Tasks', ai: 'Ask AI and the weekly owner report', tvl: 'Analytics' };

  // ---------- helpers ----------
  const lum = (hex) => { const n = parseInt(hex, 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const PAL = ['2f5d8a', '6a4c93', '2e6b5a', '8a4b3d', '36577a', '7b4f6e', '47705f', '9a6b3a'];
  const MONO = { 'OpenAI API (ChatGPT)': 'GPT', 'Azure OpenAI (Microsoft Copilot models)': 'Az', 'Any iCal (ICS) calendar': 'ICS', 'Any IMAP email inbox': '@' };
  const mono = (n) => { if (MONO[n]) return MONO[n]; const w = n.replace(/\(.*?\)/g, '').replace(/\b(API|Any|for|by|the|and|of)\b/g, '').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean); if (!w.length) return n.slice(0, 2).toUpperCase(); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };
  const logo = (it, cls) => {
    if (it.c === 'tvl') return `<span class="ig-logo ${cls || ''} ig-tvl" aria-hidden="true"><b>3VL</b></span>`;
    if (it.s) {
      const h = it.h || '333333'; const light = lum(h) > 0.82;
      return `<span class="ig-logo ${cls || ''}${light ? ' light' : ''}" style="--c:#${h}" aria-hidden="true"><i style="-webkit-mask-image:url(${CDN}${it.s}.svg);mask-image:url(${CDN}${it.s}.svg)"></i></span>`;
    }
    const h = it.h || PAL[T.hash(it.n) % PAL.length];
    return `<span class="ig-logo ${cls || ''} mono" style="--c:#${h}" aria-hidden="true"><b>${esc(mono(it.n))}</b></span>`;
  };
  T.igLogo = logo;
  const st = () => {
    const s = S();
    if (!s.integ) {
      const seed = (D.conn && D.conn[cfg.id]) || {}; const G = T.gen(cfg.id + 'integ');
      s.integ = { conn: {} };
      Object.keys(seed).forEach((n, k) => { s.integ.conn[n] = { n: seed[n], at: new Date(Date.now() - (2 + k * 3 + G.int(0, 4)) * 6e4).toISOString(), since: T.at(-G.int(40, 400), 10) }; });
      T.save();
    }
    return s.integ;
  };
  const isOn = (it) => it.c === 'tvl' || !!st().conn[it.n];
  const badge = (t) => { const x = TYPES[t] || TYPES.export; return `<span class="badge ig-b ${x[1]}">${icon(x[2], 'sm')}${esc(x[0])}</span>`; };
  const popList = () => ((D.pop && D.pop[cfg.id]) || []).map((n) => IDX[n]).filter(Boolean);
  const kind = () => KIND[cfg.id] || cfg.kind;

  const tile = (it) => {
    const on = isOn(it); const c = st().conn[it.n];
    const right = it.c === 'tvl' ? `<span class="ig-on">${icon('check', 'sm')}Built in</span>`
      : on ? `<button type="button" class="ig-on" data-act="igManage" data-v="${it.i}" aria-label="Manage ${esc(it.n)}"><i class="live-dot"></i>Connected</button>`
        : `<button type="button" class="btn btn-xs ig-connect" data-act="igConnect" data-v="${it.i}" aria-label="Connect ${esc(it.n)}">${icon('plus', 'sm')}Connect</button>`;
    return `<div class="ig-tile ${on ? 'on' : ''}" data-ig="${it.i}">
      <div class="ig-top">${logo(it)}<div class="ig-nm"><b>${esc(it.n)}</b><span>${esc(CAT[it.c] || '')}</span></div></div>
      <p class="ig-w">${esc(it.w)}</p>
      ${on && c ? `<div class="ig-sync tiny faint">${c.n ? `<b class="num" data-ign="${it.i}">${T.num(c.n)}</b> records · ` : ''}synced <span data-igt="${it.i}">${T.timeAgo(c.at)}</span></div>` : ''}
      <div class="ig-foot">${badge(it.t)}${right}</div></div>`;
  };

  function filtered() {
    const u = S().ui; const q = (u.igQ || '').trim().toLowerCase(); const cat = u.igCat || 'all'; const ty = u.igType || 'all';
    let list = cat === 'popular' ? popList() : D.items.filter((it) => cat === 'all' || it.c === cat);
    if (ty !== 'all') list = list.filter((it) => it.t === ty);
    if (q) list = list.filter((it) => (it.n + ' ' + it.w + ' ' + (CAT[it.c] || '')).toLowerCase().includes(q));
    return { list, q, cat, ty };
  }
  function results() {
    const f = filtered(); const u = S().ui;
    if (!f.q && f.cat === 'all' && f.ty === 'all') {
      const pop = popList(); const lim = u.igLimit || 48;
      const all = D.items.slice().sort((a, b) => a.n.localeCompare(b.n));
      return `<div class="ig-sec-h"><h2>${icon('star', 'sm')}Popular for ${esc(kind())}</h2><span class="faint small">${pop.length} picks</span></div>
        <div class="ig-grid">${pop.map(tile).join('')}</div>
        <div class="ig-sec-h"><h2>${icon('grid', 'sm')}All integrations</h2><span class="faint small">${D.items.length} tools, A to Z</span></div>
        <div class="ig-grid">${all.slice(0, lim).map(tile).join('')}</div>
        ${lim < all.length ? `<div class="ig-more"><button type="button" class="btn" data-act="igMore">${icon('chevD', 'sm')}Show all ${all.length}</button></div>` : ''}`;
    }
    if (!f.list.length) return `<div class="card ig-empty">${icon('search', 'lg')}<h3>No match for "${esc(f.q)}"</h3><p class="muted small">If it has an API, a feed or an export, we can usually connect it.</p><button type="button" class="btn btn-primary" data-act="igRequest" data-v="${esc(f.q)}">${icon('send', 'sm')}Request ${f.q ? '"' + esc(f.q) + '"' : 'an integration'}</button></div>`;
    return `<div class="ig-sec-h"><h2>${f.cat === 'popular' ? 'Popular for ' + esc(kind()) : f.cat === 'all' ? 'Results' : esc(CAT[f.cat] || '')}</h2><span class="faint small">${f.list.length} ${f.list.length === 1 ? 'tool' : 'tools'}</span></div><div class="ig-grid">${f.list.map(tile).join('')}</div>`;
  }
  const paint = () => { const box = document.getElementById('igResults'); if (box) box.innerHTML = results(); };

  function page() {
    const s = st(); const u = S().ui; const names = Object.keys(s.conn); const items = names.map((n) => IDX[n]).filter(Boolean);
    const recs = T.sum(names, (n) => s.conn[n].n || 0); const last = names.map((n) => s.conn[n].at).sort().pop();
    const counts = { api: 0, feed: 0, export: 0 }; D.items.forEach((it) => { if (counts[it.t] != null) counts[it.t]++; });
    const cats = [{ v: 'all', l: 'All' }, { v: 'popular', l: 'Popular for ' + kind() }].concat(D.cats.filter((c) => D.items.some((it) => it.c === c[0])).map((c) => ({ v: c[0], l: c[1] })));
    return ui.pageHead({ title: 'Integrations', sub: 'Connect the tools you already use. Your numbers flow into this dashboard on their own.', eyebrow: '<span class="sample">Demo</span>', actions: `<button class="btn btn-primary" data-act="igRequest">${icon('plus', 'sm')}Request an integration</button>` })
      + `<section class="hero ig-hero fade-in"><div class="ig-hero-l"><div class="chip-ai">${icon('link', 'sm')} Your connected stack</div>
          <h2>${items.length} tools connected, all syncing</h2>
          <div class="ig-stack">${items.map((it) => `<span class="ig-st" title="${esc(it.n)}">${logo(it, 'sm')}</span>`).join('')}<span class="ig-pulse"><i class="live-dot"></i>Live sync</span></div></div>
          <div class="ig-hero-r"><div><div class="big num" id="igRecs" data-count="${recs}">${T.num(recs)}</div><div class="t">records synced</div></div><div><div class="big" id="igLast">${esc(T.timeAgo(last))}</div><div class="t">last sync</div></div><div><div class="big" data-count="${D.items.length}">${D.items.length}</div><div class="t">tools available</div></div></div></section>
        <div class="ig-how fade-in">${['api', 'feed', 'export'].map((t) => `<div>${badge(t)}<span class="small muted">${t === 'api' ? 'Official sign-in or public API. Syncs on its own, all day.' : t === 'feed' ? 'Standard feeds: MLS (RESO/IDX), CalDAV, ICS calendars, IMAP email.' : 'Official report or CSV export, imported on a schedule.'}</span><b class="num">${counts[t]}</b></div>`).join('')}</div>
        <div class="ig-tools fade-in"><div class="search-inline ig-search">${icon('search', 'sm')}<input class="input" id="igQ" type="search" placeholder="Search ${D.items.length} tools: Square, QuickBooks, Gmail..." value="${esc(u.igQ || '')}" data-input="igSearch" aria-label="Search integrations" autocomplete="off"></div>
          ${ui.seg([{ v: 'all', l: 'All' }, { v: 'api', l: 'Direct' }, { v: 'feed', l: 'Feed' }, { v: 'export', l: 'Export' }], u.igType || 'all', 'igType')}</div>
        <div class="ig-cats fade-in" role="tablist" aria-label="Categories">${cats.map((c) => `<button type="button" class="chip ${c.v === (u.igCat || 'all') ? 'on' : ''}" data-act="igCat" data-v="${esc(c.v)}">${esc(c.l)}</button>`).join('')}</div>
        <div id="igResults" class="fade-in">${results()}</div>
        <p class="faint tiny ig-note">Demo: connections here are simulated with sample data. Product names and logos belong to their owners and are shown to illustrate available integrations. Logos from Simple Icons.</p>`;
  }
  function after() {
    // live sync ticks on connected tools
    T.every(() => {
      if (document.hidden) return; const s = st(); const names = Object.keys(s.conn).filter((n) => s.conn[n].n); if (!names.length) return;
      const n = names[Math.floor(Math.random() * names.length)]; T.igPulse(n);
    }, 6500);
  }
  T.igPulse = (name) => {
    const s = st(); const names = Object.keys(s.conn).filter((n) => s.conn[n].n); const n = name || names[0]; const c = s.conn[n]; if (!c) return;
    const add = 1 + Math.floor(Math.random() * 14); c.n += add; c.at = new Date().toISOString(); T.save();
    const it = IDX[n]; if (!it) return;
    document.querySelectorAll(`[data-ign="${it.i}"]`).forEach((el) => { el.textContent = T.num(c.n); });
    document.querySelectorAll(`[data-igt="${it.i}"]`).forEach((el) => { el.textContent = 'just now'; });
    document.querySelectorAll(`.ig-tile[data-ig="${it.i}"]`).forEach((el) => { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); });
    const r = document.getElementById('igRecs'); if (r) r.textContent = T.num(T.sum(Object.keys(s.conn), (k) => s.conn[k].n || 0));
    const l = document.getElementById('igLast'); if (l) l.textContent = 'Just now';
    return { it, add };
  };

  // ---------- actions ----------
  A.igSearch = (el) => { S().ui.igQ = el.value; T.save(); paint(); };
  A.igCat = (el) => { S().ui.igCat = el.dataset.v; T.save(); document.querySelectorAll('.ig-cats .chip').forEach((c) => c.classList.toggle('on', c.dataset.v === el.dataset.v)); paint(); };
  A.igType = (el) => { S().ui.igType = el.dataset.v; T.save(); el.parentNode.querySelectorAll('button').forEach((b) => { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); paint(); };
  A.igMore = () => { S().ui.igLimit = 9999; paint(); };
  A.igRequest = (el) => T.form({ title: 'Request an integration', icon: 'link', submitLabel: 'Send request (demo)', intro: '<p class="muted small" style="margin-top:0">Tell us what you use. If it has an API, a feed or an export, our team can usually connect it.</p>', fields: [{ name: 'tool', label: 'Software or app', full: true, required: true, value: (el && el.dataset && el.dataset.v) || '', ph: 'e.g. the booking system you use' }, { name: 'what', label: 'What should show up in your dashboard?', type: 'textarea', full: true, ph: 'e.g. daily sales and new customers' }], onSubmit: (d) => T.toast(`Request for ${d.tool} sent to Three Village Local (demo)`, { icon: 'send' }) });

  const scopes = (it) => it.w.replace(/\(.*?\)/g, '').split(/,| and /).map((x) => x.trim()).filter(Boolean).slice(0, 4).map((x) => x[0].toUpperCase() + x.slice(1));
  const host = (it) => it.n.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 18);
  function step1(it) {
    const biz = esc(S().settings.bizName); const h = '#' + (it.h || '1f2a44');
    if (it.t === 'api') {
      return `<div class="ig-prov" style="--pc:${h}"><div class="ig-prov-h">${logo(it, 'lg')}<div><b>Sign in with ${esc(it.n)}</b><span>${host(it)}.com/oauth/authorize</span></div><span class="ig-lock">${icon('lock', 'sm')}Secure</span></div>
        <div class="ig-prov-b"><p><b>${biz} Dashboard</b> wants to connect to your ${esc(it.n)} account.</p><div class="ig-acct">${T.avatar(T.role().person, 'sm', T.role().color)}<span><b>${esc(T.role().person)}</b><small>${esc(S().settings.bizName)} account</small></span>${icon('check', 'sm')}</div>
        <div class="flabel">It will be able to read</div><ul class="ig-scopes">${scopes(it).map((x) => `<li>${icon('eye', 'sm')}${esc(x)}</li>`).join('')}<li>${icon('shield', 'sm')}Read-only. Your password is never shared, and you can disconnect anytime.</li></ul></div>
        <div class="ig-prov-f"><button type="button" class="btn" data-act="igCancel">Cancel</button><button type="button" class="btn ig-allow" data-act="igGo" data-v="${it.i}">Allow access</button></div></div>`;
    }
    if (it.t === 'feed') {
      const f = /iCloud/.test(it.n) ? ['CalDAV server', 'caldav.icloud.com', 'App-specific password', '•••• •••• •••• ••••'] : /ICS/.test(it.n) ? ['Calendar feed (ICS link)', 'https://calendar.example.com/team/basic.ics', 'Sync every', '15 minutes'] : /IMAP/.test(it.n) ? ['IMAP server', 'imap.yourdomain.com : 993 (SSL)', 'Watch folder', 'Leads'] : /MLS/.test(it.n) ? ['MLS feed (RESO Web API)', 'api.mls-feed.example/reso/odata', 'Agent ID', 'Your MLS member ID'] : ['Lead feed address', 'leads+' + host(it) + '@inbox.yourdashboard.com', 'Assign new leads to', T.role().person];
      return `<div class="ig-prov" style="--pc:${h}"><div class="ig-prov-h">${logo(it, 'lg')}<div><b>Connect the ${esc(it.n)} feed</b><span>Standard feed, set up once</span></div><span class="ig-lock">${icon('lock', 'sm')}Encrypted</span></div>
        <div class="ig-prov-b"><div class="field"><label>${esc(f[0])}</label><input class="input" value="${esc(f[1])}" readonly></div><div class="field"><label>${esc(f[2])}</label><input class="input" value="${esc(f[3])}" readonly></div><p class="small muted">${esc(it.w)}.</p></div>
        <div class="ig-prov-f"><button type="button" class="btn" data-act="igCancel">Cancel</button><button type="button" class="btn ig-allow" data-act="igGo" data-v="${it.i}">Connect feed</button></div></div>`;
    }
    return `<div class="ig-prov" style="--pc:${h}"><div class="ig-prov-h">${logo(it, 'lg')}<div><b>Import from ${esc(it.n)}</b><span>Uses ${esc(it.n)}'s own report export</span></div><span class="ig-lock">${icon('lock', 'sm')}Private</span></div>
      <div class="ig-prov-b"><div class="ig-drop">${icon('upload')}<b>${host(it)}-export.csv</b><span class="faint small">Sample export file ready to import</span></div>
      <label class="check-row"><input type="checkbox" checked style="width:18px;height:18px"> <span class="small">Pick up a fresh export every week from a shared folder</span></label><p class="small muted">${esc(it.w)}.</p></div>
      <div class="ig-prov-f"><button type="button" class="btn" data-act="igCancel">Cancel</button><button type="button" class="btn ig-allow" data-act="igGo" data-v="${it.i}">Import file</button></div></div>`;
  }
  A.igConnect = (el) => {
    const it = D.items[+el.dataset.v]; if (!it) return;
    T.modal({ title: 'Connect ' + it.n, icon: 'link', noFooter: true, body: `<div class="ig-flow" id="igFlow">${step1(it)}</div>` });
  };
  A.igCancel = () => T.closeModal();
  A.igGo = (el) => {
    const it = D.items[+el.dataset.v]; const box = document.getElementById('igFlow'); if (!it || !box) return;
    const steps = it.t === 'api' ? ['Secure sign-in confirmed', 'Fetching your records', 'Matching them to your dashboard'] : it.t === 'feed' ? ['Feed reached', 'Reading new items', 'Matching them to your dashboard'] : ['File checked', 'Reading rows', 'Matching columns to your dashboard'];
    box.innerHTML = `<div class="ig-wait">${logo(it, 'lg')}<span class="ig-dots"><i></i><i></i><i></i></span><span class="ig-logo lg ig-me">${cfg.logo}</span></div><h3 class="ig-h3">Connecting ${esc(it.n)}...</h3><ul class="ig-steps">${steps.map((x, k) => `<li data-k="${k}">${icon('check', 'sm')}${esc(x)}</li>`).join('')}</ul>`;
    const lis = box.querySelectorAll('.ig-steps li'); let k = 0;
    const iv = setInterval(() => { if (!document.getElementById('igFlow')) { clearInterval(iv); return; } if (k < lis.length) { lis[k].classList.add('done'); k++; } else { clearInterval(iv); done(it); } }, 650);
  };
  function done(it) {
    const box = document.getElementById('igFlow'); if (!box) return;
    const n = it.c === 'ai' ? 0 : 180 + (T.hash(it.n) % 2400);
    st().conn[it.n] = { n, at: new Date().toISOString(), since: new Date().toISOString() }; T.save();
    box.innerHTML = `<div class="ig-ok"><span class="ig-check">${icon('check')}</span><h3>${esc(it.n)} is connected</h3>${n ? `<p class="ig-big"><span data-count="${n}">${T.num(n)}</span> records synced</p>` : '<p class="ig-big">Ready to use</p>'}<p class="muted small">Now flowing into: <b>${esc(DEST[it.c] || 'your dashboard')}</b>. It keeps syncing on its own.</p><button type="button" class="btn btn-primary btn-block" data-act="igDone">Done</button></div>`;
    T.animateCounts(box);
    T.feed({ icon: 'link', text: `${it.n} connected${n ? ': ' + T.num(n) + ' records synced' : ''}`, href: '#/integrations' });
  }
  A.igDone = () => { T.closeModal(); if (T.route().key === 'integrations') T.render(true); T.toast('Connected. Syncing in the background.', { icon: 'link' }); };
  A.igManage = (el) => {
    const it = D.items[+el.dataset.v]; const c = st().conn[it.n]; if (!it || !c) return;
    T.modal({ title: it.n, icon: 'link', noFooter: true, body: `<div class="ig-man"><div class="row" style="gap:12px">${logo(it, 'lg')}<div class="grow"><b>${esc(it.n)}</b><div class="small muted">${esc(CAT[it.c] || '')}</div></div>${badge(it.t)}</div>
      <div class="ig-man-g"><div><span>Status</span><b class="up"><i class="live-dot"></i> Connected</b></div><div><span>Last sync</span><b data-igt="${it.i}">${T.timeAgo(c.at)}</b></div><div><span>${c.n ? 'Records synced' : 'Used by'}</span><b data-ign="${it.i}">${c.n ? T.num(c.n) : 'Ask AI'}</b></div><div><span>Connected since</span><b>${T.fmtDate(c.since, { month: 'short', day: 'numeric', year: 'numeric' })}</b></div></div>
      <p class="small muted">${esc(it.w)}. Shows up in ${esc(DEST[it.c] || 'your dashboard')}.</p>
      <div class="row-wrap" style="justify-content:flex-end;gap:8px"><button type="button" class="btn btn-danger" data-act="igOff" data-v="${it.i}" style="margin-right:auto">Disconnect</button><button type="button" class="btn" data-act="igSyncNow" data-v="${it.i}">${icon('refresh', 'sm')}Sync now</button><button type="button" class="btn btn-primary" data-act="igCancel">Close</button></div></div>` });
  };
  A.igSyncNow = (el) => { const it = D.items[+el.dataset.v]; const r = T.igPulse(it.n); T.toast(r && r.add ? `Synced ${r.add} new records from ${it.n}` : `${it.n} is up to date`, { icon: 'refresh' }); };
  A.igOff = (el) => { const it = D.items[+el.dataset.v]; delete st().conn[it.n]; T.save(); T.closeModal(); T.render(true); T.toast(it.n + ' disconnected', { icon: 'link' }); };

  // ---------- register (engine level, every industry) ----------
  const prevReg = T.registerInsights;
  T.registerInsights = (config) => {
    if (prevReg) prevReg(config);
    cfg = config;
    T.pages.integrations = { title: 'Integrations', icon: 'link', render: page, after, count: () => 0 };
    const nav = cfg.nav || [];
    if (!nav.some((g) => g.items.includes('integrations'))) {
      const g = nav.find((x) => x.items.includes('automations')) || nav[nav.length - 1];
      if (g) { const k = g.items.indexOf('automations'); g.items.splice(k >= 0 ? k + 1 : g.items.length, 0, 'integrations'); }
    }
  };
})();
