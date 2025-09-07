# [0002. 变量声明提升和暂时性死区](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0002.%20%E5%8F%98%E9%87%8F%E5%A3%B0%E6%98%8E%E6%8F%90%E5%8D%87%E5%92%8C%E6%9A%82%E6%97%B6%E6%80%A7%E6%AD%BB%E5%8C%BA)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🆚 `var`、`let`、`const`](#3--varletconst)
- [4. 📒 变量声明提升和暂时性死区](#4--变量声明提升和暂时性死区)
- [5. 💻 demos.1 - var 声明](#5--demos1---var-声明)
- [6. 💻 demos.2 - let 和 const 声明](#6--demos2---let-和-const-声明)
- [7. 💻 demos.3 - 函数声明](#7--demos3---函数声明)
- [8. 💻 demos.4 - 函数表达式](#8--demos4---函数表达式)
- [9. 💼 interviews.1 - 下面的代码输出什么？](#9--interviews1---下面的代码输出什么)
- [10. 💼 interviews.2 - 下面的代码输出的结果是什么？](#10--interviews2---下面的代码输出的结果是什么)
- [11. 💼 interviews.3 - 请谈谈什么是变量声明提升？](#11--interviews3---请谈谈什么是变量声明提升)
- [12. 🔗 引用](#12--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 理解变量声明提升
- 知道 var、let、const 声明之间的区别
- 知道“函数声明”和“函数表达式”两种写法之间的区别
- 了解暂时性死区（TDZ）

## 2. 🫧 评价

- 变量声明提升可以算是面试题常客，需要知道变量声明提升是什么。
- 本文介绍了什么是变量声明提升、什么是暂时性死区，并通过一些示例，来了解在 JS 中不同类型的变量的声明和提升机制。
- 结尾对 ECMA 官方文档原文的引用和分析对日常撸代码基本无影响，可以作为扩展内容来看待。

## 3. 🆚 `var`、`let`、`const`

| **关键字** | **声明提升** | **初始化提升** | **赋值时机** | **暂时性死区** |
| --- | --- | --- | --- | --- |
| `var` | ✅ 是 | ✅ 初始化为 `undefined` | 执行赋值语句时 | ❌ 无 |
| `let` | ✅ 是 | ❌ 否 | 执行声明语句时 | ✅ 有 |
| `const` | ✅ 是 | ❌ 否 | 必须在声明时赋值 | ✅ 有 |

## 4. 📒 变量声明提升和暂时性死区

- **变量声明提升是什么**
  - 在 JavaScript 中，**变量声明提升**（Hoisting）是一种行为，指的是 **变量和函数声明在代码执行之前被移动到它们各自作用域的顶部**。这意味着无论声明它们的代码在何处，都可以在声明之前访问这些变量和函数。
  - 变量声明提升可以让开发者在一定程度上灵活编码，但如果不正确理解和使用，它也可能导致难以追踪的错误和混乱。了解和掌握 JavaScript 中的提升机制对于编写可预测和可维护的代码非常重要。

```javascript
// 这是函数声明之前的位置
test() // 在这里可以调用 test

// 这是函数声明的位置
function test() {
  console.log('this is test func')
}

// 这是函数声明之后的位置
test() // 在这里也可以调用 test
```

---

- **声明会提升，但是赋值不会提升。**

```javascript
console.log(a) // => undefined
var a = 1
console.log(a) // => 5
```

---

- **变量声明提升的工作原理**
  - 当 JavaScript 代码被解释执行之前，解释器会先读取所有的变量和函数声明，并将这些声明提升到它们各自作用域的顶部。这是因为 JavaScript 的执行环境分为两个阶段：**编译阶段** 和 **执行阶段**。在编译阶段，函数声明和变量声明会被读取并放到内存中，但赋值操作不会被提升。

---

- **暂时性死区是什么**
  - 在 JavaScript 中，“暂时性死区”（Temporal Dead Zone, TDZ）是一个术语，它表示的是 **从代码块开始到变量被声明的那部分区域**，在这个区间内访问该变量会导致一个引用错误。这个概念主要与使用 `let` 和 `const` 声明变量的行为相关。

---

- **`let` 和 `const` 是否有被提升？**
  - 当你使用 `let` 或 `const` 声明变量时，这些变量从块的开始就已经存在，但直到你实际上对它们进行声明和初始化之前，你不能访问它们。如果你试图在声明前访问这些变量，JavaScript 引擎会抛出一个 `ReferenceError`，说明你试图访问一个还不可用的变量。
  - 这是因为 `let` 和 `const` 声明的变量不会像 `var` 那样在编译阶段进行变量提升至作用域顶部。虽然从技术上讲，它们确实被提升了，但在代码执行到声明语句之前，它们都处于不可访问状态，即处于暂时性死区。

---

- **暂时性死区的作用**
  - 暂时性死区是 JavaScript 中 `let` 和 `const` 引入的一个重要特性，它强制开发者以更加严格和有序的方式声明和使用变量，从而提高代码的 **可读性** 和 **可维护性**。
  - 暂时性死区的存在 **有助于 JavaScript 开发者避免几种常见的编程错误**，例如：
  - **变量提前使用**：确保开发者不会在变量准备好之前就开始使用它，这有助于避免运行时错误。
  - **变量覆盖**：在较大的作用域中已有同名变量时，`let` 和 `const` 声明的局部变量会阻止提前访问全局变量或外部作用域的变量，从而避免可能的逻辑错误。

## 5. 💻 demos.1 - var 声明

::: code-group

<<< ./demos/1/1.js {}

:::

## 6. 💻 demos.2 - let 和 const 声明

::: code-group

<<< ./demos/2/1.js {}

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-27-13-13-02.png)

## 7. 💻 demos.3 - 函数声明

::: code-group

<<< ./demos/3/1.js {}

:::

## 8. 💻 demos.4 - 函数表达式

::: code-group

<<< ./demos/4/1.js {}

:::

## 9. 💼 interviews.1 - 下面的代码输出什么？

::: code-group

<<< ./interviews/1/1.js {}

:::

::: details 参考答案

- 执行 `console.log(a, b, c);` 时，`a` 和 `b` 是 `undefined`，而 `c` 是已定义的函数。

<<< ./interviews/1/2.js {}

:::

## 10. 💼 interviews.2 - 下面的代码输出的结果是什么？

::: code-group

<<< ./interviews/2/1.js {}

:::

::: details 参考答案

```javascript
// result1 60
```

- 提示：丢到浏览器控制台中查看运行结果，如果直接在 nodejs 环境跑，会报错
- nodejs 环境
  - ![图 1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-14-54-27.png)
- 浏览器环境
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-14-54-00.png)

:::

## 11. 💼 interviews.3 - 请谈谈什么是变量声明提升？

::: details 参考答案

- **变量声明提升是 JavaScript 在编译阶段对声明的“预处理”。`var` 提升并初始化为 undefined，`let/const` 提升但受限于 TDZ，函数声明提升后可以在声明前调用。**

---

下面是具体说明：

- 在 JavaScript 中，**变量声明提升（Hoisting）** 指的是：在代码执行之前的编译阶段，JavaScript 引擎会将变量和函数的声明提升到它们所在作用域的顶部，从而可以在声明语句之前访问它们。
- **`var`** 声明会被提升到作用域顶端，并在创建阶段初始化为 `undefined`，因此可以在声明前访问，只是值为 `undefined`。
- **`let` 和 `const`** 也会被提升，但在执行到声明语句之前处于 **暂时性死区（TDZ）**，在此之前访问会抛出 `ReferenceError`。
- **函数声明**（`function foo(){}`）会被整体提升，函数体在创建阶段就已初始化，因此可以在声明前调用。

```js
console.log(a) // undefined
var a = 1

console.log(b) // ❌ ReferenceError
let b = 2

foo() // ✅ "hello"
function foo() {
  console.log('hello')
}
```

:::

## 12. 🔗 引用

- [掘金，《理解 ES6 中的 TDZ（暂时性死区）》][1]
- [阮一峰 - 《ES6 教程》 - let 和 const 命令][7]
- [Variables and assignment • JavaScript for impatient programmers (ES2022 edition)][2]
- [掘金，深究一下 let、const 到底有没有提升？][3]
- [YouTube，Variable Hoisting with LET, CONST and VAR in JavaScript][4]
- [ECMA 官方文档，14.3.1 Let and Const Declarations][5]
- [v8][6]

[1]: https://juejin.cn/post/6844903753015885831
[2]: https://exploringjs.com/js/book/ch_variables-assignment.html
[3]: https://juejin.cn/post/6993676334635417614#heading-2
[4]: https://www.youtube.com/watch?v=VbHaL_J8Ex0
[5]: https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-let-and-const-declarations
[6]: https://github.com/v8/v8
[7]: https://wangdoc.com/es6/let
