# [0130. WritableStream 与 TransformStream](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0130.%20WritableStream%20%E4%B8%8E%20TransformStream)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 相关 API](#3-相关-api)
- [4. WritableStream 是什么？](#4-writablestream-是什么)
- [5. TransformStream 是什么？](#5-transformstream-是什么)
- [6. WritableStream 如何处理背压信号？](#6-writablestream-如何处理背压信号)
  - [6.1. 背压信号的产生](#61-背压信号的产生)
  - [6.2. 背压信号的响应](#62-背压信号的响应)
  - [6.3. 背压的传播路径](#63-背压的传播路径)
  - [6.4. 实际应用场景](#64-实际应用场景)
- [7. TransformStream 的 transform 和 flush 方法何时被调用？](#7-transformstream-的-transform-和-flush-方法何时被调用)
  - [7.1. 调用时机演示](#71-调用时机演示)
  - [7.2. 方法对比](#72-方法对比)
  - [7.3. flush 的典型用法](#73-flush-的典型用法)
  - [7.4. 不需要 flush 的情况](#74-不需要-flush-的情况)
- [8. 如何将多个 TransformStream 链接在一起？](#8-如何将多个-transformstream-链接在一起)
  - [8.1. 基本链接方式](#81-基本链接方式)
  - [8.2. 内置转换流的链接](#82-内置转换流的链接)
  - [8.3. 自定义管道组合](#83-自定义管道组合)
  - [8.4. 管道的优势](#84-管道的优势)
- [9. 流处理过程中出现错误时如何正确清理资源？](#9-流处理过程中出现错误时如何正确清理资源)
  - [9.1. 基本错误处理](#91-基本错误处理)
  - [9.2. 使用 AbortController 取消流](#92-使用-abortcontroller-取消流)
  - [9.3. TransformStream 中的错误处理](#93-transformstream-中的错误处理)
  - [9.4. 确保资源清理的模式](#94-确保资源清理的模式)
- [10. demos.1 - 实现文本编码转换流](#10-demos1---实现文本编码转换流)
- [11. demos.2 - 创建一个数据压缩流](#11-demos2---创建一个数据压缩流)
- [12. `close()` vs `abort()` vs `error()`（写入侧）](#12-close-vs-abort-vs-error写入侧)
- [13. `pipeTo` 的选项如何选择？](#13-pipeto-的选项如何选择)

<!-- endregion:toc -->

## 1. 本节内容

- WritableStreamDefaultWriter 写入器
- 写入策略参数（queuingStrategy）
- desiredSize 的基本使用
- TransformStream 的双向特性
- transform 和 flush 回调函数
- 多个 TransformStream 的链接

## 2. 评价

理解这两个接口（WritableStream 与 TransformStream）的关键在于掌握背压传播机制和错误处理流程。

## 3. 相关 API

1. `WritableStream` 构造函数
2. `writer` 写入器
3. `TransformStream` 构造函数

::: code-group

<<< ./assets/api/1.js

<<< ./assets/api/2.js

<<< ./assets/api/3.js

:::

## 4. WritableStream 是什么？

WritableStream 是浏览器中用于将流式数据写入接收端（如文件、网络或其他流）的 Web Streams API。

WritableStream 作为数据写入的终点，通过写入器 `WritableStreamDefaultWriter` 与队列策略共同实现背压控制。

WritableStream 的核心是 `desiredSize` 属性，它反映了内部队列的状态。当 `desiredSize <= 0` 时，说明队列已满，此时 `write()` 返回的 Promise 会等待，直到队列有空间再写入。这种内置的自动背压机制确保了生产者不会压垮消费者。实践中最常见的错误是忘记等待 `await writer.ready` Promise，导致背压信号丢失。

```js
// 获取可写流和写入器
const stream = new WritableStream(...);
const writer = stream.getWriter();

try {
  while (chunk) {
    // 等待 ready 确保背压信号被处理
    await writer.ready;
    // 如果不 await writer.ready，可能会在流无法处理时继续写入
    // 进而导致背压信号丢失，可能引发内存问题或数据丢失
    writer.write(chunk);
  }
} finally {
  writer.close();
}
```

## 5. TransformStream 是什么？

TransformStream 是一种用于在数据流经时转换或修改数据的流式处理接口，它在可读和可写之间架起桥梁，实现数据转换。

TransformStream 的精妙之处在于它同时暴露了 `readable` 和 `writable` 两个属性，可以无缝插入管道链中。transform() 方法处理每个数据块，flush() 方法在流结束时调用，适合做最后的清理或输出缓冲数据。多个 TransformStream 可以通过 pipeThrough() 链接，形成强大的数据处理管道。

TransformStream 构造函数与队列策略

TransformStream 同时暴露 `readable` 与 `writable` 可作为管道中的中间处理环节 支持在末尾 `flush` 做收尾工作。

## 6. WritableStream 如何处理背压信号？

WritableStream 通过 `desiredSize` 属性和 `writer.ready` Promise 来处理背压。

### 6.1. 背压信号的产生

```js
const writable = new WritableStream(
  {
    write(chunk) {
      console.log('写入:', chunk)
    },
  },
  new CountQueuingStrategy({ highWaterMark: 2 }),
) // 队列最多容纳 2 个 chunk

const writer = writable.getWriter()

console.log(writer.desiredSize) // 2（队列为空）

writer.write('A')
console.log(writer.desiredSize) // 1（还能容纳 1 个）

writer.write('B')
console.log(writer.desiredSize) // 0（队列已满）

writer.write('C')
console.log(writer.desiredSize) // -1（超出容量，产生背压）
```

### 6.2. 背压信号的响应

```js
const writer = writable.getWriter()

// ✅ 正确：等待 ready Promise
async function writeWithBackpressure(data) {
  for (const chunk of data) {
    await writer.ready // 等待队列有空间
    writer.write(chunk)
  }
}

// ❌ 错误：忽略背压信号
async function writeWithoutBackpressure(data) {
  for (const chunk of data) {
    writer.write(chunk) // 可能导致内存溢出
  }
}
```

### 6.3. 背压的传播路径

```mermaid
graph LR
    A[ReadableStream] -->|数据块| B[TransformStream]
    B -->|转换后| C[WritableStream]
    C -->|desiredSize <= 0| D[发送背压信号]
    D -->|暂停读取| A
```

### 6.4. 实际应用场景

```js
// 场景：流式上传大文件
async function uploadLargeFile(file) {
  const readable = file.stream()
  const writable = new WritableStream({
    async write(chunk) {
      // 模拟网络上传（慢速）
      await fetch('/upload', {
        method: 'POST',
        body: chunk,
      })
    },
  })

  // pipeTo 自动处理背压
  await readable.pipeTo(writable)
  // ✅ 文件读取速度会自动匹配网络上传速度
}
```

关键：writer.ready Promise 确保写入速度不超过处理能力。

## 7. TransformStream 的 transform 和 flush 方法何时被调用？

transform() 在每个数据块到达时调用，flush() 在流结束时调用一次。

### 7.1. 调用时机演示

```js
const transform = new TransformStream({
  transform(chunk, controller) {
    console.log('transform 被调用:', chunk)
    controller.enqueue(chunk.toUpperCase())
  },
  flush(controller) {
    console.log('flush 被调用')
    controller.enqueue('END') // 可以输出最后的数据
  },
})

const readable = new ReadableStream({
  start(controller) {
    controller.enqueue('hello')
    controller.enqueue('world')
    controller.close() // 触发 flush
  },
})

await readable.pipeThrough(transform).pipeTo(
  new WritableStream({
    write(chunk) {
      console.log('输出:', chunk)
    },
  }),
)

// 输出顺序：
// transform 被调用: hello
// 输出: HELLO
// transform 被调用: world
// 输出: WORLD
// flush 被调用
// 输出: END
```

### 7.2. 方法对比

| 方法      | 调用时机          | 参数              | 用途                   |
| --------- | ----------------- | ----------------- | ---------------------- |
| transform | 每个 chunk 到达时 | chunk, controller | 转换单个数据块         |
| flush     | 流结束时（一次）  | controller        | 输出缓冲数据、最后清理 |
| start     | 流创建时（可选）  | controller        | 初始化资源             |

### 7.3. flush 的典型用法

```js
// 场景1：行缓冲处理器
const lineBuffer = new TransformStream({
  buffer: '',
  transform(chunk, controller) {
    this.buffer += chunk
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() // 保留未完成的行

    for (const line of lines) {
      controller.enqueue(line)
    }
  },
  flush(controller) {
    // ✅ 输出最后一行（可能没有换行符）
    if (this.buffer) {
      controller.enqueue(this.buffer)
    }
  },
})

// 场景2：数据压缩
const compressor = new TransformStream({
  chunks: [],
  transform(chunk, controller) {
    this.chunks.push(chunk)
    // 每 10 个 chunk 压缩一次
    if (this.chunks.length >= 10) {
      controller.enqueue(compress(this.chunks))
      this.chunks = []
    }
  },
  flush(controller) {
    // ✅ 压缩剩余的 chunk
    if (this.chunks.length > 0) {
      controller.enqueue(compress(this.chunks))
    }
  },
})
```

### 7.4. 不需要 flush 的情况

```js
// 简单的一对一转换，不需要 flush
const upperCase = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase())
  },
  // 无需 flush
})
```

transform 处理流中数据，flush 处理流末尾收尾工作。

## 8. 如何将多个 TransformStream 链接在一起？

使用 pipeThrough() 方法串联多个 TransformStream，形成处理管道。

### 8.1. 基本链接方式

```js
const input = new ReadableStream({
  start(controller) {
    controller.enqueue('hello world')
    controller.close()
  },
})

const upperCase = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase())
  },
})

const reverse = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.split('').reverse().join(''))
  },
})

// 链接多个转换流
const output = input
  .pipeThrough(upperCase) // hello world → HELLO WORLD
  .pipeThrough(reverse) // HELLO WORLD → DLROW OLLEH

const reader = output.getReader()
const { value } = await reader.read()
console.log(value) // DLROW OLLEH
```

### 8.2. 内置转换流的链接

```js
// 场景：压缩文本文件
const fileStream = file.stream()

const compressed = fileStream
  .pipeThrough(new TextEncoderStream()) // 文本 → 字节
  .pipeThrough(new CompressionStream('gzip')) // 压缩

// 场景：解压并解码
const decompressed = compressedStream
  .pipeThrough(new DecompressionStream('gzip')) // 解压
  .pipeThrough(new TextDecoderStream()) // 字节 → 文本
```

### 8.3. 自定义管道组合

```js
// 创建可复用的转换流
function createJSONLineParser() {
  return new TransformStream({
    buffer: '',
    transform(chunk, controller) {
      this.buffer += chunk
      const lines = this.buffer.split('\n')
      this.buffer = lines.pop()

      for (const line of lines) {
        if (line.trim()) {
          controller.enqueue(JSON.parse(line))
        }
      }
    },
    flush(controller) {
      if (this.buffer.trim()) {
        controller.enqueue(JSON.parse(this.buffer))
      }
    },
  })
}

function createDataFilter(predicate) {
  return new TransformStream({
    transform(chunk, controller) {
      if (predicate(chunk)) {
        controller.enqueue(chunk)
      }
    },
  })
}

// 组合使用
const response = await fetch('/api/data')
response.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(createJSONLineParser())
  .pipeThrough(createDataFilter((obj) => obj.status === 'active'))
  .pipeTo(
    new WritableStream({
      write(obj) {
        updateUI(obj)
      },
    }),
  )
```

### 8.4. 管道的优势

| 对比项   | 传统方式             | 管道方式           |
| -------- | -------------------- | ------------------ |
| 代码组织 | 嵌套回调或临时变量   | 链式调用，清晰直观 |
| 背压处理 | 手动实现             | 自动传播           |
| 错误处理 | 每层单独 try-catch   | 统一在 pipeTo 处理 |
| 内存占用 | 可能缓存所有中间结果 | 流式处理，恒定内存 |
| 可复用性 | 难以抽象             | 每个转换流独立复用 |

pipeThrough() 让数据像流水线一样经过多道工序，每个环节专注单一职责。

## 9. 流处理过程中出现错误时如何正确清理资源？

使用 pipeTo() 的 signal 选项或在流的回调中处理错误，确保资源释放。

### 9.1. 基本错误处理

```js
const readable = new ReadableStream({
  start(controller) {
    controller.enqueue('data')
    controller.error(new Error('读取失败')) // 触发错误
  },
  cancel(reason) {
    console.log('流被取消:', reason)
    // ✅ 清理资源
  },
})

const writable = new WritableStream({
  write(chunk) {
    console.log(chunk)
  },
  abort(reason) {
    console.log('写入中止:', reason)
    // ✅ 清理资源
  },
})

try {
  await readable.pipeTo(writable)
} catch (error) {
  console.log('管道错误:', error.message)
}
// 输出：
// data
// 流被取消: Error: 读取失败
// 写入中止: Error: 读取失败
// 管道错误: 读取失败
```

### 9.2. 使用 AbortController 取消流

```js
const controller = new AbortController()

const readable = new ReadableStream({
  async start(ctrl) {
    for (let i = 0; i < 100; i++) {
      if (controller.signal.aborted) {
        return // 停止生产
      }
      ctrl.enqueue(i)
      await new Promise((r) => setTimeout(r, 100))
    }
    ctrl.close()
  },
  cancel(reason) {
    console.log('取消原因:', reason)
  },
})

// 3 秒后取消
setTimeout(() => {
  controller.abort('用户超时')
}, 3000)

try {
  await readable.pipeTo(writable, { signal: controller.signal })
} catch (error) {
  console.log('已取消')
}
```

### 9.3. TransformStream 中的错误处理

```js
const riskyTransform = new TransformStream({
  transform(chunk, controller) {
    try {
      const result = JSON.parse(chunk) // 可能抛出错误
      controller.enqueue(result)
    } catch (error) {
      // ❌ 错误做法：吞掉错误
      console.error('解析失败，跳过')

      // ✅ 正确做法：传播错误
      controller.error(error)
    }
  },
})

// 捕获管道中的错误
try {
  await readable.pipeThrough(riskyTransform).pipeTo(writable)
} catch (error) {
  console.log('管道中断:', error.message)
}
```

### 9.4. 确保资源清理的模式

```js
// 管理外部资源的流
class FileWriterStream {
  constructor(filePath) {
    this.filePath = filePath
    this.fileHandle = null

    this.writable = new WritableStream({
      start: async () => {
        this.fileHandle = await openFile(this.filePath)
      },
      write: async (chunk) => {
        await this.fileHandle.write(chunk)
      },
      close: async () => {
        await this.fileHandle?.close()
        console.log('✅ 文件已关闭')
      },
      abort: async (reason) => {
        await this.fileHandle?.close()
        console.log('✅ 异常时也关闭了文件:', reason)
      },
    })
  }
}

// 使用
const fileWriter = new FileWriterStream('/path/to/file')
try {
  await readable.pipeTo(fileWriter.writable)
} catch (error) {
  // abort() 会被自动调用，文件句柄会被释放
  console.error('写入失败，但资源已清理')
}
```

关键：在 cancel() 和 abort() 回调中释放资源，即使发生错误也能正确清理。

## 10. demos.1 - 实现文本编码转换流

::: code-group

<<< ./demos/1/common.js

<<< ./demos/1/demo1.js

<<< ./demos/1/demo2.js

<<< ./demos/1/demo3.js

<<< ./demos/1/index.html

:::

## 11. demos.2 - 创建一个数据压缩流

::: code-group

<<< ./demos/2/common.js

<<< ./demos/2/demo1.js

<<< ./demos/2/demo2.js

<<< ./demos/2/demo3.js

<<< ./demos/2/index.html

:::

## 12. `close()` vs `abort()` vs `error()`（写入侧）

| 操作      | 触发方式         | 回调    | 语义                            |
| --------- | ---------------- | ------- | ------------------------------- |
| `close()` | 上游正常结束     | `close` | 已入队数据仍会写完 然后收尾关闭 |
| `abort()` | 写入侧异常中止   | `abort` | 中断写入并清理资源 传递异常原因 |
| `error()` | 转换或读取侧错误 | 无      | 将流置为错误状态 管道抛出异常   |

示例一 正常结束与写入收尾

```js
const writable = new WritableStream({
  write: async (chunk) => save(chunk),
  close: async () => finalize(),
})

await readable.pipeTo(writable)
```

示例二 异常中止的清理

```js
const writable = new WritableStream({
  write: async (chunk) => save(chunk),
  abort: async (reason) => cleanup(reason),
})

try {
  await readable.pipeTo(writable)
} catch (e) {
  // abort 会被调用 用于异常清理
}
```

## 13. `pipeTo` 的选项如何选择？

`pipeTo` 提供了几个常用选项 用于控制三端的关闭与取消传播 以及与外部取消信号配合。

| 选项 | 说明 |
| --- | --- |
| `preventClose` | 阻止在写入端自动调用 `close` 保持写入端开启 用于复用或延迟收尾 |
| `preventAbort` | 阻止在写入端自动调用 `abort` 错误不向写入端传播 |
| `preventCancel` | 阻止在读取端自动调用 `cancel` 错误不向读取端传播 |
| `signal` | 传入外部取消信号 如 `AbortController` 的 `signal` 用于统一取消 |

常见组合示例：

- 需要统一收尾时 保持默认传播 即不设置 `preventClose` 等选项
- 上游数据源需保留时 可设置 `preventCancel` 防止读取端被取消
- 写入端为共享资源时 可设置 `preventClose` 避免自动关闭 由外部手动 `close`
