# [0068. AMD](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0068.%20AMD)

<!-- region:toc -->

::: details 📚 相关资源

- [📂 TNotes.yuque（笔记附件资源）](https://www.yuque.com/tdahuyou/tnotes.yuque/)
  - [TNotes.yuque.javascript.0068](https://www.yuque.com/tdahuyou/tnotes.yuque/javascript.0068)

:::

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AMD 是什么？](#3--amd-是什么)
  - [3.1. AMD](#31-amd)
  - [3.2. 基本用法](#32-基本用法)
- [4. 💻 demos.1 - 计算两数相乘](#4--demos1---计算两数相乘)
  - [4.1. demos 需求](#41-demos-需求)
  - [4.2. 💻 demos.1.1 - AMD 经典写法](#42--demos11---amd-经典写法)
  - [4.3. 💻 demos.1.2 - 可以通过 `data-main` 来指定入口](#43--demos12---可以通过-data-main-来指定入口)
  - [4.4. 💻 demos.1.3 - 注意模块的相对路径问题](#44--demos13---注意模块的相对路径问题)
  - [4.5. 💻 demos.1.4 - 模块路径的简写形式](#45--demos14---模块路径的简写形式)
  - [4.6. 💻 demos.1.5 - 支持 AMD + 类 CommonJS 风格](#46--demos15---支持-amd--类-commonjs-风格)
  - [4.7. 💻 demos.1.6 - 导入导出都支持类 CommonJS 风格](#47--demos16---导入导出都支持类-commonjs-风格)
- [5. 🔗 引用](#5--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AMD 模块化规范

## 2. 🫧 评价

AMD 可以说几乎完全退出历史舞台了，很少场景会使用到它，简单了解一下它的导入导出写法，能读懂程序即可。

## 3. 🤔 AMD 是什么？

### 3.1. AMD

AMD（Asynchronous Module Definition）是一种异步模块定义规范，专为浏览器环境设计。

- 异步加载模块及其依赖，不阻塞浏览器渲染
- 依赖前置，在定义模块时必须声明所有依赖
- 并行下载所有依赖，加载完成后执行模块回调
- 代表实现：RequireJS
- 目前（2025）主流规范是 ES Module 和 CommonJS，AMD 已基本退出历史舞台，简单了解即可。

### 3.2. 基本用法

引入 RequireJS：

```html
<script data-main="./index.js" src="./require.js"></script>
```

- `data-main`：入口文件路径
  - RequireJS 读取该属性值，动态创建 `script` 标签并插入页面
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-18-20-33-06.png)
- `src`：RequireJS 库文件路径
  - 下载地址：[require.js download][1]

定义模块：

```js
// AMD 标准写法
define([依赖的模块列表], function (模块名称列表) {
  // 导入：
  // 等待依赖加载完成后，执行回调函数
  // 依赖模块的导出内容作为函数参数传入

  // …… 模块内部代码

  // 导出：
  return 导出的内容
})

// 类 CommonJS 写法（RequireJS 扩展支持）
define(function (require, exports, module) {
  module.exports = 导出的内容
  // 这种写法方便 CommonJS 开发者迁移
})
```

RequireJS 除了实现 AMD 规范，还兼容部分 CommonJS 风格写法（称为 Simplified CommonJS Wrapping），降低开发者迁移成本。

## 4. 💻 demos.1 - 计算两数相乘

这一部分，将通过一个简单的「计算两数相乘」的小 demo 来了解一下 AMD 规范的导入、导出写法。

通过笔记中记录的这些 demos 的写法，你会发现 RequireJS 是非常灵活的，它兼容了多种模块导入、导出的写法。

不过 AMD 现在已经基本用不到了，就如前面提到的，它基本已经退出历史舞台了，快速过一遍 demos 就行，万一在某些项目中看到它的身影，要求能够读懂程序即可。

### 4.1. demos 需求

1. 将两数相乘的逻辑封装到一个模块中
2. 通过 amd 规范来引入模块并使用

功能其实非常简单，下面将通过多种等效的写法来认识 AMD 规范的语法。

### 4.2. 💻 demos.1.1 - AMD 经典写法

::: code-group

<<< ./demos/1/1/1.html

<<< ./demos/1/1/1.js

:::

### 4.3. 💻 demos.1.2 - 可以通过 `data-main` 来指定入口

::: code-group

<<< ./demos/1/2/1.html

<<< ./demos/1/2/1.js

<<< ./demos/1/2/main.js

:::

### 4.4. 💻 demos.1.3 - 注意模块的相对路径问题

::: code-group

<<< ./demos/1/3/1.html

<<< ./demos/1/3/scripts/1.js

<<< ./demos/1/3/scripts/main.js

:::

### 4.5. 💻 demos.1.4 - 模块路径的简写形式

::: code-group

<<< ./demos/1/4/1.html

<<< ./demos/1/4/scripts/1.js

<<< ./demos/1/4/scripts/main.js

:::

### 4.6. 💻 demos.1.5 - 支持 AMD + 类 CommonJS 风格

::: code-group

<<< ./demos/1/5/1.html

<<< ./demos/1/5/scripts/1.js

<<< ./demos/1/5/scripts/main.js

:::

- `1.js` 用的是 AMD 风格
- `main.js` 用的是 CommonJS 风格

### 4.7. 💻 demos.1.6 - 导入导出都支持类 CommonJS 风格

::: code-group

<<< ./demos/1/6/1.html

<<< ./demos/1/6/scripts/1.js

<<< ./demos/1/6/scripts/main.js

:::

- `1.js` 和 `main.js` 用的都是 CommonJS 风格

## 5. 🔗 引用

- [require.js download][1]
- [require.js start][2]
- [requirejs github][3]
- [AMD 规范 - 阮一峰的网络日志][4]

[1]: https://requirejs.org/docs/download.html#requirejs
[2]: https://requirejs.org/docs/start.html
[3]: https://github.com/requirejs/requirejs
[4]: https://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html
