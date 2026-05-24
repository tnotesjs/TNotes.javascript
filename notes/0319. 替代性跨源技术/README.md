# [0319. 替代性跨源技术](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0319.%20%E6%9B%BF%E4%BB%A3%E6%80%A7%E8%B7%A8%E6%BA%90%E6%8A%80%E6%9C%AF)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么需要替代性跨源技术？](#3--为什么需要替代性跨源技术)
- [4. 🤔 图片探测如何发送跨源请求？](#4--图片探测如何发送跨源请求)
- [5. 🤔 图片探测有什么限制？](#5--图片探测有什么限制)
- [6. 🤔 JSONP 的原理是什么？](#6--jsonp-的原理是什么)
- [7. 🤔 JSONP 有哪些风险？](#7--jsonp-有哪些风险)
- [8. 🤔 今天还应该使用 JSONP 吗？](#8--今天还应该使用-jsonp-吗)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CORS 出现前的跨源需求
- 图片探测
- JSONP 的基本原理
- JSONP 的安全风险和失败处理问题
- 现代项目中的取舍

## 2. 🫧 评价

- 图片探测和 JSONP 都是很有时代感的方案：它们聪明地借用了浏览器资源加载能力，但也暴露了能力有限和安全边界薄的问题。

## 3. 🤔 为什么需要替代性跨源技术？

CORS 普及之前，XHR 受同源策略限制，无法直接读取跨源响应。开发者如果确实需要跨源通信，就会借助浏览器中天然允许跨源加载的资源类型，例如图片和脚本。

这些方案并不是正式的通用跨源请求模型，而是利用资源加载规则达成特定目标。因此它们通常有明显限制。

现代项目中，优先使用 CORS 和 Fetch。图片探测和 JSONP 更适合作为历史知识或兼容旧接口时的备选方案。

## 4. 🤔 图片探测如何发送跨源请求？

浏览器允许页面跨源加载图片。因此，可以动态创建 `Image` 对象，把数据放在查询字符串里发送给服务器。

```js
const image = new Image()

image.onload = image.onerror = () => {
  console.log('探测请求结束')
}

image.src = 'https://analytics.example.com/ping?event=click'
```

图片探测常用于：

- 点击统计。
- 广告曝光。
- 页面埋点。
- 简单日志上报。

它的优点是兼容性强、实现简单、跨源不需要 CORS 配置。

## 5. 🤔 图片探测有什么限制？

图片探测只能完成单向通信。

它可以把信息发到服务器，但页面无法读取服务器响应体。页面最多只能通过 `load` 和 `error` 知道资源加载大致是否结束。

限制包括：

- 只能使用 GET。
- 数据只能放在 URL 中。
- URL 长度有限。
- 无法读取响应内容。
- 不适合需要业务结果的接口。

所以，图片探测适合“发出去就行”的统计场景，不适合正常数据接口。

## 6. 🤔 JSONP 的原理是什么？

JSONP 是 JSON with padding 的缩写。它利用脚本可以跨源加载并执行的特性，让服务器返回一段函数调用代码。

响应看起来像这样：

```js
handleResponse({ name: 'Nicholas' })
```

页面先定义回调函数，再动态创建脚本元素。

```js
window.handleResponse = (data) => {
  console.log(data)
}

const script = document.createElement('script')

script.src = 'https://api.example.com/user?callback=handleResponse'
document.body.append(script)
```

脚本加载完成后，浏览器会执行响应内容，于是 `handleResponse()` 被调用，数据就传进了页面。

## 7. 🤔 JSONP 有哪些风险？

JSONP 的最大问题是：它不是读取数据，而是执行跨源脚本。

如果远程服务不可信，响应中可以返回任意 JavaScript 代码。页面没有办法只解析其中的数据而不执行代码。

JSONP 还有其他限制：

- 通常只能使用 GET。
- 不容易可靠判断业务失败。
- 回调函数名暴露在全局作用域。
- 难以和现代安全策略、类型校验、错误处理配合。

早期资料中可能提到脚本加载失败难以判断。现代浏览器支持脚本 `error` 事件，但这只能判断资源加载失败，不能可靠判断 JSONP 服务端业务失败。

## 8. 🤔 今天还应该使用 JSONP 吗？

新系统通常不应该再设计 JSONP 接口。更合适的方案是：

- 服务端正确配置 CORS。
- 前端使用 Fetch 或 XHR。
- 需要上报时使用 Beacon API 或 `fetch()` 的 `keepalive`。
- 需要实时通信时使用 WebSocket。

只有在对接遗留服务、且服务端无法修改 CORS 配置时，才可能继续遇到 JSONP。
