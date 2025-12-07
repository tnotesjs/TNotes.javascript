# [0071. NodeJS 中 CommonJS 规范的实现原理](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0071.%20NodeJS%20%E4%B8%AD%20CommonJS%20%E8%A7%84%E8%8C%83%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)

<!-- region:toc -->

::: details 📚 相关资源

- [📂 TNotes.yuque（笔记附件资源）](https://www.yuque.com/tdahuyou/tnotes.yuque/)
  - [TNotes.yuque.javascript.0071](https://www.yuque.com/tdahuyou/tnotes.yuque/javascript.0071)

:::

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 NodeJS 中 CommonJS 规范的实现原理是？](#3--nodejs-中-commonjs-规范的实现原理是)
- [4. 🤔 为什么模块中的代码不会污染全局呢？](#4--为什么模块中的代码不会污染全局呢)
- [5. 🤔 模块的加载和执行是同步的还是异步的？](#5--模块的加载和执行是同步的还是异步的)
- [6. 🤔 同一个模块 A 被多个模块引用，会导致 A 被执行多次吗？](#6--同一个模块-a-被多个模块引用会导致-a-被执行多次吗)
- [7. 🤔 模块的导出时用 `exports`、`module.exports` 有什么区别？](#7--模块的导出时用-exportsmoduleexports-有什么区别)
- [8. 💻 demos.1 - 模拟 require 的内部机制](#8--demos1---模拟-require-的内部机制)
- [9. 💻 demos.2 - `exports` 和 `module.exports` 共存的情况](#9--demos2---exports-和-moduleexports-共存的情况)
- [10. 💻 demos.3 - 模块缓存](#10--demos3---模块缓存)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CommonJS 实现原理简介
- CommonJS 模块导出 `exports` 和 `module.exports` 的区别
- CommonJS 的模块同步加载机制
- CommonJS 的模块缓存机制

## 2. 🫧 评价

通过一段伪代码来了解 `require` 函数内部的实现逻辑。

需要知道 `exports` 实际上是 `module.exports` 的一个引用，在模块导出的时候，如果要选一个使用的话，使用 `module.exports` 会更保险一些，因为它是最终的返回结果，而 `exports` 只是为了方便书写导出语句而创建的一个指向 `module.exports` 的引用。

对缓存实现的原理有个初步的了解即可，手动清除缓存的操作，在开发中大概率不会用到。

## 3. 🤔 NodeJS 中 CommonJS 规范的实现原理是？

为了实现 CommonJS 规范，nodejs 对 module（模块，也就是一个个文件） 做了以下处理：

```js
;(function (module) {
  // step1.
  // 在模块开始执行前
  // 初始化一个值 module.exports = {}
  // 这个值就是需要导出的玩意儿
  module.exports = {}

  // step2.
  // 为了方便开发者便捷的导出
  // nodejs 在初始化完 module.exports 后
  // 又声明了一个变量 exports 并将其赋值为 module.exports
  // 这就是为什么在模块中使用 exports 也可以导出模块中内容的原因
  var exports = module.exports

  // step3.
  // ... 文件内容
  // 这部分是从指定模块中读取到的代码
  // 这些内容都是封装到一个函数中去执行的
  // 这就是为什么 CommonJS 模块中的内容不会污染全局的原因

  // step4.
  // 最终导出的是 module.exports
  return module.exports
})()
```

## 4. 🤔 为什么模块中的代码不会污染全局呢？

为了隐藏模块中的代码，nodejs 执行模块时，会将模块中的所有代码放置到一个函数中执行，以保证不污染全局变量。

答：是因为 nodejs 在加载模块的之后，将模块中的代码被丢到了一个函数中执行。

## 5. 🤔 模块的加载和执行是同步的还是异步的？

为了保证高效的执行，仅加载必要的模块，nodejs 只有执行到 require 函数时才会「加载并执行」模块。所以在 CommonJS 中，模块的加载和执行，是同步完成的。

## 6. 🤔 同一个模块 A 被多个模块引用，会导致 A 被执行多次吗？

为了避免反复加载同一个模块，nodejs 默认开启了模块缓存，如果加载的模块已经被加载过了，则会自动使用之前的导出结果。

## 7. 🤔 模块的导出时用 `exports`、`module.exports` 有什么区别？

`exports` 是一个指向 `module.exports` 的引用，最终导出的是 `module.exports` 对象。

如果你还在纠结导出模块中的内容应该使用 `exports.xxx = xxx` 还是使用 `module.exports = xxx` 的话，建议是选择后者。因为前者 `exports` 可能会因为你在模块中对 `module.exports` 进行重新赋值，导致所有 `exports.xxx` 失效。

```js
;(function (module) {
  // step1.
  module.exports = {}

  // step2.
  var exports = module.exports

  // step3.
  // ... 文件内容
  // 假如在你的文件内容中对 module.exports 进行了重新赋值
  // 那么就会导致 exports 失效
  module.exports = {
    // ...
  }

  // step4.
  return module.exports
})()
```

## 8. 💻 demos.1 - 模拟 require 的内部机制

::: code-group

<<< ./demos/1/module1.js

<<< ./demos/1/module2.js

<<< ./demos/1/module3.js

:::

3 个 module 之间的关系：`module1 + module2 = module3` => module2 导入 module1，就相当于是 module3。

`node module2.js` 和 `node module3.js` 将得到相同的输出结果：

```bash
node module2.js # 或者 node module3.js
# module1 called
# 1
# 2
# 3
# { name: 'Tdahuyou', bilibili: 'https://space.bilibili.com/407241004' }
# 100
# undefined
```

## 9. 💻 demos.2 - `exports` 和 `module.exports` 共存的情况

::: code-group

<<< ./demos/2/index.js

<<< ./demos/2/module1.js

<<< ./demos/2/module2.js

<<< ./demos/2/module3.js

<<< ./demos/2/module4.js

:::

```bash
$ node index.js
# module1: { a: 123, b: 456 }
# module2: { a: 123, b: 456 }
# module3: { a: 123, b: 456 }
# module4: { b: 456 }
```

`module1`、`module2`、`module3` 完全等效，因为没有破坏 `module.exports` 的指向。`module4` 对 `module.exports` 进行了重新赋值，而最终导出的就是 `module.exports`，因此所有的 `exports.xxx = xxx` 都是无意义的。

## 10. 💻 demos.3 - 模块缓存

::: code-group

<<< ./demos/3/myModule.js

<<< ./demos/3/1.js

<<< ./demos/3/2.js

<<< ./demos/3/3.js

<<< ./demos/3/4.js

<<< ./demos/3/5.js

<<< ./demos/3/6.js

:::
