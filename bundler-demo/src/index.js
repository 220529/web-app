// 入口文件
const { sayHello } = require('./utils.js');
const { add } = require('./math.js');

console.log(sayHello('Webpack'));
console.log('1 + 2 =', add(1, 2));

