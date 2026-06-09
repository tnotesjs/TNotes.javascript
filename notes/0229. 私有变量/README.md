# [0229. 私有变量](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0229.%20%E7%A7%81%E6%9C%89%E5%8F%98%E9%87%8F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. JavaScript 里什么可以算私有变量？](#3-javascript-里什么可以算私有变量)
- [4. 什么是特权方法？](#4-什么是特权方法)
- [5. 构造函数私有变量有什么优缺点？](#5-构造函数私有变量有什么优缺点)
- [6. 什么是静态私有变量？](#6-什么是静态私有变量)
- [7. 模块模式是什么？](#7-模块模式是什么)
- [8. 模块增强模式解决什么问题？](#8-模块增强模式解决什么问题)
- [9. 现在还应该怎么理解私有变量？](#9-现在还应该怎么理解私有变量)

<!-- endregion:toc -->

## 1. 本节内容

- JavaScript 中的私有变量
- 特权方法
- 构造函数中的私有变量
- 静态私有变量
- 模块模式
- 模块增强模式

## 2. 评价

- 私有变量这一节是在说明闭包的工程用途。JavaScript 早期没有私有属性语法，但可以用函数作用域和闭包模拟出可控的访问边界。

## 3. JavaScript 里什么可以算私有变量？

严格来说，早期 JavaScript 对象属性默认都是公开的，没有传统类语言中的私有成员语法。

但定义在函数或块内部的变量，外部无法直接访问，因此可以把它们当作私有变量。

```js
function add(num1, num2) {
  const sum = num1 + num2
  return sum
}
```

这里 `num1`、`num2` 和 `sum` 都只能在函数内部访问。

## 4. 什么是特权方法？

特权方法是可以访问私有变量的公有方法。

```js
function Person(name) {
  this.getName = function () {
    return name
  }

  this.setName = function (value) {
    name = value
  }
}

const person = new Person('Nicholas')

console.log(person.getName()) // Nicholas
person.setName('Greg')
console.log(person.getName()) // Greg
```

外部无法直接访问构造函数里的 `name`，只能通过 `getName()` 和 `setName()` 间接访问。

这里的方法之所以能访问 `name`，是因为它们是闭包。

## 5. 构造函数私有变量有什么优缺点？

构造函数模式下，每次创建实例都会创建一套新的私有变量。

优点是每个实例的私有状态彼此独立。

缺点是每个实例也会重新创建一份特权方法，方法不能通过原型共享。

```js
const person1 = new Person('A')
const person2 = new Person('B')

console.log(person1.getName === person2.getName) // false
```

如果实例很多，这会带来一定内存开销。

## 6. 什么是静态私有变量？

静态私有变量是多个实例共享的私有变量。

可以用 IIFE 创建一个私有作用域，然后把构造函数和原型方法暴露出去。

```js
const Person = (function () {
  let name = ''

  function Person(value) {
    name = value
  }

  Person.prototype.getName = function () {
    return name
  }

  Person.prototype.setName = function (value) {
    name = value
  }

  return Person
})()
```

这种写法的特权方法可以放在原型上复用，但 `name` 是所有实例共享的。

```js
const person1 = new Person('Nicholas')
const person2 = new Person('Michael')

console.log(person1.getName()) // Michael
console.log(person2.getName()) // Michael
```

所以它适合共享状态，不适合每个实例都要独立私有状态的场景。

## 7. 模块模式是什么？

模块模式是在单例对象上使用私有变量和特权方法。

```js
const app = (function () {
  const components = []

  return {
    register(component) {
      components.push(component)
    },
    getCount() {
      return components.length
    },
  }
})()
```

这里 `components` 是私有变量，外部只能通过返回对象上的方法操作它。

模块模式适合管理应用级单例状态，比如配置、注册表、缓存和服务实例。

## 8. 模块增强模式解决什么问题？

模块增强模式会先创建一个特定类型的对象，再给它添加可以访问私有变量的公有方法，最后返回这个对象。

```js
const app = (function () {
  const components = []
  const object = new EventTarget()

  object.register = function (component) {
    components.push(component)
  }

  object.getCount = function () {
    return components.length
  }

  return object
})()
```

这种模式适合返回对象必须是某个类型实例，同时又要挂载私有状态访问方法的场景。

## 9. 现在还应该怎么理解私有变量？

现代 JavaScript 已经有类私有字段语法，比如 `#name`。但闭包模拟私有变量仍然很重要，因为它解释了很多旧代码、模块模式和函数式封装方式。

实践中可以这样判断：

- 每个实例需要独立私有状态，可以考虑构造函数闭包或类私有字段。
- 多个实例需要共享私有状态，可以考虑静态私有变量。
- 单例模块需要隐藏内部状态，可以考虑模块模式。
- 如果只是普通对象属性，不要为了“看起来高级”强行闭包化。
