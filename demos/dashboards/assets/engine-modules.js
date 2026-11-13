/* Three Village Local dashboards engine - shared modules (every dashboard gets these, adapted by config) */
(function () {
  'use strict';
  const T = window.TVL; const { icon, esc, ui } = T; const S = T.S; const A = T.actions;
  let cfg;

  // ================= SEED =================
  T.seedCustomers = (G, n, extra) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const nm = G.name();
      const created = G.daysAgoISO(5, 1100);
      const c = { id: 'c' + (i + 1), first: nm.first, last: nm.last, phone: G.phone(), email: G.email(nm.first, nm.last), town: G.town(.7), tags: [], source: G.weighted(cfg.sources), created, lastVisit: null, visits: 0, ltv: 0, birthday: new Date(1960 + G.int(0, 42), G.int(0, 11), G.int(1, 28), 12).toISOString(), notes: '', next: null, staff: null, timeline: [] };
      extra(c, i, G);
      out.push(c);
    }
    return out;
  };
  T.buildSeed = () => {
    const G = T.gen(cfg.id + '-seed-v' + cfg.version);
    const s = {
      version: cfg.version, seededAt: T.today0().toISOString(),
      settings: { bizName: cfg.name, role: 'owner', dark: false, collapsed: false, brandColor: null, profile: Object.assign({}, cfg.profile) },
      ui: { range: 30, calView: window.innerWidth < 760 ? 'day' : 'week', calOff: 0, socialOff: 0, crmSeg: 'all', crmQ: '', crmSort: 'recent', taskView: 'person', taskFilter: 'open', reviewFilter: 'all', postFilter: 'all', leadSel: null, aTab: 'website' },
      feed: [], notifs: [], autoLog: [], customers: [], events: [], invoices: [], leads: [], posts: [], reviews: [], asks: {}, tasks: [], campaigns: [], automations: [], clock: { in: null, log: [] },
      team: cfg.team.map((m) => Object.assign({}, m)), x: {}
    };
    cfg.seed(G, s);
    const ch = cfg.clockHours || [9, 17]; s.clock.log = [1, 2, 4].map((k) => ({ in: T.at(-k, ch[0], G.pick([0, 2, 5])), out: T.at(-k, ch[1], G.pick([0, 4, 12])) }));
    // automations + run history
    s.automations = cfg.automations.map((a, i) => Object.assign({ on: a.on !== false, runs: G.int(140, 900), month: G.int(a.monthMin || 20, a.monthMax || 90), last: G.daysAgoISO(0, 1, 7, 18) }, a));
    const logs = [];
    s.automations.forEach((a) => { (a.samples || []).forEach((txt, k) => { logs.push({ id: 'r' + a.key + k, key: a.key, text: txt, date: new Date(Date.now() - G.int(10, 60 * 70) * 60000).toISOString(), ok: true }); }); });
    s.autoLog = logs.sort((a, b) => b.date.localeCompare(a.date));
    // feed + notifications from automation log and seed feed
    const autos = s.autoLog.slice(0, 10).map((l) => { const a = s.automations.find((x) => x.key === l.key); return { id: 'f' + l.id, icon: a.icon, text: l.text, href: '#/automations', auto: true, date: l.date }; });
    s.feed = autos.concat(s.feed).sort((a, b) => b.date.localeCompare(a.date));
    s.notifs = s.notifs.concat(autos.slice(0, 4).map((f) => Object.assign({}, f, { id: 'n' + f.id, read: false }))).sort((a, b) => b.date.localeCompare(a.date));
    return s;
  };

  // ================= DAILY FINANCIALS (deterministic per date) =================
  const dayCache = {};
  T.dayData = (date) => {
    const k = T.isoDate(date); if (dayCache[k]) return dayCache[k];
    const d = new Date(date); const r = T.dayRng(cfg.id + 'day', d); const ago = -T.dayDiff(d);
    const o = cfg.daily(r, d, d.getDay(), ago);
    if (ago === 0) { const h = new Date().getHours() + new Date().getMinutes() / 60; const f = T.clamp(cfg.dayProgress ? cfg.dayProgress(h) : (h - 8) / 13, 0.05, 1); Object.keys(o).forEach((x) => { if (typeof o[x] === 'number' && !/pct|rate|avg/i.test(x)) o[x] = Math.round(o[x] * f); }); o.partial = f < 1; }
    o.date = T.sod(d).toISOString(); o.exp = (o.cogs || 0) + (o.labor || 0) + (o.other || 0);
    dayCache[k] = o; return o;
  };
  T.days = (n, endOff) => { const out = []; const e = endOff || 0; for (let i = n - 1 + e; i >= e; i--) out.push(T.dayData(T.addDays(T.today0(), -i))); return out; };
  T.months = (n) => { const out = []; const t = T.today0(); for (let m = n - 1; m >= 0; m--) { const st = new Date(t.getFullYear(), t.getMonth() - m, 1); const en = new Date(t.getFullYear(), t.getMonth() - m + 1, 0); const days = []; for (let d = new Date(st); d <= en && d <= t; d.setDate(d.getDate() + 1)) days.push(T.dayData(d)); out.push({ label: st.toLocaleDateString('en-US', { month: 'short' }), full: st.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), rev: T.sum(days, (x) => x.rev), exp: T.sum(days, (x) => x.exp), labor: T.sum(days, (x) => x.labor || 0), cogs: T.sum(days, (x) => x.cogs || 0), days }); } return out; };
  T.rangeLabel = (n) => n === 7 ? 'Last 7 days' : n === 30 ? 'Last 30 days' : n === 90 ? 'Last 90 days' : 'Last 12 months';
  T.rangeSeg = () => ui.seg([{ v: '7', l: '7D' }, { v: '30', l: '30D' }, { v: '90', l: '90D' }, { v: '365', l: '12M' }], String(S().ui.range), 'setRange');
  A.setRange = (el) => { S().ui.range = +el.dataset.v; T.save(); T.render(true); };

  // ================= HOME =================
  function homeOwner() {
    const s = S(); const b = cfg.briefing(s); const role = T.role();
    const kpis = cfg.kpis(s).filter((k) => T.can(k.roles));
    const today = cfg.today(s, null);
    const alerts = cfg.alerts(s).filter((a) => T.can(a.roles));
    const feed = s.feed.slice(0, 9);
    const autos = s.automations.filter((a) => a.on);
    const qa = (cfg.quickActions || []).filter((q) => T.can(q.roles)).slice(0, 6);
    const newLeads = s.leads.filter((l) => l.status === 'new');
    const d30 = T.days(30); const p30 = T.days(30, 30);
    return `
      <section class="hero fade-in">${cfg.heroArt ? `<div class="art">${cfg.heroArt}</div>` : ''}
        <div class="chip-ai">${icon('sparkles', 'sm')} Here's your day · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h2>${T.greeting()}, ${esc(role.person.split(' ')[0])}.</h2>
        <div class="brief-text">${b.text}</div>
        <div class="brief-grid">${b.stats.map((x, i) => `<a class="brief-item" href="${x.href || '#/'}" style="animation-delay:${i * 60}ms"><div class="n" data-count="${x.n}" data-fmt="${x.fmt || 'num'}">${x.n}</div><div class="t">${esc(x.t)}</div></a>`).join('')}</div>
        <div class="brief-actions">${b.actions.map((a, i) => a.href ? `<a class="btn btn-sm ${i === 0 ? 'btn-accent' : ''}" href="${a.href}">${icon(a.icon || 'arrowR', 'sm')}${esc(a.l)}</a>` : `<button class="btn btn-sm ${i === 0 ? 'btn-accent' : ''}" data-act="${a.act}" data-v="${esc(a.v || '')}">${icon(a.icon || 'sparkles', 'sm')}${esc(a.l)}</button>`).join('')}</div>
      </section>
      <div class="kpis">${kpis.map(ui.kpi).join('')}</div>
      ${T.teamStrip ? T.teamStrip() : ''}
      ${T.can(['owner', 'manager']) && T.marketingPulse ? T.marketingPulse() : ''}
      <div class="grid dash">
        <div class="grid">
          ${ui.card({ title: esc(cfg.todayTitle || "Today's schedule"), sub: today.length + ' on the books', icon: 'calendar', right: `<a class="btn btn-sm" href="#/${cfg.todayHref || 'calendar'}">Open ${icon('chevR', 'sm')}</a>`, flush: true, body: today.length ? `<div class="list">${today.slice(0, 7).map(schedRow).join('')}</div>` : ui.empty('Nothing scheduled today', 'calendar') })}
          ${T.isOwner() ? ui.card({ title: 'Revenue, last 30 days', sub: `${T.money(T.sum(d30, (x) => x.rev))} · ${ui.delta(T.sum(d30, (x) => x.rev), T.sum(p30, (x) => x.rev), { label: 'vs prior 30 days' })}`, icon: 'trend', tone: 'green', right: '<span class="sample">Sample data</span>', body: ui.line({ labels: d30.map((x) => T.fmtDate(x.date)), series: [{ name: 'This period', values: d30.map((x) => x.rev) }, { name: 'Prior 30 days', values: p30.map((x) => x.rev), color: 'var(--chart-3)', dash: true }], fmt: T.short, h: 200, ticks: 6 }) }) : (cfg.managerChart ? cfg.managerChart(s) : '')}
          ${ui.card({ title: 'Live activity', sub: 'Your team, your customers and your automations', icon: 'activity', tone: 'blue', right: '<span class="badge b-green"><span class="live-dot" style="width:7px;height:7px"></span> Live</span>', flush: true, body: `<div id="liveFeed">${feed.map(feedRow).join('')}</div>` })}
        </div>
        <div class="grid">
          ${ui.card({ title: 'Needs your attention', sub: alerts.length + ' items', icon: 'alert', tone: 'amber', flush: true, body: alerts.length ? alerts.slice(0, 6).map(alertRow).join('') : ui.empty('All clear') })}
          ${ui.card({ title: 'Quick actions', icon: 'zap', body: `<div class="qa-grid">${qa.map((q) => `<button class="qa" data-act="${q.act}" data-v="${esc(q.v || '')}">${icon(q.icon, 'lg')}${esc(q.label)}</button>`).join('')}</div>` })}
          ${ui.card({ cls: 'auto-card', title: 'Automations working for you', sub: `${autos.length} running`, icon: 'workflow', tone: 'violet', right: '<a class="btn btn-sm" href="#/automations">View all</a>', body: `<div class="row" style="gap:16px;align-items:flex-end"><div><div class="big-num" data-count="${T.sum(autos, (a) => a.month)}">${T.sum(autos, (a) => a.month)}</div><div class="small muted">tasks done for you this month</div></div><div class="spacer"></div><div class="right"><div class="b num" data-count="${autos.length}">${autos.length}</div><div class="small muted">running 24/7</div></div></div><div class="list mt-s">${s.autoLog.slice(0, 3).map((l) => `<div class="row small" style="padding:7px 0;border-top:1px solid var(--border)"><span class="auto-tag">${icon('zap', 'sm')}Auto</span><span class="ellip grow">${esc(l.text)}</span><span class="faint nowrap">${T.timeAgo(l.date)}</span></div>`).join('')}</div>` })}
          ${ui.card({ title: 'Leads from your AI website assistant', sub: `${newLeads.length} new`, icon: 'bot', tone: 'blue', right: '<a class="btn btn-sm" href="#/leads">Inbox</a>', flush: true, body: s.leads.slice(0, 4).map((l) => `<a class="li click" href="#/leads/${l.id}">${T.avatar(l.name, 'sm')}<span class="grow"><div class="t1">${esc(l.name)} ${l.status === 'new' ? ui.badge('New', 'red') : ''}</div><div class="t2">${esc(l.intent)}</div></span><span class="tiny faint nowrap">${T.timeAgo(l.date)}</span></a>`).join('') })}
        </div>
      </div>`;
  }
  const schedRow = (x) => `<a class="li click" href="${x.href || '#/calendar'}"><div class="time-pill"><b>${esc(x.time)}</b><span>${esc(x.dur || '')}</span></div><span class="vbar" style="background:${x.color || 'var(--chart-1)'}"></span><span class="grow"><div class="t1">${esc(x.title)}</div><div class="t2">${esc(x.sub || '')}</div></span>${x.tag ? `<span class="badge" style="background:color-mix(in srgb, ${x.color || 'var(--chart-1)'} 14%, transparent);color:var(--text)">${esc(x.tag)}</span>` : ''}</a>`;
  T.schedRow = schedRow;
  const feedRow = (f) => `<a class="feed-item li click ${f.fresh ? 'flash' : ''}" href="${f.href || '#/'}" style="border-top:1px solid var(--border)"><span class="feed-ic ${f.auto ? 'note' : f.tone || ''}">${icon(f.icon || 'activity')}</span><span class="feed-body"><div class="small" style="white-space:normal">${esc(f.text)}</div><div class="meta">${T.timeAgo(f.date)}${f.auto ? ` · <span class="auto-tag">${icon('zap', 'sm')}Automated</span>` : ''}</div></span></a>`;
  T.feedRow = feedRow;
  T.feedRow = feedRow;
  const alertRow = (a) => `<div class="alert-item"><span class="card-icon ${a.tone || 'amber'}">${icon(a.icon || 'alert', 'sm')}</span><div class="grow"><div class="kind">${esc(a.kind || '')}</div><div class="b">${a.href ? `<a href="${a.href}">${esc(a.title)}</a>` : esc(a.title)}</div><div class="why">${esc(a.text)}</div>${a.acts && a.acts.length ? `<div class="acts">${a.acts.map((x) => x.href ? `<a class="btn btn-xs" href="${x.href}">${esc(x.l)}</a>` : `<button class="btn btn-xs" data-act="${x.act}" data-v="${esc(x.v || '')}" data-id="${esc(x.id || '')}">${esc(x.l)}</button>`).join('')}</div>` : ''}</div></div>`;
  T.alertRow = alertRow;

  function homeEmployee() {
    const s = S(); const me = T.me(); const E = cfg.employee; const sh = E.shift(s, me);
    const items = E.items(s, me); const myTasks = s.tasks.filter((t) => t.who === me.id && !t.done);
    const clocked = s.clock.in; const stats = E.stats(s, me);
    return `
      <section class="hero fade-in"><div class="chip-ai">${icon('clock', 'sm')} Your shift today · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h2>Hi ${esc(me.name.split(' ')[0])}, ${sh ? `you're on ${esc(sh.label)}.` : 'no shift today.'}</h2>
        <div class="brief-text">${sh ? `${esc(sh.detail)}` : 'Enjoy the day off. Your schedule for the week is below.'}</div>
        <div class="brief-grid">${stats.map((x) => `<div class="brief-item"><div class="n" data-count="${x.n}">${x.n}</div><div class="t">${esc(x.t)}</div></div>`).join('')}</div>
        <div class="brief-actions">${sh ? `<button class="btn ${clocked ? '' : 'btn-accent'}" data-act="clock" style="min-width:150px">${icon(clocked ? 'logout' : 'login', 'sm')}${clocked ? 'Clock out' : 'Clock in'}</button>${clocked ? `<span class="clock-timer" id="clockTimer" data-since="${clocked}"></span>` : ''}` : ''}<button class="btn btn-sm" data-act="ai">${icon('sparkles', 'sm')}Ask a question</button></div>
      </section>
      <div class="grid dash">
        <div class="grid">
          ${ui.card({ title: esc(E.itemsTitle), sub: items.length + ' today', icon: E.itemsIcon || 'calendar', flush: true, body: items.length ? `<div class="list">${items.map(schedRow).join('')}</div>` : ui.empty('Nothing assigned yet', 'calendar') })}
          ${E.extra ? E.extra(s, me) : ''}
        </div>
        <div class="grid">
          ${ui.card({ title: 'My tasks', sub: myTasks.length + ' open', icon: 'tasks', tone: 'green', right: '<a class="btn btn-sm" href="#/tasks">All</a>', flush: true, body: myTasks.length ? myTasks.slice(0, 6).map(taskRow).join('') : ui.empty('No open tasks. Nice work.') })}
          ${ui.card({ title: 'Team notes', icon: 'msg', tone: 'blue', body: (E.notes || []).map((n) => `<div class="row small" style="align-items:flex-start;padding:6px 0">${T.avatar(n.from, 'sm')}<div><b>${esc(n.from)}</b><div class="muted">${esc(n.text)}</div></div></div>`).join('') })}
          ${ui.card({ title: 'Clock history', sub: 'This week', icon: 'clock', tone: 'violet', flush: true, body: (s.clock.log.length ? s.clock.log : []).slice(0, 5).map((c) => `<div class="li"><span class="grow"><div class="t1">${T.relDay(c.in)}</div><div class="t2">${T.fmtTime(c.in)} to ${T.fmtTime(c.out)}</div></span><b class="num">${((new Date(c.out) - new Date(c.in)) / 36e5).toFixed(1)} h</b></div>`).join('') || ui.empty('No shifts clocked yet this week', 'clock') })}
        </div>
      </div>`;
  }
  A.clock = () => {
    const s = S(); const me = T.me();
    if (s.clock.in) { s.clock.log.unshift({ in: s.clock.in, out: new Date().toISOString() }); s.clock.in = null; T.toast('Clocked out. Have a great night!', { icon: 'logout' }); T.feed({ icon: 'logout', text: `${me.name} clocked out`, href: '#/' }); }
    else { s.clock.in = new Date().toISOString(); T.toast(`Clocked in at ${T.fmtTime(s.clock.in)}`, { icon: 'login' }); T.feed({ icon: 'login', text: `${me.name} clocked in`, href: '#/' }); }
    T.save(); T.render(true);
  };
  T.pagesCore = () => ({
    home: { title: 'Command Center', navLabel: 'Command Center', tabLabel: 'Home', icon: 'home', roles: ['owner', 'manager', 'employee'], render: () => T.isEmp() ? homeEmployee() : homeOwner(),
      after: () => {
        const t = document.getElementById('clockTimer');
        if (t) { const tick = () => { const ms = Date.now() - new Date(t.dataset.since); const h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60, sc = Math.floor(ms / 1000) % 60; t.textContent = `On the clock ${h}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`; }; tick(); T.every(tick, 1000); }
      } }
  });
  // live ticker on the home screen
  T.startLive = () => {
    const G = T.gen(cfg.id + 'live' + Date.now());
    setInterval(() => {
      if (document.hidden || T.route().key !== 'home' || T.isEmp() || !cfg.live) return;
      const box = document.getElementById('liveFeed'); if (!box) return;
      const ev = cfg.live(G, S()); if (!ev) return;
      if (ev.auto && ev.key) { const a = S().automations.find((x) => x.key === ev.key); if (!a || !a.on) return; a.runs++; a.month++; a.last = new Date().toISOString(); S().autoLog.unshift({ id: T.uid('r'), key: ev.key, text: ev.text, date: a.last, ok: true }); }
      const f = T.feed(ev); T.save();
      const tmp = document.createElement('div'); tmp.innerHTML = feedRow(Object.assign({}, f, { fresh: true }));
      const node = tmp.firstElementChild; node.classList.add('fade-in'); box.prepend(node);
      while (box.children.length > 9) box.lastElementChild.remove();
    }, 9000);
  };

  // ================= TASKS =================
  const taskRow = (t) => {
    const who = T.byId(S().team, t.who); const dd = t.due ? T.dayDiff(t.due) : null;
    const due = t.due ? (dd < 0 && !t.done ? `<span class="down">${icon('clock', 'sm').replace('class="i sm"', 'class="i sm" style="width:12px;height:12px;vertical-align:-2px"')} ${T.relDay(t.due)}</span>` : T.relDay(t.due)) : 'No date';
    return `<div class="li" data-task="${t.id}"><button class="check tap ${t.done ? 'on' : ''}" data-act="toggleTask" data-id="${t.id}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}">${icon('check')}</button><span class="grow"><div class="t1 ${t.done ? 'done-text' : ''}" style="white-space:normal">${t.pri === 'high' && !t.done ? '<span style="color:var(--red)">●</span> ' : ''}${esc(t.title)}</div><div class="t2">${due}${who ? ' · ' + esc(who.name) : ''}${t.auto ? ` · <span class="auto-tag">${icon('zap', 'sm')}Auto-created</span>` : ''}</div></span>${t.href ? `<a class="btn btn-xs btn-ghost" href="${t.href}" aria-label="Open">${icon('chevR', 'sm')}</a>` : ''}</div>`;
  };
  T.taskRow = taskRow;
  A.toggleTask = (el) => {
    const t = T.byId(S().tasks, el.dataset.id); if (!t) return; t.done = !t.done; t.doneAt = t.done ? new Date().toISOString() : null; T.save();
    el.classList.toggle('on', t.done); const row = el.closest('.li'); if (row) row.querySelector('.t1').classList.toggle('done-text', t.done);
    if (t.done) { T.toast('Task completed', { action: { label: 'Undo', fn: () => { t.done = false; T.save(); T.render(true); } } }); T.feed({ icon: 'check', text: `${(T.byId(S().team, t.who) || {}).name || 'Someone'} completed: ${t.title}`, href: '#/tasks' }); }
    T.refreshNav();
  };
  A.newTask = (el) => {
    const team = S().team; const me = T.me();
    T.form({ title: 'New task', icon: 'tasks', submitLabel: 'Add task', fields: [
      { name: 'title', label: 'Task', full: true, required: true, ph: 'e.g. Call back about Saturday' },
      { name: 'who', label: 'Assign to', type: 'select', options: (me ? [me] : team).map((m) => ({ v: m.id, l: m.name + ' (' + m.title + ')' })), value: me ? me.id : (el && el.dataset && el.dataset.v) || team[0].id },
      { name: 'due', label: 'Due date', type: 'date', value: T.isoDate(new Date()) },
      { name: 'pri', label: 'Priority', type: 'select', options: [{ v: 'normal', l: 'Normal' }, { v: 'high', l: 'High' }] }],
      onSubmit: (d) => { S().tasks.unshift({ id: T.uid('k'), title: d.title, who: d.who, due: T.fromDT(d.due, '17:00'), done: false, pri: d.pri }); T.save(); T.toast('Task added'); T.refreshNav(); T.render(true); } });
  };
  A.taskView = (el) => { S().ui.taskView = el.dataset.v; T.save(); T.render(true); };
  A.taskFilter = (el) => { S().ui.taskFilter = el.dataset.v; T.save(); T.render(true); };
  function tasksPage() {
    const s = S(); const emp = T.isEmp(); const me = T.me(); const f = s.ui.taskFilter;
    let tasks = s.tasks.filter((t) => !emp || t.who === me.id);
    const counts = { open: tasks.filter((t) => !t.done).length, today: tasks.filter((t) => !t.done && T.dayDiff(t.due) <= 0).length, done: tasks.filter((t) => t.done).length };
    tasks = tasks.filter((t) => f === 'done' ? t.done : f === 'today' ? !t.done && T.dayDiff(t.due) <= 0 : !t.done).sort((a, b) => (a.due || '').localeCompare(b.due || ''));
    const view = emp ? 'list' : s.ui.taskView;
    const team = s.team;
    let body;
    if (view === 'person') body = `<div class="grid g-3">${team.map((m) => { const ts = tasks.filter((t) => t.who === m.id); return ui.card({ title: esc(m.name), sub: esc(m.title) + ' · ' + ts.length + ' tasks', icon: 'user', right: `<button class="icon-btn" data-act="newTask" data-v="${m.id}" aria-label="Add task for ${esc(m.name)}">${icon('plus', 'sm')}</button>`, flush: true, body: ts.length ? ts.map(taskRow).join('') : ui.empty('Nothing here', 'check') }); }).join('')}</div>`;
    else body = ui.card({ flush: true, body: tasks.length ? tasks.map(taskRow).join('') : ui.empty('Nothing here', 'check') });
    const roster = emp ? '' : `<h2 class="sec-title mt">Team roster</h2><div class="grid g-4">${team.map((m) => `<div class="card" style="padding:16px"><div class="row">${T.avatar(m.name, '', m.color)}<div style="min-width:0"><div class="b ellip">${esc(m.name)}</div><div class="small muted">${esc(m.title)}</div></div></div><div class="row-wrap mt-s">${ui.badge(m.roleKey === 'owner' ? 'Owner access' : m.roleKey === 'manager' ? 'Manager access' : 'Staff access', m.roleKey === 'owner' ? 'brand' : m.roleKey === 'manager' ? 'blue' : '')}<span class="small faint">${s.tasks.filter((t) => t.who === m.id && !t.done).length} open tasks</span></div></div>`).join('')}</div>`;
    return ui.pageHead({ title: emp ? 'My tasks' : 'Tasks & team', sub: emp ? 'Everything assigned to you' : 'Who is doing what, and by when', actions: `${emp ? '' : ui.seg([{ v: 'person', l: 'By person', ic: 'users' }, { v: 'list', l: 'List', ic: 'list' }], view, 'taskView')}<button class="btn btn-primary" data-act="newTask">${icon('plus', 'sm')}New task</button>` })
      + `<div class="filterbar">${ui.chips([{ v: 'open', l: 'Open', n: counts.open }, { v: 'today', l: 'Due today or overdue', n: counts.today }, { v: 'done', l: 'Completed', n: counts.done }], f, 'taskFilter')}</div>` + body + roster;
  }

  // ================= CRM =================
  function crmFilter() {
    const s = S(); const q = (s.ui.crmQ || '').toLowerCase(); const seg = (cfg.crm.segments || []).find((x) => x.v === s.ui.crmSeg);
    let list = s.customers.slice();
    if (T.isEmp() && cfg.crm.mine) list = list.filter((c) => cfg.crm.mine(c, T.me()));
    if (seg && seg.f) list = list.filter(seg.f);
    if (q) list = list.filter((c) => (T.fullName(c) + ' ' + c.email + ' ' + c.phone + ' ' + c.tags.join(' ') + ' ' + c.town).toLowerCase().includes(q));
    const so = s.ui.crmSort;
    list.sort(so === 'ltv' ? (a, b) => b.ltv - a.ltv : so === 'name' ? (a, b) => a.first.localeCompare(b.first) : (a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || ''));
    return list;
  }
  function crmRows(list) {
    const emp = T.isEmp();
    const cols = [{ l: cfg.crm.singular, v: (c) => `<span class="name-cell">${T.avatar(T.fullName(c))}<span style="min-width:0"><b class="ellip">${esc(T.fullName(c))}</b><span class="small faint ellip" style="display:block">${esc(c.town)}</span></span></span>` }]
      .concat(cfg.crm.columns.filter((x) => T.can(x.roles)))
      .concat([{ l: 'Tags', v: (c) => `<span class="row-wrap" style="gap:4px;justify-content:flex-end">${c.tags.slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>` }])
      .concat(emp ? [] : [{ l: 'Lifetime value', r: true, v: (c) => `<b class="num">${T.money(c.ltv)}</b>` }])
      .concat([{ l: 'Last ' + (cfg.crm.visitWord || 'visit').toLowerCase().replace(/s$/, ''), r: true, v: (c) => `<span class="small ${T.daysSince(c.lastVisit) > 45 ? 'down' : 'muted'}">${c.lastVisit ? T.timeAgo(c.lastVisit) : 'Never'}</span>` }]);
    return ui.table({ cols, rows: list, rowAct: 'openCustomer', empty: 'No matches. Try another search.' });
  }
  function crmPage() {
    const s = S(); const list = crmFilter(); const shown = list.slice(0, s.ui.crmLimit || 40);
    const segs = [{ v: 'all', l: 'All', n: (T.isEmp() && cfg.crm.mine ? s.customers.filter((c) => cfg.crm.mine(c, T.me())) : s.customers).length }].concat((cfg.crm.segments || []).filter((x) => !T.isEmp() || x.emp).map((x) => ({ v: x.v, l: x.l, n: s.customers.filter((c) => (!T.isEmp() || !cfg.crm.mine || cfg.crm.mine(c, T.me())) && x.f(c)).length })));
    const tot = T.sum(s.customers, (c) => c.ltv);
    return ui.pageHead({ title: T.isEmp() ? 'My ' + cfg.crm.label.toLowerCase() : cfg.crm.label, sub: T.isEmp() ? `${cfg.crm.label} you have served` : `${s.customers.length} ${cfg.crm.label.toLowerCase()} · ${T.short(tot)} lifetime value`, actions: `<button class="btn" data-act="exportCsv">${icon('download', 'sm')}Export</button><button class="btn btn-primary" data-act="newCustomer">${icon('plus', 'sm')}Add ${esc(cfg.crm.singular.toLowerCase())}</button>` })
      + `<div class="filterbar"><div class="search-inline">${icon('search', 'sm')}<input class="input" id="crmQ" placeholder="Search name, phone, email, tag" value="${esc(s.ui.crmQ || '')}" data-input="crmSearch" aria-label="Search ${esc(cfg.crm.label)}"></div><select class="input" style="width:auto" data-change="crmSort" aria-label="Sort">${[['recent', 'Recent ' + (cfg.crm.visitWord || 'visit').toLowerCase()], ['ltv', 'Lifetime value'], ['name', 'Name']].filter((o) => !T.isEmp() || o[0] !== 'ltv').map((o) => `<option value="${o[0]}" ${s.ui.crmSort === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>`
      + `<div class="filterbar">${ui.chips(segs, s.ui.crmSeg, 'crmSeg')}</div>`
      + `<div class="card" id="crmList">${crmRows(shown)}${list.length > shown.length ? `<div class="card-foot"><button class="btn btn-block" data-act="crmMore">Show more (${list.length - shown.length} more)</button></div>` : ''}</div>`;
  }
  A.crmSearch = (el) => { S().ui.crmQ = el.value; S().ui.crmLimit = 40; const list = crmFilter(); const box = document.getElementById('crmList'); box.innerHTML = crmRows(list.slice(0, 40)) + (list.length > 40 ? `<div class="card-foot"><button class="btn btn-block" data-act="crmMore">Show more (${list.length - 40} more)</button></div>` : ''); T.save(); };
  A.crmSeg = (el) => { S().ui.crmSeg = el.dataset.v; S().ui.crmLimit = 40; T.save(); T.render(true); };
  A.crmSort = (el) => { S().ui.crmSort = el.value; T.save(); T.render(true); };
  A.crmMore = () => { S().ui.crmLimit = (S().ui.crmLimit || 40) + 40; T.render(true); };
  A.openCustomer = (el) => T.go('#/customers/' + el.dataset.id);
  A.exportCsv = () => { const rows = crmFilter(); const csv = ['Name,Phone,Email,Town,Tags,Lifetime value'].concat(rows.map((c) => [T.fullName(c), c.phone, c.email, c.town, c.tags.join(' | '), c.ltv].map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))).join('\n'); try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = cfg.id + '-customers-demo.csv'; a.click(); } catch (e) { } T.toast(`Exported ${rows.length} ${cfg.crm.label.toLowerCase()} to CSV`, { icon: 'download' }); };
  const custFields = (c) => [
    { name: 'first', label: 'First name', required: true, value: c.first }, { name: 'last', label: 'Last name', required: true, value: c.last },
    { name: 'phone', label: 'Mobile', type: 'tel', value: c.phone, ph: '(631) 555-0100' }, { name: 'email', label: 'Email', type: 'email', value: c.email },
    { name: 'town', label: 'Town', value: c.town || cfg.town }, { name: 'source', label: 'How they found you', type: 'select', options: cfg.sources.map((x) => x[0]), value: c.source },
    { name: 'tags', label: 'Tags (comma separated)', full: true, value: (c.tags || []).join(', ') },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true, value: c.notes || '' }
  ].concat((cfg.crm.fields || []).map((f) => Object.assign({}, f, { value: c[f.name] != null ? c[f.name] : f.value })));
  A.newCustomer = () => T.form({ title: 'New ' + cfg.crm.singular.toLowerCase(), icon: 'user', submitLabel: 'Create', fields: custFields({ tags: [] }), onSubmit: (d) => {
    const c = Object.assign({ id: T.uid('c'), created: new Date().toISOString(), lastVisit: null, visits: 0, ltv: 0, timeline: [], next: null, staff: T.me() ? T.me().id : null }, d, { tags: d.tags ? d.tags.split(',').map((x) => x.trim()).filter(Boolean) : [] });
    if (cfg.crm.onCreate) cfg.crm.onCreate(c);
    S().customers.unshift(c); T.logTo(c.id, 'note', `${cfg.crm.singular} added`);
    T.autoRun('welcome', `Welcome text sent to ${T.fullName(c)}`, { cid: c.id, href: '#/customers/' + c.id });
    T.save(); T.toast(`${T.fullName(c)} added`); T.go('#/customers/' + c.id);
  } });
  A.editCustomer = (el) => { const c = T.byId(S().customers, el.dataset.id); T.form({ title: 'Edit ' + cfg.crm.singular.toLowerCase(), icon: 'edit', submitLabel: 'Save changes', fields: custFields(c), onSubmit: (d) => { Object.assign(c, d, { tags: d.tags ? d.tags.split(',').map((x) => x.trim()).filter(Boolean) : [] }); T.save(); T.toast('Saved'); T.render(true); } }); };
  A.logTouch = (el) => {
    const c = T.byId(S().customers, el.dataset.id); const type = el.dataset.v || 'call';
    const lbl = { call: 'Log a call', text: 'Send a text', note: 'Add a note', email: 'Send an email' }[type];
    const fields = type === 'call' ? [{ name: 'outcome', label: 'Outcome', type: 'select', options: ['Talked', 'Left voicemail', 'No answer', 'Booked'], full: true }, { name: 'text', label: 'Notes', type: 'textarea', full: true, ph: 'What did you talk about?' }]
      : [{ name: 'text', label: type === 'note' ? 'Note' : 'Message', type: 'textarea', full: true, required: true, value: type === 'text' ? `Hi ${c.first}, it's ${T.role().person.split(' ')[0]} from ${S().settings.bizName}. ` : '' }];
    T.form({ title: lbl + ' · ' + T.fullName(c), icon: type === 'call' ? 'phone' : type === 'note' ? 'note' : 'msg', submitLabel: type === 'text' || type === 'email' ? 'Send (demo)' : 'Save', fields, onSubmit: (d) => {
      const txt = type === 'call' ? `Call: ${d.outcome}${d.text ? '. ' + d.text : ''}` : (type === 'text' ? 'Text sent: ' : type === 'email' ? 'Email sent: ' : '') + d.text;
      T.logTo(c.id, type, txt); T.feed({ icon: type === 'call' ? 'phone' : type === 'note' ? 'note' : 'msg', text: `${T.role().person} logged a ${type} with ${T.fullName(c)}`, href: '#/customers/' + c.id }); T.save(); T.toast(type === 'text' ? 'Text sent (demo, nothing actually sent)' : 'Logged to timeline'); T.render(true);
    } });
  };
  A.setNext = (el) => { const c = T.byId(S().customers, el.dataset.id); const n = c.next || {}; T.form({ title: 'Next action', icon: 'flag', fields: [{ name: 'text', label: 'What should happen next?', full: true, required: true, value: n.text || '' }, { name: 'due', label: 'When', type: 'date', value: T.isoDate(n.due || T.addDays(new Date(), 3)) }], onSubmit: (d) => { c.next = { text: d.text, due: T.fromDT(d.due, '10:00') }; T.save(); T.toast('Next action set'); T.render(true); } }); };
  A.doneNext = (el) => { const c = T.byId(S().customers, el.dataset.id); T.logTo(c.id, 'note', 'Completed: ' + c.next.text); c.next = null; T.save(); T.toast('Marked done'); T.render(true); };
  A.addTag = (el) => { const c = T.byId(S().customers, el.dataset.id); T.form({ title: 'Add tag', icon: 'tag', fields: [{ name: 'tag', label: 'Tag', full: true, required: true, ph: 'e.g. VIP' }], onSubmit: (d) => { if (!c.tags.includes(d.tag)) c.tags.push(d.tag); T.save(); T.render(true); } }); };
  A.rmTag = (el) => { const c = T.byId(S().customers, el.dataset.id); c.tags = c.tags.filter((t) => t !== el.dataset.v); T.save(); T.render(true); };
  const TL_IC = { call: 'phone', text: 'msg', email: 'mail', note: 'note', visit: 'check', money: 'dollar', auto: 'zap', review: 'star' };
  function profilePage(id) {
    const c = T.byId(S().customers, id); if (!c) return ui.empty('Not found');
    const emp = T.isEmp(); const avg = c.visits ? c.ltv / c.visits : 0;
    const staff = c.staff && T.byId(S().team, c.staff);
    const bday = new Date(c.birthday);
    const stats = [{ l: 'Lifetime value', v: T.money(c.ltv), hide: emp }, { l: cfg.crm.visitWord || 'Visits', v: c.visits }, { l: 'Avg per ' + (cfg.crm.visitWord || 'visit').toLowerCase().replace(/s$/, ''), v: T.money(avg), hide: emp }, { l: 'Last ' + (cfg.crm.visitWord || 'visit').toLowerCase().replace(/s$/, ''), v: c.lastVisit ? T.timeAgo(c.lastVisit) : 'Never' }].filter((x) => !x.hide);
    return `<div class="crumbs fade-in"><a href="#/customers">${esc(cfg.crm.label)}</a>${icon('chevR', 'sm')}<span>${esc(T.fullName(c))}</span></div>
      <section class="card mt-s fade-in"><div class="profile-head">${T.avatar(T.fullName(c), 'xl')}<div style="min-width:0;flex:1"><h1>${esc(T.fullName(c))}</h1><div class="muted small">${esc(c.town)} · ${esc(cfg.crm.singular)} since ${T.fmtDate(c.created, { month: 'short', year: 'numeric' })} · via ${esc(c.source)}</div><div class="row-wrap mt-s">${c.tags.map((t) => `<span class="tag">${esc(t)} <button class="btn-ghost" style="border:0;background:none;padding:0 0 0 4px;color:var(--text-3)" data-act="rmTag" data-id="${c.id}" data-v="${esc(t)}" aria-label="Remove tag ${esc(t)}">×</button></span>`).join('')}<button class="btn btn-xs btn-ghost" data-act="addTag" data-id="${c.id}">${icon('plus', 'sm')}Tag</button></div></div>
        <div class="row-wrap"><button class="btn" data-act="logTouch" data-v="call" data-id="${c.id}">${icon('phone', 'sm')}Log call</button><button class="btn" data-act="logTouch" data-v="text" data-id="${c.id}">${icon('msg', 'sm')}Text</button><button class="btn" data-act="logTouch" data-v="note" data-id="${c.id}">${icon('note', 'sm')}Note</button>${cfg.crm.book ? `<button class="btn btn-primary" data-act="${cfg.crm.book.act}" data-id="${c.id}">${icon(cfg.crm.book.icon || 'calendar', 'sm')}${esc(cfg.crm.book.label)}</button>` : ''}<button class="icon-btn bordered" data-act="editCustomer" data-id="${c.id}" aria-label="Edit">${icon('edit', 'sm')}</button></div></div>
        <div class="stats-row" style="padding:0 20px 20px">${stats.map((x) => `<div class="stat-mini"><div class="l">${esc(x.l)}</div><div class="v">${x.v}</div></div>`).join('')}</div></section>
      <div class="grid split mt">
        <div class="grid">
          ${cfg.crm.profile ? cfg.crm.profile(c) : ''}
          ${ui.card({ title: 'History', sub: (c.timeline || []).length + ' entries', icon: 'clock', tone: 'violet', right: `<button class="btn btn-sm" data-act="logTouch" data-v="note" data-id="${c.id}">${icon('plus', 'sm')}Add</button>`, flush: true, body: `<div class="timeline">${(c.timeline || []).slice(0, 14).map((t) => `<div class="feed-item"><span class="feed-ic ${t.type === 'auto' ? 'note' : t.type}">${icon(TL_IC[t.type] || 'activity')}</span><div class="feed-body"><div class="small" style="white-space:normal">${esc(t.text)}</div><div class="meta">${T.fmtDate(t.date, { month: 'short', day: 'numeric', year: 'numeric' })}${t.by ? ' · ' + esc(t.by) : ''}${t.auto ? ` · <span class="auto-tag">${icon('zap', 'sm')}Automated</span>` : ''}</div></div></div>`).join('') || ui.empty('No history yet')}</div>` })}
        </div>
        <div class="grid">
          ${ui.card({ title: 'Next action', icon: 'flag', tone: 'amber', body: c.next ? `<div class="b">${esc(c.next.text)}</div><div class="small ${T.dayDiff(c.next.due) < 0 ? 'down' : 'muted'}">${T.relDay(c.next.due)}</div><div class="row-wrap mt-s"><button class="btn btn-sm btn-success" data-act="doneNext" data-id="${c.id}">${icon('check', 'sm')}Done</button><button class="btn btn-sm" data-act="setNext" data-id="${c.id}">Change</button></div>` : `<div class="muted small">No next step set.</div><button class="btn btn-sm mt-s" data-act="setNext" data-id="${c.id}">${icon('plus', 'sm')}Set next action</button>` })}
          ${ui.card({ title: 'Contact', icon: 'user', body: `<dl class="kv"><dt>Mobile</dt><dd><a href="tel:${esc(c.phone)}" data-act="logTouch" data-v="call" data-id="${c.id}">${esc(c.phone)}</a></dd><dt>Email</dt><dd>${esc(c.email)}</dd><dt>Town</dt><dd>${esc(c.town)}</dd><dt>Birthday</dt><dd>${bday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</dd>${staff ? `<dt>${esc(cfg.crm.staffLabel || 'Usually with')}</dt><dd>${esc(staff.name)}</dd>` : ''}<dt>Source</dt><dd>${esc(c.source)}</dd></dl>${c.notes ? `<div class="infobox mt-s">${esc(c.notes)}</div>` : ''}` })}
          ${cfg.crm.side ? cfg.crm.side(c) : ''}
        </div>
      </div>`;
  }

  // ================= CALENDAR =================
  const C = () => cfg.calendar;
  const evColor = (e) => C().types[e.type] || 'var(--chart-1)';
  const visibleEvents = () => { const s = S(); return T.isEmp() ? s.events.filter((e) => e.who === T.me().id).concat(C().extra ? C().extra(T.me()) : []) : s.events; };
  function calAnchor() { const s = S(); const v = s.ui.calView; const d = T.today0(); if (v === 'month') { d.setDate(1); d.setMonth(d.getMonth() + s.ui.calOff); } else if (v === 'week') { d.setDate(d.getDate() - d.getDay() + 7 * s.ui.calOff); } else d.setDate(d.getDate() + s.ui.calOff); return d; }
  function lanes(list) { const sorted = list.slice().sort((a, b) => a.start.localeCompare(b.start)); const ends = []; sorted.forEach((e) => { let l = ends.findIndex((x) => x <= e.start); if (l < 0) { l = ends.length; ends.push(e.end); } else ends[l] = e.end; e._lane = l; }); sorted.forEach((e) => { e._lanes = Math.max(...sorted.filter((x) => x.start < e.end && x.end > e.start).map((x) => x._lane)) + 1; }); return sorted; }
  function evBlock(e, dayStart) {
    const st = new Date(e.start), en = new Date(e.end); const h0 = C().start;
    const top = ((st.getHours() + st.getMinutes() / 60) - h0) * 88; const ht = Math.max(26, (en - st) / 36e5 * 88 - 3);
    const who = e.who && T.byId(S().team, e.who);
    return `<div class="wev" draggable="true" data-ev="${e.id}" data-act="openEvent" data-id="${e.id}" style="top:${top}px;height:${ht}px;left:calc(${(e._lane || 0) / (e._lanes || 1) * 100}% + 3px);width:calc(${100 / (e._lanes || 1)}% - 6px);right:auto;border-left-color:${evColor(e)};background:color-mix(in srgb, ${evColor(e)} 15%, var(--surface))" title="${esc(e.title)}"><b>${esc(e.title)}</b><span>${T.fmtTime(e.start)}${who ? ' · ' + esc(who.name.split(' ')[0]) : ''}</span></div>`;
  }
  function weekGrid(days) {
    const h0 = C().start, h1 = C().end; const evs = visibleEvents();
    const hours = []; for (let h = h0; h < h1; h++) hours.push(h);
    const now = new Date(); const nowTop = ((now.getHours() + now.getMinutes() / 60) - h0) * 88;
    return `<div class="week-scroll" id="weekScroll"><div class="week ${days.length === 1 ? 'one' : ''}" style="grid-template-columns:56px repeat(${days.length}, minmax(0, 1fr))"><div class="gut"></div>${days.map((d) => `<div class="wh ${T.dayDiff(d) === 0 ? 'today' : ''}">${T.dow[d.getDay()]}<b>${d.getDate()}</b></div>`).join('')}
      <div class="hours">${hours.map((h) => `<div class="hr">${T.fmtHour(h)}</div>`).join('')}</div>
      ${days.map((d) => `<div class="wcol" data-day="${T.isoDate(d)}" style="height:${hours.length * 88}px">${hours.map(() => '<div class="slot"></div><div class="slot"></div>').join('')}${T.dayDiff(d) === 0 && nowTop > 0 && nowTop < hours.length * 88 ? `<div class="now-line" style="top:${nowTop}px"></div>` : ''}${lanes(evs.filter((e) => T.sameDay(e.start, d))).map((e) => evBlock(e, d)).join('')}</div>`).join('')}</div></div>`;
  }
  const agendaRow = (e) => schedRow({ time: T.fmtTime(e.start), dur: Math.round((new Date(e.end) - new Date(e.start)) / 6e4) + ' min', title: e.title, sub: e.sub || e.type, color: evColor(e), href: '#/calendar' }).replace('href="#/calendar"', 'data-act="openEvent" data-id="' + e.id + '" role="button" tabindex="0"');
  function calPage() {
    const s = S(); const v = s.ui.calView; const a = calAnchor(); let title, body;
    if (v === 'month') {
      title = a.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const first = new Date(a); first.setDate(1 - first.getDay()); const evs = visibleEvents(); const cells = [];
      for (let i = 0; i < 42; i++) { const d = T.addDays(first, i); const de = evs.filter((e) => T.sameDay(e.start, d)).sort((x, y) => x.start.localeCompare(y.start)); cells.push(`<div class="mday ${d.getMonth() !== a.getMonth() ? 'other' : ''} ${T.dayDiff(d) === 0 ? 'today' : ''}" data-day="${T.isoDate(d)}" data-act="calDay" data-v="${T.isoDate(d)}"><div class="dn">${d.getDate()}</div>${de.slice(0, 3).map((e) => `<span class="ev" draggable="true" data-ev="${e.id}" data-act="openEvent" data-id="${e.id}" style="border-left-color:${evColor(e)};background:color-mix(in srgb, ${evColor(e)} 13%, var(--surface))">${T.fmtTime(e.start).replace(':00', '')} ${esc(e.title)}</span>`).join('')}${de.length > 3 ? `<div class="more-ev">+${de.length - 3} more</div>` : ''}</div>`); }
      body = `<div class="month">${T.dow.map((d) => `<div class="dow">${d}</div>`).join('')}${cells.join('')}</div>`;
    } else if (v === 'week') {
      const days = []; for (let i = 0; i < 7; i++) days.push(T.addDays(a, i));
      title = `${T.fmtDate(days[0])} - ${T.fmtDate(days[6], { month: 'short', day: 'numeric', year: 'numeric' })}`;
      body = weekGrid(days) + `<div class="wk-mobile">${days.map((d) => { const de = visibleEvents().filter((e) => T.sameDay(e.start, d)).sort((x, y) => x.start.localeCompare(y.start)); return `<div class="eyebrow" style="margin:14px 0 6px">${T.relDay(d)}</div><div class="card">${de.length ? de.map(agendaRow).join('') : '<div class="li faint small">Nothing scheduled</div>'}</div>`; }).join('')}</div>`;
    } else {
      title = T.relDay(a) + ', ' + a.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const de = visibleEvents().filter((e) => T.sameDay(e.start, a)).sort((x, y) => x.start.localeCompare(y.start));
      body = weekGrid([a]) + `<div class="wk-mobile"><div class="card" style="overflow:hidden">${de.length ? de.map(agendaRow).join('') : '<div class="li faint small">Nothing scheduled</div>'}</div></div>`;
    }
    const legend = `<div class="legend">${Object.keys(C().types).map((k) => `<span><i style="background:${C().types[k]}"></i>${esc(k)}</span>`).join('')}</div>`;
    return ui.pageHead({ title: T.isEmp() ? 'My schedule' : 'Calendar', sub: T.isEmp() ? 'Only your appointments and shifts' : 'Drag to reschedule. Click an empty slot to add.', actions: `<button class="btn btn-primary" data-act="newEvent">${icon('plus', 'sm')}New ${esc(C().noun || 'event')}</button>` })
      + `<div class="cal-toolbar"><div class="row" style="gap:6px"><button class="icon-btn bordered" data-act="calNav" data-v="-1" aria-label="Previous">${icon('chevL')}</button><button class="btn btn-sm" data-act="calNav" data-v="0">Today</button><button class="icon-btn bordered" data-act="calNav" data-v="1" aria-label="Next">${icon('chevR')}</button></div><h2>${esc(title)}</h2><span class="spacer"></span>${ui.seg([{ v: 'day', l: 'Day' }, { v: 'week', l: 'Week' }, { v: 'month', l: 'Month' }], v, 'calView')}</div>`
      + `<div class="card" style="padding:14px">${body}<div class="mt-s">${legend}</div></div>`;
  }
  function calAfter(view) {
    const ws = view.querySelector('#weekScroll'); if (ws) { const firstEv = Array.from(view.querySelectorAll('.wev')).map((x) => parseFloat(x.style.top)).sort((p, q) => p - q)[0]; const h = firstEv != null ? C().start + Math.max(0, Math.floor(firstEv / 88) - 1) : C().scrollTo != null ? C().scrollTo : Math.max(C().start, Math.min(new Date().getHours() - 1, C().end - 6)); ws.scrollTop = (h - C().start) * 88; }
    let drag = null;
    view.querySelectorAll('[data-ev]').forEach((el) => el.addEventListener('dragstart', (e) => { drag = el.dataset.ev; try { e.dataTransfer.setData('text/plain', drag); } catch (er) { } e.stopPropagation(); }));
    view.querySelectorAll('.wcol, .mday').forEach((col) => {
      col.addEventListener('dragover', (e) => { if (!drag) return; e.preventDefault(); col.classList.add('drop'); });
      col.addEventListener('dragleave', () => col.classList.remove('drop'));
      col.addEventListener('drop', (e) => {
        if (!drag) return; e.preventDefault(); col.classList.remove('drop');
        const ev = T.byId(S().events, drag); drag = null; if (!ev) return;
        const dur = new Date(ev.end) - new Date(ev.start); const [y, m, d] = col.dataset.day.split('-').map(Number); const st = new Date(ev.start);
        let nh = st.getHours(), nm = st.getMinutes();
        if (col.classList.contains('wcol')) { const r = col.getBoundingClientRect(); const hrs = C().start + (e.clientY - r.top) / 88; nh = Math.floor(hrs); nm = Math.round((hrs - nh) * 4) * 15; if (nm === 60) { nh++; nm = 0; } }
        const ns = new Date(y, m - 1, d, nh, nm); ev.start = ns.toISOString(); ev.end = new Date(+ns + dur).toISOString(); T.save();
        T.toast(`Moved to ${T.relDay(ev.start)}, ${T.fmtTime(ev.start)}`, { icon: 'calendar' }); T.render(true);
      });
    });
    view.querySelectorAll('.wcol').forEach((col) => col.addEventListener('click', (e) => { if (e.target.closest('.wev')) return; const r = col.getBoundingClientRect(); const hrs = C().start + (e.clientY - r.top) / 88; const h = Math.floor(hrs), mm = hrs - h >= .5 ? 30 : 0; A.newEvent(null, { date: col.dataset.day, time: String(h).padStart(2, '0') + ':' + (mm ? '30' : '00') }); }));
  }
  A.calNav = (el) => { const v = +el.dataset.v; S().ui.calOff = v === 0 ? 0 : S().ui.calOff + v; T.save(); T.render(true); };
  A.calView = (el) => { S().ui.calView = el.dataset.v; S().ui.calOff = 0; T.save(); T.render(true); };
  A.calDay = (el, e) => { if (e && e.target.closest('.ev')) return; const d = T.sod(T.fromDT(el.dataset.v, '00:00')); S().ui.calView = 'day'; S().ui.calOff = T.dayDiff(d); T.save(); T.render(true); };
  A.newEvent = (el, pre) => {
    pre = pre || {}; const team = T.isEmp() ? [T.me()] : S().team;
    T.form({ title: 'New ' + (C().noun || 'event'), icon: 'calendar', submitLabel: 'Add to calendar', fields: [
      { name: 'title', label: 'Title', full: true, required: true, ph: C().ph || '' },
      { name: 'type', label: 'Type', type: 'select', options: Object.keys(C().types) },
      { name: 'who', label: 'Assigned to', type: 'select', options: team.map((m) => ({ v: m.id, l: m.name })) },
      { name: 'date', label: 'Date', type: 'date', value: pre.date || T.isoDate(new Date()) },
      { name: 'time', label: 'Start time', type: 'time', value: pre.time || '10:00' },
      { name: 'dur', label: 'Length (minutes)', type: 'number', value: 60, min: 15, step: 15 },
      { name: 'cid', label: cfg.crm.singular + ' (optional)', type: 'select', options: [{ v: '', l: 'None' }].concat(S().customers.slice().sort((a, b) => a.first.localeCompare(b.first)).map((c) => ({ v: c.id, l: T.fullName(c) }))), full: true }],
      onSubmit: (d) => { const st = T.fromDT(d.date, d.time); const e = { id: T.uid('e'), title: d.title, type: d.type, who: d.who, cid: d.cid || null, start: st, end: new Date(+new Date(st) + (+d.dur || 60) * 6e4).toISOString() }; S().events.push(e); T.save(); T.toast('Added to calendar', { icon: 'calendar' }); if (T.route().key === 'calendar') T.render(true); else T.go('#/calendar'); } });
  };
  A.openEvent = (el, e) => {
    if (e) e.stopPropagation();
    const ev = T.byId(S().events, el.dataset.id); if (!ev) return; const who = ev.who && T.byId(S().team, ev.who); const c = ev.cid && T.byId(S().customers, ev.cid);
    T.modal({ title: ev.title, icon: 'calendar', submitLabel: 'Save', body: `<div class="row-wrap" style="margin-bottom:14px"><span class="badge" style="background:color-mix(in srgb, ${evColor(ev)} 18%, transparent);color:var(--text)">${esc(ev.type)}</span>${who ? ui.badge(who.name) : ''}${c ? `<a class="badge b-blue" href="#/customers/${c.id}">${esc(T.fullName(c))}</a>` : ''}</div>${ev.sub ? `<p class="muted">${esc(ev.sub)}</p>` : ''}<div class="form-grid">${T.fieldHtml({ name: 'date', label: 'Date', type: 'date', value: T.isoDate(ev.start) })}${T.fieldHtml({ name: 'time', label: 'Start', type: 'time', value: T.isoTime(ev.start) })}${T.fieldHtml({ name: 'dur', label: 'Length (min)', type: 'number', value: Math.round((new Date(ev.end) - new Date(ev.start)) / 6e4), step: 15 })}${T.fieldHtml({ name: 'notes', label: 'Notes', type: 'textarea', full: true, value: ev.notes || '' })}</div>`,
      extraFoot: `<button type="button" class="btn btn-danger" data-act="delEvent" data-id="${ev.id}" style="margin-right:auto">${icon('trash', 'sm')}Delete</button>`,
      onSubmit: (d) => { const st = T.fromDT(d.date, d.time); ev.start = st; ev.end = new Date(+new Date(st) + (+d.dur || 60) * 6e4).toISOString(); ev.notes = d.notes; T.save(); T.toast('Updated'); T.render(true); } });
  };
  A.delEvent = (el) => { const s = S(); const ev = T.byId(s.events, el.dataset.id); s.events = s.events.filter((x) => x.id !== el.dataset.id); T.save(); T.closeModal(); T.toast('Deleted', { icon: 'trash', action: { label: 'Undo', fn: () => { s.events.push(ev); T.save(); T.render(true); } } }); T.render(true); };

  // ================= FINANCE =================
  function financePage() {
    const s = S(); const n = s.ui.range; const own = T.isOwner(); const F = cfg.finance;
    const cur = T.days(n), prev = T.days(n, n);
    const rev = T.sum(cur, (d) => d.rev), prevRev = T.sum(prev, (d) => d.rev), exp = T.sum(cur, (d) => d.exp), prevExp = T.sum(prev, (d) => d.exp);
    const labor = T.sum(cur, (d) => d.labor || 0);
    const kpis = [{ label: 'Revenue', icon: 'dollar', value: T.money(rev), count: rev, fmt: 'money', delta: ui.delta(rev, prevRev), spark: cur.map((d) => d.rev) }];
    if (own) kpis.push({ label: 'Expenses', icon: 'receipt', value: T.money(exp), count: exp, fmt: 'money', delta: ui.delta(exp, prevExp, { invert: true }), spark: cur.map((d) => d.exp), sparkColor: 'var(--chart-2)' }, { label: 'Net profit', icon: 'trend', value: T.money(rev - exp), count: rev - exp, fmt: 'money', delta: `<span class="faint">${T.pct((rev - exp) / rev, 1)} margin</span>` }, { label: 'Payroll', icon: 'users', value: T.money(labor), count: labor, fmt: 'money', delta: `<span class="faint">${T.pct(labor / rev, 1)} of revenue</span>` });
    (F.kpis ? F.kpis(s, n, cur, prev) : []).filter((k) => T.can(k.roles)).forEach((k) => kpis.push(k));
    const months = T.months(6);
    const srcs = F.sources(s, n);
    const flow = own ? cashflow() : null;
    return ui.pageHead({ title: 'Finance', sub: own ? 'Money in, money out, and what is coming next' : 'Sales overview (profit and payroll are owner-only)', eyebrow: '<span class="sample">Sample data</span>', actions: `${T.rangeSeg()}<button class="btn" data-act="exportFin">${icon('download', 'sm')}Export</button>` })
      + `<div class="kpis">${kpis.map(ui.kpi).join('')}</div>`
      + `<div class="grid g-2">${ui.card({ title: own ? 'Revenue vs expenses' : 'Revenue by month', sub: 'Last 6 months', icon: 'chart', body: ui.bars({ labels: months.map((m) => m.label), tipLabels: months.map((m) => m.full), series: own ? [{ name: 'Revenue', values: months.map((m) => m.rev) }, { name: 'Expenses', values: months.map((m) => m.exp), color: 'var(--chart-3)' }] : [{ name: 'Revenue', values: months.map((m) => m.rev) }], fmt: T.short }) })}
        ${ui.card({ title: 'Top revenue sources', sub: T.rangeLabel(n), icon: 'pie', tone: 'violet', body: ui.donut(srcs.map((x, i) => ({ label: x.label, value: x.value, color: ['var(--chart-1)', 'var(--chart-2)', '#7b6fd0', '#4f9fd9', '#e08a5f', 'var(--chart-3)'][i] })), { center: T.short(T.sum(srcs, (x) => x.value)), centerSub: 'total', fmt: T.short }) })}</div>`
      + (F.extra ? `<div class="mt">${F.extra(s, n, cur)}</div>` : '')
      + (own ? `<div class="grid g-2 mt">${ui.card({ title: 'Cash flow, next 30 days', sub: 'Projected from bookings, open invoices and recurring bills', icon: 'trend', tone: 'green', body: ui.line({ labels: flow.days.map((d) => T.fmtDate(d.date)), series: [{ name: 'Projected balance', values: flow.days.map((d) => d.bal) }], fmt: T.short, h: 190, zero: false }) + `<div class="stats-row mt-s"><div class="stat-mini"><div class="l">Expected in</div><div class="v up">${T.short(flow.inT)}</div></div><div class="stat-mini"><div class="l">Bills out</div><div class="v down">${T.short(flow.outT)}</div></div><div class="stat-mini"><div class="l">Balance in 30 days</div><div class="v">${T.short(flow.days[flow.days.length - 1].bal)}</div></div></div>` })}
        ${ui.card({ title: 'Upcoming bills and deposits', icon: 'calendar', tone: 'amber', flush: true, body: flow.items.slice(0, 8).map((x) => `<div class="li"><span class="card-icon ${x.amt > 0 ? 'green' : 'red'}">${icon(x.amt > 0 ? 'download' : 'upload', 'sm')}</span><span class="grow"><div class="t1">${esc(x.label)}</div><div class="t2">${T.relDay(x.date)}</div></span><b class="num ${x.amt > 0 ? 'up' : ''}">${x.amt > 0 ? '+' : ''}${T.money(x.amt)}</b></div>`).join('') })}</div>` : '')
      + `<div class="mt">${ui.card({ title: esc(F.listTitle), icon: 'receipt', tone: 'blue', right: F.listRight || '', flush: true, body: F.list(s) })}</div>`;
  }
  function cashflow() {
    const F = cfg.finance; const items = []; const t = T.today0();
    const avgIn = T.avg(T.days(28, 1), (d) => d.rev);
    (F.bills || []).forEach((b) => { for (let i = 1; i <= 30; i++) { const d = T.addDays(t, i); if ((b.dom && d.getDate() === b.dom) || (b.dow != null && d.getDay() === b.dow) || (b.every && i % b.every === (b.off || 0))) items.push({ label: b.label, date: d.toISOString(), amt: -b.amount }); } });
    (F.inflows ? F.inflows(S()) : []).forEach((x) => items.push(x));
    items.sort((a, b) => a.date.localeCompare(b.date));
    let bal = F.startBalance || 40000; const days = []; let inT = 0, outT = 0;
    for (let i = 0; i <= 30; i++) { const d = T.addDays(t, i); const dayIn = i ? avgIn * (cfg.dowFactor ? cfg.dowFactor[d.getDay()] : 1) * (F.netIn || .9) : 0; bal += dayIn; inT += dayIn; items.filter((x) => T.sameDay(x.date, d)).forEach((x) => { bal += x.amt; if (x.amt > 0) inT += x.amt; else outT -= x.amt; }); days.push({ date: d.toISOString(), bal }); }
    return { days, items, inT, outT };
  }
  A.exportFin = () => T.toast('Finance report exported (demo)', { icon: 'download' });

  // ================= MARKETING =================
  function marketingPage() {
    const s = S(); const M = s.mkt; const srcs = M.sources;
    const totLeads = T.sum(srcs, (x) => x.leads), totCost = T.sum(srcs, (x) => x.cost), totRev = T.sum(srcs, (x) => x.revenue);
    const emailCamps = s.campaigns;
    return ui.pageHead({ title: 'Marketing', sub: 'Where customers come from, and what it costs to get them', actions: `<a class="btn" href="#/analytics">${icon('chart', 'sm')}Full analytics</a><button class="btn btn-primary" data-act="newCampaign">${icon('plus', 'sm')}New campaign</button>` })
      + `<div class="kpis">${[{ label: 'Leads this month', icon: 'users', value: totLeads, count: totLeads, delta: ui.delta(totLeads, Math.round(totLeads * .86)) }, { label: 'Marketing spend', icon: 'dollar', value: T.money(totCost), count: totCost, fmt: 'money', delta: '<span class="faint">this month</span>' }, { label: 'Avg cost per lead', icon: 'target', value: T.money2(totCost / totLeads), delta: ui.delta(totCost / totLeads, totCost / totLeads * 1.12, { invert: true }) }, { label: 'Return on spend', icon: 'trend', value: (totRev / totCost).toFixed(1) + 'x', delta: `<span class="faint">${T.short(totRev)} attributed</span>` }].map(ui.kpi).join('')}</div>`
      + `<div class="grid split">${ui.card({ title: 'Lead sources and cost per lead', sub: 'This month', icon: 'filter', right: '<span class="sample">Sample data</span>', flush: true, body: ui.table({ cols: [{ l: 'Source', v: (x) => `<b>${esc(x.name)}</b>` }, { l: 'Leads', r: 1, v: (x) => x.leads }, { l: 'Spend', r: 1, v: (x) => x.cost ? T.money(x.cost) : '<span class="faint">Free</span>' }, { l: 'Cost / lead', r: 1, v: (x) => x.cost ? T.money2(x.cost / x.leads) : '<span class="up">$0</span>' }, { l: 'Became ' + cfg.crm.label.toLowerCase(), r: 1, v: (x) => x.won }, { l: 'Revenue', r: 1, v: (x) => `<b class="num">${T.money(x.revenue)}</b>` }], rows: srcs.slice().sort((a, b) => b.revenue - a.revenue) }) })}
        ${T.tvlCard ? T.tvlCard() : ''}</div>`
      + `<div class="grid g-2 mt">${ui.card({ title: 'Campaigns', icon: 'megaphone', tone: 'violet', flush: true, body: emailCamps.map((c) => `<div class="li click" data-act="openCampaign" data-id="${c.id}"><span class="card-icon ${c.channel === 'SMS' ? 'green' : 'blue'}">${icon(c.channel === 'SMS' ? 'msg' : 'mail', 'sm')}</span><span class="grow"><div class="t1">${esc(c.name)}</div><div class="t2">${esc(c.channel)} · ${c.status === 'sent' ? 'Sent ' + T.fmtDate(c.date) + ' to ' + T.num(c.sent) : c.status === 'scheduled' ? 'Scheduled ' + T.relDay(c.date) : 'Draft'}</div></span>${c.status === 'sent' ? `<span class="right"><b class="num">${T.pct(c.opens / c.sent)}</b><div class="tiny faint">opened</div></span>` : ui.badge(c.status === 'scheduled' ? 'Scheduled' : 'Draft', c.status === 'scheduled' ? 'violet' : '')}</div>`).join('') })}
        ${ui.card({ title: 'Email list growth', sub: T.num(M.emailList[M.emailList.length - 1].v) + ' subscribers', icon: 'mail', tone: 'blue', body: ui.bars({ labels: M.emailList.map((x) => x.l), series: [{ name: 'Subscribers', values: M.emailList.map((x) => x.v) }], h: 210 }) })}</div>`;
  }
  A.openCampaign = (el) => { const c = T.byId(S().campaigns, el.dataset.id); T.modal({ title: c.name, icon: 'megaphone', submitLabel: c.status === 'draft' ? 'Schedule (demo)' : false, cancelLabel: 'Close', body: `<div class="stats-row">${c.status === 'sent' ? `<div class="stat-mini"><div class="l">Sent</div><div class="v">${T.num(c.sent)}</div></div><div class="stat-mini"><div class="l">Opened</div><div class="v">${T.pct(c.opens / c.sent)}</div></div><div class="stat-mini"><div class="l">Clicked</div><div class="v">${T.pct(c.clicks / c.sent, 1)}</div></div><div class="stat-mini"><div class="l">Revenue</div><div class="v">${T.money(c.revenue)}</div></div>` : `<div class="stat-mini"><div class="l">Audience</div><div class="v">${T.num(c.sent)}</div></div>`}</div><div class="infobox mt">${esc(c.body || 'Campaign content preview')}</div>`, onSubmit: () => { c.status = 'scheduled'; c.date = T.at(2, 10); T.save(); T.toast('Campaign scheduled'); T.render(true); } }); };
  A.newCampaign = () => T.form({ title: 'New campaign', icon: 'megaphone', submitLabel: 'Save draft', fields: [{ name: 'name', label: 'Campaign name', full: true, required: true }, { name: 'channel', label: 'Channel', type: 'select', options: ['Email', 'SMS'] }, { name: 'aud', label: 'Audience', type: 'select', options: ['Everyone', 'VIPs', "Haven't visited in 60 days", 'New this month'] }, { name: 'body', label: 'Message', type: 'textarea', full: true }], onSubmit: (d) => { S().campaigns.unshift({ id: T.uid('cp'), name: d.name, channel: d.channel, status: 'draft', date: new Date().toISOString(), sent: Math.round(S().mkt.emailList.slice(-1)[0].v * (d.aud === 'Everyone' ? 1 : .2)), opens: 0, clicks: 0, revenue: 0, body: d.body }); T.save(); T.toast('Draft saved'); T.render(true); } });

  // ================= SOCIAL STUDIO =================
  const PF = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', google: 'Google posts' };
  const PFA = { instagram: 'IG', facebook: 'f', tiktok: 'TT', google: 'G' };
  const ST = [['idea', 'Idea'], ['draft', 'Draft'], ['approval', 'Awaiting approval'], ['scheduled', 'Scheduled'], ['posted', 'Posted']];
  T.PF = PF;
  T.pfIcon = (p) => `<span class="platform-ic pf-${p}">${PFA[p]}</span>`;
  function socialPage() {
    const s = S(); const off = s.ui.socialOff; const start = T.today0(); start.setDate(start.getDate() - start.getDay() + 1 + off * 7); if (start.getDay() !== 1) start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const days = []; for (let i = 0; i < 7; i++) days.push(T.addDays(start, i));
    const f = s.ui.postFilter; const counts = {}; ST.forEach(([k]) => { counts[k] = s.posts.filter((p) => p.status === k).length; });
    const inWeek = s.posts.filter((p) => { const d = T.sod(p.date); return d >= days[0] && d <= days[6]; });
    const posted = s.posts.filter((p) => p.status === 'posted' && T.daysSince(p.date) <= 30);
    const reach = T.sum(posted, (p) => p.stats.reach), eng = T.sum(posted, (p) => p.stats.likes + p.stats.comments + p.stats.shares + p.stats.saves);
    const filtered = (f === 'all' ? s.posts : s.posts.filter((p) => p.status === f)).slice().sort((a, b) => b.date.localeCompare(a.date));
    const grid = `<div class="sgrid"><div class="sh"></div>${days.map((d) => `<div class="sh ${T.dayDiff(d) === 0 ? 'today' : ''}">${T.dow[d.getDay()]}<b>${d.getDate()}</b></div>`).join('')}
      ${Object.keys(PF).map((p) => `<div class="pl">${T.pfIcon(p)}<span class="ellip">${PF[p].replace(' posts', '')}</span></div>${days.map((d) => `<div class="sc" data-pday="${T.isoDate(d)}" data-pf="${p}">${inWeek.filter((x) => x.platform === p && T.sameDay(x.date, d)).map(pcard).join('')}</div>`).join('')}`).join('')}</div>
      <div class="sgrid-m">${days.map((d) => { const ps = inWeek.filter((x) => T.sameDay(x.date, d)); return `<div class="eyebrow" style="margin:14px 0 6px">${T.relDay(d)}</div>${ps.length ? ps.map((p) => `<div class="card li click" data-act="openPost" data-id="${p.id}" style="margin-bottom:6px;border-radius:12px"><span class="thumb-sq" style="${ui.thumb(p.title)}"></span><span class="grow"><div class="t1">${esc(p.title)}</div><div class="t2"><span class="stdot st-${p.status}"></span>${esc(stLabel(p.status))} · ${PF[p.platform]} · ${T.fmtTime(p.date)}</div></span></div>`).join('') : '<div class="faint small">Nothing planned</div>'}`; }).join('')}</div>`;
    return ui.pageHead({ title: 'Social media studio', sub: 'Plan, approve and schedule every post in one place', actions: `<button class="btn" data-act="aiPost">${icon('sparkles', 'sm')}Draft with AI</button><button class="btn btn-primary" data-act="newPost">${icon('plus', 'sm')}New post</button>` })
      + `<div class="kpis">${[{ label: 'Awaiting your approval', icon: 'check', value: counts.approval, count: counts.approval, delta: '<span class="faint">tap a post to review</span>' }, { label: 'Scheduled', icon: 'calendar', value: counts.scheduled, count: counts.scheduled, delta: '<span class="faint">next 2 weeks</span>' }, { label: 'Reach, last 30 days', icon: 'eye', value: T.knum(reach), count: reach, fmt: 'k', delta: ui.delta(reach, reach * .84) }, { label: 'Engagement rate', icon: 'heart', value: T.pct(eng / Math.max(1, reach), 1), delta: ui.delta(eng / reach, eng / reach * .93) }].map(ui.kpi).join('')}</div>`
      + `<div class="cal-toolbar"><div class="row" style="gap:6px"><button class="icon-btn bordered" data-act="socNav" data-v="-1" aria-label="Previous week">${icon('chevL')}</button><button class="btn btn-sm" data-act="socNav" data-v="0">This week</button><button class="icon-btn bordered" data-act="socNav" data-v="1" aria-label="Next week">${icon('chevR')}</button></div><h2>Week of ${T.fmtDate(days[0], { month: 'long', day: 'numeric' })}</h2><span class="spacer"></span><div class="legend">${ST.map(([k, l]) => `<span><span class="stdot st-${k}"></span>${l}</span>`).join('')}</div></div>`
      + grid
      + `<div class="row mt" style="flex-wrap:wrap;gap:10px"><h2 class="sec-title" style="margin:0">All posts</h2><span class="spacer"></span>${ui.chips([{ v: 'all', l: 'All', n: s.posts.length }].concat(ST.map(([k, l]) => ({ v: k, l, n: counts[k] }))), f, 'postFilter')}</div>
      <div class="post-grid mt-s">${filtered.slice(0, 12).map((p) => `<div class="card post-tile" data-act="openPost" data-id="${p.id}" tabindex="0" role="button">${ui.art({ title: p.title, sub: p.sub, tag: p.tag, shape: 'sq', seed: p.title })}<div style="padding:10px 12px"><div class="row" style="gap:8px">${T.pfIcon(p.platform)}<span class="small b ellip grow">${esc(PF[p.platform])}</span><span class="small"><span class="stdot st-${p.status}"></span>${esc(stLabel(p.status))}</span></div><div class="small muted mt-s clamp2">${esc(p.caption)}</div>${p.status === 'posted' ? `<div class="row small mt-s" style="gap:12px;color:var(--text-2)"><span>${icon('eye', 'sm')} ${T.knum(p.stats.reach)}</span><span>${icon('heart', 'sm')} ${p.stats.likes}</span><span>${icon('msg', 'sm')} ${p.stats.comments}</span></div>` : `<div class="tiny faint mt-s">${T.relDay(p.date)}, ${T.fmtTime(p.date)}</div>`}</div></div>`).join('')}</div>`;
  }
  const stLabel = (k) => (ST.find((x) => x[0] === k) || [k, k])[1];
  const pcard = (p) => `<div class="pcard" draggable="true" data-post="${p.id}" data-act="openPost" data-id="${p.id}" title="${esc(p.title)}"><div class="thumb" style="${ui.thumb(p.title)}"></div><div class="pc"><span class="ellip b">${esc(p.title)}</span><span class="ellip faint"><span class="stdot st-${p.status}"></span>${esc(stLabel(p.status))}</span></div></div>`;
  function socialAfter(view) {
    let drag = null;
    view.querySelectorAll('[data-post]').forEach((el) => el.addEventListener('dragstart', (e) => { drag = el.dataset.post; try { e.dataTransfer.setData('text/plain', drag); } catch (er) { } }));
    view.querySelectorAll('.sc').forEach((c) => { c.addEventListener('dragover', (e) => { if (drag) { e.preventDefault(); c.classList.add('drop'); } }); c.addEventListener('dragleave', () => c.classList.remove('drop')); c.addEventListener('drop', (e) => { if (!drag) return; e.preventDefault(); const p = T.byId(S().posts, drag); drag = null; const t = new Date(p.date); const [y, m, d] = c.dataset.pday.split('-').map(Number); p.date = new Date(y, m - 1, d, t.getHours(), t.getMinutes()).toISOString(); p.platform = c.dataset.pf; T.save(); T.toast(`Moved to ${T.relDay(p.date)} on ${PF[p.platform]}`); T.render(true); }); });
  }
  A.socNav = (el) => { const v = +el.dataset.v; S().ui.socialOff = v === 0 ? 0 : S().ui.socialOff + v; T.save(); T.render(true); };
  A.postFilter = (el) => { S().ui.postFilter = el.dataset.v; T.save(); T.render(true); };
  A.openPost = (el) => {
    const p = T.byId(S().posts, el.dataset.id); if (!p) return; const si = ST.findIndex((x) => x[0] === p.status);
    const canApprove = !T.isEmp();
    const res = p.status === 'posted' ? `<div class="eyebrow mt">Results</div><div class="stats-row mt-s"><div class="stat-mini"><div class="l">Reach</div><div class="v">${T.knum(p.stats.reach)}</div></div><div class="stat-mini"><div class="l">Likes</div><div class="v">${p.stats.likes}</div></div><div class="stat-mini"><div class="l">Comments</div><div class="v">${p.stats.comments}</div></div><div class="stat-mini"><div class="l">Shares + saves</div><div class="v">${p.stats.shares + p.stats.saves}</div></div></div><div class="small muted mt-s">Engagement rate ${T.pct((p.stats.likes + p.stats.comments + p.stats.shares + p.stats.saves) / p.stats.reach, 1)} · <a href="#/analytics" data-act="goSocialAnalytics">See all social analytics</a></div>` : '';
    T.drawer({ title: PF[p.platform] + ' post', cls: 'post-drawer', body: `<div class="status-steps">${ST.map(([k, l], i) => `<span class="${i < si ? 'done' : i === si ? 'cur' : ''}">${l}</span>`).join('')}</div><div class="mt" style="max-width:340px;margin-left:auto;margin-right:auto">${ui.art({ title: p.title, sub: p.sub, tag: p.tag, seed: p.title, shape: p.platform === 'google' ? 'wide' : '' })}</div>
      <div class="row mt">${T.pfIcon(p.platform)}<b>${esc(S().settings.bizName)}</b><span class="spacer"></span><span class="small muted">${T.relDay(p.date)}, ${T.fmtTime(p.date)}</span></div>
      <div class="field mt-s"><label for="pcap">Caption</label><textarea class="input" id="pcap" rows="6" ${p.status === 'posted' ? 'readonly' : ''}>${esc(p.caption)}</textarea></div>
      <div class="form-grid"><div class="field"><label for="pdate">Date</label><input class="input" type="date" id="pdate" value="${T.isoDate(p.date)}"></div><div class="field"><label for="ptime">Time</label><input class="input" type="time" id="ptime" value="${T.isoTime(p.date)}"></div></div>${p.by ? `<div class="small faint">Drafted by ${esc(p.by)}</div>` : ''}${res}`,
      foot: p.status === 'posted' ? `<button class="btn" data-act="dupPost" data-id="${p.id}">${icon('copy', 'sm')}Reuse as new draft</button>` : `${p.status === 'approval' && canApprove ? `<button class="btn btn-success" data-act="approvePost" data-id="${p.id}">${icon('check', 'sm')}Approve and schedule</button><button class="btn btn-danger" data-act="rejectPost" data-id="${p.id}">${icon('x', 'sm')}Request changes</button>` : ''}${p.status === 'idea' || p.status === 'draft' ? `<button class="btn btn-primary" data-act="submitPost" data-id="${p.id}">${icon('send', 'sm')}${canApprove ? 'Send for approval' : 'Submit for approval'}</button>` : ''}${p.status === 'scheduled' && canApprove ? `<button class="btn btn-primary" data-act="publishPost" data-id="${p.id}">${icon('send', 'sm')}Post now (demo)</button>` : ''}<button class="btn" data-act="savePost" data-id="${p.id}">Save</button><button class="btn btn-ghost btn-danger" data-act="delPost" data-id="${p.id}" aria-label="Delete">${icon('trash', 'sm')}</button>` });
  };
  const readPost = (p) => { const d = T.drawerEl(); if (!d) return; const cap = d.querySelector('#pcap'); if (cap && !cap.readOnly) p.caption = cap.value; const dt = d.querySelector('#pdate').value, tm = d.querySelector('#ptime').value; if (dt) p.date = T.fromDT(dt, tm); };
  const postStep = (id, st, msg, extra) => { const p = T.byId(S().posts, id); readPost(p); p.status = st; if (extra) extra(p); T.save(); T.closeDrawer(); T.toast(msg); T.refreshNav(); T.render(true); };
  A.savePost = (el) => postStep(el.dataset.id, T.byId(S().posts, el.dataset.id).status, 'Saved');
  A.submitPost = (el) => postStep(el.dataset.id, 'approval', 'Sent for approval');
  A.approvePost = (el) => postStep(el.dataset.id, 'scheduled', 'Approved. It will post automatically.', (p) => { T.feed({ icon: 'check', text: `${T.role().person} approved "${p.title}" for ${PF[p.platform]}`, href: '#/social' }); });
  A.rejectPost = (el) => postStep(el.dataset.id, 'draft', 'Sent back to drafts with your note');
  A.publishPost = (el) => postStep(el.dataset.id, 'posted', 'Posted (demo, nothing was actually published)', (p) => { p.date = new Date().toISOString(); p.stats = { reach: 0, likes: 0, comments: 0, shares: 0, saves: 0 }; T.autoRun('autopost', `Auto-posted "${p.title}" to ${PF[p.platform]}`, { href: '#/social' }); });
  A.delPost = (el) => { S().posts = S().posts.filter((p) => p.id !== el.dataset.id); T.save(); T.closeDrawer(); T.toast('Post deleted', { icon: 'trash' }); T.render(true); };
  A.dupPost = (el) => { const p = T.byId(S().posts, el.dataset.id); const n = Object.assign({}, p, { id: T.uid('p'), status: 'draft', date: T.at(3, 11), stats: null }); S().posts.push(n); T.save(); T.closeDrawer(); T.toast('Copied to drafts'); T.render(true); };
  A.newPost = (el, pre) => { pre = pre || {}; T.form({ title: 'New post', icon: 'image', submitLabel: 'Create draft', fields: [{ name: 'title', label: 'Headline on the image', full: true, required: true, value: pre.title || '' }, { name: 'platform', label: 'Platform', type: 'select', options: Object.keys(PF).map((k) => ({ v: k, l: PF[k] })), value: pre.platform || 'instagram' }, { name: 'date', label: 'Date', type: 'date', value: T.isoDate(T.addDays(new Date(), 1)) }, { name: 'caption', label: 'Caption', type: 'textarea', full: true, value: pre.caption || '' }], onSubmit: (d) => { const p = { id: T.uid('p'), platform: d.platform, title: d.title, sub: pre.sub || '', tag: pre.tag || 'New', caption: d.caption, date: T.fromDT(d.date, '11:30'), status: 'draft', by: T.role().person, stats: null }; S().posts.push(p); T.save(); T.toast('Draft created'); if (T.route().key !== 'social') T.go('#/social'); else T.render(true); } }); };
  A.aiPost = () => { const ideas = cfg.postIdeas; const i = ideas[(S().posts.length + Date.now()) % ideas.length]; const p = { id: T.uid('p'), platform: i.platform || 'instagram', title: i.title, sub: i.sub, tag: i.tag || 'AI draft', caption: i.caption, date: T.at(1, 11, 30), status: 'approval', by: 'AI assistant', stats: null }; S().posts.push(p); T.save(); T.toast('AI drafted a post and sent it for your approval', { icon: 'sparkles' }); if (T.route().key !== 'social') T.go('#/social'); else T.render(true); setTimeout(() => A.openPost({ dataset: { id: p.id } }), 350); };

  // ================= REVIEWS =================
  function reviewsPage() {
    const s = S(); const f = s.ui.reviewFilter; const R = s.reviews.slice().sort((a, b) => b.date.localeCompare(a.date));
    const avg = T.avg(R, (r) => r.rating); const r30 = R.filter((r) => T.daysSince(r.date) <= 30);
    const need = R.filter((r) => r.status !== 'posted');
    const list = f === 'needs' ? need : f === 'low' ? R.filter((r) => r.rating <= 3) : R;
    const trend = s.x.ratingTrend || [];
    const recent = s.customers.filter((c) => c.lastVisit && T.daysSince(c.lastVisit) <= 6).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit)).slice(0, 8);
    const dist = [5, 4, 3, 2, 1].map((n) => ({ label: n + ' stars', value: R.filter((r) => r.rating === n).length, color: n >= 4 ? 'var(--chart-1)' : n === 3 ? 'var(--chart-2)' : 'var(--red)' }));
    return ui.pageHead({ title: 'Reviews & reputation', sub: 'Every review, one inbox. AI drafts the reply, you approve it.', actions: `<button class="btn btn-primary" data-act="askReviewBulk">${icon('send', 'sm')}Ask recent ${esc(cfg.crm.label.toLowerCase())} for reviews</button>` })
      + `<div class="kpis">${[{ label: 'Google rating', icon: 'star', value: (s.x.googleRating || 4.7).toFixed(1) + ' ★', delta: `<span class="faint">${T.num(s.x.googleCount || 312)} reviews</span>` }, { label: 'New reviews, 30 days', icon: 'msg', value: r30.length, count: r30.length, delta: ui.delta(r30.length, Math.max(1, r30.length - 3)) }, { label: 'Avg rating, 30 days', icon: 'trend', value: T.avg(r30, (r) => r.rating).toFixed(2), delta: `<span class="faint">all time ${avg.toFixed(2)}</span>` }, { label: 'Waiting on a reply', icon: 'clock', value: need.length, count: need.length, delta: `<span class="faint">${need.filter((r) => r.status === 'draft').length} AI drafts ready</span>` }].map(ui.kpi).join('')}</div>`
      + `<div class="grid split"><div class="grid">${ui.card({ title: 'Rating trend', sub: 'Average star rating by month', icon: 'trend', tone: 'green', body: ui.line({ labels: trend.map((x) => x.l), series: [{ name: 'Avg rating', values: trend.map((x) => x.v) }], fmt: (v) => v.toFixed(1), zero: false, h: 180 }) })}
        <div class="card"><div class="card-head"><span class="card-icon brand">${icon('msg', 'sm')}</span><h3>Reviews</h3><div class="right">${ui.seg([{ v: 'all', l: 'All' }, { v: 'needs', l: 'Needs reply', n: need.length }, { v: 'low', l: '3 stars or less' }], f, 'reviewFilter')}</div></div><div class="card-body flush">${list.slice(0, 12).map(reviewRow).join('') || ui.empty('No reviews here')}</div></div></div>
        <div class="grid">${ui.card({ title: 'Star breakdown', icon: 'star', body: ui.hbars(dist) })}
        ${ui.card({ title: 'Ask for a review', sub: 'Visited in the last week', icon: 'send', tone: 'blue', flush: true, body: recent.map((c) => { const asked = s.asks[c.id]; return `<div class="li">${T.avatar(T.fullName(c), 'sm')}<span class="grow"><a class="t1" href="#/customers/${c.id}" style="display:block">${esc(T.fullName(c))}</a><div class="t2">Visited ${T.timeAgo(c.lastVisit)}</div></span>${asked ? ui.badge('Asked', 'green') : `<button class="btn btn-xs" data-act="askReview" data-id="${c.id}">${icon('msg', 'sm')}Text link</button>`}</div>`; }).join('') || ui.empty('Nobody to ask right now') })}</div></div>`;
  }
  const reviewRow = (r) => `<div class="review" id="rv-${r.id}"><div class="row"><span class="src ${r.source}">${r.source[0].toUpperCase()}</span><b>${esc(r.author)}</b>${ui.stars(r.rating)}<span class="spacer"></span><span class="small faint">${T.timeAgo(r.date)}</span></div><p style="margin:8px 0 0">${esc(r.text)}</p>${r.status === 'posted' ? `<div class="reply-box small"><b>Your reply</b> <span class="faint">· posted</span><div class="muted mt-s" style="margin-top:4px">${esc(r.reply)}</div></div>` : `<div class="reply-box"><div class="row small" style="margin-bottom:8px"><span class="auto-tag">${icon('sparkles', 'sm')}AI draft</span><span class="faint">Review it, edit if you like, then approve</span></div><textarea class="input" id="rd-${r.id}" aria-label="Reply draft">${esc(r.draft)}</textarea><div class="row-wrap mt-s"><button class="btn btn-sm btn-success" data-act="postReply" data-id="${r.id}">${icon('check', 'sm')}Approve and post</button><button class="btn btn-sm" data-act="regenReply" data-id="${r.id}">${icon('refresh', 'sm')}Rewrite</button></div></div>`}</div>`;
  A.reviewFilter = (el) => { S().ui.reviewFilter = el.dataset.v; T.save(); T.render(true); };
  A.postReply = (el) => { const r = T.byId(S().reviews, el.dataset.id); const ta = document.getElementById('rd-' + r.id); r.reply = ta ? ta.value : r.draft; r.status = 'posted'; T.save(); T.toast('Reply posted (demo)'); T.feed({ icon: 'star', text: `Replied to ${r.author}'s ${r.rating}-star review`, href: '#/reviews' }); T.refreshNav(); T.render(true); };
  A.regenReply = (el) => { const r = T.byId(S().reviews, el.dataset.id); const v = cfg.replyVariants(r); r.draft = v[(v.indexOf(r.draft) + 1) % v.length]; T.save(); const ta = document.getElementById('rd-' + r.id); if (ta) { ta.value = r.draft; ta.classList.add('flash'); setTimeout(() => ta.classList.remove('flash'), 1200); } };
  A.askReview = (el) => { const c = T.byId(S().customers, el.dataset.id); S().asks[c.id] = new Date().toISOString(); T.logTo(c.id, 'text', 'Review request text sent with Google review link'); T.save(); T.toast(`Review link texted to ${c.first} (demo)`); el.outerHTML = ui.badge('Asked', 'green'); };
  A.askReviewBulk = () => { const s = S(); const list = s.customers.filter((c) => c.lastVisit && T.daysSince(c.lastVisit) <= 6 && !s.asks[c.id]); list.forEach((c) => { s.asks[c.id] = new Date().toISOString(); }); T.save(); T.toast(`Review requests queued for ${list.length} ${cfg.crm.label.toLowerCase()} (demo)`, { icon: 'send' }); T.render(true); };

  // ================= LEADS (AI website assistant) =================
  function leadsPage(id) {
    const s = S(); const L = s.leads.slice().sort((a, b) => b.date.localeCompare(a.date)); const sel = id && T.byId(s.leads, id);
    const counts = { new: L.filter((l) => l.status === 'new').length };
    const conv = L.filter((l) => l.status === 'booked' || l.status === 'won').length;
    const stTone = { new: 'red', contacted: 'amber', booked: 'green', won: 'green', closed: '' };
    return ui.pageHead({ title: 'Leads from your AI website assistant', sub: 'Your website answers questions 24/7 and hands you warm leads', actions: `<a class="btn" href="#/automations">${icon('workflow', 'sm')}Lead automations</a>` })
      + `<div class="kpis">${[{ label: 'Conversations, 30 days', icon: 'bot', value: s.x.chats30 || 214, count: s.x.chats30 || 214, delta: ui.delta(s.x.chats30 || 214, (s.x.chats30 || 214) * .8) }, { label: 'Leads captured', icon: 'users', value: L.length, count: L.length, delta: '<span class="faint">name + phone or email</span>' }, { label: 'Booked or won', icon: 'check', value: conv, count: conv, delta: `<span class="faint">${T.pct(conv / L.length)} conversion</span>` }, { label: 'After-hours leads', icon: 'moon', value: L.filter((l) => { const h = new Date(l.date).getHours(); return h < 9 || h >= 20; }).length, delta: '<span class="faint">would have been missed</span>' }].map(ui.kpi).join('')}</div>`
      + `<div class="card inbox ${sel ? 'has-sel' : ''}"><div class="ilist">${L.map((l) => `<a class="iitem ${sel && sel.id === l.id ? 'on' : ''}" href="#/leads/${l.id}">${T.avatar(l.name, 'sm')}<span style="min-width:0;flex:1"><span class="row" style="gap:6px"><b class="ellip">${esc(l.name)}</b><span class="spacer"></span><span class="tiny faint nowrap">${T.timeAgo(l.date)}</span></span><span class="row" style="gap:6px;margin:3px 0">${ui.badge(l.status[0].toUpperCase() + l.status.slice(1), stTone[l.status])}<span class="tiny faint ellip">${esc(l.source)}</span></span><span class="t2">${esc(l.intent)}</span></span></a>`).join('')}</div>
        <div class="ipane">${sel ? leadPane(sel) : `<div class="empty" style="padding:80px 20px">${icon('bot')}<div>Pick a conversation to see the full transcript</div></div>`}</div></div>`;
  }
  function leadPane(l) {
    return `<div class="card-head" style="padding-bottom:12px;border-bottom:1px solid var(--border)"><a class="icon-btn hide-d" href="#/leads" aria-label="Back">${icon('chevL')}</a>${T.avatar(l.name)}<div style="min-width:0"><h3>${esc(l.name)}</h3><div class="sub">${esc(l.phone || '')}${l.email ? ' · ' + esc(l.email) : ''}</div></div><div class="right"><select class="input" style="height:34px;width:auto" data-change="leadStatus" data-id="${l.id}" aria-label="Lead status">${['new', 'contacted', 'booked', 'won', 'closed'].map((x) => `<option value="${x}" ${l.status === x ? 'selected' : ''}>${x[0].toUpperCase() + x.slice(1)}</option>`).join('')}</select></div></div>
      <div class="infobox" style="margin:14px 18px 0"><b>${icon('sparkles', 'sm').replace('class="i sm"', 'class="i sm" style="vertical-align:-3px;color:var(--accent-text)"')} AI summary:</b> ${esc(l.summary)}${l.value ? ` <b>Est. value ${T.money(l.value)}.</b>` : ''}</div>
      <div class="chat mt-s" style="margin:14px 18px;border-radius:14px">${l.transcript.map((m) => `<div class="bub ${m.from}">${esc(m.text)}</div>`).join('')}<div class="bub-meta">${T.fmtDate(l.date, { weekday: 'short', month: 'short', day: 'numeric' })}, ${T.fmtTime(l.date)} · via ${esc(l.source)}</div></div>
      <div class="card-foot"><button class="btn btn-primary" data-act="leadReply" data-id="${l.id}">${icon('msg', 'sm')}Text back</button><button class="btn" data-act="leadToCrm" data-id="${l.id}">${icon('user', 'sm')}${l.cid ? 'Open in ' + esc(cfg.crm.label) : 'Add to ' + esc(cfg.crm.label)}</button>${cfg.leadBook ? `<button class="btn" data-act="${cfg.leadBook.act}" data-id="${l.id}">${icon('calendar', 'sm')}${esc(cfg.leadBook.label)}</button>` : ''}</div>`;
  }
  A.leadStatus = (el) => { const l = T.byId(S().leads, el.dataset.id); l.status = el.value; T.save(); T.toast('Status updated'); T.refreshNav(); T.render(true); };
  A.leadReply = (el) => { const l = T.byId(S().leads, el.dataset.id); T.form({ title: 'Text ' + l.name.split(' ')[0], icon: 'msg', submitLabel: 'Send (demo)', fields: [{ name: 'msg', label: 'Message', type: 'textarea', full: true, value: l.replyDraft || `Hi ${l.name.split(' ')[0]}, this is ${T.role().person.split(' ')[0]} from ${S().settings.bizName}. Thanks for reaching out on our website! ` }], onSubmit: (d) => { l.transcript.push({ from: 'b', text: d.msg }); if (l.status === 'new') l.status = 'contacted'; T.save(); T.toast('Text sent (demo)'); T.refreshNav(); T.render(true); } }); };
  A.leadToCrm = (el) => { const l = T.byId(S().leads, el.dataset.id); if (l.cid) { T.go('#/customers/' + l.cid); return; } const [first, ...rest] = l.name.split(' '); const c = { id: T.uid('c'), first, last: rest.join(' '), phone: l.phone || '', email: l.email || '', town: l.town || cfg.town, tags: ['Website lead'], source: 'Website', created: new Date().toISOString(), lastVisit: null, visits: 0, ltv: 0, birthday: new Date(1985, 5, 15).toISOString(), notes: l.summary, next: { text: 'Follow up on website inquiry', due: T.at(1, 10) }, staff: null, timeline: [] }; if (cfg.crm.onCreate) cfg.crm.onCreate(c); S().customers.unshift(c); l.cid = c.id; T.logTo(c.id, 'note', 'Created from AI website assistant conversation: ' + l.intent); T.save(); T.toast(`${l.name} added to ${cfg.crm.label}`); T.render(true); };

  // ================= SETTINGS =================
  function settingsPage() {
    const s = S(); const st = s.settings; const pr = st.profile; const emp = T.isEmp();
    const sw = cfg.swatches || [];
    const roleCards = cfg.roles.map((r) => `<button class="role-card ${st.role === r.key ? 'on' : ''}" data-act="setRole" data-v="${r.key}">${T.avatar(r.person, '', r.color)}<span style="min-width:0;text-align:left"><b>${esc(r.label)}</b><small>${esc(r.person)}</small><span class="tiny muted" style="display:block;margin-top:4px">${esc(r.sees)}</span></span>${st.role === r.key ? `<span class="badge b-green" style="margin-left:auto">Viewing</span>` : ''}</button>`).join('');
    return ui.pageHead({ title: 'Settings', sub: emp ? 'Your preferences' : 'Business profile, team access and connected apps' })
      + `<div class="grid g-2">
        ${emp ? '' : ui.card({ title: 'Business profile', icon: 'shield', body: `<div class="form-grid">${T.fieldHtml({ name: 'bizName', label: 'Business name', value: st.bizName })}${T.fieldHtml({ name: 'owner', label: 'Owner', value: cfg.roles[0].person })}${T.fieldHtml({ name: 'phone', label: 'Phone', value: pr.phone })}${T.fieldHtml({ name: 'web', label: 'Website', value: pr.web })}${T.fieldHtml({ name: 'addr', label: 'Address', value: pr.addr, full: true })}${T.fieldHtml({ name: 'hours', label: 'Hours', value: pr.hours, full: true })}</div><button class="btn btn-primary" data-act="saveProfile">Save profile</button>` })}
        ${ui.card({ title: 'Branding and appearance', icon: 'image', body: `${emp ? '' : `<div class="flabel">Brand color</div><div class="swatches mt-s">${sw.map((c) => `<button class="swatch ${(st.brandColor || cfg.theme['--brand']) === c ? 'on' : ''}" style="background:${c}" data-act="setBrand" data-v="${c}" aria-label="Use color ${c}"></button>`).join('')}<label class="swatch" style="display:grid;place-items:center;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);cursor:pointer" title="Custom color"><input type="color" data-change="customBrand" value="${st.brandColor || cfg.theme['--brand']}" style="opacity:0;width:1px;height:1px" aria-label="Custom brand color"></label></div><p class="hint mt-s">Your dashboard uses your colors and logo.</p>`}
          <div class="set-row" style="padding:14px 0 0;border:0"><span class="grow"><b>Dark mode</b><div class="small muted">Easier on the eyes after close</div></span><label class="switch"><input type="checkbox" ${st.dark ? 'checked' : ''} data-change="darkSwitch" aria-label="Dark mode"><span class="track"></span></label></div>` })}
      </div>
      <div class="mt">${ui.card({ title: 'Team and roles', sub: 'Every role sees its own version of this dashboard. Click one to preview it.', icon: 'users', tone: 'blue', body: `<div class="role-cards">${roleCards}</div>${emp ? '' : `<div class="table-wrap mt">${ui.table({ cols: [{ l: 'Name', v: (m) => `<span class="name-cell">${T.avatar(m.name, 'sm', m.color)}<b>${esc(m.name)}</b></span>` }, { l: 'Job', v: (m) => esc(m.title) }, { l: 'Access', v: (m) => ui.badge(m.roleKey === 'owner' ? 'Owner' : m.roleKey === 'manager' ? 'Manager' : 'Staff', m.roleKey === 'owner' ? 'brand' : m.roleKey === 'manager' ? 'blue' : '') }, { l: 'Phone', v: (m) => esc(m.phone || '(631) 555-0140') }], rows: s.team })}</div>`}` })}</div>
      ${emp ? '' : `<div class="mt">${ui.card({ title: 'Connected apps', sub: 'Your dashboard pulls from the tools you already use', icon: 'link', tone: 'violet', right: '<span class="sample">Demo connections</span>', body: `<div class="apps">${cfg.apps.map((a, i) => `<div class="app-tile"><span class="app-logo" style="background:${a.color}">${esc(a.abbr)}</span><span style="min-width:0;flex:1"><b class="ellip" style="display:block">${esc(a.name)}</b><span class="small ${(s.x.disconnected || []).includes(a.name) ? 'faint' : 'up'}">${(s.x.disconnected || []).includes(a.name) ? 'Not connected' : '● Connected'}</span><span class="tiny faint" style="display:block">${esc(a.desc)}</span></span><label class="switch"><input type="checkbox" ${(s.x.disconnected || []).includes(a.name) ? '' : 'checked'} data-change="toggleApp" data-v="${esc(a.name)}" aria-label="${esc(a.name)} connection"><span class="track"></span></label></div>`).join('')}</div>` })}</div>`}
      <div class="grid g-2 mt">
        ${ui.card({ title: 'Demo data', icon: 'refresh', tone: 'amber', body: `<p class="muted small">This is a demo with made-up sample data for a fictional business. Changes you make are saved in this browser only.</p><button class="btn btn-danger" data-act="resetDemo">${icon('refresh', 'sm')}Reset demo data</button>` })}
        <section class="card tvl-card"><div class="card-body" style="padding:22px;position:relative;z-index:1"><div class="tvl-logo"><i>3VL</i>Three Village Local</div><h3 style="font-size:19px;margin-top:12px">Want a dashboard like this for your business?</h3><p class="muted" style="margin-top:6px">Custom built around how you work, connected to the tools you already use.</p><a class="btn btn-accent mt-s" style="background:#ffd600;border-color:#ffd600;color:#0d2a4f" href="${T.CTA}" target="_blank" rel="noopener">Book a free walkthrough ${icon('arrowR', 'sm')}</a></div></section>
      </div>`;
  }
  A.saveProfile = () => { const st = S().settings; const v = (n) => document.getElementById('f-' + n).value; st.bizName = v('bizName') || st.bizName; Object.assign(st.profile, { phone: v('phone'), web: v('web'), addr: v('addr'), hours: v('hours') }); T.save(); document.querySelectorAll('.brand-name, .mobile-brand span').forEach((x) => { x.textContent = st.bizName; }); T.toast('Profile saved'); };
  A.setBrand = (el) => { S().settings.brandColor = el.dataset.v; T.save(); T.applyTheme(); T.render(true); T.toast('Brand color updated'); };
  A.customBrand = (el) => { S().settings.brandColor = el.value; T.save(); T.applyTheme(); T.render(true); };
  A.darkSwitch = () => A.toggleDark();
  A.toggleApp = (el) => { const x = S().x; x.disconnected = x.disconnected || []; const n = el.dataset.v; if (el.checked) x.disconnected = x.disconnected.filter((a) => a !== n); else x.disconnected.push(n); T.save(); T.toast(el.checked ? n + ' connected (demo)' : n + ' disconnected (demo)'); T.render(true); };
  A.resetDemo = () => T.confirm('Reset demo data?', 'This puts every number, customer and post back to the original sample data.', 'Reset', () => { T.Store.reset(); T.applyTheme(); T.buildNav(); T.toast('Demo data reset'); T.go('#/'); });

  // ================= COMMAND PALETTE =================
  let palEl = null, palSel = 0, palItems = [];
  T.paletteOpen = () => !!palEl;
  const closePal = () => { if (palEl) { palEl.remove(); document.querySelector('.scrim.pal') && document.querySelector('.scrim.pal').remove(); palEl = null; } };
  A.palette = () => {
    if (palEl) return; T.closePopover();
    const scrim = document.createElement('div'); scrim.className = 'scrim pal'; scrim.onclick = closePal;
    palEl = document.createElement('div'); palEl.className = 'palette'; palEl.setAttribute('role', 'dialog'); palEl.setAttribute('aria-label', 'Search');
    palEl.innerHTML = `<div class="pin">${icon('search')}<input id="palQ" placeholder="Search ${esc(cfg.crm.label.toLowerCase())}, screens, actions..." autocomplete="off" aria-label="Search"><kbd>Esc</kbd></div><div class="pres" id="palRes"></div><div class="pfoot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span class="spacer"></span><span>Demo by Three Village Local</span></div>`;
    document.body.append(scrim, palEl); requestAnimationFrame(() => { scrim.classList.add('on'); palEl.classList.add('on'); });
    const q = palEl.querySelector('#palQ'); q.focus();
    const run = () => {
      const v = q.value.trim().toLowerCase(); const s = S(); const groups = [];
      const pages = Object.keys(T.pages).filter((k) => T.canSee(k) && (!v || (T.pages[k].title + ' ' + (T.pages[k].navLabel || '')).toLowerCase().includes(v))).map((k) => ({ label: T.pages[k].navLabel || T.pages[k].title, icon: T.pages[k].icon, href: '#/' + (k === 'home' ? '' : k), sub: 'Screen' }));
      const acts = [{ label: 'Add ' + cfg.crm.singular.toLowerCase(), icon: 'plus', act: 'newCustomer' }, { label: 'New calendar ' + (cfg.calendar.noun || 'event'), icon: 'calendar', act: 'newEvent' }, { label: 'New task', icon: 'tasks', act: 'newTask' }, { label: 'Draft a social post with AI', icon: 'sparkles', act: 'aiPost', roles: ['owner', 'manager'] }, { label: 'Ask your business anything', icon: 'sparkles', act: 'ai' }, { label: 'Toggle dark mode', icon: 'moon', act: 'toggleDark' }].concat(cfg.roles.map((r) => ({ label: 'View as ' + r.label, icon: 'eye', act: 'setRole', v: r.key }))).filter((a) => T.can(a.roles) && (!v || a.label.toLowerCase().includes(v))).map((a) => Object.assign({ sub: 'Action' }, a));
      const custs = v ? s.customers.filter((c) => (!T.isEmp() || !cfg.crm.mine || cfg.crm.mine(c, T.me())) && (T.fullName(c) + ' ' + c.phone + ' ' + c.email).toLowerCase().includes(v)).slice(0, 6).map((c) => ({ label: T.fullName(c), sub: c.town, av: T.fullName(c), href: '#/customers/' + c.id })) : [];
      const extra = v && cfg.search ? cfg.search(v).filter((x) => !x.roles || T.can(x.roles)).slice(0, 6) : [];
      if (custs.length) groups.push([cfg.crm.label, custs]); if (extra.length) groups.push(['Records', extra]); if (pages.length) groups.push(['Screens', pages.slice(0, v ? 8 : 6)]); if (acts.length) groups.push(['Actions', acts.slice(0, v ? 8 : 5)]);
      palItems = groups.flatMap((g) => g[1]); palSel = 0;
      let k = 0;
      palEl.querySelector('#palRes').innerHTML = groups.length ? groups.map(([g, its]) => `<div class="pg">${esc(g)}</div>${its.map((it) => `<a class="pi ${k === 0 ? 'sel' : ''}" data-pi="${k++}" ${it.href ? `href="${it.href}"` : ''}>${it.av ? T.avatar(it.av, 'sm') : `<span class="card-icon" style="width:28px;height:28px">${icon(it.icon || 'arrowR', 'sm')}</span>`}<span class="ellip">${esc(it.label)}</span><span class="s">${esc(it.sub || '')}</span></a>`).join('')}`).join('') : ui.empty('No results', 'search');
    };
    const choose = (i) => { const it = palItems[i]; if (!it) return; closePal(); if (it.href) T.go(it.href); else if (it.act) A[it.act]({ dataset: { v: it.v || '' } }); };
    q.addEventListener('input', run);
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closePal(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel + (e.key === 'ArrowDown' ? 1 : -1) + palItems.length) % palItems.length; palEl.querySelectorAll('.pi').forEach((x) => x.classList.toggle('sel', +x.dataset.pi === palSel)); const el = palEl.querySelector('.pi.sel'); if (el) el.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(palSel); }
    });
    palEl.addEventListener('click', (e) => { const a = e.target.closest('.pi'); if (a) { e.preventDefault(); choose(+a.dataset.pi); } });
    run();
  };

  // ================= COMMON SEED (reviews, posts, leads, campaigns, tasks, feed) =================
  T.seedCommon = (G, s, P) => {
    const cs = s.customers; const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
    // reviews
    s.reviews = P.reviews.map((r, i) => { const c = cs[(i * 7 + 3) % cs.length]; const date = i < 6 ? G.daysAgoISO(0, 6 + i, 8, 21) : G.daysAgoISO(4 + i * 4, 9 + i * 5, 8, 21); const o = { id: 'rv' + i, source: r.src || G.weighted([['google', 6], ['yelp', 2], ['facebook', 1]]), rating: r.r, author: c.first + ' ' + c.last[0] + '.', cid: c.id, text: r.t, date, reply: '', draft: '', status: 'posted' }; const v = cfg.replyVariants(o); if (i < 5) { o.status = 'draft'; o.draft = v[0]; } else { o.reply = v[1 % v.length]; } return o; });
    // rating trend (12 months)
    const base = s.x.googleRating || 4.7; s.x.ratingTrend = []; const t = T.today0();
    for (let m = 11; m >= 0; m--) { const d = new Date(t.getFullYear(), t.getMonth() - m, 1); s.x.ratingTrend.push({ l: d.toLocaleDateString('en-US', { month: 'short' }), v: +(base - 0.22 + 0.22 * (11 - m) / 11 + (G.r() - 0.5) * 0.12).toFixed(2) }); }
    // social posts
    const days = [-34, -30, -27, -23, -20, -16, -13, -10, -8, -6, -4, -3, -2, -1, 0, 1, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14];
    s.posts = days.map((off, i) => { const p = P.posts[i % P.posts.length]; const hr = G.pick([11, 12, 17, 18, 19]); const date = T.at(off, hr, G.pick([0, 30])); const past = off < 0 || (off === 0 && hr < new Date().getHours());
      const status = past ? 'posted' : off <= 1 ? G.pick(['scheduled', 'approval']) : off <= 5 ? G.pick(['approval', 'scheduled', 'draft']) : G.pick(['draft', 'idea', 'approval']);
      const reach = Math.round(G.int(600, 4200) * (p.platform === 'tiktok' ? 2.2 : p.platform === 'google' ? 0.6 : 1));
      return { id: 'p' + i, platform: p.platform || G.pick(['instagram', 'instagram', 'facebook', 'tiktok', 'google']), title: p.title, sub: p.sub, tag: p.tag, caption: p.caption, date, status, by: G.pick(s.team).name, stats: status === 'posted' ? { reach, likes: Math.round(reach * G.f(0.04, 0.09)), comments: Math.round(reach * G.f(0.004, 0.012)), shares: Math.round(reach * G.f(0.003, 0.01)), saves: Math.round(reach * G.f(0.005, 0.015)) } : null }; });
    // AI website assistant leads
    const lst = ['new', 'new', 'new', 'contacted', 'booked', 'contacted', 'won', 'booked', 'closed', 'won', 'contacted', 'booked'];
    s.leads = P.leads.map((l, i) => { const nm = G.name(); const name = nm.first + ' ' + nm.last; const date = i < 3 ? minsAgo(G.int(20, 60 * (i + 1) * 5)) : G.daysAgoISO(i - 2, i + 1, 7, 23); return Object.assign({ id: 'l' + i, name, phone: G.phone(), email: G.email(nm.first, nm.last), date, status: lst[i % lst.length], source: l.source || G.pick(['AI website assistant', 'AI website assistant', 'AI website assistant', 'Instagram DM', 'Website form']) }, l, { transcript: l.transcript.map((m) => ({ from: m[0], text: m[1].replace('{first}', nm.first) })) }); });
    // campaigns
    s.campaigns = P.campaigns.map((c, i) => { const sent = Math.round((cfg.analytics.email.list) * G.f(0.85, 1)); const opens = Math.round(sent * G.f(0.38, 0.55)); return Object.assign({ id: 'cp' + i, status: c.status || 'sent', date: c.status === 'scheduled' ? T.at(c.off || 3, 10) : T.at(-(c.ago || (i * 9 + 3)), 10), sent, opens, clicks: Math.round(opens * G.f(0.09, 0.16)), revenue: c.status ? 0 : G.int(c.rmin || 600, c.rmax || 4200) }, c); });
    // email list growth (12 months)
    let L = cfg.analytics.email.list; s.mkt.emailList = [];
    for (let m = 0; m < 12; m++) { const d = new Date(t.getFullYear(), t.getMonth() - m, 1); s.mkt.emailList.unshift({ l: d.toLocaleDateString('en-US', { month: 'short' }), v: Math.round(L) }); L -= cfg.analytics.email.gain * 30 * G.f(0.7, 1.3); }
    // tasks
    s.tasks = P.tasks.map((x, i) => ({ id: 'k' + i, title: x[0], who: s.team[x[1]].id, due: T.at(x[2], 17), done: !!x[4], pri: x[3] || 'normal', href: x[5] || null, auto: !!x[6] }));
    // feed + notifications
    s.feed = s.feed.concat((P.feed || []).map((f, i) => ({ id: 'fs' + i, icon: f[0], text: f[1], href: f[2], date: minsAgo(f[3]), tone: f[4] })));
    s.notifs = s.notifs.concat((P.notifs || []).map((f, i) => ({ id: 'ns' + i, icon: f[0], text: f[1], href: f[2], date: minsAgo(f[3]), read: i > 2, roles: f[4] })));
  };

  // ================= REGISTER =================
  T.registerCore = (config) => {
    cfg = config;
    Object.assign(T.pages, T.pagesCore(), {
      customers: { title: cfg.crm.label, icon: cfg.crm.icon || 'users', roles: ['owner', 'manager', 'employee'], render: (p) => p ? profilePage(p) : crmPage() },
      calendar: { title: 'Calendar', icon: 'calendar', roles: ['owner', 'manager', 'employee'], render: calPage, after: calAfter },
      finance: { title: 'Finance', icon: 'dollar', render: financePage },
      marketing: { title: 'Marketing', icon: 'megaphone', render: marketingPage },
      social: { title: 'Social studio', navLabel: 'Social studio', icon: 'image', render: socialPage, after: socialAfter, count: (s) => s.posts.filter((p) => p.status === 'approval').length },
      reviews: { title: 'Reviews', icon: 'star', render: reviewsPage, count: (s) => s.reviews.filter((r) => r.status !== 'posted').length },
      tasks: { title: 'Tasks & team', navLabel: 'Tasks & team', tabLabel: 'Tasks', icon: 'tasks', roles: ['owner', 'manager', 'employee'], render: tasksPage, count: (s) => s.tasks.filter((t) => !t.done && T.dayDiff(t.due) <= 0 && (!T.isEmp() || t.who === T.me().id)).length },
      leads: { title: 'Website leads', navLabel: 'Website leads', icon: 'bot', render: leadsPage, count: (s) => s.leads.filter((l) => l.status === 'new').length },
      settings: { title: 'Settings', icon: 'settings', roles: ['owner', 'manager', 'employee'], render: settingsPage }
    });
    if (T.registerInsights) T.registerInsights(cfg);
  };
})();
