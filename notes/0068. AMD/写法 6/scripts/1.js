// ./scripts/1.js
define(function (require, exports, module) { // 仿造 CommonJS
  let multiply = function (x, y) {
    return x * y;
  };

  module.exports = { multiply };
});