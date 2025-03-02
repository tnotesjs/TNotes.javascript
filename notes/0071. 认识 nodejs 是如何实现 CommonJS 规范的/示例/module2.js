// module2.js
// 导入 module1.js 模块，同时会执行 module1.js，这意味着会打印 "module1 called"。
// 同时由于 commonjs 在导入模块时是同步的，所以最先会输出 "module1 called"，然后再执行后续程序。
const obj = require('./module1.js')

// 不同模块之间的同名变量，由于它们不在同一个作用域中，因此它们是相互独立，互不影响的。
const count = 100

console.log(obj.getNumber()) // => 1
console.log(obj.getNumber()) // => 2
console.log(obj.getNumber()) // => 3

console.log(obj.user) // => { name: 'Tdahuyou', bilibili: 'https://space.bilibili.com/407241004' }

console.log(count) // => 100
console.log(obj.count) // => undefined

/* 最终输出结果：
module1 called
1
2
3
{ name: 'Tdahuyou', bilibili: 'https://space.bilibili.com/407241004' }
100
undefined
*/