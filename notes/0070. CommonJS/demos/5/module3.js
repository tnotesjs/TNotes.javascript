// module3.js
/* 
const obj = require('./module1.js')
module2.js 中的这条语句，我们可以将其理解为下面这段程序。
*/

const obj = (function (module = {}) {
  /* 内部会自动为该函数传递这样一个参数 module */
  module.exports = {}
  let exports = module.exports

  /* ---> module1.js 开始 <--- */
  let count = 0

  function getNumber() {
    count++
    return count
  }

  const user = {
    name: 'Tdahuyou',
    bilibili: 'https://space.bilibili.com/407241004',
  }

  console.log('module1 called')

  exports.getNumber = getNumber
  exports.user = user
  /* ---> module1.js 结束 <--- */

  return module.exports
})()

// 不同模块之间的同名变量，由于它们不在同一个作用域中，因此它们是相互独立，互不影响的。
const count = 100

console.log(obj.getNumber()) // => 1
console.log(obj.getNumber()) // => 2
console.log(obj.getNumber()) // => 3

console.log(obj.user) // => { name: 'Tdahuyou', bilibili: 'https://space.bilibili.com/407241004' }

console.log(count) // => 100
console.log(obj.count) // => undefined
