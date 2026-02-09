/**
 * 单进程服务器
 */
const http = require('http');

const server = http.createServer((req, res) => {
  const startTime = Date.now();
  
  // CPU 密集型计算
  let sum = 0;
  for (let i = 0; i < 500000000; i++) {
    sum += i;
  }
  
  const duration = Date.now() - startTime;
  
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`单进程响应\nPID: ${process.pid}\n计算结果: ${sum}\n耗时: ${duration}ms\n`);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`单进程服务器启动 PID: ${process.pid}, 端口: ${PORT}`);
});
