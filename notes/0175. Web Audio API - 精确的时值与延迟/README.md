# [0175. Web Audio API - 精确的时值与延迟](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0175.%20Web%20Audio%20API%20-%20%E7%B2%BE%E7%A1%AE%E7%9A%84%E6%97%B6%E5%80%BC%E4%B8%8E%E5%BB%B6%E8%BF%9F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Web Audio API 的时间模型有什么特别？](#3-web-audio-api-的时间模型有什么特别)
- [4. 如何精确播放、暂停和恢复声音？](#4-如何精确播放暂停和恢复声音)
- [5. 如何调度稳定的节奏？](#5-如何调度稳定的节奏)
- [6. `AudioParam` 为什么比普通属性更适合控制声音？](#6-audioparam-为什么比普通属性更适合控制声音)
- [7. 如何做淡入、淡出和交叉淡化？](#7-如何做淡入淡出和交叉淡化)
- [8. 自定义时间曲线和 LFO 能解决什么问题？](#8-自定义时间曲线和-lfo-能解决什么问题)
- [9. demos.1 - AudioContext 时间轴 vs setTimeout](#9-demos1---audiocontext-时间轴-vs-settimeout)
- [10. demos.2 - AudioParam 定时赋值与 cancelScheduledValues](#10-demos2---audioparam-定时赋值与-cancelscheduledvalues)
- [11. demos.3 - 淡入、淡出与交叉淡化](#11-demos3---淡入淡出与交叉淡化)
- [12. demos.4 - start(when, offset, duration) 精确控制播放](#12-demos4---startwhen-offset-duration-精确控制播放)
- [13. demos.5 - 暂停与恢复（记录偏移量 + 重建 source）](#13-demos5---暂停与恢复记录偏移量--重建-source)
- [14. demos.6 - 短窗口节奏调度器](#14-demos6---短窗口节奏调度器)
- [15. demos.7 - 自定义时间曲线与 LFO 调制](#15-demos7---自定义时间曲线与-lfo-调制)

<!-- endregion:toc -->

## 1. 本节内容

- 理解 Web Audio API 的时间模型，以及它和 `setTimeout()`、`setInterval()` 的区别。
- 掌握用 `AudioContext.currentTime` 和 `start(when, offset, duration)` 精确调度声音。
- 了解暂停、恢复播放时为什么需要重新创建 `AudioBufferSourceNode`。
- 学会按节拍提前调度多个声音，理解短窗口调度的必要性。
- 掌握 `AudioParam` 的直接赋值、定时赋值和渐变控制。
- 理解线性渐变、指数渐变、自定义曲线和 LFO 调制的使用场景。
- 了解低延迟对游戏、乐器和交互反馈的重要性。

## 2. 评价

- 这一章是 Web Audio API 区别于普通网页定时器的关键。声音系统对时间非常敏感，只有把调度放到音频上下文的时间轴上，节奏、淡入淡出和交互反馈才会稳定。

## 3. Web Audio API 的时间模型有什么特别？

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

## 4. 如何精确播放、暂停和恢复声音？

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

## 5. 如何调度稳定的节奏？

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

## 6. `AudioParam` 为什么比普通属性更适合控制声音？

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

## 7. 如何做淡入、淡出和交叉淡化？

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

## 8. 自定义时间曲线和 LFO 能解决什么问题？

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

## 9. demos.1 - AudioContext 时间轴 vs setTimeout

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - AudioContext 时间模型</title>
  </head>
  <body>
    <button id="btn">对比播放：setTimeout vs AudioContext 时间轴</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：AudioContext 时间模型 ============
      // 1. audioContext.currentTime 是音频渲染线程的高精度时间（秒，浮点数）
      // 2. setTimeout/setInterval 在主线程执行，受布局、渲染、GC 影响，精度不稳定
      // 3. 将事件安排到音频时间轴上，浏览器在音频渲染层执行，抖动极小
      // 4. 人耳对几十毫秒的延迟就能感知，所以音频调度必须用 audioContext.currentTime

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      function beep(when, label) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        gain.gain.value = 0.3
        osc.type = 'sine'
        osc.frequency.value = 800
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(when)
        osc.stop(when + 0.08)
        log(
          `[${label}] 计划时间: ${when.toFixed(4)}s, 实际 currentTime: ${ctx.currentTime.toFixed(4)}s`,
        )
      }

      document.getElementById('btn').addEventListener('click', () => {
        const logEl = document.getElementById('log')
        logEl.textContent = ''

        // 方式一：用 setTimeout 调度 —— 可能不准
        const targetMs = 200
        setTimeout(() => {
          // 主线程回调时机不精确，此处记录偏差
          beep(ctx.currentTime, 'setTimeout')
          log(`  → setTimeout(${targetMs}ms) 实际偏差: 可能受主线程阻塞影响`)
        }, targetMs)

        // 方式二：用 audioContext.currentTime 调度 —— 精确
        const scheduleAt = ctx.currentTime + 0.2 // 200ms 后
        beep(scheduleAt, 'audioTime')
        log(
          `  → audioContext 调度到 ${scheduleAt.toFixed(4)}s，音频渲染层保证精度`,
        )

        // 额外：模拟主线程阻塞，放大 setTimeout 的不精确性
        log('\n--- 模拟主线程阻塞 50ms，观察 setTimeout 偏差 ---')
        const blockStart = performance.now()
        while (performance.now() - blockStart < 50) {
          /* 阻塞主线程 */
        }

        setTimeout(() => {
          beep(ctx.currentTime, 'setTimeout-after-block')
          log('  → setTimeout 在主线程阻塞后，回调延迟更明显')
        }, 100)

        const scheduleAt2 = ctx.currentTime + 0.1
        beep(scheduleAt2, 'audioTime-after-block')
        log('  → audioContext 调度不受主线程阻塞影响')
      })
    </script>
  </body>
</html>
```

---

## 10. demos.2 - AudioParam 定时赋值与 cancelScheduledValues

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - AudioParam 定时赋值</title>
  </head>
  <body>
    <button id="btn-schedule">调度到未来 1 秒后切换音量</button>
    <button id="btn-cancel">cancelScheduledValues 中途打断</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：AudioParam 定时赋值 ============
      // 1. gain.gain.value = x —— 立即生效，但时机依赖主线程
      // 2. gain.gain.setValueAtTime(value, time) —— 在音频时间轴的精确时刻生效
      // 3. cancelScheduledValues(time) —— 取消 time 之后的所有计划事件
      // 4. 打断正在进行的自动化时，先 cancel → 再 setValueAtTime 当前值 → 再设新目标
      //    这个三步模式可避免新旧曲线互相干扰

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      // 持续播放一个音，方便听音量变化
      let osc = null
      let gain = null

      function startTone() {
        if (osc) return
        osc = ctx.createOscillator()
        gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.value = 300
        gain.gain.value = 0.3
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
      }

      // 场景一：正常调度
      document.getElementById('btn-schedule').addEventListener('click', () => {
        startTone()
        const now = ctx.currentTime
        // 现在音量 0.3，1 秒后精确切换到 0.05，2 秒后回到 0.3
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.setValueAtTime(0.05, now + 1)
        gain.gain.setValueAtTime(0.3, now + 2)
        log(
          `调度计划: ${now.toFixed(2)}s → 0.3, ${(now + 1).toFixed(2)}s → 0.05, ${(now + 2).toFixed(2)}s → 0.3`,
        )
      })

      // 场景二：中途打断
      document.getElementById('btn-cancel').addEventListener('click', () => {
        startTone()
        const now = ctx.currentTime

        // 先设定一个计划：3 秒后把音量拉到 0.01
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.setValueAtTime(0.01, now + 3)
        log(`原计划: ${(now + 3).toFixed(2)}s → 0.01`)

        // 500ms 后决定打断这个计划
        setTimeout(() => {
          const t = ctx.currentTime
          // 三步打断模式：cancel → 设当前值 → 设新目标
          gain.gain.cancelScheduledValues(t) // 1. 取消所有未来计划
          gain.gain.setValueAtTime(gain.gain.value, t) // 2. 锚定当前实际值
          gain.gain.linearRampToValueAtTime(0.3, t + 0.3) // 3. 设新目标
          log(`${t.toFixed(2)}s: 已 cancel + 重新设定，原计划不会生效`)
        }, 500)
      })
    </script>
  </body>
</html>
```

---

## 11. demos.3 - 淡入、淡出与交叉淡化

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - Fade & Crossfade</title>
  </head>
  <body>
    <button id="btn-fadein">淡入 (Fade In)</button>
    <button id="btn-fadeout">淡出 (Fade Out)</button>
    <button id="btn-crossfade">交叉淡化 (Crossfade)</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：淡入淡出与交叉淡化 ============
      // 1. 突变音量会产生"咔嗒"声（click/pop），平滑过渡才能避免
      // 2. linearRampToValueAtTime —— 线性渐变，简单直接
      // 3. exponentialRampToValueAtTime —— 指数渐变，更符合人耳响度感知，但目标值不能为 0
      //    → 用 0.0001 代替 0
      // 4. 交叉淡化：旧声音 fade out + 新声音 fade in，常用于场景切换/切歌

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      function createTone(freq, gainVal = 0) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        g.gain.value = gainVal
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        return { osc, gain: g }
      }

      // 淡入：从静音线性过渡到 0.3
      document.getElementById('btn-fadein').addEventListener('click', () => {
        const { osc, gain } = createTone(440, 0)
        const now = ctx.currentTime
        const dur = 1.5
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.3, now + dur)
        osc.stop(now + dur + 0.5)
        log(`淡入: 0 → 0.3，${dur}s 线性渐变`)
      })

      // 淡出：从当前值指数过渡到接近 0
      document.getElementById('btn-fadeout').addEventListener('click', () => {
        const { osc, gain } = createTone(440, 0.3)
        const now = ctx.currentTime
        const dur = 1.5
        // exponentialRamp 不能目标为 0，用 0.0001 近似
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
        osc.stop(now + dur + 0.1)
        log(`淡出: 0.3 → ~0（指数），${dur}s 渐变，目标值用 0.0001 代替 0`)
      })

      // 交叉淡化：音 A 渐弱，音 B 渐强
      document.getElementById('btn-crossfade').addEventListener('click', () => {
        const toneA = createTone(440, 0.3) // 当前正在播放
        const toneB = createTone(660, 0) // 新声音，静音开始
        const now = ctx.currentTime
        const dur = 2.0

        // A: 0.3 → 0（线性）
        toneA.gain.gain.setValueAtTime(0.3, now)
        toneA.gain.gain.linearRampToValueAtTime(0, now + dur)

        // B: 0 → 0.3（线性）
        toneB.gain.gain.setValueAtTime(0, now)
        toneB.gain.gain.linearRampToValueAtTime(0.3, now + dur)

        toneA.osc.stop(now + dur + 0.1)
        toneB.osc.stop(now + dur + 0.5)
        log(`交叉淡化: A(440Hz) 渐弱 + B(660Hz) 渐强，${dur}s`)
      })
    </script>
  </body>
</html>
```

---

## 12. demos.4 - start(when, offset, duration) 精确控制播放

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - start(when, offset, duration)</title>
  </head>
  <body>
    <button id="btn-immediate">立即播放</button>
    <button id="btn-delay">延迟 1 秒播放</button>
    <button id="btn-offset">从第 0.5 秒处播放，只播 0.8 秒</button>
    <button id="btn-future">2 秒后从第 0.2 秒处播放 0.5 秒</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：start(when, offset, duration) ============
      // source.start(when)          — when < currentTime 则立即播放，否则排队
      // source.start(when, offset)  — 从音频的 offset 秒处开始
      // source.start(when, offset, duration) — 从 offset 开始，只播放 duration 秒
      // 这三个参数配合可以精确控制"什么时候播、从哪里播、播多久"

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      // 构造一个 3 秒的 mock buffer（带频率变化方便区分位置）
      function createMockBuffer() {
        const sr = ctx.sampleRate
        const len = sr * 3
        const buf = ctx.createBuffer(1, len, sr)
        const data = buf.getChannelData(0)
        for (let i = 0; i < len; i++) {
          const t = i / sr
          // 频率随时间升高，方便听出"从哪里开始播"
          const freq = 300 + t * 400
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3 * (1 - t / 3)
        }
        return buf
      }

      const buffer = createMockBuffer()

      function play(label, when, offset, duration) {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        // start() 不支持传 undefined 做默认值，需要根据参数数量调用
        if (arguments.length <= 3) {
          source.start(when, offset)
        } else {
          source.start(when, offset, duration)
        }
        const w =
          when < ctx.currentTime
            ? 'now'
            : `+${(when - ctx.currentTime).toFixed(1)}s`
        log(
          `${label}: when=${w}, offset=${offset}s` +
            (duration != null ? `, duration=${duration}s` : ''),
        )
      }

      document.getElementById('btn-immediate').addEventListener('click', () => {
        play('立即播放', ctx.currentTime, 0)
      })

      document.getElementById('btn-delay').addEventListener('click', () => {
        play('延迟 1s', ctx.currentTime + 1, 0)
      })

      document.getElementById('btn-offset').addEventListener('click', () => {
        // 从 buffer 的 0.5 秒处开始，只播放 0.8 秒
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start(ctx.currentTime, 0.5, 0.8)
        log('从 0.5s 处开始，只播放 0.8s')
      })

      document.getElementById('btn-future').addEventListener('click', () => {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start(ctx.currentTime + 2, 0.2, 0.5)
        log('2s 后从 0.2s 处开始，只播放 0.5s')
      })
    </script>
  </body>
</html>
```

---

## 13. demos.5 - 暂停与恢复（记录偏移量 + 重建 source）

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - Pause & Resume</title>
  </head>
  <body>
    <button id="btn-play">播放</button>
    <button id="btn-pause">暂停</button>
    <button id="btn-resume">恢复</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：暂停与恢复 ============
      // 1. AudioBufferSourceNode 没有 pause()，只有 start() 和 stop()
      // 2. stop() 后 source 销毁，不能再次 start()
      // 3. 暂停时记录"已播放时长"（audioContext.currentTime - startedAt）
      // 4. 恢复时创建新 source，用 start(0, pausedAt) 从断点继续
      // 5. 关键变量：startedAt（播放开始的绝对时间）、pausedAt（暂停时的偏移量）

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      // 构造 2 秒的 mock buffer
      const sr = ctx.sampleRate
      const buffer = ctx.createBuffer(1, sr * 2, sr)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        const t = i / sr
        data[i] = Math.sin(2 * Math.PI * (400 + t * 200) * t) * 0.3
      }

      let source = null
      let startedAt = 0 // 上次 start 时的 audioContext.currentTime
      let pausedAt = 0 // 暂停时已播放的偏移量（秒）
      let isPlaying = false

      function createSource() {
        const s = ctx.createBufferSource()
        s.buffer = buffer
        s.connect(ctx.destination)
        return s
      }

      document.getElementById('btn-play').addEventListener('click', () => {
        if (isPlaying) return log('已在播放中')
        source = createSource()
        pausedAt = 0
        startedAt = ctx.currentTime
        source.start(0, pausedAt)
        isPlaying = true
        log(`播放开始，startedAt=${startedAt.toFixed(3)}s`)
      })

      document.getElementById('btn-pause').addEventListener('click', () => {
        if (!isPlaying) return log('未在播放')
        source.stop()
        // 记录已播放的偏移量
        pausedAt = ctx.currentTime - startedAt
        source = null
        isPlaying = false
        log(`暂停，已播放 ${pausedAt.toFixed(3)}s，source 已销毁`)
      })

      document.getElementById('btn-resume').addEventListener('click', () => {
        if (isPlaying) return log('已在播放中')
        if (pausedAt === 0) return log('请先播放再暂停')
        // 新建 source，从暂停偏移量处继续
        source = createSource()
        startedAt = ctx.currentTime - pausedAt // 重新校准起始时间
        source.start(0, pausedAt)
        isPlaying = true
        log(`恢复播放，从 ${pausedAt.toFixed(3)}s 处继续（新 source）`)
      })
    </script>
  </body>
</html>
```

---

## 14. demos.6 - 短窗口节奏调度器

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - Short-window Scheduler</title>
  </head>
  <body>
    <button id="btn-start">开始节拍器</button>
    <button id="btn-stop">停止</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：短窗口调度器 ============
      // 1. 一次性排满很远的未来事件 → 不易取消、不易响应状态变化
      // 2. 正确做法：主线程用 setInterval 每隔一小段（如 100ms）醒一次，
      //    把接下来 200ms 内该发生的声音用 audioContext.currentTime 精确排入
      // 3. 这样兼顾：音频层保证播放精度 + 应用层可随时停止继续排程
      // 4. 游戏节拍器、音序器、鼓机常用此模式

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      const BPM = 120
      const beatInterval = 60 / BPM // 0.5s per beat
      const LOOK_AHEAD = 0.2 // 调度窗口：提前排 200ms 内的声音
      const SCHEDULER_INTERVAL = 100 // 主线程每 100ms 检查一次

      let nextBeatTime = 0
      let beatIndex = 0
      let timerId = null

      // 模式：高音 = 强拍，低音 = 弱拍
      const pattern = [880, 660, 660, 660] // 4/4：强 弱 弱 弱

      function scheduleBeat(time, freq) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, time)
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(time)
        osc.stop(time + 0.1)
      }

      function scheduler() {
        // 在 look-ahead 窗口内，把该播的音全部排入音频时间轴
        while (nextBeatTime < ctx.currentTime + LOOK_AHEAD) {
          const freq = pattern[beatIndex % pattern.length]
          scheduleBeat(nextBeatTime, freq)

          // 只打印前几次，避免刷屏
          if (beatIndex < 16) {
            log(`Beat ${beatIndex} → ${nextBeatTime.toFixed(3)}s (${freq}Hz)`)
          } else if (beatIndex === 16) {
            log('...')
          }

          nextBeatTime += beatInterval
          beatIndex++
        }
      }

      document.getElementById('btn-start').addEventListener('click', () => {
        if (timerId) return log('已在运行')
        beatIndex = 0
        nextBeatTime = ctx.currentTime + 0.05 // 留一点缓冲
        log(
          `节拍器启动: ${BPM}BPM, 窗口=${LOOK_AHEAD}s, 检查间隔=${SCHEDULER_INTERVAL}ms`,
        )
        timerId = setInterval(scheduler, SCHEDULER_INTERVAL)
      })

      document.getElementById('btn-stop').addEventListener('click', () => {
        if (!timerId) return
        clearInterval(timerId)
        timerId = null
        log('已停止调度（已排入音频时间轴的音仍会播放，但不再排新的）')
      })
    </script>
  </body>
</html>
```

---

## 15. demos.7 - 自定义时间曲线与 LFO 调制

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - setValueCurveAtTime & LFO</title>
  </head>
  <body>
    <button id="btn-curve">自定义曲线：颤音</button>
    <button id="btn-lfo">LFO 调制：震音</button>
    <button id="btn-sweep">LFO 调制：扫频</button>
    <pre id="log"></pre>
    <script>
      // ============ 知识点：自定义曲线与 LFO ============
      // 1. setValueCurveAtTime(values, startTime, duration)
      //    → 把一段 Float32Array 当作参数变化曲线，从 startTime 开始在 duration 内播放完
      //    → 适合预制复杂的周期性变化（颤音、震音等）
      // 2. LFO（Low Frequency Oscillator）：用一个低频 OscillatorNode 连接到目标 AudioParam
      //    → LFO 的输出是音频信号，但频率极低（0.1~20Hz），人耳听不到，但能调制参数
      // 3. Web Audio API 的设计亮点：音频流不仅连接 AudioNode，也能连接 AudioParam
      //    → "控制信号"和"音频信号"用同一套 connect 机制

      const Ctor = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctor()
      const log = (msg) => {
        document.getElementById('log').textContent += msg + '\n'
      }

      // --- 方式一：setValueCurveAtTime 自定义曲线（颤音 = 音量周期波动） ---
      document.getElementById('btn-curve').addEventListener('click', () => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 440
        gain.gain.value = 0.3
        osc.connect(gain)
        gain.connect(ctx.destination)

        // 生成正弦波形状的音量曲线
        const len = 1024
        const values = new Float32Array(len)
        const depth = 0.25 // 颤音深度
        for (let i = 0; i < len; i++) {
          values[i] = 0.3 - depth + Math.sin((i / len) * Math.PI * 2) * depth
        }

        const now = ctx.currentTime
        const duration = 2
        gain.gain.setValueCurveAtTime(values, now, duration)
        osc.start(now)
        osc.stop(now + duration + 0.1)
        log(
          `setValueCurveAtTime: ${len} 个采样点，${duration}s 内播放完，深度=${depth}`,
        )
      })

      // --- 方式二：LFO 震音（用 OscillatorNode 调制 gain） ---
      document.getElementById('btn-lfo').addEventListener('click', () => {
        // 音频源
        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = 300

        const gain = ctx.createGain()
        gain.gain.value = 0.3 // 基础音量

        osc.connect(gain)
        gain.connect(ctx.destination)

        // LFO：不接扬声器，而是接到 gain.gain 这个 AudioParam 上
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 5 // LFO 频率 5Hz（每秒震动 5 次）
        lfoGain.gain.value = 0.2 // LFO 对 gain 的调制幅度

        lfo.connect(lfoGain) // LFO → 幅度控制
        lfoGain.connect(gain.gain) // 注意：连到 AudioParam，不是连到 Node

        const now = ctx.currentTime
        osc.start(now)
        lfo.start(now)
        osc.stop(now + 3)
        lfo.stop(now + 3)
        log('LFO 震音: 5Hz LFO 调制 gain，音量周期波动')
      })

      // --- 方式三：LFO 扫频（用 OscillatorNode 调制 frequency） ---
      document.getElementById('btn-sweep').addEventListener('click', () => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = 440 // 基础频率

        const gain = ctx.createGain()
        gain.gain.value = 0.2

        osc.connect(gain)
        gain.connect(ctx.destination)

        // LFO 调制音高（扫频 / wobble 效果）
        const lfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        lfo.frequency.value = 2 // 2Hz 的缓慢摆动
        lfoGain.gain.value = 80 // 在 440Hz 基础上上下偏移 80Hz

        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency) // 连到频率 AudioParam

        const now = ctx.currentTime
        osc.start(now)
        lfo.start(now)
        osc.stop(now + 3)
        lfo.stop(now + 3)
        log('LFO 扫频: 2Hz LFO 调制 frequency，音高在 360~520Hz 间摆动')
      })
    </script>
  </body>
</html>
```
