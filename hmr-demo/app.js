// 业务代码
function render() {
  app.innerHTML = `
    <p>计数--: ${window.count || 0}</p>
    <button onclick="window.count = (window.count || 0) + 1; render()">+1</button>
  `;
}

render();

// 核心：启用热更新
module.hot.accept(() => {
  console.log('热更新');
  render(); // 重新渲染，count 状态保留
});

