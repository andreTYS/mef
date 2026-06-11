'use strict';

const CACHE_NAME = 'mef-transparencia-v1';
const STATIC_ASSETS = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/js/api.js',
  '/manifest.json',
];

// Instalar: pre-cachear assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: eliminar cachés viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first para API, Cache-first para estáticos
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // No interceptar llamadas a la API (siempre datos frescos)
  if (url.pathname.startsWith('/api/')) return;

  // Solo interceptar GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Actualizar caché en background con la versión de red
      const networkFetch = fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached); // Si falla la red, usar caché

      // Devolver caché primero si existe, sino esperar red
      return cached || networkFetch;
    })
  );
});
