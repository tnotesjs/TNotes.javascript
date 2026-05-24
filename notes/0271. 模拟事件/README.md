# [0271. 模拟事件](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0271.%20%E6%A8%A1%E6%8B%9F%E4%BA%8B%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是模拟事件？](#3--什么是模拟事件)
- [4. 🤔 原书中的 DOM 事件模拟流程是什么？](#4--原书中的-dom-事件模拟流程是什么)
- [5. 🤔 如何模拟鼠标事件？](#5--如何模拟鼠标事件)
- [6. 🤔 如何模拟键盘事件？](#6--如何模拟键盘事件)
- [7. 🤔 如何模拟自定义事件？](#7--如何模拟自定义事件)
- [8. 🤔 `dispatchEvent()` 有什么返回值？](#8--dispatchevent-有什么返回值)
- [9. 🤔 旧 IE 如何模拟事件？](#9--旧-ie-如何模拟事件)
- [10. 🤔 现代模拟事件有哪些注意点？](#10--现代模拟事件有哪些注意点)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 模拟事件的用途
- DOM 事件模拟
- 鼠标事件模拟
- 键盘事件模拟
- HTML 事件和自定义事件模拟
- `dispatchEvent()`
- 旧 IE 事件模拟
- 现代事件构造器

## 2. 🫧 评价

- 模拟事件适合测试和组件通信，但要记住它是“派发一个事件”，不等于真实用户完成了一次完整操作。默认行为、权限和输入状态都可能不同。

## 3. 🤔 什么是模拟事件？

模拟事件是用 JavaScript 创建事件对象，并主动派发到某个 DOM 节点上。

```js
const event = new Event('change', { bubbles: true })
input.dispatchEvent(event)
```

派发后，事件会进入正常事件流，触发对应的事件处理程序。

模拟事件常用于：

- 测试交互逻辑。
- 触发自定义组件行为。
- 在状态变化后通知外部代码。
- 构建自定义事件系统。

需要注意，模拟事件不等于真实用户操作。它可能不会触发浏览器默认行为，也不会绕过权限和安全限制。

## 4. 🤔 原书中的 DOM 事件模拟流程是什么？

原书介绍的传统流程是：

1. 使用 `document.createEvent()` 创建事件对象。
2. 使用对应初始化方法设置事件信息。
3. 使用 `dispatchEvent()` 派发事件。

例如创建普通事件：

```js
const event = document.createEvent('HTMLEvents')
event.initEvent('focus', true, false)
element.dispatchEvent(event)
```

`initEvent()` 的三个核心参数是：

| 参数         | 含义               |
| ------------ | ------------------ |
| `type`       | 事件类型           |
| `bubbles`    | 是否冒泡           |
| `cancelable` | 是否可取消默认行为 |

这套 API 现在更多作为历史和兼容背景理解。

## 5. 🤔 如何模拟鼠标事件？

传统写法会创建 `MouseEvents`，再用 `initMouseEvent()` 初始化。

```js
const event = document.createEvent('MouseEvents')

event.initMouseEvent(
  'click',
  true,
  true,
  window,
  0,
  0,
  0,
  0,
  0,
  false,
  false,
  false,
  false,
  0,
  null,
)

button.dispatchEvent(event)
```

参数很多，包含事件类型、是否冒泡、是否可取消、视图、坐标、修饰键、鼠标按钮和相关元素等信息。

现代写法通常更清晰：

```js
const event = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
  clientX: 100,
  clientY: 80,
})

button.dispatchEvent(event)
```

## 6. 🤔 如何模拟键盘事件？

DOM3 曾经定义了 `KeyboardEvent` 和 `initKeyboardEvent()`，但不同浏览器历史实现差异较大。

现代代码更推荐使用构造器。

```js
const event = new KeyboardEvent('keydown', {
  key: 'Enter',
  code: 'Enter',
  bubbles: true,
  cancelable: true,
})

input.dispatchEvent(event)
```

需要特别注意：模拟键盘事件通常只会触发事件处理程序，不会真的向输入框写入字符。

如果测试输入内容，应该直接设置输入框值，再派发 `input` 或 `change` 事件。

```js
input.value = 'hello'
input.dispatchEvent(new Event('input', { bubbles: true }))
```

## 7. 🤔 如何模拟自定义事件？

自定义事件用于在应用内部传递语义化消息。

现代写法使用 `CustomEvent`。

```js
const event = new CustomEvent('user:login', {
  bubbles: true,
  detail: {
    id: 1,
    name: 'Alice',
  },
})

document.dispatchEvent(event)
```

监听时可以读取 `detail`。

```js
document.addEventListener('user:login', (event) => {
  console.log(event.detail.name)
})
```

原书中的旧写法是 `document.createEvent('CustomEvent')` 加 `initCustomEvent()`。现代代码优先使用构造器即可。

## 8. 🤔 `dispatchEvent()` 有什么返回值？

`dispatchEvent()` 会把事件派发到目标节点，并返回一个布尔值。

如果事件可取消，并且某个处理程序调用了 `preventDefault()`，返回 `false`；否则返回 `true`。

```js
const event = new Event('save', {
  bubbles: true,
  cancelable: true,
})

const allowed = element.dispatchEvent(event)

if (!allowed) {
  console.log('默认行为被取消')
}
```

这个返回值适合判断事件处理链是否允许继续执行后续默认逻辑。

## 9. 🤔 旧 IE 如何模拟事件？

旧 IE 使用 `document.createEventObject()` 创建事件对象，再用 `fireEvent()` 触发。

```js
const event = document.createEventObject()
event.clientX = 100
event.clientY = 80

button.fireEvent('onclick', event)
```

旧 IE 会自动设置 `srcElement` 和 `type`，其他属性需要自己补。

这套机制现在主要是历史兼容知识。现代浏览器使用标准事件构造器和 `dispatchEvent()`。

## 10. 🤔 现代模拟事件有哪些注意点？

现代模拟事件可以优先使用这些构造器：

| 构造器          | 用途       |
| --------------- | ---------- |
| `Event`         | 普通事件   |
| `MouseEvent`    | 鼠标事件   |
| `KeyboardEvent` | 键盘事件   |
| `CustomEvent`   | 自定义事件 |

使用时要注意：

- 设置 `bubbles` 才能让事件冒泡。
- 设置 `cancelable` 才能被 `preventDefault()` 取消。
- 模拟事件不等于真实用户操作。
- 某些默认行为和受信任用户激活行为不能靠脚本伪造。
- 测试输入时通常要同时设置值和派发事件。

模拟事件很适合测试和组件通信，但不要用它绕过浏览器的安全模型。
