// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called budget_tracker' and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    //save a reference to the database
    const db = event.target.result;
    // create an object store (table) called `new_transaction`
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {
    // when db is successfully created with its object store
    db = event.target.result;
    // check if app is online
    if (navigator.onLine) {
        uploadNewTransaction();
    }
}

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
}

// if there's no internet connection, saveRecord
function saveRecord(record) {
    // open a new transaction with the database with read and write permission
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore('new_transaction');
    transactionObjectStore.add(record);
}

function uploadNewTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    const getAll = transactionObjectStore.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw Error(serverResponse)
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    transactionObjectStore.clear();
                    alert('transation has been sunmitted');
                })
                .catch(err => { console.log(err); })
        }
    }
}

window.addEventListener('online', uploadNewTransaction);