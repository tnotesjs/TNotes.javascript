# [0157. 简短的历史回顾](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0157.%20%E7%AE%80%E7%9F%AD%E7%9A%84%E5%8E%86%E5%8F%B2%E5%9B%9E%E9%A1%BE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 Web 早期需要客户端脚本？](#3--为什么-web-早期需要客户端脚本)
- [4. 🤔 Mocha、LiveScript 和 JavaScript 是什么关系？](#4--mochalivescript-和-javascript-是什么关系)
- [5. 🤔 JScript 为什么会出现？](#5--jscript-为什么会出现)
- [6. 🤔 JavaScript 是如何走向标准化的？](#6--javascript-是如何走向标准化的)
- [7. 🤔 这段历史对今天写 JavaScript 有什么影响？](#7--这段历史对今天写-javascript-有什么影响)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 客户端脚本需求
- Mocha、LiveScript 与 JavaScript
- JScript 与浏览器竞争
- ECMA-262 标准化
- ECMAScript 的标准地位

## 2. 🫧 评价

JavaScript 的历史是一条从浏览器竞争走向语言标准化的路线。了解这段历史，能帮助你理解为什么它既有兼容包袱，也有极强的生命力。

## 3. 🤔 为什么 Web 早期需要客户端脚本？

Web 早期的网页越来越复杂，但网络速度很慢。一个很典型的问题是表单验证：用户填完表单并提交，服务器处理后才发现有必填项为空，页面再返回错误提示。

这类问题本身很简单，却需要一次完整的网络往返。在拨号上网时代，这种等待会明显影响体验。

客户端脚本语言的需求因此变得很强：

- 在浏览器端完成基础验证
- 立即响应用户输入
- 减少服务器压力
- 降低无效请求带来的等待时间

JavaScript 正是在这样的背景下诞生的。它最初不是为了替代后端语言，而是为了让浏览器具备处理简单逻辑的能力。

## 4. 🤔 Mocha、LiveScript 和 JavaScript 是什么关系？

1995 年，Brendan Eich 在 Netscape 工作期间，为即将发布的 Netscape Navigator 2 开发了一门脚本语言。这个语言最初叫 `Mocha`，后来改名为 `LiveScript`。

在 Netscape Navigator 2 发布前，Netscape 又把 `LiveScript` 改名为 `JavaScript`。这个命名和 Java 当时的热度有关，更多是一种市场传播选择，而不是说 JavaScript 是 Java 的简化版。

这段命名历史容易造成误解：

| 名称         | 含义                                       |
| ------------ | ------------------------------------------ |
| `Mocha`      | 早期内部名称                               |
| `LiveScript` | 发布前使用过的名称                         |
| `JavaScript` | 最终对外发布名称                           |
| `Java`       | 另一门独立语言，与 JavaScript 没有继承关系 |

JavaScript 和 Java 的语法表面上都有类 C 风格，但语言模型、运行方式和设计目标都不同。

## 5. 🤔 JScript 为什么会出现？

JavaScript 在 Netscape Navigator 中取得成功后，微软也在 Internet Explorer 3 中加入了自己的实现，名字叫 `JScript`。

`JScript` 这个名字主要是为了避免和 Netscape 的 JavaScript 名称产生许可纠纷。它本质上是微软浏览器中的 JavaScript 实现，但早期实现和 Netscape 版本并不完全一致。

于是，Web 开发者开始面对一个麻烦局面：

- Netscape 有 JavaScript
- IE 有 JScript
- 两者都想解决浏览器脚本问题
- 语言行为和宿主 API 却并不完全统一

这就是标准化的直接背景。没有统一标准，开发者很难写出稳定运行在不同浏览器中的代码。

## 6. 🤔 JavaScript 是如何走向标准化的？

1997 年，JavaScript 1.1 被提交给 Ecma。随后，Ecma 的第 39 技术委员会，也就是 `TC39`，负责制定一门通用、跨平台、厂商中立的脚本语言标准。

这个标准最终形成了 `ECMA-262`，语言名称是 `ECMAScript`。

几个名字之间的关系可以这样理解：

| 名称       | 角色                                         |
| ---------- | -------------------------------------------- |
| JavaScript | 最常见的语言名称，也是浏览器里的主流实现名称 |
| JScript    | 微软早期浏览器中的实现名称                   |
| ECMAScript | 标准化后的语言规范名称                       |
| ECMA-262   | 定义 ECMAScript 的标准文档                   |
| TC39       | 维护 ECMAScript 标准的委员会                 |

1998 年，ECMAScript 又被 ISO 和 IEC 采纳为国际标准。自此以后，主流浏览器都以 ECMAScript 作为 JavaScript 实现的语言核心依据。

## 7. 🤔 这段历史对今天写 JavaScript 有什么影响？

这段历史留下了两个重要影响。

第一，JavaScript 一开始就和浏览器竞争、宿主环境差异紧密绑定。因此，你在学习浏览器 API、兼容性和历史行为时，经常会看到不同浏览器实现差异留下的痕迹。

第二，ECMAScript 标准让 JavaScript 获得了稳定的语言核心。今天我们讨论变量、函数、对象、类、模块、期约、代理等语言能力时，真正依赖的是 ECMAScript 标准，而不是某一个浏览器厂商的私有实现。

所以，JavaScript 的历史可以概括为：先由浏览器需求催生，再被浏览器竞争推动，最后通过标准化获得长期演进的基础。
