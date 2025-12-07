// 静态导入 - 依赖预加载
console.log('🚀 应用启动 (静态导入模式)\n')
console.time('总加载时间')

// ⚠️ 两个模块都会被预先加载，即使可能只用到其中一个
import * as dynamicModule1 from './dynamicModule1.js'
import * as dynamicModule2 from './dynamicModule2.js'

console.log('\n--- 模块加载完成，开始执行业务逻辑 ---\n')

const random = Math.random()
console.log('随机数：', random)

if (random > 0.5) {
  console.log('✅ 使用模块 1')
  dynamicModule1.greet()
  console.log('模块 1 信息：', dynamicModule1.moduleInfo)
} else {
  console.log('✅ 使用模块 2')
  dynamicModule2.greet()
  console.log('模块 2 信息：', dynamicModule2.moduleInfo)
}

console.timeEnd('总加载时间')
console.log('\n💡 注意：两个模块都被加载了，即使只用到一个')
