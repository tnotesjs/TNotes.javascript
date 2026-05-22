# [0150. 滤波器、混响与音效处理链](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0150.%20%E6%BB%A4%E6%B3%A2%E5%99%A8%E3%80%81%E6%B7%B7%E5%93%8D%E4%B8%8E%E9%9F%B3%E6%95%88%E5%A4%84%E7%90%86%E9%93%BE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 BiquadFilterNode 的 Q 值对滤波器的频率响应曲线有什么影响？](#3--biquadfilternode-的-q-值对滤波器的频率响应曲线有什么影响)
- [4. 🤔 如何使用多个 BiquadFilterNode 构建一个参数均衡器（Parametric EQ）？](#4--如何使用多个-biquadfilternode-构建一个参数均衡器parametric-eq)
- [5. 🤔 ConvolverNode 的卷积混响原理是什么，为什么需要 impulse response 音频文件？](#5--convolvernode-的卷积混响原理是什么为什么需要-impulse-response-音频文件)
- [6. 🤔 如何使用 DelayNode 实现一个带反馈的回声效果？](#6--如何使用-delaynode-实现一个带反馈的回声效果)
- [7. 🤔 DynamicsCompressorNode 的 threshold、ratio、attack、release 参数分别控制什么？](#7--dynamicscompressornode-的-thresholdratioattackrelease-参数分别控制什么)
- [8. 🤔 音效处理链中节点的串联顺序对最终音质有什么影响？](#8--音效处理链中节点的串联顺序对最终音质有什么影响)
- [9. 🤔 如何将多个效果器串联构建一个吉他效果器模拟器？](#9--如何将多个效果器串联构建一个吉他效果器模拟器)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- BiquadFilterNode 与滤波器类型
- lowpass、highpass、bandpass、notch、allpass、peaking、lowshelf、highshelf
- frequency、Q、gain 参数
- AudioParam 自动化动态滤波
- ConvolverNode 与卷积混响
- impulse response（脉冲响应）
- DelayNode 与延迟效果
- 回声（Echo）与合唱（Chorus）实现
- DynamicsCompressorNode 动态压缩
- 音效处理链的串联与并联拓扑

## 2. 🫧 评价

- todo

## 3. 🤔 BiquadFilterNode 的 Q 值对滤波器的频率响应曲线有什么影响？

## 4. 🤔 如何使用多个 BiquadFilterNode 构建一个参数均衡器（Parametric EQ）？

## 5. 🤔 ConvolverNode 的卷积混响原理是什么，为什么需要 impulse response 音频文件？

## 6. 🤔 如何使用 DelayNode 实现一个带反馈的回声效果？

## 7. 🤔 DynamicsCompressorNode 的 threshold、ratio、attack、release 参数分别控制什么？

## 8. 🤔 音效处理链中节点的串联顺序对最终音质有什么影响？

## 9. 🤔 如何将多个效果器串联构建一个吉他效果器模拟器？
