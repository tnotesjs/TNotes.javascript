const sseEventsEl = document.getElementById('sseEvents')
const parsedDataEl = document.getElementById('parsedData')
const statusEl = document.getElementById('status')
const eventCountEl = document.getElementById('eventCount')
const dataVolumeEl = document.getElementById('dataVolume')
const eventRateEl = document.getElementById('eventRate')
const uptimeEl = document.getElementById('uptime')
const startBtn = document.getElementById('startSSE')
const stopBtn = document.getElementById('stopSSE')

let abortController = null
let stats = {
  eventCount: 0,
  totalBytes: 0,
  startTime: null,
}

function updateStatus(status) {
  statusEl.className = `status ${status}`
  statusEl.textContent = {
    connected: '✅ 已连接',
    disconnected: '❌ 未连接',
    connecting: '🔄 连接中...',
  }[status]
}

function logSSEEvent(type, data) {
  const item = document.createElement('div')
  item.className = 'event-item'
  item.innerHTML = `
    <div class="event-type">${type}</div>
    <div class="event-data">${data}</div>
    <div class="event-time">${new Date().toLocaleTimeString()}</div>
  `
  sseEventsEl.appendChild(item)
  sseEventsEl.scrollTop = sseEventsEl.scrollHeight

  // 限制显示数量
  while (sseEventsEl.children.length > 50) {
    sseEventsEl.removeChild(sseEventsEl.firstChild)
  }
}

function logParsedData(data) {
  const item = document.createElement('div')
  item.className = 'event-item'
  item.innerHTML = `
    <div class="event-data">${JSON.stringify(data, null, 2)}</div>
    <div class="event-time">${new Date().toLocaleTimeString()}</div>
  `
  parsedDataEl.appendChild(item)
  parsedDataEl.scrollTop = parsedDataEl.scrollHeight

  while (parsedDataEl.children.length > 30) {
    parsedDataEl.removeChild(parsedDataEl.firstChild)
  }
}

function updateStats() {
  eventCountEl.textContent = stats.eventCount
  dataVolumeEl.textContent = `${(stats.totalBytes / 1024).toFixed(2)} KB`

  if (stats.startTime) {
    const elapsed = (Date.now() - stats.startTime) / 1000
    uptimeEl.textContent = `${elapsed.toFixed(0)}s`
    eventRateEl.textContent = (stats.eventCount / elapsed).toFixed(2)
  }
}

// SSE 解析器
function createSSEParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      const events = buffer.split('\n\n')
      buffer = events.pop()

      for (const event of events) {
        if (!event.trim()) continue

        const lines = event.split('\n')
        const parsed = {}

        for (const line of lines) {
          if (line.startsWith('event:')) {
            parsed.event = line.substring(6).trim()
          } else if (line.startsWith('data:')) {
            parsed.data = line.substring(5).trim()
          } else if (line.startsWith('id:')) {
            parsed.id = line.substring(3).trim()
          } else if (line.startsWith('retry:')) {
            parsed.retry = parseInt(line.substring(6).trim(), 10)
          }
        }

        if (parsed.data) {
          controller.enqueue(parsed)
        }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        const lines = buffer.split('\n')
        const parsed = {}
        for (const line of lines) {
          if (line.startsWith('data:')) {
            parsed.data = line.substring(5).trim()
          }
        }
        if (parsed.data) {
          controller.enqueue(parsed)
        }
      }
    },
  })
}

// NDJSON 解析器
function createNDJSONParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (line.trim()) {
          try {
            const obj = JSON.parse(line)
            controller.enqueue(obj)
          } catch (error) {
            console.error('JSON 解析错误:', line)
          }
        }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        try {
          controller.enqueue(JSON.parse(buffer))
        } catch (error) {
          console.error('最后一行解析错误:', buffer)
        }
      }
    },
  })
}

