const testWebWorkerWithoutArrayBuffer = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 8000000; i++)
    {
        jsonAr.push(data);
    }

    let worker = new Worker("./web-worker-without-array-buffer.js");

    console.time("JSON array post message");
    worker.postMessage(jsonAr);
    console.timeEnd("JSON array post message");

    worker.onmessage = (e) => console.log("Received JSON array from web worker", e.data);
}

const testWebWorkerWithArrayBuffer = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 1000000; i++)
    {
        jsonAr.push(data);
    }

    console.time("JSON stringify in testWebWorkerWithArrayBuffer");
    let json = JSON.stringify(jsonAr);
    console.timeEnd("JSON stringify in testWebWorkerWithArrayBuffer");

    let enc = new TextEncoder(); // always utf-8
    let typedArray = Uint32Array.from(enc.encode(json));
    let worker = new Worker("./web-worker-with-array-buffer.js");

    console.time("array buffer post message from parent");
    worker.postMessage(typedArray.buffer, [typedArray.buffer]);
    console.timeEnd("array buffer post message from parent");

    worker.onmessage = (e) => console.log("Received JSON array from web worker", e.data);
}

// For backwards compatibility
if(window.Worker)
{
    testWebWorkerWithoutArrayBuffer();
    testWebWorkerWithArrayBuffer();
}



