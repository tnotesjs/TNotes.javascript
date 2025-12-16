## 9. 💻 demos.2 - WritableStream 的基础用法

```js
const writable = new WritableStream({
  write(chunk, controller) {
    // 处理写入的数据
  },
  close() {
    // 流关闭时
  },
  abort(reason) {
    // 中止流
  },
})

// 写入数据
const writer = writable.getWriter()
await writer.write(data)
await writer.close()
```

::: code-group

:::

## 10. 💻 demos.3 - TransformStream 的基础用法

```js
// 创建转换流（数据处理器）
const transform = new TransformStream({
  transform(chunk, controller) {
    // 转换数据
    controller.enqueue(transformedChunk)
  },
  flush(controller) {
    // 流结束时的清理
  },
})

// 内置转换流
new TextEncoderStream() // 文本 → 字节
new TextDecoderStream() // 字节 → 文本
new CompressionStream('gzip') // 压缩
new DecompressionStream('gzip') // 解压
```

::: code-group

:::

## 11. 内置转换流 API

### 11.1. TextEncoderStream / TextDecoderStream

```js
// 文本编码/解码流
const encoder = new TextEncoderStream() // 字符串 → Uint8Array
const decoder = new TextDecoderStream() // Uint8Array → 字符串

// 使用场景
textStream
  .pipeThrough(new TextEncoderStream())
  .pipeThrough(new CompressionStream('gzip'))
  .pipeTo(writableStream)
```

### 11.2. CompressionStream / DecompressionStream

```js
// 压缩/解压缩流（支持 gzip, deflate, deflate-raw）
const compressed = readableStream.pipeThrough(new CompressionStream('gzip'))

const decompressed = compressedStream.pipeThrough(
  new DecompressionStream('gzip')
)
```

## 12. 流处理器 API

### 12.1. ByteLengthQueuingStrategy / CountQueuingStrategy

```js
// 控制背压的队列策略
const strategy = new ByteLengthQueuingStrategy({
  highWaterMark: 1024 * 1024, // 1MB 高水位线
})

const readable = new ReadableStream(
  {
    // ...
  },
  strategy
)
```

### 12.2. 与其他 Web API 集成的流

### 12.3. Fetch API 流

```js
// Response body 是 ReadableStream
const response = await fetch(url)
const reader = response.body.getReader()

// 流式读取响应
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  // 处理 value (Uint8Array)
}

// 创建流式响应
new Response(readableStream, {
  headers: { 'Content-Type': 'text/plain' },
})
```

### 12.4. File API / Blob 流

```js
// Blob 转 ReadableStream
const blobStream = blob.stream()
const fileStream = file.stream()

// 读取文件流
const fileReader = file.stream().getReader()
```

### 12.5. WebSocket 流

```js
// WebSocket 消息流
const ws = new WebSocket(url)

// 接收消息流
const readableStream = new ReadableStream({
  start(controller) {
    ws.onmessage = (event) => controller.enqueue(event.data)
    ws.onclose = () => controller.close()
  },
})

// 发送消息流
const writableStream = new WritableStream({
  write(chunk) {
    ws.send(chunk)
  },
})
```

### 12.6. Service Worker 流

```js
// 流式响应
self.addEventListener('fetch', (event) => {
  event.respondWith(
    new Response(
      new ReadableStream({
        start(controller) {
          // 流式生成响应
        },
      })
    )
  )
})
```

### 12.7. MediaStream API（多媒体流）

```js
// 虽然不是同一套 API，但也是流概念
const mediaStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
})

// 可以转换为可读流
const videoTrackStream = new ReadableStream({
  start(controller) {
    mediaStream.getVideoTracks()[0].onended = () => controller.close()
  },
})
```

### 12.8. 实用组合 API

### 12.9. ReadableStream.tee()

```js
// 分流：一个流分成两个相同的流
const [stream1, stream2] = readableStream.tee()

// 场景：同时处理和存储数据
const [processStream, saveStream] = originalStream.tee()
```

### 12.10. ReadableStream.from()

```js
// 从可迭代对象创建流
const stream = ReadableStream.from([1, 2, 3])
const asyncStream = ReadableStream.from(asyncGenerator())
```

### 12.11. 辅助工具方法

### 12.12. 流转换辅助

```js
// 常用转换模式
async function* transformGenerator(stream) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield transformValue(value) // 自定义转换
    }
  } finally {
    reader.releaseLock()
  }
}

// 收集流数据到数组
async function collectStream(stream) {
  const chunks = []
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return chunks
}
```

### 12.13. 性能优化相关

### 12.14. 背压（Backpressure）管理

```js
// 手动控制数据流速
async function processWithBackpressure(source, processor) {
  const reader = source.getReader()
  const writer = processor.getWriter()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 检查是否准备好接收更多数据
      const ready = await writer.ready
      if (ready) {
        await writer.write(process(value))
      }
    }
    await writer.close()
  } catch (error) {
    writer.abort(error)
    throw error
  }
}
```

### 12.15. 兼容性和检测

```js
// 特性检测
const streamSupport = {
  readableStream: 'ReadableStream' in window,
  writableStream: 'WritableStream' in window,
  transformStream: 'TransformStream' in window,
  textEncoderStream: 'TextEncoderStream' in window,
  compressionStream: 'CompressionStream' in window,
}

// Polyfill 可用
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from 'web-streams-polyfill'
```

### 12.16. 使用模式总结

```js
// 模式1：管道链式处理
inputStream
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(transformStream1)
  .pipeThrough(transformStream2)
  .pipeTo(outputStream)

// 模式2：手动控制
async function processStream(stream) {
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    // 处理每个 chunk
  }
}

// 模式3：Web API 集成
async function streamUpload(file) {
  const compressedStream = file
    .stream()
    .pipeThrough(new CompressionStream('gzip'))

  await fetch('/upload', {
    method: 'POST',
    body: compressedStream,
    headers: { 'Content-Encoding': 'gzip' },
  })
}
```

### 12.17. 最佳实践建议

1. 始终处理背压：避免内存溢出
2. 及时释放锁：`reader.releaseLock()`
3. 错误传播：确保错误能沿着管道传递
4. 资源清理：流完成后进行适当清理
5. 流式优先：对大文件使用流式处理
