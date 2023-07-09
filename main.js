import bufferify from 'json-bufferify'; // Use this only if you have added type: module to package.json
import {serialize, deserialize} from 'v8';
import { Buffer } from 'node:buffer';

const dataViews = () =>
{
    // ArrayBuffer is a fixed-length raw binary data buffer that is similar to an array of integers but
    // corresponds more closely to a raw memory allocation.
    // The contents of an ArrayBuffer cannot be resized and cannot be directly manipulated.
    // To manipulate the contents of an ArrayBuffer, you need to use a DataView or one of the typed array objects like Int8Array.
    // These objects provide a layer of abstraction that allows manipulation of the bytes in the buffer in a platform-independent manner.
    // For example, you can use a DataView object to read and write the bytes in an ArrayBuffer irrespective of the platform's endianness.
    let buffer = new ArrayBuffer(16)
    let view1 = new DataView(buffer);
    let view2 = new DataView(buffer, 12, 4);

    view1.setInt8(0, 41);
    view1.setInt8(12, 42);
    view1.setInt8(13, 43);

    view2.setInt8(2, 44);
    view2.setInt8(3, 45);

    let num_from_view1 = view2.getInt8(0);
    let num_from_view2 = view2.getInt8(0);
    console.log(num_from_view2); // 42
    console.log(view1);
    console.log(view2);

    // can you pass json into array buffer? // TODO
    let json = JSON.stringify({name: "John", age: 30, city: "New York"});
    let buff = new ArrayBuffer(json);
    let view = new DataView(buff);
    console.log(view);

    let intArray = new Int32Array(buff);
    console.log("Int array: [" + intArray.toString() + "]");

}

const structuredCloning = () =>
{
    const person = {
        name: "John",
        age: 30,
        hobbies: ["reading", "cooking", "coding"],
        address: {
            street: "123 Main St",
            city: "New York",
            state: "NY"
        }
    }

    const personCloned = {...person}; // shallow copy will use array reference which means
    // if you change the array in the clone, it will change the original
    console.log("Person cloned: " + JSON.stringify(personCloned));
    personCloned.hobbies.push("running");
    console.log("Person " + JSON.stringify(person));

    // const personCloned2 = structuredClone(person); // deep copy
    // personCloned2.hobbies.push("chess");
    // Another option is to use JSON.parse(JSON.stringify(person))
    console.log("Person " + JSON.stringify(person));
}

// DO NOT USE BECAUSE OF STACK OVERFLOW
function ab2str(buf)
{
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// DO NOT USE BECAUSE OF STACK OVERFLOW
function str2ab(str)
{
    let buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    let bufView = new Uint16Array(buf);
    for (let i= 0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

const charByChar = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 700; i++)
    {
        jsonAr.push(data);
    }

    // Leads to stack overflow after 725 iterations.
    console.log(ab2str(str2ab(JSON.stringify(jsonAr))));
}

const conversion = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 800000; i++)
    {
        jsonAr.push(data);
    }

    let json = JSON.stringify(jsonAr);
    let enc = new TextEncoder(); // always utf-8
    let arr = Uint8Array.from(enc.encode(json));
    console.log(arr);
    let dec = new TextDecoder();
    let str = dec.decode(arr);
    console.log("String length is: " + str.length);
}

// https://langzhai.github.io/json-bufferify/
// Runs out of heap memory on laptop when array size is more 530000
// The downside of using the json-bufferify library is that you have to provide the schema.
const jsonBufferify = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 520000; i++)
    {
        jsonAr.push(data);
    }

    let val = bufferify.encode(0, data);
    console.log(val);
    let val2 = bufferify.decode(0, {
        name: 'string',
        age: 'number',
        birth_city: 'string',
        hobbies: ['string'],
        address: {
            street: 'string',
            city: 'string',
            state: 'string'
        }
    } , val);
    console.log(val2);

    let val3 = bufferify.encode(0, jsonAr);
    console.log(val3);
    let val4 = bufferify.decode(0, [{
        name: 'string',
        age: 'number',
        birth_city: 'string',
        hobbies: ['string'],
        address: {
            street: 'string',
            city: 'string',
            state: 'string'
        }
    }] , val3);
    console.log(val4);
}

// https://bobbyhadz.com/blog/convert-json-to-buffer-in-node-js
// Runs out of heap memory on laptop when array size is more 120,000,000
const serializeAndDeserialize = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 110000000; i++)
    {
        jsonAr.push(data);
    }

    const buf = serialize(jsonAr);
    console.log(buf);
    const objAgain = deserialize(buf);
    console.log(objAgain);
}

// https://bobbyhadz.com/blog/convert-json-to-buffer-in-node-js
// Runs out of string length on laptop when array size is more 3000000
// This method requires JSON stringify and parse which maybe slow and result in string size limit.
const bufferFrom = () =>
{
    let data = {name: "John", age: 30, birth_city: "New York", hobbies: ["reading", "cooking", "coding", "running", "chess"], address: {street: "123 Main St", city: "New York", state: "NY"}};
    let jsonAr = [];

    for(let i = 0; i < 3000000; i++)
    {
        jsonAr.push(data);
    }

    const buf = Buffer.from(JSON.stringify(jsonAr));
    console.log(buf);
    const objAgain = JSON.parse(buf.toString());
    console.log(objAgain);
}

conversion();
dataViews();
structuredCloning();
jsonBufferify();
charByChar();
serializeAndDeserialize();
bufferFrom();

