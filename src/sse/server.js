const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 静态文件
app.use(express.static(path.join(__dirname)));

// SSE 接口
app.get('/api/sse', (req, res) => {
  // 1. 设置响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 2. 立即发送一条消息
  res.write('data: 连接成功！\n\n');

  // 3. 每秒推送当前时间
  let count = 0;
  const timer = setInterval(() => {
    count++;
    const data = {
      time: new Date().toLocaleTimeString(),
      count: count,
      message: `这是第 ${count} 条消息`
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 1000);

  // 4. 客户端断开连接时清理
  req.on('close', () => {
    clearInterval(timer);
    console.log('客户端断开连接');
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`打开 http://localhost:${PORT}/index.html 查看效果`);
});
