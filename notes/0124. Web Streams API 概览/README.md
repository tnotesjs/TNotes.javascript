# [0124. Web Streams API 概览](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0124.%20Web%20Streams%20API%20%E6%A6%82%E8%A7%88)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么说 Web Streams 是“响应式数据管道”的基础，而不仅是“大数据处理工具” ？](#3--为什么说-web-streams-是响应式数据管道的基础而不仅是大数据处理工具-)
- [4. 🤔 一个流被读取后为何不能再被其他 reader 使用？这与 Promise 的 once-resolution 有何异同 ？](#4--一个流被读取后为何不能再被其他-reader-使用这与-promise-的-once-resolution-有何异同-)
- [5. 🤔 如果不关注背压机制，流处理可能会导致什么实际问题 ？](#5--如果不关注背压机制流处理可能会导致什么实际问题-)
- [6. 🤔 Fetch 的 Response.body 为什么是 ReadableStream 而不是直接返回整个数据 ？](#6--fetch-的-responsebody-为什么是-readablestream-而不是直接返回整个数据-)
- [7. 🤔 Web Streams 与 RxJS / Node.js Streams 的设计理念主要差异在哪里 ？](#7--web-streams-与-rxjs--nodejs-streams-的设计理念主要差异在哪里-)
- [8. 💻 demos.1 - 对比传统 fetch().json() 与流式处理响应体](#8--demos1---对比传统-fetchjson-与流式处理响应体)
- [9. 💻 demos.2 - 用三行代码创建并消费一个自定义可读流](#9--demos2---用三行代码创建并消费一个自定义可读流)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Web Streams API 的三大核心接口
- 流式数据处理的设计理念
- 流的锁定机制与不可重用性
- 流与 Promise 的关系对比
- 背压机制的核心概念
- 流在 Web 标准中的应用场景
- 浏览器兼容性与 Polyfill 方案

## 2. 🫧 评价

- todo

## 3. 🤔 为什么说 Web Streams 是“响应式数据管道”的基础，而不仅是“大数据处理工具” ？

## 4. 🤔 一个流被读取后为何不能再被其他 reader 使用？这与 Promise 的 once-resolution 有何异同 ？

## 5. 🤔 如果不关注背压机制，流处理可能会导致什么实际问题 ？

## 6. 🤔 Fetch 的 Response.body 为什么是 ReadableStream 而不是直接返回整个数据 ？

## 7. 🤔 Web Streams 与 RxJS / Node.js Streams 的设计理念主要差异在哪里 ？

## 8. 💻 demos.1 - 对比传统 fetch().json() 与流式处理响应体

## 9. 💻 demos.2 - 用三行代码创建并消费一个自定义可读流
