# [0195. 迭代与扩展操作](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0195.%20%E8%BF%AD%E4%BB%A3%E4%B8%8E%E6%89%A9%E5%B1%95%E6%93%8D%E4%BD%9C)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 哪些集合原生就支持迭代？](#3--哪些集合原生就支持迭代)
- [4. 🤔 `for...of` 和默认迭代器到底带来了什么？](#4--forof-和默认迭代器到底带来了什么)
- [5. 🤔 扩展操作符在集合上最常做什么？](#5--扩展操作符在集合上最常做什么)
- [6. 🤔 集合之间为什么能方便地互相转换？](#6--集合之间为什么能方便地互相转换)
- [7. 🤔 使用扩展操作和迭代时要注意什么边界？](#7--使用扩展操作和迭代时要注意什么边界)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 哪些集合原生支持迭代
- `for...of` 与默认迭代器
- 扩展操作符对集合复制和拼接的作用
- 集合之间的互操作
- 浅复制的边界

## 2. 🫧 评价

- 迭代器和扩展操作把很多集合操作从“繁琐样板”变成了“直接表达意图”。你越早把“可迭代”当成一种通用能力来理解，后面在数组、映射、集合之间转换时就会越顺手。

## 3. 🤔 哪些集合原生就支持迭代？

本章里最重要的四类可迭代集合是：

- `Array`
- 所有定型数组
- `Map`
- `Set`

这意味着它们都可以直接用于 `for...of`，也都可以配合扩展操作符使用。

```js
const iterableThings = [
  Array.of(1, 2),
  Int16Array.of(3, 4),
  new Map([
    [5, 6],
    [7, 8],
  ]),
  new Set([9, 10]),
]

for (const iterableThing of iterableThings) {
  for (const value of iterableThing) {
    console.log(value)
  }
}
```

## 4. 🤔 `for...of` 和默认迭代器到底带来了什么？

它带来的核心价值是：你不必再手写索引控制，也不用每次都关心底层集合怎么枚举。

只要一个对象实现了默认迭代器，你就可以按“顺序取值”的方式使用它。

例如：

```js
const arr = [1, 2, 3]
const set = new Set([4, 5, 6])

for (const value of arr) {
  console.log(value)
}

for (const value of set) {
  console.log(value)
}
```

从使用角度看，你不需要知道这两个集合内部的细节，只需要知道它们是可迭代的。

## 5. 🤔 扩展操作符在集合上最常做什么？

扩展操作符最常见的三个用途是：

- 浅复制
- 拼接新集合
- 把可迭代对象展开成参数或数组元素

```js
const arr1 = [1, 2, 3]
const arr2 = [...arr1]

const arr3 = [0, ...arr1, 4, 5]

console.log(arr2)
console.log(arr3)
```

对 `Map` 和 `Set` 也一样：

```js
const map1 = new Map([
  [1, 2],
  [3, 4],
])
const map2 = new Map(map1)

const set1 = new Set([1, 2, 3])
const arr = [...set1]
```

## 6. 🤔 集合之间为什么能方便地互相转换？

因为这些集合都围绕“可迭代”这个共同接口协作。

例如：

```js
const arr = [1, 2, 3]

const typedArr = Int16Array.from(arr)
const map = new Map(arr.map((x) => [x, `val${x}`]))
const set = new Set(typedArr)
const arrAgain = [...set]
```

这里数组、定型数组、映射和集合之间可以很自然地流动，原因不在于它们长得像，而在于它们都接受或产出可迭代数据。

## 7. 🤔 使用扩展操作和迭代时要注意什么边界？

最重要的边界是：扩展操作通常只做浅复制。

```js
const arr1 = [{}]
const arr2 = [...arr1]

arr1[0].foo = 'bar'
console.log(arr2[0])
```

这里复制的是对象引用，不是对象内容本身。

另外，`WeakMap` 和 `WeakSet` 不可迭代，所以你不能像对 `Map`、`Set` 那样展开或遍历它们。

可以把这一节记成一句话：可迭代集合之所以顺手，不是因为语法花哨，而是因为它们共享了一套统一的数据流动方式。
