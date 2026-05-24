# [0221. 函数作为值](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0221.%20%E5%87%BD%E6%95%B0%E4%BD%9C%E4%B8%BA%E5%80%BC)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 函数为什么可以作为值使用？](#3--函数为什么可以作为值使用)
- [4. 🤔 怎样把函数作为参数传递？](#4--怎样把函数作为参数传递)
- [5. 🤔 怎样从函数中返回函数？](#5--怎样从函数中返回函数)
- [6. 🤔 排序比较函数为什么是典型例子？](#6--排序比较函数为什么是典型例子)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 函数名作为变量
- 函数作为参数传递
- 函数作为返回值返回
- 高阶函数的基本思想
- 动态创建比较函数

## 2. 🫧 评价

- 函数作为值是 JavaScript 抽象能力的核心入口。你能把函数传进去，也能把函数返回出来，很多回调、排序、组合和闭包模式都从这里开始。

## 3. 🤔 函数为什么可以作为值使用？

因为函数本身是对象，函数名只是保存函数对象引用的变量。

这意味着函数可以出现在任何普通值可以出现的位置：

- 赋值给变量
- 作为参数传入函数
- 作为返回值从函数返回
- 存在对象属性或数组元素中

```js
function add10(number) {
  return number + 10
}

const fn = add10

console.log(fn(5)) // 15
```

## 4. 🤔 怎样把函数作为参数传递？

把函数作为参数传递时，传的是函数引用，不是函数调用结果。

```js
function callSomeFunction(fn, value) {
  return fn(value)
}

function add10(number) {
  return number + 10
}

console.log(callSomeFunction(add10, 10)) // 20
```

注意这里传入的是 `add10`，不是 `add10()`。如果写成 `add10()`，传入的就是函数执行后的结果。

这种模式就是回调函数的基础。

## 5. 🤔 怎样从函数中返回函数？

函数也可以创建并返回另一个函数。

```js
function createAdder(step) {
  return function (value) {
    return value + step
  }
}

const add10 = createAdder(10)

console.log(add10(5)) // 15
```

这里返回的内部函数还能访问外部函数的 `step`，这就开始涉及闭包。

## 6. 🤔 排序比较函数为什么是典型例子？

假设有一个对象数组，希望根据不同属性排序，就可以写一个函数来生成比较函数。

```js
function createComparisonFunction(propertyName) {
  return function (object1, object2) {
    const value1 = object1[propertyName]
    const value2 = object2[propertyName]

    if (value1 < value2) {
      return -1
    }

    if (value1 > value2) {
      return 1
    }

    return 0
  }
}
```

使用时只需要传入不同属性名：

```js
const users = [
  { name: 'Zachary', age: 28 },
  { name: 'Nicholas', age: 29 },
]

users.sort(createComparisonFunction('name'))
users.sort(createComparisonFunction('age'))
```

这个例子同时体现了两个关键能力：函数可以返回函数，返回的函数还能记住创建它时接收到的参数。
