// ./scripts/main.js
// 加载模块
require(['./scripts/1.js'], function (obj) {
  // 注意模块路径的写法，写成 './1.js' 是错误的
  // 模块的导出内容会注入到函数参数中
  alert(obj.multiply(10, 20)) // 200
})
