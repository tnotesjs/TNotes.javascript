# [0149. OscillatorNode 与声音合成](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0149.%20OscillatorNode%20%E4%B8%8E%E5%A3%B0%E9%9F%B3%E5%90%88%E6%88%90)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 🤔 OscillatorNode 的四种内置波形分别模拟什么样的音色特征？](#3--oscillatornode-的四种内置波形分别模拟什么样的音色特征)
- [4. 🤔 如何使用 OscillatorNode 演奏一个指定 MIDI 音符编号对应的音高？](#4--如何使用-oscillatornode-演奏一个指定-midi-音符编号对应的音高)
- [5. 🤔 PeriodicWave 是如何通过傅里叶系数定义自定义波形的？](#5--periodicwave-是如何通过傅里叶系数定义自定义波形的)
- [6. 🤔 如何用 GainNode 实现 ADSR 包络来模拟钢琴的音色衰减？](#6--如何用-gainnode-实现-adsr-包络来模拟钢琴的音色衰减)
- [7. 🤔 detune 属性的单位是什么，如何用它实现微分音演奏？](#7--detune-属性的单位是什么如何用它实现微分音演奏)
- [8. 🤔 如何使用多个 OscillatorNode 同时发声来合成一个和弦？](#8--如何使用多个-oscillatornode-同时发声来合成一个和弦)
- [9. 🤔 如何使用 AudioBuffer 生成白噪声并用滤波器将其变为粉噪声？](#9--如何使用-audiobuffer-生成白噪声并用滤波器将其变为粉噪声)

<!-- endregion:toc -->

## 1. 本节内容

- OscillatorNode 创建与 type 属性
- sine、square、sawtooth、triangle 波形
- frequency AudioParam 与音高控制
- detune AudioParam 与微调（cent）
- PeriodicWave 自定义波形
- ADSR 包络概念
- 使用 GainNode 模拟 ADSR 包络
- 音符频率对照（MIDI note number → frequency）
- 多振荡器叠加与和弦
- AudioBuffer 生成白噪声

## 2. 评价

- todo

## 3. 🤔 OscillatorNode 的四种内置波形分别模拟什么样的音色特征？

OscillatorNode 提供四种内置波形：`sine`、`square`、`sawtooth`、`triangle`。它们的区别在于谐波成分的组成不同，直接决定了音色特征。

`sine`（正弦波）—— 最纯净的波形。只包含基频，没有任何谐波（泛音）。听起来像单一的、纯净的音调，类似音叉或口哨声。在自然界中几乎不存在纯正弦波，所以它听起来有些「电子感」但不刺耳。正弦波是所有复杂波形的基本构建单元，任何周期波形都可以分解为一系列正弦波的叠加（傅里叶级数）。

`square`（方波）—— 只包含奇数次谐波（1、3、5、7…… 次），且谐波幅度按 1/n 衰减。听起来像复古游戏机的音色，有明显的嗡嗡感，音色空洞而有穿透力。由于缺少偶数次谐波，方波的音色具有一种独特的「中空」质感。老式任天堂游戏的背景音乐大量使用方波。

`sawtooth`（锯齿波）—— 包含所有谐波（1、2、3、4…… 次），谐波幅度按 1/n 衰减。这是谐波最丰富的内置波形，听起来明亮、尖锐、有强烈的金属感。适合模拟弦乐器、铜管乐器的粗糙音色，也常用于合成器中的 Lead 音色。锯齿波在叠加滤波器处理后能产生非常丰富的音色变化。

`triangle`（三角波）—— 只包含奇数次谐波，但谐波幅度按 1/n² 衰减（比方波衰减快得多）。听起来比正弦波稍亮，但远没有锯齿波和方波那么刺耳。音色柔和、略带木质感，接近长笛的泛音特征。由于高次谐波衰减很快，三角波的音色比方波圆润得多。

从频谱的角度理解四种波形的差异：

波形越复杂（谐波越丰富），音色越明亮、越尖锐。音色亮度排序：sine < triangle < square < sawtooth。sine 最暗（无泛音），sawtooth 最亮（泛音最多）。

在实际使用中，单一振荡器的音色通常比较单薄。合成器通常通过叠加多个振荡器（如一个锯齿波 + 一个正弦波做低音增强）、添加滤波器（去掉高频谐波让音色变暗）和包络控制（让音色随时间变化）来创造更丰富的音色。

## 4. 🤔 如何使用 OscillatorNode 演奏一个指定 MIDI 音符编号对应的音高？

MIDI 音符编号是一个标准体系，编号 0 到 127 对应从 C-1 到 G9 的全部音高。其中编号 60 对应中央 C（C4），编号 69 对应标准音高 A4（440Hz）。

将 MIDI 编号转换为频率的公式基于十二平均律：

```
frequency = 440 * Math.pow(2, (midiNote - 69) / 12)
```

这个公式的含义：以 A4（编号 69，440Hz）为基准，每上升一个半音频率乘以 2 的十二分之一次方（约 1.05946），每下降一个半音频率除以这个值。

```javascript
function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

// 常见音符验证
console.log(midiToFrequency(60)) // 261.63  —— 中央 C
console.log(midiToFrequency(69)) // 440.00  —— A4 标准音
console.log(midiToFrequency(67)) // 392.00  —— G4
```

完整的演奏实现：

```javascript
function playMidiNote(midiNote, duration = 0.5) {
  const frequency = midiToFrequency(midiNote)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.value = frequency

  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

// 演奏 C 大调音阶
const cMajorScale = [60, 62, 64, 65, 67, 69, 71, 72]
cMajorScale.forEach((note, i) => {
  setTimeout(() => playMidiNote(note, 0.4), i * 500)
})
```

也可以用 `detune` 属性代替直接设置 `frequency`。`detune` 的单位是音分（cent），一个半音等于 100 音分。以 A4 为基准，detune = 0 时为 440Hz：

```javascript
osc.frequency.value = 440
osc.detune.value = (midiNote - 69) * 100
// 例如 midiNote = 60（C4），detune = -900，即降低 9 个半音
```

这种方式在需要微调音高（如模拟自然乐器的不精确性）时更方便，可以直接在 detune 上加减若干音分。

常用 MIDI 编号速查：60 = C4（中央 C），64 = E4，67 = G4，72 = C5，48 = C3（低八度），36 = C2（低两个八度）。

## 5. 🤔 PeriodicWave 是如何通过傅里叶系数定义自定义波形的？

`PeriodicWave` 允许通过傅里叶级数的系数来定义任意周期波形。傅里叶级数的核心思想是：任何周期信号都可以分解为一系列不同频率和幅度的正弦波的叠加。反过来，通过指定这些正弦波的系数，就可以合成出任意波形。

`PeriodicWave` 通过两个 `Float32Array` 来定义：`real` 数组（余弦分量系数）和 `imag` 数组（正弦分量系数）。数组的第 0 个元素对应直流分量（通常设为 0），第 1 个元素对应基频，第 2 个元素对应二次谐波，以此类推。

```javascript
// 定义一个包含 3 次谐波的自定义波形
const real = new Float32Array([0, 1, 0, 0]) // 余弦分量
const imag = new Float32Array([0, 0, 0.5, 0.25]) // 正弦分量

const wave = ctx.createPeriodicWave(real, imag)
osc.setPeriodicWave(wave)
```

在上面的例子中：

- 第 0 项（直流）：real = 0, imag = 0，没有直流偏移
- 第 1 项（基频）：real = 1, imag = 0，基频为纯余弦
- 第 2 项（二次谐波）：real = 0, imag = 0.5，幅度为 0.5 的正弦
- 第 3 项（三次谐波）：real = 0, imag = 0.25，幅度为 0.25 的正弦

数学上，合成波形的公式为：

```
f(t) = real[0] * cos(0) + imag[0] * sin(0)
     + real[1] * cos(2πft) + imag[1] * sin(2πft)
     + real[2] * cos(4πft) + imag[2] * sin(4πft)
     + ...
```

理解 real 和 imag 的关系：每个谐波可以看作一个旋转向量（相量），real 是水平分量（余弦），imag 是垂直分量（正弦）。两者共同决定了该谐波的幅度和相位。幅度为 `Math.sqrt(real[i]² + imag[i]²)`，相位为 `Math.atan2(imag[i], real[i])`。

用傅里叶系数精确还原内置波形的例子：

方波的傅里叶级数只包含正弦的奇数次谐波，系数为 1/n：

```javascript
function createSquareWave(ctx, harmonics = 20) {
  const real = new Float32Array(harmonics + 1)
  const imag = new Float32Array(harmonics + 1)
  real[0] = 0
  for (let n = 1; n <= harmonics; n++) {
    if (n % 2 === 1) {
      imag[n] = 4 / (Math.PI * n) // 只有奇数次谐波
    }
  }
  return ctx.createPeriodicWave(real, imag)
}
```

锯齿波包含所有谐波，系数为 `2 / (Math.PI * n) * (-1)^(n+1)`（正弦分量）：

```javascript
function createSawtoothWave(ctx, harmonics = 20) {
  const real = new Float32Array(harmonics + 1)
  const imag = new Float32Array(harmonics + 1)
  for (let n = 1; n <= harmonics; n++) {
    imag[n] = (2 / (Math.PI * n)) * Math.pow(-1, n + 1)
  }
  return ctx.createPeriodicWave(real, imag)
}
```

`createPeriodicWave` 的第三个参数（可选）可以禁用归一化。默认情况下浏览器会自动缩放系数使波形的峰值不超过 -1 到 1 的范围。如果需要保持原始系数的比例关系，传入 `{ disableNormalization: true }`：

```javascript
const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: true })
```

数组越长（谐波数越多），合成的波形越精确。通常 20 到 40 个谐波就能很好地还原大多数波形。

## 6. 🤔 如何用 GainNode 实现 ADSR 包络来模拟钢琴的音色衰减？

ADSR 包络是声音合成中最基本的音量变化模型，由四个阶段组成：

`Attack`（起音）—— 从按下键到音量达到最大值的时间。钢琴的 Attack 很短（几毫秒到几十毫秒），因为琴槌击弦是瞬态事件。

`Decay`（衰减）—— 从最大音量下降到 Sustain 水平的时间。钢琴的 Decay 较长，音量从峰值逐渐衰减。

`Sustain`（持续）—— 按住键期间音量维持的水平。注意 Sustain 不是一个时间值，而是一个音量比例。严格来说钢琴没有 Sustain 阶段（松手弦就停了），但为了通用模型通常设为一个较低的值。

`Release`（释放）—— 松开键后音量从当前水平衰减到 0 的时间。钢琴的 Release 较长，因为琴弦会持续振动一段时间。

实现代码：

```javascript
class ADSREnvelope {
  constructor(ctx) {
    this.ctx = ctx
    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 0
  }

  connect(destination) {
    this.gainNode.connect(destination)
  }

  trigger(attack = 0.01, decay = 0.3, sustain = 0.4, release = 1.0) {
    const now = this.ctx.currentTime
    const param = this.gainNode.gain

    // 取消之前的调度
    param.cancelScheduledValues(now)
    param.setValueAtTime(0, now)

    // Attack：从 0 上升到 1
    param.linearRampToValueAtTime(1, now + attack)

    // Decay：从 1 下降到 sustain 水平
    param.linearRampToValueAtTime(sustain, now + attack + decay)

    // Sustain 阶段不设置终点，保持在 sustain 水平
    // 等待 release() 被调用
  }

  release(releaseTime = 1.0) {
    const now = this.ctx.currentTime
    const param = this.gainNode.gain

    param.cancelScheduledValues(now)
    param.setValueAtTime(param.value, now)

    // Release：从当前音量衰减到 0
    param.linearRampToValueAtTime(0, now + releaseTime)
  }
}
```

模拟钢琴音色的完整使用：

```javascript
function playPianoNote(frequency, velocity = 0.8) {
  const osc = ctx.createOscillator()
  const envelope = new ADSREnvelope(ctx)

  // 钢琴音色：用三角波模拟基音，叠加一个泛音
  osc.type = 'triangle'
  osc.frequency.value = frequency

  // 用 velocity 控制音量
  const preGain = ctx.createGain()
  preGain.gain.value = velocity * 0.5

  osc.connect(preGain)
  preGain.connect(envelope.gainNode)
  envelope.connect(ctx.destination)

  osc.start(ctx.currentTime)

  // 钢琴的 ADSR 参数
  envelope.trigger(
    0.005, // Attack：5ms，琴槌击弦极快
    0.5, // Decay：500ms，较长的衰减
    0.3, // Sustain：30% 音量维持
    1.5, // Release：1.5s，较长的余音
  )

  // 松开键时触发 release
  return {
    stop() {
      envelope.release(1.5)
      osc.stop(ctx.currentTime + 2)
    },
  }
}
```

更逼真的钢琴模拟需要叠加多个泛音。钢琴不是纯正弦波或三角波，而是包含丰富泛音的复合音色：

```javascript
function playRichPianoNote(frequency) {
  const harmonics = [
    { ratio: 1, amp: 1.0 },
    { ratio: 2, amp: 0.5 },
    { ratio: 3, amp: 0.3 },
    { ratio: 4, amp: 0.15 },
    { ratio: 5, amp: 0.08 },
  ]

  const envelope = new ADSREnvelope(ctx)
  envelope.connect(ctx.destination)

  const oscillators = harmonics.map((h) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency * h.ratio
    gain.gain.value = h.amp
    osc.connect(gain)
    gain.connect(envelope.gainNode)
    osc.start(ctx.currentTime)
    return osc
  })

  envelope.trigger(0.005, 0.5, 0.3, 1.5)

  return {
    stop() {
      envelope.release(1.5)
      oscillators.forEach((o) => o.stop(ctx.currentTime + 2))
    },
  }
}
```

## 7. 🤔 detune 属性的单位是什么，如何用它实现微分音演奏？

`detune` 属性的单位是音分（cent）。一个八度被等分为 1200 音分，因此一个半音等于 100 音分。`detune` 的默认值为 0，正值表示升高音高，负值表示降低音高。

频率与音分的关系为：

```
f_detuned = f_base * Math.pow(2, detune / 1200)
```

例如 `detune = 100` 表示升高一个半音（频率变为原来的约 1.05946 倍），`detune = 1200` 表示升高一个八度（频率翻倍），`detune = -50` 表示降低 50 音分（约为半音的一半）。

`detune` 和 `frequency` 共同决定最终音高。最终频率 = `frequency * Math.pow(2, detune / 1200)`。两者可以分别设置，底层实时计算合成结果。

微分音（Microtonal）是指小于半音的音程。西方音乐使用十二平均律，每个半音是最小音程单位。但许多非西方音乐体系（阿拉伯音乐的四分之一音、印度音乐的 22 个什鲁蒂、印尼甘美兰的不等分音阶）使用更精细的音程划分。`detune` 天然支持这种需求。

四分之一音（Quarter Tone）演奏：

四分之一音等于 50 音分，位于两个相邻半音的中间：

```javascript
function playQuarterToneScale() {
  // 一个八度内的 24 音分音阶（12 个半音 × 2 = 24 个四分之一音）
  for (let i = 0; i < 24; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.frequency.value = 261.63 // C4 为基准
    osc.detune.value = i * 50 // 每步 50 音分

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.3)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.3 + 0.02)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.3 + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime + i * 0.3)
    osc.stop(ctx.currentTime + i * 0.3 + 0.3)
  }
}
```

模拟自然乐器的音高偏差：

真实的乐器演奏并不是绝对精确的音高。用 `detune` 添加少量随机偏移可以让合成音色更自然：

```javascript
function playNaturalNote(frequency, jitter = 5) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.frequency.value = frequency
  // 添加 ±jitter 音分的随机偏差
  osc.detune.value = (Math.random() * 2 - 1) * jitter

  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 1)
}

// jitter = 5 表示最大 ±5 音分的偏差，模拟真人演奏的微小不稳定
```

合唱效果（Chorus）：也可以用 `detune` 实现简单的合唱效果。将两个 OscillatorNode 设为相同频率，但一个 detune 设为 +10、另一个设为 -10，两者叠加会产生轻微的拍频现象（声音在两个微小差异频率之间摆动），模拟合唱的丰满感：

```javascript
const osc1 = ctx.createOscillator()
const osc2 = ctx.createOscillator()
osc1.frequency.value = osc2.frequency.value = 440
osc1.detune.value = 12
osc2.detune.value = -12
// 两者连接到同一个目标，会产生自然的合唱丰满感
```

`detune` 的取值范围通常没有硬性限制，但超过 ±2400 音分（两个八度）的效果在实际使用中很少有意义。

## 8. 🤔 如何使用多个 OscillatorNode 同时发声来合成一个和弦？

和弦由多个音同时发声组成。最基本的实现方式是为和弦中的每个音创建独立的 OscillatorNode，同时连接到目标节点。

以 C 大三和弦（C-E-G，频率约 261.63Hz、329.63Hz、392.00Hz）为例：

```javascript
function playChord(frequencies, duration = 2) {
  const oscillators = []

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05)
    gain.gain.setValueAtTime(0.15, ctx.currentTime + duration - 0.3)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)

    oscillators.push(osc)
  })

  return oscillators
}

// C 大三和弦
playChord([261.63, 329.63, 392.0], 2)
```

每个音单独一个 GainNode 的原因：音量控制。和弦中多个音同时发声时，叠加后的总音量可能超过 1.0 导致削波。将每个音的增益设为较低值（如 0.15 到 0.2），保证叠加后不超过 1.0。粗略的经验法则是将单音音量除以和弦中的音符数量。

更优雅的和弦系统需要考虑以下方面：

MIDI 编号批量转换。将和弦用 MIDI 编号定义更直观：

```javascript
function playChordByMidi(midiNotes, waveform = 'sawtooth', duration = 2) {
  const frequencies = midiNotes.map((n) => 440 * Math.pow(2, (n - 69) / 12))
  const gainPerNote = 0.12 / (midiNotes.length / 3) // 根据音符数动态调整
  const oscillators = []

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = waveform
    osc.frequency.value = freq
    gain.gain.setValueAtTime(gainPerNote, ctx.currentTime)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)

    oscillators.push({ osc, gain })
  })

  return oscillators
}

// C 大三和弦 = C4(60), E4(64), G4(67)
playChordByMidi([60, 64, 67])

// Am 七和弦 = A3(57), C4(60), E4(64), G4(67)
playChordByMidi([57, 60, 64, 67])
```

琶音（Arpeggio）效果——不是所有音同时发声，而是依次快速触发：

```javascript
function playArpeggio(midiNotes, noteDuration = 0.4, gap = 0.15) {
  midiNotes.forEach((note, i) => {
    setTimeout(
      () => {
        playMidiNote(note, noteDuration)
      },
      i * gap * 1000,
    )
  })
}

playArpeggio([60, 64, 67, 72]) // C-E-G-C 依次快速弹奏
```

共享效果器节点。如果需要对整个和弦统一施加效果（如混响、延迟），可以将所有 OscillatorNode 的 GainNode 先汇聚到一个公共的效果器链，再连接到 destination：

```javascript
const convolver = ctx.createConvolver()
convolver.buffer = reverbIRBuffer
convolver.connect(ctx.destination)

// 和弦中的每个音连接到 convolver 而非直接连接 destination
osc.connect(gain)
gain.connect(convolver)
```

自动停止与清理。务必在所有 OscillatorNode 播放结束后断开连接，避免节点泄漏。可以监听最后一个 OscillatorNode 的 `ended` 事件进行统一清理。

## 9. 🤔 如何使用 AudioBuffer 生成白噪声并用滤波器将其变为粉噪声？

白噪声（White Noise）是包含所有频率且各频率能量相等的随机信号。粉噪声（Pink Noise，又称 1/f 噪声）是低频能量高于高频的噪声，每倍频程（频率翻倍）能量衰减 3dB。粉噪声在自然界中非常常见（如瀑布声、风声、心跳声），听感比白噪声更「温暖」、更舒适。

第一步：生成白噪声的 AudioBuffer。

```javascript
function createWhiteNoise(ctx, duration = 2) {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1 // -1 到 1 的随机值
  }

  return buffer
}
```

直接用白噪声播放可以模拟风声、海浪声等环境音效。将白噪声经过 BiquadFilterNode 的低通滤波器就能得到类似海浪的声音：

```javascript
const noiseBuffer = createWhiteNoise(ctx, 2)

function playOceanWave() {
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 500
  filter.Q.value = 1

  const gain = ctx.createGain()
  gain.gain.value = 0.3

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()

  // 用 LFO 调制滤波器频率模拟波浪起伏
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.1 // 10 秒一个周期
  lfoGain.gain.value = 400 // 频率摆动范围
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  return { source, lfo }
}
```

第二步：将白噪声转换为粉噪声。

粉噪声的生成不能简单地用单个滤波器实现，因为需要每倍频程精确衰减 3dB。最经典的方法是 Paul Kellett 提出的算法，用 7 个一阶 IIR 滤波器级联逼近粉噪声的 1/f 频谱特性：

```javascript
function createPinkNoiseOffline(ctx, duration = 2) {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const offCtx = new OfflineAudioContext(1, length, sampleRate)

  // 在 OfflineAudioContext 中创建白噪声
  const whiteBuffer = createWhiteNoise(offCtx, duration)
  const whiteSource = offCtx.createBufferSource()
  whiteSource.buffer = whiteBuffer

  // 使用 ScriptProcessorNode（OfflineAudioContext 中可用）处理
  // 注意：实际项目中推荐用 AudioWorklet，但离线渲染时 ScriptProcessorNode 也可用
  const processor = offCtx.createScriptProcessor(4096, 1, 1)

  // Paul Kellett 粉噪声滤波器状态
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0

  processor.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0)
    const output = e.outputBuffer.getChannelData(0)

    for (let i = 0; i < input.length; i++) {
      const white = input[i]

      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898

      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  }

  whiteSource.connect(processor)
  processor.connect(offCtx.destination)
  whiteSource.start(0)

  return offCtx.startRendering()
}
```

更简洁的实时实现方式（不用 OfflineAudioContext）：

```javascript
function createPinkNoiseNode(ctx) {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1

    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898

    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

// 使用粉噪声播放自然环境声
const pinkNoise = createPinkNoiseNode(ctx)
const gain = ctx.createGain()
gain.gain.value = 0.2
pinkNoise.connect(gain)
gain.connect(ctx.destination)
pinkNoise.start()
```

白噪声听感尖锐刺耳（所有频率能量相同，高频很突出），粉噪声听起来更像自然界的风声、雨声或瀑布声（低频能量更强，高频相对柔和）。在声音设计中，粉噪声常用于模拟自然环境、生成舒适的背景声（白噪声机的原理）、以及音频测试中检测音响系统的频率响应。
