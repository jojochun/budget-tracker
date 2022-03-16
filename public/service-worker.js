const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'BudgetTracker-v1';

const FILES_TO_CACHE = [
    '/',
    './index.html',
    '/css/styles.css',
    '/js/idb.js',
    '/js/index.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',

];
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
    self.skipWaiting();
})

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Deleting old cache :', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            // Clone and store response in cache
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            // Get response from cache
                            return cache.match(event.request);
                        });
                })
                .catch(err => console.log(err))
        );

        return;
    }
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request).then(function (response) {
                if (response) {
                    return response;
                } else if (event.request.headers.get('accept').includes('text/html')) {
                    // Home page is returned for html requests
                    return caches.match('/');
                }
            });
        })
    );
})