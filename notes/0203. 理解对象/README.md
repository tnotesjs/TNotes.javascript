# [0203. 理解对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0203.%20%E7%90%86%E8%A7%A3%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么说对象属性不只是简单键值对？](#3--为什么说对象属性不只是简单键值对)
- [4. 🤔 `Object.defineProperty()` 和描述符到底在控制什么？](#4--objectdefineproperty-和描述符到底在控制什么)
- [5. 🤔 `Object.assign()` 和 `Object.is()` 分别解决什么问题？](#5--objectassign-和-objectis-分别解决什么问题)
- [6. 🤔 ES6 增强对象语法主要提升了什么？](#6--es6-增强对象语法主要提升了什么)
- [7. 🤔 对象解构和对象迭代该怎样放进同一张图里理解？](#7--对象解构和对象迭代该怎样放进同一张图里理解)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 数据属性与访问器属性
- `Object.defineProperty()` 与描述符
- `Object.assign()`、`Object.is()` 的作用
- 增强对象语法
- 对象解构与对象迭代

## 2. 🫧 评价

- 这一节的难点不在 API 数量，而在于你得接受一个事实：对象属性不是单纯的“键对应一个值”，而是一套带元信息的行为模型。把这一层想明白后，后面的原型、类和代理都会更容易理解。

## 3. 🤔 为什么说对象属性不只是简单键值对？

因为 JavaScript 属性除了“存什么值”，还带着一组控制行为的特征。

最常见的两类属性是：

- 数据属性：直接保存值
- 访问器属性：通过 `get` / `set` 函数间接控制读取和写入

例如：

```js
const person = {
  name: 'Nicholas',
}
```

这里的 `name` 看起来只是普通字段，但运行时其实还会关心它是否可写、可枚举、可配置。

访问器属性则更像“带逻辑的属性”：

```js
const book = {
  year_: 2017,
  edition: 1,
}

Object.defineProperty(book, 'year', {
  get() {
    return this.year_
  },
  set(newValue) {
    if (newValue > 2017) {
      this.year_ = newValue
      this.edition += newValue - 2017
    }
  },
})
```

## 4. 🤔 `Object.defineProperty()` 和描述符到底在控制什么？

它控制的是属性的行为，而不仅仅是值。

对数据属性来说，最常见的几个描述符是：

- `value`
- `writable`
- `enumerable`
- `configurable`

```js
const person = {}

Object.defineProperty(person, 'name', {
  writable: false,
  value: 'Nicholas',
})
```

这意味着 `name` 有值，但默认不能被重新赋值。

如果你想一次定义多个属性，可以使用 `Object.defineProperties()`；如果你想读出某个属性的描述信息，可以使用 `Object.getOwnPropertyDescriptor()` 或 `Object.getOwnPropertyDescriptors()`。

也就是说，这一组 API 的作用不是“创建普通字段”，而是“精细控制对象属性规则”。

## 5. 🤔 `Object.assign()` 和 `Object.is()` 分别解决什么问题？

`Object.assign()` 解决的是对象浅合并问题：

```js
const target = {}
const source = { id: 'src', meta: { ok: true } }

Object.assign(target, source)
```

它会把源对象的可枚举自有属性复制到目标对象上，但要注意这是浅复制，对象引用会被直接共享。

`Object.is()` 解决的是一些严格相等判断的边角问题，比如：

- `NaN` 和 `NaN`
- `+0` 和 `-0`

```js
console.log(Object.is(NaN, NaN)) // true
console.log(Object.is(+0, -0)) // false
```

因此可以简单记：`Object.assign()`偏向对象合并，`Object.is()`偏向更准确的值相等判定。

## 6. 🤔 ES6 增强对象语法主要提升了什么？

主要提升了对象字面量的表达力。

最常见的三类增强：

- 属性值简写
- 可计算属性名
- 简写方法名

```js
const name = 'Matt'
const key = 'job'

const person = {
  name,
  [key]: 'Software engineer',
  sayName() {
    console.log(this.name)
  },
}
```

这些语法没有改变对象本质，但显著减少了样板代码，也更适合和类语法保持一致。

## 7. 🤔 对象解构和对象迭代该怎样放进同一张图里理解？

对象解构解决的是“按结构取值”：

```js
const person = {
  name: 'Matt',
  age: 27,
  job: {
    title: 'Software engineer',
  },
}

const {
  name,
  job: { title },
} = person
```

对象迭代相关 API 解决的是“把对象内容转成更容易遍历的序列”：

- `Object.keys()`
- `Object.values()`
- `Object.entries()`

```js
console.log(Object.keys(person))
console.log(Object.values(person))
console.log(Object.entries(person))
```

所以可以这样理解：解构偏向“按形状消费对象”，而 `keys` / `values` / `entries` 偏向“把对象序列化成可遍历结果”。
