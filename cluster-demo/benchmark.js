/**
 * 命令行性能测试工具
 * 对比单进程和多进程的性能差异
 */
const http = require('http');

// 发送单个请求
function makeRequest(port) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = http.get(`http://localhost:${port}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({ duration, data });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 并发测试
async function testConcurrent(port, count, name) {
  console.log(`\n========== ${name} ==========`);
  console.log(`端口: ${port}`);
  console.log(`并发数: ${count}`);
  console.log(`开始测试...\n`);
  
  const startTime = Date.now();
  
  // 同时发送所有请求
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(makeRequest(port));
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  // 统计
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  // 提取 PID
  const pids = new Set();
  results.forEach(r => {
    const match = r.data.match(/PID: (\d+)/);
    if (match) pids.add(match[1]);
  });
  
  console.log(`✓ 测试完成`);
  console.log(`总耗时: ${totalTime}ms`);
  console.log(`平均响应: ${avgDuration.toFixed(2)}ms`);
  console.log(`最小响应: ${minDuration}ms`);
  console.log(`最大响应: ${maxDuration}ms`);
  console.log(`处理进程数: ${pids.size} 个`);
  console.log(`进程 PID: ${Array.from(pids).join(', ')}`);
  
  return { totalTime, avgDuration, minDuration, maxDuration, pidsCount: pids.size };
}

// 对比测试
async function compare() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     Node.js 多进程性能对比测试         ║');
  console.log('╚════════════════════════════════════════╝');
  
  const concurrentCount = 16;
  
  // 测试单进程
  const singleResult = await testConcurrent(3000, concurrentCount, '单进程服务器');
  
  // 等待 2 秒
  console.log('\n等待 2 秒...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 测试多进程
  const multiResult = await testConcurrent(3001, concurrentCount, '多进程服务器');
  
  // 对比结果
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           性能对比结果                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n并发请求数: ${concurrentCount}\n`);
  
  console.log(`单进程 (端口 3000):`);
  console.log(`  总耗时: ${singleResult.totalTime}ms`);
  console.log(`  平均响应: ${singleResult.avgDuration.toFixed(2)}ms`);
  console.log(`  最大响应: ${singleResult.maxDuration}ms`);
  console.log(`  处理进程: ${singleResult.pidsCount} 个\n`);
  
  console.log(`多进程 (端口 3001):`);
  console.log(`  总耗时: ${multiResult.totalTime}ms`);
  console.log(`  平均响应: ${multiResult.avgDuration.toFixed(2)}ms`);
  console.log(`  最大响应: ${multiResult.maxDuration}ms`);
  console.log(`  处理进程: ${multiResult.pidsCount} 个\n`);
  
  const improvement = ((singleResult.totalTime - multiResult.totalTime) / singleResult.totalTime * 100).toFixed(1);
  const speedup = (singleResult.totalTime / multiResult.totalTime).toFixed(2);
  
  console.log(`性能提升:`);
  console.log(`  快了 ${improvement}%`);
  console.log(`  速度提升 ${speedup}x 倍\n`);
  
  if (parseFloat(speedup) < 1.5) {
    console.log('⚠️  性能提升不明显，可能原因：');
    console.log('   1. CPU 核心数较少');
    console.log('   2. 计算量不够大');
    console.log('   3. 系统负载较高');
  }
}

// 主函数
async function main() {
  try {
    await compare();
  } catch (err) {
    console.error('\n❌ 测试失败:', err.message);
    console.error('\n请确保：');
    console.error('  1. 单进程服务器已启动: node single-process.js');
    console.error('  2. 多进程服务器已启动: node multi-process.js');
  }
}

main();
