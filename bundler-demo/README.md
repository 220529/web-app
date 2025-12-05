# Webpack 打包原理

## 使用

```bash
node bundler.js       # 打包
node dist/bundle.js   # 运行
```

输出：
```
Hello, Webpack!
1 + 2 = 3
```

## 核心原理（3 步）

### 1. 解析模块
```javascript
function parseModule(filename) {
  const content = fs.readFileSync(filename, 'utf-8');
  const deps = [];
  const requireRegex = /require\(['"](.+?)['"]\)/g;
  while (match = requireRegex.exec(content)) {
    deps.push(match[1]);
  }
  return { filename, deps, code: content };
}
```

### 2. 构建依赖图
```javascript
function buildGraph(entry) {
  const queue = [parseModule(entry)];
  const graph = {};
  
  for (const module of queue) {
    module.deps.forEach(dep => {
      queue.push(parseModule(dep));  // 递归解析
    });
    graph[module.filename] = module;
  }
  return graph;
}
```

### 3. 生成 bundle
```javascript
(function(modules) {
  const cache = {};
  function require(filename) {
    if (cache[filename]) return cache[filename].exports;
    const module = { exports: {} };
    cache[filename] = module;
    modules[filename](require, module, module.exports);
    return module.exports;
  }
  require('./src/index.js');
})({
  './src/index.js': function(require, module, exports) { /* 代码 */ },
  './src/utils.js': function(require, module, exports) { /* 代码 */ }
});
```

## 原理

```
1. 从入口开始，正则匹配 require，提取依赖
2. 广度优先遍历，构建完整依赖图
3. 所有模块包装成函数，用 IIFE 创建模块系统
```

就这么简单！

