# [0143. 音频处理](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0143.%20%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如果想要深入学习 Web Audio 都有哪些推荐的学习资料？应该怎么学？](#3--如果想要深入学习-web-audio-都有哪些推荐的学习资料应该怎么学)
  - [3.1. 学习资料](#31-学习资料)
  - [3.2. 推荐的学习路线](#32-推荐的学习路线)
- [4. 🔗 引用](#4--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- todo

## 2. 🫧 评价

- todo

## 3. 🤔 如果想要深入学习 Web Audio 都有哪些推荐的学习资料？应该怎么学？

### 3.1. 学习资料

| 学习资料 | 描述 |
| --- | --- |
| [MDN Web Audio API 文档][1] | MDN 的文档是最权威的入门参考，涵盖了 AudioContext、OscillatorNode、GainNode、AnalyserNode 等所有核心概念，每个 API 都有可运行的示例。 |
| [Audio Visualization with Web Audio API][3] | MDN 上的专题教程 - 音频可视化 => 学习 `AnalyserNode` 的 `getByteFrequencyData` / `getFloatTimeDomainData`，配合 Canvas 或 WebGL 做频谱、波形可视化。 |
| [Web audio spatialization basics][8] | MDN 上的专题教程 - 空间音频 => 学习 `PannerNode` 和 `AudioListener`，实现 3D 空间音频效果，适合游戏和 VR 场景。 |
| [W3C Web Audio API 规范][2] | 如果你想了解底层设计意图和完整的接口定义，规范本身值得一读。 |
| [O'Reilly® Web Audio API - Boris Smus][4] | 这是 Web Audio 领域最经典的书籍，作者是 Google Chrome 团队的工程师。虽然是 2013 年出版的，核心概念（AudioContext、节点图、音频路由）至今未变。网上能找到免费的在线版本。 |
| [Web Audio School（GitHub 项目）][5] | 一个交互式的教程，通过一个个小练习带你从零构建音频节点图，非常适合动手学习。 |
| ["The ABC of Web Audio" — Chris Lowis][6] | 音频合成与 DSP，作者的博客中记录了一系列文章，从基础振荡器到 FM 合成、采样器，讲解清晰。 |
| [chrome for developer blog][7] | Google Chrome 团队的博客经常发布与 Web Audio 相关的技术文章，搜索 AudioWorklet。AudioWorklet（音频工作线程）取代了旧的 ScriptProcessorNode，允许你在独立的音频渲染线程中运行自定义 DSP 代码，是做高性能音频处理的关键。 |
| [github -- tonal.js][9] | 最流行的 Web Audio 高级封装库，源码质量极高，适合学习如何抽象底层 API，实现合成器、效果器、调度器等功能。 |
| [Chrome Music Lab][10] | Google 的音乐实验项目，多个小应用的源码都公开，涵盖了从简单的节奏器到复杂的合成器和可视化工具，非常适合学习实战项目。 |

### 3.2. 推荐的学习路线

```
1. MDN 文档通读核心概念（AudioContext、Node、连接方式）
2. 用 OscillatorNode + GainNode 做一个简单的音量可控的合成器
3. 加入 AnalyserNode 做频谱可视化（Canvas 绘制）
4. 学习加载外部音频文件（AudioBuffer、decodeAudioData）
5. 尝试 AudioWorklet 写自定义效果器
6. 阅读 Tone.js 源码，理解高级抽象的设计思路
7. 做一个完整的项目（音乐播放器、合成器、可视化器）
```

## 4. 🔗 引用

- [MDN Web Audio API 文档][1]
- [W3C Web Audio API 规范][2]
- [Audio Visualization with Web Audio API][3]
- [freecomputerbooks.com -- O'Reilly® Web Audio API - Boris Smus][4]
- [Web Audio School（GitHub 项目）][5]
- ["The ABC of Web Audio" — Chris Lowis][6]
- [chrome for developer blog][7]
- [Web audio spatialization basics][8]
- [github -- tonal.js][9]
- [Chrome Music Lab][10]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Web_API
[2]: https://www.w3.org/TR/webaudio/
[3]: https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
[4]: https://freecomputerbooks.com/Web-Audio-API.html
[5]: https://github.com/mmckegg/web-audio-school
[6]: https://blog.chrislowis.co.uk/
[7]: https://developer.chrome.com/blog/
[8]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics
[9]: https://github.com/tonejs/tone.js/
[10]: https://github.com/googlecreativelab/chrome-music-lab
