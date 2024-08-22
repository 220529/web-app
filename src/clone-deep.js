function cloneDeep1(origin) {
  if (typeof origin !== "object" || origin === null) {
    return origin;
  }
  if (origin instanceof Date) {
    return new Date(origin.getTime());
  }
  if (Array.isArray(origin)) {
    const arr = [];
    origin.forEach(item => {
      arr.push(cloneDeep(item));
    });
    return arr;
  }
  const obj = {};
  for (const key in origin) {
    if (origin.hasOwnProperty(key)) {
      obj[key] = cloneDeep(origin[key]);
    }
  }
  return obj;
}
function cloneDeep(origin) {
  if (typeof origin !== "object" || origin === null) {
    return origin;
  }
  const result = Array.isArray(origin) ? [] : {};
  for (const key in origin) {
    result[key] = cloneDeep(origin[key]);
  }
  return result;
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
  date: new Date(),
};
// a.self = a
const b = cloneDeep(a);
b.arr.push(5);
b.info.city = "郑州";
console.log(a);
console.log(b);
console.log(a === b);
