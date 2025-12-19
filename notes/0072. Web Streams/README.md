# [0072. Web Streams](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0072.%20Web%20Streams)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🔍 章节内容速查](#3--章节内容速查)
- [4. 🔍 学习路线](#4--学习路线)
- [5. 🔗 引用](#5--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Web Streams 章节速览

## 2. 🫧 评价

在工作中经常需要通过 Web Serial API、Web USB API、Web Bluetooth API 与底层嵌入式设备通信，这里面涉及到不少流操作，因此记录这篇笔记来梳理和 Web Streams 相关的内容。

笔记中记录的大部分内容主要来自 MDN 上的 Web Streams 相关文档。

## 3. 🔍 章节内容速查

<N :ids="['0073', '0125', '0140', '0130', '0133', '0136', '0135', '0131', '0132', '0134', '0138', '0137', '0139']" />

## 4. 🔍 学习路线

- 基础概念：先建立整体认知，再看 API 全貌
  - Web Streams 核心概念
  - Web Streams API 概览
- 核心 API：掌握三大核心 API，为后续机制和实战打基础
  - ReadableStream
  - WritableStream 与 TransformStream
  - BYOB Reader 与零拷贝读取
- 核心机制：理解底层机制，先背压再队列再字节流，逻辑递进
  - 背压机制（Backpressure）
  - Stream 的队列策略详解
  - 字节流（Byte Streams）vs 普通流
- 操作与集成：学会组合使用，处理常见场景
  - Stream 管道操作与组合模式
  - Fetch API 与 Web Streams 集成
  - Stream 的错误处理与取消机制
- 实战与优化：最后是综合应用和优化技巧
  - Stream 的实战应用场景
  - Stream 性能优化与最佳实践
  - Stream 与其他 API 的集成

## 5. 🔗 引用

汇总 Web Streams 章节中的相关参考资料：

- [JSONPlaceholder - 免费的在线 REST API 是笔记中用于测试的 API][5]
- [Github - rxjs][6]
- [MDN - Streams API][4]
- [MDN - ReadableStream][1]
- [MDN - WritableStream][2]
- [MDN - TransformStream][3]
- [MDN - dom-examples/streams][7]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[2]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
[3]: https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
[5]: https://jsonplaceholder.typicode.com/
[6]: https://github.com/ReactiveX/rxjs
[7]: https://github.com/mdn/dom-examples/tree/main/streams
