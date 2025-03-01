import { unstable_scheduleCallback } from "./Schedule.js";

console.log("unstable_scheduleCallback...");

// 模拟函数的执行
const sleep = delay => {
  for (let start = Date.now(); Date.now() - start <= delay; ) {}
};

unstable_scheduleCallback(3, () => {
  console.log(1);
});

unstable_scheduleCallback(
  3,
  () => {
    console.log(2);
    sleep(10);
  },
  {
    delay: 10,
  }
);

unstable_scheduleCallback(
  3,
  () => {
    console.log(3);
  },
  {
    delay: 10,
  }
);

unstable_scheduleCallback(3, () => {
  console.log(4);
  sleep(10);
});

unstable_scheduleCallback(3, () => {
  console.log(5);
});
