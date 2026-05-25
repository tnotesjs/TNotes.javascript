# [0175. Web Audio API - Perfect Timing and Latency](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0175.%20Web%20Audio%20API%20-%20Perfect%20Timing%20and%20Latency)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 理解 Web Audio API 的时间模型，以及它和 `setTimeout()`、`setInterval()` 的区别。
- 掌握用 `AudioContext.currentTime` 和 `start(when, offset, duration)` 精确调度声音。
- 了解暂停、恢复播放时为什么需要重新创建 `AudioBufferSourceNode`。
- 学会按节拍提前调度多个声音，理解短窗口调度的必要性。
- 掌握 `AudioParam` 的直接赋值、定时赋值和渐变控制。
- 理解线性渐变、指数渐变、自定义曲线和 LFO 调制的使用场景。
- 了解低延迟对游戏、乐器和交互反馈的重要性。

## 2. 🫧 评价

- 这一章是 Web Audio API 区别于普通网页定时器的关键。声音系统对时间非常敏感，只有把调度放到音频上下文的时间轴上，节奏、淡入淡出和交互反馈才会稳定。

## 3. 🤔 Web Audio API 的时间模型有什么特别？

`AudioContext` 有自己的时间轴，可以通过 `audioContext.currentTime` 读取当前时间。这个时间以秒为单位，不是毫秒，而且是高精度浮点数。

这和普通 JavaScript 计时方式不同：

| 计时方式 | 特点 | 是否适合精确音频调度 |
| --- | --- | --- |
| `Date.now()` | 读取系统时间，可能受系统时间调整影响。 | 不适合。 |
| `setTimeout()` | 回调在主线程执行，可能被布局、渲染、GC 阻塞。 | 不适合做精确节拍。 |
| `performance.now()` | 高精度性能时间，但不属于音频渲染线程。 | 可辅助调度，但不是音频时间轴。 |
| `audioContext.currentTime` | 音频上下文自己的时间坐标。 | 适合。 |

Web Audio API 的很多方法都接收这个时间坐标，例如 `source.start(when)`、`source.stop(when)`、`gain.gain.setValueAtTime(value, time)`。当你把事件安排到音频时间轴上，浏览器可以在音频渲染层更稳定地执行它。

低延迟对交互应用尤其重要。一次按键、点击、碰撞或乐器触发，如果声音延迟太明显，用户会立刻感到不跟手。书中提到，人耳对几十毫秒级别的延迟已经可能有感知，具体阈值还会受场景影响。

## 4. 🤔 如何精确播放、暂停和恢复声音？

`AudioBufferSourceNode.start()` 的第一个参数是播放时间。如果这个时间早于当前时间，声音会立即播放；如果是未来时间，声音会被安排到那个时间点播放。

```js
// 立即播放。
source.start()

// 5 秒后播放。
source.start(audioContext.currentTime + 5)
```

`start()` 还可以接收偏移量和播放时长：

```js
// 1 秒后播放，从音频的第 10 秒开始，只播放 3 秒。
source.start(audioContext.currentTime + 1, 10, 3)
```

要实现暂停和恢复，关键是记录已经播放了多久。因为 `AudioBufferSourceNode` 播放结束或停止后不能再次启动，所以恢复播放时要创建新的 source。

```js
let source = null
let startedAt = 0
let pausedAt = 0

function createSource(audioContext, audioBuffer) {
  const nextSource = audioContext.createBufferSource()
  nextSource.buffer = audioBuffer
  nextSource.connect(audioContext.destination)
  return nextSource
}

function play(audioContext, audioBuffer) {
  source = createSource(audioContext, audioBuffer)
  startedAt = audioContext.currentTime - pausedAt
  source.start(0, pausedAt % audioBuffer.duration)
}

function pause(audioContext) {
  if (!source) return

  source.stop()
  pausedAt = audioContext.currentTime - startedAt
  source = null
}
```

这里的核心不是“暂停 source”，而是“停止当前 source，记住偏移量，下次用新的 source 从偏移量继续”。

## 5. 🤔 如何调度稳定的节奏？

Web Audio API 可以把多个声音提前安排到未来的精确时间点。比如一个简单的 4/4 鼓点，可以把底鼓、军鼓和踩镲分别放到对应节拍上。

