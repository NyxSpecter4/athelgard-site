// Athelgard Service Worker — Mobile-Optimized
// Caches core assets, lazy-loads heavy assets

const CACHE_NAME = 'athelgard-v3';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/owl.svg',
  '/modules/brain.js',
  '/modules/chat.js',
  '/modules/config.js',
  '/modules/voice.js'
];

// Install: Cache core assets immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first for core, network-first for API
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API calls: network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Core assets: cache-first
  if (CORE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }
  
  // Everything else: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
