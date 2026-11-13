/* Three Village Local - Company Digital Dashboards demo engine (core)
   One engine, many businesses: each industry file supplies a config object, this file supplies
   the store, router, app shell, roles, overlays, UI kit and charts. Modules live in engine-modules.js
   and engine-insights.js. No build step, no dependencies. */
(function () {
  'use strict';
  const T = window.TVL = {};
  T.pages = {}; T.actions = {};
  // ?embed=1 : shown inside another page (iframe). ?tour=1 : guided auto-tour. Embedded demos never touch storage.
  T.Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return { get: () => null }; } })();
  T.EMBED = T.Q.get('embed') === '1'; T.TOUR = T.EMBED && T.Q.get('tour') === '1';

  // ---------- Icons ----------
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    tasks: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    megaphone: '<path d="m3 11 15-6v14L3 13z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
    pie: '<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M8 14h.01M16 14h.01M9 18h6"/><circle cx="12" cy="3" r="1"/>',
    note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    trendDown: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    arrowR: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    collapse: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    board: '<rect x="3" y="3" width="7" height="18" rx="2"/><rect x="14" y="3" width="7" height="11" rx="2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    flag: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
    receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .7V2l-1 .7-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    swap: '<path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
    // industry
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    wine: '<path d="M8 22h8M12 15v7M7 2h10l-1 7a4 4 0 0 1-8 0z"/>',
    chef: '<path d="M6 13.9A4 4 0 0 1 7.6 6a5 5 0 0 1 8.8 0A4 4 0 0 1 18 13.9V21H6z"/><path d="M6 17h12"/>',
    table: '<path d="M3 8h18M5 8v12M19 8v12M8 8V5h8v3"/>',
    hammer: '<path d="m15 12-8.4 8.4a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 15 22 10.6l-3.5-3.5-1.5 1.5-4-4L11 6.6l4 4-1.5 1.5z"/>',
    hardhat: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5M4 15v-3a8 8 0 0 1 16 0v3"/>',
    ruler: '<path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4zM7.5 10.5l2-2M10.5 13.5l2-2M13.5 16.5l2-2"/>',
    truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    droplet: '<path d="M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z"/>',
    flower: '<circle cx="12" cy="12" r="3"/><path d="M12 9a3 3 0 1 1 3-3 3 3 0 1 1 3 3 3 3 0 1 1-3 3 3 3 0 1 1-3 3 3 3 0 1 1-3-3 3 3 0 1 1-3-3 3 3 0 1 1 3-3 3 3 0 1 1 3 3"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.4 1.4 1.4 2.8 2.5 2.8z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2C7.8 18.8 7 20.2 7 22M14 14.7V17c0 .6.5 1 1 1.2 1.2.6 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0z"/>',
    snow: '<path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    workflow: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/>',
    hourglass: '<path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 10 0V2M7 22v-4a5 5 0 0 1 10 0v4"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    smartphone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'
  };
  const icon = T.icon = (n, cls) => `<svg class="i ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.info}</svg>`;

  // ---------- Utils ----------
  const esc = T.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = T.DAY = 864e5;
  const sod = T.sod = (x) => { const d = new Date(x); d.setHours(0, 0, 0, 0); return d; };
  const today0 = T.today0 = () => sod(new Date());
  T.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  T.at = (dayOff, h, m) => { const d = today0(); d.setDate(d.getDate() + dayOff); d.setHours(h || 0, m || 0, 0, 0); return d.toISOString(); };
  T.dayDiff = (iso) => Math.round((sod(iso) - today0()) / DAY);
  T.daysSince = (iso) => iso ? Math.max(0, -T.dayDiff(iso)) : null;
  T.sameDay = (a, b) => sod(a).getTime() === sod(b).getTime();
  T.money = (n) => (n < 0 ? '-$' : '$') + Math.round(Math.abs(n || 0)).toLocaleString('en-US');
  T.money2 = (n) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  T.short = (n) => { n = n || 0; const a = Math.abs(n), s = n < 0 ? '-' : ''; if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M'; if (a >= 1e4) return s + '$' + Math.round(a / 1e3) + 'K'; if (a >= 1e3) return s + '$' + (a / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return s + '$' + Math.round(a); };
  T.num = (n) => Math.round(n || 0).toLocaleString('en-US');
  T.knum = (n) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(Math.round(n));
  T.pct = (n, d) => (n * 100).toFixed(d == null ? 0 : d) + '%';
  T.fmtDate = (iso, o) => iso ? new Date(iso).toLocaleDateString('en-US', o || { month: 'short', day: 'numeric' }) : '';
  T.fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  T.fmtHour = (h) => { const hh = Math.floor(h), m = Math.round((h - hh) * 60); const ap = hh >= 12 && hh < 24 ? 'PM' : 'AM'; const h12 = hh % 12 === 0 ? 12 : hh % 12; return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ap; };
  T.relDay = (iso) => {
    if (!iso) return ''; const n = T.dayDiff(iso);
    if (n === 0) return 'Today'; if (n === 1) return 'Tomorrow'; if (n === -1) return 'Yesterday';
    if (n > 1 && n < 7) return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
    return T.fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  T.timeAgo = (iso) => {
    if (!iso) return 'Never';
    const mins = Math.round((Date.now() - new Date(iso)) / 6e4);
    if (mins < 0) return T.relDay(iso) + ', ' + T.fmtTime(iso);
    if (mins < 60) return mins <= 1 ? 'Just now' : mins + 'm ago';
    if (mins < 60 * 24 && T.sameDay(iso, new Date())) return Math.round(mins / 60) + 'h ago';
    const d = T.daysSince(iso);
    if (d <= 1) return 'Yesterday'; if (d < 30) return d + ' days ago'; if (d < 365) return Math.round(d / 30) + ' mo ago';
    return Math.round(d / 365) + ' yr ago';
  };
  T.uid = (p) => (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const hash = T.hash = (s) => { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  T.isoDate = (d) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  T.isoTime = (d) => { const x = new Date(d); return String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0'); };
  T.fromDT = (date, time) => { const [y, m, d] = date.split('-').map(Number); const [hh, mm] = (time || '09:00').split(':').map(Number); return new Date(y, m - 1, d, hh, mm).toISOString(); };
  T.sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);
  T.avg = (arr, f) => arr.length ? T.sum(arr, f) / arr.length : 0;
  T.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  T.byId = (arr, id) => arr.find((x) => x.id === id);
  T.dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  T.dowLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  T.greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  // Seeded RNG + generators
  T.rng = (seed) => { let a = hash(seed) || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const FIRST = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'James', 'Sophia', 'Lucas', 'Mia', 'Ethan', 'Isabella', 'Mason', 'Grace', 'Logan', 'Chloe', 'Daniel', 'Nora', 'Henry', 'Lily', 'Owen', 'Zoe', 'Caleb', 'Hannah', 'Ryan', 'Leah', 'Nathan', 'Aria', 'Dylan', 'Maya', 'Gavin', 'Elena', 'Marcus', 'Priya', 'Andre', 'Sofia', 'Kevin', 'Rosa', 'Tyler', 'Naomi', 'Victor', 'Jenna', 'Derek', 'Claire', 'Omar', 'Tessa', 'Brian', 'Kira', 'Sean', 'Alana', 'Julian', 'Megan', 'Rafael', 'Erin', 'Colin', 'Dana', 'Mateo', 'Bianca', 'Paul', 'Lauren', 'Isaac', 'Jasmine', 'Gregory', 'Nicole', 'Anthony', 'Rachel', 'Vincent', 'Samantha', 'Kyle', 'Teresa', 'Joel', 'Amara', 'Frank', 'Diana', 'Luis', 'Kate', 'Wes', 'Yara', 'Neil', 'Ingrid', 'Ravi'];
  const LAST = ['Abbott', 'Brennan', 'Castellano', 'Delgado', 'Ellison', 'Fitzgerald', 'Gallagher', 'Hartley', 'Iverson', 'Jablonski', 'Kowalski', 'Lindqvist', 'Moreau', 'Novak', 'Okafor', 'Petrakis', 'Quinlan', 'Russo', 'Sandoval', 'Thornton', 'Underwood', 'Vasquez', 'Whitaker', 'Yilmaz', 'Zielinski', 'Ambrose', 'Bellamy', 'Corrigan', 'Donnelly', 'Esposito', 'Farrow', 'Greco', 'Holloway', 'Iacono', 'Keane', 'Lombardi', 'Mahoney', 'Nakamura', "O'Rourke", 'Pellegrino', 'Ramos', 'Sorensen', 'Tierney', 'Valente', 'Weston', 'Albrecht', 'Barrett', 'Calloway', 'DiNapoli', 'Engstrom', 'Ferrante', 'Garrity', 'Hendricks', 'Kessler', 'Lafferty', 'Marchetti', 'Nolan', 'Oliveira', 'Prescott', 'Rinaldi', 'Shapiro', 'Townsend', 'Vitale', 'Whelan', 'Chen', 'Patel', 'Kim', 'Haddad', 'Mensah', 'Rivera', 'Singh', 'Park', 'Kaur', 'Nguyen', 'Cohen', 'Brooks', 'Moran', 'Larkin', 'Fiore', 'Gupta'];
  const TOWNS = ['Setauket', 'East Setauket', 'Stony Brook', 'Port Jefferson', 'Port Jefferson Station', 'Mount Sinai', 'Miller Place', 'Smithtown', 'St. James', 'Centereach', 'Selden', 'Coram', 'Old Field', 'Head of the Harbor', 'Nesconset', 'Hauppauge', 'Kings Park', 'Commack', 'Lake Grove', 'Rocky Point', 'Sound Beach', 'Belle Terre', 'Poquott', 'Northport'];
  T.TOWNS = TOWNS;
  T.gen = (seed) => {
    const r = T.rng(seed);
    const G = {
      r, f: (a, b) => a + r() * (b - a), int: (a, b) => Math.floor(a + r() * (b - a + 1)), pick: (arr) => arr[Math.floor(r() * arr.length)], chance: (p) => r() < p,
      shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      weighted: (pairs) => { const tot = pairs.reduce((a, p) => a + p[1], 0); let x = r() * tot; for (const p of pairs) { x -= p[1]; if (x <= 0) return p[0]; } return pairs[0][0]; },
      phone: () => '(631) 555-0' + String(G.int(100, 199)),
      town: (local) => local && G.chance(local) ? G.pick(TOWNS.slice(0, 8)) : G.pick(TOWNS),
      usedNames: new Set(),
      name: () => { for (let k = 0; k < 40; k++) { const f = G.pick(FIRST), l = G.pick(LAST); if (!G.usedNames.has(f + l)) { G.usedNames.add(f + l); return { first: f, last: l }; } } return { first: G.pick(FIRST), last: G.pick(LAST) }; },
      email: (f, l) => (f + '.' + l).toLowerCase().replace(/[^a-z.]/g, '') + '@' + G.pick(['gmail.com', 'gmail.com', 'yahoo.com', 'icloud.com', 'optonline.net', 'outlook.com']),
      daysAgoISO: (a, b, h1, h2) => { const d = today0(); d.setDate(d.getDate() - G.int(a, b)); d.setHours(G.int(h1 == null ? 9 : h1, h2 == null ? 19 : h2), G.pick([0, 15, 30, 45])); return d.toISOString(); }
    };
    return G;
  };
  // per-date deterministic noise (history stays stable as days pass)
  T.dayRng = (key, date) => T.rng(key + '|' + T.isoDate(date));

  // ---------- Avatars ----------
  const AV = ['#2f5d8a', '#8a6a2e', '#2e6b5a', '#5f4c8c', '#8a4b3d', '#3f6f8f', '#5b6b2e', '#7b4f6e', '#36577a', '#9a6b3a', '#47705f', '#6a5a8e'];
  T.initials = (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  T.avatar = (name, size, color) => { const ph = T.photo && T.photo(name); if (ph) return `<span class="av ph ${size || ''}" style="background-image:url(${ph})" aria-hidden="true"></span>`; return `<span class="av ${size || ''}" style="background:${color || AV[hash(name || '') % AV.length]}" aria-hidden="true">${esc(T.initials(name))}</span>`; };
  T.fullName = (c) => c ? (c.first + ' ' + (c.last || '')).trim() : 'Unknown';

  // ---------- Store ----------
  let cfg = null, STORE_KEY = '';
  const Store = T.Store = {
    s: null,
    load() {
      let s = null;
      if (!T.EMBED) { try { s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { s = null; } }
      if (!s || s.version !== cfg.version) { s = T.buildSeed(); }
      else {
        const shift = Math.round((today0() - sod(s.seededAt)) / DAY);
        if (shift !== 0) { Store.shiftDates(s, shift); s.seededAt = today0().toISOString(); }
      }
      this.s = s; this.save();
    },
    shiftDates(obj, days) {
      const re = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
      const sh = (v) => { const d = new Date(v); d.setDate(d.getDate() + days); return d.toISOString(); };
      const walk = (o) => {
        if (Array.isArray(o)) o.forEach((v, i) => { if (typeof v === 'string' && re.test(v)) o[i] = sh(v); else if (v && typeof v === 'object') walk(v); });
        else if (o && typeof o === 'object') Object.keys(o).forEach((k) => { if (k === 'seededAt') return; const v = o[k]; if (typeof v === 'string' && re.test(v)) o[k] = sh(v); else if (v && typeof v === 'object') walk(v); });
      };
      walk(obj);
    },
    save() { if (T.EMBED) return; try { localStorage.setItem(STORE_KEY, JSON.stringify(this.s)); } catch (e) { /* in-memory only */ } },
    reset() { if (!T.EMBED) { try { localStorage.removeItem(STORE_KEY); } catch (e) { } } this.s = T.buildSeed(); this.save(); }
  };
  const S = T.S = () => Store.s;
  T.save = () => Store.save();

  // ---------- Roles ----------
  T.role = () => cfg.roles.find((r) => r.key === S().settings.role) || cfg.roles[0];
  T.isOwner = () => T.role().key === 'owner';
  T.isEmp = () => T.role().key === 'employee';
  T.me = () => { const r = T.role(); return r.staff ? S().team.find((m) => m.id === r.staff) : null; };
  T.pageRoles = (p) => p.roles || ['owner', 'manager'];
  T.canSee = (key) => { const p = T.pages[key]; return !!p && T.pageRoles(p).includes(T.role().key); };
  T.can = (roles) => !roles || roles.includes(T.role().key);

  // ---------- Activity, notifications, automations ----------
  T.feed = (o) => { const a = Object.assign({ id: T.uid('f'), date: new Date().toISOString() }, o); S().feed.unshift(a); if (S().feed.length > 120) S().feed.length = 120; return a; };
  T.notify = (o) => { const n = Object.assign({ id: T.uid('n'), date: new Date().toISOString(), read: false }, o); S().notifs.unshift(n); if (S().notifs.length > 60) S().notifs.length = 60; updateBell(); return n; };
  T.logTo = (cid, type, text, extra) => { const c = T.byId(S().customers, cid); if (!c) return; c.timeline = c.timeline || []; c.timeline.unshift(Object.assign({ id: T.uid('t'), type, text, date: new Date().toISOString(), by: T.role().person }, extra || {})); };
  T.autoRun = (key, text, o) => {
    const a = S().automations.find((x) => x.key === key);
    if (!a || !a.on) return false;
    o = o || {};
    a.runs++; a.month++; a.last = new Date().toISOString();
    S().autoLog.unshift({ id: T.uid('r'), key, text, date: a.last, ok: true });
    if (S().autoLog.length > 80) S().autoLog.length = 80;
    T.feed({ icon: a.icon || 'zap', text, href: o.href || '#/automations', auto: true });
    if (o.notify !== false) T.notify({ icon: a.icon || 'zap', text, href: o.href || '#/automations', auto: true });
    if (o.cid) T.logTo(o.cid, 'auto', text, { auto: true });
    return true;
  };

  // ---------- Overlays ----------
  T.toast = (msg, opt) => {
    opt = opt || {};
    const box = document.getElementById('toasts');
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = `${icon(opt.icon || 'check', 'sm')}<span>${esc(msg)}</span>${opt.action ? `<button type="button">${esc(opt.action.label)}</button>` : ''}`;
    const dismiss = () => { el.classList.add('out'); setTimeout(() => el.remove(), 260); };
    if (opt.action) el.querySelector('button').onclick = () => { opt.action.fn(); dismiss(); };
    box.appendChild(el); setTimeout(dismiss, opt.ms || 3400);
  };
  let modalState = null;
  T.modal = (o) => {
    T.closeModal(true); T.closePopover();
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const m = document.createElement('div'); m.className = 'modal' + (o.size === 'lg' ? ' lg' : ''); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'modal-title');
    m.innerHTML = `<div class="sheet-grab"></div><form novalidate><div class="modal-h">${o.icon ? `<span class="card-icon brand">${icon(o.icon, 'sm')}</span>` : ''}<h2 id="modal-title">${esc(o.title)}</h2><span class="spacer"></span><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div><div class="modal-b">${o.body}</div>${o.noFooter ? '' : `<div class="modal-f">${o.extraFoot || ''}<button type="button" class="btn" data-close>${esc(o.cancelLabel || 'Cancel')}</button>${o.submitLabel === false ? '' : `<button type="submit" class="btn btn-primary">${esc(o.submitLabel || 'Save')}</button>`}</div>`}</form>`;
    document.body.append(scrim, m);
    requestAnimationFrame(() => { scrim.classList.add('on'); m.classList.add('on'); });
    const form = m.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let bad = false;
      form.querySelectorAll('[required]').forEach((f) => { if (!String(f.value).trim()) { f.style.borderColor = 'var(--red)'; bad = true; } });
      if (bad) { T.toast('Please fill in the required fields', { icon: 'alert' }); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      form.querySelectorAll('input[type=checkbox]').forEach((cb) => { if (cb.name) data[cb.name] = cb.checked; });
      const r = o.onSubmit ? o.onSubmit(data, form, m) : true;
      if (r !== false) T.closeModal();
    });
    m.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => T.closeModal()));
    scrim.addEventListener('click', () => T.closeModal());
    modalState = { scrim, m, prev: document.activeElement };
    if (o.onOpen) o.onOpen(m);
    setTimeout(() => { const f = m.querySelector('[autofocus], .modal-b input:not([type=hidden]), .modal-b select, .modal-b textarea'); if (f && window.innerWidth > 760) f.focus(); }, 60);
    return m;
  };
  T.closeModal = (instant) => {
    if (!modalState) return;
    const { scrim, m, prev } = modalState; modalState = null;
    if (instant) { scrim.remove(); m.remove(); return; }
    scrim.classList.remove('on'); m.classList.remove('on');
    setTimeout(() => { scrim.remove(); m.remove(); }, 240);
    if (prev && prev.focus) try { prev.focus(); } catch (e) { }
  };
  T.confirm = (title, text, ok, fn) => T.modal({ title, body: `<p class="muted" style="margin:2px 0 6px">${esc(text)}</p>`, submitLabel: ok || 'Confirm', onSubmit: () => { fn(); } });
  // form builder
  T.fieldHtml = (f) => {
    const id = 'f-' + f.name; const v = f.value == null ? '' : f.value;
    let ctl;
    if (f.type === 'select') ctl = `<select class="input" id="${id}" name="${f.name}">${f.options.map((o) => { const ov = typeof o === 'object' ? o.v : o, ol = typeof o === 'object' ? o.l : o; return `<option value="${esc(ov)}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`;
    else if (f.type === 'textarea') ctl = `<textarea class="input" id="${id}" name="${f.name}" placeholder="${esc(f.ph || '')}" ${f.required ? 'required' : ''}>${esc(v)}</textarea>`;
    else if (f.type === 'html') return `<div class="${f.full ? 'full' : ''}">${f.html}</div>`;
    else ctl = `<input class="input" id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" placeholder="${esc(f.ph || '')}" ${f.required ? 'required' : ''} ${f.step ? 'step="' + f.step + '"' : ''} ${f.min != null ? 'min="' + f.min + '"' : ''} autocomplete="off">`;
    return `<div class="field ${f.full ? 'full' : ''}"><label for="${id}">${esc(f.label)}</label>${ctl}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</div>`;
  };
  T.form = (o) => T.modal(Object.assign({}, o, { body: (o.intro || '') + `<div class="form-grid">${o.fields.map(T.fieldHtml).join('')}</div>` + (o.outro || '') }));

  let drawerState = null;
  T.drawer = (o) => {
    T.closeDrawer(true);
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const d = document.createElement('aside'); d.className = 'drawer ' + (o.cls || ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', o.title);
    d.innerHTML = `<div class="drawer-h">${o.head || `<h2>${esc(o.title)}</h2>`}<span class="spacer"></span><button type="button" class="icon-btn" data-dclose aria-label="Close">${icon('x')}</button></div><div class="drawer-b">${o.body}</div>${o.foot ? `<div class="drawer-f">${o.foot}</div>` : ''}`;
    document.body.append(scrim, d);
    requestAnimationFrame(() => { scrim.classList.add('on'); d.classList.add('on'); });
    d.querySelector('[data-dclose]').onclick = () => T.closeDrawer();
    scrim.onclick = () => T.closeDrawer();
    drawerState = { scrim, d, o };
    if (o.onOpen) o.onOpen(d);
    return d;
  };
  T.closeDrawer = (instant) => {
    if (!drawerState) return; const { scrim, d, o } = drawerState; drawerState = null;
    if (o.onClose) o.onClose();
    if (instant) { scrim.remove(); d.remove(); return; }
    scrim.classList.remove('on'); d.classList.remove('on'); setTimeout(() => { scrim.remove(); d.remove(); }, 280);
  };
  T.drawerEl = () => drawerState && drawerState.d;
  let pop = null;
  T.popover = (anchor, html, opts) => {
    T.closePopover();
    const el = document.createElement('div'); el.className = 'popover'; el.innerHTML = html;
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect(); const w = Math.min((opts && opts.width) || 340, window.innerWidth - 24);
    el.style.width = w + 'px';
    let left = r.right - w; if (left < 12) left = 12;
    let top = r.bottom + 8; const h = el.offsetHeight;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 8);
    el.style.left = left + 'px'; el.style.top = top + 'px';
    requestAnimationFrame(() => el.classList.add('on'));
    pop = el; return el;
  };
  T.closePopover = () => { if (pop) { pop.remove(); pop = null; } };

  // ---------- UI kit ----------
  const ui = T.ui = {};
  ui.pageHead = (o) => `<div class="page-head fade-in"><div style="min-width:0">${o.eyebrow ? `<div class="eyebrow">${o.eyebrow}</div>` : ''}${o.crumbs ? `<div class="crumbs">${o.crumbs}</div>` : ''}<h1>${esc(o.title)}</h1>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}</div>${o.actions ? `<div class="actions">${o.actions}</div>` : ''}</div>`;
  ui.card = (o) => `<section class="card ${o.cls || ''}" ${o.id ? `id="${o.id}"` : ''}>${o.title ? `<div class="card-head">${o.icon ? `<span class="card-icon ${o.tone || 'brand'}">${icon(o.icon, 'sm')}</span>` : ''}<div style="min-width:0"><h3>${o.title}</h3>${o.sub ? `<div class="sub">${o.sub}</div>` : ''}</div>${o.right ? `<div class="right">${o.right}</div>` : ''}</div>` : ''}<div class="card-body ${o.flush ? 'flush' : ''}">${o.body}</div>${o.foot ? `<div class="card-foot">${o.foot}</div>` : ''}</section>`;
  ui.badge = (t, tone, dot) => `<span class="badge ${tone ? 'b-' + tone : ''}">${dot ? '<i class="bdot"></i>' : ''}${esc(t)}</span>`;
  ui.empty = (t, ic) => `<div class="empty">${icon(ic || 'check')}<div>${esc(t)}</div></div>`;
  ui.stars = (n) => { const f = Math.round(n); return `<span class="stars" aria-label="${n} stars">${'★'.repeat(f)}<span class="off">${'★'.repeat(5 - f)}</span></span>`; };
  ui.seg = (items, cur, act, extra) => `<div class="seg" role="tablist">${items.map((it) => `<button type="button" role="tab" aria-selected="${it.v === cur}" class="${it.v === cur ? 'on' : ''}" data-act="${act}" data-v="${esc(it.v)}" ${extra || ''}>${it.ic ? icon(it.ic, 'sm') : ''}${esc(it.l)}${it.n != null ? ` <span class="n">${it.n}</span>` : ''}</button>`).join('')}</div>`;
  ui.chips = (items, cur, act) => `<div class="chips">${items.map((it) => `<button type="button" class="chip ${it.v === cur ? 'on' : ''}" data-act="${act}" data-v="${esc(it.v)}">${esc(it.l)}${it.n != null ? ` <span class="c">${it.n}</span>` : ''}</button>`).join('')}</div>`;
  ui.kpi = (k) => {
    const tag = k.href ? 'a' : 'div';
    return `<${tag} class="card kpi fade-in" ${k.href ? `href="${k.href}"` : ''}><div class="label">${k.icon ? icon(k.icon, 'sm') : ''}${esc(k.label)}${k.sample ? ' <span class="sample">Sample</span>' : ''}</div><div class="value" ${k.count != null ? `data-count="${k.count}" data-fmt="${k.fmt || 'num'}"` : ''}>${k.value}</div>${k.spark ? `<div class="spark">${ui.spark(k.spark, { color: k.sparkColor })}</div>` : ''}<div class="delta">${k.delta || ''}</div></${tag}>`;
  };
  ui.delta = (cur, prev, opts) => {
    opts = opts || {}; if (!prev) return `<span class="faint">${opts.label || ''}</span>`;
    const ch = (cur - prev) / prev; const good = opts.invert ? ch <= 0 : ch >= 0;
    return `<span class="${good ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch * 100).toFixed(Math.abs(ch) < .1 ? 1 : 0)}%</span> <span class="faint">${opts.label != null ? opts.label : 'vs last period'}</span>`;
  };
  ui.progress = (p, tone) => `<div class="progress ${tone || ''}"><i style="width:${T.clamp(p * 100, 0, 100).toFixed(1)}%"></i></div>`;
  ui.hbars = (items, fmt, color) => { const mx = Math.max(1, ...items.map((i) => i.value)); return items.map((i) => `<div class="hbar-row" data-tip="${esc(i.label)}: ${esc(fmt ? fmt(i.value) : i.value)}"><span class="lbl">${esc(i.label)}</span><span class="bar"><i class="grow-x" style="width:${(i.value / mx * 100).toFixed(1)}%;${i.color || color ? 'background:' + (i.color || color) : ''}"></i></span><span class="v">${fmt ? fmt(i.value) : i.value}</span></div>`).join(''); };
  ui.spark = (vals, o) => {
    o = o || {}; const w = o.w || 84, h = o.h || 30; if (!vals || vals.length < 2) return '';
    const mn = Math.min(...vals), mx = Math.max(...vals), rg = mx - mn || 1;
    const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - 3 - (v - mn) / rg * (h - 6)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const id = 'sg' + hash(d) % 1e6; const c = o.color || 'var(--chart-1)';
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${w} ${h} L0 ${h}Z" fill="url(#${id})"/><path class="draw" d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  };
  const niceMax = (v) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
  // line/area chart. series: [{name, values, color, dash}]
  ui.line = (o) => {
    const W = o.w || 640, H = o.h || 220, pl = 46, pr = 12, pt = 12, pb = 26; const n = o.labels.length;
    const fmt = o.fmt || T.knum; const all = o.series.flatMap((s) => s.values);
    const mx = niceMax(Math.max(...all) * 1.05); const mn = o.zero === false ? Math.min(...all) * .9 : 0;
    const X = (i) => pl + (n === 1 ? 0 : i / (n - 1) * (W - pl - pr)); const Y = (v) => pt + (1 - (v - mn) / (mx - mn || 1)) * (H - pt - pb);
    let g = '';
    for (let k = 0; k <= 4; k++) { const v = mn + (mx - mn) * k / 4; const y = Y(v); g += `<line class="grid-l" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text x="${pl - 8}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`; }
    const step = Math.max(1, Math.ceil(n / (o.ticks || 7)));
    o.labels.forEach((l, i) => { if (i % step === 0 || i === n - 1 && n < 14) g += `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
    let paths = '';
    o.series.forEach((s, si) => {
      const d = s.values.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
      const c = s.color || `var(--chart-${si + 1})`; const id = 'lg' + hash(d + si) % 1e7;
      if (si === 0 && o.area !== false) paths += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".2"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path class="fade-area" d="${d} L${X(n - 1)} ${Y(mn)} L${X(0)} ${Y(mn)}Z" fill="url(#${id})"/>`;
      paths += `<path class="${s.dash ? 'fade-area' : 'draw'}" d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/>`;
      if (n <= 14) s.values.forEach((v, i) => { paths += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="var(--surface)" stroke="${c}" stroke-width="2"/>`; });
    });
    let hits = ''; const bw = (W - pl - pr) / Math.max(1, n - 1);
    o.labels.forEach((l, i) => { const tip = `<b>${esc(o.tipLabels ? o.tipLabels[i] : l)}</b><br>` + o.series.map((s) => `${esc(s.name)}: ${fmt === T.knum ? T.num(s.values[i]) : fmt(s.values[i])}`).join('<br>'); hits += `<rect class="hit" x="${X(i) - bw / 2}" y="${pt}" width="${bw}" height="${H - pt - pb}" data-tip="${esc(tip)}" data-html="1"/>`; });
    const legend = o.series.length > 1 ? `<div class="legend" style="margin-bottom:8px">${o.series.map((s, si) => `<span><i style="background:${s.color || `var(--chart-${si + 1})`}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
    return legend + `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Line chart')}">${g}${paths}${hits}</svg>`;
  };
  ui.bars = (o) => {
    const W = o.w || 640, H = o.h || 220, pl = 46, pr = 10, pt = 12, pb = 26; const n = o.labels.length; const fmt = o.fmt || T.knum;
    const tot = o.labels.map((_, i) => o.stacked ? T.sum(o.series, (s) => s.values[i]) : Math.max(...o.series.map((s) => s.values[i])));
    const mx = niceMax(Math.max(...tot) * 1.05); const Y = (v) => pt + (1 - v / mx) * (H - pt - pb);
    let g = ''; for (let k = 0; k <= 4; k++) { const v = mx * k / 4; g += `<line class="grid-l" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }
    const slot = (W - pl - pr) / n; const groupW = Math.min(slot * .72, o.maxBar || 46); const sc = o.stacked ? 1 : o.series.length; const bw = (groupW - (sc - 1) * 2) / sc;
    let bars = '';
    o.labels.forEach((l, i) => {
      const x0 = pl + slot * i + (slot - groupW) / 2; let base = 0;
      o.series.forEach((s, si) => {
        const v = s.values[i]; const c = s.colors ? s.colors[i] : (s.color || `var(--chart-${si + 1})`);
        const tip = `<b>${esc(o.tipLabels ? o.tipLabels[i] : l)}</b><br>${esc(s.name)}: ${fmt === T.knum ? T.num(v) : fmt(v)}`;
        if (o.stacked) { const y1 = Y(base + v), y0 = Y(base); bars += `<rect class="bar-grow" x="${x0}" y="${y1}" width="${groupW}" height="${Math.max(0, y0 - y1 - (base ? 2 : 0))}" rx="${si === o.series.length - 1 ? 4 : 0}" fill="${c}" data-tip="${esc(tip)}" data-html="1" style="transform-origin:0 ${Y(0)}px"/>`; base += v; }
        else { const x = x0 + si * (bw + 2); bars += `<rect class="bar-grow" x="${x}" y="${Y(v)}" width="${bw}" height="${Math.max(0, Y(0) - Y(v))}" rx="4" fill="${c}" data-tip="${esc(tip)}" data-html="1" style="transform-origin:0 ${Y(0)}px"/>`; }
      });
      if (n <= 16 || i % Math.ceil(n / 12) === 0) g += `<text x="${pl + slot * i + slot / 2}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`;
    });
    const legend = o.series.length > 1 ? `<div class="legend" style="margin-bottom:8px">${o.series.map((s, si) => `<span><i style="background:${s.color || `var(--chart-${si + 1})`}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
    return legend + `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Bar chart')}">${g}${bars}</svg>`;
  };
  ui.donut = (items, o) => {
    o = o || {}; const size = o.size || 150, r = size / 2 - 12, C = 2 * Math.PI * r; const tot = T.sum(items, (i) => i.value) || 1; let off = 0;
    const segs = items.map((it, k) => { const len = it.value / tot * C; const s = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${it.color || `var(--chart-${k + 1})`}" stroke-width="16" stroke-dasharray="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})" data-tip="${esc(it.label)}: ${esc(o.fmt ? o.fmt(it.value) : T.pct(it.value / tot))}"/>`; off += len; return s; }).join('');
    return `<div class="row" style="gap:18px;flex-wrap:wrap"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(o.aria || 'Breakdown')}" style="flex:none">${segs}<text x="50%" y="48%" text-anchor="middle" style="font-size:20px;font-weight:700;fill:var(--text)">${esc(o.center || '')}</text><text x="50%" y="62%" text-anchor="middle" style="font-size:11px;fill:var(--text-3)">${esc(o.centerSub || '')}</text></svg><div class="legend" style="flex-direction:column;gap:7px;min-width:0;flex:1">${items.map((it, k) => `<span style="justify-content:space-between;width:100%"><span class="row" style="gap:7px"><i style="background:${it.color || `var(--chart-${k + 1})`}"></i>${esc(it.label)}</span><b class="num">${o.fmt ? o.fmt(it.value) : T.pct(it.value / tot)}</b></span>`).join('')}</div></div>`;
  };
  ui.ring = (p, size, color, label) => { size = size || 64; const r = size / 2 - 6, C = 2 * Math.PI * r; return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="7"/><circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color || 'var(--chart-1)'}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * T.clamp(p, 0, 1)).toFixed(1)} ${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><b>${label != null ? label : Math.round(p * 100) + '%'}</b></div>`; };
  ui.funnel = (steps) => { const mx = steps[0].value || 1; return steps.map((s, i) => `<div class="funnel-step"><span class="small muted ellip">${esc(s.label)}</span><span><span class="fb" style="width:${Math.max(8, s.value / mx * 100)}%;background:${s.color || 'var(--chart-1)'};opacity:${1 - i * .1}">${T.num(s.value)}</span></span><span class="small faint right">${i ? T.pct(s.value / steps[i - 1].value) : ''}</span></div>`).join(''); };
  ui.heat = (rows, cols, m, fmt) => {
    const mx = Math.max(...m.flat()) || 1;
    return `<div style="overflow-x:auto"><table class="heat" style="border-collapse:separate;border-spacing:3px;width:100%;min-width:520px"><thead><tr><th></th>${cols.map((c) => `<th class="tiny faint" style="font-weight:600">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr><th class="tiny faint" style="text-align:left;font-weight:600;padding-right:6px">${esc(r)}</th>${m[i].map((v, j) => `<td data-tip="${esc(r)} ${esc(cols[j])}: ${esc(fmt ? fmt(v) : v)}" style="height:26px;border-radius:5px;background:color-mix(in srgb, var(--chart-1) ${Math.round(8 + v / mx * 88)}%, var(--surface-3))"></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };
  // table: cols [{l, r, v(row), cls}] ; rows ; rowAct ; rowId
  ui.table = (o) => {
    if (!o.rows.length) return ui.empty(o.empty || 'Nothing here yet', o.emptyIcon);
    return `<div class="table-wrap"><table class="t stack-m"><thead><tr>${o.cols.map((c) => `<th class="${c.r ? 'r' : ''}">${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${o.rows.map((r) => `<tr class="${o.rowAct ? 'click' : ''}" ${o.rowAct ? `data-act="${o.rowAct}" data-id="${esc(o.rowId ? o.rowId(r) : r.id)}" tabindex="0"` : ''}>${o.cols.map((c, ci) => `<td class="${c.r ? 'r ' : ''}${ci === 0 ? 'first ' : ''}${c.cls || ''}" data-l="${esc(c.l)}">${c.v(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };
  // kanban: stages [{key,label,color}], items, stageOf, card(item), sum(items), moveAct, openAct, addAct
  ui.kanban = (o) => `<div class="board-wrap"><div class="board" data-board="${o.id}" data-move="${o.moveAct}">${o.stages.map((st) => { const its = o.items.filter((i) => o.stageOf(i) === st.key); return `<div class="col" data-stage="${esc(st.key)}"><div class="col-head"><span class="cdot" style="background:${st.color || 'var(--text-3)'}"></span>${esc(st.label)} <span class="n">${its.length}</span>${o.sum ? `<span class="sum">${o.sum(its)}</span>` : ''}</div>${its.map((i) => `<div class="kcard" draggable="true" data-kid="${esc(i.id)}" data-act="${o.openAct}" data-id="${esc(i.id)}" tabindex="0">${o.card(i)}</div>`).join('')}${o.addAct ? `<button class="add-card" data-act="${o.addAct}" data-v="${esc(st.key)}">+ Add</button>` : ''}</div>`; }).join('')}</div></div>`;
  // generated art for posts / photos (no external images)
  const ARTS = [['#0f4c4a', '#c9a25c'], ['#3a1f2b', '#e7a1a8'], ['#1d2733', '#f2a516'], ['#0b0c0e', '#c6f432'], ['#20385f', '#78a6e0'], ['#5a2d1c', '#f0b067'], ['#2c4a2c', '#a8d08d'], ['#4b2a5c', '#e3a6f0']];
  ui.art = (o) => {
    const h = hash(o.seed || o.title || 'x'); const AR = (T.cfg && T.cfg.arts) || ARTS; const pal = o.pal || AR[h % AR.length]; const ang = 110 + h % 60;
    const shapes = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><circle cx="${70 + h % 25}" cy="${25 + h % 20}" r="${26 + h % 14}" fill="${pal[1]}" opacity=".35"/><circle cx="${10 + h % 30}" cy="${90 + h % 20}" r="${30 + h % 10}" fill="#fff" opacity=".07"/><path d="M0 ${85 + h % 15} Q 50 ${70 + h % 20} 100 ${88 + h % 10} V125 H0Z" fill="#000" opacity=".18"/></svg>`;
    return `<div class="post-art ${o.shape || ''}" style="background:linear-gradient(${ang}deg, ${pal[0]}, ${pal[1]})">${shapes}${o.tag ? `<span class="pa-tag">${esc(o.tag)}</span>` : ''}${o.ph !== false ? `<span class="pa-ph">${icon('image', 'sm').replace('class="i sm"', 'class="i sm" style="width:12px;height:12px;vertical-align:-2px"')} Photo slot</span>` : ''}${o.title ? `<div class="pa-t">${esc(o.title)}</div>` : ''}${o.sub ? `<div class="pa-s">${esc(o.sub)}</div>` : ''}</div>`;
  };
  ui.thumb = (seed, pal) => { const h = hash(seed); const AR = (T.cfg && T.cfg.arts) || ARTS; const p = pal || AR[h % AR.length]; return `background:linear-gradient(${110 + h % 60}deg, ${p[0]}, ${p[1]})`; };
  ui.lock = (what) => `<div class="card fade-in" style="max-width:560px;margin:60px auto;text-align:center;padding:36px 24px"><span class="card-icon brand" style="margin:0 auto 12px;width:48px;height:48px">${icon('lock', 'lg')}</span><h2 style="font-size:20px">${esc(what || 'This area')} is not part of the ${esc(T.role().label)} view</h2><p class="muted" style="margin:8px auto 18px;max-width:420px">Each team member gets their own version of the dashboard. Owners decide who sees money, payroll and marketing.</p><button class="btn btn-primary" data-act="setRole" data-v="owner">${icon('swap', 'sm')} Switch to Owner view</button></div>`;

  // ---------- Router ----------
  let curRoute = null, curParam = null;
  T.route = () => ({ key: curRoute, param: curParam });
  T.go = (h) => { if (location.hash === h) T.render(); else location.hash = h; };
  function parse() { const h = (location.hash || '#/').replace(/^#\/?/, ''); const parts = h.split('/'); return { key: parts[0] || 'home', param: parts.slice(1).join('/') ? decodeURIComponent(parts.slice(1).join('/')) : null }; }
  T.render = (keepScroll) => {
    const { key, param } = parse();
    const changed = key !== curRoute || param !== curParam;
    curRoute = key; curParam = param;
    const page = T.pages[key] || T.pages.home;
    const view = document.getElementById('view');
    T.closePopover();
    if (T.clearEvery) T.clearEvery();
    let html;
    try {
      html = !T.canSee(T.pages[key] ? key : 'home') ? ui.lock(page.title) : page.render(param);
    } catch (e) { console.error(e); html = ui.empty('Something went wrong rendering this view.', 'alert'); }
    view.innerHTML = `<a class="m-demo" href="${T.CTA}" target="_blank" rel="noopener"><i></i>Demo by Three Village Local · <b>Want one?</b></a>` + roleBanner() + html;
    if (page.after && T.canSee(T.pages[key] ? key : 'home')) page.after(view, param);
    markNav(key);
    document.title = (page.title ? page.title + ' - ' : '') + S().settings.bizName;
    if (changed && !keepScroll) window.scrollTo(0, 0);
    animateCounts(view);
    updateBell();
  };
  function roleBanner() {
    const r = T.role(); if (r.key === 'owner') return '';
    return `<div class="role-banner fade-in">${icon('eye', 'sm')}<span>Viewing as: <b>${esc(r.label)}</b> (${esc(r.person)})</span><span class="faint hide-xs">${esc(r.blurb || '')}</span><span class="spacer"></span><button class="btn btn-xs" data-act="setRole" data-v="owner">Back to Owner</button></div>`;
  }
  function animateCounts(root) {
    root.querySelectorAll('[data-count]').forEach((el) => {
      const to = parseFloat(el.dataset.count); const f = el.dataset.fmt; if (isNaN(to)) return;
      const fmtF = f === 'money' ? T.money : f === 'short' ? T.short : f === 'pct' ? (v) => v.toFixed(1) + '%' : f === 'pct0' ? (v) => Math.round(v) + '%' : f === 'dec' ? (v) => v.toFixed(1) : f === 'k' ? T.knum : T.num;
      const t0 = performance.now(), dur = 900;
      const step = (t) => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = fmtF(to * e); if (p < 1) requestAnimationFrame(step); else el.textContent = fmtF(to); };
      requestAnimationFrame(step);
    });
  }
  T.animateCounts = animateCounts;

  // ---------- Shell ----------
  function navItems() {
    return cfg.nav.map((g) => ({ label: g.label, items: g.items.filter((k) => T.canSee(k)) })).filter((g) => g.items.length);
  }
  function navLink(k) {
    const p = T.pages[k]; const c = p.count ? p.count(S()) : 0;
    return `<a href="#/${k === 'home' ? '' : k}" data-nav="${k}" title="${esc(p.navLabel || p.title)}">${icon(p.icon)}<span>${esc(p.navLabel || p.title)}</span>${c ? `<span class="count">${c}</span>` : ''}</a>`;
  }
  function shell() {
    const st = S().settings; const r = T.role();
    return `<div class="app ${st.collapsed ? 'collapsed' : ''}" id="appRoot">
      <aside class="sidebar" aria-label="Main navigation">
        <a class="brand" href="#/"><span class="brand-mark">${cfg.logo}</span><span class="brand-text"><div class="brand-name">${esc(st.bizName)}</div><div class="brand-sub">${esc(cfg.town)}, NY</div></span></a>
        <nav class="nav" id="nav"></nav>
        <div class="sidebar-foot">
          <div class="demo-card"><b>${icon('sparkles', 'sm').replace('class="i sm"', 'class="i sm" style="vertical-align:-3px"')} Custom built for you</b>Every screen here is tailored to how ${esc(cfg.kind)} actually run.<a class="btn btn-sm cta-btn" href="${T.CTA}" target="_blank" rel="noopener">Want one for your business?</a></div>
          <button class="collapse-btn" data-act="collapse">${icon('collapse')}<span>Collapse</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar" id="topbar">
          <a class="mobile-brand" href="#/"><span class="brand-mark">${cfg.logo}</span><span>${esc(st.bizName)}</span></a>
          <button class="searchbox" data-act="palette" aria-label="Search">${icon('search')}<span>Search ${esc(cfg.crm.label.toLowerCase())}, pages, actions...</span><kbd>Ctrl K</kbd></button>
          <div class="topbar-actions">
            <a class="demo-badge hide-m" href="${T.CTA}" target="_blank" rel="noopener" title="This is a demo with sample data"><i></i>Demo by Three Village Local</a>
            <a class="btn btn-sm cta-btn hide-m hide-l" href="${T.CTA}" target="_blank" rel="noopener">Want one for your business?</a>
            <button class="icon-btn hide-d" data-act="palette" aria-label="Search">${icon('search')}</button>
            <button class="btn btn-sm ai-btn hide-m" data-act="ai">${icon('sparkles', 'sm')}Ask AI</button>
            <button class="icon-btn hide-d ai-ic" data-act="ai" aria-label="Ask your business anything">${icon('sparkles')}</button>
            <button class="icon-btn" data-act="bell" id="bellBtn" aria-label="Notifications">${icon('bell')}<span class="dot" id="bellDot" hidden></span></button>
            <button class="role-btn" data-act="roleMenu" id="roleBtn" aria-label="Switch dashboard view">${T.avatar(r.person, 'sm', r.color)}<span class="hide-m"><b>${esc(r.person.split(' ')[0])}</b><small>${esc(r.label)}</small></span>${icon('chevD', 'sm hide-m')}</button>
          </div>
        </header>
        <main class="content" id="view" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" id="bottomNav" aria-label="Primary"></nav>
      <button class="fab" data-act="quickAdd" aria-label="Quick add">${icon('plus')}</button>
    </div>`;
  }
  function buildNav() {
    document.getElementById('nav').innerHTML = navItems().map((g) => `${g.label ? `<div class="nav-label">${esc(g.label)}</div>` : ''}${g.items.map(navLink).join('')}`).join('');
    const tabs = (cfg.tabs[T.role().key] || cfg.tabs.owner).filter((k) => T.canSee(k)).slice(0, 4);
    document.getElementById('bottomNav').innerHTML = tabs.map((k) => { const p = T.pages[k]; return `<a href="#/${k === 'home' ? '' : k}" data-tab="${k}">${icon(p.icon)}<span>${esc(p.tabLabel || p.navLabel || p.title)}</span></a>`; }).join('') + `<button data-act="more" data-tab="more">${icon('grid')}<span>More</span></button>`;
    const r = T.role(); const rb = document.getElementById('roleBtn');
    rb.innerHTML = `${T.avatar(r.person, 'sm', r.color)}<span class="hide-m"><b>${esc(r.person.split(' ')[0])}</b><small>${esc(r.label)}</small></span>${icon('chevD', 'sm hide-m')}`;
    markNav(curRoute);
  }
  T.buildNav = buildNav;
  function markNav(k) {
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === k));
    document.querySelectorAll('[data-tab]').forEach((a) => a.classList.toggle('on', a.dataset.tab === k));
  }
  function updateBell() {
    const d = document.getElementById('bellDot'); if (!d) return;
    const n = S().notifs.filter((x) => !x.read && T.can(x.roles)).length; d.hidden = !n; d.textContent = n > 9 ? '9+' : n;
  }
  T.updateBell = updateBell;
  T.refreshNav = () => { buildNav(); };

  // ---------- Theme ----------
  T.applyTheme = () => {
    const st = S().settings; const th = Object.assign({}, cfg.theme, st.dark ? cfg.themeDark || {} : {});
    if (st.brandColor) { th['--brand'] = st.brandColor; th['--brand-2'] = st.brandColor; th['--chart-1'] = st.brandColor; }
    const root = document.documentElement; root.setAttribute('data-theme', st.dark ? 'dark' : 'light');
    Object.keys(th).forEach((k) => root.style.setProperty(k, th[k]));
    const mc = document.querySelector('meta[name=theme-color]'); if (mc) mc.content = st.dark ? '#0c0f14' : '#f4f5f7';
  };

  // ---------- Global events ----------
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-act]');
      if (pop && !e.target.closest('.popover') && !(el && (el.dataset.act === 'bell' || el.dataset.act === 'roleMenu'))) T.closePopover();
      if (!el) return;
      const fn = T.actions[el.dataset.act];
      if (fn) { if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault(); if (el.tagName === 'BUTTON' || el.dataset.stop) e.preventDefault(); e.stopPropagation(); fn(el, e); }
    });
    document.addEventListener('change', (e) => { const el = e.target.closest('[data-change]'); if (el && T.actions[el.dataset.change]) T.actions[el.dataset.change](el, e); });
    document.addEventListener('input', (e) => { const el = e.target.closest('[data-input]'); if (el && T.actions[el.dataset.input]) T.actions[el.dataset.input](el, e); });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); T.actions.palette(); return; }
      if (e.key === 'Escape') { if (T.paletteOpen && T.paletteOpen()) return; if (modalState) T.closeModal(); else if (drawerState) T.closeDrawer(); else T.closePopover(); }
      if (e.key === 'Enter' && e.target.matches && e.target.matches('tr[data-act], .kcard[data-act], [role=button][data-act]')) { e.preventDefault(); e.target.click(); }
    });
    window.addEventListener('hashchange', () => { T.closeModal(true); T.closeDrawer(true); T.render(); });
    window.addEventListener('scroll', () => { const tb = document.getElementById('topbar'); if (tb) tb.classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });
    // tooltips
    const tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip);
    document.addEventListener('mouseover', (e) => { const t = e.target.closest && e.target.closest('[data-tip]'); if (!t) { tip.classList.remove('on'); return; } if (t.dataset.html) tip.innerHTML = t.dataset.tip; else tip.textContent = t.dataset.tip; tip.classList.add('on'); });
    document.addEventListener('mousemove', (e) => { if (!tip.classList.contains('on')) return; const w = tip.offsetWidth; let x = e.clientX + 14; if (x + w > window.innerWidth - 8) x = e.clientX - w - 14; tip.style.left = x + 'px'; tip.style.top = (e.clientY + 14) + 'px'; });
    document.addEventListener('scroll', () => tip.classList.remove('on'), { passive: true, capture: true });
    // generic drag and drop for kanban boards
    let dragId = null;
    document.addEventListener('dragstart', (e) => { const c = e.target.closest && e.target.closest('[data-kid]'); if (!c) return; dragId = c.dataset.kid; c.classList.add('dragging'); try { e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move'; } catch (er) { } });
    document.addEventListener('dragend', (e) => { const c = e.target.closest && e.target.closest('[data-kid]'); if (c) c.classList.remove('dragging'); document.querySelectorAll('.col.drop').forEach((x) => x.classList.remove('drop')); });
    document.addEventListener('dragover', (e) => { const col = e.target.closest && e.target.closest('.board .col'); if (!col || !dragId) return; e.preventDefault(); document.querySelectorAll('.col.drop').forEach((x) => x !== col && x.classList.remove('drop')); col.classList.add('drop'); });
    document.addEventListener('drop', (e) => { const col = e.target.closest && e.target.closest('.board .col'); if (!col || !dragId) return; e.preventDefault(); const board = col.closest('.board'); const fn = T.actions[board.dataset.move]; const id = dragId; dragId = null; col.classList.remove('drop'); if (fn) fn({ dataset: { id, stage: col.dataset.stage } }); });
  }

  // ---------- Core actions ----------
  const A = T.actions;
  A.collapse = () => { const st = S().settings; st.collapsed = !st.collapsed; T.save(); document.getElementById('appRoot').classList.toggle('collapsed', st.collapsed); };
  A.setRole = (el) => {
    const v = el.dataset.v; const st = S().settings; if (st.role === v) { T.closePopover(); return; }
    st.role = v; T.save(); T.closePopover(); buildNav();
    const r = T.role(); T.toast(`Now viewing as ${r.label} (${r.person})`, { icon: 'eye' });
    document.body.classList.add('role-switching'); setTimeout(() => document.body.classList.remove('role-switching'), 500);
    if (!T.canSee(curRoute)) T.go('#/'); else T.render(true);
  };
  A.roleMenu = (el) => {
    const cur = T.role().key;
    const p = T.popover(el, `<div class="pop-h">${icon('eye', 'sm')} View dashboard as<span class="spacer"></span><span class="badge b-brand">Demo</span></div><div style="padding:6px">${cfg.roles.map((r) => `<button class="role-opt ${r.key === cur ? 'on' : ''}" data-act="setRole" data-v="${r.key}">${T.avatar(r.person, 'sm', r.color)}<span class="grow"><b>${esc(r.label)}</b><small>${esc(r.person)} · ${esc(r.blurb)}</small></span>${r.key === cur ? icon('check', 'sm') : ''}</button>`).join('')}</div><div class="faint tiny" style="padding:8px 14px 12px">Each person on your team gets their own version: owners see everything, staff only see what they need.</div>`, { width: 360 });
    return p;
  };
  A.bell = (el) => {
    const s = S(); const list = s.notifs.filter((n) => T.can(n.roles)).slice(0, 14);
    T.popover(el, `<div class="pop-h">${icon('bell', 'sm')} Notifications<span class="spacer"></span><button class="btn btn-xs btn-ghost" data-act="readAll">Mark all read</button></div>${list.length ? list.map((n) => `<a class="notif ${n.read ? '' : 'unread'}" href="${n.href || '#/'}" data-act="openNotif" data-id="${n.id}" data-stop="1"><span class="feed-ic ${n.auto ? 'note' : ''}">${icon(n.icon || 'bell')}</span><span style="min-width:0"><div class="t">${esc(n.text)}</div><div class="w">${T.timeAgo(n.date)}${n.auto ? ' · <span class="auto-tag">' + icon('zap', 'sm') + 'Automated</span>' : ''}</div></span></a>`).join('') : ui.empty('You are all caught up')}`, { width: 380 });
  };
  A.readAll = () => { S().notifs.forEach((n) => { n.read = true; }); T.save(); updateBell(); document.querySelectorAll('.notif.unread').forEach((x) => x.classList.remove('unread')); };
  A.openNotif = (el) => { const n = T.byId(S().notifs, el.dataset.id); if (n) { n.read = true; T.save(); } T.closePopover(); T.go(el.getAttribute('href')); };
  A.go = (el) => T.go(el.dataset.href || el.getAttribute('href'));
  A.toggleDark = () => { const st = S().settings; st.dark = !st.dark; T.save(); T.applyTheme(); if (curRoute === 'settings') T.render(true); };
  A.more = () => {
    const groups = navItems();
    T.modal({ title: 'All screens', icon: 'grid', noFooter: true, body: groups.map((g) => `<div class="eyebrow" style="margin:6px 0 8px">${esc(g.label || 'Main')}</div><div class="more-grid" style="margin-bottom:14px">${g.items.map((k) => { const p = T.pages[k]; return `<a href="#/${k === 'home' ? '' : k}">${icon(p.icon)}<span>${esc(p.navLabel || p.title)}</span></a>`; }).join('')}</div>`).join('') + `<a class="btn cta-btn btn-block" style="height:46px" href="${T.CTA}" target="_blank" rel="noopener">Want one for your business?</a><p class="faint tiny" style="text-align:center;margin-top:10px">Demo by Three Village Local · sample data</p>` });
  };
  A.quickAdd = () => {
    const qa = (cfg.quickActions || []).filter((q) => T.can(q.roles));
    T.modal({ title: 'Quick add', icon: 'plus', noFooter: true, body: `<div class="sheet-list">${qa.map((q) => `<button data-act="${q.act}" data-v="${esc(q.v || '')}" data-close-modal="1">${icon(q.icon)}<span>${esc(q.label)}</span></button>`).join('')}</div>` });
  };

  // ---------- Boot ----------
  T.CTA = 'https://www.threevillagelocal.com/services#tvs-book';
  T.boot = (config) => {
    cfg = T.cfg = config;
    if (T.EMBED) document.documentElement.classList.add('embed');
    STORE_KEY = 'tvl-dash-' + cfg.id + '-' + cfg.version;
    T.registerCore && T.registerCore(cfg);
    Object.assign(T.pages, cfg.pages || {});
    Object.assign(T.actions, cfg.actions || {});
    Store.load();
    T.applyTheme();
    document.getElementById('app').innerHTML = shell();
    bindGlobal();
    buildNav();
    T.render();
    if (T.startLive) T.startLive();
    document.addEventListener('click', (e) => { if (e.target.closest('[data-close-modal]')) setTimeout(() => { if (document.querySelector('.modal .sheet-list')) T.closeModal(true); }, 0); }, true);
  };
})();
