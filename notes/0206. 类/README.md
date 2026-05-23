# [0206. 类](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0206.%20%E7%B1%BB)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 ES6 `class` 到底带来了什么？](#3--es6-class-到底带来了什么)
- [4. 🤔 `constructor` 和实例化规则有什么特别之处？](#4--constructor-和实例化规则有什么特别之处)
- [5. 🤔 实例成员、原型成员和静态成员应该怎么区分？](#5--实例成员原型成员和静态成员应该怎么区分)
- [6. 🤔 `extends` 和 `super` 在类继承里分别负责什么？](#6--extends-和-super-在类继承里分别负责什么)
- [7. 🤔 类还能做哪些更进阶的事？](#7--类还能做哪些更进阶的事)
- [8. 🤔 学完类之后最稳定的结论是什么？](#8--学完类之后最稳定的结论是什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `class` 的定义方式与块级作用域
- `constructor` 与实例化规则
- 实例成员、原型成员、静态成员
- `extends` 与 `super`
- 抽象基类、继承内置类型与混入
- 类与原型系统的关系

## 2. 🫧 评价

- `class` 让 JavaScript 的面向对象代码好写了很多，但它最容易制造的误解也是“好像底层已经不是原型了”。其实恰恰相反，类的学习重点不是把旧知识丢掉，而是知道这层新语法到底帮你约束和包装了什么。

## 3. 🤔 ES6 `class` 到底带来了什么？

它带来的是一层更清晰、更严格的对象定义语法，而不是一套完全不同的运行时对象系统。

```js
class Person {}
const Animal = class {}
```

类声明和类表达式都存在，但类有两个和函数很不同的特点：

- 类不能像函数声明那样被正常提升使用。
- 类受块作用域约束。

所以 `class` 更像是“把构造函数 + 原型 + 继承”整理成了一套官方语法。

## 4. 🤔 `constructor` 和实例化规则有什么特别之处？

`constructor` 是类实例化时会执行的构造函数：

```js
class Person {
  constructor(name) {
    this.name = name
  }
}

const p = new Person('Jake')
```

它最重要的规则有三个：

- 类构造函数必须通过 `new` 调用。
- 不写 `constructor` 也会有一个默认构造函数。
- 构造函数默认返回 `this`，但也可以显式返回别的对象。

与普通函数最大的使用差异是：类构造函数不能被当成普通函数直接调用。

## 5. 🤔 实例成员、原型成员和静态成员应该怎么区分？

可以把它们理解成三层。

实例成员：放在 `this` 上，每个实例独有。

```js
class Person {
  constructor() {
    this.nicknames = ['Jake', 'J-Dog']
  }
}
```

原型成员：写在类块里，实例共享。

```js
class Person {
  sayName() {
    console.log('prototype method')
  }
}
```

静态成员：加 `static`，挂在类本身上，不挂在实例上。

```js
class Person {
  static create() {
    return new Person()
  }
}
```

这三层如果分不清，就很容易把方法和数据放错位置。

## 6. 🤔 `extends` 和 `super` 在类继承里分别负责什么？

`extends` 负责建立继承关系，`super` 负责在派生类里访问父类能力。

```js
class Vehicle {
  constructor(licensePlate) {
    this.licensePlate = licensePlate
  }
}

class Bus extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate)
  }
}
```

这里要记住几个规则：

- 派生类构造函数里，调用 `super()` 之前不能访问 `this`。
- `super()` 本质上是在调用父类构造函数。
- 静态方法里也可以通过 `super` 调父类静态方法。

所以 `super` 不是魔法字，而是类继承体系里的一个正式入口。

## 7. 🤔 类还能做哪些更进阶的事？

这章里还有几个很值得保留的点。

第一，可以用 `new.target` 模拟抽象基类，阻止某个类被直接实例化。

第二，可以继承内置类型，比如扩展 `Array`：

```js
class SuperArray extends Array {
  shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this[i], this[j]] = [this[j], this[i]]
    }
  }
}
```

第三，类里可以定义生成器方法和默认迭代器，让实例直接成为可迭代对象。

第四，可以通过 mixin 组合多个行为，但工程上仍然要警惕继承链过深的问题。

## 8. 🤔 学完类之后最稳定的结论是什么？

最稳定的结论有三条。

- `class` 让对象和继承代码更清晰，但底层仍然是原型系统。
- 类最核心的分层仍然是实例成员、原型成员和静态成员。
- `extends` / `super` 把继承语法标准化了，但不会自动消除继承设计本身的复杂度。

所以真正掌握类，不是会写 `class` 关键字，而是知道什么该放实例、什么该放原型、什么时候继承真的值得用。
