const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { srcPath, tamplatePath } = require("./paths");

module.exports = {
  entry: path.join(srcPath, "index"),
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(tamplatePath, "index.html"),
      filename: "index.html",
    }),
  ],
};
