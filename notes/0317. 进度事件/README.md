# [0317. 进度事件](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0317.%20%E8%BF%9B%E5%BA%A6%E4%BA%8B%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 XHR 为什么需要进度事件？](#3--xhr-为什么需要进度事件)
- [4. 🤔 `load` 能替代 `readystatechange` 吗？](#4--load-能替代-readystatechange-吗)
- [5. 🤔 如何用 `progress` 展示下载进度？](#5--如何用-progress-展示下载进度)
- [6. 🤔 如何监听上传进度？](#6--如何监听上传进度)
- [7. 🤔 `error`、`abort` 和 `loadend` 分别表示什么？](#7--errorabort-和-loadend-分别表示什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Progress Events 的事件序列
- `load` 事件和 `readystatechange` 的关系
- `progress` 事件与下载进度
- 上传进度和 `xhr.upload`
- `error`、`abort`、`loadend` 的含义

## 2. 🫧 评价

- 进度事件让网络请求不再是一个黑盒；只要响应或上传内容足够大，就应该考虑把等待过程展示给用户。

## 3. 🤔 XHR 为什么需要进度事件？

网络请求可能需要较长时间，尤其是下载大文件、上传图片、提交表单附件或请求慢接口时。如果页面只显示“等待”，用户很难判断请求是否还在进行。

Progress Events 提供了一组事件，让开发者能观察请求生命周期。

常见顺序是：

1. `loadstart`：开始接收响应。
2. `progress`：接收响应期间反复触发。
3. `load`、`error` 或 `abort`：成功完成、出错或中断。
4. `loadend`：通信结束，在成功、失败或中断后都会触发。

## 4. 🤔 `load` 能替代 `readystatechange` 吗？

`load` 会在响应接收完成后触发，因此它可以减少手写 `readyState === 4` 的判断。

```js
const request = new XMLHttpRequest()

request.onload = () => {
  if (
    (request.status >= 200 && request.status < 300) ||
    request.status === 304
  ) {
    console.log(request.responseText)
  } else {
    console.log(`请求失败：${request.status}`)
  }
}

request.open('GET', '/api/data', true)
request.send(null)
```

需要注意，`load` 只表示浏览器收到了响应，不表示业务成功。HTTP 状态码是 `404` 或 `500` 时，同样可能触发 `load`。所以仍然要检查 `status`。

## 5. 🤔 如何用 `progress` 展示下载进度？

`progress` 事件会在浏览器接收响应数据时反复触发。现代 `ProgressEvent` 常用字段包括：

| 字段               | 说明             |
| ------------------ | ---------------- |
| `lengthComputable` | 是否知道总大小。 |
| `loaded`           | 已接收字节数。   |
| `total`            | 总字节数。       |

```js
const request = new XMLHttpRequest()
const status = document.querySelector('#status')

request.onprogress = (event) => {
  if (!event.lengthComputable) {
    status.textContent = `已接收 ${event.loaded} 字节`
    return
  }

  const percent = Math.round((event.loaded / event.total) * 100)

  status.textContent = `下载进度：${percent}%`
}

request.onload = () => {
  status.textContent = '下载完成'
}

request.open('GET', '/large-file.zip', true)
request.send(null)
```

只有服务器提供了可用的内容长度时，`lengthComputable` 才可能为 `true`。

## 6. 🤔 如何监听上传进度？

下载进度监听 XHR 对象本身，上传进度通常监听 `xhr.upload`。

```js
const request = new XMLHttpRequest()
const formData = new FormData(document.querySelector('form'))

request.upload.onprogress = (event) => {
  if (event.lengthComputable) {
    const percent = Math.round((event.loaded / event.total) * 100)

    console.log(`上传进度：${percent}%`)
  }
}

request.onload = () => {
  console.log('上传完成')
}

request.open('POST', '/upload', true)
request.send(formData)
```

上传文件、图片、视频时，上传进度比下载进度更能改善用户体验。

## 7. 🤔 `error`、`abort` 和 `loadend` 分别表示什么？

`error` 表示请求过程中出现网络层错误。它不等于 HTTP 失败状态码。服务器返回 `500` 是有响应的 HTTP 错误，不一定触发 `error`。

`abort` 表示请求被取消，通常来自 `request.abort()`。

`loadend` 表示请求生命周期结束，无论成功、失败还是取消都会触发。

```js
request.onerror = () => {
  console.log('网络错误')
}

request.onabort = () => {
  console.log('请求已取消')
}

request.onloadend = () => {
  console.log('请求结束，清理 UI 状态')
}
```

`loadend` 很适合关闭 loading、恢复按钮状态、释放临时资源。
