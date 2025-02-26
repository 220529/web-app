// class EventBus {
//   constructor() {
//     this.tasks = {};
//     this.onces = {};
//   }
//   on(key, fn) {
//     if (!this.tasks[key]) {
//       this.tasks[key] = [];
//     }
//     this.tasks[key].push(fn);
//   }
//   once(key, fn) {
//     this.onces[key] = fn;
//     this.on(key, fn);
//   }
//   emit(key, ...args) {
//     const fns = this.tasks[key];
//     fns.forEach(fn => {
//       fn.apply(null, args);
//     });
//     if (Object.keys(this.onces).includes(key)) {
//       const fns = this.tasks[key];
//       this.tasks[key] = fns.filter(i => i !== this.onces[key]);
//     }
//   }
//   off(key, fn) {
//     let fns = this.tasks[key];
//     this.tasks[key] = fns.filter(i => i !== fn);
//   }
// }

class EventBus {
  constructor() {
    this.events = [];
  }
  on(key, fn, isOnce = false) {
    if (!this.events[key]) {
      this.events[key] = [];
    }
    this.events[key].push({
      fn,
      isOnce,
    });
  }
  once(key, fn) {
    this.on(key, fn, true);
  }
  emit(key, ...args) {
    this.events[key] = this.events[key].filter(item => {
      item.fn(...args);
      return !item.isOnce;
    });
  }
  off(key, fn) {
    if (fn) {
      this.events[key] = this.events[key].filter(item => {
        return item.fn !== fn;
      });
    } else {
      delete this.events[key];
    }
  }
}
const event = new EventBus();

function fn1(a, b) {
  console.log("fn1", a, b);
}
function fn2(a, b) {
  console.log("fn2", a, b);
}
function fn3(a, b) {
  console.log("fn3", a, b);
}

event.on("key1", fn1);
event.on("key1", fn2);
event.once("key1", fn3);
// event.on("xxxxxx", fn3);

event.emit("key1", 10, 20); // 触发 fn1 fn2 fn3

event.off("key1", fn1);

// console.log("event", event.events);

event.emit("key1", 100, 200); // 触发 fn2
