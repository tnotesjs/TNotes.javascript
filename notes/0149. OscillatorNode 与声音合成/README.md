# [0149. OscillatorNode 与声音合成](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0149.%20OscillatorNode%20%E4%B8%8E%E5%A3%B0%E9%9F%B3%E5%90%88%E6%88%90)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 OscillatorNode 的四种内置波形分别模拟什么样的音色特征？](#3--oscillatornode-的四种内置波形分别模拟什么样的音色特征)
- [4. 🤔 如何使用 OscillatorNode 演奏一个指定 MIDI 音符编号对应的音高？](#4--如何使用-oscillatornode-演奏一个指定-midi-音符编号对应的音高)
- [5. 🤔 PeriodicWave 是如何通过傅里叶系数定义自定义波形的？](#5--periodicwave-是如何通过傅里叶系数定义自定义波形的)
- [6. 🤔 如何用 GainNode 实现 ADSR 包络来模拟钢琴的音色衰减？](#6--如何用-gainnode-实现-adsr-包络来模拟钢琴的音色衰减)
- [7. 🤔 detune 属性的单位是什么，如何用它实现微分音演奏？](#7--detune-属性的单位是什么如何用它实现微分音演奏)
- [8. 🤔 如何使用多个 OscillatorNode 同时发声来合成一个和弦？](#8--如何使用多个-oscillatornode-同时发声来合成一个和弦)
- [9. 🤔 如何使用 AudioBuffer 生成白噪声并用滤波器将其变为粉噪声？](#9--如何使用-audiobuffer-生成白噪声并用滤波器将其变为粉噪声)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- OscillatorNode 创建与 type 属性
- sine、square、sawtooth、triangle 波形
- frequency AudioParam 与音高控制
- detune AudioParam 与微调（cent）
- PeriodicWave 自定义波形
- ADSR 包络概念
- 使用 GainNode 模拟 ADSR 包络
- 音符频率对照（MIDI note number → frequency）
- 多振荡器叠加与和弦
- AudioBuffer 生成白噪声

## 2. 🫧 评价

- todo

## 3. 🤔 OscillatorNode 的四种内置波形分别模拟什么样的音色特征？

## 4. 🤔 如何使用 OscillatorNode 演奏一个指定 MIDI 音符编号对应的音高？

## 5. 🤔 PeriodicWave 是如何通过傅里叶系数定义自定义波形的？

## 6. 🤔 如何用 GainNode 实现 ADSR 包络来模拟钢琴的音色衰减？

## 7. 🤔 detune 属性的单位是什么，如何用它实现微分音演奏？

## 8. 🤔 如何使用多个 OscillatorNode 同时发声来合成一个和弦？

## 9. 🤔 如何使用 AudioBuffer 生成白噪声并用滤波器将其变为粉噪声？
