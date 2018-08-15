"use strict";var _createClass=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}!function(){function i(n){return new Promise(function(e,t){n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}})}function a(n,r,o){var a,e=new Promise(function(e,t){i(a=n[r].apply(n,o)).then(e,t)});return e.request=a,e}function e(e,n,t){t.forEach(function(t){Object.defineProperty(e.prototype,t,{get:function(){return this[n][t]},set:function(e){this[n][t]=e}})})}function t(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return a(this[n],e,arguments)})})}function n(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return this[n][e].apply(this[n],arguments)})})}function r(e,r,t,n){n.forEach(function(n){n in t.prototype&&(e.prototype[n]=function(){return e=this[r],(t=a(e,n,arguments)).then(function(e){if(e)return new s(e,t.request)});var e,t})})}function o(e){this._index=e}function s(e,t){this._cursor=e,this._request=t}function u(e){this._store=e}function l(n){this._tx=n,this.complete=new Promise(function(e,t){n.oncomplete=function(){e()},n.onerror=function(){t(n.error)},n.onabort=function(){t(n.error)}})}function c(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new l(n)}function f(e){this._db=e}e(o,"_index",["name","keyPath","multiEntry","unique"]),t(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),e(s,"_cursor",["direction","key","primaryKey","value"]),t(s,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(s.prototype[n]=function(){var t=this,e=arguments;return Promise.resolve().then(function(){return t._cursor[n].apply(t._cursor,e),i(t._request).then(function(e){if(e)return new s(e,t._request)})})})}),u.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},u.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},e(u,"_store",["name","keyPath","indexNames","autoIncrement"]),t(u,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(u,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(u,"_store",IDBObjectStore,["deleteIndex"]),l.prototype.objectStore=function(){return new u(this._tx.objectStore.apply(this._tx,arguments))},e(l,"_tx",["objectStoreNames","mode"]),n(l,"_tx",IDBTransaction,["abort"]),c.prototype.createObjectStore=function(){return new u(this._db.createObjectStore.apply(this._db,arguments))},e(c,"_db",["name","version","objectStoreNames"]),n(c,"_db",IDBDatabase,["deleteObjectStore","close"]),f.prototype.transaction=function(){return new l(this._db.transaction.apply(this._db,arguments))},e(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(a){[u,o].forEach(function(e){a in e.prototype&&(e.prototype[a.replace("open","iterate")]=function(){var e,t=(e=arguments,Array.prototype.slice.call(e)),n=t[t.length-1],r=this._store||this._index,o=r[a].apply(r,t.slice(0,-1));o.onsuccess=function(){n(o.result)}})})}),[o,u].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,n){var r=this,o=[];return new Promise(function(t){r.iterateCursor(e,function(e){e?(o.push(e.value),void 0===n||o.length!=n?e.continue():t(o)):t(o)})})})});var d={open:function(e,t,n){var r=a(indexedDB,"open",[e,t]),o=r.request;return o&&(o.onupgradeneeded=function(e){n&&n(new c(o.result,e.oldVersion,o.transaction))}),r.then(function(e){return new f(e)})},delete:function(e){return a(indexedDB,"deleteDatabase",[e])}};"undefined"!=typeof module?(module.exports=d,module.exports.default=module.exports):self.idb=d}();var dbPromise=idb.open("keyval-store",2,function(e){switch(e.oldVersion){case 0:e.createObjectStore("keyval");case 1:e.createObjectStore("objs",{keyPath:"id"})}}),DBHelper=function(){function n(){_classCallCheck(this,n)}return _createClass(n,null,[{key:"fetchRestaurants",value:function(r){fetch(n.DATABASE_URL,{method:"GET"}).then(function(e){if(e.ok)return e.json()}).then(function(n){dbPromise.then(function(e){var t=e.transaction("objs","readwrite").objectStore("objs");n.forEach(function(e){console.log("putting restaurants in idb"),t.put(e)})}),r(null,n)}).catch(function(t){dbPromise.then(function(e){console.log(""+t),e.transaction("objs","readonly").objectStore("objs").getAll().then(function(e){r(null,e)})})})}},{key:"fetchRestaurantById",value:function(r,o){n.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.find(function(e){return e.id==r});n?o(null,n):o("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(r,o){n.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});o(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,o){n.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});o(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,o,a){n.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=o&&(n=n.filter(function(e){return e.neighborhood==o})),a(null,n)}})}},{key:"fetchNeighborhoods",value:function(o){n.fetchRestaurants(function(e,n){if(e)o(e,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t});o(null,t)}})}},{key:"fetchCuisines",value:function(o){n.fetchRestaurants(function(e,n){if(e)o(e,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t});o(null,t)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurantSmall",value:function(e){return"/img/"+e.id+"-small.jpg"}},{key:"imageUrlForRestaurantLarge",value:function(e){return"/img/"+e.id+"-large.jpg"}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:n.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337/restaurants"}}]),n}(),restaurants=void 0,neighborhoods=void 0,cuisines=void 0,markers=[];"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").then(function(e){}).catch(function(e){console.log("ServiceWorker failed to register",e)}),document.addEventListener("DOMContentLoaded",function(e){fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=function(){DBHelper.fetchNeighborhoods(function(e,t){e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.neighborhoods,n=document.getElementById("neighborhoods-select");e.forEach(function(e){var t=document.createElement("option");t.innerHTML=e,t.value=e,n.append(t)})},fetchCuisines=function(){DBHelper.fetchCuisines(function(e,t){e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})},fillCuisinesHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.cuisines,n=document.getElementById("cuisines-select");e.forEach(function(e){var t=document.createElement("option");t.innerHTML=e,t.value=e,n.append(t)})},window.initMap=function(){self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()},updateRestaurants=function(){var e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),n=e.selectedIndex,r=t.selectedIndex,o=e[n].value,a=t[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(o,a,function(e,t){e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})},resetRestaurants=function(e){self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(function(e){return e.setMap(null)}),self.markers=[],self.restaurants=e},fillRestaurantsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurants,t=document.getElementById("restaurants-list");e.forEach(function(e){t.append(createRestaurantHTML(e))}),addMarkersToMap()},createRestaurantHTML=function(e){var t=document.createElement("li"),n=document.createElement("img");n.className="restaurant-img",n.setAttribute("alt","Photo of "+e.name),n.src=DBHelper.imageUrlForRestaurantSmall(e),t.append(n);var r=document.createElement("h2");r.innerHTML=e.name,t.append(r);var o=document.createElement("p");o.innerHTML=e.neighborhood,t.append(o);var a=document.createElement("p");a.innerHTML=e.address,t.append(a);var i=document.createElement("a");return i.innerHTML="View Details",i.setAttribute("aria-label","View "+e.name+" Details"),i.href=DBHelper.urlForRestaurant(e),t.append(i),t},addMarkersToMap=function(){(0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurants).forEach(function(e){var t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",function(){window.location.href=t.url}),self.markers.push(t)})};var map,restaurant=void 0;"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js").then(function(e){}).catch(function(e){console.log("ServiceWorker failed to register",e)}),window.initMap=function(){fetchRestaurantFromURL(function(e,t){e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})},fetchRestaurantFromURL=function(n){if(self.restaurant)n(null,self.restaurant);else{var e=getParameterByName("id");e?DBHelper.fetchRestaurantById(e,function(e,t){(self.restaurant=t)?(fillRestaurantHTML(),n(null,t)):console.error(e)}):(error="No restaurant id in URL",n(error,null))}},fillRestaurantHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant;document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;var t=document.getElementById("restaurant-img");t.className="restaurant-img",t.setAttribute("alt","Photo of "+e.name),400<=window.innerWidth&&(t.src=DBHelper.imageUrlForRestaurantLarge(e)),window.innerWidth<400&&(t.src=DBHelper.imageUrlForRestaurantSmall(e)),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()},fillRestaurantHoursHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.operating_hours,t=document.getElementById("restaurant-hours");for(var n in e){var r=document.createElement("tr"),o=document.createElement("td");o.innerHTML=n,r.appendChild(o);var a=document.createElement("td");a.innerHTML=e[n],r.appendChild(a),t.appendChild(r)}},fillReviewsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.reviews,t=document.getElementById("reviews-container"),n=document.createElement("h2");if(n.innerHTML="Reviews",t.appendChild(n),!e){var r=document.createElement("p");return r.innerHTML="No reviews yet!",void t.appendChild(r)}var o=document.getElementById("reviews-list");e.forEach(function(e){o.appendChild(createReviewHTML(e))}),t.appendChild(o)},createReviewHTML=function(e){var t=document.createElement("li"),n=document.createElement("p");n.className="review-name",n.innerHTML=e.name,t.appendChild(n);var r=document.createElement("p");r.innerHTML=e.date,r.className="review-date",t.appendChild(r);var o=document.createElement("p");o.innerHTML="Rating: "+e.rating,o.className="review-rating",t.appendChild(o);var a=document.createElement("p");return a.innerHTML=e.comments,t.appendChild(a),t},fillBreadcrumb=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)},getParameterByName=function(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null};var cacheName="v2",cacheFiles=["./","./index.html","./restaurant.html","./css/styles.css","./manifest.json","./all.js","./img/1-large.jpg","./img/2-large.jpg","./img/3-large.jpg","./img/4-large.jpg","./img/5-large.jpg","./img/6-large.jpg","./img/7-large.jpg","./img/8-large.jpg","./img/9-large.jpg","./img/10-large.jpg","./img/1-small.jpg","./img/2-small.jpg","./img/3-small.jpg","./img/4-small.jpg","./img/5-small.jpg","./img/6-small.jpg","./img/7-small.jpg","./img/8-small.jpg","./img/9-small.jpg","./img/10-small.jpg"];self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return e.addAll(cacheFiles)}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){return e.waitUntil(caches.keys().then(function(e){return Promise.all(e.map(function(e){if(e!==cacheName)return caches.delete(e)}))})),self.clients.claim()}),self.addEventListener("fetch",function(t){t.respondWith(caches.match(t.request).then(function(e){return e||fetch(t.request)}))});