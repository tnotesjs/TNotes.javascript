# [0184. 原始值包装类型](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0184.%20%E5%8E%9F%E5%A7%8B%E5%80%BC%E5%8C%85%E8%A3%85%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么原始值看起来也能调用方法？](#3-为什么原始值看起来也能调用方法)
- [4. 为什么给原始值加属性通常不会生效？](#4-为什么给原始值加属性通常不会生效)
- [5. `Boolean`、`Number`、`String` 包装对象和原始值有什么本质差异？](#5-booleannumberstring-包装对象和原始值有什么本质差异)
- [6. 包装类型本身提供了哪些常见能力？](#6-包装类型本身提供了哪些常见能力)
- [7. 实际开发里应该主动使用包装对象吗？](#7-实际开发里应该主动使用包装对象吗)

<!-- endregion:toc -->

## 1. 本节内容

- 原始值包装类型的意义
- 自动装箱与短暂对象生命周期
- `Boolean`、`Number`、`String` 的区别
- 包装对象与原始值的判断差异
- 为什么不建议主动实例化包装对象

## 2. 评价

- 这一节最重要的价值，是把“字符串为什么能调方法”这件事解释清楚。你一旦明白自动装箱和包装对象的生命周期，就不会再把 `new String()` 这类写法误当成正常实践了。

## 3. 为什么原始值看起来也能调用方法？

字符串、数值和布尔值明明不是对象，但你却经常能这样写：

```js
const text = 'some text'
const result = text.substring(2)
```

这是因为 JavaScript 在读取原始值的方法或属性时，会临时创建对应的包装对象，帮你完成这次调用。

可以把它近似理解为下面三步：

```js
let temp = new String('some text')
const result = temp.substring(2)
temp = null
```

也就是说，原始值之所以“像对象”，不是因为它真的长期变成了对象，而是因为运行时在背后做了一次短暂的自动装箱。

## 4. 为什么给原始值加属性通常不会生效？

因为那个包装对象只在当前读取语句附近短暂存在。

```js
let text = 'some text'
text.color = 'red'
console.log(text.color) // undefined
```

第一行赋值时，看起来像是给字符串加了个属性；但下一次读取时，前一个临时包装对象早就销毁了，于是你得到的还是 `undefined`。

简单来说：

- 调方法能成功，是因为临时对象帮你完成了调用。
- 挂属性不稳定，是因为这个临时对象不会长期保留。

## 5. `Boolean`、`Number`、`String` 包装对象和原始值有什么本质差异？

包装对象本质上是对象，而原始值仍然只是原始值。

```js
const numberValue = 10
const numberObject = new Number(10)

console.log(typeof numberValue) // 'number'
console.log(typeof numberObject) // 'object'
console.log(numberObject instanceof Number) // true
```

同理，`new String('hello')` 得到的是对象，不是普通字符串；`new Boolean(false)` 得到的也是对象，不是原始布尔值。

这会直接影响判断行为。比如所有对象在布尔上下文里都是真值：

```js
const value = new Boolean(false)

if (value) {
  console.log('still truthy')
}
```

虽然它包着的是 `false`，但它自己是对象，所以条件仍然成立。这就是包装对象最容易误导人的地方。

## 6. 包装类型本身提供了哪些常见能力？

包装类型之所以存在，是为了把一组方法挂到原始值上。

几个有代表性的例子：

- `Number` 提供 `toFixed()`、`toExponential()`、`toPrecision()` 这类格式化方法。
- `String` 提供 `substring()`、`slice()`、`indexOf()`、`includes()`、`trim()` 等字符串处理方法。
- `Boolean` 主要提供 `valueOf()`、`toString()` 这类能力，但实际使用场景远少于 `String` 和 `Number`。

例如：

```js
const num = 10.005
console.log(num.toFixed(2)) // '10.01'

const message = ' hello world '
console.log(message.trim()) // 'hello world'
```

你平时调用的这些方法，多数并不是“原始值天生自带的方法”，而是包装类型借给原始值的方法。

## 7. 实际开发里应该主动使用包装对象吗？

结论很明确：通常不要。

下面这些写法虽然合法，但不推荐作为日常实践：

```js
const str = new String('hello')
const num = new Number(1)
const bool = new Boolean(false)
```

原因主要有三点：

- 它们会让 `typeof` 结果变成 `'object'`。
- 它们会让相等判断和布尔判断更容易出错。
- 它们会让读代码的人误以为这里需要对象语义。

所以可以记一个稳定原则：

- 要转换类型，用 `String()`、`Number()`、`Boolean()`。
- 要处理值，直接用原始值。
- 不要把包装对象当成正常业务数据结构。
