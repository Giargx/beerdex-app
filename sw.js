const CACHE_NAME = 'beerdex-cache-v1';

// File statici locali minimi da inserire in cache per l'avvio rapido
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installazione e caching degli asset statici locali
self.addEventListener('install', event => {
  console.log('🍻 BeerDex Service Worker: Installato');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', event => {
  console.log('🍻 BeerDex Service Worker: Attivato');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 BeerDex: Rimozione vecchia cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Gestione intelligente del Fetch (Strategia Network-First con Bypass per Firebase)
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // CRITICO: Se la richiesta va a Firebase (Database, Auth) o usa i WebSocket, BYPASSALA COMPLETAMENTE.
  // Lasciamo che se ne occupi il browser in modo nativo senza che il Service Worker metta le mani nei pacchetti.
  if (url.includes('firebase') || url.includes('firebasedatabase') || event.request.headers.get('Upgrade') === 'websocket') {
    return; // Uscendo dal fetch, il browser esegue la richiesta di rete standard incontaminata
  }

  // Per tutte le altre richieste (UI, immagini, script di TensorFlow/Tesseract/Leaflet)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se la risposta è valida, la duplichiamo nella cache per velocizzare i futuri avvii
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se l'utente è offline, prova a caricare la risorsa dalla cache
        return caches.match(event.request);
      })
  );
});