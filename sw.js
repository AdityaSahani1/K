// Simple Service Worker - Cache files and serve offline
self.addEventListener("install", evt => {
    self.skipWaiting();
    evt.waitUntil(
        caches.open("snapsera-v1")
        .then(cache => cache.addAll([
            "/",
            "/index.php",
            "/gallery.php",
            "/about.php",
            "/contact.php",
            "/changelog.php",
            "/styles/main.css",
            "/js/main.js",
            "/assets/pwa-icons/icon-192x192.png",
            "/assets/pwa-icons/icon-512x512.png"
        ]))
        .catch(err => console.error(err))
    );
});

// Claim control instantly
self.addEventListener("activate", evt => self.clients.claim());

// Network first, fallback to cache if offline
self.addEventListener("fetch", evt => evt.respondWith(
    fetch(evt.request).catch(() => caches.match(evt.request))
));
