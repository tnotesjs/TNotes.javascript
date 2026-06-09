# [0212. Web Audio API - 结语](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0212.%20Web%20Audio%20API%20-%20%E7%BB%93%E8%AF%AD)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 这本书最终讲清了哪些主线？](#3-这本书最终讲清了哪些主线)
- [4. 学习 Web Audio API 可以按什么顺序推进？](#4-学习-web-audio-api-可以按什么顺序推进)
- [5. 书里的哪些 API 名称需要用现代口径理解？](#5-书里的哪些-api-名称需要用现代口径理解)
- [6. 术语表里哪些概念最值得记住？](#6-术语表里哪些概念最值得记住)
- [7. Web Audio API 实践中最容易踩哪些坑？](#7-web-audio-api-实践中最容易踩哪些坑)
- [8. 后续还可以继续学什么？](#8-后续还可以继续学什么)
- [9. 这组笔记应该如何回看？](#9-这组笔记应该如何回看)

<!-- endregion:toc -->

## 1. 本节内容

- 回顾《Web Audio API》这本书覆盖的核心能力。
- 梳理 Web Audio API 的学习路径：播放、调度、音量、频域、分析、高级处理和技术集成。
- 了解旧版 API 名称和现代 API 名称的对应关系。
- 理解 `ScriptProcessorNode`、旧浏览器前缀和枚举常量写法的过时风险。
- 整理术语表中的核心概念：`AudioContext`、`AudioNode`、`AudioBuffer`、`AudioParam`、PCM、FFT、dBFS、Nyquist frequency 等。
- 建立后续继续学习 Web Audio API 和数字音频的方向。

## 2. 评价

- 这篇总结最重要的作用是把分散知识重新串起来：Web Audio API 不是一组孤立接口，而是一套围绕音频图、时间轴和信号处理搭建的系统。旧书值得读，但实践时必须带着现代浏览器 API 口径校正。

## 3. 这本书最终讲清了哪些主线？

《Web Audio API》这本书不是完整规范手册，而是给 Web 开发者建立音频编程入门图景。它的主线可以概括为：

1. 用 `AudioContext` 和 `AudioNode` 建立音频图。
2. 用 `AudioBufferSourceNode`、`OscillatorNode` 等节点产生声音。
3. 用 `currentTime` 和 `AudioParam` 在音频时间轴上精确调度。
4. 用 `GainNode`、`BiquadFilterNode`、`ConvolverNode`、`DynamicsCompressorNode` 等节点处理声音。
5. 用 `AnalyserNode` 观察声音，做频域和时域可视化。
6. 用 `PannerNode` 和 `AudioListener` 表达空间位置。
7. 把 `<audio>`、麦克风、WebRTC 和页面状态接入工程实践。

这些内容共同指向一个核心模型：声音以信号流的形式穿过一张可编程的图。你不是简单调用“播放”按钮，而是在设计一条音频处理管线。

## 4. 学习 Web Audio API 可以按什么顺序推进？

如果你是从 JavaScript 开发者的角度入门，可以按下面的顺序学习：

| 阶段 | 目标 |
| --- | --- |
| 基础播放 | 创建 `AudioContext`，加载音频，解码成 `AudioBuffer`，创建 source 播放。 |
| 音频图 | 理解节点连接、断开、分支、汇总和主输出。 |
| 时间控制 | 使用 `currentTime`、`start()`、`stop()` 和短窗口调度器。 |
| 参数自动化 | 使用 `AudioParam`、淡入淡出、渐变曲线和 LFO。 |
| 混音控制 | 使用 `GainNode`、主增益、分组音量、削波检测和压缩。 |
| 频域理解 | 理解音高、频率、FFT、泛音和噪声。 |
| 分析可视化 | 使用 `AnalyserNode` 读取时域和频域数据。 |
| 高级处理 | 学习滤波、混响、程序化音效、空间化和 AudioWorklet。 |
| 工程集成 | 处理 `<audio>`、麦克风、WebRTC、页面可见性、自动播放和资源释放。 |

这个顺序的好处是，每一步都能写出可运行的小例子，不会一开始就陷入复杂 DSP。

## 5. 书里的哪些 API 名称需要用现代口径理解？

这本书写作较早，Web Audio API 当时仍在演进。阅读旧资料时，最容易遇到的问题是 API 名称变化。

| 旧写法                   | 现代写法                                      |
| ------------------------ | --------------------------------------------- |
| `noteOn()`               | `start()`                                     |
| `noteOff()`              | `stop()`                                      |
| `noteGrainOn()`          | `start()` 配合 offset 和 duration。           |
| `createGainNode()`       | `createGain()`                                |
| `createDelayNode()`      | `createDelay()`                               |
| `createJavaScriptNode()` | `createScriptProcessor()`，但该节点也已废弃。 |
| `setTargetValueAtTime()` | `setTargetAtTime()`                           |
| `filter.LOWPASS`         | `'lowpass'`                                   |
| `oscillator.SINE`        | `'sine'`                                      |

还有一些历史写法也要留意：

- 早期示例常用 `webkitAudioContext`，现代浏览器优先使用 `AudioContext`。
- 早期示例可能使用 `context.currentTimeMillis`，现代 Web Audio API 使用 `context.currentTime`。
- `ScriptProcessorNode` 已废弃，自定义 DSP 应优先考虑 `AudioWorklet`。
- 现代浏览器有自动播放策略，不能假设页面加载后可以直接发声。

读旧代码时不要急着照抄，先把接口名和浏览器策略更新到当前环境。

## 6. 术语表里哪些概念最值得记住？

下面这些术语几乎贯穿整个 Web Audio API。

| 术语              | 含义                                                  |
| ----------------- | ----------------------------------------------------- |
| `AudioContext`    | 音频图的容器，提供时间轴、节点创建和输出目标。        |
| `AudioNode`       | 音频图中的节点，负责产生、处理、分析或输出声音。      |
| `AudioBuffer`     | 内存中的音频数据，通常包含一个或多个声道的 PCM 样本。 |
| `AudioParam`      | 可被精确调度和自动化的音频参数。                      |
| sample rate       | 采样率，每秒采集多少个音频样本。                      |
| bit depth         | 位深，每个样本使用多少位表示。                        |
| bit rate          | 码率，压缩音频每秒需要多少比特。                      |
| PCM               | 脉冲编码调制，把声音表示成数字样本数组。              |
| dBFS              | 相对于数字满刻度的电平，最大值是 `0dBFS`。            |
| clipping          | 削波，信号超过允许范围后被截断。                      |
| FFT               | 快速傅里叶变换，用于把时域信号转换到频域。            |
| Nyquist frequency | 奈奎斯特频率，等于采样率的一半。                      |
| cents             | 音高偏移单位，`100` cents 是一个半音。                |
| playback rate     | 音频缓冲区播放速度，会同时影响音高和时长。            |

如果只记一句话：`AudioContext` 管时间和节点，`AudioNode` 组成图，`AudioParam` 让参数在音频时间轴上变化，`AudioBuffer` 保存声音数据。

## 7. Web Audio API 实践中最容易踩哪些坑？

常见问题集中在状态、时间和资源管理上。

| 问题 | 说明 |
| --- | --- |
| source 不能复用 | `AudioBufferSourceNode` 调用 `start()` 后就是一次性的，重复播放要创建新 source。 |
| 播放不是立即可用 | 音频文件加载和解码是异步的，精确播放前要预加载。 |
| 时间单位容易写错 | Web Audio API 的时间是秒，不是毫秒。 |
| JS 定时器不精确 | 节拍、淡入淡出和参数变化应尽量使用音频时间轴。 |
| 自动播放被拦截 | 首次播放通常需要用户手势和 `audioContext.resume()`。 |
| 混音容易削波 | 多个声音相加会超过范围，需要 headroom、主增益和压缩。 |
| 旧 API 名称混乱 | 旧教程里的 `noteOn()`、`createGainNode()`、常量枚举要转换。 |
| 自定义处理卡顿 | `ScriptProcessorNode` 已废弃，生产级自定义 DSP 应考虑 `AudioWorklet`。 |

这些坑和 JavaScript 语法关系不大，更多来自音频系统本身。把它们提前放进架构里，会比后期补丁式修复轻松很多。

## 8. 后续还可以继续学什么？

读完这本书后，如果你想继续深入，可以按兴趣选择方向。

| 方向               | 可以继续学习的内容                             |
| ------------------ | ---------------------------------------------- |
| Web Audio API 规范 | 补齐接口细节、浏览器行为和边界条件。           |
| 数字音频基础       | 采样、量化、滤波、傅里叶分析、动态范围、失真。 |
| 音频合成           | 振荡器、包络、LFO、调制、减法合成、FM 合成。   |
| 游戏音频           | 分层音乐、环境声、空间化、动态混音、事件调度。 |
| 音频可视化         | Canvas、WebGL、频谱、波形、节奏响应。          |
| AudioWorklet       | 自定义 DSP、低延迟处理、工作线程通信。         |
| WebRTC 音频        | 实时通信、回声消除、音频路由和多人空间音频。   |

Web Audio API 的学习曲线有点特别：前几步像普通浏览器 API，越往后越接近音频工程。最稳的方式是围绕小目标练习，例如“做一个节拍器”“做一个频谱图”“做一个脚步声系统”“做一个带混响的播放器”。每个小目标都会自然串起一组节点和概念。

## 9. 这组笔记应该如何回看？

这组笔记可以按下面的关系回看：

1. `Fundamentals` 建立音频图和加载播放模型。
2. `Perfect Timing and Latency` 解决声音什么时候发生的问题。
3. `Volume and Loundness` 解决声音有多响、怎样混合的问题。
4. `Pitch and the Frequency Domain` 解释声音内部的频率结构。
5. `Analysis and Visualization` 用 `AnalyserNode` 观察声音。
6. `Advanced Topics` 把滤波、合成、混响、空间化和自定义处理串起来。
7. `Integrating with Other Technologies` 把音频图接入真实 Web 应用环境。

如果你能把这七步连成一张图，就已经抓住了 Web Audio API 的主体：声音从不同来源进入图，沿着时间轴被调度，经过节点处理和分析，最终输出到设备或其它目标。
