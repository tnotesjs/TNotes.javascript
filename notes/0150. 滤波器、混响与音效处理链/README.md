# [0150. 滤波器、混响与音效处理链](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0150.%20%E6%BB%A4%E6%B3%A2%E5%99%A8%E3%80%81%E6%B7%B7%E5%93%8D%E4%B8%8E%E9%9F%B3%E6%95%88%E5%A4%84%E7%90%86%E9%93%BE)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. BiquadFilterNode 的 Q 值对滤波器的频率响应曲线有什么影响？](#3-biquadfilternode-的-q-值对滤波器的频率响应曲线有什么影响)
- [4. 如何使用多个 BiquadFilterNode 构建一个参数均衡器（Parametric EQ）？](#4-如何使用多个-biquadfilternode-构建一个参数均衡器parametric-eq)
- [5. ConvolverNode 的卷积混响原理是什么，为什么需要 impulse response 音频文件？](#5-convolvernode-的卷积混响原理是什么为什么需要-impulse-response-音频文件)
- [6. 如何使用 DelayNode 实现一个带反馈的回声效果？](#6-如何使用-delaynode-实现一个带反馈的回声效果)
- [7. DynamicsCompressorNode 的 threshold、ratio、attack、release 参数分别控制什么？](#7-dynamicscompressornode-的-thresholdratioattackrelease-参数分别控制什么)
- [8. 音效处理链中节点的串联顺序对最终音质有什么影响？](#8-音效处理链中节点的串联顺序对最终音质有什么影响)
- [9. 如何将多个效果器串联构建一个吉他效果器模拟器？](#9-如何将多个效果器串联构建一个吉他效果器模拟器)

<!-- endregion:toc -->

## 1. 本节内容

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

## 2. 评价

- todo

## 3. BiquadFilterNode 的 Q 值对滤波器的频率响应曲线有什么影响？

Q 值（Quality Factor，品质因数）控制滤波器频率响应曲线的「锐度」——即在截止频率附近的响应宽度。Q 值越高，响应曲线越窄越尖锐；Q 值越低，响应曲线越宽越平缓。

Q 值在不同滤波器类型中的表现有所不同：

对于 `lowpass`（低通）和 `highpass`（高通）滤波器，Q 值影响截止频率处的共振峰（Resonance Peak）。低 Q 值（如 0.5）时，频率响应曲线平滑过渡，没有明显的峰。高 Q 值（如 10 以上）时，截止频率处会出现一个明显的尖峰，即信号在该频率附近被放大而不是被衰减。这种效果在合成器音色设计中很常见，扫动滤波器的 Q 值可以产生标志性的「哇」音效。

```javascript
const filter = ctx.createBiquadFilter()
filter.type = 'lowpass'
filter.frequency.value = 1000
filter.Q.value = 1 // 平滑过渡
filter.Q.value = 10 // 截止频率处有明显的共振峰
filter.Q.value = 25 // 非常尖锐的共振峰
```

对于 `peaking`（峰值滤波器），Q 值决定增益提升或衰减的频带宽度。Q 值越大，影响的频率范围越窄；Q 值越小，影响范围越宽。这也是参数均衡器中最核心的参数。

```javascript
const peak = ctx.createBiquadFilter()
peak.type = 'peaking'
peak.frequency.value = 2000 // 中心频率 2kHz
peak.gain.value = 6 // 提升 6dB
peak.Q.value = 1 // 宽带影响
peak.Q.value = 10 // 窄带精确提升
```

Q 值与带宽的关系可以通过以下近似公式理解：

```
带宽（Hz）= 中心频率 / Q
```

例如中心频率为 1000Hz、Q = 10，则带宽约为 100Hz，意味着只影响 950Hz 到 1050Hz 范围。Q = 1 时带宽约为 1000Hz，影响范围为 500Hz 到 1500Hz。

对于 `bandpass`（带通滤波器），Q 值直接控制通带宽度。Q 值越高，通带越窄，选择性越强。这在提取特定频率成分（如提取某个人声的共振峰）时非常有用。

实际使用中需要注意，极高的 Q 值可能导致滤波器自激振荡（尤其在 lowpass/highpass 中），产生刺耳的反馈声。在动态调制 Q 值时（如 LFO 扫动），需要留意 Q 值的峰值范围。

---

## 4. 如何使用多个 BiquadFilterNode 构建一个参数均衡器（Parametric EQ）？

参数均衡器（Parametric EQ）允许独立调节多个频段的增益、中心频率和 Q 值。专业音频中最常见的配置是 3 段、5 段或 10 段参数均衡器。

每一段均衡器对应一个 `BiquadFilterNode`，类型为 `peaking`。所有滤波器串联连接，信号依次经过每一段的处理。

典型的 5 段参数均衡器频段划分：

| 段     | 中心频率 | 典型 Q 值 | 作用                     |
| ------ | -------- | --------- | ------------------------ |
| 低频   | 80Hz     | 0.7       | 调节低音饱满度           |
| 中低频 | 250Hz    | 1.0       | 调节声音的温暖感         |
| 中频   | 1000Hz   | 1.5       | 调节声音的清晰度和穿透力 |
| 中高频 | 4000Hz   | 2.0       | 调节齿音和明亮度         |
| 高频   | 12000Hz  | 0.7       | 调节空气感和细节         |

实现代码：

```javascript
class ParametricEQ {
  constructor(ctx) {
    this.ctx = ctx
    this.bands = []

    const defaultBands = [
      { frequency: 80, Q: 0.7, gain: 0 },
      { frequency: 250, Q: 1.0, gain: 0 },
      { frequency: 1000, Q: 1.5, gain: 0 },
      { frequency: 4000, Q: 2.0, gain: 0 },
      { frequency: 12000, Q: 0.7, gain: 0 },
    ]

    // 创建每个频段的滤波器
    defaultBands.forEach((cfg) => {
      const filter = ctx.createBiquadFilter()
      filter.type = 'peaking'
      filter.frequency.value = cfg.frequency
      filter.Q.value = cfg.Q
      filter.gain.value = cfg.gain
      this.bands.push(filter)
    })

    // 串联所有滤波器
    for (let i = 0; i < this.bands.length - 1; i++) {
      this.bands[i].connect(this.bands[i + 1])
    }
  }

  get inputNode() {
    return this.bands[0]
  }

  get outputNode() {
    return this.bands[this.bands.length - 1]
  }

  setBandGain(index, gainDb) {
    if (this.bands[index]) {
      this.bands[index].gain.value = gainDb
    }
  }

  setBandFrequency(index, freq) {
    if (this.bands[index]) {
      this.bands[index].frequency.value = freq
    }
  }

  setBandQ(index, q) {
    if (this.bands[index]) {
      this.bands[index].Q.value = q
    }
  }
}
```

使用方式：

```javascript
const eq = new ParametricEQ(ctx)

// 音源连接到均衡器输入
source.connect(eq.inputNode)
// 均衡器输出连接到目的地
eq.outputNode.connect(ctx.destination)

// 调节参数：提升低频、衰减中频
eq.setBandGain(0, 4) // 低频 +4dB
eq.setBandGain(2, -3) // 中频 -3dB
```

常见的预设 EQ 策略：

人声增强——在 2kHz 到 5kHz 提升 2 到 4dB 增加清晰度，在 200Hz 以下做高通切除减少隆隆声。

低音增强——在 60Hz 到 100Hz 提升 4 到 6dB，在 300Hz 到 500Hz 适当衰减以避免浑浊。

电话效果——用 bandpass 滤波器只保留 300Hz 到 3400Hz 范围，模拟电话线路的带宽限制。

首尾各加一个可选的滤波器节点可以扩展功能：输入端加 `highpass`（切低频隆隆声），输出端加 `lowshelf`（整体低频补偿）。

---

## 5. ConvolverNode 的卷积混响原理是什么，为什么需要 impulse response 音频文件？

ConvolverNode 通过「卷积」运算将输入信号与一个 impulse response（脉冲响应，简称 IR）进行数学卷积，从而模拟特定空间的声学特性。

混响的本质：一个声音在真实房间中传播时，会经过墙壁、天花板、地板、家具等表面的多次反射。这些反射到达人耳的时间、方向、强度各不相同，叠加在一起就形成了混响。每个房间的反射模式取决于房间的大小、形状、材质等物理特性。

Impulse Response 是对房间声学特性的「指纹记录」。在目标房间中播放一个极短的脉冲声（如气球爆炸声、电火花声），同时用麦克风录制房间中的全部声音。录制到的信号就是这个房间的 impulse response——它包含了直达声、早期反射和后期混响的全部时间信息。

卷积的数学含义：将输入信号的每一个采样点与 IR 的完整波形相乘并求和，结果就是经过该房间「处理」后的输出信号。通俗理解就是「用房间的声学特性重新绘制输入信号的每一个采样点」。

```javascript
// 加载 impulse response 文件
async function loadImpulseResponse(url) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  return audioBuffer
}

// 使用 ConvolverNode
const convolver = ctx.createConvolver()
const irBuffer = await loadImpulseResponse('/ir/cathedral.wav')
convolver.buffer = irBuffer

source.connect(convolver)
convolver.connect(ctx.destination)
```

为什么需要 impulse response 文件而不能用代码生成：

因为真实空间的反射模式极其复杂，涉及数千次反射的精确时间、幅度和频率特性。用物理建模方式从零计算这些反射在计算上极其昂贵且难以精确。而 IR 录制是一种「先测量、后使用」的方法——只需要在真实空间中录制一次，就可以反复使用这个 IR 文件来模拟该空间。

不过也可以用代码生成合成的 IR，虽然不如真实录制精确，但可以自由调节混响参数：

```javascript
function generateSyntheticIR(duration, decay) {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(2, length, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return buffer
}

// 2 秒混响，快速衰减
const shortReverb = generateSyntheticIR(2, 3)
// 5 秒混响，缓慢衰减（模拟大教堂）
const longReverb = generateSyntheticIR(5, 1.5)
```

这种方法用随机噪声乘以指数衰减包络来近似混响的统计特性，但缺少真实 IR 中的早期反射细节和频率相关的衰减特性。

常见的免费 IR 资源包括各种录音棚、音乐厅、大教堂、板式混响器等录制的 IR 文件，格式通常为 WAV。

干湿比（Dry/Wet Mix）控制：实际使用中通常不会将原始信号完全替换为混响信号，而是按比例混合。在 ConvolverNode 旁并联一条直通路径，通过各自的 GainNode 控制比例：

```javascript
const dryGain = ctx.createGain()
const wetGain = ctx.createGain()
dryGain.gain.value = 0.7 // 70% 干声
wetGain.gain.value = 0.3 // 30% 混响

source.connect(dryGain)
source.connect(convolver)
convolver.connect(wetGain)
dryGain.connect(ctx.destination)
wetGain.connect(ctx.destination)
```

---

## 6. 如何使用 DelayNode 实现一个带反馈的回声效果？

DelayNode 是 Web Audio API 中的延迟效果节点，核心属性是 `delayTime`（延迟时间，单位为秒）。通过将延迟后的信号重新送回延迟器的输入端，就能产生反馈回声效果——每次回声比上一次稍弱，逐渐衰减。

基本结构：输入信号经过 DelayNode 延迟后输出，同时将延迟输出的一部分通过 GainNode 衰减后送回 DelayNode 的输入端，形成反馈环路。

```javascript
function createEchoEffect(ctx, delayTime = 0.3, feedbackAmount = 0.4) {
  const delay = ctx.createDelay(5) // 最大延迟 5 秒
  const feedback = ctx.createGain()
  const wetGain = ctx.createGain()

  delay.delayTime.value = delayTime
  feedback.gain.value = feedbackAmount
  wetGain.gain.value = 0.5

  // 反馈环路：延迟输出 → 衰减 → 回到延迟输入
  delay.connect(feedback)
  feedback.connect(delay)

  // 延迟输出同时送到输出端
  delay.connect(wetGain)

  return {
    input: delay,
    output: wetGain,
    delay,
    feedback,
  }
}
```

使用方式：

```javascript
const echo = createEchoEffect(ctx, 0.4, 0.35)

source.connect(echo.input)
echo.output.connect(ctx.destination)
// 同时发送一份原始信号直达输出
source.connect(ctx.destination)
```

信号流动路径如下：

```
输入信号 → DelayNode（延迟 0.4s）→ 输出（35% 回到 DelayNode 形成循环）
                                      → 输出到扬声器
```

第一声回声在 0.4 秒后出现，第二声在 0.8 秒后出现（音量为第一声的 35%），第三声在 1.2 秒后出现（音量为第一声的 35% × 35% = 12.25%），如此递减直到人耳不可闻。

`delayTime` 的 AudioParam 特性：

`delayTime` 是一个 `AudioParam`，这意味着可以在运行时动态修改延迟时间。但需要注意，在延迟过程中改变 `delayTime` 会导致音频数据的读取位置突变，产生类似磁带刮擦的噪声。如果需要平滑地改变延迟时间，应使用 `linearRampToValueAtTime` 而非直接赋值：

```javascript
// 平滑改变延迟时间
echo.delay.delayTime.linearRampToValueAtTime(0.6, ctx.currentTime + 0.1)
```

`feedback.gain` 的注意事项：

这个值必须严格小于 1。如果设为 1 或更高，反馈信号不会衰减反而会保持或增强，导致无限循环甚至信号振幅越来越大直至削波和啸叫。通常设为 0.2 到 0.6 之间。0.2 产生轻微的回声，0.6 产生明显的多次回声。

更丰富的回声效果可以加入滤波器和立体声处理。在反馈环路中插入低通滤波器模拟真实回声中高频逐渐衰减的特性（远处的回声听起来更闷）：

```javascript
function createWarmEcho(ctx, delayTime = 0.35, feedbackAmount = 0.4) {
  const delay = ctx.createDelay(5)
  const feedback = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  const wetGain = ctx.createGain()

  delay.delayTime.value = delayTime
  feedback.gain.value = feedbackAmount
  filter.type = 'lowpass'
  filter.frequency.value = 2000 // 每次回声会逐渐变闷
  wetGain.gain.value = 0.4

  // 反馈环路中加入滤波器
  delay.connect(filter)
  filter.connect(feedback)
  feedback.connect(delay)

  delay.connect(wetGain)

  return { input: delay, output: wetGain }
}
```

Ping-Pong 延迟效果：在立体声中，左声道的回声出现在右声道，右声道的回声出现在左声道，形成左右交替的回声。需要使用 ChannelSplitterNode 和 ChannelMergerNode 将左右声道的延迟分别发送到对侧。

---

## 7. DynamicsCompressorNode 的 threshold、ratio、attack、release 参数分别控制什么？

`DynamicsCompressorNode` 是一个动态范围压缩器。它自动降低超过阈值的信号幅度，使音量更均匀，防止削波并提升整体响度感知。在专业音频中是必不可少的处理环节。

`threshold`（阈值）—— 触发压缩的音量门限，单位为 dB。默认值通常为 -24dB。当输入信号的幅度超过 threshold 时，超出部分会被压缩衰减。threshold 越低（如 -40dB），压缩器越「敏感」，更多的信号会被压缩；threshold 越高（如 -6dB），只有特别响的信号才触发压缩。

```javascript
const compressor = ctx.createDynamicsCompressor()
compressor.threshold.value = -24 // 默认值
compressor.threshold.value = -12 // 只压缩较响的信号
```

`ratio`（压缩比）—— 超出阈值部分的压缩力度。ratio = 4 表示每超出阈值 4dB 的信号，输出只增加 1dB。ratio 越大压缩越激烈：ratio = 2（轻微压缩），ratio = 4（中等压缩），ratio = 10 以上（强力压缩），ratio = Infinity（限制器 Limiter，输出永远不会超过阈值）。

```javascript
compressor.ratio.value = 4 // 4:1 压缩比
compressor.ratio.value = 12 // 接近限制器
compressor.ratio.value = 20 // 作为限制器使用
```

`attack`（起音时间）—— 压缩器检测到信号超过阈值后，完全施加压缩所需的时间，单位为秒。attack 越短（如 0.001 秒 = 1ms），压缩器对瞬态信号（如鼓声的起音）的反应越快，能有效控制峰值但可能损失声音的冲击感。attack 越长（如 0.1 秒 = 100ms），瞬态信号能短暂「穿透」阈值不受压缩，保留声音的力度和冲击感。

```javascript
compressor.attack.value = 0.003 // 3ms，快速反应
compressor.attack.value = 0.03 // 30ms，保留瞬态冲击感
```

`release`（释放时间）—— 信号回落到阈值以下后，压缩器完全停止压缩所需的时间，单位为秒。release 越短（如 0.05 秒），压缩器快速停止工作，声音恢复自然但可能产生「呼吸感」（音量快速起伏）。release 越长（如 0.5 秒），压缩过渡平滑但可能影响动态表现。

```javascript
compressor.release.value = 0.25 // 250ms，平衡的释放时间
```

`knee`（拐点）—— 控制压缩曲线在阈值附近的过渡方式。默认值约为 30。较小的值（硬拐点，Hard Knee）表示信号一超过阈值就立刻以完整 ratio 压缩。较大的值（软拐点，Soft Knee）表示在阈值附近有一个渐进的过渡区间，压缩效果更自然、不易察觉。

```javascript
compressor.knee.value = 10 // 较硬的拐点
compressor.knee.value = 40 // 较软的拐点
```

还有一个只读属性 `reduction`（增益缩减量），返回当前压缩器正在对信号施加多少 dB 的增益削减。这个值可以用于 UI 显示，例如绘制一个增益缩减量表（Gain Reduction Meter）来可视化压缩器的工作状态：

```javascript
function updateMeter() {
  requestAnimationFrame(updateMeter)
  const reduction = compressor.reduction
  meterDisplay.textContent = `${reduction.toFixed(1)} dB`
}
```

常见的压缩器预设：

轻柔压缩（播客/人声）—— threshold: -18, ratio: 3, attack: 0.01, release: 0.25。提升安静部分的音量，让人声更均匀。

强力限制（防止削波）—— threshold: -3, ratio: 20, attack: 0.001, release: 0.1。确保输出绝对不超过阈值。

---

## 8. 音效处理链中节点的串联顺序对最终音质有什么影响？

节点的串联顺序直接决定了每个效果器处理的是什么信号，从而产生完全不同的音质结果。这与吉他效果器板上的踏板顺序原理相同。

核心原则：前面的效果器处理的是相对「干净」的信号，后面的接收到的是已经被前面处理过的信号。

以一个包含均衡器、失真、压缩、混响的效果链为例，不同排列顺序的效果：

顺序一：EQ → 失真 → 压缩 → 混响

EQ 在最前面调节原始信号的频率平衡，然后失真器处理这个已经调过频的信号。EQ 提升的频段在失真后会更突出。压缩器控制失真后信号的动态范围。混响在最后给整个信号加上空间感。这是最常规的吉他效果器排列方式。

顺序二：失真 → EQ → 压缩 → 混响

失真先作用于原始信号，产生的谐波非常丰富。EQ 放在失真后可以精确裁剪失真产生的不需要的频率成分（如过于刺耳的高频）。这种顺序在调音时更直观，因为 EQ 调节的是「失真后的最终音色」。

顺序三：压缩 → EQ → 失真 → 混响

压缩器先将信号动态范围压平，送入失真器的信号幅度更均匀。这意味着失真器的工作状态更稳定，不会有突然的大信号导致过度失真。适合需要「平滑」失真感的场景。

顺序四：EQ → 失真 → 混响 → 压缩

压缩器放在最后会同时压缩原始混响信号。如果混响尾音很响，压缩器会把它压下来。这可能产生不自然的效果，但在某些音乐风格（如 Shoegaze）中是刻意追求的声音。

关键原则总结：

失真/过载类效果器通常放在前面（压缩之前或之后视需求而定），因为它们对输入信号的幅度非常敏感。

均衡器的位置灵活：放在失真前面用于塑造失真的音色，放在失真后面用于精修最终音色。

压缩器可以放在失真前（稳定输入）或失真后（控制输出动态），效果截然不同。

混响和延迟通常放在链条的最后。如果放在失真或压缩之前，失真器会把混响尾音也一起失真，产生浑浊的声音。

空间类效果器（混响、延迟）通常在动态类效果器（压缩）之后，因为压缩器会把混响的微妙动态差异压掉。

在 Web Audio API 中实现时，修改串联顺序只需改变 connect 的目标：

```javascript
// 顺序 A：EQ → 失真 → 压缩
eq.connect(distortion)
distortion.connect(compressor)
compressor.connect(ctx.destination)

// 顺序 B：失真 → 压缩 → EQ
distortion.connect(compressor)
compressor.connect(eq)
eq.connect(ctx.destination)
```

如果需要在运行时动态切换顺序，可以先全部 disconnect 再按新顺序重新 connect。切换瞬间可能产生轻微的音频断裂，可以在切换时做短暂的淡入淡出来掩盖。

---

## 9. 如何将多个效果器串联构建一个吉他效果器模拟器？

吉他效果器模拟器需要串联多个效果处理模块，模拟吉他信号从拾音器到音箱的完整信号链。典型的效果链为：吉他输入 → 噪声门 → 压缩 → 失真/过载 → EQ → 延迟 → 混响 → 音箱模拟 → 输出。

第一步：搭建基础架构。

```javascript
class GuitarEffectChain {
  constructor(ctx) {
    this.ctx = ctx

    // 创建所有效果器节点
    this.gate = this.createGate()
    this.compressor = this.createCompressor()
    this.distortion = this.createDistortion()
    this.eq = this.createEQ()
    this.delay = this.createDelay()
    this.reverb = this.createReverb()

    // 按顺序串联
    this.chain = [
      this.gate,
      this.compressor,
      this.distortion,
      this.eq,
      this.delay,
      this.reverb,
    ]

    this.reconnect()
  }

  reconnect() {
    // 断开所有连接
    this.chain.forEach((node) => node.disconnect())

    // 按顺序重新连接
    for (let i = 0; i < this.chain.length - 1; i++) {
      this.chain[i].connect(this.chain[i + 1])
    }
  }

  get input() {
    return this.chain[0]
  }

  get output() {
    return this.chain[this.chain.length - 1]
  }
}
```

第二步：实现失真效果器。失真的原理是将信号幅度「削平」，产生谐波失真。用 `WaveShaperNode` 实现最方便：

```javascript
createDistortion() {
  const waveshaper = this.ctx.createWaveShaper();
  const inputGain = this.ctx.createGain();
  const outputGain = this.ctx.createGain();

  waveshaper.curve = this.makeDistortionCurve(200);
  waveshaper.oversample = '4x'; // 上采样减少混叠失真

  inputGain.connect(waveshaper);
  waveshaper.connect(outputGain);

  return {
    node: inputGain,
    connect(dest) { outputGain.connect(dest); },
    disconnect() { outputGain.disconnect(); },
    setDrive(amount) {
      inputGain.gain.value = amount; // 信号增益即为失真度
    },
  };
}

makeDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) /
               (Math.PI + amount * Math.abs(x));
  }
  return curve;
}
```

第三步：实现噪声门（Noise Gate）。噪声门在信号低于阈值时静音，消除吉他不弹奏时拾音器的底噪。可以用 `DynamicsCompressorNode` 配合高阈值近似实现，或用 `AudioWorklet` 精确实现：

```javascript
createGate() {
  // 简易噪声门：使用 DynamicsCompressor 的极端设置近似
  const comp = this.ctx.createDynamicsCompressor();
  comp.threshold.value = -50;
  comp.ratio.value = 20;
  comp.attack.value = 0.001;
  comp.release.value = 0.05;
  comp.knee.value = 0;
  return comp;
}
```

第四步：实现音箱模拟。真实吉他音箱本身就是一个重要的音色塑造环节——电子管音箱会增加温暖的谐波失真，箱体的扬声器会切除高频。最精确的方式是使用 ConvolverNode 加载真实音箱的 impulse response：

```javascript
createAmpSimulator(irUrl) {
  const convolver = this.ctx.createConvolver();
  // 加载音箱 IR 文件（事先录制的真实音箱脉冲响应）
  fetch(irUrl)
    .then(r => r.arrayBuffer())
    .then(buf => this.ctx.decodeAudioData(buf))
    .then(ir => { convolver.buffer = ir; });
  return convolver;
}
```

第五步：实现干湿比控制和旁通（Bypass）。

```javascript
class EffectUnit {
  constructor(ctx, effectNode) {
    this.ctx = ctx
    this.effectNode = effectNode
    this.bypassed = false

    this.input = ctx.createGain()
    this.dryGain = ctx.createGain()
    this.wetGain = ctx.createGain()
    this.output = ctx.createGain()

    this.dryGain.gain.value = 0
    this.wetGain.gain.value = 1

    this.input.connect(this.effectNode)
    this.effectNode.connect(this.wetGain)
    this.input.connect(this.dryGain)
    this.dryGain.connect(this.output)
    this.wetGain.connect(this.output)
  }

  setMix(value) {
    this.dryGain.gain.value = 1 - value
    this.wetGain.gain.value = value
  }

  toggleBypass() {
    this.bypassed = !this.bypassed
    if (this.bypassed) {
      this.dryGain.gain.value = 1
      this.wetGain.gain.value = 0
    } else {
      this.dryGain.gain.value = 0
      this.wetGain.gain.value = 1
    }
  }
}
```

第六步：连接音频输入。使用 `getUserMedia` 获取吉他音频接口的输入：

```javascript
async function startGuitarInput(effectChain) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 44100,
    },
  })

  const source = ctx.createMediaStreamSource(stream)
  source.connect(effectChain.input)
  effectChain.output.connect(ctx.destination)
}
```

务必关闭 `echoCancellation`、`noiseSuppression` 和 `autoGainControl`，因为这些浏览器原生处理会破坏吉他的原始音色。

音频接口的延迟是吉他模拟器的关键指标。Web Audio API 的缓冲区大小通常由浏览器决定（约 128 到 512 采样），在 44100Hz 采样率下对应约 3ms 到 12ms 的延迟。人耳能感知的最小延迟约为 10ms，吉他手通常能接受的延迟上限约为 20ms。如果延迟过大，可以尝试在创建 AudioContext 时指定 `latencyHint: 'interactive'` 来请求更低的延迟。
