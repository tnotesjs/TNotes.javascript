function log(id, message) {
  const logEl = document.getElementById(id)
  logEl.innerHTML += `${message}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function clearLogs() {
  ;['log1a', 'log1b', 'log2a', 'log2b', 'stats2a', 'stats2b', 'log3'].forEach(
    (id) => {
      const el = document.getElementById(id)
      if (el) el.innerHTML = ''
    }
  )
}

// Demo 1：相同数据下的 desiredSize 差异
async function demo1() {
  clearLogs()

  // CountQueuingStrategy
  const countStream = new ReadableStream(
    {
      start(controller) {
        log('log1a', `初始 desiredSize: ${controller.desiredSize}`)

        const chunks = [
          new Uint8Array(10),
          new Uint8Array(100),
          new Uint8Array(1000),
          new Uint8Array(10000),
        ]

        chunks.forEach((chunk, i) => {
          controller.enqueue(chunk)
          log(
            'log1a',
            `入队 ${chunk.byteLength}B 后 desiredSize: ${controller.desiredSize}`
          )
        })

        controller.close()
      },
    },
    new CountQueuingStrategy({ highWaterMark: 5 })
  )

  // ByteLengthQueuingStrategy
  const byteStream = new ReadableStream(
    {
      start(controller) {
        log('log1b', `初始 desiredSize: ${controller.desiredSize}`)

        const chunks = [
          new Uint8Array(10),
          new Uint8Array(100),
          new Uint8Array(1000),
          new Uint8Array(10000),
        ]

        chunks.forEach((chunk, i) => {
          controller.enqueue(chunk)
          log(
            'log1b',
            `入队 ${chunk.byteLength}B 后 desiredSize: ${controller.desiredSize}`
          )
        })

        controller.close()
      },
    },
    new ByteLengthQueuingStrategy({ highWaterMark: 2048 })
  )

  // 消费流
  await Promise.all([consumeStream(countStream), consumeStream(byteStream)])

  log('log1a', '\n✅ 完成')
  log('log1b', '\n✅ 完成')
}

async function consumeStream(stream) {
  const reader = stream.getReader()
  while (true) {
    const { done } = await reader.read()
    if (done) break
  }
}

// Demo 2：内存占用对比
async function demo2() {
  document.getElementById('log2a').innerHTML = ''
  document.getElementById('log2b').innerHTML = ''

  // CountQueuingStrategy
  await runMemoryTest(
    'log2a',
    'stats2a',
    new CountQueuingStrategy({ highWaterMark: 10 }),
    'CountQueuingStrategy'
  )

  // ByteLengthQueuingStrategy
  await runMemoryTest(
    'log2b',
    'stats2b',
    new ByteLengthQueuingStrategy({ highWaterMark: 50 * 1024 }),
    'ByteLengthQueuingStrategy'
  )
}

async function runMemoryTest(logId, statsId, strategy, name) {
  let totalBytes = 0
  let pullCount = 0
  let backpressureCount = 0
  const chunks = []

  // 生成随机大小的数据块
  for (let i = 0; i < 100; i++) {
    const size = Math.floor(Math.random() * 10000) + 100
    chunks.push(new Uint8Array(size))
  }

  const stream = new ReadableStream(
    {
      pull(controller) {
        pullCount++

        if (controller.desiredSize <= 0) {
          backpressureCount++
          log(
            logId,
            `⚠️ pull #${pullCount}: 触发背压 (desiredSize=${controller.desiredSize})`
          )
          return
        }

        if (chunks.length === 0) {
          controller.close()
          return
        }

        const chunk = chunks.shift()
        totalBytes += chunk.byteLength
        controller.enqueue(chunk)

        if (pullCount <= 20 || pullCount % 10 === 0) {
          log(
            logId,
            `📤 pull #${pullCount}: 入队 ${chunk.byteLength}B, desiredSize=${controller.desiredSize}`
          )
        }
      },
    },
    strategy
  )

  await stream.pipeTo(
    new WritableStream({
      async write() {
        await new Promise((resolve) => setTimeout(resolve, 10))
      },
    })
  )

  document.getElementById(statsId).innerHTML = `
    <strong>统计结果</strong><br>
    总数据量: ${(totalBytes / 1024).toFixed(2)} KB<br>
    pull 调用次数: ${pullCount}<br>
    背压触发次数: ${backpressureCount}<br>
    背压触发率: ${((backpressureCount / pullCount) * 100).toFixed(1)}%
  `

  log(logId, '\n✅ 完成')
}

// Demo 3：性能测试
async function demo3() {
  document.getElementById('log3').innerHTML = ''
  const count = parseInt(document.getElementById('chunkCount').value)

  log('log3', `开始测试，生成 ${count} 个数据块...\n`)

  // 测试 CountQueuingStrategy (hwm=1)
  await performanceBenchmark(
    'Count(hwm=1)',
    new CountQueuingStrategy({ highWaterMark: 1 }),
    count,
    'log3'
  )

  // 测试 CountQueuingStrategy (hwm=10)
  await performanceBenchmark(
    'Count(hwm=10)',
    new CountQueuingStrategy({ highWaterMark: 10 }),
    count,
    'log3'
  )

  // 测试 ByteLengthQueuingStrategy (hwm=10KB)
  await performanceBenchmark(
    'Byte(hwm=10KB)',
    new ByteLengthQueuingStrategy({ highWaterMark: 10 * 1024 }),
    count,
    'log3'
  )

  // 测试 ByteLengthQueuingStrategy (hwm=100KB)
  await performanceBenchmark(
    'Byte(hwm=100KB)',
    new ByteLengthQueuingStrategy({ highWaterMark: 100 * 1024 }),
    count,
    'log3'
  )

  log('log3', '\n✅ 所有测试完成')
}

async function performanceBenchmark(name, strategy, count, logId) {
  let pullCount = 0
  const startTime = performance.now()

  const stream = new ReadableStream(
    {
      pull(controller) {
        pullCount++
        if (pullCount > count) {
          controller.close()
          return
        }
        controller.enqueue(new Uint8Array(1024)) // 固定 1KB
      },
    },
    strategy
  )

  await stream.pipeTo(
    new WritableStream({
      write() {
        // 空处理
      },
    })
  )

  const elapsed = performance.now() - startTime
  const avgTime = elapsed / count

  log(
    logId,
    `${name.padEnd(20)} | 耗时: ${elapsed.toFixed(
      2
    )}ms | pull 次数: ${pullCount} | 平均: ${avgTime.toFixed(3)}ms/块`
  )
}
