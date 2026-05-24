# [0312. 语法](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0312.%20%E8%AF%AD%E6%B3%95)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 JSON 支持哪几类值？](#3--json-支持哪几类值)
- [4. 🤔 简单值如何书写？](#4--简单值如何书写)
- [5. 🤔 JSON 对象和 JavaScript 对象字面量有什么区别？](#5--json-对象和-javascript-对象字面量有什么区别)
- [6. 🤔 JSON 数组如何书写？](#6--json-数组如何书写)
- [7. 🤔 手写 JSON 时最常见的语法错误有哪些？](#7--手写-json-时最常见的语法错误有哪些)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- JSON 的三类值
- 简单值的写法
- 对象语法和双引号要求
- 数组语法和嵌套结构
- JSON 与 JavaScript 字面量的差异

## 2. 🫧 评价

- JSON 语法越简单，越容易被误写成 JavaScript 字面量；真正容易出错的地方，恰恰是双引号、尾随逗号、`undefined` 和注释这些细节。

## 3. 🤔 JSON 支持哪几类值？

JSON 语法可以表示三类值：

| 类型   | 示例                            | 说明                            |
| ------ | ------------------------------- | ------------------------------- |
| 简单值 | `"hello"`、`42`、`true`、`null` | 字符串、数值、布尔值和 `null`。 |
| 对象   | `{ "name": "Ada" }`             | 键值对集合。                    |
| 数组   | `[1, 2, 3]`                     | 有序值列表。                    |

这些值可以互相嵌套。对象的属性值可以是数组，数组元素可以是对象，对象内部也可以继续嵌套对象。

JSON 没有变量声明，也不是语句，所以 JSON 文本末尾不需要分号。

## 4. 🤔 简单值如何书写？

JSON 中的简单值包括字符串、数值、布尔值和 `null`。

```json
5
```

```json
"Hello world!"
```

```json
true
```

```json
null
```

JSON 字符串必须使用双引号。单引号不是合法 JSON 字符串。

```txt
'Hello world!'
```

上面这种写法在 JavaScript 中是字符串，但在 JSON 中是非法的。

另外，`undefined` 不是 JSON 值。JSON 只能表示 `null`，不能表示 JavaScript 里的 `undefined`。

## 5. 🤔 JSON 对象和 JavaScript 对象字面量有什么区别？

JavaScript 对象字面量可以这样写：

```js
const person = {
  name: 'Nicholas',
  age: 29,
}
```

但 JSON 对象必须这样写：

```json
{
  "name": "Nicholas",
  "age": 29
}
```

主要差异包括：

| 差异           | JavaScript 对象字面量  | JSON 对象        |
| -------------- | ---------------------- | ---------------- |
| 是否有变量声明 | 可以有。               | 没有。           |
| 属性名引号     | 很多情况下可以省略。   | 必须使用双引号。 |
| 字符串引号     | 单引号和双引号都可以。 | 必须使用双引号。 |
| 尾随逗号       | 现代 JavaScript 允许。 | 不允许。         |
| 函数属性       | 可以有。               | 不允许。         |
| `undefined`    | 可以出现。             | 不允许。         |

JSON 对象中的属性值可以继续是对象。

```json
{
  "name": "Nicholas",
  "age": 29,
  "school": {
    "name": "Merrimack College",
    "location": "North Andover, MA"
  }
}
```

不同层级的对象可以有相同属性名。比如上面顶层对象和 `school` 对象都可以有 `name`。但同一个对象内部不应该出现重复属性名，否则后续解析行为容易让人误解。

## 6. 🤔 JSON 数组如何书写？

JSON 数组使用方括号表示，元素之间用逗号分隔。

```json
[25, "hi", true]
```

数组元素可以是任意 JSON 值，包括对象和数组。

```json
[
  {
    "title": "Professional JavaScript",
    "authors": ["Nicholas C. Zakas", "Matt Frisbie"],
    "edition": 4,
    "year": 2017
  },
  {
    "title": "Professional Ajax",
    "authors": ["Nicholas C. Zakas", "Jeremy McPeak", "Joe Fawcett"],
    "edition": 2,
    "year": 2008
  }
]
```

对象和数组经常组合出现，用来表达复杂数据结构。虽然 JSON 顶层可以是简单值，但实际接口中最常见的顶层结构仍然是对象或数组。

## 7. 🤔 手写 JSON 时最常见的语法错误有哪些？

常见错误包括：

- 属性名没有双引号。
- 字符串使用单引号。
- 写了尾随逗号。
- 写了注释。
- 使用了 `undefined`、函数、正则表达式等非 JSON 值。
- 把 JavaScript 表达式写进 JSON。

下面这些都不是合法 JSON：

```txt
{
  name: "Ada"
}
```

```txt
{
  "name": 'Ada'
}
```

```txt
{
  "name": "Ada",
}
```

```txt
{
  "createdAt": new Date()
}
```

检查 JSON 是否有效时，不要只凭眼睛看它像不像 JavaScript 对象。最稳妥的方式是交给 `JSON.parse()` 或 JSON 校验工具。
