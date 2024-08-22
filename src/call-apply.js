Function.prototype.call1 = function () {
  const params = [...arguments];
  const ctx = params[0];
  const key = Symbol();
  ctx[key] = this;
  const res = ctx[key](...params.slice(1));
  delete ctx[key];
  return res;
};
Function.prototype.apply1 = function () {
  const params = [...arguments];
  const ctx = params[0];
  const key = Symbol();
  ctx[key] = this;
  const res = ctx[key](...params.slice(1)[0]);
  delete ctx[key];
  return res;
};
function fn(a, b, c) {
  console.info(this, a, b, c);
}
fn.call1({ x: 100 }, 10, 20, 30);
fn.apply1({ x: 200 }, [100, 200, 300]);
