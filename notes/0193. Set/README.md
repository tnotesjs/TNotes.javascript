# [0193. Set](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0193.%20Set)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `Set` 主要解决什么问题？](#3--set-主要解决什么问题)
- [4. 🤔 `Set` 的基本 API 应该怎么记？](#4--set-的基本-api-应该怎么记)
- [5. 🤔 `Set` 的“唯一”到底按什么规则判断？](#5--set-的唯一到底按什么规则判断)
- [6. 🤔 `Set` 的顺序和迭代能力有什么价值？](#6--set-的顺序和迭代能力有什么价值)
- [7. 🤔 `Set` 在实际开发里最常怎么用？](#7--set-在实际开发里最常怎么用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `Set` 的唯一值集合语义
- `Set` 的基本 API
- `SameValueZero` 与去重规则
- 插入顺序与迭代
- `Set` 的典型使用方式

## 2. 🫧 评价

- `Set` 往往被一句“可去重数组”轻描淡写带过，但它其实是一种独立的数据结构。你真正应该理解的是：它不是为了替代数组，而是为了表达“成员关系”和“唯一性”这两个概念。

## 3. 🤔 `Set` 主要解决什么问题？

`Set` 用来表示一组唯一值。它关心的不是索引位置，而是“某个值是否在集合中”。

```js
const s = new Set(['val1', 'val2', 'val3'])
```

如果你继续往里加同样的值，集合大小不会增加，因为它会自动保证唯一性。

## 4. 🤔 `Set` 的基本 API 应该怎么记？

最常用的 API 有这些：

- `add()`：添加值
- `has()`：判断值是否存在
- `delete()`：删除值
- `clear()`：清空集合
- `size`：成员数量

```js
const s = new Set()

s.add('Matt').add('Frisbie')

console.log(s.has('Matt'))
console.log(s.size)

s.delete('Matt')
console.log(s.has('Matt'))
```

它支持链式调用，这点和 `Map#set()` 很像。

## 5. 🤔 `Set` 的“唯一”到底按什么规则判断？

`Set` 内部使用 `SameValueZero` 语义判断值是否已经存在。你可以近似理解成：

- 原始值按稳定相等规则比较
- 对象按引用身份比较

```js
const s = new Set()
const obj = {}

s.add(obj)

console.log(s.has(obj)) // true
console.log(s.has({})) // false
```

所以 `Set` 的去重并不是“内容深比较”，而是“成员身份去重”。

## 6. 🤔 `Set` 的顺序和迭代能力有什么价值？

`Set` 会保留插入顺序，因此你可以稳定地按加入顺序遍历它。

```js
const s = new Set(['val1', 'val2', 'val3'])

for (const value of s) {
  console.log(value)
}
```

常见迭代入口包括：

- 默认迭代器
- `values()`
- `keys()`
- `entries()`
- `forEach()`

对 `Set` 来说，`keys()` 和 `values()` 实际效果等价，因为集合只有值，没有独立键名。

## 7. 🤔 `Set` 在实际开发里最常怎么用？

最常见的三类用途：

第一，数组去重：

```js
const list = [1, 2, 2, 3, 3, 3]
const uniqueList = [...new Set(list)]
```

第二，快速判断成员关系：

```js
const allowedRoles = new Set(['admin', 'editor'])
console.log(allowedRoles.has('admin'))
```

第三，表达集合语义，比如并集、交集、差集等。虽然标准库没有一次性把这些操作都做成内置实例方法，但它很适合承载这类概念。

所以可以简单记：当你关心“有没有这个值”和“值不能重复”时，优先考虑 `Set`，而不是勉强拿数组去模拟。
