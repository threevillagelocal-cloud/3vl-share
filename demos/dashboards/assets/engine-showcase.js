/* Three Village Local dashboards engine - industry showcase widgets for the owner/manager Command Center.
   Every industry gets its own signature top-of-home layout so each dashboard is recognizable at a glance:
   restaurant = tonight's floor plan + specials photos + covers by hour
   contractor = blueprint hero + job board with progress photos + schedule (Gantt)
   salon      = stylist chair timeline + before/after + retail shelf
   gym        = membership rings + class tiles with fill + check-in heatmap + coaches
   landscaper = crew route map + 7-day weather + seasonal service mix + today's properties */
(function () {
  'use strict';
  const T = window.TVL; if (!T) return;
  const { icon, esc, ui } = T; const S = T.S;
  const IMG = 'assets/img/ind/';
  const X = () => S().x || {};
  const today = (iso) => T.dayDiff(iso) === 0;
  const nowH = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
  const hOf = (iso) => { const d = new Date(iso); return d.getHours() + d.getMinutes() / 60; };
  const ph = (n) => IMG + n + '.webp';
  const img = (n, alt, cls) => `<img class="${cls || ''}" src="${ph(n)}" alt="${esc(alt || '')}" loading="lazy" decoding="async" width="480" height="360">`;
  const ring = (p, size, stroke, color, track) => { const r = (size - stroke) / 2; const c = 2 * Math.PI * r; return `<svg class="sc-ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track || 'var(--surface-3)'}" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c * T.clamp(p, 0, 1)).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`; };
  const kpiNum = (label, fb) => { try { const k = (T.cfg.kpis(S()) || []).find((x) => x.label && x.label.toLowerCase().indexOf(label) >= 0); if (!k) return fb; const n = parseFloat(String(k.count != null ? k.count : k.value).replace(/[^0-9.]/g, '')); return isNaN(n) ? fb : n; } catch (e) { return fb; } };

  // =====================================================================
  // RESTAURANT: Harbor & Vine
  // =====================================================================
  const FLOOR = { // table id: [x, y, shape, w, h]
    T1: [62, 74, 'r', 15], T2: [62, 142, 'r', 15], T3: [62, 214, 's', 34], T4: [62, 290, 's', 34], T5: [140, 290, 'b', 66, 34],
    T6: [168, 74, 'r', 15], T7: [168, 150, 's', 34], T8: [246, 150, 's', 34], T9: [324, 150, 's', 34], T10: [246, 228, 'b', 66, 34], T11: [262, 300, 'b', 92, 36],
    P1: [470, 228, 'r', 15], P2: [530, 228, 'r', 15], P3: [470, 296, 's', 34], P4: [536, 296, 's', 34], B1: [500, 132, 'r', 13]
  };
  const SEATS = { T1: 2, T2: 2, T3: 4, T4: 4, T5: 6, T6: 2, T7: 4, T8: 4, T9: 4, T10: 6, T11: 8, P1: 2, P2: 2, P3: 4, P4: 4, B1: 2 };
  function restaurant() {
    const res = (X().res || []).filter((r) => today(r.start) && r.status !== 'cancelled');
    const nh = nowH();
    const byT = {}; res.forEach((r) => { (byT[r.table] = byT[r.table] || []).push(r); });
    Object.values(byT).forEach((a) => a.sort((x, y) => x.start.localeCompare(y.start)));
    let seated = 0, booked = 0, open = 0;
    const tables = Object.keys(FLOOR).map((id) => {
      const [x, y, sh, w, h] = FLOOR[id]; const L = byT[id] || [];
      const cur = L.find((r) => hOf(r.start) <= nh && nh < hOf(r.start) + r.dur / 60 && r.status !== 'no-show');
      const next = L.find((r) => hOf(r.start) > nh) || null;
      const up = L.filter((r) => hOf(r.start) > nh).length; const st = cur ? 'seated' : up >= 4 ? 'full' : up === 3 ? 'turns' : up ? 'booked' : 'open';
      if (st === 'seated') seated++; else if (st === 'open') open++; else booked++;
      const vip = L.some((r) => r.vip); const allergy = L.some((r) => /free|allerg|nut|shellfish|gluten|dairy/i.test(r.note || ''));
      const n = SEATS[id]; const chairs = [];
      if (sh === 'r') { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.PI / 2; chairs.push([x + Math.cos(a) * (w + 8), y + Math.sin(a) * (w + 8)]); } }
      else { const W = w, H = h || w; const per = Math.max(1, Math.round(n / 2)); for (let i = 0; i < per; i++) { const cx = x - W / 2 + (W / (per + 1)) * (i + 1); chairs.push([cx, y - H / 2 - 7], [cx, y + H / 2 + 7]); } }
      const body = sh === 'r' ? `<circle class="fp-t" cx="${x}" cy="${y}" r="${w}"/>` : `<rect class="fp-t" x="${x - w / 2}" y="${y - (h || w) / 2}" width="${w}" height="${h || w}" rx="7"/>`;
      const lab = next ? T.fmtTime(next.start).replace(':00', '').replace(' PM', 'p').replace(' AM', 'a') : cur ? 'now' : '';
      const tip = `${id} · ${n} seats${L.length ? ' · ' + L.length + (L.length > 1 ? ' parties tonight' : ' party tonight') : ' · open'}${next ? ' · next ' + T.fmtTime(next.start) + ', party of ' + next.party : ''}`;
      return `<g class="fp-g fp-${st}" data-tip="${esc(tip)}">${chairs.map(([cx, cy]) => `<circle class="fp-c" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.2"/>`).join('')}${body}<text class="fp-id" x="${x}" y="${y - 1}">${id}</text>${lab ? `<text class="fp-tm" x="${x}" y="${y + 11}">${lab}</text>` : ''}${vip ? `<circle class="fp-vip" cx="${x + (sh === 'r' ? w : w / 2) - 2}" cy="${y - (sh === 'r' ? w : (h || w) / 2) + 2}" r="7"/><text class="fp-vipt" x="${x + (sh === 'r' ? w : w / 2) - 2}" y="${y - (sh === 'r' ? w : (h || w) / 2) + 5.5}">★</text>` : ''}${allergy ? `<circle class="fp-al" cx="${x - (sh === 'r' ? w : w / 2) + 2}" cy="${y - (sh === 'r' ? w : (h || w) / 2) + 2}" r="4.5"/>` : ''}</g>`;
    }).join('');
    const svg = `<svg class="fp" viewBox="0 0 600 350" role="img" aria-label="Tonight's floor plan">
      <rect class="fp-room" x="14" y="14" width="572" height="322" rx="16"/>
      <path class="fp-win" d="M14 40v270"/><text class="fp-lbl fp-v" x="0" y="0" transform="translate(30 175) rotate(-90)">HARBOR WINDOWS</text>
      <rect class="fp-zone" x="420" y="30" width="152" height="66" rx="10"/><text class="fp-lbl" x="496" y="58">BAR</text><text class="fp-sub" x="496" y="74">12 seats · B1 high-top</text>
      <rect class="fp-zone2" x="420" y="190" width="152" height="138" rx="10"/><text class="fp-lbl" x="496" y="182">PATIO, HEATED</text>
      <path class="fp-wall" d="M392 30v126M392 190v130"/><text class="fp-lbl" x="232" y="36">MAIN DINING</text>
      <rect class="fp-pass" x="214" y="318" width="96" height="10" rx="3"/><text class="fp-sub" x="196" y="327" text-anchor="end">kitchen pass</text>
      ${tables}</svg>`;
    const legend = `<div class="fp-leg"><span><i class="l-seated"></i>Seated now</span><span><i class="l-full"></i>4+ seatings</span><span><i class="l-turns"></i>3 seatings</span><span><i class="l-booked"></i>1 to 2</span><span><i class="l-open"></i>Open</span><span><i class="l-vip">★</i>VIP</span><span><i class="l-al"></i>Allergy note</span></div>`;
    const floor = ui.card({ cls: 'sc-floor fade-in', title: "Tonight's floor", sub: `${res.length} parties · ${T.sum(res, (r) => r.party)} covers · ${open ? open + ' tables still open' : 'every table is booked'}`, icon: 'table', right: '<a class="btn btn-sm" href="#/reservations">Open book</a>', body: svg + legend });

    // specials photo strip
    const sp = (X().specials || [])[0]; const menu = (X().menu || []).slice().sort((a, b) => b.sold - a.sold);
    const pick = (re, fb) => menu.find((m) => re.test(m.name)) || fb;
    const tiles = [
      { p: 'r-crudo', t: sp ? sp.dish : 'Montauk tuna crudo', s: "Tonight's special", n: sp ? sp.sold + ' sold so far' : '', price: sp ? sp.price : 19, hot: true },
      { p: 'r-scallops', t: (pick(/scallop/i, { name: 'Seared sea scallops' })).name, s: 'Top seller', n: (pick(/scallop/i, { sold: 212 })).sold + ' this month', price: (pick(/scallop/i, { price: 36 })).price },
      { p: 'r-steak', t: (pick(/steak|strip|ribeye/i, { name: 'Dry-aged NY strip' })).name, s: 'Mains', n: (pick(/steak|strip|ribeye/i, { sold: 168 })).sold + ' this month', price: (pick(/steak|strip|ribeye/i, { price: 46 })).price },
      { p: 'r-branzino', t: (pick(/branzino|bass|fluke|cod|salmon/i, { name: 'Whole roasted branzino' })).name, s: 'Mains', n: (pick(/branzino|bass|fluke|cod|salmon/i, { sold: 141 })).sold + ' this month', price: (pick(/branzino|bass|fluke|cod|salmon/i, { price: 38 })).price }
    ];
    const strip = ui.card({ cls: 'sc-dishes fade-in', title: 'On the menu tonight', sub: 'Photos sync to your website, Google and social', icon: 'chef', right: '<a class="btn btn-sm" href="#/specials">Specials</a>', body: `<div class="dish-row">${tiles.map((d) => `<a class="dish" href="#/${d.hot ? 'specials' : 'menu'}">${img(d.p, d.t)}<span class="dish-tag ${d.hot ? 'hot' : ''}">${esc(d.s)}</span><span class="dish-b"><b>${esc(d.t)}</b><span>${T.isEmp() ? '' : '$' + d.price + ' · '}${esc(d.n)}</span></span></a>`).join('')}</div>` });

    // covers by hour
    const hrs = [17, 18, 19, 20, 21]; const cov = hrs.map((h) => T.sum(res.filter((r) => Math.floor(hOf(r.start)) === h), (r) => r.party)); const mx = Math.max(10, ...cov);
    const peak = hrs[cov.indexOf(Math.max(...cov))];
    const bars = `<div class="cov">${hrs.map((h, i) => `<div class="cov-c"><b>${cov[i]}</b><div class="cov-b"><i style="height:${(cov[i] / mx * 100).toFixed(0)}%" class="${h === peak ? 'pk' : ''}"></i></div><span>${T.fmtHour(h).replace(':00', '').replace(' PM', 'p')}</span></div>`).join('')}</div>`;
    const covers = ui.card({ cls: 'sc-cov fade-in', title: 'Covers by seating', sub: `Peak at ${T.fmtHour(peak)}, staff up the line`, icon: 'users', body: bars });
    return `<div class="ht ht-restaurant"><div class="ht-a">${'{{HERO}}'}</div><div class="ht-b">${floor}</div></div><div class="ht-row ht-r2">${strip}${covers}</div>`;
  }

  // =====================================================================
  // CONTRACTOR: North Shore Builders
  // =====================================================================
  const JOB_PH = { Kitchen: 'c-kitchen', Bathroom: 'c-bath', Deck: 'c-deck', Addition: 'c-framing', Roofing: 'c-framing' };
  function contractor() {
    const own = T.isOwner();
    const jobs = (X().jobs || []).filter((j) => { const done = j.phases.filter((p) => p.done).length; return done < j.phases.length && T.dayDiff(j.start) <= 0; });
    const pct = (j) => j.phases.filter((p) => p.done).length / j.phases.length;
    const curPh = (j) => (j.phases.find((p) => !p.done) || { name: 'Complete' }).name;
    const crewAv = (ids) => `<span class="av-stack">${ids.map((id) => { const m = T.byId(S().team, id); return m ? T.avatar(m.name, 'sm') : ''; }).join('')}</span>`;
    const used = {};
    const cards = jobs.slice(0, 4).map((j) => {
      let p = JOB_PH[j.type] || 'c-framing'; if (used[p]) p = ['c-framing', 'c-deck', 'c-bath', 'c-kitchen'].find((x) => !used[x]) || p; used[p] = 1;
      const P = pct(j); const dl = Math.max(0, T.dayDiff(j.end));
      return `<a class="jb fade-in" href="#/jobs/${j.id}"><div class="jb-ph">${img(p, j.title + ' progress photo')}<span class="jb-num">${esc(j.num)}</span>${j.behind ? '<span class="jb-flag">Behind</span>' : '<span class="jb-flag ok">On track</span>'}<span class="jb-pct">${ring(P, 46, 5, 'var(--accent)', 'var(--surface-3)')}<b>${Math.round(P * 100)}%</b></span></div>
        <div class="jb-b"><b>${esc(j.title)}</b><span class="t2">${esc(j.addr)}</span><div class="jb-now">${icon('hammer', 'sm')}Now: ${esc(curPh(j))}</div><div class="jb-f">${crewAv(j.crew || [])}<span class="faint small">${dl} days left</span>${own ? `<b class="num small">${T.short(j.value)}</b>` : ''}</div></div></a>`;
    }).join('');
    const board = `<div class="ht-row ht-c2"><div class="jb-grid">${cards}</div></div>`;
    // Gantt: 10 weeks window starting 3 weeks back
    const W0 = T.addDays(T.today0(), -21); const span = 70; const pos = (iso) => T.clamp((new Date(iso) - W0) / 864e5 / span, 0, 1);
    const all = (X().jobs || []).filter((j) => new Date(j.end) > W0 && new Date(j.start) < T.addDays(W0, span)).sort((a, b) => a.start.localeCompare(b.start)).slice(0, 7);
    const wk = Array.from({ length: 10 }, (_, i) => T.addDays(W0, i * 7));
    const tp = (pos(new Date().toISOString()) * 100).toFixed(2);
    const gantt = `<div class="gt"><div class="gt-h"><span></span><div class="gt-w">${wk.map((d) => `<span>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`).join('')}</div></div>${all.map((j) => { const a = pos(j.start), b = pos(j.end); const P = pct(j); return `<a class="gt-r" href="#/jobs/${j.id}"><span class="gt-l"><b>${esc(j.title)}</b><span>${esc(j.client.split(' ')[1] || j.client)}</span></span><div class="gt-t"><i class="gt-today" style="left:${tp}%"></i><span class="gt-bar t-${esc(j.type.toLowerCase())} ${j.behind ? 'late' : ''}" style="left:${(a * 100).toFixed(2)}%;width:${Math.max(2, (b - a) * 100).toFixed(2)}%"><em style="width:${(P * 100).toFixed(0)}%"></em><span>${Math.round(P * 100)}%</span></span></div></a>`; }).join('')}</div>`;
    const sched = ui.card({ cls: 'sc-gantt fade-in', title: 'Project schedule', sub: 'Ten-week view, today marked in orange', icon: 'layers', right: '<a class="btn btn-sm" href="#/jobs">All jobs</a>', body: gantt });
    const perm = (X().permits || []).filter((p) => !/approved|passed|closed/i.test(p.status)).slice(0, 4);
    const insp = ui.card({ cls: 'sc-insp fade-in', title: 'Permits and inspections', sub: perm.length + ' open with the town', icon: 'shield', right: '<a class="btn btn-sm" href="#/permits">Open</a>', flush: true, body: perm.map((p) => { const j = T.byId(X().jobs || [], p.jobId); return `<a class="li click" href="#/permits"><span class="card-icon amber">${icon('file', 'sm')}</span><span class="grow"><div class="t1">${esc(p.type)}</div><div class="t2">${esc(j ? j.title + ', ' + j.addr.split(',')[0] : p.num)}</div></span>${ui.badge(p.status, /sched|ready/i.test(p.status) ? 'blue' : 'amber')}</a>`; }).join('') || ui.empty('All permits approved', 'shield') });
    return `<div class="ht ht-contractor"><div class="ht-a">{{HERO}}</div></div>${board}<div class="ht-row ht-c3">${sched}${insp}</div>`;
  }

  // =====================================================================
  // SALON: Glow Studio
  // =====================================================================
  const SVC_C = { hair: '#b8606f', color: '#7a5aa6', spa: '#3f8fb0', med: '#c47a54' };
  function salon() {
    const own = T.isOwner(); const SV = T.salonSVC || {};
    const ap = (X().appts || []).filter((a) => today(a.start) && a.status !== 'cancelled');
    const provs = S().team.filter((m) => ap.some((a) => a.prov === m.id));
    const H0 = 9, H1 = 20; const nh = nowH(); const span = H1 - H0;
    const colorSvc = ['single', 'root', 'partial', 'full', 'balayage', 'gloss'];
    const kind = (a) => colorSvc.includes(a.svc) ? 'color' : ((SV[a.svc] || [])[1] || 'hair');
    const rows = provs.map((m) => { const L = ap.filter((a) => a.prov === m.id); const booked = T.sum(L, (a) => a.dur) / 60; return `<div class="ch-r"><div class="ch-who">${T.avatar(m.name, '')}<span><b>${esc(m.name.split(' ')[0])}</b><em>${esc((m.title || m.role || '').replace('Senior ', 'Sr. '))}</em></span></div><div class="ch-t">${L.map((a) => { const s = hOf(a.start); const l = (s - H0) / span * 100; const w = a.dur / 60 / span * 100; const k = kind(a); return `<a class="ch-b k-${k} ${s + a.dur / 60 <= nh ? 'past' : ''}" href="#/calendar" style="left:${l.toFixed(2)}%;width:${w.toFixed(2)}%" data-tip="${esc(T.fmtTime(a.start) + ' · ' + a.name + ' · ' + ((SV[a.svc] || [a.svc])[0]))}"><b>${esc(a.name.split(' ')[0])}</b><span>${esc(((SV[a.svc] || [a.svc])[0]).replace(' (about 30 units)', '').replace(' (1 syringe)', ''))}</span></a>`; }).join('')}</div><span class="ch-u">${Math.round(booked / 8 * 100)}%</span></div>`; }).join('');
    const hrs = Array.from({ length: span + 1 }, (_, i) => H0 + i);
    const nowL = nh > H0 && nh < H1 ? `<i class="ch-now" style="left:${((nh - H0) / span * 100).toFixed(2)}%"><span>${T.fmtTime(new Date().toISOString())}</span></i>` : '';
    const tl = `<div class="ch"><div class="ch-h"><span></span><div class="ch-hs">${hrs.map((h, i) => `<span style="left:${(i / span * 100).toFixed(2)}%">${T.fmtHour(h).replace(':00', '').replace(' AM', 'a').replace(' PM', 'p')}</span>`).join('')}</div><span></span></div><div class="ch-body"><div class="ch-grid">${nowL}</div>${rows}</div></div>
      <div class="ch-leg"><span><i style="background:${SVC_C.hair}"></i>Cut and style</span><span><i style="background:${SVC_C.color}"></i>Color</span><span><i style="background:${SVC_C.spa}"></i>Skin and spa</span><span><i style="background:${SVC_C.med}"></i>Med spa</span></div>`;
    const chairs = ui.card({ cls: 'sc-chairs fade-in', title: "Today's chairs", sub: `${ap.length} appointments across ${provs.length} providers`, icon: 'scissors', right: '<a class="btn btn-sm" href="#/calendar">Open book</a>', body: tl });
    const ba = ui.card({ cls: 'sc-ba fade-in', title: 'Before and after', sub: 'Balayage by Andre, ready to post', icon: 'camera', right: '<a class="btn btn-sm" href="#/social">Post it</a>', body: `<div class="ba">${img('s-before', 'Before: dark brown hair')}<div class="ba-r">${img('s-after', 'After: sunlit balayage')}</div><i class="ba-k"></i><span class="ba-l">Before</span><span class="ba-l r">After</span></div>` });
    const prods = (X().products || []).slice().sort((a, b) => b.sold - a.sold).slice(0, 3);
    const shelf = ui.card({ cls: 'sc-shelf fade-in', title: 'Retail shelf', sub: 'Top sellers this month', icon: 'box', right: '<a class="btn btn-sm" href="#/retail">Retail</a>', body: `<div class="shelf">${prods.map((p, i) => `<a class="pr" href="#/retail">${img(['s-prod1', 's-prod2', 's-prod3'][i], p.name)}<b>${esc(p.name.replace('Glow Studio ', ''))}</b><span>${p.sold} sold${own ? ' · $' + p.price : ''}</span>${p.onHand <= 3 ? '<em>Low stock</em>' : ''}</a>`).join('')}</div>` });
    return `<div class="ht ht-salon"><div class="ht-a">{{HERO}}</div><div class="ht-b">${ba}</div></div><div class="ht-row ht-s2">${chairs}${shelf}</div>`;
  }

  // =====================================================================
  // GYM: Iron Harbor Fitness
  // =====================================================================
  const CLS_PH = [[/spin|cycle|ride/i, 'g-spin'], [/yoga|pilates|stretch|flow/i, 'g-yoga'], [/box|kick/i, 'g-box'], [/strength|kettle|lift/i, 'g-hiit'], [/express|bootcamp|core/i, 'g-ropes'], [/hiit/i, 'g-hiit2']];
  const CLS_POOL = ['g-ropes', 'g-hiit2', 'g-hiit', 'g-box', 'g-spin', 'g-yoga'];
  function gym() {
    const cls = (X().classes || []).filter((k) => today(k.start)).sort((a, b) => a.start.localeCompare(b.start));
    const nh = nowH();
    const usedP = {}; const tiles = cls.slice(0, 6).map((k) => { let p = (CLS_PH.find(([re]) => re.test(k.name)) || [0, 'g-hiit'])[1]; if (usedP[p]) p = CLS_POOL.find((x) => !usedP[x]) || p; usedP[p] = 1; const f = k.booked.length / k.cap; const coach = T.byId(S().team, k.coach); const past = hOf(k.start) + k.dur / 60 < nh; const live = hOf(k.start) <= nh && !past;
      return `<a class="gc ${past ? 'past' : ''}" href="#/classes">${img(p, k.name)}<span class="gc-sh"></span><span class="gc-t">${T.fmtTime(k.start)}${live ? '<em class="live">Live</em>' : past ? '<em>Done</em>' : ''}</span><span class="gc-r">${ring(f, 52, 5, f >= 1 ? '#ff6b6b' : 'var(--accent)', 'rgba(255,255,255,.22)')}<b>${k.booked.length}<small>/${k.cap}</small></b></span><span class="gc-b"><b>${esc(k.name)}</b><span>${coach ? esc(coach.name.split(' ')[0]) + ' · ' : ''}${esc(k.room)}${k.wait && k.wait.length ? ' · ' + k.wait.length + ' waitlist' : ''}</span></span></a>`; }).join('');
    const classes = ui.card({ cls: 'sc-classes fade-in', title: "Today's classes", sub: `${cls.length} on the schedule · ${T.sum(cls, (k) => k.booked.length)} spots booked`, icon: 'dumbbell', right: '<a class="btn btn-sm" href="#/classes">Schedule</a>', body: `<div class="gc-grid">${tiles}</div>` });
    // rings
    const active = kpiNum('active members', 128); const fill = kpiNum('class fill', 82) / 100; const trial = kpiNum('trial to member', 43) / 100;
    const goal = 150;
    const rings = `<div class="rg"><div class="rg-art">${ring(active / goal, 168, 14, 'var(--accent)', 'rgba(255,255,255,.1)')}<div class="rg-in">${ring(fill, 128, 14, '#7c8cff', 'rgba(255,255,255,.1)')}</div><div class="rg-in2">${ring(trial, 88, 14, '#ff7a9a', 'rgba(255,255,255,.1)')}</div></div><div class="rg-l"><div><i style="background:var(--accent)"></i><b>${active}</b><span>of ${goal} member goal</span></div><div><i style="background:#7c8cff"></i><b>${Math.round(fill * 100)}%</b><span>class fill rate</span></div><div><i style="background:#ff7a9a"></i><b>${Math.round(trial * 100)}%</b><span>trials who join</span></div></div></div>`;
    const ringCard = `<section class="card sc-rings fade-in"><div class="card-head"><span class="card-icon brand">${icon('target', 'sm')}</span><div><h3>Membership goals</h3><div class="sub">November</div></div></div><div class="card-body">${rings}</div></section>`;
    // heatmap: 7 days x 17 hours (5 AM to 9 PM)
    const r = T.rng('gym-heat'); const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; const hrs = Array.from({ length: 17 }, (_, i) => 5 + i);
    const base = (d, h) => { const wk = d < 5; const am = Math.exp(-Math.pow(h - 6.3, 2) / 1.4) * (wk ? 1 : 0.2); const lunch = Math.exp(-Math.pow(h - 12.2, 2) / 1.2) * 0.45; const pm = Math.exp(-Math.pow(h - 17.8, 2) / 2.2) * (wk ? 0.95 : 0.3); const we = d >= 5 ? Math.exp(-Math.pow(h - 9.5, 2) / 3) * 0.85 : 0; return am + lunch + pm + we + 0.06; };
    const heat = `<div class="hm"><div class="hm-g">${days.map((d, di) => `<span class="hm-d">${d}</span>${hrs.map((h) => { const v = T.clamp(base(di, h) * (0.85 + r() * 0.3), 0, 1); return `<i style="--v:${v.toFixed(2)}" data-tip="${d} ${T.fmtHour(h)}: about ${Math.round(v * 46)} check-ins"></i>`; }).join('')}`).join('')}<span></span>${hrs.map((h) => `<span class="hm-h">${h % 3 === 2 ? T.fmtHour(h).replace(':00', '').replace(' AM', 'a').replace(' PM', 'p') : ''}</span>`).join('')}</div></div>`;
    const heatCard = ui.card({ cls: 'sc-heat fade-in', title: 'Check-in heatmap', sub: 'Last 4 weeks · busiest 6 AM weekdays', icon: 'flame', body: heat });
    const coaches = S().team.filter((m) => /coach/i.test(m.title || m.role || '')).slice(0, 4);
    const coachCard = ui.card({ cls: 'sc-coach fade-in', title: 'Coaches on today', icon: 'users', right: '<a class="btn btn-sm" href="#/team">Team</a>', body: `<div class="co-grid">${coaches.map((m) => { const n = cls.filter((k) => k.coach === m.id).length; const pk = (X().pk || []).filter((p) => p.coach === m.id).length; return `<a class="co" href="#/team">${T.avatar(m.name, 'lg')}<b>${esc(m.name.split(' ')[0])}</b><span>${esc((m.title || '').replace(' Coach', '').replace('Head Coach, ', ''))}</span><em>${n} class${n === 1 ? '' : 'es'} · ${pk} PT</em></a>`; }).join('')}</div>` });
    return `<div class="ht ht-gym"><div class="ht-a">{{HERO}}</div><div class="ht-b">${ringCard}</div></div><div class="ht-row ht-g2">${classes}</div><div class="ht-row ht-g3">${heatCard}${coachCard}</div>`;
  }

  // =====================================================================
  // LANDSCAPER: Greenline Landscape Co.
  // =====================================================================
  const WXD = [{ hi: 54, lo: 41, ic: 'part', pop: 10 }, { hi: 49, lo: 43, ic: 'rain', pop: 90 }, { hi: 56, lo: 39, ic: 'sun', pop: 0 }, { hi: 52, lo: 37, ic: 'sun', pop: 5 }, { hi: 48, lo: 40, ic: 'rain', pop: 60 }, { hi: 50, lo: 36, ic: 'cloud', pop: 20 }, { hi: 53, lo: 38, ic: 'sun', pop: 0 }];
  const WXI = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="#f08a3c" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="#ffa25c" stroke="none"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
    cloud: '<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18z" fill="#aab4c0"/></svg>',
    part: '<svg viewBox="0 0 24 24"><circle cx="8.5" cy="8.5" r="3.6" fill="#ffa25c"/><path d="M8 19h9a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-9.9 1.4A3 3 0 0 0 8 19z" fill="#aab4c0"/></svg>',
    rain: '<svg viewBox="0 0 24 24"><path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 15z" fill="#8c99a8"/><path d="M8 17.5l-1 3M12 17.5l-1 3M16 17.5l-1 3" stroke="#2f7fd6" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };
  function landscaper() {
    const stops = (X().stops || []).filter((p) => today(p.date)).sort((a, b) => a.crew.localeCompare(b.crew) || a.order - b.order);
    const cust = (id) => T.byId(S().customers, id) || {};
    // deterministic positions on a stylized North Shore map
    const r = T.rng('route-map'); const pts = {}; const C = { A: [[118, 126], [176, 98], [236, 136], [292, 118], [338, 166], [300, 218], [246, 242], [186, 222], [140, 270]], B: [[420, 300], [468, 258], [522, 286], [560, 232], [600, 276], [566, 338], [510, 362], [458, 350], [414, 376]] };
    const yard = [352, 326];
    ['A', 'B'].forEach((cr) => stops.filter((p) => p.crew === cr).forEach((p, i) => { const c = C[cr][i % C[cr].length]; pts[p.id] = [c[0] + (r() - 0.5) * 12, c[1] + (r() - 0.5) * 12]; }));
    const line = (cr) => { const L = stops.filter((p) => p.crew === cr); if (!L.length) return ''; return `<path class="rm-route rm-${cr}" d="M${yard[0]} ${yard[1]} ${L.map((p) => 'L' + pts[p.id][0].toFixed(1) + ' ' + pts[p.id][1].toFixed(1)).join(' ')}"/>`; };
    const pins = stops.map((p) => { const [x, y] = pts[p.id]; const n = stops.filter((q) => q.crew === p.crew).indexOf(p) + 1; const c = cust(p.cid); return `<g class="rm-pin rm-${p.crew} ${p.status === 'done' ? 'done' : ''}" data-tip="${esc('Crew ' + p.crew + ', stop ' + n + ': ' + (c.addr || '') + ' · ' + p.svc)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${p.status === 'done' ? '✓' : n}</text></g>`; }).join('');
    const truck = (cr) => { const L = stops.filter((p) => p.crew === cr); const nx = L.find((p) => p.status !== 'done'); if (!nx) return ''; const i = L.indexOf(nx); const a = i ? pts[L[i - 1].id] : yard; const b = pts[nx.id]; const x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2; return `<g class="rm-truck rm-${cr}"><rect x="${(x - 19).toFixed(1)}" y="${(y - 11).toFixed(1)}" width="38" height="22" rx="11"/><path d="M${(x - 10).toFixed(1)} ${(y + 3).toFixed(1)}v-7h9l4 4v3z" fill="#fff"/><text x="${(x + 9).toFixed(1)}" y="${(y + 4).toFixed(1)}">${cr}</text></g>`; };
    const map = `<svg class="rm" viewBox="0 0 680 440" role="img" aria-label="Today's crew routes">
      <rect class="rm-land" x="0" y="0" width="680" height="440" rx="14"/>
      <path class="rm-water" d="M0 0H680V60C610 82 560 47 500 72S380 41 330 66 220 30 160 55 50 36 0 63z"/><text class="rm-wl" x="440" y="34">LONG ISLAND SOUND</text>
      <path class="rm-water" d="M232 0c10 55 40 63 30 126-6 36 16 55 44 60 22 6 26-41 20-82L320 0z"/><text class="rm-wl" x="270" y="96" font-size="9">PORT JEFF HARBOR</text>
      <path class="rm-park" d="M40 327c40-28 92-11 112 25s-8 69-52 72-84-55-60-97z"/><path class="rm-park" d="M560 96c34-8 64 19 60 55s-40 47-66 30-26-77 6-85z"/><text class="rm-tl" x="48" y="350" font-size="9">WOODS</text>
      <path class="rm-road" d="M0 294C120 275 230 311 340 294S560 261 680 275"/><text class="rm-rl" x="24" y="282">ROUTE 25A</text>
      <path class="rm-road2" d="M150 440C170 344 190 220 160 82M420 440c-10-96 20-193 40-289M560 440c10-82-20-165-10-261"/>
      <path class="rm-road2" d="M0 193c90 14 180-28 270-8s170 55 240 28 120-14 170 0"/><text class="rm-tl" x="96" y="420">STONY BROOK</text><text class="rm-tl" x="300" y="420">SETAUKET</text><text class="rm-tl" x="520" y="420">PORT JEFFERSON</text>
      ${line('A')}${line('B')}<g class="rm-yard"><rect x="${yard[0] - 15}" y="${yard[1] - 15}" width="30" height="30" rx="8"/><path d="M${yard[0] - 7} ${yard[1] + 1}l7-7 7 7v7h-14z" fill="#fff"/></g><text class="rm-tl" x="${yard[0]}" y="${yard[1] + 30}" text-anchor="middle" font-size="9">THE YARD</text>${pins}${truck('A')}${truck('B')}</svg>`;
    const doneN = stops.filter((p) => p.status === 'done').length;
    const mapCard = ui.card({ cls: 'sc-map fade-in', title: "Today's routes", sub: `${stops.length} stops · ${doneN} done · optimized from the yard`, icon: 'pin', right: `<div class="legend"><span><i style="background:var(--brand)"></i>Crew A</span><span><i style="background:var(--accent)"></i>Crew B</span></div>`, body: map });
    const wx = `<div class="wx7">${WXD.map((w, k) => { const d = T.addDays(T.today0(), k); return `<div class="w ${w.pop >= 60 ? 'rain' : ''}"><span>${k === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}</span>${WXI[w.ic]}<b>${w.hi}°</b><em>${w.pop ? w.pop + '%' : '&nbsp;'}</em></div>`; }).join('')}</div>`;
    const wxCard = ui.card({ cls: 'sc-wx fade-in', title: '7-day forecast', sub: 'Rain days move routes and text clients automatically', icon: 'droplet', tone: 'blue', body: wx });
    // seasonal service mix (12 months stacked)
    const MIX = [['Mowing', [0, 0, 0, 0.6, 1, 1, 0.95, 0.9, 0.95, 0.9, 0.55, 0], 'var(--brand)'], ['Cleanups', [0, 0, 0.4, 1.1, 0.3, 0, 0, 0, 0.1, 0.7, 1.2, 0.6], 'var(--accent)'], ['Installs', [0, 0.1, 0.5, 1, 1.1, 1, 0.8, 0.8, 1, 0.9, 0.5, 0.15], '#5b7fbf'], ['Snow', [1.2, 1.1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.15, 0.9], '#9cc3e6']];
    const tot = Array.from({ length: 12 }, (_, m) => T.sum(MIX, (x) => x[1][m])); const mx = Math.max(...tot); const cm = new Date().getMonth();
    const mo = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const mix = `<div class="mx">${mo.map((l, m) => `<div class="mx-c ${m === cm ? 'cur' : ''}"><div class="mx-s" style="height:${(tot[m] / mx * 100).toFixed(0)}%">${MIX.map((x) => x[1][m] ? `<i style="flex:${x[1][m]};background:${x[2]}"></i>` : '').join('')}</div><span>${l}</span></div>`).join('')}</div><div class="mx-leg">${MIX.map((x) => `<span><i style="background:${x[2]}"></i>${x[0]}</span>`).join('')}</div>`;
    const mixCard = ui.card({ cls: 'sc-mix fade-in', title: 'Seasonal service mix', sub: 'Work booked by month, this year', icon: 'chart', body: mix });
    const featured = [['l-cleanup', 'Fall cleanup'], ['l-blower', 'Leaf removal'], ['l-yard', 'Final mow and mulch'], ['l-snow', 'Snow contract']];
    const props = featured.map(([p, svc], i) => { const st = svc === 'Snow contract' ? null : (stops.find((q) => q.svc === svc) || stops[i * 2] || null); const c = st ? cust(st.cid) : null; const lab = svc === 'Snow contract' ? 'Snow season' : svc; return `<a class="pp" href="#/routes">${img(p, lab)}<span class="pp-sh"></span><span class="pp-tag">${esc(lab)}</span><span class="pp-b"><b>${esc(c && c.addr ? c.addr : '40 contracts to sign')}</b><span>${esc(c && c.town ? c.town + (st ? ' · Crew ' + st.crew : '') : 'Pre-season offer ready to send')}</span></span></a>`; }).join('');
    const propCard = ui.card({ cls: 'sc-props fade-in', title: 'Properties today', sub: 'Before and after photos go to the client automatically', icon: 'camera', right: '<a class="btn btn-sm" href="#/routes">Routes</a>', body: `<div class="pp-grid">${props}</div>` });
    return `<div class="ht ht-landscaper"><div class="ht-b">${mapCard}</div><div class="ht-a">{{HERO}}</div></div><div class="ht-row ht-l2">${propCard}${wxCard}</div><div class="ht-row ht-l3">${mixCard}</div>`;
  }

  T.showcases = { restaurant, contractor, salon, gym, landscaper };
})();
