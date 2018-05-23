
const cacheName = 'v2';
const cacheFiles = [
    './',
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './js/dbhelper.js',
    './js/main.js',
    './js/restaurant_info.js',
    './data/restaurants.json',
    './img/1-large.jpg',
    './img/2-large.jpg',
    './img/3-large.jpg',
    './img/4-large.jpg',
    './img/5-large.jpg',
    './img/6-large.jpg',
    './img/7-large.jpg',
    './img/8-large.jpg',
    './img/9-large.jpg',
    './img/10-large.jpg',
    './img/1-small.jpg',
    './img/2-small.jpg',
    './img/3-small.jpg',
    './img/4-small.jpg',
    './img/5-small.jpg',
    './img/6-small.jpg',
    './img/7-small.jpg',
    './img/8-small.jpg',
    './img/9-small.jpg',
    './img/10-small.jpg'
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
                // return fetch(event.request);
            }
        })
    )
})