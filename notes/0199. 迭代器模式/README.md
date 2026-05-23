# [0199. 迭代器模式](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0199.%20%E8%BF%AD%E4%BB%A3%E5%99%A8%E6%A8%A1%E5%BC%8F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 可迭代对象和迭代器到底有什么区别？](#3--可迭代对象和迭代器到底有什么区别)
- [4. 🤔 `Symbol.iterator` 为什么这么关键？](#4--symboliterator-为什么这么关键)
- [5. 🤔 迭代器协议里的 `next()`、`done` 和 `value` 应该怎么理解？](#5--迭代器协议里的-nextdone-和-value-应该怎么理解)
- [6. 🤔 自定义迭代器应该怎么写？](#6--自定义迭代器应该怎么写)
- [7. 🤔 什么叫提前终止迭代器？](#7--什么叫提前终止迭代器)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 可迭代协议与 `Symbol.iterator`
- 迭代器协议与 `next()`
- `done`、`value` 的含义
- 自定义迭代器的实现思路
- 提前终止迭代器的机制

## 2. 🫧 评价

- 迭代器模式的价值，是把“怎么依次拿到下一项”这件事独立成了一个统一接口。它看起来抽象，但一旦你明白了 `Symbol.iterator` 和 `next()` 在分工什么，很多现代 JavaScript 语法就都能串起来。

## 3. 🤔 可迭代对象和迭代器到底有什么区别？

可迭代对象负责回答：“我能不能被遍历？”

迭代器负责回答：“下一项是什么？”

在 JavaScript 里，可迭代对象通常通过 `Symbol.iterator` 提供一个工厂函数；调用它之后，会得到一个真正执行遍历工作的迭代器对象。

```js
const arr = ['foo', 'bar', 'baz']
const iter = arr[Symbol.iterator]()
```

所以它们不是同一个东西，而是“工厂”和“产物”的关系。

## 4. 🤔 `Symbol.iterator` 为什么这么关键？

因为它是 JavaScript 里判断一个对象能否按默认方式迭代的入口。

如果一个对象实现了这个属性，并且它对应的函数会返回迭代器，那么很多语言特性就能自动消费它，比如：

- `for...of`
- 解构
- 扩展操作符
- `Array.from()`
- `new Set(iterable)`
- `new Map(iterable)`

```js
const arr = ['foo', 'bar', 'baz']

for (const item of arr) {
  console.log(item)
}

const copy = [...arr]
const set = new Set(arr)
```

所以 `Symbol.iterator` 不只是一个冷门符号，它是“可迭代协议”的正式入口。

## 5. 🤔 迭代器协议里的 `next()`、`done` 和 `value` 应该怎么理解？

迭代器通过 `next()` 一步步往前走，每次返回一个结果对象。

```js
const arr = ['foo', 'bar']
const iter = arr[Symbol.iterator]()

console.log(iter.next())
console.log(iter.next())
console.log(iter.next())
```

返回结果通常长这样：

- `done: false` 表示还有值可取
- `value` 表示当前这一步产出的值

当迭代结束时，会进入耗尽状态：

- `done: true`
- `value` 通常是 `undefined`

而且一旦耗尽，继续调用 `next()` 也只会维持这个结束状态。

## 6. 🤔 自定义迭代器应该怎么写？

核心思路是：把“当前走到哪里了”这件事保存在闭包或对象状态里，然后让 `next()` 每次根据状态返回下一个结果。

```js
class Counter {
  constructor(limit) {
    this.limit = limit
  }

  [Symbol.iterator]() {
    let count = 1
    const limit = this.limit

    return {
      next() {
        if (count <= limit) {
          return { done: false, value: count++ }
        }

        return { done: true, value: undefined }
      },
    }
  }
}
```

这样每次重新调用默认迭代器工厂，都会得到一个新的独立迭代器，不会互相串状态。

## 7. 🤔 什么叫提前终止迭代器？

有些迭代并不会把数据彻底消费完，比如：

- `for...of` 里 `break`
- `throw`
- 解构只取前几个值

这时如果迭代器实现了可选的 `return()` 方法，语言结构就可以在提前退出时调用它，让迭代器知道“已经不需要继续了”。

```js
class Counter {
  constructor(limit) {
    this.limit = limit
  }

  [Symbol.iterator]() {
    let count = 1
    const limit = this.limit

    return {
      next() {
        if (count <= limit) {
          return { done: false, value: count++ }
        }

        return { done: true }
      },
      return() {
        console.log('Exiting early')
        return { done: true }
      },
    }
  }
}
```

这个能力的价值在于：迭代不仅能“往后走”，还可以在被提前打断时做收尾处理。
