const throttle = (fn, timeout = 100) => {
  let start = 0;
  return function (...e) {
    const nowTime = Date.now();
    if (nowTime - start > timeout) {
      start = nowTime;
      fn.apply(this, e);
    }
  };
};
const div1 = document.getElementById("draggable");
div1.addEventListener(
  "drag",
  throttle(function (e) {
    console.log("鼠标的位置", e.offsetX, e.offsetY, this);
  })
);
