# [0255. 元素遍历](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0255.%20%E5%85%83%E7%B4%A0%E9%81%8D%E5%8E%86)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么需要元素遍历？](#3-为什么需要元素遍历)
- [4. 旧式遍历为什么麻烦？](#4-旧式遍历为什么麻烦)
- [5. 元素遍历提供了哪些属性？](#5-元素遍历提供了哪些属性)
- [6. 如何遍历一个元素的所有子元素？](#6-如何遍历一个元素的所有子元素)
- [7. 如何访问首尾元素和兄弟元素？](#7-如何访问首尾元素和兄弟元素)
- [8. 元素遍历和 `children` 有什么关系？](#8-元素遍历和-children-有什么关系)
- [9. 什么时候还需要 `childNodes`？](#9-什么时候还需要-childnodes)

<!-- endregion:toc -->

## 1. 本节内容

- 空白文本节点带来的遍历差异
- 元素遍历 API 的目的
- `childElementCount`
- `firstElementChild` 和 `lastElementChild`
- `previousElementSibling` 和 `nextElementSibling`
- 元素遍历的常见写法

## 2. 评价

- 元素遍历 API 的设计很朴素，但非常实用。它让你少写很多 `nodeType` 判断，也让代码更准确地表达“我只关心元素”。

## 3. 为什么需要元素遍历？

DOM 的基础遍历属性会返回所有类型的节点，包括元素节点、文本节点和注释节点。

```html
<ul>
  <li>A</li>
  <li>B</li>
</ul>
```

这段 HTML 中，换行和缩进可能会形成空白文本节点。因此，`ul.firstChild` 不一定是第一个 `li`，也可能是一个文本节点。

早期浏览器对空白文本节点的处理还不完全一致，这会让跨浏览器遍历更麻烦。

元素遍历 API 的目的就是：只在元素节点之间导航。

## 4. 旧式遍历为什么麻烦？

如果只用 `firstChild` 和 `nextSibling`，通常要手动过滤节点类型。

```js
let node = parent.firstChild

while (node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    console.log(node.tagName)
  }

  node = node.nextSibling
}
```

这段代码能工作，但意图被 `nodeType` 判断稀释了。你真正想表达的是“遍历元素”，却不得不处理所有节点。

## 5. 元素遍历提供了哪些属性？

元素遍历规范补充了 5 个常用属性。

| 属性                     | 含义           |
| ------------------------ | -------------- |
| `childElementCount`      | 子元素数量     |
| `firstElementChild`      | 第一个子元素   |
| `lastElementChild`       | 最后一个子元素 |
| `previousElementSibling` | 前一个兄弟元素 |
| `nextElementSibling`     | 后一个兄弟元素 |

它们都只关注元素节点，不会把文本节点和注释节点算进去。

## 6. 如何遍历一个元素的所有子元素？

使用 `firstElementChild` 和 `nextElementSibling` 可以直接遍历子元素。

```js
let element = parent.firstElementChild

while (element) {
  console.log(element.tagName)
  element = element.nextElementSibling
}
```

这比 `firstChild` 加 `nodeType` 判断更清晰。

如果只是需要数量，可以使用 `childElementCount`。

```js
console.log(parent.childElementCount)
```

## 7. 如何访问首尾元素和兄弟元素？

访问首尾子元素：

```js
const first = parent.firstElementChild
const last = parent.lastElementChild
```

访问相邻兄弟元素：

```js
const previous = current.previousElementSibling
const next = current.nextElementSibling
```

这些属性在处理菜单、列表、步骤条、表单项等结构时很有用。

例如，找到当前项的下一个元素项：

```js
function focusNextItem(currentItem) {
  const nextItem = currentItem.nextElementSibling

  if (nextItem) {
    nextItem.focus()
  }
}
```

## 8. 元素遍历和 `children` 有什么关系？

`children` 也只返回元素子节点，它是很早就被浏览器支持的能力，后来也被广泛使用。

```js
for (const child of parent.children) {
  console.log(child.tagName)
}
```

元素遍历属性和 `children` 关注点相近：都帮助你避开空白文本节点。

区别在于，元素遍历更强调节点关系导航，例如首元素、尾元素、前一个兄弟元素和后一个兄弟元素。

## 9. 什么时候还需要 `childNodes`？

如果你只关心元素，优先使用元素遍历相关属性。

但如果你需要处理文本节点、注释节点，或者想完整观察 DOM 树结构，就仍然需要 `childNodes`。

例如，富文本编辑器、模板编译器、代码格式化工具可能需要保留文本节点和注释节点信息。

所以选择 API 的关键是先明确目标：只处理元素，就使用元素遍历；处理完整节点树，就使用通用节点 API。
