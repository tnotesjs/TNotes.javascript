// module2.js
require('./module1.js')
require('./module1.js')
require('./module1.js')

/* 执行命令 node module2.js 查看输出结果：
module1 called
*/

// 模块的导入、导出是具有缓存的；
// 首次导入一个模块，会把这个模块执行一遍；
// 如果重复导入同一个模块多次，因为缓存的缘故，这个模块只会被执行一次；
