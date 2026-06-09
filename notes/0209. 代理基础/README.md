# [0209. 代理基础](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0209.%20%E4%BB%A3%E7%90%86%E5%9F%BA%E7%A1%80)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是空代理？](#3-什么是空代理)
- [4. 捕获器是什么？](#4-捕获器是什么)
- [5. 捕获器参数和 `Reflect` 有什么用？](#5-捕获器参数和-reflect-有什么用)
- [6. 什么是捕获器不变式？](#6-什么是捕获器不变式)
- [7. 可撤销代理适合什么场景？](#7-可撤销代理适合什么场景)
- [8. `Reflect` API 除了配合代理还有什么价值？](#8-reflect-api-除了配合代理还有什么价值)
- [9. 代理有哪些限制？](#9-代理有哪些限制)

<!-- endregion:toc -->

## 1. 本节内容

- 创建空代理
- 定义捕获器
- 捕获器参数与 `Reflect` API
- 捕获器不变式
- 可撤销代理
- 实用反射 API
- 代理的限制

## 2. 评价

- 这一节最重要的是建立正确心智模型：代理不是复制对象，而是在对象访问路径上放了一道门。门后面可以放日志、校验、转发，也可以故意改变行为，但不能违反语言底层规则。

## 3. 什么是空代理？

空代理就是不定义任何捕获器的代理。它不会改变目标对象的行为，所有操作都会自然转发到目标对象。

```js
const target = {
  id: 'target',
}

const proxy = new Proxy(target, {})

console.log(proxy.id) // target

proxy.id = 'proxy'
console.log(target.id) // proxy
```

这里 `target` 和 `proxy` 不是同一个对象，但通过 `proxy` 读写属性时，实际影响的是 `target`。

需要注意，`Proxy.prototype` 是 `undefined`，所以不能用 `instanceof Proxy` 判断一个值是不是代理对象。

## 4. 捕获器是什么？

捕获器就是处理程序对象里用于拦截基本操作的方法。

最常见的例子是 `get` 捕获器，它会在读取属性时触发：

```js
const target = {
  name: 'Jake',
}

const proxy = new Proxy(target, {
  get() {
    return 'intercepted'
  },
})

console.log(target.name) // Jake
console.log(proxy.name) // intercepted
```

重点是：捕获器只会拦截发生在代理对象上的操作。你直接操作目标对象时，捕获器不会被触发。

## 5. 捕获器参数和 `Reflect` 有什么用？

捕获器会收到和当前操作相关的参数。以 `get` 为例，它会收到：

- `target`：目标对象。
- `property`：被访问的属性名。
- `receiver`：最初接收读取操作的对象。

```js
const proxy = new Proxy(target, {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver)
  },
})
```

`Reflect.get()` 的作用是执行默认读取行为。换句话说，`Reflect` 让你可以先拦截，再选择是否把操作按原样转发。

这比手写 `target[property]` 更稳，因为很多底层操作并不只是简单属性访问。尤其是在访问器、继承、`this` 绑定等场景中，`Reflect` 的语义更接近语言默认行为。

## 6. 什么是捕获器不变式？

捕获器不变式是语言对代理行为设置的底线。

代理虽然能改变很多行为，但不能让对象表现出和底层状态严重冲突的结果。比如目标对象有一个不可写、不可配置的属性，`get` 捕获器就不能谎称它是另一个值。

```js
const target = {}

Object.defineProperty(target, 'name', {
  value: 'Jake',
  writable: false,
  configurable: false,
})

const proxy = new Proxy(target, {
  get() {
    return 'Mia'
  },
})

console.log(proxy.name) // TypeError
```

这类限制避免代理破坏对象模型的基本可信度。

## 7. 可撤销代理适合什么场景？

普通代理一旦创建，代理和目标对象之间的联系会一直存在。可撤销代理则可以手动切断这种联系。

```js
const target = {
  name: 'Jake',
}

const { proxy, revoke } = Proxy.revocable(target, {})

console.log(proxy.name) // Jake

revoke()

console.log(proxy.name) // TypeError
```

`revoke()` 是不可逆且幂等的。调用后，任何再访问代理对象的操作都会抛出错误。

这适合做短期授权、临时访问层或生命周期明确的对象包装。

## 8. `Reflect` API 除了配合代理还有什么价值？

`Reflect` 并不只服务于代理，它本身也提供了一组更函数化、更细粒度的对象操作。

| 用途 | 示例 |
| --- | --- |
| 返回操作状态 | `Reflect.defineProperty()`、`Reflect.set()`、`Reflect.deleteProperty()` |
| 替代操作符 | `Reflect.get()`、`Reflect.set()`、`Reflect.has()`、`Reflect.construct()` |
| 安全调用函数 | `Reflect.apply(fn, thisArg, args)` |

比如定义属性时，`Object.defineProperty()` 失败通常会抛错，而 `Reflect.defineProperty()` 会返回布尔值表示是否成功：

```js
const object = {}

if (Reflect.defineProperty(object, 'name', { value: 'Jake' })) {
  console.log('success')
} else {
  console.log('failure')
}
```

这种返回状态标记的风格，适合写更可控的底层对象操作。

## 9. 代理有哪些限制？

代理最大的两个限制分别来自 `this` 和内置对象内部槽位。

第一，方法里的 `this` 会因为从代理对象调用而指向代理对象。如果目标对象依赖对象标识，例如用 `WeakMap` 保存私有数据，就可能出问题。

```js
const privateData = new WeakMap()

class User {
  constructor(id) {
    privateData.set(this, id)
  }

  get id() {
    return privateData.get(this)
  }
}

const user = new User(1)
const proxy = new Proxy(user, {})

console.log(user.id) // 1
console.log(proxy.id) // undefined
```

第二，有些内置类型的方法依赖内部槽位。比如 `Date` 实例的方法要求 `this` 具有日期内部槽位，但代理对象没有这个内部槽位。

```js
const date = new Date()
const proxy = new Proxy(date, {})

proxy.getDate() // TypeError
```

所以代理虽然很强，但不是所有对象都能被无成本地包装。
