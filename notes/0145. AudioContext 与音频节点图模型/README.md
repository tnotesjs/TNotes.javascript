# [0145. AudioContext 与音频节点图模型](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0145.%20AudioContext%20%E4%B8%8E%E9%9F%B3%E9%A2%91%E8%8A%82%E7%82%B9%E5%9B%BE%E6%A8%A1%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AudioContext 为什么必须在用户交互事件中创建或恢复？](#3--audiocontext-为什么必须在用户交互事件中创建或恢复)
- [4. 🤔 connect() 方法的调用顺序对音频处理有影响吗？](#4--connect-方法的调用顺序对音频处理有影响吗)
- [5. 🤔 AudioContext 的状态有哪些，如何从 suspended 切换到 running？](#5--audiocontext-的状态有哪些如何从-suspended-切换到-running)
- [6. 🤔 OfflineAudioContext 和普通 AudioContext 有什么区别，适用于什么场景？](#6--offlineaudiocontext-和普通-audiocontext-有什么区别适用于什么场景)
- [7. 🤔 音频图中一个节点可以同时连接多个下游节点吗？](#7--音频图中一个节点可以同时连接多个下游节点吗)
- [8. 🤔 如何正确销毁一个 AudioContext 以释放系统资源？](#8--如何正确销毁一个-audiocontext-以释放系统资源)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AudioContext 创建与生命周期
- suspended、running、closed 状态
- resume() / suspend() / close() 状态切换
- AudioNode 接口与节点类型分类
- 音频图（Audio Graph）概念
- connect() 与 disconnect() 节点连接
- 输入节点、输出节点与处理节点
- OfflineAudioContext 离线渲染
- 浏览器自动播放策略与用户手势要求
- currentTime 只读时钟与 sampleRate

## 2. 🫧 评价

- todo

## 3. 🤔 AudioContext 为什么必须在用户交互事件中创建或恢复？

## 4. 🤔 connect() 方法的调用顺序对音频处理有影响吗？

## 5. 🤔 AudioContext 的状态有哪些，如何从 suspended 切换到 running？

## 6. 🤔 OfflineAudioContext 和普通 AudioContext 有什么区别，适用于什么场景？

## 7. 🤔 音频图中一个节点可以同时连接多个下游节点吗？

## 8. 🤔 如何正确销毁一个 AudioContext 以释放系统资源？
