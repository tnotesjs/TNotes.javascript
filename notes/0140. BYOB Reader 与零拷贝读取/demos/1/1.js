function log(id, msg) {
  const output = document.getElementById(id)
  output.innerHTML += msg + '<br>'
}

function clear(id) {
  document.getElementById(id).innerHTML = ''
}

// 创建一个字节流
function createByteStream(dataSize = 1000) {
  let bytesProduced = 0

  return new ReadableStream({
    type: 'bytes', // 必须指定为字节流

    pull(controller) {
      if (bytesProduced >= dataSize) {
        controller.close()
        return
      }

      // 每次生成 100 字节
      const chunkSize = Math.min(100, dataSize - bytesProduced)
      const chunk = new Uint8Array(chunkSize)

      for (let i = 0; i < chunkSize; i++) {
        chunk[i] = (bytesProduced + i) % 256
      }

      controller.enqueue(chunk)
      bytesProduced += chunkSize
    },
  })
}

// 示例1：基本 BYOB Reader 使用
async function demo1() {
  clear('output1')
  log('output1', '创建字节流...')

  const stream = createByteStream(500)

  // 获取 BYOB Reader
  const reader = stream.getReader({ mode: 'byob' })
  log('output1', '✅ 获取 BYOB Reader 成功')

  // 提供缓冲区
  const buffer = new Uint8Array(200)
  log('output1', `提供缓冲区大小: ${buffer.byteLength} 字节`)

  let totalBytes = 0
  let readCount = 0

  while (true) {
    const { done, value } = await reader.read(buffer)

    if (done) {
      log('output1', '✅ 读取完成')
      break
    }

    readCount++
    totalBytes += value.byteLength

    log(
      'output1',
      `第 ${readCount} 次读取: ${value.byteLength} 字节，数据: [${value
        .slice(0, 5)
        .join(', ')}...]`
    )
  }

  log('output1', `总共读取 ${totalBytes} 字节，读取 ${readCount} 次`)
}

// 示例2：缓冲区复用
async function demo2() {
  clear('output2')
  log('output2', '演示缓冲区复用...')

  const stream = createByteStream(300)
  const reader = stream.getReader({ mode: 'byob' })

  // 创建缓冲区
  let buffer = new Uint8Array(100)
  const bufferAddress = buffer.buffer

  log('output2', `初始缓冲区地址: ${getBufferID(bufferAddress)}`)

  let readCount = 0

  while (true) {
    const { done, value } = await reader.read(buffer)

    if (done) break

    readCount++
    log(
      'output2',
      `读取 ${readCount}: ${value.byteLength} 字节，缓冲区地址: ${getBufferID(
        value.buffer
      )}`
    )

    // 复用底层 ArrayBuffer
    if (buffer.byteLength > 0) {
      buffer = new Uint8Array(buffer.buffer)
      log(
        'output2',
        `✅ 复用了原缓冲区: ${
          getBufferID(buffer.buffer) === getBufferID(bufferAddress)
        }`
      )
    } else {
      buffer = new Uint8Array(100)
      log('output2', '⚠️ 缓冲区被分离，创建新缓冲区')
    }
  }

  log('output2', '读取完成')
}

// 示例3：处理缓冲区分离
async function demo3() {
  clear('output3')
  log('output3', '演示缓冲区分离处理...')

  const stream = createByteStream(400)
  const reader = stream.getReader({ mode: 'byob' })

  let buffer = new Uint8Array(150)
  let readCount = 0
  let recreateCount = 0

  while (true) {
    try {
      const { done, value } = await reader.read(buffer)

      if (done) {
        log('output3', '✅ 读取完成')
        break
      }

      readCount++
      log('output3', `读取 ${readCount}: ${value.byteLength} 字节`)
      log('output3', `缓冲区状态: byteLength=${buffer.byteLength}`)

      // 检查缓冲区是否被分离
      if (buffer.byteLength === 0) {
        buffer = new Uint8Array(150)
        recreateCount++
        log('output3', `⚠️ 缓冲区分离，重新创建（第 ${recreateCount} 次）`)
      } else {
        buffer = new Uint8Array(buffer.buffer)
        log('output3', '✅ 复用缓冲区')
      }
    } catch (error) {
      log('output3', `❌ 错误: ${error.message}`)
      buffer = new Uint8Array(150)
      recreateCount++
      log('output3', `重新创建缓冲区（第 ${recreateCount} 次）`)
    }
  }

  log('output3', `总共重新创建缓冲区 ${recreateCount} 次`)
}

// 辅助函数：获取缓冲区 ID（模拟地址）
function getBufferID(buffer) {
  if (!buffer._id) {
    buffer._id = Math.random().toString(36).slice(2, 8)
  }
  return buffer._id
}
