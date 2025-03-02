// ./scripts/main.js
// 加载模块
require(['1'], function (obj) {
  // 模块的导出内容会注入到函数参数中
  alert(obj.multiply(10, 20)); // 200
});