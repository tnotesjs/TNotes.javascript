# [0159. JavaScript版本](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0159.%20JavaScript%E7%89%88%E6%9C%AC)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 JavaScript 版本容易混淆？](#3--为什么-javascript-版本容易混淆)
- [4. 🤔 Netscape 和 Mozilla 的 JavaScript 版本号说明了什么？](#4--netscape-和-mozilla-的-javascript-版本号说明了什么)
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

## 3. 🤔 为什么 JavaScript 版本容易混淆？

JavaScript 的版本不是一个单一口径。历史上至少有三种常见说法：

| 口径               | 含义                                        |
| ------------------ | ------------------------------------------- |
| JavaScript 1.x     | Netscape 和 Mozilla 延续的实现版本号        |
| JScript            | 微软早期 JavaScript 实现的版本体系          |
| ECMAScript Edition | ECMA-262 标准文档的版本，也就是语言规范版本 |

这几种版本号并不一一对应。比如，Firefox 曾经使用 JavaScript 1.5、1.6、1.7、1.8 等版本号，而 IE 使用的是 JScript 版本号。它们都不是今天讨论 JavaScript 新特性的主要方式。

现代开发里，更常见的说法是 `ES5`、`ES2015`、`ES2019`、`ES2023` 等。这些名字对应的是 ECMAScript 标准版本，而不是某个浏览器自己的 JavaScript 版本号。

## 4. 🤔 Netscape 和 Mozilla 的 JavaScript 版本号说明了什么？

Netscape 是 JavaScript 的最初推动者，后来 Mozilla 继承了这条版本线。

早期版本大致可以这样理解：

| 浏览器阶段              | JavaScript 版本特点                   |
| ----------------------- | ------------------------------------- |
| Netscape Navigator 2    | 发布 JavaScript 1.0                   |
| Netscape Navigator 3    | 发布 JavaScript 1.1                   |
| Netscape Navigator 4    | 继续推进 JavaScript 1.2 和 1.3        |
| Mozilla 与 Firefox 早期 | 延续 JavaScript 1.5 到 1.8.x 的版本号 |

这些版本号记录了浏览器实现的历史，但今天不建议再用它们来判断语言能力。

原因很简单：现代 JavaScript 的语言核心已经由 ECMAScript 标准维护。你关心一个语法或 API 是否可用时，更应该查它属于哪个 ECMAScript 版本，以及目标运行环境是否支持。

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
