# [0263. 范围](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0263.%20%E8%8C%83%E5%9B%B4)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `Range` 是什么？](#3-range-是什么)
- [4. 范围的边界点是什么？](#4-范围的边界点是什么)
- [5. 如何做简单选择？](#5-如何做简单选择)
- [6. 如何调整范围边界？](#6-如何调整范围边界)
- [7. 如何删除、提取和复制范围内容？](#7-如何删除提取和复制范围内容)
- [8. 如何向范围插入节点？](#8-如何向范围插入节点)
- [9. 什么是范围折叠？](#9-什么是范围折叠)
- [10. 如何比较两个范围？](#10-如何比较两个范围)
- [11. 如何复制和清理范围？](#11-如何复制和清理范围)

<!-- endregion:toc -->

## 1. 本节内容

- `Range` 的作用
- 范围边界点
- 简单选择和复杂选择
- 删除、提取和复制范围内容
- 范围插入和包裹
- 范围折叠、比较、复制和清理

## 2. 评价

- `Range` 是 DOM 里非常精细的一把刀。它不只选择节点，还能选中节点内部的一段内容，所以适合编辑器、富文本和文档处理这类需要细粒度操作的场景。

## 3. `Range` 是什么？

普通 DOM 操作通常以节点为单位。`Range` 则可以表示文档中的一个连续范围，这个范围可以从某个文本节点中间开始，到另一个文本节点中间结束。

范围选择发生在后台，用户不会因为你创建了 `Range` 就看到页面选区。

创建范围使用 `document.createRange()`。

```js
const range = document.createRange()
```

范围和当前文档关联，不能跨文档使用。

## 4. 范围的边界点是什么？

一个范围由起点和终点组成。

常见属性包括：

| 属性                      | 含义                             |
| ------------------------- | -------------------------------- |
| `startContainer`          | 起点所在节点                     |
| `startOffset`             | 起点偏移量                       |
| `endContainer`            | 终点所在节点                     |
| `endOffset`               | 终点偏移量                       |
| `commonAncestorContainer` | 同时包含起点和终点的最深祖先节点 |

偏移量的含义取决于容器节点类型：

- 如果容器是文本、注释或 CDATA 节点，偏移量表示字符位置。
- 如果容器是元素节点，偏移量表示子节点索引。

这是理解 `Range` 的关键。它不是只用节点编号定位，而是可以定位到节点内部。

## 5. 如何做简单选择？

`selectNode()` 选择某个节点本身以及它的所有后代。

```js
const paragraph = document.querySelector('p')
const range = document.createRange()

range.selectNode(paragraph)
```

`selectNodeContents()` 只选择节点内部内容，不包含节点本身。

```js
range.selectNodeContents(paragraph)
```

简单来说：

| 方法                       | 选择内容       |
| -------------------------- | -------------- |
| `selectNode(node)`         | 节点本身和后代 |
| `selectNodeContents(node)` | 节点的子内容   |

## 6. 如何调整范围边界？

可以用相对节点的方法调整边界。

| 方法                   | 作用             |
| ---------------------- | ---------------- |
| `setStartBefore(node)` | 起点放到节点之前 |
| `setStartAfter(node)`  | 起点放到节点之后 |
| `setEndBefore(node)`   | 终点放到节点之前 |
| `setEndAfter(node)`    | 终点放到节点之后 |

如果需要更精确地定位，可以使用 `setStart()` 和 `setEnd()`。

```js
const text = paragraph.firstChild

range.setStart(text, 2)
range.setEnd(text, 6)
```

传入文本节点时，偏移量是字符位置。传入元素节点时，偏移量是子节点索引。

这让 `Range` 可以选择节点的一部分，而不是只能选择完整节点。

## 7. 如何删除、提取和复制范围内容？

`deleteContents()` 删除范围包含的内容。

```js
range.deleteContents()
```

`extractContents()` 删除范围内容，并返回包含被删除内容的 `DocumentFragment`。

```js
const fragment = range.extractContents()
```

`cloneContents()` 复制范围内容，也返回 `DocumentFragment`，但不改变原文档。

```js
const copied = range.cloneContents()
```

三者区别可以这样记：

| 方法                | 是否修改原文档 | 是否返回内容 |
| ------------------- | -------------- | ------------ |
| `deleteContents()`  | 是             | 否           |
| `extractContents()` | 是             | 是           |
| `cloneContents()`   | 否             | 是           |

如果范围跨越不完整节点，浏览器会拆分文本节点或补全必要结构，以保持 DOM 合法。

## 8. 如何向范围插入节点？

`insertNode()` 会在范围起点插入节点。

```js
const marker = document.createElement('span')
marker.textContent = '|'

range.insertNode(marker)
```

如果范围起点位于文本节点中间，插入时可能会拆分文本节点。

`surroundContents()` 可以用指定节点包裹范围内容。

```js
const strong = document.createElement('strong')
range.surroundContents(strong)
```

它的内部逻辑可以理解为：先提取范围内容，再插入包裹节点，最后把提取出来的内容放进包裹节点。

需要注意，范围必须包含结构完整的内容。如果范围只选中了某个非文本节点的一部分，`surroundContents()` 可能抛出错误。

## 9. 什么是范围折叠？

范围折叠就是把起点和终点合并到同一个位置。

```js
range.collapse(true)
```

传入 `true` 表示折叠到起点，传入 `false` 表示折叠到终点。

`collapsed` 可以判断范围是否为空。

```js
if (range.collapsed) {
  console.log('范围为空')
}
```

折叠范围常用于判断两个位置之间是否有内容，或者把范围变成一个插入点。

## 10. 如何比较两个范围？

`compareBoundaryPoints()` 可以比较两个范围的边界点。

```js
const result = range.compareBoundaryPoints(Range.START_TO_START, otherRange)
```

常见比较方式包括：

| 常量                   | 含义           |
| ---------------------- | -------------- |
| `Range.START_TO_START` | 起点和起点比较 |
| `Range.START_TO_END`   | 起点和终点比较 |
| `Range.END_TO_END`     | 终点和终点比较 |
| `Range.END_TO_START`   | 终点和起点比较 |

返回值含义：

| 返回值 | 含义                           |
| ------ | ------------------------------ |
| `-1`   | 调用范围的边界点在比较范围之前 |
| `0`    | 两个边界点相同                 |
| `1`    | 调用范围的边界点在比较范围之后 |

这个能力适合编辑器、批注系统、选区处理等需要比较文档位置的场景。

## 11. 如何复制和清理范围？

`cloneRange()` 可以复制一个范围。

```js
const clonedRange = range.cloneRange()
```

副本拥有相同的边界，但后续修改互不影响。

历史上，`detach()` 用于把范围从文档中分离，帮助浏览器释放资源。

```js
range.detach()
```

现代浏览器里它的重要性已经降低。更常见的清理方式是：不再使用范围时，移除相关引用，让垃圾回收接管。

```js
let range = document.createRange()
range.selectNodeContents(document.body)

range = null
```

`Range` 的强项是精细操作文档片段。越靠近富文本、编辑器和文档处理，它的价值越明显。
