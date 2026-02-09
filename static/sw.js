const CACHE = "weather-ai-v1";

const FILES = [
  "/",
  "/static/style.css",
  "/static/script.js",
  "/static/images/default.jpg"
];

self.addEventListener("install", e => {

  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(FILES);
    })
  );

});


self.addEventListener("fetch", e => {

  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );

});