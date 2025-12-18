const output = document.getElementById('output')
let currentReader = null

function log(msg) {
  output.innerHTML += msg + '<br>'
  output.scrollTop = output.scrollHeight
}

function clear() {
  output.innerHTML = ''
}

// 创建一个无限计数器流（使用 pull 按需生成）
function createCounterStream() {
  let count = 0

  return new ReadableStream({
    pull(controller) {
      // ✅ 使用 pull：只在消费者请求时才生成数据
      controller.enqueue(`计数: ${++count}`)
    },
    cancel(reason) {
      log(`❌ 流被取消: ${reason}`)
    },
  })
}

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

// 读取流数据的通用函数
async function readStream(stream, delay = 500) {
  currentReader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await currentReader.read()
      if (done) {
        log('✅ 流已结束')
        break
      }
      log(value)

      // 延迟以便观察效果
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      log('读取被中断')
    } else {
      log(`错误: ${error.message}`)
    }
  }
}

// 停止当前读取
async function stopCurrentReader(reason) {
  if (currentReader) {
    await currentReader.cancel(reason)
    currentReader = null
  }
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
