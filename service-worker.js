const CACHE_NAME = 'my-wallet-cache-v1';
const urlsToCache = [
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'icon-256.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
