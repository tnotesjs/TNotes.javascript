class ChunkedUploader {
  constructor(file, options = {}) {
    this.file = file
    this.chunkSize = options.chunkSize || 1024 * 1024
    this.maxRetries = options.maxRetries || 3
    this.concurrency = options.concurrency || 3
    this.failureRate = options.failureRate || 0
    this.onProgress = options.onProgress
    this.onChunkUpdate = options.onChunkUpdate
    this.onLog = options.onLog

    this.totalChunks = Math.ceil(file.size / this.chunkSize)
    this.uploadedChunks = new Set()
    this.failedChunks = new Set()
    this.retryCount = 0
    this.startTime = null
    this.uploadedBytes = 0
    this.isPaused = false
    this.isCanceled = false
    this.activeUploads = 0
  }

  async uploadChunk(chunkIndex) {
    const start = chunkIndex * this.chunkSize
    const end = Math.min(start + this.chunkSize, this.file.size)
    const chunk = this.file.slice(start, end)

    let retries = 0

    while (retries <= this.maxRetries) {
      if (this.isCanceled) {
        throw new Error('上传已取消')
      }

      while (this.isPaused) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      try {
        this.log(
          'info',
          `分片 ${chunkIndex} 开始上传 (尝试 ${retries + 1}/${
            this.maxRetries + 1
          })`
        )
        this.updateChunk(chunkIndex, 'uploading')

        // 模拟网络上传
        await this.mockUpload(chunk, chunkIndex)

        this.log('success', `分片 ${chunkIndex} 上传成功`)
        this.uploadedChunks.add(chunkIndex)
        this.uploadedBytes += chunk.size
        this.updateChunk(chunkIndex, 'success')

        return
      } catch (error) {
        retries++
        this.retryCount++

        if (retries > this.maxRetries) {
          this.log('error', `分片 ${chunkIndex} 上传失败: ${error.message}`)
          this.failedChunks.add(chunkIndex)
          this.updateChunk(chunkIndex, 'error')
          throw error
        }

        this.log(
          'warning',
          `分片 ${chunkIndex} 上传失败，准备重试 (${retries}/${this.maxRetries})`
        )
        this.updateChunk(chunkIndex, 'retry')

        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }
  }

  async mockUpload(chunk, chunkIndex) {
    return new Promise((resolve, reject) => {
      // 模拟网络延迟
      const delay = 100 + Math.random() * 400

      setTimeout(() => {
        // 模拟失败
        if (Math.random() < this.failureRate) {
          reject(new Error('网络错误'))
        } else {
          resolve()
        }
      }, delay)
    })
  }

  async upload() {
    this.startTime = Date.now()
    this.uploadedChunks.clear()
    this.failedChunks.clear()
    this.retryCount = 0
    this.uploadedBytes = 0
    this.isCanceled = false

    this.log(
      'info',
      `开始上传: ${this.file.name} (${this.formatSize(this.file.size)})`
    )
    this.log(
      'info',
      `总分片数: ${this.totalChunks}, 分片大小: ${this.formatSize(
        this.chunkSize
      )}`
    )

    const tasks = []

    for (let i = 0; i < this.totalChunks; i++) {
      if (this.isCanceled) {
        break
      }

      const task = this.uploadChunk(i)
        .then(() => {
          this.activeUploads--
          this.updateProgress()
        })
        .catch((error) => {
          this.activeUploads--
          this.updateProgress()
        })

      tasks.push(task)
      this.activeUploads++

      // 控制并发
      if (this.activeUploads >= this.concurrency) {
        await Promise.race(tasks)
      }
    }

    await Promise.allSettled(tasks)

    if (this.isCanceled) {
      this.log('warning', '上传已取消')
      return { success: false, message: '上传已取消' }
    }

    if (this.failedChunks.size > 0) {
      this.log('error', `上传失败: ${this.failedChunks.size} 个分片失败`)
      return {
        success: false,
        message: `${this.failedChunks.size} 个分片上传失败`,
      }
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1)
    this.log('success', `上传完成! 耗时: ${duration}s`)

    return { success: true, message: '上传成功' }
  }

  pause() {
    this.isPaused = true
    this.log('warning', '上传已暂停')
  }

  resume() {
    this.isPaused = false
    this.log('info', '上传已恢复')
  }

  cancel() {
    this.isCanceled = true
    this.log('warning', '正在取消上传...')
  }

  updateProgress() {
    if (this.onProgress) {
      const progress = (this.uploadedChunks.size / this.totalChunks) * 100
      const elapsed = (Date.now() - this.startTime) / 1000
      const speed = this.uploadedBytes / elapsed
      const remaining = (this.file.size - this.uploadedBytes) / speed

      this.onProgress({
        progress,
        uploadedChunks: this.uploadedChunks.size,
        totalChunks: this.totalChunks,
        speed,
        remaining,
        retryCount: this.retryCount,
        failedChunks: this.failedChunks.size,
      })
    }
  }

  updateChunk(index, status) {
    if (this.onChunkUpdate) {
      this.onChunkUpdate(index, status)
    }
  }

  log(level, message) {
    if (this.onLog) {
      this.onLog(level, message)
    }
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
}

// UI 控制
const uploadArea = document.getElementById('uploadArea')
const fileInput = document.getElementById('fileInput')
const fileInfo = document.getElementById('fileInfo')
const fileName = document.getElementById('fileName')
const fileSize = document.getElementById('fileSize')
const chunkSizeSelect = document.getElementById('chunkSize')
const concurrencyInput = document.getElementById('concurrency')
const maxRetriesInput = document.getElementById('maxRetries')
const failureRateSelect = document.getElementById('failureRate')
const startBtn = document.getElementById('startBtn')
const pauseBtn = document.getElementById('pauseBtn')
const resumeBtn = document.getElementById('resumeBtn')
const cancelBtn = document.getElementById('cancelBtn')
const progressContainer = document.getElementById('progressContainer')
const progressText = document.getElementById('progressText')
const progressFill = document.getElementById('progressFill')
const uploadedChunksSpan = document.getElementById('uploadedChunks')
const totalChunksSpan = document.getElementById('totalChunks')
const uploadSpeedSpan = document.getElementById('uploadSpeed')
const timeRemainingSpan = document.getElementById('timeRemaining')
const retryCountSpan = document.getElementById('retryCount')
const failedChunksSpan = document.getElementById('failedChunks')
const chunksGrid = document.getElementById('chunksGrid')
const log = document.getElementById('log')
const status = document.getElementById('status')

let selectedFile = null
let uploader = null

// 文件选择
uploadArea.addEventListener('click', () => fileInput.click())

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadArea.classList.add('active')
})

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('active')
})

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadArea.classList.remove('active')
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFileSelect(files[0])
  }
})

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0])
  }
})

