# [0067. CMD](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0067.%20CMD)

<!-- region:toc -->

::: details 📚 相关资源

- [📂 TNotes.yuque（笔记附件资源）](https://www.yuque.com/tdahuyou/tnotes.yuque/)
  - [TNotes.yuque.javascript.0067](https://www.yuque.com/tdahuyou/tnotes.yuque/javascript.0067)

:::

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评论](#2--评论)
- [3. 📒 CMD 简介](#3--cmd-简介)
- [4. 💻 demos.1 - Sea.js 的基本使用](#4--demos1---seajs-的基本使用)
- [5. 🔗 引用](#5--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CMD 规范

## 2. 🫧 评论

- CMD 现在基本也不用了，简单看下「demo」，了解下 CMD 的模块导入、导出写法即可。

## 3. 📒 CMD 简介

- CMD 全称是 **Common Module Definition**，公共/通用模块定义规范
  - CMD 是另一种用于浏览器端的模块化规范，由中国程序员玉伯提出。
- **代表实现：** Sea.js
- **核心思想：** **就近依赖**。
  - 它只在需要使用模块时才进行下载和执行。
  - 它与 AMD 类似，但是更加注重模块的延迟执行，**依赖就近**，延迟执行。
- **优点：** 逻辑清晰，模块加载时机更符合 CommonJS 的语法习惯。
- **缺点：** 依赖不能并行加载，可能导致 Cascading network requests（级联式网络请求），在网络条件差时，性能表现不如 AMD。
  - 通用模块定义，与 AMD 类似，但是在模块定义的方式和加载的时机上有所不同
- Sea.js
  - Sea.js 是一个遵循 CMD 规范的模块加载器，你可以在 [Sea.js 官网][2] 下载源码。
  - Sea.js 是一位阿里的前工程师 [玉伯][7] 写的。
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-19-07-42-26.png)
  - 图片来源： [yuque garden][4]
  - Sea.js 实现了 CMD 规范，在 CMD 中，导入和导出模块的代码，都必须放置在 define 函数中。
- AMD vs. CMD
  - CMD 和 AMD 的实现原理都差不多，早期流行这么一种观点：CMD 更加好用，因为它更加类似于 CommonJS 规范。
  - 历史：虽然实现了 AMD 规范的 require.js 目前也支持类似于 CommonJS 规范的写法，但是 sea.js 更早支持类似于 CommonJS 规范的写法。
  - 现状（24 年）：**AMD 和 CMD 基本都退出历史舞台了，目前更加主流的是 CommonJS、ES Module**。

```html
<!-- 
和 AMD 的不同点：入口文件的书写
AMD 的写法：<script data-main="./index.js" src="./require.js"></script>
CMD 的写法如下： 
-->
<script src="./sea.js"></script>
<script>
  seajs.use('./index.js')
</script>
```

```js
// 定义一个模块
define(function (require, exports, module) {
  // 模块内部的代码
})
```

## 4. 💻 demos.1 - Sea.js 的基本使用

::: code-group

```bash [目录结构]
# 目录结构
├── index.html
├── libs
│   └── sea.js # 需要手动下载后引入
└── modules
    ├── main.js
    ├── module1.js
    ├── module2.js
    ├── module3.js
    └── module4.js
```

<<< ./demos/1/index.html {}

<<< ./demos/1/modules/main.js

<<< ./demos/1/modules/module1.js

<<< ./demos/1/modules/module2.js

<<< ./demos/1/modules/module3.js

<<< ./demos/1/modules/module4.js

:::

- 依赖关系：
  - ![svg](./assets/1.svg)
- 打开 index.html 控制台输出结果：
  - ![图 1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-19-08-34-40.png)

## 5. 🔗 引用

- [Common Module Definition / draft][3]
  - CMD 规范草案
- [Sea.js 官网][2]
- [Sea.js github][5]
- Sea.js 作者
  - [微博 - 玉伯也叫黑侠][1]
  - [github - lifesinger][7]
  - [x - lifesinger][6]
- [yuque garden][4]

[1]: https://weibo.com/lifesinger
[2]: https://seajs.github.io/seajs/docs/#intro
[3]: https://github.com/cmdjs/specification/blob/master/draft/module.md
[4]: https://www.yuque.com/yuquegarden
[5]: https://github.com/seajs/seajs/
[6]: https://x.com/lifesinger
[7]: https://github.com/lifesinger
