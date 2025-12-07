// 静态导入 顶层预加载 依赖关系清晰
import * as dynamicModule1 from './dynamicModule1.js'
import * as dynamicModule2 from './dynamicModule2.js'

const random = Math.random()
console.log('[random]', random)

if (random > 0.5) {
  dynamicModule1.greet() // ✅ 预加载 已可用
} else {
  dynamicModule2.greet() // ✅ 预加载 已可用
}
