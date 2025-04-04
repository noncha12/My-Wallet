const CACHE_NAME = 'my-wallet-cache-v1';
const urlsToCache = [
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'digital-wallet-256.png',
  'digital-wallet-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
