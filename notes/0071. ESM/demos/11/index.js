// index.js - 演示模块缓存机制
import { a } from './a.js'
import { b, executeCount } from './b.js'

console.log('第一次导入：', { a, b, executeCount })

// ✅ 再次导入同一模块，不会重新执行
import { b as b2, executeCount as count2 } from './b.js'
console.log('第二次导入：', { b: b2, executeCount: count2 })

// ✅ 从不同路径导入，仍然使用缓存
import('./b.js').then((module) => {
  console.log('动态导入：', { b: module.b, executeCount: module.executeCount })
})

// 运行结果：
// b.js called (第 1 次执行)
// a.js called
// 第一次导入： { a: 'a', b: 'b', executeCount: 1 }
// 第二次导入： { b: 'b', executeCount: 1 }
// 动态导入： { b: 'b', executeCount: 1 }
