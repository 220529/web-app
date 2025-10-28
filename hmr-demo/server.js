const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const clients = new Set();

// 静态文件服务
const server = http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  file = path.join(__dirname, file.split('?')[0]);
  const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css'};
  
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404) && res.end('404');
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'text/plain'});
    res.end(data);
  });
});

// WebSocket
new WebSocket.Server({ server }).on('connection', ws => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// 核心：监听文件变化
['app.js', 'style.css'].forEach(file => {
  fs.watch(path.join(__dirname, file), () => {
    fs.readFile(path.join(__dirname, file), 'utf-8', (err, content) => {
      if (err) return;
      clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify({ file, content })));
    });
  });
});

server.listen(3000, () => console.log('http://localhost:3000'));

