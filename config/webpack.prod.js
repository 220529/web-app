const path = require("path");
const webpack = require("webpack");
const webpackCommonConf = require("./webpack.common.js");
const { merge } = require("webpack-merge");
const { srcPath, distPath } = require("./paths");

module.exports = merge(webpackCommonConf, {
  mode: "production",
  output: {
    clean: true,
    filename: "bundle.[contenthash:8].js", // 打包代码时，加上 hash 戳
    path: distPath,
    // publicPath: 'http://cdn.abc.com'  // 修改所有静态文件 url 的前缀（如 cdn 域名），这里暂时用不到
  },
  plugins: [
    new webpack.DefinePlugin({
      // window.ENV = 'production'
      ENV: JSON.stringify("production"),
    }),
  ],
});
