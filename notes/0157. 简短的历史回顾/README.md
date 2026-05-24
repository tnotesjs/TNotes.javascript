# [0157. 简短的历史回顾](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0157.%20%E7%AE%80%E7%9F%AD%E7%9A%84%E5%8E%86%E5%8F%B2%E5%9B%9E%E9%A1%BE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 Web 早期需要客户端脚本？](#3--为什么-web-早期需要客户端脚本)
- [4. 🤔 Mocha、LiveScript 和 JavaScript 是什么关系？](#4--mochalivescript-和-javascript-是什么关系)
- [5. 🤔 JScript 的出现背景是？](#5--jscript-的出现背景是)
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

JavaScript 的历史是一条从浏览器竞争走向语言标准化的路线。了解这段历史，能帮助你理解为什么它会存在兼容性问题的包袱。

## 3. 🤔 为什么 Web 早期需要客户端脚本？

Web 早期，网页功能日益复杂，但网络速度却十分缓慢。一个典型的问题就是表单验证：用户填写完表单并提交后，服务器处理时才发现有必填项为空，再返回错误提示页面。整个过程既笨拙又费时。

这类看似简单的操作，在当时却需要一次完整的网络往返。尤其是在拨号上网时代，这种等待对用户体验的影响非常明显。

因此，对客户端脚本语言的需求应运而生。它的核心优势包括：

- 在浏览器端完成基础验证，避免提交到服务器后才报错
- 即时响应用户操作，无需等待网络请求
- 减轻服务器的重复验证负担
- 避免无效请求带来的等待时间，提升操作流畅度

正是在这样的背景下，JavaScript 应运而生。它的初衷并非替代后端语言，而是让浏览器具备处理简单逻辑的能力，使网页变得更加智能和响应迅速。

## 4. 🤔 Mocha、LiveScript 和 JavaScript 是什么关系？

1995 年，Brendan Eich 在 Netscape 工作期间，为即将发布的 Netscape Navigator 2 浏览器开发了一门脚本语言。该语言最初命名为 `Mocha`，后更名为 `LiveScript`。

在 Netscape Navigator 2 正式发布前夕，Netscape 又将 `LiveScript` 改名为 `JavaScript`。这次更名主要借势当时 Java 的热度，是一种市场策略，并不意味着 JavaScript 是 Java 的简化版本。

这段命名历史容易引发误解，下表梳理了相关名称的含义：

| 名称         | 含义                                             |
| ------------ | ------------------------------------------------ |
| `Mocha`      | 项目早期的内部开发代号                           |
| `LiveScript` | 对外发布前曾使用过的名称                         |
| `JavaScript` | 最终面向用户发布的正式名称                       |
| `Java`       | 另一门独立的编程语言，与 JavaScript 没有继承关系 |

虽然 JavaScript 与 Java 的语法都带有类 C 风格，但两者在语言模型、运行机制和设计目标上存在本质区别。

## 5. 🤔 JScript 的出现背景是？

JavaScript 在 Netscape Navigator 中取得成功后，微软也在 Internet Explorer 3 中推出了自己的脚本语言实现，命名为 `JScript`。

`JScript` 的命名主要是为了避免与 Netscape 的 JavaScript 产生商标或许可纠纷。从功能上看，它本质上是微软浏览器中的 JavaScript 实现，但早期版本与 Netscape 的实现并不完全兼容。

这给 Web 开发者带来了一个棘手的问题：

- Netscape 浏览器使用 JavaScript
- IE 浏览器使用 JScript
- 两者都旨在解决浏览器端的脚本需求
- 但语言行为及宿主 API 存在差异，未能统一

这正是标准化进程的直接推动力。如果没有统一的语言标准，开发者很难写出能够在不同浏览器中稳定运行的代码。

## 6. 🤔 JavaScript 是如何走向标准化的？

1997 年，JavaScript 1.1 被提交给 Ecma 组织。随后，Ecma 下属的第 39 技术委员会（即 `TC39`）负责制定一门通用、跨平台、厂商中立的脚本语言标准。

这项工作的最终成果是标准文档 `ECMA-262`，其中定义的标准化语言被命名为 `ECMAScript`。

几个相关名称的关系如下：

| 名称       | 角色                                           |
| ---------- | ---------------------------------------------- |
| JavaScript | 最广为人知的名称，也是浏览器中最主流的实现名称 |
| JScript    | 微软早期浏览器中使用的实现名称                 |
| ECMAScript | 标准化后的语言规范名称                         |
| ECMA-262   | 正式定义 ECMAScript 标准的文档                 |
| TC39       | 负责制定和维护 ECMAScript 标准的委员会         |

1998 年，ECMAScript 进一步被 ISO 和 IEC 采纳为国际标准。自此，主流浏览器均以 ECMAScript 作为 JavaScript 语言实现的核心依据。

## 7. 🤔 这段历史对今天写 JavaScript 有什么影响？

这段历史留下了两个重要影响。

- 第一，JavaScript 从诞生之初就与浏览器竞争和宿主环境差异紧密绑定。因此，你在学习浏览器 API、兼容性以及历史行为时，经常会看到不同浏览器实现差异所留下的痕迹。
- 第二，ECMAScript 标准为 JavaScript 提供了稳定可靠的语言核心。今天我们讨论变量、函数、对象、类、模块、Promise、代理等语言特性时，真正依赖的是 ECMAScript 标准，而非某个浏览器厂商的私有实现。

综上，JavaScript 的历史可以概括为：由浏览器需求催生，被浏览器竞争推动，最终通过标准化获得长期演进的基础。
