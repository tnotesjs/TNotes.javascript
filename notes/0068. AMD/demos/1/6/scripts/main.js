// ./scripts/main.js
// 加载模块
define(function (require, exports, module) {
  // 仿造 CommonJS
  const obj = require('1')
  alert(obj.multiply(10, 20)) // 200
})
