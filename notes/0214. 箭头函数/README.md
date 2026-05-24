# [0214. 箭头函数](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0214.%20%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 箭头函数的基本写法是什么？](#3--箭头函数的基本写法是什么)
- [4. 🤔 参数括号什么时候可以省略？](#4--参数括号什么时候可以省略)
- [5. 🤔 什么时候会隐式返回？](#5--什么时候会隐式返回)
- [6. 🤔 箭头函数的 `this` 有什么特别之处？](#6--箭头函数的-this-有什么特别之处)
- [7. 🤔 箭头函数有哪些限制？](#7--箭头函数有哪些限制)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 箭头函数的基本语法
- 参数括号的省略规则
- 函数体与隐式返回
- 箭头函数中的词法 `this`
- 箭头函数的限制

## 2. 🫧 评价

- 箭头函数不是普通函数的短写替代品。它确实让回调更轻，但它最核心的差异是没有自己的 `this` 和 `arguments`。

## 3. 🤔 箭头函数的基本写法是什么？

箭头函数是 ES6 新增的函数表达式写法，使用 `=>` 定义函数。

```js
const sum = (a, b) => {
  return a + b
}

console.log(sum(1, 2)) // 3
```

它常用于需要传入短函数的场景，比如数组方法：

```js
const numbers = [1, 2, 3]
const doubled = numbers.map((number) => number * 2)

console.log(doubled) // [2, 4, 6]
```

## 4. 🤔 参数括号什么时候可以省略？

只有一个参数时，可以省略参数外层括号。

```js
const double = (number) => number * 2
```

没有参数或有多个参数时，括号不能省略。

```js
const getRandom = () => Math.random()
const sum = (a, b) => a + b
```

如果参数有默认值、解构、收集参数等更复杂写法，也应该保留括号。

```js
const greet = (name = 'guest') => `hello ${name}`
```

## 5. 🤔 什么时候会隐式返回？

箭头函数如果省略大括号，箭头右侧的表达式会被直接作为返回值。

```js
const double = (number) => number * 2
```

如果使用大括号，就进入普通函数体语法，需要显式写 `return`。

```js
const double = (number) => {
  return number * 2
}
```

返回对象字面量时，要用括号包起来，否则大括号会被解析成函数体。

```js
const createUser = (name) => ({ name })
```

## 6. 🤔 箭头函数的 `this` 有什么特别之处？

箭头函数没有自己的 `this`。它会捕获定义位置外层作用域中的 `this`。

```js
function Counter() {
  this.count = 0

  setTimeout(() => {
    this.count++
    console.log(this.count)
  }, 1000)
}

new Counter()
```

这让箭头函数很适合事件回调、定时器回调、数组方法回调等场景，尤其是在你希望保留外层 `this` 时。

但也正因为如此，不要把箭头函数随手写成对象方法：

```js
const user = {
  name: 'Jake',
  sayName: () => {
    console.log(this.name)
  },
}
```

这里的 `this` 并不会指向 `user`。

## 7. 🤔 箭头函数有哪些限制？

箭头函数有几个重要限制：

- 没有自己的 `arguments`。
- 没有自己的 `super`。
- 没有自己的 `new.target`。
- 不能用作构造函数。
- 没有 `prototype` 属性。

```js
const User = () => {}

new User() // TypeError
```

所以箭头函数适合做轻量回调和表达式函数，不适合写需要动态 `this`、构造实例或依赖 `arguments` 的函数。
