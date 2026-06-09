# [0219. 参数扩展与收集](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0219.%20%E5%8F%82%E6%95%B0%E6%89%A9%E5%B1%95%E4%B8%8E%E6%94%B6%E9%9B%86)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 扩展参数解决什么问题？](#3-扩展参数解决什么问题)
- [4. 扩展参数可以和普通参数一起用吗？](#4-扩展参数可以和普通参数一起用吗)
- [5. 收集参数解决什么问题？](#5-收集参数解决什么问题)
- [6. 收集参数有什么限制？](#6-收集参数有什么限制)
- [7. 箭头函数适合配合收集参数吗？](#7-箭头函数适合配合收集参数吗)

<!-- endregion:toc -->

## 1. 本节内容

- 扩展操作符用于函数调用
- 扩展参数与 `apply()` 的关系
- 扩展参数和命名参数、默认参数的组合
- 收集参数用于函数定义
- 收集参数与 `arguments` 的区别
- 箭头函数与收集参数

## 2. 评价

- 扩展和收集使用的是同一个 `...`，但方向完全相反：调用时是展开，定义时是收拢。分清这个方向，这节就顺了。

## 3. 扩展参数解决什么问题？

扩展参数用于函数调用时，把可迭代对象展开成独立参数。

```js
function sum(a, b, c) {
  return a + b + c
}

const values = [1, 2, 3]

console.log(sum(...values)) // 6
```

ES6 之前经常用 `apply()` 做类似事情：

```js
sum.apply(null, values)
```

扩展操作符更直接，也更符合函数调用的阅读习惯。

## 4. 扩展参数可以和普通参数一起用吗？

可以。

```js
function getSum(...values) {
  return values.reduce((total, value) => total + value, 0)
}

const values = [1, 2, 3]

console.log(getSum(-1, ...values)) // 5
console.log(getSum(...values, 4)) // 10
console.log(getSum(...values, ...[4, 5])) // 15
```

对函数内部来说，扩展操作符已经不存在了。函数接收到的就是展开之后的普通参数。

```js
function countArgs() {
  console.log(arguments.length)
}

countArgs(...[1, 2, 3]) // 3
```

## 5. 收集参数解决什么问题？

收集参数用于函数定义时，把剩余参数收进一个数组。

```js
function sum(...values) {
  return values.reduce((total, value) => total + value, 0)
}

console.log(sum(1, 2, 3)) // 6
```

这和 `arguments` 类似，但收集参数是真正的数组，可以直接使用数组方法。

```js
function joinValues(...values) {
  return values.map(String).join(',')
}
```

## 6. 收集参数有什么限制？

收集参数只能放在形参列表最后。

```js
function ignoreFirst(first, ...rest) {
  console.log(rest)
}

ignoreFirst(1, 2, 3) // [2, 3]
```

下面这种写法无效：

```js
function invalid(...values, last) {}
```

因为如果收集参数不在最后，语言无法判断哪些参数应该被收集，哪些参数应该继续匹配后面的形参。

## 7. 箭头函数适合配合收集参数吗？

适合。

箭头函数没有自己的 `arguments`，所以需要不定参数时，收集参数通常是首选。

```js
const sum = (...values) => {
  return values.reduce((total, value) => total + value, 0)
}

console.log(sum(1, 2, 3)) // 6
```

可以简单记：函数调用位置的 `...` 是展开，函数定义位置的 `...` 是收集。
