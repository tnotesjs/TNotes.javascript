# [0196. Web Audio API - 分析与可视化](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0196.%20Web%20Audio%20API%20-%20%E5%88%86%E6%9E%90%E4%B8%8E%E5%8F%AF%E8%A7%86%E5%8C%96)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 音频分析能用来做什么？](#3--音频分析能用来做什么)
- [4. 🤔 `AnalyserNode` 在音频图中扮演什么角色？](#4--analysernode-在音频图中扮演什么角色)
- [5. 🤔 `AnalyserNode` 的几个核心参数分别控制什么？](#5--analysernode-的几个核心参数分别控制什么)
- [6. 🤔 如何读取频域数据？](#6--如何读取频域数据)
- [7. 🤔 如何读取时域数据？](#7--如何读取时域数据)
- [8. 🤔 为什么可视化要用 `requestAnimationFrame()`？](#8--为什么可视化要用-requestanimationframe)
- [9. 🤔 如何画一个简单的频谱图？](#9--如何画一个简单的频谱图)
- [10. 🤔 音频可视化有哪些局限？](#10--音频可视化有哪些局限)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 理解 Web Audio API 中音频分析的作用和典型场景。
- 掌握 `AnalyserNode` 的基本连接方式，以及它不会改变音频信号的特点。
- 了解 `fftSize`、`frequencyBinCount`、`smoothingTimeConstant`、`minDecibels` 和 `maxDecibels` 的含义。
- 学会读取频域数据和时域数据。
- 理解频率桶、奈奎斯特频率和采样率之间的关系。
- 掌握用 `requestAnimationFrame()` 驱动音频可视化的基本方式。
- 了解可视化采样的局限性，以及它和完整音频分析的区别。

## 2. 🫧 评价

- 这一章把 Web Audio API 的另一个侧面补齐了：它不只是制造和加工声音，也能观察声音。`AnalyserNode` 很适合作为调试工具和可视化入口，但别把屏幕上的可视化误认为完整、精确的音频分析。

## 3. 🤔 音频分析能用来做什么？

前面的章节主要关注声音的播放、调度和处理。音频分析关注的是另一件事：正在播放或输入的声音到底是什么样的。

典型用途包括：

- 绘制波形图或频谱图。
- 做音乐播放器的动态可视化。
- 辅助调试混音、电平、滤波效果。
- 做节奏检测、音高检测、语音分析等更复杂功能的前置处理。
- 根据实时输入驱动画面、粒子、游戏事件或交互反馈。

书中强调的典型例子是可视化。对游戏和交互应用来说，一个好的可视化工具既可以面向用户，也可以面向开发者：你能看见声音能量集中在哪里，滤波器是否真的削掉了高频，或者某段音频是否明显过强。

## 4. 🤔 `AnalyserNode` 在音频图中扮演什么角色？

`AnalyserNode` 是 Web Audio API 提供的分析节点。它可以插入音频图中的任意位置，用来读取当前音频流的时域或频域数据。

重要的是：`AnalyserNode` 不会改变声音。它更像一个旁路观察点。

```js
const analyser = audioContext.createAnalyser()

source.connect(analyser)
analyser.connect(audioContext.destination)
```

如果原本是：

```txt
source -> destination
```

插入分析节点后就是：

```txt
source -> analyser -> destination
```

听感上应该没有变化，但你可以从 `analyser` 中读取数据。

`AnalyserNode` 既可以放在单个声音源后面，也可以放在主输出前面。放在单个声音源后面，你观察的是某个声音；放在主输出前面，你观察的是整体混音。

## 5. 🤔 `AnalyserNode` 的几个核心参数分别控制什么？

`AnalyserNode` 的输出和几个参数密切相关。

| 参数 | 作用 |
| --- | --- |
| `fftSize` | FFT 使用的样本窗口大小，必须是 2 的幂。值越大，频率分辨率越细，但响应和性能成本也会变化。 |
| `frequencyBinCount` | 只读属性，值是 `fftSize / 2`，表示频域数据数组长度。 |
| `smoothingTimeConstant` | 频域数据的平滑程度，范围是 `0` 到 `1`。值越大，画面越平滑，但瞬态变化越不明显。 |
| `minDecibels` | 读取字节频域数据时映射到 `0` 的最小 dB 值。 |
| `maxDecibels` | 读取字节频域数据时映射到 `255` 的最大 dB 值。 |

一个常见初始化方式是：

```js
const analyser = audioContext.createAnalyser()

analyser.fftSize = 2048
analyser.smoothingTimeConstant = 0.8
analyser.minDecibels = -90
analyser.maxDecibels = -10
```

如果你要画更平滑的音乐频谱，可以适当提高 `smoothingTimeConstant`。如果你要观察快速瞬态，例如鼓点或点击声，就应该降低平滑值。

## 6. 🤔 如何读取频域数据？

频域数据描述的是不同频率范围内的能量。`AnalyserNode` 提供了两类频域读取方法：

| 方法 | 数据类型 | 适合场景 |
| --- | --- | --- |
| `getFloatFrequencyData()` | `Float32Array`，单位接近 dB。 | 更精细的分析。 |
| `getByteFrequencyData()` | `Uint8Array`，范围是 `0` 到 `255`。 | 可视化更方便。 |

读取字节频域数据的基本写法：

```js
const frequencyData = new Uint8Array(analyser.frequencyBinCount)

function readFrequencyData() {
  analyser.getByteFrequencyData(frequencyData)
  return frequencyData
}
```

数组下标可以映射到频率。频率上限是奈奎斯特频率，也就是采样率的一半。

```js
function getFrequencyValue(frequency) {
  const nyquist = audioContext.sampleRate / 2
  const index = Math.round((frequency / nyquist) * frequencyData.length)

  return frequencyData[index]
}
```

如果采样率是 `44100Hz`，奈奎斯特频率就是 `22050Hz`。也就是说，频域数组从 `0Hz` 大致覆盖到 `22050Hz`。

## 7. 🤔 如何读取时域数据？

时域数据描述的是波形随时间的振幅变化。`AnalyserNode` 也提供了两类读取方法：

| 方法 | 数据类型 | 特点 |
| --- | --- | --- |
| `getFloatTimeDomainData()` | `Float32Array`，通常在 `-1` 到 `1` 附近。 | 更接近原始音频样本。 |
| `getByteTimeDomainData()` | `Uint8Array`，范围是 `0` 到 `255`，静音附近约为 `128`。 | 适合直接绘制波形。 |

```js
const timeData = new Uint8Array(analyser.fftSize)

function readTimeData() {
  analyser.getByteTimeDomainData(timeData)
  return timeData
}
```

频域图更适合观察“哪些频率更强”，时域图更适合观察“波形如何起伏”。音乐播放器里常见的彩色频谱柱状图来自频域数据，横向波形线来自时域数据。

## 8. 🤔 为什么可视化要用 `requestAnimationFrame()`？

音频可视化通常需要不断读取分析数据并重绘画面。你可以用 `setInterval()`，但更推荐 `requestAnimationFrame()`。

原因是 `requestAnimationFrame()` 会跟随浏览器的渲染节奏执行，适合驱动画布、DOM 或 WebGL 绘制。浏览器也能在标签页不可见时降低调用频率，节省资源。

```js
function render() {
  analyser.getByteFrequencyData(frequencyData)

  drawFrequencyBars(frequencyData)

  requestAnimationFrame(render)
}

requestAnimationFrame(render)
```

现代浏览器已经普遍支持未加前缀的 `requestAnimationFrame()`。旧资料中常见的 `webkitRequestAnimationFrame`、`mozRequestAnimationFrame` 主要是历史兼容写法。

## 9. 🤔 如何画一个简单的频谱图？

下面是一个基于 `canvas` 的简化频谱绘制思路。它把每个频率桶映射成一根柱子。

```js
const canvas = document.querySelector('canvas')
const canvasContext = canvas.getContext('2d')
const frequencyData = new Uint8Array(analyser.frequencyBinCount)

function drawFrequencyBars() {
  analyser.getByteFrequencyData(frequencyData)

  canvasContext.clearRect(0, 0, canvas.width, canvas.height)

  const barWidth = canvas.width / frequencyData.length

  for (let i = 0; i < frequencyData.length; i++) {
    const percent = frequencyData[i] / 255
    const barHeight = canvas.height * percent
    const x = i * barWidth
    const y = canvas.height - barHeight

    canvasContext.fillStyle = `hsl(${(i / frequencyData.length) * 360}, 80%, 50%)`
    canvasContext.fillRect(x, y, barWidth, barHeight)
  }

  requestAnimationFrame(drawFrequencyBars)
}
```

如果要叠加波形，可以再读取时域数据，并把每个样本映射到一条折线。频谱和波形结合起来，就能同时看到频率能量和瞬时振幅变化。

## 10. 🤔 音频可视化有哪些局限？

可视化很有用，但它不是完整音频分析。

首先，屏幕刷新通常是每秒几十到一百多帧，而音频采样率常见是每秒几万次。你在画布上看到的是不断抽样后的结果，不可能展示每一个音频样本。

其次，`fftSize` 会影响频率分辨率和时间响应。窗口越大，频率细节越好，但对瞬间变化的反应会更慢；窗口越小，反应更快，但频率分辨率更粗。

最后，`smoothingTimeConstant` 会让画面更好看，但也会隐藏快速变化。如果你是在做调试，就要注意视觉上的平滑可能掩盖真实峰值。

所以可以把 `AnalyserNode` 理解成实时观察工具：适合可视化、调试和交互反馈。如果要做严肃的离线分析、响度归一化或母带处理，就需要更完整的音频处理流程。
