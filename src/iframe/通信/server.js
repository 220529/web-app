const express = require("express");
const path = require("path");

// 启动父页面的服务器 (端口 3000)
const parentApp = express();
parentApp.use(express.static(path.join(__dirname, "parent")));

parentApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/main/index.html"));
});

parentApp.listen(7100, () => {
  console.log("父页面服务器运行在 http://localhost:7100");
});

// 启动 iframe 页面服务器 (端口 4000)
const iframeA = express();
iframeA.use(express.static(path.join(__dirname, "iframe")));

iframeA.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./a/index.html"));
});

iframeA.listen(7101, () => {
  console.log("a iframe 服务器运行在 http://localhost:7101");
});

// 启动 iframe 页面服务器 (端口 4000)
const iframeB = express();
iframeB.use(express.static(path.join(__dirname, "iframe")));

iframeB.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./b/index.html"));
});

iframeB.listen(7102, () => {
  console.log("b iframe 服务器运行在 http://localhost:7102");
});
