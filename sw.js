const CACHE_NAME = 'snapsera-v1';
const urlsToCache = [
  '/',
  '/index.php',
  '/gallery.php',
  '/about.php',
  '/contact.php',
  '/profile.php',
  '/styles/main.css',
  '/styles/home.css',
  '/styles/gallery.css',
  '/styles/about.css',
  '/styles/contact.css',
  '/styles/profile.css',
  '/styles/post-modal.css',
  '/js/main.js',
  '/js/home.js',
  '/js/gallery.js',
  '/js/contact.js',
  '/js/profile.js',
  '/js/post-modal.js',
  '/assets/pwa-icons/icon-192x192.png',
  '/assets/pwa-icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        return caches.match('/index.php');
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
