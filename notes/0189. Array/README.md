# [0189. Array](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0189.%20Array)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. JavaScript 的数组和别的语言有什么不同？](#3-javascript-的数组和别的语言有什么不同)
- [4. 创建数组最常见的方式有哪些？](#4-创建数组最常见的方式有哪些)
- [5. 数组空位、索引和 `length` 为什么要特别小心？](#5-数组空位索引和-length-为什么要特别小心)
- [6. 数组方法太多时，应该怎样分组理解？](#6-数组方法太多时应该怎样分组理解)
- [7. 数组排序、搜索和迭代最容易踩什么坑？](#7-数组排序搜索和迭代最容易踩什么坑)
- [8. 使用数组时有哪些稳定实践？](#8-使用数组时有哪些稳定实践)

<!-- endregion:toc -->

## 1. 本节内容

- 数组的动态、有序特性
- `Array` 的创建方式
- 空位、索引与 `length`
- 数组检测与常见方法分组
- 排序、搜索、迭代和归并思路
- 使用数组的实践建议

## 2. 评价

- 数组是 JavaScript 里最常用也最容易被用滥的数据结构。会用 `push()` 和 `map()` 只是起点，真正有价值的是知道哪些方法会返回新数组，哪些会原地修改，以及哪些写法会把数组变成后续很难维护的状态。

## 3. JavaScript 的数组和别的语言有什么不同？

JavaScript 的数组本质上是一组有序值，但它和很多静态语言数组有两个显著区别：

- 每个位置可以放不同类型的值。
- 长度是动态变化的。

```js
const list = ['red', 42, { done: true }]
```

这让数组非常灵活，但也意味着你需要自己维护好数据一致性。

## 4. 创建数组最常见的方式有哪些？

常见方式有三类。

第一类，数组字面量：

```js
const colors = ['red', 'blue', 'green']
const empty = []
```

第二类，`Array` 构造函数：

```js
const values = new Array(3)
const names = new Array('Greg')
```

第三类，ES6 提供的 `Array.from()` 和 `Array.of()`：

```js
console.log(Array.from('Matt'))
console.log(Array.of(1, 2, 3, 4))
```

实践里最常用的通常是字面量；需要从类数组、可迭代对象转换时，再考虑 `Array.from()`。

## 5. 数组空位、索引和 `length` 为什么要特别小心？

数组空位是 JavaScript 里一个经典陷阱。

```js
const options = [1, , , 5]
console.log(options.length) // 4
```

空位既不是“正常元素”，也不是纯粹等价于你主动写下的 `undefined`，不同方法对它的处理可能不同。因此实践里最好避免依赖空位，宁可显式写 `undefined`。

索引方面，数组会自动根据最大索引调整 `length`：

```js
const colors = ['red', 'blue', 'green']
colors[99] = 'black'
console.log(colors.length) // 100
```

这意味着数组很容易被你意外拉长，并制造出大量稀疏位置。

## 6. 数组方法太多时，应该怎样分组理解？

最实用的方式是按“会不会改原数组”和“主要解决什么问题”来分组。

| 类别 | 代表方法 | 主要作用 |
| --- | --- | --- |
| 访问与检测 | `Array.isArray()`、`includes()`、`indexOf()` | 判断类型、查找位置 |
| 复制与截取 | `slice()`、`concat()` | 返回新数组，不改原数组 |
| 原地修改 | `push()`、`pop()`、`shift()`、`unshift()`、`splice()`、`sort()`、`reverse()` | 改变原数组 |
| 批量变换 | `map()`、`filter()` | 生成新数组 |
| 遍历与条件判断 | `forEach()`、`some()`、`every()`、`find()`、`findIndex()` | 逐项执行逻辑 |
| 归并 | `reduce()`、`reduceRight()` | 把数组收束成一个结果 |

只要先分清这些组，再遇到具体方法时就不会只靠死记。

## 7. 数组排序、搜索和迭代最容易踩什么坑？

排序最典型的坑是 `sort()` 默认按字符串比较：

```js
const values = [0, 1, 5, 10, 15]
values.sort()
console.log(values) // [0, 1, 10, 15, 5]
```

如果你排的是数值，最好显式提供比较函数：

```js
values.sort((a, b) => a - b)
```

搜索时要分清：

- `indexOf()` / `includes()` 是按相等关系查值。
- `find()` / `findIndex()` 是按断言函数查值。

迭代时则要想清楚自己到底是“做副作用”，还是“生成新结果”：

- 做副作用，用 `forEach()`。
- 生成对应新数组，用 `map()`。
- 过滤一部分项，用 `filter()`。
- 归并成单个值，用 `reduce()`。

## 8. 使用数组时有哪些稳定实践？

可以优先记住下面这些实践：

- 优先使用数组字面量创建数组。
- 用 `Array.isArray()` 判断数组，不要依赖跨上下文下可能失效的 `instanceof`。
- 避免制造空位数组。
- 排数值时给 `sort()` 传比较函数。
- 需要不可变思路时，优先用 `slice()`、`concat()`、`map()`、`filter()` 这类返回新数组的方法。
- 只有在确实需要原地修改时，才使用 `splice()`、`sort()`、`reverse()` 这类方法。

把这些边界守住，数组就会是非常顺手的数据结构；一旦混用了太多隐式修改和稀疏索引，后面维护就会很痛苦。
