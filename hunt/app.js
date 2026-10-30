/* Three Village Local Scavenger Hunt: phone check-in app (built 10/30/2026).
   Lives on the BD page /hunt (wildcard: /hunt/<code> lands here too). Talks to the Google Apps Script back end (API).
   /hunt               -> how it works, my points, leaderboard, rules
   /hunt/<code>        -> check in at that sign/sticker (sign up once, then one tap)
   /hunt/<code>?place=<ADMIN_KEY> -> staff: save this spot's location */
(function () {
  var API = window.TVH_API || '';
  var root = document.getElementById('tvh');
  if (!root || root.getAttribute('data-on')) return;
  root.setAttribute('data-on', '1');
  var path = location.pathname.replace(/\/+$/, '').split('/');
  var i = path.indexOf('hunt'), code = i > -1 && path[i + 1] ? decodeURIComponent(path[i + 1]).toLowerCase() : '';
  var qs = new URLSearchParams(location.search), placeKey = qs.get('place') || '';
  var LS = { get: function (k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
             set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
             del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  function token() { return LS.get('tvh_token'); }
  function ga(n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function api(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
  }
  function view(html) { root.innerHTML = '<div class="tvh-card">' + html + '</div>'; window.scrollTo(0, Math.max(0, root.getBoundingClientRect().top + window.scrollY - 150)); }
  function spin(msg) { view('<div class="tvh-spin"></div><p class="tvh-msg">' + esc(msg) + '</p>'); }
  function locate() {
    return new Promise(function (ok) {
      if (!navigator.geolocation) return ok({ err: 'nogeo' });
      navigator.geolocation.getCurrentPosition(function (p) { ok({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }); },
        function (e) { ok({ err: e.code === 1 ? 'denied' : 'fail' }); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
    });
  }
  var STAR = '<span class="tvh-star">&#9733;</span>';

  // ---------- sign up (once) ----------
  function signup(then, placeName) {
    view((placeName ? '<p class="tvh-kick">You found ' + esc(placeName) + '!</p>' : '<p class="tvh-kick">Join the hunt</p>') +
      '<h2>One quick sign up</h2><p class="tvh-p">You only do this once on this phone. After that, every check-in is one tap.</p>' +
      '<form class="tvh-f" id="tvh-su">' +
      '<div class="tvh-row"><label>First name<input name="first" autocomplete="given-name" required></label><label>Last name<input name="last" autocomplete="family-name" required></label></div>' +
      '<label>Email<input name="email" type="email" autocomplete="email" inputmode="email" required></label>' +
      '<label>Mobile phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>' +
      '<label class="tvh-chk"><input type="checkbox" name="ok" required> I agree to the <a href="/hunt#rules" target="_blank">contest rules</a>.</label>' +
      '<button class="tvh-btn" type="submit">Email me my code</button><p class="tvh-err" id="tvh-e"></p></form>');
    var f = document.getElementById('tvh-su');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = { action: 'start', first: f.first.value, last: f.last.value, email: f.email.value, phone: f.phone.value };
      var b = f.querySelector('button'); b.disabled = true; b.textContent = 'Sending...';
      api(d).then(function (r) {
        if (r.ok) { ga('hunt_signup_start'); return otp(d, then); }
        b.disabled = false; b.textContent = 'Email me my code';
        document.getElementById('tvh-e').textContent = ({ email: 'Please check your email address.', name: 'Please add your first and last name.', phone: 'Please add a 10-digit mobile number.', wait: 'We just sent a code. Give it a minute and check your inbox (and spam).' })[r.error] || 'Something went wrong. Please try again.';
      });
    });
  }
  function otp(d, then) {
    view('<p class="tvh-kick">Check your email</p><h2>Enter your 6-digit code</h2><p class="tvh-p">We sent it to <b>' + esc(d.email) + '</b>. It can take a minute; check spam too.</p>' +
      '<form class="tvh-f" id="tvh-otp"><input class="tvh-otp" name="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" required>' +
      '<button class="tvh-btn" type="submit">Verify</button><p class="tvh-err" id="tvh-e"></p>' +
      '<p class="tvh-small"><a href="#" id="tvh-re">Send a new code</a> &middot; <a href="#" id="tvh-back">Fix my email</a></p></form>');
    var f = document.getElementById('tvh-otp');
    f.otp.focus();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var b = f.querySelector('button'); b.disabled = true; b.textContent = 'Checking...';
      api({ action: 'verify', email: d.email, otp: f.otp.value }).then(function (r) {
        if (r.ok) { LS.set('tvh_token', r.token); LS.set('tvh_first', r.player.first); ga('hunt_signup_done'); return then(); }
        b.disabled = false; b.textContent = 'Verify';
        document.getElementById('tvh-e').textContent = ({ badcode: 'That code is not right. Try again.', expired: 'That code expired. Tap "Send a new code".', tries: 'Too many tries. Tap "Send a new code".', nopending: 'Tap "Send a new code".' })[r.error] || 'Something went wrong. Please try again.';
      });
    });
    document.getElementById('tvh-re').onclick = function (e) { e.preventDefault(); api(Object.assign({}, d, { action: 'start' })).then(function (r) { document.getElementById('tvh-e').textContent = r.ok ? 'New code sent.' : r.error === 'wait' ? 'Give it a minute, then try again.' : 'Could not send. Try again.'; }); };
    document.getElementById('tvh-back').onclick = function (e) { e.preventDefault(); signup(then); };
  }

  // ---------- check in ----------
  function checkin(info) {
    spin('Finding your location...');
    locate().then(function (g) {
      if (g.err) return locErr(g.err, info);
      spin('Checking you in...');
      api({ action: 'checkin', token: token(), code: code, lat: g.lat, lng: g.lng, acc: g.acc, ua: navigator.userAgent }).then(function (r) { result(r, info); });
    });
  }
  function result(r, info) {
    var mine = r.total != null ? '<div class="tvh-tot"><b>' + r.total + '</b><span>total point' + (r.total === 1 ? '' : 's') + '</span></div><p class="tvh-p">' + r.today + ' check-in' + (r.today === 1 ? '' : 's') + ' today &middot; ' + r.spots + ' different spot' + (r.spots === 1 ? '' : 's') + ' so far</p>' : '';
    var more = '<a class="tvh-btn tvh-alt" href="/hunt">See the leaderboard</a>';
    if (r.ok) { ga('hunt_checkin', { code: code }); return view('<div class="tvh-burst">' + STAR + '</div><p class="tvh-kick">Checked in!' + (r.points > 1 ? ' Bonus day!' : '') + '</p><h2>+' + (r.points || 1) + ' point' + (r.points > 1 ? 's' : '') + ' at ' + esc(r.place) + '</h2>' + mine + '<p class="tvh-p">Keep going: every different spot you find today counts.</p>' + more); }
    if (r.error === 'already') { ga('hunt_already'); return view('<p class="tvh-kick">Already counted today</p><h2>You checked in at ' + esc(r.place) + ' today</h2><p class="tvh-p">Each spot counts once a day. Come back tomorrow, or go find another one!</p>' + mine + more); }
    if (r.error === 'far') return view('<p class="tvh-kick">Not quite there</p><h2>You need to be at ' + esc(info.name) + '</h2><p class="tvh-p">Your phone says you are about ' + (r.dist > 1000 ? (r.dist / 1609).toFixed(1) + ' miles' : Math.round(r.dist * 3.28) + ' feet') + ' away. Check-ins only count at the sign or sticker.</p><button class="tvh-btn" id="tvh-again">Try again</button>' + more, bindAgain(info));
    if (r.error === 'weakgps') return view('<p class="tvh-kick">Weak location signal</p><h2>Step near a window or outside</h2><p class="tvh-p">Your phone could not get a good fix on where you are. Turn on Wi-Fi (it helps), then try again.</p><button class="tvh-btn" id="tvh-again">Try again</button>', bindAgain(info));
    if (r.error === 'signin') { LS.del('tvh_token'); return signup(function () { checkin(info); }, info.name); }
    if (r.error === 'notplaced') return view('<p class="tvh-kick">Almost ready</p><h2>This spot is not open yet</h2><p class="tvh-p">We are still setting this one up. Try again soon!</p>' + more);
    if (r.error === 'blocked') return view('<h2>Your entry is on hold</h2><p class="tvh-p">Please email hello@threevillagelocal.com.</p>');
    view('<h2>Something went wrong</h2><p class="tvh-p">Please check your connection and try again.</p><button class="tvh-btn" id="tvh-again">Try again</button>', bindAgain(info));
  }
  function bindAgain(info) { setTimeout(function () { var b = document.getElementById('tvh-again'); if (b) b.onclick = function () { checkin(info); }; }, 0); }
  function locErr(err, info) {
    var ios = /iPhone|iPad/.test(navigator.userAgent);
    view('<p class="tvh-kick">Location needed</p><h2>Allow location to check in</h2><p class="tvh-p">Check-ins only count at the spot, so we need to see you are here. We only check it when you tap check in.</p>' +
      (err === 'denied' ? '<p class="tvh-small">' + (ios ? 'iPhone: Settings &gt; Privacy &amp; Security &gt; Location Services &gt; Safari Websites &gt; While Using. Then reload this page.' : 'Tap the lock icon next to the web address &gt; Permissions &gt; Location &gt; Allow. Then reload this page.') + '</p>' : '') +
      '<button class="tvh-btn" id="tvh-again">Try again</button>', bindAgain(info));
  }
  function startCode() {
    spin('Loading...');
    api({ action: 'code', code: code }).then(function (c) {
      if (!c.ok) return view('<h2>We could not find this code</h2><p class="tvh-p">It may be an old sign. Check the hunt page for what is live.</p><a class="tvh-btn" href="/hunt">Go to the Scavenger Hunt</a>');
      if (placeKey) return placeMode(c);
      var go = function () {
        var first = LS.get('tvh_first');
        var bx = c.bonus > 1 ? '<p class="tvh-bonus">' + STAR + ' ' + esc(c.bonusNote || (c.bonus === 2 ? 'Double' : c.bonus === 3 ? 'Triple' : c.bonus + 'x') + ' points here today!') + '</p>' : '';
        view('<p class="tvh-kick">You found it!</p><h2>' + esc(c.name) + '</h2>' + bx + (first ? '<p class="tvh-p">Hi ' + esc(first) + '! Tap below to grab your ' + (c.bonus > 1 ? c.bonus + ' points' : 'point') + '.</p>' : '') +
          '<button class="tvh-btn tvh-big" id="tvh-go">' + STAR + ' Check in here</button><p class="tvh-small">Your phone will ask to share your location. Say Allow.</p>');
        document.getElementById('tvh-go').onclick = function () { checkin(c); };
      };
      token() ? go() : signup(function () { checkin(c); }, c.name);
    });
  }
  function placeMode(c) {
    view('<p class="tvh-kick">Staff: set this spot</p><h2>' + esc(c.name) + '</h2><p class="tvh-p">Stand right where the sign or sticker is, then tap Save. Players must be within about a block of this spot.</p><button class="tvh-btn tvh-big" id="tvh-save">Save this spot</button><p class="tvh-err" id="tvh-e"></p>');
    document.getElementById('tvh-save').onclick = function () {
      var b = this; b.disabled = true; b.textContent = 'Getting location...';
      locate().then(function (g) {
        if (g.err) { b.disabled = false; b.textContent = 'Save this spot'; document.getElementById('tvh-e').textContent = 'Location is off. Allow location and try again.'; return; }
        api({ action: 'setloc', key: placeKey, code: code, lat: g.lat, lng: g.lng, acc: g.acc }).then(function (r) {
          if (r.ok) return view('<div class="tvh-burst">' + STAR + '</div><h2>Saved: ' + esc(r.name) + '</h2><p class="tvh-p">Location locked in (accurate to about ' + Math.round(r.acc * 3.28) + ' feet). This code is live.</p>');
          b.disabled = false; b.textContent = 'Save this spot';
          document.getElementById('tvh-e').textContent = r.error === 'weakgps' ? 'Signal too weak (' + Math.round(r.acc * 3.28) + ' ft). Step outside or near a window and try again.' : r.error === 'key' ? 'This staff link is not valid.' : 'Could not save. Try again.';
        });
      });
    };
  }

  // ---------- /hunt home: my points + leaderboard ----------
  function home() {
    var mine = document.getElementById('tvh-mine'), board = document.getElementById('tvh-board');
    if (mine) {
      if (token()) api({ action: 'me', token: token() }).then(function (r) {
        if (!r.ok) { LS.del('tvh_token'); return; }
        mine.innerHTML = '<div class="tvh-card tvh-me"><p class="tvh-kick">Your score, ' + esc(r.player.first) + '</p><div class="tvh-tot"><b>' + r.total + '</b><span>point' + (r.total === 1 ? '' : 's') + '</span></div><p class="tvh-p">' + r.spots + ' different spot' + (r.spots === 1 ? '' : 's') + ' &middot; ' + r.today + ' today</p></div>';
      });
    }
    if (board) api({ action: 'board' }).then(function (r) {
      if (!r.ok) { board.innerHTML = '<p class="tvh-p">Leaderboard is loading slowly. Try again in a minute.</p>'; return; }
      if (!r.board.length) { board.innerHTML = '<p class="tvh-p">No check-ins yet. Be the first on the board!</p>'; return; }
      board.innerHTML = '<ol class="tvh-lb">' + r.board.map(function (x, k) { return '<li' + (k < 3 ? ' class="tvh-top"' : '') + '><span class="tvh-rk">' + (k + 1) + '</span><span class="tvh-nm">' + esc(x.n) + '</span><b>' + x.p + '</b></li>'; }).join('') + '</ol><p class="tvh-small">' + r.players + ' players &middot; updated ' + esc(r.updated) + '</p>';
    });
  }

  // ---------- businesses: request a sign ----------
  var rb = document.getElementById('tvh-reqbtn'), rf = document.getElementById('tvh-reqf');
  if (rb && rf) {
    rb.onclick = function () { rb.hidden = true; rf.hidden = false; rf.business.focus(); ga('hunt_sign_request_open'); };
    rf.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var b = rf.querySelector('button'), e = document.getElementById('tvh-reqe');
      b.disabled = true; b.textContent = 'Sending...';
      api({ action: 'request', business: rf.business.value, contact: rf.contact.value, email: rf.email.value, phone: rf.phone.value, address: rf.address.value, notes: rf.notes.value, hp: rf.hp.value }).then(function (r) {
        if (r.ok) { ga('hunt_sign_request'); rf.outerHTML = '<div class="tvh-done">' + STAR + '<b>Thanks! Request received.</b><span>We will reach out soon to set up your sign.</span></div>'; return; }
        b.disabled = false; b.textContent = 'Send my request';
        e.textContent = r.error === 'email' ? 'Please check your email address.' : r.error === 'name' ? 'Please add your business and your name.' : 'Something went wrong. Please try again.';
      });
    });
  }

  if (code) { root.className += ' tvh-checkin'; document.documentElement.classList.add('tvh-codepage'); startCode(); }
  else home();
})();
