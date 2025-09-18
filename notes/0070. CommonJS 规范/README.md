# [0070. CommonJS 规范](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0070.%20CommonJS%20%E8%A7%84%E8%8C%83)

<!-- region:toc -->

- [📂 TNotes.yuque](https://www.yuque.com/tdahuyou/tnotes.yuque/)
  - [TNotes.yuque.javascript.0070](https://www.yuque.com/tdahuyou/tnotes.yuque/javascript.0070)
- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 入口文件是什么？](#3--入口文件是什么)
- [4. 💻 demos.1 - 入口文件](#4--demos1---入口文件)
- [5. 🤔 CommonJS 是什么？](#5--commonjs-是什么)
- [6. 🤔 CommonJS 在加载模块时是同步的还是异步的？](#6--commonjs-在加载模块时是同步的还是异步的)
- [7. 💡 CommonJS 规范](#7--commonjs-规范)
- [8. 💻 demos.2 - 模块导出](#8--demos2---模块导出)
- [9. 💻 demos.3 - 模块导入时的路径问题](#9--demos3---模块导入时的路径问题)
- [10. 💻 demos.4 - 缓存问题](#10--demos4---缓存问题)
- [11. 📒 小结](#11--小结)
- [12. 🔗 引用](#12--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CommonJS 规范
- 入口文件

## 2. 🫧 评价

- 先对 CommonJS 规范有个初步的认识，在后续的内容中还会通过 demo 来练习 CommonJS 规范的相关知识点。
- 需要知道入口文件的概念，知道如何在 package.json 中查看入口文件（看 main 字段）。
- 理解为什么 CommonJS 无法适用于浏览器侧
  - 原因：**同步加载，导致在加载模块期间，页面会直接卡死**。
  - 正是因为这个原因，才有了后来 ES 官方推出的 ES6 Module 规范。

## 3. 🤔 入口文件是什么？

- **入口文件通常是 index.js 或者由 package.json 中的 main 字段指定的文件**。这个入口文件是启动应用时 Node.js 运行的第一个文件，但一个复杂的应用肯定不会全部写在一个文件里。
- ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-14-22-47-03.png)
- **在 nodejs 中，有且仅有一个入口文件（启动文件），而开发一个应用肯定会涉及到多个文件配合，因此 nodejs 需要一套模块化规范来各个模块的导入、导出问题**。由于 nodejs 刚刚发布的时候，前端没有统一的、官方的模块化规范，因此，它选择使用社区提供的 CommonJS 作为模块化规范。

## 4. 💻 demos.1 - 入口文件

::: code-group

<<< ./demos/1/entry-file-1/package.json {4} [entry-file-1/package.json]

<<< ./demos/1/entry-file-1/index.js {} [entry-file-1/index.js]

<<< ./demos/1/entry-file-1/main.js {} [entry-file-1/main.js]

:::

::: code-group

<<< ./demos/1/entry-file-2/package.json {4} [entry-file-2/package.json]

<<< ./demos/1/entry-file-2/index.js {} [entry-file-2/index.js]

<<< ./demos/1/entry-file-2/main.js {} [entry-file-2/main.js]

:::

::: code-group

```bash [测试]
$ node index.js
./entry-file-1/index.js called
./entry-file-2/main.js called
```

<<< ./demos/1/index.js {} [index.js]

:::

- 通过对应目录下的 package.json 文件的 main 字段查看。
  - 在 entry-file-1 中，入口文件是 index.js
  - 在 entry-file-2 中，入口文件是 main.js
- `require('./entry-file-1')` 这种写法相当于直接引用 'entry-file-1' 下面的入口文件 index.js
- `require('./entry-file-2')` 这种写法相当于直接引用 'entry-file-2' 下面的入口文件 main.js

## 5. 🤔 CommonJS 是什么？

- **CommonJS 是一套为服务器端 JavaScript 应用（nodejs 应用）设计的模块化标准**。
  - 维基百科：CommonJS 是一个项目，其目标是为 JavaScript 在网页浏览器之外创建模块约定。创建这个项目的主要原因是当时缺乏普遍可接受形式的 JavaScript 脚本模块单元，模块在与运行 JavaScript 脚本的常规网页浏览器所提供的不同的环境下可以重复使用。
- **可以说 CommonJS 是一种 JavaScript 环境中模块化编程的规范，它定义了一套模块化导入和导出的语法和机制，旨在解决 JavaScript 在模块化方面的缺陷**。
- 为了方便，我们可能会将 CommonJS 简称为 CJS。

## 6. 🤔 CommonJS 在加载模块时是同步的还是异步的？

- 在 Node.js 中，CommonJS 模块系统加载模块的方式是 **同步的**。
  - 这也意味着在模块加载期间，应用程序不会执行其他任何代码，直到模块加载完成。
- 当你使用 `require()` 函数来加载一个模块时，Node.js 会停止执行当前模块的代码，直到所需的模块被读取、执行并且其 exports 被返回。
- **这种同步加载方式在服务器端编程中是可行的，但是放在浏览器侧是不可行的**。
  - 浏览器侧：模块的同步加载机制，会导致 UI 渲染阻塞，用户交互卡死。
  - 服务侧：文件系统 IO 很快，而且不会像浏览器那样阻塞 UI 或其他用户交互。

## 7. 💡 CommonJS 规范

::: warning commonjs 规范

- [Modules/1.0][2] 这是维基百科上记录的关于 CommonJS 规范的具体描述，Node.js 的 `require` / `module.exports` 就是基于它实现的。
- ![图 1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-14-23-26-16.png)
- 维基百科上记录的这些内容应该算是最权威的了，CommonJS 是一个社区提出的规范，并没有类似 ECMAScript 那样的官方组织。在写这篇笔记时，并没在网上找到对应的官方文档。
- 以下内容是对 CommonJS 规范中的一些要点的记录。

:::

- 如果一个 JavaScript 文件使用了 `exports` 或 `require`，那么它可以被视为一个 CommonJS 模块。
  - 其实，**在 CommonJS 规范中，一个文件默认就是一个模块**。
  - 在 NodeJS 中，对于 Module 的定义，也是一样的 👉 一个文件就是一个 Module。
  - ![图 2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-14-23-30-10.png)
- **在 CommonJS 模块中，文件内定义的变量和函数都是局部的，不会污染全局作用域**。
  - 这意味着模块内部的变量、函数等不会影响到其他模块或全局作用域，彼此之间是相互隔离的。
- **exports 是一个特殊的对象，用于导出模块要暴露出去的 API**。
  - 模块可以将其内部的函数、对象或值添加到 exports 对象中，使得其他模块可以通过 require 函数访问这些导出的内容。
  - **除了使用 exports，还可以使用 module.exports 直接导出一个值，这将覆盖 exports 对象**。
  - 🤔 既然 module.exports 和 exports 都可以实现导出，那么平时在开发时，使用哪种呢？
  - 这个看个人习惯就好，其实用哪种都行。相对而言 module.exports 会更加灵活，使用它的话，我们甚至可以直接导出字符串 `module.exports = 'Tdahuyou';` 但是，如果我们使用的是 exports 就无法实现。
- **require 是一个函数，用于导入其他模块的导出内容**。
  - 当你调用 require 并传入一个模块标识符（可以是模块的名称、相对路径或绝对路径），它会返回所请求模块的 exports 对象或 module.exports 指定的值。

## 8. 💻 demos.2 - 模块导出

::: code-group

<<< ./demos/2/module1.js {} [module1.js]

<<< ./demos/2/module2.js {} [module2.js]

<<< ./demos/2/module3.js {} [module3.js]

:::

- 导出的写法有两种：
  - `exports.xxx = xxx`
  - `module.exports = xxx`
- 不同模块中的内容是互相隔离的，不会互相污染。

## 9. 💻 demos.3 - 模块导入时的路径问题

::: code-group

<<< ./demos/3/module1.js {} [module1.js]

<<< ./demos/3/module2.js {} [module2.js]

<<< ./demos/3/module3.js {} [module3.js]

:::

- 在中导入模块，可以使用相对路径，但是，相对路径必须以 `./` 或者 `../` 开头。
  - `require('./module1.js')` 和 `require('module1.js')`，在 nodejs 中，这两种写法所表示的含义是不同的。
- `require('./module1.js')`
  - 这种写法使用了相对路径（以 `./` 开头），表示要加载的模块文件位于当前文件所在目录下。
  - Node.js 会根据提供的相对路径查找 `module1.js` 文件并加载它。
- `require('module1.js')`
  - 这种写法没有使用相对路径或绝对路径，而是直接给出了模块的名称。
  - 在这种情况下，Node.js 会按照以下顺序查找模块。
    1. 首先，Node.js 会检查是否有内置的核心模块名为 `module1.js`。
    2. 如果没有找到内置模块，Node.js 接着会在本地 `node_modules` 目录中查找名为 `module1.js` 的模块。
    3. 如果在 `node_modules` 中仍然没有找到，Node.js 会继续在上层目录的 `node_modules` 中查找，直到到达文件系统的根目录。
- 通常来说，当你想要加载自己项目中的一个模块文件时，你应该使用相对路径（如 `./module1.js` 或 `../someOtherDir/module2.js`）。而当你想要加载一个第三方库或者内置模块时，你应该直接使用模块名称（如 `require('express')` 或 `require('http')`）。

## 10. 💻 demos.4 - 缓存问题

::: code-group

<<< ./demos/4/module1.js {} [module1.js]

<<< ./demos/4/module2.js {} [module2.js]

:::

- 在 `module2.js` 中，当执行到 require 函数时，会同时执行 `module1.js` 文件中的代码。如果一个模块被同时导入多次，那么该模块也只会被执行一次。
- 因此，如果你的目的仅仅是想要把某个脚本运行一遍，并不需要依赖这个模块导出的任何内容，那么直接 require 一下即可。

## 11. 📒 小结

```markmap

- CommonJS
  - CMJ 规范
    - 入口
      - 通常是 idnex.js 文件
      - 由 package.json 文件中的 main 字段来指定
      - 是一个包的启动文件
      - 当引入一个包时，将依据入口文件逐步分析依赖关系，加载各个模块
    - 定义
      - commonjs 是一套为服务器端 JavaScript 应用（nodejs 应用）设计的模块化标准。
    - 模块
      - 每一个文件都是一个模块
    - 同步
      - 同步加载模块
      - 在服务端环境下，通过文件同步 IO 的方式实现
      - 由于文件 IO 的速度显然快于网络 IO，因此这种同步的方式也还是可以接受的。
    - 导出
      - exports
      - module.exports
    - 导入
      - require
      - ⚠️ 路径问题
        - 如果导入的是自己写的模块，使用 ./ 或 ../ 开头
        - 如果导入的是第三方模块或者 nodejs 内置模块，直接写模块名即可
      - ⚠️ 缓存问题
        - 在某个模块（A）中，重复导入某个指定模块（B），那么 B 只会在首次被导入时执行一次。
  - nodejs 模块处理
    - 同步加载
      - 仅处理必要的模块
      - 只有执行到 require 函数时才会去「同步」地加载模块
    - 避免污染
      - 模块内容不会污染全局
      - 模块中的内容会被丢到一个个函数中执行
    - 自动缓存
      - 为了避免反复加载同一个模块，nodejs 默认开启了模块缓存。
      - 如果加载的模块已经被加载过了，则会自动使用之前的导出结果。

```

## 12. 🔗 引用

- [nodejs doc - modules][1]
  - nodejs 官方文档 modules - 介绍了 CommonJS 规范的相关内容
- [CommonJS][3]
  - 维基百科
- [Modules/1.0][2]
  - 维基百科
  - CommonJS 规范具体内容，Node.js 的 `require` / `module.exports` 就是基于它实现的。
  - Modules/1.1 / 1.1.1（对 1.0 的补充）

[1]: https://nodejs.org/api/modules.html
[2]: https://wiki.commonjs.org/wiki/Modules/1.0
[3]: https://wiki.commonjs.org/wiki/CommonJS
