# [0290. File API与Blob API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0290.%20File%20API%E4%B8%8EBlob%20API)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 浏览器为什么不能任意访问本地文件？](#3-浏览器为什么不能任意访问本地文件)
- [4. `FileReader` 可以怎样读取文件？](#4-filereader-可以怎样读取文件)
- [5. `FileReaderSync` 适合在哪里使用？](#5-filereadersync-适合在哪里使用)
- [6. `Blob` 表示什么？](#6-blob-表示什么)
- [7. 对象 URL 有什么用？](#7-对象-url-有什么用)
- [8. 如何读取拖放到页面的文件？](#8-如何读取拖放到页面的文件)

<!-- endregion:toc -->

## 1. 本节内容

- `File`、`FileList` 与用户授权的本地文件访问
- `FileReader` 的异步读取方式和事件
- `FileReaderSync` 在 Worker 中的使用边界
- `Blob`、`slice()` 和部分读取
- 对象 URL 与拖放文件读取

## 2. 评价

- File API 和 Blob API 是浏览器处理本地文件与二进制数据的基础设施；它们的核心边界是“用户给了什么，页面才能读什么”。

## 3. 浏览器为什么不能任意访问本地文件？

出于安全考虑，网页不能像桌面程序那样随意读取用户磁盘。File API 只允许页面访问用户明确提供的文件，例如通过文件选择框选择的文件，或拖放到页面中的文件。

```html
<input id="avatar" type="file" name="avatar" />
```

```js
const input = document.getElementById('avatar')

input.addEventListener('change', () => {
  const file = input.files[0]

  if (file) {
    console.log(file.name)
    console.log(file.size)
    console.log(file.type)
    console.log(file.lastModified)
  }
})
```

`input.files` 是一个 `FileList`，里面的每个 `File` 都表示一个用户选择的文件。`File` 继承自 `Blob`，同时额外包含文件名和修改时间等信息。

## 4. `FileReader` 可以怎样读取文件？

`FileReader` 用于异步读取文件内容。常用读取方法包括：

| 方法                      | 结果                              |
| ------------------------- | --------------------------------- |
| `readAsText(file)`        | 读取为字符串。                    |
| `readAsDataURL(file)`     | 读取为 data URL，常用于图片预览。 |
| `readAsArrayBuffer(file)` | 读取为 `ArrayBuffer`。            |

```js
const reader = new FileReader()

reader.addEventListener('load', () => {
  console.log(reader.result)
})

reader.addEventListener('error', () => {
  console.error(reader.error)
})

reader.readAsText(file)
```

`FileReader` 的结果在 `reader.result` 中。读取不同格式时，`result` 的类型不同。

常见事件包括：

- `loadstart`：开始读取。
- `progress`：读取过程中触发。
- `load`：读取成功。
- `error`：读取失败。
- `abort`：读取被取消。
- `loadend`：读取完成，无论成功还是失败。

历史上的 `readAsBinaryString()` 已经废弃，现代代码优先使用 `readAsArrayBuffer()`。

## 5. `FileReaderSync` 适合在哪里使用？

`FileReaderSync` 是同步读取 API，只能在 Worker 中使用。它会阻塞当前 Worker，但不会阻塞页面主线程。

```js
// Worker 内部
self.addEventListener('message', (event) => {
  const file = event.data
  const reader = new FileReaderSync()
  const text = reader.readAsText(file)

  self.postMessage(text)
})
```

同步读取写起来简单，但仍然要谨慎。大文件读取会占用 Worker 执行时间。主线程中不要使用同步文件读取，因为它会卡住用户界面。

## 6. `Blob` 表示什么？

`Blob` 表示不可变的原始二进制数据。你可以从字符串、数组、`ArrayBuffer` 或其他 `Blob` 创建新的 `Blob`。

```js
const blob = new Blob(['hello'], {
  type: 'text/plain',
})

console.log(blob.size)
console.log(blob.type)
```

`Blob` 不一定来自用户文件，也可以由脚本创建。它常用于生成下载内容、构造上传数据、保存处理后的二进制结果。

`slice()` 可以读取其中的一部分，返回新的 `Blob`。

```js
const header = file.slice(0, 32)
```

这在读取大文件头部、分片上传、断点续传等场景里很有用。

## 7. 对象 URL 有什么用？

对象 URL 可以让 DOM 元素直接引用 `Blob` 或 `File`。例如，图片预览不一定要用 `FileReader.readAsDataURL()`，也可以创建对象 URL。

```js
const image = document.createElement('img')
const objectUrl = URL.createObjectURL(file)

image.src = objectUrl
document.body.append(image)

image.addEventListener('load', () => {
  URL.revokeObjectURL(objectUrl)
})
```

`URL.createObjectURL()` 创建的 URL 会占用资源。用完后应该调用 `URL.revokeObjectURL()` 释放。

## 8. 如何读取拖放到页面的文件？

拖放事件中的 `dataTransfer.files` 也会提供 `FileList`。

```js
const dropZone = document.querySelector('.drop-zone')

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault()
})

dropZone.addEventListener('drop', (event) => {
  event.preventDefault()

  for (const file of event.dataTransfer.files) {
    console.log(file.name)
  }
})
```

这里的 `dragover` 必须阻止默认行为，否则元素通常不会成为有效放置目标。

无论文件来自选择框还是拖放，本质上都是用户显式把文件交给页面。页面仍然不能越过这个授权范围去访问其他本地文件。
