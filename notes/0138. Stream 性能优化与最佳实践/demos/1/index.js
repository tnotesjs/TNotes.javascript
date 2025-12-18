class MemoryMonitor {
  constructor() {
    this.snapshots = []
    this.baselineMemory = 0
    this.peakMemory = 0
    this.isMonitoring = false
    this.monitorInterval = null
    this.chartData = []
    this.maxDataPoints = 60
    this.activeStreams = 0
  }

  start() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.baselineMemory = this.getCurrentMemory()
    this.peakMemory = this.baselineMemory

    this.monitorInterval = setInterval(() => {
      this.takeSnapshot()
      this.updateUI()
    }, 500)

    addLog('info', '内存监控已启动')
  }

  stop() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    clearInterval(this.monitorInterval)
    addLog('info', '内存监控已停止')
  }

  clear() {
    this.snapshots = []
    this.chartData = []
    this.baselineMemory = 0
    this.peakMemory = 0
    this.updateUI()
    addLog('info', '监控数据已清除')
  }

  takeSnapshot() {
    const memory = this.getCurrentMemory()

    this.snapshots.push({
      timestamp: Date.now(),
      memory,
    })

    this.peakMemory = Math.max(this.peakMemory, memory)

    this.chartData.push(memory)
    if (this.chartData.length > this.maxDataPoints) {
      this.chartData.shift()
    }
  }

  getCurrentMemory() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  getMemoryGrowth() {
    return this.getCurrentMemory() - this.baselineMemory
  }

  updateUI() {
    const currentMemory = this.getCurrentMemory()
    const growth = this.getMemoryGrowth()

    document.getElementById('currentMemory').textContent =
      currentMemory.toFixed(2) + ' MB'
    document.getElementById('peakMemory').textContent =
      this.peakMemory.toFixed(2) + ' MB'
    document.getElementById('activeStreams').textContent = this.activeStreams

    const growthEl = document.getElementById('memoryGrowth')
    growthEl.textContent = (growth >= 0 ? '+' : '') + growth.toFixed(2) + ' MB'

    if (growth > 10) {
      growthEl.className = 'stat-value danger'
    } else if (growth > 5) {
      growthEl.className = 'stat-value warning'
    } else {
      growthEl.className = 'stat-value good'
    }

    this.renderChart()
  }

  renderChart() {
    const canvas = document.getElementById('memoryChart')
    const ctx = canvas.getContext('2d')

    canvas.width = canvas.offsetWidth
    canvas.height = 200

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (this.chartData.length < 2) return

    const padding = 40
    const width = canvas.width - padding * 2
    const height = canvas.height - padding * 2

    const minValue = Math.min(...this.chartData)
    const maxValue = Math.max(...this.chartData)
    const range = maxValue - minValue || 1

    // 绘制网格线
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()

      const value = maxValue - (range / 5) * i
      ctx.fillStyle = '#666'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(value.toFixed(1) + 'MB', padding - 5, y + 4)
    }

    // 绘制折线
    ctx.beginPath()
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 2

    this.chartData.forEach((value, index) => {
      const x = padding + (width / (this.chartData.length - 1)) * index
      const y = padding + height - ((value - minValue) / range) * height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 绘制数据点
    this.chartData.forEach((value, index) => {
      const x = padding + (width / (this.chartData.length - 1)) * index
      const y = padding + height - ((value - minValue) / range) * height

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
    })
  }

  incrementStreams() {
    this.activeStreams++
    this.updateUI()
  }

  decrementStreams() {
    this.activeStreams--
    this.updateUI()
  }
}

