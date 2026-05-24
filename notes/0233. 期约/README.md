# [0233. 期约](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0233.%20%E6%9C%9F%E7%BA%A6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `Promise` 是什么？](#3--promise-是什么)
- [4. 🤔 期约有哪些状态？](#4--期约有哪些状态)
- [5. 🤔 执行器函数做什么？](#5--执行器函数做什么)
- [6. 🤔 `Promise.resolve()` 和 `Promise.reject()` 有什么区别？](#6--promiseresolve-和-promisereject-有什么区别)
- [7. 🤔 `then()` 如何工作？](#7--then-如何工作)
- [8. 🤔 `catch()` 和 `finally()` 各自适合什么？](#8--catch-和-finally-各自适合什么)
- [9. 🤔 什么是非重入？](#9--什么是非重入)
- [10. 🤔 期约错误为什么不能靠同步 `try...catch` 捕获？](#10--期约错误为什么不能靠同步-trycatch-捕获)
- [11. 🤔 期约连锁如何解决嵌套回调？](#11--期约连锁如何解决嵌套回调)
- [12. 🤔 `Promise.all()` 和 `Promise.race()` 有什么区别？](#12--promiseall-和-promiserace-有什么区别)
- [13. 🤔 期约支持取消和进度通知吗？](#13--期约支持取消和进度通知吗)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `Promise` 的来源和定位
- 期约状态机
- 执行器函数与状态转换
- `Promise.resolve()` 和 `Promise.reject()`
- `then()`、`catch()`、`finally()`
- 非重入和处理程序顺序
- 解决值、拒绝理由和错误处理
- 期约连锁与期约合成
- `Promise.all()` 和 `Promise.race()`
- 期约取消与进度通知的边界

## 2. 🫧 评价

- 期约的难点不在 API 数量，而在状态、队列和返回新期约这三件事。只要抓住这三条线，`Promise` 的大部分行为都会变得可预测。

## 3. 🤔 `Promise` 是什么？

`Promise` 可以理解为一个尚未可用结果的替身。它用一个对象表示异步操作的最终结果，让你可以围绕这个对象添加成功、失败和清理逻辑。

```js
const promise = new Promise((resolve) => {
  setTimeout(() => resolve(3), 1000)
})

promise.then((value) => {
  console.log(value) // 3
})
```

ES6 正式加入 `Promise`，并以 Promises/A+ 规范为基础。现代浏览器和很多 Web API 都把期约作为异步结果的标准表达方式。

## 4. 🤔 期约有哪些状态？

一个期约内部有状态机，状态只能是下面三种之一：

| 状态        | 含义                 |
| ----------- | -------------------- |
| `pending`   | 待定，尚未落定       |
| `fulfilled` | 已兑现，代表操作成功 |
| `rejected`  | 已拒绝，代表操作失败 |

期约从 `pending` 开始，只能落定为 `fulfilled` 或 `rejected`。一旦落定，状态就不可逆，也不会再改变。

期约状态是私有的。你不能用同步代码直接读取或修改它，只能通过处理程序等待状态变化。

## 5. 🤔 执行器函数做什么？

创建期约时需要传入执行器函数。执行器会立即同步执行，它接收两个函数：`resolve` 和 `reject`。

```js
const promise = new Promise((resolve, reject) => {
  const success = true

  if (success) {
    resolve('ok')
  } else {
    reject(new Error('failed'))
  }
})
```

`resolve()` 会尝试把期约切换到兑现状态，`reject()` 会尝试把期约切换到拒绝状态。

状态只能改变一次，所以后续重复调用会被忽略。

```js
const promise = new Promise((resolve, reject) => {
  resolve('first')
  reject(new Error('second'))
})

promise.then(console.log) // first
```

执行器同步执行，但处理程序异步执行，这是理解期约顺序的第一道门槛。

## 6. 🤔 `Promise.resolve()` 和 `Promise.reject()` 有什么区别？

`Promise.resolve()` 会返回一个兑现期约。如果传入的值本身就是期约，它会直接复用这个期约。

```js
const promise = Promise.resolve(3)

promise.then(console.log) // 3
```

`Promise.reject()` 会返回一个拒绝期约，拒绝理由就是传入的第一个参数。

```js
Promise.reject(new Error('failed')).catch((error) => {
  console.error(error.message)
})
```

需要注意的是，`Promise.resolve(new Error('x'))` 仍然是一个兑现期约，只是兑现值刚好是错误对象。只有抛出错误、调用 `reject()` 或返回拒绝期约，才会进入拒绝流程。

## 7. 🤔 `then()` 如何工作？

`then()` 是添加期约处理程序的主要方法。它最多接收两个参数：兑现处理程序和拒绝处理程序。

```js
promise.then(
  (value) => console.log('fulfilled', value),
  (reason) => console.error('rejected', reason),
)
```

更重要的是，`then()` 总会返回一个新的期约。

```js
Promise.resolve(1)
  .then((value) => value + 1)
  .then((value) => value + 1)
  .then(console.log) // 3
```

处理程序的返回值会被 `Promise.resolve()` 包装成新期约的结果。

如果处理程序抛出错误，新期约会变成拒绝状态。

```js
Promise.resolve()
  .then(() => {
    throw new Error('boom')
  })
  .catch((error) => console.error(error.message))
```

## 8. 🤔 `catch()` 和 `finally()` 各自适合什么？

`catch()` 是 `then(null, onRejected)` 的语法糖，专门用于添加拒绝处理程序。

```js
fetch('/api/user')
  .then((response) => response.json())
  .catch((error) => console.error(error))
```

`finally()` 用于添加无论成功还是失败都会执行的清理逻辑。

```js
let loading = true

fetch('/api/user')
  .catch(console.error)
  .finally(() => {
    loading = false
  })
```

`finally()` 不接收兑现值或拒绝理由，通常不要在里面写依赖结果的逻辑。它更适合关闭加载状态、释放资源、恢复按钮状态等收尾操作。

## 9. 🤔 什么是非重入？

期约处理程序不会在当前同步调用栈里立即执行，而是会被排期到当前同步代码之后。

```js
Promise.resolve().then(() => console.log('promise'))

console.log('sync')

// sync
// promise
```

即使期约已经兑现，`then()` 里的处理程序也不会同步插队执行。

这个特性叫非重入。它让期约处理程序的执行时机更稳定，也避免了同步代码执行到一半时被期约回调打断。

如果同一个期约上添加多个处理程序，它们会按照添加顺序执行。

```js
const promise = Promise.resolve()

promise.then(() => console.log(1))
promise.then(() => console.log(2))
```

## 10. 🤔 期约错误为什么不能靠同步 `try...catch` 捕获？

拒绝期约表示异步错误。它不会抛回当前同步调用栈，因此同步 `try...catch` 捕获不到。

```js
try {
  Promise.reject(new Error('failed'))
} catch (error) {
  console.error('这里不会执行')
}
```

应该使用拒绝处理程序：

```js
Promise.reject(new Error('failed')).catch((error) => {
  console.error(error.message)
})
```

在期约执行器或处理程序内部抛出错误，会让对应期约进入拒绝状态。

```js
Promise.resolve()
  .then(() => {
    throw new Error('failed')
  })
  .catch((error) => console.error(error.message))
```

拒绝理由理论上可以是任何值，但实际开发中最好使用 `Error` 对象，这样调试时能保留更有用的栈信息。

## 11. 🤔 期约连锁如何解决嵌套回调？

因为 `then()`、`catch()`、`finally()` 都返回新期约，所以可以把多个异步步骤串起来。

```js
function delayLog(text) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(text)
      resolve()
    }, 1000)
  })
}

delayLog('first')
  .then(() => delayLog('second'))
  .then(() => delayLog('third'))
```

每一步返回的期约会决定下一步什么时候继续。这样就可以把原本层层嵌套的回调写成线性的链式结构。

期约连锁也可以像函数合成一样连续传值：

```js
const addTwo = (value) => value + 2
const addThree = (value) => value + 3
const addFive = (value) => value + 5

Promise.resolve(8).then(addTwo).then(addThree).then(addFive).then(console.log) // 18
```

## 12. 🤔 `Promise.all()` 和 `Promise.race()` 有什么区别？

`Promise.all()` 用于等待一组期约全部兑现。

```js
Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]).then(
  (values) => {
    console.log(values) // [1, 2, 3]
  },
)
```

只要其中一个期约拒绝，`Promise.all()` 返回的期约就会拒绝，拒绝理由来自第一个拒绝的期约。

`Promise.race()` 关注最先落定的期约。无论第一个落定的是兑现还是拒绝，它都会跟随这个结果。

```js
Promise.race([
  new Promise((resolve) => setTimeout(resolve, 1000, 'slow')),
  Promise.resolve('fast'),
]).then(console.log) // fast
```

可以简单记：`all()` 等全部成功，`race()` 看谁先结束。

## 13. 🤔 期约支持取消和进度通知吗？

ES6 原生期约不直接支持取消，也不支持进度通知。期约一旦开始执行，语言层面没有标准方法强制停止它。

书中提到可以用取消令牌一类的封装模拟取消，也可以扩展期约实现进度通知。但这些方案会让期约连锁和期约合成变复杂。

现代项目中，如果某个 API 原生支持取消，通常优先使用它自己的取消机制。例如 `fetch()` 可以配合 `AbortController`。

```js
const controller = new AbortController()

fetch('/api/user', {
  signal: controller.signal,
}).catch((error) => {
  console.error(error.name)
})

controller.abort()
```

也就是说，期约负责表达异步结果；取消、进度、重试这些能力通常由更上层的协议或业务封装提供。
