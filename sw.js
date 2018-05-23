
const cacheName = 'v2';
const cacheFiles = [
    './',
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './js/dbhelper.js',
    './js/main.js',
    './js/restaurant_info.js',
]
// TODO: Add images to cacheFiles or separate image cache


self.addEventListener('install', function(event) {
    console.log('ServiceWorker installed');

    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('ServiceWorker Caching cacheFiles');
            return cache.addAll(cacheFiles);
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('ServiceWorker activated');

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {
                if(thisCacheName !== cacheName) {
                    console.log('ServiceWorker Removing caches files from ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }))
        })
    )

})
// TODO: Complete fetch event 
self.addEventListener('fetch', function(event) {
    // console.log('ServiceWorker fetching', event.request.url);

    event.respondWith(
        caches.match(event.request).then(function(response) {
            if(response) {
                console.log('serviceWorker found in cache', event.request.url);
                return response;
            }
            return fetch(event.request);
        })
    )
})