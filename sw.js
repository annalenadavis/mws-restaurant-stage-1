//=========Set up the indexedDB in the broswer===========
let restaurantDB;
const request = indexedDB.open("restaurantDB", 1);

request.onerror = function(event) {
    // Handle errors.
    console.log("Database error: " + event.target.errorCode);
};

//Create an object store for restaurant data
request.onupgradeneeded = function(event) {
    restaurantDB = event.target.result;
    //create an objectStore for restaurant data
    const objectStore = restaurantDB.createObjectStore("restaurants", {keyPath : "id" });
    addRestaurantData();
    //create index to search by id, name, neighborhood, or cuisine type
    objectStore.createIndex("id", "id");
    objectStore.createIndex("restaurant", "name");
    objectStore.createIndex("neighborhood", "neighborhood");
    objectStore.createIndex("cuisine", "cuisine_type");
}

//TODO: either get the transaction to work to add the data to the indexedDB
//OR import the idb promise library and use that instead


//TODO: add restaurant data to indexedDB objectStore
function addRestaurantData() {
    console.log("running");
    indexedDB(restaurantsDB).transaction(["restaurants"], "readwrite")
    .then(function(transaction) {
        DBHelper.fetchRestaurantById().forEach(function(restaurant) {
            objectStore.add(restaurant);
        });
    })
}



//============Set up the Service Worker==============
const cacheName = 'v2';
const cacheFiles = [
    './',
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './js/dbhelper.js',
    './js/main.js',
    './js/restaurant_info.js',
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
    './img/10-small.jpg',
]

self.addEventListener('install', function(event) {
    // console.log('ServiceWorker installed');

    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            // console.log('ServiceWorker Caching cacheFiles');
            return cache.addAll(cacheFiles);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    // console.log('ServiceWorker activated');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(thisCacheName => {
                if(thisCacheName !== cacheName) {
                    // console.log('ServiceWorker Removing cache files from ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        }));
        return self.clients.claim();
})

self.addEventListener('fetch', function(event) {
    //    console.log('ServiceWorker fetching', event.request.url);

      event.respondWith(
        caches.match(event.request)
        .then(function(response) {
          return response || fetch(event.request);
          })
        );


    }); //end fetch event
    
