const fs = require('fs');
const path = require('path');

const inputFilePath = './paths.txt';
const outputFilePath = path.join(path.dirname(inputFilePath), 'filtered_paths.txt');

console.log("读取文件:", inputFilePath);
const content = fs.readFileSync(inputFilePath, 'utf-8');

// 正则匹配：/public/upload/file/数字/...（支持查询参数，如 ?x-oss-process=image/resize）
const pathPattern = /\/public\/upload\/file\/\d+(?:\/\d+)*\/[^'"`\s\r\n>,;\)]+(?:\?[^'"`\s\r\n>,;\)]*)?/g;
const rawMatches = content.match(pathPattern) || [];

// 过滤无效路径（如 `${type}` 或纯目录）
const validPaths = rawMatches.filter(filePath => {
  return (
    !filePath.includes('${') &&           // 排除 `${variable}`
    /\.[a-zA-Z0-9]+(?:\?|$)/.test(filePath) // 必须有文件扩展名（如 .jpg? 或 .jpg）
  );
});

// 去重
const uniquePaths = [...new Set(validPaths)];

// 写入结果（每行一个路径）
fs.writeFileSync(outputFilePath, uniquePaths.join('\n'));

console.log(`
✅ 完成！
原始匹配数: ${rawMatches.length}
有效路径数: ${validPaths.length}
去重后路径数: ${uniquePaths.length}
结果已保存至: ${outputFilePath}
`);