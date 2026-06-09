# [0267. 事件处理程序](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0267.%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E7%A8%8B%E5%BA%8F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是事件处理程序？](#3-什么是事件处理程序)
- [4. HTML 事件处理程序是什么？](#4-html-事件处理程序是什么)
- [5. DOM0 事件处理程序怎么写？](#5-dom0-事件处理程序怎么写)
- [6. DOM2 事件处理程序为什么更推荐？](#6-dom2-事件处理程序为什么更推荐)
- [7. 旧 IE 的事件处理程序有什么差异？](#7-旧-ie-的事件处理程序有什么差异)
- [8. 跨浏览器事件封装怎么做？](#8-跨浏览器事件封装怎么做)
- [9. 现代代码注册事件时有什么建议？](#9-现代代码注册事件时有什么建议)

<!-- endregion:toc -->

## 1. 本节内容

- 事件处理程序的概念
- HTML 事件处理程序
- DOM0 事件处理程序
- DOM2 事件处理程序
- 旧 IE 事件处理程序
- 跨浏览器事件处理封装
- 现代注册和移除建议

## 2. 评价

- 事件处理程序的历史 API 很多，但现代实践其实很明确：优先用 `addEventListener()`，保留函数引用，知道自己监听的是捕获还是冒泡。

## 3. 什么是事件处理程序？

事件处理程序是事件发生时执行的函数，也常叫事件监听器。

事件名通常以 `on` 开头，例如 `onclick`、`onload`、`onkeydown`。不过使用 `addEventListener()` 时，事件类型不带 `on`。

```js
button.addEventListener('click', handleClick)
```

事件处理程序的核心任务是：在事件发生时读取事件对象，并执行对应业务逻辑。

## 4. HTML 事件处理程序是什么？

HTML 事件处理程序是把事件代码直接写在 HTML 属性中。

```html
<button onclick="showMessage()">保存</button>
```

这种方式历史很早。浏览器会把属性值包装成函数，函数内部可以访问 `event`，`this` 通常指向当前元素。

但现代开发不推荐这种写法，原因包括：

- HTML 和 JavaScript 强耦合。
- 加载顺序可能导致函数还没定义。
- 作用域规则复杂，不利于维护。
- 不方便统一移除或复用处理程序。

它适合作为历史知识理解，不适合作为现代项目的默认实践。

## 5. DOM0 事件处理程序怎么写？

DOM0 方式是给元素的事件属性赋值。

```js
button.onclick = function () {
  console.log('clicked')
}
```

处理程序中的 `this` 指向元素本身。

```js
button.onclick = function () {
  console.log(this === button)
}
```

移除处理程序时，把属性设置为 `null`。

```js
button.onclick = null
```

DOM0 的优点是简单、兼容性好。缺点是同一个事件属性只能保存一个处理程序，后赋值会覆盖前一个。

## 6. DOM2 事件处理程序为什么更推荐？

DOM2 使用 `addEventListener()` 添加事件处理程序，使用 `removeEventListener()` 移除。

```js
function handleClick(event) {
  console.log(event.type)
}

button.addEventListener('click', handleClick)
button.removeEventListener('click', handleClick)
```

它的优势包括：

- 同一事件可以添加多个处理程序。
- 处理程序按添加顺序执行。
- 可以选择捕获阶段或冒泡阶段。
- 移除方式明确。

第三个参数可以是布尔值，也可以是选项对象。

```js
button.addEventListener('click', handleClick, { capture: false })
```

移除时必须传入同一个函数引用。

```js
button.addEventListener('click', function () {
  console.log('无法精确移除这个匿名函数')
})
```

因此，需要移除的处理程序不要直接写成匿名函数。

## 7. 旧 IE 的事件处理程序有什么差异？

旧 IE 使用 `attachEvent()` 和 `detachEvent()`。

```js
button.attachEvent('onclick', handleClick)
button.detachEvent('onclick', handleClick)
```

它和 DOM2 有几个重要差异：

- 事件名需要带 `on`。
- 只支持冒泡阶段。
- 处理程序中的 `this` 指向 `window`。
- 多个处理程序的执行顺序和 DOM2 不同。

这些内容现在主要作为历史兼容背景。现代浏览器应优先使用标准事件模型。

## 8. 跨浏览器事件封装怎么做？

书中介绍过一种常见封装：先检测标准 API，再退回旧 API。

```js
const EventUtil = {
  addHandler(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false)
    } else if (element.attachEvent) {
      element.attachEvent(`on${type}`, handler)
    } else {
      element[`on${type}`] = handler
    }
  },

  removeHandler(element, type, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false)
    } else if (element.detachEvent) {
      element.detachEvent(`on${type}`, handler)
    } else {
      element[`on${type}`] = null
    }
  },
}
```

这种封装能统一添加和移除入口，但不能完全抹平行为差异。例如旧 IE 的 `this` 指向、事件对象和执行顺序仍然不同。

现代项目如果不再支持旧 IE，就不需要这类封装。

## 9. 现代代码注册事件时有什么建议？

建议遵循几条规则：

- 优先使用 `addEventListener()`。
- 需要移除时，保留函数引用。
- 明确使用捕获还是冒泡。
- 高频事件处理函数保持轻量。
- 对动态列表优先考虑事件委托。
- 组件销毁或 DOM 移除前清理监听器。

例如：

```js
function handleInput(event) {
  console.log(event.target.value)
}

input.addEventListener('input', handleInput)

// 组件销毁时
input.removeEventListener('input', handleInput)
```

事件处理程序写得越明确，后续排查交互问题就越轻松。
