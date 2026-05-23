# [0194. WeakSet](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0194.%20WeakSet)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `WeakSet` 的 “weak” 弱在哪里？](#3--weakset-的-weak-弱在哪里)
- [4. 🤔 `WeakSet` 的 API 和 `Set` 有什么不同？](#4--weakset-的-api-和-set-有什么不同)
- [5. 🤔 为什么 `WeakSet` 的值只能是对象？](#5--为什么-weakset-的值只能是对象)
- [6. 🤔 为什么 `WeakSet` 不能迭代？](#6--为什么-weakset-不能迭代)
- [7. 🤔 `WeakSet` 最适合用在什么地方？](#7--weakset-最适合用在什么地方)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `WeakSet` 的弱值语义
- `WeakSet` 的基本 API
- 为什么值只能是对象
- 为什么 `WeakSet` 不可迭代
- `WeakSet` 的典型使用场景

## 2. 🫧 评价

- `WeakSet` 的用途没有 `WeakMap` 那么广，但它在“给对象打标签”这类场景里很干净。你不用手动维护一堆对象何时该删，只要对象自己不再被引用，对应的标记关系也会自然消失。

## 3. 🤔 `WeakSet` 的 “weak” 弱在哪里？

和 `WeakMap` 类似，`WeakSet` 的“弱”指的是它对成员对象不形成阻止垃圾回收的强引用语义。

如果某个对象除了存在于 `WeakSet` 之外，没有其他地方再引用它，那么这个对象最终可以被垃圾回收。

```js
const ws = new WeakSet()
ws.add({})
```

这里那份对象值没有其他外部引用，因此它不会因为进入 `WeakSet` 就被强行留住。

## 4. 🤔 `WeakSet` 的 API 和 `Set` 有什么不同？

`WeakSet` 的 API 很小，核心只有：

- `add()`
- `has()`
- `delete()`

```js
const ws = new WeakSet()
const value = { id: 1 }

ws.add(value)
console.log(ws.has(value))

ws.delete(value)
```

它没有 `size`，也没有 `clear()`，同样不支持常规遍历。

## 5. 🤔 为什么 `WeakSet` 的值只能是对象？

因为它的存在意义就是跟对象生命周期绑定。

如果值是原始类型，就谈不上“这个对象什么时候不再被引用”。因此 `WeakSet` 只接受对象值。

这也是为什么它特别适合拿来标记某个对象“属于某个集合”，但不适合保存普通字符串、数值或布尔值成员。

## 6. 🤔 为什么 `WeakSet` 不能迭代？

原因和 `WeakMap` 一样：成员随时可能因为垃圾回收而消失。

一旦允许你稳定地列出所有成员，就和它“值可能随时被回收”的语义冲突了。因此它不提供：

- `keys()`
- `values()`
- `entries()`
- `forEach()`
- `size`

你只能拿着某个对象去问：它在不在这个 `WeakSet` 里？

## 7. 🤔 `WeakSet` 最适合用在什么地方？

最典型的场景是给对象打标签。

例如，用来标记哪些 DOM 节点处于某种状态：

```js
const disabledElements = new WeakSet()
const loginButton = document.querySelector('#login')

disabledElements.add(loginButton)
```

这样只要节点本身从 DOM 树和其他引用里消失，对应的标签关系也可以顺着对象生命周期自然消失。

所以可以把 `WeakSet` 看成一句话：它不是为了存一组“值列表”，而是为了记住“某个对象有没有被打上某个标签”。
