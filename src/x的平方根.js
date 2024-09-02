/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  if (x < 2) return x;
  let l = 0;
  let r = x;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    if (m * m === x) {
      return m;
    } else if (m * m < x) {
      l = m + 1;
    } else {
      r = m - 1;
    }
  }
  return r;
};

var mySqrt2 = function (x) {
  if (x <= 1) return x;
  let n = 1;
  while (n * n <= x) {
    if (n * n === x) {
      break;
    }
    n++;
    if (n * n > x) {
      return n - 1;
    }
  }
  return n;
};

console.log(mySqrt(5));
