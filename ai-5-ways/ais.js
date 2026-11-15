/* 5 Ways AI article: progress bar, reveals, chat playback, prompt picker + copy, dashboard roles (auto-rotate), saved checklists, share. */
(function () {
  var root = document.querySelector('.ais');
  if (!root || root.__ais) return;
  root.__ais = 1;
  root.classList.add('ais-js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ga(name, p) { try { if (window.gtag) gtag('event', name, p || {}); } catch (e) {} }
  function $$(s, el) { return [].slice.call((el || root).querySelectorAll(s)); }

  // reading progress
  var bar = root.querySelector('.ais-prog i'), tick = false;
  function prog() {
    tick = false;
    var r = root.getBoundingClientRect(), h = r.height - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, Math.max(0, -r.top / h)) : 0) + ')';
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true });

  // reveals + chat start
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.chat) play(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.rv,[data-chat]').forEach(function (el) { if (io) io.observe(el); else { el.classList.add('in'); if (el.dataset.chat) play(el); } });

  function play(chat) {
    var items = [].slice.call(chat.children), i = 0;
    if (reduce) { items.forEach(function (x) { x.classList.add(x.classList.contains('ais-typing') ? 'gone' : 'show'); }); return; }
    function step() {
      if (i >= items.length) {
        setTimeout(function () { items.forEach(function (x) { x.classList.remove('show', 'gone'); }); i = 0; setTimeout(step, 700); }, 7000);
        return;
      }
      var el = items[i++];
      el.classList.add('show');
      if (el.classList.contains('ais-typing')) setTimeout(function () { el.classList.add('gone'); step(); }, 1200);
      else setTimeout(step, el.classList.contains('ais-me') ? 900 : el.classList.contains('ais-time') ? 500 : 1500);
    }
    setTimeout(step, 400);
  }

  // prompt picker
  var cur = $$('.ais-ptabs button')[0];
  $$('.ais-ptabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      cur = b;
      $$('.ais-ptabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.ais-prompt').forEach(function (p) { p.classList.toggle('on', p.dataset.p === b.dataset.p); });
      ga('ais_prompt_tab', { tab: b.dataset.p });
    });
  });
  var cp = root.querySelector('.ais-copy');
  if (cp) cp.addEventListener('click', function () {
    var p = root.querySelector('.ais-prompt.on'); if (!p) return;
    var t = p.textContent;
    function ok() { cp.textContent = 'Copied! Paste it into any AI chat'; setTimeout(function () { cp.textContent = 'Copy this prompt'; }, 2600); }
    try { navigator.clipboard.writeText(t).then(ok, function () { fallback(t); ok(); }); } catch (e) { fallback(t); ok(); }
    ga('ais_prompt_copy', { tab: cur && cur.dataset.p });
  });
  function fallback(t) {
    var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove();
  }

  // dashboard roles: auto-rotate every 2.5s while visible, stop on click
  var roles = $$('.ais-roles button'), ri = 0, timer = null, stopped = false, vis = false;
  function setRole(b) {
    roles.forEach(function (x) { x.classList.toggle('on', x === b); });
    $$('.ais-dimg').forEach(function (v) { v.classList.toggle('on', v.dataset.r === b.dataset.r); });
  }
  roles.forEach(function (b, k) { b.addEventListener('click', function () { stopped = true; clearInterval(timer); ri = k; setRole(b); ga('ais_dash_role', { role: b.dataset.r }); }); });
  function run() { clearInterval(timer); if (stopped || reduce || !vis || document.hidden) return; timer = setInterval(function () { ri = (ri + 1) % roles.length; setRole(roles[ri]); }, 3500); }
  var dash = root.querySelector('.ais-bw');
  if (dash && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; run(); }, { threshold: .4 }).observe(dash);
  document.addEventListener('visibilitychange', run);

  // saved checklists
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || '{}'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return {}; } }
  var ring = root.querySelector('.ais-ring'), num = root.querySelector('.ais-wnum b'), msg = root.querySelector('.ais-wmsg');
  var MSG = ['Start with Monday. It takes 2 minutes.', 'Nice start. Keep going tomorrow.', 'Two down. You are ahead of most owners already.',
    'Over halfway there.', 'One more and you are officially using AI.', 'All 5 done! Ready for the next step? 3VL Digital can take it from here.'];
  $$('.ais-check').forEach(function (list) {
    var key = list.dataset.save, st = store(key);
    function paint() {
      var n = 0;
      $$('input', list).forEach(function (c) { c.closest('label').classList.toggle('done', c.checked); if (c.checked) n++; });
      if (key === 'ais-plan' && ring) {
        ring.style.strokeDashoffset = 327 - 327 * n / 5;
        ring.style.stroke = n === 5 ? '#16a34a' : '';
        num.textContent = n; msg.textContent = MSG[n];
      }
      return n;
    }
    $$('input', list).forEach(function (c) {
      c.checked = !!st[c.dataset.k];
      c.addEventListener('change', function () { st[c.dataset.k] = c.checked ? 1 : 0; store(key, st); var n = paint(); ga('ais_check', { list: key, done: n }); });
    });
    paint();
  });

  // share / save
  function share(label) {
    var data = { title: '5 Ways AI Can Help Your Long Island Business This Week', text: 'No tech skills needed. A plain-English guide for local owners.', url: location.href.split('#')[0] };
    ga('ais_share', { from: label });
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    try { navigator.clipboard.writeText(data.url); toast('Link copied'); } catch (e) { toast(data.url); }
  }
  $$('.ais-share').forEach(function (b) { b.addEventListener('click', function () { share(b.classList.contains('ais-save') ? 'plan' : 'final'); }); });
  function toast(t) { var d = document.createElement('div'); d.className = 'ais-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2200); }
  // GA4: every 3VL Digital CTA (data-cta = position/name) + in-page jump buttons
  $$('a[data-cta]').forEach(function (a) { a.addEventListener('click', function () { ga('ais_cta', { cta: a.dataset.cta, to: a.pathname, link_url: a.href.split('?')[0] }); }); });
  $$('a[href^="#ais-"]').forEach(function (a) { a.addEventListener('click', function () { ga('ais_jump', { to: a.getAttribute('href') }); }); });
})();
