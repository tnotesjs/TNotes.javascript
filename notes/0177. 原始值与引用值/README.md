# [0177. 原始值与引用值](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0177.%20%E5%8E%9F%E5%A7%8B%E5%80%BC%E4%B8%8E%E5%BC%95%E7%94%A8%E5%80%BC)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 原始值和引用值到底怎么区分？](#3-原始值和引用值到底怎么区分)
- [4. 为什么对象可以动态加属性，而原始值不行？](#4-为什么对象可以动态加属性而原始值不行)
- [5. 复制值时到底复制了什么？](#5-复制值时到底复制了什么)
- [6. JavaScript 函数传参到底是按值还是按引用？](#6-javascript-函数传参到底是按值还是按引用)
- [7. 应该用什么方式判断值的类型？](#7-应该用什么方式判断值的类型)

<!-- endregion:toc -->

## 1. 本节内容

- 原始值与引用值的区别
- 动态属性行为
- 复制值时发生了什么
- 函数参数的传递规则
- `typeof` 与 `instanceof` 的使用边界

## 2. 评价

- 这一节最容易被一句“基本类型在栈里、引用类型在堆里”带偏。真正影响你写代码的，不是背存储位置，而是理解复制、传参和属性访问到底复制了什么、共享了什么。

## 3. 原始值和引用值到底怎么区分？

JavaScript 中的值大体分成两类：原始值和引用值。

原始值是最简单的数据，比如 `Undefined`、`Null`、`Boolean`、`Number`、`String` 和 `Symbol`。引用值则是对象，也就是一组属性和方法的集合。

这两类值最关键的区别不是“写法”，而是“行为”：

- 原始值通常表现为独立、不可拆分的值。
- 引用值表现为对某个对象的访问入口。

也就是说，你操作对象变量时，真正参与共享的是它背后指向的对象，而不是变量名本身。

## 4. 为什么对象可以动态加属性，而原始值不行？

对象本来就是属性集合，所以可以在运行时继续追加属性：

```js
const person = {}
person.name = 'Nicholas'
console.log(person.name) // 'Nicholas'
```

原始值不具备这种稳定的动态属性能力。你给原始值挂属性，往往不会报错，但结果也不会按你预期保留下来：

```js
let name = 'Nicholas'
name.age = 27
console.log(name.age) // undefined
```

简单来说，只有引用值才能真正承载你后续还想继续访问的属性。

这里还要区分原始值和包装对象：

```js
const name1 = 'Nicholas'
const name2 = new String('Matt')

name1.age = 27
name2.age = 26

console.log(name1.age) // undefined
console.log(name2.age) // 26
console.log(typeof name1) // 'string'
console.log(typeof name2) // 'object'
```

`new String()` 创建的是对象，不再是普通原始字符串。实践里一般不建议这样写，因为它会让行为变复杂。

## 5. 复制值时到底复制了什么？

复制原始值时，得到的是一个新的独立副本：

```js
let num1 = 5
let num2 = num1

num2 = 10

console.log(num1) // 5
console.log(num2) // 10
```

复制引用值时，复制的是“引用”，也就是两个变量指向同一个对象：

```js
const obj1 = { name: 'Nicholas' }
const obj2 = obj1

obj2.name = 'Greg'

console.log(obj1.name) // 'Greg'
console.log(obj2.name) // 'Greg'
```

所以，很多“为什么另一个变量也变了”的问题，本质上都不是赋值语句神秘，而是两个变量本来就在共享同一个对象。

## 6. JavaScript 函数传参到底是按值还是按引用？

结论很直接：JavaScript 函数参数一律按值传递。

如果传入的是原始值，复制的是原始值本身：

```js
function addTen(num) {
  num += 10
  return num
}

const count = 20
const result = addTen(count)

console.log(count) // 20
console.log(result) // 30
```

如果传入的是对象，复制的是那个引用值，因此函数内部和外部可以同时指向同一个对象：

```js
function setName(user) {
  user.name = 'Nicholas'
}

const person = {}
setName(person)

console.log(person.name) // 'Nicholas'
```

很多人会误以为这就是“按引用传递”，但只要你在函数内部重新给参数赋一个新对象，就能看出不是：

```js
function setName(user) {
  user.name = 'Nicholas'
  user = { name: 'Greg' }
}

const person = {}
setName(person)

console.log(person.name) // 'Nicholas'
```

重新赋值只会改变函数内部那个局部参数，不会回头改掉外部变量绑定的引用。

## 7. 应该用什么方式判断值的类型？

如果你想判断一个值是不是字符串、数值、布尔值或 `undefined`，优先用 `typeof`：

```js
console.log(typeof 'hi') // 'string'
console.log(typeof 22) // 'number'
console.log(typeof true) // 'boolean'
console.log(typeof undefined) // 'undefined'
```

但 `typeof` 对对象的区分能力很弱：

```js
console.log(typeof null) // 'object'
console.log(typeof {}) // 'object'
console.log(typeof []) // 'object'
```

如果你需要判断对象是不是某个构造函数的实例，就用 `instanceof`：

```js
const now = new Date()

console.log(now instanceof Date) // true
console.log(now instanceof Object) // true
```

所以可以记一个简洁原则：

- 看原始类型，用 `typeof`。
- 看对象与构造函数的关系，用 `instanceof`。
- 不要指望 `typeof` 精确区分所有对象。
