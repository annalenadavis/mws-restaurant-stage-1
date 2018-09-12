//Using code from jakearchibald idb promise library documentation
/**
   * Opening an object store in indexedDB for restaurants
   */
const dbPromise = idb.open('keyval-store', 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('keyval');
    case 1:
      upgradeDB.createObjectStore('objs', {keyPath: 'id'});
  }
});
/**
   * Opening an object store in indexedDB for reviews
   */
  const dbReviews = idb.open('reviews-store', 2, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
        upgradeDB.createObjectStore('reviews1');
      case 1:
        upgradeDB.createObjectStore('reviews2', {keyPath: 'id'});
    }
  });

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static get DATABASE_REVIEWS_URL() {
    const port =  1337 //Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants and store in indexedDB
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL, {method: "GET"})
    .then(response => {
      if (response.ok) {
        return response.json();
        }
      })
      .then(restaurants => {
        dbPromise.then(db => {
          const tx = db.transaction("objs", "readwrite");
          const store = tx.objectStore("objs");
          restaurants.forEach(restaurant => {
            console.log("putting restaurants in idb")
            store.put(restaurant)
            })
          });
        callback(null, restaurants);
      })
      .catch(error => {
        dbPromise.then(db => {
          console.log(`${error}`);
          const tx = db.transaction("objs", "readonly");
          const store = tx.objectStore("objs");
          store.getAll().then(allObjs => {
            callback(null, allObjs)
          })
        })
      });
  }

      /**
   * Fetch all reviews & store in indexedDB
   */
  static fetchRestaurantReviews(callback) {
    fetch(DBHelper.DATABASE_REVIEWS_URL, {method: "GET"})
    .then(response => {
      if (response.ok) {
        return response.json();
        }
      })
      .then(reviews => {
        dbReviews.then(db => {
          const tx = db.transaction("reviews2", "readwrite");
          const store = tx.objectStore("reviews2");
          reviews.forEach(review => {
            store.put(review)
            console.log("putting reviews in idb")
            })
          });
          callback(null, reviews);
      })
      .catch(error => {
        dbReviews.then(db => {
          console.log(`${error}`);
          const tx = db.transaction("reviews2", "readonly");
          const store = tx.objectStore("reviews2");
          store.getAll().then(allObjs => {
            callback(null, allObjs)
          });
        })
      })
    };

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant small image URL. Small images on main page.
   */
  static imageUrlForRestaurantSmall(restaurant) {
      return(`/img/${restaurant.id}-small.jpg`)
    }
/**
   * Restaurant large image URL.Large images on individual restaurant pages
   */
  static imageUrlForRestaurantLarge(restaurant) {
      return(`/img/${restaurant.id}-large.jpg`)
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
