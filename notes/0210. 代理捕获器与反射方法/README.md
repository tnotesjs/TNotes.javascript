# [0210. 代理捕获器与反射方法](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0210.%20%E4%BB%A3%E7%90%86%E6%8D%95%E8%8E%B7%E5%99%A8%E4%B8%8E%E5%8F%8D%E5%B0%84%E6%96%B9%E6%B3%95)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 代理一共能拦截哪些基本操作？](#3-代理一共能拦截哪些基本操作)
- [4. 属性访问相关捕获器怎么理解？](#4-属性访问相关捕获器怎么理解)
- [5. 原型和可扩展性相关捕获器有什么共同点？](#5-原型和可扩展性相关捕获器有什么共同点)
- [6. 函数调用和构造调用相关捕获器有什么区别？](#6-函数调用和构造调用相关捕获器有什么区别)
- [7. 为什么学习捕获器时总要提不变式？](#7-为什么学习捕获器时总要提不变式)

<!-- endregion:toc -->

## 1. 本节内容

- 13 个代理捕获器总览
- 捕获器与 `Reflect` 方法的一一对应关系
- 属性访问相关捕获器
- 原型与可扩展性相关捕获器
- 函数调用与构造调用相关捕获器
- 返回值规则与不变式约束

## 2. 评价

- 这一节适合当作代理的索引表来学。你不必一开始背下 13 个捕获器，但要知道每个捕获器拦截哪类底层操作，以及什么时候应该交给对应的 `Reflect` 方法兜底。

## 3. 代理一共能拦截哪些基本操作？

代理可以拦截 13 种基本操作，每一种捕获器几乎都有一个同名的 `Reflect` 方法。

| 捕获器 | 对应反射方法 | 常见触发场景 |
| --- | --- | --- |
| `get` | `Reflect.get()` | 读取属性 |
| `set` | `Reflect.set()` | 设置属性 |
| `has` | `Reflect.has()` | `in` 操作符 |
| `defineProperty` | `Reflect.defineProperty()` | 定义属性 |
| `getOwnPropertyDescriptor` | `Reflect.getOwnPropertyDescriptor()` | 读取自有属性描述符 |
| `deleteProperty` | `Reflect.deleteProperty()` | `delete` 操作 |
| `ownKeys` | `Reflect.ownKeys()` | 获取自有属性键 |
| `getPrototypeOf` | `Reflect.getPrototypeOf()` | 读取原型 |
| `setPrototypeOf` | `Reflect.setPrototypeOf()` | 设置原型 |
| `isExtensible` | `Reflect.isExtensible()` | 判断对象是否可扩展 |
| `preventExtensions` | `Reflect.preventExtensions()` | 阻止对象扩展 |
| `apply` | `Reflect.apply()` | 调用函数 |
| `construct` | `Reflect.construct()` | 使用 `new` 调用构造函数 |

一个很实用的记忆方式是：对象属性、对象结构、函数调用这三类操作，基本都能被代理拦截。

## 4. 属性访问相关捕获器怎么理解？

属性访问相关捕获器最常用，包括 `get`、`set`、`has`、`defineProperty`、`getOwnPropertyDescriptor`、`deleteProperty` 和 `ownKeys`。

```js
const target = {
  name: 'Jake',
}

const proxy = new Proxy(target, {
  get(target, property, receiver) {
    console.log('get')
    return Reflect.get(target, property, receiver)
  },
  set(target, property, value, receiver) {
    console.log('set')
    return Reflect.set(target, property, value, receiver)
  },
  has(target, property) {
    console.log('has')
    return Reflect.has(target, property)
  },
})

proxy.name
proxy.age = 18
console.log('name' in proxy)
```

这些捕获器的返回值规则不完全相同：

- `get` 返回值没有特殊限制，但不能违背不可写、不可配置属性的不变式。
- `set` 返回布尔值，表示赋值是否成功；严格模式下返回 `false` 会抛错。
- `has` 返回布尔值，用于表示属性是否存在。
- `defineProperty` 返回布尔值，用于表示属性是否定义成功。
- `getOwnPropertyDescriptor` 必须返回描述符对象或 `undefined`。
- `deleteProperty` 返回布尔值，用于表示删除是否成功。
- `ownKeys` 必须返回由字符串键或符号键组成的可枚举对象。

如果你只想在默认行为前后加逻辑，通常直接调用对应的 `Reflect` 方法最稳。

## 5. 原型和可扩展性相关捕获器有什么共同点？

这类捕获器会影响对象结构层面的判断，因此不变式更严格。

相关捕获器包括：

- `getPrototypeOf`
- `setPrototypeOf`
- `isExtensible`
- `preventExtensions`

```js
const proxy = new Proxy(
  {},
  {
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target)
    },
    isExtensible(target) {
      return Reflect.isExtensible(target)
    },
  },
)
```

这类捕获器最需要注意的是：如果目标对象已经不可扩展，代理就不能再虚构一个和真实对象状态冲突的原型或可扩展状态。

例如：

- 目标对象不可扩展时，`getPrototypeOf` 必须返回真实原型。
- `isExtensible` 必须准确反映目标对象是否可扩展。
- `preventExtensions` 返回成功时，目标对象也必须真的已经不可扩展。

换句话说，代理不能在对象结构已经固定时继续伪装结构状态。

## 6. 函数调用和构造调用相关捕获器有什么区别？

函数对象可以被调用，也可以作为构造函数被 `new` 调用，因此代理提供了两个专门捕获器。

`apply` 拦截普通函数调用：

```js
function sum(a, b) {
  return a + b
}

const proxy = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.log('apply')
    return Reflect.apply(target, thisArg, args)
  },
})

console.log(proxy(1, 2))
```

`construct` 拦截构造函数调用：

```js
class User {
  constructor(name) {
    this.name = name
  }
}

const ProxyUser = new Proxy(User, {
  construct(target, args, newTarget) {
    console.log('construct')
    return Reflect.construct(target, args, newTarget)
  },
})

const user = new ProxyUser('Jake')
```

这两个捕获器也有底线：

- `apply` 的目标必须是可调用对象。
- `construct` 的目标必须是可构造对象。
- `construct` 必须返回对象。

因此，不能把一个普通不可调用对象代理成函数，也不能让构造调用返回原始值。

## 7. 为什么学习捕获器时总要提不变式？

因为代理允许你重写很多行为，但语言仍然需要保证对象模型可信。

比如这些行为都不允许：

- 隐藏目标对象上不可配置的自有属性。
- 把不可扩展对象伪装成可扩展对象。
- 对不可写、不可配置属性返回一个与真实值不同的结果。
- 让 `construct` 返回非对象值。

可以把不变式理解成代理的护栏：它允许你改变对象交互方式，但不允许你让对象的底层状态自相矛盾。

实际写代理时，一个可靠习惯是：先用 `Reflect` 保留默认语义，再在默认语义前后加最小必要逻辑。
