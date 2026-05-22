# [0147. 音量控制、声像定位与空间音频](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0147.%20%E9%9F%B3%E9%87%8F%E6%8E%A7%E5%88%B6%E3%80%81%E5%A3%B0%E5%83%8F%E5%AE%9A%E4%BD%8D%E4%B8%8E%E7%A9%BA%E9%97%B4%E9%9F%B3%E9%A2%91)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 GainNode 的 gain 属性为什么是 AudioParam 而不是普通数值类型？](#3--gainnode-的-gain-属性为什么是-audioparam-而不是普通数值类型)
- [4. 🤔 如何使用 AudioParam 的时间调度方法实现音频淡入淡出效果？](#4--如何使用-audioparam-的时间调度方法实现音频淡入淡出效果)
- [5. 🤔 PannerNode 的 HRTF 和 equalpower 模式有什么区别？](#5--pannernode-的-hrtf-和-equalpower-模式有什么区别)
- [6. 🤔 如何实现一个简单的音频混音器并分别控制各路音量？](#6--如何实现一个简单的音频混音器并分别控制各路音量)
- [7. 🤔 StereoPannerNode 和 PannerNode 有什么区别，应该如何选择？](#7--stereopannernode-和-pannernode-有什么区别应该如何选择)
- [8. 🤔 ChannelSplitterNode 和 ChannelMergerNode 的典型使用场景是什么？](#8--channelsplitternode-和-channelmergernode-的典型使用场景是什么)
- [9. 🤔 如何模拟声音随距离变化而衰减的效果？](#9--如何模拟声音随距离变化而衰减的效果)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- GainNode 与 gain AudioParam
- AudioParam 时间调度方法（setValueAtTime、linearRampToValueAtTime 等）
- 淡入（Fade In）淡出（Fade Out）实现
- PannerNode 与 3D 空间声像
- panningModel（HRTF、equalpower）
- distanceModel 与距离衰减
- StereoPannerNode 简化立体声控制
- ChannelSplitterNode 与 ChannelMergerNode
- 多路音频混音

## 2. 🫧 评价

- todo

## 3. 🤔 GainNode 的 gain 属性为什么是 AudioParam 而不是普通数值类型？

## 4. 🤔 如何使用 AudioParam 的时间调度方法实现音频淡入淡出效果？

## 5. 🤔 PannerNode 的 HRTF 和 equalpower 模式有什么区别？

## 6. 🤔 如何实现一个简单的音频混音器并分别控制各路音量？

## 7. 🤔 StereoPannerNode 和 PannerNode 有什么区别，应该如何选择？

## 8. 🤔 ChannelSplitterNode 和 ChannelMergerNode 的典型使用场景是什么？

## 9. 🤔 如何模拟声音随距离变化而衰减的效果？
