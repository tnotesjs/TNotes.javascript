# [0136. Stream 的队列策略详解](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0136.%20Stream%20%E7%9A%84%E9%98%9F%E5%88%97%E7%AD%96%E7%95%A5%E8%AF%A6%E8%A7%A3)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 CountQueuingStrategy 和 ByteLengthQueuingStrategy 的主要区别是什么 ？](#3--countqueuingstrategy-和-bytelengthqueuingstrategy-的主要区别是什么-)
- [4. 🤔 如何为不同类型的数据选择合适的队列策略 ？](#4--如何为不同类型的数据选择合适的队列策略-)
- [5. 🤔 自定义队列策略需要实现哪些方法 ？](#5--自定义队列策略需要实现哪些方法-)
- [6. 🤔 队列策略如何影响内存占用和性能 ？](#6--队列策略如何影响内存占用和性能-)
- [7. 💻 demos.1 - 对比两种内置队列策略的行为差异](#7--demos1---对比两种内置队列策略的行为差异)
- [8. 💻 demos.2 - 实现一个基于优先级的自定义队列策略](#8--demos2---实现一个基于优先级的自定义队列策略)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- QueuingStrategy 接口定义
- CountQueuingStrategy 的使用场景
- ByteLengthQueuingStrategy 的使用场景
- size() 函数的作用
- highWaterMark 的配置方式
- 自定义队列策略的实现

## 2. 🫧 评价

- todo

## 3. 🤔 CountQueuingStrategy 和 ByteLengthQueuingStrategy 的主要区别是什么 ？

## 4. 🤔 如何为不同类型的数据选择合适的队列策略 ？

## 5. 🤔 自定义队列策略需要实现哪些方法 ？

## 6. 🤔 队列策略如何影响内存占用和性能 ？

## 7. 💻 demos.1 - 对比两种内置队列策略的行为差异

## 8. 💻 demos.2 - 实现一个基于优先级的自定义队列策略
