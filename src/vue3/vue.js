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
  const deps = depMap.get(key);
  deps.forEach(fn => fn());
};

const handler = {
  get(target, key) {
    tarck(target, key);
    return Reflect.get(...arguments);
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

let data = reactive({ message: "Hello Vue 3" });

effect(() => {
  console.log("effect", data.message); // 依赖收集
});

effect(() => {
  console.log("effect2", data.message); // 依赖收集
});

data.message = "Hello World"; // 触发更新

console.log("effectMap", effectMap);
