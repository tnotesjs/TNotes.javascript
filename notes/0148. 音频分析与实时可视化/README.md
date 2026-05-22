# [0148. 音频分析与实时可视化](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0148.%20%E9%9F%B3%E9%A2%91%E5%88%86%E6%9E%90%E4%B8%8E%E5%AE%9E%E6%97%B6%E5%8F%AF%E8%A7%86%E5%8C%96)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AnalyserNode 的 fftSize 为什么必须是 2 的幂次方？](#3--analysernode-的-fftsize-为什么必须是-2-的幂次方)
- [4. 🤔 frequencyBinCount 和 fftSize 之间是什么关系？](#4--frequencybincount-和-fftsize-之间是什么关系)
- [5. 🤔 getByteFrequencyData 和 getFloatFrequencyData 返回的数据有什么区别？](#5--getbytefrequencydata-和-getfloatfrequencydata-返回的数据有什么区别)
- [6. 🤔 如何使用 Canvas 绘制实时音频频谱柱状图？](#6--如何使用-canvas-绘制实时音频频谱柱状图)
- [7. 🤔 如何从 AnalyserNode 的数据中计算当前音频的整体响度？](#7--如何从-analysernode-的数据中计算当前音频的整体响度)
- [8. 🤔 smoothingTimeConstant 属性对可视化效果有什么影响？](#8--smoothingtimeconstant-属性对可视化效果有什么影响)
- [9. 🤔 如何实现一个跟随音乐节奏脉动的动画效果？](#9--如何实现一个跟随音乐节奏脉动的动画效果)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AnalyserNode 创建与配置
- fftSize 与频率分辨率
- frequencyBinCount 属性
- getByteFrequencyData() 频率数据
- getByteTimeDomainData() 时域波形
- getFloatFrequencyData() 浮点精度数据
- Canvas 绘制频谱图与波形图
- requestAnimationFrame 实时更新循环
- smoothingTimeConstant 平滑系数
- RMS 音量计算

## 2. 🫧 评价

- todo

## 3. 🤔 AnalyserNode 的 fftSize 为什么必须是 2 的幂次方？

## 4. 🤔 frequencyBinCount 和 fftSize 之间是什么关系？

## 5. 🤔 getByteFrequencyData 和 getFloatFrequencyData 返回的数据有什么区别？

## 6. 🤔 如何使用 Canvas 绘制实时音频频谱柱状图？

## 7. 🤔 如何从 AnalyserNode 的数据中计算当前音频的整体响度？

## 8. 🤔 smoothingTimeConstant 属性对可视化效果有什么影响？

## 9. 🤔 如何实现一个跟随音乐节奏脉动的动画效果？
