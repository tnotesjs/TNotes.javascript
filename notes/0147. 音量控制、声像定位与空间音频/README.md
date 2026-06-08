# [0147. 音量控制、声像定位与空间音频](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0147.%20%E9%9F%B3%E9%87%8F%E6%8E%A7%E5%88%B6%E3%80%81%E5%A3%B0%E5%83%8F%E5%AE%9A%E4%BD%8D%E4%B8%8E%E7%A9%BA%E9%97%B4%E9%9F%B3%E9%A2%91)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 🤔 GainNode 的 gain 属性为什么是 AudioParam 而不是普通数值类型？](#3--gainnode-的-gain-属性为什么是-audioparam-而不是普通数值类型)
- [4. 🤔 如何使用 AudioParam 的时间调度方法实现音频淡入淡出效果？](#4--如何使用-audioparam-的时间调度方法实现音频淡入淡出效果)
- [5. 🤔 PannerNode 的 HRTF 和 equalpower 模式有什么区别？](#5--pannernode-的-hrtf-和-equalpower-模式有什么区别)
- [6. 🤔 如何实现一个简单的音频混音器并分别控制各路音量？](#6--如何实现一个简单的音频混音器并分别控制各路音量)
- [7. 🤔 StereoPannerNode 和 PannerNode 有什么区别，应该如何选择？](#7--stereopannernode-和-pannernode-有什么区别应该如何选择)
- [8. 🤔 ChannelSplitterNode 和 ChannelMergerNode 的典型使用场景是什么？](#8--channelsplitternode-和-channelmergernode-的典型使用场景是什么)
- [9. 🤔 如何模拟声音随距离变化而衰减的效果？](#9--如何模拟声音随距离变化而衰减的效果)

<!-- endregion:toc -->

## 1. 本节内容

- GainNode 与 gain AudioParam
- AudioParam 时间调度方法（setValueAtTime、linearRampToValueAtTime 等）
- 淡入（Fade In）淡出（Fade Out）实现
- PannerNode 与 3D 空间声像
- panningModel（HRTF、equalpower）
- distanceModel 与距离衰减
- StereoPannerNode 简化立体声控制
- ChannelSplitterNode 与 ChannelMergerNode
- 多路音频混音

## 2. 评价

- todo

## 3. 🤔 GainNode 的 gain 属性为什么是 AudioParam 而不是普通数值类型？

`AudioParam` 是 Web Audio API 中专门设计的参数接口，它远比一个普通的数值类型强大。`gain` 属性被设计为 `AudioParam` 而非 `number`，核心原因有三个。

第一，自动化时间调度。`AudioParam` 提供了一组时间调度方法，可以在未来某个精确时刻自动改变参数值，无需开发者手动用 `setInterval` 或 `requestAnimationFrame` 轮询修改。这对于音频处理至关重要，因为音频参数的变化需要与采样时钟精确对齐，而 JavaScript 的定时器精度远远不够。

```javascript
// 当前时间将 gain 从 0 开始，在 1 秒后线性增长到 1
gain.gain.setValueAtTime(0, ctx.currentTime)
gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1)
```

如果 `gain` 只是一个普通数值，实现同样的效果就需要自己在 JavaScript 侧用高精度循环不断更新值，既不精确又消耗 CPU。

第二，音频信号级别的参数调制。`AudioParam` 不仅能接收 JavaScript 设置的数值，还能接收来自其他音频节点的输入信号作为调制源。例如将一个 LFO（低频振荡器）的输出连接到 `gain` 参数上，就能实现颤音（Tremolo）效果：

```javascript
const lfo = ctx.createOscillator()
const lfoGain = ctx.createGain()
lfo.frequency.value = 5 // 5Hz 颤音频率
lfoGain.gain.value = 0.3 // 颤音深度

lfo.connect(lfoGain)
lfoGain.connect(gain.gain) // 用 LFO 信号调制 gain 参数
lfo.start()
```

这种方式下 `gain` 参数的值每秒变化数千次（按采样率级别），JavaScript 根本无法以这种频率手动更新数值。`AudioParam` 在底层音频线程中实时处理这些信号级别的调制。

第三，线程安全性。Web Audio API 的音频处理运行在独立的音频渲染线程中，与 JavaScript 主线程隔离。`AudioParam` 是跨线程通信的接口——JavaScript 在主线程设置调度命令，音频线程按时间线执行这些命令。直接暴露一个 `number` 无法保证这种线程安全的交互。

`AudioParam` 提供的关键属性和方法包括：`value`（当前值，可读写）、`setValueAtTime()`、`linearRampToValueAtTime()`、`exponentialRampToValueAtTime()`、`setTargetAtTime()`、`setValueCurveAtTime()`。所有时间参数都以 AudioContext 的 `currentTime` 为参考时钟。

## 4. 🤔 如何使用 AudioParam 的时间调度方法实现音频淡入淡出效果？

淡入淡出是音频处理中最基本的操作，核心思想是让音量（`gain`）从 0 逐渐上升到 1（淡入），或从当前值逐渐下降到 0（淡出）。`AudioParam` 提供了多种方法来实现这个过程，效果和适用场景各不相同。

方法一：`linearRampToValueAtTime`（线性渐变）

音量以恒定速率线性变化，适合简单的淡入淡出。

```javascript
function fadeIn(gainNode, duration) {
  const now = ctx.currentTime
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(1, now + duration)
}

function fadeOut(gainNode, duration) {
  const now = ctx.currentTime
  gainNode.gain.setValueAtTime(gainNode.gain.value, now)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)
}
```

一个关键注意点：`linearRampToValueAtTime` 的渐变起点不是调用时刻的值，而是上一个调度事件的值。所以必须先调用 `setValueAtTime` 设置起始值，再调用 `linearRampToValueAtTime` 设置终点值。如果省略 `setValueAtTime`，渐变会从上一次调度的最后一个值开始，可能导致不可预期的结果。

方法二：`exponentialRampToValueAtTime`（指数渐变）

音量以指数曲线变化。这种方式更符合人耳对响度的感知（人耳对响度的感知近似对数关系），听起来比线性渐变更自然。但注意目标值不能为 0，因为指数函数永远不会真正到达 0，需要设为一个极小值如 0.001：

```javascript
function exponentialFadeOut(gainNode, duration) {
  const now = ctx.currentTime
  gainNode.gain.setValueAtTime(gainNode.gain.value, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)
}
```

方法三：`setTargetAtTime`（指数趋近）

以指数衰减曲线趋近目标值，类似于 RC 电路的充放电特性。`timeConstant` 参数控制趋近速度（单位为秒），值越小趋近越快。与 `exponentialRamp` 不同的是，它不会在指定时间精确到达目标值，而是以 `timeConstant` 为速率逐渐趋近：

```javascript
function smoothFadeOut(gainNode, timeConstant) {
  const now = ctx.currentTime
  gainNode.gain.setTargetAtTime(0, now, timeConstant)
  // 经过 5 倍 timeConstant 后，值约为目标值的 99.3%
}
```

`setTargetAtTime` 的优势在于它永远不会产生突变，即使在参数仍在变化时插入新的调度命令也不会产生「咔嗒」噪声。这使得它非常适合处理用户随时可能触发的淡出操作（如点击暂停按钮）。

实际项目中的推荐做法是使用 `setTargetAtTime` 处理淡出（避免咔嗒声），使用 `linearRampToValueAtTime` 或 `setTargetAtTime` 处理淡入。在淡出完成后需要停止播放时，用 `setTimeout` 预估停止时间，或在 `setTargetAtTime` 之后追加一个 `linearRampToValueAtTime(0, endTime)` 来精确截止。

## 5. 🤔 PannerNode 的 HRTF 和 equalpower 模式有什么区别？

`PannerNode` 的 `panningModel` 属性决定了声音在空间中定位的算法，直接影响听感的真实程度和 CPU 开销。

`equalpower`（等功率模型）—— 基于简化的声学模型。当声源位于听者左侧时，左耳音量增大、右耳音量减小，遵循等功率定律保证左右声道的总功率恒定。实现原理是对左右声道信号分别乘以基于角度的增益系数：

- 声源在正左方（角度 -90°）：左声道 100%，右声道 0%
- 声源在正前方（角度 0°）：左右各 70.7%（等功率）
- 声源在正右方（角度 90°）：左声道 0%，右声道 100%

这种模式计算开销极低，适合大量声源同时存在的场景（如游戏中同时播放数十个音效）。但它的空间感比较粗糙，仅能区分声音的左右方位，对前后、上下等维度的区分很弱。

`HRTF`（Head-Related Transfer Function，头部相关传递函数）—— 基于真实人耳测量数据的模型。它使用预先录制的脉冲响应数据来模拟声音经过头部、耳廓、肩膀等部位的折射和衍射效果。HRTF 数据通常来自对人头模型（KEMAR 等）的消声室测量。

HRTF 的效果远比 equalpower 逼真：声音不仅有左右方位感，还能感受到前后方向和上下的位置差异。戴上耳机聆听时，声音仿佛从空间中某个具体的点发出，有明显的三维定位感。

```javascript
const panner = ctx.createPanner()
panner.panningModel = 'HRTF'

// equalpower 是默认值，以下两种写法等价
const panner2 = ctx.createPanner({ panningModel: 'equalpower' })
```

HRTF 的代价是更高的 CPU 开销。每个使用 HRTF 的 PannerNode 都需要对音频信号做卷积运算（与 HRTF 脉冲响应数据进行卷积），当场景中有数十个 HRTF PannerNode 同时工作时，CPU 负担会显著增加。

选择建议：

- 短音效数量多（超过 10 个同时发声）且对空间精度要求不高时，使用 `equalpower`
- 需要沉浸式 3D 空间体验（如 VR 音频、第一人称游戏中的环境声）时，使用 `HRTF`
- 仅需要简单的左右声道切换时，使用 `StereoPannerNode` 代替 `PannerNode`，性能开销最低

需要注意 HRTF 效果在扬声器（外放）环境下会大打折扣，因为 HRTF 的空间定位依赖双耳隔离（左耳只听左声道，右耳只听右声道），扬声器播放时左右声道会相互串扰。HRTF 在耳机佩戴条件下效果最佳。

## 6. 🤔 如何实现一个简单的音频混音器并分别控制各路音量？

音频混音器的核心结构是：每一路音源拥有独立的 `GainNode` 控制音量，各路 `GainNode` 的输出汇聚到一个共同的母线（Master Bus），母线再连接到最终输出。

```javascript
class AudioMixer {
  constructor(ctx) {
    this.ctx = ctx
    this.channels = []

    // 母线：所有通道汇聚后经过统一音量控制
    this.masterGain = ctx.createGain()
    this.masterGain.connect(ctx.destination)

    // 母线上挂载分析器用于可视化
    this.analyser = ctx.createAnalyser()
    this.masterGain.connect(this.analyser)
  }

  addChannel(name, source) {
    // 每个通道创建独立的 GainNode
    const gainNode = this.ctx.createGain()
    source.connect(gainNode)
    gainNode.connect(this.masterGain)

    const channel = { name, source, gainNode, volume: 1 }
    this.channels.push(channel)
    return channel
  }

  setChannelVolume(index, value) {
    if (this.channels[index]) {
      this.channels[index].gainNode.gain.value = value
      this.channels[index].volume = value
    }
  }

  setMasterVolume(value) {
    this.masterGain.gain.value = value
  }

  muteChannel(index) {
    this.setChannelVolume(index, 0)
  }

  soloChannel(index) {
    this.channels.forEach((ch, i) => {
      ch.gainNode.gain.value = i === index ? ch.volume : 0
    })
  }
}
```

使用方式：

```javascript
const ctx = new AudioContext();
const mixer = new AudioMixer(ctx);

// 加载三路音频
const [buffer1, buffer2, buffer3] = await Promise.all([
  loadBuffer('/audio/drums.mp3'),
  loadBuffer('/audio/bass.mp3'),
  loadBuffer('/audio/melody.mp3'),
});

// 创建音源并添加到混音器
const src1 = ctx.createBufferSource();
src1.buffer = buffer1;
src1.loop = true;
mixer.addChannel('Drums', src1);

const src2 = ctx.createBufferSource();
src2.buffer = buffer2;
src2.loop = true;
mixer.addChannel('Bass', src2);

const src3 = ctx.createBufferSource();
src3.buffer = buffer3;
src3.loop = true;
mixer.addChannel('Melody', src3);

// UI 控制
mixer.setChannelVolume(0, 0.8);  // 鼓组 80%
mixer.setChannelVolume(1, 0.6);  // 贝斯 60%
mixer.setMasterVolume(0.9);      // 主音量 90%

src1.start();
src2.start();
src3.start();
```

需要注意音量叠加问题。当多路音频同时播放时，混合后的总音量可能超过 1.0 导致削波失真。两种解决方案：

方案一：在母线上挂载 `DynamicsCompressorNode`，自动压缩超过阈值的信号：

```javascript
const compressor = ctx.createDynamicsCompressor()
compressor.threshold.value = -24
compressor.ratio.value = 4
this.masterGain.connect(compressor)
compressor.connect(ctx.destination)
```

方案二：将每路音量预设为较低值（如各路总和不超过 1.0），手动控制总音量不超标。

对于更复杂的混音器，可以在每条通道上额外串联 `BiquadFilterNode`（均衡器）和 `StereoPannerNode`（声像），形成完整的调音台界面。

## 7. 🤔 StereoPannerNode 和 PannerNode 有什么区别，应该如何选择？

这两个节点都用于控制声音的空间定位，但复杂度、功能和性能有明显差异。

`StereoPannerNode` 是一个轻量级的立体声声像控制器。它只有一个 `pan` 参数，取值范围为 -1（最左）到 1（最右），默认值为 0（居中）。它的工作原理非常简单：对立体声音频的左右声道进行增益调节，不涉及任何 3D 空间计算。

```javascript
const panner = ctx.createStereoPanner()
panner.pan.value = -0.5 // 偏左
source.connect(panner)
panner.connect(ctx.destination)
```

`StereoPannerNode` 的局限：只能控制左右方位，无法表示前后、上下、距离等三维信息。输入信号必须是立体声（双声道），单声道输入时左右平移效果不明显。

`PannerNode` 是完整的 3D 空间音频处理器。它通过设置声源在三维空间中的位置（`positionX/Y/Z`）和方向（`orientationX/Y/Z`），结合监听者（`AudioListener`）的位置，计算声音到达双耳时的音量差、时间差和频谱变化。

```javascript
const panner = ctx.createPanner()
panner.panningModel = 'HRTF'
panner.distanceModel = 'inverse'
panner.refDistance = 1
panner.maxDistance = 100
panner.positionX.value = 3 // 声源在右侧 3 米处
panner.positionY.value = 0
panner.positionZ.value = -2 // 声源在前方 2 米处
```

`PannerNode` 的 `panningModel` 支持 `equalpower` 和 `HRTF` 两种算法，`distanceModel` 支持 `inverse`、`linear`、`exponential` 三种距离衰减模型。这些 `StereoPannerNode` 都不具备。

选择建议：

需要简单的左右声道平衡控制（音乐播放器的左右声道调节、简单的立体声摆位），选择 `StereoPannerNode`。它计算开销极低，API 简洁，完全够用。

需要 3D 空间定位（游戏中的声音方位、VR 场景中的空间音频、模拟声音随距离衰减），选择 `PannerNode`。它是专门为 3D 音频场景设计的。

性能对比：`StereoPannerNode` 的计算量基本可以忽略不计。`PannerNode` 使用 `equalpower` 模式时开销较低，使用 `HRTF` 模式时开销明显增加。在需要同时处理大量声源的游戏中，可以对重要声源（如角色对话、近处爆炸）使用 `PannerNode`（HRTF），对次要声源（如远处的环境声）使用 `PannerNode`（equalpower）或 `StereoPannerNode`。

## 8. 🤔 ChannelSplitterNode 和 ChannelMergerNode 的典型使用场景是什么？

`ChannelSplitterNode` 将一个多声道音频信号拆分为多个独立的单声道输出；`ChannelMergerNode` 将多个单声道输入合并为一个多声道输出。两者是一对逆操作。

`ChannelSplitterNode` 将输入信号的每个通道分离到独立的输出端口。例如一个立体声（双声道）信号经过 `ChannelSplitterNode`（构造参数为 2）后，输出端口 0 是左声道，输出端口 1 是右声道。

```javascript
const splitter = ctx.createChannelSplitter(2)
source.connect(splitter)

// 输出端口 0 = 左声道，输出端口 1 = 右声道
splitter.connect(analyserL, 0) // 只连接左声道到分析器 A
splitter.connect(analyserR, 1) // 只连接右声道到分析器 B
```

`ChannelMergerNode` 将多个单声道输入合并。构造参数指定输出通道数，每个输入端口对应一个通道。

```javascript
const merger = ctx.createChannelMerger(2)
oscLeft.connect(merger, 0, 0) // 连接到输出的左声道
oscRight.connect(merger, 0, 1) // 连接到输出的右声道
merger.connect(ctx.destination)
```

典型使用场景：

场景一：独立分析左右声道。音频可视化中如果需要分别展示左右声道的频谱或波形，用 `ChannelSplitterNode` 将立体声信号拆分为两路，分别送入两个 `AnalyserNode`。

场景二：M/S 处理（Mid/Side Processing）。这是专业音频中常用的处理技巧。通过将立体声拆分为左（L）和右（R）声道，然后计算 M = L + R（中间信号）和 S = L - R（侧边信号），分别处理后再合成回立体声。这可以实现独立调节人声（通常在中间）和伴奏（通常在两侧）的音量。

```javascript
const splitter = ctx.createChannelSplitter(2)
const merger = ctx.createChannelMerger(2)

// L + R = Mid
const midGain = ctx.createGain()
const sumNode = ctx.createGain()

splitter.connect(sumNode, 0) // 左声道
splitter.connect(sumNode, 1) // 右声道（混合）
// ... 后续 M/S 处理链
```

场景三：自定义声道映射。需要将单声道信号映射到多声道输出的特定通道时，使用 `ChannelMergerNode` 精确控制每个输入去往哪个输出通道。例如在 5.1 环绕声中将特定音效只送到后方声道（通道 4、5）。

场景四：单声道转换。将立体声信号经过 `ChannelSplitterNode` 拆分后，只取其中一个声道，再通过 `ChannelMergerNode`（参数为 1）合并为单声道输出。这对于需要单声道处理的场景（如语音通话）很实用。

场景五：音频节点不支持多声道输入时的处理。某些音频节点（如某些效果器）只能处理单声道信号。使用 `ChannelSplitterNode` 拆分后分别处理，再用 `ChannelMergerNode` 合并回多声道。

## 9. 🤔 如何模拟声音随距离变化而衰减的效果？

`PannerNode` 内置了三种距离衰减模型，通过设置 `distanceModel` 属性选择。

`inverse`（反比模型）—— 最接近真实物理世界的声音衰减规律。声强与距离成反比（类似光的平方反比定律）。公式为：`1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)`。这是默认模型。

```javascript
const panner = ctx.createPanner()
panner.distanceModel = 'inverse'
panner.refDistance = 1 // 参考距离：1 米
panner.maxDistance = 10000 // 最大距离
panner.rolloffFactor = 1 // 衰减因子
```

`linear`（线性模型）—— 音量随距离线性衰减。公式为：`1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)`。衰减速度恒定，不随距离增加而加速。适用于需要可预测、均匀衰减的场景。

```javascript
panner.distanceModel = 'linear'
panner.refDistance = 1
panner.maxDistance = 50
panner.rolloffFactor = 0.5 // 0.5 表示到 maxDistance 时衰减到 50%
```

`exponential`（指数模型）—— 音量随距离呈指数衰减，近距离衰减慢、远距离衰减快。公式中距离以指数形式参与计算。适用于需要快速「消失」在远处的声源。

```javascript
panner.distanceModel = 'exponential'
panner.refDistance = 1
panner.maxDistance = 10000
panner.rolloffFactor = 2 // 指数越高衰减越快
```

三个关键参数的含义：

`refDistance`—— 参考距离。在此距离处声音的音量为 1.0（未衰减）。距离小于 refDistance 时声音不会被放大（不会超过 1.0），大于 refDistance 时开始衰减。

`maxDistance`—— 最大距离。超过此距离后 `inverse` 和 `linear` 模型的音量会钳位（clamped）在最低值，不再继续衰减。`exponential` 模型中此值没有效果。

`rolloffFactor`—— 衰减系数。控制衰减的速度。值越大衰减越快，值为 0 则不衰减（所有距离音量相同）。

实时更新声源位置：

在游戏中，声源和监听者的位置通常每帧都在变化。需要在游戏循环中实时更新 `PannerNode` 的位置和 `AudioListener` 的位置：

```javascript
function gameLoop() {
  // 更新声源位置（来自游戏对象的坐标）
  panner.positionX.setValueAtTime(enemy.x, ctx.currentTime)
  panner.positionY.setValueAtTime(enemy.y, ctx.currentTime)
  panner.positionZ.setValueAtTime(enemy.z, ctx.currentTime)

  // 更新监听者位置（来自玩家的坐标）
  ctx.listener.positionX.setValueAtTime(player.x, ctx.currentTime)
  ctx.listener.positionY.setValueAtTime(player.y, ctx.currentTime)
  ctx.listener.positionZ.setValueAtTime(player.z, ctx.currentTime)

  // 更新监听者朝向
  ctx.listener.forwardX.setValueAtTime(player.forwardX, ctx.currentTime)
  ctx.listener.forwardY.setValueAtTime(player.forwardY, ctx.currentTime)
  ctx.listener.forwardZ.setValueAtTime(player.forwardZ, ctx.currentTime)
  ctx.listener.upX.setValueAtTime(0, ctx.currentTime)
  ctx.listener.upY.setValueAtTime(1, ctx.currentTime)
  ctx.listener.upZ.setValueAtTime(0, ctx.currentTime)

  requestAnimationFrame(gameLoop)
}
```

性能优化：距离过远的声源不值得占用 `PannerNode` 资源。在游戏循环中计算声源与监听者的欧几里得距离，超过一定阈值时 `disconnect()` 该声源的 `PannerNode`，回到阈值内时再 `connect()` 回来。这样可以避免为远处不可闻的声源浪费 CPU 计算。
