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
- [12. 🤔 let、const 真的有被提升吗？](#12--letconst-真的有被提升吗)
- [13. 🆚 提升 ≠ 内存分配](#13--提升--内存分配)
- [14. 🤔 var、let、const 到底提升了什么？](#14--varletconst-到底提升了什么)
- [15. 🔗 References](#15--references)

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

## 12. 🤔 let、const 真的有被提升吗？

- 先说答案：
  - **let、const 也被提升了。**

---

- 🤔 这个问题对我们写代码有影响吗？
  - **几乎没有**
  - 从撸代码的层面来看，该问题其实没必要深究，我们只需要知道这一点就行 —— **使用 let、const 声明的变量，无法在声明之前访问**。至于它们到底有没有提升其实对我们撸代码没啥影响。

---

- **记录这个问题的原因：**
  - 看到有些人说 let、const 没有提升，有些人说有，就查阅了一下 ECMA 官方对此的描述。
  - https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-let-and-const-declarations
  - 这是 ECMA 官方文档，14.3.1 Let and Const Declarations

---

- **ECMA 官方文档 - 原文**
  - `let` and `const` declarations define variables that are scoped to the [running execution context](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#running-execution-context)'s LexicalEnvironment. The variables are created when their containing [Environment Record](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-environment-records) is instantiated but may not be accessed in any way until the variable's [LexicalBinding](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#prod-LexicalBinding) is evaluated. A variable defined by a [LexicalBinding](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#prod-LexicalBinding) with an [Initializer](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#prod-Initializer) is assigned the value of its [Initializer](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#prod-Initializer)'s [AssignmentExpression](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#prod-AssignmentExpression) when the [LexicalBinding](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#prod-LexicalBinding) is evaluated, not when the variable is created. If a [LexicalBinding](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#prod-LexicalBinding) in a `let` declaration does not have an [Initializer](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#prod-Initializer) the variable is assigned the value undefined when the [LexicalBinding](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#prod-LexicalBinding) is evaluated.
- 中文翻译
  - `let`和`const`声明的变量是在其执行上下文的词法环境中定义的。**变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问**。如果一个`let`声明中的词法绑定有初始化器，则在词法绑定被求值时，变量被赋予初始化器的赋值表达式的值，而不是在变量创建时。如果`let`声明中的词法绑定没有初始化器，则在词法绑定被求值时，变量被赋值为`undefined`。
    - 关键在于这句话：**变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问**。这句话说明了 **`let`** 和 **`const`** 声明的变量是提前被创建的（这部分称为“提升”），但在实际执行到声明语句之前，它们是不可访问的。这解释了为什么在声明之前访问这些变量会导致错误。
- **官方对“提升”的定义** - 在 ECMAScript 规范中，变量和函数的提升是通过 **创建词法环境**（Lexical Environment）来描述的（这里所说的词法环境是指作用域 scope）。在 **创建词法环境**（Lexical Environment） 的时候，如果变量就被丢到了这个词法环境中，那就意味着被提升了。
  - 对于 `var` 声明，ECMAScript 规范表示 **变量声明在创建词法环境时被处理**。这意味着在代码执行之前，变量已经被声明，但尚未初始化。
  - 对于 `let` 和 `const` 声明，规范描述了这些 **变量在进入词法环境时被创建**，但它们在初始化之前处于未初始化状态，访问它们会导致 `ReferenceError`。
  - 小结：使用 var、let、const 声明的变量都会被提升，因为它们都会在创建上下文（执行上下文环境 scope）的时候被丢到作用域中。由于 var 被丢到作用域中做了一些处理（初始化），所以在程序中提前访问 var 声明的变量。而 let、const 仅仅是丢到作用域中，但是它们并没有被初始化，所以不能在声明之前访问它们。
- **变量在其环境记录实例化时被创建**
  - 当你在一个作用域（例如函数或块级作用域，就是 let、const 所在的那块空间）内声明了变量（使用 `let` 或 `const`），这些变量在作用域开始时就已经“被创建”了。也就是说，JavaScript 引擎在进入这个作用域时，已经知道这些变量存在，并在内部为它们分配了空间。
- **在变量的词法绑定（指初始化）被求值之前，无法以任何方式访问**
  - 尽管这些变量已经被创建，但在实际执行到它们的声明语句之前，你无法访问它们。这段 **时间** 被称为暂时性死区（TDZ）。如果你在 TDZ 内尝试访问这些变量，会抛出一个 `ReferenceError`。
    - “时间” 这个词比较有意思，在细读文档之前，一直以为 “死区” 指的是 “某一段区域范围”，实际上指的是 “时间范围”。不过代码也是按照时间一步步往下执行的，因此理解成区域也没啥毛病。
  - 这句话中提到的额 “词法绑定求值” 是指在代码执行过程中，当 JavaScript 引擎遇到变量声明时，将变量名与实际的内存位置绑定，并将初始值赋给变量的过程。对于 let 和 const，在代码执行到声明语句时，才会进行这种赋值操作。

## 13. 🆚 提升 ≠ 内存分配

- 在 JavaScript 中，变量声明的提升（Hoisting）和内存分配（Memory Allocation）是两个相关但不同的步骤。
- **提升（Hoisting）**
  - 提升是指在 JavaScript 解释器执行代码之前，将变量和函数声明提升到其作用域的顶部。这意味着在代码运行之前，所有的变量和函数声明已经被识别（也就是说 JS 解释器已经知道这玩意儿存在了）。提升过程适用于 var、let、const 声明以及函数声明。
- **内存分配（Memory Allocation）**
  - 内存分配是指为变量分配内存空间以存储其值。这一步骤涉及将变量与特定的内存地址相关联。

## 14. 🤔 var、let、const 到底提升了什么？

- 要回答这个问题，得知道变量声明在编译阶段和执行阶段的分工。既然说是提升，一定是有些流程被提前做了。提升的本质是 **声明阶段** 被提前到作用域顶部。
- **核心三阶段**（所有变量声明共有）：
  1. **声明（Declaration）**：在词法环境注册标识符（作用域创建）
  2. **初始化（Initialization）**：分配内存并设置初始值
  3. **赋值（Assignment）**：将具体值绑定到变量（执行阶段）
- **var 声明流程**
  1. **编译阶段**：声明变量并 **初始化为 `undefined`**（提升）
  2. **执行阶段**：执行赋值操作（如 `= 10`）
- **let 声明流程**
  1. **编译阶段**：声明变量（**未初始化**，进入暂时性死区）
  2. **执行阶段**：
     - 执行到 `let` 语句时初始化（默认 `undefined`）
     - 执行赋值操作（如 `= 20`）
- **const 声明流程**
  1. **编译阶段**：声明变量（**未初始化**，进入暂时性死区）
  2. **执行阶段**：执行到 `const` 语句时**同步完成初始化与赋值**（不可拆分）
- **提升的本质**

| 关键字 | 提升内容 | 表现示例 |
| --- | --- | --- |
| `var` | 声明 + 初始化（`undefined`） | `console.log(a); var a=10;` → `undefined` |
| `let` | 仅声明（未初始化） | `console.log(b); let b=20;` → `ReferenceError` |
| `const` | 仅声明（未初始化） | `console.log(c); const c=30;` → `ReferenceError` |

- **结论**
  - `var` 提升，并完成了内存分配，初始化为 `undefined`。
  - `let` 和 `const` 提升，但在声明语句之前处于暂时性死区（TDZ），不会初始化。内存分配和初始化在代码执行到声明语句时发生。

## 15. 🔗 References

- [掘金，《理解 ES6 中的 TDZ（暂时性死区）》][1]
- [Variables and assignment • JavaScript for impatient programmers (ES2022 edition)][2]
- [掘金，深究一下 let、const 到底有没有提升？][3]
- [YouTube，Variable Hoisting with LET, CONST and VAR in JavaScript][4]
- [ECMA 官方文档，14.3.1 Let and Const Declarations][5]

[1]: https://juejin.cn/post/6844903753015885831
[2]: https://exploringjs.com/js/book/ch_variables-assignment.html
[3]: https://juejin.cn/post/6993676334635417614#heading-2
[4]: https://www.youtube.com/watch?v=VbHaL_J8Ex0
[5]: https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-let-and-const-declarations
