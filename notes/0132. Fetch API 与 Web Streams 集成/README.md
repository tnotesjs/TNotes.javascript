# [0132. Fetch API 与 Web Streams 集成](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0132.%20Fetch%20API%20%E4%B8%8E%20Web%20Streams%20%E9%9B%86%E6%88%90)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 🤔 如何使用流式处理来显示下载进度 ？](#3--如何使用流式处理来显示下载进度-)
  - [3.1. 基本实现](#31-基本实现)
  - [3.2. 使用 TransformStream 实现](#32-使用-transformstream-实现)
  - [3.3. 带速度计算的进度](#33-带速度计算的进度)
  - [3.4. 实战：图片下载并预览](#34-实战图片下载并预览)
- [4. 🤔 为什么不能直接将 Response.body 用于多个读取器 ？](#4--为什么不能直接将-responsebody-用于多个读取器-)
  - [4.1. 锁定机制演示](#41-锁定机制演示)
  - [4.2. 使用 tee() 实现多次读取](#42-使用-tee-实现多次读取)
  - [4.3. 实战：同时缓存和处理响应](#43-实战同时缓存和处理响应)
  - [4.4. 多个消费者的场景](#44-多个消费者的场景)
  - [4.5. 锁定的替代方案：先读取全部数据](#45-锁定的替代方案先读取全部数据)
  - [4.6. 对比表格](#46-对比表格)
- [5. 🤔 如何实现大文件的分块上传 ？](#5--如何实现大文件的分块上传-)
  - [5.1. 基础分块上传](#51-基础分块上传)
  - [5.2. 使用 ReadableStream 流式上传](#52-使用-readablestream-流式上传)
  - [5.3. 带进度监控的流式上传](#53-带进度监控的流式上传)
  - [5.4. 断点续传实现](#54-断点续传实现)
  - [5.5. 并发分块上传](#55-并发分块上传)
- [6. 🤔 如何处理流式 JSON 数据 ？](#6--如何处理流式-json-数据-)
  - [6.1. 解析 NDJSON（换行分隔 JSON）](#61-解析-ndjson换行分隔-json)
  - [6.2. 解析流式 JSON 数组](#62-解析流式-json-数组)
  - [6.3. 使用正则表达式解析](#63-使用正则表达式解析)
  - [6.4. 实战：处理大型 API 响应](#64-实战处理大型-api-响应)
  - [6.5. 处理服务器发送事件（SSE）](#65-处理服务器发送事件sse)
- [7. 💻 demos.1 - 实现带进度条的文件下载](#7--demos1---实现带进度条的文件下载)
- [8. 💻 demos.2 - 流式处理服务器发送事件 SSE](#8--demos2---流式处理服务器发送事件-sse)
- [9. 引用](#9-引用)

<!-- endregion:toc -->

## 1. 本节内容

- Response.body 的 ReadableStream 类型
- Request.body 的构造与使用
- 下载进度监控的实现方式
- 分块上传的流式处理
- 流式 JSON 解析的基础场景
- SSE（Server-Sent Events）的流式处理

## 2. 评价

Fetch API 与 Web Streams 的集成是现代网络应用的核心能力。Response.body 和 Request.body 都是 ReadableStream，支持流式读取和写入。下载进度通过读取器逐块统计实现，上传进度需配合服务器支持。流式 JSON 解析适合处理大型数组或 NDJSON 格式。理解流锁定机制很重要，Response.body 一旦被读取就会锁定，需用 tee() 实现多次消费。

## 3. 🤔 如何使用流式处理来显示下载进度 ？

通过 Response.body 的 ReadableStream 逐块读取，累计已接收字节数，结合 Content-Length 计算进度百分比。

### 3.1. 基本实现

```js
async function downloadWithProgress(url, onProgress) {
  const response = await fetch(url)

  // 获取总大小
  const contentLength = response.headers.get('Content-Length')
  const total = parseInt(contentLength, 10)

  if (!total) {
    console.warn('服务器未提供 Content-Length')
  }

  const reader = response.body.getReader()
  let receivedLength = 0
  const chunks = []

  while (true) {
    const { done, value } = await reader.read()

    if (done) break

    chunks.push(value)
    receivedLength += value.length

    // 触发进度回调
    const progress = total ? (receivedLength / total) * 100 : 0
    onProgress({ receivedLength, total, progress })
  }

  // 合并所有块
  const allChunks = new Uint8Array(receivedLength)
  let position = 0
  for (const chunk of chunks) {
    allChunks.set(chunk, position)
    position += chunk.length
  }

  return allChunks
}

// 使用
const data = await downloadWithProgress('/api/large-file', (progress) => {
  console.log(`已下载: ${progress.progress.toFixed(2)}%`)
  console.log(`${progress.receivedLength} / ${progress.total} 字节`)
})
```

### 3.2. 使用 TransformStream 实现

```js
function createProgressStream(total, onProgress) {
  let loaded = 0

  return new TransformStream({
    transform(chunk, controller) {
      loaded += chunk.byteLength
      const progress = total ? (loaded / total) * 100 : 0

      onProgress({ loaded, total, progress })
      controller.enqueue(chunk)
    },
  })
}

async function downloadWithProgressStream(url) {
  const response = await fetch(url)
  const total = parseInt(response.headers.get('Content-Length'), 10)

  const progressStream = createProgressStream(total, (progress) => {
    updateProgressBar(progress.progress)
  })

  // 管道处理
  const processedStream = response.body.pipeThrough(progressStream)

  // 继续处理数据
  await processedStream.pipeTo(
    new WritableStream({
      write(chunk) {
        saveChunk(chunk)
      },
    }),
  )
}
```

### 3.3. 带速度计算的进度

```js
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
    const loadedDiff = this.loaded - this.lastLoaded

    // 计算即时速度
    const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0

    // 计算剩余时间
    const remaining = this.total - this.loaded
    const eta = speed > 0 ? remaining / speed : 0

    this.lastTime = now
    this.lastLoaded = this.loaded

    return {
      progress: this.total ? (this.loaded / this.total) * 100 : 0,
      loaded: this.loaded,
      total: this.total,
      speed,
      eta,
    }
  }
}

async function downloadWithStats(url) {
  const response = await fetch(url)
  const total = parseInt(response.headers.get('Content-Length'), 10)
  const monitor = new DownloadMonitor(total)

  const reader = response.body.getReader()
  const chunks = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    chunks.push(value)
    const stats = monitor.update(value.length)

    console.log(`进度: ${stats.progress.toFixed(1)}%`)
    console.log(`速度: ${(stats.speed / 1024).toFixed(2)} KB/s`)
    console.log(`剩余时间: ${stats.eta.toFixed(0)} 秒`)
  }

  return new Blob(chunks)
}
```

### 3.4. 实战：图片下载并预览

```js
async function downloadImageWithProgress(url, imgElement, progressCallback) {
  const response = await fetch(url)
  const total = parseInt(response.headers.get('Content-Length'), 10)

  const stream = response.body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        progressCallback({
          loaded: (controller.loaded =
            (controller.loaded || 0) + chunk.byteLength),
          total,
        })
        controller.enqueue(chunk)
      },
    }),
  )

  // 转换为 Blob
  const blob = await new Response(stream).blob()

  // 显示图片
  imgElement.src = URL.createObjectURL(blob)
}

// 使用
downloadImageWithProgress(
  '/images/large.jpg',
  document.getElementById('preview'),
  ({ loaded, total }) => {
    const percent = ((loaded / total) * 100).toFixed(1)
    document.getElementById('progress').textContent = `${percent}%`
  },
)
```

流式进度的关键是逐块累加，结合 Content-Length 计算百分比。

## 4. 🤔 为什么不能直接将 Response.body 用于多个读取器 ？

因为 ReadableStream 一旦被读取就会锁定，只能有一个活动读取器，需使用 tee() 方法创建分支。

### 4.1. 锁定机制演示

```js
const response = await fetch('/api/data')

// 第一次获取读取器成功
const reader1 = response.body.getReader()

// ❌ 第二次获取读取器失败
try {
  const reader2 = response.body.getReader()
} catch (error) {
  console.error(error.message) // ReadableStream is locked
}

// 检查锁定状态
console.log(response.body.locked) // true

// 释放锁
reader1.releaseLock()
console.log(response.body.locked) // false
```

### 4.2. 使用 tee() 实现多次读取

```js
const response = await fetch('/api/data')

// 创建两个独立分支
const [stream1, stream2] = response.body.tee()

// ⚠️ 原始流已锁定
console.log(response.body.locked) // true

// ✅ 两个分支可独立读取
const reader1 = stream1.getReader()
const reader2 = stream2.getReader()

// 分支 1：保存到缓存
const cache = []
while (true) {
  const { done, value } = await reader1.read()
  if (done) break
  cache.push(value)
}

// 分支 2：显示内容
while (true) {
  const { done, value } = await reader2.read()
  if (done) break
  displayData(value)
}
```

### 4.3. 实战：同时缓存和处理响应

```js
async function fetchAndCache(url) {
  const response = await fetch(url)
  const [cacheStream, processStream] = response.body.tee()

  // 分支 1：缓存到 Cache API
  const cachePromise = caches.open('api-cache').then(async (cache) => {
    await cache.put(
      url,
      new Response(cacheStream, {
        headers: response.headers,
      }),
    )
    console.log('✅ 缓存完成')
  })

  // 分支 2：解析 JSON
  const dataPromise = new Response(processStream).json()

  // 等待两个操作完成
  const [_, data] = await Promise.all([cachePromise, dataPromise])
  return data
}
```

### 4.4. 多个消费者的场景

```js
async function multipleConsumers(url) {
  const response = await fetch(url)

  // 创建三个分支
  const [stream1, temp] = response.body.tee()
  const [stream2, stream3] = temp.tee()

  // 消费者 1：计算哈希
  const hashPromise = stream1.pipeThrough(new TextDecoderStream()).pipeTo(
    new WritableStream({
      write(chunk) {
        updateHash(chunk)
      },
    }),
  )

  // 消费者 2：保存到文件
  const savePromise = stream2.pipeTo(createFileWriteStream('output.txt'))

  // 消费者 3：实时显示
  const displayPromise = stream3.pipeThrough(new TextDecoderStream()).pipeTo(
    new WritableStream({
      write(chunk) {
        console.log(chunk)
      },
    }),
  )

  await Promise.all([hashPromise, savePromise, displayPromise])
}
```

### 4.5. 锁定的替代方案：先读取全部数据

```js
// 方案 1：转换为 ArrayBuffer
const response = await fetch('/api/data')
const buffer = await response.arrayBuffer()

// 可以多次使用
const blob1 = new Blob([buffer])
const blob2 = new Blob([buffer])
const text = new TextDecoder().decode(buffer)

// 方案 2：转换为 Blob
const blob = await response.blob()
const stream1 = blob.stream()
const stream2 = blob.stream()
```

### 4.6. 对比表格

| 特性 | 直接读取 Response.body | 使用 tee() | 先转换为 Blob/ArrayBuffer |
| --- | --- | --- | --- |
| 内存占用 | 最低（逐块处理） | 中等（需缓冲） | 最高（全部加载） |
| 多次读取 | ❌ 不支持 | ✅ 支持（创建分支） | ✅ 支持（无限次） |
| 流式处理 | ✅ 支持 | ✅ 支持 | ❌ 不支持 |
| 适用场景 | 单次处理大文件 | 同时保存和显示 | 小文件多次使用 |

流锁定是设计特性，确保数据一致性，使用 tee() 或完整读取可绕过限制。

## 5. 🤔 如何实现大文件的分块上传 ？

将文件分割成多个块，逐个上传，每块创建独立的 fetch 请求，或使用 ReadableStream 作为 Request.body。

### 5.1. 基础分块上传

```js
async function uploadFileInChunks(file, url, chunkSize = 1024 * 1024) {
  const totalChunks = Math.ceil(file.size / chunkSize)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Chunk-Index': i,
        'X-Total-Chunks': totalChunks,
        'X-File-Name': file.name,
      },
      body: chunk,
    })

    const progress = ((i + 1) / totalChunks) * 100
    console.log(`上传进度: ${progress.toFixed(1)}%`)
  }

  console.log('✅ 上传完成')
}

// 使用
const fileInput = document.getElementById('file')
uploadFileInChunks(fileInput.files[0], '/api/upload')
```

### 5.2. 使用 ReadableStream 流式上传

```js
function createFileStream(file, chunkSize = 64 * 1024) {
  let offset = 0

  return new ReadableStream({
    async pull(controller) {
      if (offset >= file.size) {
        controller.close()
        return
      }

      const chunk = file.slice(offset, offset + chunkSize)
      const buffer = await chunk.arrayBuffer()

      controller.enqueue(new Uint8Array(buffer))
      offset += chunkSize
    },
  })
}

async function uploadFileStream(file, url) {
  const stream = createFileStream(file)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': file.name,
      'X-File-Size': file.size,
    },
    body: stream,
    duplex: 'half', // 允许请求体为流
  })

  return response.json()
}
```

### 5.3. 带进度监控的流式上传

```js
function createUploadStream(file, onProgress) {
  let uploaded = 0
  const total = file.size

  return new ReadableStream({
    async pull(controller) {
      const chunkSize = 64 * 1024
      if (uploaded >= total) {
        controller.close()
        return
      }

      const chunk = file.slice(uploaded, uploaded + chunkSize)
      const buffer = await chunk.arrayBuffer()

      controller.enqueue(new Uint8Array(buffer))
      uploaded += buffer.byteLength

      onProgress({
        uploaded,
        total,
        progress: (uploaded / total) * 100,
      })
    },
  })
}

async function uploadWithProgress(file, url) {
  const stream = createUploadStream(file, (progress) => {
    console.log(`上传进度: ${progress.progress.toFixed(1)}%`)
    updateProgressBar(progress.progress)
  })

  await fetch(url, {
    method: 'POST',
    body: stream,
    duplex: 'half',
  })
}
```

### 5.4. 断点续传实现

```js
async function resumableUpload(file, url) {
  // 查询已上传的字节数
  const statusResponse = await fetch(`${url}/status`, {
    method: 'GET',
    headers: { 'X-File-ID': file.name },
  })

  const { uploadedBytes } = await statusResponse.json()
  console.log(`已上传: ${uploadedBytes} 字节，继续上传...`)

  // 从断点处继续
  const remainingData = file.slice(uploadedBytes)

  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 1024 * 1024
      let offset = 0

      while (offset < remainingData.size) {
        const chunk = remainingData.slice(offset, offset + chunkSize)
        const buffer = await chunk.arrayBuffer()
        controller.enqueue(new Uint8Array(buffer))
        offset += chunkSize
      }

      controller.close()
    },
  })

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-ID': file.name,
      'X-Upload-Offset': uploadedBytes,
    },
    body: stream,
    duplex: 'half',
  })
}
```

### 5.5. 并发分块上传

```js
async function parallelChunkUpload(file, url, concurrency = 3) {
  const chunkSize = 1024 * 1024
  const totalChunks = Math.ceil(file.size / chunkSize)

  // 创建上传任务队列
  const uploadChunk = async (index) => {
    const start = index * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    await fetch(url, {
      method: 'POST',
      headers: {
        'X-Chunk-Index': index,
        'X-Total-Chunks': totalChunks,
      },
      body: chunk,
    })

    return index
  }

  // 并发控制
  const results = []
  for (let i = 0; i < totalChunks; i += concurrency) {
    const batch = []
    for (let j = 0; j < concurrency && i + j < totalChunks; j++) {
      batch.push(uploadChunk(i + j))
    }
    const batchResults = await Promise.all(batch)
    results.push(...batchResults)

    console.log(`已完成: ${results.length}/${totalChunks} 块`)
  }

  // 通知服务器合并
  await fetch(`${url}/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalChunks, fileName: file.name }),
  })
}
```

流式上传的关键是将 ReadableStream 作为 Request.body，配合 duplex: 'half' 选项。

## 6. 🤔 如何处理流式 JSON 数据 ？

对于 JSON 数组或 NDJSON 格式，使用 TransformStream 逐行解析，避免一次性加载大型 JSON。

### 6.1. 解析 NDJSON（换行分隔 JSON）

```js
function createNDJSONParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop() // 保留不完整的行

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
      // 处理最后一行
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

async function processNDJSON(url) {
  const response = await fetch(url)

  await response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createNDJSONParser())
    .pipeTo(
      new WritableStream({
        write(obj) {
          console.log('解析对象:', obj)
          processObject(obj)
        },
      }),
    )
}
```

### 6.2. 解析流式 JSON 数组

```js
function createJSONArrayParser() {
  let buffer = ''
  let depth = 0
  let inArray = false

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      let objStart = -1

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i]

        if (char === '[' && depth === 0) {
          inArray = true
          depth++
          continue
        }

        if (!inArray) continue

        if (char === '{' && depth === 1) {
          objStart = i
        }

        if (char === '{') depth++
        if (char === '}') depth--

        // 找到完整对象
        if (depth === 1 && objStart !== -1 && char === '}') {
          const objStr = buffer.substring(objStart, i + 1)
          try {
            const obj = JSON.parse(objStr)
            controller.enqueue(obj)
          } catch (error) {
            console.error('解析错误:', objStr)
          }

          buffer = buffer.substring(i + 1)
          i = 0
          objStart = -1
        }
      }
    },
  })
}

async function processJSONArray(url) {
  const response = await fetch(url)

  await response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createJSONArrayParser())
    .pipeTo(
      new WritableStream({
        write(item) {
          console.log('数组项:', item)
        },
      }),
    )
}
```

### 6.3. 使用正则表达式解析

```js
function createSimpleJSONStreamParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      // 匹配 JSON 对象（简单版本）
      const regex = /\{[^{}]*\}/g
      let match

      while ((match = regex.exec(buffer)) !== null) {
        try {
          const obj = JSON.parse(match[0])
          controller.enqueue(obj)
        } catch (error) {
          // 不完整的对象，继续缓冲
        }
      }

      // 保留未匹配的部分
      const lastMatch = buffer.lastIndexOf('}')
      if (lastMatch !== -1) {
        buffer = buffer.substring(lastMatch + 1)
      }
    },
  })
}
```

### 6.4. 实战：处理大型 API 响应

```js
async function fetchLargeDataset(url) {
  const response = await fetch(url)

  const stats = { count: 0, totalSize: 0 }
  const results = []

  await response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createNDJSONParser())
    .pipeThrough(
      new TransformStream({
        transform(obj, controller) {
          // 数据过滤
          if (obj.status === 'active') {
            controller.enqueue(obj)
          }
        },
      }),
    )
    .pipeTo(
      new WritableStream({
        write(obj) {
          results.push(obj)
          stats.count++
          stats.totalSize += JSON.stringify(obj).length

          // 每 100 条批量处理
          if (results.length >= 100) {
            processBatch(results.splice(0, 100))
          }
        },
        close() {
          // 处理剩余数据
          if (results.length > 0) {
            processBatch(results)
          }
          console.log(`处理完成: ${stats.count} 条记录`)
        },
      }),
    )
}
```

### 6.5. 处理服务器发送事件（SSE）

```js
function createSSEParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      const lines = buffer.split('\n\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim()
          try {
            const obj = JSON.parse(data)
            controller.enqueue(obj)
          } catch {
            controller.enqueue({ raw: data })
          }
        }
      }
    },
  })
}

async function listenToSSE(url) {
  const response = await fetch(url)

  await response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createSSEParser())
    .pipeTo(
      new WritableStream({
        write(event) {
          console.log('SSE 事件:', event)
          handleEvent(event)
        },
      }),
    )
}
```

流式 JSON 解析适合处理大数据集，关键是逐行或逐对象解析，避免内存溢出。

## 7. 💻 demos.1 - 实现带进度条的文件下载

演示如何使用 ReadableStream 实现文件下载进度监控，包括下载速度、剩余时间等统计信息。

**运行方式**：在浏览器中打开 [demos/1/1.html](demos/1/1.html)

**核心功能**：

- 模拟不同大小文件的下载
- 实时显示下载进度百分比
- 计算下载速度和剩余时间
- 逐块累加数据并最终合并

**关键代码**：

```js
class DownloadMonitor {
  constructor(total) {
    this.total = total
    this.loaded = 0
    this.startTime = Date.now()
  }

  update(chunkSize) {
    this.loaded += chunkSize
    const elapsed = (Date.now() - this.startTime) / 1000
    const speed = this.loaded / elapsed
    const eta = (this.total - this.loaded) / speed

    return {
      progress: (this.loaded / this.total) * 100,
      speed,
      eta,
    }
  }
}

const reader = stream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const stats = monitor.update(value.length)
  updateUI(stats)
}
```

## 8. 💻 demos.2 - 流式处理服务器发送事件 SSE

演示如何解析 SSE（Server-Sent Events）和 NDJSON 格式的流式数据，实时显示事件和统计信息。

**运行方式**：在浏览器中打开 [demos/2/2.html](demos/2/2.html)

**核心功能**：

- SSE 事件流的解析
- NDJSON 格式的逐行解析
- 实时统计事件数量和数据量
- 支持启动、停止连接

**关键代码**：

```js
function createSSEParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk

      const events = buffer.split('\n\n')
      buffer = events.pop()

      for (const event of events) {
        const parsed = {}
        for (const line of event.split('\n')) {
          if (line.startsWith('data:')) {
            parsed.data = line.substring(5).trim()
          }
        }
        if (parsed.data) controller.enqueue(parsed)
      }
    },
  })
}

await stream
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(createSSEParser())
  .pipeTo(new WritableStream({ write: handleEvent }))
```

## 9. 引用

- [Fetch Standard - Request Body][1]
- [Fetch Standard - Response Body][2]
- [MDN - Using Fetch][3]
- [MDN - ReadableStream][4]
- [Server-Sent Events Specification][5]

[1]: https://fetch.spec.whatwg.org/#concept-request-body
[2]: https://fetch.spec.whatwg.org/#concept-response-body
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[4]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[5]: https://html.spec.whatwg.org/multipage/server-sent-events.html
