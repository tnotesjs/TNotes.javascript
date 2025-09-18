// 2.js
const myModule1 = require('./myModule')
const myModule2 = require('./myModule')
const myModule3 = require('./myModule')

console.log('[myModule1]:', myModule1) // [myModule1]: { msg: 'myModule' }
console.log('[myModule2]:', myModule2) // [myModule2]: { msg: 'myModule' }
console.log('[myModule3]:', myModule3) // [myModule3]: { msg: 'myModule' }

console.log(myModule1 === myModule2) // => true
console.log(myModule1 === myModule3) // => true

// 重复导入一个模块，导入的是相同的引用。