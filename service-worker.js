const CACHE_NAME = "unilife-v2";
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
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css.map"
];

// Installation du service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn("Erreur lors du cache:", err);
        // Continuer même si certains fichiers échouent
        return cache.addAll(urlsToCache.filter((url) => !url.includes("https://")));
      });
    })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== "GET") {
    return;
  }

  // Stratégie: cache first, fallback to network
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Si trouvé en cache, retourner
        if (response) {
          return response;
        }

        // Sinon, récupérer du réseau
        return fetch(event.request)
          .then((response) => {
            // Ne mettre en cache que les réponses valides
            if (!response || response.status !== 200 || response.type === "error") {
              return response;
            }

            // Cloner la réponse
            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Si réseau échoue, afficher une page offline
            return new Response(
              "<h1>Mode hors ligne</h1><p>Vérifiez votre connexion internet</p>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            );
          });
      })
  );
});

