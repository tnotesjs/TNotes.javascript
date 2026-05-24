# [0217. 没有重载](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0217.%20%E6%B2%A1%E6%9C%89%E9%87%8D%E8%BD%BD)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是传统意义上的函数重载？](#3--什么是传统意义上的函数重载)
- [4. 🤔 为什么 JavaScript 没有这种重载？](#4--为什么-javascript-没有这种重载)
- [5. 🤔 定义两个同名函数会发生什么？](#5--定义两个同名函数会发生什么)
- [6. 🤔 如果确实需要类似重载的行为怎么办？](#6--如果确实需要类似重载的行为怎么办)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 函数签名与重载的关系
- JavaScript 为什么没有传统重载
- 同名函数覆盖
- 用参数数量或类型模拟重载

## 2. 🫧 评价

- JavaScript 没有重载这件事，背后其实是函数参数模型决定的。它没有固定签名，自然也就没有基于签名区分函数版本的机制。

## 3. 🤔 什么是传统意义上的函数重载？

在一些语言中，可以定义多个同名函数，只要它们的参数数量或参数类型不同，语言就能根据函数签名选择要调用的版本。

```java
add(int a, int b)
add(String a, String b)
```

这种能力依赖函数签名。签名通常包含函数名、参数数量和参数类型。

## 4. 🤔 为什么 JavaScript 没有这种重载？

因为 JavaScript 函数没有传统意义上的签名。

调用函数时，参数数量和类型都不会被强制检查。函数接收到的是一组实际传入的值，少传、多传、类型不同都不会阻止调用发生。

所以 JavaScript 无法根据签名区分多个同名函数。

## 5. 🤔 定义两个同名函数会发生什么？

后定义的函数会覆盖先定义的函数。

```js
function addSomeNumber(num) {
  return num + 100
}

function addSomeNumber(num) {
  return num + 200
}

console.log(addSomeNumber(100)) // 300
```

这和下面的函数表达式赋值很接近：

```js
let addSomeNumber = function (num) {
  return num + 100
}

addSomeNumber = function (num) {
  return num + 200
}
```

函数名只是变量，第二次赋值会让变量指向新的函数对象。

## 6. 🤔 如果确实需要类似重载的行为怎么办？

可以在一个函数里根据参数数量或类型分支处理。

```js
function add(value1, value2) {
  if (arguments.length === 1) {
    return value1 + 10
  }

  if (arguments.length === 2) {
    return value1 + value2
  }
}
```

也可以显式判断类型：

```js
function format(value) {
  if (typeof value === 'number') {
    return value.toFixed(2)
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  return value
}
```

这种方式不是语言级重载，而是开发者自己在函数内部实现多分支行为。
