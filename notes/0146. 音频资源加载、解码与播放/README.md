# [0146. 音频资源加载、解码与播放](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0146.%20%E9%9F%B3%E9%A2%91%E8%B5%84%E6%BA%90%E5%8A%A0%E8%BD%BD%E3%80%81%E8%A7%A3%E7%A0%81%E4%B8%8E%E6%92%AD%E6%94%BE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 AudioBufferSourceNode 是一次性的，播放结束后不能重新 start？](#3--为什么-audiobuffersourcenode-是一次性的播放结束后不能重新-start)
- [4. 🤔 如何使用 fetch + decodeAudioData 加载并播放一个音频文件？](#4--如何使用-fetch--decodeaudiodata-加载并播放一个音频文件)
- [5. 🤔 MediaElementAudioSourceNode 和 AudioBufferSourceNode 各适用于什么场景？](#5--mediaelementaudiosourcenode-和-audiobuffersourcenode-各适用于什么场景)
- [6. 🤔 decodeAudioData 解码失败的常见原因有哪些？](#6--decodeaudiodata-解码失败的常见原因有哪些)
- [7. 🤔 AudioBuffer 的 sampleRate 与 AudioContext 的 sampleRate 不一致会怎样？](#7--audiobuffer-的-samplerate-与-audiocontext-的-samplerate-不一致会怎样)
- [8. 🤔 如何实现音频资源的预加载和缓存以提升播放体验？](#8--如何实现音频资源的预加载和缓存以提升播放体验)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- decodeAudioData() 方法
- ArrayBuffer 与音频二进制数据
- AudioBuffer 数据结构
- AudioBufferSourceNode 一次性播放特性
- start() / stop() 方法与 offset 参数
- fetch API 加载音频文件
- MediaElementAudioSourceNode 桥接 HTMLMediaElement
- 多 AudioBuffer 管理与音频池模式
- 采样率匹配与重采样

## 2. 🫧 评价

- todo

## 3. 🤔 为什么 AudioBufferSourceNode 是一次性的，播放结束后不能重新 start？

## 4. 🤔 如何使用 fetch + decodeAudioData 加载并播放一个音频文件？

## 5. 🤔 MediaElementAudioSourceNode 和 AudioBufferSourceNode 各适用于什么场景？

## 6. 🤔 decodeAudioData 解码失败的常见原因有哪些？

## 7. 🤔 AudioBuffer 的 sampleRate 与 AudioContext 的 sampleRate 不一致会怎样？

## 8. 🤔 如何实现音频资源的预加载和缓存以提升播放体验？
