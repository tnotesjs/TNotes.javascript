# [0232. 异步编程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0232.%20%E5%BC%82%E6%AD%A5%E7%BC%96%E7%A8%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 同步和异步有什么区别？](#3--同步和异步有什么区别)
- [4. 🤔 为什么 JavaScript 需要异步编程？](#4--为什么-javascript-需要异步编程)
- [5. 🤔 早期如何拿到异步返回值？](#5--早期如何拿到异步返回值)
- [6. 🤔 异步失败如何处理？](#6--异步失败如何处理)
- [7. 🤔 什么是回调地狱？](#7--什么是回调地狱)
- [8. 🤔 期约为什么是下一步？](#8--期约为什么是下一步)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 同步行为与异步行为
- 单线程事件循环中的异步任务
- 通过回调接收异步结果
- 成功回调与失败回调
- 嵌套回调和回调地狱
- 为什么需要期约

## 2. 🫧 评价

- 异步编程这一节的重点不是背事件循环术语，而是先建立一个直觉：异步结果不会在当前调用栈里出现，必须通过未来的某次调度接回来。

## 3. 🤔 同步和异步有什么区别？

同步行为会按代码顺序一步步执行。前一条语句完成后，后一条语句才能继续。

```js
let value = 3
value = value + 4

console.log(value) // 7
```

这段代码很好推断：执行完第二行后，`value` 立即变成 `7`。

异步行为则不同。它会把某段代码安排到未来执行，当前调用栈不会等待这个结果。

```js
let value = 3

setTimeout(() => {
  value = value + 4
  console.log(value)
}, 1000)

console.log(value) // 3
```

`setTimeout()` 只是安排回调，并不会立刻执行回调。当前同步代码会继续往下走。

## 4. 🤔 为什么 JavaScript 需要异步编程？

JavaScript 经常运行在单线程环境中。如果网络请求、计时器、文件读取或用户交互都用同步方式等待，主线程就会被占住。

异步编程允许你把暂时没有结果的任务交给运行时调度，当前代码先继续执行。等结果可用时，运行时再把对应回调或任务放回队列等待执行。

这让 JavaScript 可以在等待高延迟任务时继续响应用户操作和执行其他逻辑。

## 5. 🤔 早期如何拿到异步返回值？

早期最常见的方式是把回调函数传给异步操作。等结果可用后，由异步操作调用这个回调。

```js
function double(value, callback) {
  setTimeout(() => {
    callback(value * 2)
  }, 1000)
}

double(3, (result) => {
  console.log(result) // 6
})
```

这里 `double()` 本身不会返回最终计算结果。真正的结果只会在一秒后传给 `callback`。

这也说明了异步代码的核心限制：需要异步结果的代码，必须放到能接收这个结果的位置。

## 6. 🤔 异步失败如何处理？

回调模式里，失败处理通常通过额外的失败回调完成。

```js
function double(value, success, failure) {
  setTimeout(() => {
    if (typeof value !== 'number') {
      failure(new TypeError('value 必须是数字'))
      return
    }

    success(value * 2)
  }, 1000)
}

double(
  3,
  (result) => console.log(result),
  (error) => console.error(error),
)
```

这种写法把成功和失败分开了，但也带来一个问题：每个异步操作都需要约定回调参数和错误传递方式。

不同库如果约定不一致，代码就很难组合。

## 7. 🤔 什么是回调地狱？

如果后一个异步操作依赖前一个异步操作的结果，就会出现嵌套回调。

```js
double(
  3,
  (first) => {
    double(
      first,
      (second) => {
        double(
          second,
          (third) => {
            console.log(third)
          },
          console.error,
        )
      },
      console.error,
    )
  },
  console.error,
)
```

嵌套层数越多，代码越难阅读，错误处理也会到处重复。这种结构通常被称为回调地狱。

它的根本问题不是缩进难看，而是控制流被塞进了层层回调里：顺序、错误、返回值和组合关系都不再直观。

## 8. 🤔 期约为什么是下一步？

期约把异步结果封装成对象，让你可以在异步操作开始之后再添加处理程序。

```js
function double(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof value !== 'number') {
        reject(new TypeError('value 必须是数字'))
        return
      }

      resolve(value * 2)
    }, 1000)
  })
}

double(3)
  .then((first) => double(first))
  .then((second) => double(second))
  .then(console.log)
  .catch(console.error)
```

这段代码仍然是异步的，但流程已经从嵌套变成了链式结构。

简单来说，回调让异步任务在未来通知你，期约让未来结果本身成为一个可以传递、连锁和组合的值。
