let db;
// Let us open our database
const request = indexedDB.open("budget", 1);
// if this version < current verion, update
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    console.log(request.result);
    db.createObjectStore("transactions", { autoIncrement: true });
};

request.onsuccess = function () {
    //check if you are online
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("There has been an error with retrieving your data: " + event.target.errorCode);
};


const transaction = db.transaction(["transactions"], "readwrite");
const store = transaction.objectStore("transactions");


function saveRecord(record) { 
    store.add(record);
}

function checkDatabase() {
    const fetchAll = store.getAll();

    fetchAll.onsuccess = function () {
        if (fetchAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(fetchAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["transactions"], "readwrite");
                    const store = transaction.objectStore("transactions");
                    // CLear the store
                    store.clear();
                });
        }
    };
}
//Event listener check DB when app online
window.addEventListener("online", checkDatabase);