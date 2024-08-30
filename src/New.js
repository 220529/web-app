/**
 * new 一个对象内部发生了什么，手写代码表示
 */

class Foo {
  constructor(name) {
    this.name = name;
    this.city = "北京";
  }
  say() {
    console.log(this.name);
  }
}
const f = new Foo("kk1");
console.log("f1", f);
f.say();

function customNew(fn, ...args) {
  const obj = {};
  obj.__proto__ = fn.prototype;
  fn.apply(obj, args);
  return obj;
}

function Foo2(name) {
  this.name = name;
  this.city = "北京";
}
Foo2.prototype.say = function () {
  console.log(this.name);
};

const f2 = customNew(Foo2, "kk");
console.log("f2", f2);

f2.say();

function customNew3(fn, ...args) {
  const obj = Object.create(fn.prototype);
  fn.apply(obj, args);
  return obj;
}

const f3 = customNew3(Foo2, "kk");
console.log("f3", f3);

f3.say();
