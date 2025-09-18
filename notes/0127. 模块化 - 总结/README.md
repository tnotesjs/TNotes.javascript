# [0127. 模块化 - 总结](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0127.%20%E6%A8%A1%E5%9D%97%E5%8C%96%20-%20%E6%80%BB%E7%BB%93)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🆚 JavaScript 不同模块化方案的对比](#3--javascript-不同模块化方案的对比)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 模块化章节的内容总结

## 2. 🫧 评价

- 对模块化章节的笔记做一个总结，罗列一些对比项加深理解。

## 3. 🆚 JavaScript 不同模块化方案的对比

| 规范 | 出现时间 | 代表实现 | 依赖特点 | 适用场景 |
| --- | --- | --- | --- | --- |
| **CommonJS** | 2009（Node.js） | Node.js | **同步加载**，运行时加载 | Node.js 服务器端 |
| **AMD** | 2009\~2010 | RequireJS | **依赖前置**，异步加载，依赖在函数参数传入，提前执行 | 浏览器端（适合前端异步模块加载） |
| **CMD** | \~2011（玉伯提出） | SeaJS | **依赖就近**，延迟执行，更贴近 CommonJS 风格 | 浏览器端（中国社区流行过一段时间） |
| **ES Modules** | 2015（ES6 标准） | 原生支持（现代浏览器、Node.js） | **静态依赖分析**，编译时确定依赖关系，原生支持 | 浏览器 + Node.js，官方统一标准，目前的主流方案 |

- 书写示例对比：

::: code-group

```js [CMJ]
// 模块导入
const fs = require('fs');
const myModule = require('./myModule');

// …… 模块逻辑

// 模块导出
exports.foo = ...;
exports.bar = ...;

module.exports = { ... }
```

```js [AMD]
define(['dep1','dep2'], function(d1, d2) {
  // 模块导入：
  // 导入的依赖会注入到函数参数中

  // …… 模块逻辑

  // 模块导出
  return { ... }
})
```

```js [CMD]
define(function(require, exports, module) {
  // 模块导入：
  const d1 = require('dep1');

  // …… 模块逻辑

  // 模块导出：
  exports.xxx = ...
})
```

```js [ESM]
// 模块导入：
import fs from 'fs';

// 模块导出：
export default { ... }
```

:::

- 核心差异总结
  - **CommonJS**：同步、运行时 → 适合服务端 Node.js。
  - **AMD**：异步、依赖前置 → 浏览器端早期主流方案（RequireJS）。
  - **CMD**：异步、依赖就近 → 更接近 CommonJS 思路（SeaJS，主要在中国前端社区流行）。
  - **ES Modules**：语言级标准，静态依赖分析 → 逐渐取代上述三者，成为统一模块化方案。
