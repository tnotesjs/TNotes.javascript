# [0138. Stream 性能优化与最佳实践](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0138.%20Stream%20%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E4%B8%8E%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 流处理中容易导致内存泄漏的常见模式有哪些 ？](#3--流处理中容易导致内存泄漏的常见模式有哪些-)
  - [3.1. 未释放 Reader](#31-未释放-reader)
  - [3.2. 未取消的流](#32-未取消的流)
  - [3.3. TransformStream 中积累数据](#33-transformstream-中积累数据)
  - [3.4. 事件监听器泄漏](#34-事件监听器泄漏)
  - [3.5. 循环引用](#35-循环引用)
- [4. 🤔 如何选择合适的 Chunk 大小以平衡性能和内存 ？](#4--如何选择合适的-chunk-大小以平衡性能和内存-)
  - [4.1. 不同场景的推荐大小](#41-不同场景的推荐大小)
  - [4.2. 动态调整 Chunk 大小](#42-动态调整-chunk-大小)
  - [4.3. 基于内存限制调整](#43-基于内存限制调整)
  - [4.4. 性能测试工具](#44-性能测试工具)
- [5. 🤔 在什么情况下可以安全地复用流 ？](#5--在什么情况下可以安全地复用流-)
  - [5.1. 使用 tee() 创建多个读取器](#51-使用-tee-创建多个读取器)
  - [5.2. 缓存流数据](#52-缓存流数据)
  - [5.3. 流的条件复用](#53-流的条件复用)
  - [5.4. ⚠️ 不能复用的情况](#54-️-不能复用的情况)
- [6. 🤔 如何监控和调试流的性能问题 ？](#6--如何监控和调试流的性能问题-)
  - [6.1. 使用 Performance API](#61-使用-performance-api)
  - [6.2. 监控内存使用](#62-监控内存使用)
  - [6.3. 流量统计](#63-流量统计)
  - [6.4. 实时监控仪表板](#64-实时监控仪表板)
- [7. 💻 demos.1 - 诊断并修复内存泄漏问题](#7--demos1---诊断并修复内存泄漏问题)
- [8. 💻 demos.2 - Chunk 大小对性能的影响对比](#8--demos2---chunk-大小对性能的影响对比)
- [9. 💻 demos.3 - 使用 Performance API 监控流性能](#9--demos3---使用-performance-api-监控流性能)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 内存泄漏的常见原因
- Chunk 大小的优化策略
- 流的复用与缓存技巧
- 避免阻塞事件循环
- 性能监控与调试工具
- 最佳实践清单

## 2. 🫧 评价

流的性能优化需要在内存占用、处理速度和代码复杂度之间权衡。内存泄漏多源于未正确释放 reader 或忘记取消流。Chunk 大小直接影响性能，太小增加开销，太大占用内存。流的复用需谨慎，必须确保流未被锁定。使用 Performance API 和 Memory Profiler 可有效诊断问题。遵循最佳实践能避免大部分性能陷阱。

## 3. 🤔 流处理中容易导致内存泄漏的常见模式有哪些 ？

主要包括未释放 reader、未取消流、在 TransformStream 中积累数据、事件监听器未移除等。

### 3.1. 未释放 Reader

```js
// ❌ 错误：获取 reader 后未释放
async function badRead(stream) {
  const reader = stream.getReader()
  const { value } = await reader.read()
  // 忘记调用 reader.releaseLock()
  return value
}

// ✅ 正确：使用 finally 确保释放
async function goodRead(stream) {
  const reader = stream.getReader()
  try {
    const { value } = await reader.read()
    return value
  } finally {
    reader.releaseLock()
  }
}
```

### 3.2. 未取消的流

```js
// ❌ 错误：中断读取但未取消流
async function badPartialRead(stream) {
  const reader = stream.getReader()
  const { value } = await reader.read()
  reader.releaseLock()
  // 流的底层资源仍在运行
  return value
}

// ✅ 正确：显式取消流
async function goodPartialRead(stream) {
  const reader = stream.getReader()
  try {
    const { value } = await reader.read()
    return value
  } finally {
    await reader.cancel('只需要第一个值')
    reader.releaseLock()
  }
}
```

### 3.3. TransformStream 中积累数据

```js
// ❌ 错误：在 transform 中积累所有数据
function badTransform() {
  const allData = []

  return new TransformStream({
    transform(chunk, controller) {
      allData.push(chunk)
      // 数据不断积累，导致内存增长
    },
    flush(controller) {
      controller.enqueue(allData)
    },
  })
}

// ✅ 正确：逐块处理
function goodTransform() {
  return new TransformStream({
    transform(chunk, controller) {
      const processed = processChunk(chunk)
      controller.enqueue(processed)
    },
  })
}
```

### 3.4. 事件监听器泄漏

```js
// ❌ 错误：添加监听器但从不移除
class BadStreamManager {
  constructor() {
    this.stream = createStream()
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })
  }

  cleanup() {
    // 监听器永远不会被移除
  }
}

// ✅ 正确：使用 AbortController
class GoodStreamManager {
  constructor() {
    this.stream = createStream()
    this.abortController = new AbortController()

    window.addEventListener('beforeunload', () => this.cleanup(), {
      signal: this.abortController.signal,
    })
  }

  cleanup() {
    this.abortController.abort()
  }
}
```

### 3.5. 循环引用

```js
// ❌ 错误：创建循环引用
function badCircularReference() {
  const obj = {}

  const stream = new ReadableStream({
    start(controller) {
      obj.controller = controller
      controller.metadata = obj
    },
  })

  return stream
}

// ✅ 正确：避免循环引用
function goodReference() {
  return new ReadableStream({
    start(controller) {
      controller.enqueue('data')
      controller.close()
    },
  })
}
```

## 4. 🤔 如何选择合适的 Chunk 大小以平衡性能和内存 ？

需要根据数据类型、网络条件、内存限制进行测试和调整。

### 4.1. 不同场景的推荐大小

```js
// 文本数据
const TEXT_CHUNK_SIZES = {
  small: 4 * 1024, // 4KB - 适合实时日志
  medium: 64 * 1024, // 64KB - 适合一般文本
  large: 256 * 1024, // 256KB - 适合大文本文件
}

// 二进制数据
const BINARY_CHUNK_SIZES = {
  small: 64 * 1024, // 64KB - 适合图片预览
  medium: 1024 * 1024, // 1MB - 适合视频流
  large: 5 * 1024 * 1024, // 5MB - 适合大文件下载
}

// 网络数据
const NETWORK_CHUNK_SIZES = {
  slow: 16 * 1024, // 16KB - 适合慢速网络
  normal: 64 * 1024, // 64KB - 适合普通网络
  fast: 256 * 1024, // 256KB - 适合高速网络
}
```

### 4.2. 动态调整 Chunk 大小

```js
class AdaptiveChunkReader {
  constructor(stream, initialChunkSize = 64 * 1024) {
    this.stream = stream
    this.chunkSize = initialChunkSize
    this.minChunkSize = 16 * 1024
    this.maxChunkSize = 1024 * 1024
    this.readTimes = []
  }

  async read() {
    const start = performance.now()
    const reader = this.stream.getReader({ mode: 'byob' })

    try {
      const buffer = new ArrayBuffer(this.chunkSize)
      const { value } = await reader.read(new Uint8Array(buffer))
      const duration = performance.now() - start

      this.adjustChunkSize(duration)

      return value
    } finally {
      reader.releaseLock()
    }
  }

  adjustChunkSize(readTime) {
    this.readTimes.push(readTime)

    if (this.readTimes.length < 5) return

    const avgTime =
      this.readTimes.reduce((a, b) => a + b) / this.readTimes.length

    // 读取太快，增加 chunk 大小
    if (avgTime < 10 && this.chunkSize < this.maxChunkSize) {
      this.chunkSize = Math.min(this.chunkSize * 2, this.maxChunkSize)
      console.log(`增加 chunk 大小至 ${this.chunkSize}`)
    }

    // 读取太慢，减小 chunk 大小
    if (avgTime > 100 && this.chunkSize > this.minChunkSize) {
      this.chunkSize = Math.max(this.chunkSize / 2, this.minChunkSize)
      console.log(`减小 chunk 大小至 ${this.chunkSize}`)
    }

    // 保留最近 5 次记录
    if (this.readTimes.length > 10) {
      this.readTimes = this.readTimes.slice(-5)
    }
  }
}
```

### 4.3. 基于内存限制调整

```js
class MemoryAwareReader {
  constructor(stream, maxMemory = 50 * 1024 * 1024) {
    this.stream = stream
    this.maxMemory = maxMemory
    this.currentMemory = 0
    this.chunks = []
  }

  async read() {
    const reader = this.stream.getReader()

    try {
      while (true) {
        // 检查内存使用
        if (this.currentMemory >= this.maxMemory) {
          console.warn('达到内存限制，等待处理')
          await this.processChunks()
        }

        const { done, value } = await reader.read()

        if (done) break

        this.chunks.push(value)
        this.currentMemory += value.byteLength
      }
    } finally {
      reader.releaseLock()
    }
  }

  async processChunks() {
    // 处理已读取的数据
    for (const chunk of this.chunks) {
      await processChunk(chunk)
    }

    this.chunks = []
    this.currentMemory = 0
  }
}
```

### 4.4. 性能测试工具

```js
async function benchmarkChunkSizes(stream, sizes) {
  const results = []

  for (const size of sizes) {
    const start = performance.now()
    let totalBytes = 0
    let chunkCount = 0

    const testStream = stream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          totalBytes += chunk.byteLength
          chunkCount++
          controller.enqueue(chunk)
        },
      })
    )

    await testStream.pipeTo(new WritableStream({ write() {} }))

    const duration = performance.now() - start
    const throughput = totalBytes / duration

    results.push({
      chunkSize: size,
      duration,
      throughput,
      chunkCount,
      avgChunkSize: totalBytes / chunkCount,
    })
  }

  return results
}

// 使用
const sizes = [16 * 1024, 64 * 1024, 256 * 1024, 1024 * 1024]
const results = await benchmarkChunkSizes(myStream, sizes)
console.table(results)
```

## 5. 🤔 在什么情况下可以安全地复用流 ？

流只能被读取一次，但可以通过 `tee()` 创建副本或缓存数据后重放。

### 5.1. 使用 tee() 创建多个读取器

```js
const [stream1, stream2] = originalStream.tee()

// stream1 和 stream2 可以独立读取
stream1.pipeTo(destination1)
stream2.pipeTo(destination2)
```

### 5.2. 缓存流数据

```js
class StreamCache {
  constructor(stream) {
    this.originalStream = stream
    this.cachedChunks = []
    this.isCached = false
  }

  async cache() {
    if (this.isCached) return

    const reader = this.originalStream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        this.cachedChunks.push(value)
      }

      this.isCached = true
    } finally {
      reader.releaseLock()
    }
  }

  createStream() {
    if (!this.isCached) {
      throw new Error('必须先调用 cache()')
    }

    let index = 0

    return new ReadableStream({
      pull(controller) {
        if (index < this.cachedChunks.length) {
          controller.enqueue(this.cachedChunks[index++])
        } else {
          controller.close()
        }
      },
    })
  }
}

// 使用
const cache = new StreamCache(originalStream)
await cache.cache()

const stream1 = cache.createStream()
const stream2 = cache.createStream()
```

### 5.3. 流的条件复用

```js
class ConditionalStreamReuse {
  constructor(createStreamFn) {
    this.createStreamFn = createStreamFn
    this.activeStream = null
    this.isLocked = false
  }

  getStream() {
    // 如果没有活动流或流已被锁定，创建新流
    if (!this.activeStream || this.isLocked) {
      this.activeStream = this.createStreamFn()
      this.isLocked = false
    }

    return this.activeStream
  }

  async useStream(callback) {
    const stream = this.getStream()
    this.isLocked = true

    try {
      await callback(stream)
    } finally {
      this.isLocked = false
    }
  }

  reset() {
    this.activeStream = null
    this.isLocked = false
  }
}

// 使用
const reuser = new ConditionalStreamReuse(() => createMyStream())

await reuser.useStream(async (stream) => {
  await stream.pipeTo(destination1)
})

await reuser.useStream(async (stream) => {
  await stream.pipeTo(destination2)
})
```

### 5.4. ⚠️ 不能复用的情况

```js
// ❌ 错误：尝试多次读取同一个流
const stream = createStream()

await stream.pipeTo(destination1) // 第一次读取
await stream.pipeTo(destination2) // ❌ 错误：流已被消费

// ❌ 错误：流被锁定后尝试读取
const reader = stream.getReader()
await stream.pipeTo(destination) // ❌ 错误：流已被锁定

// ❌ 错误：同时使用多个 reader
const reader1 = stream.getReader()
const reader2 = stream.getReader() // ❌ 错误：只能有一个 reader
```

## 6. 🤔 如何监控和调试流的性能问题 ？

使用 Performance API、Memory Profiler、自定义日志和可视化工具。

### 6.1. 使用 Performance API

```js
class PerformanceMonitor {
  constructor(streamName) {
    this.streamName = streamName
    this.marks = new Map()
  }

  mark(label) {
    const markName = `${this.streamName}:${label}`
    performance.mark(markName)
    this.marks.set(label, markName)
  }

  measure(startLabel, endLabel) {
    const measureName = `${this.streamName}:${startLabel}-${endLabel}`
    const startMark = this.marks.get(startLabel)
    const endMark = this.marks.get(endLabel)

    performance.measure(measureName, startMark, endMark)

    const measure = performance.getEntriesByName(measureName)[0]
    return measure.duration
  }

  getMetrics() {
    const measures = performance.getEntriesByType('measure')
    return measures
      .filter((m) => m.name.startsWith(this.streamName))
      .map((m) => ({
        name: m.name,
        duration: m.duration,
        startTime: m.startTime,
      }))
  }

  clear() {
    performance.clearMarks()
    performance.clearMeasures()
    this.marks.clear()
  }
}

// 使用
const monitor = new PerformanceMonitor('myStream')

monitor.mark('start')

await stream
  .pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        monitor.mark('transform-start')
        controller.enqueue(processChunk(chunk))
        monitor.mark('transform-end')
      },
    })
  )
  .pipeTo(destination)

monitor.mark('end')

const totalDuration = monitor.measure('start', 'end')
console.log(`总耗时: ${totalDuration}ms`)
console.table(monitor.getMetrics())
```

### 6.2. 监控内存使用

```js
class MemoryMonitor {
  constructor() {
    this.snapshots = []
  }

  async takeSnapshot(label) {
    if (performance.memory) {
      this.snapshots.push({
        label,
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      })
    }
  }

  getMemoryGrowth(startLabel, endLabel) {
    const start = this.snapshots.find((s) => s.label === startLabel)
    const end = this.snapshots.find((s) => s.label === endLabel)

    if (!start || !end) return null

    return {
      growth: end.usedJSHeapSize - start.usedJSHeapSize,
      growthPercent:
        ((end.usedJSHeapSize - start.usedJSHeapSize) / start.usedJSHeapSize) *
        100,
      duration: end.timestamp - start.timestamp,
    }
  }

  report() {
    return this.snapshots.map((s) => ({
      label: s.label,
      usedMB: (s.usedJSHeapSize / 1024 / 1024).toFixed(2),
      totalMB: (s.totalJSHeapSize / 1024 / 1024).toFixed(2),
      usage: ((s.usedJSHeapSize / s.totalJSHeapSize) * 100).toFixed(1) + '%',
    }))
  }
}

// 使用
const memMonitor = new MemoryMonitor()

await memMonitor.takeSnapshot('start')

await stream.pipeTo(destination)

await memMonitor.takeSnapshot('end')

console.table(memMonitor.report())
console.log(memMonitor.getMemoryGrowth('start', 'end'))
```

### 6.3. 流量统计

```js
function createStatsTransform() {
  const stats = {
    chunkCount: 0,
    totalBytes: 0,
    startTime: null,
    endTime: null,
    minChunkSize: Infinity,
    maxChunkSize: 0,
  }

  return new TransformStream({
    start() {
      stats.startTime = performance.now()
    },

    transform(chunk, controller) {
      stats.chunkCount++
      stats.totalBytes += chunk.byteLength
      stats.minChunkSize = Math.min(stats.minChunkSize, chunk.byteLength)
      stats.maxChunkSize = Math.max(stats.maxChunkSize, chunk.byteLength)

      controller.enqueue(chunk)
    },

    flush() {
      stats.endTime = performance.now()
      const duration = (stats.endTime - stats.startTime) / 1000

      console.log('流统计信息:')
      console.log(`总数据: ${(stats.totalBytes / 1024 / 1024).toFixed(2)} MB`)
      console.log(`总分片: ${stats.chunkCount}`)
      console.log(
        `平均分片大小: ${(stats.totalBytes / stats.chunkCount / 1024).toFixed(
          2
        )} KB`
      )
      console.log(`最小分片: ${(stats.minChunkSize / 1024).toFixed(2)} KB`)
      console.log(`最大分片: ${(stats.maxChunkSize / 1024).toFixed(2)} KB`)
      console.log(`耗时: ${duration.toFixed(2)}s`)
      console.log(
        `吞吐量: ${(stats.totalBytes / duration / 1024 / 1024).toFixed(2)} MB/s`
      )
    },
  })
}

// 使用
await stream.pipeThrough(createStatsTransform()).pipeTo(destination)
```

### 6.4. 实时监控仪表板

```js
class StreamDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.metrics = {
      throughput: [],
      latency: [],
      bufferSize: [],
    }
  }

  update(metric, value) {
    this.metrics[metric].push({
      timestamp: Date.now(),
      value,
    })

    // 保留最近 100 个数据点
    if (this.metrics[metric].length > 100) {
      this.metrics[metric].shift()
    }

    this.render()
  }

  render() {
    const html = `
      <div class="dashboard">
        <div class="metric">
          <h3>吞吐量</h3>
          <p>${this.getLatest('throughput')} MB/s</p>
        </div>
        <div class="metric">
          <h3>延迟</h3>
          <p>${this.getLatest('latency')} ms</p>
        </div>
        <div class="metric">
          <h3>缓冲区</h3>
          <p>${this.getLatest('bufferSize')} chunks</p>
        </div>
      </div>
    `
    this.container.innerHTML = html
  }

  getLatest(metric) {
    const data = this.metrics[metric]
    return data.length > 0 ? data[data.length - 1].value.toFixed(2) : '0'
  }
}
```

监控和调试需要结合多种工具，关注内存、性能和流量指标。

## 7. 💻 demos.1 - 诊断并修复内存泄漏问题

演示如何诊断和修复流处理中的内存泄漏。包含 6 个场景，展示 3 种常见的内存泄漏模式及其正确的修复方法。实时监控内存使用情况，通过图表可视化内存增长趋势。

[查看演示代码](./demos/1/)

## 8. 💻 demos.2 - Chunk 大小对性能的影响对比

对比不同 Chunk 大小（4KB ~ 5MB）对流处理性能的影响。测试吞吐量、延迟、Chunk 数量等关键指标，通过图表展示最优 Chunk 大小。支持自定义数据大小和测试轮次。

[查看演示代码](./demos/2/)

## 9. 💻 demos.3 - 使用 Performance API 监控流性能

实时监控流的性能指标，包括活跃 Stream 数量、总吞吐量、平均延迟、内存使用等。通过可视化图表展示性能趋势，帮助识别性能瓶颈。支持模拟多个并发流。

[查看演示代码](./demos/3/)
