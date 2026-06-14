const CACHE_NAME = 'beerdex-v1.2'; // Cambiando questo numero forzerai un aggiornamento sui telefoni

// Quando l'app vede un nuovo sw.js, forza l'installazione
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Pulisce le vecchie versioni salvate nel telefono e attiva la nuova
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    event.waitUntil(clients.claim());
});

// Intercetta il traffico dati (utile per l'offline)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});