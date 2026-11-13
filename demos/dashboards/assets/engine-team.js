/* Three Village Local - Company Digital Dashboards demo engine: Team (every industry).
   Owner home "Your team" strip, a full Team page, and a rich employee profile panel.
   Owner sees everything; managers see a limited version (no pay); employees do not see it.
   All people are fictional, photos are AI-generated faces (assets/img/people). No protected-class fields. */
(function () {
  'use strict';
  const T = window.TVL; const { icon, esc, ui } = T; const S = T.S; const A = T.actions;
  let cfg = null;
  const PHOTO_DIR = 'assets/img/people/';

  // ---------- departments ----------
  const DEPTS = {
    restaurant: [['mgmt', 'Management', '#2f5d8a', /owner|general manager/i], ['kitchen', 'Kitchen', '#b4532a', /chef|cook|kitchen|dish/i], ['bar', 'Bar', '#6a4c93', /bar/i], ['foh', 'Front of house', '#1f8a70', /.*/]],
    contractor: [['mgmt', 'Management', '#2f5d8a', /owner|project manager/i], ['office', 'Office & sales', '#6a4c93', /office|estimat/i], ['field', 'Field crew', '#c47f12', /.*/]],
    salon: [['mgmt', 'Management', '#2f5d8a', /owner/i], ['desk', 'Front desk', '#6a4c93', /front desk/i], ['medspa', 'Med spa', '#1f8a70', /nurse|injector|esthetic/i], ['hair', 'Hair', '#b0577a', /.*/]],
    gym: [['mgmt', 'Management', '#2f5d8a', /owner|manager/i], ['desk', 'Front desk', '#6a4c93', /front desk/i], ['coach', 'Coaching', '#4f7a00', /.*/]],
    landscaper: [['mgmt', 'Management', '#2f5d8a', /owner/i], ['office', 'Office', '#6a4c93', /office/i], ['install', 'Install crew', '#b4532a', /install/i], ['maint', 'Maintenance crews', '#1f7a3a', /.*/]]
  };
  const depts = () => DEPTS[cfg.id] || [['mgmt', 'Management', '#2f5d8a', /owner|manager/i], ['team', 'Team', '#1f8a70', /.*/]];
  const deptOf = (m) => { const d = depts().find((x) => x[3].test(m.title)); return { k: d[0], l: d[1], c: d[2] }; };
  const STATUS = { on: ['On shift', 'var(--green)'], brk: ['On break', '#e0a106'], off: ['Off now', 'var(--text-3)'], pto: ['Time off', '#7a5af8'] };

  // ---------- photos (also used by T.avatar everywhere) ----------
  const photoOf = (m) => m && m.id && /^u\d+$/.test(m.id) ? PHOTO_DIR + cfg.id + '-' + m.id + '.webp' : null;
  T.photo = (name) => { if (!cfg || !S() || !name) return null; const m = S().team.find((x) => x.name === name); return m ? photoOf(m) : null; };
  const pic = (m, cls) => { const p = photoOf(m); return p ? `<img class="tm-pic ${cls || ''}" src="${p}" alt="${esc(m.name)}" width="96" height="96" loading="lazy" decoding="async">` : T.avatar(m.name, cls === 'xl' ? 'lg' : '', m.color); };

  // ---------- state + generated detail (deterministic per member) ----------
  const tx = () => { const s = S(); if (!s.teamx) s.teamx = { pto: {}, off: {}, notes: {}, extra: [] }; return s.teamx; };
  const staff = () => S().team.filter((m) => m.roleKey !== 'owner');
  const cache = {};
  const FIRSTS = ['Maria', 'Chris', 'Pat', 'Alex', 'Jamie', 'Robin', 'Casey', 'Morgan', 'Taylor', 'Jordan'];
  const LASTS = ['Bennett', 'Costa', 'Doyle', 'Field', 'Grant', 'Hayes', 'Lowe', 'Price', 'Quinn', 'Vance'];
  const H = (h, m) => h + (m || 0) / 60;
  function shiftHours() {
    // typical shift window by department [startHour, length]
    return { kitchen: [14, 8.5], bar: [16, 8], foh: [16, 7], mgmt: [10, 9], office: [8.5, 8.5], field: [7, 8.5], desk: [9, 8], hair: [10, 8], medspa: [10, 7], coach: [6, 7], install: [7, 9], maint: [7, 8.5], team: [9, 8] };
  }
  function detail(m) {
    if (cache[m.id]) return cache[m.id];
    const G = T.gen(cfg.id + '|team|' + m.id); const d = deptOf(m); const idx = staff().indexOf(m);
    const now = new Date(); const t0 = T.today0(); const dow = (now.getDay() + 6) % 7; const monday = T.addDays(t0, -dow);
    let [sh, len] = shiftHours()[d.k] || [9, 8];
    // evening crews for businesses open late (gym coaches, late stylists)
    if (idx % 2 === 1 && (d.k === 'coach' || d.k === 'desk' && cfg.id === 'gym')) sh = 15;
    if (idx % 2 === 1 && d.k === 'hair') sh = 12;
    // real schedule: status comes from today's shift vs the clock. Last person is on time off, one is off today.
    const n = staff().length; const pto = idx === n - 1; const offToday = idx === n - 2;
    const others = G.shuffle([0, 1, 2, 3, 4, 5, 6].filter((x) => x !== dow)).slice(0, idx === 1 ? 5 : G.int(3, 4));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = T.addDays(monday, i); let start = null, end = null;
      const works = i === dow ? !pto && !offToday : others.includes(i);
      if (works) { start = new Date(day); start.setHours(Math.floor(sh), Math.round((sh % 1) * 60), 0, 0); end = new Date(+start + (len + (i === dow ? 0 : G.pick([0, 0, .5, -.5]))) * 36e5); }
      days.push({ day, start, end });
    }
    const td = days[dow]; const st = pto ? 'pto' : td.start && td.start <= now && td.end > now ? (idx === 2 || idx === 5 ? 'brk' : 'on') : 'off';
    // clock log: past days + today
    const clock = days.filter((x) => x.start && x.start <= now).map((x) => { const inn = new Date(+x.start + G.int(-6, 4) * 6e4); const out = x.end < now ? new Date(+x.end + G.int(-4, 12) * 6e4) : null; return { in: inn, out }; });
    const worked = T.sum(clock, (c) => ((c.out || now) - c.in) / 36e5);
    const sched = T.sum(days.filter((x) => x.start), (x) => (x.end - x.start) / 36e5);
    const hire = T.addDays(t0, -G.int(120, 2400));
    const certSets = {
      restaurant: { kitchen: ['ServSafe Food Protection Manager', 'NYC/NYS Food Handler card'], bar: ['TIPS alcohol certification', 'ServSafe Alcohol'], foh: ['TIPS alcohol certification', 'Food Handler card'], mgmt: ['ServSafe Food Protection Manager', 'TIPS alcohol certification'] },
      contractor: { field: ['OSHA 30 construction', 'EPA Lead-Safe RRP', 'First aid / CPR'], office: ['OSHA 10', 'Notary public'], mgmt: ['OSHA 30 construction', 'EPA Lead-Safe RRP'] },
      salon: { hair: ['NYS Cosmetology license', 'Color specialist certificate'], medspa: ['NYS RN license', 'Neurotoxin and filler certification', 'BLS / CPR'], desk: ['CPR / first aid'], mgmt: ['NYS Cosmetology license'] },
      gym: { coach: ['NASM Certified Personal Trainer', 'CPR / AED'], desk: ['CPR / AED'], mgmt: ['CPR / AED', 'ACE Group Fitness'] },
      landscaper: { maint: ['NYS DEC pesticide technician', 'CPR / first aid'], install: ['ICPI paver installer', 'CDL class B'], office: ['QuickBooks certified user'], mgmt: ['NYS DEC pesticide applicator', 'CDL class B'] }
    };
    const cs = ((certSets[cfg.id] || {})[d.k] || ['CPR / first aid']);
    const certs = cs.map((c, k) => { const exp = idx === 0 && k === 0 ? T.addDays(t0, G.int(9, 24)) : idx === 3 && k === cs.length - 1 ? T.addDays(t0, -G.int(3, 20)) : T.addDays(t0, G.int(120, 900)); return { n: c, exp }; });
    const ptoBal = G.int(12, 72); const pending = (idx === 0 || idx === 3) && !tx().pto[m.id];
    const ptoReq = { from: T.addDays(t0, G.int(9, 30)), days: G.int(1, 4), why: G.pick(['Family event', 'Vacation', 'Personal day', 'Appointment']) };
    const ec = { name: G.pick(FIRSTS) + ' ' + G.pick(LASTS), phone: G.phone() };
    const email = m.name.toLowerCase().replace(/,.*$/, '').replace(/[^a-z ]/g, '').trim().split(' ')[0] + '@' + (S().settings.bizName || 'business').toLowerCase().replace(/[^a-z]/g, '').slice(0, 18) + '.com';
    const out = { G, d, st, days, clock, worked, sched, hire, certs, ptoBal, pending, ptoReq, ec, email, phone: m.phone || G.phone(), town: G.pick(T.TOWNS.slice(0, 12)) };
    cache[m.id] = out; return out;
  }
  const status = (m) => tx().off[m.id] ? 'off' : detail(m).st;
  const dot = (m) => { const s = STATUS[status(m)]; return `<i class="tm-dot" style="background:${s[1]}" title="${s[0]}"></i>`; };
  const fmtH = (h) => (Math.round(h * 10) / 10).toFixed(1).replace(/\.0$/, '') + ' h';
  const shiftTxt = (x) => x && x.start ? T.fmtTime(x.start.toISOString()) + ' to ' + T.fmtTime(x.end.toISOString()) : 'Off';
  const todayOf = (m) => detail(m).days[(new Date().getDay() + 6) % 7];
  const when = (m) => { const s = status(m); const x = todayOf(m); if (s === 'on' || s === 'brk') return 'until ' + T.fmtTime(x.end.toISOString()); if (s === 'pto') return 'Time off today'; if (tx().off[m.id]) return 'Access paused'; if (!x.start) return 'Off today'; return x.start > new Date() ? 'Starts ' + T.fmtTime(x.start.toISOString()) : 'Done at ' + T.fmtTime(x.end.toISOString()); };
  const payRate = (m) => m.rate || ({ mgmt: 34, kitchen: 22, bar: 20, foh: 16, office: 27, field: 30, desk: 19, hair: 26, medspa: 48, coach: 30, install: 31, maint: 23 }[deptOf(m).k] || 22);

  // ---------- performance per industry and role ----------
  function kpis(m) {
    const G = T.gen(cfg.id + '|kpi|' + m.id); const t = m.title; const up = () => G.chance(.72);
    const k = (l, v, dl, good) => ({ l, v, dl, good: good == null ? up() : good });
    const pct = (a, b) => G.int(a, b) + '%';
    const R = {
      restaurant: [[/server/i, () => [k('Covers served, this week', G.int(140, 230), '+' + G.int(4, 18) + '%'), k('Sales, this week', T.money(G.int(4200, 7900)), '+' + G.int(3, 14) + '%'), k('Average tip', (G.f(18.5, 22.5)).toFixed(1) + '%', '+0.' + G.int(2, 9) + ' pts'), k('Check average', T.money(G.int(58, 84)), '+' + T.money(G.int(1, 6)))]],
        [/host/i, () => [k('Guests seated, this week', G.int(380, 620), '+' + G.int(3, 12) + '%'), k('Average quoted wait', G.int(9, 16) + ' min', '-' + G.int(1, 4) + ' min'), k('Reservations confirmed', pct(94, 99), '+1 pt'), k('No-shows recovered', G.int(3, 9), 'from waitlist')]],
        [/chef|cook/i, () => [k('Tickets, this week', G.int(900, 1400), '+' + G.int(2, 9) + '%'), k('Average ticket time', (G.f(11, 15)).toFixed(1) + ' min', '-0.' + G.int(3, 9) + ' min'), k('Food cost', (G.f(27, 31)).toFixed(1) + '%', '-0.' + G.int(2, 8) + ' pts'), k('Dishes sent back', G.int(1, 4), 'of ' + G.int(900, 1200))]],
        [/bar/i, () => [k('Drinks sold, this week', G.int(700, 1100), '+' + G.int(4, 15) + '%'), k('Bar sales', T.money(G.int(8200, 12400)), '+' + G.int(3, 11) + '%'), k('Pour cost', (G.f(18, 22)).toFixed(1) + '%', '-0.' + G.int(2, 7) + ' pts'), k('Guest rating', (G.f(4.7, 4.95)).toFixed(2) + ' ★', '+0.0' + G.int(1, 6))]],
        [/manager/i, () => [k('Labor cost', (G.f(27, 31)).toFixed(1) + '%', '-0.' + G.int(2, 8) + ' pts'), k('Comps and voids', T.money(G.int(140, 320)), '-' + G.int(5, 18) + '%'), k('Guest rating', (G.f(4.7, 4.9)).toFixed(2) + ' ★', '+0.0' + G.int(1, 5)), k('Shifts covered', pct(97, 100), 'no gaps')]]],
      salon: [[/stylist|colorist/i, () => [k('Rebook rate', pct(68, 86), '+' + G.int(2, 7) + ' pts'), k('Retail sales, 30 days', T.money(G.int(620, 1480)), '+' + G.int(4, 22) + '%'), k('Average ticket', T.money(G.int(118, 186)), '+' + T.money(G.int(3, 12))), k('Services, 30 days', G.int(88, 132), '+' + G.int(2, 11) + '%')]],
        [/nurse|injector|esthetic/i, () => [k('Treatments, 30 days', G.int(64, 118), '+' + G.int(3, 15) + '%'), k('Rebook rate', pct(72, 90), '+' + G.int(2, 6) + ' pts'), k('Retail sales, 30 days', T.money(G.int(900, 2100)), '+' + G.int(4, 19) + '%'), k('Client rating', (G.f(4.8, 5)).toFixed(2) + ' ★', 'steady')]],
        [/front desk/i, () => [k('Bookings made, 30 days', G.int(210, 330), '+' + G.int(3, 12) + '%'), k('Confirmations sent', pct(96, 100), 'on time'), k('No-show rate', (G.f(2.1, 4.2)).toFixed(1) + '%', '-0.' + G.int(3, 9) + ' pts'), k('Waitlist fills', G.int(9, 24), 'gaps filled')]]],
      contractor: [[/carpenter|helper|lead/i, () => [k('Jobs completed, 90 days', G.int(9, 16), '+' + G.int(1, 4)), k('Callbacks', G.int(0, 2), 'of ' + G.int(9, 16) + ' jobs'), k('Hours on site, this week', G.int(32, 44), 'scheduled ' + G.int(36, 40)), k('Photo logs', G.int(80, 240), 'uploaded to CompanyCam')]],
        [/project manager/i, () => [k('Active projects', G.int(5, 9), '+' + G.int(1, 2)), k('On-time milestones', pct(86, 96), '+' + G.int(2, 6) + ' pts'), k('Change orders signed', G.int(4, 11), '30 days'), k('Client rating', (G.f(4.8, 5)).toFixed(2) + ' ★', 'steady')]],
        [/estimat/i, () => [k('Estimates sent, 30 days', G.int(14, 26), '+' + G.int(2, 6)), k('Win rate', pct(34, 48), '+' + G.int(2, 7) + ' pts'), k('Average estimate', T.money(G.int(18000, 46000)), '+' + G.int(3, 12) + '%'), k('Days to send', (G.f(1.4, 2.8)).toFixed(1), '-0.' + G.int(2, 8))]],
        [/office/i, () => [k('Invoices sent, 30 days', G.int(28, 46), '+' + G.int(2, 9)), k('Days to collect', G.int(9, 17), '-' + G.int(1, 4) + ' days'), k('Permits filed', G.int(3, 8), '30 days'), k('Calls answered', pct(94, 99), '+1 pt')]]],
      gym: [[/coach/i, () => [k('Classes taught, 30 days', G.int(22, 38), '+' + G.int(1, 5)), k('Average attendance', G.int(11, 19) + ' / 20', '+' + G.int(1, 3)), k('PT sessions, 30 days', G.int(18, 44), '+' + G.int(2, 9)), k('Member rating', (G.f(4.7, 4.98)).toFixed(2) + ' ★', 'steady')]],
        [/front desk/i, () => [k('Check-ins handled, 30 days', G.int(2100, 3400), '+' + G.int(2, 9) + '%'), k('Trials booked', G.int(14, 31), '+' + G.int(2, 8)), k('Trial to member', pct(38, 56), '+' + G.int(2, 7) + ' pts'), k('Failed payments fixed', G.int(6, 15), '30 days')]],
        [/manager/i, () => [k('Member retention', pct(91, 96), '+' + G.int(1, 3) + ' pts'), k('Class fill rate', pct(72, 88), '+' + G.int(2, 6) + ' pts'), k('New members, 30 days', G.int(28, 52), '+' + G.int(3, 14) + '%'), k('Staff shifts covered', pct(97, 100), 'no gaps')]]],
      landscaper: [[/crew member/i, () => [k('Stops completed, 30 days', G.int(140, 230), '+' + G.int(3, 12) + '%'), k('On-time stops', pct(91, 98), '+' + G.int(1, 4) + ' pts'), k('Callbacks', G.int(0, 3), 'of ' + G.int(140, 220)), k('Hours, this week', G.int(34, 46), 'scheduled 42')]],
        [/crew leader/i, () => [k('Route completion', pct(94, 99), '+' + G.int(1, 3) + ' pts'), k('Stops per day', (G.f(14, 19)).toFixed(1), '+' + G.f(.3, 1.2).toFixed(1)), k('Upsells logged', G.int(6, 19), '30 days'), k('Client rating', (G.f(4.8, 5)).toFixed(2) + ' ★', 'steady')]],
        [/install/i, () => [k('Installs completed, 90 days', G.int(8, 15), '+' + G.int(1, 4)), k('Under budget', pct(70, 90), 'of jobs'), k('Change orders', G.int(2, 7), 'signed'), k('Client rating', (G.f(4.8, 5)).toFixed(2) + ' ★', 'steady')]],
        [/office/i, () => [k('Invoices sent, 30 days', G.int(120, 210), '+' + G.int(3, 12) + '%'), k('Renewals signed', G.int(18, 41), 'this season'), k('Days to collect', G.int(8, 15), '-' + G.int(1, 3) + ' days'), k('Calls answered', pct(94, 99), '+1 pt')]]]
    };
    const list = R[cfg.id] || [];
    const hit = list.find((x) => x[0].test(t));
    return hit ? hit[1]() : [k('Tasks completed, 30 days', G.int(30, 60), '+' + G.int(2, 9)), k('On-time rate', pct(90, 99), '+1 pt'), k('Customer rating', (G.f(4.7, 5)).toFixed(2) + ' ★', 'steady'), k('Hours, this week', G.int(30, 40), 'scheduled')];
  }
  function reviews(m) {
    const G = T.gen(cfg.id + '|rev|' + m.id); const f = m.name.split(' ')[0];
    const P = {
      restaurant: [`${f} took such good care of our table. Knew the wine list inside out.`, `Shout out to ${f}! Made our anniversary dinner feel really special.`, `Everything was perfect and ${f} checked on us at just the right times.`],
      contractor: [`${f} and the crew left the house spotless every single day.`, `${f} explained every step and kept us updated with photos. Highly recommend.`, `Our kitchen came out amazing. ${f} sweated every detail.`],
      salon: [`${f} is a magician with color. Exactly what I asked for.`, `Best appointment I've had in years. ${f} really listens.`, `${f} made me feel so comfortable. Already booked my next visit.`],
      gym: [`${f}'s classes are the reason I actually show up.`, `${f} fixed my form in one session. Great coach.`, `Friendly, motivating and always on time. Thanks ${f}!`],
      landscaper: [`${f} and the crew are always on time and the lawn looks great.`, `${f} noticed a sprinkler leak and fixed it right away.`, `Polite, careful around the gardens. ${f} is the best.`]
    }[cfg.id] || [`${f} was great to work with.`];
    return P.slice(0, 2 + (G.chance(.5) ? 1 : 0)).map((t, i) => ({ t, stars: i === 2 && G.chance(.5) ? 4 : 5, src: G.pick(['Google', 'Google', 'Yelp', 'Facebook']), who: G.pick(FIRSTS) + ' ' + G.pick(LASTS)[0] + '.', ago: G.int(2, 40) }));
  }
  function training(m) {
    const G = T.gen(cfg.id + '|tr|' + m.id); const d = deptOf(m).k;
    const base = { restaurant: ['Menu and allergen training', 'POS and table management', 'Wine and cocktail basics', 'Opening and closing checklist', 'Guest recovery playbook', 'Food safety refresher'], contractor: ['Site safety orientation', 'Fall protection', 'CompanyCam photo standards', 'Dust control and cleanup', 'Client communication', 'Tool and truck checklist'], salon: ['Booking system and rebooking', 'Consultation script', 'Retail product knowledge', 'Sanitation standards', 'Before and after photos', 'Membership sales'], gym: ['Opening and closing', 'Emergency action plan', 'Check-in and trial process', 'Class programming standards', 'Member retention calls', 'Equipment cleaning'], landscaper: ['Equipment safety', 'Route app and stop photos', 'Pesticide handling', 'Customer property care', 'Truck and trailer checklist', 'Upsell spotting'] }[cfg.id] || ['Orientation', 'Safety', 'Customer service', 'Systems'];
    const done = d === 'mgmt' ? base.length : G.int(3, base.length);
    return base.map((x, i) => ({ x, done: i < done }));
  }
  function usage(m) {
    const G = T.gen(cfg.id + '|use|' + m.id); const mgr = m.roleKey === 'manager';
    const screens = (mgr ? ['Command Center', 'Calendar', cfg.crm.label, 'Tasks & team', 'Social studio', 'Reviews'] : ['Calendar', 'Tasks & team', cfg.crm.label, 'Command Center']).map((l) => ({ label: l, value: G.int(6, mgr ? 60 : 34) })).sort((a, b) => b.value - a.value).slice(0, 4);
    const acts = {
      restaurant: mgr ? [['shifts scheduled', 9, 22], ['reservations updated', 14, 40], ['posts approved', 2, 6], ['reviews answered', 3, 9]] : [['tables marked seated', 30, 70], ['tasks completed', 4, 12], ['guest notes added', 3, 10]],
      contractor: mgr ? [['job updates posted', 8, 20], ['estimates sent', 2, 7], ['change orders logged', 1, 4], ['crew shifts scheduled', 5, 12]] : [['job photos uploaded', 25, 70], ['tasks completed', 5, 14], ['daily logs filed', 3, 5]],
      salon: mgr ? [['appointments booked', 40, 90], ['waitlist gaps filled', 3, 9], ['review requests sent', 6, 18], ['posts approved', 2, 5]] : [['appointments logged', 10, 22], ['formulas updated', 4, 12], ['review requests sent', 2, 6], ['before and after photos added', 3, 9]],
      gym: mgr ? [['classes scheduled', 8, 20], ['members messaged', 10, 30], ['trials followed up', 5, 14], ['posts approved', 2, 5]] : [['class rosters checked', 8, 18], ['PT sessions logged', 4, 12], ['member notes added', 3, 9]],
      landscaper: mgr ? [['routes adjusted', 3, 9], ['stops marked complete', 40, 90], ['upsells logged', 3, 10], ['crew shifts scheduled', 4, 10]] : [['stops marked complete', 30, 70], ['property photos uploaded', 20, 60], ['tasks completed', 3, 9]]
    }[cfg.id] || [['tasks completed', 4, 12]];
    const days = []; for (let i = 13; i >= 0; i--) { const dd = T.addDays(T.today0(), -i); const wk = dd.getDay(); days.push({ l: T.dow[wk][0], v: wk === 0 && !mgr ? 0 : G.int(mgr ? 6 : 2, mgr ? 22 : 12) }); }
    const ph = G.int(mgr ? 35 : 62, mgr ? 55 : 88); const tb = G.int(0, mgr ? 15 : 10);
    return { last: new Date(Date.now() - G.int(4, mgr ? 90 : 300) * 6e4).toISOString(), logins: G.int(mgr ? 9 : 4, mgr ? 18 : 11), devices: [{ label: 'Phone', value: ph }, { label: 'Desktop', value: Math.max(0, 100 - ph - tb) }, { label: 'Tablet', value: tb }].filter((x) => x.value > 0), screens, acts: acts.map((a) => ({ n: G.int(a[1], a[2]), t: a[0] })), days };
  }

  // ---------- home strip (owner) ----------
  const legend = () => `<div class="tm-legend">${depts().filter((d) => staff().some((m) => deptOf(m).k === d[0])).map((d) => `<span><i style="background:${d[2]}"></i>${esc(d[1])}</span>`).join('')}<span class="tm-sep"></span>${Object.keys(STATUS).map((k) => `<span><i class="tm-sd" style="background:${STATUS[k][1]}"></i>${STATUS[k][0]}</span>`).join('')}</div>`;
  const chip = (m) => { const d = deptOf(m); const x = todayOf(m); const s = status(m); return `<button type="button" class="tm-chip" data-act="tmOpen" data-id="${m.id}" style="--dc:${d.c}"><span class="tm-ph">${pic(m)}${dot(m)}</span><b>${esc(m.name.split(',')[0].split(' ')[0])}</b><span class="tm-pos">${esc(m.title)}</span><span class="tm-when">${esc(when(m))}</span></button>`; };
  T.teamStrip = () => {
    if (!T.isOwner()) return '';
    const L = staff(); const on = L.filter((m) => /on|brk/.test(status(m))).length;
    return ui.card({ cls: 'tm-home fade-in', title: 'Your team', sub: `${on} of ${L.length} working right now`, icon: 'users', tone: 'blue', right: '<a class="btn btn-sm" href="#/team">Open team</a>', body: `<div class="tm-strip">${L.map(chip).join('')}</div>${legend()}` });
  };

  // ---------- team page ----------
  function page() {
    const L = staff(); const f = S().ui.tmDept || 'all'; const own = T.isOwner();
    const cnt = (k) => L.filter((m) => status(m) === k).length;
    const certAlerts = []; L.forEach((m) => detail(m).certs.forEach((c) => { const dd = T.dayDiff(c.exp.toISOString()); if (dd < 45) certAlerts.push({ m, c, dd }); }));
    const pend = L.filter((m) => detail(m).pending && !tx().pto[m.id]);
    const hours = T.sum(L, (m) => detail(m).worked); const ot = L.filter((m) => detail(m).sched > 40);
    const list = L.filter((m) => f === 'all' || deptOf(m).k === f);
    const dlist = depts().filter((d) => L.some((m) => deptOf(m).k === d[0]));
    const k = [
      { label: 'On shift now', icon: 'activity', value: cnt('on') + cnt('brk'), delta: `<span class="faint">${cnt('brk')} on break</span>` },
      { label: 'Time off today', icon: 'calendar', value: cnt('pto'), delta: `<span class="faint">${pend.length} request${pend.length === 1 ? '' : 's'} waiting</span>` },
      { label: 'Hours this week', icon: 'clock', value: fmtH(hours), delta: ot.length ? `<span class="down">${ot.length} near overtime</span>` : '<span class="faint">no overtime</span>' },
      { label: 'Certifications', icon: 'shield', value: certAlerts.length ? certAlerts.length + ' alerts' : 'All current', delta: certAlerts.length ? '<span class="down">expiring or expired</span>' : '<span class="up">nothing due</span>' }
    ];
    const week = (() => { const t0 = T.today0(); const dow = (new Date().getDay() + 6) % 7; const mon = T.addDays(t0, -dow); const ds = [0, 1, 2, 3, 4, 5, 6].map((i) => T.addDays(mon, i));
      return `<div class="tm-week-wrap"><table class="tm-week"><thead><tr><th></th>${ds.map((d, i) => `<th class="${i === dow ? 'today' : ''}">${T.dow[d.getDay()]}<span>${d.getDate()}</span></th>`).join('')}</tr></thead><tbody>${list.map((m) => `<tr><th><button type="button" class="tm-wname" data-act="tmOpen" data-id="${m.id}">${pic(m, 'sm')}<span>${esc(m.name.split(',')[0])}</span></button></th>${detail(m).days.map((x, i) => `<td class="${i === dow ? 'today' : ''}">${x.start ? `<span class="tm-shift" style="--dc:${deptOf(m).c}">${esc(T.fmtTime(x.start.toISOString()).replace(':00', '').replace(' ', '').toLowerCase())}<i>to</i>${esc(T.fmtTime(x.end.toISOString()).replace(':00', '').replace(' ', '').toLowerCase())}</span>` : i === dow && status(m) === 'pto' ? '<span class="tm-pto">Time off</span>' : '<span class="faint">·</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; })();
    return ui.pageHead({ title: 'Team', sub: 'Everyone on your team, where they are right now, and how they are doing.', eyebrow: '<span class="sample">Sample people</span>', actions: `<button class="btn" data-act="tmShiftAny">${icon('calendar', 'sm')}Schedule a shift</button><button class="btn btn-primary" data-act="tmInvite">${icon('plus', 'sm')}Add team member</button>` })
      + `<div class="kpis">${k.map(ui.kpi).join('')}</div>`
      + (certAlerts.length || pend.length ? `<div class="tm-alerts fade-in">${certAlerts.map((a) => `<button type="button" class="tm-alert ${a.dd < 0 ? 'bad' : ''}" data-act="tmOpen" data-id="${a.m.id}" data-tab="hr">${icon('shield', 'sm')}<span><b>${esc(a.m.name.split(',')[0])}</b>: ${esc(a.c.n)} ${a.dd < 0 ? 'expired ' + Math.abs(a.dd) + ' days ago' : 'expires in ' + a.dd + ' days'}</span>${icon('chevR', 'sm')}</button>`).join('')}${pend.map((m) => `<button type="button" class="tm-alert pto" data-act="tmOpen" data-id="${m.id}" data-tab="time">${icon('calendar', 'sm')}<span><b>${esc(m.name.split(',')[0])}</b> asked for ${detail(m).ptoReq.days} day${detail(m).ptoReq.days > 1 ? 's' : ''} off from ${T.fmtDate(detail(m).ptoReq.from.toISOString())}</span>${icon('chevR', 'sm')}</button>`).join('')}</div>` : '')
      + `<div class="filterbar">${ui.chips([{ v: 'all', l: 'Everyone', n: L.length }].concat(dlist.map((d) => ({ v: d[0], l: d[1], n: L.filter((m) => deptOf(m).k === d[0]).length }))), f, 'tmDept')}</div>${legend()}`
      + `<div class="tm-grid">${list.map((m) => card(m, own)).join('')}</div>`
      + ui.card({ title: 'This week', sub: 'Shifts by person', icon: 'calendar', cls: 'mt', flush: true, body: week })
      + `<p class="faint tiny" style="margin-top:14px">Sample people. Photos are AI-generated faces of people who do not exist.</p>`;
  }
  function card(m, own) {
    const d = deptOf(m); const x = todayOf(m); const s = status(m); const kp = kpis(m)[0]; const dt = detail(m);
    return `<button type="button" class="tm-card fade-in" data-act="tmOpen" data-id="${m.id}" style="--dc:${d.c}"><span class="tm-band"></span>
      <span class="tm-ph lg">${pic(m)}${dot(m)}</span><b class="tm-n">${esc(m.name)}</b><span class="tm-t">${esc(m.title)}</span><span class="tm-dept">${esc(d.l)}</span>
      <span class="tm-st"><i style="background:${STATUS[s][1]}"></i>${STATUS[s][0]} · ${esc(when(m))}</span>
      <span class="tm-mini"><span><em>This week</em><b>${fmtH(dt.worked)}</b></span><span><em>${esc(kp.l.replace(/, .*$/, ''))}</em><b>${esc(String(kp.v))}</b></span></span>${tx().off[m.id] ? '<span class="badge b-red tm-paused">Access paused</span>' : ''}</button>`;
  }

  // ---------- profile panel ----------
  let cur = null, tab = 'over';
  const TABS = () => [['over', 'Overview'], ['time', 'Schedule & time'], ['perf', 'Performance'], ['use', 'Dashboard use'], ['hr', T.isOwner() ? 'HR & pay' : 'HR']];
  function head(m) {
    const d = deptOf(m); const s = status(m); const x = todayOf(m);
    return `<div class="tm-ph-h" style="--dc:${d.c}"><span class="tm-ph xl">${pic(m, 'xl')}${dot(m)}</span><div class="tm-hd"><h2>${esc(m.name)}</h2><div class="tm-t">${esc(m.title)} · <span style="color:${d.c};font-weight:650">${esc(d.l)}</span></div>
      <div class="tm-st"><i style="background:${STATUS[s][1]}"></i>${STATUS[s][0]}${x.start ? ' · today ' + shiftTxt(x) : ''}${tx().off[m.id] ? ' · <span class="down">dashboard access paused</span>' : ''}</div></div></div>
      <div class="tm-actions"><button class="btn btn-sm" data-act="tmMsg" data-id="${m.id}">${icon('msg', 'sm')}Message</button><button class="btn btn-sm" data-act="tmEdit" data-id="${m.id}">${icon('edit', 'sm')}Edit</button><button class="btn btn-sm" data-act="tmShift" data-id="${m.id}">${icon('calendar', 'sm')}Schedule shift</button><button class="btn btn-sm" data-act="tmTask" data-id="${m.id}">${icon('tasks', 'sm')}Add task</button>${T.isOwner() ? `<button class="btn btn-sm ${tx().off[m.id] ? '' : 'btn-danger'}" data-act="tmAccess" data-id="${m.id}">${icon('lock', 'sm')}${tx().off[m.id] ? 'Restore access' : 'Deactivate access'}</button>` : ''}</div>
      <div class="tm-tabs" role="tablist">${TABS().map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === tab}" class="${k === tab ? 'on' : ''}" data-act="tmTab" data-v="${k}">${esc(l)}</button>`).join('')}</div>`;
  }
  const sec = (title, body, ic) => `<section class="tm-sec"><h3>${ic ? icon(ic, 'sm') : ''}${esc(title)}</h3>${body}</section>`;
  const kv = (rows) => `<dl class="tm-kv">${rows.map((r) => `<div><dt>${esc(r[0])}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`;
  function certList(dt) { return `<ul class="tm-certs">${dt.certs.map((c) => { const dd = T.dayDiff(c.exp.toISOString()); const tone = dd < 0 ? 'red' : dd < 45 ? 'amber' : 'green'; return `<li>${icon('shield', 'sm')}<span class="grow">${esc(c.n)}</span>${ui.badge(dd < 0 ? 'Expired ' + T.fmtDate(c.exp.toISOString()) : dd < 45 ? 'Expires in ' + dd + ' days' : 'Valid to ' + T.fmtDate(c.exp.toISOString(), { month: 'short', year: 'numeric' }), tone)}</li>`; }).join('')}</ul>`; }
  function body(m) {
    const dt = detail(m); const own = T.isOwner(); const f = m.name.split(' ')[0];
    if (tab === 'over') {
      const tasks = S().tasks.filter((t) => t.who === m.id); const open = tasks.filter((t) => !t.done);
      const tr = training(m); const trd = tr.filter((x) => x.done).length;
      const notes = (tx().notes[m.id] || []).concat([{ t: `${f} is great with regulars. Ask about cross-training next quarter.`, by: T.cfg.roles[0].person, at: T.at(-12, 10) }]);
      return `<div class="tm-quick"><div><b>${fmtH(dt.worked)}</b><span>worked this week</span></div><div><b>${dt.ptoBal} h</b><span>time off left</span></div><div><b>${esc(String(kpis(m)[0].v))}</b><span>${esc(kpis(m)[0].l.toLowerCase())}</span></div><div><b>${T.timeAgo(usage(m).last)}</b><span>last login</span></div></div>`
        + sec('Contact', kv([['Phone', `<a href="tel:${esc(dt.phone)}">${esc(dt.phone)}</a>`], ['Email', `<a href="mailto:${esc(dt.email)}">${esc(dt.email)}</a>`], ['Lives in', esc(dt.town)], ['Emergency contact', `${esc(dt.ec.name)} · ${esc(dt.ec.phone)}`]]), 'user')
        + sec('Role', kv([['Position', esc(m.title)], ['Department', esc(deptOf(m).l)], ['Hired', T.fmtDate(dt.hire.toISOString(), { month: 'short', day: 'numeric', year: 'numeric' }) + ` <span class="faint">(${Math.max(1, Math.round(T.daysSince(dt.hire.toISOString()) / 30))} months)</span>`], ['Dashboard login', `${esc(T.cfg.roles.find((r) => r.key === m.roleKey) ? T.cfg.roles.find((r) => r.key === m.roleKey).label : m.roleKey)} view`]]), 'tag')
        + sec('Certifications and licenses', certList(dt), 'shield')
        + sec(`Tasks · ${tasks.length - open.length} done, ${open.length} open`, open.length ? `<div class="list">${open.slice(0, 4).map(T.taskRow).join('')}</div>` : ui.empty('No open tasks'), 'tasks')
        + sec(`Training · ${trd} of ${tr.length}`, `${ui.progress(trd / tr.length, 'green')}<ul class="tm-check">${tr.map((x) => `<li class="${x.done ? 'done' : ''}">${icon('check', 'sm')}${esc(x.x)}</li>`).join('')}</ul>`, 'trophy')
        + sec('Notes', `${notes.map((n) => `<div class="tm-note"><p>${esc(n.t)}</p><span class="tiny faint">${esc(n.by)} · ${T.timeAgo(n.at)}</span></div>`).join('')}<div class="tm-addnote"><input class="input" id="tmNote" placeholder="Add a private note about ${esc(f)}" aria-label="Add a note"><button class="btn btn-sm" data-act="tmNote" data-id="${m.id}">Add</button></div>`, 'note');
    }
    if (tab === 'time') {
      const dow = (new Date().getDay() + 6) % 7; const up = []; for (let i = 0; i < 10; i++) { const day = T.addDays(T.today0(), i); const x = dt.days[(day.getDay() + 6) % 7]; if (i < 7 - dow && x.start && (i > 0 || x.end > new Date())) up.push({ day, x }); }
      tx().extra.filter((e) => e.who === m.id).forEach((e) => up.push({ day: new Date(e.start), x: { start: new Date(e.start), end: new Date(e.end) } }));
      const ot = dt.sched > 40; const pr = tx().pto[m.id];
      return sec('This week', `<div class="tm-cal">${dt.days.map((x, i) => `<div class="${i === dow ? 'today' : ''}"><span class="d">${T.dow[x.day.getDay()]}<b>${x.day.getDate()}</b></span>${x.start ? `<span class="tm-shift" style="--dc:${deptOf(m).c}">${esc(T.fmtTime(x.start.toISOString()))}<i>to</i>${esc(T.fmtTime(x.end.toISOString()))}</span>` : i === dow && status(m) === 'pto' ? '<span class="tm-pto">Time off</span>' : '<span class="faint small">Off</span>'}</div>`).join('')}</div>`, 'calendar')
        + sec('Upcoming shifts', up.length ? `<ul class="tm-list">${up.slice(0, 5).map((u) => `<li><b>${T.relDay(u.day.toISOString())}</b><span>${shiftTxt(u.x)}</span></li>`).join('')}</ul>` : ui.empty('No more shifts this week', 'calendar'), 'clock')
        + sec('Time clock', `<div class="tm-quick sm"><div><b>${fmtH(dt.worked)}</b><span>clocked this week</span></div><div><b>${fmtH(dt.sched)}</b><span>scheduled</span></div><div><b class="${ot ? 'down' : 'up'}">${ot ? 'Overtime' : 'No overtime'}</b><span>${ot ? fmtH(dt.sched - 40) + ' over 40 h' : 'under 40 h'}</span></div></div>
          <table class="t tm-clock"><thead><tr><th>Day</th><th>In</th><th>Out</th><th class="r">Hours</th></tr></thead><tbody>${dt.clock.slice().reverse().map((c) => `<tr><td>${T.relDay(c.in.toISOString())}</td><td>${T.fmtTime(c.in.toISOString())}</td><td>${c.out ? T.fmtTime(c.out.toISOString()) : '<span class="up">On the clock</span>'}</td><td class="r num">${fmtH(((c.out || new Date()) - c.in) / 36e5)}</td></tr>`).join('') || '<tr><td colspan="4" class="faint">No punches yet this week</td></tr>'}</tbody></table>`, 'clock')
        + sec('Time off', `<div class="tm-quick sm"><div><b>${dt.ptoBal} h</b><span>balance</span></div><div><b>${T.gen(m.id + 'pt').int(8, 40)} h</b><span>used this year</span></div></div>${dt.pending || pr ? `<div class="tm-pto-req ${pr || 'wait'}"><div><b>${esc(dt.ptoReq.why)}</b><span>${dt.ptoReq.days} day${dt.ptoReq.days > 1 ? 's' : ''} from ${T.fmtDate(dt.ptoReq.from.toISOString(), { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>${pr ? ui.badge(pr === 'ok' ? 'Approved' : 'Denied', pr === 'ok' ? 'green' : 'red') : `<span class="row" style="gap:6px"><button class="btn btn-sm" data-act="tmPto" data-id="${m.id}" data-v="no">Deny</button><button class="btn btn-sm btn-primary" data-act="tmPto" data-id="${m.id}" data-v="ok">Approve</button></span>`}</div>` : '<p class="small muted">No requests waiting.</p>'}`, 'calendar');
    }
    if (tab === 'perf') {
      const K = kpis(m); const R = reviews(m); const tasks = S().tasks.filter((t) => t.who === m.id);
      return sec('Performance', `<div class="tm-kpis">${K.map((k) => `<div><span>${esc(k.l)}</span><b>${esc(String(k.v))}</b><em class="${k.good ? 'up' : 'faint'}">${esc(k.dl)}</em></div>`).join('')}</div>`, 'trend')
        + sec(`Reviews that mention ${f}`, R.map((r) => `<div class="tm-rev"><div class="row" style="gap:8px">${ui.stars(r.stars)}<b class="small">${esc(r.who)}</b><span class="tiny faint">on ${esc(r.src)} · ${r.ago} days ago</span></div><p>${esc(r.t).replace(new RegExp(f, 'g'), '<mark>' + esc(f) + '</mark>')}</p></div>`).join(''), 'star')
        + sec('Tasks', `<div class="tm-quick sm"><div><b>${tasks.length}</b><span>assigned</span></div><div><b>${tasks.filter((t) => t.done).length + T.gen(m.id + 'td').int(14, 40)}</b><span>completed, 30 days</span></div><div><b>${tasks.filter((t) => !t.done && T.dayDiff(t.due) < 0).length}</b><span>overdue</span></div></div>`, 'tasks');
    }
    if (tab === 'use') {
      const u = usage(m);
      return `<div class="tm-quick"><div><b>${T.timeAgo(u.last)}</b><span>last login</span></div><div><b>${u.logins}</b><span>logins this week</span></div><div><b>${esc(u.devices[0].label)}</b><span>main device</span></div><div><b>${T.sum(u.acts, (a) => a.n)}</b><span>actions this week</span></div></div>`
        + sec('Activity, last 14 days', ui.bars({ labels: u.days.map((d) => d.l), series: [{ name: 'Actions', values: u.days.map((d) => d.v), color: deptOf(m).c }], h: 150, maxBar: 18, tipLabels: u.days.map((d, i) => T.fmtDate(T.addDays(T.today0(), i - 13).toISOString(), { weekday: 'short', month: 'short', day: 'numeric' })) }), 'chart')
        + sec('What they did this week', `<ul class="tm-list">${u.acts.map((a) => `<li><b class="num">${a.n}</b><span>${esc(a.t)}</span></li>`).join('')}</ul>`, 'zap')
        + `<div class="tm-2">${sec('Most-used screens', ui.hbars(u.screens, (v) => v + ' visits', deptOf(m).c), 'grid')}${sec('Devices', ui.hbars(u.devices, (v) => v + '%', 'var(--chart-2)'), 'smartphone')}</div>`;
    }
    // hr
    const docs = [['W-4 tax withholding', 'Signed', 'green'], ['I-9 employment eligibility', 'Verified', 'green'], ['Employee handbook', 'Signed', 'green'], ['Direct deposit form', 'On file', 'green'], ['Certification copies', dt.certs.some((c) => T.dayDiff(c.exp.toISOString()) < 0) ? 'Needs update' : 'On file', dt.certs.some((c) => T.dayDiff(c.exp.toISOString()) < 0) ? 'amber' : 'green']];
    const rate = payRate(m); const gross = rate * dt.worked; const G = T.gen(m.id + 'pay');
    return sec('Documents', `<ul class="tm-docs">${docs.map((d) => `<li>${icon('file', 'sm')}<span class="grow">${esc(d[0])}</span>${ui.badge(d[1], d[2])}</li>`).join('')}</ul><p class="tiny faint">Demo documents. Real files stay in your secure document vault.</p>`, 'file')
      + sec('Certifications and licenses', certList(dt), 'shield')
      + (own ? sec('Pay and payroll', kv([['Pay rate', `${T.money2(rate)} / hour`], ['This pay period', `${fmtH(dt.worked)} · ${T.money(gross)} gross so far`], ['Year to date', T.money(rate * G.int(1100, 1700))], ['Next payday', T.fmtDate(T.addDays(T.today0(), (12 - new Date().getDay()) % 7 || 7).toISOString(), { weekday: 'long', month: 'short', day: 'numeric' })], ['Paid through', 'Gusto (connected)']]), 'dollar')
        : `<div class="infobox">${icon('lock', 'sm')} Pay rates and payroll are visible to the owner only.</div>`);
  }
  function openP(id, t) {
    const m = T.byId(S().team, id); if (!m) return; cur = id; tab = t || 'over';
    T.drawer({ title: m.name, cls: 'tm-drawer', head: `<h2>Team member</h2>`, body: `<div id="tmP">${head(m)}<div class="tm-body" id="tmBody">${body(m)}</div></div>`, onClose: () => { cur = null; } });
  }
  const repaint = () => { const m = T.byId(S().team, cur); const el = document.getElementById('tmP'); if (m && el) { el.innerHTML = `${head(m)}<div class="tm-body" id="tmBody">${body(m)}</div>`; T.animateCounts(el); } };

  // ---------- actions ----------
  A.tmOpen = (el) => openP(el.dataset.id, el.dataset.tab);
  A.tmTab = (el) => { tab = el.dataset.v; repaint(); const b = T.drawerEl() && T.drawerEl().querySelector('.drawer-b'); if (b) b.scrollTop = 0; };
  A.tmDept = (el) => { S().ui.tmDept = el.dataset.v; T.save(); T.render(true); };
  A.tmMsg = (el) => { const m = T.byId(S().team, el.dataset.id); T.form({ title: 'Message ' + m.name.split(' ')[0], icon: 'msg', submitLabel: 'Send (demo)', fields: [{ name: 'how', label: 'Send by', type: 'select', options: ['Text message', 'Team chat', 'Email'] }, { name: 'msg', label: 'Message', type: 'textarea', full: true, required: true, value: `Hi ${m.name.split(' ')[0]}, ` }], onSubmit: (d) => T.toast(`${d.how} sent to ${m.name.split(' ')[0]} (demo)`, { icon: 'send' }) }); };
  A.tmEdit = (el) => { const m = T.byId(S().team, el.dataset.id); const dt = detail(m); T.form({ title: 'Edit ' + m.name.split(' ')[0], icon: 'edit', submitLabel: 'Save changes', fields: [{ name: 'name', label: 'Name', value: m.name, required: true }, { name: 'title', label: 'Position', value: m.title, required: true }, { name: 'phone', label: 'Phone', value: dt.phone }, { name: 'email', label: 'Email', value: dt.email }], onSubmit: (d) => { Object.assign(m, { name: d.name, title: d.title }); dt.phone = d.phone; dt.email = d.email; delete cache[m.id]; Object.assign(detail(m), { phone: d.phone, email: d.email }); T.save(); T.toast('Saved'); repaint(); if (T.route().key === 'team') T.render(true); } }); };
  A.tmShift = (el) => { const m = T.byId(S().team, el.dataset.id); T.form({ title: 'Schedule ' + m.name.split(' ')[0], icon: 'calendar', submitLabel: 'Add shift', fields: [{ name: 'date', label: 'Date', type: 'date', value: T.isoDate(T.addDays(new Date(), 1)) }, { name: 'start', label: 'Start', type: 'time', value: '09:00' }, { name: 'end', label: 'End', type: 'time', value: '17:00' }, { name: 'note', label: 'Note', full: true, ph: 'Optional' }], onSubmit: (d) => { tx().extra.push({ who: m.id, start: T.fromDT(d.date, d.start), end: T.fromDT(d.date, d.end) }); T.save(); T.toast(`Shift added. ${m.name.split(' ')[0]} gets a text.`, { icon: 'calendar' }); T.feed({ icon: 'calendar', text: `Shift scheduled for ${m.name}: ${T.relDay(T.fromDT(d.date, d.start))}`, href: '#/team' }); if (cur) { tab = 'time'; setTimeout(repaint, 50); } } }); };
  A.tmShiftAny = () => { const L = staff(); T.form({ title: 'Schedule a shift', icon: 'calendar', submitLabel: 'Add shift', fields: [{ name: 'who', label: 'Team member', type: 'select', full: true, options: L.map((m) => ({ v: m.id, l: m.name + ' (' + m.title + ')' })) }, { name: 'date', label: 'Date', type: 'date', value: T.isoDate(T.addDays(new Date(), 1)) }, { name: 'start', label: 'Start', type: 'time', value: '09:00' }, { name: 'end', label: 'End', type: 'time', value: '17:00' }], onSubmit: (d) => { tx().extra.push({ who: d.who, start: T.fromDT(d.date, d.start), end: T.fromDT(d.date, d.end) }); T.save(); T.toast('Shift added and texted to ' + T.byId(S().team, d.who).name.split(' ')[0], { icon: 'calendar' }); } }); };
  A.tmTask = (el) => { if (A.newTask) A.newTask({ dataset: { v: el.dataset.id } }); };
  A.tmAccess = (el) => { const m = T.byId(S().team, el.dataset.id); const off = !!tx().off[m.id]; const go = () => { if (off) delete tx().off[m.id]; else tx().off[m.id] = true; T.save(); T.toast(off ? `${m.name.split(' ')[0]} can log in again` : `${m.name.split(' ')[0]}'s dashboard access is paused`, { icon: 'lock' }); repaint(); if (T.route().key === 'team') T.render(true); };
    if (off) go(); else T.confirm('Deactivate dashboard access?', `${m.name} will be signed out on every device and cannot log in until you restore access. Their history stays.`, 'Deactivate', go); };
  A.tmPto = (el) => { const m = T.byId(S().team, el.dataset.id); tx().pto[m.id] = el.dataset.v; T.save(); T.toast(el.dataset.v === 'ok' ? `Approved. ${m.name.split(' ')[0]} gets a text and the schedule updates.` : `Denied. ${m.name.split(' ')[0]} gets a text.`, { icon: 'calendar' }); repaint(); };
  A.tmNote = (el) => { const i = document.getElementById('tmNote'); if (!i || !i.value.trim()) return; const n = tx().notes; (n[el.dataset.id] = n[el.dataset.id] || []).unshift({ t: i.value.trim(), by: T.role().person, at: new Date().toISOString() }); T.save(); repaint(); T.toast('Note added'); };
  A.tmInvite = () => T.form({ title: 'Add a team member', icon: 'users', submitLabel: 'Send invite (demo)', fields: [{ name: 'name', label: 'Name', required: true }, { name: 'title', label: 'Position', required: true }, { name: 'phone', label: 'Mobile phone' }, { name: 'role', label: 'Dashboard view', type: 'select', options: ['Employee', 'Manager'] }], onSubmit: (d) => T.toast(`Invite texted to ${d.name.split(' ')[0]} (demo)`, { icon: 'send' }) });

  // ---------- register ----------
  const prevReg = T.registerInsights;
  T.registerInsights = (config) => {
    if (prevReg) prevReg(config);
    cfg = config;
    T.pages.team = { title: 'Team', icon: 'users', render: page, count: () => staff().filter((m) => detail(m).pending && !tx().pto[m.id]).length };
    const nav = cfg.nav || [];
    if (!nav.some((g) => g.items.includes('team'))) {
      const g = nav.find((x) => x.items.includes('tasks')) || nav[nav.length - 1];
      if (g) { const k = g.items.indexOf('tasks'); g.items.splice(k >= 0 ? k : g.items.length, 0, 'team'); }
    }
  };
})();
