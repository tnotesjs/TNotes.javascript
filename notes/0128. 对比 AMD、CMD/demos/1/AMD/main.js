// main.js
define(['./moduleA.js', './moduleB.js'], function (moduleA, moduleB) {
  // 这段代码在所有依赖都加载并执行后才执行
  moduleA.doSomething()
  moduleB.doSomethingElse()
})
/* 
打开 index.html 之后，控制台输出结果：
Module A is doing something
Module B is doing something else
*/
