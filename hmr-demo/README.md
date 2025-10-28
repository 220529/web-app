# 热更新核心原理

3 步实现 Webpack HMR 核心逻辑

## 启动

```bash
node server.js
# 访问 http://localhost:3000
```

## 核心代码

### 1. 服务端监听（server.js）
```javascript
fs.watch('app.js', () => {
  const content = fs.readFileSync('app.js', 'utf-8');
  ws.send(JSON.stringify({ file: 'app.js', content }));
});
```

### 2. 客户端替换（hmr-runtime.js）
```javascript
ws.onmessage = (e) => {
  const { file, content } = JSON.parse(e.data);
  
  // JS: 重新加载
  const script = document.createElement('script');
  script.src = `/${file}?t=${Date.now()}`;
  
  // CSS: 直接替换
  style.textContent = content;
};
```

### 3. 业务代码（app.js）
```javascript
module.hot.accept(() => {
  render(); // 重新渲染，状态保留
});
```

## 测试

1. 点击按钮计数到 5
2. 修改 `app.js` 保存
3. 页面更新，但计数还是 5（状态保留）

## 原理

```
文件变化 → WebSocket 推送 → 动态替换模块
```

就这么简单！

