# [0322. Web Socket](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0322.%20Web%20Socket)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 WebSocket 和普通 HTTP 请求有什么不同？](#3--websocket-和普通-http-请求有什么不同)
- [4. 🤔 如何创建 WebSocket 连接？](#4--如何创建-websocket-连接)
- [5. 🤔 如何发送和接收数据？](#5--如何发送和接收数据)
- [6. 🤔 WebSocket 有哪些生命周期事件？](#6--websocket-有哪些生命周期事件)
- [7. 🤔 使用 WebSocket 时要注意什么？](#7--使用-websocket-时要注意什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- WebSocket 的目标和协议切换
- `ws://` 与 `wss://`
- `WebSocket` 构造函数和 `readyState`
- 文本与二进制数据发送
- `open`、`message`、`error`、`close` 事件

## 2. 🫧 评价

- WebSocket 的价值在于它不是一来一回的 HTTP 请求，而是一条持续存在的双向通道；实时协作、聊天和行情类场景会因此简单很多。

## 3. 🤔 WebSocket 和普通 HTTP 请求有什么不同？

普通 HTTP 通信通常是请求响应模型：客户端发一次请求，服务器返回一次响应。

WebSocket 则通过一次 HTTP Upgrade 握手建立长连接，之后切换到 WebSocket 协议。在连接保持期间，客户端和服务器都可以主动发送消息。

这让 WebSocket 很适合：

- 聊天。
- 多人协作。
- 实时通知。
- 行情推送。
- 游戏状态同步。
- 低延迟双向通信。

WebSocket URL 使用 `ws://` 或 `wss://`。生产环境优先使用安全的 `wss://`。

## 4. 🤔 如何创建 WebSocket 连接？

创建连接使用 `WebSocket` 构造函数。

```js
const socket = new WebSocket('wss://example.com/socket')
```

构造函数需要绝对 URL。创建对象后，浏览器会立即开始连接。

`readyState` 表示连接状态：

| 常量                   | 值  | 说明         |
| ---------------------- | --- | ------------ |
| `WebSocket.CONNECTING` | `0` | 正在连接。   |
| `WebSocket.OPEN`       | `1` | 连接已建立。 |
| `WebSocket.CLOSING`    | `2` | 正在关闭。   |
| `WebSocket.CLOSED`     | `3` | 已关闭。     |

关闭连接调用 `close()`。

```js
socket.close()
```

## 5. 🤔 如何发送和接收数据？

连接打开后，可以使用 `send()` 发送数据。

```js
socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'hello' }))
})
```

`send()` 可以发送字符串、`ArrayBuffer` 或 `Blob`。

```js
const bytes = new TextEncoder().encode('hello')

socket.send(bytes.buffer)
socket.send(new Blob(['hello']))
```

接收数据监听 `message` 事件。

```js
socket.addEventListener('message', (event) => {
  console.log(event.data)
})
```

`event.data` 的类型可能是字符串、`Blob` 或 `ArrayBuffer`。二进制消息的接收类型可以通过 `binaryType` 控制。

```js
socket.binaryType = 'arraybuffer'
```

## 6. 🤔 WebSocket 有哪些生命周期事件？

常见事件包括：

| 事件      | 说明             |
| --------- | ---------------- |
| `open`    | 连接成功建立。   |
| `message` | 收到服务器消息。 |
| `error`   | 发生错误。       |
| `close`   | 连接关闭。       |

```js
const socket = new WebSocket('wss://example.com/socket')

socket.addEventListener('open', () => {
  console.log('连接已建立')
})

socket.addEventListener('error', () => {
  console.log('连接发生错误')
})

socket.addEventListener('close', (event) => {
  console.log(event.wasClean, event.code, event.reason)
})
```

`close` 事件对象常用属性包括：

- `wasClean`：是否干净关闭。
- `code`：关闭状态码。
- `reason`：关闭原因。

这些信息适合记录日志或决定是否重连。

## 7. 🤔 使用 WebSocket 时要注意什么？

WebSocket 不适合所有请求。普通查询、提交表单、加载资源仍然用 HTTP 请求更简单。

使用 WebSocket 时要关注：

- 服务器必须支持 WebSocket 协议。
- 连接断开后要有重连策略。
- 心跳或超时机制要和服务端约定。
- 消息格式要有版本和类型字段。
- 仍然要做身份认证和权限校验。
- 生产环境优先使用 `wss://`。

WebSocket 是通道，不是安全边界。服务器不能因为连接已经建立，就默认所有消息都可信。
