function cloneDeep(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  const res = Array.isArray(obj) ? [] : {};
  if (Array.isArray(obj)) {
    obj.forEach(i => {
      res.push(cloneDeep(i));
    });
  }
  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      res[i] = cloneDeep(obj[i]);
    }
  }
  return res;
}

const a = {
  // set: new Set([10, 20, 30]),
  // map: new Map([['x', 10], ['y', 20]]),
  a: 1,
  b: null,
  c: undefined,
  arr: [1, 2, 3, 4],
  info: {
    city: "北京",
  },
  fn: () => {
    console.info(100);
  },
  //   date: new Date(),
};
// a.self = a
const b = cloneDeep(a);
b.arr.push(5);
b.info.city = "郑州";
console.log(a);
console.log(b);
console.log(a === b);
