// 模拟大型模块初始化
console.log('📦 模块 1 开始加载...')
const startTime = performance.now()

// 模拟复杂计算
let sum = 0
for (let i = 0; i < 1000000; i++) {
  sum += i
}

const loadTime = (performance.now() - startTime).toFixed(2)
console.log(`✅ 模块 1 加载完成 (耗时: ${loadTime}ms)`)

export const greet = () => {
  console.log('👋 来自模块 1 的问候')
}

export const moduleInfo = {
  name: 'dynamicModule1',
  loadTime,
}
