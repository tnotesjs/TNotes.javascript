function log(id, message) {
  const logEl = document.getElementById(id)
  logEl.innerHTML += `${message}\n`
  logEl.scrollTop = logEl.scrollHeight
}

function clearLog(id) {
  document.getElementById(id).innerHTML = ''
  const statsId = id.replace('log', 'stats')
  const statsEl = document.getElementById(statsId)
  if (statsEl) statsEl.innerHTML = ''
}

// 自定义策略 1：优先级队列策略
class PriorityQueuingStrategy {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 100
    this.weights = options.weights || { high: 10, normal: 5, low: 1 }
  }

  size(chunk) {
    if (!chunk || typeof chunk !== 'object') return 1

    const priority = chunk.priority || 'normal'
    const weight = this.weights[priority] || this.weights.normal

    log('currentLog', `  计算块大小: priority=${priority}, weight=${weight}`)
    return weight
  }
}

// Demo 1：优先级队列策略
async function demo1() {
  clearLog('log1')
  window.currentLog = 'log1' // 供 PriorityQueuingStrategy 使用

  const messages = [
    { priority: 'low', content: 'Background task 1' },
    { priority: 'high', content: 'Critical alert!' },
    { priority: 'normal', content: 'Regular update' },
    { priority: 'low', content: 'Background task 2' },
    { priority: 'high', content: 'Urgent action required' },
    { priority: 'normal', content: 'Info message' },
  ]

  let queueStats = { high: 0, normal: 0, low: 0 }
  let index = 0

  const stream = new ReadableStream(
    {
      pull(controller) {
        if (index >= messages.length) {
          controller.close()
          return
        }

        const msg = messages[index++]
        queueStats[msg.priority]++

        log('log1', `\n📥 入队消息 #${index}:`)
        log('log1', `   优先级: ${msg.priority}`)
        log('log1', `   内容: ${msg.content}`)

        controller.enqueue(msg)

        log('log1', `   队列状态: desiredSize=${controller.desiredSize}`)
      },
    },
    new PriorityQueuingStrategy({
      highWaterMark: 50,
      weights: { high: 10, normal: 5, low: 1 },
    })
  )

  const reader = stream.getReader()
  let processedCount = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    processedCount++
    log(
      'log1',
      `\n📤 处理消息 #${processedCount}: [${value.priority}] ${value.content}`
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  document.getElementById('stats1').innerHTML = `
    <strong>队列统计</strong><br>
    高优先级消息: ${queueStats.high} 条（权重 10）<br>
    普通优先级消息: ${queueStats.normal} 条（权重 5）<br>
    低优先级消息: ${queueStats.low} 条（权重 1）<br>
    总权重: ${queueStats.high * 10 + queueStats.normal * 5 + queueStats.low * 1}
  `

  log('log1', '\n✅ 完成')
}

// 自定义策略 2：字符串长度策略
class StringLengthStrategy {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 1000
  }

  size(chunk) {
    if (typeof chunk === 'string') {
      return chunk.length
    }
    if (chunk && typeof chunk.toString === 'function') {
      return chunk.toString().length
    }
    return 1
  }
}

// Demo 2：字符串长度策略
async function demo2() {
  clearLog('log2')

  const texts = [
    'Hi',
    'Hello, World!',
    'This is a medium length message for testing purposes.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Short',
    'A very very very long text that should consume significant queue space because it has many characters.',
  ]

  let totalLength = 0
  let index = 0

  const stream = new ReadableStream(
    {
      pull(controller) {
        if (index >= texts.length) {
          controller.close()
          return
        }

        const text = texts[index++]
        totalLength += text.length

        log('log2', `📥 入队文本 #${index}:`)
        log('log2', `   长度: ${text.length} 字符`)
        log(
          'log2',
          `   内容: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`
        )
        log('log2', `   desiredSize: ${controller.desiredSize}\n`)

        controller.enqueue(text)
      },
    },
    new StringLengthStrategy({ highWaterMark: 200 })
  )

  const reader = stream.getReader()
  let processedCount = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    processedCount++
    log('log2', `📖 读取文本 #${processedCount}: ${value.length} 字符`)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  document.getElementById('stats2').innerHTML = `
    <strong>统计结果</strong><br>
    总文本量: ${totalLength} 字符<br>
    highWaterMark: 200 字符<br>
    处理消息数: ${processedCount}
  `

  log('log2', '\n✅ 完成')
}

// 自定义策略 3：混合策略
class HybridQueuingStrategy {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 1024
  }

  size(chunk) {
    // 二进制数据：按字节数
    if (chunk && chunk.byteLength !== undefined) {
      return chunk.byteLength
    }

    // 字符串：按字符数 * 2（UTF-16 估算）
    if (typeof chunk === 'string') {
      return chunk.length * 2
    }

    // 对象：按属性数量 * 10
    if (chunk && typeof chunk === 'object') {
      return Object.keys(chunk).length * 10
    }

    // 其他：固定为 1
    return 1
  }
}

// Demo 3：混合策略
async function demo3() {
  clearLog('log3')

  const mixedData = [
    new Uint8Array(100), // 二进制
    'Hello, Stream!', // 字符串
    { id: 1, name: 'Alice', age: 30 }, // 对象
    new Uint8Array(500),
    'Short',
    { a: 1, b: 2, c: 3, d: 4, e: 5 },
    new Uint8Array(50),
    'A longer string for testing',
  ]

  const stats = { binary: 0, string: 0, object: 0 }
  let index = 0

  const stream = new ReadableStream(
    {
      pull(controller) {
        if (index >= mixedData.length) {
          controller.close()
          return
        }

        const data = mixedData[index++]
        let type, size

        if (data && data.byteLength !== undefined) {
          type = 'binary'
          size = data.byteLength
          stats.binary++
        } else if (typeof data === 'string') {
          type = 'string'
          size = data.length * 2
          stats.string++
        } else {
          type = 'object'
          size = Object.keys(data).length * 10
          stats.object++
        }

        log('log3', `📥 入队 #${index}:`)
        log('log3', `   类型: ${type}`)
        log('log3', `   计算大小: ${size}`)
        log('log3', `   desiredSize: ${controller.desiredSize}\n`)

        controller.enqueue(data)
      },
    },
    new HybridQueuingStrategy({ highWaterMark: 1000 })
  )

  const reader = stream.getReader()
  let count = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    count++
    const type = value.byteLength
      ? 'binary'
      : typeof value === 'string'
      ? 'string'
      : 'object'
    log('log3', `📖 读取 #${count}: ${type}`)
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  document.getElementById('stats3').innerHTML = `
    <strong>数据统计</strong><br>
    二进制数据: ${stats.binary} 个（按 byteLength 计算）<br>
    字符串数据: ${stats.string} 个（按 length * 2 计算）<br>
    对象数据: ${stats.object} 个（按 keys * 10 计算）<br>
    highWaterMark: 1000 字节
  `

  log('log3', '\n✅ 完成')
}
