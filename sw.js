self.addEventListener('install', () => {
  console.log('BeerDex PWA installed');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
