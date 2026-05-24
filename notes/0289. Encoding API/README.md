# [0289. Encoding API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0289.%20Encoding%20API)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Encoding API 解决什么问题？](#3--encoding-api-解决什么问题)
- [4. 🤔 `TextEncoder` 如何编码文本？](#4--textencoder-如何编码文本)
- [5. 🤔 `encode()` 和 `encodeInto()` 有什么区别？](#5--encode-和-encodeinto-有什么区别)
- [6. 🤔 `TextDecoder` 如何解码字节？](#6--textdecoder-如何解码字节)
- [7. 🤔 流式编码和解码适合什么场景？](#7--流式编码和解码适合什么场景)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Encoding API 的用途
- `TextEncoder` 与 UTF-8 编码
- `encode()` 和 `encodeInto()`
- `TextDecoder` 与多种编码解码
- `TextEncoderStream` 和 `TextDecoderStream`

## 2. 🫧 评价

- Encoding API 把“字符串”和“字节”之间那层隐形转换显式化了；一旦你开始处理文件、网络流和加密数据，它就会变得非常实用。

## 3. 🤔 Encoding API 解决什么问题？

JavaScript 字符串不是字节数组。网络、文件、流、加密等 API 经常处理的是二进制数据，而页面业务逻辑经常处理的是字符串。Encoding API 的作用就是在两者之间转换。

核心对象有两个：

| 对象          | 作用                                    |
| ------------- | --------------------------------------- |
| `TextEncoder` | 把字符串编码成字节，输出 `Uint8Array`。 |
| `TextDecoder` | 把字节解码成字符串。                    |

还有两个流式版本：`TextEncoderStream` 和 `TextDecoderStream`，用于和 Streams API 配合处理分块数据。

## 4. 🤔 `TextEncoder` 如何编码文本？

`TextEncoder` 始终使用 UTF-8 编码。

```js
const encoder = new TextEncoder()
const bytes = encoder.encode('hello')

console.log(bytes instanceof Uint8Array)
console.log(bytes)
```

ASCII 字符通常一个字符占一个字节，但很多 Unicode 字符会占多个字节。

```js
const encoder = new TextEncoder()

console.log(encoder.encode('©'))
console.log(encoder.encode('😊'))
```

`©` 的 UTF-8 字节是 `C2 A9`，而 `😊` 是 4 字节序列。理解这一点很重要，因为字符串长度不等于编码后的字节长度。

## 5. 🤔 `encode()` 和 `encodeInto()` 有什么区别？

`encode()` 会创建新的 `Uint8Array` 并返回。

```js
const encoder = new TextEncoder()
const bytes = encoder.encode('JavaScript')
```

`encodeInto()` 会把编码结果写入你提供的目标数组中，适合复用缓冲区，减少分配。

```js
const encoder = new TextEncoder()
const target = new Uint8Array(32)

const result = encoder.encodeInto('JavaScript', target)

console.log(result.read)
console.log(result.written)
```

返回对象里的 `read` 表示读取了多少个 UTF-16 代码单元，`written` 表示写入了多少个字节。

如果目标缓冲区不够大，`encodeInto()` 只会写入能容纳的部分。处理大文本或持续流入的数据时，这比每次重新分配数组更可控。

## 6. 🤔 `TextDecoder` 如何解码字节？

`TextDecoder` 可以把 `ArrayBuffer`、`DataView` 或定型数组中的字节解码成字符串。

```js
const decoder = new TextDecoder('utf-8')
const bytes = new Uint8Array([104, 101, 108, 108, 111])

console.log(decoder.decode(bytes))
```

`TextDecoder` 支持多种编码，具体取决于浏览器实现。

```js
const decoder = new TextDecoder('utf-16le')
```

创建解码器时还可以使用选项：

```js
const decoder = new TextDecoder('utf-8', {
  fatal: true,
  ignoreBOM: true,
})
```

`fatal: true` 表示遇到无效字节时抛出错误，而不是用替换字符兜底。处理协议、文件格式或安全敏感内容时，这个选项更适合暴露问题。

## 7. 🤔 流式编码和解码适合什么场景？

当数据按块到达时，不能总是假设每个块都刚好落在字符边界上。某个多字节字符可能前几个字节在第一个块，剩下字节在第二个块。`TextDecoderStream` 可以正确处理这种跨块字符。

```js
const response = await fetch('/api/logs')
const textStream = response.body.pipeThrough(new TextDecoderStream())

for await (const chunk of textStream) {
  console.log(chunk)
}
```

`TextEncoderStream` 则把字符串流转换成字节流。

```js
const encodedStream = textStream.pipeThrough(new TextEncoderStream())
```

流式编码和解码通常和 Fetch、Streams API、文件处理一起出现。它们的价值不在于单次转换，而在于可以边接收、边转换、边消费。
