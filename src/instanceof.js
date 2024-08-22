/**
 * instanceof 的原理是什么，请用代码来表示
 */

function myInstanceof(instance, origin) {
  if (typeof instance !== "object" && typeof instance !== "function") {
    return false;
  }
  let proro = instance.__proto__;
  while (proro) {
    if (proro === origin.prototype) {
      return true;
    }
    proro = proro.__proto__;
  }
  return false;
}

// 功能测试
console.info(myInstanceof({}, Object));
console.info(myInstanceof([], Object));
console.info(myInstanceof([], Array));
console.info(myInstanceof({}, Array));
console.info(myInstanceof("abc", String));
