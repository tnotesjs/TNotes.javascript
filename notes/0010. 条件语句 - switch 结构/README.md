# [0010. 条件语句 - switch 结构](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0010.%20%E6%9D%A1%E4%BB%B6%E8%AF%AD%E5%8F%A5%20-%20switch%20%E7%BB%93%E6%9E%84)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 switch 基本结构](#3--switch-基本结构)
- [4. 💻 demos.1 - switch 中的 break 语句](#4--demos1---switch-中的-break-语句)
- [5. 💻 demos.2 - 使用表达式](#5--demos2---使用表达式)
- [6. 💻 demos.3 - 匹配规则是严格相等](#6--demos3---匹配规则是严格相等)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- switch 结构
- break 语句
- 匹配校验 - 严格相等 `===`

## 2. 🫧 评价

- JavaScript 提供 `if` 结构和 `switch` 结构，完成条件判断，即只有满足预设的条件，才会执行相应的语句。但是，相对于 `if` 语句而言，`switch` 语句是很罕见的（甚至有的公司禁止使用，可能是考虑到条件语句咋用 `if` 就完全足够了，没必要再来一个 `switch`）。

## 3. 📒 switch 基本结构

- 多个 `if...else` 连在一起使用的时候，可以转为使用 `switch` 结构。
- 通常在书写 `case` 代码块时，都在每个 `case` 代码块末尾加上 `break` 语句。
- `switch` 语句部分和 `case` 语句部分，都可以使用表达式。
- `switch` 语句后面的表达式，与 `case` 语句后面的表示式比较运行结果时，采用的是 **严格相等运算符（`===`）**，而不是相等运算符（`==`），这意味着比较时不会发生类型转换。

::: code-group

```javascript [switch 基本结构]
switch (fruit) {
  case 'banana':
    // ...
    break
  case 'apple':
    // ...
    break
  default:
  // ...
}

// 根据变量 fruit 的值，选择执行相应的 case。
// 如果所有 case 都不符合，则执行最后的 default 部分。

// 注意：
// 每个 case 代码块内部的 break 语句不能少，否则会接下去执行下一个 case 代码块，而不是跳出 switch 结构。
```

:::

## 4. 💻 demos.1 - switch 中的 break 语句

::: code-group

<<< ./demos/1/1.js {}

<<< ./demos/1/2.js {}

:::

- `1.js`
  - 在没有 break 语句的情况下得到的结果，很可能并不是你想要的。
- `2.js`
  - 正确写法应该是在每个 case 代码块末尾加上 break 语句。

## 5. 💻 demos.2 - 使用表达式

::: code-group

<<< ./demos/2/1.js {}

:::

## 6. 💻 demos.3 - 匹配规则是严格相等

::: code-group

<<< ./demos/3/1.js {}

:::
