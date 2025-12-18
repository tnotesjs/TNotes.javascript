class VideoStreamPlayer {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width = canvas.offsetWidth
    this.height = canvas.height = canvas.offsetHeight

    this.targetFPS = options.targetFPS || 30
    this.minBuffer = options.minBuffer || 30
    this.maxBuffer = options.maxBuffer || 150
    this.dataRate = options.dataRate || 1

    this.buffer = []
    this.frameCount = 0
    this.currentFPS = 0
    this.isPlaying = false
    this.isPaused = false

    this.pullRate = 0
    this.consumeRate = 0
    this.lastPullTime = 0
    this.lastConsumeTime = 0

    this.onStats = options.onStats
    this.onLog = options.onLog

    this.stream = null
    this.reader = null
  }

  createVideoStream() {
    const self = this
    let frameNumber = 0
    let lastPullTime = Date.now()
    let pulledFrames = 0

    return new ReadableStream({
      async pull(controller) {
        // 背压控制
        while (
          self.buffer.length >= self.maxBuffer &&
          !controller.desiredSize
        ) {
          self.log('warning', '缓冲区已满，暂停拉取数据')
          self.updateStats('backpressure', '已激活')
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        self.updateStats('backpressure', '正常')

        // 模拟视频帧生成
        const frame = self.generateFrame(frameNumber++)

        // 控制数据生成速度
        const delay = 1000 / (self.targetFPS * self.dataRate) - 10
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        controller.enqueue(frame)

        // 计算拉取速率
        pulledFrames++
        const now = Date.now()
        const elapsed = (now - lastPullTime) / 1000

        if (elapsed >= 1) {
          self.pullRate = pulledFrames / elapsed
          pulledFrames = 0
          lastPullTime = now
        }

        if (self.buffer.length < self.minBuffer) {
          self.log(
            'warning',
            `缓冲不足: ${self.buffer.length}/${self.minBuffer} 帧`
          )
        }
      },
    })
  }

  generateFrame(frameNumber) {
    // 生成彩色噪点图案
    const imageData = this.ctx.createImageData(this.width, this.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const base = Math.sin(frameNumber * 0.01 + i * 0.0001) * 127 + 128
      data[i] = base + Math.random() * 50
      data[i + 1] = base + Math.random() * 50
      data[i + 2] = base + Math.random() * 50
      data[i + 3] = 255
    }

    return { frameNumber, imageData, timestamp: Date.now() }
  }

  async start() {
    this.isPlaying = true
    this.isPaused = false
    this.buffer = []
    this.frameCount = 0

    this.log('info', '开始播放视频流')

    this.stream = this.createVideoStream()
    this.reader = this.stream.getReader()

    // 启动帧消费
    this.consumeFrames()

    // 启动帧拉取
    this.pullFrames()
  }

  async pullFrames() {
    try {
      while (this.isPlaying) {
        if (this.isPaused) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          continue
        }

        const { done, value } = await this.reader.read()

        if (done) {
          this.log('info', '流已结束')
          break
        }

        this.buffer.push(value)
      }
    } catch (error) {
      this.log('error', `拉取错误: ${error.message}`)
    }
  }

  async consumeFrames() {
    const frameInterval = 1000 / this.targetFPS
    let lastFrameTime = performance.now()
    let lastFPSTime = performance.now()
    let frames = 0

    const animate = (currentTime) => {
      if (!this.isPlaying) return

      if (this.isPaused) {
        requestAnimationFrame(animate)
        return
      }

      const elapsed = currentTime - lastFrameTime

      if (elapsed >= frameInterval) {
        if (this.buffer.length > 0) {
          const frame = this.buffer.shift()
          this.renderFrame(frame)
          this.frameCount++
          frames++

          // 计算消费速率
          const now = performance.now()
          const fpsElapsed = (now - lastFPSTime) / 1000

          if (fpsElapsed >= 1) {
            this.currentFPS = frames / fpsElapsed
            this.consumeRate = frames / fpsElapsed
            frames = 0
            lastFPSTime = now
          }

          lastFrameTime = currentTime - (elapsed % frameInterval)
        } else {
          this.log('warning', '缓冲区为空，等待数据')
        }
      }

      this.updateUI()
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  renderFrame(frame) {
    this.ctx.putImageData(frame.imageData, 0, 0)

    // 绘制帧号
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(10, 10, 150, 40)
    this.ctx.fillStyle = 'white'
    this.ctx.font = 'bold 20px monospace'
    this.ctx.fillText(`Frame: ${frame.frameNumber}`, 20, 35)
  }

  updateUI() {
    const bufferHealth = this.getBufferHealth()

    if (this.onStats) {
      this.onStats({
        fps: Math.round(this.currentFPS),
        frameCount: this.frameCount,
        bufferSize: this.buffer.length,
        maxBuffer: this.maxBuffer,
        bufferHealth,
        pullRate: this.pullRate,
        consumeRate: this.consumeRate,
      })
    }
  }

  getBufferHealth() {
    const size = this.buffer.length

    if (size < this.minBuffer * 0.5) {
      return 'critical'
    } else if (size < this.minBuffer) {
      return 'low'
    } else if (size < this.maxBuffer * 0.66) {
      return 'good'
    } else {
      return 'full'
    }
  }

  pause() {
    this.isPaused = true
    this.log('info', '播放已暂停')
  }

  resume() {
    this.isPaused = false
    this.log('info', '播放已恢复')
  }

  async stop() {
    this.isPlaying = false
    this.isPaused = false

    if (this.reader) {
      await this.reader.cancel()
      this.reader = null
    }

    this.buffer = []
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.log('info', '播放已停止')
  }

  updateSettings(settings) {
    if (settings.targetFPS) this.targetFPS = settings.targetFPS
    if (settings.minBuffer) this.minBuffer = settings.minBuffer
    if (settings.maxBuffer) this.maxBuffer = settings.maxBuffer
    if (settings.dataRate) this.dataRate = settings.dataRate

    this.log(
      'info',
      `设置已更新: FPS=${this.targetFPS}, 缓冲=${this.minBuffer}-${this.maxBuffer}`
    )
  }

  log(level, message) {
    if (this.onLog) {
      this.onLog(level, message)
    }
  }

  updateStats(key, value) {
    if (this.onStats) {
      this.onStats({ [key]: value })
    }
  }
}

// UI 控制
const videoCanvas = document.getElementById('videoCanvas')
const fps = document.getElementById('fps')
const frameCount = document.getElementById('frameCount')
const bufferHealth = document.getElementById('bufferHealth')
const bufferSize = document.getElementById('bufferSize')
const bufferBar = document.getElementById('bufferBar')
const currentBuffer = document.getElementById('currentBuffer')
const pullRate = document.getElementById('pullRate')
const consumeRate = document.getElementById('consumeRate')
const bufferHealthStat = document.getElementById('bufferHealthStat')
const backpressureStatus = document.getElementById('backpressureStatus')
const log = document.getElementById('log')

const startBtn = document.getElementById('startBtn')
const pauseBtn = document.getElementById('pauseBtn')
const resumeBtn = document.getElementById('resumeBtn')
const stopBtn = document.getElementById('stopBtn')

const targetFPSInput = document.getElementById('targetFPS')
const minBufferInput = document.getElementById('minBuffer')
const maxBufferInput = document.getElementById('maxBuffer')
const dataRateSelect = document.getElementById('dataRate')

const timelineCanvas = document.getElementById('timelineCanvas')
const timelineCtx = timelineCanvas.getContext('2d')
timelineCanvas.width = timelineCanvas.offsetWidth
timelineCanvas.height = 150

const bufferHistory = []
const maxHistoryLength = 100

let player = null

// 初始化时间轴
function initTimeline() {
  timelineCtx.fillStyle = '#f8f9fa'
  timelineCtx.fillRect(0, 0, timelineCanvas.width, timelineCanvas.height)
}

function updateTimeline(bufferSize, maxBuffer) {
  bufferHistory.push(bufferSize)

  if (bufferHistory.length > maxHistoryLength) {
    bufferHistory.shift()
  }

  timelineCtx.fillStyle = '#f8f9fa'
  timelineCtx.fillRect(0, 0, timelineCanvas.width, timelineCanvas.height)

  const width = timelineCanvas.width / maxHistoryLength
  const scale = timelineCanvas.height / maxBuffer

  bufferHistory.forEach((size, index) => {
    const x = index * width
    const height = size * scale

    timelineCtx.fillStyle =
      size < parseInt(minBufferInput.value) ? '#dc3545' : '#28a745'
    timelineCtx.fillRect(x, timelineCanvas.height - height, width - 1, height)
  })

  // 绘制阈值线
  const minY = timelineCanvas.height - parseInt(minBufferInput.value) * scale
  const maxY = timelineCanvas.height - parseInt(maxBufferInput.value) * scale

  timelineCtx.strokeStyle = '#ffc107'
  timelineCtx.lineWidth = 2
  timelineCtx.setLineDash([5, 5])
  timelineCtx.beginPath()
  timelineCtx.moveTo(0, minY)
  timelineCtx.lineTo(timelineCanvas.width, minY)
  timelineCtx.stroke()

  timelineCtx.strokeStyle = '#dc3545'
  timelineCtx.beginPath()
  timelineCtx.moveTo(0, maxY)
  timelineCtx.lineTo(timelineCanvas.width, maxY)
  timelineCtx.stroke()
  timelineCtx.setLineDash([])
}

startBtn.addEventListener('click', async () => {
  player = new VideoStreamPlayer(videoCanvas, {
    targetFPS: parseInt(targetFPSInput.value),
    minBuffer: parseInt(minBufferInput.value),
    maxBuffer: parseInt(maxBufferInput.value),
    dataRate: parseFloat(dataRateSelect.value),
    onStats: updateStats,
    onLog: addLog,
  })

  await player.start()

  startBtn.disabled = true
  pauseBtn.disabled = false
  stopBtn.disabled = false
  targetFPSInput.disabled = true
  minBufferInput.disabled = true
  maxBufferInput.disabled = true
  dataRateSelect.disabled = true
})

pauseBtn.addEventListener('click', () => {
  player.pause()
  pauseBtn.disabled = true
  resumeBtn.disabled = false
})

resumeBtn.addEventListener('click', () => {
  player.resume()
  pauseBtn.disabled = false
  resumeBtn.disabled = true
})

stopBtn.addEventListener('click', async () => {
  if (player) {
    await player.stop()
  }

  startBtn.disabled = false
  pauseBtn.disabled = true
  resumeBtn.disabled = true
  stopBtn.disabled = true
  targetFPSInput.disabled = false
  minBufferInput.disabled = false
  maxBufferInput.disabled = false
  dataRateSelect.disabled = false

  bufferHistory.length = 0
  initTimeline()
})

function updateStats(stats) {
  if (stats.fps !== undefined) {
    fps.textContent = stats.fps
  }

  if (stats.frameCount !== undefined) {
    frameCount.textContent = stats.frameCount
  }

  if (stats.bufferSize !== undefined) {
    const percent = (stats.bufferSize / stats.maxBuffer) * 100
    bufferBar.style.width = `${percent}%`
    bufferBar.textContent = `${percent.toFixed(0)}%`
    bufferSize.textContent = `${stats.bufferSize} / ${stats.maxBuffer} 帧`
    currentBuffer.textContent = stats.bufferSize

    updateTimeline(stats.bufferSize, stats.maxBuffer)
  }

  if (stats.bufferHealth) {
    const healthTexts = {
      critical: '危险',
      low: '偏低',
      good: '良好',
      full: '充足',
    }

    const healthText = healthTexts[stats.bufferHealth] || '-'
    bufferHealth.textContent = healthText
    bufferHealthStat.textContent = healthText
    bufferHealthStat.className = `stat-value ${stats.bufferHealth}`
  }

  if (stats.pullRate !== undefined) {
    pullRate.textContent = stats.pullRate.toFixed(1) + ' fps'
  }

  if (stats.consumeRate !== undefined) {
    consumeRate.textContent = stats.consumeRate.toFixed(1) + ' fps'
  }

  if (stats.backpressure !== undefined) {
    backpressureStatus.textContent = stats.backpressure
    backpressureStatus.className =
      stats.backpressure === '已激活' ? 'stat-value warning' : 'stat-value good'
  }
}

function addLog(level, message) {
  const entry = document.createElement('div')
  entry.className = `log-entry ${level}`
  const timestamp = new Date().toLocaleTimeString()
  entry.textContent = `[${timestamp}] ${message}`
  log.appendChild(entry)
  log.scrollTop = log.scrollHeight
}

initTimeline()
