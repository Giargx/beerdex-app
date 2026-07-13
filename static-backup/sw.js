const CACHE_NAME = 'beerdex-v2.3'; // ⬅️ CAMBIA QUESTO NUMERO OGNI VOLTA CHE MODIFICHI IL SITO

self.addEventListener('install', event => {
    self.skipWaiting(); // Forza l'installazione del nuovo codice
});

self.addEventListener('activate', event => {
    // Pulisce le vecchie versioni salvate nel telefono
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

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});