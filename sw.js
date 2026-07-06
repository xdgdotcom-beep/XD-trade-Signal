const CACHE = 'xd-signal-v1';
const ASSETS = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => cached))
  );
});

// The page posts a message here whenever a strategy match fires.
// Showing the notification from the service worker (rather than `new Notification()`
// on the page) is what lets it appear even when the app is backgrounded on Android,
// and is the supported pattern on iOS installed PWAs.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SIGNAL_MATCH') {
    self.registration.showNotification(data.title || 'XD Signal', {
      body: data.body || '',
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: data.tag || 'signal',
      renotify: true,
      vibrate: [80, 40, 80],
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      if (clientsArr.length) return clientsArr[0].focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
