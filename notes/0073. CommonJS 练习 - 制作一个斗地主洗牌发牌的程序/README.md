# [0073. CommonJS 练习 - 制作一个斗地主洗牌发牌的程序](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0073.%20CommonJS%20%E7%BB%83%E4%B9%A0%20-%20%E5%88%B6%E4%BD%9C%E4%B8%80%E4%B8%AA%E6%96%97%E5%9C%B0%E4%B8%BB%E6%B4%97%E7%89%8C%E5%8F%91%E7%89%8C%E7%9A%84%E7%A8%8B%E5%BA%8F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 划分模块](#3--划分模块)
- [4. 💻 demos.1 - 参考源码](#4--demos1---参考源码)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CommonJS 练习：模块的导入、导出

## 2. 🫧 评价

- 记录了实现该 demo 的一些源代码和实现思路。

## 3. 📒 划分模块

- 工具模块，导出一个函数，用于将一个数组中的所有内容乱序排列
- 扑克牌构造函数（类）
  - 属性
    - 花色（1 ~ 4，♣、♥、♦、♠）
    - 牌面（1 ~ 15，14 小王，15 大王）
  - 方法
    - toString：得到该扑克牌的字符串
- 入口模块（入口文件）
  - 创建 54 张扑克牌
  - 洗牌
  - 发牌

---

- 🤔 问：模块为什么要这么划分？
- 答：模块的划分并没有固定的标准，每个人写出来的可能都不一样，根据个人习惯来写就好。

## 4. 💻 demos.1 - 参考源码

::: code-group

<<< ./demos/1/index.js {} [index.js]

<<< ./demos/1/util.js {} [util.js]

<<< ./demos/1/poker.js {} [poker.js]

:::

- 运行：`node index.js`
- 最终效果：
  - ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-18-16-38-25.png)
