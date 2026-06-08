# [0021. 注释](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0021.%20%E6%B3%A8%E9%87%8A)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 注释是什么？有哪些类型？](#3-注释是什么有哪些类型)
  - [3.1. 注释的定义](#31-注释的定义)
  - [3.2. 注释的常见类型](#32-注释的常见类型)
  - [3.3. 文档注释](#33-文档注释)
  - [3.4. 区域注释](#34-区域注释)
- [4. demos.1 - 单行注释和多行注释](#4-demos1---单行注释和多行注释)
- [5. demos.2 - 特殊的单行注释](#5-demos2---特殊的单行注释)
- [6. demos.3 - 文档注释](#6-demos3---文档注释)
- [7. demos.4 - 区域注释](#7-demos4---区域注释)
- [8. 引用](#8-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 单行注释
- 多行注释
- 文档注释
- 区域注释

## 2. 评价

单行注释、多行注释、文档注释、区域注释，这些注释在开发中都是比较常见的，也都非常简单。

对于文档注释，笔记中只是做了一个简单的介绍，有关文档注释的语法还有很多，如有需要，可以参考 JSDoc 的官方文档。

区域注释让我们可以通过注释的形式对一个模块中的代码进行分组，对于一些大型且逻辑分组明确的模块来说，区域注释还是挺好用的，能够帮助我们更好地组织和管理代码。

## 3. 注释是什么？有哪些类型？

### 3.1. 注释的定义

源码中被 JS 引擎忽略的部分就叫做注释，它的作用是对代码进行解释。

### 3.2. 注释的常见类型

- 单行注释：`// ...`、`<!-- ...`、`--> ...`
- 多行注释：`/* ... */`
- 文档注释：以 `/**` 开头，然后每行都以 `*` 开始，最后以 `*/` 结束
- 区域注释：`// #region 区域描述`、`// #endregion 区域描述`

### 3.3. 文档注释

在多数编程语言中，文档注释有特定的格式，使得工具能够轻松识别和解析它们。

这里以在 VS Code 中书写 JS 的文档注释为例，如果要给一个函数添加文档注释，只需要在这个函数声明的前一行，输入 `/**` 后按下回车就会自动生成文档注释。然后依次按下 `tab` 键，输入一个个位置的注释信息。

文档注释示例：

```js
/**
 * 计算两个数字的和
 *
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两个数的和
 */
function add(a, b) {
  return a + b
}
// @param 标签描述了函数的参数，包括其类型和名称
// @returns 标签描述了函数的返回值
// 这些文档注释信息会被特定工具（比如 JSDoc）解析，用来自动生成详细和格式化的 API 文档
```

除了 `@param`、`@returns` 标签之外，JSDoc 还提供了许多其他标签，如 `@class`, `@constructor`, `@deprecated`, `@throws` 等，用于描述各种代码特性和行为。

文档注释是一种特殊类型的注释，它的目的不仅仅是为了在代码中添加简单的注解或描述。它通常用于描述代码的结构、功能、参数和返回值等，以方便其他开发者理解和使用该代码。

### 3.4. 区域注释

区域注释（Region Comments）是一种使代码更加可读和组织化的方式，特别是在大型代码文件中。

::: tip

这里说的“大型”不太好量化，看个人感觉来定。你可以在某个模块中的代码量需要频繁上下滚动的时候使用区域注释。

除了大型模块之外，你也可以利用区域注释来划分模块中的不同逻辑块。在编写代码时，你可以将那些你暂时不关心的 region 给折叠起来，专心处理那些你当前关心的 region。

:::

这些注释在许多代码编辑器和集成开发环境（IDEs）中都得到支持（例如 VS Code、Visual Studio 等）。通过区域注释，你可以折叠和展开特定代码块，从而更容易地导航和管理代码。

以 VS Code 为例，你可以在 VS Code 官网查看不同语言的区域注释在 VS Code 中应该如何书写：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-20-08-03-58.png)

比如在 JS/TS 使用区域注释一共有两步：

1. 区域开始：使用 `// #region 区域描述` 来标记区域的开始
2. 区域结束：使用 `// #endregion 区域描述` 来标记区域的结束

注意事项：

- `// #region` 和 `// #endregion` 要成对出现
- 开始位置和结束位置的区域描述最好能够保持一致，以便识别

## 4. demos.1 - 单行注释和多行注释

```js
// 源码中被 JS 引擎忽略的部分就叫做注释，它的作用是对代码进行解释。
// JS 提供两种注释的写法：一种是单行注释，用//起头；另一种是多行注释，放在/*和*/之间。

// 这是单行注释

/*
 这是
 多行
 注释
*/
```

## 5. demos.2 - 特殊的单行注释

```js
// 由于历史上 JS 可以兼容 HTML 代码的注释，所以<!--和-->也被视为合法的单行注释。

x = 1; <!-- x = 2;
--> x = 3;

console.log(x) // 1

// 上面代码中，只有 x = 1 会执行，其他的部分都被注释掉了。
```

1. 在 VS Code 中集成的 JS 的语法检查服务会认为该写法是错误的，会报红，被识别为语法错误。
2. 但是实际上 JS 引擎是能够正确识别这些注释的，所以程序是可以正常运行的，关于这一点你可以丢到浏览器的调试工具中运行试试。

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-31-17-11-49.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-31-17-11-57.png)

:::

需要注意：`-->` 只有在行首，才会被当成单行注释，否则会当作正常的运算。

```js
function countdown(n) {
  while (n-- > 0) console.log(n)
}
countdown(3)
// 2
// 1
// 0

// 注意：--> 只有在行首，才会被当成单行注释，否则会当作正常的运算。
// 上面代码中，n --> 0 实际上会当作 n-- > 0，因此输出 2、1、0。
```

## 6. demos.3 - 文档注释

```js
/**
 * 计算两个数字的和。
 *
 * @param {number} a - 第一个数。
 * @param {number} b - 第二个数。
 * @returns {number} 两个数的和。
 */
function add(a, b) {
  return a + b
}
```

上述这是文档注释，比如你想要生成一个接口文档，就可以使用 JSDoc 来实现。

基本流程：

- 安装 JSDoc：`npm i -g jsdoc`
- 使用 jsdoc 命令来生成文档：`jsdoc 1.js`，这个命令会生成一个 `out` 目录，里面包含生成的 HTML 文档。

::: tip

如果不想安装 jsdoc 的话，也可以直接使用 `npx jsdoc 1.js` 来快速临时体验一下。

:::

输出结果：

::: swiper

![生成产物](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-31-17-13-27.png)

![out/1.js.html](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-16-44-09.png)

![out/global.html](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-16-45-03.png)

:::

JSDoc 是可配置的，你可以使用配置文件来自定义生成的文档。创建一个 jsdoc.json 文件，并添加你需要的配置，可到 [JSDoc 官网][1] 中查看详细的配置说明。

## 7. demos.4 - 区域注释

<<< ./demos/4/1.js

在这个示例中，我们使用 `// #region` 和 `// #endregion` 来将相关的函数分组。你可以根据需要添加描述，以便更好地理解这些区域的内容。

你可以选择性地将区域给折叠起来，在 VS Code 中，区域开始位置的数字右侧会有一个符号：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-31-17-19-24.png)

点击后即可折叠：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-31-17-19-32.png)

并且，在右侧的缩略图中，你会发现区域的名字会放大显示，以便于你尽快找到对应的代码区域所在的位置。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-31-17-19-56.png)

下面是全部折叠起来之后的效果。

![图 2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-16-45-20.png)

::: tip

不同的编辑器对这玩意儿的支持会有所不同，上述介绍的仅仅是 VS Code 环境下的效果。在之前的工作中，在其它同事的开发环境（WebStorm）下看了看区域注释的折叠效果，感觉 WebStorm 对着玩意儿的支持好像确实会更好一些。

在 VS Code 中也有一些和区域注释相关的插件，比如：

- [Region Highlighter][3]，增强了 Visual Studio Code 编辑器默认的 region 功能。
- [Region Viewer][4]，可以将模块中的 region 罗列出来到独立的视图中，并支持点击不同的区域快速导航到对应的代码所在位置。

:::

## 8. 引用

- [JSDoc 官网][1]
- [VS Code 官网 - 查看不同语言的区域注释如何书写][2]
- [VS Code 插件 - Region Highlighter][3]
- [VS Code 插件 - Region Viewer][4]

[1]: https://jsdoc.app/
[2]: https://code.visualstudio.com/docs/editing/codebasics#_folding
[3]: https://marketplace.visualstudio.com/items?itemName=Wiensss.region-highlighter
[4]: https://marketplace.visualstudio.com/items?itemName=SantaCodes.santacodes-region-viewer
