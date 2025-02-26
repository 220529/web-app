const arr = [1, 2, [3, 4, [100, 200], 5], 6];

const deep = arr => {
  const bool = arr.find(i => Array.isArray(i));
  if (!bool) {
    return arr;
  }
  const res = arr.reduce((prev, next) => {
    return Array.isArray(next) ? [...prev, ...deep(next)] : [...prev, next];
  }, []);
  return res;
};

const deep2 = arr => {
  const bool = arr.find(i => Array.isArray(i));
  if (!bool) {
    return arr;
  }
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (Array.isArray(item)) {
      res = res.concat(deep2(item));
    } else {
      res.push(item);
    }
  }
  return res;
};

const t = deep(arr);
const t2 = deep2(arr);
console.log("t", t);
console.log("t2", t2);
