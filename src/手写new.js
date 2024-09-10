function Create(fn) {
  const params = [...arguments].slice(1);
  const obj = {};
  obj.__proto__ = fn.prototype;
  fn.apply(obj, params);
  return obj;
}

function F(name) {
  this.name = name;
  this.city = "北京";
}

F.prototype.say = function () {
  console.log(this.name);
};

const f = Create(F, "kk");

console.log("f", f);

f.say();
