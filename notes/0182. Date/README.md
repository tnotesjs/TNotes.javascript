# [0182. Date](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0182.%20Date)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `Date` 对象内部到底表示的是什么？](#3-date-对象内部到底表示的是什么)
- [4. 创建日期对象有哪些常见方式？](#4-创建日期对象有哪些常见方式)
- [5. `Date.now()`、比较方法和输出方法该怎么理解？](#5-datenow比较方法和输出方法该怎么理解)
- [6. 常用的日期组件方法应该怎么选？](#6-常用的日期组件方法应该怎么选)
- [7. 使用 `Date` 最容易踩哪些坑？](#7-使用-date-最容易踩哪些坑)

<!-- endregion:toc -->

## 1. 本节内容

- `Date` 的时间戳模型
- `Date.parse()`、`Date.UTC()` 与构造函数
- `Date.now()` 的用途
- 日期比较与格式化方法
- 常用日期组件读写方法
- 使用 `Date` 的常见注意点

## 2. 评价

- `Date` 好用，但也很容易因为时区、本地化格式和字符串解析把你带进坑里。你真正需要掌握的不是每个方法名，而是先搞清它到底返回本地时间、UTC 结果，还是毫秒时间戳。

## 3. `Date` 对象内部到底表示的是什么？

`Date` 本质上是在封装一个时间点。这个时间点通常可以理解为从 UTC 时间 1970 年 1 月 1 日 00:00:00 开始经过了多少毫秒。

所以，`Date` 不是单纯的“年月日时分秒字符串”，而是一个围绕时间戳展开操作的对象。

```js
const now = new Date()
console.log(now.valueOf())
```

`valueOf()` 返回的就是这个日期对象对应的毫秒值，因此日期对象之间可以直接比较大小。

## 4. 创建日期对象有哪些常见方式？

最常见的创建方式有四种。

第一种，不传参数，得到当前时间：

```js
const now = new Date()
```

第二种，传日期字符串，让运行时解析：

```js
const someDate = new Date('May 23, 2019')
```

第三种，显式调用 `Date.parse()`，再交给构造函数：

```js
const someDate = new Date(Date.parse('May 23, 2019'))
```

第四种，使用数值参数构造本地时间，或者用 `Date.UTC()` 先生成 UTC 毫秒值：

```js
const localDate = new Date(2005, 4, 5, 17, 55, 55)
const utcDate = new Date(Date.UTC(2005, 4, 5, 17, 55, 55))
```

这里要特别注意两点：

- 月份是从 `0` 开始计数的，`0` 表示 1 月。
- `new Date(year, month, ...)` 生成的是本地时间语境下的日期对象。

## 5. `Date.now()`、比较方法和输出方法该怎么理解？

`Date.now()` 会直接返回当前时间的毫秒值，很适合做简单计时：

```js
const start = Date.now()
doSomething()
const duration = Date.now() - start
```

日期对象比较大小时，本质上也是在比较毫秒值：

```js
const date1 = new Date(2019, 0, 1)
const date2 = new Date(2019, 1, 1)

console.log(date1 < date2) // true
```

输出方面，可以粗分成三类：

- 调试型：`toString()`、`toLocaleString()`
- 只看日期或时间：`toDateString()`、`toTimeString()`、`toLocaleDateString()`、`toLocaleTimeString()`
- 强调 UTC：`toUTCString()`

这些方法的返回格式会受环境和地区影响，所以适合调试和展示大致结果，不适合当作稳定的数据协议格式。

## 6. 常用的日期组件方法应该怎么选？

如果你要读写具体的年月日时分秒，通常会成对看到本地时间版本和 UTC 版本。

| 目的 | 本地时间方法    | UTC 方法           |
| ---- | --------------- | ------------------ |
| 年   | `getFullYear()` | `getUTCFullYear()` |
| 月   | `getMonth()`    | `getUTCMonth()`    |
| 日   | `getDate()`     | `getUTCDate()`     |
| 时   | `getHours()`    | `getUTCHours()`    |
| 分   | `getMinutes()`  | `getUTCMinutes()`  |
| 秒   | `getSeconds()`  | `getUTCSeconds()`  |

对应地，也有 `setFullYear()`、`setMonth()`、`setDate()` 这类修改方法。

```js
const date = new Date()

console.log(date.getFullYear())
console.log(date.getMonth())
console.log(date.getDate())
```

使用这些方法时，最容易出错的是月份从 `0` 开始，而日期从 `1` 开始。

## 7. 使用 `Date` 最容易踩哪些坑？

最常见的坑主要有四类。

第一类是字符串解析不稳定。不同环境对某些非标准日期字符串的处理可能不一致，所以更稳妥的做法是优先使用明确格式，或者直接使用数值参数。

第二类是本地时间和 UTC 混用。你以为自己拿的是“同一个时间”，但一个 API 按本地时区解释，另一个按 UTC 解释，最后就偏了。

第三类是把格式化结果当成可靠协议。`toLocaleString()` 的返回值非常适合给人看，但不适合做跨环境存储和比较。

第四类是忽略月份从 `0` 开始计数。这个坑足够经典，也足够高频。

简单来说，掌握 `Date` 的关键不是背完所有方法，而是始终先问自己：这里处理的是本地时间、UTC 时间，还是纯时间戳。
