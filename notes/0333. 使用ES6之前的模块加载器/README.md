# [0333. 使用ES6之前的模块加载器](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0333.%20%E4%BD%BF%E7%94%A8ES6%E4%B9%8B%E5%89%8D%E7%9A%84%E6%A8%A1%E5%9D%97%E5%8A%A0%E8%BD%BD%E5%99%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 ES6 之前为什么需要模块加载器？](#3--es6-之前为什么需要模块加载器)
- [4. 🤔 CommonJS 是什么？](#4--commonjs-是什么)
- [5. 🤔 `module.exports` 和 `exports` 怎么用？](#5--moduleexports-和-exports-怎么用)
- [6. 🤔 AMD 为什么更适合浏览器？](#6--amd-为什么更适合浏览器)
- [7. 🤔 UMD 解决了什么问题？](#7--umd-解决了什么问题)
- [8. 🤔 这些旧模块加载器今天还有什么价值？](#8--这些旧模块加载器今天还有什么价值)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- ES6 之前模块加载器的背景
- CommonJS 的同步模块模型
- AMD 的异步模块模型
- UMD 的兼容包装
- 旧模块加载器的历史意义和局限

## 2. 🫧 评价

- CommonJS、AMD 和 UMD 都是标准模块到来前的工程化答案；今天不一定手写它们，但读懂它们能帮你理解很多旧包和构建产物。

## 3. 🤔 ES6 之前为什么需要模块加载器？

ES6 之前，JavaScript 语言没有 `import` 和 `export`。如果项目想写模块化代码，就必须使用某种社区约定的模块语法，再用加载器或构建工具把这些模块连接到真实运行环境中。

这些方案通常要解决：

- 模块如何声明依赖。
- 模块如何暴露公共 API。
- 模块如何按正确顺序加载。
- 浏览器如何处理网络延迟。
- 服务器端如何同步加载本地文件。

CommonJS、AMD 和 UMD 都是这个历史阶段的重要方案。

## 4. 🤔 CommonJS 是什么？

CommonJS 是同步模块系统，主要面向服务器端环境。它使用 `require()` 声明依赖，用 `module.exports` 或 `exports` 暴露公共接口。

```js
const math = require('./math')

module.exports = {
  total(numbers) {
    return numbers.reduce((sum, number) => sum + math.double(number), 0)
  },
}
```

导入这个模块：

```js
const calculator = require('./calculator')

console.log(calculator.total([1, 2, 3]))
```

CommonJS 的几个重要特征：

- `require()` 是同步的。
- 模块第一次加载后会被缓存。
- 多次 `require()` 同一个模块，拿到的是同一个模块实例。
- 模块标识符通常由文件路径或包名决定。
- 适合本地文件系统环境，不适合浏览器直接按网络请求同步加载。

## 5. 🤔 `module.exports` 和 `exports` 怎么用？

如果只想导出一个实体，可以直接给 `module.exports` 赋值。

```js
class UserService {}

module.exports = UserService
```

如果要导出多个成员，可以给 `exports` 或 `module.exports` 添加属性。

```js
exports.add = (a, b) => a + b
exports.minus = (a, b) => a - b
```

等价于：

```js
module.exports = {
  add: (a, b) => a + b,
  minus: (a, b) => a - b,
}
```

需要注意，`exports` 只是 `module.exports` 的初始引用。直接给 `exports` 重新赋值不会替换真正导出的对象。

## 6. 🤔 AMD 为什么更适合浏览器？

CommonJS 假设模块可以同步加载，这在服务器端没问题，因为文件通常来自本地磁盘。但浏览器加载模块要经过网络，请求可能很慢，所以更适合异步模型。

AMD 是 Asynchronous Module Definition 的缩写。它通过 `define()` 声明模块和依赖，加载器在依赖加载完成后调用模块工厂函数。

```js
define('calculator', ['math'], function (math) {
  return {
    total(numbers) {
      return numbers.reduce((sum, number) => sum + math.double(number), 0)
    },
  }
})
```

AMD 的重点是：模块先声明依赖，加载器异步获取依赖，依赖准备好之后再执行模块定义。

AMD 也支持类似 CommonJS 的 `require` 和 `exports`。

```js
define('calculator', ['require', 'exports'], function (require, exports) {
  const math = require('math')

  exports.total = function (numbers) {
    return numbers.reduce((sum, number) => sum + math.double(number), 0)
  }
})
```

## 7. 🤔 UMD 解决了什么问题？

CommonJS 和 AMD 分别服务于不同环境。一个库如果想同时支持 Node.js、AMD 加载器和普通浏览器全局变量，就需要某种兼容写法。UMD 就是为此出现的。

UMD 的核心思路是：启动时检测当前环境支持哪种模块系统，然后选择对应导出方式。

```js
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['math'], factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('math'))
  } else {
    root.calculator = factory(root.math)
  }
})(this, function (math) {
  return {
    total(numbers) {
      return numbers.reduce((sum, number) => sum + math.double(number), 0)
    },
  }
})
```

UMD 的样板代码很长，实际开发中通常由构建工具生成，不建议手写维护。

## 8. 🤔 这些旧模块加载器今天还有什么价值？

随着 ES6 模块普及，CommonJS、AMD 和 UMD 不再是浏览器新项目的首选模块写法。但它们仍然有现实价值：

- 许多 npm 包仍然发布 CommonJS 或 UMD 产物。
- Node.js 历史包大量使用 CommonJS。
- 旧前端项目可能仍在使用 AMD 加载器。
- 构建工具输出中经常能看到类似包装结构。

理解这些旧方案，有助于读懂历史代码、构建产物和模块互操作问题。只是新代码中，应优先使用 ES6 模块。
