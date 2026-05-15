const CACHE_NAME = "unilife-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/login.html",
  "/register.html",
  "/forgot-password.html",
  "/reset-password.html",
  "/style.css",
  "/style2.css",
  "/dashboard.js",
  "/auth.js",
  "/manifest.json",
  "/logo.png.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    fetch(event.request)

      .then((response) => {

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })

      .catch(() => {
        return caches.match(event.request);
      })
  );
});

