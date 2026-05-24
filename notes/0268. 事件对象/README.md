# [0268. 事件对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0268.%20%E4%BA%8B%E4%BB%B6%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 事件对象是什么？](#3--事件对象是什么)
- [4. 🤔 DOM `Event` 有哪些常用属性？](#4--dom-event-有哪些常用属性)
- [5. 🤔 如何阻止默认行为？](#5--如何阻止默认行为)
- [6. 🤔 如何停止事件传播？](#6--如何停止事件传播)
- [7. 🤔 `target`、`currentTarget` 和 `this` 有什么关系？](#7--targetcurrenttarget-和-this-有什么关系)
- [8. 🤔 `eventPhase` 能说明什么？](#8--eventphase-能说明什么)
- [9. 🤔 旧 IE 的事件对象有什么差异？](#9--旧-ie-的事件对象有什么差异)
- [10. 🤔 如何封装跨浏览器事件对象？](#10--如何封装跨浏览器事件对象)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 事件对象的作用
- DOM `Event` 常用属性
- 默认行为与传播控制
- `target`、`currentTarget`、`this`
- `eventPhase`
- 旧 IE 事件对象
- 跨浏览器事件对象封装

## 2. 🫧 评价

- 事件对象是每次交互的现场记录。你要判断点了谁、从哪一层处理、能不能取消默认行为，答案基本都在它身上。

## 3. 🤔 事件对象是什么？

事件发生时，浏览器会创建一个事件对象，把本次事件的上下文信息放进去。

```js
button.addEventListener('click', (event) => {
  console.log(event.type)
  console.log(event.target)
})
```

不同事件类型会有不同的额外属性。例如鼠标事件有坐标，键盘事件有按键信息，触摸事件有触点集合。

但所有 DOM 事件对象都有一组公共属性和方法。

## 4. 🤔 DOM `Event` 有哪些常用属性？

常见属性包括：

| 属性               | 含义                 |
| ------------------ | -------------------- |
| `type`             | 事件类型             |
| `target`           | 事件真正目标         |
| `currentTarget`    | 当前处理程序所在元素 |
| `bubbles`          | 事件是否冒泡         |
| `cancelable`       | 默认行为是否可取消   |
| `defaultPrevented` | 是否已阻止默认行为   |
| `eventPhase`       | 当前事件阶段         |
| `timeStamp`        | 事件创建或触发时间   |

示例：

```js
document.addEventListener('click', (event) => {
  console.log(event.type)
  console.log(event.bubbles)
  console.log(event.cancelable)
})
```

事件对象是只和本次事件相关的临时对象。处理程序执行完之后，不建议长期保存完整事件对象。

## 5. 🤔 如何阻止默认行为？

`preventDefault()` 用来阻止事件的默认行为。

例如，阻止链接跳转：

```js
link.addEventListener('click', (event) => {
  event.preventDefault()
})
```

只有 `cancelable` 为 `true` 的事件才能被取消默认行为。

```js
element.addEventListener('click', (event) => {
  if (event.cancelable) {
    event.preventDefault()
  }
})
```

调用后，`defaultPrevented` 会变为 `true`。

```js
console.log(event.defaultPrevented)
```

## 6. 🤔 如何停止事件传播？

`stopPropagation()` 会阻止事件继续传播。

```js
button.addEventListener('click', (event) => {
  event.stopPropagation()
})
```

它可以阻止后续捕获或冒泡阶段的传播。

`stopImmediatePropagation()` 更强。它不仅阻止传播，还会阻止当前节点上后续同类事件处理程序继续执行。

```js
button.addEventListener('click', (event) => {
  event.stopImmediatePropagation()
})
```

这两个方法都要谨慎使用。过度停止传播会影响事件委托、全局快捷键、弹层关闭和埋点逻辑。

## 7. 🤔 `target`、`currentTarget` 和 `this` 有什么关系？

`target` 是事件真正发生的元素。

`currentTarget` 是当前执行处理程序的元素。

普通函数形式的事件处理程序中，`this` 通常等于 `currentTarget`。

```js
list.addEventListener('click', function (event) {
  console.log(event.target)
  console.log(event.currentTarget)
  console.log(this === event.currentTarget)
})
```

如果监听器直接绑定在被点击元素上，三者通常相同。

如果监听器绑定在祖先元素上，`target` 是被点击的子元素，`currentTarget` 和 `this` 是祖先元素。

箭头函数没有自己的 `this`，因此事件处理程序里如果需要使用当前元素，优先读取 `event.currentTarget`。

## 8. 🤔 `eventPhase` 能说明什么？

`eventPhase` 表示事件当前处于哪个阶段。

| 值  | 阶段         |
| --- | ------------ |
| `1` | 捕获阶段     |
| `2` | 到达目标阶段 |
| `3` | 冒泡阶段     |

```js
element.addEventListener(
  'click',
  (event) => {
    console.log(event.eventPhase)
  },
  { capture: true },
)
```

需要注意，如果处理程序注册在目标元素本身，即使它是冒泡监听器，事件到达目标时 `eventPhase` 也会是 `2`。

## 9. 🤔 旧 IE 的事件对象有什么差异？

旧 IE 中，事件对象和 DOM 标准不同。

常见差异包括：

| DOM 标准                  | 旧 IE                       |
| ------------------------- | --------------------------- |
| `event.target`            | `event.srcElement`          |
| `event.preventDefault()`  | `event.returnValue = false` |
| `event.stopPropagation()` | `event.cancelBubble = true` |

DOM0 方式下，旧 IE 还常通过 `window.event` 获取事件对象。

这些差异现在主要是历史兼容知识。现代浏览器中应优先使用标准事件对象。

## 10. 🤔 如何封装跨浏览器事件对象？

书中给出的思路是封装几个工具方法，对标准和旧 IE 做兼容分支。

```js
const EventUtil = {
  getEvent(event) {
    return event || window.event
  },

  getTarget(event) {
    return event.target || event.srcElement
  },

  preventDefault(event) {
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  },

  stopPropagation(event) {
    if (event.stopPropagation) {
      event.stopPropagation()
    } else {
      event.cancelBubble = true
    }
  },
}
```

如果项目不再支持旧 IE，这类封装就不是必需的。

但它仍然体现了事件对象学习中的重要原则：先理解标准属性和方法，再识别历史差异。
