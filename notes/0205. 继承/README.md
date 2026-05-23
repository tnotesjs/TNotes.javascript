# [0205. 继承](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0205.%20%E7%BB%A7%E6%89%BF)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 JavaScript 里的继承本质上靠什么实现？](#3--javascript-里的继承本质上靠什么实现)
- [4. 🤔 单独使用原型链继承为什么问题很多？](#4--单独使用原型链继承为什么问题很多)
- [5. 🤔 什么是盗用构造函数，它修复了什么？](#5--什么是盗用构造函数它修复了什么)
- [6. 🤔 为什么组合继承会成为经典方案？](#6--为什么组合继承会成为经典方案)
- [7. 🤔 为什么还要有寄生式组合继承和 `Object.create()`？](#7--为什么还要有寄生式组合继承和-objectcreate)
- [8. 🤔 这一节最后该保留什么实践判断？](#8--这一节最后该保留什么实践判断)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 原型链继承的基本思路
- 原型链的问题
- 盗用构造函数
- 组合继承与寄生式组合继承
- `Object.create()` 的定位
- 继承与组合的取舍提醒

## 2. 🫧 评价

- JavaScript 继承的难点从来不是“会不会写 `extends`”，而是要知道 ES6 以前那些模式到底在补什么洞。你只要看清每种模式是在修复共享引用、类型标识还是方法复用，整段历史就会顺很多。

## 3. 🤔 JavaScript 里的继承本质上靠什么实现？

本质上靠原型链。

如果一个对象的原型又是另一个类型的实例，那么属性和方法查找就会沿着这条链一层层向上走。

```js
function SuperType() {
  this.property = true
}

SuperType.prototype.getSuperValue = function () {
  return this.property
}

function SubType() {
  this.subproperty = false
}

SubType.prototype = new SuperType()
```

这样 `SubType` 的实例就能访问 `SuperType` 原型链上的能力。

## 4. 🤔 单独使用原型链继承为什么问题很多？

最大的问题有两个。

第一，父类实例属性如果是引用值，会被所有子类实例共享。

```js
function SuperType() {
  this.colors = ['red', 'blue', 'green']
}

function SubType() {}
SubType.prototype = new SuperType()
```

这会导致某个实例修改 `colors` 后，其他实例也跟着变。

第二，子类在实例化时很难优雅地给父类构造函数传参。

所以原型链虽然是底层基础，但通常不适合单独拿来当完整继承方案。

## 5. 🤔 什么是盗用构造函数，它修复了什么？

盗用构造函数的思路是：在子类构造函数里直接调用父类构造函数，让父类的实例属性初始化逻辑跑在子类实例上。

```js
function SuperType(name) {
  this.name = name
  this.colors = ['red', 'blue', 'green']
}

function SubType(name, age) {
  SuperType.call(this, name)
  this.age = age
}
```

这样每个实例都有自己独立的 `colors`，而且父类参数也能正常传进去。

但它也有缺点：父类原型上的方法拿不到，方法复用问题仍然没有解决。

## 6. 🤔 为什么组合继承会成为经典方案？

因为它把两种模式的优点拼起来了：

- 用盗用构造函数继承实例属性
- 用原型链继承共享方法

```js
function SuperType(name) {
  this.name = name
  this.colors = ['red', 'blue', 'green']
}

SuperType.prototype.sayName = function () {
  console.log(this.name)
}

function SubType(name, age) {
  SuperType.call(this, name)
  this.age = age
}

SubType.prototype = new SuperType()
SubType.prototype.sayAge = function () {
  console.log(this.age)
}
```

它同时解决了：

- 实例私有数据共享的问题
- 原型方法复用的问题

所以在 ES6 类出现之前，它是非常主流的继承方案。

## 7. 🤔 为什么还要有寄生式组合继承和 `Object.create()`？

因为经典组合继承还有一个明显浪费：父类构造函数往往会被调用两次。

寄生式组合继承的目标就是少掉这次多余调用，保留原型链，又不在子类原型上制造没必要的父类实例属性。

```js
function inheritPrototype(subType, superType) {
  const prototype = Object.create(superType.prototype)
  prototype.constructor = subType
  subType.prototype = prototype
}
```

这里的 `Object.create()` 非常关键，它允许你基于某个现有对象直接创建新对象，并指定原型，而不必先跑一遍父类构造函数。

因此，寄生式组合继承通常被视为 ES5 时代相对更高效、更干净的继承模式。

## 8. 🤔 这一节最后该保留什么实践判断？

可以保留三条判断。

- 原型链是 JavaScript 继承的底层事实。
- 单一继承模式通常各有缺陷，组合思路才是历史上的主流解法。
- 即使现在有 `class` 和 `extends`，理解这些旧模式仍然有价值，因为它们解释了类语法背后到底在封装什么。

再补一句更工程化的提醒：继承不是越多越好，很多时候“组合优于继承”依然成立。