// 场景实现
const scenarios = {
  // ❌ 未释放 Reader
  'unreleased-reader': async function () {
    addLog('error', '执行：未释放 Reader（错误版本）')

    const stream = createTestStream(1000)
    monitor.incrementStreams()

    const reader = stream.getReader()

    try {
      const { value } = await reader.read()
      addLog('info', `读取到数据: ${value}`)
      // ❌ 忘记调用 reader.releaseLock()
    } catch (error) {
      addLog('error', `错误: ${error.message}`)
    }

    // 流被锁定，资源无法释放
    addLog('warning', 'Reader 未释放，流保持锁定状态')
    await sleep(2000)
    addLog('warning', '内存可能泄漏')
  },

  // ✅ 正确释放 Reader
  'released-reader': async function () {
    addLog('success', '执行：正确释放 Reader（正确版本）')

    const stream = createTestStream(1000)
    monitor.incrementStreams()

    const reader = stream.getReader()

    try {
      const { value } = await reader.read()
      addLog('info', `读取到数据: ${value}`)
    } finally {
      reader.releaseLock()
      monitor.decrementStreams()
      addLog('success', 'Reader 已正确释放')
    }

    await sleep(2000)
    addLog('success', '资源已清理，内存正常')
  },

  // ❌ 未取消流
  'uncanceled-stream': async function () {
    addLog('error', '执行：未取消流（错误版本）')

    const stream = createTestStream(100)
    monitor.incrementStreams()

    const reader = stream.getReader()

    try {
      const { value } = await reader.read()
      addLog('info', `读取到数据: ${value}`)
    } finally {
      reader.releaseLock()
      // ❌ 未调用 cancel()
    }

    addLog('warning', '流未取消，底层资源仍在运行')
    await sleep(3000)
    addLog('warning', '内存和 CPU 持续占用')
    monitor.decrementStreams()
  },

  // ✅ 正确取消流
  'canceled-stream': async function () {
    addLog('success', '执行：正确取消流（正确版本）')

    const stream = createTestStream(100)
    monitor.incrementStreams()

    const reader = stream.getReader()

    try {
      const { value } = await reader.read()
      addLog('info', `读取到数据: ${value}`)
    } finally {
      await reader.cancel('只需要第一个值')
      reader.releaseLock()
      monitor.decrementStreams()
      addLog('success', '流已正确取消，资源已释放')
    }

    await sleep(2000)
    addLog('success', '资源已完全清理')
  },

  // ❌ 积累数据
  'accumulating-transform': async function () {
    addLog('error', '执行：Transform 积累数据（错误版本）')

    const stream = createTestStream(50)
    monitor.incrementStreams()

    const allData = []

    const badTransform = new TransformStream({
      transform(chunk, controller) {
        allData.push(chunk)
        addLog('warning', `积累数据: ${allData.length} 个块`)
        controller.enqueue(chunk)
      },
      flush() {
        addLog('warning', `flush 时保留了 ${allData.length} 个数据块`)
      },
    })

    await stream.pipeThrough(badTransform).pipeTo(
      new WritableStream({
        write() {},
      })
    )

    await sleep(2000)
    addLog('warning', `allData 数组仍占用内存: ${allData.length} 个元素`)
    monitor.decrementStreams()
  },

  // ✅ 流式处理
  'streaming-transform': async function () {
    addLog('success', '执行：流式处理（正确版本）')

    const stream = createTestStream(50)
    monitor.incrementStreams()

    let processedCount = 0

    const goodTransform = new TransformStream({
      transform(chunk, controller) {
        processedCount++
        controller.enqueue(chunk)
        addLog('info', `处理数据块 ${processedCount}（不保留）`)
      },
      flush() {
        addLog('success', `共处理 ${processedCount} 个数据块，无积累`)
      },
    })

    await stream.pipeThrough(goodTransform).pipeTo(
      new WritableStream({
        write() {},
      })
    )

    await sleep(2000)
    addLog('success', '内存占用稳定，无泄漏')
    monitor.decrementStreams()
  },
}

// 创建测试流
function createTestStream(chunkCount) {
  let count = 0

  return new ReadableStream({
    async pull(controller) {
      if (count >= chunkCount) {
        controller.close()
        return
      }

      controller.enqueue(`数据块 ${count++}`)
      await sleep(10)
    },
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function addLog(level, message) {
  const log = document.getElementById('log')
  const entry = document.createElement('div')
  entry.className = `log-entry ${level}`
  const timestamp = new Date().toLocaleTimeString()
  entry.textContent = `[${timestamp}] ${message}`
  log.appendChild(entry)
  log.scrollTop = log.scrollHeight
}

// UI 控制
const monitor = new MemoryMonitor()
const startMonitorBtn = document.getElementById('startMonitorBtn')
const stopMonitorBtn = document.getElementById('stopMonitorBtn')
const clearBtn = document.getElementById('clearBtn')

startMonitorBtn.addEventListener('click', () => {
  monitor.start()
  startMonitorBtn.disabled = true
  stopMonitorBtn.disabled = false
})

stopMonitorBtn.addEventListener('click', () => {
  monitor.stop()
  startMonitorBtn.disabled = false
  stopMonitorBtn.disabled = true
})

clearBtn.addEventListener('click', () => {
  monitor.clear()
  document.getElementById('log').innerHTML = ''
})

// 场景按钮
document.querySelectorAll('[data-scenario]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const scenario = btn.dataset.scenario

    if (scenarios[scenario]) {
      btn.disabled = true

      try {
        await scenarios[scenario]()
      } catch (error) {
        addLog('error', `执行错误: ${error.message}`)
      } finally {
        btn.disabled = false
      }
    }
  })
})

// 自动启动监控
setTimeout(() => {
  monitor.start()
  startMonitorBtn.disabled = true
  stopMonitorBtn.disabled = false
}, 500)
