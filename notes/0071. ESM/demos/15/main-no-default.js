// main-no-default.js - 测试 export * 不包含 default
import * as utils from './utils/index-no-default.js'

console.log('\n=== export * 不包含 default 演示 ===\n')
console.log('utils 对象：', utils)
console.log('utils.default：', utils.default) // undefined

// ❌ 无法访问 sayHello 的默认导出
// 因为 export * from './sayHello.js' 不会导出 default
