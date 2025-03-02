// 4.js
const myModule1 = require('./myModule')
const myModule2 = module.children[0].exports
const myModule3 = require.cache['/Users/huyouda/Desktop/code/24.01/myModule.js'].exports

console.log('[myModule1]:', myModule1) // [myModule1]: { msg: 'myModule' }
console.log('[myModule2]:', myModule2) // [myModule2]: { msg: 'myModule' }
console.log('[myModule3]:', myModule3) // [myModule3]: { msg: 'myModule' }

console.log(myModule1 === myModule2) // => true
console.log(myModule1 === myModule3) // => true