function log(id, message) {
  const logEl = document.getElementById(id)
  const time = new Date().toLocaleTimeString()
  logEl.innerHTML += `[${time}] ${message}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function clearLog(id) {
  document.getElementById(id).innerHTML = ''
  const statsId = id.replace('log', 'stats')
  const statsEl = document.getElementById(statsId)
  if (statsEl) statsEl.innerHTML = ''
}

// Demo 1：分页数据库查询流
async function demo1() {
  clearLog('log1')

  const pageSize = parseInt(document.getElementById('pageSize').value)
  const delay = parseInt(document.getElementById('delay1').value)

  // 模拟数据库
  const mockDB = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User${i + 1}`,
  }))

  function createDBStream() {
    let offset = 0
    let pullCount = 0
    let skippedPulls = 0

    return new ReadableStream({
      async pull(controller) {
        pullCount++

        // 响应背压
        if (controller.desiredSize <= 0) {
          skippedPulls++
          log(
            'log1',
            `⚠️ pull #${pullCount}: 队列已满 (desiredSize=${controller.desiredSize})，跳过查询`
          )
          return
        }

        log(
          'log1',
          `📊 pull #${pullCount}: 查询 offset=${offset}, limit=${pageSize}`
        )

        // 模拟数据库查询
        await new Promise((resolve) => setTimeout(resolve, 50))
        const rows = mockDB.slice(offset, offset + pageSize)

        if (rows.length === 0) {
          log('log1', '✅ 数据库无更多数据，关闭流')
          controller.close()
          document.getElementById('stats1').innerHTML = `
            <strong>统计</strong><br>
            总 pull 调用: ${pullCount} 次<br>
            跳过查询: ${skippedPulls} 次（背压生效）<br>
            实际查询: ${pullCount - skippedPulls} 次
          `
          return
        }

        // 入队
        for (const row of rows) {
          controller.enqueue(row)
          if (controller.desiredSize <= 0) {
            log(
              'log1',
              `   队列已满，本批剩余 ${
                rows.length - rows.indexOf(row) - 1
              } 条留待下次`
            )
            offset += rows.indexOf(row) + 1
            return
          }
        }

        offset += rows.length
        log(
          'log1',
          `   入队 ${rows.length} 条，desiredSize: ${controller.desiredSize}`
        )
      },
    })
  }

  const stream = createDBStream()
  const reader = stream.getReader()
  let count = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    count++
    log('log1', `📖 消费 #${count}: ${JSON.stringify(value)}`)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  log('log1', `🎉 完成，共消费 ${count} 条数据`)
}

// Demo 2：限速文件上传流
async function demo2() {
  clearLog('log2')

  const speedKBps = parseInt(document.getElementById('speed').value)
  const fileSizeKB = parseInt(document.getElementById('fileSize').value)

  function createThrottledStream() {
    const chunkSize = 1024 // 1KB
    const totalChunks = fileSizeKB
    let sentChunks = 0
    let lastTime = Date.now()
    let throttleSkips = 0
    let backpressureSkips = 0

    return new ReadableStream(
      {
        pull(controller) {
          const now = Date.now()
          const elapsed = now - lastTime

          // 响应背压
          if (controller.desiredSize <= 0) {
            backpressureSkips++
            log(
              'log2',
              `⚠️ 背压触发，跳过本次读取 (desiredSize=${controller.desiredSize})`
            )
            return
          }

          // 限速检查
          const allowedBytes = (speedKBps * 1024 * elapsed) / 1000
          if (allowedBytes < chunkSize) {
            throttleSkips++
            return
          }

          if (sentChunks >= totalChunks) {
            log('log2', '✅ 文件读取完成')
            controller.close()
            document.getElementById('stats2').innerHTML = `
              <strong>统计</strong><br>
              发送块数: ${sentChunks} / ${totalChunks}<br>
              限速跳过: ${throttleSkips} 次<br>
              背压跳过: ${backpressureSkips} 次
            `
            return
          }

          const chunk = new Uint8Array(chunkSize)
          controller.enqueue(chunk)
          sentChunks++
          lastTime = now

          const progress = ((sentChunks / totalChunks) * 100).toFixed(1)
          log(
            'log2',
            `📤 发送块 #${sentChunks} (${progress}%), desiredSize: ${controller.desiredSize}`
          )
        },
      },
      new ByteLengthQueuingStrategy({ highWaterMark: 16 * 1024 }) // 16KB 缓冲
    )
  }

  const stream = createThrottledStream()
  const startTime = Date.now()

  await stream.pipeTo(
    new WritableStream({
      async write(chunk) {
        // 模拟网络上传延迟
        await new Promise((resolve) => setTimeout(resolve, 50))
      },
    })
  )

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
  const actualSpeed = (fileSizeKB / elapsed).toFixed(2)
  log('log2', `🎉 上传完成，耗时 ${elapsed}s，实际速度 ${actualSpeed} KB/s`)
}

// Demo 3：批量处理转换流
async function demo3() {
  clearLog('log3')

  const batchSize = parseInt(document.getElementById('batchSize').value)

  class BatchTransform {
    constructor(size) {
      this.batchSize = size
      this.buffer = []
      this.batchCount = 0
      this.skippedFlush = 0
    }

    transform(chunk, controller) {
      this.buffer.push(chunk)
      log(
        'log3',
        `📥 接收 ${chunk}，缓冲区: ${this.buffer.length}/${this.batchSize}`
      )

      if (this.buffer.length >= this.batchSize) {
        this.flushBatch(controller)
      }
    }

    flush(controller) {
      if (this.buffer.length > 0) {
        log('log3', '🔚 流结束，刷新剩余缓冲')
        this.flushBatch(controller)
      }

      document.getElementById('stats3').innerHTML = `
        <strong>统计</strong><br>
        输出批次: ${this.batchCount}<br>
        延迟刷新: ${this.skippedFlush} 次（背压）
      `
    }

    flushBatch(controller) {
      // 检查背压
      if (controller.desiredSize <= 0) {
        this.skippedFlush++
        log(
          'log3',
          `⚠️ 下游队列满 (desiredSize=${controller.desiredSize})，缓冲保留`
        )
        return
      }

      this.batchCount++
      const batch = this.buffer.splice(0, this.batchSize)
      const output = {
        batch: this.batchCount,
        items: batch,
        sum: batch.reduce((a, b) => a + b, 0),
      }

      controller.enqueue(output)
      log('log3', `📤 输出批次 #${this.batchCount}: ${JSON.stringify(output)}`)
    }
  }

  const batchTransform = new BatchTransform(batchSize)
  const transform = new TransformStream(batchTransform)

  // 创建输入流
  const source = new ReadableStream({
    start(controller) {
      for (let i = 1; i <= 20; i++) {
        controller.enqueue(i)
      }
      controller.close()
    },
  })

  // 创建慢速写入
  const sink = new WritableStream({
    async write(chunk) {
      log('log3', `  📝 处理批次: ${JSON.stringify(chunk)}`)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })

  await source.pipeThrough(transform).pipeTo(sink)
  log('log3', '✅ 完成')
}
