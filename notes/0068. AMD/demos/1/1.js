// ./1.js
define(function () {
  let multiply = function (x, y) {
    return x * y;
  };

  // return 的内容即为导出的内容
  return {
    multiply,
  };
});