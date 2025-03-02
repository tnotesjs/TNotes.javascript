// 5.js
const myModule = require('./myModule')

// ... 之后的某个时间点，你想要重新加载 myModule

// 找到模块在缓存中的路径
const moduleName = require.resolve('./myModule')

console.log('[moduleName]:', moduleName)

// 删除缓存中的模块
delete require.cache[moduleName]

// 重新加载模块，这将再次执行模块的代码
const myModuleReloaded = require('./myModule')

console.log(myModule === myModuleReloaded) // => false