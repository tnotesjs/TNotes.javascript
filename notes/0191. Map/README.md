# [0191. Map](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0191.%20Map)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 既然已经有 `Object`，为什么还需要 `Map`？](#3-既然已经有-object为什么还需要-map)
- [4. `Map` 的基本 API 应该怎样理解？](#4-map-的基本-api-应该怎样理解)
- [5. `Map` 为什么说支持任意类型键？](#5-map-为什么说支持任意类型键)
- [6. `Map` 的顺序和迭代能力有什么用？](#6-map-的顺序和迭代能力有什么用)
- [7. 什么时候该选 `Map`，什么时候还用 `Object`？](#7-什么时候该选-map什么时候还用-object)

<!-- endregion:toc -->

## 1. 本节内容

- `Map` 出现的背景
- `Map` 的基本 API
- 任意类型键与 `SameValueZero`
- 插入顺序与迭代能力
- `Map` 和 `Object` 的取舍

## 2. 评价

- `Map` 的价值不只是“多了几个方法”，而是终于把“映射”从普通对象里独立成了一个明确的数据结构。只要你的需求真的是键值映射，而不是固定字段对象，`Map` 往往会比 `Object` 更省心。

## 3. 既然已经有 `Object`，为什么还需要 `Map`？

因为 `Object` 更像字段容器，而 `Map` 才是为键值映射量身设计的数据结构。

`Map` 解决了几个典型问题：

- 键不再局限于字符串、数值或符号。
- API 更统一，`set()`、`get()`、`has()`、`delete()` 语义明确。
- 天然保留插入顺序。

换句话说，当你想表达“我有一组键和值的对应关系”时，`Map` 比 `Object` 更贴近问题本身。

## 4. `Map` 的基本 API 应该怎样理解？

常用 API 很集中：

- `set()`：设置键值对
- `get()`：读取值
- `has()`：判断键是否存在
- `delete()`：删除一个键值对
- `clear()`：清空整个映射
- `size`：键值对数量

```js
const m = new Map()

m.set('firstName', 'Matt').set('lastName', 'Frisbie')

console.log(m.get('firstName'))
console.log(m.has('lastName'))
console.log(m.size)
```

初始化时也可以直接传可迭代的键值对列表：

```js
const m = new Map([
  ['key1', 'val1'],
  ['key2', 'val2'],
])
```

## 5. `Map` 为什么说支持任意类型键？

因为它的键可以是任何 JavaScript 值，包括对象、函数和符号。

```js
const m = new Map()
const objectKey = {}
const fnKey = function () {}
const symbolKey = Symbol('id')

m.set(objectKey, 'objectValue')
m.set(fnKey, 'functionValue')
m.set(symbolKey, 'symbolValue')
```

这里最重要的点是：对象键按引用身份区分，不是按内容区分。

```js
const m = new Map()
const key = {}

m.set(key, 'value')
console.log(m.get({})) // undefined
console.log(m.get(key)) // 'value'
```

它内部使用的是 `SameValueZero` 语义，理解上可以近似看成：对象按引用比，原始值按稳定相等规则比。

## 6. `Map` 的顺序和迭代能力有什么用？

`Map` 会维护键值对的插入顺序，因此非常适合按添加顺序遍历。

```js
const m = new Map([
  ['key1', 'val1'],
  ['key2', 'val2'],
  ['key3', 'val3'],
])

for (const [key, value] of m) {
  console.log(key, value)
}
```

你也可以显式使用：

- `entries()`
- `keys()`
- `values()`
- `forEach()`

这让 `Map` 在遍历体验上比传统对象更统一，尤其适合需要频繁枚举内容的场景。

## 7. 什么时候该选 `Map`，什么时候还用 `Object`？

优先选 `Map` 的情况：

- 需要任意类型键
- 需要频繁增删键值对
- 需要稳定的插入顺序
- 需求本质就是映射，而不是固定字段对象

优先选 `Object` 的情况：

- 数据结构本身是一个实体对象
- 字段名相对固定
- 你主要是在表达业务结构，而不是维护通用映射表

简单记法是：

- 像“记录一张表”，更偏 `Map`
- 像“描述一个对象”，更偏 `Object`
