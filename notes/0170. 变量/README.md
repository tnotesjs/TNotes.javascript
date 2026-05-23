# [0170. 变量](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0170.%20%E5%8F%98%E9%87%8F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 JavaScript 变量为什么说是松散类型的？](#3--javascript-变量为什么说是松散类型的)
- [4. 🤔 `var` 有哪些历史行为？](#4--var-有哪些历史行为)
- [5. 🤔 `let` 为什么更适合现代代码？](#5--let-为什么更适合现代代码)
- [6. 🤔 `let` 在循环中解决了什么问题？](#6--let-在循环中解决了什么问题)
- [7. 🤔 `const` 表示值一定不可变吗？](#7--const-表示值一定不可变吗)
- [8. 🤔 现在应该怎样选择变量声明？](#8--现在应该怎样选择变量声明)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- JavaScript 变量的松散类型
- `var` 的函数作用域和声明提升
- `let` 的块级作用域和暂时性死区
- `const` 的声明限制和引用特征
- 变量声明的现代实践

## 2. 🫧 评价

变量这一节最值得抓住的不是“怎么声明”，而是“声明后这个名字在哪儿有效、什么时候可访问、能不能重新赋值”。`var`、`let`、`const` 的差异，本质上都是作用域和可变性差异。

## 3. 🤔 JavaScript 变量为什么说是松散类型的？

JavaScript 变量是松散类型的。变量本身不固定绑定某一种数据类型，它只是某个值的名字。

也就是说，同一个变量可以先保存字符串，再保存数值：

```js
let message = 'hi'
message = 100
```

这种写法是合法的，但不推荐随意改变同一个变量保存的值类型。因为变量名通常承载语义，如果 `message` 一会儿是字符串、一会儿是数字，读代码的人很难判断它到底代表什么。

## 4. 🤔 `var` 有哪些历史行为？

`var` 是早期 ECMAScript 中声明变量的主要方式。它有两个非常重要的特征：函数作用域和声明提升。

使用 `var` 在函数内部声明变量时，这个变量属于当前函数：

```js
function test() {
  var message = 'hi'
}

test()
console.log(message) // ReferenceError
```

如果省略 `var` 直接赋值，在非严格模式下可能意外创建全局变量：

```js
function test() {
  message = 'hi'
}

test()
console.log(message) // 'hi'
```

这是非常不推荐的写法。严格模式下，给未声明变量赋值会抛出错误。

`var` 还有声明提升行为：

```js
console.log(age) // undefined
var age = 26
```

运行时可以把它理解成：

```js
var age
console.log(age)
age = 26
```

声明被提升了，赋值没有提升。这就是很多 `var` 代码容易让人误读的原因。

## 5. 🤔 `let` 为什么更适合现代代码？

`let` 和 `var` 都可以声明变量，但 `let` 是块级作用域。

```js
if (true) {
  let age = 26
}

console.log(age) // ReferenceError
```

块级作用域让变量的有效范围更小，也更贴近实际使用位置。

`let` 还不允许在同一个块作用域中重复声明同名变量：

```js
let count = 1
let count = 2 // SyntaxError
```

另一个重要概念是暂时性死区。在 `let` 声明执行之前，即使 JavaScript 引擎已经知道这个变量会被声明，也不能访问它：

```js
console.log(age) // ReferenceError
let age = 26
```

这能避免很多“声明前读取到 `undefined`”的隐蔽问题。

## 6. 🤔 `let` 在循环中解决了什么问题？

`var` 声明的循环变量会泄漏到循环外部：

```js
for (var i = 0; i < 5; i++) {}
console.log(i) // 5
```

使用 `let` 后，循环变量只存在于循环块内部：

```js
for (let i = 0; i < 5; i++) {}
console.log(i) // ReferenceError
```

`let` 还能解决经典的异步循环变量问题：

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}

// 依次输出 0、1、2
```

每次迭代都会创建新的绑定，因此回调拿到的是当次迭代自己的 `i`。

## 7. 🤔 `const` 表示值一定不可变吗？

`const` 声明的变量必须在声明时初始化，并且之后不能重新赋值：

```js
const age = 26
age = 36 // TypeError
```

不过，`const` 限制的是变量绑定本身，不是对象内部内容。

```js
const person = {}
person.name = 'Ada'

console.log(person.name) // 'Ada'
```

这里没有重新给 `person` 赋一个新对象，只是修改了它引用的对象内容，因此是允许的。

如果希望对象本身也不能被修改，可以考虑 `Object.freeze()`，但这属于对象层面的限制，不是 `const` 自己提供的能力。

## 8. 🤔 现在应该怎样选择变量声明？

现代 JavaScript 的常见实践是：`const` 优先，`let` 次之，尽量不用 `var`。

可以这样判断：

| 场景                     | 推荐声明   |
| ------------------------ | ---------- |
| 声明后不会重新赋值       | `const`    |
| 后续需要重新赋值         | `let`      |
| 维护旧代码或理解历史行为 | 了解 `var` |

`const` 优先的好处是让变量意图更明确。读者看到 `const`，就知道这个变量绑定不会被重新指向其他值；如果后面有人误赋值，运行时也会尽早报错。
