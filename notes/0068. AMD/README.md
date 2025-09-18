# [0068. AMD](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0068.%20AMD)

<!-- region:toc -->

- [📂 TNotes.yuque](https://www.yuque.com/tdahuyou/tnotes.yuque/)
  - [TNotes.yuque.javascript.0068](https://www.yuque.com/tdahuyou/tnotes.yuque/javascript.0068)
- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 AMD 简介](#3--amd-简介)
- [4. 📒 demos 需求 - 计算两数相乘](#4--demos-需求---计算两数相乘)
- [5. 💻 demos.1 - 写法 1 - AMD 经典写法](#5--demos1---写法-1---amd-经典写法)
- [6. 💻 demos.2 - 写法 2 - 可以通过 `data-main` 来指定入口](#6--demos2---写法-2---可以通过-data-main-来指定入口)
- [7. 💻 demos.3 - 写法 3 - 注意模块的相对路径问题](#7--demos3---写法-3---注意模块的相对路径问题)
- [8. 💻 demos.4 - 写法 4 - 模块路径的简写形式](#8--demos4---写法-4---模块路径的简写形式)
- [9. 💻 demos.5 - 写法 5 - 支持 AMD + 类 CommonJS 风格](#9--demos5---写法-5---支持-amd--类-commonjs-风格)
- [10. 💻 demos.6 - 写法 6 - 导入导出都支持类 CommonJS 风格](#10--demos6---写法-6---导入导出都支持类-commonjs-风格)
- [11. 🔗 引用](#11--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AMD 模块化规范

## 2. 🫧 评价

- 通过一个简单的「计算两数相乘」的 demo 来了解一下 AMD 规范的导入、导出写法。
- 通过笔记中记录的这些 demos，你会发现 RequireJS 是非常灵活的，它兼容了多种模块导入、导出的写法。
- 不过 AMD 现在已经基本用不到了，快速过一遍 demos 就行。

## 3. 📒 AMD 简介

- AMD，全称是 Asynchronous Module Definition，异步模块定义（使用异步方式加载模块，即异步模块加载机制）。
  - AMD 是一种在浏览器环境中设计用于异步加载模块的规范。
  - 它允许模块和它们的依赖可以被异步加载，这有助于提高页面加载速度，因为它不会阻塞浏览器的其他处理过程。
  - RequireJS 是一个流行的 JavaScript 文件和模块加载器，它实现了 AMD 规范。
- **代表实现：** RequireJS
- **核心思想：** **依赖前置**。
  - 它要求开发者在定义模块时，就要声明所有依赖的模块。
  - 加载器会并行地异步下载所有依赖，当所有依赖都加载完成后，才会执行当前模块的回调函数。
- **优点：** 提前加载依赖，可以并行处理，性能较好。
- **缺点：** 依赖关系必须提前写好，不够直观，有时会导致不必要的加载。
- **非目前的主流规范** 就目前（24 年）来看，主流的规范主要是 ES Module 和 CommonJS，因此，AMD 简单了解一下即可。

```html
<script data-main="./index.js" src="./require.js"></script>
```

- `require.js` 包的下载链接：[require.js download][1]
  - `require.js` 实现了 AMD 模块化规范。
- `data-main`：属性值是 入口文件的路径
  - require.js 会读取 script 标签身上的 data-main 属性的属性值，然后创建一个 script 标签，并将它的 src 属性的属性值设置为从 data-main 中读取到的属性值，然后再插入到页面中。
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-18-20-33-06.png)
  - 引用 [require.js start][2]
- `src`：属性值是 require.js 文件

```js
// 需要引入 require.js 文件，该文件可以在网上下载。
define([依赖的模块列表], function (模块名称列表) {
  // 导入：
  // 等待依赖的模块列表加载完成后，再继续执行函数体的内容。
  // 模块加载的过程是异步的，当模块内容加载完成之后，会触发回调。
  // 依赖模块的导出内容，将作为函数体的参数依次传入，以此来实现模块的导入。

  // …… 模块内部的代码

  // 导出：
  return 导出的内容
})

/* 
define 的参数很灵活，还有其他的传参方式，比如：
define(function (require, exports, module) {
    module.exports = 导出的内容;
    // 这种写法是给 习惯使用 CommonJS 的开发人员 提供便利，函数体中的书写规范，和 CommonJS 完全一样。
});
*/
```

- RequireJS 实现了 AMD 规范。
- RequireJS 额外兼容了一部分 CommonJS 风格的写法（称为 Simplified CommonJS Wrapping），方便开发者迁移。

## 4. 📒 demos 需求 - 计算两数相乘

- 需求：
  1. 将两数相乘的逻辑封装到一个模块中
  2. 通过 amd 规范来引入模块并使用
- 功能其实非常简单，下面将通过多种等效的写法来认识 AMD 规范的语法。

## 5. 💻 demos.1 - 写法 1 - AMD 经典写法

::: code-group

<<< ./demos/1/1.html {}

<<< ./demos/1/1.js {}

:::

## 6. 💻 demos.2 - 写法 2 - 可以通过 `data-main` 来指定入口

::: code-group

<<< ./demos/2/1.html {}

<<< ./demos/2/1.js {}

<<< ./demos/2/main.js {}

:::

## 7. 💻 demos.3 - 写法 3 - 注意模块的相对路径问题

::: code-group

<<< ./demos/3/1.html {}

<<< ./demos/3/scripts/1.js {} [./scripts/1.js]

<<< ./demos/3/scripts/main.js {} [./scripts/main.js]

:::

## 8. 💻 demos.4 - 写法 4 - 模块路径的简写形式

::: code-group

<<< ./demos/4/1.html {}

<<< ./demos/4/scripts/1.js {} [./scripts/1.js]

<<< ./demos/4/scripts/main.js {} [./scripts/main.js]

:::

## 9. 💻 demos.5 - 写法 5 - 支持 AMD + 类 CommonJS 风格

::: code-group

<<< ./demos/5/1.html {}

<<< ./demos/5/scripts/1.js {} [./scripts/1.js]

<<< ./demos/5/scripts/main.js {} [./scripts/main.js]

:::

- `1.js` 用的是 AMD 风格
- `main.js` 用的是 CommonJS 风格

## 10. 💻 demos.6 - 写法 6 - 导入导出都支持类 CommonJS 风格

::: code-group

<<< ./demos/6/1.html {}

<<< ./demos/6/scripts/1.js {} [./scripts/1.js]

<<< ./demos/6/scripts/main.js {} [./scripts/main.js]

:::

- `1.js` 和 `main.js` 用的都是 CommonJS 风格

## 11. 🔗 引用

- [require.js download][1]
- [require.js start][2]
- [requirejs github][3]
- [AMD 规范 - 阮一峰的网络日志][4]

[1]: https://requirejs.org/docs/download.html#requirejs
[2]: https://requirejs.org/docs/start.html
[3]: https://github.com/requirejs/requirejs
[4]: https://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html
