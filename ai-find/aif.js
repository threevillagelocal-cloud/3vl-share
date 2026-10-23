/* Can AI Find Your Business? article: reveal, chat playback, scale, see/read tabs, 60-second check, form move, share. */
(function () {
  var root = document.querySelector('.aif');
  if (!root || root.__aif) return;
  root.__aif = 1;
  root.classList.add('aif-js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ga(name, p) { try { if (window.gtag) gtag('event', name, p || {}); } catch (e) {} }

  // reading progress
  var bar = root.querySelector('.aif-prog i'), tick = false;
  function prog() {
    tick = false;
    var r = root.getBoundingClientRect(), h = r.height - innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, -r.top / h)) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true });

  // reveal + one-shot triggers
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      t.classList.add('in');
      if (t.classList.contains('aif-vs')) setTimeout(function () { t.classList.add('go'); }, 400);
      if (t.dataset.chat) play(t);
      io.unobserve(t);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  [].forEach.call(root.querySelectorAll('.rv,.aif-vs,[data-chat]'), function (el) {
    if (io) io.observe(el); else { el.classList.add('in', 'go'); if (el.dataset.chat) play(el); }
  });

  // chat playback: messages appear one by one; typing dots show then disappear; loops for the hero
  function play(chat) {
    var items = [].slice.call(chat.children), i = 0;
    var toast = chat.dataset.chat === 'bot' ? root.querySelector('.aif-lead-toast') : null;
    if (reduce) { items.forEach(function (x) { if (!x.classList.contains('aif-typing')) x.classList.add('show'); else x.classList.add('gone'); }); if (toast) toast.classList.add('show'); return; }
    function step() {
      if (i >= items.length) {
        if (toast) toast.classList.add('show');
        setTimeout(function () {  // replay after a pause
          items.forEach(function (x) { x.classList.remove('show', 'gone'); });
          if (toast) toast.classList.remove('show');
          i = 0; setTimeout(step, 700);
        }, 7000);
        return;
      }
      var el = items[i++];
      el.classList.add('show');
      if (el.classList.contains('aif-typing')) {
        setTimeout(function () { el.classList.add('gone'); step(); }, 1300);
      } else setTimeout(step, el.classList.contains('aif-me') ? 900 : 1500);
    }
    setTimeout(step, 500);
  }

  // see vs read tabs
  var see = root.querySelector('.aif-see');
  [].forEach.call(root.querySelectorAll('.aif-tabs button'), function (b) {
    b.addEventListener('click', function () {
      [].forEach.call(root.querySelectorAll('.aif-tabs button'), function (x) { x.classList.toggle('on', x === b); });
      see.setAttribute('data-mode', b.dataset.see);
      ga('aif_see_toggle', { mode: b.dataset.see });
    });
  });
  // auto-flip once so readers notice the switch
  var flipped = false;
  if (io && see) new IntersectionObserver(function (es, o) {
    if (es[0].isIntersecting && !flipped) { flipped = true; o.disconnect(); setTimeout(function () { var b = root.querySelector('.aif-tabs [data-see=ai]'); if (b && see.getAttribute('data-mode') === 'tpl') b.click(); }, 3200); }
  }, { threshold: .5 }).observe(see);

  // 60-second check
  var ans = {}, n = root.querySelectorAll('.aif-q').length;
  var ring = root.querySelector('.aif-ring'), num = root.querySelector('.aif-snum b'), msg = root.querySelector('.aif-smsg');
  root.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.aif-qb button');
    if (!b) return;
    var q = b.closest('.aif-q');
    [].forEach.call(q.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    q.classList.add('done');
    ans[q.dataset.q] = +b.dataset.a;
    var keys = Object.keys(ans), yes = 0;
    keys.forEach(function (k) { yes += ans[k]; });
    num.textContent = yes;
    ring.style.strokeDashoffset = 327 - 327 * yes / n;
    if (keys.length < n) { msg.textContent = (n - keys.length) + ' to go...'; return; }
    ring.style.stroke = yes <= 2 ? '#e24c4b' : yes <= 4 ? '#f2a93b' : '#16a34a';
    msg.textContent = yes <= 2 ? 'AI probably can’t see you yet. The good news: this is fixable, and fast.'
      : yes <= 4 ? 'You’re partly visible. A competitor could pass you on the next AI answer.'
      : 'You’re ahead of most. Let’s make sure you stay there.';
    ga('aif_check_done', { score: yes });
  });

  // move the BD form (only rendered on the preview / report page) into the report card
  var form = document.querySelector('form[name="ai_report"], form#ai_report, form[data-form-name="ai_report"]');
  if (!form) {
    var forms = document.querySelectorAll('form');
    for (var k = 0; k < forms.length; k++) if (forms[k].querySelector('[name="business_name"]') && forms[k].querySelector('[name="industry"]')) { form = forms[k]; break; }
  }
  var slot = document.getElementById('aif-form-slot');
  if (form && slot) { slot.innerHTML = ''; slot.appendChild(form); }

  // share
  var sh = root.querySelector('.aif-share');
  if (sh) sh.addEventListener('click', function () {
    var data = { title: 'Can AI find your business?', text: 'How small local businesses can even the AI playing field.', url: location.href.split('#')[0] };
    ga('aif_share');
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    try { navigator.clipboard.writeText(data.url); toast('Link copied'); } catch (e) { toast(data.url); }
  });
  function toast(t) {
    var d = document.createElement('div'); d.className = 'aif-toast'; d.textContent = t; document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 2200);
  }
  [].forEach.call(root.querySelectorAll('a[href="#aif-report"]'), function (a) { a.addEventListener('click', function () { ga('aif_cta', { to: 'report' }); }); });
})();
