// 乞丐版 Webpack 打包器
const fs = require('fs');
const path = require('path');

// 核心1：解析单个模块
function parseModule(filename) {
  const content = fs.readFileSync(filename, 'utf-8');
  
  // 提取依赖（简单正则匹配 require）
  const deps = [];
  const requireRegex = /require\(['"](.+?)['"]\)/g;
  let match;
  while ((match = requireRegex.exec(content)) !== null) {
    deps.push(match[1]);
  }
  
  return {
    filename,
    deps,
    code: content
  };
}

// 核心2：构建依赖图
function buildGraph(entry) {
  const entryModule = parseModule(entry);
  const queue = [entryModule];
  const graph = {};
  const visited = new Set();
  
  for (const module of queue) {
    const dirname = path.dirname(module.filename);
    
    // 处理依赖
    module.deps.forEach(depPath => {
      const absPath = path.join(dirname, depPath);
      if (!visited.has(absPath)) {
        visited.add(absPath);
        const depModule = parseModule(absPath);
        queue.push(depModule);
      }
    });
    
    graph[module.filename] = module;
  }
  
  return graph;
}

// 核心3：生成 bundle
function bundle(graph) {
  let modules = '';
  
  // 将所有模块转成字符串（规范化路径）
  Object.keys(graph).forEach(filename => {
    const mod = graph[filename];
    const normalizedPath = filename.replace(/\\/g, '/');
    const dirname = path.dirname(filename);
    
    // 替换代码中的 require 路径
    let code = mod.code;
    mod.deps.forEach(dep => {
      const absPath = path.join(dirname, dep).replace(/\\/g, '/');
      code = code.replace(`require('${dep}')`, `require('${absPath}')`);
      code = code.replace(`require("${dep}")`, `require("${absPath}")`);
    });
    
    modules += `'${normalizedPath}': function(require, module, exports) {
      ${code}
    },`;
  });
  
  // 生成最终代码
  const entryPath = Object.keys(graph)[0].replace(/\\/g, '/');
  return `
(function(modules) {
  // 模块缓存
  const cache = {};
  
  // require 函数
  function require(filename) {
    if (cache[filename]) return cache[filename].exports;
    
    const module = { exports: {} };
    cache[filename] = module;
    
    modules[filename](require, module, module.exports);
    
    return module.exports;
  }
  
  // 执行入口
  require('${entryPath}');
})({${modules}});
  `.trim();
}

// 执行打包
const graph = buildGraph('./src/index.js');
const result = bundle(graph);
fs.writeFileSync('./dist/bundle.js', result);
console.log('打包完成！查看 dist/bundle.js');

