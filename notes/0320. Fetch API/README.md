# [0320. Fetch API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0320.%20Fetch%20API)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `fetch()` 和 XHR 的核心差异是什么？](#3--fetch-和-xhr-的核心差异是什么)
- [4. 🤔 HTTP 错误为什么不会让 `fetch()` reject？](#4--http-错误为什么不会让-fetch-reject)
- [5. 🤔 `fetch()` 的第二个参数可以配置什么？](#5--fetch-的第二个参数可以配置什么)
- [6. 🤔 常见 Fetch 请求模式有哪些？](#6--常见-fetch-请求模式有哪些)
- [7. 🤔 `Headers` 对象有什么用？](#7--headers-对象有什么用)
- [8. 🤔 `Request` 对象封装了什么？](#8--request-对象封装了什么)
- [9. 🤔 `Response` 对象封装了什么？](#9--response-对象封装了什么)
- [10. 🤔 Body 混入为什么只能读取一次？](#10--body-混入为什么只能读取一次)
- [11. 🤔 如何中断 Fetch 请求？](#11--如何中断-fetch-请求)
- [12. 🤔 Fetch 如何处理流式响应？](#12--fetch-如何处理流式响应)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `fetch()` 的基本用法
- HTTP 状态和 Promise 失败的区别
- 常见 Fetch 请求模式
- `Headers`、`Request` 和 `Response`
- Body 混入和一次性流
- `AbortController` 和流式读取

## 2. 🫧 评价

- Fetch API 是现代浏览器请求远程资源的主力接口；它好用，但必须记住两个关键点：HTTP 错误不会自动 reject，响应体只能读取一次。

## 3. 🤔 `fetch()` 和 XHR 的核心差异是什么？

`fetch()` 是全局方法，可以在主线程、模块和 Worker 中使用。它返回 `Promise<Response>`，并且始终是异步的。

```js
const response = await fetch('/api/books')
const books = await response.json()
```

和 XHR 相比，Fetch 的接口更现代：

- 使用 Promise，而不是 `readyState` 和回调事件组合。
- 用 `Request` 表示请求，用 `Response` 表示响应。
- 用 `Headers` 管理请求头和响应头。
- 请求体和响应体基于 Streams API。
- 可以和 Service Worker、Cache API 等现代能力配合。

## 4. 🤔 HTTP 错误为什么不会让 `fetch()` reject？

只要服务器返回了响应，`fetch()` 的 Promise 通常就会 fulfilled。即使状态码是 `404` 或 `500`，它也会进入成功分支。

```js
const response = await fetch('/missing')

console.log(response.status) // 404
console.log(response.ok) // false
```

真正会让 Promise rejected 的通常是网络层或浏览器策略错误，例如无网络、DNS 失败、CORS 拒绝、HTTPS 策略错误等。

因此，实际使用时应主动检查 `response.ok`。

```js
async function requestJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}
```

`ok` 表示状态码是否在 `200` 到 `299` 范围内。

## 5. 🤔 `fetch()` 的第二个参数可以配置什么？

`fetch(input, init)` 的第二个参数是配置对象，常用字段包括：

| 字段          | 作用                                              |
| ------------- | ------------------------------------------------- |
| `method`      | 请求方法，例如 `GET`、`POST`、`PUT`、`DELETE`。   |
| `headers`     | 请求头。                                          |
| `body`        | 请求体。                                          |
| `credentials` | 是否携带 Cookie 等凭据。                          |
| `mode`        | 请求模式，例如 `cors`、`no-cors`、`same-origin`。 |
| `cache`       | 缓存策略。                                        |
| `redirect`    | 重定向处理方式。                                  |
| `signal`      | 用于中断请求的 `AbortSignal`。                    |
| `keepalive`   | 页面生命周期结束后仍尝试发送请求。                |

发送 JSON 的常见写法：

```js
const response = await fetch('/api/books', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: 'Professional JavaScript' }),
})

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`)
}
```

## 6. 🤔 常见 Fetch 请求模式有哪些？

发送表单 URL 编码数据：

```js
const body = new URLSearchParams({
  name: 'Ada',
  role: 'admin',
})

await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  body,
})
```

上传文件：

```js
const formData = new FormData()
const fileInput = document.querySelector('input[type="file"]')

formData.append('image', fileInput.files[0])

await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

加载图片为 `Blob` 并生成对象 URL：

```js
const image = document.querySelector('img')
const response = await fetch('/images/avatar.png')
const blob = await response.blob()
const objectUrl = URL.createObjectURL(blob)

image.src = objectUrl
```

跨源请求需要服务端 CORS 响应头。`mode: 'no-cors'` 可以发出有限请求，但响应类型是 `opaque`，不能读取响应内容。

## 7. 🤔 `Headers` 对象有什么用？

`Headers` 用于表示请求头或响应头。它和 `Map` 很像，支持 `get()`、`set()`、`has()`、`append()`、`delete()` 和迭代。

```js
const headers = new Headers({
  'Content-Type': 'application/json',
})

headers.append('X-Client', 'tnotes')

console.log(headers.get('Content-Type'))
```

同一个头部字段可能有多个值，`append()` 会把新值追加进去。

Fetch 会对某些头部设置护卫。比如禁止脚本设置部分敏感请求头，`no-cors` 模式下也只能设置有限头部。违反限制时可能抛出 `TypeError`。

## 8. 🤔 `Request` 对象封装了什么？

`Request` 表示一次请求。它可以单独创建，再传给 `fetch()`。

```js
const request = new Request('/api/books', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ page: 1 }),
})

const response = await fetch(request)
```

可以基于已有 `Request` 创建副本，也可以使用 `clone()`。

```js
const copy = request.clone()
```

如果请求有 body，那么 body 是一次性流。请求体被读取或发送后，不能再用同一个 `Request` 发送第二次。需要重复使用时，要在第一次使用前调用 `clone()`。

## 9. 🤔 `Response` 对象封装了什么？

`Response` 表示响应。常用属性包括：

| 属性         | 说明                                       |
| ------------ | ------------------------------------------ |
| `ok`         | 状态码是否为 `200` 到 `299`。              |
| `status`     | HTTP 状态码。                              |
| `statusText` | HTTP 状态描述。                            |
| `headers`    | 响应头。                                   |
| `url`        | 最终响应 URL。                             |
| `redirected` | 是否发生过重定向。                         |
| `type`       | 响应类型，例如 `basic`、`cors`、`opaque`。 |

读取响应体常用方法包括：

```js
await response.text()
await response.json()
await response.blob()
await response.formData()
await response.arrayBuffer()
```

响应体也是一次性流。如果需要用不同格式读取同一个响应，要先克隆。

```js
const response = await fetch('/api/report')
const copy = response.clone()

const text = await response.text()
const blob = await copy.blob()

console.log(response.bodyUsed) // true
```

## 10. 🤔 Body 混入为什么只能读取一次？

`Request` 和 `Response` 都使用了 Body 混入。它们的主体是 `ReadableStream`，流一旦被读取器锁定或扰动，就不能再被其他读取方式重复读取。

```js
const response = await fetch('/api/data')

await response.json()
await response.text() // 会失败，因为 body 已经被读取
```

`bodyUsed` 可以帮助你判断主体是否已经被使用。

```js
console.log(response.bodyUsed)
```

如果只是普通接口响应，直接选择一种读取方式即可。如果要一份响应用于缓存、一份用于页面渲染，应该提前 `clone()`。

## 11. 🤔 如何中断 Fetch 请求？

Fetch 支持 `AbortController`。

```js
const controller = new AbortController()

fetch('/large-file.zip', {
  signal: controller.signal,
}).catch((error) => {
  console.log(error.name)
})

controller.abort()
```

中断后，`fetch()` 返回的 Promise 会 rejected。这个能力适合取消搜索请求、离开页面时停止大文件下载、用户主动取消上传等场景。

## 12. 🤔 Fetch 如何处理流式响应？

`Response.body` 是 `ReadableStream`。对于大响应，可以边接收边处理。

```js
const response = await fetch('/large-text')
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { value, done } = await reader.read()

  if (done) break

  console.log(decoder.decode(value, { stream: true }))
}
```

需要注意，网络块的边界不等于字符边界。多字节字符可能跨块，因此解码文本时要使用 `TextDecoder` 的流式能力，或者直接使用 `TextDecoderStream`。

```js
const response = await fetch('/large-text')
const textStream = response.body.pipeThrough(new TextDecoderStream())

for await (const chunk of textStream) {
  console.log(chunk)
}
```

流式读取适合日志、长文本、大文件和需要边下载边处理的场景。普通 JSON 接口直接 `response.json()` 更简单。
