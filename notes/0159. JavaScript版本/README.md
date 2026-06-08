# [0159. JavaScript版本](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0159.%20JavaScript%E7%89%88%E6%9C%AC)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 现代开发中如何描述 JavaScript 语言版本？](#3-现代开发中如何描述-javascript-语言版本)
  - [3.1. 历史问题](#31-历史问题)
  - [3.2. 现代开发统一口径](#32-现代开发统一口径)
- [4. 最初的 JavaScript 1.x 版本是谁在维护？](#4-最初的-javascript-1x-版本是谁在维护)
- [5. ECMAScript 的版本演进的关键节点是？](#5-ecmascript-的版本演进的关键节点是)
- [6. 如何查看浏览器对不同版本 ECMAScript 新特性的支持情况？](#6-如何查看浏览器对不同版本-ecmascript-新特性的支持情况)
- [7. 如何在实战开发中更好地处理兼容性问题？](#7-如何在实战开发中更好地处理兼容性问题)
  - [7.1. 前置决策：确定支持范围](#71-前置决策确定支持范围)
  - [7.2. 构建工具：转译兼容代码](#72-构建工具转译兼容代码)
- [8. 引用](#8-引用)

<!-- endregion:toc -->

## 1. 本节内容

- JavaScript 版本口径
- Netscape 与 Mozilla 版本号
- JScript 版本差异
- ECMAScript 版本演进
- 浏览器特性支持

## 2. 评价

在早期，JavaScript 的版本问题容易混淆，因为它同时涉及浏览器实现版本和 ECMAScript 标准版本。

在现代日常开发中，跟着 ECMAScript 标准版本走即可，主要关注 ECMAScript 年度版本和具体特性的支持状态。

## 3. 现代开发中如何描述 JavaScript 语言版本？

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

## 4. 最初的 JavaScript 1.x 版本是谁在维护？

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

## 5. ECMAScript 的版本演进的关键节点是？

ES6（也称 ES2015）是一个重要的分水岭。它将 JavaScript 从传统的脚本语言进一步推向现代应用开发语言，引入了许多至今仍广泛使用的基础能力及核心特性，如模块、类、箭头函数、Promise、解构赋值等，极大地扩展了语言能力。

ECMAScript 的版本以标准文档的 `edition` （版次）来表示。换句话说，ECMAScript 的版本号，对应的是官方标准文档《ECMA-262》第几次发布的版次。

| 版本 | 《ECMA-262》文档版本 | 时间 | 关键意义 |
| --- | --- | --- | --- |
| ES1 | 第 1 版 | 1997‑06 | 第一个标准化版本，奠定语言规范基础 |
| ES2 | 第 2 版 | 1998‑08 | 对齐 ISO/IEC 标准，主要为编辑性更新 |
| ES3 | 第 3 版 | 1999‑12 | 增强正则表达式、try/catch、switch 等核心语法 |
| ES4 | — | 未发布 | 改动过大，最终被放弃 |
| ES5 | 第 5 版 | 2009‑12 | 增加严格模式、JSON、属性描述符等重要特性 |
| ES2015 (ES6) | 第 6 版 | 2015‑06 | 引入类、模块、箭头函数、Promise、解构、迭代器、代理等现代核心能力 |
| ES2016 (ES7) | 第 7 版 | 2016‑06 | 首批年度版本，包含 `Array.prototype.includes` 和指数运算符（`**`） |
| ES2017 (ES8) | 第 8 版 | 2017‑06 | 增加 `async/await`、`Object.entries`、`Object.values`、字符串填充方法 |
| ES2018 (ES9) | 第 9 版 | 2018‑06 | 增加异步迭代、`Promise.finally`、对象 rest/spread、正则命名组等 |
| ES2019 (ES10) | 第 10 版 | 2019‑06 | 包含 `flat()`、`flatMap()`、`Object.fromEntries()`、`trimStart`、`trimEnd` 等 |
| ES2020 (ES11) | 第 11 版 | 2020‑06 | 增加可选链（`?.`）、空值合并（`??`）、`globalThis`、`BigInt`、`Promise.allSettled` |
| ES2021 (ES12) | 第 12 版 | 2021‑06 | 包含 `replaceAll`、数字分隔符（`1_000_000`）、`Promise.any`、逻辑赋值运算符 |
| ES2022 (ES13) | 第 13 版 | 2022‑06 | 增加类私有字段（`#`）、顶级 `await`、`Object.hasOwn`、`Error.cause` 等 |
| ES2023 (ES14) | 第 14 版 | 2023‑06 | 包含 `findLast`/`findLastIndex`、`toSorted`/`toReversed`/`toSpliced`/`with` 等不可变数组方法，Hashbang 支持，WeakMap 键支持 Symbol |
| ES2024 (ES15) | 第 15 版 | 2024‑06 | 增加 `Object.groupBy`/`Map.groupBy`、`Promise.withResolvers`、正则 `v` 标志、`ArrayBuffer` 转移方法、字符串 `isWellFormed`/`toWellFormed` 等 |
| ES2025 (ES16) | 第 16 版 | 2025‑06 | 引入 Iterator Helpers（`map`/`filter`/`toArray` 等）、Set 方法（`union`/`intersection` 等）、`Promise.try`、Base64 编解码、内联正则修饰符 |
| ES2026 (ES17) | 第 17 版 | 2026‑06 | 计划发布，预计包含 `Temporal`、`Error.isError` 等（最终以 TC39 发布的提案为准） |

ES2015 之前只说数字（ES3、ES5），ES2015 之后官方推年份（ES2015、ES2024），但数字版号（第 6 版、第 7 版）在标准文档里依然存在。

::: tip

核心参考资料：第四版红宝书 `《JavaScript高级程序设计（第4版）》` 中以 ES2019 为时间节点，介绍到 ECMA-262 的第 10 版。

:::

## 6. 如何查看浏览器对不同版本 ECMAScript 新特性的支持情况？

如果你不确定某个 API 是否被目标浏览器支持，可以直接在 [MDN Web Docs][1] 或 [Can I use][2] 上搜索这个 API，文档中会提供「浏览器兼容性」的信息。以 ES2025 推出的 `Promise.try` 为例：

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-12-10-17.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-12-11-06.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-12-10-02.png)

:::

具体的 API、运算符、语句等，它们的指代是明确的，你可以直接通过搜索框搜索快速定位到相关文档，但是其它特性，就不太好搜索了，因为你不知道应该在搜索框中填写什么。

推荐的做法：先明确你要搜索的特性的 ECMAScript 官方术语，比如日常叫法：数字分隔符 `1_000_000`，对应的官方术语是「Numeric Separators」。然后再在 MDN 或 Can I use 上搜索这个术语，往往就能找到相关文档和兼容性信息了。

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-12-24-49.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-12-25-17.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-12-24-25.png)

:::

## 7. 如何在实战开发中更好地处理兼容性问题？

关于兼容性问题，在实际开发中，推荐使用最新版的 chrome 浏览器来开发，因为它的兼容性表现比较好，对新特性的支持更好一些。你可以默认使用最新的 ECMAScript 版本来编写代码，然后再结合工具对编译结果“降级”处理，以适配更多的浏览器。

在真实工作中，兼容性问题的处理往往都是后置的，一般都是用户反馈有问题了，再跟进排查可能的兼容性问题，这是业界非常普遍的现象。因为市面上的浏览器参差不齐，我们几乎不可能在开发阶段就完全覆盖到所有用户的环境。

### 7.1. 前置决策：确定支持范围

项目开始前，团队应该通过数据达成共识：我们要支持哪些浏览器？ 依据不是拍脑袋，而是产品自身的用户 analytics（如百度统计、Google Analytics）数据。通常分级为：

- A级（全力支持）：占流量 80% 以上的主流浏览器最新版，必须完美运行。
- B级（基本支持）：占流量 15% 左右的稍旧版本，保证核心功能可用，样式可以略有降级。
- C级（尽力支持）：占流量不足 5% 的浏览器，只保证基本内容可读，不做功能完全对等的承诺。

有了这个清晰的边界，开发和测试的目标就明确了，也能避免为极少数的用户投入不成比例的资源。

### 7.2. 构建工具：转译兼容代码

结合 Babel 和 browserslist 配置，在构建时自动将你的现代 JS 代码转译为兼容目标浏览器的代码，这也是目前主流的做法。

## 8. 引用

- [MDN Web Docs][1]
- [Can I use][2]

[1]: https://developer.mozilla.org/zh-CN/
[2]: https://caniuse.com/
