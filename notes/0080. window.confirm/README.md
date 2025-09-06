# [0080. window.confirm](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0080.%20window.confirm)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 `window.confirm()`](#3--windowconfirm)
- [4. 💻 demos.1 - 使用 `window.confirm()` 弹出确认提示框](#4--demos1---使用-windowconfirm-弹出确认提示框)
- [5. 💻 demos.2 - 自定义 confirm 效果](#5--demos2---自定义-confirm-效果)
- [6. 🔗 References](#6--references)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `window.confirm()`

## 2. 🫧 评价

- 很简单的一个 API，类似 `window.alert()`，两者的区别是 `window.alert()` 是一个 `void` 类型的函数，而 `window.confirm()` 返回一个 `boolean` 类型的值。
- 实际开发中 confirm 提示框大多是直接使用 UI 组件库中封装好的 confirm 组件，或者自行封装，比如 `demos.2`。
- demos 概述
  - `demos.1` - 介绍 window.confirm 的基本使用
  - `demos.2` - 自行封装了一个简单的 confirm 组件

## 3. 📒 `window.confirm()`

- `window.confirm()` 就是用来弹出一个提示框的，并会返回一个布尔值。
  - 如果用户点击了确定，返回 `true`
  - 如果用户点击了取消，返回 `false`
- 弹出对话框时，会暂停脚本执行，直到用户点击了确定或者取消。
- 使用 `window.confirm` 可以弹出一个确认提示框，但是无法自定义 UI。如果有修改 UI 的需求，可以考虑使用第三方库，或者自行编写一个简单的 confirm 组件来实现，比如 `demos.2`。

## 4. 💻 demos.1 - 使用 `window.confirm()` 弹出确认提示框

::: code-group

<<< ./demos/1/1.js {}

<<< ./demos/1/1.html {}

:::

- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2025-01-02-09-58-44.png)

## 5. 💻 demos.2 - 自定义 confirm 效果

::: code-group

<<< ./demos/2/1.html {7,12,14-28}

<<< ./demos/2/1.js {}

<<< ./demos/2/1.css {}

:::

- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2025-09-03-21-53-50.png)

## 6. 🔗 References

- [mdn - window.confirm][1]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/confirm
