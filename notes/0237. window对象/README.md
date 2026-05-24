# [0237. window对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0237.%20window%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `window` 对象有什么特殊身份？](#3--window-对象有什么特殊身份)
- [4. 🤔 `window` 和全局作用域是什么关系？](#4--window-和全局作用域是什么关系)
- [5. 🤔 `top`、`parent` 和 `self` 分别指向谁？](#5--topparent-和-self-分别指向谁)
- [6. 🤔 如何获取窗口位置和像素比？](#6--如何获取窗口位置和像素比)
- [7. 🤔 如何获取窗口和视口大小？](#7--如何获取窗口和视口大小)
- [8. 🤔 如何读取和控制视口滚动？](#8--如何读取和控制视口滚动)
- [9. 🤔 `window.open()` 能做什么？](#9--windowopen-能做什么)
- [10. 🤔 新窗口的 `opener` 有什么风险？](#10--新窗口的-opener-有什么风险)
- [11. 🤔 定时器有哪些注意点？](#11--定时器有哪些注意点)
- [12. 🤔 系统对话框有什么特点？](#12--系统对话框有什么特点)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `window` 作为 BOM 核心对象
- `window` 与全局作用域
- 窗口关系：`top`、`parent`、`self`
- 窗口位置、像素比和窗口大小
- 视口滚动位置
- `window.open()` 与弹出窗口
- 定时器
- 系统对话框

## 2. 🫧 评价

- `window` 是浏览器 JavaScript 里最容易被习惯性忽略的对象。你写的很多全局代码、定时器、滚动和弹窗，背后其实都在和它打交道。

## 3. 🤔 `window` 对象有什么特殊身份？

`window` 是 BOM 的核心对象，表示浏览器窗口实例。

它在浏览器里有两重身份：

- 它是浏览器窗口的 JavaScript 接口。
- 它也是 ECMAScript 的全局对象。

这意味着浏览器环境中的很多全局方法和全局构造函数，最终都可以从 `window` 上访问。

```js
console.log(window.parseInt('10', 10)) // 10
console.log(parseInt('10', 10)) // 10
```

日常写代码时可以省略 `window.`，但理解它的存在有助于判断全局变量、浏览器 API 和窗口能力之间的关系。

## 4. 🤔 `window` 和全局作用域是什么关系？

在浏览器中，通过 `var` 声明的全局变量和全局函数会成为 `window` 的属性。

```js
var age = 29

function sayAge() {
  console.log(window.age)
}

console.log(window.age) // 29
window.sayAge() // 29
```

但 `let` 和 `const` 声明的全局绑定不会成为 `window` 的属性。

```js
let age = 29

console.log(window.age) // undefined
```

还有一个实用差异：访问未声明变量会报错，但查询 `window` 上不存在的属性只会得到 `undefined`。

```js
// ReferenceError
// console.log(oldValue)

console.log(window.oldValue) // undefined
```

所以检测某个可能不存在的全局能力时，常见写法是检查 `window.someFeature`，而不是直接访问未声明标识符。

## 5. 🤔 `top`、`parent` 和 `self` 分别指向谁？

浏览器里可能有多个窗口或窗格，因此 BOM 提供了一组窗口关系指针。

| 属性     | 指向                          |
| -------- | ----------------------------- |
| `top`    | 最外层窗口                    |
| `parent` | 当前窗口的父窗口              |
| `self`   | 当前窗口本身，等同于 `window` |

如果当前窗口就是最外层窗口，那么 `parent`、`top` 和 `window` 通常指向同一个对象。

这些属性可以串联访问，例如 `window.parent.parent`。不过跨源窗口访问会受到同源策略限制，并不是所有父子窗口信息都能随意读取。

## 6. 🤔 如何获取窗口位置和像素比？

现代浏览器通常提供 `screenLeft` 和 `screenTop`，用于表示窗口相对屏幕左侧和顶部的位置，单位是 CSS 像素。

```js
console.log(window.screenLeft)
console.log(window.screenTop)
```

窗口移动方法包括 `moveTo()` 和 `moveBy()`：

```js
window.moveTo(0, 0)
window.moveBy(50, 100)
```

这些方法在现代浏览器中常常会被限制，尤其是普通页面试图移动主窗口时。

`devicePixelRatio` 表示物理像素与 CSS 像素之间的比例。

```js
console.log(window.devicePixelRatio)
```

例如 `devicePixelRatio` 为 `2` 时，1 个 CSS 像素通常会对应 2 个物理像素。它常用于高清屏适配、Canvas 绘制和图片资源选择。

## 7. 🤔 如何获取窗口和视口大小？

常见属性包括：

| 属性                                                   | 含义               |
| ------------------------------------------------------ | ------------------ |
| `outerWidth`、`outerHeight`                            | 浏览器窗口自身尺寸 |
| `innerWidth`、`innerHeight`                            | 页面视口尺寸       |
| `document.documentElement.clientWidth`、`clientHeight` | 文档元素视口尺寸   |

```js
const viewportWidth = window.innerWidth
const viewportHeight = window.innerHeight
```

桌面和移动浏览器对视口的定义可能不同，移动端还会涉及布局视口和可见视口。实际开发中，如果要处理响应式布局，通常优先使用 CSS 媒体查询；只有需要运行时计算时，才读取这些属性。

窗口大小也可以通过 `resizeTo()` 和 `resizeBy()` 调整：

```js
window.resizeTo(800, 600)
window.resizeBy(100, 50)
```

和窗口移动一样，这些方法在现代浏览器中通常只对脚本打开的窗口有限可用。

## 8. 🤔 如何读取和控制视口滚动？

窗口滚动位置可以通过下面几组属性读取：

```js
console.log(window.scrollX)
console.log(window.scrollY)
```

老一些的写法也会使用 `pageXOffset` 和 `pageYOffset`。

控制滚动可以使用 `scroll()`、`scrollTo()` 和 `scrollBy()`。

```js
window.scrollTo(0, 0)
window.scrollBy(0, 100)
```

它们也支持传入配置对象，用于设置平滑滚动。

```js
window.scrollTo({
  left: 0,
  top: 100,
  behavior: 'smooth',
})
```

这类 API 常用于返回顶部、锚点定位、阅读进度和页面恢复场景。

## 9. 🤔 `window.open()` 能做什么？

`window.open()` 可以打开一个 URL，也可以打开或复用指定名称的窗口。

```js
const popup = window.open('https://example.com', '_blank')
```

它常见参数包括：

| 参数       | 作用                                                   |
| ---------- | ------------------------------------------------------ |
| URL        | 要加载的地址                                           |
| 目标窗口   | 窗口名或 `_blank`、`_self`、`_parent`、`_top` 等特殊值 |
| 特性字符串 | 新窗口尺寸、位置、是否可缩放等配置                     |

```js
const popup = window.open(
  'https://example.com',
  'exampleWindow',
  'width=400,height=400,left=10,top=10,resizable=yes',
)
```

返回值是新窗口的引用。如果弹窗被拦截，可能返回 `null`，也可能抛出错误。

```js
let blocked = false

try {
  const popup = window.open('https://example.com', '_blank')
  blocked = popup === null
} catch (error) {
  blocked = true
}
```

现代浏览器通常只允许在用户主动操作中打开弹窗，比如点击按钮。页面加载时自动弹窗大概率会被拦截。

## 10. 🤔 新窗口的 `opener` 有什么风险？

通过 `window.open()` 打开的窗口，会有一个 `opener` 属性指向打开它的窗口。

```js
const popup = window.open('https://example.com', '_blank')

console.log(popup.opener === window)
```

如果两个窗口需要通信，这个引用有用。但如果打开的是不受信任页面，保留 `opener` 可能带来安全风险。

可以在打开后断开引用：

```js
const popup = window.open('https://example.com', '_blank')

if (popup) {
  popup.opener = null
}
```

实际项目中，更常见的方式是在链接或打开逻辑中配合 `noopener`，避免新页面反向操作原页面。

## 11. 🤔 定时器有哪些注意点？

浏览器提供两个常见定时器：

- `setTimeout()`：指定一段时间后执行一次。
- `setInterval()`：每隔一段时间重复执行。

```js
const timeoutId = setTimeout(() => {
  console.log('done')
}, 1000)

clearTimeout(timeoutId)
```

`setTimeout()` 的延迟不是精确执行时间，只是把任务加入队列前至少等待的时间。当前线程忙时，回调会继续等待。

`setInterval()` 会持续排队，直到调用 `clearInterval()` 或页面卸载。

```js
const intervalId = setInterval(() => {
  console.log('tick')
}, 1000)

clearInterval(intervalId)
```

很多循环任务更推荐用递归 `setTimeout()`，因为它能在上一次任务结束后再安排下一次。

```js
function tick() {
  console.log('tick')
  setTimeout(tick, 1000)
}

setTimeout(tick, 1000)
```

这样更容易避免某次任务执行过久导致多个间隔任务堆积。

## 12. 🤔 系统对话框有什么特点？

浏览器提供几种系统对话框：

| 方法        | 作用                           |
| ----------- | ------------------------------ |
| `alert()`   | 显示消息                       |
| `confirm()` | 让用户确认或取消               |
| `prompt()`  | 获取用户输入                   |
| `print()`   | 打开打印对话框                 |
| `find()`    | 打开查找对话框，部分浏览器支持 |

`alert()`、`confirm()` 和 `prompt()` 是同步模态对话框。显示期间会暂停脚本继续执行，直到用户关闭对话框。

```js
if (confirm('确定删除吗？')) {
  console.log('执行删除')
}
```

这类对话框简单粗暴，但用户体验不好，也容易被浏览器限制。现代应用通常更倾向使用自定义弹层，只在调试、教学或极简单场景中使用系统对话框。
