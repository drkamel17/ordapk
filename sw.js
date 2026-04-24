const CACHE_NAME = 'dr-daoudi-v5';

// Clean ALL caches on install - start fresh
self.addEventListener('install', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        console.log('Deleting cache:', key);
        return caches.delete(key);
      }))
    ).then(() => {
      console.log('All caches cleared, skipping wait');
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Network Only for HTML pages - NEVER serve from cache
self.addEventListener('fetch', event => {
  // For navigation (HTML pages), always go to network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => {
          // Only here if completely offline
          return caches.match('/index.html');
        })
    );
    return;
  }
  
  // For other requests (JS, CSS, images) - Network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok || response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});