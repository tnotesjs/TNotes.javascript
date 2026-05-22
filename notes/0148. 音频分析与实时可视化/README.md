# [0148. 音频分析与实时可视化](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0148.%20%E9%9F%B3%E9%A2%91%E5%88%86%E6%9E%90%E4%B8%8E%E5%AE%9E%E6%97%B6%E5%8F%AF%E8%A7%86%E5%8C%96)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AnalyserNode 的 fftSize 为什么必须是 2 的幂次方？](#3--analysernode-的-fftsize-为什么必须是-2-的幂次方)
- [4. 🤔 frequencyBinCount 和 fftSize 之间是什么关系？](#4--frequencybincount-和-fftsize-之间是什么关系)
- [5. 🤔 getByteFrequencyData 和 getFloatFrequencyData 返回的数据有什么区别？](#5--getbytefrequencydata-和-getfloatfrequencydata-返回的数据有什么区别)
- [6. 🤔 如何使用 Canvas 绘制实时音频频谱柱状图？](#6--如何使用-canvas-绘制实时音频频谱柱状图)
- [7. 🤔 如何从 AnalyserNode 的数据中计算当前音频的整体响度？](#7--如何从-analysernode-的数据中计算当前音频的整体响度)
- [8. 🤔 smoothingTimeConstant 属性对可视化效果有什么影响？](#8--smoothingtimeconstant-属性对可视化效果有什么影响)
- [9. 🤔 如何实现一个跟随音乐节奏脉动的动画效果？](#9--如何实现一个跟随音乐节奏脉动的动画效果)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AnalyserNode 创建与配置
- fftSize 与频率分辨率
- frequencyBinCount 属性
- getByteFrequencyData() 频率数据
- getByteTimeDomainData() 时域波形
- getFloatFrequencyData() 浮点精度数据
- Canvas 绘制频谱图与波形图
- requestAnimationFrame 实时更新循环
- smoothingTimeConstant 平滑系数
- RMS 音量计算

## 2. 🫧 评价

- todo

## 3. 🤔 AnalyserNode 的 fftSize 为什么必须是 2 的幂次方？

这是因为 AnalyserNode 内部使用的是 FFT（快速傅里叶变换）算法，而 FFT 算法的工作原理决定了输入数据的长度必须是 2 的幂次方。

FFT 的核心思想是「分治法」。它将一个长度为 N 的离散傅里叶变换（DFT）递归地拆分为两个长度为 N/2 的子问题，再将 N/2 拆分为 N/4，如此递归直到问题规模为 1。这种拆分方式要求 N 必须能被 2 整除多次，即 N 必须是 2 的幂次方。如果 N 不是 2 的幂次方，递归拆分在某一步就会遇到奇数长度，无法继续对半拆分。

DFT 的朴素算法时间复杂度为 O(N²)，而 FFT 利用 2 的幂次方的递归结构将复杂度降低到 O(N log N)。以 fftSize = 2048 为例，朴素 DFT 需要约 420 万次运算，FFT 只需要约 22000 次，性能差距巨大。这也是音频实时分析能在浏览器中流畅运行的前提。

AnalyserNode 支持的 fftSize 范围是 32 到 32768，且必须为 2 的幂次方（32、64、128、256、512、1024、2048、4096、8192、16384、32768）。默认值为 2048。

如果赋值一个非 2 的幂次方的值，浏览器会抛出 `IndexSizeError` 异常：

```javascript
const analyser = ctx.createAnalyser()
analyser.fftSize = 2000 // ❌ IndexSizeError
analyser.fftSize = 2048 // ✅
```

fftSize 的大小直接影响频率分辨率和时间分辨率之间的权衡：

fftSize 越大，频率分辨率越高（能区分更细微的频率差异），但时间分辨率越低（每帧需要更多采样数据，更新更慢）。fftSize 越小则反之。对于音乐可视化，2048 是一个常用平衡点。对于需要快速响应的语音分析，可以使用 512 或 1024。

## 4. 🤔 frequencyBinCount 和 fftSize 之间是什么关系？

`frequencyBinCount` 是 `fftSize` 的一半，即 `frequencyBinCount = fftSize / 2`。

```javascript
const analyser = ctx.createAnalyser()
analyser.fftSize = 2048
console.log(analyser.frequencyBinCount) // 1024
```

这个关系源于 FFT 输出的数学特性。对一个长度为 N 的实数信号做 FFT，会得到 N 个复数输出。但由于输入是实数信号，FFT 的输出具有共轭对称性——频谱的后半部分是前半部分的镜像共轭，不包含额外信息。因此有意义的频率数据只有前 N/2 个。

具体来说，这 N/2 个频率仓（Frequency Bin）对应从 0Hz（直流分量）到奈奎斯特频率（采样率的一半）之间的频率范围。每个频率仓覆盖的频率宽度为 `sampleRate / fftSize`。

以 fftSize = 2048、sampleRate = 44100Hz 为例：

- 频率分辨率：44100 / 2048 ≈ 21.53Hz
- 第 0 个 bin 对应 0Hz（直流）
- 第 1 个 bin 对应 21.53Hz
- 第 2 个 bin 对应 43.07Hz
- ...
- 第 1023 个 bin 对应约 22006Hz（奈奎斯特频率）

`frequencyBinCount` 也是 `getByteFrequencyData()` 和 `getFloatFrequencyData()` 返回数组的长度。创建这个长度的 `Uint8Array` 或 `Float32Array` 来接收数据：

```javascript
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

analyser.getByteFrequencyData(dataArray)
console.log(dataArray.length) // 1024
```

需要注意，`frequencyBinCount` 是只读属性，不能手动设置。它完全由 `fftSize` 决定。如果想改变数据的长度或精度，只能通过修改 `fftSize` 来间接实现。

## 5. 🤔 getByteFrequencyData 和 getFloatFrequencyData 返回的数据有什么区别？

两个方法返回的都是频率域数据（频谱），但数据格式和精度不同。

`getByteFrequencyData(array)` 将频谱数据填充到 `Uint8Array` 中。每个值为 0 到 255 的整数，表示对应频率仓的信号强度。0 表示最低（由 `minDecibels` 决定），255 表示最高（由 `maxDecibels` 决定）。数据在 minDecibels 和 maxDecibels 之间做线性映射后量化为 8 位整数。

```javascript
const bufferLength = analyser.frequencyBinCount
const byteData = new Uint8Array(bufferLength)
analyser.getByteFrequencyData(byteData)
// byteData[0] = 128 表示第 0 个频率仓的强度约为中间值
```

`getFloatFrequencyData(array)` 将频谱数据填充到 `Float32Array` 中。每个值是以 dB（分贝）为单位的浮点数，精确反映频率仓的实际信号强度。值通常为负数，0dB 表示最大信号幅度，-Infinity 表示完全静音。

```javascript
const floatData = new Float32Array(bufferLength)
analyser.getFloatFrequencyData(floatData)
// floatData[0] = -45.2 表示第 0 个频率仓的强度为 -45.2 dB
```

关键差异对比：

精度方面：`getByteFrequencyData` 是 8 位量化，只有 256 个离散等级，对于需要精确分析的场景（如音高检测、频谱分析仪）精度不足。`getFloatFrequencyData` 提供 32 位浮点精度，适合精确计算。

值域方面：字节版本的值域由 `minDecibels`（默认 -100dB）和 `maxDecibels`（默认 -30dB）决定。浮点版本直接返回原始 dB 值，不受这两个属性的映射影响。

使用场景：

`getByteFrequencyData` 适合可视化场景——绘制频谱柱状图、驱动动画。数据已经是 0-255 的整数，可以直接映射为柱子高度或颜色亮度，无需额外计算。Canvas 绘图中直接用作像素级别的数据非常方便。

`getFloatFrequencyData` 适合分析场景——计算总响度（RMS）、检测特定频率的能量、做音高分析。浮点 dB 值可以直接参与数学运算（如对数运算、阈值比较），精度更高。

还有第三个方法 `getFloatTimeDomainData()`，返回时域的浮点波形数据（-1 到 1），适合需要精确波形分析的场景（如过零率计算、波形显示）。

## 6. 🤔 如何使用 Canvas 绘制实时音频频谱柱状图？

频谱柱状图是最常见的音频可视化形式。核心流程是：在每一帧中从 AnalyserNode 获取频率数据，然后映射为柱子的高度绘制到 Canvas 上。

HTML 结构非常简单，只需要一个 Canvas 元素：

```html
<canvas id="spectrum" width="800" height="300"></canvas>
```

JavaScript 实现：

```javascript
const canvas = document.getElementById('spectrum')
const ctx2d = canvas.getContext('2d')
const analyser = ctx.createAnalyser()
analyser.fftSize = 256

const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

function drawSpectrum() {
  requestAnimationFrame(drawSpectrum)

  analyser.getByteFrequencyData(dataArray)

  ctx2d.fillStyle = '#0d0d0d'
  ctx2d.fillRect(0, 0, canvas.width, canvas.height)

  const barWidth = (canvas.width / bufferLength) * 2.5
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height

    const hue = (i / bufferLength) * 360
    ctx2d.fillStyle = `hsl(${hue}, 80%, 55%)`
    ctx2d.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

    x += barWidth + 1
  }
}

drawSpectrum()
```

几个关键细节和优化方向：

频率分辨率的取舍。上面使用 fftSize = 256，frequencyBinCount = 128，意味着只有 128 个频率仓。在 800 像素宽的 Canvas 上每个柱子约 7.8 像素宽，视觉上刚好合适。如果使用 fftSize = 2048（1024 个 bin），要么绘制过多柱子导致拥挤，要么需要合并相邻的 bin。通常可视化不需要太高的频率分辨率，fftSize = 256 或 512 即可。

低频部分的细化。人耳对低频更敏感，且低频的频率差异更容易被察觉。可以在绘制时对低频区域使用更多的柱子、高频区域合并柱子，模拟人耳的对数频率感知：

```javascript
function drawLogSpectrum() {
  requestAnimationFrame(drawLogSpectrum)
  analyser.getByteFrequencyData(dataArray)

  ctx2d.fillStyle = '#0d0d0d'
  ctx2d.fillRect(0, 0, canvas.width, canvas.height)

  const barCount = 64
  const logBase = Math.pow(bufferLength, 1 / barCount)

  for (let i = 0; i < barCount; i++) {
    const startIndex = Math.floor(Math.pow(logBase, i))
    const endIndex = Math.floor(Math.pow(logBase, i + 1))

    // 对该区间内的频率数据取平均值
    let sum = 0
    for (let j = startIndex; j < endIndex && j < bufferLength; j++) {
      sum += dataArray[j]
    }
    const avg = sum / (endIndex - startIndex)
    const barHeight = (avg / 255) * canvas.height

    const barWidth = canvas.width / barCount
    const x = i * barWidth

    ctx2d.fillStyle = `hsl(${240 - (i / barCount) * 180}, 80%, 55%)`
    ctx2d.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight)
  }
}
```

圆角柱子效果。使用 `ctx2d.roundRect()` 替代 `fillRect` 可以让柱子看起来更柔和。或者手动用 `arc` 绘制圆角顶部。

渐变色和倒影效果。将每个柱子的颜色从底部到顶部设置为渐变，并在柱子下方绘制半透明的倒影，可以显著提升视觉效果。

## 7. 🤔 如何从 AnalyserNode 的数据中计算当前音频的整体响度？

整体响度的计算通常使用 RMS（均方根）方法。RMS 代表信号的有效幅度值，与人耳感知的响度有较好的对应关系。

使用时域数据计算 RMS：

```javascript
function calculateRMS(analyser) {
  const bufferLength = analyser.fftSize
  const dataArray = new Float32Array(bufferLength)
  analyser.getFloatTimeDomainData(dataArray)

  let sumOfSquares = 0
  for (let i = 0; i < bufferLength; i++) {
    sumOfSquares += dataArray[i] * dataArray[i]
  }

  const rms = Math.sqrt(sumOfSquares / bufferLength)
  return rms
}

function rmsToDecibels(rms) {
  if (rms === 0) return -Infinity
  return 20 * Math.log10(rms)
}
```

RMS 的计算过程：对时域波形的每个采样值取平方，求平均值，再开方。结果是一个 0 到 1 之间的浮点数（Web Audio API 中信号幅度的范围为 -1 到 1）。RMS 值为 1 表示满幅信号（非常响），0.1 表示较安静，0 表示完全静音。

转为分贝后（`rmsToDecibels`），0dB 表示满幅信号，-20dB 大约为 RMS 0.1 的信号，-60dB 大约为 RMS 0.001 的信号。

也可以使用频率域数据（`getByteFrequencyData`）近似计算响度。将所有频率仓的值取平均：

```javascript
function calculateLoudnessFromFrequency(analyser) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i]
  }

  return sum / bufferLength / 255 // 归一化到 0-1
}
```

频率域方法得到的是近似值，精度不如时域 RMS 方法，但计算更简单，且可以直接复用频谱可视化中已经获取的数据，不需要额外调用 `getFloatTimeDomainData`。

更接近专业音频计量的方式是加权 RMS。人耳对不同频率的灵敏度不同（对中频 1kHz 到 4kHz 最敏感，对低频和极高频较不敏感）。可以参考 ITU-R BS.1770 标准的 K 加权方式，先对频率数据按人耳灵敏度曲线加权后再计算 RMS。简化版本可以只对低频部分做衰减：

```javascript
function weightedLoudness(analyser) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  let weightedSum = 0
  for (let i = 0; i < bufferLength; i++) {
    const frequency = (i / bufferLength) * (ctx.sampleRate / 2)
    // 简化的 A 加权：低频和极高频衰减
    let weight = 1
    if (frequency < 200) weight *= frequency / 200
    if (frequency > 8000) weight *= Math.max(0, 1 - (frequency - 8000) / 16000)

    weightedSum += (dataArray[i] / 255) * weight
  }

  return weightedSum / bufferLength
}
```

## 8. 🤔 smoothingTimeConstant 属性对可视化效果有什么影响？

`smoothingTimeConstant` 是 AnalyserNode 的一个属性，取值范围为 0 到 1（含边界），默认值为 0.8。它控制频谱数据在相邻帧之间的平滑程度。

底层实现原理是一个一阶 IIR（无限脉冲响应）低通滤波器。每一帧的新频谱数据与上一帧的旧数据按以下公式混合：

```
当前显示值 = 上一帧显示值 * smoothingTimeConstant + 当前帧新值 * (1 - smoothingTimeConstant)
```

当 `smoothingTimeConstant = 0` 时，完全没有平滑，每帧显示的都是当前帧的即时数据。频谱柱状图会剧烈跳动，视觉上看起来很「抖」但响应非常灵敏。适合需要即时反应的场景，如打击乐的瞬态检测。

当 `smoothingTimeConstant = 0.8`（默认值）时，80% 的权重来自上一帧，20% 来自当前帧。频谱变化比较平缓，视觉上流畅但有轻微滞后感。这是可视化场景的通用默认值。

当 `smoothingTimeConstant = 1` 时，完全使用上一帧的数据，当前帧的新数据权重为 0。频谱会「冻结」在某一帧的状态，不再更新。实际使用中不会设为 1。

视觉效果对比：

```javascript
// 无平滑：柱状图剧烈抖动，瞬态响应快
analyser.smoothingTimeConstant = 0

// 中等平滑：柱状图流畅过渡，适合大多数可视化
analyser.smoothingTimeConstant = 0.85

// 高平滑：变化非常缓慢，适合趋势性展示
analyser.smoothingTimeConstant = 0.95
```

实际选择建议：

音乐频谱可视化通常设为 0.8 到 0.9，视觉效果既流畅又不会过度滞后。打击乐或鼓组的可视化可以适当降低到 0.6 到 0.7，保留更多瞬态细节。音量表（VU Meter）类展示可以设为 0.9 以上，让指针运动更平稳。

需要注意 `smoothingTimeConstant` 只影响 `getByteFrequencyData()` 和 `getFloatFrequencyData()` 返回的频率域数据，不影响 `getByteTimeDomainData()` 和 `getFloatTimeDomainData()` 返回的时域波形数据。时域数据始终是即时的，没有平滑处理。

如果需要对时域数据也做平滑，需要自己在 JavaScript 中实现类似的指数平均：

```javascript
let smoothedLoudness = 0
const alpha = 0.8

function updateLoudness(analyser) {
  const instantLoudness = calculateRMS(analyser)
  smoothedLoudness = smoothedLoudness * alpha + instantLoudness * (1 - alpha)
  return smoothedLoudness
}
```

## 9. 🤔 如何实现一个跟随音乐节奏脉动的动画效果？

节奏脉动动画的核心思路是：将音频的实时响度映射为某个视觉元素的缩放比例、亮度或其他视觉属性，使元素「跟随」音乐的节拍产生呼吸般的脉动效果。

最直接的方式是将 RMS 响度映射为元素的 `transform: scale()` 值：

```javascript
const element = document.getElementById('pulse-circle')

function pulseAnimation() {
  requestAnimationFrame(pulseAnimation)

  const dataArray = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(dataArray)

  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i]
  }
  const rms = Math.sqrt(sum / dataArray.length)

  // 将 rms 映射到缩放范围，0 静音时缩放为 1，响亮时放大到 1.3
  const scale = 1 + rms * 3
  element.style.transform = `scale(${scale})`
}

pulseAnimation()
```

但这种方式有一个问题：音乐的原始波形波动非常快（每秒数千次），直接映射会导致元素快速震颤而非有节奏感的脉动。需要对响度值做平滑处理，只保留低频的「包络」变化：

```javascript
let smoothLevel = 0
const smoothFactor = 0.85 // 值越大平滑越强，节奏感越明显

function smoothPulse() {
  requestAnimationFrame(smoothPulse)

  const dataArray = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(dataArray)

  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i]
  }
  const rms = Math.sqrt(sum / dataArray.length)

  // 指数平滑：保留低频包络，过滤高频波动
  smoothLevel = smoothLevel * smoothFactor + rms * (1 - smoothFactor)

  const scale = 1 + smoothLevel * 4
  const brightness = 100 + smoothLevel * 200

  element.style.transform = `scale(${scale})`
  element.style.filter = `brightness(${brightness}%)`
}

smoothPulse()
```

更精细的节奏检测可以使用频率域数据，单独提取低频段（如 60Hz 到 150Hz，通常是底鼓和贝斯的频率范围）的能量来驱动脉动，因为低频最能代表节奏脉冲：

```javascript
function bassLevel(analyser) {
  const frequencyData = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(frequencyData)

  const binCount = analyser.frequencyBinCount
  const sampleRate = ctx.sampleRate
  const binWidth = sampleRate / (binCount * 2)

  // 取 60Hz 到 150Hz 范围的能量
  const lowBin = Math.floor(60 / binWidth)
  const highBin = Math.floor(150 / binWidth)

  let sum = 0
  for (let i = lowBin; i <= highBin; i++) {
    sum += frequencyData[i]
  }

  return sum / (highBin - lowBin + 1) / 255
}
```

结合 CSS `transition` 可以让脉动更加平滑自然：

```css
#pulse-circle {
  transition:
    transform 0.08s ease-out,
    box-shadow 0.08s ease-out;
}
```

过渡时间设为 80 到 120 毫秒，既不会太滞后又能在视觉上消除细微的抖动。

对于更高级的节奏脉动效果，可以结合节拍检测算法。基本思路是持续追踪低频能量，在能量突然上升超过动态阈值时判定为一个节拍点。维护一个滑动窗口计算近期的能量平均值和标准差，当前能量超过「平均值 + 1.5 倍标准差」时触发节拍。节拍触发后可以播放一个短暂的视觉爆发动画（如闪光、粒子扩散），之后在衰减时间内忽略新的触发以避免重复。这种方式比简单的响度映射更能捕捉到真正的节奏脉冲。