function handleFileSelect(file) {
  selectedFile = file
  fileName.textContent = `文件名: ${file.name}`
  fileSize.textContent = `大小: ${formatSize(file.size)}`
  fileInfo.classList.add('show')
  startBtn.disabled = false

  const chunkSize = parseInt(chunkSizeSelect.value)
  const totalChunks = Math.ceil(file.size / chunkSize)

  chunksGrid.innerHTML = ''
  for (let i = 0; i < totalChunks; i++) {
    const chunk = document.createElement('div')
    chunk.className = 'chunk'
    chunk.dataset.index = i
    chunk.dataset.tooltip = `分片 ${i}`
    chunksGrid.appendChild(chunk)
  }

  totalChunksSpan.textContent = totalChunks
  progressContainer.classList.add('show')
  resetUI()
}

// 开始上传
startBtn.addEventListener('click', async () => {
  if (!selectedFile) return

  uploader = new ChunkedUploader(selectedFile, {
    chunkSize: parseInt(chunkSizeSelect.value),
    concurrency: parseInt(concurrencyInput.value),
    maxRetries: parseInt(maxRetriesInput.value),
    failureRate: parseFloat(failureRateSelect.value),
    onProgress: updateProgress,
    onChunkUpdate: updateChunkUI,
    onLog: addLog,
  })

  startBtn.disabled = true
  pauseBtn.disabled = false
  cancelBtn.disabled = false
  chunkSizeSelect.disabled = true
  concurrencyInput.disabled = true
  maxRetriesInput.disabled = true
  failureRateSelect.disabled = true

  status.classList.remove('show')

  const result = await uploader.upload()

  startBtn.disabled = false
  pauseBtn.disabled = true
  resumeBtn.disabled = true
  cancelBtn.disabled = true

  showStatus(result.success ? 'success' : 'error', result.message)
})

