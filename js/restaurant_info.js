let restaurant;
var map;

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
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.setAttribute('alt', `Photo of ${restaurant.name}`);
  if(window.innerWidth >= 400){
    image.src = DBHelper.imageUrlForRestaurantLarge(restaurant);
  }
  if(window.innerWidth < 400){
    image.src = DBHelper.imageUrlForRestaurantSmall(restaurant);
  }

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fetch reviews
  fetchReviews();
}

/**
 * Fetch all reviews and set their HTML.
 */
fetchReviews = () => {
  const id = self.restaurant.id;
  DBHelper.fetchRestaurantReviews((error, reviews) => {
    if (error) {
      callback(error, null);
    } else {
      let reviewsById = [];
      reviews.forEach(review => {
        if (id == review.restaurant_id) {
          reviewsById.push(review);
        }
      });
      self.restaurant.reviews = reviewsById;
      fillReviewsHTML();
    };
  });
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'review-name';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = 'review-date';
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const reviewForm = document.getElementById('review-form');

/**
 * Handle submit of review form
 */
function handleReviewForm(e) {
  // prevent page refresh
  e.preventDefault();
  // get input from form
  const name = document.getElementById('review-name').value;
  const rating = document.getElementById('rating').value;
  const comments = document.getElementById('comments').value;
  const ul = document.getElementById('reviews-list');
  // create object with review info
  const newReview = {
    id: + new Date(),
    restaurant_id: self.restaurant.id,
    name: name,
    createdAt: + new Date(),
    updatedAt: + new Date(),
    rating: rating,
    comments: comments
  }
  // if online load data into idb and save to server
  if(navigator.onLine){
    DBHelper.addReview(newReview);
    // TODO: new reviews aren't showing in UI- 
    // API will only return 30 reviews so need to refactor original fetch function to just grab reviews for specific restaurant, not all
  } else {
    // if offline save review into local storage
    localStorage.setItem('newReview', JSON.stringify(newReview));
    console.log('review saved to local storage')
    window.addEventListener("navigator.onLine", function(){
      localStorage.removeItem(newReview);
      DBHelper.addReview(newReview);
      console.log("back online- added review to server and idb")
    })
  }
  // show in UI  
  ul.appendChild(createReviewHTML(newReview));
  // TODO: clear form and notify user form has been submitted
};

reviewForm.addEventListener('submit', handleReviewForm);

