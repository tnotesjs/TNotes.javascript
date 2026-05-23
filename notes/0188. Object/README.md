# [0188. Object](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0188.%20Object)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `Object` 在集合语境里到底是什么？](#3--object-在集合语境里到底是什么)
- [4. 🤔 创建对象最常见的方式有哪些？](#4--创建对象最常见的方式有哪些)
- [5. 🤔 什么时候用点语法，什么时候用中括号？](#5--什么时候用点语法什么时候用中括号)
- [6. 🤔 为什么对象字面量很适合做配置对象？](#6--为什么对象字面量很适合做配置对象)
- [7. 🤔 `Object` 适合什么，不适合什么？](#7--object-适合什么不适合什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `Object` 作为基础引用类型的定位
- 对象字面量与 `Object` 构造函数
- 点语法与中括号语法
- 对象字面量作为配置对象的常见模式
- `Object` 与 `Map` 的边界

## 2. 🫧 评价

- `Object` 太常见了，常见到很多人反而不再把它当成一种需要选择的数据结构。真正重要的不是会不会写对象字面量，而是知道它适合表达“结构化字段”，不适合硬扛所有键值存储场景。

## 3. 🤔 `Object` 在集合语境里到底是什么？

`Object` 是 JavaScript 最基础的引用类型之一。它最适合表达一组有名字的字段，也就是“这个数据有哪几个属性、每个属性对应什么值”。

```js
const person = {
  name: 'Nicholas',
  age: 29,
}
```

从集合角度看，它是一种名值对容器，但更偏向“结构化对象”，而不是通用映射表。

## 4. 🤔 创建对象最常见的方式有哪些？

最常见的两种方式是：

- `new Object()`
- 对象字面量

```js
const person1 = new Object()
person1.name = 'Nicholas'

const person2 = {
  name: 'Nicholas',
  age: 29,
}
```

两者都能工作，但日常开发里更常用对象字面量，因为更短、更集中，也更容易看清对象的整体结构。

空对象同样可以直接用字面量创建：

```js
const person = {}
```

## 5. 🤔 什么时候用点语法，什么时候用中括号？

点语法最直观，也是首选：

```js
console.log(person.name)
```

中括号语法主要有两个场景。

第一，属性名来自变量：

```js
const propertyName = 'name'
console.log(person[propertyName])
```

第二，属性名本身不适合写成标识符，比如带空格、特殊字符，或者你明确要按字符串键处理：

```js
person['first name'] = 'Nicholas'
```

也就是说，点语法适合静态字段，中括号适合动态键名。

## 6. 🤔 为什么对象字面量很适合做配置对象？

因为它能把一组可选参数打包成一个结构清晰的对象。

```js
function displayInfo(options) {
  let output = ''

  if (typeof options.name === 'string') {
    output += `Name: ${options.name}\n`
  }

  if (typeof options.age === 'number') {
    output += `Age: ${options.age}\n`
  }

  console.log(output)
}

displayInfo({ name: 'Nicholas', age: 29 })
displayInfo({ name: 'Greg' })
```

这种写法特别适合“必选参数不多，但可选项很多”的函数接口，因为比一长串位置参数更清晰。

## 7. 🤔 `Object` 适合什么，不适合什么？

`Object` 适合：

- 表达某个实体的固定字段
- 传递配置项
- 表示结构清晰的业务数据

`Object` 不太适合：

- 需要任意类型键的映射
- 频繁插入、删除大量键值对的场景
- 强依赖插入顺序的键值存储语义

当你真正需要“映射”而不是“对象字段”时，通常应该考虑 `Map`。把 `Object` 当成所有键值问题的唯一答案，往往会让代码越来越别扭。
