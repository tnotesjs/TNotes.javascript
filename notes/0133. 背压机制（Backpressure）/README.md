# [0133. 背压机制（Backpressure）](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0133.%20%E8%83%8C%E5%8E%8B%E6%9C%BA%E5%88%B6%EF%BC%88Backpressure%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是背压机制，为什么流处理中需要它 ？](#3--什么是背压机制为什么流处理中需要它-)
  - [3.1. 背压机制的核心原理](#31-背压机制的核心原理)
  - [3.2. 为什么流处理需要背压](#32-为什么流处理需要背压)
  - [3.3. 背压的三个关键要素](#33-背压的三个关键要素)
- [4. 🤔 desiredSize 的值如何计算，负值代表什么 ？](#4--desiredsize-的值如何计算负值代表什么-)
  - [4.1. 计算公式](#41-计算公式)
  - [4.2. 负值的含义](#42-负值的含义)
  - [4.3. 不同队列策略下的计算差异](#43-不同队列策略下的计算差异)
  - [4.4. 动态变化示例](#44-动态变化示例)
- [5. 🤔 highWaterMark 如何影响流的缓冲行为 ？](#5--highwatermark-如何影响流的缓冲行为-)
  - [5.1. highWaterMark 的作用机制](#51-highwatermark-的作用机制)
  - [5.2. 不同值的影响对比](#52-不同值的影响对比)
  - [5.3. 字节流中的特殊处理](#53-字节流中的特殊处理)
  - [5.4. 过大或过小的问题](#54-过大或过小的问题)
  - [5.5. 实际场景选择建议](#55-实际场景选择建议)
- [6. 🤔 背压信号如何在管道链中传播 ？](#6--背压信号如何在管道链中传播-)
  - [6.1. 单向传播路径](#61-单向传播路径)
  - [6.2. 传播机制原理](#62-传播机制原理)
  - [6.3. 多级转换链](#63-多级转换链)
  - [6.4. 背压失效的情况](#64-背压失效的情况)
  - [6.5. 可视化传播过程](#65-可视化传播过程)
- [7. 🤔 如何在自定义流中正确响应背压 ？](#7--如何在自定义流中正确响应背压-)
  - [7.1. ReadableStream 中的背压响应](#71-readablestream-中的背压响应)
  - [7.2. 处理批量数据](#72-处理批量数据)
  - [7.3. TransformStream 中的背压响应](#73-transformstream-中的背压响应)
  - [7.4. 避免阻塞 pull()](#74-避免阻塞-pull)
  - [7.5. 结合 async 迭代器](#75-结合-async-迭代器)
  - [7.6. 实战示例：限速文件读取](#76-实战示例限速文件读取)
- [8. 💻 demos.1 - 观察背压信号的触发时机](#8--demos1---观察背压信号的触发时机)
- [9. 💻 demos.2 - 实现一个支持背压的自定义流](#9--demos2---实现一个支持背压的自定义流)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 背压机制的原理与必要性
- desiredSize 的计算公式
- highWaterMark 参数的作用
- 队列大小的动态变化
- 背压信号的传播路径
- 生产者与消费者的速率平衡

## 2. 🫧 评价

背压机制是 Web Streams 的核心设计之一，通过 desiredSize 和 highWaterMark 实现生产者与消费者的速率平衡。理解队列大小的计算公式、负值的含义，以及信号在管道链中的传播路径，是构建高性能流处理应用的关键。实际开发中需重点关注慢速生产者的暂停逻辑，避免内存堆积导致的性能问题。

## 3. 🤔 什么是背压机制，为什么流处理中需要它 ？

背压机制（Backpressure）是一种流量控制策略，用于防止快速生产者压垮慢速消费者，确保内存使用可控。

### 3.1. 背压机制的核心原理

当消费者处理速度慢于生产者时，未处理的数据会累积在队列中。背压机制通过信号通知生产者暂停或减速，避免内存溢出。

```js
const stream = new ReadableStream({
  start(controller) {
    console.log('desiredSize:', controller.desiredSize) // 1（默认 highWaterMark）
  },
  pull(controller) {
    // desiredSize > 0 时才会调用 pull()
    controller.enqueue('chunk')
    console.log('desiredSize:', controller.desiredSize) // 队列增加后减小
  },
})
```

### 3.2. 为什么流处理需要背压

```js
// ❌ 无背压控制：快速生产者持续入队
const uncontrolled = new ReadableStream({
  start(controller) {
    for (let i = 0; i < 1000000; i++) {
      controller.enqueue(new Uint8Array(1024)) // 持续入队 1MB 数据
    }
  },
})
// 结果：1GB 数据瞬间进入队列，内存爆炸

// ✅ 有背压控制：根据 desiredSize 调整节奏
const controlled = new ReadableStream({
  async pull(controller) {
    if (controller.desiredSize > 0) {
      const data = await fetchData()
      controller.enqueue(data)
    }
    // desiredSize <= 0 时停止调用 pull()
  },
})
```

### 3.3. 背压的三个关键要素

| 要素          | 说明                                 | 作用           |
| ------------- | ------------------------------------ | -------------- |
| desiredSize   | 期望队列剩余容量（可为负）           | 生产者决策依据 |
| highWaterMark | 队列容量上限（默认 1）               | 背压触发阈值   |
| 队列策略      | 计算每个块大小的规则（默认计数为 1） | 控制入队速率   |

```js
const stream = new ReadableStream(
  {
    pull(controller) {
      // desiredSize 告诉你还能安全入队多少
      console.log('剩余容量:', controller.desiredSize)
    },
  },
  new CountQueuingStrategy({ highWaterMark: 5 })
)
// highWaterMark: 5 表示队列最多容纳 5 个块
```

背压机制的本质是用信号（desiredSize）替代阻塞，让异步流保持响应性的同时实现流量控制。

## 4. 🤔 desiredSize 的值如何计算，负值代表什么 ？

desiredSize 等于 highWaterMark 减去当前队列大小，负值表示队列已超过容量限制。

### 4.1. 计算公式

```js
desiredSize = highWaterMark - queueTotalSize
```

其中 queueTotalSize 是队列中所有块的大小总和，由队列策略的 `size()` 函数计算。

```js
const stream = new ReadableStream(
  {
    start(controller) {
      console.log(controller.desiredSize) // 3（队列为空）

      controller.enqueue('a') // 块大小为 1
      console.log(controller.desiredSize) // 2

      controller.enqueue('b')
      controller.enqueue('c')
      console.log(controller.desiredSize) // 0（达到上限）

      controller.enqueue('d')
      console.log(controller.desiredSize) // -1（超出上限）
    },
  },
  new CountQueuingStrategy({ highWaterMark: 3 })
)
```

### 4.2. 负值的含义

desiredSize 为负表示队列过载，生产者应立即停止入队。

```js
const stream = new ReadableStream(
  {
    async pull(controller) {
      // ⚠️ 即使 desiredSize 为负，pull() 仍会被调用
      console.log('desiredSize:', controller.desiredSize)

      if (controller.desiredSize <= 0) {
        console.log('队列已满，跳过本次入队')
        return // 主动停止生产
      }

      controller.enqueue(await fetchData())
    },
  },
  new CountQueuingStrategy({ highWaterMark: 1 })
)
```

### 4.3. 不同队列策略下的计算差异

```js
// CountQueuingStrategy：每个块大小为 1
new ReadableStream(
  {
    start(controller) {
      controller.enqueue('any data')
      console.log(controller.desiredSize) // highWaterMark - 1
    },
  },
  new CountQueuingStrategy({ highWaterMark: 10 })
)

// ByteLengthQueuingStrategy：块大小为字节数
new ReadableStream(
  {
    start(controller) {
      controller.enqueue(new Uint8Array(1024)) // 1KB
      console.log(controller.desiredSize) // 16384 - 1024 = 15360
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 16 * 1024 })
)
```

### 4.4. 动态变化示例

```js
const chunks = []
const stream = new ReadableStream(
  {
    pull(controller) {
      const chunk = `chunk${chunks.length}`
      controller.enqueue(chunk)
      chunks.push({
        chunk,
        desiredSize: controller.desiredSize,
        queueSize: 2 - controller.desiredSize, // 反推队列大小
      })

      if (chunks.length >= 5) {
        controller.close()
      }
    },
  },
  new CountQueuingStrategy({ highWaterMark: 2 })
)

await stream.pipeTo(
  new WritableStream({
    write(chunk) {
      console.table(chunks)
    },
  })
)
// 输出队列大小从 0 → 1 → 2 → 1 → 0 的变化过程
```

负值不会阻止 pull() 调用，生产者需主动检查 desiredSize 来决定是否入队。

## 5. 🤔 highWaterMark 如何影响流的缓冲行为 ？

highWaterMark 定义队列容量上限，影响背压触发时机和内存使用量。

### 5.1. highWaterMark 的作用机制

```js
// highWaterMark = 1：严格限流
const strictStream = new ReadableStream(
  {
    pull(controller) {
      console.log('pull 调用，desiredSize:', controller.desiredSize)
      controller.enqueue(Math.random())
    },
  },
  new CountQueuingStrategy({ highWaterMark: 1 })
)
// desiredSize > 0 时才调用 pull()
// 队列只能容纳 1 个块，消费后才会再次 pull()

// highWaterMark = 10：允许缓冲
const bufferedStream = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue(Math.random())
    },
  },
  new CountQueuingStrategy({ highWaterMark: 10 })
)
// 队列可容纳 10 个块，减少 pull() 调用频率
```

### 5.2. 不同值的影响对比

| highWaterMark | 缓冲区大小 | pull() 频率  | 适用场景         |
| ------------- | ---------- | ------------ | ---------------- |
| 0             | 无缓冲     | 每次消费     | 实时数据流       |
| 1             | 单块缓冲   | 消费后调用   | 内存敏感场景     |
| 10+           | 多块缓冲   | 队列空时调用 | 网络请求、批处理 |

```js
// 观察不同 highWaterMark 下的调用次数
async function testHighWaterMark(hwm) {
  let pullCount = 0
  const stream = new ReadableStream(
    {
      pull(controller) {
        pullCount++
        controller.enqueue(pullCount)
        if (pullCount >= 100) controller.close()
      },
    },
    new CountQueuingStrategy({ highWaterMark: hwm })
  )

  await stream.pipeTo(
    new WritableStream({
      write() {
        // 模拟慢速消费
      },
    })
  )

  return pullCount
}

await testHighWaterMark(1) // pull 调用约 100 次
await testHighWaterMark(10) // pull 调用约 10-20 次（批量填充队列）
```

### 5.3. 字节流中的特殊处理

```js
// 字节流的 highWaterMark 单位是字节
const byteStream = new ReadableStream(
  {
    type: 'bytes',
    pull(controller) {
      // desiredSize 表示剩余字节容量
      const buffer = new Uint8Array(controller.desiredSize)
      controller.enqueue(buffer)
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 64 * 1024 }) // 64KB
)
```

### 5.4. 过大或过小的问题

```js
// ⚠️ highWaterMark 过小：频繁切换导致性能下降
const tooSmall = new ReadableStream(
  {
    async pull(controller) {
      const data = await fetch('/api').then((r) => r.text())
      controller.enqueue(data)
    },
  },
  new CountQueuingStrategy({ highWaterMark: 1 })
)
// 每次只缓冲 1 个块，网络请求无法批量化

// ⚠️ highWaterMark 过大：内存占用过高
const tooBig = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue(new Uint8Array(1024 * 1024)) // 1MB
    },
  },
  new CountQueuingStrategy({ highWaterMark: 1000 })
)
// 队列可容纳 1000 个 1MB 块 = 1GB 内存
```

### 5.5. 实际场景选择建议

```js
// 文件上传：较大 highWaterMark 提升吞吐量
const uploadStream = new ReadableStream(
  {
    async pull(controller) {
      const chunk = await readFileChunk()
      controller.enqueue(chunk)
    },
  },
  new ByteLengthQueuingStrategy({ highWaterMark: 256 * 1024 }) // 256KB
)

// 实时日志：较小 highWaterMark 降低延迟
const logStream = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue(getLatestLog())
    },
  },
  new CountQueuingStrategy({ highWaterMark: 3 })
)
```

highWaterMark 本质是在内存占用与调度效率之间的权衡，需根据数据块大小和消费速度调整。

## 6. 🤔 背压信号如何在管道链中传播 ？

背压信号从下游（消费者）向上游（生产者）逐级传播，通过 ReadableStream 的锁定机制自动协调。

### 6.1. 单向传播路径

```js
// 管道链：ReadableStream → TransformStream → WritableStream
const source = new ReadableStream({
  pull(controller) {
    console.log('Source desiredSize:', controller.desiredSize)
    controller.enqueue(Date.now())
  },
})

const transform = new TransformStream({
  transform(chunk, controller) {
    console.log('Transform desiredSize:', controller.desiredSize)
    controller.enqueue(chunk * 2)
  },
})

const sink = new WritableStream({
  write(chunk) {
    // 慢速写入触发背压
    return new Promise((resolve) => setTimeout(resolve, 1000))
  },
})

await source.pipeThrough(transform).pipeTo(sink)
// 背压传播：sink 慢 → transform 队列满 → source 暂停 pull()
```

### 6.2. 传播机制原理

```js
// 手动模拟背压传播
const reader = source.getReader()
const writer = sink.getWriter()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  // 等待 writer 准备好（背压信号）
  await writer.ready
  await writer.write(value)
}
// writer.ready Promise 在队列满时挂起，阻塞 reader.read()
```

### 6.3. 多级转换链

```js
const source = new ReadableStream(
  {
    pull(controller) {
      controller.enqueue('data')
    },
  },
  new CountQueuingStrategy({ highWaterMark: 2 })
)

const transform1 = new TransformStream(
  {
    transform(chunk, controller) {
      controller.enqueue(chunk.toUpperCase())
    },
  },
  new CountQueuingStrategy({ highWaterMark: 3 })
)

const transform2 = new TransformStream(
  {
    transform(chunk, controller) {
      controller.enqueue(`[${chunk}]`)
    },
  },
  new CountQueuingStrategy({ highWaterMark: 1 }) // ⚠️ 最小缓冲
)

const sink = new WritableStream(
  {
    write(chunk) {
      return new Promise((resolve) => setTimeout(resolve, 500))
    },
  },
  new CountQueuingStrategy({ highWaterMark: 4 })
)

await source.pipeThrough(transform1).pipeThrough(transform2).pipeTo(sink)
// 背压由 transform2（highWaterMark: 1）触发
// 信号传播：transform2 满 → transform1 暂停 → source 暂停
```

### 6.4. 背压失效的情况

```js
// ❌ 绕过管道机制：背压失效
const reader = source.getReader()
const writer = sink.getWriter()

// 忽略 writer.ready，持续写入
while (true) {
  const { value, done } = await reader.read()
  if (done) break
  writer.write(value) // 未等待，队列可能爆满
}

// ✅ 正确做法：等待 ready
while (true) {
  const { value, done } = await reader.read()
  if (done) break
  await writer.ready // 等待背压信号
  await writer.write(value)
}
```

### 6.5. 可视化传播过程

```js
function createInstrumentedStream(name, hwm) {
  return new TransformStream(
    {
      transform(chunk, controller) {
        console.log(`[${name}] 队列大小: ${hwm - controller.desiredSize}`)
        controller.enqueue(chunk)
      },
    },
    new CountQueuingStrategy({ highWaterMark: hwm })
  )
}

const pipeline = source
  .pipeThrough(createInstrumentedStream('Stage1', 5))
  .pipeThrough(createInstrumentedStream('Stage2', 3))
  .pipeThrough(createInstrumentedStream('Stage3', 1))
  .pipeTo(
    new WritableStream({
      write() {
        return new Promise((resolve) => setTimeout(resolve, 100))
      },
    })
  )
// 输出队列大小从下游到上游的变化
```

背压传播的核心是 pipeTo() 内部的协调逻辑，开发者无需手动处理信号传递。

## 7. 🤔 如何在自定义流中正确响应背压 ？

在 pull() 中检查 desiredSize，暂停生产；在 transform() 中控制入队时机。

### 7.1. ReadableStream 中的背压响应

```js
// ✅ 正确：根据 desiredSize 调整生产速率
const stream = new ReadableStream({
  async pull(controller) {
    // desiredSize <= 0 时停止生产
    if (controller.desiredSize <= 0) {
      console.log('队列已满，暂停生产')
      return
    }

    const data = await fetchData()
    controller.enqueue(data)
  },
})

// ❌ 错误：忽略 desiredSize，持续入队
const badStream = new ReadableStream({
  async start(controller) {
    while (true) {
      controller.enqueue(await fetchData()) // 无限入队
    }
  },
})
```

### 7.2. 处理批量数据

```js
// 数据库分页读取示例
function createDBStream(query) {
  let offset = 0
  const pageSize = 100

  return new ReadableStream({
    async pull(controller) {
      // 只在有容量时拉取下一页
      if (controller.desiredSize <= 0) {
        return
      }

      const rows = await db.query(query, { offset, limit: pageSize })

      if (rows.length === 0) {
        controller.close()
        return
      }

      // 逐行入队，每次检查容量
      for (const row of rows) {
        controller.enqueue(row)
        if (controller.desiredSize <= 0) {
          break // 队列满，下次 pull() 继续
        }
      }

      offset += rows.length
    },
  })
}
```

### 7.3. TransformStream 中的背压响应

```js
// ✅ 正确：transform() 中控制入队
const transform = new TransformStream({
  transform(chunk, controller) {
    const results = processChunk(chunk) // 可能产生多个输出

    for (const result of results) {
      if (controller.desiredSize <= 0) {
        console.log('下游队列满，缓存剩余数据')
        this.buffer = this.buffer || []
        this.buffer.push(result)
      } else {
        controller.enqueue(result)
      }
    }
  },
  flush(controller) {
    // 流结束时清空缓存
    if (this.buffer) {
      this.buffer.forEach((item) => controller.enqueue(item))
    }
  },
})
```

### 7.4. 避免阻塞 pull()

```js
// ❌ 错误：在 pull() 中等待队列清空
const badStream = new ReadableStream({
  async pull(controller) {
    while (controller.desiredSize <= 0) {
      await new Promise((resolve) => setTimeout(resolve, 100)) // 死锁！
    }
    controller.enqueue(data)
  },
})
// pull() 返回前队列不会被消费，导致永久等待

// ✅ 正确：直接返回，等待下次调用
const goodStream = new ReadableStream({
  pull(controller) {
    if (controller.desiredSize <= 0) {
      return // 队列满时直接返回
    }
    controller.enqueue(data)
  },
})
```

### 7.5. 结合 async 迭代器

```js
async function* generateData() {
  for (let i = 0; i < 1000; i++) {
    yield await fetchData(i)
  }
}

const stream = new ReadableStream({
  async start(controller) {
    const generator = generateData()

    // 封装生产逻辑
    this.produce = async () => {
      if (controller.desiredSize <= 0) return

      const { value, done } = await generator.next()
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    }
  },
  async pull(controller) {
    await this.produce()
  },
})
```

### 7.6. 实战示例：限速文件读取

```js
function createThrottledFileStream(file, bytesPerSecond) {
  let lastTime = Date.now()

  return new ReadableStream(
    {
      async pull(controller) {
        // 检查背压
        if (controller.desiredSize <= 0) {
          return
        }

        // 限速逻辑
        const now = Date.now()
        const elapsed = now - lastTime
        const maxBytes = (bytesPerSecond * elapsed) / 1000

        if (maxBytes < 1024) {
          // 未达到读取间隔
          return
        }

        const chunk = await file.read(
          Math.min(maxBytes, controller.desiredSize)
        )
        controller.enqueue(chunk)
        lastTime = now
      },
    },
    new ByteLengthQueuingStrategy({ highWaterMark: 64 * 1024 })
  )
}
```

正确响应背压的关键是：never block，always check desiredSize，let pull() return。

## 8. 💻 demos.1 - 观察背压信号的触发时机

::: code-group

<<< ./demos/1/1.html

<<< ./demos/1/1.js

:::

## 9. 💻 demos.2 - 实现一个支持背压的自定义流

::: code-group

<<< ./demos/2/1.html

<<< ./demos/2/1.js

:::

## 10. 🔗 引用

- [Streams API - Web APIs | MDN][1]
- [Backpressure - MDN Web Docs Glossary][2]
- [Streams Standard - WHATWG][3]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API
[2]: https://developer.mozilla.org/en-US/docs/Glossary/Backpressure
[3]: https://streams.spec.whatwg.org/
