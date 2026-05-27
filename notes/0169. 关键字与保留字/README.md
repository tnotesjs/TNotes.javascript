# [0169. 关键字与保留字](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0169.%20%E5%85%B3%E9%94%AE%E5%AD%97%E4%B8%8E%E4%BF%9D%E7%95%99%E5%AD%97)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是关键字 `Keyword`？](#3--什么是关键字-keyword)
  - [3.1. 关键字](#31-关键字)
  - [3.2. 常见的关键字](#32-常见的关键字)
  - [3.3. 细节补充：关于 `await` 和 `yield`](#33-细节补充关于-await-和-yield)
  - [3.4. 细节补充：关于上下文关键字](#34-细节补充关于上下文关键字)
  - [3.5. 细节验证](#35-细节验证)
- [4. 🤔 什么是保留字？](#4--什么是保留字)
- [5. 🤔 `true`、`false` 和 `null` 属于哪一类？](#5--truefalse-和-null-属于哪一类)
- [6. 🤔 命名时最实用的规则是什么？](#6--命名时最实用的规则是什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 关键字的含义
- 保留字的含义
- 严格模式和模块中的额外保留词
- 为什么不应用关键字和保留字命名

## 2. 🫧 评价

关键字和保留字不需要死背成表，但要知道它们是语言语法的一部分。真正重要的是命名时避开这些词，别把变量名写成未来会和语言演进打架的样子。

## 3. 🤔 什么是关键字 `Keyword`？

::: tip

本节的“细节补充”内容不重要，你可以选择性阅读，甚至完全跳过。

“关键字不能被用作标识符”，这句话本身是错误的。如果你想要了解一些相关细节，倒是可以看看“细节补充”部分。

:::

### 3.1. 关键字

关键字是 ECMAScript 语法已经占用的词。它们有明确用途，常用于控制流程、声明变量、定义类、导入导出模块或执行特定操作。

关键字不能作为变量名、函数名或参数名：

```js
// ❌ 语法错误
const return = 1
```

如果一个词已经被语言语法占用，你就应该把它看作“不能拿来命名”的词。

### 3.2. 常见的关键字

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

### 3.3. 细节补充：关于 `await` 和 `yield`

`await` 和 `yield` 是正式的 `Keyword`，但规范在特定场景之外允许它们作为标识符：

- `await` 仅在模块代码或 `async` 函数内受限，在普通脚本（非模块）的其他位置可以当作变量名
- `yield` 仅在严格模式或生成器函数内受限，在非严格模式且非生成器的其他位置可以当作变量名

这些例外非常依赖上下文，实际开发中绝对不要把它们当作变量名使用。

### 3.4. 细节补充：关于上下文关键字

像 `async`、`get`、`set`、`of`、`from` 等词不属于严格意义上的关键字或保留字。它们只在特定语法结构中有特殊含义（如 `async function`、`get prop()`、`for...of`），在其他地方完全可以合法用作变量名（例如 `const async = 1`）。

### 3.5. 细节验证

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

## 4. 🤔 什么是保留字？

保留字是当前可能还没有具体语法用途，但规范预留给未来使用的词（Future Reserved Words）。它们存在的目的，是避免今天写出的代码阻碍未来语言扩展。

最典型的例子是：

```txt
enum
```

在严格模式（`"use strict"`）下，还会保留更多词，例如：

```txt
implements interface package private protected public static
```

> 补充：在 ECMAScript 规范中，`enum` 属于 `FutureReservedWord`（保留字），不在 `Keyword`（关键字）产生式中，因此正文将其列为保留字是准确的。`let` 自 ES2015 起已正式列入 `Keyword` 产生式，是正式关键字，而非上下文关键字。`static` 在严格模式下属于 `FutureReservedWord`，同时在类体中也可作为上下文关键字使用。不同版本的规范对这些分类有微调，但“不要拿来命名”的原则始终不变。

## 5. 🤔 `true`、`false` 和 `null` 属于哪一类？

`true`、`false` 和 `null` 在语义上是语言中的字面量（Literals）（分别表示布尔值和空对象指针）。

在 ECMAScript 规范中，它们分别属于 `BooleanLiteral`（`true`、`false`）和 `NullLiteral`（`null`）产生式，**不在 `Keyword` 产生式内**。但从开发者实际使用的角度，它们同样绝对不能作为标识符使用。

```js
// ❌ 都是错误写法
let true = 1
let false = 0
let null = 'empty'
```

即使某些上下文里它们看起来像普通单词，也不要拿来命名。

## 6. 🤔 命名时最实用的规则是什么？

命名时可以遵循一个简单规则：凡是看起来像语言语法、控制流程或未来标准词汇的单词，都不要用作标识符。

更稳妥的做法是使用带业务含义的组合词（如驼峰命名）：

```js
const userType = 'admin'
const currentClassName = 'active'
const packageInfo = { name: 'demo' }
```

这样既能避开关键字和保留字，也能让代码语义更清楚。

虽然自 ES5 起，JavaScript 已允许使用关键字或保留字作为对象的属性名（如 `obj.class`、`obj.return`），但为了代码可读性和团队协作，依然不建议故意这样做。
