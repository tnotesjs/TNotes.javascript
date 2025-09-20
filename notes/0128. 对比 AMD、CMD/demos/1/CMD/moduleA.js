// moduleA.js
define(function (require, exports, module) {
  console.log('moduleA.js is loaded')
  exports.doSomething = function () {
    console.log('Module A is doing something')
  }
})
