# [0152. AudioWorklet 自定义音频处理器](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0152.%20AudioWorklet%20%E8%87%AA%E5%AE%9A%E4%B9%89%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AudioWorklet 相比已废弃的 ScriptProcessorNode 在架构上有什么根本性优势？](#3--audioworklet-相比已废弃的-scriptprocessornode-在架构上有什么根本性优势)
- [4. 🤔 AudioWorkletProcessor 的 process() 方法接收的三个参数分别是什么？](#4--audioworkletprocessor-的-process-方法接收的三个参数分别是什么)
- [5. 🤔 process() 方法返回 false 会触发什么行为？](#5--process-方法返回-false-会触发什么行为)
- [6. 🤔 如何在 AudioWorkletProcessor 和主线程之间通过 port 传递自定义消息？](#6--如何在-audioworkletprocessor-和主线程之间通过-port-传递自定义消息)
- [7. 🤔 AudioWorklet 运行在哪个线程上，这对音频处理的实时性有什么意义？](#7--audioworklet-运行在哪个线程上这对音频处理的实时性有什么意义)
- [8. 🤔 如何在 AudioWorklet 中实现一个自定义的音量增益效果器？](#8--如何在-audioworklet-中实现一个自定义的音量增益效果器)
- [9. 🤔 AudioWorklet 不支持 DOM 访问，遇到需要获取 DOM 状态的场景应如何处理？](#9--audioworklet-不支持-dom-访问遇到需要获取-dom-状态的场景应如何处理)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AudioWorklet 替代 ScriptProcessorNode 的背景
- AudioWorkletNode 主线程端
- AudioWorkletProcessor 工作线程端
- registerProcessor() 注册处理器
- process() 方法与音频块回调
- MessagePort 双向消息通信
- AudioWorkletNode.port.postMessage()
- AudioParam 在 AudioWorklet 中的使用
- SharedArrayBuffer 共享内存
- 实时音频处理性能与限制

## 2. 🫧 评价

- todo

## 3. 🤔 AudioWorklet 相比已废弃的 ScriptProcessorNode 在架构上有什么根本性优势？

## 4. 🤔 AudioWorkletProcessor 的 process() 方法接收的三个参数分别是什么？

## 5. 🤔 process() 方法返回 false 会触发什么行为？

## 6. 🤔 如何在 AudioWorkletProcessor 和主线程之间通过 port 传递自定义消息？

## 7. 🤔 AudioWorklet 运行在哪个线程上，这对音频处理的实时性有什么意义？

## 8. 🤔 如何在 AudioWorklet 中实现一个自定义的音量增益效果器？

## 9. 🤔 AudioWorklet 不支持 DOM 访问，遇到需要获取 DOM 状态的场景应如何处理？
