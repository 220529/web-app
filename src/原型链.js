const obj = {};
const arr = [];
const fn = () => {};
const str = "";
console.log("obj", obj.__proto__ === arr.__proto__.__proto__);
console.log("fn", obj.__proto__ === fn.__proto__.__proto__);

console.log("obj", obj.__proto__ === Object.prototype);
console.log("obj", obj.__proto__ === str.__proto__.__proto__);
