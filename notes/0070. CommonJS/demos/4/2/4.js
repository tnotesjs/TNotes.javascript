// 4.js
const myModule1 = require('./myModule')
const myModule2 = module.children[0].exports
// const myModule3 = require.cache['/Users/huyouda/Desktop/code/24.01/myModule.js'].exports
// require.resolve('./myModule') === '/Users/huyouda/Desktop/code/24.01/myModule.js'
// require.resolve('./myModule') 用于获取模块的绝对路径，这个绝对路径同时也是模块的唯一标识，也是 cache 的 key
const myModule3 = require.cache[require.resolve('./myModule')].exports

console.log('[myModule1]:', myModule1) // [myModule1]: { msg: 'myModule' }
console.log('[myModule2]:', myModule2) // [myModule2]: { msg: 'myModule' }
console.log('[myModule3]:', myModule3) // [myModule3]: { msg: 'myModule' }

console.log(myModule1 === myModule2) // => true
console.log(myModule1 === myModule3) // => true
