# [0071. NodeJS 中 CommonJS 规范的实现原理](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0071.%20NodeJS%20%E4%B8%AD%20CommonJS%20%E8%A7%84%E8%8C%83%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)

<!-- region:toc -->

::: details 📚 相关资源

- [📂 TNotes.yuque（笔记附件资源）](https://www.yuque.com/tdahuyou/tnotes.yuque/)
  - [TNotes.yuque.javascript.0071](https://www.yuque.com/tdahuyou/tnotes.yuque/javascript.0071)

:::

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🧠 简述 CommonJS 实现原理](#3--简述-commonjs-实现原理)
- [4. 💻 demos.1 - 模拟简单的 CommonJS 实现](#4--demos1---模拟简单的-commonjs-实现)
- [5. 💻 demos.2 - `exports` 和 `module.exports` 共存的情况](#5--demos2---exports-和-moduleexports-共存的情况)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CommonJS 实现原理简介

## 2. 🫧 评价

- 通过一段伪代码，理解 require 函数内部逻辑
- 知道 `exports` 实际上是 `module.exports` 的一个引用
  - 在模块导出的时候，如果要选一个使用的话，使用 `module.exports` 会更保险一些，因为它是最终的返回结果，而 `exports` 只是为了方便书写导出语句而创建的一个指向 `module.exports` 的引用。

## 3. 🧠 简述 CommonJS 实现原理

- 为了实现 CommonJS 规范，nodejs 对模块 module 做出了以下处理：

```js {3,6,11}
;(function (module) {
  // 1. 在模块开始执行前，初始化一个值 module.exports = {}，这个值就是需要导出的玩意儿
  module.exports = {}

  // 2. 为了方便开发者便捷的导出，nodejs 在初始化完 module.exports 后，又声明了一个变量 exports，并将其赋值为 module.exports。使用 exports 可以导出模块中内容的原理。
  var exports = module.exports

  // 3. ... 这部分是从指定模块中读取到的代码，这些内容都是封装到一个函数中去执行的。这就是为什么 CommonJS 模块中的内容不会污染全局。

  // 4. 最终导出的是 module.exports
  return module.exports
})()
```

- 为了保证高效的执行，仅加载必要的模块，nodejs 只有执行到 require 函数时才会「加载并执行」模块。
  - 模块的加载和执行，是 同步 完成的。
- 为了隐藏模块中的代码，nodejs 执行模块时，会将模块中的所有代码放置到一个函数中执行，以保证不污染全局变量。
  - 这里只要简单的了解一下大致的原理即可：
  - 🤔 为什么模块中的代码不会污染全局呢？
  - ✅ 答：是因为 nodejs 在加载模块的之后，将模块中的代码被丢到了一个函数中执行。
- 为了避免反复加载同一个模块，nodejs 默认开启了模块缓存，如果加载的模块已经被加载过了，则会自动使用之前的导出结果。
- 最后返回的是 `module.exports` 对象
  - 如果你还在纠结导出模块中的内容应该使用 `exports.xxx = xxx` 还是使用 `module.exports = xxx` 的话，建议是选择后者。

## 4. 💻 demos.1 - 模拟简单的 CommonJS 实现

::: code-group

<<< ./demos/1/module1.js {} [module1.js]

<<< ./demos/1/module2.js {} [module2.js]

<<< ./demos/1/module3.js {} [module3.js]

:::

- module2 导入 module1，就相当于是 module3
- 在 node 环境下，执行 `module2.js` 文件，输出结果如下：
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-18-16-24-33.png)

## 5. 💻 demos.2 - `exports` 和 `module.exports` 共存的情况

::: code-group

<<< ./demos/2/index.js {} [index.js]

<<< ./demos/2/module1.js {} [module1.js]

<<< ./demos/2/module2.js {} [module2.js]

<<< ./demos/2/module3.js {} [module3.js]

<<< ./demos/2/module4.js {} [module4.js]

:::

```bash
$ node index.js
# module1: { a: 123, b: 456 }
# module2: { a: 123, b: 456 }
# module3: { a: 123, b: 456 }
# module4: { b: 456 }
```

- 1、2、3 完全等效，因为没有破坏 `module.exports` 的指向
- 4 对 `module.exports` 进行了重新赋值，而最终导出的就是 `module.exports`，因此所有的 `exports.xxx = xxx` 都是无意义的。
