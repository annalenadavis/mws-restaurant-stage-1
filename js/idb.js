// //Lessons learned?
// //Cannot use asynchronous functions within indexedDB event handlers
// //Try to change order: fetch-connect-store instead of connect-fetch-store?

//with the "let data" below, I can console.log out the data, 
//but with the storeRestaurantData() function the response is undefined. 


//Using code from jakearchibald idb promise library documentation
const dbPromise = idb.open('keyval-store', 2, upgradeDB => {
    switch (upgradeDB.oldVersion) {
      case 0:
        upgradeDB.createObjectStore('keyval');
      case 1:
        upgradeDB.createObjectStore('objs', {keyPath: 'id'});
    }
  });

// let data = fetch(DBHelper.DATABASE_URL, {method: "GET"})
//             .then(response => {return response.json()})
//             .then(data => console.log(data));

function storeRestaurantData() {
        fetch(DBHelper.DATABASE_URL, {method: "GET"})
        .then(response => {
            return response.json()
        })
        .then(restaurants => {
            const tx = db.transaction('objs', 'readwrite');
            tx.objectStore('objs').put(restaurants)
            return tx.complete;
        })
        .catch(error => {
            (`Storing restaurant data failed. Returned ${error}`);
        })
        console.log(response);
}

//   dbPromise.then(db => {
//     const tx = db.transaction('objs', 'readwrite');
//     tx.objectStore('objs').put(
//         storeRestaurantData()
//     );
//     return tx.complete;
//   });

  dbPromise.then(db => {
    return db.transaction('objs')
      .objectStore('objs').getAll();
  }).then(allObjs => console.log(allObjs));