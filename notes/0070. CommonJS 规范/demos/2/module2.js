// module2.js
const obj = require('./module1.js') // 导入 module1.js 模块
console.log(obj)

// 运行 node module2.js
// 输出结果：
// {
//   getNumber: [Function: getNumber],
//   user: { name: 'Tdahuyou', age: 24 }
// }