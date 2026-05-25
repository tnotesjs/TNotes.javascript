# [0166. Web Audio API - 基础知识](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0166.%20Web%20Audio%20API%20-%20%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 `<audio>` 还不够用？](#3--为什么-audio-还不够用)
- [4. 🤔 `AudioContext` 是什么？](#4--audiocontext-是什么)
- [5. 🤔 Web Audio API 中有哪些节点？](#5--web-audio-api-中有哪些节点)
- [6. 🤔 数字音频需要理解哪些基础概念？](#6--数字音频需要理解哪些基础概念)
- [7. 🤔 如何加载并播放一段声音？](#7--如何加载并播放一段声音)
- [8. 🤔 为什么要用模块化路由组织声音？](#8--为什么要用模块化路由组织声音)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 了解 Web 上音频能力的发展：从早期标签、Flash、`<audio>` 到 Web Audio API。
- 理解 `AudioContext`、音频图和 `AudioNode` 的基本模型。
- 掌握常见音频节点类型：源节点、处理节点、分析节点和目标节点。
- 学会用 `connect()`、`disconnect()` 组织音频路由。
- 理解声音数字化的基础概念：采样率、位深、PCM、`AudioBuffer` 和音频编码格式。
- 掌握加载、解码和播放音频文件的基本流程。
- 了解多路音频、主音量和模块化路由在游戏、交互应用中的价值。

## 2. 🫧 评价

这是 Web Audio API 的入口章节，重点不是记 API 名称，而是建立“音频图”的思维方式。只要理解声音会从源节点一路流向目标节点，后面的滤波、混音、分析和空间化都会顺很多。

## 3. 🤔 为什么 `<audio>` 还不够用？

早期网页播放声音主要依赖浏览器私有标签或插件，例如 `bgsound`、`embed` 和 Flash。HTML5 的 `<audio>` 让浏览器原生支持音频播放，这是一个很大的进步，但它更适合“播放一段音频”，不擅长复杂交互。

如果你在做游戏、音乐工具、音频可视化或实时交互应用，常常会遇到这些需求：

- 精确控制声音在未来某个时间点播放。
- 同时播放大量短音效。
- 提前加载并解码音频，避免触发时才等待网络和解码。
- 对声音做实时滤波、混响、压缩、空间化等处理。
- 分析音频数据，用于波形、频谱或节奏可视化。

`<audio>` 可以处理长音频、流式播放和浏览器控件，但它不是一个完整的音频处理系统。Web Audio API 提供的是一套独立的音频图模型，你可以把声音源、效果器、分析器和输出设备像积木一样接起来。

## 4. 🤔 `AudioContext` 是什么？

`AudioContext` 是 Web Audio API 的核心容器。你可以把它理解为一个音频工作台：里面包含一张有向的音频图，声音从源节点流出，经过一个或多个处理节点，最后到达目标节点。

最简单的音频图只有两端：

```txt
source -> context.destination
```

稍微复杂一点的音频图可能是：

```txt
source -> gain -> filter -> analyser -> context.destination
```

其中：

- `source` 负责产生声音。
- `gain` 负责控制音量或增益。
- `filter` 负责改变频率响应。
- `analyser` 负责读取音频数据，但不改变声音。
- `context.destination` 通常代表扬声器或耳机。

现代浏览器中通常这样创建音频上下文：

```js
const AudioContextClass = window.AudioContext || window.webkitAudioContext

if (!AudioContextClass) {
  throw new Error('当前浏览器不支持 Web Audio API')
}

const audioContext = new AudioContextClass()
```

实际项目里，一般一个音频应用只需要一个 `AudioContext`。它可以承载多个声音源和复杂的节点图。还要注意，现代浏览器通常要求音频播放由用户手势触发，所以在按钮点击、触摸等事件中调用 `audioContext.resume()` 是更稳妥的做法。

```js
button.addEventListener('click', async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
})
```

## 5. 🤔 Web Audio API 中有哪些节点？

Web Audio API 的节点可以粗略分成四类。

| 类型 | 作用 | 常见节点 |
| --- | --- | --- |
| 源节点 | 产生或引入声音 | `AudioBufferSourceNode`、`OscillatorNode`、`MediaElementAudioSourceNode`、`MediaStreamAudioSourceNode` |
| 处理节点 | 改变声音 | `GainNode`、`BiquadFilterNode`、`ConvolverNode`、`PannerNode`、`DynamicsCompressorNode` |
| 分析节点 | 读取声音特征 | `AnalyserNode` |
| 目标节点 | 输出或写入结果 | `AudioDestinationNode`、`OfflineAudioContext` 的目标缓冲区 |

这些节点通过 `connect()` 连接，通过 `disconnect()` 断开。多个节点可以连接到同一个节点，Web Audio API 会把输入信号混合起来。

```js
const source = audioContext.createBufferSource()
const gain = audioContext.createGain()

source.buffer = audioBuffer
gain.gain.value = 0.5

source.connect(gain)
gain.connect(audioContext.destination)
source.start()
```

上面这段代码建立了一条非常常见的路径：音频缓冲区作为声音源，经过 `GainNode` 调整音量，再输出到扬声器。

如果你想绕过中间节点，可以断开后重新连接：

```js
source.disconnect()
gain.disconnect()
source.connect(audioContext.destination)
```

这种“可重新布线”的模型，就是 Web Audio API 比 `<audio>` 灵活得多的关键。

## 6. 🤔 数字音频需要理解哪些基础概念？

真实世界中的声音是空气中的压力波。麦克风会把这种压力变化转换成电信号，计算机再把连续变化的模拟信号采样成一串数字。

理解 Web Audio API 时，下面几个概念很重要。

| 概念          | 含义                                                      |
| ------------- | --------------------------------------------------------- |
| 采样率        | 每秒采集多少次声音样本，常见值是 `44100Hz` 或 `48000Hz`。 |
| 位深          | 每个样本用多少位保存，位深越高，可表示的动态范围越大。    |
| PCM           | 把声音表示成样本数组的常见数字音频方式。                  |
| `AudioBuffer` | Web Audio API 中保存 PCM 音频数据的对象。                 |
| 声道          | 一段音频可以有一个或多个声道，例如单声道、立体声。        |

在 Web Audio API 中，`AudioBuffer` 内部的数据通常是归一化的浮点数，范围大致是 `-1` 到 `1`。如果信号超过这个范围，输出时就可能削波，听起来会失真。

音频文件本身通常不会直接保存原始 PCM，因为体积很大。常见做法是使用压缩编码格式，例如 MP3、AAC、OGG、FLAC 或 WAV。浏览器能否解码某种格式，取决于浏览器和平台支持情况。

## 7. 🤔 如何加载并播放一段声音？

Web Audio API 把“音频资源”和“播放状态”分开看待：

- `AudioBuffer` 像唱片，保存声音数据。
- `AudioBufferSourceNode` 像唱针，负责播放某次声音。

这意味着同一个 `AudioBuffer` 可以被多个 source 同时播放。游戏里的碰撞音效、枪声音效、按键反馈都很依赖这个模式。

现代写法通常使用 `fetch()` 加载音频，再用 `decodeAudioData()` 解码：

```js
async function loadAudioBuffer(audioContext, url) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()

  return audioContext.decodeAudioData(arrayBuffer)
}
```

播放时，每次都创建新的 `AudioBufferSourceNode`：

```js
function playSound(
  audioContext,
  audioBuffer,
  destination = audioContext.destination,
) {
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(destination)
  source.start()

  return source
}
```

这里有一个很容易踩的点：`AudioBufferSourceNode` 是一次性的。调用 `start()` 播放完之后，这个 source 不能再次播放。如果要重复播放同一个声音，你应该复用 `AudioBuffer`，但重新创建 source。

如果要循环播放背景音乐，可以设置 `loop`：

```js
function playLoop(audioContext, audioBuffer) {
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.loop = true
  source.connect(audioContext.destination)
  source.start()

  return source
}
```

## 8. 🤔 为什么要用模块化路由组织声音？

一个真实应用往往不是只播放一条声音。比如游戏中可能同时有：

- 背景音乐。
- 角色动作音效。
- UI 点击反馈。
- 环境声。
- 语音聊天。

如果所有声音都直接连到 `context.destination`，后续很难单独控制。更好的方式是给不同声音通道配置独立的 `GainNode`，再汇总到一个主音量节点。

```js
const musicGain = audioContext.createGain()
const effectsGain = audioContext.createGain()
const uiGain = audioContext.createGain()
const masterGain = audioContext.createGain()

musicGain.connect(masterGain)
effectsGain.connect(masterGain)
uiGain.connect(masterGain)
masterGain.connect(audioContext.destination)

musicGain.gain.value = 0.6
effectsGain.gain.value = 0.8
uiGain.gain.value = 0.4
masterGain.gain.value = 0.9
```

这样你既可以让用户关闭背景音乐，又可以保留关键提示音；也可以在游戏暂停、切换场景或进入菜单时统一压低整体音量。

Web Audio API 的强大之处不只是“能播放声音”，而是你可以像设计一套信号处理管线一样设计声音系统。
