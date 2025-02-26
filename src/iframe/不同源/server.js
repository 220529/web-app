const express = require("express");
const path = require("path");

// 启动父页面的服务器 (端口 3000)
const parentApp = express();
parentApp.use(express.static(path.join(__dirname, "parent")));

parentApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

parentApp.listen(3000, () => {
  console.log("父页面服务器运行在 http://localhost:3000");
});

// 启动 iframe 页面服务器 (端口 4000)
const iframeApp = express();
iframeApp.use(express.static(path.join(__dirname, "iframe")));

iframeApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "iframe.html"));
});

iframeApp.listen(4000, () => {
  console.log("iframe 服务器运行在 http://localhost:4000");
});
