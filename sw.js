// sw.js — Athelgard Service Worker
// Caches core assets for offline PWA support

const CACHE_NAME = 'athelgard-v1';
const STATIC_ASSETS = [
  '/',
  '/frontend/index.html',
  '/modules/brain.js',
  '/modules/config.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Athelgard v1...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Athelgard v1...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network first, fallback to offline message
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline — Athelgard needs connection' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache new static assets
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for messages sent while offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'athelgard-sync') {
    console.log('[SW] Background sync triggered');
  }
});

// Push notifications (future)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Athelgard', {
      body: data.body || 'Mission update available',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'default',
      requireInteraction: false
    })
  );
});
