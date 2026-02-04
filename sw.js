const CACHE_NAME = "rv-fit-v9"; // subir versión para forzar update

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",

  "./splash.png",

  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",

  // iPhone 16 Pro startup images
  "./splash-iphone16pro-portrait-1206x2622.png",
  "./splash-iphone16pro-landscape-2622x1206.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        FILES_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.warn("No se pudo cachear:", url);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request)
        .then(networkResponse => {
          // Guarda copia en cache dinámico
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
