const progressBar = document.getElementById('progressBar')
const downloadedEl = document.getElementById('downloaded')
const totalSizeEl = document.getElementById('totalSize')
const speedEl = document.getElementById('speed')
const etaEl = document.getElementById('eta')
const logEl = document.getElementById('log')

function log(message, type = 'info') {
  const entry = document.createElement('div')
  entry.className = `log-entry ${type}`
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
  logEl.appendChild(entry)
  logEl.scrollTop = logEl.scrollHeight
}

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2)
}

function formatSpeed(bytesPerSecond) {
  return (bytesPerSecond / 1024).toFixed(2)
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

// 模拟生成数据流
function createMockDataStream(totalBytes, chunkSize = 64 * 1024, delayMs = 10) {
  let sent = 0

  return new ReadableStream({
    async pull(controller) {
      if (sent >= totalBytes) {
        controller.close()
        return
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs))

      const remaining = totalBytes - sent
      const currentChunkSize = Math.min(chunkSize, remaining)
      const chunk = new Uint8Array(currentChunkSize)

      // 填充随机数据
      for (let i = 0; i < currentChunkSize; i++) {
        chunk[i] = Math.floor(Math.random() * 256)
      }

      controller.enqueue(chunk)
      sent += currentChunkSize
    },
  })
}

// 下载监控类
class DownloadMonitor {
  constructor(total) {
    this.total = total
    this.loaded = 0
    this.startTime = Date.now()
    this.lastTime = this.startTime
    this.lastLoaded = 0
  }

  update(chunkSize) {
    this.loaded += chunkSize
    const now = Date.now()
    const timeDiff = (now - this.lastTime) / 1000

    // 即时速度
    const speed =
      timeDiff > 0.1 ? (this.loaded - this.lastLoaded) / timeDiff : 0

    // 平均速度
    const avgSpeed = (this.loaded / (now - this.startTime)) * 1000

    // 剩余时间
    const remaining = this.total - this.loaded
    const eta = avgSpeed > 0 ? remaining / avgSpeed : Infinity

    // 进度百分比
    const progress = this.total > 0 ? (this.loaded / this.total) * 100 : 0

    this.lastTime = now
    this.lastLoaded = this.loaded

    return {
      loaded: this.loaded,
      total: this.total,
      progress,
      speed: avgSpeed,
      eta,
    }
  }
}

// 带进度的下载函数
async function downloadWithProgress(stream, totalBytes) {
  log(`开始下载，总大小: ${formatBytes(totalBytes)} MB`)

  const monitor = new DownloadMonitor(totalBytes)
  const reader = stream.getReader()
  const chunks = []

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        log('✅ 下载完成', 'success')
        break
      }

      chunks.push(value)
      const stats = monitor.update(value.length)

      // 更新 UI
      progressBar.style.width = `${stats.progress}%`
      progressBar.textContent = `${stats.progress.toFixed(1)}%`
      downloadedEl.textContent = `${formatBytes(stats.loaded)} MB`
      totalSizeEl.textContent = `${formatBytes(stats.total)} MB`
      speedEl.textContent = `${formatSpeed(stats.speed)} KB/s`
      etaEl.textContent = formatTime(stats.eta)

      // 每 1MB 记录一次日志
      if (chunks.length % 16 === 0) {
        log(
          `进度: ${stats.progress.toFixed(1)}% | 速度: ${formatSpeed(
            stats.speed
          )} KB/s`
        )
      }
    }

    // 合并所有块
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    log(`下载完成，共 ${formatBytes(result.length)} MB`, 'success')
    return result
  } catch (error) {
    log(`❌ 下载失败: ${error.message}`, 'error')
    throw error
  }
}

// 重置 UI
function resetUI() {
  progressBar.style.width = '0%'
  progressBar.textContent = '0%'
  downloadedEl.textContent = '0 MB'
  totalSizeEl.textContent = '0 MB'
  speedEl.textContent = '0 KB/s'
  etaEl.textContent = '--'
}

// 事件监听
document.getElementById('downloadSmall').addEventListener('click', async () => {
  resetUI()
  logEl.innerHTML = ''
  const stream = createMockDataStream(1 * 1024 * 1024, 64 * 1024, 5)
  await downloadWithProgress(stream, 1 * 1024 * 1024)
})

document
  .getElementById('downloadMedium')
  .addEventListener('click', async () => {
    resetUI()
    logEl.innerHTML = ''
    const stream = createMockDataStream(5 * 1024 * 1024, 64 * 1024, 5)
    await downloadWithProgress(stream, 5 * 1024 * 1024)
  })

document.getElementById('downloadLarge').addEventListener('click', async () => {
  resetUI()
  logEl.innerHTML = ''
  const stream = createMockDataStream(10 * 1024 * 1024, 64 * 1024, 5)
  await downloadWithProgress(stream, 10 * 1024 * 1024)
})

document.getElementById('downloadSlow').addEventListener('click', async () => {
  resetUI()
  logEl.innerHTML = ''
  log('⚠️ 模拟慢速网络，每块延迟 100ms')
  const stream = createMockDataStream(3 * 1024 * 1024, 32 * 1024, 100)
  await downloadWithProgress(stream, 3 * 1024 * 1024)
})
