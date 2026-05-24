# [0250. DOM编程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0250.%20DOM%E7%BC%96%E7%A8%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 DOM 编程？](#3--什么是-dom-编程)
- [4. 🤔 如何动态加载外部脚本？](#4--如何动态加载外部脚本)
- [5. 🤔 如何动态插入内联脚本？](#5--如何动态插入内联脚本)
- [6. 🤔 如何动态加载外部样式？](#6--如何动态加载外部样式)
- [7. 🤔 如何动态插入嵌入样式？](#7--如何动态插入嵌入样式)
- [8. 🤔 为什么表格有专门的 DOM API？](#8--为什么表格有专门的-dom-api)
- [9. 🤔 如何用表格 API 创建表格内容？](#9--如何用表格-api-创建表格内容)
- [10. 🤔 `NodeList` 为什么容易出问题？](#10--nodelist-为什么容易出问题)
- [11. 🤔 如何更安全地遍历实时集合？](#11--如何更安全地遍历实时集合)
- [12. 🤔 DOM 编程有哪些性能习惯？](#12--dom-编程有哪些性能习惯)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 动态脚本加载与执行
- 动态样式加载与插入
- 表格 DOM API
- `NodeList`、`HTMLCollection`、`NamedNodeMap`
- 实时集合的遍历和性能问题

## 2. 🫧 评价

- DOM 编程的难点不在于 API 数量，而在于你要知道哪些操作会立刻影响页面、哪些集合会实时变化、哪些动态资源有特殊执行规则。

## 3. 🤔 什么是 DOM 编程？

DOM 编程指用 DOM API 创建、查询、修改和删除文档节点。它既可以处理页面结构，也可以动态加载脚本、样式和表格内容。

和普通 JavaScript 对象不同，DOM 节点连接着浏览器渲染系统。节点插入、属性修改、文本更新都可能影响页面显示。

本节重点不是再介绍节点类型，而是关注几个容易出错的实际操作：

- 动态脚本。
- 动态样式。
- 表格操作。
- 实时集合。

## 4. 🤔 如何动态加载外部脚本？

动态脚本通常通过创建脚本元素实现。

```js
function loadScript(url) {
  const script = document.createElement('script')
  script.src = url
  document.body.appendChild(script)
}

loadScript('/assets/app.js')
```

脚本元素被插入文档后，浏览器才会开始下载并执行外部脚本。

::: tip 写作和调试提醒

在 VitePress Markdown 中，不要直接写真实未转义的脚本标签。需要说明标签时，可以写成 `&lt;script&gt;`，或者用 `document.createElement('script')` 这样的 DOM API 示例。

:::

## 5. 🤔 如何动态插入内联脚本？

内联脚本可以通过设置脚本元素的文本内容来创建。

```js
function runScript(code) {
  const script = document.createElement('script')
  script.text = code
  document.body.appendChild(script)
}

runScript("console.log('loaded')")
```

这类脚本会在全局作用域中执行，效果接近全局 `eval()`。因此，实际项目中应谨慎使用，尤其不要执行不可信字符串。

另外，通过 `innerHTML` 插入脚本元素通常不会执行脚本。需要动态执行脚本时，应使用明确的 DOM 创建方式。

## 6. 🤔 如何动态加载外部样式？

动态加载外部样式可以创建 `link` 元素，并追加到 `head` 中。

```js
function loadStylesheet(url) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

loadStylesheet('/assets/theme.css')
```

样式表加载通常是异步的。浏览器会在样式下载和解析完成后应用它。

如果后续逻辑依赖样式已经加载，可以监听 `load` 事件。

```js
function loadStylesheet(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.addEventListener('load', resolve, { once: true })
    link.addEventListener('error', reject, { once: true })
    document.head.appendChild(link)
  })
}
```

## 7. 🤔 如何动态插入嵌入样式？

嵌入样式可以通过创建 `style` 元素实现。

```js
function addStyle(cssText) {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(cssText))
  document.head.appendChild(style)
}

addStyle(`
  .is-active {
    color: red;
  }
`)
```

早期 IE 曾经需要使用 `style.styleSheet.cssText`。现代浏览器一般使用文本节点或 `textContent` 即可。

动态样式适合主题切换、按需加载组件样式等场景。但如果样式本身是稳定资源，更推荐通过构建流程和静态样式文件管理。

## 8. 🤔 为什么表格有专门的 DOM API？

用原始 DOM API 构建表格会很繁琐，因为表格层级多，节点关系固定。

HTML DOM 为表格提供了一组专用属性和方法。

表格常见属性和方法包括：

| API                     | 作用              |
| ----------------------- | ----------------- |
| `table.caption`         | 表格标题          |
| `table.tHead`           | 表头              |
| `table.tFoot`           | 表尾              |
| `table.tBodies`         | 所有 `tbody` 集合 |
| `table.rows`            | 表格所有行        |
| `table.createTHead()`   | 创建表头          |
| `table.createTFoot()`   | 创建表尾          |
| `table.createCaption()` | 创建标题          |
| `table.insertRow()`     | 插入行            |
| `table.deleteRow()`     | 删除行            |

`tbody` 和 `tr` 也有对应方法。

| API                 | 作用             |
| ------------------- | ---------------- |
| `tbody.rows`        | 当前表体所有行   |
| `tbody.insertRow()` | 插入行           |
| `tbody.deleteRow()` | 删除行           |
| `tr.cells`          | 当前行所有单元格 |
| `tr.insertCell()`   | 插入单元格       |
| `tr.deleteCell()`   | 删除单元格       |

## 9. 🤔 如何用表格 API 创建表格内容？

下面示例用表格 API 创建两行两列。

```js
const table = document.createElement('table')
const tbody = document.createElement('tbody')

for (const rowData of [
  ['姓名', '年龄'],
  ['Lily', '18'],
]) {
  const row = tbody.insertRow()

  for (const text of rowData) {
    const cell = row.insertCell()
    cell.textContent = text
  }
}

table.appendChild(tbody)
document.body.appendChild(table)
```

表格专用 API 的好处是减少手动创建 `tr`、`td`、`tbody` 时的样板代码。

实际项目中，如果表格结构复杂，通常会交给框架渲染。但理解这些 API 有助于读懂原生 DOM 操作。

## 10. 🤔 `NodeList` 为什么容易出问题？

`NodeList`、`HTMLCollection`、`NamedNodeMap` 都是集合类型。它们看起来像数组，但不是普通数组。

更重要的是，很多 DOM 集合是实时集合。文档变化后，集合内容会立即变化。

```js
const items = document.getElementsByTagName('li')
console.log(items.length)

const li = document.createElement('li')
document.querySelector('ul').appendChild(li)

console.log(items.length) // 可能已经增加
```

如果你一边遍历实时集合，一边往里面添加节点，就可能导致循环条件不断变化。

## 11. 🤔 如何更安全地遍历实时集合？

第一种方式是缓存初始长度。

```js
const elements = document.getElementsByTagName('div')
const length = elements.length

for (let index = 0; index < length; index++) {
  console.log(elements[index])
}
```

第二种方式是先转换成普通数组。

```js
const elements = Array.from(document.getElementsByTagName('div'))

for (const element of elements) {
  console.log(element)
}
```

第三种方式是在删除节点时反向遍历。

```js
const elements = document.getElementsByClassName('temporary')

for (let index = elements.length - 1; index >= 0; index--) {
  elements[index].remove()
}
```

核心原则是：遍历期间不要让循环条件依赖一个正在被你修改的实时集合。

## 12. 🤔 DOM 编程有哪些性能习惯？

DOM 操作不是不能用，而是要避免无意义地频繁使用。

常见建议包括：

- 缓存重复查询的节点或集合。
- 批量创建节点时使用 `DocumentFragment`。
- 遍历实时集合时缓存长度或转为数组。
- 避免在循环中频繁触发布局相关读写。
- 动态资源加载要处理失败和时序问题。

DOM 编程越靠近底层，越需要你清楚每一次查询、插入和修改会带来什么影响。
