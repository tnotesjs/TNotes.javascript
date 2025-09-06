# [0003. let 关键字](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0003.%20let%20%E5%85%B3%E9%94%AE%E5%AD%97)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 let 关键字](#3--let-关键字)
- [4. 💻 demos.1 - 块级作用域](#4--demos1---块级作用域)
- [5. 💻 demos.2 - 使用 var、let 定义 for 循环的循环变量](#5--demos2---使用-varlet-定义-for-循环的循环变量)
- [6. 💻 demos.3 - let 暂时性死区](#6--demos3---let-暂时性死区)
- [7. 💻 demos.4 - 函数参数默认值中的死区](#7--demos4---函数参数默认值中的死区)
- [8. 💻 demos.5 - 其他奇怪的报错](#8--demos5---其他奇怪的报错)
- [9. 💻 demos.6 - 同一作用域内不允许重复声明](#9--demos6---同一作用域内不允许重复声明)
- [10. 💻 demos.7 - for 循环的特别之处](#10--demos7---for-循环的特别之处)
- [11. 💻 demos.8 - let 出现之前的一些历史问题](#11--demos8---let-出现之前的一些历史问题)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 掌握 let 关键字的使用
- 认识块级作用域
- 知道暂时性死区（TDZ）是什么
- 理解笔记中提到的经典的“闭包陷阱”问题

## 2. 🫧 评价

- let 关键字的规则不多，也比较好理解。
- 在 let、const 关键字出现之前，定义变量只能使用 var 关键字，var 这玩意儿存在不少问题，有很多经典的历史问题在 let、const 出现之后都引刃而解了。

## 3. 📒 let 关键字

- **let 具有块级作用域。**
- **let 声明的变量有暂时性死区，虽然变量声明提升了，但无法在声明语句之前访问变量。**
- **不允许使用 let 重复声明同名变量。**

## 4. 💻 demos.1 - 块级作用域

::: code-group

<<< ./demos/1/1.js {}

:::

## 5. 💻 demos.2 - 使用 var、let 定义 for 循环的循环变量

::: code-group

<<< ./demos/2/1.js {}

<<< ./demos/2/2.js {}

<<< ./demos/2/3.js {}

:::

## 6. 💻 demos.3 - let 暂时性死区

::: code-group

<<< ./demos/3/1.js {}

<<< ./demos/3/2.js {}

<<< ./demos/3/3.js {}

<<< ./demos/3/4.js {}

:::

## 7. 💻 demos.4 - 函数参数默认值中的死区

::: code-group

<<< ./demos/4/1.js {}

:::

## 8. 💻 demos.5 - 其他奇怪的报错

::: code-group

<<< ./demos/5/1.js {}

:::

## 9. 💻 demos.6 - 同一作用域内不允许重复声明

::: code-group

<<< ./demos/6/1.js {}

:::

## 10. 💻 demos.7 - for 循环的特别之处

::: code-group

<<< ./demos/7/1.js {}

:::

## 11. 💻 demos.8 - let 出现之前的一些历史问题

::: code-group

<<< ./demos/8/1.html {}

:::

- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2024-12-27-14-15-51.png)
- ![img](https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/2024-12-27-14-15-58.png)

::: code-group

<<< ./demos/8/2.html {}

:::
