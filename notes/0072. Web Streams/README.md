# [0072. Web Streams](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0072.%20Web%20Streams)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🔍 章节内容速查](#3--章节内容速查)
- [4. 🔍 学习路线](#4--学习路线)
- [5. 🤔 ReadableStream 是什么？](#5--readablestream-是什么)
- [6. 💻 demos.1 - 简单的生成数字流示例](#6--demos1---简单的生成数字流示例)
- [7. 💻 demos.3 - 流式读取文本文件数据示例](#7--demos3---流式读取文本文件数据示例)
- [8. 💻 demos.2 - `response.body` 分流 `tee()` 处理示例](#8--demos2---responsebody-分流-tee-处理示例)
- [9. 💻 demos.4 - 错误处理](#9--demos4---错误处理)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Web Streams 章节速览

## 2. 🫧 评价

在工作中经常需要通过 Web Serial API、Web USB API、Web Bluetooth API 与底层嵌入式设备通信，这里面涉及到不少流操作，因此记录这篇笔记来梳理和 Web Streams 相关的内容。

笔记中记录的大部分内容主要来自 MDN 上的 Web Streams 相关文档。

## 3. 🔍 章节内容速查

<N :ids="['0073', '0124', '0125', '0140', '0130', '0133', '0136', '0135', '0131', '0132', '0134', '0138', '0137', '0139']" />

## 4. 🔍 学习路线

- 基础概念：先建立整体认知，再看 API 全貌
  - Web Streams 核心概念
  - Web Streams API 概览
- 核心 API：掌握三大核心 API，为后续机制和实战打基础
  - ReadableStream
  - WritableStream 与 TransformStream
  - BYOB Reader 与零拷贝读取
- 核心机制：理解底层机制，先背压再队列再字节流，逻辑递进
  - 背压机制（Backpressure）
  - Stream 的队列策略详解
  - 字节流（Byte Streams）vs 普通流
- 操作与集成：学会组合使用，处理常见场景
  - Stream 管道操作与组合模式
  - Fetch API 与 Web Streams 集成
  - Stream 的错误处理与取消机制
- 实战与优化：最后是综合应用和优化技巧
  - Stream 的实战应用场景
  - Stream 性能优化与最佳实践
  - Stream 与其他 API 的集成

## 5. 🤔 ReadableStream 是什么？

ReadableStream 是最基础的可读流类型，用于从数据源读取数据。

```js
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
  // 可选的队列策略
  queuingStrategy
)

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

## 6. 💻 demos.1 - 简单的生成数字流示例

::: code-group

<<< ./demos/1/1.html

<<< ./demos/1/1.js

:::

## 7. 💻 demos.3 - 流式读取文本文件数据示例

::: code-group

<<< ./demos/3/1.html

<<< ./demos/3/1.js

:::

## 8. 💻 demos.2 - `response.body` 分流 `tee()` 处理示例

::: code-group

<<< ./demos/2/1.html

<<< ./demos/2/1.js

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

## 9. 💻 demos.4 - 错误处理

::: code-group

<<< ./demos/4/1.html

<<< ./demos/4/1.js

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
