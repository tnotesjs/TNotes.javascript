# [0211. 代理模式](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0211.%20%E4%BB%A3%E7%90%86%E6%A8%A1%E5%BC%8F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 怎样用代理跟踪属性访问？](#3-怎样用代理跟踪属性访问)
- [4. 怎样用代理隐藏属性？](#4-怎样用代理隐藏属性)
- [5. 怎样用代理做属性验证？](#5-怎样用代理做属性验证)
- [6. 怎样验证函数和构造函数参数？](#6-怎样验证函数和构造函数参数)
- [7. 怎样用代理做数据绑定和可观察对象？](#7-怎样用代理做数据绑定和可观察对象)
- [8. 使用代理模式时应该注意什么？](#8-使用代理模式时应该注意什么)

<!-- endregion:toc -->

## 1. 本节内容

- 跟踪属性访问
- 隐藏属性
- 属性验证
- 函数与构造函数参数验证
- 数据绑定
- 可观察对象
- 代理模式的使用边界

## 2. 评价

- 这一节很像代理的应用清单。真正写业务代码时，代理最有价值的地方通常不是炫技，而是在不改动目标对象主体逻辑的情况下，给对象访问过程补上一层统一规则。

## 3. 怎样用代理跟踪属性访问？

通过 `get` 和 `set` 捕获器，可以记录对象属性什么时候被读取或写入。

```js
const user = {
  name: 'Jake',
}

const proxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`读取 ${String(property)}`)
    return Reflect.get(target, property, receiver)
  },
  set(target, property, value, receiver) {
    console.log(`设置 ${String(property)} = ${value}`)
    return Reflect.set(target, property, value, receiver)
  },
})

proxy.name
proxy.age = 27
```

这种模式适合做调试、访问日志、性能分析或状态变化追踪。

## 4. 怎样用代理隐藏属性？

可以在 `get`、`has`、`ownKeys` 等捕获器里过滤不希望暴露的属性。

```js
const hiddenProperties = ['password']

const user = {
  name: 'Jake',
  password: 'secret',
}

const proxy = new Proxy(user, {
  get(target, property, receiver) {
    if (hiddenProperties.includes(property)) {
      return undefined
    }

    return Reflect.get(target, property, receiver)
  },
  has(target, property) {
    if (hiddenProperties.includes(property)) {
      return false
    }

    return Reflect.has(target, property)
  },
})

console.log(proxy.password) // undefined
console.log('password' in proxy) // false
```

不过这不是安全边界。只要外部代码还能拿到原始目标对象，就仍然可以绕过代理直接访问属性。

## 5. 怎样用代理做属性验证？

因为赋值操作会经过 `set` 捕获器，所以可以在这里统一校验属性值。

```js
const target = {
  age: 0,
}

const proxy = new Proxy(target, {
  set(target, property, value, receiver) {
    if (property === 'age' && typeof value !== 'number') {
      return false
    }

    return Reflect.set(target, property, value, receiver)
  },
})

proxy.age = 18
proxy.age = '18'

console.log(proxy.age) // 18
```

在严格模式下，`set` 返回 `false` 会抛出 `TypeError`。因此实际项目里要提前决定：是静默拒绝、抛错，还是转换数据后再写入。

## 6. 怎样验证函数和构造函数参数？

函数调用可以用 `apply` 捕获器验证参数。

```js
function median(...numbers) {
  return numbers.sort((a, b) => a - b)[Math.floor(numbers.length / 2)]
}

const proxy = new Proxy(median, {
  apply(target, thisArg, args) {
    if (args.some((value) => typeof value !== 'number')) {
      throw new TypeError('参数必须都是数字')
    }

    return Reflect.apply(target, thisArg, args)
  },
})

console.log(proxy(4, 7, 1)) // 4
```

构造函数调用可以用 `construct` 捕获器验证参数。

```js
class User {
  constructor(id) {
    this.id = id
  }
}

const ProxyUser = new Proxy(User, {
  construct(target, args, newTarget) {
    if (args[0] == null) {
      throw new TypeError('创建用户必须传入 id')
    }

    return Reflect.construct(target, args, newTarget)
  },
})

new ProxyUser(1)
```

这类模式适合把参数规则集中在边界层，而不是散落在函数主体里。

## 7. 怎样用代理做数据绑定和可观察对象？

代理可以在对象发生变化时自动触发副作用，比如通知观察者、更新列表或派发事件。

```js
const listeners = new Set()

function observe(listener) {
  listeners.add(listener)
}

function emit(change) {
  for (const listener of listeners) {
    listener(change)
  }
}

const state = new Proxy(
  {},
  {
    set(target, property, value, receiver) {
      const result = Reflect.set(target, property, value, receiver)

      if (result) {
        emit({ property, value })
      }

      return result
    },
  },
)

observe((change) => console.log(change))

state.name = 'Jake'
```

这就是可观察对象的基础思路：外部正常写对象，代理负责把变化广播出去。

## 8. 使用代理模式时应该注意什么？

可以保留几条实践判断。

- 代理适合做横切逻辑，比如日志、校验、隐藏、绑定和观察。
- 代理不应该随意改变对象的核心语义，否则维护者会很难判断真实行为。
- 代理不是安全沙箱，拿到目标对象就能绕过代理。
- 如果只是普通对象合并或方法复用，优先用更直接的工具，不必强行上代理。
- 写捕获器时优先用 `Reflect` 保留默认行为，再在前后加入必要逻辑。

简单来说，代理最适合做对象访问路径上的规则层，而不是把所有业务逻辑都藏进捕获器里。
