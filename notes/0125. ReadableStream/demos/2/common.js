const output = document.getElementById('output')
let currentReader = null

function log(msg) {
  output.innerHTML += msg + '<br>'
  output.scrollTop = output.scrollHeight
}

function clear() {
  output.innerHTML = ''
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
