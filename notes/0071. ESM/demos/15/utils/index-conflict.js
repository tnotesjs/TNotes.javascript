// index-conflict.js - 演示命名冲突问题
// ❌ 错误示例：两个模块都导出了 add，会导致冲突
// export * from './add.js'
// export * from './conflict.js'
// SyntaxError: Duplicate export of 'add'

// ✅ 解决方案 1：重命名导出
export { add } from './add.js'
export { add as conflictAdd } from './conflict.js'

// ✅ 解决方案 2：命名空间导出
export * as addModule from './add.js'
export * as conflictModule from './conflict.js'

console.log('utils/index-conflict.js called')
