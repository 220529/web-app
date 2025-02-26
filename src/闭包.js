// for (let i = 0; i < 3; i++) {
//   setTimeout(function () {
//     console.log(i);
//   }, 1000);
// }

for (let i = 0; i < 3; i++) {
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 1000);
  })(i);
}

// console.log("i", i);

// function outer() {
//   var name = "John";
//   return function inner() {
//     console.log(name);
//   };
// }
// var closure = outer();
// closure();

// function createCounter() {
//   let count = 0;
//   return function() {
//     count++;
//     return count;
//   };
// }
// const counter = createCounter();
// console.log(counter()); // 1
// console.log(counter()); // 2

// function once(fn) {
//   let executed = false;
//   return function() {
//     if (!executed) {
//       executed = true;
//       fn();
//     }
//   };
// }
// const logOnce = once(() => console.log("This will only log once"));
// logOnce(); // 输出: "This will only log once"
// logOnce(); // 不输出

// const CounterModule = (function() {
//   let count = 0;

//   return {
//     increment: function() {
//       count++;
//       return count;
//     },
//     decrement: function() {
//       count--;
//       return count;
//     }
//   };
// })();

// console.log(CounterModule.increment()); // 1
// console.log(CounterModule.increment()); // 2
// console.log(CounterModule.decrement()); // 1
