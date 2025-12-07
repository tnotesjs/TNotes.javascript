// 6.js
require('./myModule') // => myModule called

delete require.cache[require.resolve('./myModule')]
require('./myModule') // => myModule called

delete require.cache[require.resolve('./myModule')]
require('./myModule') // => myModule called

// 通过这种删除模块缓存的方式，可以让多次导入同一个模块时，都运行一边该模块，并且导出的内容也是新的（而非复用的）。