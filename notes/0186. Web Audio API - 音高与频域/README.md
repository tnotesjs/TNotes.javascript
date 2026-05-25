# [0186. Web Audio API - 音高与频域](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0186.%20Web%20Audio%20API%20-%20%E9%9F%B3%E9%AB%98%E4%B8%8E%E9%A2%91%E5%9F%9F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 音高和频率是什么关系？](#3--音高和频率是什么关系)
- [4. 🤔 如何用 `playbackRate` 和 `detune` 改变音高？](#4--如何用-playbackrate-和-detune-改变音高)
- [5. 🤔 如何让重复音效听起来不机械？](#5--如何让重复音效听起来不机械)
- [6. 🤔 什么是时域和频域？](#6--什么是时域和频域)
- [7. 🤔 如何用 `OscillatorNode` 直接合成声音？](#7--如何用-oscillatornode-直接合成声音)
- [8. 🤔 这一章和后续内容有什么关系？](#8--这一章和后续内容有什么关系)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 理解音高、频率、八度、半音和 cents 的关系。
- 掌握用 `playbackRate` 和 `detune` 改变采样音频的音高。
- 了解改变 `playbackRate` 会同时改变音高和播放时长。
- 学会给重复音效加入时间和音高变化，避免听感机械。
- 理解时域和频域的区别，以及 FFT 在频域分析中的作用。
- 了解泛音、噪声和真实乐器声音为什么需要从频域理解。
- 掌握 `OscillatorNode` 的基本用法和常见波形类型。

## 2. 🫧 评价

- 这一章把 Web Audio API 从“播放文件”带到了“理解声音结构”。音高、频域和振荡器是合成、分析、变调和音效设计的基础，后面很多高级效果都建立在这里。

## 3. 🤔 音高和频率是什么关系？

我们听到的音高，本质上和周期性声音的频率有关。频率表示波形每秒重复多少次，单位是赫兹，也就是 `Hz`。

例如标准音 `A4` 的频率通常是 `440Hz`。如果频率翻倍到 `880Hz`，人耳会听成高一个八度的 `A5`；如果减半到 `220Hz`，会听成低一个八度的 `A3`。

音乐里一个八度通常分成 12 个半音。在十二平均律中，相邻半音之间的频率比例是固定的：

```js
const semitoneRatio = Math.pow(2, 1 / 12)
```

所以把一个音升高 `n` 个半音，可以使用：

```js
const rate = Math.pow(2, n / 12)
```

Web Audio API 还支持 `detune` 的概念。`detune` 使用 cents 作为单位：

- 1 个半音等于 `100` cents。
- 1 个八度等于 `1200` cents。
- `1200` 表示升高一个八度。
- `-1200` 表示降低一个八度。

相比直接计算 `2 ** (n / 12)`，用 cents 描述音高偏移更接近音乐语境。

## 4. 🤔 如何用 `playbackRate` 和 `detune` 改变音高？

`AudioBufferSourceNode` 有 `playbackRate` 参数。它控制音频缓冲区播放速度，因此也会改变音高。

```js
function playWithSemitoneOffset(audioBuffer, semitones) {
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.playbackRate.value = Math.pow(2, semitones / 12)
  source.connect(audioContext.destination)
  source.start()
}
```

使用 `detune` 可以写得更直观：

```js
function playWithDetune(audioBuffer, semitones) {
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.detune.value = semitones * 100
  source.connect(audioContext.destination)
  source.start()
}
```

需要注意：改变 `playbackRate` 会同时改变音高和播放时长。播放速度变快，音高升高，声音也会更快结束；播放速度变慢，音高降低，声音也会拉长。

如果你希望只改变音高而不改变时长，或者只改变时长而不改变音高，那就进入了更复杂的音频处理领域，通常需要专门算法或音频库，直接用 `playbackRate` 做不到高质量通用处理。

## 5. 🤔 如何让重复音效听起来不机械？

游戏和交互应用经常短时间内重复播放同一个音效，例如枪声、脚步声、点击声。如果每次声音完全一样，很容易让用户听出机械重复。

一个简单有效的办法是：同一个 `AudioBuffer` 每次创建新的 source，并加入轻微随机变化。

```js
function playVariedSound(audioBuffer, when = audioContext.currentTime) {
  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()

  source.buffer = audioBuffer
  source.playbackRate.value = 0.95 + Math.random() * 0.1
  gain.gain.value = 0.8 + Math.random() * 0.2

  source.connect(gain)
  gain.connect(audioContext.destination)
  source.start(when + Math.random() * 0.02)
}
```

这段代码做了三件事：

- 轻微随机播放速度，让音高略有变化。
- 轻微随机音量，让每次能量不同。
- 轻微随机触发时间，让密集音效不完全落在同一瞬间。

这种技巧不需要准备大量素材，却能让声音更接近真实世界的不确定性。不过随机范围要克制，变化太大就会听起来像错误。

## 6. 🤔 什么是时域和频域？

前面我们经常把声音理解成“振幅随时间变化”，这就是时域视角。波形图通常就是时域图，横轴是时间，纵轴是振幅。

频域换了一个角度：它关心一段声音里包含哪些频率，以及每个频率的能量有多强。横轴是频率，纵轴是强度。

这两个视角可以互相转换，背后的数学基础是傅里叶分析。简单来说，复杂声音可以看成很多个不同频率、不同振幅的正弦波叠加。FFT，也就是快速傅里叶变换，是常用的计算方法。

频域视角能解释很多时域图不直观的现象：

- 同样是 `440Hz` 的音，钢琴和小号听起来不同，是因为泛音结构不同。
- 白噪声听起来没有明确音高，是因为很多频率都有能量。
- 均衡器能增强低频或削弱高频，是因为它在改变频率响应。
- 音频可视化常画频谱，是因为频域更容易看出声音的能量分布。

Web Audio API 中的 `AnalyserNode` 内置了 FFT 能力，后续分析和可视化会大量用到它。

## 7. 🤔 如何用 `OscillatorNode` 直接合成声音？

声音源不一定来自音频文件。Web Audio API 提供了 `OscillatorNode`，可以直接生成周期波形。

```js
function playOscillator(frequency = 440, duration = 1) {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.value = 0.2

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + duration)
}
```

常见波形类型包括：

| 类型       | 听感倾向                   |
| ---------- | -------------------------- |
| `sine`     | 最纯净，只有基频。         |
| `triangle` | 比正弦波更亮，但仍较柔和。 |
| `square`   | 泛音明显，听起来更电子。   |
| `sawtooth` | 泛音丰富，常用于合成器。   |

`OscillatorNode` 也有 `frequency` 和 `detune` 参数，所以可以像控制采样音频一样调制它的音高。

```js
oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
oscillator.frequency.exponentialRampToValueAtTime(
  880,
  audioContext.currentTime + 1,
)
```

如果内置波形不够用，还可以用 `PeriodicWave` 创建自定义周期波。不过这已经更接近合成器设计，超出了本篇的重点。

## 8. 🤔 这一章和后续内容有什么关系？

音高和频域是很多高级功能的前置知识。

| 后续能力         | 依赖本章的地方                               |
| ---------------- | -------------------------------------------- |
| 音频分析         | 需要理解时域、频域和 FFT。                   |
| 可视化           | 频谱柱状图来自频域数据，波形图来自时域数据。 |
| 滤波器           | 本质上是在改变某些频率范围的能量。           |
| 程序化音效       | 常用振荡器、噪声、包络和滤波组合声音。       |
| 空间化和游戏音效 | 常把音高、音量、时间差和滤波一起使用。       |

可以把这一章当成分水岭：前面是“怎样播放和控制声音”，从这里开始是“声音内部长什么样，以及怎样主动塑造它”。
