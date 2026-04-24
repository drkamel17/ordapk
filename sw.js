const CACHE_NAME = 'dr-daoudi-v3';

// فقط الملفات الثابتة (لا تضع index.html هنا)
const STATIC_ASSETS = [
  '/score/index.html',
  '/medicamentdz/index.html',
  '/ordonnance-type/ord_type.html',
  '/conduite/index.html',
  '/styles.css',     // إذا عندك
  '/app.js',         // إذا عندك
  '/icons/icon-192.png' // مثال
];

// 🔹 INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// 🔹 ACTIVATE (حذف الكاش القديم)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 FETCH
self.addEventListener('fetch', event => {

  // 🟢 الصفحات HTML → Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone()); // تحديث الكاش
            return response;
          });
        })
        .catch(() => caches.match(event.request)) // fallback offline
    );
    return;
  }

  // 🔵 باقي الملفات → Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        });
      })
  );
});