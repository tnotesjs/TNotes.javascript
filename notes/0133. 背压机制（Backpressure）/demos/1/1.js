function log(id, message) {
  const logEl = document.getElementById(id)
  const time = new Date().toLocaleTimeString()
  logEl.innerHTML += `[${time}] ${message}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function clearLog(id) {
  document.getElementById(id).innerHTML = ''
}

// Demo 1：观察 desiredSize 的变化
async function demo1() {
  clearLog('log1')
  const hwm = parseInt(document.getElementById('hwm1').value)

  const stream = new ReadableStream(
    {
      start(controller) {
        log('log1', `初始 desiredSize: ${controller.desiredSize}`)

        for (let i = 1; i <= 5; i++) {
          controller.enqueue(`chunk${i}`)
          log(
            'log1',
            `入队 chunk${i} 后 desiredSize: ${controller.desiredSize}`
          )
        }

        controller.close()
      },
    },
    new CountQueuingStrategy({ highWaterMark: hwm })
  )

  const reader = stream.getReader()
  log('log1', '开始消费...')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    log('log1', `读取: ${value}`)
  }

  log('log1', '✅ 完成')
}

// Demo 2：慢速消费触发背压
async function demo2() {
  clearLog('log2')
  const delay = parseInt(document.getElementById('delay').value)
  const hwm = parseInt(document.getElementById('hwm2').value)

  let pullCount = 0

  const stream = new ReadableStream(
    {
      pull(controller) {
        pullCount++
        log(
          'log2',
          `🔄 pull() 第 ${pullCount} 次调用，desiredSize: ${controller.desiredSize}`
        )

        if (pullCount > 10) {
          controller.close()
          return
        }

        controller.enqueue(`data${pullCount}`)
        log('log2', `   入队后 desiredSize: ${controller.desiredSize}`)
      },
    },
    new CountQueuingStrategy({ highWaterMark: hwm })
  )

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    log('log2', `📖 消费: ${value}`)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  log('log2', `✅ 完成，pull() 共调用 ${pullCount} 次`)
}

// Demo 3：管道链中的背压传播
async function demo3() {
  clearLog('log3')

  let sourcePulls = 0
  let transform1Calls = 0
  let transform2Calls = 0

  const source = new ReadableStream(
    {
      pull(controller) {
        sourcePulls++
        log(
          'log3',
          `📤 Source pull() #${sourcePulls}, desiredSize: ${controller.desiredSize}`
        )

        if (sourcePulls > 15) {
          controller.close()
          return
        }

        controller.enqueue(sourcePulls)
      },
    },
    new CountQueuingStrategy({ highWaterMark: 3 })
  )

  const transform1 = new TransformStream(
    {
      transform(chunk, controller) {
        transform1Calls++
        log(
          'log3',
          `  🔀 Transform1 #${transform1Calls}, desiredSize: ${controller.desiredSize}`
        )
        controller.enqueue(chunk * 10)
      },
    },
    new CountQueuingStrategy({ highWaterMark: 2 })
  )

  const transform2 = new TransformStream(
    {
      transform(chunk, controller) {
        transform2Calls++
        log(
          'log3',
          `    🔀 Transform2 #${transform2Calls}, desiredSize: ${controller.desiredSize}`
        )
        controller.enqueue(`[${chunk}]`)
      },
    },
    new CountQueuingStrategy({ highWaterMark: 1 })
  )

  const sink = new WritableStream({
    async write(chunk) {
      log('log3', `      📥 Sink 写入: ${chunk}`)
      await new Promise((resolve) => setTimeout(resolve, 300))
    },
  })

  await source.pipeThrough(transform1).pipeThrough(transform2).pipeTo(sink)

  log('log3', '---')
  log(
    'log3',
    `统计：Source pulls=${sourcePulls}, T1=${transform1Calls}, T2=${transform2Calls}`
  )
  log('log3', '✅ 完成')
}
