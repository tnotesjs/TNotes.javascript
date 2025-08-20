# [0009. 条件语句 - if...else 结构](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0009.%20%E6%9D%A1%E4%BB%B6%E8%AF%AD%E5%8F%A5%20-%20if...else%20%E7%BB%93%E6%9E%84)

<!-- region:toc -->

- [1. 📝 概述](#1--概述)
- [2. 📒 if...else 基本结构](#2--ifelse-基本结构)
- [3. 💻 demos.2 - 认识基本的 if...else 结构](#3--demos2---认识基本的-ifelse-结构)
- [4. 💻 demos.3 - 多个 if...else 的情况](#4--demos3---多个-ifelse-的情况)
- [5. 💻 demos.1 - else 和最近的 if 配对](#5--demos1---else-和最近的-if-配对)

<!-- endregion:toc -->

## 1. 📝 概述

- 知识点：
  - 掌握 if...else 基本结构
  - 知道 if else 的配对规则
- 评价：
  - if else 的配对规则不需要刻意去记，若按照规范来书写，配对关系是自然而然就能看出来的。

## 2. 📒 if...else 基本结构

- `if` 代码块后面，还可以跟一个 `else` 代码块，表示不满足条件时，所要执行的代码。
- 对同一个变量进行多次判断时，多个 `if...else` 语句可以连写在一起。
- `else` 代码块总是与离自己最近的那个 `if` 语句配对。

::: code-group

```javascript [if...else 基本结构]
if (x === 3) {
  // 满足条件时，执行的语句
} else {
  // 不满足条件时，执行的语句
}
// 上面代码判断变量m是否等于3，如果等于就执行if代码块，否则执行else代码块。

if (x === 0) {
  // ...
} else if (x === 1) {
  // ...
} else if (x === 2) {
  // ...
} else {
  // ...
}
```

:::

## 3. 💻 demos.2 - 认识基本的 if...else 结构

::: code-group

<<< ./demos/2/1.js {}

:::

## 4. 💻 demos.3 - 多个 if...else 的情况

::: code-group

<<< ./demos/3/1.js {}

:::

## 5. 💻 demos.1 - else 和最近的 if 配对

::: code-group

<<< ./demos/1/1.js {}

<<< ./demos/1/2.js {}

:::
