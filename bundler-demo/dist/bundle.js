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
  require('./src/index.js');
})({'./src/index.js': function(require, module, exports) {
      // 入口文件
const { sayHello } = require('src/utils.js');
const { add } = require('src/math.js');

console.log(sayHello('Webpack'));
console.log('1 + 2 =', add(1, 2));


    },'src/utils.js': function(require, module, exports) {
      // 工具模块
function sayHello(name) {
  return `Hello, ${name}!`;
}

module.exports = { sayHello };


    },'src/math.js': function(require, module, exports) {
      // 数学模块
function add(a, b) {
  return a + b;
}

module.exports = { add };


    },});