// moduleB.js
define(function (require, exports, module) {
  console.log('moduleB.js is loaded')
  exports.doSomethingElse = function () {
    console.log('Module B is doing something else')
  }
})
