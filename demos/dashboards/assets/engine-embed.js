/* Three Village Local - Company Digital Dashboards demo engine: embed + kiosk tour.
   ?embed=1          shown inside another page (iframe): extra demo chrome hidden, nothing stored, no pop-ups on load.
   ?embed=1&tour=1   guided auto-tour: home, customer profile, calendar, money, social studio, automations, integrations,
                     about every 5 seconds with simulated live activity. Pauses while the visitor hovers or touches,
                     stops for good on the first click so they can explore. Works in a cross-origin iframe. */
(function () {
  'use strict';
  const T = window.TVL; if (!T || !T.EMBED) return;
  const { icon, esc } = T; const S = T.S;
  const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const STEP = 5200;
  const ob = T.boot;
  T.boot = (c) => { ob(c); document.documentElement.classList.add('embed'); if (T.TOUR) setTimeout(start, 900); };

  let lastTouch = 0; let steps = [], idx = -1, timer = null, paused = false, stopped = false, hud = null, left = STEP, t0 = 0, subs = [];
  const later = (fn, ms) => { subs.push(setTimeout(() => { if (!stopped) fn(); }, ms)); };
  const clearSubs = () => { subs.forEach(clearTimeout); subs = []; };
  const G = () => T.gen('tour' + Date.now());

  function buildSteps() {
    const s = S(); const crm = T.cfg.crm || {};
    const best = s.customers.slice().sort((a, b) => (b.ltv || 0) - (a.ltv || 0))[0];
    const out = [{ k: 'home', h: '#/', l: 'Command Center', fx: fxHome }];
    if (best && T.canSee('customers')) out.push({ k: 'customers', h: '#/customers/' + best.id, l: (crm.singular || 'Customer') + ' profile', fx: fxProfile });
    if (T.canSee('calendar')) out.push({ k: 'calendar', h: '#/calendar', l: 'Calendar', fx: fxCal });
    if (T.canSee('finance')) out.push({ k: 'finance', h: '#/finance', l: 'Money', fx: fxMoney });
    else if (T.canSee('analytics')) out.push({ k: 'analytics', h: '#/analytics', l: 'Analytics', fx: fxMoney });
    if (T.canSee('social')) out.push({ k: 'social', h: '#/social', l: 'Social studio', fx: fxSocial });
    if (T.canSee('automations')) out.push({ k: 'automations', h: '#/automations', l: 'Automations', fx: fxAuto });
    if (T.canSee('integrations')) out.push({ k: 'integrations', h: '#/integrations', l: 'Integrations', fx: fxInteg });
    return out;
  }

  // ---------- simulated live activity ----------
  function leadCard(title, who, what, ic) {
    const el = document.createElement('div'); el.className = 'tour-lead';
    el.innerHTML = `<span class="tl-ic">${icon(ic || 'bot')}</span><span class="tl-b"><b>${esc(title)}</b><span class="tl-p">${T.avatar(who, 'sm')}<span><strong>${esc(who)}</strong><small>${esc(what)}</small></span></span></span><em>Just now</em>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 500); }, 3300);
  }
  function autoToast(text, ic) {
    const box = document.getElementById('toasts'); if (!box) return;
    const el = document.createElement('div'); el.className = 'toast tour-toast'; el.setAttribute('role', 'status');
    el.innerHTML = `${icon(ic || 'zap', 'sm')}<span>${esc(text)}</span><span class="auto-tag">${icon('zap', 'sm')}Automated</span>`;
    box.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 3000);
  }
  function tick(sel, inc) {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return;
    const txt = el.textContent; const m = txt.match(/-?[\d,]+(\.\d+)?/); if (!m) return;
    const from = parseFloat(m[0].replace(/,/g, '')); const dec = m[1] ? m[1].length - 1 : 0; const to = from + inc;
    const pre = txt.slice(0, m.index), post = txt.slice(m.index + m[0].length); const f = (v) => pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post;
    const card = el.closest('.kpi, .card') || el; card.classList.add('tour-tick'); setTimeout(() => card.classList.remove('tour-tick'), 1400);
    const s0 = performance.now(); const go = (t) => { const p = Math.min(1, (t - s0) / 900); el.textContent = f(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(go); }; requestAnimationFrame(go);
  }
  const kpiVals = () => [].slice.call(document.querySelectorAll('#view .kpi .value')).filter((v) => /\d/.test(v.textContent));
  const nm = () => { const n = G().name(); return n.first + ' ' + n.last[0] + '.'; };
  function liveRow() {
    const box = document.getElementById('liveFeed'); if (!box || !T.cfg.live || !T.feedRow) return;
    let ev = null; const g = G(); for (let i = 0; i < 6 && !(ev && ev.auto); i++) ev = T.cfg.live(g, S()); if (!ev) return;
    const f = Object.assign({ id: T.uid('f'), date: new Date().toISOString() }, ev, { fresh: true });
    const tmp = document.createElement('div'); tmp.innerHTML = T.feedRow(f); const node = tmp.firstElementChild; if (!node) return;
    node.classList.add('fade-in'); box.prepend(node); while (box.children.length > 9) box.lastElementChild.remove();
  }
  function scrollSome(frac) { if (RM) return; const max = document.documentElement.scrollHeight - window.innerHeight; if (max > 40) window.scrollTo({ top: Math.round(max * frac), behavior: 'smooth' }); }

  function fxHome() {
    const ls = S().leads || []; const lead = ls[Math.floor(Math.random() * Math.min(ls.length, 6))]; const who = nm();
    later(() => leadCard('New lead from your AI website assistant', who, lead && lead.intent ? lead.intent : 'asked for a quote', 'bot'), 700);
    later(() => { const v = kpiVals(); if (v[0]) tick(v[0], /\$/.test(v[0].textContent) ? 180 + Math.round(Math.random() * 240) : 1); if (v[1]) tick(v[1], 1); }, 1700);
    later(liveRow, 2600);
    later(() => scrollSome(0.35), 3000);
  }
  function fxProfile() { later(() => autoToast('Thank-you text and review link sent to ' + nm(), 'star'), 1400); later(() => scrollSome(0.3), 2800); }
  function fxCal() { later(() => autoToast("Reminder texts sent for tomorrow's bookings", 'calendar'), 1300); }
  function fxMoney() { later(() => { const v = kpiVals(); if (v[0]) tick(v[0], 240 + Math.round(Math.random() * 400)); }, 1400); later(() => autoToast('Invoice paid online. Receipt sent.', 'dollar'), 2200); later(() => scrollSome(0.3), 3200); }
  function fxSocial() { later(() => autoToast('AI drafted 3 posts for your approval', 'sparkles'), 1300); later(() => scrollSome(0.25), 2900); }
  function fxAuto() {
    later(() => {
      const a = (S().automations || []).find((x) => x.on); if (!a || !T.actions.runAuto) return;
      T.actions.runAuto({ dataset: { v: a.key } });
    }, 1300);
  }
  function fxInteg() { later(() => { const r = T.igPulse && T.igPulse(); if (r && r.it) autoToast(`Synced ${r.add} new records from ${r.it.n}`, 'refresh'); }, 1300); later(() => scrollSome(0.4), 2900); }

  // ---------- tour loop ----------
  function hudHtml() {
    return `<span class="th-live"><i></i>Live demo</span><span class="th-step" id="thStep"></span><span class="th-dots">${steps.map((s, i) => `<i data-i="${i}"></i>`).join('')}</span><span class="th-hint">${icon('eye', 'sm')}<span>Click anywhere to explore</span></span><span class="th-bar"><u id="thBar"></u></span>`;
  }
  function paintHud() {
    if (!hud) return; const s = steps[idx]; const st = hud.querySelector('#thStep'); if (st) st.textContent = paused ? 'Paused' : (idx + 1) + ' of ' + steps.length + ': ' + s.l;
    hud.querySelectorAll('.th-dots i').forEach((d, i) => d.classList.toggle('on', i === idx));
    hud.classList.toggle('paused', paused);
    const b = hud.querySelector('#thBar'); if (b) { b.style.transition = 'none'; b.style.width = ((STEP - left) / STEP * 100) + '%'; if (!paused) { void b.offsetWidth; b.style.transition = `width ${left}ms linear`; b.style.width = '100%'; } }
  }
  function hit(k) {
    const a = document.querySelector(`.nav [data-nav="${k}"]`) || document.querySelector(`.bottom-nav [data-tab="${k}"]`); if (!a) return;
    a.classList.remove('tour-hit'); void a.offsetWidth; a.classList.add('tour-hit'); setTimeout(() => a.classList.remove('tour-hit'), 900);
  }
  function show(i) {
    clearSubs(); idx = i % steps.length; const s = steps[idx];
    hit(s.k);
    const view = document.getElementById('view');
    const swap = () => {
      if (location.hash === s.h || (s.h === '#/' && (location.hash === '' || location.hash === '#'))) T.render(); else location.hash = s.h;
      window.scrollTo(0, 0);
      if (view) { view.classList.remove('tour-out'); view.classList.add('tour-in'); setTimeout(() => view.classList.remove('tour-in'), 600); }
      s.fx();
    };
    if (view && !RM) { view.classList.add('tour-out'); setTimeout(swap, 220); } else swap();
    left = STEP; arm(); paintHud();
  }
  function arm() { clearTimeout(timer); if (paused || stopped) return; t0 = Date.now(); timer = setTimeout(() => show(idx + 1), left); }
  function pause() { if (stopped || paused) return; paused = true; clearTimeout(timer); left = Math.max(400, left - (Date.now() - t0)); paintHud(); }
  function resume() { if (stopped || !paused) return; paused = false; arm(); paintHud(); }
  function stop() {
    if (stopped) return; stopped = true; clearTimeout(timer); clearSubs();
    if (hud) { hud.classList.add('out'); setTimeout(() => { if (hud) hud.remove(); hud = null; }, 400); }
    document.documentElement.classList.remove('touring');
    T.toast("You're driving now. Click around, it's all live.", { icon: 'eye' });
  }
  function start() {
    steps = buildSteps(); if (!steps.length) return;
    document.documentElement.classList.add('touring');
    hud = document.createElement('div'); hud.className = 'tour-hud'; hud.setAttribute('role', 'status'); hud.innerHTML = hudHtml(); document.body.appendChild(hud);
    requestAnimationFrame(() => hud.classList.add('on'));
    // first click (or key) anywhere hands control to the visitor
    const end = (e) => { if (e.isTrusted === false) return; stop(); off(); };
    const off = () => { document.removeEventListener('pointerdown', end, true); document.removeEventListener('keydown', end, true); };
    document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; end(e); }, true);
    document.addEventListener('click', end, true);
    document.addEventListener('keydown', end, true);
    // hover or touch pauses (touch scrolling without a tap resumes a few seconds later)
    const root = document.documentElement; let tt = null;
    root.addEventListener('mouseenter', pause); root.addEventListener('mouseleave', resume);
    document.addEventListener('mouseover', pause, { passive: true });
    // a resting pointer that has not moved for 15 seconds hands the frame back to the tour
    let lastMove = Date.now(); document.addEventListener('mousemove', () => { lastMove = Date.now(); if (paused) pause(); }, { passive: true });
    setInterval(() => { if (paused && !stopped && Date.now() - lastMove > 15000 && Date.now() - lastTouch > 6000) resume(); }, 1000);
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) resume(); }, { passive: true });
    // the host page can tell us when the pointer leaves the frame (some browsers never send mouseleave into an iframe)
    window.addEventListener('message', (e) => { const d = e.data; if (d && d.tvlTour === 'resume') resume(); else if (d && d.tvlTour === 'pause') pause(); });
    document.addEventListener('touchstart', () => { lastTouch = Date.now(); pause(); clearTimeout(tt); }, { passive: true });
    document.addEventListener('touchend', () => { clearTimeout(tt); tt = setTimeout(resume, 4000); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else if (!root.matches(':hover')) resume(); });
    show(0);
  }
})();
