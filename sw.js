const CACHE_NAME = 'beerdex-v1.1';

// Quando viene rilevato un nuovo file sw.js, forziamo l'installazione saltando l'attesa
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Quando il nuovo worker si attiva, puliamo le vecchie cache e prendiamo il controllo
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

// Intercettiamo le richieste di rete (per la modalità offline)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});