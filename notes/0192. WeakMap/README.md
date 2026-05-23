# [0192. WeakMap](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0192.%20WeakMap)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `WeakMap` 里的 “weak” 到底弱在哪里？](#3--weakmap-里的-weak-到底弱在哪里)
- [4. 🤔 `WeakMap` 的 API 和 `Map` 有什么不同？](#4--weakmap-的-api-和-map-有什么不同)
- [5. 🤔 为什么 `WeakMap` 的键只能是对象？](#5--为什么-weakmap-的键只能是对象)
- [6. 🤔 为什么 `WeakMap` 不能迭代？](#6--为什么-weakmap-不能迭代)
- [7. 🤔 `WeakMap` 最典型的使用场景是什么？](#7--weakmap-最典型的使用场景是什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `WeakMap` 的弱键含义
- `WeakMap` 的基本 API
- 为什么键只能是对象
- 为什么 `WeakMap` 不可迭代
- `WeakMap` 的典型使用场景

## 2. 🫧 评价

- `WeakMap` 真正厉害的地方，不是它“像 Map”，而是它把对象生命周期和数据结构绑在了一起。你一旦开始处理实例私有数据、DOM 元数据或缓存关联，`WeakMap` 就会变得非常顺手。

## 3. 🤔 `WeakMap` 里的 “weak” 到底弱在哪里？

`WeakMap` 的“弱”指的是键是弱引用语义。也就是说，`WeakMap` 不会阻止这个键对象被垃圾回收。

如果某个对象除了作为 `WeakMap` 的键之外，再也没有别的强引用，那么它最终可以被回收；对应的键值对也会一起消失。

```js
const wm = new WeakMap()
wm.set({}, 'val')
```

上面这个键对象在语句结束后没有别的引用可追踪，因此它对应的映射关系也没有长期存在的意义。

## 4. 🤔 `WeakMap` 的 API 和 `Map` 有什么不同？

`WeakMap` 的 API 是 `Map` 的子集，常用的只有：

- `set()`
- `get()`
- `has()`
- `delete()`

```js
const wm = new WeakMap()
const key = { id: 1 }

wm.set(key, 'Matt')
console.log(wm.get(key))
console.log(wm.has(key))

wm.delete(key)
```

它没有 `size`，也没有 `clear()`，更没有常规遍历接口。

## 5. 🤔 为什么 `WeakMap` 的键只能是对象？

因为 `WeakMap` 的设计前提就是：键要和对象生命周期绑定。

如果允许原始值作为键，垃圾回收语义就没有意义了，因为原始值并不是通过对象引用身份来追踪生命周期的。

所以这类写法是合法的：

```js
const wm = new WeakMap()
const key = {}
wm.set(key, 'value')
```

但这类写法会报错：

```js
const wm = new WeakMap()
// wm.set('key', 'value')
```

## 6. 🤔 为什么 `WeakMap` 不能迭代？

因为它里面的键随时都可能因为垃圾回收而消失。

如果一个集合允许你稳定枚举所有键，那就意味着它必须稳定知道自己“现在到底有哪些键”。但 `WeakMap` 刻意不提供这种承诺。

这也是为什么它没有：

- `keys()`
- `values()`
- `entries()`
- `forEach()`
- `size`

你只能在手里已经持有某个键对象时，通过这个对象去查对应值。

## 7. 🤔 `WeakMap` 最典型的使用场景是什么？

最典型的两个场景是：

- 给对象实例挂私有数据
- 给 DOM 节点或其他对象挂元数据

例如，为某个对象实例保存外部私有信息：

```js
const privateData = new WeakMap()

class User {
  constructor(id) {
    privateData.set(this, { id })
  }

  getId() {
    return privateData.get(this).id
  }
}
```

再比如，给 DOM 节点关联状态时，如果节点被删除，对应元数据也更容易跟着一起消失，不会像普通 `Map` 那样更容易把节点留在内存里。

所以可以记成一句话：`WeakMap` 适合做“跟对象走”的附加数据。
