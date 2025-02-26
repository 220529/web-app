let activeEffect = null;
const effectMap = new Map();

const tarck = (target, key) => {
  let depMap = effectMap.get(key);
  if (!depMap) {
    depMap = new Map();
    effectMap.set(target, depMap);
  }
  let deps = depMap.get(key);
  if (!deps) {
    deps = new Set();
    depMap.set(key, deps);
  }
  deps.add(activeEffect);
};

const trigger = (target, key) => {
  const depMap = effectMap.get(target);
  if (depMap) {
    const deps = depMap.get(key);
    deps?.forEach(fn => fn());
  }
};

const handler = {
  get(target, key) {
    // console.log("handler", target, key);
    tarck(target, key);
    const result = Reflect.get(...arguments);
    return typeof result === "object" ? _reactive(result) : result;
  },
  set(target, key, value) {
    if (target[key] !== value) {
      Reflect.set(...arguments);
      trigger(target, key);
    }
    return true;
  },
};

function _reactive(obj) {
  return new Proxy(obj, handler);
}
function _effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
const Vue = { reactive: _reactive, effect: _effect };

const { reactive, effect } = Vue;

let data = reactive({ message: "Hello Vue 3", obj: { a: 1 } });

// effect(() => {
//   console.log("effect.message", data.message); // 依赖收集
// });
effect(() => {
  console.log("effect.obj", data.obj); // 依赖收集
});

// data.message = "Hello World"; // 触发更新
// data.obj = { a: 1 };

// console.log("effectMap", effectMap);

// data.obj = { x: 100 };
data.obj.x = 200;
