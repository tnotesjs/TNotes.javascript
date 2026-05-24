# [0216. 理解参数](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0216.%20%E7%90%86%E8%A7%A3%E5%8F%82%E6%95%B0)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 JavaScript 函数会检查参数数量和类型吗？](#3--javascript-函数会检查参数数量和类型吗)
- [4. 🤔 `arguments` 是什么？](#4--arguments-是什么)
- [5. 🤔 命名参数和 `arguments` 会同步吗？](#5--命名参数和-arguments-会同步吗)
- [6. 🤔 箭头函数里能用 `arguments` 吗？](#6--箭头函数里能用-arguments-吗)
- [7. 🤔 参数是按值传递还是按引用传递？](#7--参数是按值传递还是按引用传递)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- JavaScript 参数数量和类型的灵活性
- `arguments` 类数组对象
- 命名参数与 `arguments` 的关系
- 严格模式下的差异
- 箭头函数中的参数访问
- 参数按值传递

## 2. 🫧 评价

- JavaScript 函数参数的灵活性是双刃剑。它让函数调用非常自由，也要求你自己处理参数数量、类型和默认行为。

## 3. 🤔 JavaScript 函数会检查参数数量和类型吗？

不会。

JavaScript 函数定义了几个参数，并不代表调用时必须传几个参数，也不代表参数类型会被检查。

```js
function sayHi(name, message) {
  console.log(`Hello ${name}, ${message}`)
}

sayHi('Jake')
sayHi('Jake', 'welcome', 123)
sayHi()
```

这几种调用都不会因为参数数量不匹配而语法报错。没传的参数值是 `undefined`，多传的参数仍然可以通过 `arguments` 访问。

## 4. 🤔 `arguments` 是什么？

`arguments` 是非箭头函数内部可用的类数组对象，它保存调用函数时实际传入的参数。

```js
function printArgs() {
  console.log(arguments[0])
  console.log(arguments.length)
}

printArgs('a', 'b')
```

它像数组一样可以用下标访问，也有 `length`，但它不是 `Array` 的实例。

因此，早期代码经常通过 `arguments.length` 判断调用者传了多少参数：

```js
function add() {
  if (arguments.length === 1) {
    return arguments[0] + 10
  }

  if (arguments.length === 2) {
    return arguments[0] + arguments[1]
  }
}
```

## 5. 🤔 命名参数和 `arguments` 会同步吗？

在非严格模式下，命名参数和对应的 `arguments` 项之间会保持同步。

```js
function add(num1, num2) {
  arguments[1] = 10
  console.log(num2)
}

add(1, 2) // 10
```

但这不表示它们是同一个内存地址，只是语言层保持了这种联动。

如果调用时根本没有传第二个参数，手动设置 `arguments[1]` 也不会凭空创建并同步到第二个命名参数。

```js
function add(num1, num2) {
  arguments[1] = 10
  console.log(num2)
}

add(1) // undefined
```

严格模式下，这种同步关系会被切断，修改 `arguments` 不会影响命名参数。

## 6. 🤔 箭头函数里能用 `arguments` 吗？

箭头函数没有自己的 `arguments`。

```js
const fn = () => {
  console.log(arguments)
}

fn(1, 2) // ReferenceError
```

如果确实需要处理不定数量参数，优先使用收集参数：

```js
const fn = (...values) => {
  console.log(values)
}

fn(1, 2, 3) // [1, 2, 3]
```

如果箭头函数定义在普通函数内部，它可以沿作用域链访问外层普通函数的 `arguments`，但这通常不如收集参数清晰。

## 7. 🤔 参数是按值传递还是按引用传递？

ECMAScript 中所有参数都是按值传递。

如果传入的是原始值，函数收到的是这个值的副本。

如果传入的是对象，函数收到的是对象引用这个值的副本。因此函数内部可以通过这份引用修改对象内容，但不能通过给参数重新赋值来替换外部变量引用。

```js
function setName(object) {
  object.name = 'Jake'
  object = { name: 'Mia' }
}

const user = {}
setName(user)

console.log(user.name) // Jake
```

这也是为什么说“对象参数按引用传递”并不准确。真正传递的是引用值本身的一份副本。
