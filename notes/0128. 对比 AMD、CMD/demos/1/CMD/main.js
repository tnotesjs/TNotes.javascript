// main.js
define(function (require, exports, module) {
  const r = require
  const moduleA = r('./moduleA.js')
  moduleA.doSomething()
  const moduleB = r('./moduleB.js')
  moduleB.doSomethingElse()
})
