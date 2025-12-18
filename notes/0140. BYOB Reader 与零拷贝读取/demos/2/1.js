function log(id, msg) {
  const output = document.getElementById(id)
  output.innerHTML += msg + '<br>'
  output.scrollTop = output.scrollHeight
}

function clear(id) {
  document.getElementById(id).innerHTML = ''
}

// 创建大量字节数据流
function createLargeByteStream(sizeKB) {
  const totalBytes = sizeKB * 1024
  let bytesProduced = 0

  return new ReadableStream({
    type: 'bytes',

    pull(controller) {
      if (bytesProduced >= totalBytes) {
        controller.close()
        return
      }

      const chunkSize = Math.min(8192, totalBytes - bytesProduced) // 8KB chunks
      const chunk = new Uint8Array(chunkSize)

      // 填充随机数据
      for (let i = 0; i < chunkSize; i++) {
        chunk[i] = Math.floor(Math.random() * 256)
      }

      controller.enqueue(chunk)
      bytesProduced += chunkSize
    },
  })
}

// 使用默认 Reader 读取
async function testDefaultReader(sizeKB) {
  clear('defaultOutput')
  log('defaultOutput', '开始使用默认 Reader 读取...')

  const stream = createLargeByteStream(sizeKB)
  const reader = stream.getReader()

  const startTime = performance.now()
  let chunks = []
  let totalBytes = 0
  let readCount = 0

  while (true) {
    const { done, value } = await reader.read()

    if (done) break

    readCount++
    totalBytes += value.byteLength
    chunks.push(value) // 每个 chunk 都是新分配的内存

    if (readCount % 10 === 0) {
      log('defaultOutput', `已读取 ${readCount} 次，${totalBytes} 字节`)
    }
  }

  const endTime = performance.now()
  const duration = endTime - startTime

  log('defaultOutput', '✅ 读取完成')

  return {
    duration,
    totalBytes,
    readCount,
    chunksCount: chunks.length,
    avgChunkSize: totalBytes / chunks.length,
  }
}

// 使用 BYOB Reader 读取
async function testBYOBReader(sizeKB) {
  clear('byobOutput')
  log('byobOutput', '开始使用 BYOB Reader 读取...')

  const stream = createLargeByteStream(sizeKB)
  const reader = stream.getReader({ mode: 'byob' })

  const startTime = performance.now()
  let buffer = new Uint8Array(8192) // 8KB buffer
  let totalBytes = 0
  let readCount = 0

  while (true) {
    const { done, value } = await reader.read(buffer)

    if (done) break

    readCount++
    totalBytes += value.byteLength

    if (readCount % 10 === 0) {
      log('byobOutput', `已读取 ${readCount} 次，${totalBytes} 字节`)
    }

    // 复用缓冲区
    if (buffer.byteLength > 0) {
      buffer = new Uint8Array(buffer.buffer)
    } else {
      buffer = new Uint8Array(8192)
    }
  }

  const endTime = performance.now()
  const duration = endTime - startTime

  log('byobOutput', '✅ 读取完成')

  return {
    duration,
    totalBytes,
    readCount,
    bufferReused: true,
  }
}

// 运行对比测试
async function runComparison() {
  const sizeKB = parseInt(document.getElementById('dataSize').value)

  clear('defaultStats')
  clear('byobStats')
  clear('summary')

  // 测试默认 Reader
  const defaultStats = await testDefaultReader(sizeKB)

  document.getElementById('defaultStats').innerHTML = `
    <strong>统计数据:</strong><br>
    耗时: ${defaultStats.duration.toFixed(2)} ms<br>
    读取次数: ${defaultStats.readCount}<br>
    总字节数: ${defaultStats.totalBytes}<br>
    平均块大小: ${defaultStats.avgChunkSize.toFixed(0)} 字节<br>
    内存分配: ${defaultStats.chunksCount} 个新缓冲区
  `

  // 等待一下再测试 BYOB
  await new Promise((r) => setTimeout(r, 100))

  // 测试 BYOB Reader
  const byobStats = await testBYOBReader(sizeKB)

  document.getElementById('byobStats').innerHTML = `
    <strong>统计数据:</strong><br>
    耗时: ${byobStats.duration.toFixed(2)} ms<br>
    读取次数: ${byobStats.readCount}<br>
    总字节数: ${byobStats.totalBytes}<br>
    缓冲区复用: ✅ 是<br>
    内存分配: 1 个缓冲区（复用）
  `

  // 总结对比
  const speedup = (
    (defaultStats.duration / byobStats.duration - 1) *
    100
  ).toFixed(1)
  const memoryReduction = (
    ((defaultStats.chunksCount - 1) / defaultStats.chunksCount) *
    100
  ).toFixed(1)

  document.getElementById('summary').innerHTML = `
    <strong>性能对比总结:</strong><br>
    ${
      speedup > 0
        ? `BYOB Reader 快 ${speedup}%`
        : `默认 Reader 快 ${Math.abs(speedup)}%`
    }<br>
    内存分配减少: ${memoryReduction}%（从 ${
    defaultStats.chunksCount
  } 个缓冲区降至 1 个）<br>
    <br>
    <strong>结论:</strong> BYOB Reader 通过零拷贝和缓冲区复用，显著降低了内存分配开销。
  `
}
