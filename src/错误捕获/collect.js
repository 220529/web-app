// 上报数据源
var REMOTE = {
  server: "http://localhost:16800/monitor/collect.gif",
};
function imgGET(params) {
  var _img = new Image();
  _img.src = REMOTE.server + "?" + new URLSearchParams(params).toString();
}
