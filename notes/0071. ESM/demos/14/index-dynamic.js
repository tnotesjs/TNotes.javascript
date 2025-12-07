// 动态导入 运行时按需加载 适合延迟与分割
;(async () => {
  const random = Math.random()
  console.log('[random]', random)

  if (random > 0.5) {
    const mod = await import('./dynamicModule1.js')
    mod.greet() // ✅ 延迟加载 条件触发
  } else {
    const mod = await import('./dynamicModule2.js')
    mod.greet() // ✅ 延迟加载 条件触发
  }
})()
