Function.prototype.call1 = function () {
  const params = [...arguments];
  const fn = this;
  const obj = params[0];
  const key = Symbol();
  obj[key] = fn;
  const res = obj[key](params.slice(1));
  delete obj[key];
  return res;
};
function fn(a, b, c) {
  console.info(this, a, b, c);
}
fn.call1({ x: 100 }, 10, 20, 30);
