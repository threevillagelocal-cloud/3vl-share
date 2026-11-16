/* 3VL member dashboard service worker. Scope: live/md/v/ (each member's private page lives here).
   HTML: network first so numbers are always fresh, cached copy when offline. CSS/JS/icons: cache first. Push: not yet (structure only). */
var CACHE = 'md-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  if (r.mode === 'navigate' || (r.headers.get('accept') || '').indexOf('text/html') > -1) {
    e.respondWith(fetch(r).then(function (res) { var c = res.clone(); caches.open(CACHE).then(function (ca) { ca.put(r, c); }); return res; })
      .catch(function () { return caches.match(r); }));
    return;
  }
  if (/\.(css|js|png|webp|jpg|webmanifest)(\?|$)/.test(r.url)) {
    e.respondWith(caches.match(r).then(function (hit) {
      return hit || fetch(r).then(function (res) { var c = res.clone(); caches.open(CACHE).then(function (ca) { ca.put(r, c); }); return res; });
    }));
  }
});
/* ready for later: self.addEventListener('push', ...) */
