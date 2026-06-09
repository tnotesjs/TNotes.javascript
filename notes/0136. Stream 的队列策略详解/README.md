# [0136. Stream 的队列策略详解](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0136.%20Stream%20%E7%9A%84%E9%98%9F%E5%88%97%E7%AD%96%E7%95%A5%E8%AF%A6%E8%A7%A3)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. CountQueuingStrategy 和 ByteLengthQueuingStrategy 的主要区别是什么 ？](#3-countqueuingstrategy-和-bytelengthqueuingstrategy-的主要区别是什么-)
  - [3.1. CountQueuingStrategy 的计算方式](#31-countqueuingstrategy-的计算方式)
  - [3.2. ByteLengthQueuingStrategy 的计算方式](#32-bytelengthqueuingstrategy-的计算方式)
  - [3.3. 对比表格](#33-对比表格)
  - [3.4. 实际行为差异](#34-实际行为差异)
  - [3.5. size() 函数的实现](#35-size-函数的实现)
- [4. 如何为不同类型的数据选择合适的队列策略 ？](#4-如何为不同类型的数据选择合适的队列策略-)
  - [4.1. 数据类型决策树](#41-数据类型决策树)
  - [4.2. 选择矩阵](#42-选择矩阵)
  - [4.3. 实际场景示例](#43-实际场景示例)
  - [4.4. 错误选择的后果](#44-错误选择的后果)
  - [4.5. 性能考量](#45-性能考量)
- [5. 自定义队列策略需要实现哪些方法 ？](#5-自定义队列策略需要实现哪些方法-)
  - [5.1. QueuingStrategy 接口定义](#51-queuingstrategy-接口定义)
  - [5.2. 最小实现](#52-最小实现)
  - [5.3. 实战示例：字符串长度策略](#53-实战示例字符串长度策略)
  - [5.4. 高级示例：权重策略](#54-高级示例权重策略)
  - [5.5. 组合策略](#55-组合策略)
  - [5.6. 注意事项](#56-注意事项)
  - [5.7. 使用工厂函数](#57-使用工厂函数)
- [6. 队列策略如何影响内存占用和性能 ？](#6-队列策略如何影响内存占用和性能-)
  - [6.1. 内存占用计算](#61-内存占用计算)
  - [6.2. highWaterMark 对性能的影响](#62-highwatermark-对性能的影响)
  - [6.3. 性能测试对比](#63-性能测试对比)
  - [6.4. 内存与延迟的权衡](#64-内存与延迟的权衡)
  - [6.5. 策略选择对 GC 压力的影响](#65-策略选择对-gc-压力的影响)
  - [6.6. 实际内存监控](#66-实际内存监控)
- [7. demos.1 - 对比两种内置队列策略的行为差异](#7-demos1---对比两种内置队列策略的行为差异)
- [8. demos.2 - 实现一个基于优先级的自定义队列策略](#8-demos2---实现一个基于优先级的自定义队列策略)
- [9. 引用](#9-引用)

<!-- endregion:toc -->

## 1. 本节内容

- QueuingStrategy 接口定义
- CountQueuingStrategy 的使用场景
- ByteLengthQueuingStrategy 的使用场景
- size() 函数的作用
- highWaterMark 的配置方式
- 自定义队列策略的实现

## 2. 评价

队列策略是 Web Streams 流量控制的基础，通过 size() 函数和 highWaterMark 决定队列容量计算方式。CountQueuingStrategy 按块计数，适合固定大小数据；ByteLengthQueuingStrategy 按字节计数，适合二进制流。理解两者差异和自定义策略的实现方法，能够精准控制内存使用，优化不同场景下的流处理性能。

## 3. CountQueuingStrategy 和 ByteLengthQueuingStrategy 的主要区别是什么 ？

CountQueuingStrategy 将每个块的大小计为 1，ByteLengthQueuingStrategy 根据字节长度计算块大小。

### 3.1. CountQueuingStrategy 的计算方式

```js
const countStrategy = new CountQueuingStrategy({ highWaterMark: 5 })

const stream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue('short') // 块大小 = 1
      controller.enqueue('a very long string') // 块大小 = 1
      controller.enqueue({ data: [1, 2, 3] }) // 块大小 = 1

      console.log(controller.desiredSize) // 5 - 3 = 2
    },
  },
  countStrategy,
)
// 无论块内容是什么，每个块都计为 1
```

### 3.2. ByteLengthQueuingStrategy 的计算方式

```js
const byteStrategy = new ByteLengthQueuingStrategy({ highWaterMark: 1024 })

const stream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue(new Uint8Array(100)) // 块大小 = 100
      controller.enqueue(new Uint8Array(500)) // 块大小 = 500

      console.log(controller.desiredSize) // 1024 - 600 = 424
    },
  },
  byteStrategy,
)
// 根据 ArrayBufferView 的 byteLength 计算
```

### 3.3. 对比表格

| 特性           | CountQueuingStrategy | ByteLengthQueuingStrategy        |
| -------------- | -------------------- | -------------------------------- |
| size() 返回值  | 始终返回 1           | 返回 chunk.byteLength            |
| highWaterMark  | 表示块数量           | 表示字节数                       |
| 适用数据类型   | 任意类型             | ArrayBufferView（Uint8Array 等） |
| 内存预估准确性 | 低（忽略块实际大小） | 高（精确到字节）                 |
| 使用场景       | 对象流、固定大小消息 | 二进制流、文件流、网络流         |

### 3.4. 实际行为差异

```js
// CountQueuingStrategy：只关心块数量
const countStream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue(new Uint8Array(1)) // 1B
      controller.enqueue(new Uint8Array(1024 * 1024)) // 1MB
      console.log(controller.desiredSize) // 3 - 2 = 1
      // ⚠️ 实际占用约 1MB，但队列认为只用了 2 个位置
    },
  },
  new CountQueuingStrategy({ highWaterMark: 5 }),
)

// ByteLengthQueuingStrategy：按实际字节数
const byteStream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue(new Uint8Array(1)) // 1B
      controller.enqueue(new Uint8Array(1024 * 1024)) // 1MB
      console.log(controller.desiredSize) // 2048 - 1048577 = -1046529
      // ✅ 准确反映内存占用，触发背压
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 2048 }),
)
```

### 3.5. size() 函数的实现

```js
// CountQueuingStrategy 的 size() 实现
const countStrategy = new CountQueuingStrategy({ highWaterMark: 10 })
console.log(countStrategy.size()) // 1
console.log(countStrategy.size('any data')) // 1
console.log(countStrategy.size({ huge: 'object' })) // 1

// ByteLengthQueuingStrategy 的 size() 实现
const byteStrategy = new ByteLengthQueuingStrategy({ highWaterMark: 1024 })
console.log(byteStrategy.size(new Uint8Array(100))) // 100
console.log(byteStrategy.size(new Uint16Array(50))) // 100（50 * 2 字节）
// console.log(byteStrategy.size('string')) // TypeError: 没有 byteLength 属性
```

CountQueuingStrategy 忽略数据大小，适合块大小均匀的场景；ByteLengthQueuingStrategy 精确计量，适合二进制数据流。

## 4. 如何为不同类型的数据选择合适的队列策略 ？

根据数据类型、大小分布和内存敏感度选择策略。

### 4.1. 数据类型决策树

```js
// 场景 1：固定大小的对象流 → CountQueuingStrategy
const messageStream = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue({ type: 'update', timestamp: Date.now() })
    },
  },
  new CountQueuingStrategy({ highWaterMark: 10 }),
)
// 每条消息大小相近，用块数量控制即可

// 场景 2：二进制数据流 → ByteLengthQueuingStrategy
const fileStream = file.stream() // 浏览器 File API
// 内部使用 ByteLengthQueuingStrategy，按字节控制读取

// 场景 3：混合大小的数据 → 自定义策略或 ByteLengthQueuingStrategy
const mixedStream = new ReadableStream(
  {
    pull(controller) {
      // 可能是小对象或大二进制数据
      controller.enqueue(randomData())
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 64 * 1024 }),
)
```

### 4.2. 选择矩阵

| 数据特征 | 推荐策略 | 原因 |
| --- | --- | --- |
| 固定大小消息（JSON、对象） | CountQueuingStrategy | 计数简单，性能好 |
| 可变大小文本 | CountQueuingStrategy | 除非文本长度差异巨大 |
| 二进制数据（图片、视频） | ByteLengthQueuingStrategy | 内存占用差异大，需精确控制 |
| 网络数据包 | ByteLengthQueuingStrategy | 包大小不一，按字节更准确 |
| 数据库查询结果 | CountQueuingStrategy | 行大小通常相近 |

### 4.3. 实际场景示例

```js
// WebSocket 消息流：消息大小相近
function createWebSocketStream(ws) {
  return new ReadableStream(
    {
      start(controller) {
        ws.onmessage = (e) => controller.enqueue(e.data)
      },
    },
    new CountQueuingStrategy({ highWaterMark: 20 }),
  )
}

// 文件上传流：块大小固定
function createUploadStream(file) {
  const chunkSize = 64 * 1024 // 64KB
  let offset = 0

  return new ReadableStream(
    {
      async pull(controller) {
        const chunk = file.slice(offset, offset + chunkSize)
        const buffer = await chunk.arrayBuffer()
        controller.enqueue(new Uint8Array(buffer))
        offset += chunkSize
        if (offset >= file.size) controller.close()
      },
    },
    new ByteLengthQueuingStrategy({ highWaterMark: 256 * 1024 }), // 256KB 缓冲
  )
}

// HTTP 响应流：内容长度未知
async function fetchStream(url) {
  const response = await fetch(url)
  return response.body // 使用 ByteLengthQueuingStrategy
}

// 日志流：每条日志大小差异小
function createLogStream() {
  return new ReadableStream(
    {
      pull(controller) {
        const log = { level: 'info', message: getNextLog(), time: Date.now() }
        controller.enqueue(log)
      },
    },
    new CountQueuingStrategy({ highWaterMark: 50 }),
  )
}
```

### 4.4. 错误选择的后果

```js
// ❌ 错误：二进制流使用 CountQueuingStrategy
const badStream = new ReadableStream(
  {
    pull(controller) {
      // 块大小从 1KB 到 10MB 不等
      controller.enqueue(new Uint8Array(Math.random() * 10 * 1024 * 1024))
    },
  },
  new CountQueuingStrategy({ highWaterMark: 5 }),
)
// 问题：可能缓冲 50MB 数据，但队列认为只用了 5 个位置

// ✅ 正确：使用字节策略
const goodStream = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue(new Uint8Array(Math.random() * 10 * 1024 * 1024))
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 16 * 1024 * 1024 }), // 16MB
)
// 精确控制内存，超过 16MB 触发背压
```

### 4.5. 性能考量

```js
// CountQueuingStrategy：计算开销小
const count = new CountQueuingStrategy({ highWaterMark: 100 })
count.size(data) // 始终返回 1，无需访问数据

// ByteLengthQueuingStrategy：需访问 byteLength
const byte = new ByteLengthQueuingStrategy({ highWaterMark: 1024 })
byte.size(chunk) // 读取 chunk.byteLength 属性

// 高频入队场景优先 CountQueuingStrategy（如果数据大小均匀）
```

选择策略的核心原则：数据大小均匀用 Count，大小不一用 ByteLength，追求极致性能可自定义。

## 5. 自定义队列策略需要实现哪些方法 ？

必须实现 size(chunk) 方法并提供 highWaterMark 属性。

### 5.1. QueuingStrategy 接口定义

```js
// 接口规范
interface QueuingStrategy {
  highWaterMark: number
  size(chunk: any): number
}
```

### 5.2. 最小实现

```js
// 自定义策略：根据对象属性计数
class PropertyCountStrategy {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark
  }

  size(chunk) {
    // 返回对象的属性数量
    return Object.keys(chunk).length
  }
}

const stream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue({ a: 1 }) // 块大小 = 1
      controller.enqueue({ a: 1, b: 2, c: 3 }) // 块大小 = 3
      console.log(controller.desiredSize) // 10 - 4 = 6
    },
  },
  new PropertyCountStrategy(10),
)
```

### 5.3. 实战示例：字符串长度策略

```js
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
    return 1 // 默认大小
  }
}

const textStream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue('hi') // 大小 = 2
      controller.enqueue('hello world') // 大小 = 11
      console.log(controller.desiredSize) // 1000 - 13 = 987
    },
  },
  new StringLengthStrategy({ highWaterMark: 1000 }),
)
```

### 5.4. 高级示例：权重策略

```js
class WeightedStrategy {
  constructor(highWaterMark, weightMap = {}) {
    this.highWaterMark = highWaterMark
    this.weightMap = weightMap
  }

  size(chunk) {
    // 根据数据类型分配不同权重
    if (chunk.priority === 'high') return this.weightMap.high || 10
    if (chunk.priority === 'low') return this.weightMap.low || 1
    return this.weightMap.normal || 5
  }
}

const priorityStream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue({ priority: 'low', data: 'x' }) // 权重 1
      controller.enqueue({ priority: 'high', data: 'y' }) // 权重 10
      console.log(controller.desiredSize) // 100 - 11 = 89
    },
  },
  new WeightedStrategy(100, { high: 10, normal: 5, low: 1 }),
)
```

### 5.5. 组合策略

```js
// 综合考虑字节数和块数
class HybridStrategy {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark
  }

  size(chunk) {
    // 字节数 + 基础计数
    if (chunk && chunk.byteLength !== undefined) {
      return chunk.byteLength + 1 // 每块至少计 1
    }
    if (typeof chunk === 'string') {
      return chunk.length * 2 + 1 // UTF-16 估算
    }
    return 1
  }
}

const hybridStream = new ReadableStream(
  {
    start(controller) {
      controller.enqueue(new Uint8Array(100)) // 100 + 1 = 101
      controller.enqueue('hello') // 5 * 2 + 1 = 11
      console.log(controller.desiredSize) // hwm - 112
    },
  },
  new HybridStrategy(1024),
)
```

### 5.6. 注意事项

```js
class BadStrategy {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark
  }

  size(chunk) {
    // ❌ 错误：返回负数
    return -1 // 导致 desiredSize 异常增长

    // ❌ 错误：返回 0
    return 0 // 队列永不满，无背压

    // ❌ 错误：抛出异常
    throw new Error('size error') // 导致流错误

    // ✅ 正确：始终返回正数
    return Math.max(1, calculateSize(chunk))
  }
}
```

### 5.7. 使用工厂函数

```js
function createCustomStrategy(config) {
  return {
    highWaterMark: config.hwm,
    size(chunk) {
      return config.sizeCalculator(chunk)
    },
  }
}

const strategy = createCustomStrategy({
  hwm: 50,
  sizeCalculator: (chunk) => (chunk.important ? 10 : 1),
})

const stream = new ReadableStream({ pull(controller) {} }, strategy)
```

自定义策略的 size() 方法必须同步执行，返回非负数，且应尽量高效。

## 6. 队列策略如何影响内存占用和性能 ？

队列策略通过 highWaterMark 和 size() 控制缓冲区大小，直接影响内存使用和调度频率。

### 6.1. 内存占用计算

```js
// 示例：CountQueuingStrategy 的内存陷阱
const stream1 = new ReadableStream(
  {
    pull(controller) {
      // 每次入队 1MB 数据
      controller.enqueue(new Uint8Array(1024 * 1024))
    },
  },
  new CountQueuingStrategy({ highWaterMark: 10 }),
)
// 理论队列大小：10 个块
// 实际内存占用：10MB（策略未考虑）

// 改用 ByteLengthQueuingStrategy
const stream2 = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue(new Uint8Array(1024 * 1024))
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 10 * 1024 * 1024 }),
)
// 理论队列大小：10MB
// 实际内存占用：≈10MB（准确）
```

### 6.2. highWaterMark 对性能的影响

```js
// 过小的 highWaterMark：频繁调度
const tooSmall = new ReadableStream(
  {
    async pull(controller) {
      const data = await fetch('/api/data').then((r) => r.text())
      controller.enqueue(data)
      // pull() 会在每次消费后立即调用，无法批量化
    },
  },
  new CountQueuingStrategy({ highWaterMark: 1 }),
)

// 适中的 highWaterMark：批量处理
const balanced = new ReadableStream(
  {
    async pull(controller) {
      const data = await fetch('/api/data').then((r) => r.text())
      controller.enqueue(data)
      // 队列可容纳多个块，减少网络请求频率
    },
  },
  new CountQueuingStrategy({ highWaterMark: 10 }),
)

// 过大的 highWaterMark：内存浪费
const tooBig = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue(new Uint8Array(1024 * 1024))
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 1024 * 1024 * 1024 }), // 1GB
)
// 允许缓冲 1GB 数据，对大多数应用来说过度
```

### 6.3. 性能测试对比

```js
async function benchmarkStrategy(strategy, name) {
  const startTime = performance.now()
  let pullCount = 0

  const stream = new ReadableStream(
    {
      pull(controller) {
        pullCount++
        controller.enqueue(new Uint8Array(1024))
        if (pullCount >= 1000) controller.close()
      },
    },
    strategy,
  )

  await stream.pipeTo(
    new WritableStream({
      write() {
        // 空处理
      },
    }),
  )

  const elapsed = performance.now() - startTime
  console.log(`${name}: ${elapsed.toFixed(2)}ms, pull 调用 ${pullCount} 次`)
}

// 测试不同策略
await benchmarkStrategy(
  new CountQueuingStrategy({ highWaterMark: 1 }),
  'Count(1)',
)
await benchmarkStrategy(
  new CountQueuingStrategy({ highWaterMark: 10 }),
  'Count(10)',
)
await benchmarkStrategy(
  new ByteLengthQueuingStrategy({ highWaterMark: 10 * 1024 }),
  'Byte(10KB)',
)
```

### 6.4. 内存与延迟的权衡

| highWaterMark | 内存占用 | 延迟 | 吞吐量 | 适用场景       |
| ------------- | -------- | ---- | ------ | -------------- |
| 很小（0-2）   | 低       | 高   | 低     | 实时数据流     |
| 中等（5-20）  | 中       | 中   | 中     | 通用场景       |
| 很大（50+）   | 高       | 低   | 高     | 批量处理、离线 |

```js
// 实时音频流：低延迟优先
const audioStream = new ReadableStream(
  {
    pull(controller) {
      const audioChunk = captureAudio()
      controller.enqueue(audioChunk)
    },
  },
  new CountQueuingStrategy({ highWaterMark: 2 }),
)

// 视频转码：吞吐量优先
const videoStream = new ReadableStream(
  {
    pull(controller) {
      const frame = readVideoFrame()
      controller.enqueue(frame)
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 10 * 1024 * 1024 }), // 10MB
)
```

### 6.5. 策略选择对 GC 压力的影响

```js
// size() 函数的计算成本
class ExpensiveStrategy {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark
  }

  size(chunk) {
    // ❌ 错误：复杂计算导致性能下降
    return JSON.stringify(chunk).length // 每次入队都序列化
  }
}

class EfficientStrategy {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark
  }

  size(chunk) {
    // ✅ 正确：简单计算
    if (chunk.size !== undefined) return chunk.size
    return 1
  }
}
```

### 6.6. 实际内存监控

```js
async function monitorMemory(stream) {
  const initial = performance.memory?.usedJSHeapSize || 0
  const reader = stream.getReader()

  while (true) {
    const { done } = await reader.read()
    if (done) break
  }

  const final = performance.memory?.usedJSHeapSize || 0
  console.log(`内存增长: ${((final - initial) / 1024 / 1024).toFixed(2)} MB`)
}

// 对比不同策略的内存使用
const stream1 = createStreamWithStrategy(
  new CountQueuingStrategy({ highWaterMark: 100 }),
)
const stream2 = createStreamWithStrategy(
  new ByteLengthQueuingStrategy({ highWaterMark: 1024 * 1024 }),
)

await monitorMemory(stream1)
await monitorMemory(stream2)
```

队列策略是性能调优的关键杠杆，需根据数据特征、内存限制和延迟要求综合权衡。

## 7. demos.1 - 对比两种内置队列策略的行为差异

::: code-group

<<< ./demos/1/1.html

<<< ./demos/1/1.js

:::

## 8. demos.2 - 实现一个基于优先级的自定义队列策略

::: code-group

<<< ./demos/2/1.html

<<< ./demos/2/1.js

:::

## 9. 引用

- [Streams API - Web APIs | MDN][1]
- [QueuingStrategy - Web APIs | MDN][2]
- [Streams Standard - Queuing Strategies][3]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts#queuing_strategies
[3]: https://streams.spec.whatwg.org/#qs-api
