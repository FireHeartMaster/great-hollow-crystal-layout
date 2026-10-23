'use strict';
const CACHE_NAME = 'great-hollow-crystals-v2';
const FILES = [
  './', './index.html', './styles.css', './app.js',
  './assets/Great_Hollow_surface_and_underground_clean.png',
  './assets/Resonating_Crystal_Purple.png',
  './assets/Resonating_Crystal_Blue.png',
  './assets/Resonating_Crystal_Red.png',
  './assets/Resonating_Crystal_Green.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Update documents and code online; fall back to the downloaded copy offline.
  // Images remain cache-first, so crystal icons and the large map load quickly.
  const isCode = event.request.mode === 'navigate' || /\.(?:html|css|js)$/.test(url.pathname);
  if (isCode) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      }).catch(async () =>
        await caches.match(event.request) ||
        (event.request.mode === 'navigate' ? await caches.match('./index.html') : Response.error())
      )
    );
  } else {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
