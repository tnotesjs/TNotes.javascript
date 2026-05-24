# [0269. 事件类型](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0269.%20%E4%BA%8B%E4%BB%B6%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么事件类型这么多？](#3--为什么事件类型这么多)
- [4. 🤔 UI 事件有哪些？](#4--ui-事件有哪些)
- [5. 🤔 焦点事件有哪些？](#5--焦点事件有哪些)
- [6. 🤔 鼠标和滚轮事件有哪些？](#6--鼠标和滚轮事件有哪些)
- [7. 🤔 键盘与输入事件有什么区别？](#7--键盘与输入事件有什么区别)
- [8. 🤔 合成事件解决什么问题？](#8--合成事件解决什么问题)
- [9. 🤔 变化事件现在还应该用吗？](#9--变化事件现在还应该用吗)
- [10. 🤔 HTML5 常见事件有哪些？](#10--html5-常见事件有哪些)
- [11. 🤔 设备事件有哪些限制？](#11--设备事件有哪些限制)
- [12. 🤔 触摸和手势事件有什么特点？](#12--触摸和手势事件有什么特点)
- [13. 🤔 学事件类型时应该抓住什么？](#13--学事件类型时应该抓住什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- UI 事件
- 焦点事件
- 鼠标和滚轮事件
- 键盘与输入事件
- 合成事件
- 变化事件
- HTML5 事件
- 设备事件
- 触摸和手势事件
- 高频事件的现代注意点

## 2. 🫧 评价

- 事件类型不适合死记硬背。你真正需要建立的是分类意识：哪些事件高频、哪些会冒泡、哪些受设备和权限影响，以及哪些已经被现代 API 替代。

## 3. 🤔 为什么事件类型这么多？

浏览器要响应的事情很多：页面加载、用户点击、键盘输入、焦点变化、设备旋转、触摸滑动、历史状态变化等。

不同事件类型会携带不同信息。例如鼠标事件有坐标，键盘事件有按键，触摸事件有触点集合。

学习事件类型不需要记住所有事件名，更重要的是掌握分类和高频事件的行为边界。

## 4. 🤔 UI 事件有哪些？

UI 事件通常和窗口、文档或页面资源状态有关。

常见事件包括：

| 事件     | 说明               |
| -------- | ------------------ |
| `load`   | 页面或资源加载完成 |
| `unload` | 页面卸载           |
| `error`  | 资源或脚本错误     |
| `select` | 文本被选中         |
| `resize` | 窗口或元素尺寸变化 |
| `scroll` | 滚动发生           |

`load` 常用于等待页面或资源完成加载。

```js
window.addEventListener('load', () => {
  console.log('页面资源加载完成')
})
```

如果只是等待 DOM 树构建完成，通常更适合使用 `DOMContentLoaded`。

`resize` 和 `scroll` 可能高频触发，处理函数应保持轻量，必要时使用节流、请求动画帧或观察器类 API。

## 5. 🤔 焦点事件有哪些？

焦点事件和元素获得或失去焦点有关。

| 事件       | 是否冒泡 | 说明                             |
| ---------- | -------- | -------------------------------- |
| `focus`    | 否       | 元素获得焦点                     |
| `blur`     | 否       | 元素失去焦点                     |
| `focusin`  | 是       | 元素即将或已经获得焦点的冒泡版本 |
| `focusout` | 是       | 元素失去焦点的冒泡版本           |

`focus` 和 `blur` 不冒泡，因此不适合普通冒泡委托。

如果需要在表单容器上统一处理焦点变化，可以使用 `focusin` 和 `focusout`。

```js
form.addEventListener('focusin', (event) => {
  event.target.classList.add('is-focused')
})

form.addEventListener('focusout', (event) => {
  event.target.classList.remove('is-focused')
})
```

焦点管理对键盘操作和无障碍体验非常重要。

## 6. 🤔 鼠标和滚轮事件有哪些？

常见鼠标事件包括：

| 事件         | 说明                   |
| ------------ | ---------------------- |
| `click`      | 单击                   |
| `dblclick`   | 双击                   |
| `mousedown`  | 按下鼠标按钮           |
| `mouseup`    | 释放鼠标按钮           |
| `mousemove`  | 鼠标移动               |
| `mouseover`  | 鼠标进入元素或其子元素 |
| `mouseout`   | 鼠标离开元素或其子元素 |
| `mouseenter` | 鼠标进入元素，不冒泡   |
| `mouseleave` | 鼠标离开元素，不冒泡   |
| `wheel`      | 滚轮滚动               |

鼠标事件常见坐标包括：

- `clientX`、`clientY`：相对视口。
- `pageX`、`pageY`：相对页面。
- `screenX`、`screenY`：相对屏幕。

常见修饰键包括：

- `shiftKey`
- `ctrlKey`
- `altKey`
- `metaKey`

`click` 通常比只监听 `mousedown` 更友好，因为键盘激活按钮也可能触发点击语义。

## 7. 🤔 键盘与输入事件有什么区别？

键盘事件关注按键动作，输入事件关注内容变化。

常见键盘事件包括：

| 事件       | 说明                         |
| ---------- | ---------------------------- |
| `keydown`  | 按键按下，长按会重复触发     |
| `keyup`    | 按键释放                     |
| `keypress` | 历史事件，现代不推荐作为首选 |

现代输入处理更常使用 `input` 和 `beforeinput`。

```js
input.addEventListener('input', (event) => {
  console.log(event.target.value)
})
```

键盘事件中，旧属性有 `keyCode`、`charCode`。现代更推荐 `key`、`code` 和修饰键状态。

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDialog()
  }
})
```

需要注意输入法场景。用户正在输入中文、日文等组合文字时，键盘事件不一定代表最终输入内容。

## 8. 🤔 合成事件解决什么问题？

合成事件用于处理输入法编辑过程，也就是 IME 输入。

常见事件包括：

| 事件                | 说明         |
| ------------------- | ------------ |
| `compositionstart`  | 开始组合输入 |
| `compositionupdate` | 组合输入更新 |
| `compositionend`    | 组合输入结束 |

在中文输入中，用户输入拼音时文本还没有最终确定。如果你在这个过程中立刻搜索、校验或提交，体验会很糟。

常见做法是组合输入期间暂停实时处理。

```js
let composing = false

input.addEventListener('compositionstart', () => {
  composing = true
})

input.addEventListener('compositionend', () => {
  composing = false
  handleInput(input.value)
})

input.addEventListener('input', () => {
  if (!composing) {
    handleInput(input.value)
  }
})
```

## 9. 🤔 变化事件现在还应该用吗？

DOM2 曾经定义过 Mutation Events，用来监听 DOM 结构变化。

这些事件已经不推荐使用，现代应使用 `MutationObserver`。

```js
const observer = new MutationObserver((records) => {
  console.log(records)
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})
```

原因是 Mutation Events 同步触发，性能较差，也容易引发复杂的递归变化问题。

## 10. 🤔 HTML5 常见事件有哪些？

HTML5 和浏览器实现补充了不少常用事件。

| 事件               | 说明                       |
| ------------------ | -------------------------- |
| `contextmenu`      | 打开上下文菜单             |
| `beforeunload`     | 页面离开前确认             |
| `DOMContentLoaded` | DOM 构建完成               |
| `readystatechange` | 文档加载状态变化           |
| `pageshow`         | 页面显示，包括往返缓存恢复 |
| `pagehide`         | 页面隐藏或进入往返缓存     |
| `hashchange`       | URL hash 改变              |

`DOMContentLoaded` 常用于初始化页面交互。

```js
document.addEventListener('DOMContentLoaded', () => {
  initPage()
})
```

`beforeunload` 只能用于必要的离开确认，不应滥用。注册 `unload` 或某些离开事件还可能影响浏览器往返缓存，现代页面要谨慎。

## 11. 🤔 设备事件有哪些限制？

设备事件包括方向和运动相关事件。

常见事件有：

- `orientationchange`
- `deviceorientation`
- `devicemotion`

它们依赖设备硬件能力，也可能受到浏览器权限、安全上下文和隐私策略限制。

```js
window.addEventListener('deviceorientation', (event) => {
  console.log(event.alpha, event.beta, event.gamma)
})
```

不要假设所有设备都支持这些事件。使用前要检测，并提供降级体验。

## 12. 🤔 触摸和手势事件有什么特点？

触摸事件用于移动设备上的多点触控。

常见事件包括：

| 事件          | 说明           |
| ------------- | -------------- |
| `touchstart`  | 手指触碰屏幕   |
| `touchmove`   | 手指在屏幕移动 |
| `touchend`    | 手指离开屏幕   |
| `touchcancel` | 触摸被系统取消 |

触摸事件对象中常见集合包括：

- `touches`：当前屏幕上的全部触点。
- `targetTouches`：当前目标上的触点。
- `changedTouches`：本次事件发生变化的触点。

`touchmove` 中调用 `preventDefault()` 可以阻止滚动，但现代浏览器还涉及被动监听器和滚动性能优化。

手势事件如 `gesturestart`、`gesturechange`、`gestureend` 更偏历史和平台特定实现。现代跨平台开发还会考虑 Pointer Events。

## 13. 🤔 学事件类型时应该抓住什么？

事件列表非常庞大，不适合按字典方式背诵。

更实用的学习方式是抓住这些问题：

- 这个事件是否冒泡？
- 它是不是高频事件？
- 事件对象里有哪些关键属性？
- 是否能取消默认行为？
- 是否受权限、设备或浏览器策略影响？
- 是否已有更现代的替代 API？

掌握这些边界，远比记住每个事件名更重要。
