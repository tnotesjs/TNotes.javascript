// 动态导入 - 依赖延迟加载
console.log('🚀 应用启动 (动态导入模式)\n')
console.time('总加载时间')

;(async () => {
  console.log('--- 应用初始化完成，准备按需加载模块 ---\n')

  const random = Math.random()
  console.log('随机数：', random)

  // ✅ 只加载需要的模块
  if (random > 0.5) {
    console.log('⏳ 按需加载模块 1...\n')
    const mod = await import('./dynamicModule1.js')
    console.log('\n✅ 使用模块 1')
    mod.greet()
    console.log('模块 1 信息：', mod.moduleInfo)
  } else {
    console.log('⏳ 按需加载模块 2...\n')
    const mod = await import('./dynamicModule2.js')
    console.log('\n✅ 使用模块 2')
    mod.greet()
    console.log('模块 2 信息：', mod.moduleInfo)
  }

  console.timeEnd('总加载时间')
  console.log('\n💡 注意：只加载了实际使用的模块，节省了资源')
})()
