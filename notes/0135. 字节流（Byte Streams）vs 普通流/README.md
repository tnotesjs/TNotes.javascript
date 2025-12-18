# [0135. 字节流（Byte Streams）vs 普通流](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0135.%20%E5%AD%97%E8%8A%82%E6%B5%81%EF%BC%88Byte%20Streams%EF%BC%89vs%20%E6%99%AE%E9%80%9A%E6%B5%81)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 字节流与普通流在数据处理上有什么本质区别 ？](#3--字节流与普通流在数据处理上有什么本质区别-)
  - [3.1. 数据类型限制](#31-数据类型限制)
  - [3.2. Reader 类型差异](#32-reader-类型差异)
  - [3.3. 内存管理差异](#33-内存管理差异)
  - [3.4. 对比表格](#34-对比表格)
  - [3.5. Controller 接口差异](#35-controller-接口差异)
- [4. 🤔 什么场景下应该优先使用字节流 ？](#4--什么场景下应该优先使用字节流-)
  - [4.1. 典型使用场景](#41-典型使用场景)
  - [4.2. 场景决策树](#42-场景决策树)
  - [4.3. 实际示例对比](#43-实际示例对比)
  - [4.4. 性能考量](#44-性能考量)
  - [4.5. 兼容性考虑](#45-兼容性考虑)
- [5. 🤔 如何创建一个字节流 ？](#5--如何创建一个字节流-)
  - [5.1. 基本创建方式](#51-基本创建方式)
  - [5.2. 使用 autoAllocateChunkSize 参数](#52-使用-autoallocatechunksize-参数)
  - [5.3. 响应 byobRequest](#53-响应-byobrequest)
  - [5.4. 实战：文件流包装](#54-实战文件流包装)
  - [5.5. 错误处理](#55-错误处理)
  - [5.6. 使用队列策略](#56-使用队列策略)
- [6. 🤔 ReadableStreamBYOBReader 的 BYOB 是什么意思 ？](#6--readablestreambyobreader-的-byob-是什么意思-)
  - [6.1. BYOB 的含义](#61-byob-的含义)
  - [6.2. 零拷贝优势](#62-零拷贝优势)
  - [6.3. 缓冲区复用](#63-缓冲区复用)
  - [6.4. 完整示例](#64-完整示例)
  - [6.5. BYOB 的限制](#65-byob-的限制)
  - [6.6. 性能对比](#66-性能对比)
- [7. 💻 demos.1 - 创建并读取一个字节流](#7--demos1---创建并读取一个字节流)
- [8. 💻 demos.2 - 对比字节流与普通流的性能差异](#8--demos2---对比字节流与普通流的性能差异)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 字节流与普通流的核心差异
- ReadableStreamBYOBReader 读取器
- Uint8Array 类型的 chunk 数据
- 字节流的应用场景
- autoAllocateChunkSize 参数
- 字节流的性能优势

## 2. 🫧 评价

字节流通过 type: 'bytes' 标识，专为二进制数据优化，支持 BYOB Reader 实现零拷贝读取。与普通流相比，字节流在处理文件、网络数据等二进制场景下内存效率更高，但限制了数据类型为 ArrayBufferView。理解两者差异和适用场景，是选择正确流类型的关键。

## 3. 🤔 字节流与普通流在数据处理上有什么本质区别 ？

字节流限定数据类型为 ArrayBufferView，支持零拷贝读取；普通流可传输任意类型数据。

### 3.1. 数据类型限制

```js
// 普通流：可以传输任意类型
const normalStream = new ReadableStream({
  start(controller) {
    controller.enqueue('string') // ✅ 字符串
    controller.enqueue({ id: 1 }) // ✅ 对象
    controller.enqueue([1, 2, 3]) // ✅ 数组
    controller.enqueue(new Uint8Array(10)) // ✅ 二进制
  },
})

// 字节流：只能传输 ArrayBufferView
const byteStream = new ReadableStream({
  type: 'bytes',
  start(controller) {
    controller.enqueue(new Uint8Array(10)) // ✅ Uint8Array
    controller.enqueue(new Uint16Array(5)) // ✅ Uint16Array
    controller.enqueue(new DataView(new ArrayBuffer(8))) // ✅ DataView

    // controller.enqueue('string') // ❌ TypeError
    // controller.enqueue({ data: [] }) // ❌ TypeError
  },
})
```

### 3.2. Reader 类型差异

```js
// 普通流：只能使用默认 Reader
const reader1 = normalStream.getReader()
console.log(reader1.constructor.name) // ReadableStreamDefaultReader

// 字节流：支持两种 Reader
const defaultReader = byteStream.getReader()
console.log(defaultReader.constructor.name) // ReadableStreamDefaultReader

const byobReader = byteStream.getReader({ mode: 'byob' })
console.log(byobReader.constructor.name) // ReadableStreamBYOBReader
```

### 3.3. 内存管理差异

```js
// 普通流：数据拷贝
const normal = new ReadableStream({
  pull(controller) {
    const data = new Uint8Array(1024)
    // 数据被拷贝到内部队列
    controller.enqueue(data)
    // data 可以立即复用或修改
    data[0] = 255
  },
})

// 字节流 + BYOB Reader：零拷贝
const byte = new ReadableStream({
  type: 'bytes',
  pull(controller) {
    const view = controller.byobRequest?.view
    if (view) {
      // 直接写入用户提供的缓冲区
      view[0] = 100
      controller.byobRequest.respond(view.byteLength)
    }
  },
})
```

### 3.4. 对比表格

| 特性         | 普通流               | 字节流                           |
| ------------ | -------------------- | -------------------------------- |
| type 参数    | 默认（不指定）       | 'bytes'                          |
| 数据类型     | 任意类型             | ArrayBufferView（Uint8Array 等） |
| Reader 类型  | DefaultReader        | DefaultReader 或 BYOBReader      |
| 零拷贝支持   | 不支持               | 支持（BYOB Reader）              |
| 内存效率     | 中等                 | 高                               |
| 适用场景     | 对象流、消息流       | 文件流、网络流、二进制数据       |
| 队列策略默认 | CountQueuingStrategy | ByteLengthQueuingStrategy        |

### 3.5. Controller 接口差异

```js
// 普通流的 controller
const normalController = {
  enqueue(chunk) {}, // chunk 可以是任意类型
  close() {},
  error(reason) {},
  desiredSize: 1,
}

// 字节流的 controller
const byteController = {
  enqueue(chunk) {}, // chunk 必须是 ArrayBufferView
  close() {},
  error(reason) {},
  desiredSize: 16384, // 默认 highWaterMark 更大
  byobRequest: {
    // 仅字节流有
    view: Uint8Array,
    respond(bytesWritten) {},
    respondWithNewView(view) {},
  },
}
```

本质区别在于字节流为二进制数据提供了专门优化，牺牲灵活性换取性能。

## 4. 🤔 什么场景下应该优先使用字节流 ？

处理文件、网络数据、大型二进制数据时优先使用字节流。

### 4.1. 典型使用场景

```js
// 场景 1：文件读取
async function readFile(file) {
  const stream = file.stream() // 浏览器 File API 返回字节流
  const reader = stream.getReader({ mode: 'byob' })

  const buffer = new Uint8Array(64 * 1024) // 64KB
  const { value } = await reader.read(buffer)
  return value // 零拷贝读取
}

// 场景 2：网络请求
const response = await fetch('/large-file.bin')
const byteStream = response.body // ReadableStream<Uint8Array>

// 场景 3：视频/音频流
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  const videoTrack = stream.getVideoTracks()[0]
  const reader = new MediaStreamTrackProcessor({
    track: videoTrack,
  }).readable.getReader()
  // 处理视频帧（二进制数据）
})
```

### 4.2. 场景决策树

| 数据特征             | 推荐流类型 | 原因                     |
| -------------------- | ---------- | ------------------------ |
| 文件上传/下载        | 字节流     | 大量二进制，需内存优化   |
| WebSocket 二进制消息 | 字节流     | ArrayBuffer/Blob 数据    |
| JSON API 响应        | 普通流     | 对象数据，无需字节级控制 |
| 日志流               | 普通流     | 字符串/对象，无性能要求  |
| 视频/音频编解码      | 字节流     | 大量帧数据，内存敏感     |
| 数据库查询结果       | 普通流     | 行对象，非二进制         |
| 图片处理管道         | 字节流     | 像素数据，需高性能       |
| 事件流（SSE）        | 普通流     | 文本消息                 |

### 4.3. 实际示例对比

```js
// ❌ 不推荐：用普通流处理大文件
async function uploadFileBad(file) {
  const stream = new ReadableStream({
    async start(controller) {
      const arrayBuffer = await file.arrayBuffer() // 一次性加载到内存
      controller.enqueue(new Uint8Array(arrayBuffer))
      controller.close()
    },
  })
  // 问题：大文件会导致内存爆炸
}

// ✅ 推荐：用字节流分块处理
function uploadFileGood(file) {
  return file.stream() // 浏览器原生字节流，按需读取
}

// ❌ 不推荐：用字节流处理 JSON
const jsonStream = new ReadableStream({
  type: 'bytes', // 不必要的限制
  start(controller) {
    const data = JSON.stringify({ id: 1 })
    controller.enqueue(new TextEncoder().encode(data)) // 额外编码开销
    controller.close()
  },
})

// ✅ 推荐：用普通流处理 JSON
const jsonStreamGood = new ReadableStream({
  start(controller) {
    controller.enqueue({ id: 1 }) // 直接传输对象
    controller.close()
  },
})
```

### 4.4. 性能考量

```js
// 小数据量（< 1MB）：普通流足够
const smallData = new ReadableStream({
  start(controller) {
    controller.enqueue(new Uint8Array(1024))
    controller.close()
  },
})

// 大数据量（> 10MB）：字节流 + BYOB 优化
function createLargeFileStream(file) {
  return new ReadableStream({
    type: 'bytes',
    async pull(controller) {
      const request = controller.byobRequest
      if (request) {
        // 零拷贝写入用户缓冲区
        const bytesRead = await readInto(request.view)
        request.respond(bytesRead)
      }
    },
  })
}
```

### 4.5. 兼容性考虑

```js
// 检测 BYOB Reader 支持
function supportsBYOB() {
  try {
    const stream = new ReadableStream({ type: 'bytes' })
    const reader = stream.getReader({ mode: 'byob' })
    reader.cancel()
    return true
  } catch {
    return false
  }
}

// 降级方案
function createOptimalStream(data) {
  if (supportsBYOB() && data instanceof ArrayBuffer) {
    return new ReadableStream({
      type: 'bytes',
      start(controller) {
        controller.enqueue(new Uint8Array(data))
        controller.close()
      },
    })
  }

  // 回退到普通流
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(data))
      controller.close()
    },
  })
}
```

核心原则：处理二进制且关注性能用字节流，处理对象或小数据用普通流。

## 5. 🤔 如何创建一个字节流 ？

在 ReadableStream 构造函数中设置 type: 'bytes'。

### 5.1. 基本创建方式

```js
const byteStream = new ReadableStream({
  type: 'bytes', // 关键：标识为字节流

  start(controller) {
    console.log('字节流初始化')
  },

  pull(controller) {
    // 生产数据
    const chunk = new Uint8Array(1024)
    controller.enqueue(chunk)
  },

  cancel(reason) {
    console.log('字节流取消:', reason)
  },
})
```

### 5.2. 使用 autoAllocateChunkSize 参数

```js
const autoByteStream = new ReadableStream(
  {
    type: 'bytes',

    pull(controller) {
      // 当使用默认 Reader 时，系统自动分配缓冲区
      const chunk = new Uint8Array(controller.desiredSize)
      fillRandomData(chunk)
      controller.enqueue(chunk)
    },
  },
  {
    // 自动分配的块大小
    autoAllocateChunkSize: 64 * 1024, // 64KB
  }
)

// 使用默认 Reader
const reader = autoByteStream.getReader()
const { value } = await reader.read()
console.log(value.byteLength) // 64KB
```

### 5.3. 响应 byobRequest

```js
const responsiveStream = new ReadableStream({
  type: 'bytes',

  pull(controller) {
    const byobRequest = controller.byobRequest

    if (byobRequest) {
      // BYOB Reader 提供了缓冲区
      const view = byobRequest.view
      console.log('写入用户缓冲区，大小:', view.byteLength)

      // 直接写入
      for (let i = 0; i < view.byteLength; i++) {
        view[i] = Math.floor(Math.random() * 256)
      }

      byobRequest.respond(view.byteLength)
    } else {
      // 默认 Reader，自己分配
      const chunk = new Uint8Array(1024)
      controller.enqueue(chunk)
    }
  },
})
```

### 5.4. 实战：文件流包装

```js
function createFileStream(file) {
  let offset = 0
  const chunkSize = 64 * 1024

  return new ReadableStream({
    type: 'bytes',

    async pull(controller) {
      if (offset >= file.size) {
        controller.close()
        return
      }

      const byobRequest = controller.byobRequest

      if (byobRequest) {
        // BYOB 模式：直接读到用户缓冲区
        const view = byobRequest.view
        const slice = file.slice(offset, offset + view.byteLength)
        const buffer = await slice.arrayBuffer()

        new Uint8Array(view.buffer, view.byteOffset, view.byteLength).set(
          new Uint8Array(buffer)
        )

        offset += buffer.byteLength
        byobRequest.respond(buffer.byteLength)
      } else {
        // 默认模式：自己分配缓冲区
        const slice = file.slice(offset, offset + chunkSize)
        const buffer = await slice.arrayBuffer()

        controller.enqueue(new Uint8Array(buffer))
        offset += buffer.byteLength
      }
    },
  })
}

// 使用
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]
const stream = createFileStream(file)
```

### 5.5. 错误处理

```js
const errorProneStream = new ReadableStream({
  type: 'bytes',

  pull(controller) {
    try {
      const data = readSomeData()

      // ✅ 正确：检查数据类型
      if (!(data instanceof Uint8Array)) {
        throw new TypeError('字节流只能入队 ArrayBufferView')
      }

      controller.enqueue(data)
    } catch (error) {
      controller.error(error)
    }
  },
})
```

### 5.6. 使用队列策略

```js
const strategicStream = new ReadableStream(
  {
    type: 'bytes',
    pull(controller) {
      controller.enqueue(new Uint8Array(1024))
    },
  },
  new ByteLengthQueuingStrategy({
    highWaterMark: 128 * 1024, // 128KB 缓冲
  })
)

console.log(strategicStream.constructor.name) // ReadableStream
```

创建字节流的关键是 type: 'bytes'，其他参数与普通流类似。

## 6. 🤔 ReadableStreamBYOBReader 的 BYOB 是什么意思 ？

BYOB 是 Bring Your Own Buffer 的缩写，表示用户提供缓冲区进行读取。

### 6.1. BYOB 的含义

```js
// 默认 Reader：系统分配缓冲区
const defaultReader = stream.getReader()
const { value } = await defaultReader.read()
// value 是系统创建的 Uint8Array

// BYOB Reader：用户提供缓冲区
const byobReader = stream.getReader({ mode: 'byob' })
const buffer = new Uint8Array(1024) // 用户自己分配
const { value } = await byobReader.read(buffer)
// value 是用户提供的 buffer（或其切片）
```

### 6.2. 零拷贝优势

```js
// 传统方式：多次内存拷贝
async function readTraditional(stream) {
  const reader = stream.getReader()
  const chunks = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value) // 拷贝 1：临时数组
  }

  // 拷贝 2：合并数组
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset) // 拷贝 3：设置数据
    offset += chunk.byteLength
  }

  return result
}

// BYOB 方式：零拷贝
async function readBYOB(stream) {
  const reader = stream.getReader({ mode: 'byob' })
  const buffer = new Uint8Array(64 * 1024) // 一次性分配

  const { value } = await reader.read(buffer)
  // 数据直接写入 buffer，无拷贝
  return value
}
```

### 6.3. 缓冲区复用

```js
async function readWithReuse(stream) {
  const reader = stream.getReader({ mode: 'byob' })
  const buffer = new Uint8Array(4096) // 4KB 缓冲区

  while (true) {
    const { done, value } = await reader.read(buffer)
    if (done) break

    processChunk(value)

    // ⚠️ 如果 value 是完整 buffer，可以复用
    // 如果是切片，需重新分配
    if (value.byteLength < buffer.byteLength) {
      buffer = new Uint8Array(4096) // 重新分配
    }
  }
}
```

### 6.4. 完整示例

```js
// 创建支持 BYOB 的字节流
const stream = new ReadableStream({
  type: 'bytes',

  pull(controller) {
    const request = controller.byobRequest

    if (request) {
      // BYOB Reader 提供了缓冲区
      const view = request.view

      // 模拟读取数据到用户缓冲区
      for (let i = 0; i < view.byteLength; i++) {
        view[i] = Math.floor(Math.random() * 256)
      }

      request.respond(view.byteLength)
    }
  },
})

// 使用 BYOB Reader
const reader = stream.getReader({ mode: 'byob' })

// 读取方式 1：提供缓冲区
const myBuffer = new Uint8Array(1024)
const result1 = await reader.read(myBuffer)
console.log('方式 1:', result1.value === myBuffer) // 可能为 true

// 读取方式 2：使用返回的 value 作为下次输入
let buffer = new Uint8Array(1024)
while (true) {
  const { done, value } = await reader.read(buffer)
  if (done) break

  console.log('读取了', value.byteLength, '字节')
  buffer = value // 复用返回的缓冲区
}
```

### 6.5. BYOB 的限制

```js
// ❌ 错误：普通流不支持 BYOB
const normalStream = new ReadableStream({
  // 没有 type: 'bytes'
})

try {
  const reader = normalStream.getReader({ mode: 'byob' })
} catch (error) {
  console.log(error.message) // This stream does not support BYOB readers
}

// ❌ 错误：传入非 ArrayBufferView
const byteStream = new ReadableStream({ type: 'bytes' })
const reader = byteStream.getReader({ mode: 'byob' })

try {
  await reader.read('not a buffer')
} catch (error) {
  console.log(error.message) // TypeError
}
```

### 6.6. 性能对比

```js
// 测试：读取 10MB 数据
async function benchmark() {
  const size = 10 * 1024 * 1024

  // 方式 1：默认 Reader
  const stream1 = createMockStream(size)
  const start1 = performance.now()
  await consumeWithDefault(stream1)
  console.log('默认 Reader:', performance.now() - start1, 'ms')

  // 方式 2：BYOB Reader
  const stream2 = createMockStream(size)
  const start2 = performance.now()
  await consumeWithBYOB(stream2)
  console.log('BYOB Reader:', performance.now() - start2, 'ms')
}

async function consumeWithBYOB(stream) {
  const reader = stream.getReader({ mode: 'byob' })
  let buffer = new Uint8Array(64 * 1024)

  while (true) {
    const { done, value } = await reader.read(buffer)
    if (done) break
    buffer = value
  }
}
```

BYOB 通过让用户控制缓冲区分配，实现零拷贝和内存复用，显著提升大数据量场景性能。

## 7. 💻 demos.1 - 创建并读取一个字节流

::: code-group

<<< ./demos/1/1.html

<<< ./demos/1/1.js

:::

## 8. 💻 demos.2 - 对比字节流与普通流的性能差异

::: code-group

<<< ./demos/2/1.html

<<< ./demos/2/1.js

:::

## 9. 🔗 引用

- [Streams API - Web APIs | MDN][1]
- [Using readable byte streams - MDN][2]
- [Streams Standard - Readable byte streams][3]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_byte_streams
[3]: https://streams.spec.whatwg.org/#rbs
