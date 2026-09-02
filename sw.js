// sw.js - Offline Cache Engine
const CACHE_NAME = 'obgyn-secure-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Let Firebase cloud sync communicate dynamically
  if (e.request.url.includes('firestore') || 
      e.request.url.includes('googleapis') || 
      e.request.url.includes('gstatic')) {
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
