// moduleA.js
define(function () {
  // console.log('moduleA.js is loaded')
  const doSomething = function () {
    console.log('Module A is doing something')
  }

  // return 的内容即为导出的内容
  return {
    doSomething,
  }
})
