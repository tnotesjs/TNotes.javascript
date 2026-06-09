# [0295. Streams API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0295.%20Streams%20API)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么需要流式处理？](#3-为什么需要流式处理)
- [4. 块、队列和反压是什么？](#4-块队列和反压是什么)
- [5. 如何创建和读取 `ReadableStream`？](#5-如何创建和读取-readablestream)
- [6. 如何创建和写入 `WritableStream`？](#6-如何创建和写入-writablestream)
- [7. `TransformStream` 如何转换数据？](#7-transformstream-如何转换数据)
- [8. `pipeThrough()` 和 `pipeTo()` 有什么区别？](#8-pipethrough-和-pipeto-有什么区别)

<!-- endregion:toc -->

## 1. 本节内容

- Streams API 的核心概念
- 块、内部队列、反压和高水位线
- `ReadableStream`、`WritableStream` 和 `TransformStream`
- `getReader()`、`getWriter()` 与读写循环
- `pipeThrough()` 和 `pipeTo()` 管道连接

## 2. 评价

- Streams API 的抽象一开始有点绕，但它解决的是很朴素的问题：数据不必等全部到齐，应用可以边到、边处理、边输出。

## 3. 为什么需要流式处理？

很多数据不是一次性完整出现的。网络响应、文件读取、压缩结果、编码解码、实时日志都可能是一块一块到达。如果等所有数据都加载完再处理，会增加内存占用，也会延迟用户看到结果的时间。

Streams API 允许 JavaScript 以流的方式处理数据：

- 可读流负责产生数据块。
- 可写流负责消费数据块。
- 转换流负责把输入块转换成输出块。

## 4. 块、队列和反压是什么？

流中的每一小段数据称为 chunk，也就是块。块可以是字符串、对象、定型数组或其他值，具体取决于流的设计。

流内部有队列。当生产者生成数据比消费者处理数据更快时，队列会变长。为了避免无限增长，Streams API 引入了反压。反压表示消费者处理不过来时，生产者应该放慢或暂停。

高水位线用于描述队列期望的最大积压量。队列达到高水位线后，流会通过状态信号告诉生产者别再继续塞数据。

## 5. 如何创建和读取 `ReadableStream`？

`ReadableStream` 表示可读数据源。

```js
const readableStream = new ReadableStream({
  start(controller) {
    controller.enqueue('第一块')
    controller.enqueue('第二块')
    controller.close()
  },
})
```

读取可读流通常先获取 reader，再循环调用 `read()`。

```js
const reader = readableStream.getReader()

while (true) {
  const result = await reader.read()

  if (result.done) break

  console.log(result.value)
}
```

`read()` 返回对象，`value` 是当前块，`done` 表示流是否结束。

Fetch 的响应体就是常见的可读流：

```js
const response = await fetch('/api/logs')
const reader = response.body.getReader()
```

## 6. 如何创建和写入 `WritableStream`？

`WritableStream` 表示可写目标。创建时可以提供 `write()`、`close()` 和 `abort()` 等方法。

```js
const writableStream = new WritableStream({
  write(chunk) {
    console.log('写入', chunk)
  },
  close() {
    console.log('写入结束')
  },
})
```

写入时获取 writer。

```js
const writer = writableStream.getWriter()

await writer.ready
await writer.write('第一块')
await writer.write('第二块')
await writer.close()
```

`writer.ready` 会在内部队列适合继续写入时解决，这就是反压在写入端的体现。

## 7. `TransformStream` 如何转换数据？

`TransformStream` 同时有可写端和可读端。写入端接收输入块，转换后从可读端输出。

```js
const doubleStream = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk * 2)
  },
})
```

这类流适合做编码、解码、压缩、解压、过滤、拆行、JSONL 解析等中间处理。

Encoding API 的 `TextDecoderStream` 就是典型转换流：输入字节块，输出字符串块。

## 8. `pipeThrough()` 和 `pipeTo()` 有什么区别？

管道可以把流连接起来。

`pipeThrough()` 把可读流接到转换流，并返回转换后的可读流。

```js
const response = await fetch('/api/logs')
const textStream = response.body.pipeThrough(new TextDecoderStream())
```

`pipeTo()` 把可读流接到可写流，并返回一个表示管道完成的 `Promise`。

```js
await textStream.pipeTo(writableStream)
```

组合起来可以形成数据处理流水线：

```js
await response.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(lineSplitStream)
  .pipeTo(logWriterStream)
```

Streams API 的核心优势就在这里：处理步骤可以按管道拼接，每一步只关心自己接收和输出的块。
