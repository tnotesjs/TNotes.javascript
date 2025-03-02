// ./js/modules/module4.js
define(function (require, exports, module) {
  // 引入依赖模块（同步）
  var module2 = require('./module2');

  function show() {
    console.log('[module4]: ' + module2.msg);
  }

  exports.show = show;
  // 引入依赖模块（异步），最后执行，因为是异步的，主线的先执行完才会执行这
  require.async('./module3', function (m3) {
    console.log('异步引入依赖模块3：' + m3.API_KEY);
  });
});