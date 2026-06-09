# [0306. 处理XML](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0306.%20%E5%A4%84%E7%90%86XML)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么浏览器需要处理 XML？](#3-为什么浏览器需要处理-xml)
- [4. XML DOM、XPath 和 XSLT 分别解决什么问题？](#4-xml-domxpath-和-xslt-分别解决什么问题)
- [5. 为什么 XML API 的浏览器实现曾经不统一？](#5-为什么-xml-api-的浏览器实现曾经不统一)
- [6. 现代前端还需要 XML 吗？](#6-现代前端还需要-xml-吗)
- [7. 本章小结要抓住哪些结论？](#7-本章小结要抓住哪些结论)

<!-- endregion:toc -->

## 1. 本节内容

- XML 在 Web 数据交换中的历史定位
- XML DOM、XPath 和 XSLT 的关系
- 浏览器 XML API 的标准化差异
- `DOMParser`、`XMLSerializer`、`XPathEvaluator`、`XSLTProcessor`
- 本章小结：浏览器如何通过 JavaScript 处理 XML

## 2. 评价

- XML 在现代前端里已经不如 JSON 常见，但这一章很适合补齐浏览器平台的历史能力版图：DOM 不只服务 HTML，也曾经是处理 XML 的核心工具。

<N :ids="['0307', '0308', '0309']" />

## 3. 为什么浏览器需要处理 XML？

XML 曾经是互联网上存储和传输结构化数据的重要格式。早期 Web 服务、RSS、配置文件、办公文档格式和很多企业系统接口都大量使用 XML。

DOM 标准也不是只为 HTML 页面设计的。它的目标之一，就是提供一套能在浏览器、桌面应用和服务器环境中统一操作结构化文档的接口。因此，浏览器不仅能把 HTML 页面表示成 DOM，也能把 XML 文档表示成 DOM。

在 JavaScript 中处理 XML，核心思路通常是：

1. 把 XML 字符串解析成 DOM 文档。
2. 使用 DOM 方法或 XPath 查询节点。
3. 修改节点、读取内容或执行转换。
4. 必要时再序列化回 XML 字符串。

## 4. XML DOM、XPath 和 XSLT 分别解决什么问题？

本章的三个主题可以这样理解：

| 技术    | 解决的问题                                           |
| ------- | ---------------------------------------------------- |
| XML DOM | 把 XML 表示成节点树，并用 DOM API 创建、读取和修改。 |
| XPath   | 用路径表达式在 XML DOM 中定位节点或计算结果。        |
| XSLT    | 用样式表把 XML 转换成另一种文档或文本。              |

如果只是读取某几个元素，普通 DOM 方法就够了。如果要按复杂路径、条件、命名空间查询节点，XPath 更直接。如果要把 XML 转成 HTML、文本或另一种 XML 结构，XSLT 更合适。

## 5. 为什么 XML API 的浏览器实现曾经不统一？

很多浏览器在正式标准完善之前就已经实现了 XML 解析、XPath 和 XSLT 能力。因此，早期实现存在不少差异。

例如：

- DOM Level 2 Core 提供了创建 XML 文档的能力，但没有提供解析和序列化能力。
- `DOMParser` 和 `XMLSerializer` 起初是浏览器事实标准，后来被主流浏览器普遍实现。
- DOM Level 3 XPath 尝试标准化 XPath API，但旧版 IE 走过自己的实现路线。
- XSLT 在 DOM 标准中没有统一 API，`XSLTProcessor` 最终成为主流浏览器中的事实标准。

所以，学习这一章时要同时看到两层含义：一层是标准 API，另一层是浏览器在标准化之前形成的历史兼容性。

## 6. 现代前端还需要 XML 吗？

现代前端业务数据交换更常见的是 JSON。它更贴近 JavaScript 对象模型，解析和序列化也更简单。

但 XML 仍然没有完全消失。你可能会在这些场景里遇到它：

- 老系统接口。
- RSS 或 Atom 订阅。
- SVG、MathML 等 XML 语法体系。
- Office、电子书、配置文件等文档格式。
- 企业集成、支付、政企接口等历史包袱较重的系统。

因此，XML 相关 API 不一定是日常高频知识，但理解它们可以让你在遇到 XML 数据时知道浏览器原生能做什么、边界在哪里。

## 7. 本章小结要抓住哪些结论？

浏览器对使用 JavaScript 处理 XML 提供了相当完整的能力。DOM Level 2 可以创建 XML 文档，但解析和序列化主要依靠浏览器后来实现的 `DOMParser` 和 `XMLSerializer`。

XPath API 允许 JavaScript 在 DOM 文档中执行路径查询，并根据需要返回节点迭代器、快照、单个节点、字符串、数值或布尔值。处理带命名空间的 XML 时，还需要命名空间解析器。

XSLT 没有统一的正式 DOM API，但主流浏览器支持 `XSLTProcessor`，可以把 XML 按 XSLT 样式表转换成文档、文档片段或文本。

简单来说，这一章讲的是浏览器原生 XML 工具链：解析、查询、转换和序列化。即使今天 XML 不再是前端数据交换的默认选择，这些能力仍然是 Web 平台历史和兼容性的一部分。
