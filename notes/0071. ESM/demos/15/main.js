// main.js - 聚合导出演示
console.log('=== 聚合导出基本用法 ===\n')

import * as utils from './utils/index.js'

console.log('utils 命名空间对象：')
console.dir(utils)

console.log('\n--- 使用聚合导出的成员 ---')
console.log('add(1, 2) =', utils.add(1, 2))
console.log('getRandom(1, 10) =', utils.getRandom(1, 10))
console.log('sayHello():', utils.sayHello())
console.log('constants.A =', utils.constants.A)
console.log('直接导出的 A =', utils.A)

console.log('\n✅ 通过聚合导出，外部只需一条导入语句即可访问所有工具函数')