```js
function scheduleDrumPattern(startTime, bpm, buffers) {
  const eighthNoteTime = 60 / bpm / 2

  for (let bar = 0; bar < 2; bar++) {
    const barStart = startTime + bar * 8 * eighthNoteTime

    playSound(buffers.kick, barStart)
    playSound(buffers.kick, barStart + 4 * eighthNoteTime)

    playSound(buffers.snare, barStart + 2 * eighthNoteTime)
    playSound(buffers.snare, barStart + 6 * eighthNoteTime)

    for (let i = 0; i < 8; i++) {
      playSound(buffers.hihat, barStart + i * eighthNoteTime)
    }
  }
}

function playSound(audioBuffer, when) {
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start(when)
}
```

不过，未来事件一旦交给音频系统调度，就不容易取消。因此不要一次性把很远的未来都排满。更常见的做法是自己维护一个短窗口调度器：主线程每隔一小段时间醒来，把接下来几十到几百毫秒内该发生的声音交给 Web Audio API。

这种思路可以兼顾两件事：

- 声音实际播放时间由 Web Audio API 保证精度。
- 应用状态变化时，只需要停止继续安排未来事件。

## 6. 🤔 `AudioParam` 为什么比普通属性更适合控制声音？

很多 Web Audio 节点都有可调参数，例如 `GainNode.gain`、`OscillatorNode.frequency`、`BiquadFilterNode.frequency`。这些参数通常是 `AudioParam`，它们不只是普通数值，还能被安排到音频时间轴上变化。

直接赋值适合立即改变：

```js
gainNode.gain.value = 0.5
```

定时赋值适合未来某一刻改变：

```js
gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + 1)
```

相比 `setTimeout()`，`setValueAtTime()` 不依赖主线程回调准点触发，更适合音频参数控制。

如果要在重新安排参数前清理旧计划，可以使用 `cancelScheduledValues()`：

```js
const now = audioContext.currentTime
gainNode.gain.cancelScheduledValues(now)
gainNode.gain.setValueAtTime(gainNode.gain.value, now)
gainNode.gain.linearRampToValueAtTime(0, now + 0.5)
```

这个模式常用于打断正在进行的淡入淡出，避免新旧自动化曲线互相干扰。

## 7. 🤔 如何做淡入、淡出和交叉淡化？

突然改变音量可能产生听感上的突兀，甚至出现点击声。更自然的方式是让 `AudioParam` 随时间平滑变化。

常见方法有两个：

- `linearRampToValueAtTime()`：线性变化，适合简单过渡。
- `exponentialRampToValueAtTime()`：指数变化，更接近人耳对响度变化的感知，但目标值不能是 `0`。

```js
function fadeOut(gainNode, duration) {
  const now = audioContext.currentTime
  const currentGain = Math.max(gainNode.gain.value, 0.0001)

  gainNode.gain.cancelScheduledValues(now)
  gainNode.gain.setValueAtTime(currentGain, now)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)
}
```

交叉淡化的基本思路是：旧声音逐渐变小，新声音逐渐变大。

```js
function crossfade(fromGain, toGain, duration) {
  const now = audioContext.currentTime

  fromGain.gain.setValueAtTime(fromGain.gain.value, now)
  fromGain.gain.linearRampToValueAtTime(0, now + duration)

  toGain.gain.setValueAtTime(0, now)
  toGain.gain.linearRampToValueAtTime(1, now + duration)
}
```

音乐播放器、游戏场景切换、背景音乐强度变化都经常用到这个技巧。

## 8. 🤔 自定义时间曲线和 LFO 能解决什么问题？

如果线性曲线和指数曲线都不够用，可以用 `setValueCurveAtTime()` 提供一段自定义曲线。例如颤音、震音、扫频这类周期性变化，都可以先生成一个数组，再把它应用到某个 `AudioParam`。

```js
function applyTremolo(gainNode, duration, depth) {
  const values = new Float32Array(1024)

  for (let i = 0; i < values.length; i++) {
    const phase = (i / values.length) * Math.PI * 2
    values[i] = 1 - depth + Math.sin(phase) * depth
  }

  gainNode.gain.setValueCurveAtTime(values, audioContext.currentTime, duration)
}
```

更 Web Audio 的方式是使用低频振荡器，也就是 LFO。它本质上也是一个音频节点，但不连接到扬声器，而是连接到另一个节点的 `AudioParam`。

```js
function connectTremolo(targetGain, frequency, depth) {
  const oscillator = audioContext.createOscillator()
  const depthGain = audioContext.createGain()

  oscillator.frequency.value = frequency
  depthGain.gain.value = depth

  oscillator.connect(depthGain)
  depthGain.connect(targetGain.gain)
  oscillator.start()

  return oscillator
}
```

这体现了 Web Audio API 一个很有意思的设计：音频流不仅可以进入 `AudioNode`，也可以进入 `AudioParam`，从而把“控制参数”也变成音频图的一部分。
