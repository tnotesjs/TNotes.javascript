# [0180. Web Audio API - 音量与响度](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0180.%20Web%20Audio%20API%20-%20%E9%9F%B3%E9%87%8F%E4%B8%8E%E5%93%8D%E5%BA%A6)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `GainNode` 是怎样控制声音大小的？](#3-gainnode-是怎样控制声音大小的)
- [4. gain、volume 和 loudness 有什么区别？](#4-gainvolume-和-loudness-有什么区别)
- [5. 为什么线性交叉淡化可能听起来不自然？](#5-为什么线性交叉淡化可能听起来不自然)
- [6. 什么是削波，为什么要留 headroom？](#6-什么是削波为什么要留-headroom)
- [7. 如何检测音频是否可能削波？](#7-如何检测音频是否可能削波)
- [8. 动态范围压缩能解决什么问题？](#8-动态范围压缩能解决什么问题)
- [9. 实际混音时可以遵循哪些原则？](#9-实际混音时可以遵循哪些原则)

<!-- endregion:toc -->

## 1. 本节内容

- 理解 `GainNode` 如何改变声音振幅。
- 区分 gain、volume、loudness 这几个容易混淆的概念。
- 理解 dBFS、dBSPL、动态范围和削波的基本含义。
- 掌握等功率交叉淡化的思路，避免简单线性淡化带来的音量凹陷。
- 了解如何用电平表或分析节点检测削波风险。
- 掌握通过主增益和 `DynamicsCompressorNode` 控制混音输出。
- 理解什么时候应该压缩动态范围，什么时候不应该随意压缩。

## 2. 评价

- 音量控制看起来只是调一个数，但真实应用中很快会碰到响度感知、削波和动态范围问题。这一章的价值在于提醒你：音频混合不是简单相加，输出端永远要留余量。

## 3. `GainNode` 是怎样控制声音大小的？

在 Web Audio API 中，最常用的音量控制节点是 `GainNode`。它的核心参数是 `gain`，含义是对输入信号的振幅做乘法。

| `gain` 值 | 含义                                           |
| --------- | ---------------------------------------------- |
| `1`       | 原样输出。                                     |
| `0.5`     | 振幅减半。                                     |
| `0`       | 静音。                                         |
| `2`       | 振幅加倍，可能带来削波风险。                   |
| 小于 `0`  | 波形反相，一般不是普通音量控制场景需要的效果。 |

最基本的连接方式如下：

```js
const source = audioContext.createBufferSource()
const gainNode = audioContext.createGain()

source.buffer = audioBuffer
gainNode.gain.value = 0.5

source.connect(gainNode)
gainNode.connect(audioContext.destination)
source.start()
```

如果你要做一个应用级音量控制，通常不要直接改每一个声音源，而是让所有声音先汇总到一个主 `GainNode`。

```js
const masterGain = audioContext.createGain()
masterGain.gain.value = 0.8
masterGain.connect(audioContext.destination)
```

这样无论有多少条音频通道，最后都能统一控制整体输出。

## 4. gain、volume 和 loudness 有什么区别？

这三个词经常混用，但含义并不完全一样。

| 概念     | 侧重点                                               |
| -------- | ---------------------------------------------------- |
| gain     | 音频处理过程中的振幅倍率，是信号层面的乘法。         |
| volume   | 通常指播放设备或应用给用户暴露的音量控制。           |
| loudness | 人耳主观感受到的响度，和频率、环境、持续时间都有关。 |

简单来说，`GainNode` 改的是 gain。用户觉得声音变大或变小，是 loudness 的主观结果。系统音量旋钮、播放器音量条、硬件功放还会继续影响最终听到的 volume。

数字音频里常用 `dBFS` 表示相对于满刻度的电平。`0dBFS` 是数字系统允许的最大电平，再高就会削波；所以正常数字音频电平通常是负数，例如 `-6dBFS`、`-12dBFS`。

另一个常见单位是 `dBSPL`，它描述真实世界中的声压级，比如环境噪声、演唱会音量、疼痛阈值。Web Audio API 本身无法知道你的操作系统音量、耳机灵敏度和扬声器增益，因此它主要处理的是数字信号电平，而不是最终物理声压。

还有一个常见经验：振幅翻倍大约增加 `6dB`。但人耳对响度的感知不是严格线性的，所以“数值翻倍”和“听起来翻倍”不是一回事。

## 5. 为什么线性交叉淡化可能听起来不自然？

交叉淡化是指一个声音变小的同时，另一个声音变大。最直观的做法是线性处理：

```js
gainA = 1 - percent
gainB = percent
```

问题在于，当 `percent` 是 `0.5` 时，两个声音的 gain 都是 `0.5`。如果两段声音相关性不高，中间位置可能听起来像音量下陷。

更自然的做法是等功率交叉淡化。它使用三角函数让两条曲线在中间区域保留更多能量。

```js
function equalPowerCrossfade(percent, gainA, gainB) {
  const clampedPercent = Math.min(1, Math.max(0, percent))

  gainA.gain.value = Math.cos(clampedPercent * 0.5 * Math.PI)
  gainB.gain.value = Math.cos((1 - clampedPercent) * 0.5 * Math.PI)
}
```

这个技巧很适合游戏场景：例如角色从室外走进洞穴，环境声不是固定时间切换，而是根据角色位置连续变化。此时你不能提前安排一条固定淡化曲线，只能根据当前状态实时计算两个通道的 gain。

## 6. 什么是削波，为什么要留 headroom？

数字音频通常把样本值限制在 `-1` 到 `1` 之间。如果多个声音混合后超过这个范围，输出时就会被截断，这就是削波。

削波的听感通常是粗糙、刺耳、失真。它有时可以被当成特殊效果使用，但在普通混音中通常是问题。

产生削波的常见原因是多个声音直接相加。例如 10 个音效同时响起，每个单独听都不大，但混合后峰值可能超过允许范围。

避免削波有几种常见策略：

- 给主输出预留余量，例如主 gain 不要长期设为 `1`。
- 对不同通道设置合理的默认 gain。
- 在接近输出端加入电平监测。
- 对不可预测的动态混音使用压缩器兜底。

这里的 headroom 可以理解为“离满刻度还留一点空间”。在交互应用中，声音组合经常由运行时状态决定，提前留余量比事后修失真可靠得多。

## 7. 如何检测音频是否可能削波？

书中使用 `ScriptProcessorNode` 检查样本值是否超过范围。这个节点现在已经废弃，生产环境更推荐 `AudioWorklet` 或较轻量的分析节点方案。对于普通可视化和近似电平显示，`AnalyserNode` 通常够用。

下面是一个用 `AnalyserNode` 做峰值监测的简化写法：

```js
const analyser = audioContext.createAnalyser()
analyser.fftSize = 2048

masterGain.connect(analyser)
analyser.connect(audioContext.destination)

const samples = new Float32Array(analyser.fftSize)

function getPeakLevel() {
  analyser.getFloatTimeDomainData(samples)

  let peak = 0
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample))
  }

  return peak
}
```

如果 `peak` 长时间接近 `1`，说明输出已经非常接近满刻度；如果达到或超过 `1`，就要警惕削波。

这种做法适合 UI 电平表，但它不是完整的离线母带分析工具。因为可视化帧率远低于音频采样率，某些瞬时峰值可能被漏掉。需要严肃检测时，应该在音频处理链路中更精确地采样，或者使用离线处理。

## 8. 动态范围压缩能解决什么问题？

动态范围指一段声音中最响和最安静部分之间的差距。古典音乐通常动态范围较大，流行音乐和游戏混音往往会更紧凑。

压缩器的作用是：当信号超过某个阈值时，自动减少它继续变大的幅度。这样可以让突然很响的部分被压住，同时让整体听起来更稳定。

Web Audio API 提供了 `DynamicsCompressorNode`：

```js
const compressor = audioContext.createDynamicsCompressor()

masterGain.connect(compressor)
compressor.connect(audioContext.destination)
```

常见参数包括：

| 参数        | 作用                               |
| ----------- | ---------------------------------- |
| `threshold` | 超过这个电平后开始压缩。           |
| `ratio`     | 超过阈值后压缩的比例。             |
| `attack`    | 压缩开始响应的速度。               |
| `release`   | 压缩结束恢复的速度。               |
| `knee`      | 从未压缩到压缩状态的过渡柔和程度。 |

游戏和交互应用很适合在主输出前放一个适度压缩器，因为你很难预测同一时刻会叠加多少声音。但如果你播放的是已经被专业母带处理过的完整音乐，不一定应该再压缩它，否则可能破坏原本的动态和质感。

## 9. 实际混音时可以遵循哪些原则？

Web Audio API 给了你信号处理能力，但听感仍然需要靠合理设计。几个务实原则是：

1. 给声音分组，例如音乐、音效、语音、UI 提示分别进入不同 `GainNode`。
2. 每组先控制自己的默认电平，再进入主输出。
3. 主输出保留余量，不要让所有通道都顶到最大。
4. 对运行时高度不可预测的场景，使用 `DynamicsCompressorNode` 降低削波概率。
5. 做音量变化时尽量使用短淡入淡出，避免突然跳变。
6. 最终用耳朵检查，不要只看数值。

这一章的核心结论是：声音混合是加法，响度感知是非线性的，数字输出又有硬边界。理解这三点，你写出来的音频系统会稳很多。
