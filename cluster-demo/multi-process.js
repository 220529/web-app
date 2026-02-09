/**
 * 多进程服务器
 */
const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length;
const PORT = 3001;

if (cluster.isPrimary) {
  console.log(`主进程启动 PID: ${process.pid}, CPU 核心数: ${numCPUs}`);
  
  // 为每个 CPU 核心创建一个工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // 工作进程退出时自动重启
  cluster.on('exit', (worker) => {
    console.log(`工作进程 ${worker.process.pid} 退出，重启中...`);
    cluster.fork();
  });
  
} else {
  const server = http.createServer((req, res) => {
    const startTime = Date.now();
    
    // CPU 密集型计算
    let sum = 0;
    for (let i = 0; i < 500000000; i++) {
      sum += i;
    }
    
    const duration = Date.now() - startTime;
    
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`多进程响应\nWorker PID: ${process.pid}\n计算结果: ${sum}\n耗时: ${duration}ms\n`);
  });
  
  server.listen(PORT, () => {
    console.log(`工作进程 ${process.pid} 启动，监听端口 ${PORT}`);
  });
}
