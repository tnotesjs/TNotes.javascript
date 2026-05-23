# [0158. JavaScript实现](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0158.%20JavaScript%E5%AE%9E%E7%8E%B0)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 完整的 JavaScript 实现由哪几部分组成？](#3--完整的-javascript-实现由哪几部分组成)
- [4. 🤔 ECMAScript 定义了什么？](#4--ecmascript-定义了什么)
- [5. 🤔 DOM 为什么是 JavaScript 的重要组成部分？](#5--dom-为什么是-javascript-的重要组成部分)
- [6. 🤔 BOM 负责什么？](#6--bom-负责什么)
- [7. 🤔 为什么要区分 ECMAScript、DOM 和 BOM？](#7--为什么要区分-ecmascriptdom-和-bom)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- ECMAScript
- 文档对象模型
- 浏览器对象模型
- 宿主环境扩展
- JavaScript 完整实现

## 2. 🫧 评价

JavaScript 的完整实现不是单一标准能解释完的。把 ECMAScript、DOM 和 BOM 分开看，是理解浏览器中 JavaScript 能力来源的关键。

## 3. 🤔 完整的 JavaScript 实现由哪几部分组成？

在浏览器语境下，一个完整的 JavaScript 实现通常由三部分组成：

| 组成部分   | 负责内容   | 典型能力                               |
| ---------- | ---------- | -------------------------------------- |
| ECMAScript | 语言核心   | 语法、类型、对象、函数、模块           |
| DOM        | 文档交互   | 查询节点、修改元素、处理页面结构       |
| BOM        | 浏览器交互 | 操作窗口、地址、历史、屏幕和浏览器信息 |

这三部分经常一起出现，所以初学时容易混淆。比如 `Array.prototype.map()` 是 ECMAScript 能力，`document.querySelector()` 是 DOM 能力，`location.href` 则属于浏览器环境提供的能力。

简单来说：

- ECMAScript 让 JavaScript 成为一门语言。
- DOM 让 JavaScript 能操作网页内容。
- BOM 让 JavaScript 能和浏览器窗口及浏览器状态交互。

## 4. 🤔 ECMAScript 定义了什么？

ECMAScript 是由 `ECMA-262` 定义的语言规范。它并不局限于 Web 浏览器，也不直接定义页面、网络、文件系统或用户界面。

从语言核心角度看，ECMAScript 主要定义这些内容：

- 语法
- 类型
- 语句
- 关键字
- 保留字
- 操作符
- 全局对象

这意味着 ECMAScript 更像是 JavaScript 的语言地基。浏览器、Node.js 或其它宿主环境都可以在这个地基之上提供自己的扩展能力。

例如，同样是 ECMAScript，浏览器可以提供 `document`，Node.js 可以提供 `process` 和文件系统 API。这些扩展并不属于 ECMAScript 语言核心。

## 5. 🤔 DOM 为什么是 JavaScript 的重要组成部分？

DOM 是文档对象模型，也就是 `Document Object Model`。它把 HTML 或 XML 文档抽象成一棵节点树，让程序可以访问和修改页面结构。

下面这个页面：

```html
<html>
  <head>
    <title>Sample Page</title>
  </head>
  <body>
    <p>Hello World!</p>
  </body>
</html>
```

在 DOM 里可以理解成这样的层级：

```mermaid
graph TD
  html --> head
  head --> title
  title --> titleText[Sample Page]
  html --> body
  body --> p
  p --> pText[Hello World]
```

有了 DOM，JavaScript 才能完成这些事情：

- 查询页面元素
- 修改文本和属性
- 创建、删除、替换节点
- 监听用户事件
- 根据数据变化更新页面内容

早期浏览器各自实现动态 HTML 能力，差异很大。DOM 标准的出现，就是为了解决网页结构操作缺少统一接口的问题。

## 6. 🤔 BOM 负责什么？

BOM 是浏览器对象模型，也就是 `Browser Object Model`。它面向的是浏览器窗口以及浏览器提供的环境能力。

常见 BOM 相关能力包括：

- `window` 对象
- `navigator` 对象
- `location` 对象
- `history` 对象
- `screen` 对象
- 弹窗、窗口尺寸、浏览器导航等能力

和 DOM 相比，BOM 的历史标准化程度更弱。很长一段时间里，不同浏览器都按自己的方式实现 BOM。不过，随着 HTML5 以及后续 HTML 标准的发展，许多浏览器环境能力逐渐被纳入规范。

学习 BOM 时要有一个意识：你接触到的很多能力并不是 ECMAScript 语言定义的，而是浏览器这个宿主环境提供的。

## 7. 🤔 为什么要区分 ECMAScript、DOM 和 BOM？

区分这三者可以帮助你判断问题来源。

| 问题                               | 更可能属于   |
| ---------------------------------- | ------------ |
| `const`、箭头函数、类语法能不能用  | ECMAScript   |
| 页面元素为什么查不到               | DOM          |
| 地址栏、历史记录、窗口尺寸如何处理 | BOM          |
| 某个能力在 Node.js 里为什么没有    | 宿主环境差异 |

这也是后续学习的基本地图。语言基础、变量、函数、对象、类、模块等内容主要属于 ECMAScript；DOM、事件、表单、动画和浏览器 API 则更多依赖浏览器环境。
