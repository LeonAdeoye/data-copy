
onmessage = (e) =>
{
    let jsonAr = e.data;
    console.log("Received JSON array from parent:", jsonAr);

    console.time("web worker WITHOUT array buffer posting back to parent");
    postMessage(jsonAr);
    console.timeEnd("web worker WITHOUT array buffer posting back to parent");
}

