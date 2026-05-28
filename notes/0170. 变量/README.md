# [0170. 变量](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0170.%20%E5%8F%98%E9%87%8F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 💡 笔记知识点小结](#3--笔记知识点小结)
- [4. 🤔 内存、变量、值，三者之间的关系是？](#4--内存变量值三者之间的关系是)
- [5. 🤔 JavaScript 变量为什么说是松散类型的？](#5--javascript-变量为什么说是松散类型的)
- [6. 🤔 `var` 是什么？](#6--var-是什么)
  - [6.1. `var` 关键字](#61-var-关键字)
  - [6.2. `var` 关键字的作用域特性](#62-var-关键字的作用域特性)
  - [6.3. 小结](#63-小结)
- [7. 🤔 `let` 是什么？](#7--let-是什么)
  - [7.1. let 关键字](#71-let-关键字)
  - [7.2. 块级作用域](#72-块级作用域)
- [8. 🤔 用 `var` 声明的循环变量在循环中会出现什么问题？为什么使用 `let` 可以就可以解决此问题？【经典历史闭包陷阱问题】](#8--用-var-声明的循环变量在循环中会出现什么问题为什么使用-let-可以就可以解决此问题经典历史闭包陷阱问题)
- [9. 🤔 `const` 是什么？](#9--const-是什么)
  - [9.1. const 关键字](#91-const-关键字)
  - [9.2. const 的 “常量约束” 本质](#92-const-的-常量约束-本质)
    - [原始类型](#原始类型)
    - [引用类型](#引用类型)
    - [栈内存、堆内存](#栈内存堆内存)
- [10. 🤔 现代开发应该使用哪个（`const`、`let`、`var`）来声明变量？](#10--现代开发应该使用哪个constletvar来声明变量)
- [11. 🤔 变量声明提升是什么？](#11--变量声明提升是什么)
- [12. 🤔 暂时性死区是什么？](#12--暂时性死区是什么)
  - [12.1. `let` 和 `const` 是否有被提升？](#121-let-和-const-是否有被提升)
  - [12.2. 暂时性死区的作用](#122-暂时性死区的作用)
- [13. 💼 面试题：请谈谈 `var`、`let`、`const`](#13--面试题请谈谈-varletconst)
- [14. 💼 面试题：下面的代码输出什么？](#14--面试题下面的代码输出什么)
- [15. 💼 面试题：下面的代码输出的结果是什么？](#15--面试题下面的代码输出的结果是什么)
- [16. 💼 面试题：请谈谈什么是变量声明提升？](#16--面试题请谈谈什么是变量声明提升)
- [17. 💻 demos.1 - `var` - 理解变量和值](#17--demos1---var---理解变量和值)
- [18. 💻 demos.2 - `var` - 区分大小写](#18--demos2---var---区分大小写)
- [19. 💻 demos.3 - `var` - 变量的声明、赋值](#19--demos3---var---变量的声明赋值)
- [20. 💻 demos.4 - `var` - 仅声明未赋值为 undefined](#20--demos4---var---仅声明未赋值为-undefined)
- [21. 💻 demos.5 - `var` - 隐式创建全局变量](#21--demos5---var---隐式创建全局变量)
- [22. 💻 demos.6 - `var` - 使用未声明的变量会报错](#22--demos6---var---使用未声明的变量会报错)
- [23. 💻 demos.7 - `var` - 可一次声明多个变量](#23--demos7---var---可一次声明多个变量)
- [24. 💻 demos.8 - `var` - 理解“动态”类型](#24--demos8---var---理解动态类型)
- [25. 💻 demos.9 - `var` - 变量重复声明无效](#25--demos9---var---变量重复声明无效)
- [26. 💻 demos.10 - `var` - 变量重复声明并重新赋值](#26--demos10---var---变量重复声明并重新赋值)
- [27. 💻 demos.11 - `var` - 作用域特性](#27--demos11---var---作用域特性)
- [28. 💻 demos.12 - `let` - 块级作用域](#28--demos12---let---块级作用域)
- [29. 💻 demos.13 - `let` - 使用 var、let 定义 for 循环的循环变量](#29--demos13---let---使用-varlet-定义-for-循环的循环变量)
- [30. 💻 demos.14 - `let` - let 暂时性死区](#30--demos14---let---let-暂时性死区)
- [31. 💻 demos.15 - `let` - 函数参数默认值中的死区](#31--demos15---let---函数参数默认值中的死区)
- [32. 💻 demos.16 - `let` - 其他奇怪的报错](#32--demos16---let---其他奇怪的报错)
- [33. 💻 demos.17 - `let` - 同一作用域内不允许重复声明](#33--demos17---let---同一作用域内不允许重复声明)
- [34. 💻 demos.18 - `let` - for 循环的特别之处](#34--demos18---let---for-循环的特别之处)
- [35. 💻 demos.19 - `let` - let 出现之前的一些历史问题](#35--demos19---let---let-出现之前的一些历史问题)
- [36. 💻 demos.20 - `const` - 常量不允许重新赋值](#36--demos20---const---常量不允许重新赋值)
- [37. 💻 demos.21 - `const` - 声明的同时完成初始化赋值](#37--demos21---const---声明的同时完成初始化赋值)
- [38. 💻 demos.22 - `const` - 引用类型，确保地址不变](#38--demos22---const---引用类型确保地址不变)
- [39. 💻 demos.23 - `const` - 对象冻结](#39--demos23---const---对象冻结)
- [40. 💻 demos.24 - `Hoisting` - var 声明](#40--demos24---hoisting---var-声明)
- [41. 💻 demos.25 - `TDZ` - let 和 const 声明](#41--demos25---tdz---let-和-const-声明)
- [42. 💻 demos.26 - `Hoisting` - 函数声明](#42--demos26---hoisting---函数声明)
- [43. 💻 demos.27 - `Hoisting` - 函数表达式](#43--demos27---hoisting---函数表达式)
- [44. 🔍 深入理解“提升”【不重要】](#44--深入理解提升不重要)
  - [44.1. “提升”有明确的官方定义吗？](#441-提升有明确的官方定义吗)
  - [44.2. `let`、`const` 真的有被提升吗？](#442-letconst-真的有被提升吗)
    - [问题拆解](#问题拆解)
    - [参考答案](#参考答案)
    - [这个问题对我们写代码有影响吗？](#这个问题对我们写代码有影响吗)
    - [既然这个问题对写代码没啥影响，为什么要记录这个问题呢？](#既然这个问题对写代码没啥影响为什么要记录这个问题呢)
  - [44.3. “提升（Hoisting）” 一词是哪来的？为什么 ECMAScript 没有具体的定义呢？](#443-提升hoisting-一词是哪来的为什么-ecmascript-没有具体的定义呢)
    - [“提升（Hoisting）”一词的由来及社区的常见的两种定义](#提升hoisting一词的由来及社区的常见的两种定义)
    - [为什么 ECMAScript 没有具体的定义](#为什么-ecmascript-没有具体的定义)
  - [44.4. ECMAScript 官方文档原文对 `let`、`const` 声明的描述](#444-ecmascript-官方文档原文对-letconst-声明的描述)
  - [44.5. 对比：词法环境 `LexicalEnvironment` vs 作用域 `Scope`](#445-对比词法环境-lexicalenvironment-vs-作用域-scope)
    - [词法环境 `LexicalEnvironment`](#词法环境-lexicalenvironment)
    - [Lexical Environment ≠ Scope](#lexical-environment--scope)
    - [词法环境和作用域之间的关系是？](#词法环境和作用域之间的关系是)
  - [44.6. 提升（Hosting） ≠ 可访问（Accessible）、提升（Hosting） ≠ 内存分配（Memory Allocation）](#446-提升hosting--可访问accessible提升hosting--内存分配memory-allocation)
  - [44.7. `let`、`const` 声明的变量，何时脱离暂时性死区？](#447-letconst-声明的变量何时脱离暂时性死区)
  - [44.8. `var`、`let`、`const` 到底提升了什么？](#448-varletconst-到底提升了什么)
  - [44.9. 🤔 如何看待类似“提升”这样存在“冲突”的社区术语呢？](#449--如何看待类似提升这样存在冲突的社区术语呢)
- [45. 🔗 引用](#45--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 变量
- 内存
- 值
- 动态类型
- `var`
- `let`
- `const`
- 经典的“闭包陷阱”问题
- 对象冻结 `Object.freeze`
- 对象深度冻结（递归方式）
- 栈（Stack）内存
- 堆（Heap）内存
- 提升（Hoisting）
- 词法环境（LexicalEnvironment）
- 词法绑定求值（LexicalBinding）
- 作用域（Scope）
- 暂时性死区（TDZ）
- 内存分配（Memory Allocation）

## 2. 🫧 评价

变量这一节最值得抓住的不是“怎么声明”，而是“声明后这个名字在哪儿有效、什么时候可访问、能不能重新赋值”。`var`、`let`、`const` 的差异，本质上都是作用域和可变性差异。

---

var 关键字和变量：

- 本节主要介绍“变量”相关的基础知识点，比如内存、变量、值的概念，以及 var 关键字的使用。
- 内存、变量、值，这些概念是基础的通识，在学习其他编程语言时也一样会接触到。
- “思维导图”部分对本节的核心内容做了汇总，可以全屏放大后搂一眼，了解笔记的大致内容。
- 文中还提到了 let、const 关键字，有关它们的介绍请见后续笔记内容。
- 🤔 如何看待 var？
  - 虽然说 var 关键字已经退出历史舞台了，但是在一些开源项目中，还是会看到 var 的身影，所以还是 有必要了解 var 关键字的一些基本特性，目的是为了能读懂别人用到 var 的程序。
  - 可能会看到 var 的场景：
    - 项目起步时间比较早，年代比较久远；
    - 项目中的核心语言并非 js，只需要用 js 实现很简单的脚本逻辑即可，var 这些被我们看似“弊端”的灵活特性，正是脚本所需要的。

## 3. 💡 笔记知识点小结

- 核心概念
  - 变量的本质
    - 变量可以看作是内存空间的引用，它代表了一个存储在内存中的数据值。
    - 每个变量都关联一个特定的内存位置，这个位置存储了变量的值。
    - 任何可以书写数值的地方，都可以书写变量。
  - 定义变量的本质
    - 定义变量实际上是告诉计算机在内存中为该变量分配一定的空间。
  - 给变量赋值的本质
    - 赋值操作是将某个数据值存储在变量关联的内存空间中。之后，每当我们引用这个变量，计算机就会到内存空间中读取其中的值。
- 自动回收 ♻️
  - 若一个空间没有变量指向它，那么这块空间将被 JS 视作垃圾，会被自动回收。
- 语法糖
  - 变量可以在声明的时候同时完成赋值操作（语法糖）。
  - 本质上是两步操作 —— 声明 + 赋值
- 定义变量
  - var
    - 使用 var 关键字声明的变量的值是可变的，变量可以被重新赋值，新的值会覆盖原来的值。
    - 还有很多细节……（不过不太重要，现阶段来看它已经 out 了，推荐使用 let、const 来声明变量。）
    - var 不推荐
  - let
    - 有块级作用域
    - 有暂时性死区
    - 声明的变量可以被重新赋值
    - let 推荐
  - const
    - 有块级作用域
    - 有暂时性死区
    - 声明的变量可以被赋值，但一旦赋值后不可更改，可以作为“常量”。
    - const 推荐
- 访问不存在的变量
  - 若使用一个未声明（不存在）的变量，会导致错误。
  - 特殊情况：使用 typeof 检测变量的数据类型时，可以是未声明的变量，得到的结果是 "undefined"。
- 声明提升
  - 变量和函数的声明在代码执行前会被移动到它们所在作用域的顶部。
  - 这种提升不会超越脚本块的顶端。

## 4. 🤔 内存、变量、值，三者之间的关系是？

在编程中，变量（门牌号）指向内存中的特定位置（房间），这个位置中存储的内容（房间里的东西）就是值。

- 内存 👉🏻 酒店 -> 内存就像一栋酒店，有很多房间（存储空间）供客人使用。
- 变量 👉🏻 门牌 -> 变量就像房间的门牌号，用来标识和找到特定的房间。
- 值 👉🏻 房间里的东西 -> 值就像房间里的东西，可以是家具、家电等，是实际存储在房间（内存）里的内容。

::: swiper

![内存](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-10-25-07-25-01.png)

![变量](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-10-25-07-25-08.png)

![值](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-10-25-07-25-18.png)

:::

## 5. 🤔 JavaScript 变量为什么说是松散类型的？

JavaScript 变量是松散类型的（也称“动态类型”）。变量本身不固定绑定某一种数据类型，它只是某个值的名字。

也就是说，同一个变量可以先保存字符串，再保存数值：

```js
let message = 'hi'
message = 100
```

这种写法是合法的，但不推荐随意改变同一个变量保存的值类型。因为变量名通常承载语义，如果 `message` 一会儿是字符串、一会儿是数字，读代码的人很难判断它到底代表什么。

## 6. 🤔 `var` 是什么？

### 6.1. `var` 关键字

`var` 是早期 ECMAScript 中声明变量的主要方式。它有两个非常重要的特征：函数作用域和声明提升。

使用 `var` 在函数内部声明变量时，这个变量属于当前函数：

```js
function test() {
  var message = 'hi'
}

test()
console.log(message) // ❌ ReferenceError: message is not defined
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

在变量环境的创建阶段，变量绑定已建立，初始值为 `undefined`，执行阶段才执行赋值。

运行时可以把它理解成：

```js
var age
console.log(age)
age = 26
```

声明被提升了，赋值没有提升。这就是很多 `var` 代码容易让人误读的原因。

### 6.2. `var` 关键字的作用域特性

- 函数作用域：当 `var` 在函数内部声明时，它的作用域仅限于该函数内。这意味着只能在声明它的函数内部访问该变量。
- 全局作用域：如果 `var` 在任何函数外部声明，则它具有全局作用域，可以在代码的任何地方访问该变量，甚至在浏览器环境中会成为 `window` 对象的属性。
- 提前初始化（Hoisting）：`var` 声明会被提升到其作用域的顶部，但赋值不会被提升。因此，在声明之前访问变量会导致其值为 `undefined` 而不是报错。
- 可重复声明：在同一作用域中可以多次使用 `var` 声明同名变量，后面的声明不会报错
  - 如果后面的声明没有赋值，则不会覆盖之前的声明，相当于后面的声明不存在
  - 如果后面的声明有赋值，依旧不会覆盖之前的声明，声明还是只有一个，后面的声明相当于修改了变量的值，在该声明之后访问变量时，得到的是更新之后的值

### 6.3. 小结

对 `var` 关键字有个简单的了解即可，`var` 基本算是退出历史舞台了。

ES6 推出了两个新的用于定义变量的关键字 `let`、`const`，它们解决了 `var` 关键字在定义变量时的诸多“问题”。为了方便相关知识点的介绍，后续部分笔记中依旧会刻意使用 `var` 来声明变量。但是，在实际工作中，不推荐使用 `var` 来声明变量，应该使用 `let`、`const`。

到底什么时候使用 `let`、什么时候使用 `const`，这些在后面的笔记中都会介绍到。这里可以简单提一嘴：

- `let` 用来声明“变”量 -> 也就是那些可能会被重新赋值的变量。
- `const` 用来声明“常”量 -> 就是那些在初始化好之后，咱们不会再去改变它的值的变量。

## 7. 🤔 `let` 是什么？

### 7.1. let 关键字

在 let、const 关键字出现之前，定义变量只能使用 var 关键字，var 这玩意儿存在不少问题，有很多经典的历史问题在 let、const 出现之后都引刃而解了。

let 具有块级作用域，声明的变量有暂时性死区，虽然变量声明提升了，但无法在声明语句之前访问变量，更加符合直觉。

::: tip

块级作用域和暂时性死区也是 `const` 关键字具有的的特性。

:::

### 7.2. 块级作用域

`let` 和 `var` 都可以声明变量，但 `let` 是块级作用域。

```js
if (true) {
  let age = 26
}

console.log(age) // ❌ ReferenceError: age is not defined
```

块级作用域让变量的有效范围更小，也更贴近实际使用位置。

`let` 还不允许在同一个块作用域中重复声明同名变量：

```js
let count = 1
let count = 2 // ❌ SyntaxError: Identifier 'count' has already been declared
```

另一个重要概念是暂时性死区。在 `let` 声明执行之前，即使 JavaScript 引擎已经知道这个变量会被声明，也不能访问它：

```js
console.log(age) // ❌ ReferenceError: age is not defined
let age = 26
```

这能避免很多“声明前读取到 `undefined`”的隐蔽问题。

## 8. 🤔 用 `var` 声明的循环变量在循环中会出现什么问题？为什么使用 `let` 可以就可以解决此问题？【经典历史闭包陷阱问题】

`var` 声明的循环变量会泄漏到循环外部：

```js
for (var i = 0; i < 5; i++) {}
console.log(i) // 5
```

使用 `let` 后，循环变量只存在于循环块内部：

```js
for (let i = 0; i < 5; i++) {}
console.log(i) // ❌ ReferenceError: i is not defined
```

`let` 还能解决经典的异步循环变量问题：

```js
// 如果使用 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 依次输出：3、3、3
// setTimeout 的回调函数形成了闭包，它们共享同一个 i 变量，循环结束时 i 的值是 3，所以回调函数中访问到的 i 都是 3。

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}

// 依次输出：0、1、2
// let 具有块级作用域，每次迭代都会创建新的绑定，因此每个回调函数捕获的是当次迭代自己的 i，而不是共享同一个变量。
```

## 9. 🤔 `const` 是什么？

### 9.1. const 关键字

- const 声明的变量是一个只读的常量。一旦声明，常量的值就不能改变。
- const 声明的变量，必须在声明的同时完成初始化赋值。
- const 声明的变量具有块级作用域。
- const 声明的变量具有暂时性死区。
- const 不能重复声明同名变量。

### 9.2. const 的 “常量约束” 本质

const 实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。

- 对于“原始类型”的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。
- 对于“引用类型”的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指向实际数据的指针，const 只能保证这个指针是固定的（即总是指向另一个固定的地址），至于它指向的数据结构是不是可变的，就完全不能控制了。

#### 原始类型

`const` 声明的变量必须在声明时初始化，并且之后不能重新赋值：

```js
const age = 26
age = 36 // ❌ TypeError: Assignment to constant variable.
```

#### 引用类型

`const` 限制的是变量绑定本身，不是对象内部内容。

```js
const person = {}
person.name = 'Ada'

console.log(person.name) // 'Ada'
```

这里没有重新给 `person` 赋一个新对象，只是修改了它引用的对象内容，因此是允许的。

如果希望对象本身也不能被修改，可以考虑 `Object.freeze()`，但这属于对象层面的限制，不是 `const` 自己提供的能力。

#### 栈内存、堆内存

数据类型分为：

- 原始数据类型（也叫基本数据类型），比如：String、Number、Boolean、Null、Undefined、Symbol、BigInt，直接存储在栈（stack）中的数据。
- 引用数据类型，比如：Object、Array、Function，真实的数据存放在堆（heap）内存里，在栈中存储的是该对象在堆的引用。

这里之所以要介绍“栈内存”和“堆内存”，是为了更好地理解 `const` 的“常量约束”本质。使用 `const` 声明的变量，我们不能修改的是它的栈内存中的数据。

<!-- ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-27-14-38-48.png) -->

![svg](./assets/1.svg)

- 原始数据类型的“值”直接存储在栈内存中，因此对于原始数据类型而言，`const` 声明的变量就是常量，a、b、c 都不能修改。
- 引用数据类型的“值”存储在堆内存中，在栈中存储的是指向堆内存的指针（该指针指向堆中该实体的起始地址），因此 `obj = xxx` 不允许，但是 `obj.a = xxx`、`obj.b = xxx` 是允许的（因为这并没有改变栈内存中的值）。

## 10. 🤔 现代开发应该使用哪个（`const`、`let`、`var`）来声明变量？

现代 JavaScript 的常见实践是：`const` 优先，`let` 次之，尽量不用 `var`。

可以这样判断：

| 场景                     | 推荐声明   |
| ------------------------ | ---------- |
| 声明后不会重新赋值       | `const`    |
| 后续需要重新赋值         | `let`      |
| 维护旧代码或理解历史行为 | 了解 `var` |

`const` 优先的好处是让变量意图更明确。读者看到 `const`，就知道这个变量绑定不会被重新指向其他值；如果后面有人误赋值，运行时也会尽早报错。

## 11. 🤔 变量声明提升是什么？

在 JavaScript 中，变量声明提升（Hoisting）是一种行为，指的是变量和函数声明在代码执行之前被移动到它们各自作用域的顶部。这意味着无论声明它们的代码在何处，都可以在声明之前访问这些变量和函数。

变量声明提升可以让开发者在一定程度上灵活编码，但如果不正确理解和使用，它也可能导致难以追踪的错误和混乱。了解和掌握 JavaScript 中的提升机制对于编写可预测和可维护的代码非常重要。

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

声明会提升，但是赋值不会提升。

```javascript
console.log(a) // => undefined
var a = 1
console.log(a) // => 5
```

变量声明提升的工作原理：当 JavaScript 代码被解释执行之前，解释器会先读取所有的变量和函数声明，并将这些声明提升到它们各自作用域的顶部。这是因为 JavaScript 的执行环境分为两个阶段：编译阶段和执行阶段。在编译阶段，函数声明和变量声明会被读取并放到内存中，但赋值操作不会被提升。

## 12. 🤔 暂时性死区是什么？

在 JavaScript 中，“暂时性死区”（Temporal Dead Zone, TDZ）是一个术语，它表示的是从代码块开始到变量被声明的那部分区域，在这个区间内访问该变量会导致一个引用错误。这个概念主要与使用 `let` 和 `const` 声明变量的行为相关。

### 12.1. `let` 和 `const` 是否有被提升？

当你使用 `let` 或 `const` 声明变量时，这些变量从块的开始就已经存在，但直到你实际上对它们进行声明和初始化之前，你不能访问它们。如果你试图在声明前访问这些变量，JavaScript 引擎会抛出一个 `ReferenceError`，说明你试图访问一个还不可用的变量。

这是因为 `let` 和 `const` 声明的变量不会像 `var` 那样在编译阶段进行变量提升至作用域顶部。虽然从技术上讲，它们确实被提升了，但在代码执行到声明语句之前，它们都处于不可访问状态，即处于暂时性死区。

### 12.2. 暂时性死区的作用

暂时性死区是 JavaScript 中 `let` 和 `const` 引入的一个重要特性，它强制开发者以更加严格和有序的方式声明和使用变量，从而提高代码的可读性和可维护性。

暂时性死区的存在有助于 JavaScript 开发者避免几种常见的编程错误，例如：

- 变量提前使用：确保开发者不会在变量准备好之前就开始使用它，这有助于避免运行时错误。
- 变量覆盖：在较大的作用域中已有同名变量时，`let` 和 `const` 声明的局部变量会阻止提前访问全局变量或外部作用域的变量，从而避免可能的逻辑错误。

## 13. 💼 面试题：请谈谈 `var`、`let`、`const`

相同点：`var`、`let`、`const` 三者都可以声明变量。

差异：

- `var` 基本算是淘汰了，现在主要使用 `let`、`const` 来声明变量。
- `var`、`let` 允许我们先声明，后赋值。但是，`const` 必须在声明变量的同时完成初始化。

| 关键字 | 作用 | 作用域 | 声明提升 | 初始化提升 | 赋值时机 | 暂时性死区 | 重复声明变量 | 全局属性 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `var` | 声明变量 | 函数作用域 | ✅ | ✅ 初始化为 `undefined` | 执行赋值语句时 | ❌ | ✅ | ✅ |
| `let` | 声明变量 | 块级作用域 | ✅ | ❌ | 执行声明语句时 | ✅ | ❌ | ❌ |
| `const` | 声明常量 | 块级作用域 | ✅ | ❌ | 必须在声明时赋值 | ✅ | ❌ | ❌ |

函数作用域、重复声明、全局属性：

- 当 `var` 在函数内部声明时，它的作用域仅限于该函数内。这意味着只能在声明它的函数内部访问该变量。
- 如果 `var` 在任何函数外部声明（相当于在全局函数中声明），则它具有全局作用域，可以在代码的任何地方访问该变量，甚至在浏览器环境中会成为 `window` 对象的属性。

```javascript
function example() {
  console.log(x) // undefined
  var x = 10
  if (true) {
    var x = 20 // 重新声明同一变量
    console.log(x) // 20
  }
  console.log(x) // 20
}

example()
```

- 暂时性死区：Temporal dead zone（TDZ）

```javascript
// -- let 或者 const --
console.log(person) // 会报错

let person = {
  name: 'Lucy',
}
// 从一个代码块的开始直到代码执行到声明变量的行之前，
// let 或 const 声明的变量都处于“暂时性死区中。
// 使用 const 声明变量，如果在声明前使用，表现与 let 一致。
// 简单理解：let 或 const 只能先声明再访问。

// -- var --
console.log(person2) // 不会报错

var person2 = {
  name: 'Lucy',
}
// var 声明的全局变量会进行变量提升
```

- 全局属性：是否会被添加到 `window` 或 `globalThis` 等对象中

```javascript
var name = 'Lucy'
console.log(window.name) // Lucy
console.log(globalThis.name) // Lucy

const age = 12
console.log(window.age) // undefined
console.log(globalThis.age) // undefined

let gender = 'female'
console.log(window.gender) // undefined
console.log(globalThis.gender) // undefined

// var 声明的变量会被添加到全局对象中，
// 可以使用 window 和 globalThis 访问。

// let 和 const 声明的全局变量则不会添加到全局对象中。
```

## 14. 💼 面试题：下面的代码输出什么？

```js
// 问：下面的代码输出什么？

console.log(a, b, c)
var a = 1
var b = function () {}
function c() {}
```

::: details 参考答案

执行 `console.log(a, b, c);` 时，`a` 和 `b` 是 `undefined`，而 `c` 是已定义的函数。

```js
var a
var b
function c() {}

console.log(a, b, c) // 在此时，a 和 b 是 undefined，c 是函数
// undefined undefined [Function: c]

a = 1
b = function () {}

/*
JavaScript 中，变量和函数声明会被提升（Hoisting）到其作用域的顶部，但赋值操作不会提升。

代码的实际执行顺序如下：
1. 变量 a 被提升，但其赋值 1 保持在原位置。
2. 变量 b 被提升，但其赋值 function () {} 保持在原位置。
3. 函数声明 c 被提升，整个函数定义被提升。
提升后的代码等价于上述这种写法。

因此，执行 console.log(a, b, c); 时，a 和 b 是 undefined，而 c 是已定义的函数。
*/
```

:::

## 15. 💼 面试题：下面的代码输出的结果是什么？

```js
// 问：下面的代码输出的结果是什么？
let x = 20,
  y = 10

let result = add(x)
console.log('result1 ' + result)

var add = function (x, y) {
  return x + y
}

function add(x) {
  return x + 40
}
```

::: details 参考答案

```javascript
// result1 60
```

提示：丢到浏览器控制台中查看运行结果，如果直接在 nodejs 环境跑，会报错

nodejs 环境

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-14-54-27.png)

浏览器环境

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-14-54-00.png)

:::

## 16. 💼 面试题：请谈谈什么是变量声明提升？

::: details 参考答案

变量声明提升是 JavaScript 在编译阶段对声明的“预处理”。`var` 提升并初始化为 undefined，`let/const` 提升但受限于 TDZ，函数声明提升后可以在声明前调用。

下面是具体说明：

- 在 JavaScript 中，变量声明提升（Hoisting） 指的是：在代码执行之前的编译阶段，JavaScript 引擎会将变量和函数的声明提升到它们所在作用域的顶部，从而可以在声明语句之前访问它们。
- `var` 声明会被提升到作用域顶端，并在创建阶段初始化为 `undefined`，因此可以在声明前访问，只是值为 `undefined`。
- `let` 和 `const` 也会被提升，但在执行到声明语句之前处于 暂时性死区（TDZ），在此之前访问会抛出 `ReferenceError`。
- 函数声明（`function foo(){}`）会被整体提升，函数体在创建阶段就已初始化，因此可以在声明前调用。

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

## 17. 💻 demos.1 - `var` - 理解变量和值

```js
var a = 1

/*
如何理解变量和值？
变量是对“值”的具名引用。
变量就是为“值”起名，然后引用这个名字，就等同于引用这个值。
变量的名字就是变量名。

var a = 1; 如何理解这行代码？
代码先声明变量 a
然后在变量 a 与数值 1 之间建立引用关系
称为将数值 1 “赋值” 给变量 a
之后引用变量名 a 就会得到数值 1

var a = 1; 这行代码中，最前面的 var 是什么？
最前面的 var 是变量声明命令。
var 表示通知解释引擎，要创建一个变量 a。
*/
```

## 18. 💻 demos.2 - `var` - 区分大小写

```js
var a = 1
var A = 2

console.log(a)
// 1

console.log(A)
// 2

/*
js 的变量名区分大小写
A 和 a 是两个不同的变量
*/
```

## 19. 💻 demos.3 - `var` - 变量的声明、赋值

```js
// var a = 1
var a
a = 1

/*
变量的声明和赋值，是分开的两个步骤。

var a = 1;

上面的代码将它们合在了一起，实际的步骤是下面这样。

var a;
a = 1;
*/
```

## 20. 💻 demos.4 - `var` - 仅声明未赋值为 undefined

```js
var a
console.log(a)
// undefined

/*
如果只是声明变量而没有赋值，则该变量的值是 undefined。
undefined 是一个特殊的值，表示“无定义”。
*/
```

## 21. 💻 demos.5 - `var` - 隐式创建全局变量

```js
// var a = 1;
a = 1

/*
JS 是很灵活的，在声明变量的时候，如果忘记了 var 命令，JS 会自动创建一个全局变量。

写法 1：
var a = 1;

写法 2：
a = 1;

上述两种写法，基本等效。
但是，写法 2 会创建一个全局变量，而写法 1 不会。
切记，你几乎没有任何理由使用【写法 2】这种写法，因为它会创建一个全局变量，这是非常危险的。
*/
```

## 22. 💻 demos.6 - `var` - 使用未声明的变量会报错

```js
a // ❌ ReferenceError: a is not defined

/*
如果一个变量没有声明就直接使用，js 会报错，告诉你变量未定义。
如果直接使用不存在的变量 a，系统将会报错，告诉你变量 a 没有声明。
*/
```

## 23. 💻 demos.7 - `var` - 可一次声明多个变量

```js
var a, b, c, d

/*
可以在同一条 var 命令中声明多个变量。
多个变量之间用逗号分隔。
*/
```

## 24. 💻 demos.8 - `var` - 理解“动态”类型

```js
var a = 1
a = 'hello' // ok

/*
JavaScript 是一种动态类型语言。
变量的类型没有限制，变量可以随时更改类型。

var a = 1
a = 'hello'

上述写法是 ok 的
一开始 a 存放的值是一个数字类型
然后修改变量 a 的值，改为一个字符串类型
*/
```

## 25. 💻 demos.9 - `var` - 变量重复声明无效

```js
var x = 1
var x // 该语句相当于不存在

console.log(x) // 1

/*
如果使用 var 重新声明一个已经存在的变量，是无效的。
你可以认为重复声明的语句不存在。

var x = 1
var x

你可以认为第二次声明 x 的语句不存在
*/
```

## 26. 💻 demos.10 - `var` - 变量重复声明并重新赋值

```js
var x = 1

console.log(x)
// 1

var x = 2

console.log(x)
// 2

/*
如果使用 var 重复声明同一个变量
并且重复声明的时候还进行了赋值
那么重复声明则会覆盖掉前面的语句

var x = 1
var x = 2

第二次声明时进行了赋值操作（声明的同时进行初始化操作）
赋的值会覆盖先前的值

下面两种写法是等效的。

【写法 1】
var x = 1
var x = 2

【写法 2】
var x = 1
var x // 相当于不存在
x = 2
*/
```

## 27. 💻 demos.11 - `var` - 作用域特性

```js {3,6}
function example() {
  console.log(x) // undefined
  var x = 10
  console.log(x) // 10
  if (true) {
    var x = 20 // 重新声明同一变量
    console.log(x) // 20
  }
  console.log(x) // 20
}

example()
// undefined
// 10
// 20
// 20
```

在这个例子中，`x` 的值在函数范围内始终可见，并且在 `if` 块中再次声明 `x` 不会创建新的变量，而是修改同一个变量。

上述写法相当于：

```js
function example() {
  var x
  console.log(x) // undefined
  x = 10
  console.log(x) // 10
  if (true) {
    x = 20 // 修改同一变量
    console.log(x) // 20
  }
  console.log(x) // 20
}
example()
// undefined
// 10
// 20
// 20
```

## 28. 💻 demos.12 - `let` - 块级作用域

```js
{
  let a = 10
  var b = 1
}

// console.log(a) // ❌ ReferenceError: a is not defined.
console.log(b) // 1

// let 具有块级作用域

// ES6 新增了 let 命令，用来声明变量。
// let 的用法类似于 var，但是所声明的变量，只在 let 命令所在的代码块内有效。

// 上面代码在代码块之中，分别用 let 和 var 声明了两个变量。
// 然后在代码块之外调用这两个变量，结果 let 声明的变量报错，var 声明的变量返回了正确的值。
// 这表明，let 声明的变量只在它所在的代码块有效。
```

## 29. 💻 demos.13 - `let` - 使用 var、let 定义 for 循环的循环变量

::: code-group

```js [1]
for (let i = 0; i < 10; i++) {
  // ...
  // 在这里可以正常访问 i
}

// 出了块级作用域之后，将无法访问到 i。
// console.log(i)
// ❌ ReferenceError: i is not defined

// for 循环的计数器，就很合适使用 let 命令。
// 上面代码中，计数器 i 只在 for 循环体内有效，在循环体外引用就会报错。
// 这种行为，也是更加符合我们认知的。
```

```js [2]
var a = []
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i)
  }
}
a[6]() // 10
console.log(i) // 10

// 如果使用 var，最后输出的是 10。

// 原因分析：

// 来看下下面这段等效代码，你立刻就明白了。
/*
var i // 这个 i 相当于是在全局声明的一个变量。
var a = []
for (i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i)
  }
}
a[6]() // 10
console.log(i) // 10
*/

// 变量 i 是 var 命令声明的，在全局范围内都有效，所以全局只有一个变量 i。
// 每一次循环，变量 i 的值都会发生改变，而循环内被赋给数组 a 的函数内部的 console.log(i)，里面的 i 指向的就是全局的 i。
// 也就是说，所有数组 a 的成员里面的 i，指向的都是同一个 i，导致运行时输出的是最后一轮的 i 的值，也就是  10。
```

```js [3]
var a = []
for (let i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i)
  }
}
a[6]() // 6

// 如果使用 let，声明的变量仅在块级作用域内有效，最后输出的是 6。

// 上面代码中，变量 i 是 let 声明的，当前的 i 只在本轮循环有效，所以每一次循环的 i 其实都是一个新的变量，所以最后输出的是 6。
// 这里其实用到了 闭包。
```

:::

## 30. 💻 demos.14 - `let` - let 暂时性死区

::: code-group

```js [1]
// 写法 1：var 的情况
console.log(foo) // undefined
var foo = 2

// 由于 var 声明的变量提升，所以 foo 变量声明提升到顶部，所以 foo 变量在声明之前就存在，值为 undefined。
/*
上述写法 1，等效于下面这种写法：
var foo
console.log(foo)
foo = 2
*/

// 写法 2：let 的情况
console.log(bar) // ❌ 报错 ReferenceError
let bar = 2

// let 声明的变量有暂时性死区，虽然变量声明提升了，但无法在声明语句之前访问变量。
```

```js [2]
var tmp = 123

if (true) {
  tmp = 'abc' // ❌ ReferenceError
  let tmp
}

// 只要块级作用域内存在 let 命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。
// 虽然存在全局变量 tmp，但是块级作用域内 let 又声明了一个局部变量 tmp，
// 这意味着在 if 语句块内，起作用的是块级作用域内的 let 声明的 tmp，和全局的没有关系，你可以认为全局的 var tmp = 123 这一条语句不存在。
// 因此，在 let 声明变量前，对 tmp 赋值会报错。
```

```js [3]
if (true) {
  // TDZ 开始
  tmp = 'abc' // ❌ ReferenceError
  console.log(tmp) // ❌ ReferenceError
  typeof tmp // ❌ ReferenceError

  let tmp // TDZ 结束
  console.log(tmp) // undefined

  tmp = 123
  console.log(tmp) // 123
}

// 上面代码中，在 let 命令声明变量 tmp 之前，都属于变量 tmp 的“死区”。

// ES6 明确规定，如果区块中存在 let 和 const 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。
// 在代码块内，使用 let 命令声明变量之前，该变量都是不可用的。
// 这在语法上，称为“暂时性死区”（temporal dead zone，简称 TDZ）。

// typeof undeclared_variable // "undefined"
// 虽然使用 typeof 可以去检测一个还没有声明的变量。（得到结果是 undefined）
// 但是在 “暂时性死区” 中，typeof 是会报错的。
```

```js [4]
if (true) {
  console.log(typeof tmp) // ✅ 不会报错，可以正常打印出 undefined
}

if (true) {
  console.log(typeof tmp) // ❌ ReferenceError: Cannot access 'tmp' before initialization
  let tmp
}

// typeof undeclared_variable // "undefined"
// 虽然使用 typeof 可以去检测一个还没有声明的变量。（得到结果是 undefined）
// 但是在 “暂时性死区” 中，typeof 是会报错的。
```

:::

## 31. 💻 demos.15 - `let` - 函数参数默认值中的死区

```js
function bar(x = y, y = 2) {
  console.log([x, y])
}

bar() // ❌ 报错

function foo(x = 2, y = x) {
  console.log([x, y])
}
foo() // [2, 2]

// 有些“死区”比较隐蔽，不太容易发现。
// 上面代码中，调用 bar 函数之所以报错，是因为参数 x 默认值等于另一个参数 y，而此时 y 还没有声明，属于“死区”。
// 如果 y 的默认值是 x，就不会报错，因为此时 x 已经声明了。
```

## 32. 💻 demos.16 - `let` - 其他奇怪的报错

```js
var x1 = x1 // ok
let x2 = x2 // ❌ ReferenceError: x2 is not defined

// 上面代码报错，也是因为暂时性死区。
// 使用 let 声明变量时，只要变量在还没有声明完成前使用，就会报错。
// 上面这行就属于这个情况，在变量 x2 的声明语句还没有执行完成前，就去取 x 的值，导致报错“”。
```

## 33. 💻 demos.17 - `let` - 同一作用域内不允许重复声明

```js
// 写法 1 ❌ 执行前就会报错
// function func() {
//   let a = 10
//   var a = 1
// }

// 写法 2 ❌ 执行前就会报错
// function func() {
//   let a = 10
//   let a = 1
// }

// 写法 3
// function func(arg) {
//   let arg;
// }
// func() // ❌ 执行时报错

// 写法 4 ok
function func(arg) {
  // 这里相当于新开了一个块作用域
  {
    let arg
  }
}
func() // ok

// let 不允许在相同作用域内，重复声明同一个变量。
// 这也意味着不能在函数内部重新声明参数。
```

## 34. 💻 demos.18 - `let` - for 循环的特别之处

```js
for (let i = 0; i < 3; i++) {
  let i = 'abc'
  console.log(i)
}
// abc
// abc
// abc

// for 循环还有一个特别之处，就是设置循环变量的那部分是一个父作用域，而循环体内部是一个单独的子作用域。
// 上面代码正确运行，输出了 3 次 abc。
// 这表明函数内部的变量 i 与循环变量 i 不在同一个作用域，有各自单独的作用域。
// 同一个作用域不可使用 let 重复声明同一个变量，否则会报错。
```

## 35. 💻 demos.19 - `let` - let 出现之前的一些历史问题

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Var Example</title>
  </head>
  <body>
    <ul id="var-list">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
      <li>Item 4</li>
      <li>Item 5</li>
    </ul>
    <script>
      var listItems = document.querySelectorAll('#var-list li')
      for (var i = 0; i < listItems.length; i++) {
        // 错误写法
        listItems[i].addEventListener('click', function () {
          alert('Item ' + (i + 1) + ' clicked')
        })

        // 正确写法1
        // ;(function (currentIndex) {
        //   listItems[currentIndex].addEventListener('click', function () {
        //     alert('Item ' + (currentIndex + 1) + ' clicked')
        //   })
        // })(i)

        // 正确写法还有很多种，这里介绍的是其中一种使用 IIFE 的方法
      }
    </script>
  </body>
</html>
<!--
需求：点击第几个 li 就弹出几。

这是一个经典的“闭包陷阱”问题。

如果使用的是这种错误的写法，无论点击哪个 li，最终都会提示是第 6 个被点击了。
循环中的事件处理函数引用了变量 i，当点击事件触发时，所有函数访问的 i 都是循环结束后的最终值 6，导致所有事件都显示相同的索引值。
正确的做法是确保每次循环迭代时创建一个新的作用域来保存当前的 i 值。可以通过立即执行函数表达式（IIFE）来实现这一点。
虽然问题能够解决，不过写起来会感觉很别扭。
-->
```

- ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-27-14-15-51.png)
- ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-27-14-15-58.png)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Let Example</title>
  </head>
  <body>
    <ul id="let-list">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
      <li>Item 4</li>
      <li>Item 5</li>
    </ul>
    <script>
      var listItems = document.querySelectorAll('#let-list li')
      for (let i = 0; i < listItems.length; i++) {
        listItems[i].addEventListener('click', function () {
          alert('Item ' + (i + 1) + ' clicked')
        })
      }
    </script>
  </body>
</html>
<!--
只需要把 var 改为 let 即可。
接下来在写 for 循环的时候，都使用 let 关键字来定义循环变量名。
在开发项目时，要求你必须使用 var 关键字的场景是很难遇到的。
-->
```

## 36. 💻 demos.20 - `const` - 常量不允许重新赋值

```js
const PI = 3.1415
console.log(PI) // 3.1415

PI = 3 // ❌ TypeError: Assignment to constant variable.

// 上面代码表明改变常量的值会报错。
```

## 37. 💻 demos.21 - `const` - 声明的同时完成初始化赋值

```js
const foo // ❌ SyntaxError: Missing initializer in const declaration

// const 声明的变量不得改变值
// 这意味着，const 一旦声明变量，就必须立即初始化，不能留到以后赋值。

// 对于 const 来说，只声明不赋值，就会报错。
```

## 38. 💻 demos.22 - `const` - 引用类型，确保地址不变

::: code-group

```js [1]
const foo = {}

console.log(foo) // {}

foo.prop = 123 // 为 foo 添加一个属性，可以成功，因为地址没变。

console.log(foo) // { prop: 123 }

foo = {} // ❌ TypeError: "foo" is read-only

/*
const foo = {}

foo = {}
将 foo 指向另一个对象，就会报错

上面代码中，常量 foo 储存的是一个地址，这个地址指向一个对象。
不可变的只是这个地址，即不能把 foo 指向另一个地址，但对象本身是可变的，所以依然可以为其添加新属性。
*/
```

```js [2]
const arr = []
arr.push('Hello') // ✅ 因为地址没变
arr.length = 0 // ✅ 因为地址没变
arr = ['Dave'] // ❌ 因为地址变了

/*
上面代码中，常量 arr 是一个数组类型。
arr 数组本身是可写的，但是如果将另一个新数组赋值给 arr 就会报错，因为新数组的地址和原数组的地址不同。

补充：数组类型本该是定长的，但是在 js 中，我们可以自由改变数组长度（JS 解释器会帮我们自动完成扩容等行为）。
*/
```

:::

## 39. 💻 demos.23 - `const` - 对象冻结

::: code-group

```js [1]
// 'use strict'
const foo = Object.freeze({})

console.log(foo) // {}

foo.prop = 123 // 严格模式会报错
// ❌ TypeError: Cannot add property prop, object is not extensible

console.log(foo) // {}

/*
const foo = Object.freeze({})
如果真的想将对象冻结，应该使用 Object.freeze 方法。

foo.prop = 123
常规模式时，这一行不起作用；严格模式时，该行会报错。

'use strict'
在文件头部加上这个语句，就可以进入严格模式。

上面代码中，常量 foo 指向一个冻结的对象，所以添加新属性不起作用，严格模式时还会报错。
*/
```

```js [2]
var constantize = (obj) => {
  Object.freeze(obj)
  Object.keys(obj).forEach((key, i) => {
    if (typeof obj[key] === 'object') {
      // 是引用类型
      constantize(obj[key]) // 递归
    }
  })
}

// 除了将对象本身冻结，对象的属性也应该冻结。
// 通过上述做法，可以将一个对象彻底冻结。
```

:::

## 40. 💻 demos.24 - `Hoisting` - var 声明

```js
console.log(a) // => undefined
var a = 1
console.log(a) // => 1

/*
使用 var 关键字声明的变量会提升其声明，但不会提升它们的初始化（赋值）。
如果在声明之前访问变量，则该变量的值为 undefined。

实际上执行的代码如下：
var a
console.log(a)
a = 1
console.log(a)

js 引擎的工作方式是：
  先解析代码
  获取所有被声明的变量
  然后再一行一行地运行

这种工作方式所造成的结果：
  所有的变量的声明语句都会被提升到代码的头部
  这就叫做变量提升（hoisting）
*/
```

## 41. 💻 demos.25 - `TDZ` - let 和 const 声明

```js
console.log(x) // ❌ ReferenceError
let x = 10

/*
let x = 10
在变量 x 被声明之前的区域属于 x 的 TDZ
在这块区域中访问 x 将会抛出 ReferenceError 错误

let 和 const 关键字声明的变量表现得就像它们没有被提升一样。
实际上，它们被提升了，但是在初始化之前不能访问它们，这被称为“暂时性死区”（Temporal Dead Zone, TDZ）。
尝试在声明之前访问这些变量将会导致 ReferenceError。
*/
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-27-13-13-02.png)

## 42. 💻 demos.26 - `Hoisting` - 函数声明

```js
hello() // 输出：Hello, world!
function hello() {
  console.log('Hello, world!')
}

/* 
函数声明完整地被提升，即提升函数的声明和实体定义。
这意味着在声明函数之前就可以调用函数。
*/
```

## 43. 💻 demos.27 - `Hoisting` - 函数表达式

```js
console.log(hello) // 输出：undefined
var hello = function () {
  console.log('Hello, world!')
}

/*
如果函数是通过函数表达式创建的
那么只有变量名被提升
而函数的实体不会被提升
*/
```

## 44. 🔍 深入理解“提升”【不重要】

::: tip 写在前面

这一部分笔记花费了大量时间来写“提升”相关的内容，直接给干 🤮 了。

ECMAScript 官方没有具体说“提升”是什么，社区中又有各种各样关于“提升”的说法。为了验证哪种说法才是正确的，查了不少资料。

可以瞅瞅结尾【🤔 如何看待类似“提升”这样存在“冲突”的社区术语呢？】这一部分，记录了一些反思。总结下来就是一句话 => 读懂代码、会写代码就行。

这一部分的笔记记录的内容当做扩展来看即可，是否知道这些内容对日常写 JS 没啥影响。

:::

### 44.1. “提升”有明确的官方定义吗？

“Hoisting（提升）”并不是 ECMAScript 官方规范中正式定义或使用的术语。它是开发者社区为了方便理解，而对一类 JavaScript 执行现象的形象化描述和总结。

由于没有明确的官方定义，因此笔记中记录的有关“提升”的内容，其实无法验证正确性，很多内容都是基于一些社区观点的总结和分析，可能存在不同的解读和争议。

### 44.2. `let`、`const` 真的有被提升吗？

#### 问题拆解

在没有明确 Hosting 是什么之前，针对这个问题结果 “是”、“否” 的讨论是无意义的，因此需要先给提升下一个定义，然后自证观点。

遗憾的是，官方没有给出“提升”的具体定义，咱们只能根据社区对“提升”的定义：`变量和函数声明在代码执行之前被移动到它们各自作用域的顶部`，并结合官方规范中对某些关键词的定义来拆解：

- “声明”表示在当前环境记录中注册标识符（变量名、函数名等）的语法结构，包括 `var`、`let`、`const`、`function`、`class` 等。其核心运行时行为是调用 `CreateBinding` 方法，在进入作用域时提前“登记”标识符的存在。但是否初始化、是否可访问，取决于声明类型。
- “作用域”表示一个标识符可被访问的代码区域，由词法结构（如函数体、块 `{}`、模块等）决定。在引擎内部，每个作用域对应一个词法环境（Lexical Environment）或变量环境（Variable Environment），用于管理该区域内所有标识符的绑定关系。

回归到我们的问题：`let`、`const` 真的有被提升吗？，换一种问法就是：对于使用 `let`、`const` 声明的变量 `x`，在 JS 引擎进入到对应的作用域时（也就是实例化词法环境时），是否提前“登记”了 `x` 的存在。

#### 参考答案

- 在规范层面，`let` 和 `const` 声明的变量也会被“提升”，即在词法环境创建时就被创建，但不会被初始化。因此在声明前访问会进入“暂时性死区”（TDZ）并抛出 `ReferenceError`。
- `var`、`let`、`const` 声明的变量都会在进入其作用域时被注册到当前词法环境中。
- `var` 会同时被初始化为 `undefined`，因此可提前访问。
- `let`/`const` 仅被创建，未初始化，访问会报错，直到执行到声明语句完成初始化。

#### 这个问题对我们写代码有影响吗？

几乎没有。

从撸代码的层面来看，该问题其实没必要深究，我们只需要知道这一点就行 => 使用 let、const 声明的变量，无法在声明之前访问。至于它们到底有没有提升其实对我们撸代码没啥影响。

#### 既然这个问题对写代码没啥影响，为什么要记录这个问题呢？

看到有些人说 let、const 没有提升（比如参考资料 1），有些人说有（比如参考资料 2），好奇谁是对的，因此记录了这些内容。

1. 阮一峰 -> 《ES6 教程》 -> let 和 const 命令
2. 掘金 -> 深究一下let、const到底有没有提升？

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-07-19-32-29.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-07-19-32-39.png)

:::

### 44.3. “提升（Hoisting）” 一词是哪来的？为什么 ECMAScript 没有具体的定义呢？

#### “提升（Hoisting）”一词的由来及社区的常见的两种定义

“提升”一词并非官方术语，是社区为了教学方便造出来的一个词，因此对于它的定义也是多样的。

- 1️⃣ 提升 = 提前完成声明 + 完成赋值 + 当前作用域可访问
- 2️⃣ 提升 = 提前完成声明

上述是社区中两种比较主流的观点，如果按照官方的描述，那么说法 2️⃣ 会更加严谨一些。从教学的角度来看，1️⃣ 更好理解一些，提升 = 可用，未提升 = 不可用。

::: tip

你可以认为两种说法都是对的，在阅读技术文档时，不必深究谁对谁错，重在理解在特定语境下作者想要表达的意思即可。

:::

#### 为什么 ECMAScript 没有具体的定义

“提升（Hoisting）” 是一个社区术语，在 ECMAScript 官方文档中并没有提及。

- 因为“Hoisting” 是一个模糊的、非正式的、教学用语，容易引起误解。
- 规范追求精确、可执行、无歧义，所以用结构化术语描述行为，比如：
  - “创建绑定（CreateBinding）”
  - “初始化（Initialize）”
  - “环境记录（Environment Record）”
  - “词法环境实例化（Lexical Environment Instantiation）”
  - ……

### 44.4. ECMAScript 官方文档原文对 `let`、`const` 声明的描述

> [14.3.1 Let and Const Declarations][5]
>
> let and const declarations define variables that are Scoped to the running execution context's LexicalEnvironment. The variables are created when their containing Environment Record is instantiated but may not be accessed in any way until the variable's LexicalBinding is evaluated. A variable defined by a LexicalBinding with an Initializer is assigned the value of its Initializer's AssignmentExpression when the LexicalBinding is evaluated, not when the variable is created. If a LexicalBinding in a let declaration does not have an Initializer the variable is assigned the value undefined when the LexicalBinding is evaluated.

::: tip

在翻阅“ECMAScript 官方文档”的时候，你会发现在介绍 var、let、const 这些内容的时候，压根儿就没有 Hoisting 这个词出现，倒是“词法环境 LexicalEnvironment”、“词法绑定 LexicalBinding” 这样更为专业的术语会频频出现。

:::

对应的中文翻译：`let` 和 `const` 声明的变量是在其执行上下文的词法环境中定义的。变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问。如果一个 `let` 声明中的词法绑定有初始化器，则在词法绑定被求值时，变量被赋予初始化器的赋值表达式的值，而不是在变量创建时。如果 `let` 声明中的词法绑定没有初始化器，则在词法绑定被求值时，变量被赋值为 `undefined`。

重点 👉 变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问。

这句话其实就已经告诉我们答案了，下面来拆解一下这句话：

1️⃣ 变量在其环境记录实例化时被创建

这句话告诉我们 JS 引擎在执行某个作用域中的脚本时，会实例化环境记录（可以理解为创建作用域），此时变量也就被创建了 => 这就是大多数人说的：变量声明会被提升到作用域的顶部。

2️⃣ 但在变量的词法绑定被求值之前，无法以任何方式访问

这句话的意思是说：变量虽然给你创建了，但是你还不能访问，必须等赋值之后你才能访问。

::: code-group

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

:::

### 44.5. 对比：词法环境 `LexicalEnvironment` vs 作用域 `Scope`

#### 词法环境 `LexicalEnvironment`

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

#### Lexical Environment ≠ Scope

🤔 这里说的“词法环境 Lexical Environment”，不就是“作用域 Scope”吗？为什么官方用“词法环境 Lexical Environment”来说明而非“作用域 Scope”来说明呢？

- “作用域 Scope”，是模糊的、人类语言描述的概念，我们习惯这么叫。
  - Lexical Environment = Scope（为了方便表述，可以暂且将其视作是一个概念）
- “词法环境 Lexical Environment”，是精确、可执行、可规范化的数据结构，便于引擎实现和规范制定，是 V8 引擎内部时间和 ECMAScript 规范的叫法。
  - Lexical Environment ≠ Scope（在实现层面，两者是不同的概念）

#### 词法环境和作用域之间的关系是？

词法环境（Lexical Environment）是 JavaScript 引擎内部用于实现作用域（Scope）的数据结构，是 Scope 的底层实现机制。

- 当我们说
  - 表层：“进入一个块作用域”
  - 底层：引擎实际上是创建了一个新的词法环境
- 当我们说
  - 表层：“变量被提升到作用域顶部”
  - 底层：引擎是在词法环境创建阶段注册了该变量名

```text
开发者视角（抽象概念）       引擎视角（具体实现）
       │                            │
       ▼                            ▼
  全局作用域 (Scope)     →    全局词法环境 (Lexical Environment)
       │                            │ .outer = null
       ▼                            ▼
  函数作用域 (Scope)     →    函数词法环境 (Lexical Environment)
       │                            │ .outer → 全局词法环境
       ▼                            ▼
  块级作用域 (Scope)     →    块级词法环境 (Lexical Environment)
                                  │ .outer → 函数词法环境

→ 每个“作用域”在引擎中都有一个对应的“词法环境”来支撑它。
→ “子作用域”之所以能访问“父作用域”的变量，是因为它的词法环境的 .outer 指向了父词法环境。
```

### 44.6. 提升（Hosting） ≠ 可访问（Accessible）、提升（Hosting） ≠ 内存分配（Memory Allocation）

先理清几个常见的有关“提升的误解”：

- 提升（Hosting） ≠ 可访问（Accessible）
- 提升（Hosting） ≠ 内存分配（Memory Allocation）

`var`、`let`、`const` 的提升行为：

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

提升和内存分配：

- 在 JavaScript 中，变量声明的提升和内存分配是两个相关但不同的步骤。
  - 提升是指在 JavaScript 解释器执行代码之前，将变量和函数声明提升到其作用域的顶部。这意味着在代码运行之前，所有的变量和函数声明已经被识别（也就是说 JS 解释器已经知道这玩意儿存在了）。提升过程适用于 `var`、`let`、`const` 声明以及函数声明。
  - 内存分配是指为变量分配内存空间以存储其值。这一步骤涉及将变量与特定的内存地址相关联。
- `var`、`let`、`const`
  - `var` 提升了，并完成了内存分配
  - `let`、`const` 提升了，但未完成内存分配

变量在其环境记录实例化时被创建，但在变量的词法绑定被求值之前，无法以任何方式访问。

- 这句话说明了 `let` 和 `const` 声明的变量是提前被创建的（这部分称为“提升”），但在实际执行到声明语句之前，它们是不可访问的。这解释了为什么在声明之前访问这些变量会导致错误。
- 当你在一个作用域（例如函数或块级作用域，就是 let、const 所在的那块空间）内声明了变量（使用 `let` 或 `const`），这些变量在作用域开始时就已经“被创建”了。也就是说，JavaScript 引擎在进入这个作用域时，已经知道这些变量存在，并在内部为它们分配了空间（准确点儿可以说是预留了位置）。
- 更通俗一些的说法 => 当 JavaScript 引擎进入一个块级作用域（比如 `{}`）时，它会先“登记”这个作用域内所有 `let`/`const` 变量的名字，但此时这些变量还不能用，要等到执行到对应的声明语句时才会初始化。

### 44.7. `let`、`const` 声明的变量，何时脱离暂时性死区？

在变量的词法绑定（指初始化）被求值之前，无法以任何方式访问。尽管这些变量已经被创建，但在实际执行到它们的声明语句之前，你无法访问它们。这段“时间”被称为暂时性死区（TDZ）。如果你在 TDZ 内尝试访问这些变量，会抛出一个 `ReferenceError`。

TDZ 是“时间”区间：

- “时间” 这个词比较有意思，在细读文档之前，一直以为 “死区” 指的是 “某一段区域范围”，实际上指的是 “时间范围”。不过代码也是按照时间一步步往下执行的，因此理解成区域也没啥毛病。
- “死区”本质上是一个执行阶段（时间维度），而非代码位置的“区域”。虽然代码是线性执行的，看起来像“某段代码区域不能访问”，但规范中更强调的是“在初始化之前的时间点访问会报错”。

词法绑定求值：

- 这句话中提到的 “词法绑定求值” 是指在代码执行过程中，当 JavaScript 引擎遇到变量声明时，将变量名与实际的内存位置绑定，并将初始值赋给变量的过程。对于 `let` 和 `const`，在代码执行到声明语句时，才会进行这种赋值操作。
- 当执行流到达变量声明语句时，JavaScript 引擎完成对该变量的初始化（如果是 `let` 无初始值则赋 `undefined`，`const` 必须有初始值），此时变量才脱离“暂时性死区”，变为可访问状态。

### 44.8. `var`、`let`、`const` 到底提升了什么？

要回答这个问题，得知道变量声明在编译阶段和执行阶段的分工。既然说是提升，一定是有些流程被提前做了。提升的本质是“声明阶段”被提前到作用域顶部。

核心三阶段（所有变量声明共有）：

1. 声明（Declaration）：在词法环境注册标识符（作用域创建）
2. 初始化（Initialization）：分配内存并设置初始值
3. 赋值（Assignment）：将具体值绑定到变量（执行阶段）

`var` 声明流程：

1. 在进入作用域时：声明变量并初始化为 `undefined`（提升）
2. 执行阶段：执行赋值操作（如 `= 10`）

`let` 声明流程：

1. 在进入作用域时：声明变量（未初始化，进入暂时性死区）
2. 执行阶段：
   - 执行到 `let` 语句时初始化（默认 `undefined`）
   - 执行赋值操作（如 `= 20`）

`const` 声明流程：

1. 在进入作用域时：声明变量（未初始化，进入暂时性死区）
2. 执行阶段：执行到 `const` 语句时同步完成初始化与赋值（不可拆分）

提升的本质：

| 关键字 | 提升内容 | 表现示例 |
| --- | --- | --- |
| `var` | 声明 + 初始化（`undefined`） | `console.log(a); var a=10;` → `undefined` |
| `let` | 仅声明（未初始化） | `console.log(b); let b=20;` → `ReferenceError` |
| `const` | 仅声明（未初始化） | `console.log(c); const c=30;` → `ReferenceError` |

结论：

- `var` 提升，并完成了内存分配，初始化为 `undefined`。
- `let` 和 `const` 提升，但在声明语句之前处于暂时性死区（TDZ），不会初始化。内存分配和初始化在代码执行到声明语句时发生。

### 44.9. 🤔 如何看待类似“提升”这样存在“冲突”的社区术语呢？

::: tip 写这篇笔记的一些反思

- ✅ 重点：
  - 理解在特定语境下作者想要表达的意思。
  - 具体怎么做呢？计算机领域的俩字箴言 `IO` - `读、写` - 能读懂代码、能写代码。
- 🚫 禁：
  - 不要去花过多时间 battle 到底谁对谁错，这会大大影响你的学习进度。
  - 社区造出这么一个词，就是为了让你能够快速理解它想传递你的信息，花费大把时间去查文档，反而得不偿失。
  - 当然，花费了时间和精力去查阅一些细节时，收获也是有的，比如对 JS 引擎在创建作用域、变量的时候流程更清晰了一些。
- 🔍 辨别：
  - 当你在学习某某特定知识点的时候，发现有多派说法，其中很可能的一个原因就是关于 xxx 的定义不统一导致的。
- 💪 方法论：
  - 当遇到“冲突”的描述时，你可以初步认为它们都是对的，但是程序执行的逻辑往往是确定的，也是更方便验证的，如果发现某一方的描述和运行结果对不上，那就可以直接宣判死刑了。

:::

## 45. 🔗 引用

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
