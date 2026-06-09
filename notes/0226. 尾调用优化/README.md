# [0226. 尾调用优化](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0226.%20%E5%B0%BE%E8%B0%83%E7%94%A8%E4%BC%98%E5%8C%96)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是尾调用？](#3-什么是尾调用)
- [4. 尾调用优化优化的是什么？](#4-尾调用优化优化的是什么)
- [5. 尾调用优化需要满足哪些条件？](#5-尾调用优化需要满足哪些条件)
- [6. 哪些写法看起来像尾调用但不能优化？](#6-哪些写法看起来像尾调用但不能优化)
- [7. 递归如何改写成尾调用形式？](#7-递归如何改写成尾调用形式)

<!-- endregion:toc -->

## 1. 本节内容

- 尾调用的含义
- 尾调用优化的栈帧复用
- 尾调用优化的条件
- 不满足优化的写法
- 递归函数的尾调用改写

## 2. 评价

- 尾调用优化是一种很漂亮的内存优化，但实际写代码时不能只凭“最后一行调用了函数”来判断。关键是外层函数返回后是否还需要保留自己的栈帧。

## 3. 什么是尾调用？

尾调用指一个函数的最后一步操作是返回另一个函数的调用结果。

```js
function outer() {
  return inner()
}
```

这里 `inner()` 的返回值就是 `outer()` 的返回值，`outer()` 在调用 `inner()` 之后没有额外工作要做。

## 4. 尾调用优化优化的是什么？

普通函数调用会创建新的栈帧。如果外层函数还要等待内层函数返回，那么外层函数的栈帧就得保留。

尾调用优化的思路是：如果外层函数已经没有后续工作，JavaScript 引擎可以先丢弃外层栈帧，再进入内层函数。

这样连续尾调用时，栈空间不会随着调用层数线性增长。

这个优化在递归场景尤其有意义，因为递归最容易产生大量栈帧。

## 5. 尾调用优化需要满足哪些条件？

常见条件包括：

- 代码在严格模式下执行。
- 外层函数直接返回尾调用函数的调用结果。
- 尾调用返回之后没有额外逻辑。
- 尾调用函数不是引用外层函数自由变量的闭包。

满足条件的例子：

```js
'use strict'

function outer(a, b) {
  return inner(a + b)
}
```

不满足条件的例子：

```js
function outer() {
  return inner().toString()
}
```

这里 `inner()` 返回后还要执行 `.toString()`，所以外层函数栈帧不能提前丢弃。

## 6. 哪些写法看起来像尾调用但不能优化？

下面几种都不符合条件：

```js
function outer() {
  inner()
}
```

没有直接返回内层函数结果。

```js
function outer() {
  const result = inner()
  return result
}
```

内层函数结果还要先保存到局部变量。

```js
function outer() {
  const value = 1

  function inner() {
    return value
  }

  return inner()
}
```

这里 `inner` 是闭包，引用了外层函数作用域中的变量。

## 7. 递归如何改写成尾调用形式？

普通斐波那契递归不适合尾调用优化：

```js
function fib(number) {
  if (number < 2) {
    return number
  }

  return fib(number - 1) + fib(number - 2)
}
```

因为最后一步是加法，不是直接返回某个递归调用。

可以把中间状态通过参数传递，让递归调用成为最后一步。

```js
'use strict'

function fib(number) {
  return fibImpl(0, 1, number)
}

function fibImpl(a, b, number) {
  if (number === 0) {
    return a
  }

  return fibImpl(b, a + b, number - 1)
}
```

这个版本把累计状态放进参数里，最后一步直接返回递归调用结果，更接近尾调用优化要求。

不过实际项目中仍要注意浏览器和运行时支持情况，不能把尾调用优化当成所有环境都可观测、可依赖的性能保证。
