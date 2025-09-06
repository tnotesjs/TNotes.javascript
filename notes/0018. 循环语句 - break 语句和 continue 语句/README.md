# [0018. 循环语句 - break 语句和 continue 语句](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0018.%20%E5%BE%AA%E7%8E%AF%E8%AF%AD%E5%8F%A5%20-%20break%20%E8%AF%AD%E5%8F%A5%E5%92%8C%20continue%20%E8%AF%AD%E5%8F%A5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 break 语句和 continue 语句](#3--break-语句和-continue-语句)
- [4. 💻 demos.1 - 在 while 中使用 break](#4--demos1---在-while-中使用-break)
- [5. 💻 demos.2 - 在 for 中使用 break](#5--demos2---在-for-中使用-break)
- [6. 💻 demos.3 - 在循环中使用 continue](#6--demos3---在循环中使用-continue)
- [7. 💻 demos.4 - 多重循环 - break、continue 语句针对当前所在的循环体而言](#7--demos4---多重循环---breakcontinue-语句针对当前所在的循环体而言)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 掌握 break 语句和 continue 语句的基本使用

## 2. 🫧 评价

- break、continue 是循环中的常客，属于重点内容，必须掌握。

## 3. 📒 break 语句和 continue 语句

- `break`、`continue` 语句是比较常见的，在实际开发中也算是经常会用到的，需要掌握它们的用法。
- `break` 语句和 `continue` 语句都具有跳转作用，可以让代码不按既有的顺序执行。它们通常出现在 `for`、`while` 这样的循环体中。
  - `break`语句用于跳出代码块或循环。
  - `continue`语句用于立即终止本轮循环，返回循环结构的头部，开始下一轮循环。
- **注意**
  - 当出现多重循环嵌套的时候，需要清楚知道 `break` 语句和 `continue` 语句跳出的是当前层的循环。
  - 带参数的 `break` 语句和 `continue` 语句需要结合具体情况来判断跳到什么位置，这和标签定位符有关。（标签会在其它笔记中介绍）

## 4. 💻 demos.1 - 在 while 中使用 break

::: code-group

<<< ./demos/1/1.js {}

:::

## 5. 💻 demos.2 - 在 for 中使用 break

::: code-group

<<< ./demos/2/1.js {}

:::

## 6. 💻 demos.3 - 在循环中使用 continue

::: code-group

<<< ./demos/3/1.js {}

:::

## 7. 💻 demos.4 - 多重循环 - break、continue 语句针对当前所在的循环体而言

::: code-group

<<< ./demos/4/1.js {}

:::
