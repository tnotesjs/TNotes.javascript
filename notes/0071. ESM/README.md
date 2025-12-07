# [0071. ESM](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0071.%20ESM)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 💡 思维导图](#3--思维导图)
- [4. 🤔 ESM 是什么？](#4--esm-是什么)
- [5. 🤔 在浏览器与 NodeJS 中如何使用 ESM？](#5--在浏览器与-nodejs-中如何使用-esm)
  - [5.1. 浏览器](#51-浏览器)
  - [5.2. NodeJS](#52-nodejs)
    - [🤔 NodeJS 默认是 CJS 吗？](#-nodejs-默认是-cjs-吗)
- [6. 🤔 ESM 的导出与导入有哪些写法？](#6--esm-的导出与导入有哪些写法)
  - [6.1. 导出](#61-导出)
    - [🤔 绑定再导出怎么写与何时用？](#-绑定再导出怎么写与何时用)
  - [6.2. 导入](#62-导入)
- [7. 💻 demos.1 - 命名导出与命名导入](#7--demos1---命名导出与命名导入)
- [8. 💻 demos.2 - 默认导出与默认导入](#8--demos2---默认导出与默认导入)
- [9. 💻 demos.3 - 混合导出与混合导入](#9--demos3---混合导出与混合导入)
- [10. 💻 demos.4 - 重命名导出与导入](#10--demos4---重命名导出与导入)
- [11. 💻 demos.5 - 整体导入命名空间](#11--demos5---整体导入命名空间)
- [12. 💻 demos.6 - 动态导入按需加载](#12--demos6---动态导入按需加载)
- [13. 💻 demos.7 - 在浏览器中使用 ESM](#13--demos7---在浏览器中使用-esm)
- [14. 💻 demos.11 - 模块缓存机制](#14--demos11---模块缓存机制)
- [15. 💻 demos.12 - 无绑定导入（仅执行）](#15--demos12---无绑定导入仅执行)
- [16. 💻 demos.13 - 默认导入的 4 种等价写法](#16--demos13---默认导入的-4-种等价写法)
- [17. 💻 demos.14 - 依赖预加载 vs 延迟加载](#17--demos14---依赖预加载-vs-延迟加载)
- [18. 💻 demos.15 - 绑定再导出（聚合导出）](#18--demos15---绑定再导出聚合导出)
  - [18.1. 场景 1：基本用法](#181-场景-1基本用法)
  - [18.2. 场景 2：命名冲突解决方案](#182-场景-2命名冲突解决方案)
  - [18.3. 场景 3：`export *` 不包含 default](#183-场景-3export--不包含-default)
  - [18.4. 导入](#184-导入)
- [19. 💻 demos.14 - 依赖预加载 vs 延迟加载](#19--demos14---依赖预加载-vs-延迟加载)
- [20. 💻 demos.11 - 模块缓存机制](#20--demos11---模块缓存机制)
- [21. 💻 demos.12 - 无绑定导入（仅执行）](#21--demos12---无绑定导入仅执行)
- [22. 💻 demos.13 - 默认导入的 4 种等价写法](#22--demos13---默认导入的-4-种等价写法)
- [23. 🤔 为什么 ESM 是静态的并且具有实时绑定？](#23--为什么-esm-是静态的并且具有实时绑定)
  - [23.1. 静态分析](#231-静态分析)
  - [23.2. 实时绑定](#232-实时绑定)
- [24. 🆚 ESM vs CommonJS](#24--esm-vs-commonjs)
- [25. 🤔 与 CommonJS 互操作有哪些常见坑？](#25--与-commonjs-互操作有哪些常见坑)
  - [25.1. 默认导出与命名导出的对应关系](#251-默认导出与命名导出的对应关系)
  - [25.2. 混用 `require` 与 `import`](#252-混用-require-与-import)
  - [25.3. 值拷贝 vs 实时绑定](#253-值拷贝-vs-实时绑定)
- [26. 🤔 循环依赖与顶层 await 的行为是什么？](#26--循环依赖与顶层-await-的行为是什么)
  - [26.1. 循环依赖](#261-循环依赖)
  - [26.2. 顶层 await](#262-顶层-await)
- [27. � 引用m](#27--引用m)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- ESM 的基本语法导入导出
- 命名导出默认导出整体导入重命名导出聚合导出
- 动态导入按需加载
- 实时绑定静态分析树摇优化
- 浏览器与 NodeJS 中的使用方式
- CommonJS 互操作常见坑
- 循环依赖与顶层 await 的行为
- 目录实践与综合小练习

## 2. 🫧 评价

ESM 是前端开发必须掌握的模块化标准，在浏览器与 NodeJS 中均可原生使用。

ESM 支持静态分析与树摇优化，能够显著提升构建效果，相较于 CommonJS，ESM 具有实时绑定与更强的语法能力。

建议在所有新项目中优先使用 ESM，在旧项目中逐步迁移。

## 3. 💡 思维导图

```markmap

<<< ./assets/1.md

```

## 4. 🤔 ESM 是什么？

ESM 即 ES Module，是 JavaScript 官方的模块化标准，同时支持浏览器与 NodeJS 环境。

ESM 规范是 JS 语言内置支持的语法，使用 `import` 导入和 `export` 导出，不需要像 AMD、CMD 这些社区方案那样引入额外的包。

核心特性包括：

- 静态分析：可在编译阶段确定依赖关系，便于 Tree Shaking 优化
- 异步与按需加载：支持动态 `import()`，便于优化加载性能
- 实时绑定机制：导入的是不可变的绑定（immutable binding），与导出值保持动态引用关系
- 严格模式：顶层模块自动启用严格模式
- 模块作用域：每个模块拥有独立作用域，避免全局污染
- 单例缓存：同一模块 URL 只会被执行一次并缓存结果

## 5. 🤔 在浏览器与 NodeJS 中如何使用 ESM？

### 5.1. 浏览器

- 使用 `script` 的 `type` 属性，`type="module"`
- 模块脚本默认异步，不会阻塞页面渲染
- 相对路径必须包含文件扩展名，例如 `./utils.js`
- 模块中的变量不会污染全局，顶层 `this` 为 `undefined`

```html
<script type="module" src="./app.js"></script>
```

对比演示未开启模块化与开启模块化两种方式：

::: code-group

<<< ./demos/7/no-module.html

<<< ./demos/7/plain.js

<<< ./demos/7/with-module.html

<<< ./demos/7/module/index.js

:::

控制台测试：

- 未开启模块化，页面中输入 `a` 可以访问，说明污染了全局，不建议
- 开启模块化，页面中输入 `a` 会提示 `a is not defined`，说明模块作用域隔离，是正确的引入方式

### 5.2. NodeJS

- 在 `package.json` 中设置 `type` 为 `module`，或者使用 `.mjs` 扩展名
- 使用 `import` 与 `export` 语法进行模块化
- 对于第三方包，使用包的导出字段进行解析，例如 `exports` 与 `module` 字段

```json
{
  "type": "module"
}
```

#### 🤔 NodeJS 默认是 CJS 吗？

- 默认是 CJS，`.js` 按 CJS 解析，除非使用 `.mjs` 或设置 `type` 为 `module`
- 在 CJS 文件中不能使用静态 `import`，可以使用动态导入 `import()`
- 在 ESM 文件中不能使用 `require`，可通过 `createRequire` 加载 CJS 模块
- 在 ESM 中导入本地文件需写完整扩展名，例如 `./util.js`

示例 `.mjs` 方式启用 ESM

```js
// calc.mjs
export function add(a, b) {
  return a + b
}

// main.mjs
import { add } from './calc.mjs'
console.log(add(1, 2))
```

示例在 CJS 中使用动态导入

```js
// app.cjs 或普通 .js
async function run() {
  const m = await import('./util.mjs')
  console.log(m)
}
run()
```

示例在 ESM 中加载 CJS 模块

```js
// app.mjs 或开启了 type 为 module 的 .js
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const pkg = require('some-cjs')
console.log(pkg)
```

## 6. 🤔 ESM 的导出与导入有哪些写法？

### 6.1. 导出

- 命名导出，`export const a = 1`，`export function f(){}`
- 统一导出，`export { a, b, f }`
- 重命名导出，`export { a as x }`
- 默认导出，`export default 值或标识符`
- 聚合导出再导出，`export { a as x } from './mod.js'` 或 `export * from './mod.js'`
- 一个模块可以有多个基本导出，默认导出只能有一个
- 默认导出的等价写法，`export { 标识符 as default }`
- 基本导出与默认导出可以并存，默认导出通常承载核心功能，基本导出常用于辅助函数或常量

#### 🤔 绑定再导出怎么写与何时用？

- 写法，`export * from './mod.js'` 与 `export { 标识符 } from './mod.js'`
- 应用场景，通过目录入口文件统一组织导出接口，方便外部只写一条导入语句
- 优点，统一出口，重组并重命名接口，减少导入路径分散
- 缺点，注意命名冲突，聚合入口会使被再导出的模块在初始化阶段全部执行一次

### 6.2. 导入

- 命名导入，`import { a, f } from './mod.js'`
- 默认导入，`import x from './mod.js'`
- 混合导入，`import x, { a } from './mod.js'`
- 整体导入命名空间，`import * as ns from './mod.js'`
- 动态导入按需加载，`const m = await import('./mod.js')`
- 无绑定导入用于执行初始化代码，`import './init.js'`
- 使用 `*` 导入时必须提供命名空间标识符，例如 `as ns`
- 命名空间导入的默认导出位于 `ns.default`
- 花括号内对应具名导入，花括号外对应默认导入
- 静态导入必须是顶层语句，在执行前会被预解析与提升；动态导入可在任意位置调用，用于依赖延迟加载
- 默认导入的变量名可自行定义，不支持 `as` 别名语法；同时导入默认与具名成员可使用混合导入或 `default as`

## 7. 💻 demos.1 - 命名导出与命名导入

::: code-group

<<< ./demos/1/math.js

<<< ./demos/1/main.js

<<< ./demos/1/package.json

:::

## 8. 💻 demos.2 - 默认导出与默认导入

::: code-group

<<< ./demos/2/calculator.js

<<< ./demos/2/main.js

<<< ./demos/2/package.json

:::

## 9. 💻 demos.3 - 混合导出与混合导入

::: code-group

<<< ./demos/3/utils.js

<<< ./demos/3/main.js

<<< ./demos/3/package.json

:::

## 10. 💻 demos.4 - 重命名导出与导入

::: code-group

<<< ./demos/4/moduleA.js

<<< ./demos/4/main.js

<<< ./demos/4/package.json

:::

## 11. 💻 demos.5 - 整体导入命名空间

::: code-group

<<< ./demos/5/tools.js

<<< ./demos/5/main.js

<<< ./demos/5/package.json

:::

## 12. 💻 demos.6 - 动态导入按需加载

::: code-group

<<< ./demos/6/feature.js

<<< ./demos/6/main.js

<<< ./demos/6/package.json

:::

## 13. 💻 demos.7 - 在浏览器中使用 ESM

::: code-group

<<< ./demos/7/index.html

<<< ./demos/7/app.js

<<< ./demos/7/utils.js

:::

## 14. 💻 demos.11 - 模块缓存机制

重复导入同一个模块只会执行一次，后续导入使用缓存结果：

::: code-group

<<< ./demos/11/b.js

<<< ./demos/11/a.js

<<< ./demos/11/index.js

<<< ./demos/11/package.json

:::

## 15. 💻 demos.12 - 无绑定导入（仅执行）

当不需要使用导出的内容，只想运行一次指定脚本，可以使用无绑定导入：

::: code-group

<<< ./demos/12/polyfill.js

<<< ./demos/12/index.js

<<< ./demos/12/package.json

:::

典型应用场景：

- 全局 polyfill 注入
- 应用初始化配置
- 副作用执行（如注册全局组件）

## 16. 💻 demos.13 - 默认导入的 4 种等价写法

默认导入可以与具名导入并存，也可以通过 `default as` 或命名空间方式访问默认导出：

::: code-group

<<< ./demos/13/a.js

<<< ./demos/13/index.js

<<< ./demos/13/index-1.js

<<< ./demos/13/index-2.js

<<< ./demos/13/index-3.js

<<< ./demos/13/index-4.js

<<< ./demos/13/package.json

:::

等价写法对比：

| 写法 | 语法 | 特点 |
| --- | --- | --- |
| 分别导入 | `import { a } from './a.js'`<br>`import method from './a.js'` | 最直观，但需要两行 |
| 混合导入 | `import method, { a } from './a.js'` | 简洁，推荐使用 |
| default as | `import { default as method, a } from './a.js'` | 显式表达默认导出 |
| 命名空间 | `import * as m from './a.js'`<br>`m.default()` | 访问所有导出 |

## 17. 💻 demos.14 - 依赖预加载 vs 延迟加载

对比表格：

| 特性 | 预加载（静态导入） | 延迟加载（动态导入） |
| --- | --- | --- |
| 加载时机 | 解析阶段预先加载 | 运行时按需加载 |
| 依赖关系 | 清晰可分析，便于树摇 | 难以静态分析，更灵活 |
| 使用场景 | 基础依赖、公共工具 | 大型应用按需优化首屏 |
| 性能影响 | 初始加载时间长，执行快 | 初始加载快，按需加载慢 |
| 语法 | `import { a } from './mod.js'` | `const m = await import('./mod.js')` |

交互式演示：

::: code-group

<<< ./demos/14/index.html

<<< ./demos/14/index-static.js

<<< ./demos/14/index-dynamic.js

<<< ./demos/14/dynamicModule1.js

<<< ./demos/14/dynamicModule2.js

:::

运行结果对比：

```bash
# 静态导入（预加载）
📦 模块 1 开始加载...
✅ 模块 1 加载完成 (耗时: 2.5ms)
📦 模块 2 开始加载...
✅ 模块 2 加载完成 (耗时: 2.3ms)
💡 注意：两个模块都被加载了，即使只用到一个

# 动态导入（延迟加载）
📦 模块 1 开始加载...
✅ 模块 1 加载完成 (耗时: 2.4ms)
💡 注意：只加载了实际使用的模块，节省了资源
```

## 18. 💻 demos.15 - 绑定再导出（聚合导出）

### 18.1. 场景 1：基本用法

::: code-group

<<< ./demos/15/index.html

<<< ./demos/15/main.js

<<< ./demos/15/utils/index.js

<<< ./demos/15/utils/add.js

<<< ./demos/15/utils/constants.js

<<< ./demos/15/utils/getRandom.js

:::

### 18.2. 场景 2：命名冲突解决方案

::: code-group

<<< ./demos/15/main-conflict.js

<<< ./demos/15/utils/index-conflict.js

<<< ./demos/15/utils/conflict.js

:::

### 18.3. 场景 3：`export *` 不包含 default

::: code-group

<<< ./demos/15/main-no-default.js

<<< ./demos/15/utils/index-no-default.js

:::

::: warning ⚠️ 注意

`export * from './mod.js'` 不会导出 `default`，如需导出默认导出，必须显式使用：

```js
export { default as xxx } from './mod.js'
```

:::

### 18.4. 导入

- 命名导入，`import { a, f } from './mod.js'`
- 默认导入，`import x from './mod.js'`
- 混合导入，`import x, { a } from './mod.js'`
- 整体导入命名空间，`import * as ns from './mod.js'`
- 动态导入按需加载，`const m = await import('./mod.js')`
- 无绑定导入用于执行初始化代码，`import './init.js'`
- 使用 `*` 导入时必须提供命名空间标识符，例如 `as ns`
- 命名空间导入的默认导出位于 `ns.default`
- 花括号内对应具名导入，花括号外对应默认导入
- 静态导入必须是顶层语句，在执行前会被预解析与提升；动态导入可在任意位置调用，用于依赖延迟加载
- 默认导入的变量名可自行定义，不支持 `as` 别名语法；同时导入默认与具名成员可使用混合导入或 `default as`

## 19. 💻 demos.14 - 依赖预加载 vs 延迟加载

对比表格：

| 特性 | 预加载（静态导入） | 延迟加载（动态导入） |
| --- | --- | --- |
| 加载时机 | 解析阶段预先加载 | 运行时按需加载 |
| 依赖关系 | 清晰可分析，便于树摇 | 难以静态分析，更灵活 |
| 使用场景 | 基础依赖、公共工具 | 大型应用按需优化首屏 |
| 性能影响 | 初始加载时间长，执行快 | 初始加载快，按需加载慢 |
| 语法 | `import { a } from './mod.js'` | `const m = await import('./mod.js')` |

交互式演示：

::: code-group

<<< ./demos/14/index.html

<<< ./demos/14/index-static.js

<<< ./demos/14/index-dynamic.js

<<< ./demos/14/dynamicModule1.js

<<< ./demos/14/dynamicModule2.js

:::

运行结果对比：

```bash
# 静态导入（预加载）
📦 模块 1 开始加载...
✅ 模块 1 加载完成 (耗时: 2.5ms)
📦 模块 2 开始加载...
✅ 模块 2 加载完成 (耗时: 2.3ms)
💡 注意：两个模块都被加载了，即使只用到一个

# 动态导入（延迟加载）
📦 模块 1 开始加载...
✅ 模块 1 加载完成 (耗时: 2.4ms)
💡 注意：只加载了实际使用的模块，节省了资源
```

## 20. 💻 demos.11 - 模块缓存机制

重复导入同一个模块只会执行一次，后续导入使用缓存结果：

::: code-group

<<< ./demos/11/b.js

<<< ./demos/11/a.js

<<< ./demos/11/index.js

<<< ./demos/11/package.json

:::

## 21. 💻 demos.12 - 无绑定导入（仅执行）

当不需要使用导出的内容，只想运行一次指定脚本，可以使用无绑定导入：

::: code-group

<<< ./demos/12/polyfill.js

<<< ./demos/12/index.js

<<< ./demos/12/package.json

:::

典型应用场景：

- 全局 polyfill 注入
- 应用初始化配置
- 副作用执行（如注册全局组件）

## 22. 💻 demos.13 - 默认导入的 4 种等价写法

默认导入可以与具名导入并存，也可以通过 `default as` 或命名空间方式访问默认导出：

::: code-group

<<< ./demos/13/a.js

<<< ./demos/13/index.js

<<< ./demos/13/index-1.js

<<< ./demos/13/index-2.js

<<< ./demos/13/index-3.js

<<< ./demos/13/index-4.js

<<< ./demos/13/package.json

:::

等价写法对比：

| 写法 | 语法 | 特点 |
| --- | --- | --- |
| 分别导入 | `import { a } from './a.js'`<br>`import method from './a.js'` | 最直观，但需要两行 |
| 混合导入 | `import method, { a } from './a.js'` | 简洁，推荐使用 |
| default as | `import { default as method, a } from './a.js'` | 显式表达默认导出 |
| 命名空间 | `import * as m from './a.js'`<br>`m.default()` | 访问所有导出 |

## 23. 🤔 为什么 ESM 是静态的并且具有实时绑定？

### 23.1. 静态分析

编译阶段即可确定依赖结构，便于构建工具进行树摇优化，删除未使用的导出

### 23.2. 实时绑定

导入的是对导出绑定的引用，当导出值在模块内部发生变化，导入处能够实时反映：

```js
// counter.js
export let count = 0
export function increment() {
  count++
}

// main.js
import { count, increment } from './counter.js'

console.log(count) // 0
increment()
console.log(count) // 1 ✅ 实时反映导出模块内部的变化

// ❌ 导入的绑定是只读的，不可重新赋值
// count = 10 // TypeError: Assignment to constant variable.
```

::: warning ⚠️ 注意

导入的绑定在导入方是只读的，不可重新赋值，需要通过被导入模块提供的接口进行修改

:::

## 24. 🆚 ESM vs CommonJS

| 对比项 | ESM | CommonJS |
| --- | --- | --- |
| 加载时机 | 异步加载，支持浏览器与 NodeJS | 同步加载，主要用于 NodeJS |
| 依赖分析 | 静态分析，便于树摇优化 | 运行时解析，难以树摇 |
| 导出语义 | 实时绑定，导入的是引用 | 值拷贝，导入的是快照 |
| 顶层语义 | 自动严格模式，顶层 `this` 为 `undefined` | 顶层 `this` 指向 `exports` |
| 语法能力 | 支持聚合导出、动态导入、顶层 await | 不支持语言级动态导入、顶层 await |
| 互操作 | 可通过转换或桥接与 CJS 互操作 | 原生使用 `require` 与 `module.exports` |

## 25. 🤔 与 CommonJS 互操作有哪些常见坑？

### 25.1. 默认导出与命名导出的对应关系

某些 CommonJS 包可能不包含默认导出，使用 `import * as pkg from 'pkg'` 更稳妥：

```js
// ⚠️ 某些 CJS 包可能报错
import pkg from 'some-cjs-pkg'

// ✅ 更稳妥的写法
import * as pkg from 'some-cjs-pkg'
console.log(pkg.default) // 访问默认导出
```

### 25.2. 混用 `require` 与 `import`

在 NodeJS 中混用时，需要注意文件类型与包配置，可以通过 `createRequire` 在 ESM 中加载 CJS 模块：

```js
// app.mjs
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

// ✅ 在 ESM 中加载 CJS 模块
const lodash = require('lodash')
```

### 25.3. 值拷贝 vs 实时绑定

CommonJS 的导出是对象的值拷贝，不具备实时绑定特性，与 ESM 的导入行为不同：

```js
// counter.cjs
let count = 0
module.exports = {
  count,
  increment() {
    count++
  },
}

// main.mjs
import counter from './counter.cjs'

console.log(counter.count) // 0
counter.increment()
console.log(counter.count) // 0 ⚠️ 仍然是 0，因为是值拷贝
```

## 26. 🤔 循环依赖与顶层 await 的行为是什么？

### 26.1. 循环依赖

ESM 的静态绑定使得彼此能够引用到对方的导出，但在初始化阶段可能是未完全赋值，需要在运行时谨慎访问：

```js
// a.js
import { b } from './b.js'
export const a = 'a'
console.log('a.js:', b) // ⚠️ 可能是 undefined

// b.js
import { a } from './a.js'
export const b = 'b'
console.log('b.js:', a) // ⚠️ 可能是 undefined
```

::: warning ⚠️ 注意

循环依赖时，被引用的变量可能尚未初始化，建议通过函数延迟访问或重构模块结构来避免

:::

### 26.2. 顶层 await

顶层 await 在 ESM 中允许使用，模块初始化将变为异步，依赖方会等待其完成，这对异步初始化很有帮助：

```js
// config.js
const response = await fetch('/api/config')
export const config = await response.json()

// main.js
import { config } from './config.js'
// ✅ 此时 config 已经是完整的数据
console.log(config)
```

## 27. � 引用m

- [MDN ES Modules][1]
- [NodeJS ECMAScript Modules][2]
- [script 元素的 type 属性][3]
- [Vite 文档 ES 模块与依赖优化][4]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules
[2]: https://nodejs.org/api/esm.html
[3]: ../0111.%20script%20%E5%85%83%E7%B4%A0%E7%9A%84%20type%20%E5%B1%9E%E6%80%A7/README.md
[4]: https://vitejs.dev/guide/dep-pre-bundling
