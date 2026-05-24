# [0303. 调试技术](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0303.%20%E8%B0%83%E8%AF%95%E6%8A%80%E6%9C%AF)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么不推荐用 `alert()` 调试？](#3--为什么不推荐用-alert-调试)
- [4. 🤔 控制台有哪些常用日志方法？](#4--控制台有哪些常用日志方法)
- [5. 🤔 控制台运行时是什么？](#5--控制台运行时是什么)
- [6. 🤔 如何使用 `debugger` 和断点？](#6--如何使用-debugger-和断点)
- [7. 🤔 什么时候需要在页面中打印调试消息？](#7--什么时候需要在页面中打印调试消息)
- [8. 🤔 可以包装或扩展 `console` 吗？](#8--可以包装或扩展-console-吗)
- [9. 🤔 抛出错误为什么也是调试技术？](#9--抛出错误为什么也是调试技术)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 控制台日志方法
- 控制台运行时和 REPL
- `debugger` 与断点调试
- 在页面中打印调试消息
- 扩展或包装控制台方法
- 用断言和自定义错误辅助调试

## 2. 🫧 评价

- 调试技术的核心不是输出更多信息，而是在正确的位置观察正确的状态；控制台、断点和清晰错误消息分别解决不同层面的问题。

## 3. 🤔 为什么不推荐用 `alert()` 调试？

早期没有好用的调试器时，开发者常用 `alert()` 输出中间值。但这种方式有明显缺点：

- 会阻塞代码执行，改变异步逻辑和计时行为。
- 弹窗多了很难连续观察状态变化。
- 对象会被转成字符串，信息量很少。
- 忘记清理会直接影响生产环境用户。

现代调试更推荐使用控制台、断点、日志系统和明确的错误消息。

## 4. 🤔 控制台有哪些常用日志方法？

主流浏览器都提供 `console` 对象。常用方法包括：

| 方法              | 用途               |
| ----------------- | ------------------ |
| `console.log()`   | 输出普通调试信息。 |
| `console.info()`  | 输出信息性内容。   |
| `console.warn()`  | 输出警告。         |
| `console.error()` | 输出错误。         |

```js
function sum(num1, num2) {
  console.log('进入 sum()', { num1, num2 })

  const result = num1 + num2

  console.log('离开 sum()', { result })

  return result
}
```

控制台日志适合临时观察变量、执行路径和对象结构。生产环境中不应该留下大量调试日志，至少要通过构建工具、日志级别或统一封装控制输出。

## 5. 🤔 控制台运行时是什么？

浏览器控制台可以看作一个和页面 JavaScript 运行时相连的 REPL。你在控制台输入的表达式，会在当前页面上下文中执行。

因此，控制台可以访问全局变量、DOM、浏览器 API，也会受到同源策略和页面运行环境限制。它没有额外特权，只是提供了一个临时执行和观察入口。

开发者工具通常还会提供一些便捷变量。例如在 Elements 面板里选中一个 DOM 节点后，很多浏览器允许在控制台中用 `$0` 引用这个节点。

```js
$0.scrollWidth
$0.remove()
```

这种能力很适合快速验证 DOM 状态、样式计算和事件行为。

## 6. 🤔 如何使用 `debugger` 和断点？

`debugger` 语句会在开发者工具可用时触发断点。

```js
function pauseExecution() {
  console.log('断点前')
  debugger
  console.log('继续后')
}
```

程序停在断点后，你可以：

- 查看当前作用域变量。
- 查看调用栈。
- 单步进入函数。
- 单步跳过当前语句。
- 继续执行。
- 在当前作用域里执行控制台表达式。

除了写 `debugger`，更常见的做法是在开发者工具的 Sources 面板中直接给源码行打断点。这样不需要改代码，也不容易把调试语句带到生产环境。

## 7. 🤔 什么时候需要在页面中打印调试消息？

在某些受限环境中，可能无法打开开发者工具或远程控制台。这时可以把调试信息临时打印到页面中的固定区域。

```js
function pageLog(message) {
  let panel = document.getElementById('debugInfo')

  if (!panel) {
    panel = document.createElement('div')
    panel.id = 'debugInfo'
    panel.style.cssText =
      'position:fixed;right:0;top:0;z-index:9999;padding:8px;background:#fff;border:1px solid #ccc;'
    document.body.append(panel)
  }

  const item = document.createElement('p')
  item.textContent = message
  panel.append(item)
}
```

这种方式只适合临时排查特殊环境问题。调试结束后应删除或通过明确开关关闭，避免泄露内部状态或影响页面布局。

## 8. 🤔 可以包装或扩展 `console` 吗？

可以，但要谨慎。包装 `console` 的常见目的包括统一日志格式、增加时间戳、按环境过滤日志、把错误日志同步上报。

```js
const originalLog = console.log.bind(console)

console.log = (...args) => {
  originalLog('[debug]', ...args)
}
```

包装时要保存原始方法，否则容易出现递归调用。例如在新的 `console.log` 中直接调用 `console.log`，就会无限递归。

实际项目中，更推荐封装自己的 `logger` 模块，而不是直接改全局 `console`。

## 9. 🤔 抛出错误为什么也是调试技术？

清晰的错误消息本身就是调试工具。相比让程序继续产生 `NaN` 或在后续某处报模糊错误，尽早抛出明确错误更容易定位问题。

```js
function divide(num1, num2) {
  if (typeof num1 !== 'number' || typeof num2 !== 'number') {
    throw new TypeError('divide(): both arguments must be numbers')
  }

  return num1 / num2
}
```

大型项目中可以用断言减少重复判断。

```js
function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function divide(num1, num2) {
  assert(typeof num1 === 'number', 'divide(): num1 must be a number')
  assert(typeof num2 === 'number', 'divide(): num2 must be a number')

  return num1 / num2
}
```

断言适合表达代码内部不变量。用户输入错误、网络失败这类正常业务分支，通常不应该简单当作断言失败处理，而应该走业务层的提示和恢复逻辑。
