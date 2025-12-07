// main.js - 动态导入示例
console.log('程序启动')

// 模拟用户触发某个操作后才加载模块
setTimeout(async () => {
  console.log('用户触发了某个操作，开始加载功能模块...')

  try {
    // 动态导入返回一个 Promise
    const module = await import('./feature.js')

    console.log('模块加载成功')
    const result = module.heavyComputation()
    console.log('计算结果:', result)
    console.log('配置:', module.config)
  } catch (error) {
    console.error('模块加载失败:', error)
  }
}, 1000)

console.log('程序继续执行其他任务...')
