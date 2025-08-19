# [0080. window.confirm](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0080.%20window.confirm)

<!-- region:toc -->

- [1. 📝 概述](#1--概述)
- [2. 🔗 mdn - window.confirm](#2--mdn---windowconfirm)
- [3. 💻 demos.1 - window.confirm()](#3--demos1---windowconfirm)

<!-- endregion:toc -->

## 1. 📝 概述

- 在 Web 开发中，如果开发者想要在特定条件下触发类似的对话框，可以使用 `window.confirm()` 方法。
- 这个方法会显示一个带有“确定”和“取消”按钮的基本对话框，并返回一个布尔值，表示用户的选择是“确定”（true）还是“取消”（false）。

## 2. 🔗 mdn - window.confirm

- https://developer.mozilla.org/zh-CN/docs/Web/API/Window/confirm

## 3. 💻 demos.1 - window.confirm()

```javascript
if (window.confirm('您确定要重新加载此网站吗？')) {
  // 用户点击了“确定”，执行重新加载操作
  location.reload()
} else {
  // 用户点击了“取消”，不做任何操作
}
```

- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2025-01-02-09-58-44.png)
