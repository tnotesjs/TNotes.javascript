# [0223. 函数属性与方法](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0223.%20%E5%87%BD%E6%95%B0%E5%B1%9E%E6%80%A7%E4%B8%8E%E6%96%B9%E6%B3%95)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 函数的 `length` 属性表示什么？](#3--函数的-length-属性表示什么)
- [4. 🤔 `prototype` 属性为什么重要？](#4--prototype-属性为什么重要)
- [5. 🤔 `apply()` 和 `call()` 有什么区别？](#5--apply-和-call-有什么区别)
- [6. 🤔 `apply()` 和 `call()` 真正强在哪里？](#6--apply-和-call-真正强在哪里)
- [7. 🤔 `bind()` 和 `call()`、`apply()` 有什么不同？](#7--bind-和-callapply-有什么不同)
- [8. 🤔 函数的字符串方法可靠吗？](#8--函数的字符串方法可靠吗)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `length` 属性
- `prototype` 属性
- `apply()` 方法
- `call()` 方法
- `bind()` 方法
- `toString()`、`toLocaleString()`、`valueOf()`

## 2. 🫧 评价

- 函数属性和方法这一节的重点不是背 API，而是理解函数既能被调用，也能像对象一样被检查和改造调用上下文。

## 3. 🤔 函数的 `length` 属性表示什么？

函数的 `length` 属性表示函数定义时命名参数的个数。

```js
function sayName(name) {}
function sum(num1, num2) {}
function sayHi() {}

console.log(sayName.length) // 1
console.log(sum.length) // 2
console.log(sayHi.length) // 0
```

它不表示调用时实际传入的参数个数。实际传参个数要在非箭头函数内部通过 `arguments.length` 或使用收集参数自行判断。

## 4. 🤔 `prototype` 属性为什么重要？

每个普通函数都有 `prototype` 属性，它用于构造函数和原型机制。

当函数通过 `new` 调用时，新对象的内部原型会指向这个函数的 `prototype`。

```js
function User(name) {
  this.name = name
}

User.prototype.sayName = function () {
  console.log(this.name)
}

const user = new User('Jake')
user.sayName()
```

箭头函数不能作为构造函数，也没有 `prototype` 属性。

## 5. 🤔 `apply()` 和 `call()` 有什么区别？

`apply()` 和 `call()` 都用于以指定的 `this` 调用函数，区别在传参形式。

`apply()` 的第二个参数是数组或类数组对象：

```js
function sum(a, b) {
  return a + b
}

console.log(sum.apply(null, [1, 2])) // 3
```

`call()` 从第二个参数开始逐个传入：

```js
console.log(sum.call(null, 1, 2)) // 3
```

如果参数已经在数组里，`apply()` 更方便；如果参数本来就是一个个写出来，`call()` 更直接。

## 6. 🤔 `apply()` 和 `call()` 真正强在哪里？

它们真正强在可以显式指定函数执行时的 `this`。

```js
globalThis.color = 'red'

const object = {
  color: 'blue',
}

function sayColor() {
  console.log(this.color)
}

sayColor.call(object) // blue
```

这意味着函数不必先成为某个对象的方法，也可以在调用时临时使用那个对象作为上下文。

## 7. 🤔 `bind()` 和 `call()`、`apply()` 有什么不同？

`call()` 和 `apply()` 会立即调用函数；`bind()` 会返回一个绑定好 `this` 的新函数。

```js
const object = {
  color: 'blue',
}

function sayColor() {
  console.log(this.color)
}

const objectSayColor = sayColor.bind(object)

objectSayColor() // blue
```

`bind()` 适合在回调中固定 `this`，避免函数被传来传去之后丢失调用上下文。

## 8. 🤔 函数的字符串方法可靠吗？

函数继承的 `toString()` 和 `toLocaleString()` 通常会返回函数代码，但不同引擎返回格式可能不同。

有的会返回源代码，有的会返回内部格式，注释和空白也不一定保留。

`valueOf()` 通常返回函数本身。

这些方法适合调试，不适合作为业务逻辑判断依据。