// 模拟 SSE 数据流
function createMockSSEStream() {
  let count = 0

  return new ReadableStream({
    async start(controller) {
      const types = ['message', 'update', 'notification', 'alert']
      const interval = setInterval(() => {
        if (abortController?.signal.aborted) {
          clearInterval(interval)
          controller.close()
          return
        }

        const eventType = types[Math.floor(Math.random() * types.length)]
        const data = JSON.stringify({
          id: ++count,
          type: eventType,
          value: Math.random(),
          timestamp: Date.now(),
        })

        const sse = `event: ${eventType}\ndata: ${data}\nid: ${count}\n\n`
        controller.enqueue(sse)
      }, 500)

      abortController.signal.addEventListener('abort', () => {
        clearInterval(interval)
      })
    },
  })
}

// 模拟 NDJSON 数据流
function createMockNDJSONStream() {
  let count = 0

  return new ReadableStream({
    async start(controller) {
      const interval = setInterval(() => {
        if (abortController?.signal.aborted) {
          clearInterval(interval)
          controller.close()
          return
        }

        const obj = {
          id: ++count,
          name: `Item ${count}`,
          value: Math.random() * 100,
          status: count % 3 === 0 ? 'active' : 'pending',
          timestamp: new Date().toISOString(),
        }

        controller.enqueue(JSON.stringify(obj) + '\n')
      }, 300)

      abortController.signal.addEventListener('abort', () => {
        clearInterval(interval)
      })
    },
  })
}

// 启动 SSE 连接
async function startSSE() {
  if (abortController) return

  abortController = new AbortController()
  stats = { eventCount: 0, totalBytes: 0, startTime: Date.now() }

  updateStatus('connecting')
  startBtn.disabled = true
  stopBtn.disabled = false

  try {
    const stream = createMockSSEStream()

    await stream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(createSSEParser())
      .pipeTo(
        new WritableStream({
          write(event) {
            stats.eventCount++
            stats.totalBytes += JSON.stringify(event).length

            logSSEEvent(event.event || 'message', event.data)

            try {
              const data = JSON.parse(event.data)
              logParsedData(data)
            } catch {
              logParsedData({ raw: event.data })
            }

            updateStats()
          },
          close() {
            updateStatus('disconnected')
            startBtn.disabled = false
            stopBtn.disabled = true
          },
          abort(error) {
            console.log('SSE 连接中止:', error)
            updateStatus('disconnected')
            startBtn.disabled = false
            stopBtn.disabled = true
          },
        }),
        { signal: abortController.signal }
      )

    updateStatus('connected')
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('SSE 错误:', error)
    }
    updateStatus('disconnected')
    startBtn.disabled = false
    stopBtn.disabled = true
  }
}

// 停止连接
function stopSSE() {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

// 启动 NDJSON 流
async function startNDJSON() {
  if (abortController) {
    stopSSE()
  }

  abortController = new AbortController()
  stats = { eventCount: 0, totalBytes: 0, startTime: Date.now() }

  updateStatus('connecting')
  startBtn.disabled = true
  stopBtn.disabled = false

  try {
    const stream = createMockNDJSONStream()

    await stream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(createNDJSONParser())
      .pipeTo(
        new WritableStream({
          write(data) {
            stats.eventCount++
            stats.totalBytes += JSON.stringify(data).length

            logSSEEvent('ndjson', JSON.stringify(data))
            logParsedData(data)

            updateStats()
          },
          close() {
            updateStatus('disconnected')
            startBtn.disabled = false
            stopBtn.disabled = true
          },
        }),
        { signal: abortController.signal }
      )

    updateStatus('connected')
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('NDJSON 错误:', error)
    }
    updateStatus('disconnected')
    startBtn.disabled = false
    stopBtn.disabled = true
  }
}

// 事件监听
startBtn.addEventListener('click', startSSE)
stopBtn.addEventListener('click', stopSSE)
document.getElementById('startNDJSON').addEventListener('click', startNDJSON)
document.getElementById('clearEvents').addEventListener('click', () => {
  sseEventsEl.innerHTML = ''
  parsedDataEl.innerHTML = ''
})
