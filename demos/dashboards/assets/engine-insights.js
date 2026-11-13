/* Three Village Local dashboards engine - analytics, automations and the AI assistant */
(function () {
  'use strict';
  const T = window.TVL; const { icon, esc, ui } = T; const S = T.S; const A = T.actions;
  let cfg;

  // ================= ANALYTICS DATA (deterministic per date) =================
  const cache = {};
  const DOWF = [0.92, 1.0, 0.97, 0.98, 1.04, 1.12, 1.05];
  function web(d) {
    const k = T.isoDate(d); if (cache[k]) return cache[k];
    const r = T.dayRng(cfg.id + 'web', d); const ago = -T.dayDiff(d); const AN = cfg.analytics;
    const season = cfg.season ? cfg.season(d.getMonth()) : 1; const grow = 1 + 0.32 * (1 - Math.min(ago, 400) / 400);
    const n = () => 0.84 + r() * 0.32;
    const v = AN.base * season * grow * (AN.dow || DOWF)[d.getDay()] * n();
    const ai = 0.025 + 0.085 * (1 - Math.min(ago, 400) / 400);
    const src = { Google: 0.41 * n(), 'AI assistants': ai * n(), 'Three Village Local': 0.085 * n(), Social: 0.15 * n(), Direct: 0.2 * n(), Other: 0.04 };
    const st = T.sum(Object.values(src)); Object.keys(src).forEach((x) => { src[x] = src[x] / st; });
    const o = { v, s: v * 1.27, pv: v * 1.27 * 2.35, src, calls: v * AN.conv.calls * n(), forms: v * AN.conv.forms * n(), book: v * AN.conv.book * n(), mob: 0.72 + r() * 0.08, tab: 0.05,
      g: { searches: AN.gbp.searches * season * grow * n(), views: AN.gbp.views * season * grow * n(), calls: AN.gbp.calls * season * grow * n(), dirs: AN.gbp.dirs * season * grow * n(), clicks: AN.gbp.clicks * season * grow * n() },
      soc: {}, em: AN.email.gain * n() * (0.6 + 0.6 * season), tvl: { views: AN.tvl.views * grow * n(), clicks: AN.tvl.clicks * grow * n(), calls: AN.tvl.calls * grow * n() } };
    Object.keys(AN.social).forEach((p) => { const P = AN.social[p]; const reach = P.reach * season * grow * n(); o.soc[p] = { reach, eng: reach * P.er * n(), gain: P.gain * grow * n() }; });
    cache[k] = o; return o;
  }
  const wdays = (n, off) => { const out = []; for (let i = n - 1 + (off || 0); i >= (off || 0); i--) { const d = T.addDays(T.today0(), -i); out.push(Object.assign({ date: d }, web(d))); } return out; };
  T.web = wdays;
  // bucketed series for charts
  function series(n, f) {
    const ds = wdays(n);
    if (n <= 30) return { labels: ds.map((d) => T.fmtDate(d.date)), tips: ds.map((d) => T.fmtDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })), values: ds.map(f) };
    const size = n === 90 ? 7 : 30.4; const buckets = []; let i = ds.length;
    while (i > 0) { const st = Math.max(0, Math.round(i - size)); buckets.unshift(ds.slice(st, i)); i = st; }
    return { labels: buckets.map((b) => n === 90 ? T.fmtDate(b[0].date) : b[b.length - 1].date.toLocaleDateString('en-US', { month: 'short' })), tips: buckets.map((b) => (n === 90 ? 'Week of ' : '') + T.fmtDate(b[0].date) + (n === 90 ? '' : ' - ' + T.fmtDate(b[b.length - 1].date))), values: buckets.map((b) => T.sum(b, f)) };
  }
  const tot = (n, f, off) => T.sum(wdays(n, off), f);
  const conv = (d) => d.calls + d.forms + d.book;
  T.socialFollowers = (p) => cfg.analytics.social[p].f;

  // marketing pulse tiles on the owner home
  T.marketingPulse = () => {
    const AN = cfg.analytics; const d30 = wdays(30); const p30 = wdays(30, 30);
    const ig = AN.social.instagram; const igGain = T.sum(d30, (d) => d.soc.instagram.gain);
    const sent = S().campaigns.filter((c) => c.status === 'sent'); const open = T.sum(sent, (c) => c.opens) / Math.max(1, T.sum(sent, (c) => c.sent));
    const tvlRef = S().customers.filter((c) => c.source === 'Three Village Local').length;
    const tiles = [
      { l: 'Website visitors', v: T.knum(T.sum(d30, (d) => d.v)), d: ui.delta(T.sum(d30, (d) => d.v), T.sum(p30, (d) => d.v), { label: '' }), sp: d30.map((d) => d.v), href: '#/analytics', ic: 'globe' },
      { l: 'Calls from Google', v: T.num(T.sum(d30, (d) => d.g.calls)), d: ui.delta(T.sum(d30, (d) => d.g.calls), T.sum(p30, (d) => d.g.calls), { label: '' }), sp: d30.map((d) => d.g.calls), href: '#/analytics', ic: 'phone', tab: 'gbp' },
      { l: 'Instagram followers', v: T.num(ig.f), d: `<span class="up">+${Math.round(igGain)}</span>`, sp: d30.map((d) => d.soc.instagram.reach), href: '#/analytics', ic: 'instagram', tab: 'social' },
      { l: 'Email open rate', v: T.pct(open, 1), d: '<span class="faint">industry avg 34%</span>', sp: sent.slice(0, 8).reverse().map((c) => c.opens / c.sent), href: '#/analytics', ic: 'mail', tab: 'email' },
      { l: 'Three Village Local', v: T.knum(T.sum(d30, (d) => d.tvl.views)), d: `<span class="faint">views · ${tvlRef} referrals</span>`, sp: d30.map((d) => d.tvl.views), href: '#/analytics', ic: 'star', tab: 'tvl' }
    ];
    return `<div class="pulse fade-in"><div class="pulse-h"><span class="eyebrow">${icon('chart', 'sm').replace('class="i sm"', 'class="i sm" style="vertical-align:-3px"')} Marketing pulse · last 30 days</span><a class="small" href="#/analytics">Open analytics ${icon('chevR', 'sm').replace('class="i sm"', 'class="i sm" style="vertical-align:-3px;width:13px;height:13px"')}</a></div><div class="pulse-row">${tiles.map((t) => `<a class="pulse-tile" href="${t.href}" data-act="goAnalytics" data-v="${t.tab || 'website'}"><div class="row small muted" style="gap:6px">${icon(t.ic, 'sm')}<span class="ellip">${esc(t.l)}</span></div><div class="pv">${t.v}</div><div class="tiny">${t.d}</div><div class="psp">${ui.spark(t.sp, { w: 120, h: 26 })}</div></a>`).join('')}</div></div>`;
  };
  A.goAnalytics = (el) => { S().ui.aTab = el.dataset.v; T.save(); T.go('#/analytics'); };
  A.goSocialAnalytics = () => { S().ui.aTab = 'social'; T.save(); T.closeDrawer(); T.go('#/analytics'); };

  T.tvlCard = () => {
    const d30 = wdays(30); const p30 = wdays(30, 30); const s = S();
    const refs = s.customers.filter((c) => c.source === 'Three Village Local');
    const views = T.sum(d30, (d) => d.tvl.views), clicks = T.sum(d30, (d) => d.tvl.clicks), calls = T.sum(d30, (d) => d.tvl.calls);
    return `<section class="card tvl-card"><div class="card-body" style="padding:20px;position:relative;z-index:1"><div class="row"><span class="tvl-logo"><i>3VL</i>Featured on Three Village Local</span><span class="spacer"></span><span class="badge" style="background:rgba(255,214,0,.18);color:#ffd600">VIP member</span></div>
      <div class="stats-row mt"><div class="stat-mini"><div class="l">Profile views</div><div class="v" data-count="${Math.round(views)}">${T.num(views)}</div><div class="d">${ui.delta(views, T.sum(p30, (d) => d.tvl.views), { label: '' })}</div></div><div class="stat-mini"><div class="l">Website clicks</div><div class="v">${T.num(clicks)}</div><div class="d">last 30 days</div></div><div class="stat-mini"><div class="l">Calls</div><div class="v">${T.num(calls)}</div><div class="d">tap to call</div></div><div class="stat-mini"><div class="l">${esc(cfg.crm.label)} referred</div><div class="v">${refs.length}</div><div class="d">${T.short(T.sum(refs, (c) => c.ltv))} lifetime value</div></div></div>
      <div class="small mt" style="color:rgba(255,255,255,.8)">${(cfg.tvlFeatures || []).slice(0, 2).map((f) => `<div class="row" style="padding:5px 0;border-top:1px solid rgba(255,255,255,.12)">${icon('star', 'sm')}<span class="ellip grow">${esc(f.t)}</span><span class="nowrap">${T.knum(f.views)} views</span></div>`).join('')}</div></div></section>`;
  };

  function analyticsPage() {
    const s = S(); const n = s.ui.range; const tab = s.ui.aTab || 'website'; const AN = cfg.analytics;
    const tabs = [['website', 'Website', 'globe'], ['gbp', 'Google Business', 'pin'], ['social', 'Social media', 'instagram'], ['email', 'Email', 'mail'], ['tvl', 'Three Village Local', 'star']];
    let body = '';
    const kp = (label, ic, f, fmt, opts) => { const c = tot(n, f), p = tot(n, f, n); const sp = series(Math.min(n, 90), f).values; return { label, icon: ic, value: fmt(c), count: fmt === T.knum || fmt === T.num ? Math.round(c) : null, fmt: fmt === T.knum ? 'k' : 'num', delta: ui.delta(c, p, Object.assign({ label: 'vs prior' }, opts || {})), spark: sp }; };
    if (tab === 'website') {
      const sr = series(n, (d) => d.v), pr = (() => { const ds = wdays(n, n); return n <= 30 ? ds.map((d) => d.v) : series(n, (d) => d.v).values.map((_, i) => 0); })();
      const cur = wdays(n); const prev = wdays(n, n);
      const srcNames = Object.keys(cur[0].src);
      const srcTot = srcNames.map((k) => ({ label: k, value: T.sum(cur, (d) => d.v * d.src[k]), prev: T.sum(prev, (d) => d.v * d.src[k]) }));
      const pv = T.sum(cur, (d) => d.pv); const cv = T.sum(cur, conv); const vis = T.sum(cur, (d) => d.v);
      const mob = T.avg(cur, (d) => d.mob);
      const kpis = [kp('Visitors', 'users', (d) => d.v, T.knum), kp('Sessions', 'activity', (d) => d.s, T.knum), kp('Page views', 'eye', (d) => d.pv, T.knum), kp('Conversions', 'target', conv, T.num), { label: 'Conversion rate', icon: 'percent', value: T.pct(cv / vis, 1), delta: ui.delta(cv / vis, T.sum(prev, conv) / T.sum(prev, (d) => d.v)) }];
      const prevSeries = n <= 30 ? [{ name: 'Prior period', values: wdays(n, n).map((d) => d.v), color: 'var(--chart-3)', dash: true }] : [{ name: 'Prior period', values: (() => { const ds = wdays(n, n); const size = n === 90 ? 7 : 30.4; const out = []; let i = ds.length; while (i > 0) { const st = Math.max(0, Math.round(i - size)); out.unshift(T.sum(ds.slice(st, i), (d) => d.v)); i = st; } return out.slice(-sr.values.length); })(), color: 'var(--chart-3)', dash: true }];
      body = `<div class="kpis">${kpis.map(ui.kpi).join('')}</div>
        <div class="grid split">${ui.card({ title: 'Visitors', sub: T.rangeLabel(n) + (n > 30 ? (n === 90 ? ', by week' : ', by month') : ', by day'), icon: 'trend', body: ui.line({ labels: sr.labels, tipLabels: sr.tips, series: [{ name: 'Visitors', values: sr.values }].concat(prevSeries), h: 240 }) })}
          ${ui.card({ title: 'Traffic sources', sub: 'Where visitors came from', icon: 'filter', tone: 'violet', body: srcTot.sort((a, b) => b.value - a.value).map((x) => `<div class="src-row"><div class="row small"><b class="grow">${esc(x.label)}${x.label === 'AI assistants' ? ' <span class="badge b-violet" style="height:18px;font-size:10px">ChatGPT, Gemini, Perplexity</span>' : ''}</b><span class="num">${T.num(x.value)}</span><span class="num faint" style="width:44px;text-align:right">${T.pct(x.value / vis)}</span><span style="width:62px;text-align:right" class="tiny">${ui.delta(x.value, x.prev, { label: '' })}</span></div>${ui.progress(x.value / vis * 2.2, x.label === 'AI assistants' ? 'accent' : '')}</div>`).join('') })}</div>
        <div class="grid g-3 mt">${ui.card({ title: 'Conversions', sub: 'Actions that make you money', icon: 'target', tone: 'green', body: ui.hbars([{ label: 'Phone calls', value: Math.round(T.sum(cur, (d) => d.calls)) }, { label: 'Form leads', value: Math.round(T.sum(cur, (d) => d.forms)) }, { label: AN.bookLabel, value: Math.round(T.sum(cur, (d) => d.book)) }, { label: 'AI assistant leads', value: Math.round(s.leads.length * n / 30) }], T.num) })}
          ${ui.card({ title: 'Devices', icon: 'smartphone', tone: 'blue', body: ui.donut([{ label: 'Mobile', value: mob }, { label: 'Desktop', value: 1 - mob - 0.05, color: 'var(--chart-2)' }, { label: 'Tablet', value: 0.05, color: 'var(--chart-3)' }], { center: T.pct(mob), centerSub: 'on phones', size: 130 }) })}
          ${ui.card({ title: 'Top pages', icon: 'file', tone: 'amber', flush: true, body: AN.pages.map((p) => `<div class="li"><span class="grow"><div class="t1">${esc(p[1])}</div><div class="t2">${esc(p[0])}</div></span><b class="num">${T.knum(pv * p[2])}</b></div>`).join('') })}</div>`;
    } else if (tab === 'gbp') {
      const sr = series(n, (d) => d.g.calls + d.g.dirs + d.g.clicks); const sc = series(n, (d) => d.g.calls), sd = series(n, (d) => d.g.dirs), sw = series(n, (d) => d.g.clicks);
      const trend = s.x.ratingTrend || [];
      body = `<div class="kpis">${[kp('Searches you showed up in', 'search', (d) => d.g.searches, T.knum), kp('Map views', 'pin', (d) => d.g.views, T.knum), kp('Calls', 'phone', (d) => d.g.calls, T.num), kp('Direction requests', 'arrowR', (d) => d.g.dirs, T.num), kp('Website clicks', 'globe', (d) => d.g.clicks, T.num)].map(ui.kpi).join('')}</div>
        <div class="grid split">${ui.card({ title: 'Customer actions on your Google profile', sub: T.rangeLabel(n), icon: 'pin', body: ui.bars({ labels: sr.labels, tipLabels: sr.tips, series: [{ name: 'Calls', values: sc.values }, { name: 'Directions', values: sd.values, color: 'var(--chart-2)' }, { name: 'Website clicks', values: sw.values, color: 'var(--chart-3)' }], stacked: true, h: 240 }) })}
        ${ui.card({ title: 'What people searched', sub: 'Searches that showed your business', icon: 'search', tone: 'blue', body: ui.hbars(AN.queries.map((q, i) => ({ label: q, value: Math.round(tot(n, (d) => d.g.searches) * [0.22, 0.16, 0.11, 0.08, 0.06, 0.05][i]) })), T.num) })}</div>
        <div class="grid g-2 mt">${ui.card({ title: 'Google rating trend', sub: `${(s.x.googleRating || 4.7).toFixed(1)} stars from ${T.num(s.x.googleCount || 300)} reviews`, icon: 'star', tone: 'amber', body: ui.line({ labels: trend.map((x) => x.l), series: [{ name: 'Avg rating', values: trend.map((x) => x.v) }], fmt: (v) => v.toFixed(1), zero: false, h: 180 }) })}
        ${ui.card({ title: 'Review count', sub: 'Total Google reviews', icon: 'msg', tone: 'green', body: ui.bars({ labels: trend.map((x) => x.l), series: [{ name: 'Reviews', values: trend.map((x, i) => Math.round((s.x.googleCount || 300) - (trend.length - 1 - i) * (s.x.reviewsPerMonth || 6))) }], h: 180 }) })}</div>`;
    } else if (tab === 'social') {
      const P = Object.keys(AN.social);
      const posted = s.posts.filter((p) => p.status === 'posted').sort((a, b) => (b.stats.likes + b.stats.comments * 3 + b.stats.saves * 2) - (a.stats.likes + a.stats.comments * 3 + a.stats.saves * 2)).slice(0, 6);
      const reachS = P.map((p) => series(n, (d) => d.soc[p].reach));
      const heat = T.dow.map((_, di) => AN.slots.map((h, hi) => { const base = AN.peak(di, h); return Math.round(base * (0.85 + T.rng(cfg.id + di + h)() * 0.3) * 100); }));
      body = `<div class="soc-cards">${P.map((p) => { const Pp = AN.social[p]; const gain = tot(n, (d) => d.soc[p].gain); const reach = tot(n, (d) => d.soc[p].reach); const eng = tot(n, (d) => d.soc[p].eng); const preach = tot(n, (d) => d.soc[p].reach, n); return `<div class="card soc-card">${T.pfIcon(p)}<div class="small muted mt-s">${T.PF[p]}</div><div class="big-num" style="font-size:26px" data-count="${Pp.f}">${T.num(Pp.f)}</div><div class="tiny"><span class="up">+${T.num(gain)}</span> <span class="faint">${p === 'google' ? 'post views' : 'followers'} in ${n}d</span></div><div class="row tiny mt-s" style="justify-content:space-between"><span class="muted">Reach ${T.knum(reach)} ${ui.delta(reach, preach, { label: '' })}</span><span class="muted">ER ${T.pct(eng / reach, 1)}</span></div><div style="height:30px;margin-top:6px">${ui.spark(series(Math.min(n, 90), (d) => d.soc[p].reach).values, { w: 160, h: 30, color: { instagram: '#d6297a', facebook: '#1877f2', tiktok: '#25b8b8', google: '#4285f4' }[p] })}</div></div>`; }).join('')}</div>
        <div class="grid split mt">${ui.card({ title: 'Reach by platform', sub: T.rangeLabel(n), icon: 'eye', body: ui.bars({ labels: reachS[0].labels, tipLabels: reachS[0].tips, series: P.map((p, i) => ({ name: T.PF[p], values: reachS[i].values, color: { instagram: '#d6297a', facebook: '#1877f2', tiktok: '#25b8b8', google: '#7a8aa0' }[p] })), stacked: true, h: 240 }) })}
          ${ui.card({ title: 'Best time to post', sub: 'When your followers are most active', icon: 'clock', tone: 'violet', body: ui.heat(T.dow, AN.slots.map((h) => T.fmtHour(h).replace(':00', '').replace(' ', '')), heat, (v) => v + '% activity') })}</div>
        <h2 class="sec-title mt">Top posts</h2><div class="post-grid mt-s">${posted.map((p) => `<div class="card post-tile" data-act="openPost" data-id="${p.id}" role="button" tabindex="0">${ui.art({ title: p.title, sub: p.sub, tag: p.tag, shape: 'sq', seed: p.title, ph: false })}<div style="padding:10px 12px"><div class="row" style="gap:8px">${T.pfIcon(p.platform)}<span class="small muted grow">${T.fmtDate(p.date)}</span><span class="badge b-green">${T.pct((p.stats.likes + p.stats.comments + p.stats.shares + p.stats.saves) / p.stats.reach, 1)} ER</span></div><div class="row small mt-s" style="gap:12px;color:var(--text-2)"><span>${icon('eye', 'sm')} ${T.knum(p.stats.reach)}</span><span>${icon('heart', 'sm')} ${p.stats.likes}</span><span>${icon('msg', 'sm')} ${p.stats.comments}</span><span>${icon('send', 'sm')} ${p.stats.shares}</span></div></div></div>`).join('')}</div>`;
    } else if (tab === 'email') {
      const sent = s.campaigns.filter((c) => c.status === 'sent'); const list = s.mkt.emailList;
      const open = T.sum(sent, (c) => c.opens) / T.sum(sent, (c) => c.sent), click = T.sum(sent, (c) => c.clicks) / T.sum(sent, (c) => c.sent);
      const gain = tot(n, (d) => d.em);
      body = `<div class="kpis">${[{ label: 'Subscribers', icon: 'users', value: T.num(list[list.length - 1].v), count: list[list.length - 1].v, delta: `<span class="up">+${T.num(gain)}</span> <span class="faint">in ${n} days</span>` }, { label: 'Avg open rate', icon: 'mail', value: T.pct(open, 1), delta: '<span class="faint">industry avg 34%</span>' }, { label: 'Avg click rate', icon: 'link', value: T.pct(click, 1), delta: '<span class="faint">industry avg 2.6%</span>' }, { label: 'Revenue from email', icon: 'dollar', value: T.money(T.sum(sent, (c) => c.revenue)), delta: '<span class="faint">tracked bookings and sales</span>', roles: ['owner'] }].filter((k) => T.can(k.roles)).map(ui.kpi).join('')}</div>
        <div class="grid g-2">${ui.card({ title: 'List growth', icon: 'trend', body: ui.line({ labels: list.map((x) => x.l), series: [{ name: 'Subscribers', values: list.map((x) => x.v) }], zero: false, h: 220 }) })}
        ${ui.card({ title: 'New subscribers', sub: T.rangeLabel(n), icon: 'plus', tone: 'green', body: (() => { const sr = series(n, (d) => d.em); return ui.bars({ labels: sr.labels, tipLabels: sr.tips, series: [{ name: 'New subscribers', values: sr.values }], h: 220 }); })() })}</div>
        <div class="mt">${ui.card({ title: 'Campaign results', icon: 'megaphone', tone: 'violet', flush: true, body: ui.table({ cols: [{ l: 'Campaign', v: (c) => `<b>${esc(c.name)}</b><div class="tiny faint">${esc(c.channel)} · ${T.fmtDate(c.date)}</div>` }, { l: 'Sent', r: 1, v: (c) => T.num(c.sent) }, { l: 'Opened', r: 1, v: (c) => `${T.pct(c.opens / c.sent, 1)}` }, { l: 'Clicked', r: 1, v: (c) => T.pct(c.clicks / c.sent, 1) }, { l: 'Revenue', r: 1, v: (c) => T.isOwner() ? `<b>${T.money(c.revenue)}</b>` : '<span class="faint">Owner only</span>' }], rows: sent, rowAct: 'openCampaign' }) })}</div>`;
    } else {
      const sv = series(n, (d) => d.tvl.views), scl = series(n, (d) => d.tvl.clicks);
      const refs = s.customers.filter((c) => c.source === 'Three Village Local').sort((a, b) => b.created.localeCompare(a.created));
      body = `<div class="grid split">${T.tvlCard()}${ui.card({ title: 'Profile views and clicks', sub: T.rangeLabel(n), icon: 'trend', body: ui.line({ labels: sv.labels, tipLabels: sv.tips, series: [{ name: 'Profile views', values: sv.values }, { name: 'Website clicks', values: scl.values, color: 'var(--chart-2)' }], h: 220 }) })}</div>
        <div class="grid g-2 mt">${ui.card({ title: 'Features and spotlights', sub: 'Posts, articles and newsletter mentions', icon: 'star', tone: 'amber', flush: true, body: (cfg.tvlFeatures || []).map((f) => `<div class="li"><span class="card-icon brand">${icon(f.ic || 'star', 'sm')}</span><span class="grow"><div class="t1">${esc(f.t)}</div><div class="t2">${esc(f.where)} · ${T.fmtDate(T.at(-f.ago, 9))}</div></span><b class="num">${T.knum(f.views)}</b></div>`).join('') })}
        ${ui.card({ title: esc(cfg.crm.label) + ' who found you on Three Village Local', sub: refs.length + ' total', icon: 'users', tone: 'green', flush: true, body: refs.slice(0, 7).map((c) => `<a class="li click" href="#/customers/${c.id}">${T.avatar(T.fullName(c), 'sm')}<span class="grow"><div class="t1">${esc(T.fullName(c))}</div><div class="t2">Since ${T.fmtDate(c.created, { month: 'short', year: 'numeric' })}</div></span>${T.isEmp() ? '' : `<b class="num">${T.money(c.ltv)}</b>`}</a>`).join('') })}</div>`;
    }
    return ui.pageHead({ title: 'Analytics', sub: 'Website, Google, social, email and Three Village Local in one place', eyebrow: '<span class="sample">Sample data</span>', actions: `${T.rangeSeg()}<button class="btn" data-act="exportFin">${icon('download', 'sm')}Monthly report</button>` })
      + `<div class="tabs">${tabs.map(([k, l, ic]) => `<button class="${tab === k ? 'on' : ''}" data-act="aTab" data-v="${k}">${icon(ic, 'sm')}${l}</button>`).join('')}</div><div class="fade-in">${body}</div>`;
  }
  A.aTab = (el) => { S().ui.aTab = el.dataset.v; T.save(); T.render(true); };

  // ================= AUTOMATIONS =================
  function automationsPage() {
    const s = S(); const on = s.automations.filter((a) => a.on);
    const runs = T.sum(on, (a) => a.month); const allRuns = T.sum(s.automations, (a) => a.runs || 0); const okRate = s.autoLog.length ? Math.round(s.autoLog.filter((l) => l.ok !== false).length / s.autoLog.length * 100) : 100;
    const cats = ['All'].concat([...new Set(s.automations.map((a) => a.cat))]); const cf = s.ui.autoCat || 'All';
    const list = s.automations.filter((a) => cf === 'All' || a.cat === cf);
    return ui.pageHead({ title: 'Automations', sub: 'Your business on autopilot. These run 24/7 so you and your team do not have to.', actions: `<button class="btn btn-primary" data-act="newAuto">${icon('plus', 'sm')}Request an automation</button>` })
      + `<section class="hero auto-hero fade-in"><div class="chip-ai">${icon('workflow', 'sm')} This month</div><div class="auto-stats"><div><div class="big" data-count="${runs}">${runs}</div><div class="t">tasks done automatically this month</div></div><div><div class="big" data-count="${on.length}">${on.length}</div><div class="t">automations running 24/7</div></div><div><div class="big" data-count="${allRuns}">${T.num(allRuns)}</div><div class="t">tasks done since launch</div></div><div><div class="big" data-count="${okRate}" data-fmt="pct0">${okRate}%</div><div class="t">completed without a hitch</div></div></div></section>
      <div class="filterbar">${ui.chips(cats.map((c) => ({ v: c, l: c })), cf, 'autoCat')}</div>
      <div class="grid split"><div class="auto-list">${list.map(autoCard).join('')}</div>
      ${ui.card({ title: 'Run log', sub: 'Live', icon: 'activity', tone: 'blue', right: '<span class="badge b-green"><span class="live-dot" style="width:7px;height:7px"></span> Live</span>', flush: true, body: `<div id="autoLog">${s.autoLog.slice(0, 16).map(logRow).join('')}</div>` })}</div>`;
  }
  const logRow = (l) => { const a = S().automations.find((x) => x.key === l.key) || {}; return `<div class="li ${l.fresh ? 'flash fade-in' : ''}"><span class="feed-ic note">${icon(a.icon || 'zap')}</span><span class="grow"><div class="small" style="white-space:normal">${esc(l.text)}</div><div class="tiny faint">${esc(a.name || '')} · ${T.timeAgo(l.date)}</div></span>${icon('check', 'sm').replace('class="i sm"', 'class="i sm" style="color:var(--green)"')}</div>`; };
  const autoCard = (a) => `<div class="card auto-item ${a.on ? '' : 'off'}" id="au-${a.key}"><div class="row" style="align-items:flex-start;gap:14px"><span class="card-icon ${a.on ? 'violet' : ''}" style="width:42px;height:42px">${icon(a.icon, '')}</span><div class="grow" style="min-width:0"><div class="row" style="gap:8px;flex-wrap:wrap"><b style="font-size:15px">${esc(a.name)}</b>${ui.badge(a.cat, '')}</div><div class="small muted" style="margin-top:3px">${esc(a.desc)}</div>
    <div class="flow">${[['When', a.trigger, 'zap']].concat(a.steps.map((st, i) => [i === a.steps.length - 1 && a.steps.length > 1 ? 'Then' : 'Do', st, i ? 'check' : 'send'])).map(([k, t, ic], i) => `${i ? `<span class="flow-arrow">${icon('arrowR', 'sm')}</span>` : ''}<span class="flow-step"><span class="k">${k}</span>${esc(t)}</span>`).join('')}</div>
    <div class="row tiny faint mt-s" style="gap:14px;flex-wrap:wrap"><span><b class="num" style="color:var(--text)">${a.month}</b> runs this month</span><span>last run ${T.timeAgo(a.last)}</span></div></div>
    <div class="auto-ctl"><label class="switch"><input type="checkbox" ${a.on ? 'checked' : ''} data-change="toggleAuto" data-v="${a.key}" aria-label="Turn ${esc(a.name)} on or off"><span class="track"></span></label><button class="btn btn-xs" data-act="runAuto" data-v="${a.key}" ${a.on ? '' : 'disabled'}>${icon('play', 'sm')}Run now</button></div></div></div>`;
  A.autoCat = (el) => { S().ui.autoCat = el.dataset.v; T.save(); T.render(true); };
  A.toggleAuto = (el) => { const a = S().automations.find((x) => x.key === el.dataset.v); a.on = el.checked; T.save(); T.toast(`${a.name} ${a.on ? 'turned on' : 'paused'}`, { icon: a.on ? 'play' : 'pause' }); T.render(true); };
  A.runAuto = (el) => {
    const a = S().automations.find((x) => x.key === el.dataset.v); const txt = (a.samples && a.samples.length ? a.samples[(a.runs) % a.samples.length] : a.name + ' ran');
    T.autoRun(a.key, txt); T.save(); T.toast('Ran: ' + a.name, { icon: 'zap' });
    const box = document.getElementById('autoLog'); if (box) { const tmp = document.createElement('div'); tmp.innerHTML = logRow(Object.assign({}, S().autoLog[0], { fresh: true })); box.prepend(tmp.firstElementChild); }
    const card = document.getElementById('au-' + a.key); if (card) { card.outerHTML = autoCard(a); const c2 = document.getElementById('au-' + a.key); c2.classList.add('flash'); }
  };
  A.newAuto = () => T.form({ title: 'Request a new automation', icon: 'workflow', submitLabel: 'Send request (demo)', intro: '<p class="muted small" style="margin-top:0">Tell us what you do over and over. Our team builds it into your dashboard.</p>', fields: [{ name: 'when', label: 'When this happens...', full: true, required: true, ph: 'e.g. a customer has not been back in 60 days' }, { name: 'then', label: '...do this automatically', type: 'textarea', full: true, required: true, ph: 'e.g. text them a 15% off offer and remind me to call' }], onSubmit: () => T.toast('Request sent to Three Village Local (demo)', { icon: 'send' }) });
  function autoAfter() {
    T.every(() => {
      if (document.hidden || !cfg.live) return; const G = T.gen('al' + Date.now()); let ev = null; for (let i = 0; i < 6 && !(ev && ev.auto && ev.key); i++) ev = cfg.live(G, S()); if (!ev || !ev.key) return;
      const ok = T.autoRun(ev.key, ev.text, { notify: false }); if (!ok) return; T.save();
      const box = document.getElementById('autoLog'); if (!box) return; const tmp = document.createElement('div'); tmp.innerHTML = logRow(Object.assign({}, S().autoLog[0], { fresh: true })); box.prepend(tmp.firstElementChild); while (box.children.length > 16) box.lastElementChild.remove();
    }, 7000);
  }

  // ================= AI ASSISTANT =================
  const CORE_Q = () => [
    { q: 'How did we do this week?', roles: ['owner', 'manager'], k: /week|how (did|are) we|doing|sales|revenue/i, run: (s) => {
      const w = T.days(7), p = T.days(7, 7); const rev = T.sum(w, (d) => d.rev), pr = T.sum(p, (d) => d.rev); const best = w.slice().sort((a, b) => b.rev - a.rev)[0];
      const ch = (rev - pr) / pr; const web = T.web(7), pweb = T.web(7, 7);
      return { html: `<p>${T.isOwner() ? `You brought in <b>${T.money(rev)}</b> over the last 7 days, <b class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? 'up' : 'down'} ${T.pct(Math.abs(ch), 1)}</b> from the week before (${T.money(pr)}).` : `Sales are <b class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? 'up' : 'down'} ${T.pct(Math.abs(ch), 1)}</b> versus the week before.`} Your best day was <b>${T.dowLong[new Date(best.date).getDay()]}</b>${T.isOwner() ? ' at ' + T.money(best.rev) : ''}.</p>${cfg.aiWeek ? cfg.aiWeek(s, w, p) : ''}<p>Website visitors were ${ui.delta(T.sum(web, (d) => d.v), T.sum(pweb, (d) => d.v), { label: 'week over week' })}, and ${s.leads.filter((l) => T.daysSince(l.date) <= 7).length} leads came in through your AI website assistant.</p>`, used: [{ l: '7 days of sales', href: '#/finance' }, { l: 'Website analytics', href: '#/analytics' }, { l: 'Website leads', href: '#/leads' }] };
    } },
    { q: `Who hasn't been back in ${cfg.lapseDays || 30} days?`, roles: ['owner', 'manager'], k: /back|lapsed|haven.?t|hasn.?t|miss|win.?back|churn/i, run: (s) => {
      const d = cfg.lapseDays || 30; const L = s.customers.filter((c) => c.lastVisit && T.daysSince(c.lastVisit) >= d && T.daysSince(c.lastVisit) <= d * 5 && c.visits >= 3 && (!cfg.lapseFilter || cfg.lapseFilter(c))).sort((a, b) => b.ltv - a.ltv);
      const top = L.slice(0, 7);
      return { html: `<p><b>${L.length} regulars</b> have not been back in ${d}+ days. Together they are worth <b>${T.money(T.sum(L, (c) => c.ltv))}</b> in lifetime value. The most valuable:</p><ul>${top.map((c) => `<li><a href="#/customers/${c.id}">${esc(T.fullName(c))}</a>, ${c.visits} ${esc((cfg.crm.visitWord || 'visits').toLowerCase())}, last seen ${T.timeAgo(c.lastVisit)}</li>`).join('')}</ul><div class="draft">${esc(cfg.winbackText(top[0] || { first: 'there' }))}</div><div class="row-wrap mt-s"><button class="btn btn-sm btn-primary" data-act="aiWinback" data-v="${L.length}">${icon('send', 'sm')}Send to all ${L.length} (demo)</button></div>`, used: top.map((c) => ({ l: T.fullName(c), href: '#/customers/' + c.id })) };
    } },
    { q: "What's my busiest day?", k: /busiest|busy|slow|which day|best day/i, run: (s) => {
      const ds = T.days(56); const by = T.dow.map((_, i) => T.avg(ds.filter((d) => new Date(d.date).getDay() === i), (d) => cfg.busyMetric ? cfg.busyMetric(d) : d.rev));
      const order = by.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
      const f = cfg.busyFmt || T.money;
      return { html: `<p><b>${T.dowLong[order[0][1]]}</b> is your busiest day, averaging <b>${f(order[0][0])}</b>${cfg.busyFmt ? '' : ' in sales'} over the last 8 weeks. <b>${T.dowLong[order[6][1]]}</b> is the slowest (${f(order[6][0])}), a good night for a promotion.</p>${ui.hbars([1, 2, 3, 4, 5, 6, 0].map((i) => ({ label: T.dowLong[i], value: Math.round(by[i]) })), f)}`, used: [{ l: '56 days of ' + (cfg.busyLabel || 'sales').replace(/^in /, ''), href: T.isEmp() ? '#/calendar' : '#/finance' }] };
    } },
    { q: 'What needs my attention today?', k: /attention|today|urgent|priorit|what should/i, run: (s) => {
      if (T.isEmp()) { const me = T.me(); const ts = s.tasks.filter((t) => t.who === me.id && !t.done); return { html: `<p>You have <b>${ts.length} open tasks</b>.</p><ul>${ts.slice(0, 6).map((t) => `<li>${esc(t.title)} (${T.relDay(t.due)})</li>`).join('')}</ul>`, used: [{ l: 'My tasks', href: '#/tasks' }] }; }
      const al = cfg.alerts(s).slice(0, 5); const nl = s.leads.filter((l) => l.status === 'new'); const rv = s.reviews.filter((r) => r.status !== 'posted'); const ap = s.posts.filter((p) => p.status === 'approval');
      return { html: `<p>Here is what I would tackle first:</p><ul>${al.map((a) => `<li><b>${esc(a.title)}</b>: ${esc(a.text)}</li>`).join('')}${nl.length ? `<li><b>${nl.length} new website leads</b> waiting for a reply.</li>` : ''}${rv.length ? `<li><b>${rv.length} reviews</b> have AI reply drafts ready to approve.</li>` : ''}${ap.length ? `<li><b>${ap.length} social posts</b> are awaiting your approval.</li>` : ''}</ul>`, used: [{ l: 'Alerts', href: '#/' }, { l: 'Leads', href: '#/leads' }, { l: 'Reviews', href: '#/reviews' }, { l: 'Social studio', href: '#/social' }] };
    } },
    { q: 'Where are new customers coming from?', roles: ['owner', 'manager'], k: /where|source|coming from|find us|found/i, run: (s) => {
      const rec = s.customers.filter((c) => T.daysSince(c.created) <= 120); const by = {}; rec.forEach((c) => { by[c.source] = (by[c.source] || 0) + 1; });
      const arr = Object.keys(by).map((k) => ({ label: k, value: by[k] })).sort((a, b) => b.value - a.value);
      return { html: `<p>In the last 4 months you added <b>${rec.length} new ${esc(cfg.crm.label.toLowerCase())}</b>. Top source: <b>${esc(arr[0].label)}</b> (${arr[0].value}).${by['Three Village Local'] ? ` Three Village Local sent you <b>${by['Three Village Local']}</b>.` : ''}</p>${ui.hbars(arr.slice(0, 6), T.num)}`, used: rec.slice(0, 4).map((c) => ({ l: T.fullName(c), href: '#/customers/' + c.id })).concat([{ l: 'Marketing', href: '#/marketing' }]) };
    } },
    { q: 'How are our reviews?', roles: ['owner', 'manager'], k: /review|rating|stars|reputation/i, run: (s) => {
      const r30 = s.reviews.filter((r) => T.daysSince(r.date) <= 30); const low = s.reviews.filter((r) => r.rating <= 3 && r.status !== 'posted');
      return { html: `<p>You got <b>${r30.length} new reviews</b> in the last 30 days averaging <b>${T.avg(r30, (r) => r.rating).toFixed(2)} stars</b>. Google shows ${(s.x.googleRating || 4.7).toFixed(1)} stars overall.</p>${low.length ? `<p>${low.length} lower review${low.length > 1 ? 's need' : ' needs'} a thoughtful reply. I drafted responses for you to approve.</p>` : ''}`, used: r30.slice(0, 4).map((r) => ({ l: r.author, href: '#/reviews' })) };
    } }
  ];
  const allQ = () => CORE_Q().concat(cfg.ai || []).filter((q) => T.can(q.roles));
  A.aiWinback = (el) => { T.toast(`Win-back text queued for ${el.dataset.v} ${cfg.crm.label.toLowerCase()} (demo)`, { icon: 'send' }); T.autoRun('winback', `Win-back offer texted to ${el.dataset.v} ${cfg.crm.label.toLowerCase()}`); T.save(); };
  A.aiSavePost = (el) => { const i = JSON.parse(el.dataset.v); S().posts.push({ id: T.uid('p'), platform: i.platform || 'instagram', title: i.title, sub: i.sub, tag: i.tag || 'AI draft', caption: i.caption, date: T.at(0, 17), status: 'approval', by: 'AI assistant', stats: null }); T.save(); T.toast('Saved to the social studio for approval', { icon: 'image' }); T.refreshNav(); };
  T.aiPostDraft = (i) => `<div class="draft">${esc(i.caption)}</div><div style="max-width:220px;margin-top:10px">${ui.art({ title: i.title, sub: i.sub, tag: i.tag || 'AI draft', shape: 'sq', seed: i.title })}</div><div class="row-wrap mt-s"><button class="btn btn-sm btn-primary" data-act="aiSavePost" data-v="${esc(JSON.stringify(i))}">${icon('check', 'sm')}Send to studio for approval</button></div>`;
  A.ai = () => {
    const qs = allQ();
    const d = T.drawer({ title: 'Ask your business anything', cls: 'ai-panel', head: `<span class="ai-mark">${icon('sparkles')}</span><div><h2>Ask your business anything</h2><small>Answers come from your own data</small></div>`, body: `<div class="ai-thread" id="aiThread"><div class="msg-a">Hi ${esc(T.role().person.split(' ')[0])}! I know your ${esc(cfg.crm.label.toLowerCase())}, schedule, sales, reviews and marketing. Try one of these:</div><div class="suggest">${qs.map((q, i) => `<button data-act="aiAsk" data-v="${i}">${icon('sparkles', 'sm')}${esc(q.q)}</button>`).join('')}</div></div>`, foot: `<form class="ai-input" id="aiForm" style="padding:0;border:0;width:100%"><input class="input" id="aiIn" placeholder="Ask about ${esc(cfg.crm.label.toLowerCase())}, sales, reviews..." aria-label="Ask a question" autocomplete="off"><button class="btn btn-primary" type="submit" aria-label="Send">${icon('send', 'sm')}</button></form>` });
    d.querySelector('#aiForm').addEventListener('submit', (e) => { e.preventDefault(); const v = d.querySelector('#aiIn').value.trim(); if (!v) return; d.querySelector('#aiIn').value = ''; const q = qs.find((x) => x.k && x.k.test(v)); ask(v, q); });
  };
  A.aiAsk = (el) => { const q = allQ()[+el.dataset.v]; ask(q.q, q); };
  function ask(text, q) {
    const th = document.getElementById('aiThread'); if (!th) return;
    const sg = th.querySelector('.suggest'); if (sg) sg.remove();
    th.insertAdjacentHTML('beforeend', `<div class="msg-u">${esc(text)}</div><div class="msg-a" id="aiTyping"><span class="typing"><i></i><i></i><i></i></span> <span class="small faint">Looking through your data...</span></div>`);
    const b = th.closest('.drawer-b'); b.scrollTop = b.scrollHeight;
    setTimeout(() => {
      const t = document.getElementById('aiTyping'); if (!t) return;
      let res;
      try { res = q ? q.run(S()) : { html: `<p>I can answer questions about your ${esc(cfg.crm.label.toLowerCase())}, sales, schedule, reviews and marketing. In this demo, try one of these:</p>` }; } catch (e) { console.error(e); res = { html: '<p>Sorry, I could not work that out.</p>' }; }
      t.removeAttribute('id'); t.classList.add('fade-in');
      t.innerHTML = res.html + (res.used && res.used.length ? `<div class="used">${icon('file', 'sm').replace('class="i sm"', 'class="i sm" style="width:12px;height:12px;vertical-align:-2px"')} Based on: ${res.used.slice(0, 8).map((u) => `<a href="${u.href}" data-act="aiGo">${esc(u.l)}</a>`).join('')}</div>` : '');
      const qs = allQ().filter((x) => !q || x.q !== q.q).slice(0, 4);
      th.insertAdjacentHTML('beforeend', `<div class="suggest">${qs.map((x) => `<button data-act="aiAsk" data-v="${allQ().findIndex((y) => y.q === x.q)}">${icon('sparkles', 'sm')}${esc(x.q)}</button>`).join('')}</div>`);
      t.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 750);
  }
  A.aiGo = (el) => { T.closeDrawer(); T.go(el.getAttribute('href')); };

  // intervals registered per page render
  T._iv = [];
  T.every = (fn, ms) => { T._iv.push(setInterval(fn, ms)); };
  T.clearEvery = () => { T._iv.forEach(clearInterval); T._iv = []; };

  T.registerInsights = (config) => {
    cfg = config;
    Object.assign(T.pages, {
      analytics: { title: 'Analytics', icon: 'chart', render: analyticsPage },
      automations: { title: 'Automations', icon: 'workflow', render: automationsPage, after: autoAfter, count: () => 0 }
    });
  };
})();
