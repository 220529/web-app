const { logger } = require("./logger");

// 记录各种类型的日志
console.log("This is a log message.");
console.info("This is an info message.");
console.warn("This is a warning message.");
console.error("This is an error message.");

// 记录对象数据
const obj = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
console.log("Logging an object:", obj);

// 记录时间
console.time("Time Test");
setTimeout(() => {
  console.timeEnd("Time Test");
}, 1000);

// 模拟未捕获的异常
setTimeout(() => {
  console.log("aaa", aaa);

  throw new Error("Simulated uncaught exception");
  // 模拟未处理的 Promise 拒绝
  new Promise((_, reject) => reject("Simulated unhandled rejection"));
}, 3000);

// 模拟循环引用
const circularObj = {};
circularObj.self = circularObj;
console.log("Logging circular object:", circularObj);

// 处理异常
try {
  throw new Error("This is a test error.");
} catch (e) {
  console.error("Caught an error:", e);
}
