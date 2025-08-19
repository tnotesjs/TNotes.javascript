# [0003. let 关键字](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0003.%20let%20%E5%85%B3%E9%94%AE%E5%AD%97)

<!-- region:toc -->

- [1. 📝 概述](#1--概述)
- [2. 📒 let 关键字](#2--let-关键字)
- [3. 💻 demos.1 - 块级作用域](#3--demos1---块级作用域)
- [4. 💻 demos.2 - 使用 var、let 定义 for 循环的循环变量](#4--demos2---使用-varlet-定义-for-循环的循环变量)
- [5. 💻 demos.3 - let 暂时性死区](#5--demos3---let-暂时性死区)
- [6. 💻 demos.4 - 函数参数默认值中的死区](#6--demos4---函数参数默认值中的死区)
- [7. 💻 demos.5 - 其他奇怪的报错](#7--demos5---其他奇怪的报错)
- [8. 💻 demos.6 - 同一作用域内不允许重复声明](#8--demos6---同一作用域内不允许重复声明)
- [9. 💻 demos.7 - for 循环的特别之处](#9--demos7---for-循环的特别之处)
- [10. 💻 demos.8 - let 出现之前的一些历史问题](#10--demos8---let-出现之前的一些历史问题)

<!-- endregion:toc -->

## 1. 📝 概述

- 知识点：
  - let 关键字
  - 块级作用域
  - 暂时性死区（TDZ）
  - 经典的“闭包陷阱”问题
- 评价：
  - let 关键字的规则不多，也比较好理解。
  - 在 let、const 关键字出现之前，定义变量只能使用 var 关键字，var 这玩意儿存在不少问题，有很多经典的历史问题在 let、const 出现之后都引刃而解了。

## 2. 📒 let 关键字

- **let 具有块级作用域。**
- **let 声明的变量有暂时性死区，虽然变量声明提升了，但无法在声明语句之前访问变量。**
- **不允许使用 let 重复声明同名变量。**

## 3. 💻 demos.1 - 块级作用域

::: code-group

<<< ./demos/1/1.js {}

:::

## 4. 💻 demos.2 - 使用 var、let 定义 for 循环的循环变量

::: code-group

<<< ./demos/2/1.js {}

<<< ./demos/2/2.js {}

<<< ./demos/2/3.js {}

:::

## 5. 💻 demos.3 - let 暂时性死区

::: code-group

<<< ./demos/3/1.js {}

<<< ./demos/3/2.js {}

<<< ./demos/3/3.js {}

<<< ./demos/3/4.js {}

:::

## 6. 💻 demos.4 - 函数参数默认值中的死区

::: code-group

<<< ./demos/4/1.js {}

:::

## 7. 💻 demos.5 - 其他奇怪的报错

::: code-group

<<< ./demos/5/1.js {}

:::

## 8. 💻 demos.6 - 同一作用域内不允许重复声明

::: code-group

<<< ./demos/6/1.js {}

:::

## 9. 💻 demos.7 - for 循环的特别之处

::: code-group

<<< ./demos/7/1.js {}

:::

## 10. 💻 demos.8 - let 出现之前的一些历史问题

::: code-group

<<< ./demos/8/1.html {}

:::

- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2024-12-27-14-15-51.png)
- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2024-12-27-14-15-58.png)

::: code-group

<<< ./demos/8/2.html {}

:::
