// bump this when you change files to force refresh
const CACHE_VERSION = "2026-09-25-1";
const CACHE_NAME = `sunmoon-chaomu-${CACHE_VERSION}`;

const CORE = [
  "/chaomu/",
  "/chaomu/index.html",
  "/chaomu/cycle/index.html",
  "/chaomu/draw/index.html",
  "/chaomu/vault/index.html",
  "/chaomu/zhaohua/index.html",
  "/chaomu/manifest.webmanifest",
  "/chaomu/icons/icon-192.png",
  "/chaomu/icons/icon-512.png",
  "/chaomu/icons/apple-touch-icon.png",
  "/chaomu/icons/favicon-32.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => (k.startsWith("sunmoon-cycle-") || k.startsWith("sunmoon-chaomu-")) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // For navigations (HTML pages): Network first, fallback to app.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/chaomu/index.html"))
    );
    return;
  }

  // For other assets: Cache first, then network, and update cache
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
