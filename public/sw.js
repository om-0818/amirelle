/* Amirelle offline shell. Caches the desk. Never reads the closet. Never syncs. */
const CACHE = "amirelle-shell-v1";
const SHELL = ["/", "/theme-boot.js", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function shouldCache(url) {
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/")) return false;
    if (url.pathname.includes("weather") || url.pathname.includes("grill")) return false;
    return true;
  }
  return url.hostname === "images.unsplash.com";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!shouldCache(url) && req.mode !== "navigate") return;
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res.ok && shouldCache(url)) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") return caches.match("/");
          return hit;
        });
    }),
  );
});
