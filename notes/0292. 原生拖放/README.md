# [0292. 原生拖放](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0292.%20%E5%8E%9F%E7%94%9F%E6%8B%96%E6%94%BE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 原生拖放由哪些部分组成？](#3--原生拖放由哪些部分组成)
- [4. 🤔 拖动源会触发哪些事件？](#4--拖动源会触发哪些事件)
- [5. 🤔 放置目标会触发哪些事件？](#5--放置目标会触发哪些事件)
- [6. 🤔 `dataTransfer` 如何传递数据？](#6--datatransfer-如何传递数据)
- [7. 🤔 `dropEffect` 和 `effectAllowed` 有什么关系？](#7--dropeffect-和-effectallowed-有什么关系)
- [8. 🤔 还有哪些拖放辅助能力？](#8--还有哪些拖放辅助能力)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- HTML 原生拖放模型
- 拖动源事件与放置目标事件
- 自定义放置目标的默认行为控制
- `dataTransfer` 传递数据
- `dropEffect`、`effectAllowed` 和 `draggable`

## 2. 🫧 评价

- 原生拖放 API 历史味很浓，但理解事件流和 `dataTransfer` 后，它仍然能很好地处理文件拖入、列表重排和跨区域移动这类场景。

## 3. 🤔 原生拖放由哪些部分组成？

HTML 原生拖放主要由三部分组成：

- 拖动源：用户从哪里开始拖。
- 放置目标：用户把内容放到哪里。
- `dataTransfer`：拖放过程中携带的数据和效果信息。

默认情况下，图片、链接和选中的文本通常可以被拖动。其他元素如果要拖动，需要设置 `draggable="true"`。

```html
<div id="card" draggable="true">可拖动卡片</div>
<div id="dropZone">放到这里</div>
```

## 4. 🤔 拖动源会触发哪些事件？

拖动源常见事件包括：

| 事件        | 触发时机             |
| ----------- | -------------------- |
| `dragstart` | 开始拖动时。         |
| `drag`      | 拖动过程中持续触发。 |
| `dragend`   | 拖动结束时。         |

`dragstart` 通常用于设置拖放数据。

```js
const card = document.getElementById('card')

card.addEventListener('dragstart', (event) => {
  event.dataTransfer.setData('text/plain', card.id)
  event.dataTransfer.effectAllowed = 'move'
})
```

`effectAllowed` 表示拖动源允许的操作，例如 `copy`、`move`、`link`、`copyMove`、`all` 等。

## 5. 🤔 放置目标会触发哪些事件？

放置目标常见事件包括：

| 事件        | 触发时机                     |
| ----------- | ---------------------------- |
| `dragenter` | 拖动对象进入目标区域。       |
| `dragover`  | 拖动对象停留在目标区域上方。 |
| `dragleave` | 拖动对象离开目标区域。       |
| `drop`      | 用户在目标区域释放鼠标。     |

要让一个元素成为有效放置目标，通常必须在 `dragover` 中阻止默认行为。

```js
const dropZone = document.getElementById('dropZone')

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
})

dropZone.addEventListener('drop', (event) => {
  event.preventDefault()

  const cardId = event.dataTransfer.getData('text/plain')
  const card = document.getElementById(cardId)

  dropZone.appendChild(card)
})
```

如果不阻止默认行为，很多元素不会触发你期望的 `drop` 处理。

## 6. 🤔 `dataTransfer` 如何传递数据？

`dataTransfer` 是拖放事件里最关键的对象。它可以存取拖放数据，也可以描述拖放效果。

```js
event.dataTransfer.setData('text/plain', 'hello')
event.dataTransfer.setData('text/uri-list', 'https://example.com')
```

读取数据：

```js
const text = event.dataTransfer.getData('text/plain')
```

现代代码优先使用 MIME 类型，例如 `text/plain` 和 `text/uri-list`。历史资料中常见的 `text`、`URL` 更多是旧浏览器兼容写法。

拖放文件时，文件不需要通过 `setData()` 传入，而是在 `dataTransfer.files` 中。

```js
dropZone.addEventListener('drop', (event) => {
  event.preventDefault()

  for (const file of event.dataTransfer.files) {
    console.log(file.name)
  }
})
```

## 7. 🤔 `dropEffect` 和 `effectAllowed` 有什么关系？

`effectAllowed` 由拖动源设置，表示允许哪些操作。`dropEffect` 通常由放置目标设置，表示当前放置将执行什么操作。

```js
card.addEventListener('dragstart', (event) => {
  event.dataTransfer.effectAllowed = 'copyMove'
})

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
})
```

最终效果由两者协商决定。如果放置目标设置了源不允许的效果，浏览器可能不会按预期执行。

常见效果包括：

- `none`：不允许放置。
- `copy`：复制。
- `move`：移动。
- `link`：创建链接。

## 8. 🤔 还有哪些拖放辅助能力？

`draggable` 控制元素是否可拖。

```js
card.draggable = true
```

`setDragImage()` 可以自定义拖动时显示的图像。

```js
card.addEventListener('dragstart', (event) => {
  const preview = document.querySelector('.drag-preview')

  event.dataTransfer.setDragImage(preview, 10, 10)
})
```

`dataTransfer.types` 可以查看当前拖放数据包含哪些类型。

原生拖放在桌面浏览器中比较常见，但移动端和触屏场景支持并不稳定。需要强触屏体验时，很多应用会选择 Pointer Events 自己实现拖拽逻辑。
