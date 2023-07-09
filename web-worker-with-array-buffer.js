
onmessage = (e) =>
{
    let jsonAr = e.data;
    console.log("Received array buffer from parent:", jsonAr);

    console.time("web worker with array buffer posting back to parent without array buffer");
    postMessage(jsonAr);
    console.timeEnd("web worker with array buffer posting back to parent without array buffer");

    console.time("JSON stringify in web worker with array buffer");
    let json = JSON.stringify(jsonAr);
    console.timeEnd("JSON stringify in web worker with array buffer");

    let enc = new TextEncoder(); // always utf-8
    let typedArray = Uint32Array.from(enc.encode(json));

    console.time("array buffer post message from web worker with array buffer");
    postMessage(typedArray.buffer, [typedArray.buffer]);
    console.timeEnd("array buffer post message from web worker with array buffer");
}

