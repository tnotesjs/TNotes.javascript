# [0227. 闭包](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0227.%20%E9%97%AD%E5%8C%85)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是闭包？](#3--什么是闭包)
- [4. 🤔 闭包为什么能保留外层变量？](#4--闭包为什么能保留外层变量)
- [5. 🤔 闭包为什么可能占用更多内存？](#5--闭包为什么可能占用更多内存)
- [6. 🤔 闭包中的 `this` 为什么容易出错？](#6--闭包中的-this-为什么容易出错)
- [7. 🤔 闭包和内存泄漏有什么关系？](#7--闭包和内存泄漏有什么关系)
- [8. 🤔 闭包适合用在哪些地方？](#8--闭包适合用在哪些地方)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 闭包的定义
- 作用域链保留
- 闭包与内存占用
- 闭包中的 `this`
- 闭包与旧版 IE 内存泄漏
- 使用闭包的实践边界

## 2. 🫧 评价

- 闭包是 JavaScript 最重要也最容易被神化的概念之一。它的本质并不玄：函数引用了外层作用域的变量，于是那部分作用域需要继续活着。

## 3. 🤔 什么是闭包？

闭包是指引用了另一个函数作用域中变量的函数。

```js
function createAdder(step) {
  return function (value) {
    return value + step
  }
}

const add10 = createAdder(10)

console.log(add10(5)) // 15
```

这里内部函数引用了外部函数的 `step`。即使 `createAdder()` 已经执行完，`step` 仍然不会立刻销毁，因为返回出去的函数还要用它。

## 4. 🤔 闭包为什么能保留外层变量？

函数创建时会保存作用域链。内部函数的作用域链中包含外部函数的活动对象。

当内部函数被返回并在外部继续使用时，它仍然持有对外部活动对象的引用。

```js
function createComparisonFunction(propertyName) {
  return function (object1, object2) {
    const value1 = object1[propertyName]
    const value2 = object2[propertyName]

    return value1 > value2 ? 1 : value1 < value2 ? -1 : 0
  }
}
```

返回的比较函数仍然能访问 `propertyName`，这就是闭包产生的效果。

## 5. 🤔 闭包为什么可能占用更多内存？

普通函数执行结束后，局部作用域通常可以被销毁。

闭包会让相关外层作用域继续留在内存中，直到闭包本身不再被引用。

```js
let compareByName = createComparisonFunction('name')

// 使用完后解除引用
compareByName = null
```

这不是说闭包不能用，而是说不要无意识地让闭包长期引用大量不再需要的数据。

## 6. 🤔 闭包中的 `this` 为什么容易出错？

`this` 不是普通词法变量。非箭头函数的 `this` 取决于调用方式。

```js
globalThis.identity = 'global'

const object = {
  identity: 'object',
  getIdentityFunc() {
    return function () {
      return this.identity
    }
  },
}

console.log(object.getIdentityFunc()()) // global
```

返回的函数被普通调用时，`this` 不再指向 `object`。

如果想保留外层 `this`，可以提前保存引用，或直接使用箭头函数。

```js
const object = {
  identity: 'object',
  getIdentityFunc() {
    return () => this.identity
  },
}
```

## 7. 🤔 闭包和内存泄漏有什么关系？

闭包本身不是内存泄漏，但闭包可能让一些对象继续被引用，导致它们无法回收。

旧版 IE 中，闭包引用 DOM 元素尤其容易因为不同垃圾回收机制而出问题。

```js
function assignHandler() {
  let element = document.getElementById('someElement')
  const id = element.id

  element.onclick = () => console.log(id)

  element = null
}
```

这里把需要的信息 `id` 单独保存，再解除对 DOM 元素的引用，可以降低长期持有 DOM 对象的风险。

现代浏览器的垃圾回收已经好很多，但闭包仍然应该只保留必要状态。

## 8. 🤔 闭包适合用在哪些地方？

闭包常见用途包括：

- 保存函数工厂的配置。
- 创建私有变量。
- 延迟执行时保留上下文。
- 在回调中记住某次循环或某次调用的状态。

它不是神秘技巧，而是一种让函数携带外层状态的语言能力。写闭包时最重要的是明确：这个函数到底需要记住什么，以及这些记住的东西什么时候可以释放。
