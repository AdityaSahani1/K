const CACHE_NAME = 'snapsera-v5';
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
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Never cache API requests, user data, or dynamic content
  const skipCache = url.pathname.startsWith('/api/') ||
                    url.pathname.includes('profile') ||
                    url.pathname.includes('admin') ||
                    url.search !== '';

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Always return fresh network response
        if (!response || response.status !== 200 || response.type !== 'basic' || skipCache) {
          return response;
        }

        // Only cache static assets when online
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Only use cache as fallback when offline
        if (skipCache) {
          return new Response('Offline - this content requires an internet connection', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/index.php');
          });
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
  return self.clients.claim();
});
