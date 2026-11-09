// Keeps CADCraft on this device so it opens without internet.
// Change VERSION whenever you upload a new CADCraft build.
const VERSION = "cadcraft-0.18.0";
const FILES = [
  "./",
  "./index.html",
  "./cadcraft-web-d875c3c223026021.js",
  "./cadcraft-web-d875c3c223026021_bg.wasm",
  "./snippets/eframe-d31a8450ea12dfc1/inline0.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // The page: try the internet first so updates arrive, fall back to the saved copy.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put("./index.html", c)); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // Everything else: the saved copy first, the internet if missing.
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
