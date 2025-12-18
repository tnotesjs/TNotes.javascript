class ResumableDownloader {
  constructor(url, fileName, totalSize, options = {}) {
    this.url = url
    this.fileName = fileName
    this.totalSize = totalSize
    this.chunkSize = options.chunkSize || 1024 * 1024
    this.maxRetries = options.maxRetries || 3
    this.concurrency = options.concurrency || 3
    this.failureRate = options.failureRate || 0
    this.onProgress = options.onProgress
    this.onChunkUpdate = options.onChunkUpdate
    this.onLog = options.onLog

    this.storageKey = `download_${fileName}`
    this.totalChunks = Math.ceil(totalSize / this.chunkSize)
    this.downloadedChunks = this.loadProgress()
    this.failedChunks = new Set()
    this.retryCount = 0
    this.startTime = null
    this.downloadedBytes = 0
    this.isPaused = false
    this.isCanceled = false
    this.activeDownloads = 0
    this.chunks = new Array(this.totalChunks)

    this.calculateDownloadedBytes()
  }

  loadProgress() {
    const saved = localStorage.getItem(this.storageKey)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  }

  saveProgress() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify([...this.downloadedChunks])
    )
  }

  clearProgress() {
    localStorage.removeItem(this.storageKey)
  }

  calculateDownloadedBytes() {
    this.downloadedBytes = 0
    this.downloadedChunks.forEach((index) => {
      const start = index * this.chunkSize
      const end = Math.min(start + this.chunkSize, this.totalSize)
      this.downloadedBytes += end - start
    })
  }

  async downloadChunk(chunkIndex) {
    if (this.downloadedChunks.has(chunkIndex)) {
      this.log('info', `分片 ${chunkIndex} 已下载，跳过`)
      this.updateChunk(chunkIndex, 'success')
      return
    }

    const start = chunkIndex * this.chunkSize
    const end = Math.min(start + this.chunkSize, this.totalSize) - 1

    let retries = 0

    while (retries <= this.maxRetries) {
      if (this.isCanceled) {
        throw new Error('下载已取消')
      }

      while (this.isPaused) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      try {
        this.log('info', `分片 ${chunkIndex} 开始下载 (${start}-${end})`)
        this.updateChunk(chunkIndex, 'downloading')

        const data = await this.mockFetch(start, end, chunkIndex)

        this.chunks[chunkIndex] = data
        this.downloadedChunks.add(chunkIndex)
        this.downloadedBytes += data.byteLength
        this.saveProgress()

        this.log('success', `分片 ${chunkIndex} 下载成功`)
        this.updateChunk(chunkIndex, 'success')

        return
      } catch (error) {
        retries++
        this.retryCount++

        if (retries > this.maxRetries) {
          this.log('error', `分片 ${chunkIndex} 下载失败: ${error.message}`)
          this.failedChunks.add(chunkIndex)
          this.updateChunk(chunkIndex, 'error')
          throw error
        }

        this.log(
          'warning',
          `分片 ${chunkIndex} 下载失败，准备重试 (${retries}/${this.maxRetries})`
        )
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }
  }

  async mockFetch(start, end, chunkIndex) {
    return new Promise((resolve, reject) => {
      const delay = 200 + Math.random() * 300

      setTimeout(() => {
        if (Math.random() < this.failureRate) {
          reject(new Error('网络错误'))
        } else {
          const size = end - start + 1
          const data = new Uint8Array(size)
          resolve(data.buffer)
        }
      }, delay)
    })
  }

  async download() {
    this.startTime = Date.now()
    this.failedChunks.clear()
    this.retryCount = 0
    this.isCanceled = false

    if (this.downloadedChunks.size > 0) {
      this.log(
        'info',
        `从断点继续下载: ${this.downloadedChunks.size}/${this.totalChunks} 分片已完成`
      )
    } else {
      this.log(
        'info',
        `开始下载: ${this.fileName} (${this.formatSize(this.totalSize)})`
      )
    }

    const tasks = []

    for (let i = 0; i < this.totalChunks; i++) {
      if (this.isCanceled) {
        break
      }

      const task = this.downloadChunk(i)
        .then(() => {
          this.activeDownloads--
          this.updateProgress()
        })
        .catch(() => {
          this.activeDownloads--
          this.updateProgress()
        })

      tasks.push(task)
      this.activeDownloads++

      if (this.activeDownloads >= this.concurrency) {
        await Promise.race(tasks)
      }
    }

    await Promise.allSettled(tasks)

    if (this.isCanceled) {
      this.log('warning', '下载已取消，进度已保存')
      return { success: false, message: '下载已取消' }
    }

    if (this.failedChunks.size > 0) {
      this.log('error', `下载失败: ${this.failedChunks.size} 个分片失败`)
      return {
        success: false,
        message: `${this.failedChunks.size} 个分片下载失败`,
      }
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1)
    this.log('success', `下载完成! 耗时: ${duration}s`)
    this.clearProgress()

    // 保存文件
    this.saveFile()

    return { success: true, message: '下载成功' }
  }

  saveFile() {
    const blob = new Blob(this.chunks)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = this.fileName
    link.click()
    URL.revokeObjectURL(link.href)
    this.log('success', `文件已保存: ${this.fileName}`)
  }

  pause() {
    this.isPaused = true
    this.log('warning', '下载已暂停')
  }

  resume() {
    this.isPaused = false
    this.log('info', '下载已恢复')
  }

  cancel() {
    this.isCanceled = true
    this.saveProgress()
    this.log('warning', '下载已取消，进度已保存')
  }

  updateProgress() {
    if (this.onProgress) {
      const progress = (this.downloadedChunks.size / this.totalChunks) * 100
      const elapsed = (Date.now() - this.startTime) / 1000
      const speed = this.downloadedBytes / elapsed
      const remaining = (this.totalSize - this.downloadedBytes) / speed

      this.onProgress({
        progress,
        downloadedChunks: this.downloadedChunks.size,
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

// 模拟文件列表
const files = [
  {
    name: 'video.mp4',
    size: 50 * 1024 * 1024,
    url: 'https://example.com/video.mp4',
  },
  {
    name: 'document.pdf',
    size: 15 * 1024 * 1024,
    url: 'https://example.com/document.pdf',
  },
  {
    name: 'archive.zip',
    size: 100 * 1024 * 1024,
    url: 'https://example.com/archive.zip',
  },
  {
    name: 'image.psd',
    size: 25 * 1024 * 1024,
    url: 'https://example.com/image.psd',
  },
]

const fileList = document.getElementById('fileList')
const log = document.getElementById('log')
const chunkSizeSelect = document.getElementById('chunkSize')
const concurrencyInput = document.getElementById('concurrency')
const maxRetriesInput = document.getElementById('maxRetries')
const failureRateSelect = document.getElementById('failureRate')

const downloaders = new Map()

function renderFiles() {
  fileList.innerHTML = ''

  files.forEach((file, index) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    card.innerHTML = `
      <div class="file-header">
        <div>
          <div class="file-name">📄 ${file.name}</div>
          <div class="file-size">${formatSize(file.size)}</div>
        </div>
        <div class="file-actions">
          <button class="btn btn-primary" data-action="start" data-index="${index}">下载</button>
          <button class="btn btn-secondary" data-action="pause" data-index="${index}" disabled>暂停</button>
          <button class="btn btn-secondary" data-action="resume" data-index="${index}" disabled>继续</button>
          <button class="btn btn-danger" data-action="cancel" data-index="${index}" disabled>取消</button>
          <button class="btn btn-success" data-action="clear" data-index="${index}">清除</button>
        </div>
      </div>
      <div class="progress-section">
        <div class="progress-label">
          <span>进度</span>
          <span class="progress-text">0%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%">0%</div>
        </div>
        <div class="download-stats">
          <div class="stat">
            <div class="stat-label">已下载</div>
            <div class="stat-value downloadedChunks">0</div>
          </div>
          <div class="stat">
            <div class="stat-label">下载速度</div>
            <div class="stat-value downloadSpeed">0 KB/s</div>
          </div>
          <div class="stat">
            <div class="stat-label">剩余时间</div>
            <div class="stat-value timeRemaining">--:--</div>
          </div>
        </div>
        <div class="chunks-view">
          <div class="chunks-grid chunksGrid"></div>
        </div>
      </div>
    `
    fileList.appendChild(card)

    // 创建分片格子
    const chunkSize = parseInt(chunkSizeSelect.value)
    const totalChunks = Math.ceil(file.size / chunkSize)
    const chunksGrid = card.querySelector('.chunksGrid')

    for (let i = 0; i < totalChunks; i++) {
      const chunk = document.createElement('div')
      chunk.className = 'chunk'
      chunk.dataset.index = i
      chunksGrid.appendChild(chunk)
    }
  })
}

fileList.addEventListener('click', async (e) => {
  const action = e.target.dataset.action
  const index = parseInt(e.target.dataset.index)

  if (action === 'start') {
    startDownload(index)
  } else if (action === 'pause') {
    pauseDownload(index)
  } else if (action === 'resume') {
    resumeDownload(index)
  } else if (action === 'cancel') {
    cancelDownload(index)
  } else if (action === 'clear') {
    clearDownload(index)
  }
})

async function startDownload(index) {
  const file = files[index]
  const card = fileList.children[index]

  const downloader = new ResumableDownloader(file.url, file.name, file.size, {
    chunkSize: parseInt(chunkSizeSelect.value),
    concurrency: parseInt(concurrencyInput.value),
    maxRetries: parseInt(maxRetriesInput.value),
    failureRate: parseFloat(failureRateSelect.value),
    onProgress: (data) => updateFileProgress(index, data),
    onChunkUpdate: (chunkIndex, status) =>
      updateChunkUI(index, chunkIndex, status),
    onLog: addLog,
  })

  downloaders.set(index, downloader)

  const startBtn = card.querySelector('[data-action="start"]')
  const pauseBtn = card.querySelector('[data-action="pause"]')
  const cancelBtn = card.querySelector('[data-action="cancel"]')

  startBtn.disabled = true
  pauseBtn.disabled = false
  cancelBtn.disabled = false

  await downloader.download()

  startBtn.disabled = false
  pauseBtn.disabled = true
  cancelBtn.disabled = true
}

function pauseDownload(index) {
  const downloader = downloaders.get(index)
  const card = fileList.children[index]

  if (downloader) {
    downloader.pause()

    const pauseBtn = card.querySelector('[data-action="pause"]')
    const resumeBtn = card.querySelector('[data-action="resume"]')

    pauseBtn.disabled = true
    resumeBtn.disabled = false
  }
}

function resumeDownload(index) {
  const downloader = downloaders.get(index)
  const card = fileList.children[index]

  if (downloader) {
    downloader.resume()

    const pauseBtn = card.querySelector('[data-action="pause"]')
    const resumeBtn = card.querySelector('[data-action="resume"]')

    pauseBtn.disabled = false
    resumeBtn.disabled = true
  }
}

function cancelDownload(index) {
  const downloader = downloaders.get(index)
  const card = fileList.children[index]

  if (downloader) {
    downloader.cancel()

    const pauseBtn = card.querySelector('[data-action="pause"]')
    const resumeBtn = card.querySelector('[data-action="resume"]')
    const cancelBtn = card.querySelector('[data-action="cancel"]')

    pauseBtn.disabled = true
    resumeBtn.disabled = true
    cancelBtn.disabled = true
  }
}

function clearDownload(index) {
  const file = files[index]
  const storageKey = `download_${file.name}`
  localStorage.removeItem(storageKey)

  addLog('info', `已清除 ${file.name} 的下载进度`)

  // 重新渲染
  renderFiles()
}

function updateFileProgress(index, data) {
  const card = fileList.children[index]
  const { progress, downloadedChunks, totalChunks, speed, remaining } = data

  const progressText = card.querySelector('.progress-text')
  const progressFill = card.querySelector('.progress-fill')
  const downloadedChunksSpan = card.querySelector('.downloadedChunks')
  const downloadSpeedSpan = card.querySelector('.downloadSpeed')
  const timeRemainingSpan = card.querySelector('.timeRemaining')

  progressText.textContent = `${progress.toFixed(1)}%`
  progressFill.style.width = `${progress}%`
  progressFill.textContent = `${progress.toFixed(1)}%`
  downloadedChunksSpan.textContent = `${downloadedChunks}/${totalChunks}`
  downloadSpeedSpan.textContent = formatSpeed(speed)
  timeRemainingSpan.textContent = formatTime(remaining)
}

function updateChunkUI(fileIndex, chunkIndex, status) {
  const card = fileList.children[fileIndex]
  const chunk = card.querySelector(`.chunksGrid [data-index="${chunkIndex}"]`)
  if (chunk) {
    chunk.className = `chunk ${status}`
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

renderFiles()
