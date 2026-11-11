// Cricket Rush Service Worker - Offline Cache v4
const CACHE_NAME = 'cricket-rush-v5.2-live';
const STATIC_ASSETS = [
  './',
  './index.html',
  './game.html',
  './game.js',
  './game.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './modes/toss.js',
  './modes/bowling.js',
  './modes/match.js',
  './modes/lan.js',
  './modes/test.js',
  './modes/extras.js',
  './modes/tournament.js',
  './modes/commentary.js',
  './modes/drs.js',
  './scripts/mock-api.js',
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
      console.log('[ServiceWorker] Caching app shell & modular modes v3');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[ServiceWorker] Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[ServiceWorker] Deleting old cache:', k);
          return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bypass API and LAN requests to network (never cache LAN actions or polling events)
  if (url.pathname.includes('/api/') || url.pathname.includes('/lan/')) {
    return;
  }

  // Network-First strategy: always fetch latest code from server, fallback to cache offline
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
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
