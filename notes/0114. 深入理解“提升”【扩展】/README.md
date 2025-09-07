# [0114. 深入理解“提升”【扩展】](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0114.%20%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3%E2%80%9C%E6%8F%90%E5%8D%87%E2%80%9D%E3%80%90%E6%89%A9%E5%B1%95%E3%80%91)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `let`、`const` 真的有被提升吗？](#3--letconst-真的有被提升吗)
- [4. 🤔 “提升（Hosting）” 一词是哪来的，为什么 ECMAScript 没有具体的定义呢？](#4--提升hosting-一词是哪来的为什么-ecmascript-没有具体的定义呢)
- [5. 🔍 ECMAScript 官方文档 - 原文](#5--ecmascript-官方文档---原文)
- [6. 🆚 词法环境 `LexicalEnvironment` vs. 作用域 `scope`](#6--词法环境-lexicalenvironment-vs-作用域-scope)
- [7. 📒 提升（Hosting） ≠ 可访问（Accessible）、提升（Hosting） ≠ 内存分配（Memory Allocation）](#7--提升hosting--可访问accessible提升hosting--内存分配memory-allocation)
- [8. 🤔 let、const 声明的变量，何时脱离暂时性死区？](#8--letconst-声明的变量何时脱离暂时性死区)
- [9. 🤔 var、let、const 到底提升了什么？](#9--varletconst-到底提升了什么)
- [10. 🤔 如何看待类似“提升”这样存在“冲突”的社区术语呢？](#10--如何看待类似提升这样存在冲突的社区术语呢)
- [11. 🔗 引用](#11--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

::: warning 注意

- 未读过 v8 源码，以下内容均是从网上查阅资料整理而来。

:::

- 提升（Hosting）
- 词法环境（LexicalEnvironment）
- 词法绑定求值（LexicalBinding）
- 作用域（Scope）
- 暂时性死区（TDZ）
- 内存分配（Memory Allocation）

## 2. 🫧 评价

- 这篇笔记花费了大量时间来写“提升”相关的内容，直接给干 🤮 了。
  - ECMAScript 官方没有具体说“提升”是什么，社区中又有各种各样关于“提升”的说法。为了验证哪种说法才是正确的，查了不少资料。
  - 可以瞅瞅结尾【🤔 如何看待类似“提升”这样存在“冲突”的社区术语呢？】这一部分，记录了一些反思。总结下来就是一句话 —— **读懂代码、会写代码就行**。
- 这篇笔记记录的内容当做扩展来看即可，是否知道这些内容对日常写 JS 没啥影响。

## 3. 🤔 `let`、`const` 真的有被提升吗？

- 问题拆解：
  - 在没有明确 **Hosting** 是什么之前，针对这个问题结果 “是”、“否” 的讨论是无意义的，因为你可以从你的角度来给提升下一个定义，然后自证你的观点。
  - 遗憾的是，官方没有给出“提升”的具体定义，咱们只能根据社区对“提升”的定义：**`变量和函数声明在代码执行之前被移动到它们各自作用域的顶部`**，并结合官方规范中对某些关键词的定义来拆解：
    - **`声明`** 表示 **在当前环境记录中注册标识符（变量名、函数名等）的语法结构**，包括 `var`、`let`、`const`、`function`、`class` 等。其核心运行时行为是调用 `CreateBinding` 方法，**在进入作用域时提前“登记”标识符的存在 —— 但是否初始化、是否可访问，取决于声明类型**。
    - **`作用域`** 表示一个 **标识符可被访问的代码区域**，由词法结构（如函数体、块 `{}`、模块等）决定。在引擎内部，每个作用域对应一个 **词法环境（Lexical Environment）或变量环境（Variable Environment）**，用于管理该区域内所有标识符的绑定关系。
  - 回归到我们的问题：**`let`、`const` 真的有被提升吗？**，换一种问法就是：**对于使用 let、const 声明的变量 x，在 JS 引擎进入到对应的作用域时（也就是实例化词法环境时），是否提前“登记”了 x 的存在。**

---

- 参考答案：
  - 在规范层面，`let` 和 `const` 声明的变量也会被“提升” —— 即在词法环境创建时就被创建，但不会被初始化。因此在声明前访问会进入“暂时性死区”（TDZ）并抛出 `ReferenceError`。
  - `var`、`let`、`const` 声明的变量都会在进入其作用域时被注册到当前词法环境中。
  - `var` 会同时被初始化为 `undefined`，因此可提前访问。
  - `let`/`const` 仅被创建，未初始化，访问会报错，直到执行到声明语句完成初始化。

---

- 🤔 这个问题对我们写代码有影响吗？
  - **几乎没有**
  - 从撸代码的层面来看，该问题其实没必要深究，我们只需要知道这一点就行 —— **使用 let、const 声明的变量，无法在声明之前访问**。至于它们到底有没有提升其实对我们撸代码没啥影响。
- 🤔 既然这个问题对写代码没啥影响，为什么要记录这个问题呢？
  - 看到有些人说 let、const 没有提升，有些人说有，好奇谁是对的，因此记录了这些内容。

::: swiper

![阮一峰 - 《ES6 教程》 - let 和 const 命令](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-07-19-32-29.png)

![掘金 - 深究一下let、const到底有没有提升？](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-07-19-32-39.png)

:::

## 4. 🤔 “提升（Hosting）” 一词是哪来的，为什么 ECMAScript 没有具体的定义呢？

- “提升”一词并非官方术语，是社区为了教学方便造出来的一个词，因此对于它的定义也是多样的。
  - 1️⃣ 提升 = 提前完成声明 + 完成赋值 + 当前作用域可访问
  - 2️⃣ 提升 = 提前完成声明
  - 上述是社区中两种比较主流的观点，如果按照官方的描述，那么说法 2️⃣ 会更加严谨一些。从教学的角度来看，1️⃣ 更好理解一些，提升 = 可用，未提升 = 不可用。
  - 你可以认为两种说法都是对的，在阅读技术文档时，不必深究谁对谁错，重在理解在特定语境下作者想要表达的意思即可。
- “提升（Hosting）” 是一个 **社区术语**，在 ECMAScript 官方文档中并没有提及。
  - 因为“Hoisting” 是一个模糊的、非正式的、教学用语，**容易引起误解**。
  - 规范追求精确、可执行、无歧义，所以用结构化术语描述行为，如：“创建绑定（CreateBinding）”、“初始化（Initialize）”、“环境记录（Environment Record）”、“词法环境实例化（Lexical Environment Instantiation）”……。

## 5. 🔍 ECMAScript 官方文档 - 原文

::: tip

- 在翻阅“ECMAScript 官方文档”的时候，你会发现在介绍 var、let、const 这些内容的时候，压根儿就没有 Hosting 这个词出现，倒是“词法环境 LexicalEnvironment”、“词法绑定 LexicalBinding” 这样更为专业的术语会频频出现。

:::

> [14.3.1 Let and Const Declarations][5]
>
> let and const declarations define variables that are scoped to the running execution context's LexicalEnvironment. The variables are created when their containing Environment Record is instantiated but may not be accessed in any way until the variable's LexicalBinding is evaluated. A variable defined by a LexicalBinding with an Initializer is assigned the value of its Initializer's AssignmentExpression when the LexicalBinding is evaluated, not when the variable is created. If a LexicalBinding in a let declaration does not have an Initializer the variable is assigned the value undefined when the LexicalBinding is evaluated.

- 中文翻译：`let` 和 `const` 声明的变量是在其执行上下文的词法环境中定义的。**变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问**。如果一个 `let` 声明中的词法绑定有初始化器，则在词法绑定被求值时，变量被赋予初始化器的赋值表达式的值，而不是在变量创建时。如果 `let` 声明中的词法绑定没有初始化器，则在词法绑定被求值时，变量被赋值为 `undefined`。

::: tip 👉 **变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问**。

- 这句话其实就已经告诉我们答案了，下面来拆解一下这句话：
- 1️⃣ `变量在其环境记录实例化时被创建`
  - **JS 引擎在执行某个作用域中的脚本时，会实例化环境记录（可以理解为创建作用域），此时变量也就被创建了** —— 这就是大多数人说的，**变量声明会被提升到作用域的顶部**。
- 2️⃣ `但在变量的词法绑定被求值之前，无法以任何方式访问`
  - **变量虽然给你创建了，但是你还不能访问，必须等赋值之后你才能访问。**

:::

::: code-group

```js [var]
console.log(a) // undefined
var a = 1
console.log(a) // 1

// 等效于：
var a = undefined // var 的特殊之处在于提升声明的同时，也提升了初始化操作
console.log(a)
a = 1
console.log(a)
```

```js [let、const]
console.log(a) // ❌ ReferenceError: a is not defined
let a = 1 // 词法绑定发生在这里
console.log(a) // 1

// 等效于：
let a // 实际上定义语句并不在这里，这里是内部完成的预定义，需要完成词法绑定求值后才能访问变量 a。
console.log(a) // 规范说：没有赋值之前，不能访问，所以这里会报错
a = 1
// 规范说：如果 let 声明中的词法绑定没有初始化器，则在词法绑定被求值时，变量被赋值为 undefined。
// 也就是说如果我们没有在使用 let 声明 a 的时候，引擎会在执行到原本的变量声明位置时，给它设置一个默认的 undefined 值，如果是 const 则必须要给定一个值。
// 这里我们在初始化的时候指定了值 1，所以 a 指向 1。
console.log(a) // 输出 1
```

:::

## 6. 🆚 词法环境 `LexicalEnvironment` vs. 作用域 `scope`

```js
// 每个词法环境包含两个部分
LexicalEnvironment = {
  EnvironmentRecord: {
    /* 变量、函数的绑定表，比如 x → 1 */
  },
  outer: 引用父级词法环境,
  // 用于实现作用域链（Scope Chain）
  // “作用域链” = 词法环境的 outer 链
}

// demo
let a = 1
function foo() {
  let b = 2
  return function bar() {
    let c = 3
    console.log(a, b, c) // 1, 2, 3
  }
}
// 执行时会创建多个词法环境：
// 全局词法环境 → 包含 a, foo
// foo 的词法环境 → 包含 b，outer 指向全局
// bar 的词法环境 → 包含 c，outer 指向 foo 的词法环境
// → 当 bar 访问 a 时，引擎沿着 outer 链向上查找 → 这就是“作用域链”的实现！
```

- **🤔 这里说的“词法环境”，不就是“作用域 scope”吗？为什么官方用“词法环境 Lexical Environment”来说明而非 scope 来说明呢？**
  - 准确地说 —— `词法环境 ≠ scope`
  - 开发者说：“作用域”，是模糊的、人类语言描述的概念。
  - 引擎说：“词法环境”，是精确、可执行、可规范化的数据结构，便于引擎实现和规范制定。
  - 为了方便表述，可以暂且将其视作是一个概念。
- **🤔 词法环境和作用域之间的关系是？**
  - 词法环境（Lexical Environment）是 JavaScript 引擎内部用于实现作用域（scope）的数据结构，是 scope 的底层实现机制。
  - 当我们说
    - 表层：“进入一个块作用域”
    - 底层：引擎实际上是创建了一个新的词法环境
  - 当我们说
    - 表层：“变量被提升到作用域顶部”
    - 底层：**引擎是在词法环境创建阶段注册了该变量名**
      - 这句话很重要，由于变量名被注册了，所以当我们在同一个 scope 中不能再使用这些变量名了。

```text
开发者视角（抽象概念）       引擎视角（具体实现）
       │                            │
       ▼                            ▼
  全局作用域 (scope)     →    全局词法环境 (Lexical Environment)
       │                            │ .outer = null
       ▼                            ▼
  函数作用域 (scope)     →    函数词法环境 (Lexical Environment)
       │                            │ .outer → 全局词法环境
       ▼                            ▼
  块级作用域 (scope)     →    块级词法环境 (Lexical Environment)
                                  │ .outer → 函数词法环境

→ 每个“作用域”在引擎中都有一个对应的“词法环境”来支撑它。
→ “子作用域”之所以能访问“父作用域”的变量，是因为它的词法环境的 .outer 指向了父词法环境。
```

## 7. 📒 提升（Hosting） ≠ 可访问（Accessible）、提升（Hosting） ≠ 内存分配（Memory Allocation）

- 先理清几个常见的有关“提升的误解”：
  - **提升（Hosting） ≠ 可访问（Accessible）**
  - **提升（Hosting） ≠ 内存分配（Memory Allocation）**
- `var`、`let`、`const`
  - 使用 `var`、`let`、`const` 声明的变量都会被提升，因为这些变量名都会在创建词法环境时被引擎注册。
  - 由于 `var` 声明的变量在被注册的同时做了一些处理（初始化为 `undefined`），所以在程序中可以提前（程序执行到对应的赋值语句之前）访问 `var` 声明的变量。
  - 而 `let`、`const` 仅仅是丢到作用域中，但是它们并没有被初始化，所以不能在声明之前访问它们。

::: code-group

```js [var]
console.log(a) // undefined
var a = 1
console.log(a) // 1
```

```js [let]
console.log(a) // ❌ ReferenceError: a is not defined
let a = 1
console.log(a) // 1
```

```js [const]
console.log(a) // ❌ ReferenceError: a is not defined
const a = 1
console.log(a) // 1
```

:::

- **提升和内存分配**
  - 在 JavaScript 中，变量声明的提升和内存分配是两个相关但不同的步骤。
    - 提升是指在 JavaScript 解释器执行代码之前，将变量和函数声明提升到其作用域的顶部。这意味着在代码运行之前，所有的变量和函数声明已经被识别（也就是说 JS 解释器已经知道这玩意儿存在了）。提升过程适用于 var、let、const 声明以及函数声明。
    - 内存分配是指为变量分配内存空间以存储其值。这一步骤涉及将变量与特定的内存地址相关联。
  - `var`、`let`、`const`
    - `var` 提升了，并完成了内存分配
    - `let`、`const` 提升了，但未完成内存分配

---

- **变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问**。
  - 这句话说明了 `let` 和 `const` 声明的变量是提前被创建的（这部分称为“提升”），但在实际执行到声明语句之前，它们是不可访问的。这解释了为什么在声明之前访问这些变量会导致错误。
  - 当你在一个作用域（例如函数或块级作用域，就是 let、const 所在的那块空间）内声明了变量（使用 `let` 或 `const`），这些变量在作用域开始时就已经“被创建”了。也就是说，JavaScript 引擎在进入这个作用域时，已经知道这些变量存在，并在内部为它们分配了空间（准确点儿可以说是预留了位置）。
  - 更通俗一些的说法 —— 当 JavaScript 引擎进入一个块级作用域（比如 `{}`）时，它会先“登记”这个作用域内所有 `let`/`const` 变量的名字，但此时这些变量还不能用，要等到执行到对应的声明语句时才会初始化。

## 8. 🤔 let、const 声明的变量，何时脱离暂时性死区？

- 在变量的 **词法绑定（指初始化）被求值** 之前，无法以任何方式访问。尽管这些变量已经被创建，但在实际执行到它们的声明语句之前，你无法访问它们。这段 **时间** 被称为暂时性死区（TDZ）。如果你在 TDZ 内尝试访问这些变量，会抛出一个 `ReferenceError`。
- **时间**
  - “时间” 这个词比较有意思，在细读文档之前，一直以为 “死区” 指的是 “某一段区域范围”，实际上指的是 “时间范围”。不过代码也是按照时间一步步往下执行的，因此理解成区域也没啥毛病。
  - “死区”本质上是一个执行阶段（时间维度），而非代码位置的“区域”。虽然代码是线性执行的，看起来像“某段代码区域不能访问”，但规范中更强调的是“在初始化之前的时间点访问会报错”。
- **词法绑定求值**
  - 这句话中提到的 “词法绑定求值” 是指在代码执行过程中，当 JavaScript 引擎遇到变量声明时，将变量名与实际的内存位置绑定，并将初始值赋给变量的过程。对于 let 和 const，在代码执行到声明语句时，才会进行这种赋值操作。
  - 当执行流到达变量声明语句时，JavaScript 引擎完成对该变量的初始化（如果是 let 无初始值则赋 undefined，const 必须有初始值），此时变量才脱离“暂时性死区”，变为可访问状态。

## 9. 🤔 var、let、const 到底提升了什么？

- 要回答这个问题，得知道变量声明在编译阶段和执行阶段的分工。既然说是提升，一定是有些流程被提前做了。提升的本质是 **声明阶段** 被提前到作用域顶部。
- **核心三阶段**（所有变量声明共有）：
  1. **声明（Declaration）**：在词法环境注册标识符（作用域创建）
  2. **初始化（Initialization）**：分配内存并设置初始值
  3. **赋值（Assignment）**：将具体值绑定到变量（执行阶段）
- **var 声明流程**
  1. **在进入作用域时**：声明变量并 **初始化为 `undefined`**（提升）
  2. **执行阶段**：执行赋值操作（如 `= 10`）
- **let 声明流程**
  1. **在进入作用域时**：声明变量（**未初始化**，进入暂时性死区）
  2. **执行阶段**：
     - 执行到 `let` 语句时初始化（默认 `undefined`）
     - 执行赋值操作（如 `= 20`）
- **const 声明流程**
  1. **在进入作用域时**：声明变量（**未初始化**，进入暂时性死区）
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

## 10. 🤔 如何看待类似“提升”这样存在“冲突”的社区术语呢？

::: tip 写这篇笔记的一些反思

- ✅ 重点：
  - 理解在特定语境下作者想要表达的意思。
  - 具体怎么做呢？计算机领域的俩字箴言 `IO` - `读、写` - **能读懂代码、能写代码**。
- 🚫 禁：
  - 不要去花过多时间 battle 到底谁对谁错，这会大大影响你的学习进度。
  - 社区造出这么一个词，就是为了让你能够快速理解它想传递你的信息，花费大把时间去查文档，反而得不偿失。
  - 当然，花费了时间和精力去查阅一些细节时，收获也是有的，比如对 JS 引擎在创建作用域、变量的时候流程更清晰了一些。
- 🔍 辨别：
  - 当你在学习某某特定知识点的时候，发现有多派说法，其中很可能的一个原因就是关于 xxx 的定义不统一导致的。
- 💪 方法论：
  - 当遇到“冲突”的描述时，你可以初步认为它们都是对的，但是程序执行的逻辑往往是确定的，也是更方便验证的，如果发现某一方的描述和运行结果对不上，那就可以直接宣判死刑了。

:::

## 11. 🔗 引用

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
