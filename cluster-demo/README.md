# Node.js 多进程 Demo

演示 Node.js 单进程 vs 多进程的性能差异。

## 文件说明

```
cluster-demo/
├── single-process.js   # 单进程服务器（端口 3000）
├── multi-process.js    # 多进程服务器（端口 3001）
├── benchmark.js        # 性能测试工具
└── README.md
```

## 快速开始

```bash
cd web-app/cluster-demo

# 终端 1：启动单进程
node single-process.js

# 终端 2：启动多进程
node multi-process.js

# 终端 3：运行测试
node benchmark.js
```

## 核心概念

### 单进程
```
┌─────────────────┐
│  Node.js 进程   │  ← 1 个进程，1 个 CPU 核心
│   PID: 12345    │
│  HTTP 服务器    │
└─────────────────┘
```

### 多进程
```
┌──────────────────────────────────────┐
│         Master 进程（主进程）          │
│           PID: 12345                 │
└──────────────────────────────────────┘
           │
           ├─────────┬─────────┬─────────┐
           ↓         ↓         ↓         ↓
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Worker 1 │ │ Worker 2 │ │ Worker 3 │ │ Worker N │
    │PID:12346 │ │PID:12347 │ │PID:12348 │ │PID:12349 │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
```
- N+1 个进程（1 主进程 + N 工作进程，N = CPU 核心数）
- 所有工作进程监听同一端口
- 操作系统自动分配请求

## 关键代码

### 单进程
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // CPU 密集型计算
  let sum = 0;
  for (let i = 0; i < 500000000; i++) {
    sum += i;
  }
  res.end(`PID: ${process.pid}`);
});

server.listen(3000);
```

### 多进程
```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  // 主进程：创建 N 个工作进程
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 工作进程：创建服务器
  const server = http.createServer((req, res) => {
    // CPU 密集型计算
    let sum = 0;
    for (let i = 0; i < 500000000; i++) {
      sum += i;
    }
    res.end(`Worker PID: ${process.pid}`);
  });
  server.listen(3001);
}
```

## 核心机制

### cluster.fork()
```javascript
cluster.fork();  // 创建子进程
```
- 复制当前代码，创建新的 Node.js 进程
- 通过 `cluster.isPrimary` 判断主进程或工作进程

### 端口共享
```javascript
server.listen(3001);  // 所有工作进程监听同一端口
```
- 操作系统的 `SO_REUSEPORT` 特性
- 自动负载均衡

### 自动重启
```javascript
cluster.on('exit', (worker) => {
  cluster.fork();  // 进程崩溃自动重启
});
```

## 与 Egg.js 的关系

Egg.js 内置了 cluster 封装：
```bash
npm run dev    # 开发：1 个进程
npm start      # 生产：N 个进程（N = CPU 核心数）
```

## 总结

- **单进程**: 1 个进程，1 个 CPU 核心
- **多进程**: N 个进程，N 个 CPU 核心
- **目的**: 充分利用多核 CPU，提高吞吐量
