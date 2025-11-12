// Service Worker for MediMinder
const CACHE_NAME = 'mediminder-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    const text = event.data ? event.data.text() : '';
    data = { title: 'MediMinder', body: text || 'Czas na dawkę leku' };
  }

  const title = data.title || 'MediMinder';
  const options = {
    body: data.body || 'Czas na dawkę leku',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'medication-reminder',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Otwórz aplikację' },
      { action: 'close', title: 'Zamknij' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

