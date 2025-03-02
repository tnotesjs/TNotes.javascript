// module3.js
const obj = require('./module1.js') // 导入 module1.js 模块

const count = 100 // 不同模块之间的变量，互不影响。

console.log(obj.getNumber()) // => 1
console.log(obj.getNumber()) // => 2
console.log(obj.getNumber()) // => 3

console.log(obj.user) // => { name: 'Tdahuyou', age: 24 }

console.log(count) // => 100
console.log(obj.count) // => undefined - 因为 module1.js 中没有导出 count 变量

// 运行 node module3.js 查看执行结果：
/*
1
2
3
{ name: 'Tdahuyou', age: 24 }
100
undefined
*/