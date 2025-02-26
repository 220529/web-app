const cluster = require("cluster");
const http = require("http");
const os = require("os");

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  console.log(`主进程 ${process.pid} 正在运行`);

  // 启动多个工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 当工作进程退出时，重启新的工作进程
  cluster.on("exit", (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出 (code: ${code}, signal: ${signal})`);
    console.log("正在启动新的工作进程...");
    cluster.fork();
  });
} else {
  // 每个工作进程创建一个HTTP服务器
  http
    .createServer((req, res) => {
      // 记录日志：请求的 URL 和处理请求的进程 ID
      console.log(`进程 ${process.pid} 处理了请求: ${req.url}`);

      if (req.url === "/test") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`你好，世界！这是由进程 ${process.pid} 处理的请求\n`);
      } else if (req.url === "/kill") {
        // 手动终止当前进程
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`进程 ${process.pid} 即将终止...\n`);
        console.log(`进程 ${process.pid} 即将终止...`);
        process.exit();
      } else {
        res.writeHead(404);
        res.end("页面未找到");
      }
    })
    .listen(8000);

  console.log(`工作进程 ${process.pid} 已启动并监听端口 8000`);
}
