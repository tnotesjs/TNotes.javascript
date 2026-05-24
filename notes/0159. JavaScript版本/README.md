# [0159. JavaScript版本](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0159.%20JavaScript%E7%89%88%E6%9C%AC)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 现代开发中如何描述 JavaScript 语言版本？](#3--现代开发中如何描述-javascript-语言版本)
  - [3.1. 历史问题](#31-历史问题)
  - [3.2. 现代开发统一口径](#32-现代开发统一口径)
- [4. 🤔 最初的 JavaScript 1.x 版本是谁在维护？](#4--最初的-javascript-1x-版本是谁在维护)
- [5. 🤔 ECMAScript 的版本演进有哪些关键节点？](#5--ecmascript-的版本演进有哪些关键节点)
- [6. 🤔 浏览器支持应该怎么看？](#6--浏览器支持应该怎么看)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- JavaScript 版本口径
- Netscape 与 Mozilla 版本号
- JScript 版本差异
- ECMAScript 版本演进
- 浏览器特性支持

## 2. 🫧 评价

JavaScript 的版本问题容易混淆，因为它同时涉及浏览器实现版本和 ECMAScript 标准版本。日常开发更应该关注 ECMAScript 年度版本和具体特性的支持状态。

## 3. 🤔 现代开发中如何描述 JavaScript 语言版本？

答：跟 ECMAScript 标准走。

### 3.1. 历史问题

为什么 JavaScript 版本容易混淆？

历史上，JavaScript 的版本并非一个单一口径，至少存在三种常见的版本说法：

| 口径               | 含义                                     |
| ------------------ | ---------------------------------------- |
| JavaScript 1.x     | Netscape 和 Mozilla 延续使用的实现版本号 |
| JScript            | 微软早期 JavaScript 实现所采用的版本体系 |
| ECMAScript Edition | ECMA-262 标准文档的版本，即语言规范版本  |

这三种版本号之间并不存在一一对应关系。例如，Firefox 曾使用 JavaScript 1.5、1.6、1.7、1.8 等版本号，而 IE 则使用 JScript 的版本号。这些都不是当前讨论 JavaScript 新特性的主要方式。

### 3.2. 现代开发统一口径

在现代开发中，更常见的说法是 `ES5`、`ES2015`、`ES2019`、`ES2023` 等。

这些名称对应的是 ECMAScript 标准版本，而非某个浏览器自己定义的 JavaScript 版本号。

## 4. 🤔 最初的 JavaScript 1.x 版本是谁在维护？

Netscape 是 JavaScript 的最初推动者，后来 Mozilla 继承并延续了这条版本线。

早期版本大致对应如下：

| 浏览器阶段              | JavaScript 版本特点                   |
| ----------------------- | ------------------------------------- |
| Netscape Navigator 2    | 发布 JavaScript 1.0                   |
| Netscape Navigator 3    | 发布 JavaScript 1.1                   |
| Netscape Navigator 4    | 继续推进 JavaScript 1.2 和 1.3        |
| Mozilla 与 Firefox 早期 | 延续 JavaScript 1.5 至 1.8.x 的版本号 |

这些版本号记录了浏览器实现的历史演进，但今天已不建议用它们来判断语言能力。

原因在于：现代 JavaScript 的语言核心已由 ECMAScript 标准统一维护。当你关心某个语法或 API 是否可用时，更合理的做法是确认它属于哪个 ECMAScript 版本，以及目标运行环境是否提供了相应支持。

## 5. 🤔 ECMAScript 的版本演进有哪些关键节点？

ECMAScript 的版本以标准文档的 edition 来表示。书中以 ES2019 为时间点介绍到 ECMA-262 第 10 版。理解版本演进时，不需要死记所有细节，但要抓住几个关键节点。

| 版本 | 时间 | 关键意义 |
| --- | --- | --- |
| ES1 | 1997 | 第一个标准化版本，建立语言规范基础 |
| ES2 | 1998 | 对齐 ISO/IEC 标准，主要是编辑性更新 |
| ES3 | 1999 | 增强字符串、错误处理、正则表达式和控制语句 |
| ES4 | 未发布 | 改动过大，最终被放弃 |
| ES5 | 2009 | 增加严格模式、JSON、属性描述符等重要能力 |
| ES2015 | 2015 | 引入类、模块、迭代器、生成器、箭头函数、期约、代理等大量特性 |
| ES2016 之后 | 每年发布 | 进入年度发布节奏，持续增量演进 |
| ES2019 | 2019 | 书中覆盖的标准时间点，包含 `flat()`、`flatMap()`、`Object.fromEntries()` 等能力 |

ES2015 是一个分水岭。它把 JavaScript 从传统脚本语言进一步推向现代应用开发语言，引入了很多今天仍然常用的基础能力。

## 6. 🤔 浏览器支持应该怎么看？

书中列出了不少浏览器对 ECMAScript 的支持情况。这类表格有历史价值，但实际开发时更推荐按特性查询。

原因是：

- 浏览器版本更新很快。
- 同一 ECMAScript 版本中的特性可能分批实现。
- 转译工具和运行时补丁会改变实际可用性。
- 移动端浏览器和嵌入式 WebView 可能有额外差异。

更实用的判断方式是：

1. 确认要使用的语法或 API 属于哪个标准版本。
2. 查看目标浏览器或运行环境是否支持。
3. 必要时使用 Babel、TypeScript 或 polyfill 处理兼容性。

所以，今天说 JavaScript 版本，通常不是问浏览器里的 JavaScript 1.x，而是问：这个 ECMAScript 特性是否已经进入标准，以及目标环境是否支持。
