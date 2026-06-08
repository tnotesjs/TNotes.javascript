# [0174. 函数](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0174.%20%E5%87%BD%E6%95%B0)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 函数最基本的语法是什么？](#3-函数最基本的语法是什么)
- [4. 函数参数在这里应该怎样理解？](#4-函数参数在这里应该怎样理解)
- [5. `return` 会怎样影响函数执行？](#5-return-会怎样影响函数执行)
- [6. 函数一定要返回值吗？](#6-函数一定要返回值吗)
- [7. 严格模式对函数有哪些限制？](#7-严格模式对函数有哪些限制)

<!-- endregion:toc -->

## 1. 本节内容

- 函数声明语法
- 参数和函数调用
- `return` 的行为
- 无返回值时的结果
- 严格模式下的函数限制

## 2. 评价

函数是 JavaScript 后续所有抽象能力的起点。这里先抓住最朴素的规则：函数封装语句，通过参数接收值，通过 `return` 返回值；更复杂的闭包、箭头函数、构造函数和类方法，后面都会建立在这套规则上。

## 3. 函数最基本的语法是什么？

ECMAScript 使用 `function` 关键字声明函数，后面跟函数名、参数列表和函数体。

```js
function sayHi(name, message) {
  console.log('Hello ' + name + ', ' + message)
}
```

调用函数时，通过函数名加括号执行，参数放在括号里：

```js
sayHi('Ada', 'how are you today?')
```

函数的价值是把一组语句封装起来，让它们可以在不同地方、不同时间重复执行。

## 4. 函数参数在这里应该怎样理解？

函数参数是函数内部的局部变量。调用函数时，传入的值会绑定到这些参数名上。

```js
function sum(num1, num2) {
  return num1 + num2
}

const result = sum(5, 10)
console.log(result) // 15
```

这一章只介绍函数的基本形式。参数传递、`arguments`、默认参数、扩展参数、箭头函数等更细的内容，会在后面的函数章节继续展开。

## 5. `return` 会怎样影响函数执行？

函数可以使用 `return` 返回一个值。

```js
function sum(num1, num2) {
  return num1 + num2
}
```

一旦执行到 `return`，函数会立即停止，后面的代码不会再执行：

```js
function sum(num1, num2) {
  return num1 + num2
  console.log('不会执行')
}
```

一个函数内部可以有多个 `return`，常见于不同分支返回不同结果：

```js
function diff(num1, num2) {
  if (num1 < num2) {
    return num2 - num1
  }

  return num1 - num2
}
```

## 6. 函数一定要返回值吗？

JavaScript 函数不需要声明返回值类型，也不要求必须返回值。

如果函数没有执行带值的 `return`，最终结果就是 `undefined`：

```js
function logMessage(message) {
  console.log(message)
}

const result = logMessage('hello')
console.log(result) // undefined
```

`return` 也可以不带值，用来提前结束函数：

```js
function validate(value) {
  if (!value) {
    return
  }

  console.log('valid')
}
```

实践中，函数最好保持返回行为一致：要么主要用于返回值，要么主要用于执行副作用。某些分支返回值、某些分支不返回值，会增加调试成本。

## 7. 严格模式对函数有哪些限制？

严格模式下，函数相关语法会更严格。

主要限制包括：

- 函数名不能是 `eval` 或 `arguments`。
- 参数名不能是 `eval` 或 `arguments`。
- 同一个函数中不能有两个同名参数。

这些限制的目标是减少歧义，避免一些历史上容易出问题的写法。

函数是 JavaScript 最重要的基础设施之一。后续章节会继续讨论函数表达式、箭头函数、闭包、递归、私有变量等内容；这一篇先建立最基本的声明、调用和返回规则。
