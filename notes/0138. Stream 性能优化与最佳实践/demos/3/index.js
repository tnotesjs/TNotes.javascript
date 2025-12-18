class StreamMonitor {
  constructor() {
    this.activeStreams = new Set()
    this.metrics = {
      throughput: [],
      latency: [],
      memory: [],
      activeCount: [],
    }
    this.maxDataPoints = 60
    this.updateInterval = 1000
    this.isRunning = false
  }

  startMonitoring() {
    if (this.isRunning) return

    this.isRunning = true
    this.monitorLoop()
  }

  stopMonitoring() {
    this.isRunning = false
  }

  async monitorLoop() {
    while (this.isRunning) {
      const snapshot = await this.collectMetrics()
      this.recordSnapshot(snapshot)
      this.updateUI(snapshot)

      await new Promise((resolve) => setTimeout(resolve, this.updateInterval))
    }
  }

  async collectMetrics() {
    const memoryInfo = performance.memory
      ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
        }
      : { used: 0, total: 0 }

    let totalThroughput = 0
    let totalLatency = 0
    let streamCount = 0

    for (const stream of this.activeStreams) {
      if (stream.metrics) {
        totalThroughput += stream.metrics.throughput || 0
        totalLatency += stream.metrics.latency || 0
        streamCount++
      }
    }

    return {
      timestamp: Date.now(),
      activeStreams: this.activeStreams.size,
      throughput: totalThroughput,
      avgLatency: streamCount > 0 ? totalLatency / streamCount : 0,
      memory: memoryInfo.used / 1024 / 1024,
    }
  }

  recordSnapshot(snapshot) {
    this.metrics.throughput.push(snapshot.throughput)
    this.metrics.latency.push(snapshot.avgLatency)
    this.metrics.memory.push(snapshot.memory)
    this.metrics.activeCount.push(snapshot.activeStreams)

    if (this.metrics.throughput.length > this.maxDataPoints) {
      this.metrics.throughput.shift()
      this.metrics.latency.shift()
      this.metrics.memory.shift()
      this.metrics.activeCount.shift()
    }
  }

  updateUI(snapshot) {
    document.getElementById('activeStreams').textContent =
      snapshot.activeStreams
    document.getElementById('throughput').textContent = (
      snapshot.throughput /
      1024 /
      1024
    ).toFixed(2)
    document.getElementById('latency').textContent =
      snapshot.avgLatency.toFixed(2)
    document.getElementById('memory').textContent = snapshot.memory.toFixed(2)

    this.updateTrends()
  }

  updateTrends() {
    const getChange = (data) => {
      if (data.length < 2) return null
      const current = data[data.length - 1]
      const previous = data[data.length - 2]
      const change = ((current - previous) / (previous || 1)) * 100
      return change
    }

    this.updateChangeIndicator(
      'activeStreamsChange',
      getChange(this.metrics.activeCount)
    )
    this.updateChangeIndicator(
      'throughputChange',
      getChange(this.metrics.throughput)
    )
    this.updateChangeIndicator(
      'latencyChange',
      getChange(this.metrics.latency),
      true
    )
    this.updateChangeIndicator(
      'memoryChange',
      getChange(this.metrics.memory),
      true
    )
  }

  updateChangeIndicator(elementId, change, invertColors = false) {
    const element = document.getElementById(elementId)
    if (change === null) {
      element.textContent = ''
      return
    }

    const isUp = change > 0
    const arrow = isUp ? '↑' : '↓'
    const className = invertColors
      ? isUp
        ? 'up'
        : 'down'
      : isUp
      ? 'down'
      : 'up'

    element.textContent = `${arrow} ${Math.abs(change).toFixed(1)}%`
    element.className = `metric-change ${className}`
  }

  registerStream(stream, metrics) {
    stream.metrics = metrics
    this.activeStreams.add(stream)
    addLog('info', `Stream 已注册，当前活跃: ${this.activeStreams.size}`)
  }

  unregisterStream(stream) {
    this.activeStreams.delete(stream)
    addLog('info', `Stream 已移除，当前活跃: ${this.activeStreams.size}`)
  }

  clearData() {
    this.metrics.throughput = []
    this.metrics.latency = []
    this.metrics.memory = []
    this.metrics.activeCount = []
  }
}

