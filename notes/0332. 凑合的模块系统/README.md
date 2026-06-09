# [0332. 凑合的模块系统](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0332.%20%E5%87%91%E5%90%88%E7%9A%84%E6%A8%A1%E5%9D%97%E7%B3%BB%E7%BB%9F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么 IIFE 可以凑出模块？](#3-为什么-iife-可以凑出模块)
- [4. 如何创建模块命名空间？](#4-如何创建模块命名空间)
- [5. 什么是揭示模块模式？](#5-什么是揭示模块模式)
- [6. 模块如何嵌套和扩展？](#6-模块如何嵌套和扩展)
- [7. 如何把外部依赖传进模块？](#7-如何把外部依赖传进模块)
- [8. 手写模块系统有什么问题？](#8-手写模块系统有什么问题)

<!-- endregion:toc -->

## 1. 本节内容

- IIFE 模拟模块作用域
- 模块命名空间
- 公共 API 和私有成员
- 揭示模块模式
- 模块嵌套、依赖传入和模块扩展
- 手写模块系统的限制

## 2. 评价

- IIFE 模块模式很朴素，但它展示了模块化最早的关键需求：隔离私有实现，只把稳定接口留给外部。

## 3. 为什么 IIFE 可以凑出模块？

ES6 之前没有语言级模块，但函数有自己的作用域。把代码放进立即调用函数表达式中，就可以创建私有作用域，避免变量泄露到全局。

```js
;(function () {
  const message = 'private'

  console.log(message)
})()
```

这里的 `message` 只存在于函数内部，外部代码无法访问。这个隔离能力，就是早期模块模式的基础。

## 4. 如何创建模块命名空间？

如果把 IIFE 的返回值赋给一个变量，就可以得到一个模块命名空间。

```js
const Counter = (function () {
  let value = 0

  return {
    increment() {
      value += 1
      return value
    },

    getValue() {
      return value
    },
  }
})()

console.log(Counter.increment()) // 1
console.log(Counter.getValue()) // 1
```

`value` 是私有变量，外部只能通过 `increment()` 和 `getValue()` 间接访问它。

这种写法已经具备模块的几个关键特征：

- 私有实现存在于闭包中。
- 公共 API 通过返回对象暴露。
- 外部使用命名空间访问模块能力。

## 5. 什么是揭示模块模式？

揭示模块模式也是 IIFE 模块的一种。它通常先在闭包内部定义私有变量和函数，再返回一个对象，把希望公开的成员映射出去。

```js
const UserModule = (function () {
  const users = []

  function add(user) {
    users.push(user)
  }

  function list() {
    return users.slice()
  }

  return {
    add,
    list,
  }
})()
```

这种方式的好处是内部实现写法更自然，最后的返回对象清楚展示了模块的公共接口。

## 6. 模块如何嵌套和扩展？

早期模块模式也可以通过对象属性做命名空间嵌套。

```js
const App = {}

App.storage = (function () {
  return {
    save(key, value) {
      localStorage.setItem(key, value)
    },
  }
})()

App.storage.save('theme', 'dark')
```

模块还可以在定义后扩展。常见写法是把已有模块传入新的 IIFE，向它添加成员后再返回。

```js
const App = (function (app) {
  app.version = '1.0.0'

  return app
})(App || {})
```

`App || {}` 这种写法允许模块不存在时创建新对象，存在时扩展已有对象。

## 7. 如何把外部依赖传进模块？

如果模块需要使用外部变量，最好显式通过参数传入 IIFE。

```js
const UserView = (function (dom) {
  function render(user) {
    dom.querySelector('#name').textContent = user.name
  }

  return {
    render,
  }
})(document)
```

这样依赖关系会比直接访问外部全局变量更清楚，也更方便测试和替换。

## 8. 手写模块系统有什么问题？

IIFE 模块能解决私有作用域和全局污染问题，但它不是完整模块系统。

它的主要限制包括：

- 依赖顺序通常要靠脚本标签手动维护。
- 无法可靠按需加载依赖。
- 难以处理循环依赖。
- 难以做静态分析。
- 模块标识、解析和缓存都要自己设计。

所以，IIFE 模块适合理解模块化思想，也适合很小的脚本组织；真正的大型项目应使用标准模块或成熟构建工具，而不是自己拼一个模块系统。
