# [0284. 富文本编辑](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0284.%20%E5%AF%8C%E6%96%87%E6%9C%AC%E7%BC%96%E8%BE%91)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是富文本编辑？](#3-什么是富文本编辑)
- [4. `designMode` 是怎么工作的？](#4-designmode-是怎么工作的)
- [5. `contenteditable` 为什么更常用？](#5-contenteditable-为什么更常用)
- [6. `execCommand()` 能做什么？](#6-execcommand-能做什么)
- [7. 如何查询当前命令状态？](#7-如何查询当前命令状态)
- [8. 如何通过 Selection 和 Range 操作选区？](#8-如何通过-selection-和-range-操作选区)
- [9. 富文本内容如何随表单提交？](#9-富文本内容如何随表单提交)

<!-- endregion:toc -->

## 1. 本节内容

- 富文本编辑的基本实现方式
- `designMode` 与 `contenteditable`
- `document.execCommand()` 及相关查询方法
- Selection 与 Range 操作选区
- 富文本内容如何随表单提交

## 2. 评价

- 富文本编辑是典型的历史包袱型能力：原生 API 能做不少事，但输出 HTML 和浏览器行为都不够稳定，真正产品化时要格外谨慎。

## 3. 什么是富文本编辑？

富文本编辑也就是所见即所得编辑。用户看到的是格式化后的内容，可以直接加粗、斜体、插入链接、调整列表，而不是手写 HTML。

浏览器里实现富文本编辑主要有两条历史路线：

- 在 `iframe` 中加载空白文档，并把文档的 `designMode` 设置为 `on`。
- 给页面中的元素设置 `contenteditable`，让该元素变成可编辑区域。

这两种方式都不是普通表单字段。用户编辑的是 DOM 内容，而不是 `<input>` 或 `<textarea>` 的 `value`。因此，提交给服务器前通常需要额外把 HTML 同步到隐藏字段中。

## 4. `designMode` 是怎么工作的？

`designMode` 是文档级别的开关。把某个文档的 `designMode` 设置为 `on` 后，整个文档会变成可编辑区域。

典型做法是页面中放一个空的 `iframe`，等它加载完成后开启编辑模式：

```html
<iframe name="richEditor" title="富文本编辑器"></iframe>
```

```js
window.addEventListener('load', () => {
  window.frames.richEditor.document.designMode = 'on'
})
```

这种方式来自早期浏览器实现。它的好处是编辑内容被隔离在 `iframe` 文档中，坏处是要处理额外文档、样式、焦点和跨窗口访问问题。

## 5. `contenteditable` 为什么更常用？

`contenteditable` 可以让页面中的任意元素变成可编辑区域，不需要额外的 `iframe`。

```html
<div id="richEditor" class="editor" contenteditable="true"></div>
```

也可以通过 DOM 属性动态切换：

```js
const editor = document.getElementById('richEditor')

editor.contentEditable = 'true'
```

`contentEditable` 常见值包括：

| 值        | 含义             |
| --------- | ---------------- |
| `true`    | 元素可编辑。     |
| `false`   | 元素不可编辑。   |
| `inherit` | 继承父元素设置。 |

`contenteditable` 比 `designMode` 更轻量，也更容易和页面布局集成，所以更常见。不过它仍然会产生复杂问题，例如粘贴内容清洗、撤销栈、选区恢复、输入法兼容、浏览器生成 HTML 不一致等。

## 6. `execCommand()` 能做什么？

富文本编辑历史上主要通过 `document.execCommand()` 执行格式化命令。它接收三个参数：命令名、是否显示浏览器 UI、命令值。为了兼容，第二个参数通常传 `false`。

```js
document.execCommand('bold', false, null)
document.execCommand('italic', false, null)
document.execCommand('createLink', false, 'https://example.com')
document.execCommand('formatBlock', false, 'h1')
```

常见命令包括：

| 命令                  | 作用                         |
| --------------------- | ---------------------------- |
| `bold`                | 切换粗体。                   |
| `italic`              | 切换斜体。                   |
| `underline`           | 切换下划线。                 |
| `createLink`          | 把选中文本变成链接。         |
| `unlink`              | 移除链接。                   |
| `insertImage`         | 插入图片。                   |
| `insertOrderedList`   | 插入有序列表。               |
| `insertUnorderedList` | 插入无序列表。               |
| `formatBlock`         | 把当前块转换为指定块级元素。 |
| `removeFormat`        | 移除选区格式。               |

需要注意，`execCommand()` 现在属于历史 API。虽然很多浏览器仍然支持它，但不同浏览器生成的 HTML 可能不同。例如同样是加粗，有的浏览器生成 `<strong>`，有的生成 `<b>`，也可能生成带样式的 `<span>`。

因此，`execCommand()` 适合理解原生富文本能力和维护旧项目。新项目如果需要复杂编辑器，通常会选择成熟编辑器框架或基于 Selection、Range 和输入事件自行建模。

## 7. 如何查询当前命令状态？

与 `execCommand()` 配套的还有几个查询方法。

`queryCommandEnabled()` 用于判断当前选区是否适合执行某个命令：

```js
const canBold = document.queryCommandEnabled('bold')
```

`queryCommandState()` 用于判断命令是否已经应用到当前选区。例如，工具栏按钮可以根据它同步激活状态：

```js
const isBold = document.queryCommandState('bold')
```

`queryCommandValue()` 用于取得当前命令值，例如字号或字体：

```js
const fontSize = document.queryCommandValue('fontSize')
```

这些方法和 `execCommand()` 一样存在浏览器差异。它们适合作为历史 API 使用，不能指望它们提供完全一致的编辑器状态模型。

## 8. 如何通过 Selection 和 Range 操作选区？

现代浏览器可以通过 `getSelection()` 获取当前选区。它返回 `Selection` 对象，包含选区开始、结束、是否折叠和范围数量等信息。

常用方法包括：

| 方法                      | 作用                     |
| ------------------------- | ------------------------ |
| `toString()`              | 返回选区文本。           |
| `getRangeAt(index)`       | 获取指定索引的 `Range`。 |
| `removeAllRanges()`       | 清空选区。               |
| `addRange(range)`         | 添加范围到选区。         |
| `collapse(node, offset)`  | 折叠选区到指定位置。     |
| `selectAllChildren(node)` | 选择节点的所有子节点。   |

结合 `Range` 可以做比 `execCommand()` 更细粒度的 DOM 操作。例如给选中文本加高亮：

```js
const selection = window.getSelection()

if (selection.rangeCount > 0) {
  const range = selection.getRangeAt(0)
  const mark = document.createElement('span')

  mark.style.backgroundColor = 'yellow'
  range.surroundContents(mark)
}
```

这段代码直接操作 DOM 范围，比单纯执行格式命令更可控。不过它也会遇到复杂边界，例如选区跨越多个不同父节点时，`surroundContents()` 可能抛错。

## 9. 富文本内容如何随表单提交？

富文本编辑区不是普通表单字段，因此它的内容不会自动随表单提交。常见做法是在表单中放一个隐藏字段，在提交前把编辑区 HTML 写进去。

```html
<form id="postForm">
  <input type="hidden" name="content" id="contentField" />
  <div id="richEditor" contenteditable="true"></div>
  <button type="submit">提交</button>
</form>
```

```js
const form = document.getElementById('postForm')
const editor = document.getElementById('richEditor')
const contentField = document.getElementById('contentField')

form.addEventListener('submit', () => {
  contentField.value = editor.innerHTML
})
```

如果使用 `iframe` 和 `designMode`，同步逻辑类似，只是 HTML 来自 `iframe` 文档的 `body.innerHTML`。

```js
form.addEventListener('submit', () => {
  contentField.value = window.frames.richEditor.document.body.innerHTML
})
```

富文本内容提交到服务器前必须做清洗。用户可能粘贴任意 HTML，甚至构造危险内容。浏览器端可以做基础过滤，但真正可信的 HTML 白名单清洗应该在服务端完成。
