class JSONStreamParser {
  constructor() {
    this.buffer = ''
    this.depth = 0
    this.inString = false
    this.escape = false
  }

  parse(chunk) {
    this.buffer += chunk
    const items = []

    let itemStart = -1
    let itemDepth = 0

    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i]

      if (this.escape) {
        this.escape = false
        continue
      }

      if (char === '\\') {
        this.escape = true
        continue
      }

      if (char === '"') {
        this.inString = !this.inString
        continue
      }

      if (this.inString) continue

      if (char === '{' || char === '[') {
        if (this.depth === 1 && itemStart === -1) {
          itemStart = i
          itemDepth = this.depth
        }
        this.depth++
      } else if (char === '}' || char === ']') {
        this.depth--

        if (this.depth === itemDepth && itemStart !== -1) {
          const json = this.buffer.slice(itemStart, i + 1)
          try {
            items.push(JSON.parse(json))
          } catch (e) {
            // 忽略解析错误
          }
          itemStart = -1
        }
      }
    }

    if (itemStart === -1 && !this.inString) {
      this.buffer = ''
    }

    return items
  }
}

function createJSONStreamParser() {
  const parser = new JSONStreamParser()
  const decoder = new TextDecoder()

  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true })
      const items = parser.parse(text)

      for (const item of items) {
        controller.enqueue(item)
      }
    },
    flush(controller) {
      const items = parser.parse('')
      for (const item of items) {
        controller.enqueue(item)
      }
    },
  })
}

// UI 控制
const dataSource = document.getElementById('dataSource')
const urlInput = document.getElementById('urlInput')
const fileInput = document.getElementById('fileInput')
const countInput = document.getElementById('countInput')
const startBtn = document.getElementById('startBtn')
const progressInfo = document.getElementById('progressInfo')
const progressFill = document.getElementById('progressFill')
const progressText = document.getElementById('progressText')
const parsedCountEl = document.getElementById('parsedCount')
const parseSpeedEl = document.getElementById('parseSpeed')
const elapsedTimeEl = document.getElementById('elapsedTime')
const memoryUsageEl = document.getElementById('memoryUsage')
const resultsList = document.getElementById('resultsList')

dataSource.addEventListener('change', () => {
  urlInput.style.display = dataSource.value === 'url' ? 'block' : 'none'
  fileInput.style.display = dataSource.value === 'file' ? 'block' : 'none'
  countInput.style.display = dataSource.value === 'generated' ? 'block' : 'none'
})

startBtn.addEventListener('click', async () => {
  const source = dataSource.value

  let stream

  if (source === 'generated') {
    const count = parseInt(document.getElementById('itemCount').value)
    stream = generateTestStream(count)
  } else if (source === 'url') {
    const url = document.getElementById('jsonUrl').value
    if (!url) {
      alert('请输入 URL')
      return
    }
    const response = await fetch(url)
    stream = response.body
  } else if (source === 'file') {
    const file = document.getElementById('jsonFile').files[0]
    if (!file) {
      alert('请选择文件')
      return
    }
    stream = file.stream()
  }

  await parseStream(stream)
})

function generateTestStream(count) {
  let index = 0

  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('['))
    },
    async pull(controller) {
      if (index >= count) {
        controller.enqueue(new TextEncoder().encode(']'))
        controller.close()
        return
      }

      const obj = {
        id: index + 1,
        name: `Item ${index + 1}`,
        value: Math.random() * 1000,
        timestamp: new Date().toISOString(),
        tags: ['tag1', 'tag2'],
      }

      const json = JSON.stringify(obj) + (index < count - 1 ? ',' : '')
      controller.enqueue(new TextEncoder().encode(json))

      index++

      if (index % 100 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    },
  })
}

async function parseStream(stream) {
  startBtn.disabled = true
  progressInfo.classList.add('show')
  resultsList.innerHTML = ''

  const results = []
  let count = 0
  const startTime = performance.now()
  let lastUpdateTime = startTime

  const jsonStream = stream.pipeThrough(createJSONStreamParser())

  const reader = jsonStream.getReader()

  const updateInterval = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000
    elapsedTimeEl.textContent = elapsed.toFixed(1)

    const speed = count / elapsed
    parseSpeedEl.textContent = speed.toFixed(0)

    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024
      memoryUsageEl.textContent = memoryMB.toFixed(1)
    }
  }, 100)

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      count++
      results.push(value)

      if (results.length > 20) {
        results.shift()
      }

      const now = performance.now()
      if (now - lastUpdateTime > 50) {
        updateUI(count, results)
        lastUpdateTime = now
      }
    }

    updateUI(count, results)
    progressText.textContent = '解析完成！'
    progressFill.style.width = '100%'
    progressFill.textContent = '100%'
  } catch (error) {
    alert('解析失败: ' + error.message)
  } finally {
    clearInterval(updateInterval)
    startBtn.disabled = false

    setTimeout(() => {
      progressInfo.classList.remove('show')
    }, 3000)
  }
}

function updateUI(count, results) {
  parsedCountEl.textContent = count.toLocaleString()

  resultsList.innerHTML = results
    .map(
      (item, index) =>
        `<div class="result-item">
      <span class="result-index">#${count - results.length + index + 1}</span>
      <span class="result-content">${JSON.stringify(item, null, 2)}</span>
    </div>`
    )
    .join('')
}
