# [0006. 常见的两个 JS 运行环境：浏览器、NodeJS](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0006.%20%E5%B8%B8%E8%A7%81%E7%9A%84%E4%B8%A4%E4%B8%AA%20JS%20%E8%BF%90%E8%A1%8C%E7%8E%AF%E5%A2%83%EF%BC%9A%E6%B5%8F%E8%A7%88%E5%99%A8%E3%80%81NodeJS)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 💻 demos.1 - 用浏览器来执行 JS 程序的基本流程](#3--demos1---用浏览器来执行-js-程序的基本流程)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 学会使用浏览器环境运行 JS
- 学会使用 NodeJS 环境运行 JS

## 2. 🫧 评价

- 在开始学习 JS 的内容之前，首先需要知道如何运行 JS 代码。
- 这个知识库主要介绍的是 html-css-js 相关的内容，因此运行环境主要是浏览器环境而非 node 环境，这篇笔记将介绍如何使用浏览器跑 JS 程序。
- 在 nodejs 的学习笔记中，会介绍如何使用 nodejs 来执行 JS 程序（其实非常简单，安装好 nodejs，然后使用 node 命令 👉 `node xxx.js` 就可以执行 `xxx.js` 了。）

## 3. 💻 demos.1 - 用浏览器来执行 JS 程序的基本流程

1. 安装好浏览器（推荐 Chrome 浏览器）
2. 打开调试工具
3. 将代码丢到调试工具中，按下回车即可。

---

- 只要电脑安装了浏览器，就可以用来运行了。你可以一边读一边运行示例，加深理解。推荐安装 Chrome 浏览器，它的“开发者工具”（Developer Tools）里面的“控制台”（console），就是运行 JavaScript 代码的理想环境。
- **🤔 如何打开 Chrome 控制台？**
  - 进入 Chrome 浏览器的“控制台”，有两种常见的方法：
  - 直接进入：按下`Option + Command + J`（Mac）或者`Ctrl + Shift + J`（Windows / Linux）
  - 开发者工具进入：开发者工具的快捷键是 F12，或者`Option + Command + I`（Mac）以及`Ctrl + Shift + I`（Windows / Linux），然后选择 Console 面板
- **注意：** `Enter` 和 `Shift + Enter`
  - 进入控制台以后，就可以在提示符后输入代码，然后按 `Enter` 键，代码就会执行。
  - 如果按 `Shift + Enter` 键，就是代码换行，不会触发执行。
  - 在阅读笔记时，很多代码片段都可以直接复制到控制台进行实验。
- **测试**
  - 作为尝试，你可以将下面的程序复制到“控制台”，按下回车后，就可以看到运行结果。

::: code-group

<<< ./demos/1/1.js {}

:::

- **补充：关于 chrome 控制台禁止粘贴的问题**
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-16-43-31.png)
  - Warning: Don’t paste code into the DevTools Console that you don’t understand or haven’t reviewed yourself. This could allow attackers to steal your identity or take control of your computer. Please type ‘allow pasting’ below to allow pasting.
  - 中文如下：
  - 警告：不要在开发者工具控制台中粘贴您不了解或没有自行审查过的代码。这可能会允许攻击者窃取您的身份或控制您的计算机。请在下面输入 `allow pasting` 以允许粘贴。
- 如果你在粘贴代码时出现了上述警告信息，那么你只需要根据提示将指定的内容 `allow pasting` 给输入一下，就可以继续粘贴了。
