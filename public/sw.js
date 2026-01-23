/* Minimal Service Worker (offline "quando possível")
   Objetivo: manter o app abrindo mesmo se a rede cair.
   Regras: não bloquear, não ser crítico, não quebrar se falhar. */

const CACHE_NAME = "zairix-cache-v2"; // bumped to invalidate old caches and force clients to fetch the new build

// Mantém pequeno para evitar bugs; o Next já tem seus próprios chunks.
const CORE_ASSETS = ["/", "/app", "/acquire", "/manifest.webmanifest", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      } catch {}
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Só controla GET e só do mesmo origin.
  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Estratégia: network-first para HTML, cache-first para o resto.
  const isHtml = req.headers.get("accept")?.includes("text/html");

  if (isHtml) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || caches.match("/app") || new Response("Offline", { status: 200, headers: { "content-type": "text/plain" } });
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone()).catch(() => undefined);
        return fresh;
      } catch {
        return cached || new Response("", { status: 200 });
      }
    })()
  );
});

