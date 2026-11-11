// Cricket Rush Service Worker - Chase Edition
const CACHE_NAME = 'cricket-rush-chase-v6.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './game.js',
  './game.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './modes/extras.js',
  './modes/commentary.js',
  './engine-v2/dist/engine.js',
  './engine-v2/assets/characters/cricketer-lowpoly.glb',
  './engine-v2/assets/characters/cricketer-lowpoly.rig.json',
  './fonts/fonts.css',
  './fonts/Barlow-500.woff2',
  './fonts/Barlow-600.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
