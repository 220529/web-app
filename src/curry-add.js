/**
 * 写一个 `curry` 函数，可以把其他函数转为 curry 函数
 */

function curry(fn) {
  const len = fn.length;
  let params = [];
  function calc(...args) {
    params = params.concat(args).slice(0, len);
    if (params.length === len) {
      return fn.apply(this, params);
    }
    return calc;
  }

  return calc;
}

function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

const curryAdd = curry(add);
const num = curryAdd(1)(2)(3); // 6

console.log("num", num);
