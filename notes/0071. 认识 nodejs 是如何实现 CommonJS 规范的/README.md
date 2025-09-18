# [0071. 认识 nodejs 是如何实现 CommonJS 规范的](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0071.%20%E8%AE%A4%E8%AF%86%20nodejs%20%E6%98%AF%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%20CommonJS%20%E8%A7%84%E8%8C%83%E7%9A%84)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CommonJS 实现原理简介

## 2. 🫧 评价

- 通过一段伪代码，理解 require 函数内部逻辑，知道 exports 实际上是 module.exports 的一个引用。
- 在初步认识了 CJS 的实现原理后，我们其实可以放弃掉使用 exports.xxx = xxx 的方式来导出模块中的内容，完全可以使用 module.exports 来代替。因此，如果你还在纠结导出模块中的内容应该使用 exports 还是使用 module.exports 的话，建议是选择后者。

```js
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
