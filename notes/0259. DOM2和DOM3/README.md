# [0259. DOM2和DOM3](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0259.%20DOM2%E5%92%8CDOM3)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. DOM2 和 DOM3 在 DOM1 基础上补了什么？](#3-dom2-和-dom3-在-dom1-基础上补了什么)
- [4. 本章的四条主线是什么？](#4-本章的四条主线是什么)
- [5. DOM2 Core 为什么强调命名空间？](#5-dom2-core-为什么强调命名空间)
- [6. DOM Style 解决了什么问题？](#6-dom-style-解决了什么问题)
- [7. DOM Traversal 提供了什么能力？](#7-dom-traversal-提供了什么能力)
- [8. DOM Range 为什么有用？](#8-dom-range-为什么有用)
- [9. 学完这一章应该留下哪些结论？](#9-学完这一章应该留下哪些结论)

<!-- endregion:toc -->

## 1. 本节内容

- DOM2 和 DOM3 的模块化演进
- XML 命名空间
- DOM Style 与样式访问
- DOM Traversal 与节点遍历
- DOM Range 与范围操作
- 本章核心结论收束

## 2. 评价

- DOM2 和 DOM3 更像是在 DOM1 的骨架上补肌肉：命名空间、样式、遍历和范围让 DOM 不只能够表示文档，还能更细粒度地理解和操作文档。

<N :ids="['0260', '0261', '0262', '0263']" />

## 3. DOM2 和 DOM3 在 DOM1 基础上补了什么？

DOM1 主要定义 HTML 和 XML 文档的基础结构，也就是节点、节点关系和基础操作。

DOM2 和 DOM3 在这个基础上继续扩展，让 DOM 能处理更复杂的页面和 XML 场景。它们不是单一 API，而是一组模块化规范。

常见模块包括：

| 模块                    | 关注点                 |
| ----------------------- | ---------------------- |
| DOM Core                | 核心节点类型和基础能力 |
| DOM Views               | 文档视图               |
| DOM Events              | 事件模型               |
| DOM Style               | 样式和样式表           |
| DOM Traversal and Range | 遍历和范围             |
| DOM HTML                | HTML 文档相关扩展      |

本章主要讨论事件和 `MutationObserver` 之外的 DOM2、DOM3 能力。事件会在后续章节展开，`MutationObserver` 已经在前面的 DOM 章节中单独介绍。

## 4. 本章的四条主线是什么？

第一条主线是命名空间。

命名空间用于让 XHTML、SVG、MathML 等 XML 语言在同一个文档中共存，并避免标签名冲突。

第二条主线是样式。

DOM Style 让脚本可以读取和修改元素内联样式、计算样式、样式表和 CSS 规则。

第三条主线是遍历。

`NodeIterator` 和 `TreeWalker` 提供了比手写递归更统一的 DOM 子树遍历方式。

第四条主线是范围。

`Range` 可以选择节点的一部分，或者跨多个节点选择内容，并对选中的内容执行删除、提取、复制、插入和包裹等操作。

## 5. DOM2 Core 为什么强调命名空间？

XML 允许不同标记语言混在同一个文档里。比如一个 XHTML 文档中可能嵌入 SVG。

```xml
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <circle cx="50" cy="50" r="40" />
    </svg>
  </body>
</html>
```

这里的 `html` 和 `svg` 虽然都在同一棵 DOM 树中，但它们属于不同命名空间。

DOM2 Core 因此补充了带命名空间的创建、查询和属性操作 API，例如 `createElementNS()`、`getElementsByTagNameNS()`、`setAttributeNS()`。

## 6. DOM Style 解决了什么问题？

页面样式可能来自三个地方：

- 元素的 `style` 属性。
- 文档中的 `style` 元素。
- 外部样式表。

DOM Style 提供了访问这些样式来源的方式。

```js
element.style.backgroundColor = 'tomato'
const computed = getComputedStyle(element)
console.log(computed.display)
```

它还允许访问 `document.styleSheets`，读取和修改样式表规则。

样式 API 的重点是区分内联样式和计算样式。`element.style` 只代表内联样式，`getComputedStyle()` 才能看到层叠之后的最终结果。

## 7. DOM Traversal 提供了什么能力？

DOM Traversal 提供两种遍历器：`NodeIterator` 和 `TreeWalker`。

它们都从一个根节点开始，按深度优先顺序遍历 DOM 子树，并可以通过节点类型和过滤器控制访问范围。

```js
const iterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT,
)
```

`NodeIterator` 适合线性访问节点。`TreeWalker` 更灵活，可以在父节点、子节点和兄弟节点之间定向移动。

## 8. DOM Range 为什么有用？

普通 DOM 操作通常以节点为单位。

`Range` 则可以从一个节点内部的某个位置开始，到另一个节点内部的某个位置结束。也就是说，它可以跨节点边界选择文档片段。

```js
const range = document.createRange()
range.selectNodeContents(document.querySelector('p'))
```

范围选择是后台进行的，不等于用户在页面上看见的选区。你可以用它删除、提取、复制、插入或包裹一段 DOM 内容。

## 9. 学完这一章应该留下哪些结论？

这一章可以收束为几条结论：

- DOM2 和 DOM3 把 DOM 从基础文档树扩展到更完整的 Web 文档操作平台。
- 命名空间主要服务 XML、XHTML、SVG、MathML 等混合文档，在普通 HTML 中使用频率较低。
- DOM Style 能访问内联样式、计算样式和样式表规则，但不同样式来源的读写方式不同。
- `NodeIterator` 和 `TreeWalker` 适合按规则遍历 DOM 子树。
- `Range` 适合对跨节点或节点局部内容做精细操作。
- 有些 DOM2、DOM3 能力在现代开发中被框架或更高层 API 包装了，但理解它们有助于你看清浏览器底层怎样表示和操作页面。