// 暂停
pauseBtn.addEventListener('click', () => {
  if (uploader) {
    uploader.pause()
    pauseBtn.disabled = true
    resumeBtn.disabled = false
  }
})

// 继续
resumeBtn.addEventListener('click', () => {
  if (uploader) {
    uploader.resume()
    pauseBtn.disabled = false
    resumeBtn.disabled = true
  }
})

// 取消
cancelBtn.addEventListener('click', () => {
  if (uploader) {
    uploader.cancel()
    pauseBtn.disabled = true
    resumeBtn.disabled = true
    cancelBtn.disabled = true
  }
})

function updateProgress(data) {
  const {
    progress,
    uploadedChunks,
    totalChunks,
    speed,
    remaining,
    retryCount,
    failedChunks,
  } = data

  progressText.textContent = `${progress.toFixed(1)}%`
  progressFill.style.width = `${progress}%`
  progressFill.textContent = `${progress.toFixed(1)}%`

  uploadedChunksSpan.textContent = uploadedChunks
  totalChunksSpan.textContent = totalChunks
  uploadSpeedSpan.textContent = formatSpeed(speed)
  timeRemainingSpan.textContent = formatTime(remaining)
  retryCountSpan.textContent = retryCount
  failedChunksSpan.textContent = failedChunks
}

function updateChunkUI(index, status) {
  const chunk = chunksGrid.querySelector(`[data-index="${index}"]`)
  if (chunk) {
    chunk.className = `chunk ${status}`
    chunk.dataset.tooltip = `分片 ${index} - ${getStatusText(status)}`
  }
}

function getStatusText(status) {
  const statusMap = {
    uploading: '上传中',
    success: '成功',
    error: '失败',
    retry: '重试中',
  }
  return statusMap[status] || '等待中'
}

function addLog(level, message) {
  const entry = document.createElement('div')
  entry.className = `log-entry ${level}`
  const timestamp = new Date().toLocaleTimeString()
  entry.textContent = `[${timestamp}] ${message}`
  log.appendChild(entry)
  log.scrollTop = log.scrollHeight
}

function showStatus(type, message) {
  status.className = `status show ${type}`
  status.textContent = message
}

function resetUI() {
  progressText.textContent = '0%'
  progressFill.style.width = '0%'
  progressFill.textContent = '0%'
  uploadedChunksSpan.textContent = '0'
  uploadSpeedSpan.textContent = '0 KB/s'
  timeRemainingSpan.textContent = '--:--'
  retryCountSpan.textContent = '0'
  failedChunksSpan.textContent = '0'
  log.innerHTML = ''
  status.classList.remove('show')

  const chunks = chunksGrid.querySelectorAll('.chunk')
  chunks.forEach((chunk) => {
    chunk.className = 'chunk'
    chunk.dataset.tooltip = `分片 ${chunk.dataset.index}`
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatSpeed(bytesPerSecond) {
  if (bytesPerSecond < 1024) return bytesPerSecond.toFixed(0) + ' B/s'
  if (bytesPerSecond < 1024 * 1024)
    return (bytesPerSecond / 1024).toFixed(1) + ' KB/s'
  return (bytesPerSecond / (1024 * 1024)).toFixed(1) + ' MB/s'
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
