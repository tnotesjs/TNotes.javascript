# [0311. JSON](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0311.%20JSON)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 JSON 为什么会流行起来？](#3--json-为什么会流行起来)
- [4. 🤔 JSON 和 JavaScript 是什么关系？](#4--json-和-javascript-是什么关系)
- [5. 🤔 JSON 可以表示哪些数据？](#5--json-可以表示哪些数据)
- [6. 🤔 JavaScript 如何处理 JSON？](#6--javascript-如何处理-json)
- [7. 🤔 本章小结要抓住哪些结论？](#7--本章小结要抓住哪些结论)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- JSON 的历史定位和用途
- JSON 与 JavaScript 的关系
- JSON 支持的数据类型
- JSON 解析和序列化的核心 API
- 本章小结：为什么 JSON 成为 Web 数据交换常用格式

## 2. 🫧 评价

- JSON 看起来像 JavaScript 对象字面量，但最重要的认知是：它是一种语言无关的数据格式，不是 JavaScript 代码。

<N :ids="['0312', '0313']" />

## 3. 🤔 JSON 为什么会流行起来？

XML 曾经是 Web 服务和系统间通信的事实标准，但它的标签结构比较冗长。对于只想传输结构化数据的场景来说，XML 往往显得啰嗦。

JSON，也就是 JavaScript Object Notation，最初借用了 JavaScript 中对象、数组、字符串、数值等表示方式，用更轻量的文本格式描述结构化数据。它在 2000 年代初就已经被使用，后来由 Douglas Crockford 推动标准化。

JSON 流行起来的关键原因包括：

- 格式简洁，体积通常比等价 XML 小。
- 能自然表示对象和数组。
- JavaScript 可以直接把 JSON 解析成可用对象。
- 很多语言都提供 JSON 解析和序列化能力。
- 适合 Web API、配置文件、日志、消息通信等场景。

## 4. 🤔 JSON 和 JavaScript 是什么关系？

JSON 借用了 JavaScript 的一部分语法，但它不是 JavaScript。

这句话很关键。JSON 是一种数据格式，不是编程语言。它没有变量、函数、表达式、注释、对象实例和原型链，也不会执行逻辑。

例如，下面是 JavaScript 对象字面量：

```js
const user = {
  name: 'Ada',
  age: 28,
}
```

下面才是 JSON 文本：

```json
{
  "name": "Ada",
  "age": 28
}
```

它们看起来相似，但语义不同。JavaScript 代码可以创建变量、执行表达式；JSON 只是文本数据，必须通过解析器变成 JavaScript 值。

## 5. 🤔 JSON 可以表示哪些数据？

JSON 支持三类结构：

| 类型   | 说明                                           |
| ------ | ---------------------------------------------- |
| 简单值 | 字符串、数值、布尔值和 `null`。                |
| 对象   | 无序的键值对集合，键必须是双引号包裹的字符串。 |
| 数组   | 有序值列表，值可以是简单值、对象或数组。       |

需要注意：

- JSON 字符串必须使用双引号。
- JSON 对象的属性名必须使用双引号。
- JSON 不支持 `undefined`。
- JSON 不支持函数。
- JSON 不支持注释。
- JSON 不允许尾随逗号。

这些限制让 JSON 更像严格的数据交换格式，而不是脚本语言。

## 6. 🤔 JavaScript 如何处理 JSON？

现代 JavaScript 使用全局 `JSON` 对象处理 JSON。

`JSON.stringify()` 把 JavaScript 值序列化成 JSON 字符串：

```js
const book = {
  title: 'Professional JavaScript',
  edition: 4,
}

const jsonText = JSON.stringify(book)
```

`JSON.parse()` 把 JSON 字符串解析成 JavaScript 值：

```js
const bookCopy = JSON.parse(jsonText)
```

早期有些代码会用 `eval()` 解析 JSON，因为 JSON 语法是 JavaScript 语法的子集。但这是危险做法。`eval()` 会执行代码，而不仅仅是解析数据。现代代码应该始终使用 `JSON.parse()`。

## 7. 🤔 本章小结要抓住哪些结论？

JSON 是一种轻量级数据格式，用 JavaScript 语法子集表示对象、数组、字符串、数值、布尔值和 `null`。它比 XML 更简洁，也更容易被 JavaScript 使用，因此迅速成为 Web API 常用的数据交换格式。

ECMAScript 5 定义了原生 `JSON` 对象。`JSON.stringify()` 用于把 JavaScript 值序列化成 JSON 字符串，`JSON.parse()` 用于把 JSON 字符串解析成 JavaScript 值。这两个方法都支持额外选项，可以在序列化或解析过程中筛选、替换、格式化或还原数据。

学习 JSON 时，要一直把它当作数据格式来理解。它和 JavaScript 关系很近，但不能混同。
