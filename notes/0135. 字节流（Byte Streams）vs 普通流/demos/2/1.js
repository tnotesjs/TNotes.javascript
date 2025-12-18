function log(id, message) {
  const logEl = document.getElementById(id)
  const time = new Date().toLocaleTimeString()
  logEl.innerHTML += `[${time}] ${message}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function clearResults() {
  document.getElementById('results').innerHTML = ''
  document.getElementById('log').innerHTML = ''
}

// 运行基准测试
async function runBenchmark() {
  clearResults()
  const btn = document.getElementById('runBtn')
  btn.disabled = true

  const dataSizeMB = parseInt(document.getElementById('dataSize').value)
  const chunkSizeKB = parseInt(document.getElementById('chunkSize').value)

  const dataSize = dataSizeMB * 1024 * 1024
  const chunkSize = chunkSizeKB * 1024

  log('log', `开始测试: ${dataSizeMB}MB 数据, ${chunkSizeKB}KB 块大小\n`)

  // 测试 1：普通流 + 默认 Reader
  log('log', '测试 1: 普通流 + 默认 Reader...')
  const result1 = await testNormalStream(dataSize, chunkSize)
  log('log', `完成: ${result1.time.toFixed(2)}ms\n`)

  // 测试 2：字节流 + 默认 Reader
  log('log', '测试 2: 字节流 + 默认 Reader...')
  const result2 = await testByteStreamDefault(dataSize, chunkSize)
  log('log', `完成: ${result2.time.toFixed(2)}ms\n`)

  // 测试 3：字节流 + BYOB Reader
  log('log', '测试 3: 字节流 + BYOB Reader...')
  const result3 = await testByteStreamBYOB(dataSize, chunkSize)
  log('log', `完成: ${result3.time.toFixed(2)}ms\n`)

  // 显示结果
  displayResults([
    { name: '普通流 + 默认 Reader', ...result1 },
    { name: '字节流 + 默认 Reader', ...result2 },
    { name: '字节流 + BYOB Reader', ...result3 },
  ])

  btn.disabled = false
  log('log', '✅ 所有测试完成')
}

async function testNormalStream(totalSize, chunkSize) {
  let bytesGenerated = 0

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesGenerated >= totalSize) {
        controller.close()
        return
      }

      const size = Math.min(chunkSize, totalSize - bytesGenerated)
      const chunk = new Uint8Array(size)
      controller.enqueue(chunk)
      bytesGenerated += size
    },
  })

  const startTime = performance.now()
  let bytesRead = 0
  let chunks = 0

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytesRead += value.byteLength
    chunks++
  }

  const time = performance.now() - startTime
  const throughput = (bytesRead / 1024 / 1024 / (time / 1000)).toFixed(2)

  return { time, throughput, chunks }
}

async function testByteStreamDefault(totalSize, chunkSize) {
  let bytesGenerated = 0

  const stream = new ReadableStream({
    type: 'bytes',
    pull(controller) {
      if (bytesGenerated >= totalSize) {
        controller.close()
        return
      }

      const size = Math.min(chunkSize, totalSize - bytesGenerated)
      const chunk = new Uint8Array(size)
      controller.enqueue(chunk)
      bytesGenerated += size
    },
  })

  const startTime = performance.now()
  let bytesRead = 0
  let chunks = 0

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytesRead += value.byteLength
    chunks++
  }

  const time = performance.now() - startTime
  const throughput = (bytesRead / 1024 / 1024 / (time / 1000)).toFixed(2)

  return { time, throughput, chunks }
}

async function testByteStreamBYOB(totalSize, chunkSize) {
  let bytesGenerated = 0

  const stream = new ReadableStream({
    type: 'bytes',
    pull(controller) {
      if (bytesGenerated >= totalSize) {
        controller.close()
        return
      }

      const request = controller.byobRequest

      if (request) {
        const size = Math.min(
          request.view.byteLength,
          totalSize - bytesGenerated
        )
        bytesGenerated += size
        request.respond(size)
      } else {
        const size = Math.min(chunkSize, totalSize - bytesGenerated)
        controller.enqueue(new Uint8Array(size))
        bytesGenerated += size
      }
    },
  })

  const startTime = performance.now()
  let bytesRead = 0
  let chunks = 0

  const reader = stream.getReader({ mode: 'byob' })
  let buffer = new Uint8Array(chunkSize)

  while (true) {
    const { done, value } = await reader.read(buffer)
    if (done) break
    bytesRead += value.byteLength
    chunks++
    buffer = new Uint8Array(chunkSize) // 重新分配
  }

  const time = performance.now() - startTime
  const throughput = (bytesRead / 1024 / 1024 / (time / 1000)).toFixed(2)

  return { time, throughput, chunks }
}

function displayResults(results) {
  const container = document.getElementById('results')
  const fastest = results.reduce((min, r) => (r.time < min.time ? r : min))

  results.forEach((result) => {
    const isWinner = result === fastest
    const card = document.createElement('div')
    card.className = `result-card ${isWinner ? 'winner' : ''}`

    card.innerHTML = `
      <h4>${result.name} ${isWinner ? '🏆' : ''}</h4>
      <div class="metric">
        <span class="metric-label">总耗时</span>
        <span class="metric-value">${result.time.toFixed(2)} ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">吞吐量</span>
        <span class="metric-value">${result.throughput} MB/s</span>
      </div>
      <div class="metric">
        <span class="metric-label">块数量</span>
        <span class="metric-value">${result.chunks}</span>
      </div>
      <div class="metric">
        <span class="metric-label">平均每块</span>
        <span class="metric-value">${(result.time / result.chunks).toFixed(
          3
        )} ms</span>
      </div>
    `

    container.appendChild(card)
  })
}

// 内存测试
async function memoryTest() {
  const logEl = document.getElementById('memoryLog')
  logEl.innerHTML = ''

  if (!performance.memory) {
    log('memoryLog', '⚠️ 浏览器不支持 performance.memory API')
    log(
      'memoryLog',
      '提示：在 Chrome 中使用 --enable-precise-memory-info 标志\n'
    )
  }

  const sizeMB = 50
  const size = sizeMB * 1024 * 1024

  log('memoryLog', `测试场景: 读取 ${sizeMB}MB 数据\n`)

  // 测试 1：普通流（累积所有数据）
  log('memoryLog', '--- 测试 1: 普通流累积读取 ---')
  await testMemoryNormal(size)

  await sleep(1000)

  // 测试 2：字节流 BYOB（复用缓冲区）
  log('memoryLog', '\n--- 测试 2: 字节流 BYOB 复用缓冲区 ---')
  await testMemoryBYOB(size)

  log('memoryLog', '\n✅ 内存测试完成')
}

async function testMemoryNormal(totalSize) {
  const before = getMemoryUsage()
  log('memoryLog', `初始内存: ${before}MB`)

  const chunks = []
  const stream = new ReadableStream({
    pull(controller) {
      if (chunks.length * 64 * 1024 >= totalSize) {
        controller.close()
        return
      }
      controller.enqueue(new Uint8Array(64 * 1024))
    },
  })

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value) // 保留所有块
  }

  const after = getMemoryUsage()
  log('memoryLog', `读取后内存: ${after}MB`)
  log('memoryLog', `内存增长: ${(after - before).toFixed(2)}MB`)
  log('memoryLog', `累积块数: ${chunks.length}`)
}

async function testMemoryBYOB(totalSize) {
  const before = getMemoryUsage()
  log('memoryLog', `初始内存: ${before}MB`)

  let bytesRead = 0
  const stream = new ReadableStream({
    type: 'bytes',
    pull(controller) {
      if (bytesRead >= totalSize) {
        controller.close()
        return
      }

      const request = controller.byobRequest
      if (request) {
        const size = Math.min(request.view.byteLength, totalSize - bytesRead)
        bytesRead += size
        request.respond(size)
      }
    },
  })

  const reader = stream.getReader({ mode: 'byob' })
  let buffer = new Uint8Array(64 * 1024)
  let count = 0

  while (true) {
    const { done, value } = await reader.read(buffer)
    if (done) break
    count++
    // 不保留数据，复用缓冲区
    buffer = new Uint8Array(64 * 1024)
  }

  const after = getMemoryUsage()
  log('memoryLog', `读取后内存: ${after}MB`)
  log('memoryLog', `内存增长: ${(after - before).toFixed(2)}MB`)
  log('memoryLog', `处理块数: ${count}`)
}

function getMemoryUsage() {
  if (performance.memory) {
    return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
  }
  return 0
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
