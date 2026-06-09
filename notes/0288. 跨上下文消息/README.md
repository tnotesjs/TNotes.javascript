# [0288. 跨上下文消息](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0288.%20%E8%B7%A8%E4%B8%8A%E4%B8%8B%E6%96%87%E6%B6%88%E6%81%AF)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是跨上下文消息？](#3-什么是跨上下文消息)
- [4. `postMessage()` 如何发送消息？](#4-postmessage-如何发送消息)
- [5. 接收消息时能拿到哪些信息？](#5-接收消息时能拿到哪些信息)
- [6. 为什么接收端必须校验 `origin`？](#6-为什么接收端必须校验-origin)
- [7. 如何回信给发送方？](#7-如何回信给发送方)

<!-- endregion:toc -->

## 1. 本节内容

- `postMessage()` 的用途
- 父窗口、子窗口和 iframe 的消息通信
- `targetOrigin` 的安全意义
- `message` 事件对象的关键字段
- 接收端来源校验和回信方式

## 2. 评价

- 跨上下文消息的 API 很小，但安全边界很硬；真正重要的不是能不能发消息，而是只和可信来源交换可信数据。

## 3. 什么是跨上下文消息？

跨上下文消息用于让不同浏览上下文之间通信，例如：

- 父页面和 `iframe`。
- 主窗口和 `window.open()` 打开的子窗口。
- 同一页面中不同来源的嵌入内容。

由于同源策略限制，不同来源的窗口不能随意读取彼此的 DOM。但它们可以通过 `postMessage()` 发送消息，并通过 `message` 事件接收消息。

这就是跨上下文消息的价值：在不破坏同源安全模型的前提下，提供一个受控通信通道。

## 4. `postMessage()` 如何发送消息？

发送消息时，要对目标窗口调用 `postMessage()`。

```js
const frame = document.querySelector('#previewFrame')

frame.contentWindow.postMessage(
  { type: 'preview:update', payload: { title: 'Hello' } },
  'https://preview.example.com',
)
```

第二个参数 `targetOrigin` 很重要。它指定只有目标窗口的来源匹配时，浏览器才会投递消息。

不要在能明确目标来源时写 `'*'`。通配符会让消息发给任何当前占据该窗口的页面，如果目标窗口被导航到恶意来源，敏感数据就可能泄漏。

## 5. 接收消息时能拿到哪些信息？

接收端通过监听 `message` 事件获取消息。

```js
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://app.example.com') return

  const message = event.data

  if (message.type === 'preview:update') {
    updatePreview(message.payload)
  }
})
```

`message` 事件对象常用字段包括：

| 字段     | 作用                         |
| -------- | ---------------------------- |
| `data`   | 发送方传来的数据。           |
| `origin` | 发送方来源。                 |
| `source` | 发送方窗口引用，可用于回信。 |

现代浏览器支持结构化克隆，因此 `data` 可以是对象、数组、字符串等可克隆数据。为了兼容旧环境，历史代码中常只发送字符串，但现代代码通常可以发送结构化数据。

## 6. 为什么接收端必须校验 `origin`？

任何能拿到窗口引用的页面都可能向当前窗口发送消息。如果接收端不校验 `origin`，就可能把不可信数据当成可信指令执行。

```js
const allowedOrigins = new Set([
  'https://app.example.com',
  'https://admin.example.com',
])

window.addEventListener('message', (event) => {
  if (!allowedOrigins.has(event.origin)) return

  handleTrustedMessage(event.data)
})
```

除了校验来源，也要校验消息结构。不要直接把收到的数据拼接进 HTML、执行为代码或作为敏感操作参数。

## 7. 如何回信给发送方？

接收端可以使用 `event.source` 回信。回信时同样应该指定明确的目标来源。

```js
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://app.example.com') return

  event.source.postMessage({ type: 'preview:ready' }, event.origin)
})
```

`event.source` 是发送方窗口对象引用，`event.origin` 是发送方来源。把二者组合使用，可以形成一次简单的请求与响应。

跨上下文消息看起来像普通事件，但它跨越了安全边界。只要记住“发送时限定目标，接收时校验来源”，就能避开大多数危险用法。
