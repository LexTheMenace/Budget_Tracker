const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open(CACHE_NAME).then(function(cache) {
      console.log("Your files were pre-cached successfully!");

     return cache.addAll([
        "/",
        "/index.html",
        "/styles.css",
        "/manifest.webmanifest",
        "/index.js",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
        "/loadBudget.js"
     ]);
   })
 );
});

self.addEventListener('fetch', function(event) {
    console.log(event.request);
 
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
   event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })); 
 });