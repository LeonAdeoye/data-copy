const indexedDB = window.indexedDB;

const indexedDBSimpleJson = () =>
{
    let jsonAr = [];
    for(let i = 0; i < 10; i++)
    {
        jsonAr.push({id: i, name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}});
    }

    let request = indexedDB.open("leon-adeoye-simple", 1);
    // check that the DB was opened successfully.
    request.onerror = (event) => console.log("Failed to open DB, error code: " + event.target.errorCode);

    request.onupgradeneeded = (event) =>
    {
        let db = event.target.result;
        // Create an objectStore to hold information about our people.
        const objectStore = db.createObjectStore("simple-store", {keyPath: "id"});
        objectStore.createIndex("id", "id", {unique: true});
        objectStore.createIndex("name", "name", {unique: false});
    }

    request.onsuccess = (event) =>
    {
        console.log("leon-adeoye-simple DB opened successfully");
        const db = event.target.result;
        // We also need to create a transaction in order to CRUD the database.
        const transaction = db.transaction(["simple-store"], "readwrite");
        // Get the object store.
        const objectStore= transaction.objectStore("simple-store");
        // Get the indexes.
        const id_index = objectStore.index("id");
        const name_index = objectStore.index("name");
        // Add the people to the DB.
        jsonAr.forEach((person) =>
        {
            const request = objectStore.put(person)
            request.onerror = (event) => console.log("Failed to add person with id: " + event.target.result);
        });

        // Different ways to get at the data - pls note all reads are ASYNC and only objects are returned so that you need to JSON.stringify them.
        const fifthPerson = objectStore.get(5);
        fifthPerson.onsuccess = (event) => console.log("Found person with id 5: " + JSON.stringify(fifthPerson.result)); // Get returns an object so that you need to convert to string.
        id_index.get(6).onsuccess = (event) => console.log("Found person with id 6: " + JSON.stringify(event.target.result));
        id_index.get(1).onsuccess = (event) => console.log("Found person with id 1: " + JSON.stringify(event.target.result));
        name_index.get("John").onsuccess = (event) => console.log("Found person with name John: " + JSON.stringify(event.target.result));

        // Get all the people in the DB.
        const all = objectStore.getAll();
        all.onsuccess = (event) => console.log("Found all people: " + JSON.stringify(event.target.result));

        transaction.oncomplete = () => db.close();
    }
};

// Use array buffers to avoid locking the main UI thread for large data sets.
const indexedDBArrayBuffer = () =>
{
    let jsonAr = [];
    for(let i = 0; i < 1000000; i++)
    {
        jsonAr.push({id: i, name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}});
    }

    let request = indexedDB.open("leon-adeoye-array", 1);
    // check that the DB was opened successfully.
    request.onerror = (event) => console.log("Failed to open DB, error code: " + event.target.errorCode);

    request.onupgradeneeded = (event) =>
    {
        let db = event.target.result;
        // Create an objectStore to hold information about our people.
        const objectStore = db.createObjectStore("array-store");
    }

    request.onsuccess = (event) =>
    {
        console.log("leon-adeoye-array DB opened successfully");
        const db = event.target.result;

        // We also need to create a transaction in order to CRUD the database.
        const transaction = db.transaction(["array-store"], "readwrite");
        // Get the object store.
        const objectStore = transaction.objectStore("array-store");
        // Add the people to the DB.
        // TODO: In your web worker you need to use an alternative method to convert the JSON to an array buffer that does not use JSON.stringify.
        let json = JSON.stringify(jsonAr);
        let enc = new TextEncoder(); // always utf-8
        let arr = Uint8Array.from(enc.encode(json));

        // Store values in the newly created objectStore.
        const request = objectStore.put(arr.buffer, "array-buffer");
        request.onsuccess = (event) =>  console.log("Array buffer data added successfully");

        const get_request = objectStore.get("array-buffer");
        get_request.onsuccess = (event) =>
        {
            let dec = new TextDecoder();
            let json = dec.decode(new Uint8Array(event.target.result));
            console.log("Found data: " + json.substring(0, 200));
        }
        transaction.oncomplete = () => db.close();
    }
};

indexedDBSimpleJson();
indexedDBArrayBuffer();
