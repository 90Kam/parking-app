// Service Worker dla aplikacji parkingowej
const CACHE_NAME = 'parking-app-v1';
const ASSETS = [
  '/',
  '/favicon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/global.css',
  '/build/bundle.js',
  '/build/bundle.css'
];

// Instalacja - cache'owanie zasobów
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktywacja - usuwanie starego cache'u
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Interceptowanie żądań sieciowych
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png'
    })
  );
});