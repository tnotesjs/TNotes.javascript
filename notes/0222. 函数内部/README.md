# [0222. 函数内部](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0222.%20%E5%87%BD%E6%95%B0%E5%86%85%E9%83%A8)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 函数内部有哪些特殊信息？](#3-函数内部有哪些特殊信息)
- [4. `arguments.callee` 是什么？](#4-argumentscallee-是什么)
- [5. 标准函数中的 `this` 怎么确定？](#5-标准函数中的-this-怎么确定)
- [6. 箭头函数中的 `this` 为什么不同？](#6-箭头函数中的-this-为什么不同)
- [7. `caller` 有什么用？](#7-caller-有什么用)
- [8. `new.target` 能解决什么问题？](#8-newtarget-能解决什么问题)

<!-- endregion:toc -->

## 1. 本节内容

- `arguments` 与 `arguments.callee`
- 标准函数中的 `this`
- 箭头函数中的词法 `this`
- `caller` 属性
- `new.target` 判断构造调用

## 2. 评价

- 函数内部这一节是在讲调用现场。参数从哪来、`this` 指向谁、函数是谁调用的、是不是通过 `new` 调用，这些都要到运行时才能真正确定。

## 3. 函数内部有哪些特殊信息？

非箭头函数内部通常可以接触到几个特殊信息：

- `arguments`：本次调用实际传入的参数。
- `this`：当前调用上下文。
- `caller`：调用当前函数的函数。
- `new.target`：函数是否通过 `new` 调用。

其中 `arguments` 和 `this` 最常用，`caller` 和 `arguments.callee` 因为严格模式限制和可维护性问题，现代代码里应尽量少用。

## 4. `arguments.callee` 是什么？

`arguments.callee` 指向当前正在执行的函数。

早期代码常用它来让递归函数摆脱对函数名的硬编码依赖。

```js
function factorial(number) {
  if (number <= 1) {
    return 1
  }

  return number * arguments.callee(number - 1)
}
```

不过严格模式下不能访问 `arguments.callee`。现代代码更推荐使用命名函数表达式解决递归引用问题。

## 5. 标准函数中的 `this` 怎么确定？

标准函数的 `this` 取决于调用方式，而不是定义位置。

```js
globalThis.color = 'red'

const object = {
  color: 'blue',
}

function sayColor() {
  console.log(this.color)
}

sayColor() // red

object.sayColor = sayColor
object.sayColor() // blue
```

同一个函数，在不同调用方式下，`this` 可以完全不同。

在严格模式下，普通函数如果没有明确调用者，`this` 不会自动指向全局对象，而是 `undefined`。

## 6. 箭头函数中的 `this` 为什么不同？

箭头函数没有自己的 `this`。它会使用定义时外层作用域的 `this`。

```js
function Timer() {
  this.count = 0

  setTimeout(() => {
    this.count++
    console.log(this.count)
  }, 1000)
}

new Timer()
```

这让箭头函数适合写回调，尤其适合需要保留外层 `this` 的回调。

但如果需要调用时动态决定 `this`，就不要用箭头函数。

## 7. `caller` 有什么用？

函数对象的 `caller` 属性会引用调用当前函数的函数。如果当前函数是在全局作用域中调用的，通常为 `null`。

```js
function outer() {
  inner()
}

function inner() {
  console.log(inner.caller)
}

outer()
```

这个能力可以观察调用关系，但不适合作为正常业务逻辑依赖。严格模式下访问相关属性会受到限制，主要是为了减少安全和优化上的问题。

## 8. `new.target` 能解决什么问题？

`new.target` 可以判断函数是不是通过 `new` 调用的。

```js
function User(name) {
  if (!new.target) {
    throw new TypeError('User 必须使用 new 调用')
  }

  this.name = name
}

new User('Jake')
User('Jake') // TypeError
```

如果函数是普通调用，`new.target` 是 `undefined`；如果通过 `new` 调用，它会引用被调用的构造函数。

这个特性常用于构造函数防误用，也可以用于抽象基类之类的约束。
