# [0171. 数据类型](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0171.%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 ECMAScript 有哪些数据类型？](#3--ecmascript-有哪些数据类型)
- [4. 🤔 `typeof` 能判断哪些类型？](#4--typeof-能判断哪些类型)
- [5. 🤔 `undefined` 和 `null` 应该怎样区分？](#5--undefined-和-null-应该怎样区分)
- [6. 🤔 Boolean 转换为什么重要？](#6--boolean-转换为什么重要)
- [7. 🤔 Number 类型有哪些关键细节？](#7--number-类型有哪些关键细节)
- [8. 🤔 String 类型除了保存文本还有哪些特点？](#8--string-类型除了保存文本还有哪些特点)
- [9. 🤔 Symbol 类型解决什么问题？](#9--symbol-类型解决什么问题)
- [10. 🤔 Object 类型为什么是所有对象的基础？](#10--object-类型为什么是所有对象的基础)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- ECMAScript 的原始类型和对象类型
- `typeof` 的返回结果
- `undefined` 与 `null`
- 布尔值和假值转换
- Number、String、Symbol 和 Object 的核心行为
- 常见类型转换入口

## 2. 🫧 评价

数据类型是 JavaScript 最容易“看起来会、用起来坑”的部分。你不需要一次记住所有转换细节，但必须知道哪些值是假值、`typeof null` 为什么怪、`NaN` 为什么不等于自己，以及字符串和数值什么时候会被自动转换。

## 3. 🤔 ECMAScript 有哪些数据类型？

ECMAScript 有 7 种原始类型：

- `Undefined`
- `Null`
- `Boolean`
- `Number`
- `String`
- `Symbol`
- `BigInt`

还有一种复杂数据类型：`Object`。

原始值是最简单的数据；对象是一组无序名值对的集合，可以承载属性和方法。

JavaScript 变量本身没有固定类型，真正有类型的是变量当前保存的值：

```js
let value = 1
value = 'one'
value = { text: 'one' }
```

## 4. 🤔 `typeof` 能判断哪些类型？

`typeof` 是用来判断值类型的操作符，返回的是字符串。

常见返回结果如下：

| 表达式                  | 结果          |
| ----------------------- | ------------- |
| `typeof undefined`      | `'undefined'` |
| `typeof true`           | `'boolean'`   |
| `typeof 'hello'`        | `'string'`    |
| `typeof 123`            | `'number'`    |
| `typeof Symbol()`       | `'symbol'`    |
| `typeof 10n`            | `'bigint'`    |
| `typeof function () {}` | `'function'`  |
| `typeof {}`             | `'object'`    |
| `typeof null`           | `'object'`    |

`typeof null` 返回 `'object'` 是 JavaScript 中非常著名的历史行为。你可以记住结论：`typeof` 适合判断原始类型和函数，但不适合精确区分对象的具体类型。

## 5. 🤔 `undefined` 和 `null` 应该怎样区分？

`undefined` 表示变量声明了但没有初始化，或者某些访问没有得到值。

```js
let message
console.log(message) // undefined
```

未声明变量和声明但值为 `undefined` 不一样。直接访问未声明变量会报错，但对它使用 `typeof` 会返回 `'undefined'`。

`null` 表示空对象指针，通常用于表达“这里将来可能保存对象，但现在没有对象”。

```js
let currentUser = null
```

`null == undefined` 是 `true`，但它们语义不同。实践中，不需要主动把变量设为 `undefined`；如果你想表达“暂时没有对象”，用 `null` 更清楚。

## 6. 🤔 Boolean 转换为什么重要？

`Boolean` 类型只有两个字面值：`true` 和 `false`。

但在 `if`、`while`、逻辑操作符等场景里，其他类型的值会自动转换为布尔值。

常见假值包括：

- `false`
- `0`（包括 `-0`）
- `NaN`
- 空字符串
- `null`
- `undefined`
- `0n`（BigInt 零值）

除这些之外，大多数值都是真值，包括空对象和空数组：

```js
Boolean({}) // true
Boolean([]) // true
Boolean('') // false
```

这也是为什么条件判断里要明确自己到底是在判断“是否存在”、还是判断“是否等于某个具体值”。

## 7. 🤔 Number 类型有哪些关键细节？

JavaScript 不区分整数和浮点数，统一使用 `Number` 类型表示数值。

数值可以写成十进制、十六进制，也可以用科学记数法：

```js
const count = 55
const hex = 0x1f
const big = 3.125e7
```

浮点数遵循 IEEE 754，因此存在精度问题：

```js
console.log(0.1 + 0.2) // 0.30000000000000004
```

所以不要直接用精确相等判断浮点计算结果。

Number 还有几个特殊值：

- `Infinity` 和 `-Infinity` 表示超出可表示范围的正负无穷。
- `NaN` 表示本应返回数值的操作失败了。
- `NaN` 不等于任何值，包括它自己。

```js
console.log(NaN === NaN) // false
Number.isNaN(NaN) // true
```

常见数值转换入口有 `Number()`、`parseInt()` 和 `parseFloat()`。其中 `parseInt()` 建议显式传入进制：

```js
parseInt('10', 10) // 10
```

## 8. 🤔 String 类型除了保存文本还有哪些特点？

`String` 表示零个或多个 16 位 Unicode 字符序列。字符串可以使用单引号、双引号或反引号定义。

```js
const firstName = 'Ada'
const lastName = 'Lovelace'
const title = `programmer`
```

字符串是不可变的。所谓修改字符串，实际是创建新字符串并让变量指向新值：

```js
let lang = 'Java'
lang = lang + 'Script'
```

把值转换成字符串，常见方式有：

- 调用 `toString()`，但 `null` 和 `undefined` 没有这个方法。
- 调用 `String()`，它能处理 `null` 和 `undefined`。
- 使用模板字面量或字符串拼接触发转换。

模板字面量支持跨行文本、插值和标签函数：

```js
const name = 'Ada'
const message = `Hello, ${name}`
```

::: tip 关于字符串长度的陷阱 `String` 底层以 16 位代码单元（code unit）为基本单位。对于超出基本多语言平面（BMP）的字符，例如大部分 Emoji 表情或生僻汉字，JavaScript 会使用两个 16 位代码单元（代理对，Surrogate Pairs）来表示。这会导致 `.length` 属性统计结果大于实际可见字符数：

```js
'😀'.length // 2
```

如果需要获取实际字符数量，可以使用扩展运算符或 `Array.from`：

```js
;[...'😀'].length // 1
Array.from('😀').length // 1
```

:::

## 9. 🤔 Symbol 类型解决什么问题？

`Symbol` 是 ES6 新增的原始类型。每个通过 `Symbol()` 创建的符号都是唯一且不可变的。

```js
const id1 = Symbol('id')
const id2 = Symbol('id')

console.log(id1 === id2) // false
```

符号常用于创建不会和其他属性名冲突的对象属性：

```js
const id = Symbol('id')
const user = {
  [id]: 1,
  name: 'Ada',
}
```

如果运行时不同位置需要共享同一个符号，可以使用全局符号注册表：

```js
const shared = Symbol.for('shared-id')
Symbol.keyFor(shared) // 'shared-id'
```

此外，内置符号如 `Symbol.iterator`、`Symbol.toPrimitive`、`Symbol.toStringTag` 等可以影响语言内部行为。它们会在迭代器、对象转换、类和集合等后续内容中继续出现。

## 10. 🤔 Object 类型为什么是所有对象的基础？

`Object` 是复杂数据类型，是一组属性和方法的集合。

```js
const user = new Object()
user.name = 'Ada'
```

Object 实例本身提供了一些基础方法，例如：

| 方法                     | 作用                                     |
| ------------------------ | ---------------------------------------- |
| `hasOwnProperty()`       | 判断属性是否存在于对象自身上             |
| `isPrototypeOf()`        | 判断当前对象是否位于另一个对象的原型链上 |
| `propertyIsEnumerable()` | 判断属性是否可枚举                       |
| `toString()`             | 返回对象字符串表示                       |
| `valueOf()`              | 返回对象对应的原始值表示                 |

在 ECMAScript 中，很多对象最终都和 `Object` 有关系。不过浏览器提供的 DOM、BOM 等宿主对象不完全由 ECMA-262 定义，行为可能有宿主环境差异。
