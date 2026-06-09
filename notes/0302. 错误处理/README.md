# [0302. 错误处理](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0302.%20%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `try/catch` 如何捕获异常？](#3-trycatch-如何捕获异常)
- [4. `finally` 有什么特殊之处？](#4-finally-有什么特殊之处)
- [5. 常见错误类型有哪些？](#5-常见错误类型有哪些)
- [6. 什么时候适合使用 `try/catch`？](#6-什么时候适合使用-trycatch)
- [7. `throw` 应该抛出什么？](#7-throw-应该抛出什么)
- [8. 如何定义自定义错误类型？](#8-如何定义自定义错误类型)
- [9. 抛出错误和捕获错误如何分工？](#9-抛出错误和捕获错误如何分工)
- [10. `window.onerror` 可以做什么？](#10-windowonerror-可以做什么)
- [11. 如何识别常见错误来源？](#11-如何识别常见错误来源)
- [12. 如何区分重大错误和非重大错误？](#12-如何区分重大错误和非重大错误)
- [13. 为什么要把错误记录到服务器？](#13-为什么要把错误记录到服务器)

<!-- endregion:toc -->

## 1. 本节内容

- `try/catch` 和 `finally`
- 内置错误类型和错误对象属性
- `throw` 与自定义错误
- `window.onerror` 和资源错误事件
- 错误处理策略、错误识别和错误分级
- 把前端错误记录到服务器

## 2. 评价

- 错误处理写得好不好，差别往往不在代码是否报错，而在报错之后用户还能不能继续做事、开发者能不能快速知道发生了什么。

## 3. `try/catch` 如何捕获异常？

`try/catch` 用于捕获同步代码中抛出的异常。

```js
try {
  window.someNonexistentFunction()
} catch (error) {
  console.log(error.message)
}
```

如果 `try` 块中出现错误，后续代码会停止执行，并跳到 `catch` 块。`catch` 接收到的 `error` 通常至少包含 `message` 和 `name`。

不同浏览器可能额外提供不同字段，例如文件名、行号、内部错误码、栈信息等。为了跨浏览器稳定，基础逻辑不要只依赖某个浏览器专有字段。

## 4. `finally` 有什么特殊之处？

`finally` 无论是否发生错误都会执行，常用于释放资源、恢复状态、关闭加载中标记等清理工作。

```js
function loadUser() {
  showLoading()

  try {
    return fetchUser()
  } catch (error) {
    reportError(error)
    return null
  } finally {
    hideLoading()
  }
}
```

要特别注意：如果 `finally` 中写了 `return`，它会覆盖 `try` 或 `catch` 中的返回值。

```js
function testFinally() {
  try {
    return 2
  } finally {
    return 0
  }
}

console.log(testFinally()) // 0
```

所以，`finally` 最好只做清理，不要在里面改变正常控制流。

## 5. 常见错误类型有哪些？

ECMAScript 定义了多种错误类型，它们都继承自 `Error`。

| 错误类型         | 常见原因                                     |
| ---------------- | -------------------------------------------- |
| `Error`          | 通用错误，常用于自定义错误。                 |
| `TypeError`      | 值不是预期类型，或访问了不存在的方法。       |
| `ReferenceError` | 引用了不存在的变量。                         |
| `RangeError`     | 数值超出允许范围。                           |
| `SyntaxError`    | 语法错误，常见于动态解析代码时。             |
| `URIError`       | URI 编码或解码参数不合法。                   |
| `EvalError`      | 与 `eval()` 调用方式相关，现代代码很少遇到。 |
| `InternalError`  | 引擎内部错误，部分浏览器支持。               |

可以用 `instanceof` 区分错误类型：

```js
try {
  runTask()
} catch (error) {
  if (error instanceof TypeError) {
    handleTypeError(error)
  } else if (error instanceof ReferenceError) {
    handleReferenceError(error)
  } else {
    handleUnknownError(error)
  }
}
```

相比解析 `message`，检查错误类型更稳定。错误消息经常会因浏览器、语言环境和版本不同而变化。

## 6. 什么时候适合使用 `try/catch`？

`try/catch` 适合处理你无法完全控制、但知道如何恢复的错误。

例如：

- 调用第三方库，库可能抛出异常。
- 解析外部输入，输入可能不符合格式。
- 执行可选功能，失败后可以降级。
- 初始化独立模块，某个模块失败不应该影响其他模块。

不适合滥用 `try/catch` 掩盖自己代码里的可预防错误。如果你知道某个函数要求参数必须是数组，就应该先验证参数，而不是等它报错。

```js
function reverseSort(values) {
  if (!Array.isArray(values)) {
    return []
  }

  return [...values].sort().reverse()
}
```

能用条件判断提前避免的错误，优先提前避免；真正无法避免或无法控制的错误，再交给 `try/catch`。

## 7. `throw` 应该抛出什么？

`throw` 可以抛出任意值，但实际项目中应该优先抛出 `Error` 或其子类。

```js
throw new Error('process(): argument must be an array')
```

这样可以保留错误名称、消息和调用栈，便于调试和上报。

对于可复用库或底层工具函数，抛出清晰错误尤其重要：

```js
function process(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('process(): values must be an array')
  }

  values.sort()

  return values.find((value) => value > 100) ?? -1
}
```

错误消息最好包含函数名和失败原因。这样当错误出现在大型应用里时，定位成本会低很多。

## 8. 如何定义自定义错误类型？

当应用需要表达更具体的错误语义时，可以继承 `Error`。

```js
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

throw new ValidationError('用户名不能为空', 'username')
```

自定义错误适合：

- 表单验证错误。
- 权限错误。
- 业务规则错误。
- 网络协议错误。
- SDK 或工具库中的可识别错误。

底层负责抛出带上下文的错误，上层负责决定怎么展示、重试、降级或上报。

## 9. 抛出错误和捕获错误如何分工？

一个实用原则是：底层抛出，上层捕获。

底层函数知道哪里失败了，因此适合抛出详细错误。上层业务知道用户正在做什么，因此适合决定错误发生后该怎么办。

例如，工具函数只负责说明参数不对：

```js
function parseConfig(text) {
  if (typeof text !== 'string') {
    throw new TypeError('parseConfig(): text must be a string')
  }

  return JSON.parse(text)
}
```

页面逻辑负责捕获并给用户提示：

```js
try {
  const config = parseConfig(input.value)
  saveConfig(config)
} catch (error) {
  showToast('配置格式不正确，请检查后重试。')
  reportError(error)
}
```

只有当你确切知道如何处理错误时才捕获。只是为了让错误消失而捕获，通常会制造更隐蔽的问题。

## 10. `window.onerror` 可以做什么？

没有被 `try/catch` 捕获的运行时错误会触发 `window.onerror`。

```js
window.onerror = function (message, source, line, column, error) {
  reportError({
    message,
    source,
    line,
    column,
    stack: error?.stack,
  })

  return false
}
```

它适合作为最后一道防线，用来记录未处理错误。不要把它当成正常业务错误处理方式。

资源加载也有 `error` 事件，例如图片加载失败：

```js
const image = new Image()

image.addEventListener('load', () => {
  console.log('图片加载完成')
})

image.addEventListener('error', () => {
  console.log('图片加载失败')
})

image.src = '/missing-image.png'
```

资源错误和运行时错误不是同一种问题，处理方式也不同。前者通常要替换资源、展示占位或重试；后者通常要记录异常、降级功能或提示用户。

## 11. 如何识别常见错误来源？

书中重点提醒了三类常见错误来源。

第一类是类型转换错误。比如 `==` 会自动转换类型，`if (value)` 会把任意值转换为布尔值。为了减少意外，现代代码通常优先使用 `===` 和 `!==`，并让条件表达式明确返回布尔值。

```js
if (typeof str3 === 'string') {
  result += str3
}
```

第二类是数据类型错误。JavaScript 不会自动验证函数参数，所以对外 API 要主动检查输入。

```js
function getQueryString(url) {
  if (typeof url !== 'string') {
    return ''
  }

  const index = url.indexOf('?')

  return index > -1 ? url.slice(index + 1) : ''
}
```

第三类是通信错误。拼接 URL、发送请求、解析响应时都可能出错。查询字符串中的参数值应该使用 `encodeURIComponent()` 编码。

```js
function addQueryStringArg(url, name, value) {
  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}${encodeURIComponent(name)}=${encodeURIComponent(value)}`
}
```

这些错误都可以通过静态分析、类型系统、代码检查、参数校验和统一工具函数提前减少。

## 12. 如何区分重大错误和非重大错误？

错误是否重大，主要看它对用户目标的影响。

非重大错误通常具备这些特点：

- 不影响用户主要任务。
- 只影响页面局部区域。
- 可以恢复。
- 重试可能成功。

重大错误通常具备这些特点：

- 应用无法继续运行。
- 用户主要目标被阻断。
- 可能引发连锁错误。

代码结构会影响错误严重程度。如果多个独立模块顺序初始化，其中一个模块失败就阻止后续模块初始化，那本来局部的错误就会被放大。

```js
for (const module of modules) {
  try {
    module.init()
  } catch (error) {
    reportError(error)
    markModuleUnavailable(module)
  }
}
```

这样每个模块的错误都被限制在自己的范围内，不会拖垮整个页面。

## 13. 为什么要把错误记录到服务器？

用户遇到前端错误后，通常不会告诉你完整环境、操作步骤和错误堆栈。把关键错误记录到服务器，可以让团队分析错误频率、影响范围和根因。

最小的错误上报通常包括：

- 错误类型和消息。
- 调用栈。
- 页面 URL。
- 浏览器和设备信息。
- 用户操作上下文。
- 错误严重程度。

早期常用创建 `Image` 对象的方式发送日志，因为兼容性好、实现简单，也不依赖 Ajax 库。

```js
function logError(level, message) {
  const image = new Image()
  const query = new URLSearchParams({ level, message })

  image.src = `/log-error?${query.toString()}`
}
```

现代项目也可以使用 `fetch()`、`navigator.sendBeacon()` 或专门的监控 SDK。关键不是具体传输方式，而是错误数据要有足够上下文，并且上报本身尽量不要影响用户操作。
