# [0185. 单例内置对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0185.%20%E5%8D%95%E4%BE%8B%E5%86%85%E7%BD%AE%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是单例内置对象？](#3--什么是单例内置对象)
- [4. 🤔 `Global` 对象在 JavaScript 里扮演什么角色？](#4--global-对象在-javascript-里扮演什么角色)
- [5. 🤔 URI 编解码方法应该怎样区分？](#5--uri-编解码方法应该怎样区分)
- [6. 🤔 为什么 `eval()` 很强但通常不该用？](#6--为什么-eval-很强但通常不该用)
- [7. 🤔 `Math` 对象最值得优先掌握哪些能力？](#7--math-对象最值得优先掌握哪些能力)
- [8. 🤔 这一节可以沉淀成哪些实践结论？](#8--这一节可以沉淀成哪些实践结论)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 单例内置对象的含义
- `Global` 对象与全局作用域
- URI 编解码相关方法
- `eval()` 的能力与风险
- `Math` 的常见属性和方法
- 随机数与舍入场景的常用写法

## 2. 🫧 评价

- 这一节看起来像 API 罗列，但真正重要的是理解“哪些能力是全局上下文天然提供的”。尤其是 `eval()` 和 `Math.random()` 这种 API，知道它们能做什么远远不够，还得知道什么时候不该滥用。

## 3. 🤔 什么是单例内置对象？

单例内置对象就是程序一开始执行时就已经存在的内置对象。你不需要 `new` 它们，它们本来就在那里。

这一节最重要的两个例子是：

- `Global`
- `Math`

它们和 `Date`、`RegExp` 这类需要创建实例的对象不同，更像是“运行时默认给你挂好的工具入口”。

## 4. 🤔 `Global` 对象在 JavaScript 里扮演什么角色？

`Global` 可以理解为全局兜底对象。那些不属于某个具体对象的方法和属性，最终都可以认为是它提供的。

比如全局作用域里的函数、特殊值和构造器，都会和这个全局对象发生关系。

在浏览器里，书里主要用 `window` 来体现这层关系：

```js
var color = 'red'

function sayColor() {
  console.log(window.color)
}

window.sayColor()
```

这里 `color` 和 `sayColor()` 都可以通过 `window` 访问。

你也可以把这一节理解成：所谓“全局变量”和“全局函数”，本质上都是某个全局对象上的属性和方法。

## 5. 🤔 URI 编解码方法应该怎样区分？

全局对象上有两组很常用的方法：

- `encodeURI()` / `decodeURI()`
- `encodeURIComponent()` / `decodeURIComponent()`

它们的关键区别是编码粒度不同。

`encodeURI()` 适合编码完整 URI，它不会转义 URL 结构里本来就有语义的字符，比如冒号、斜杠、问号和井号。

```js
const uri = 'http://www.example.com/illegal value.js#start'
console.log(encodeURI(uri))
```

`encodeURIComponent()` 更适合编码 URI 的某个组成部分，比如查询参数：

```js
const keyword = 'a b&c'
console.log(encodeURIComponent(keyword))
```

所以实践里一般可以记成一句话：

- 编整个地址，用 `encodeURI()`。
- 编参数片段，用 `encodeURIComponent()`。

## 6. 🤔 为什么 `eval()` 很强但通常不该用？

`eval()` 会把传入的字符串当成 JavaScript 代码直接执行：

```js
eval("console.log('hi')")
```

它之所以危险，是因为这等于把“普通字符串”变成了“可执行代码”。只要输入来源不可信，你就可能把攻击面直接敞开。

即便不谈安全问题，`eval()` 也会带来可读性差、作用域难分析、优化困难等问题。

所以现代代码里对它的态度通常很明确：除非你在做解释器、沙箱或极特殊的动态执行场景，否则不要用它。

## 7. 🤔 `Math` 对象最值得优先掌握哪些能力？

`Math` 是数学工具箱，不需要实例化。

它上面最常用的能力通常包括：

- 常量：`Math.PI`、`Math.E`
- 最大最小值：`Math.max()`、`Math.min()`
- 舍入：`Math.ceil()`、`Math.floor()`、`Math.round()`、`Math.fround()`
- 随机数：`Math.random()`
- 乘方和开方：`Math.pow()`、`Math.sqrt()`

例如：

```js
console.log(Math.max(3, 54, 32, 16)) // 54
console.log(Math.min(3, 54, 32, 16)) // 3
console.log(Math.round(25.5)) // 26
console.log(Math.floor(25.9)) // 25
```

如果你要在一个闭区间里取随机整数，常见写法是：

```js
function selectFrom(lowerValue, upperValue) {
  const choices = upperValue - lowerValue + 1
  return Math.floor(Math.random() * choices + lowerValue)
}
```

## 8. 🤔 这一节可以沉淀成哪些实践结论？

可以把这一节收束成下面几条。

- 全局能力不是“漂浮在空气里”，而是挂在全局对象上的。
- 浏览器里经常通过 `window` 观察到这层关系。
- URI 编解码要分清“整个地址”与“地址片段”。
- `eval()` 的风险远大于便利，默认不要使用。
- `Math` 是工具对象，不要 `new Math()`，直接调用它的方法和常量即可。

知道这些之后，你再遇到全局方法、随机数、URI 编码和历史遗留代码时，就更容易判断哪些是语言内置能力，哪些只是环境或时代留下来的写法。
