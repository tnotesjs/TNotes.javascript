# [0313. 解析与序列化](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0313.%20%E8%A7%A3%E6%9E%90%E4%B8%8E%E5%BA%8F%E5%88%97%E5%8C%96)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `JSON.stringify()` 做了什么？](#3-jsonstringify-做了什么)
- [4. `JSON.parse()` 做了什么？](#4-jsonparse-做了什么)
- [5. 如何用数组过滤序列化字段？](#5-如何用数组过滤序列化字段)
- [6. 如何用函数过滤或替换序列化结果？](#6-如何用函数过滤或替换序列化结果)
- [7. 如何让序列化结果更易读？](#7-如何让序列化结果更易读)
- [8. `toJSON()` 如何自定义序列化？](#8-tojson-如何自定义序列化)
- [9. `JSON.parse()` 的 reviver 有什么用？](#9-jsonparse-的-reviver-有什么用)
- [10. JSON 能不能用来深拷贝对象？](#10-json-能不能用来深拷贝对象)

<!-- endregion:toc -->

## 1. 本节内容

- `JSON.stringify()`
- `JSON.parse()`
- 序列化时忽略的值
- 过滤器数组和过滤器函数
- 缩进参数和可读格式
- `toJSON()` 自定义序列化
- `reviver` 还原函数

## 2. 评价

- `JSON.stringify()` 和 `JSON.parse()` 是非常日常的 API，但它们的第二、第三个参数藏着不少实用能力，尤其适合做字段过滤、格式化和日期还原。

## 3. `JSON.stringify()` 做了什么？

`JSON.stringify()` 会把 JavaScript 值序列化成 JSON 字符串。

```js
const book = {
  title: 'Professional JavaScript',
  authors: ['Nicholas C. Zakas', 'Matt Frisbie'],
  edition: 4,
  year: 2017,
}

const jsonText = JSON.stringify(book)

console.log(jsonText)
```

默认情况下，输出结果不包含额外空格或缩进。

```json
{
  "title": "Professional JavaScript",
  "authors": ["Nicholas C. Zakas", "Matt Frisbie"],
  "edition": 4,
  "year": 2017
}
```

序列化时要注意：

- 函数会被忽略。
- 原型上的成员不会被序列化。
- 对象属性值为 `undefined` 时会被跳过。
- 数组中的 `undefined`、函数等不能表示为 JSON 的值通常会变成 `null`。
- `Date` 会通过自身的 `toJSON()` 转换成 ISO 格式字符串。

## 4. `JSON.parse()` 做了什么？

`JSON.parse()` 会把 JSON 字符串解析成 JavaScript 值。

```js
const bookCopy = JSON.parse(jsonText)

console.log(bookCopy.title)
```

解析得到的是新对象。它和序列化前的对象不是同一个引用。

```js
console.log(bookCopy === book) // false
```

如果传入的字符串不是合法 JSON，`JSON.parse()` 会抛出错误。

```js
try {
  JSON.parse('{ name: "Ada" }')
} catch (error) {
  console.log('JSON 格式不合法')
}
```

不要使用 `eval()` 解析 JSON。`JSON.parse()` 只解析数据，`eval()` 会执行代码，安全风险完全不同。

## 5. 如何用数组过滤序列化字段？

`JSON.stringify()` 的第二个参数可以是数组，用来指定保留哪些属性。

```js
const book = {
  title: 'Professional JavaScript',
  authors: ['Nicholas C. Zakas', 'Matt Frisbie'],
  edition: 4,
  year: 2017,
}

const jsonText = JSON.stringify(book, ['title', 'edition'])

console.log(jsonText)
```

结果只包含 `title` 和 `edition`。

```json
{ "title": "Professional JavaScript", "edition": 4 }
```

这种方式适合简单白名单场景，例如只导出对象中的部分公开字段。

## 6. 如何用函数过滤或替换序列化结果？

`JSON.stringify()` 的第二个参数也可以是函数。这个函数称为 replacer，会接收 `key` 和 `value`，并返回用于序列化的新值。

```js
const jsonText = JSON.stringify(book, (key, value) => {
  switch (key) {
    case 'authors':
      return value.join(', ')
    case 'year':
      return 5000
    case 'edition':
      return undefined
    default:
      return value
  }
})
```

这个例子中：

- `authors` 数组会被转换成字符串。
- `year` 会被替换成 `5000`。
- `edition` 返回 `undefined`，因此会被忽略。
- 其他属性原样返回。

最终结果类似：

```json
{
  "title": "Professional JavaScript",
  "authors": "Nicholas C. Zakas, Matt Frisbie",
  "year": 5000
}
```

replacer 第一次调用时，`key` 是空字符串，`value` 是整个待序列化对象。因此默认分支通常要返回 `value`，否则可能把整个结果过滤掉。

## 7. 如何让序列化结果更易读？

`JSON.stringify()` 的第三个参数用于控制缩进。

```js
const jsonText = JSON.stringify(book, null, 2)
```

结果会带换行和缩进：

```json
{
  "title": "Professional JavaScript",
  "authors": ["Nicholas C. Zakas", "Matt Frisbie"],
  "edition": 4,
  "year": 2017
}
```

如果第三个参数是数值，表示每一级缩进的空格数，最大按 `10` 处理。

如果第三个参数是字符串，会用这个字符串作为缩进文本，最多取前 `10` 个字符。

```js
const jsonText = JSON.stringify(book, null, '--')
```

这种格式适合调试、日志和配置文件。接口传输时通常仍使用无额外空白的紧凑格式。

## 8. `toJSON()` 如何自定义序列化？

对象可以定义 `toJSON()` 方法。`JSON.stringify()` 会先调用它，再继续序列化返回值。

```js
const book = {
  title: 'Professional JavaScript',
  authors: ['Nicholas C. Zakas', 'Matt Frisbie'],
  edition: 4,
  year: 2017,
  toJSON() {
    return this.title
  },
}

console.log(JSON.stringify(book))
```

结果是一个 JSON 字符串值：

```json
"Professional JavaScript"
```

原生 `Date` 就定义了 `toJSON()`，因此日期对象会被序列化成 ISO 8601 字符串。

序列化的大致顺序是：

1. 如果存在 `toJSON()`，先调用它取得实际值。
2. 如果提供了 replacer，再对实际值应用过滤或替换。
3. 对返回值继续序列化。
4. 如果提供了缩进参数，再格式化输出。

`toJSON()` 依赖 `this`，不适合用箭头函数定义。

## 9. `JSON.parse()` 的 reviver 有什么用？

`JSON.parse()` 可以接收第二个参数 reviver。它会在解析过程中访问每个键值对，并允许你替换或删除值。

```js
const book = {
  title: 'Professional JavaScript',
  releaseDate: new Date(2017, 11, 1),
}

const jsonText = JSON.stringify(book)

const bookCopy = JSON.parse(jsonText, (key, value) => {
  if (key === 'releaseDate') {
    return new Date(value)
  }

  return value
})

console.log(bookCopy.releaseDate.getFullYear()) // 2017
```

reviver 和 replacer 的函数签名一样，都是 `(key, value)`。如果 reviver 返回 `undefined`，对应属性会从结果中删除；返回其他值，则该值会成为最终结果中的属性值。

reviver 常用于：

- 把日期字符串还原成 `Date`。
- 把数字字符串转成数值。
- 删除不需要的字段。
- 对解析结果做统一清洗。

## 10. JSON 能不能用来深拷贝对象？

很多代码会用 `JSON.stringify()` 加 `JSON.parse()` 做简单深拷贝。

```js
const copy = JSON.parse(JSON.stringify(source))
```

这种方式只适合纯 JSON 数据。它会丢失或改变很多 JavaScript 特性：

- `Date` 会变成字符串。
- 函数会丢失。
- `undefined` 会丢失或变成 `null`。
- `Map`、`Set`、`RegExp` 等对象不能正确保留语义。
- 循环引用会导致报错。

所以，JSON 解析和序列化适合数据交换，不是通用对象克隆工具。只有当数据本来就是 JSON 兼容结构时，这种写法才比较稳妥。
