# [0139. Stream 与其他 API 的集成](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0139.%20Stream%20%E4%B8%8E%E5%85%B6%E4%BB%96%20API%20%E7%9A%84%E9%9B%86%E6%88%90)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何使用 TextEncoderStream 进行文本编码转换 ？](#3--如何使用-textencoderstream-进行文本编码转换-)
  - [3.1. TextEncoderStream 基本用法](#31-textencoderstream-基本用法)
  - [3.2. TextDecoderStream 基本用法](#32-textdecoderstream-基本用法)
  - [3.3. 处理不完整的字节序列](#33-处理不完整的字节序列)
  - [3.4. 支持的编码格式](#34-支持的编码格式)
  - [3.5. 实际应用：流式下载文本文件](#35-实际应用流式下载文本文件)
- [4. 🤔 CompressionStream 支持哪些压缩格式 ？](#4--compressionstream-支持哪些压缩格式-)
  - [4.1. gzip 压缩](#41-gzip-压缩)
  - [4.2. deflate 压缩](#42-deflate-压缩)
  - [4.3. deflate-raw 压缩](#43-deflate-raw-压缩)
  - [4.4. 压缩格式对比](#44-压缩格式对比)
  - [4.5. 实际应用：压缩上传文件](#45-实际应用压缩上传文件)
  - [4.6. 实际应用：解压下载的压缩文件](#46-实际应用解压下载的压缩文件)
- [5. 🤔 如何将 Blob 转换为流或从流创建 Blob ？](#5--如何将-blob-转换为流或从流创建-blob-)
  - [5.1. Blob 转换为流](#51-blob-转换为流)
  - [5.2. 流转换为 Blob](#52-流转换为-blob)
  - [5.3. 手动实现流转 Blob](#53-手动实现流转-blob)
  - [5.4. File 对象也支持流](#54-file-对象也支持流)
  - [5.5. 实际应用：分块上传文件](#55-实际应用分块上传文件)
  - [5.6. 实际应用：下载大文件并保存](#56-实际应用下载大文件并保存)
- [6. 🤔 File System Access API 如何与流配合使用 ？](#6--file-system-access-api-如何与流配合使用-)
  - [6.1. 流式读取文件](#61-流式读取文件)
  - [6.2. 流式写入文件](#62-流式写入文件)
  - [6.3. 追加写入文件](#63-追加写入文件)
  - [6.4. 实际应用：导出大型 JSON 数据](#64-实际应用导出大型-json-数据)
  - [6.5. 实际应用：日志文件追加](#65-实际应用日志文件追加)
  - [6.6. ⚠️ 注意事项](#66-️-注意事项)
- [7. 🤔 如何实现一个完整的 JSON 流解析器 ？](#7--如何实现一个完整的-json-流解析器-)
  - [7.1. 基础实现](#71-基础实现)
  - [7.2. 创建 TransformStream](#72-创建-transformstream)
  - [7.3. 使用示例](#73-使用示例)
  - [7.4. 改进版：支持 JSON Lines 格式](#74-改进版支持-json-lines-格式)
  - [7.5. 实际应用：流式处理 API 响应](#75-实际应用流式处理-api-响应)
  - [7.6. 性能优化](#76-性能优化)
- [8. 💻 demos.1 - 使用压缩流处理大文件](#8--demos1---使用压缩流处理大文件)
- [9. 💻 demos.2 - 实现完整的 JSON 流解析器](#9--demos2---实现完整的-json-流解析器)
- [10. 💻 demos.3 - 结合 File System Access API 的文件处理](#10--demos3---结合-file-system-access-api-的文件处理)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- TextEncoderStream 与 TextDecoderStream
- CompressionStream 与 DecompressionStream
- Blob 与流的相互转换
- File System Access API 与流
- 完整的 JSON 流解析器实现
- WebCodecs API 与流集成

## 2. 🫧 评价

Web Streams 与浏览器其他 API 的集成能力强大且实用。TextEncoderStream 和 TextDecoderStream 简化了文本编码转换，CompressionStream 提供了原生压缩支持（gzip、deflate、deflate-raw）。Blob 与流的相互转换使得文件处理更加灵活。File System Access API 结合流可以实现大文件的增量读写。这些集成降低了开发复杂度，提升了性能，是现代 Web 应用处理数据流的标准方案。

## 3. 🤔 如何使用 TextEncoderStream 进行文本编码转换 ？

TextEncoderStream 和 TextDecoderStream 用于在流中进行文本编码和解码转换。

### 3.1. TextEncoderStream 基本用法

将字符串流转换为 UTF-8 字节流：

```js
const textStream = new ReadableStream({
  start(controller) {
    controller.enqueue('你好')
    controller.enqueue('世界')
    controller.close()
  },
})

const encoder = new TextEncoderStream()

const byteStream = textStream.pipeThrough(encoder)

const reader = byteStream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  console.log(value) // Uint8Array [228, 189, 160, 229, 165, 189]
}
```

### 3.2. TextDecoderStream 基本用法

将字节流转换为字符串流：

```js
const byteStream = new ReadableStream({
  start(controller) {
    controller.enqueue(new Uint8Array([228, 189, 160, 229, 165, 189]))
    controller.enqueue(new Uint8Array([228, 184, 150, 231, 149, 140]))
    controller.close()
  },
})

const decoder = new TextDecoderStream('utf-8')

const textStream = byteStream.pipeThrough(decoder)

const reader = textStream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  console.log(value) // "你好" "世界"
}
```

### 3.3. 处理不完整的字节序列

TextDecoderStream 会自动处理跨 chunk 的多字节字符：

```js
const stream = new ReadableStream({
  start(controller) {
    // "你" 的 UTF-8 编码被分割成两部分
    controller.enqueue(new Uint8Array([228, 189])) // 不完整
    controller.enqueue(new Uint8Array([160])) // 补齐
    controller.close()
  },
})

const decoder = new TextDecoderStream()

const reader = stream.pipeThrough(decoder).getReader()
const { value } = await reader.read()
console.log(value) // "你" ✅ 正确解码
```

### 3.4. 支持的编码格式

```js
// UTF-8（默认）
const utf8Decoder = new TextDecoderStream('utf-8')

// UTF-16
const utf16Decoder = new TextDecoderStream('utf-16')

// GBK
const gbkDecoder = new TextDecoderStream('gbk')

// 指定错误处理模式
const decoder = new TextDecoderStream('utf-8', {
  fatal: true, // 遇到无效序列抛出错误
  ignoreBOM: false, // 不忽略 BOM
})
```

### 3.5. 实际应用：流式下载文本文件

```js
const response = await fetch('large-file.txt')

const textStream = response.body.pipeThrough(new TextDecoderStream())

const reader = textStream.getReader()
let content = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  content += value
  console.log(`已接收 ${content.length} 个字符`)
}
```

TextEncoderStream 和 TextDecoderStream 简化了流中的文本处理，自动处理多字节字符的边界问题。

## 4. 🤔 CompressionStream 支持哪些压缩格式 ？

CompressionStream 支持 gzip、deflate、deflate-raw 三种压缩格式，DecompressionStream 用于解压。

### 4.1. gzip 压缩

最常用的压缩格式，包含文件头和校验：

```js
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('重复文本'.repeat(1000)))
    controller.close()
  },
})

const compressedStream = stream.pipeThrough(new CompressionStream('gzip'))

let originalSize = 0
let compressedSize = 0

const reader = compressedStream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  compressedSize += value.byteLength
}

console.log(
  `压缩率: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`
)
```

### 4.2. deflate 压缩

zlib 格式，包含 zlib 头部：

```js
const compressor = new CompressionStream('deflate')
const decompressor = new DecompressionStream('deflate')

const originalData = new TextEncoder().encode('测试数据')

// 压缩
const compressed = await new Response(
  new ReadableStream({
    start(controller) {
      controller.enqueue(originalData)
      controller.close()
    },
  }).pipeThrough(compressor)
).arrayBuffer()

// 解压
const decompressed = await new Response(
  new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(compressed))
      controller.close()
    },
  }).pipeThrough(decompressor)
).text()

console.log(decompressed) // "测试数据"
```

### 4.3. deflate-raw 压缩

原始 DEFLATE 格式，无头部无校验：

```js
const compressor = new CompressionStream('deflate-raw')

// 最小开销的压缩格式
const stream = fetch('data.json')
  .then((r) => r.body)
  .then((body) => body.pipeThrough(compressor))
```

### 4.4. 压缩格式对比

| 格式        | 头部 | 校验     | 兼容性     | 适用场景   |
| ----------- | ---- | -------- | ---------- | ---------- |
| gzip        | 有   | CRC32    | HTTP 标准  | 网络传输   |
| deflate     | 有   | Adler-32 | zlib 标准  | 通用压缩   |
| deflate-raw | 无   | 无       | 需手动处理 | 自定义协议 |

### 4.5. 实际应用：压缩上传文件

```js
async function uploadCompressed(file) {
  const compressedStream = file
    .stream()
    .pipeThrough(new CompressionStream('gzip'))

  const response = await fetch('/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Encoding': 'gzip',
    },
    body: compressedStream,
    duplex: 'half',
  })

  return response.ok
}
```

### 4.6. 实际应用：解压下载的压缩文件

```js
const response = await fetch('data.json.gz')

const decompressedStream = response.body.pipeThrough(
  new DecompressionStream('gzip')
)

const data = await new Response(decompressedStream).json()
console.log(data)
```

CompressionStream 提供了原生压缩能力，减小传输体积，提升性能。

## 5. 🤔 如何将 Blob 转换为流或从流创建 Blob ？

Blob 和 ReadableStream 可以相互转换，适用于文件处理场景。

### 5.1. Blob 转换为流

使用 `blob.stream()` 方法：

```js
const blob = new Blob(['你好', '世界'], { type: 'text/plain' })

const stream = blob.stream()

const reader = stream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  console.log(new TextDecoder().decode(value))
}
```

### 5.2. 流转换为 Blob

通过 Response API 收集流数据：

```js
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('Hello '))
    controller.enqueue(new TextEncoder().encode('World'))
    controller.close()
  },
})

const blob = await new Response(stream).blob()

console.log(blob.size) // 11
console.log(await blob.text()) // "Hello World"
```

### 5.3. 手动实现流转 Blob

```js
async function streamToBlob(stream, type = 'application/octet-stream') {
  const chunks = []
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return new Blob(chunks, { type })
}

// 使用
const stream = fetch('image.png').then((r) => r.body)
const blob = await streamToBlob(await stream, 'image/png')
```

### 5.4. File 对象也支持流

```js
const input = document.querySelector('input[type="file"]')
const file = input.files[0]

// File 继承自 Blob，也有 stream() 方法
const stream = file.stream()

// 分块读取大文件
const reader = stream.getReader()
let bytesRead = 0

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  bytesRead += value.byteLength
  console.log(`已读取: ${((bytesRead / file.size) * 100).toFixed(2)}%`)
}
```

### 5.5. 实际应用：分块上传文件

```js
async function uploadFileInChunks(file) {
  const stream = file.stream()
  const reader = stream.getReader()
  let chunkIndex = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // 将每个 chunk 作为单独请求上传
    await fetch(`/upload/chunk/${chunkIndex}`, {
      method: 'POST',
      body: value,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })

    chunkIndex++
  }

  // 通知服务器合并
  await fetch('/upload/complete', {
    method: 'POST',
    body: JSON.stringify({ totalChunks: chunkIndex }),
  })
}
```

### 5.6. 实际应用：下载大文件并保存

```js
async function downloadAndSave(url, filename) {
  const response = await fetch(url)
  const blob = await new Response(response.body).blob()

  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  // 释放对象 URL
  URL.revokeObjectURL(link.href)
}
```

Blob 与流的互转为文件处理提供了灵活性，适合处理大文件和需要增量处理的场景。

## 6. 🤔 File System Access API 如何与流配合使用 ？

File System Access API 提供了读写本地文件的能力，结合流可以处理大文件。

### 6.1. 流式读取文件

```js
async function readFileStream() {
  const [fileHandle] = await window.showOpenFilePicker()
  const file = await fileHandle.getFile()

  // 获取文件流
  const stream = file.stream()
  const decoder = new TextDecoderStream()
  const textStream = stream.pipeThrough(decoder)

  const reader = textStream.getReader()
  let content = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    content += value
    console.log(`已读取 ${content.length} 个字符`)
  }

  return content
}
```

### 6.2. 流式写入文件

```js
async function writeFileStream(data) {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: 'output.txt',
  })

  // 创建可写流
  const writable = await fileHandle.createWritable()

  // 创建数据流
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of data) {
        controller.enqueue(new TextEncoder().encode(chunk))
      }
      controller.close()
    },
  })

  // 写入文件
  await stream.pipeTo(writable)
}

// 使用
await writeFileStream(['第一行\n', '第二行\n', '第三行\n'])
```

### 6.3. 追加写入文件

```js
async function appendToFile(fileHandle, text) {
  const writable = await fileHandle.createWritable({
    keepExistingData: true, // 保留现有数据
  })

  // 移动到文件末尾
  const file = await fileHandle.getFile()
  await writable.seek(file.size)

  // 写入新数据
  await writable.write(new TextEncoder().encode(text))
  await writable.close()
}
```

### 6.4. 实际应用：导出大型 JSON 数据

```js
async function exportLargeJSON(data) {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: 'export.json',
    types: [
      {
        description: 'JSON 文件',
        accept: { 'application/json': ['.json'] },
      },
    ],
  })

  const writable = await fileHandle.createWritable()

  const encoder = new TextEncoderStream()
  const encodedStream = encoder.readable

  const writer = encoder.writable.getWriter()

  // 写入开始标记
  await writer.write('[')

  // 逐条写入数据
  for (let i = 0; i < data.length; i++) {
    await writer.write(JSON.stringify(data[i]))
    if (i < data.length - 1) {
      await writer.write(',')
    }
  }

  // 写入结束标记
  await writer.write(']')
  await writer.close()

  // 将编码后的流写入文件
  await encodedStream.pipeTo(writable)
}
```

### 6.5. 实际应用：日志文件追加

```js
class FileLogger {
  constructor(fileHandle) {
    this.fileHandle = fileHandle
  }

  async log(message) {
    const writable = await this.fileHandle.createWritable({
      keepExistingData: true,
    })

    const file = await this.fileHandle.getFile()
    await writable.seek(file.size)

    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`

    await writable.write(new TextEncoder().encode(logEntry))
    await writable.close()
  }
}

// 使用
const [fileHandle] = await window.showOpenFilePicker()
const logger = new FileLogger(fileHandle)

await logger.log('应用启动')
await logger.log('用户登录')
```

### 6.6. ⚠️ 注意事项

```js
// ❌ 错误：未正确关闭流会导致文件损坏
const writable = await fileHandle.createWritable()
await writable.write('数据')
// 忘记 close()

// ✅ 正确：始终关闭流
try {
  const writable = await fileHandle.createWritable()
  await writable.write('数据')
  await writable.close()
} catch (error) {
  await writable.abort() // 出错时中止
  throw error
}
```

File System Access API 结合流可以高效处理本地大文件，适合日志记录、数据导入导出等场景。

## 7. 🤔 如何实现一个完整的 JSON 流解析器 ？

实现一个能够处理大型 JSON 数组的流式解析器，逐个输出对象。

### 7.1. 基础实现

```js
class JSONStreamParser {
  constructor() {
    this.buffer = ''
    this.depth = 0
    this.inString = false
    this.escape = false
  }

  parse(chunk) {
    this.buffer += chunk
    const items = []

    let itemStart = -1
    let itemDepth = 0

    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i]

      // 处理转义字符
      if (this.escape) {
        this.escape = false
        continue
      }

      if (char === '\\') {
        this.escape = true
        continue
      }

      // 处理字符串
      if (char === '"') {
        this.inString = !this.inString
        continue
      }

      if (this.inString) continue

      // 跟踪嵌套深度
      if (char === '{' || char === '[') {
        if (this.depth === 1 && itemStart === -1) {
          itemStart = i
          itemDepth = this.depth
        }
        this.depth++
      } else if (char === '}' || char === ']') {
        this.depth--

        // 完整对象结束
        if (this.depth === itemDepth && itemStart !== -1) {
          const json = this.buffer.slice(itemStart, i + 1)
          try {
            items.push(JSON.parse(json))
          } catch (e) {
            // 忽略解析错误
          }
          itemStart = -1
        }
      }
    }

    // 清除已解析的部分
    if (itemStart === -1 && !this.inString) {
      this.buffer = ''
    }

    return items
  }
}
```

### 7.2. 创建 TransformStream

```js
function createJSONStreamParser() {
  const parser = new JSONStreamParser()
  const decoder = new TextDecoder()

  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true })
      const items = parser.parse(text)

      for (const item of items) {
        controller.enqueue(item)
      }
    },
    flush(controller) {
      // 处理剩余数据
      const items = parser.parse('')
      for (const item of items) {
        controller.enqueue(item)
      }
    },
  })
}
```

### 7.3. 使用示例

```js
const response = await fetch('large-data.json')

const stream = response.body.pipeThrough(createJSONStreamParser())

const reader = stream.getReader()
let count = 0

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  count++
  console.log(`解析第 ${count} 个对象:`, value)
}
```

### 7.4. 改进版：支持 JSON Lines 格式

JSON Lines 格式（每行一个 JSON 对象）更容易解析：

```js
function createJSONLinesParser() {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      const decoder = new TextDecoder()
      buffer += decoder.decode(chunk, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() // 保留最后一行（可能不完整）

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        try {
          const obj = JSON.parse(trimmed)
          controller.enqueue(obj)
        } catch (e) {
          console.error('解析错误:', e.message)
        }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer)
          controller.enqueue(obj)
        } catch (e) {
          console.error('解析错误:', e.message)
        }
      }
    },
  })
}
```

### 7.5. 实际应用：流式处理 API 响应

```js
async function processLargeDataset(apiUrl) {
  const response = await fetch(apiUrl)

  const jsonStream = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(createJSONStreamParser())

  const reader = jsonStream.getReader()
  const results = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // 处理每个对象
    if (value.price > 1000) {
      results.push(value)
    }

    // 增量更新 UI
    updateUI(results.length)
  }

  return results
}
```

### 7.6. 性能优化

```js
class OptimizedJSONStreamParser {
  constructor(options = {}) {
    this.maxBufferSize = options.maxBufferSize || 1024 * 1024 // 1MB
    this.buffer = ''
    this.bracketStack = []
    this.inString = false
    this.escape = false
  }

  parse(chunk) {
    // 防止缓冲区过大
    if (this.buffer.length > this.maxBufferSize) {
      throw new Error('缓冲区溢出')
    }

    this.buffer += chunk
    const items = []
    let start = 0

    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i]

      if (this.escape) {
        this.escape = false
        continue
      }

      if (char === '\\' && this.inString) {
        this.escape = true
        continue
      }

      if (char === '"' && !this.escape) {
        this.inString = !this.inString
        continue
      }

      if (this.inString) continue

      if (char === '{' || char === '[') {
        if (this.bracketStack.length === 1) {
          start = i
        }
        this.bracketStack.push(char)
      } else if (char === '}' || char === ']') {
        this.bracketStack.pop()

        if (this.bracketStack.length === 1) {
          const json = this.buffer.slice(start, i + 1)
          try {
            items.push(JSON.parse(json))
            start = i + 1
          } catch (e) {
            // 忽略
          }
        }
      }
    }

    // 清理已处理的数据
    this.buffer = this.buffer.slice(start)

    return items
  }
}
```

JSON 流解析器适合处理大型 JSON 数据集，避免一次性加载到内存中。

## 8. 💻 demos.1 - 使用压缩流处理大文件

演示使用 CompressionStream 和 DecompressionStream 对文件进行压缩和解压。支持 gzip、deflate、deflate-raw 三种格式，实时显示压缩率和处理速度。

[查看演示代码](./demos/1/)

## 9. 💻 demos.2 - 实现完整的 JSON 流解析器

实现一个完整的 JSON 流解析器，可以处理大型 JSON 数组。支持生成测试数据、从 URL 加载、读取本地文件三种数据源，实时展示解析进度和结果。

[查看演示代码](./demos/2/)

## 10. 💻 demos.3 - 结合 File System Access API 的文件处理

演示 File System Access API 与流的结合使用。支持流式读取文件、保存新文件、追加内容到文件，实时显示操作日志和进度。

[查看演示代码](./demos/3/)
