const CACHE_NAME = 'bloom-offline-maps-v1';
const TILE_URLS = [
  'https://tile.openstreetmap.org',
];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache map tile requests from OpenStreetMap
  if (url.hostname === 'tile.openstreetmap.org' && event.request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Cache successful tile responses
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached tile if fetch fails
            return cache.match(event.request);
          });
      })
    );
  }
});
