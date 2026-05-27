# [0169. 保留字](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0169.%20%E4%BF%9D%E7%95%99%E5%AD%97)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 保留字、关键字、未来保留字，这些术语的官方定义是？](#3--保留字关键字未来保留字这些术语的官方定义是)
  - [3.1. 保留字 `Reserved Words` 的定义](#31-保留字-reserved-words-的定义)
  - [3.2. 关键字 `Keywords` 的定义](#32-关键字-keywords-的定义)
  - [3.3. 未来保留字 `Future Reserved Words` 的定义](#33-未来保留字-future-reserved-words-的定义)
  - [3.4. 小结](#34-小结)
  - [3.5. 其它](#35-其它)
- [4. 🤔 什么是关键字 `Keywords`？](#4--什么是关键字-keywords)
  - [4.1. 关键字](#41-关键字)
  - [4.2. 常见的关键字](#42-常见的关键字)
  - [4.3. 细节补充：关于 `await` 和 `yield`](#43-细节补充关于-await-和-yield)
  - [4.4. 细节补充：关于上下文关键字](#44-细节补充关于上下文关键字)
  - [4.5. 细节验证](#45-细节验证)
- [5. 🤔 什么是未来保留字？](#5--什么是未来保留字)
  - [5.1. 未来保留字](#51-未来保留字)
  - [5.2. 关键字与未来保留字的关系](#52-关键字与未来保留字的关系)
- [6. 🤔 `true`、`false` 和 `null` 属于哪一类？](#6--truefalse-和-null-属于哪一类)
- [7. 🤔 命名时最实用的规则是什么？](#7--命名时最实用的规则是什么)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 关键字的含义
- 未来保留字的含义
- 严格模式和模块中的额外保留词
- 为什么不应用关键字和未来保留字命名

## 2. 🫧 评价

关键字和未来保留字不需要死背成表，但要知道它们是语言语法的一部分。真正重要的是命名时避开这些词，别把变量名写成未来会和语言演进打架的样子。

## 3. 🤔 保留字、关键字、未来保留字，这些术语的官方定义是？

::: tip

以下提到的官方原文，是目前（2026.05.27）从 ECMAScript 官方规范原文中 `12.7.2 Keywords and Reserved Words` 章节下的内容。

:::

### 3.1. 保留字 `Reserved Words` 的定义

官方原话：A reserved word is an `IdentifierName` that cannot be used as an identifier.

规范在这里非常严谨地定义了 `Reserved Word` 与 `Identifier` 的互斥关系。它明确指出，如果一个词被定性为保留字，它的唯一特征就是丧失了作为标识符（即变量名、函数名等）的资格。

### 3.2. 关键字 `Keywords` 的定义

官方原话：A keyword is a token that matches `IdentifierName`, but also has a syntactic use; that is, it appears literally, in a fixed width font, in some syntactic production.

这里的重点在于 syntactic use（语法用途）。规范认为，只要这个词在代码的“语法产生式”（Syntactic Production）里出现了，它就是一个关键字。它强调的是这个词在 JS 解析引擎眼中的“功能性”，而不是它能不能被命名。

### 3.3. 未来保留字 `Future Reserved Words` 的定义

官方原话：`enum` is not currently used as a keyword in this specification. It is a future reserved word, set aside for use as a keyword in future language extensions.

规范通过对 `enum` 的注释说明了“未来保留字”的本质：

1. 它现在不是关键字（not used as a keyword）
2. 它是为了未来扩展而提前预留的（set aside for future extensions）
3. 它在 `Syntax` 列表里被归类为 `ReservedWord`，因此它依然禁止用作标识符

### 3.4. 小结

- 保留字是指一个不能用作标识符（Identifier）的标识符名称（IdentifierName）
- 关键字是一个匹配标识符名称（IdentifierName）、但在语言中具有特定语法用途（Syntactic Use）的标记（Token）
- 当前规范版本中没有赋予任何语法用途，但为了语言未来的扩展而提前保留，禁止用作标识符的词

### 3.5. 其它

关键字与保留字是交集关系。我们可以通过规范底层的两条核心规则来彻底理清它们的关系：

- 保留字（Reserved Words）的唯一判断标准：能不能用作标识符（如变量名）。只要无条件禁止拿来命名，它就是保留字。
- 关键字（Keywords）的唯一判断标准：在语法产生式中是否有具体用途。只要在代码结构（如控制流、声明）中扮演特殊角色，它就是关键字。

基于这两条标准，它们的关系可以精准划分为以下三大类：

- 第一类：既是关键字，又是保留字（占绝大多数）
  - 代表词：`if`、`while`、`class`、`return` 等。
  - 特征：它们既负责控制语言的底层逻辑，也绝对禁止你拿来当变量名。
- 第二类：是关键字，但不是保留字（打破常规的特例）
  - 代表词：`async`。
  - 特征：规范明确将它列为关键字，但它并没有被列入保留字名单。因此，你可以不受限制地声明 `const async = 1`（纯上下文关键字）。
- 第三类：是保留字，但不是关键字（占位符与字面量）
  - 未来保留字：如 `enum`。规范原文明确说明它目前“不是关键字”，它只是为了防范未来语言升级冲突，提前加入禁用的“保留字”名单里的占位符。
  - 字面量（Literals）：如 `true`、`false`、`null`。它们是代表固定类型值的字面量，不参与控制流语法（不是关键字），但在规范的语法树中，它们被直接硬编码在了 `ReservedWord` 的黑名单列表里，绝对禁止用来命名。

## 4. 🤔 什么是关键字 `Keywords`？

::: tip

本节的“细节补充”内容不重要，你可以选择性阅读，甚至完全跳过。

“关键字不能被用作标识符”，这句话本身是错误的。如果你想要了解一些相关细节，倒是可以看看“细节补充”部分。

:::

### 4.1. 关键字

关键字是 ECMAScript 语法已经占用的词。它们有明确用途，常用于控制流程、声明变量、定义类、导入导出模块或执行特定操作。

关键字不能作为变量名、函数名或参数名：

```js
// ❌ 语法错误
const return = 1
```

如果一个词已经被语言语法占用，你就应该把它看作“不能拿来命名”的词。

### 4.2. 常见的关键字

| Keyword      | 描述                                                     |
| ------------ | -------------------------------------------------------- |
| `await`      | 等待 Promise 解析，只能在 async 函数或模块顶层使用       |
| `break`      | 立即终止当前循环或 `switch` 语句                         |
| `case`       | 定义 `switch` 语句的一个分支条件                         |
| `catch`      | 捕获 `try` 块中抛出的异常                                |
| `class`      | 声明一个类                                               |
| `const`      | 声明一个块级作用域的常量绑定                             |
| `continue`   | 跳过当前循环迭代，进入下一次迭代                         |
| `debugger`   | 触发调试断点                                             |
| `default`    | 定义 `switch` 的默认分支，或指定模块的默认导出/导入      |
| `delete`     | 删除对象的属性                                           |
| `do`         | 构成 `do…while` 循环，先执行后判断                       |
| `else`       | 定义 `if` 条件不满足时的执行分支                         |
| `export`     | 从模块中导出命名或默认成员                               |
| `extends`    | 建立类的原型继承关系                                     |
| `finally`    | 定义 `try…catch` 结构中无论是否异常都会执行的收尾块      |
| `for`        | 创建循环结构（`for`、`for…in`、`for…of`）                |
| `function`   | 声明函数或函数表达式                                     |
| `if`         | 根据条件判断执行相应代码块                               |
| `import`     | 从其他模块导入绑定                                       |
| `in`         | 检查属性是否存在于对象中（运算符），或用于 `for…in` 循环 |
| `instanceof` | 检查构造函数的 `prototype` 是否出现在对象的原型链中      |
| `let`        | 声明一个块级作用域的变量绑定                             |
| `new`        | 创建构造函数的实例                                       |
| `return`     | 终止函数执行并返回一个值                                 |
| `super`      | 引用父类的构造函数或原型方法                             |
| `switch`     | 根据表达式的值进行多分支匹配                             |
| `this`       | 引用当前执行上下文的对象                                 |
| `throw`      | 抛出一个用户自定义的异常                                 |
| `try`        | 包裹可能抛出异常的代码块                                 |
| `typeof`     | 返回操作数类型的字符串表示                               |
| `var`        | 声明一个函数作用域（或全局）的变量                       |
| `void`       | 计算表达式并返回 `undefined`                             |
| `while`      | 在条件为真时重复执行代码块                               |
| `with`       | 扩展当前作用域链（已弃用，严格模式下禁用）               |
| `yield`      | 暂停生成器函数并返回一个值                               |

### 4.3. 细节补充：关于 `await` 和 `yield`

`await` 和 `yield` 是正式的 `Keyword`，但规范在特定场景之外允许它们作为标识符：

- `await` 仅在模块代码或 `async` 函数内受限，在普通脚本（非模块）的其他位置可以当作变量名
- `yield` 仅在严格模式或生成器函数内受限，在非严格模式且非生成器的其他位置可以当作变量名

这些例外非常依赖上下文，实际开发中绝对不要把它们当作变量名使用。

### 4.4. 细节补充：关于上下文关键字

像 `async`、`get`、`set`、`of`、`from` 等词不属于严格意义上的关键字或未来保留字。它们只在特定语法结构中有特殊含义（如 `async function`、`get prop()`、`for...of`），在其他地方完全可以合法用作变量名（例如 `const async = 1`）。

### 4.5. 细节验证

你可以在浏览器控制台直接执行以下程序加以验证：

```js
const async = 1
const get = 1
const set = 1
const of = 1
const from = 1
const yield = 1
console.log(async, get, set, of, from, yield)
// 1 1 1 1 1 1
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-08-22-03.png)

不过有一点需要注意，如果 `await` 会比较特殊：「`await` 仅在模块代码或 `async` 函数内受限，在普通脚本（非模块）的其他位置可以当作变量名」 <= 这句话在规范层面是对的，但在浏览器控制台这个具体场景下，大概率会报错。

| 场景 | 执行上下文 | `const await = 1` 是否合法 |
| --- | --- | --- |
| 规范中的普通 `<script>` 标签 | `Script`（非 `Module`） | ✅ 合法 |
| 规范中的 `<script type="module">` | `Module` | ❌ 语法错误 |
| 现代浏览器控制台（Chrome/Firefox/Edge） | 模拟模块/顶层 await 上下文 | ❌ 大概率报错 |

现代浏览器控制台为了支持顶层 await（如直接输入 `await fetch('/')`），通常会把你的输入代码当作模块代码处理，或者包裹在一个隐式的 async 环境中。因此，在控制台里 `await` 实际上是被当作关键字保留的。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-08-27-00.png)

但在一个普通的 HTML 文件里的普通 `<script>` 标签中是合法的：

```html
<!doctype html>
<html>
  <head></head>
  <body>
    <script>
      const await = 1 // ✅ 不会报错（在非模块脚本中）
      console.log(await)
    </script>
  </body>
</html>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-08-31-09.png)

## 5. 🤔 什么是未来保留字？

### 5.1. 未来保留字

未来保留字是当前可能还没有具体语法用途，但规范预留给未来使用的词（Future Reserved Words）。它们存在的目的，是避免今天写出的代码阻碍未来语言扩展。

最典型的例子是：`enum`（无论是否处于严格模式下，`enum` 都是未来保留字）。

在严格模式（`"use strict"`）下，还会保留更多词，例如：`implements`、`interface`、`package`、`private`、`protected`、`public`、`static`。

### 5.2. 关键字与未来保留字的关系

- 关键字是“已经实现了特殊语法的未来保留字”
- 未来保留字是“还没实现特殊语法的关键字”

它们在规范里分工明确（一个负责当下，一个负责未来），在开发中待遇一致（一律禁止命名）。

## 6. 🤔 `true`、`false` 和 `null` 属于哪一类？

`true`、`false` 和 `null` 在语义上是语言中的字面量（Literals）（分别表示布尔值和空对象指针）。

在 ECMAScript 规范中，它们分别属于 `BooleanLiteral`（`true`、`false`）和 `NullLiteral`（`null`）产生式，**不在 `Keyword` 产生式内**。但从开发者实际使用的角度，它们同样绝对不能作为标识符使用。

```js
// ❌ 都是错误写法
let true = 1
let false = 0
let null = 'empty'
```

即使某些上下文里它们看起来像普通单词，也不要拿来命名。

## 7. 🤔 命名时最实用的规则是什么？

命名时可以遵循一个简单规则：凡是看起来像语言语法、控制流程或未来标准词汇的单词，都不要用作标识符。

更稳妥的做法是使用带业务含义的组合词（如驼峰命名）：

```js
const userType = 'admin'
const currentClassName = 'active'
const packageInfo = { name: 'demo' }
```

这样既能避开关键字和未来保留字，也能让代码语义更清楚。

虽然自 ES5 起，JavaScript 已允许使用关键字或未来保留字作为对象的属性名（如 `obj.class`、`obj.return`），但为了代码可读性和团队协作，依然不建议故意这样做。

## 8. 🔗 引用

- [MDN - Lexical Grammar - Keywords][1]
- [ECMAScript - Lexical Grammar - Names and Keywords][2]

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#keywords
[2]: https://tc39.es/ecma262/#sec-names-and-keywords
