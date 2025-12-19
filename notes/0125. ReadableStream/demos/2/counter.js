// 创建一个无限计数器流（使用 pull 按需生成）
function createCounterStream() {
  let count = 0

  return new ReadableStream({
    // 使用 pull：只在消费者请求时才生成数据
    pull(controller) {
      controller.enqueue(`计数: ${++count}`)
    },
    cancel(reason) {
      log(`❌ 流被取消: ${reason}`)
    },
  })
}

// 启动计数器
async function startCounter() {
  clear()
  log('启动计数器流（每500ms读取一次）')
  await stopCurrentReader('切换到新流')

  const stream = createCounterStream()
  readStream(stream, 500)
}

// 停止计数器
async function stopCounter() {
  log('用户请求停止')
  await stopCurrentReader('用户主动停止')
}
