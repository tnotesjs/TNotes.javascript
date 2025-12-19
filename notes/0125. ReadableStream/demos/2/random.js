// 创建一个随机数生成器流
function createRandomStream() {
  return new ReadableStream({
    pull(controller) {
      const random = Math.floor(Math.random() * 100)
      controller.enqueue(`随机数: ${random}`)
    },
    cancel(reason) {
      log(`❌ 流被取消: ${reason}`)
    },
  })
}

// 启动随机数生成器
async function startRandom() {
  clear()
  log('启动随机数生成器（每300ms读取一次）')
  await stopCurrentReader('切换到新流')

  const stream = createRandomStream()
  readStream(stream, 300)
}

// 停止随机数
async function stopRandom() {
  log('用户请求停止')
  await stopCurrentReader('用户主动停止')
}
