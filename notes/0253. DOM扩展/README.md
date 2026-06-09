# [0253. DOM扩展](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0253.%20DOM%E6%89%A9%E5%B1%95)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么 DOM 还需要扩展？](#3-为什么-dom-还需要扩展)
- [4. 本章主要讨论哪些 DOM 扩展？](#4-本章主要讨论哪些-dom-扩展)
- [5. `Selectors API` 解决了什么问题？](#5-selectors-api-解决了什么问题)
- [6. 元素遍历为什么重要？](#6-元素遍历为什么重要)
- [7. HTML5 给 DOM 带来了哪些常用能力？](#7-html5-给-dom-带来了哪些常用能力)
- [8. 专有扩展应该怎么看？](#8-专有扩展应该怎么看)
- [9. 学完这一章应该留下哪些结论？](#9-学完这一章应该留下哪些结论)

<!-- endregion:toc -->

## 1. 本节内容

- DOM 扩展的来源和定位
- `Selectors API`
- 元素遍历
- HTML5 DOM 扩展
- 浏览器专有扩展
- 本章核心结论收束

## 2. 评价

- DOM 扩展像是标准和真实开发需求之间的缓冲层。很多今天看起来理所当然的 API，最初都是浏览器厂商先用起来，再慢慢进入标准。

<N :ids="['0254', '0255', '0256', '0257']" />

## 3. 为什么 DOM 还需要扩展？

DOM Core 提供了操作文档树的基础能力，但真实 Web 开发中的需求增长很快。开发者需要更方便地查找元素、遍历元素、操作类名、管理焦点、插入标记和滚动定位。

这些需求并不总是先出现在标准里。历史上，很多浏览器厂商会先提供专有扩展；如果这些能力足够好用，并被其他浏览器跟进，就可能变成事实标准，最后进入 W3C 或 WHATWG 规范。

因此，DOM 扩展这章的重点不是背一堆零散 API，而是理解：浏览器如何把常见开发需求逐步沉淀为更好用的 DOM 能力。

## 4. 本章主要讨论哪些 DOM 扩展？

本章可以分成四块：

| 主题            | 关注点                                                 |
| --------------- | ------------------------------------------------------ |
| `Selectors API` | 用 CSS 选择符查找和匹配元素                            |
| 元素遍历        | 只在元素节点之间导航，避开空白文本节点差异             |
| HTML5 DOM 扩展  | 类名、焦点、文档状态、字符集、数据属性、插入标记和滚动 |
| 专有扩展        | 浏览器厂商先实现、部分后来标准化的能力                 |

这些扩展的共同目标是让 DOM 操作更贴近日常开发，而不是总依赖底层节点关系和手动过滤。

## 5. `Selectors API` 解决了什么问题？

在 `querySelector()` 和 `querySelectorAll()` 出现之前，开发者要么使用 `getElementById()`、`getElementsByTagName()` 这类较基础的 API，要么依赖库自己解析 CSS 选择符。

`Selectors API` 把 CSS 选择符查询变成浏览器原生能力。

```js
const panel = document.querySelector('#settings')
const buttons = document.querySelectorAll('.toolbar button')
```

这让查找元素更直接，也让 JavaScript 查询方式和 CSS 选择方式保持一致。

## 6. 元素遍历为什么重要？

DOM 中的 `childNodes`、`firstChild`、`nextSibling` 会包含文本节点和注释节点。HTML 源码中的换行和缩进也可能变成空白文本节点。

如果你只想遍历元素，用这些基础属性就需要不断判断 `nodeType`。

元素遍历相关属性提供了更直接的方式：

```js
for (
  let element = parent.firstElementChild;
  element;
  element = element.nextElementSibling
) {
  console.log(element.tagName)
}
```

这类 API 的价值在于：让代码表达“我只关心元素节点”这个真实意图。

## 7. HTML5 给 DOM 带来了哪些常用能力？

HTML5 不只定义标签，也把很多与页面开发密切相关的 DOM 能力标准化。

常见能力包括：

- `getElementsByClassName()` 按类名查找元素。
- `classList` 更安全地增删类名。
- `document.activeElement` 和 `document.hasFocus()` 管理焦点。
- `document.readyState` 判断文档加载状态。
- `document.compatMode` 判断渲染模式。
- `document.head` 访问头部元素。
- `document.characterSet` 读取字符集。
- `dataset` 访问 `data-*` 自定义属性。
- `innerHTML`、`outerHTML`、`insertAdjacentHTML()` 插入标记。
- `scrollIntoView()` 滚动元素到可见区域。

这些 API 中很多来自长期使用的事实标准，HTML5 的意义之一就是把它们纳入统一规范。

## 8. 专有扩展应该怎么看？

专有扩展并不等于一定不能用。很多今天常用的能力，最初也是专有扩展，比如 `innerHTML`。

但使用专有扩展时要保持谨慎：

- 已被标准化的能力，优先使用标准名称和标准行为。
- 仍非标准的能力，只在目标浏览器明确支持时使用。
- 书中提到的旧兼容性结论需要结合现代资料复核。
- 能用标准 API 解决时，不依赖专有 API。

也就是说，专有扩展可以作为历史背景和兼容性线索，但不应该成为现代代码的默认选择。

## 9. 学完这一章应该留下哪些结论？

本章可以收束为几条结论：

- DOM 扩展来自真实开发需求，很多能力经历了“专有实现 => 事实标准 => 正式标准”的过程。
- `Selectors API` 让 CSS 选择符成为原生 DOM 查询方式。
- 元素遍历 API 让你避开空白文本节点和注释节点，只关注元素。
- HTML5 DOM 扩展补齐了类名、焦点、文档状态、字符集、数据属性、标记插入和滚动等常用能力。
- 专有扩展要区分是否已经标准化，不能只按历史浏览器行为写代码。
- 插入 HTML 字符串时要同时考虑性能、内存和安全，尤其不能把未处理的用户输入直接写入 DOM。

DOM 扩展的核心价值是：把常见页面操作从低层节点处理提升到更贴近开发意图的 API。