class ChartRenderer {
  constructor(canvasId, color, label) {
    this.canvas = document.getElementById(canvasId)
    this.ctx = this.canvas.getContext('2d')
    this.color = color
    this.label = label
    this.resize()
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = 200
  }

  render(data) {
    const { ctx, canvas, color } = this
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    if (data.length === 0) {
      ctx.fillStyle = '#666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('暂无数据', width / 2, height / 2)
      return
    }

    const maxValue = Math.max(...data, 1)
    const minValue = Math.min(...data, 0)
    const range = maxValue - minValue || 1

    // 绘制网格
    ctx.strokeStyle = '#0f3460'
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - padding * 2) / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      const value = maxValue - (range / 5) * i
      ctx.fillStyle = '#888'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(value.toFixed(2), padding - 5, y + 4)
    }

    // 绘制曲线
    const step = (width - padding * 2) / (data.length - 1 || 1)

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'

    data.forEach((value, index) => {
      const x = padding + index * step
      const y =
        padding +
        (height - padding * 2) -
        ((value - minValue) / range) * (height - padding * 2)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 填充渐变
    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, color + '40')
    gradient.addColorStop(1, color + '00')
    ctx.fillStyle = gradient
    ctx.fill()
  }
}

function addLog(type, message) {
  const logContent = document.getElementById('logContent')
  const entry = document.createElement('div')
  entry.className = `log-entry ${type}`

  const time = new Date().toLocaleTimeString()
  entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`

  logContent.insertBefore(entry, logContent.firstChild)

  while (logContent.children.length > 50) {
    logContent.removeChild(logContent.lastChild)
  }
}

async function createTestStream(monitor) {
  const chunkSize = 64 * 1024
  const totalSize = 10 * 1024 * 1024
  let sentBytes = 0

  const metrics = {
    throughput: 0,
    latency: 0,
  }

  const stream = new ReadableStream({
    async pull(controller) {
      if (sentBytes >= totalSize) {
        controller.close()
        monitor.unregisterStream(stream)
        return
      }

      const start = performance.now()
      const size = Math.min(chunkSize, totalSize - sentBytes)
      const chunk = new Uint8Array(size)

      controller.enqueue(chunk)
      sentBytes += size

      const latency = performance.now() - start
      metrics.latency = latency
      metrics.throughput = (size / latency) * 1000

      await new Promise((resolve) => setTimeout(resolve, 10))
    },
  })

  monitor.registerStream(stream, metrics)

  stream
    .pipeTo(
      new WritableStream({
        write() {},
      })
    )
    .catch((err) => {
      addLog('error', `Stream 错误: ${err.message}`)
      monitor.unregisterStream(stream)
    })

  return stream
}

// 初始化
const monitor = new StreamMonitor()
const throughputChart = new ChartRenderer(
  'throughputChart',
  '#00d4ff',
  '吞吐量'
)
const latencyChart = new ChartRenderer('latencyChart', '#ffd43b', '延迟')

// UI 控制
document.getElementById('startBtn').addEventListener('click', async () => {
  for (let i = 0; i < 3; i++) {
    await createTestStream(monitor)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  addLog('info', '已启动 3 个测试 Stream')
})

document.getElementById('stopBtn').addEventListener('click', () => {
  monitor.activeStreams.clear()
  addLog('warning', '已停止所有 Stream')
})

document.getElementById('clearBtn').addEventListener('click', () => {
  monitor.clearData()
  throughputChart.render([])
  latencyChart.render([])
  addLog('info', '已清除所有数据')
})

// 时间周期切换
document.querySelectorAll('[data-period]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('[data-period]')
      .forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')

    const period = parseInt(btn.dataset.period)
    monitor.maxDataPoints = period
  })
})

// 启动监控和图表更新
monitor.startMonitoring()
addLog('info', '监控系统已启动')

setInterval(() => {
  throughputChart.render(monitor.metrics.throughput)
  latencyChart.render(monitor.metrics.latency)
}, 1000)
