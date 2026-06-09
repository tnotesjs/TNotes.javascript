# [0225. 递归](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0225.%20%E9%80%92%E5%BD%92)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是递归函数？](#3-什么是递归函数)
- [4. 递归为什么会和函数名耦合？](#4-递归为什么会和函数名耦合)
- [5. `arguments.callee` 为什么曾经能解决这个问题？](#5-argumentscallee-为什么曾经能解决这个问题)
- [6. 命名函数表达式为什么更稳？](#6-命名函数表达式为什么更稳)
- [7. 写递归时还要注意什么？](#7-写递归时还要注意什么)

<!-- endregion:toc -->

## 1. 本节内容

- 递归函数的基本形式
- 函数名耦合问题
- `arguments.callee` 的旧方案
- 严格模式下的限制
- 命名函数表达式递归

## 2. 评价

- 递归不是难在函数自己调用自己，而是难在保证这个“自己”始终可靠。函数名可能被改写，所以现代递归更推荐命名函数表达式这类稳定写法。

## 3. 什么是递归函数？

递归函数就是在函数内部调用自身的函数。

最典型的例子是阶乘：

```js
function factorial(number) {
  if (number <= 1) {
    return 1
  }

  return number * factorial(number - 1)
}

console.log(factorial(5)) // 120
```

递归通常需要两个部分：

- 终止条件，避免无限递归。
- 递归步骤，让问题逐渐变小。

## 4. 递归为什么会和函数名耦合？

如果递归时直接写函数名，那么函数逻辑就依赖这个名字始终指向原函数。

```js
let anotherFactorial = factorial
factorial = null

anotherFactorial(4) // TypeError
```

问题出在函数体内部仍然调用 `factorial`。当外部变量 `factorial` 被改写后，递归就断了。

## 5. `arguments.callee` 为什么曾经能解决这个问题？

`arguments.callee` 指向当前正在执行的函数，因此不依赖外部函数名。

```js
function factorial(number) {
  if (number <= 1) {
    return 1
  }

  return number * arguments.callee(number - 1)
}
```

这样无论外部变量名怎么变，函数内部都能找到自己。

但严格模式禁止访问 `arguments.callee`，所以这不是现代代码推荐方案。

## 6. 命名函数表达式为什么更稳？

命名函数表达式可以给函数内部提供一个稳定名称。

```js
const factorial = function f(number) {
  if (number <= 1) {
    return 1
  }

  return number * f(number - 1)
}
```

这里外部变量叫 `factorial`，内部递归使用的是函数表达式自己的名称 `f`。

即使把函数赋值给别的变量，`f` 仍然可在函数内部使用。

```js
const anotherFactorial = factorial

console.log(anotherFactorial(5)) // 120
```

这也是严格模式和非严格模式下都更稳的递归写法。

## 7. 写递归时还要注意什么？

递归代码要格外关注两个问题。

第一，终止条件必须可靠，否则会无限递归直到栈溢出。

第二，递归深度可能很大时，要考虑是否改成循环，或者改写成满足尾调用优化条件的形式。

递归适合表达树、分治、回溯等天然递归结构，但不是所有循环都值得改写成递归。
