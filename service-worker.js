const CACHE_NAME = "wallet-cache-v1";
const urlsToCache = [
  "index.html",
  "styles.css",
  "script.js",
  "manifest.json",
  "icon-256.png",
  "icon-512.png"
];

// ติดตั้ง service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ทำงานแบบ offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// อัปเดต cache เมื่อมีเวอร์ชันใหม่
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});
