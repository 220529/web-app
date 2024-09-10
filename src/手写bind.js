Function.prototype.bind1 = function () {
  const params = [...arguments];
  const fn = this;
  const _this = params[0];
  const _params = params.slice(1);
  return function () {
    const more = [...arguments];
    return fn.apply(_this, [..._params, ...more].slice(0, fn.length));
  };
};

function fn(a, b, c) {
  console.log(this, a, b, c);
}
const fn1 = fn.bind1({ x: 100 });
fn1(10, 20, 30); // {x: 100} 10 20 30
const fn2 = fn.bind1({ x: 100 }, 1, 2);
fn2(10, 20, 30); // {x: 100} 1 2 10 （注意第三个参数变成了 10）

fn(10, 20, 30); // window 10 20 30 （旧函数不变）
