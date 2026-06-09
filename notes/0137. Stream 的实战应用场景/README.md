# [0137. Stream 的实战应用场景](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0137.%20Stream%20%E7%9A%84%E5%AE%9E%E6%88%98%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 如何使用流实现大文件的分片上传 ？](#3-如何使用流实现大文件的分片上传-)
  - [3.1. 基本分片上传](#31-基本分片上传)
  - [3.2. 使用流式上传](#32-使用流式上传)
  - [3.3. 带重试的分片上传](#33-带重试的分片上传)
  - [3.4. 并发分片上传](#34-并发分片上传)
  - [3.5. 秒传和断点续传](#35-秒传和断点续传)
- [4. 如何实现支持断点续传的文件下载 ？](#4-如何实现支持断点续传的文件下载-)
  - [4.1. 基本断点续传](#41-基本断点续传)
  - [4.2. 带重试的断点续传](#42-带重试的断点续传)
  - [4.3. 流式写入下载](#43-流式写入下载)
- [5. 视频流播放如何利用流的背压机制 ？](#5-视频流播放如何利用流的背压机制-)
  - [5.1. 基本视频流缓冲](#51-基本视频流缓冲)
  - [5.2. 自适应缓冲策略](#52-自适应缓冲策略)
  - [5.3. 播放进度与缓冲同步](#53-播放进度与缓冲同步)
- [6. 如何流式解析大型 CSV 文件 ？](#6-如何流式解析大型-csv-文件-)
  - [6.1. 基本 CSV 流式解析](#61-基本-csv-流式解析)
  - [6.2. 带验证的 CSV 解析](#62-带验证的-csv-解析)
  - [6.3. CSV 转换和聚合](#63-csv-转换和聚合)
- [7. � demos](#7--demos)
  - [7.1. demos/1: 大文件分片上传](#71-demos1-大文件分片上传)
  - [7.2. demos/2: 断点续传下载](#72-demos2-断点续传下载)
  - [7.3. demos/3: 视频流背压控制](#73-demos3-视频流背压控制)
  - [7.4. demos/4: CSV 流式解析](#74-demos4-csv-流式解析)
- [8. 引用](#8-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 大文件上传与分片处理
- 大文件下载与断点续传
- 视频流播放与缓冲控制
- CSV 文件的流式解析
- WebSocket 数据流处理
- 日志流的实时处理

## 2. 评价

流式处理在实战中解决了大数据量场景的内存和性能问题。大文件上传通过分片和 ReadableStream 实现，避免一次性加载全部内容。断点续传利用 Range 请求头配合流式下载。视频流利用背压机制平衡缓冲区，防止内存溢出。CSV 流式解析通过逐行处理支持 GB 级文件。掌握这些实战场景能显著提升应用的性能和用户体验。

## 3. 如何使用流实现大文件的分片上传 ？

将文件切分成多个分片，使用 ReadableStream 逐片读取并上传，配合进度回调和错误重试机制。

### 3.1. 基本分片上传

```js
async function uploadFileInChunks(file, url, chunkSize = 1024 * 1024) {
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('chunkIndex', chunkIndex)
    formData.append('totalChunks', totalChunks)
    formData.append('fileName', file.name)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`分片 ${chunkIndex} 上传失败`)
    }

    console.log(
      `已上传: ${(((chunkIndex + 1) / totalChunks) * 100).toFixed(1)}%`,
    )
  }

  // 通知服务器合并
  await fetch(`${url}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, totalChunks }),
  })
}
```

### 3.2. 使用流式上传

```js
function createFileUploadStream(file, onProgress) {
  const chunkSize = 64 * 1024
  let offset = 0

  return new ReadableStream({
    async pull(controller) {
      if (offset >= file.size) {
        controller.close()
        return
      }

      const chunk = file.slice(offset, offset + chunkSize)
      const arrayBuffer = await chunk.arrayBuffer()

      controller.enqueue(new Uint8Array(arrayBuffer))
      offset += chunkSize

      if (onProgress) {
        onProgress({
          loaded: offset,
          total: file.size,
          progress: (offset / file.size) * 100,
        })
      }
    },
  })
}

async function uploadWithStream(file, url) {
  const stream = createFileUploadStream(file, (progress) => {
    console.log(`上传进度: ${progress.progress.toFixed(1)}%`)
  })

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': file.name,
      'X-File-Size': file.size,
    },
    body: stream,
    duplex: 'half',
  })
}
```

### 3.3. 带重试的分片上传

```js
class ChunkedUploader {
  constructor(file, url, options = {}) {
    this.file = file
    this.url = url
    this.chunkSize = options.chunkSize || 1024 * 1024
    this.maxRetries = options.maxRetries || 3
    this.onProgress = options.onProgress
  }

  async uploadChunk(chunk, index, totalChunks) {
    let retries = 0

    while (retries < this.maxRetries) {
      try {
        const formData = new FormData()
        formData.append('file', chunk)
        formData.append('chunkIndex', index)
        formData.append('totalChunks', totalChunks)
        formData.append('fileName', this.file.name)

        const response = await fetch(this.url, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        retries++
        console.warn(
          `分片 ${index} 上传失败（尝试 ${retries}/${this.maxRetries}）`,
        )

        if (retries >= this.maxRetries) {
          throw new Error(`分片 ${index} 上传失败: ${error.message}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }
  }

  async upload() {
    const totalChunks = Math.ceil(this.file.size / this.chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, this.file.size)
      const chunk = this.file.slice(start, end)

      await this.uploadChunk(chunk, i, totalChunks)

      if (this.onProgress) {
        this.onProgress({
          chunkIndex: i,
          totalChunks,
          progress: ((i + 1) / totalChunks) * 100,
        })
      }
    }

    // 合并分片
    await fetch(`${this.url}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: this.file.name,
        totalChunks,
        fileSize: this.file.size,
      }),
    })
  }
}

// 使用
const uploader = new ChunkedUploader(file, '/api/upload', {
  chunkSize: 2 * 1024 * 1024,
  maxRetries: 3,
  onProgress: (progress) => {
    updateProgressBar(progress.progress)
  },
})

await uploader.upload()
```

### 3.4. 并发分片上传

```js
async function parallelChunkUpload(file, url, concurrency = 3) {
  const chunkSize = 1024 * 1024
  const totalChunks = Math.ceil(file.size / chunkSize)
  const uploadedChunks = new Set()

  async function uploadChunk(index) {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('chunkIndex', index)

    await fetch(url, { method: 'POST', body: formData })
    uploadedChunks.add(index)

    console.log(`完成: ${uploadedChunks.size}/${totalChunks}`)
  }

  // 创建任务队列
  const tasks = []
  for (let i = 0; i < totalChunks; i++) {
    tasks.push(uploadChunk(i))

    // 控制并发数
    if (tasks.length >= concurrency) {
      await Promise.race(tasks.map((t) => t.catch(() => {})))
      tasks.splice(
        tasks.findIndex((t) => uploadedChunks.has(tasks.indexOf(t))),
        1,
      )
    }
  }

  await Promise.all(tasks)
}
```

### 3.5. 秒传和断点续传

```js
async function smartUpload(file, url) {
  // 计算文件哈希
  const hash = await calculateFileHash(file)

  // 检查文件是否已存在（秒传）
  const checkResponse = await fetch(`${url}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash, fileName: file.name }),
  })

  const { exists, uploadedChunks } = await checkResponse.json()

  if (exists) {
    console.log('文件已存在，秒传完成')
    return
  }

  // 断点续传：跳过已上传的分片
  const chunkSize = 1024 * 1024
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    if (uploadedChunks && uploadedChunks.includes(i)) {
      console.log(`跳过已上传的分片 ${i}`)
      continue
    }

    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    await uploadChunk(chunk, i, hash)
  }

  // 合并
  await fetch(`${url}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash, fileName: file.name, totalChunks }),
  })
}

async function calculateFileHash(file) {
  const chunkSize = 2 * 1024 * 1024
  const chunks = Math.ceil(file.size / chunkSize)
  const spark = new SparkMD5.ArrayBuffer()

  for (let i = 0; i < chunks; i++) {
    const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize)
    const arrayBuffer = await chunk.arrayBuffer()
    spark.append(arrayBuffer)
  }

  return spark.end()
}
```

分片上传适合大文件，结合重试、并发、秒传能提升可靠性和效率。

## 4. 如何实现支持断点续传的文件下载 ？

使用 HTTP Range 请求头获取部分内容，记录已下载的字节数，中断后从断点处继续。

### 4.1. 基本断点续传

```js
async function resumableDownload(url, fileName) {
  const storage = localStorage
  const key = `download_${fileName}`

  // 读取已下载的字节数
  let downloadedBytes = parseInt(storage.getItem(key) || '0', 10)

  // 获取文件总大小
  const headResponse = await fetch(url, { method: 'HEAD' })
  const totalSize = parseInt(headResponse.headers.get('Content-Length'), 10)

  if (downloadedBytes >= totalSize) {
    console.log('文件已下载完成')
    return
  }

  console.log(`从 ${downloadedBytes} 字节处继续下载`)

  // 使用 Range 请求
  const response = await fetch(url, {
    headers: {
      Range: `bytes=${downloadedBytes}-`,
    },
  })

  const reader = response.body.getReader()
  const chunks = []

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        console.log('下载完成')
        storage.removeItem(key)
        break
      }

      chunks.push(value)
      downloadedBytes += value.length

      // 保存进度
      storage.setItem(key, downloadedBytes.toString())

      console.log(`进度: ${((downloadedBytes / totalSize) * 100).toFixed(1)}%`)
    }

    // 合并数据
    const blob = new Blob(chunks)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  } catch (error) {
    console.error('下载中断:', error)
    console.log(`已保存进度: ${downloadedBytes} 字节`)
  }
}
```

### 4.2. 带重试的断点续传

```js
class ResumableDownloader {
  constructor(url, fileName, options = {}) {
    this.url = url
    this.fileName = fileName
    this.chunkSize = options.chunkSize || 1024 * 1024
    this.maxRetries = options.maxRetries || 3
    this.onProgress = options.onProgress
    this.storageKey = `download_${fileName}`
  }

  async getFileSize() {
    const response = await fetch(this.url, { method: 'HEAD' })
    return parseInt(response.headers.get('Content-Length'), 10)
  }

  getDownloadedBytes() {
    return parseInt(localStorage.getItem(this.storageKey) || '0', 10)
  }

  saveProgress(bytes) {
    localStorage.setItem(this.storageKey, bytes.toString())
  }

  clearProgress() {
    localStorage.removeItem(this.storageKey)
  }

  async downloadChunk(start, end) {
    let retries = 0

    while (retries < this.maxRetries) {
      try {
        const response = await fetch(this.url, {
          headers: { Range: `bytes=${start}-${end}` },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        return await response.arrayBuffer()
      } catch (error) {
        retries++
        console.warn(`下载失败（尝试 ${retries}/${this.maxRetries}）`)

        if (retries >= this.maxRetries) {
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }
  }

  async download() {
    const totalSize = await this.getFileSize()
    let downloadedBytes = this.getDownloadedBytes()

    const chunks = []

    while (downloadedBytes < totalSize) {
      const end = Math.min(downloadedBytes + this.chunkSize - 1, totalSize - 1)

      const chunk = await this.downloadChunk(downloadedBytes, end)
      chunks.push(chunk)

      downloadedBytes += chunk.byteLength
      this.saveProgress(downloadedBytes)

      if (this.onProgress) {
        this.onProgress({
          loaded: downloadedBytes,
          total: totalSize,
          progress: (downloadedBytes / totalSize) * 100,
        })
      }
    }

    this.clearProgress()

    // 保存文件
    const blob = new Blob(chunks)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = this.fileName
    link.click()
  }
}

// 使用
const downloader = new ResumableDownloader(
  'https://example.com/large-file.zip',
  'file.zip',
  {
    chunkSize: 2 * 1024 * 1024,
    maxRetries: 3,
    onProgress: (progress) => {
      console.log(`下载进度: ${progress.progress.toFixed(1)}%`)
    },
  },
)

await downloader.download()
```

### 4.3. 流式写入下载

```js
async function streamDownload(url, fileName) {
  const response = await fetch(url)
  const totalSize = parseInt(response.headers.get('Content-Length'), 10)

  // 使用 File System Access API
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: fileName,
  })

  const writable = await fileHandle.createWritable()
  let downloaded = 0

  await response.body
    .pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          downloaded += chunk.byteLength
          console.log(`进度: ${((downloaded / totalSize) * 100).toFixed(1)}%`)
          controller.enqueue(chunk)
        },
      }),
    )
    .pipeTo(writable)

  console.log('下载完成')
}
```

断点续传的核心是 Range 请求和进度保存，确保网络中断后能继续下载。

## 5. 视频流播放如何利用流的背压机制 ？

通过监控缓冲区大小，使用背压信号控制数据拉取速度，防止内存溢出和播放卡顿。

### 5.1. 基本视频流缓冲

```js
class VideoStreamPlayer {
  constructor(videoElement, streamUrl) {
    this.video = videoElement
    this.streamUrl = streamUrl
    this.buffer = []
    this.bufferSize = 0
    this.maxBufferSize = 5 * 1024 * 1024 // 5MB
    this.mediaSource = new MediaSource()
    this.sourceBuffer = null
  }

  async init() {
    this.video.src = URL.createObjectURL(this.mediaSource)

    await new Promise((resolve) => {
      this.mediaSource.addEventListener('sourceopen', resolve, { once: true })
    })

    this.sourceBuffer = this.mediaSource.addSourceBuffer(
      'video/mp4; codecs="avc1.64001f"',
    )

    this.sourceBuffer.addEventListener('updateend', () => {
      this.processBuffer()
    })
  }

  async play() {
    const response = await fetch(this.streamUrl)

    await response.body
      .pipeThrough(
        new TransformStream({
          transform: (chunk, controller) => {
            this.bufferSize += chunk.byteLength

            // 背压控制
            if (this.bufferSize > this.maxBufferSize) {
              console.log('缓冲区满，暂停拉取')
              return new Promise((resolve) => {
                const checkBuffer = () => {
                  if (this.bufferSize < this.maxBufferSize / 2) {
                    console.log('缓冲区充足，继续拉取')
                    resolve()
                  } else {
                    setTimeout(checkBuffer, 100)
                  }
                }
                checkBuffer()
              }).then(() => controller.enqueue(chunk))
            }

            controller.enqueue(chunk)
          },
        }),
      )
      .pipeTo(
        new WritableStream({
          write: (chunk) => {
            this.buffer.push(chunk)
            this.processBuffer()
          },
        }),
      )
  }

  processBuffer() {
    if (this.sourceBuffer.updating || this.buffer.length === 0) {
      return
    }

    const chunk = this.buffer.shift()
    this.bufferSize -= chunk.byteLength

    this.sourceBuffer.appendBuffer(chunk)
  }
}
```

### 5.2. 自适应缓冲策略

```js
class AdaptiveVideoBuffer {
  constructor() {
    this.targetBufferSize = 3 * 1024 * 1024 // 3MB 目标
    this.minBufferSize = 1 * 1024 * 1024 // 1MB 最小
    this.maxBufferSize = 10 * 1024 * 1024 // 10MB 最大
    this.currentBufferSize = 0
    this.networkSpeed = 0
  }

  updateNetworkSpeed(bytesReceived, timeElapsed) {
    this.networkSpeed = bytesReceived / timeElapsed
  }

  shouldPullData() {
    // 根据当前缓冲和网络速度决定是否拉取
    if (this.currentBufferSize < this.minBufferSize) {
      return true
    }

    if (this.currentBufferSize > this.maxBufferSize) {
      return false
    }

    // 动态调整目标缓冲大小
    const adaptiveTarget = Math.min(this.networkSpeed * 5, this.maxBufferSize)

    return this.currentBufferSize < adaptiveTarget
  }

  createStream(sourceStream) {
    let lastPullTime = Date.now()
    let pulledBytes = 0

    return sourceStream.pipeThrough(
      new TransformStream({
        transform: async (chunk, controller) => {
          this.currentBufferSize += chunk.byteLength
          pulledBytes += chunk.byteLength

          const now = Date.now()
          const elapsed = (now - lastPullTime) / 1000

          if (elapsed > 1) {
            this.updateNetworkSpeed(pulledBytes, elapsed)
            pulledBytes = 0
            lastPullTime = now
          }

          // 背压控制
          if (!this.shouldPullData()) {
            await new Promise((resolve) => {
              const check = () => {
                if (this.shouldPullData()) {
                  resolve()
                } else {
                  setTimeout(check, 100)
                }
              }
              check()
            })
          }

          controller.enqueue(chunk)
        },
      }),
    )
  }
}
```

### 5.3. 播放进度与缓冲同步

```js
class SyncedVideoPlayer {
  constructor(videoElement) {
    this.video = videoElement
    this.bufferInfo = {
      buffered: 0,
      duration: 0,
    }
  }

  updateBufferInfo() {
    if (this.video.buffered.length > 0) {
      const buffered = this.video.buffered.end(this.video.buffered.length - 1)
      const current = this.video.currentTime
      this.bufferInfo.buffered = buffered - current
      this.bufferInfo.duration = this.video.duration
    }
  }

  getBufferHealth() {
    this.updateBufferInfo()

    if (this.bufferInfo.buffered < 2) {
      return 'critical' // 需要紧急加载
    } else if (this.bufferInfo.buffered < 5) {
      return 'low' // 需要加载
    } else if (this.bufferInfo.buffered < 10) {
      return 'good' // 正常
    } else {
      return 'full' // 暂停加载
    }
  }

  shouldLoadMore() {
    const health = this.getBufferHealth()
    return health === 'critical' || health === 'low'
  }
}
```

背压机制确保视频播放流畅，避免过度缓冲导致内存问题。

## 6. 如何流式解析大型 CSV 文件 ？

使用 TransformStream 逐行解析，避免一次性加载整个文件到内存。

### 6.1. 基本 CSV 流式解析

```js
function createCSVParser() {
  let buffer = ''
  let headers = null
  let lineNumber = 0

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        lineNumber++

        if (!line.trim()) continue

        const values = line.split(',').map((v) => v.trim())

        if (!headers) {
          headers = values
          controller.enqueue({ type: 'header', headers, lineNumber })
        } else {
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          controller.enqueue({ type: 'row', data: row, lineNumber })
        }
      }
    },

    flush(controller) {
      if (buffer.trim()) {
        const values = buffer.split(',').map((v) => v.trim())
        if (headers) {
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          controller.enqueue({
            type: 'row',
            data: row,
            lineNumber: lineNumber + 1,
          })
        }
      }
    },
  })
}

// 使用
async function parseCSV(file) {
  const stream = file.stream()

  await stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createCSVParser())
    .pipeTo(
      new WritableStream({
        write(item) {
          if (item.type === 'header') {
            console.log('列名:', item.headers)
          } else {
            console.log('行数据:', item.data)
          }
        },
      }),
    )
}
```

### 6.2. 带验证的 CSV 解析

```js
function createValidatingCSVParser(schema) {
  let headers = null

  return new TransformStream({
    transform(item, controller) {
      if (item.type === 'header') {
        headers = item.headers
        controller.enqueue(item)
        return
      }

      const errors = []

      // 验证必填字段
      schema.required?.forEach((field) => {
        if (!item.data[field] || item.data[field].trim() === '') {
          errors.push(`缺少必填字段: ${field}`)
        }
      })

      // 验证数据类型
      Object.entries(schema.types || {}).forEach(([field, type]) => {
        const value = item.data[field]

        if (type === 'number' && isNaN(Number(value))) {
          errors.push(`${field} 必须是数字`)
        } else if (type === 'email' && !/@/.test(value)) {
          errors.push(`${field} 必须是有效邮箱`)
        }
      })

      if (errors.length > 0) {
        controller.enqueue({
          type: 'error',
          lineNumber: item.lineNumber,
          errors,
          data: item.data,
        })
      } else {
        controller.enqueue(item)
      }
    },
  })
}

// 使用
const schema = {
  required: ['name', 'email'],
  types: {
    age: 'number',
    email: 'email',
  },
}

await stream
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(createCSVParser())
  .pipeThrough(createValidatingCSVParser(schema))
  .pipeTo(
    new WritableStream({
      write(item) {
        if (item.type === 'error') {
          console.error(`行 ${item.lineNumber} 错误:`, item.errors)
        } else if (item.type === 'row') {
          saveToDatabase(item.data)
        }
      },
    }),
  )
```

### 6.3. CSV 转换和聚合

```js
function createCSVTransformer(transformFn) {
  return new TransformStream({
    transform(item, controller) {
      if (item.type === 'row') {
        try {
          const transformed = transformFn(item.data)
          controller.enqueue({ ...item, data: transformed })
        } catch (error) {
          controller.enqueue({
            type: 'error',
            lineNumber: item.lineNumber,
            errors: [error.message],
            data: item.data,
          })
        }
      } else {
        controller.enqueue(item)
      }
    },
  })
}

function createCSVAggregator() {
  const stats = {
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    fieldStats: {},
  }

  return new TransformStream({
    transform(item, controller) {
      if (item.type === 'row') {
        stats.totalRows++
        stats.validRows++

        Object.entries(item.data).forEach(([key, value]) => {
          if (!stats.fieldStats[key]) {
            stats.fieldStats[key] = { count: 0, empty: 0 }
          }
          stats.fieldStats[key].count++
          if (!value || value.trim() === '') {
            stats.fieldStats[key].empty++
          }
        })
      } else if (item.type === 'error') {
        stats.totalRows++
        stats.errorRows++
      }

      controller.enqueue(item)
    },

    flush(controller) {
      controller.enqueue({ type: 'summary', stats })
    },
  })
}

// 使用
await stream
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(createCSVParser())
  .pipeThrough(
    createCSVTransformer((row) => ({
      ...row,
      age: parseInt(row.age, 10),
      createdAt: new Date().toISOString(),
    })),
  )
  .pipeThrough(createCSVAggregator())
  .pipeTo(
    new WritableStream({
      write(item) {
        if (item.type === 'summary') {
          console.log('统计信息:', item.stats)
        } else if (item.type === 'row') {
          processRow(item.data)
        }
      },
    }),
  )
```

流式 CSV 解析适合处理 GB 级文件，内存占用恒定。

## 7. � demos

### 7.1. demos/1: 大文件分片上传

完整的文件分片上传系统，支持：

- 分片大小配置 (256KB - 5MB)
- 并发上传控制 (1-10 个并发)
- 失败自动重试机制
- 上传进度可视化
- 分片状态网格显示
- 暂停/继续/取消功能
- 模拟网络失败测试

打开 [demos/1/index.html](demos/1/index.html) 查看演示。

### 7.2. demos/2: 断点续传下载

支持断点续传的文件下载管理器，包含：

- 多文件同时下载
- Range 请求断点续传
- 进度保存到 LocalStorage
- 分片并发下载
- 下载速度和剩余时间显示
- 分片状态可视化
- 暂停/继续/取消/清除功能

打开 [demos/2/index.html](demos/2/index.html) 查看演示。

### 7.3. demos/3: 视频流背压控制

实时视频流播放的背压机制演示，展示：

- 视频帧流式生成和渲染
- 缓冲区大小动态控制
- 背压信号激活机制
- 缓冲区健康度监控
- 拉取速率和消费速率对比
- 缓冲区历史图表
- 可调节 FPS 和缓冲参数

打开 [demos/3/index.html](demos/3/index.html) 查看演示。

### 7.4. demos/4: CSV 流式解析

大型 CSV 文件的流式解析工具，功能包括：

- 逐行流式解析，内存占用恒定
- 支持 10 万行测试数据生成
- 数据验证（基础/严格模式）
- 实时数据预览
- 解析速度统计
- 错误行标记和日志
- 导出为 JSON 格式
- 暂停/继续/停止功能

打开 [demos/4/index.html](demos/4/index.html) 查看演示。

## 8. 引用

- [Using Readable Streams - MDN][1]
- [Streams API Concepts - MDN][2]
- [File API - MDN][3]
- [Fetch API - MDN][4]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts
[3]: https://developer.mozilla.org/en-US/docs/Web/API/File_API
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
