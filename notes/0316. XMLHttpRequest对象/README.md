# [0316. XMLHttpRequest对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0316.%20XMLHttpRequest%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 XHR 的基本请求流程是什么？](#3--xhr-的基本请求流程是什么)
- [4. 🤔 如何判断 XHR 请求是否完成并成功？](#4--如何判断-xhr-请求是否完成并成功)
- [5. 🤔 如何取消请求？](#5--如何取消请求)
- [6. 🤔 XHR 如何设置请求头和读取响应头？](#6--xhr-如何设置请求头和读取响应头)
- [7. 🤔 GET 请求应该如何传参？](#7--get-请求应该如何传参)
- [8. 🤔 POST 请求应该如何发送数据？](#8--post-请求应该如何发送数据)
- [9. 🤔 XHR Level 2 增加了哪些能力？](#9--xhr-level-2-增加了哪些能力)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `XMLHttpRequest` 的创建和请求流程
- `open()`、`send()`、`readyState` 和 `status`
- 请求头和响应头处理
- GET 请求与 POST 请求
- `abort()`、`FormData`、`timeout` 和 `overrideMimeType()`

## 2. 🫧 评价

- XHR 的 API 不算优雅，但它奠定了前端异步请求的基本模型；理解它，很多 Fetch 之前的代码和兼容层都会更好读。

## 3. 🤔 XHR 的基本请求流程是什么？

现代浏览器可以直接通过构造函数创建 XHR 对象。

```js
const request = new XMLHttpRequest()
```

一次请求通常分三步：

1. 创建 `XMLHttpRequest` 实例。
2. 调用 `open()` 初始化请求。
3. 调用 `send()` 发送请求。

```js
const request = new XMLHttpRequest()

request.open('GET', '/api/user', true)
request.send(null)
```

`open()` 接收请求方法、URL 和是否异步三个参数。调用 `open()` 只是在配置请求，并不会真正发出网络请求。真正发出请求的是 `send()`。

如果没有请求体，`send()` 通常传 `null`。对于 GET 请求，请求参数放在 URL 查询字符串中；对于 POST 请求，请求体可以放在 `send()` 的参数中。

::: tip 注意

同步 XHR 会阻塞主线程，现代开发中应视为历史用法。实际项目里优先使用异步 XHR 或更现代的 `fetch()`。

:::

## 4. 🤔 如何判断 XHR 请求是否完成并成功？

XHR 通过 `readyState` 表示请求阶段：

| 值  | 状态     | 说明                                 |
| --- | -------- | ------------------------------------ |
| `0` | 未初始化 | 尚未调用 `open()`。                  |
| `1` | 已打开   | 已调用 `open()`，尚未调用 `send()`。 |
| `2` | 已发送   | 已调用 `send()`，尚未收到完整响应。  |
| `3` | 接收中   | 已收到部分响应。                     |
| `4` | 完成     | 响应已接收完成。                     |

每次 `readyState` 变化都会触发 `readystatechange`。

```js
const request = new XMLHttpRequest()

request.onreadystatechange = () => {
  if (request.readyState !== 4) return

  if (
    (request.status >= 200 && request.status < 300) ||
    request.status === 304
  ) {
    console.log(request.responseText)
  } else {
    console.log(`请求失败：${request.status}`)
  }
}

request.open('GET', '/api/user', true)
request.send(null)
```

判断成功时应优先看 `status`。`2xx` 通常表示成功，`304` 表示资源未修改，也可以视为有效响应。`statusText` 在跨浏览器场景中不如 `status` 稳定。

常用响应属性包括：

- `responseText`：响应体文本。
- `responseXML`：响应为 XML 时的 XML DOM 文档，否则通常是 `null`。
- `status`：HTTP 状态码。
- `statusText`：HTTP 状态描述。

## 5. 🤔 如何取消请求？

异步请求尚未完成时，可以调用 `abort()` 取消。

```js
const request = new XMLHttpRequest()

request.open('GET', '/api/slow', true)
request.send(null)

request.abort()
```

取消后，请求会停止，后续不应该再依赖这个 XHR 实例上的响应属性。实际代码中，取消请求后通常也会释放引用，避免复用已经中断的对象。

## 6. 🤔 XHR 如何设置请求头和读取响应头？

使用 `setRequestHeader()` 可以设置请求头。它必须在 `open()` 之后、`send()` 之前调用。

```js
const request = new XMLHttpRequest()

request.open('GET', '/api/user', true)
request.setRequestHeader('X-Client', 'tnotes')
request.send(null)
```

读取响应头可以使用：

```js
const contentType = request.getResponseHeader('Content-Type')
const allHeaders = request.getAllResponseHeaders()
```

浏览器会自动发送一些默认请求头，例如 `Accept`、`Accept-Language`、`Cookie`、`Referer` 和 `User-Agent` 等。自定义头部应避免和浏览器默认头部冲突。

## 7. 🤔 GET 请求应该如何传参？

GET 请求参数放在 URL 查询字符串中。参数名和值都应该编码。

```js
function addQueryParam(url, name, value) {
  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}${encodeURIComponent(name)}=${encodeURIComponent(value)}`
}

let url = '/api/books'

url = addQueryParam(url, 'author', 'Nicholas C. Zakas')
url = addQueryParam(url, 'edition', '4')

const request = new XMLHttpRequest()

request.open('GET', url, true)
request.send(null)
```

现代代码也可以直接使用 `URLSearchParams`。

```js
const query = new URLSearchParams({
  author: 'Nicholas C. Zakas',
  edition: '4',
})

request.open('GET', `/api/books?${query}`, true)
```

## 8. 🤔 POST 请求应该如何发送数据？

POST 请求通常把数据放在请求体里。

```js
const request = new XMLHttpRequest()
const body = new URLSearchParams({
  name: 'Ada',
  role: 'admin',
})

request.open('POST', '/api/users', true)
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
request.send(body.toString())
```

如果发送 JSON，需要设置 JSON 内容类型。

```js
request.open('POST', '/api/users', true)
request.setRequestHeader('Content-Type', 'application/json')
request.send(JSON.stringify({ name: 'Ada' }))
```

如果发送表单或文件，使用 `FormData` 更方便。

```js
const form = document.querySelector('form')
const formData = new FormData(form)

request.open('POST', '/api/upload', true)
request.send(formData)
```

使用 `FormData` 时，浏览器会自动设置合适的请求头，不要手动硬写 `multipart/form-data` 边界。

## 9. 🤔 XHR Level 2 增加了哪些能力？

XHR Level 2 在原有 XHR 基础上补充了几个常用能力。

第一，`FormData` 让表单序列化和文件上传更简单。

```js
const formData = new FormData()

formData.append('name', 'Ada')
formData.append('avatar', fileInput.files[0])
```

第二，`timeout` 可以设置请求超时时间。

```js
const request = new XMLHttpRequest()

request.open('GET', '/api/slow', true)
request.timeout = 1000
request.ontimeout = () => {
  console.log('请求超时')
}
request.send(null)
```

超时后访问某些响应属性可能出错，历史代码中常用 `try/catch` 做保护。

第三，`overrideMimeType()` 可以覆盖服务器返回的 MIME 类型，让 XHR 用指定方式处理响应。

```js
const request = new XMLHttpRequest()

request.open('GET', '/api/data', true)
request.overrideMimeType('text/xml')
request.send(null)
```

它必须在 `send()` 之前调用。
