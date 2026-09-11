/* Life Desk — shell cache for offline-ish PWA (static GitHub Pages) */
const CACHE = "life-desk-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const path = new URL(req.url).pathname;
            if (
              path.endsWith(".html") ||
              path.endsWith(".js") ||
              path.endsWith(".css") ||
              path.endsWith(".webmanifest") ||
              path.includes("/icons/") ||
              path.endsWith("/life-desk/") ||
              path.endsWith("/")
            ) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
          }
          return res;
        })
        .catch(() => cached || caches.match("./index.html") || caches.match("./"));
      return cached || network;
    })
  );
});
