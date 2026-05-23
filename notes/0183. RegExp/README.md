# [0183. RegExp](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0183.%20RegExp)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `RegExp` 主要是拿来解决什么问题的？](#3--regexp-主要是拿来解决什么问题的)
- [4. 🤔 正则表达式应该怎样创建？](#4--正则表达式应该怎样创建)
- [5. 🤔 常见的标记和模式含义应该怎样理解？](#5--常见的标记和模式含义应该怎样理解)
- [6. 🤔 `exec()`、`test()` 和 `lastIndex` 到底怎么配合？](#6--exectest-和-lastindex-到底怎么配合)
- [7. 🤔 字符串为什么也能直接用正则做事？](#7--字符串为什么也能直接用正则做事)
- [8. 🤔 使用正则时哪些能力不建议重度依赖？](#8--使用正则时哪些能力不建议重度依赖)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 正则表达式的创建方式
- 常用标记与模式含义
- 字面量与构造函数的差异
- `exec()`、`test()` 与 `lastIndex`
- 字符串与正则的配合方法
- 正则使用边界与注意点

## 2. 🫧 评价

- 正则表达式很强，但它的复杂度上升得也很快。你应该先掌握“怎么读”和“怎么验证”一个模式，再追求一条表达式包打天下，否则几个月后连你自己都未必看得懂。

## 3. 🤔 `RegExp` 主要是拿来解决什么问题的？

`RegExp` 是 JavaScript 提供的模式匹配能力。它让你不用手写一堆字符判断，也能描述“某类字符串应该长什么样”。

比如：

- 判断输入是不是手机号、邮箱或身份证格式。
- 从一段文本里提取符合模式的片段。
- 批量替换某一类字符串。

正则表达式不是用来替代所有字符串操作的，而是在“规则匹配”场景下非常高效。

## 4. 🤔 正则表达式应该怎样创建？

最常见的两种方式是字面量和构造函数。

字面量形式：

```js
const pattern = /at/g
```

构造函数形式：

```js
const pattern = new RegExp('at', 'g')
```

如果模式是固定写死的，通常优先用字面量，读起来更直接。

如果模式需要在运行时拼接，或者要从字符串变量生成，就用构造函数。但要注意构造函数里的转义往往更麻烦，因为字符串本身就要先经历一次转义。

## 5. 🤔 常见的标记和模式含义应该怎样理解？

几个常见标记可以先记住：

| 标记 | 作用                              |
| ---- | --------------------------------- |
| `g`  | 全局匹配，不只找第一个            |
| `i`  | 忽略大小写                        |
| `m`  | 多行模式                          |
| `y`  | 粘附匹配，从 `lastIndex` 位置继续 |
| `u`  | 启用 Unicode 语义                 |
| `s`  | 让 `.` 也能匹配换行               |

例如：

```js
const pattern1 = /at/g
const pattern2 = /[bc]at/i
const pattern3 = /.at/gi
```

模式里很多字符是元字符，不能按普通字符理解，比如 `.`、`*`、`+`、`?`、`[]`、`()`、`{}`、`|`。如果你想匹配它们本身，就需要转义。

```js
const pattern = /\.at/gi
```

这里匹配的是字符串 `.at`，不是“任意字符加 at”。

## 6. 🤔 `exec()`、`test()` 和 `lastIndex` 到底怎么配合？

`test()` 用来回答“有没有匹配到”，适合做布尔判断：

```js
const pattern = /\d{3}-\d{2}-\d{4}/
console.log(pattern.test('000-00-0000')) // true
```

`exec()` 用来拿更详细的匹配结果，尤其适合配合捕获组：

```js
const text = 'mom and dad and baby'
const pattern = /mom( and dad( and baby)?)?/i
const match = pattern.exec(text)

console.log(match[0])
console.log(match[1])
console.log(match[2])
```

当模式带 `g` 或 `y` 时，`lastIndex` 会影响下一次从哪里开始继续查找。

```js
const text = 'cat, bat, sat'
const pattern = /.at/g

console.log(pattern.exec(text)?.[0]) // 'cat'
console.log(pattern.exec(text)?.[0]) // 'bat'
```

所以只要模式是可复用的全局正则，你就要意识到它内部状态可能已经变了，不能假设每次都从头开始。

## 7. 🤔 字符串为什么也能直接用正则做事？

因为 `String` 和 `RegExp` 在语言层面就是配套设计的。

字符串上这些方法都能直接接收正则：

- `match()`
- `search()`
- `replace()`
- `split()`

例如：

```js
const text = 'cat, bat, sat, fat'

console.log(text.match(/.at/g))
console.log(text.search(/at/))
console.log(text.replace(/at/g, 'ond'))
console.log(text.split(/,\s*/))
```

这里最常用的通常是 `replace()` 和 `split()`，因为它们可以把“规则匹配”和“文本处理”连起来。

## 8. 🤔 使用正则时哪些能力不建议重度依赖？

有两个点值得单独提醒。

第一，`RegExp` 构造函数上的历史静态属性，比如 `RegExp.$1`、`RegExp.lastMatch` 这一类能力，兼容性和可维护性都不理想，现代代码不值得依赖。

第二，正则不是越短越好，也不是越花哨越好。只要表达式已经让你自己难以一眼读懂，就应该考虑拆开、加注释说明，或者干脆换成普通字符串逻辑。

正则最好的状态是：规则清晰、测试充分、维护者能读懂。
