# [0072. web streams](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0072.%20web%20streams)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Stream 是什么？](#3--stream-是什么)
- [4. 🤔 Web Streams API 是什么？](#4--web-streams-api-是什么)
  - [4.1. 基础 Stream 类型](#41-基础-stream-类型)
  - [4.2. 核心特点](#42-核心特点)
  - [4.3. 典型应用场景](#43-典型应用场景)
- [5. 🤔 Streams 中的核心概念都有哪些？](#5--streams-中的核心概念都有哪些)
  - [5.1. Readable streams - 可读流](#51-readable-streams---可读流)
    - [Chunks - 数据块](#chunks---数据块)
    - [Readers, consumers, and controllers - 读取器、消费者与控制器](#readers-consumers-and-controllers---读取器消费者与控制器)
    - [Locking - 锁定](#locking---锁定)
    - [Readable streams and byte streams - 可读流和字节流](#readable-streams-and-byte-streams---可读流和字节流)
  - [5.2. Teeing - 数据流分路](#52-teeing---数据流分路)
  - [5.3. Writable streams - 可写流](#53-writable-streams---可写流)
  - [5.4. Pipe chains - 管道链](#54-pipe-chains---管道链)
  - [5.5. Backpressure - 反压](#55-backpressure---反压)
  - [5.6. Internal queues and queuing strategies - 内部队列和排队策略](#56-internal-queues-and-queuing-strategies---内部队列和排队策略)
- [6. 🆚 传统处理方式 vs. 流式处理方式](#6--传统处理方式-vs-流式处理方式)
- [7. 🤔 ReadableStream 是什么？](#7--readablestream-是什么)
- [8. 💻 demos.1 - ReadableStream 基本使用](#8--demos1---readablestream-基本使用)
- [9. 💻 demos.2 - 流分叉（tee）](#9--demos2---流分叉tee)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Web Streams 简介

## 2. 🫧 评价

在工作中经常需要通过 Web Serial API、Web USB API、Web Bluetooth API 与底层嵌入式设备通信，这里面涉及到不少流操作，因此记录这篇笔记来梳理和 Web Streams 相关的内容。

## 3. 🤔 Stream 是什么？

在 Web Streams API 中，Stream 是一种用于高效、渐进式处理（如读取或写入）大数据（如网络响应、文件）的异步数据流抽象。

流式传输（Streaming）是指将网络资源分解成小块（chunks），然后逐块进行处理。浏览器在接收媒体资源时就已经使用了这种机制 —— 视频会边下载边缓冲播放，图片也会随着加载进度逐渐显示。

但在过去，JavaScript 从未拥有过这种能力。以前如果我们想处理某种资源（视频、文本文件等），必须先下载整个文件，等待它被反序列化为合适的格式，然后再处理接收到的全量数据。

有了 Streams API，你可以在原始数据可用时立即开始逐块处理，无需生成完整的缓冲区、字符串或 blob 对象。

Streams 的核心用法是让响应数据以流的形式提供。例如，成功的 `fetch` 请求返回的响应体就是一个 `ReadableStream`，可以通过 `ReadableStream.getReader()` 创建读取器来读取。

```js
// 使用 fetch 获取流式响应
const response = await fetch('https://jsonplaceholder.typicode.com/comments')
const reader = response.body.getReader()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  // value 是 Uint8Array，逐块处理数据
  console.log('接收到数据块:', value)
}
```

![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-12-16-17-15-52.png)

更复杂的用法包括使用 `ReadableStream()` 构造函数创建自定义流，例如在 Service Worker 中处理数据。

除了读取流数据之外，你也可以使用 `WritableStream` 向流中写入数据，或者使用 `TransformStream` 对流数据进行转换处理。

## 4. 🤔 Web Streams API 是什么？

Web Streams API 是浏览器提供的一套用于处理流式数据的标准接口，它允许 JavaScript 以分块（chunk）的方式逐步处理数据，而不需要一次性将所有数据加载到内存中。

### 4.1. 基础 Stream 类型

1. ReadableStream（可读流）
2. WritableStream（可写流）
3. TransformStream（转换流）

### 4.2. 核心特点

| 特点     | 说明                                               |
| -------- | -------------------------------------------------- |
| 分块处理 | 数据以小块的形式传输和处理，避免大文件占用过多内存 |
| 背压控制 | 自动管理数据流速，防止生产者速度过快导致消费者崩溃 |
| 可组合性 | 通过管道（pipe）将多个流连接起来，形成处理链       |
| 异步操作 | 基于 Promise，天然支持异步数据处理                 |
| 流程控制 | 检测流的开始和结束时机，按需处理错误和取消流       |
| 速度响应 | 根据流的读取速度做出响应，实现动态调整             |

### 4.3. 典型应用场景

| 场景 | 说明 |
| --- | --- |
| 大文件上传/下载 | 分块传输，显示进度，避免内存溢出 |
| 网络数据传输 | 流式处理 API 响应、SSE（Server-Sent Events）、实时数据推送 |
| 数据转换 | 文本编解码、数据压缩/解压、加密/解密等管道式处理 |
| 硬件通信 | 通过 Web Serial API、Web USB API、Web Bluetooth API 与底层设备通信 |
| 媒体处理 | 音视频流处理、实时转码 |
| Service Worker | 流式响应生成、缓存策略优化 |
| 数据聚合 | 从多个源读取数据并合并处理 |

## 5. 🤔 Streams 中的核心概念都有哪些？

### 5.1. Readable streams - 可读流

可读流是 JavaScript 中由 `ReadableStream` 对象表示的数据源，数据从底层源（underlying source）流出——底层源是网络上或你的域中某个位置的资源，你希望从中获取数据。

底层源有两种类型：

- 推送源（Push sources）：在你访问它们时会持续向你推送数据，由你来决定何时开始、暂停或取消对流的访问。例如视频流和 TCP/WebSocket。
- 拉取源（Pull sources）：需要你在连接后显式请求数据。例如通过 `fetch()` 请求进行的文件访问操作。

#### Chunks - 数据块

数据以称为"数据块（chunks）"的小片段顺序读取。一个数据块可以是单个字节，也可以是更大的内容（如特定大小的类型化数组）。单个流可以包含不同大小和类型的数据块。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-12-16-17-54-41.png)

放入流中的数据块被称为"入队（enqueued）"——这意味着它们在队列中等待被读取。内部队列会跟踪尚未被读取的数据块（详见下文的"内部队列和排队策略"部分）。

#### Readers, consumers, and controllers - 读取器、消费者与控制器

流中的数据块由读取器（reader）读取——它每次处理一个数据块，允许你对其执行任何你想要的操作。读取器加上与之配套的其他处理代码被称为消费者（consumer）。

还有一个你会用到的结构叫做控制器（controller）——每个读取器都有一个关联的控制器，允许你控制流（例如，如果需要可以关闭它）。

#### Locking - 锁定

一次只能有一个读取器读取一个流；当创建读取器并开始读取流时（活动读取器），我们说它被锁定到该流。如果你想让另一个读取器开始读取你的流，通常需要先取消第一个读取器，然后再做其他事情（不过你可以对流进行分叉，详见下文的"Teeing"部分）。

#### Readable streams and byte streams - 可读流和字节流

注意，可读流有两种不同的类型。除了常规可读流之外，还有一种叫做字节流（byte stream）的类型——它是常规流的扩展版本，用于读取底层字节源。与常规可读流相比，字节流允许通过 BYOB 读取器（BYOB，"bring your own buffer"，自带缓冲区）进行读取。这种读取器允许将流直接读入开发者提供的缓冲区，最大程度地减少所需的复制操作。你的代码将使用哪种底层流（以及相应的读取器和控制器）取决于流最初是如何创建的（参见 `ReadableStream()` 构造函数页面）。

你可以通过诸如 `fetch` 请求返回的 `Response.body` 等机制使用现成的可读流，也可以使用 `ReadableStream()` 构造函数创建自己的流。

### 5.2. Teeing - 数据流分路

### 5.3. Writable streams - 可写流

The chunks inside the stream are read by a reader — this processes the data one chunk at a time, allowing you to do whatever kind of operation you want to do on it. The reader plus the other processing code that goes along with it is called a consumer.

There is also a construct you'll use called a controller — each reader has an associated controller that allows you to control the stream (for example, to close it if wished).

### 5.4. Pipe chains - 管道链

### 5.5. Backpressure - 反压

### 5.6. Internal queues and queuing strategies - 内部队列和排队策略

## 6. 🆚 传统处理方式 vs. 流式处理方式

| 特性     | 传统处理方式           | 流式处理方式         |
| -------- | ---------------------- | -------------------- |
| 内存占用 | 需要一次性加载全部数据 | 只保留当前处理的分块 |
| 处理时机 | 等待数据完全到达后处理 | 数据到达即可开始处理 |
| 用户体验 | 长时间等待             | 可以实时显示进度     |
| 错误处理 | 全部失败               | 可以部分成功         |

::: code-group

```js [传统方式]
// ❌ 问题：大文件会占用大量内存
async function downloadFile(url) {
  const response = await fetch(url)
  const blob = await response.blob() // 等待全部数据
  // 处理 blob...
}
```

```js [流式处理]
// ✅ 优势：边下载边处理
async function downloadFile(url) {
  const response = await fetch(url)
  const reader = response.body.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    // 立即处理当前分块 value
  }
}
```

:::

## 7. 🤔 ReadableStream 是什么？

```js
// ReadableStream 是最基础的可读流类型，用于从数据源读取数据。
// 创建可读流
const readable = new ReadableStream(
  {
    // 流创建时立即调用，用于初始化
    start(controller) {
      controller.enqueue(data) // 向流中添加数据
      controller.close() // 关闭流
      controller.error(error) // 报告错误
    },

    // 消费者请求数据时调用（拉取模式）
    pull(controller) {
      // 可以在这里按需生成数据
      // 当内部队列未满时会被调用
    },

    // 消费者取消流时调用
    cancel(reason) {
      // 清理资源
    },
  },
  queuingStrategy
) // 可选的队列策略

// 读取方式1：使用 reader
const reader = readable.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  // 处理 value
}
reader.releaseLock() // 释放锁

// 读取方式2：管道到可写流
await readable.pipeTo(writableStream)

// 读取方式3：通过转换流
const transformed = readable.pipeThrough(transformStream)

// 其他方法
const [stream1, stream2] = readable.tee() // 分流
await readable.cancel(reason) // 取消流
```

## 8. 💻 demos.1 - ReadableStream 基本使用

1. 一个生成数字的简单示例
2. 流式读取文本文件数据

::: code-group

<<< ./demos/1/1.html [1]

<<< ./demos/1/2.html [2]

:::

## 9. 💻 demos.2 - 流分叉（tee）

::: code-group

<<< ./demos/2/1.html [1]

```js [6. 从异步迭代器创建流]
// 使用 ReadableStream.from() 从异步生成器创建流
async function* dataGenerator() {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    yield `数据 ${i}`
  }
}

const stream = ReadableStream.from(dataGenerator())

const reader = stream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  console.log(value)
}
// 每隔1秒输出：数据 0, 数据 1, 数据 2, 数据 3, 数据 4
```

```js [7. 错误处理]
// 演示流的错误处理
const errorStream = new ReadableStream({
  start(controller) {
    controller.enqueue('正常数据1')
    controller.enqueue('正常数据2')
    // 模拟错误
    controller.error(new Error('流处理出错'))
  },
})

const reader = errorStream.getReader()
try {
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    console.log(value)
  }
} catch (error) {
  console.error('捕获到错误:', error.message)
}
// 输出：
// 正常数据1
// 正常数据2
// 捕获到错误: 流处理出错
```

```js [8. 手动取消流]
// 演示如何取消正在读取的流
const cancelableStream = new ReadableStream({
  start(controller) {
    let count = 0
    const interval = setInterval(() => {
      controller.enqueue(`消息 ${++count}`)
      if (count >= 100) {
        controller.close()
        clearInterval(interval)
      }
    }, 100)
  },
  cancel(reason) {
    console.log('流被取消:', reason)
    // 清理资源
  },
})

const reader = cancelableStream.getReader()

// 读取3条消息后取消
for (let i = 0; i < 3; i++) {
  const { value } = await reader.read()
  console.log(value)
}

// 取消流
await reader.cancel('用户主动取消')
// 输出：
// 消息 1
// 消息 2
// 消息 3
// 流被取消: 用户主动取消
```

```js [9. 背压控制]
// 使用队列策略控制背压
const stream = new ReadableStream(
  {
    start(controller) {
      // 快速生成大量数据
      for (let i = 0; i < 1000; i++) {
        controller.enqueue(new Uint8Array(1024)) // 每次 1KB
      }
      controller.close()
    },
  },
  new ByteLengthQueuingStrategy({
    highWaterMark: 1024 * 10, // 10KB 高水位线
  })
)

// 慢速消费
const reader = stream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  // 模拟慢速处理
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log(`处理了 ${value.length} 字节`)
}
```

```js [10. 流式 JSON 解析]
// 流式解析服务器返回的 JSON 数组
async function streamJsonArray(url) {
  const response = await fetch(url)
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

  let buffer = ''
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += value

    // 尝试解析完整的 JSON 对象（简化版）
    // 实际应用中需要更复杂的解析逻辑
    const lines = buffer.split('\n')
    buffer = lines.pop() // 保留未完成的行

    for (const line of lines) {
      if (line.trim()) {
        try {
          const data = JSON.parse(line)
          console.log('解析到数据:', data)
        } catch (e) {
          console.error('JSON 解析错误:', e)
        }
      }
    }
  }
}
```

:::

## 10. 🔗 引用

- [JSONPlaceholder - 免费的在线 REST API 是笔记中用于测试的 API][5]
- [Streams API][4]
- [ReadableStream][1]
- [WritableStream][2]
- [TransformStream][3]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[2]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
[3]: https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
[5]: https://jsonplaceholder.typicode.com/
