// HMR 运行时
(function() {
  const ws = new WebSocket('ws://localhost:3000');
  const callbacks = {};

  ws.onopen = () => document.getElementById('status').textContent = '已连接';

  // 核心：接收更新并替换模块
  ws.onmessage = (e) => {
    const { file, content } = JSON.parse(e.data);

    if (file.endsWith('.js')) {
      const script = document.createElement('script');
      script.src = `/${file}?t=${Date.now()}`;
      script.onload = () => callbacks[file]?.();
      document.body.appendChild(script);
    } else if (file.endsWith('.css')) {
      let style = document.querySelector(`style[data-file="${file}"]`);
      if (!style) {
        style = document.createElement('style');
        style.dataset.file = file;
        document.head.appendChild(style);
      }
      style.textContent = content;
    }
  };

  // 暴露 API
  window.module = {
    hot: {
      accept(cb) {
        const name = document.currentScript?.src.split('/').pop().split('?')[0];
        if (name) callbacks[name] = cb;
      }
    }
  };
})();

