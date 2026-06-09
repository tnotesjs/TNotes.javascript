# [0201. Web Audio API - 高级主题](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0201.%20Web%20Audio%20API%20-%20%E9%AB%98%E7%BA%A7%E4%B8%BB%E9%A2%98)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 滤波器能对声音做什么？](#3-滤波器能对声音做什么)
- [4. 程序化声音生成适合什么场景？](#4-程序化声音生成适合什么场景)
- [5. 包络如何塑造音效的形状？](#5-包络如何塑造音效的形状)
- [6. `ConvolverNode` 如何模拟房间效果？](#6-convolvernode-如何模拟房间效果)
- [7. 空间化声音需要哪些概念？](#7-空间化声音需要哪些概念)
- [8. 声锥和方向能表达什么？](#8-声锥和方向能表达什么)
- [9. JavaScript 自定义音频处理应该怎么选？](#9-javascript-自定义音频处理应该怎么选)

<!-- endregion:toc -->

## 1. 本节内容

- 理解 `BiquadFilterNode` 的作用，以及常见滤波器类型。
- 掌握滤波器的 `frequency`、`Q` 和 `gain` 参数。
- 了解程序化声音生成的价值和基本方式。
- 理解白噪声、包络、攻击、衰减和释放等音效设计概念。
- 掌握 `ConvolverNode` 和 impulse response 在房间效果中的作用。
- 了解干声、湿声和混响比例控制。
- 掌握空间化声音中的 listener、panner、位置、方向和声锥概念。
- 了解 JavaScript 自定义音频处理的边界，以及 `ScriptProcessorNode` 和 `AudioWorklet` 的现代取舍。

## 2. 评价

- 这一章是 Web Audio API 的能力展示：滤波、合成、混响、空间化、自定义处理都开始出现。它不要求你一次吃透 DSP，但会让你意识到 Web Audio API 已经接近一套小型音频引擎。

## 3. 滤波器能对声音做什么？

滤波器用于强调或削弱某些频率范围。你可以把它理解成可编程的均衡器，也可以把它当成构建音效的基础组件。

Web Audio API 中常用的是 `BiquadFilterNode`。它支持多种二阶滤波器类型。

| 类型        | 效果                                     |
| ----------- | ---------------------------------------- |
| `lowpass`   | 让低频通过，削弱高频，声音会更闷。       |
| `highpass`  | 让高频通过，削弱低频，声音会更薄。       |
| `bandpass`  | 只保留某个频段。                         |
| `lowshelf`  | 提升或削弱低频。                         |
| `highshelf` | 提升或削弱高频。                         |
| `peaking`   | 提升或削弱中间某段频率。                 |
| `notch`     | 挖掉很窄的一段频率，常用于去除特定噪声。 |
| `allpass`   | 改变相位，可用于构造特殊效果。           |

基本用法如下：

```js
const filter = audioContext.createBiquadFilter()

filter.type = 'lowpass'
filter.frequency.value = 800
filter.Q.value = 1

source.connect(filter)
filter.connect(audioContext.destination)
```

常见参数含义：

- `frequency`：滤波器关注的中心频率或截止频率。
- `Q`：品质因数，影响滤波曲线的尖锐程度。
- `gain`：用于 `lowshelf`、`highshelf`、`peaking` 等类型，表示提升或削弱多少 dB。

如果要理解滤波器真实影响，可以用 `getFrequencyResponse()` 计算一组频率对应的响应，再画成频率响应曲线。

## 4. 程序化声音生成适合什么场景？

程序化声音生成指不依赖现成音频文件，而是用代码生成声音。它常用于游戏、合成器、实验性音乐工具和交互反馈。

相比静态音频素材，它有几个优点：

- 不需要下载大量音效文件。
- 可以根据运行时状态生成变化，避免重复。
- 可以把音效参数化，例如距离、强度、速度、材质。

缺点也很明显：设计高质量音色需要音频知识，复杂声音很快会涉及 DSP、包络、滤波和调制。

一个最简单的例子是生成白噪声缓冲区：

```js
function createWhiteNoiseBuffer(duration = 1) {
  const length = Math.floor(audioContext.sampleRate * duration)
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1
  }

  return buffer
}
```

白噪声本身听起来像沙沙声，但经过包络和滤波后，可以变成枪声、风声、爆炸、喷气、冲击等音效的一部分。

## 5. 包络如何塑造音效的形状？

包络描述声音随时间变化的轮廓。常见的 ADSR 模型包含攻击、衰减、保持和释放。书中的枪声音效示例虽然没有完整展开 ADSR，但思路类似：先快速升到峰值，再迅速衰减，最后释放到静音。

用 `GainNode` 可以做一个简单的包络：

```js
function triggerEnvelope(gainNode, when = audioContext.currentTime) {
  gainNode.gain.cancelScheduledValues(when)
  gainNode.gain.setValueAtTime(0, when)
  gainNode.gain.linearRampToValueAtTime(1, when + 0.005)
  gainNode.gain.linearRampToValueAtTime(0.3, when + 0.08)
  gainNode.gain.linearRampToValueAtTime(0, when + 0.3)
}
```

把白噪声、包络和滤波器组合起来，就能得到一个非常粗糙但可调的冲击音效：

```js
function playNoiseHit() {
  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  source.buffer = createWhiteNoiseBuffer(1)
  filter.type = 'lowpass'
  filter.frequency.value = 1200

  source.connect(gain)
  gain.connect(filter)
  filter.connect(audioContext.destination)

  triggerEnvelope(gain)
  source.start()
  source.stop(audioContext.currentTime + 0.35)
}
```

这种方法不一定比音频素材真实，但它胜在轻量、可变和可交互。

## 6. `ConvolverNode` 如何模拟房间效果？

现实中的声音会被墙壁、地面、家具和空间结构反射。你在浴室、走廊、教堂和户外拍手，听起来完全不同，这些差异主要来自空间对声音的影响。

`ConvolverNode` 可以通过 impulse response，也就是脉冲响应，模拟这种空间效果。脉冲响应本质上是一段记录了某个空间声学特征的音频。

基本用法是：加载一段脉冲响应音频，设置为 `convolver.buffer`，再让声音通过 `ConvolverNode`。

```js
async function loadImpulseResponse(url) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return audioContext.decodeAudioData(arrayBuffer)
}

async function createReverb(url) {
  const convolver = audioContext.createConvolver()
  convolver.buffer = await loadImpulseResponse(url)
  return convolver
}
```

实际项目里通常不会只输出混响后的声音，而是混合干声和湿声：

- 干声：未经混响处理的原始声音。
- 湿声：经过 `ConvolverNode` 处理后的声音。

```js
function connectReverb(source, convolver, wetAmount = 0.3) {
  const dryGain = audioContext.createGain()
  const wetGain = audioContext.createGain()

  dryGain.gain.value = 1 - wetAmount
  wetGain.gain.value = wetAmount

  source.connect(dryGain)
  source.connect(convolver)
  convolver.connect(wetGain)

  dryGain.connect(audioContext.destination)
  wetGain.connect(audioContext.destination)
}
```

混响很容易让声音变浑，所以湿声比例通常要谨慎控制。

## 7. 空间化声音需要哪些概念？

空间化声音让声音具有位置感。游戏、VR、地图、多人语音和交互装置都可能用到它。

Web Audio API 里有两个关键角色：

- `AudioListener`：听者，通常代表玩家、摄像机或用户。
- `PannerNode`：声源的空间化节点，负责根据相对位置和方向调整声音。

现代浏览器中，可以使用 `positionX`、`positionY`、`positionZ` 等 `AudioParam` 设置位置。

```js
const panner = audioContext.createPanner()

panner.panningModel = 'HRTF'
panner.distanceModel = 'inverse'
panner.positionX.value = 1
panner.positionY.value = 0
panner.positionZ.value = -0.5

source.connect(panner)
panner.connect(audioContext.destination)
```

听者也有位置和方向。不同浏览器对新旧接口支持略有差异，现代接口优先使用 `AudioParam`：

```js
audioContext.listener.positionX.value = 0
audioContext.listener.positionY.value = 0
audioContext.listener.positionZ.value = 0
```

书中提醒了一个容易忽略的点：Web Audio 的空间坐标不一定和屏幕坐标一致。尤其是 `y` 轴方向，很多图形系统中向下是正方向，而空间音频里通常向上是正方向。把屏幕坐标转换为空间坐标时要显式处理。

## 8. 声锥和方向能表达什么？

现实世界中的声源常常不是全方向均匀发声。例如扬声器正前方更响，背后更弱；角色说话也会有朝向差异。

`PannerNode` 支持声锥参数，用来描述声音在不同方向上的衰减。

```js
panner.coneInnerAngle = 30
panner.coneOuterAngle = 90
panner.coneOuterGain = 0.2
```

含义可以这样理解：

- 内锥范围内声音基本保持原本强度。
- 外锥之外声音会衰减到 `coneOuterGain`。
- 内外锥之间由浏览器平滑过渡。

如果一个声音是全方向的，可以把角度设得很大；如果是非常定向的声音，比如警报器、扩音器或角色朝向，可以缩小内外锥角度。

## 9. JavaScript 自定义音频处理应该怎么选？

Web Audio API 的设计倾向是：常见音频任务交给浏览器内置节点完成，因为这些节点通常由底层高性能代码实现。只有当内置节点不够用时，才考虑自定义处理。

书中使用的 `ScriptProcessorNode` 曾经是用 JavaScript 处理音频流的方式，但它现在已经废弃。原因是它运行在主线程，容易受到布局、渲染、GC 和其它 JavaScript 任务影响，从而产生卡顿或爆音。

现代做法是使用 `AudioWorklet`。它把自定义音频处理放到专门的音频渲染线程，更适合生产环境。

选择建议：

| 需求           | 推荐方式                                               |
| -------------- | ------------------------------------------------------ |
| 调整音量       | `GainNode`。                                           |
| 均衡和滤波     | `BiquadFilterNode`。                                   |
| 压缩动态范围   | `DynamicsCompressorNode`。                             |
| 声道拆分合并   | `ChannelSplitterNode` 和 `ChannelMergerNode`。         |
| 混响           | `ConvolverNode`。                                      |
| 自定义 DSP     | `AudioWorklet`。                                       |
| 旧教程原型代码 | 可能会看到 `ScriptProcessorNode`，但不建议新项目使用。 |

这一章的重点不是让你手写所有音频算法，而是让你知道 Web Audio API 已经提供了相当完整的基础模块。优先组合内置节点，必要时再进入自定义 DSP，会更稳也更省性能。
