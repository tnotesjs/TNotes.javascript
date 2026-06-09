# [0266. 事件流](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0266.%20%E4%BA%8B%E4%BB%B6%E6%B5%81)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是事件流？](#3-什么是事件流)
- [4. 什么是事件冒泡？](#4-什么是事件冒泡)
- [5. 什么是事件捕获？](#5-什么是事件捕获)
- [6. DOM 事件流有哪些阶段？](#6-dom-事件流有哪些阶段)
- [7. `target` 和 `currentTarget` 有什么区别？](#7-target-和-currenttarget-有什么区别)
- [8. 目标元素上会触发捕获监听器吗？](#8-目标元素上会触发捕获监听器吗)
- [9. 什么时候需要停止事件传播？](#9-什么时候需要停止事件传播)

<!-- endregion:toc -->

## 1. 本节内容

- 事件流的概念
- 事件冒泡
- 事件捕获
- DOM 事件流三阶段
- `target` 与 `currentTarget`
- 捕获阶段和冒泡阶段的现代行为

## 2. 评价

- 事件流是理解事件委托、阻止传播和组件嵌套交互的基础。很多事件问题看起来是“点错了”，本质上都是传播路径没想清楚。

## 3. 什么是事件流？

事件流描述事件在 DOM 树中的传播顺序。

当你点击一个按钮时，事件并不是只属于按钮本身。按钮的父元素、祖先元素、文档和窗口也可能参与这次事件处理。

事件流要回答的问题是：事件先到谁，后到谁，哪些处理程序有机会执行。

## 4. 什么是事件冒泡？

事件冒泡是从最具体的事件目标开始，然后向更外层的祖先节点传播。

例如，点击页面中的 `div`，大致传播顺序可以理解为：

```txt
div -> body -> html -> document -> window
```

现代浏览器中，大多数常用事件都会冒泡。

事件冒泡非常适合事件委托。比如，不给每个列表项绑定点击事件，而是给父级列表绑定一次。

```js
list.addEventListener('click', (event) => {
  const item = event.target.closest('li')

  if (item && list.contains(item)) {
    console.log(item.textContent)
  }
})
```

点击 `li` 时，事件会冒泡到 `list`，父元素就能统一处理子元素事件。

## 5. 什么是事件捕获？

事件捕获和事件冒泡方向相反。它从外层节点开始，向真正的目标节点传播。

大致顺序可以理解为：

```txt
window -> document -> html -> body -> div
```

捕获阶段的设计目的，是让外层节点有机会在事件到达目标前先处理或拦截。

使用 `addEventListener()` 时，第三个参数可以控制是否在捕获阶段监听。

```js
element.addEventListener('click', handleClick, true)
```

更现代的写法是使用选项对象。

```js
element.addEventListener('click', handleClick, { capture: true })
```

实际开发中，捕获阶段用得比冒泡少，但在全局拦截、埋点、外层组件提前处理事件时仍然有价值。

## 6. DOM 事件流有哪些阶段？

DOM 事件流包含三个阶段：

| 阶段         | 方向       | 说明                 |
| ------------ | ---------- | -------------------- |
| 捕获阶段     | 外层到目标 | 事件到达目标前传播   |
| 到达目标阶段 | 目标元素   | 事件到达真实目标     |
| 冒泡阶段     | 目标到外层 | 事件从目标向祖先传播 |

事件对象的 `eventPhase` 可以表示当前阶段。

```js
element.addEventListener('click', (event) => {
  console.log(event.eventPhase)
})
```

常见值包括：

| 值  | 含义         |
| --- | ------------ |
| `1` | 捕获阶段     |
| `2` | 到达目标阶段 |
| `3` | 冒泡阶段     |

## 7. `target` 和 `currentTarget` 有什么区别？

`target` 是事件真正发生的目标元素。

`currentTarget` 是当前正在执行事件处理程序的元素。

```js
list.addEventListener('click', (event) => {
  console.log(event.target)
  console.log(event.currentTarget)
})
```

如果点击的是 `list` 里面的某个按钮，那么：

- `event.target` 是按钮。
- `event.currentTarget` 是 `list`。

在普通函数形式的事件处理程序中，`this` 通常等于 `currentTarget`。

```js
element.addEventListener('click', function (event) {
  console.log(this === event.currentTarget)
})
```

事件委托几乎都依赖这个区别：监听器挂在祖先元素上，但通过 `target` 找到真正被操作的子元素。

## 8. 目标元素上会触发捕获监听器吗？

DOM2 规范曾经描述捕获阶段不在目标元素上触发。

但现代浏览器实际会让目标元素上的捕获监听器也触发。也就是说，同一个目标元素上可能有两次处理机会：

- 捕获监听器。
- 冒泡监听器。

```js
button.addEventListener(
  'click',
  () => {
    console.log('捕获监听器')
  },
  { capture: true },
)

button.addEventListener('click', () => {
  console.log('冒泡监听器')
})
```

它们都在目标元素上执行，但注册阶段不同。

## 9. 什么时候需要停止事件传播？

有时你不希望事件继续传播，可以调用 `stopPropagation()`。

```js
button.addEventListener('click', (event) => {
  event.stopPropagation()
})
```

它会阻止事件继续进入后续捕获或冒泡路径。

但不要把它当成默认习惯。过度停止传播会让外层组件、全局快捷键、埋点和事件委托失效。

更好的做法是先理清事件流，再决定是否真的需要打断传播。
