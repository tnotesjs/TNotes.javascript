# [0128. 对比 AMD、CMD](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0128.%20%E5%AF%B9%E6%AF%94%20AMD%E3%80%81CMD)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🆚 AMD、CMD 核心差异对比表](#3--amdcmd-核心差异对比表)
- [4. 💻 demos.1 - AMD 🆚 CMD](#4--demos1---amd--cmd)
  - [4.1. AMD 的流程（以 RequireJS 的实现为例）](#41-amd-的流程以-requirejs-的实现为例)
  - [4.2. CMD 的流程（以 Sea.js 的实现为例）](#42-cmd-的流程以-seajs-的实现为例)
  - [4.3. CMD 实现条件加载、按需加载](#43-cmd-实现条件加载按需加载)
- [5. 🔗 引用](#5--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 通过 demos 来对比 AMD、CMD 一些差异点

## 2. 🫧 评价

- 想要了解 AMD、CMD 之间的核心差异，可以优先看看玉伯前辈写的一些内容，可以在 [SeaJS 官网][4] 找到入口。因为里边儿时不时会提到 CMD 的代表 SeaJS 为什么这么做，AMD 的代表 RequireJS 是怎么做的。
- 这篇笔记主要关注模块的加载和执行的差异，来对 AMD 和 CMD 做一个比较。
  - 要说两者在依赖处理层面上的核心差异，这应该也算是其中之一了。

## 3. 🆚 AMD、CMD 核心差异对比表

- AMD 和 CMD 的核心区别在于它们对 **“依赖”** 的处理时机不同，这直接导致了它们在实际应用和执行流程上的差异。
  - 这里提到的“依赖处理时机”，包括了“依赖的加载时机”、“依赖的执行时机”。
- 下面这张表格，罗列了两者之间的一些核心差异点：

| 特性 | AMD (Asynchronous Module Definition) | CMD (Common Module Definition) |
| :-- | :-- | :-- |
| **核心思想** | **依赖前置** (Dependence First) | **就近依赖** (Dependence on Use) |
| **加载时机** | 在定义模块时，就必须 **提前声明** 所有依赖，加载器会 **并行异步加载** 所有依赖。 | 通过正则解析 `require` 完成静态分析，事先完成依赖的预加载。 |
| **执行时机** | 所有依赖加载并执行完成后，才执行当前模块的 **工厂函数**。 | 在执行模块代码时，遇到 `require()` 语句，才去 **按需执行** 依赖。 |
| **代表实现** | RequireJS | Sea.js |

- **AMD 是“先把一切都准备好，包括依赖的加载和执行”**
- **CMD 是“依赖可以做预加载，但是执行必须 lazy”**

## 4. 💻 demos.1 - AMD 🆚 CMD

- 为了更好地理解，我们用一个具体的例子来对比两种方案。假设我们有一个 `main.js` 模块，它依赖 `moduleA.js` 和 `moduleB.js`。
- 可以以 open with live server 启动，模拟网络请求，然后打开浏览器查看效果。

### 4.1. AMD 的流程（以 RequireJS 的实现为例）

::: code-group

<<< ./demos/1/AMD/index.html {}

<<< ./demos/1/AMD/main.js {}

<<< ./demos/1/AMD/moduleA.js {}

<<< ./demos/1/AMD/moduleB.js {}

:::

- 依赖前置：
  - 在入口模块开始时打断点，通过浏览器调试工具查看各模块的加载过程，你会发现当主函数的回调开始执行的时候，ModuleA 和 ModuleB 都已经完成加载了。
  - 你可以在 Network 面板中看看，当程序刚开始执行入口模块逻辑时，所有模块都已经准备好了，这就是 **依赖前置** 的思想。

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-19-12-21-00.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-19-12-21-23.png)

:::

- **执行流程**
  1. **加载入口**：浏览器加载 `main.js` 文件。
  2. **解析依赖**：RequireJS **立即** 解析 `main.js` 声明的依赖数组 `['./moduleA.js', './moduleB.js']`。
  3. **并行请求**：RequireJS **同时** 向服务器发送对 `moduleA.js` 和 `moduleB.js` 的网络请求。
  4. **等待加载**：主线程等待两个文件都下载并执行完毕。
  5. **回调执行**：当所有依赖（`moduleA` 和 `moduleB`）都就绪后，RequireJS 才会执行 `main.js` 的回调函数。
- **特点**：
  - 开发者必须在文件顶部一次性声明所有依赖，当依赖链很长时，代码可读性会变差。
  - 一些暂时不用的依赖也可能被提前加载，造成资源浪费。
- **🤔 moduleA 和 moduleB 谁会先执行呢？**
  - 答案是：**谁先加载完谁先执行，而模块请求的过程是并行去做的，因此谁都可能会先完成加载**。
  - 我们可以在 moduleA 和 moduleB 中添加一条 log 输出，比如 `console.log('moduleA.js is loaded')`、`console.log('moduleB.js is loaded')`，只要这个模块被执行，那么就会在控制台看到对应的输出。
  - 以下是实际运行的结果：

::: swiper

![A 先](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-20-09-35-15.png)

![B 先](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-20-09-35-21.png)

:::

### 4.2. CMD 的流程（以 Sea.js 的实现为例）

::: code-group

<<< ./demos/1/CMD/index.html {}

<<< ./demos/1/CMD/main.js {}

<<< ./demos/1/CMD/moduleA.js {}

<<< ./demos/1/CMD/moduleB.js {}

:::

- 静态分析：
  - 可以参考上述的打断点测试步骤来查看效果，当程序开始执行入口函数的逻辑之前，会事先做一个静态分析，扫描函数体中的 require 函数调用，提取出模块 ID（也就是模块路径），完成这些模块的加载工作，但是并不会立即执行。
  - Sea.js 的静态分析是基于正则表达式的，核心逻辑封装在 [src/util-deps.js][1] 模块中。

::: code-group

```js [src/util-deps.js]
/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 * ref: https://github.com/seajs/crequire
 */

var REQUIRE_RE =
  /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = []

  code.replace(SLASH_RE, '').replace(REQUIRE_RE, function (m, m1, m2) {
    if (m2) {
      ret.push(m2)
    }
  })

  return ret
}
```

```js [静态分析 main.js]
parseDependencies(`// main.js
define(function (require, exports, module) {
  const moduleA = require('./moduleA.js')
  moduleA.doSomething()
  const moduleB = require('./moduleB.js')
  moduleB.doSomethingElse()
})`)
// => (2) ['./moduleA.js', './moduleB.js']
```

:::

- 静态分析输出结果：
- ![图 4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-20-14-58-35.png)

---

- **执行流程**
  1. **加载入口模块并完成静态分析**
     - 浏览器加载 `main.js`（由 `seajs.use('./main.js')` 发起）。
     - `main.js` 中的 `define(factory)` 会被调用并 **注册** 模块，SeaJS 会把 factory 转为字符串做静态扫描，从字面 `require('...')` 中提取依赖并 **并行预取** 这些依赖文件。
     - 注意：模块加载完之后不会被立即执行，当模块被 require 时才会执行。
  2. **执行入口模块**
     - SeaJS 会执行入口模块的逻辑，当执行到断点处时（入口模块的第一行）很多依赖通常已被预取并注册好了。
     - 当运行到 `require('./moduleA')`、`require('./moduleB')` 时，才会执行模块 moduleA、moduleB 中的逻辑。
- **特点**：
  - 代码逻辑清晰，**更符合 CommonJS 的书写习惯**。
  - 模块加载机制：通过静态分析来实现预加载。
  - 模块的执行机制：当执行到 require 调用时，才会执行具体模块逻辑，实现按需执行，而不像 AMD 那样，先把所有模块都跑一边。

---

- 为了更好地理解静态分析，可参考以下问题：
- **🤔 下面这些写法，会有什么问题？**

```js
// main.js
define(function (require, exports, module) {
  const moduleAPath = './moduleA'
  const moduleBPath = './moduleB'

  const moduleA = require(moduleAPath)
  moduleA.doSomething()

  const moduleB = require(moduleBPath)
  moduleB.doSomethingElse()
})
```

```js
// main.js
define(function (require, exports, module) {
  const r = require
  const moduleA = r('./moduleA.js')
  moduleA.doSomething()
  const moduleB = r('./moduleB.js')
  moduleB.doSomethingElse()
})
```

- 上面这两种写法，最终会导致 require 函数返回的 moduleA 和 moduleB 都是 undefined，导致模块加载失败。
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-20-15-26-23.png)
- 最终运行将会报错：`Uncaught TypeError: Cannot read property 'doSomething' of undefined`
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-20-15-26-32.png)
- 原因分析：
  - SeaJS 的依赖分析是静态的，对于上述这样的写法，在 SeaJS 做静态的依赖分析时，将无法识别出正确的依赖关系，进而导致 moduleA、moduleB 无法被加载。

### 4.3. CMD 实现条件加载、按需加载

- 上边儿的 CMD 的写法，在 SeaJS 做完静态依赖分析之后，还是会立刻加载模块，好像并没有实现所谓的按需加载，而是实现按需执行。
  - 在 [CMD 规范的草案][3] 中就有那么一句话：`Execution must be lazy.`
  - 翻译过来就是：**执行必须是懒惰的，不能立即执行**。
  - 上述 demo 的表现结果也恰好说明了这一点，虽然事先有一个静态分析的过程，完成了依赖的预加载，但是之后再执行到具体的 require 语句的时候，才会执行模块逻辑。
- **🤔 如果我们需要按需加载的效果，应该怎么写呢？**
  - 答：使用 `require.async`

::: code-group

<<< ./demos/1/CMD-2/index.html {}

<<< ./demos/1/CMD-2/main.js {}

<<< ./demos/1/CMD-2/moduleA.js {}

<<< ./demos/1/CMD-2/moduleB.js {}

:::

- 如果今天是周末，那么加载模块 A、否则加载模块 B：
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-20-16-03-34.png)

## 5. 🔗 引用

- [seajs src/util-deps.js][1]
  - sea.js 静态分析工具函数
- [seajs - 关于 require 的书写约定][2]
- [Common Module Definition / draft][3]
  - CMD 规范草案
- [SeaJS Docs][4]

[1]: https://github.com/seajs/seajs/blob/3ab7d5a7/src/util-deps.js
[2]: https://github.com/seajs/seajs/issues/259
[3]: https://github.com/cmdjs/specification/blob/master/draft/module.md
[4]: https://seajs.github.io/seajs/docs/#docs
