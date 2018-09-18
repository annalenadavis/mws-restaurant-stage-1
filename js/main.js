

let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Register Service Worker
 */
if('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function(registration) {
      // console.log("ServiceWorker registered", registration);
    })
    .catch(function(error) {
      console.log("ServiceWorker failed to register", error);
    });
  }

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoodsAndCuisines();
});

/**
 * Fetch all neighborhoods and cuisines and set their HTML
 */
fetchNeighborhoodsAndCuisines = () => {
  DBHelper.fetchNeighborhoodsAndCuisines((error, neighborhoods, cuisines) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      self.cuisines = cuisines;
      fillNeighborhoodsHTML();
      fillCuisinesHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  updateFavoritesUI();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('alt', `Photo of ${restaurant.name}`);
  image.src = DBHelper.imageUrlForRestaurantSmall(restaurant);
  li.append(image);

  const favorite = document.createElement('button');
  favorite.innerHTML = "♥";
  favorite.setAttribute('aria-label', `Add ${restaurant.name} to your favorites`);
  favorite.className = "favorite-button";
  favorite.id = "favorite-" + restaurant.id;
  li.append(favorite);
  favorite.onclick = e => (handleClick(e));

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', `View ${restaurant.name} Details`)
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
/**
 * Update favorite button hearts after page loads
 */
function updateFavoritesUI() {
  favorites.forEach(id => {
    let favoriteBtnId = 'favorite-' + id;
    let favoriteBtn = document.getElementById(favoriteBtnId)
    favoriteBtn.classList.add('favorite');
    favoriteBtn.setAttribute('aria-label', `remove as favorite`);
  })
}
/**
 * Handle click of a favorite heart on a restaurant
 */
const handleClick = (e) => {
  const btn = document.getElementById(e.target.id);
  const id = (e.target.id).slice(9);
  console.log(btn);
    if (btn.classList.contains('favorite')){
      btn.classList.remove('favorite');
      btn.setAttribute('aria-label', `add as favorite`);
    } else {
      btn.classList.add('favorite');
      btn.setAttribute('aria-label', `remove as favorite`);
    }
  DBHelper.updateFavorites(id);
}
