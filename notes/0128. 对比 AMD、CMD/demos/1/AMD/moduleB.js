// moduleB.js
define(function () {
  // console.log('moduleB.js is loaded')
  const doSomethingElse = function () {
    console.log('Module B is doing something else')
  }

  // return 的内容即为导出的内容
  return {
    doSomethingElse,
  }
})
