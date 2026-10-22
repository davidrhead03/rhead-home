// Rhead Home service worker: shows notifications and keeps the app working offline.
const CACHE = 'rhead-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin || u.pathname.startsWith('/import/')) return;
  // The app itself: always try the newest copy first, fall back to the saved one offline.
  if (req.mode === 'navigate' || u.pathname === '/' || u.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put('/', c)); return r; }).catch(() => caches.match('/')));
    return;
  }
  // Bible books, maps, photos, sounds: save after the first load.
  if (/\.(json|jpg|png|mp3|js)$/.test(u.pathname) && u.pathname !== '/sw.js') {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }))));
  }
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'Rhead Home', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Rhead Home', {
    body: d.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if ('focus' in c) { c.postMessage({ type: 'open', url }); return c.focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
