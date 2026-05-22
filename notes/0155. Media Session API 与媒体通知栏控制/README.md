# [0155. Media Session API 与媒体通知栏控制](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0155.%20Media%20Session%20API%20%E4%B8%8E%E5%AA%92%E4%BD%93%E9%80%9A%E7%9F%A5%E6%A0%8F%E6%8E%A7%E5%88%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何设计一个同时支持播放列表、均衡器和可视化的完整音频播放器？](#3--如何设计一个同时支持播放列表均衡器和可视化的完整音频播放器)
- [4. 🤔 如何构建一个带钢琴键盘 UI 的浏览器合成器，实现按键发声和音色切换？](#4--如何构建一个带钢琴键盘-ui-的浏览器合成器实现按键发声和音色切换)
- [5. 🤔 在持续创建和销毁音频节点时，如何避免内存泄漏和性能退化？](#5--在持续创建和销毁音频节点时如何避免内存泄漏和性能退化)
- [6. 🤔 Tone.js 和原生 Web Audio API 之间的关系是什么，什么场景下应该引入第三方库？](#6--tonejs-和原生-web-audio-api-之间的关系是什么什么场景下应该引入第三方库)
- [7. 🤔 如何实现一个支持多种可视化模式（频谱、波形、圆形）的实时分析仪表盘？](#7--如何实现一个支持多种可视化模式频谱波形圆形的实时分析仪表盘)
- [8. 🤔 Web Audio API 在游戏音效中（如空间音频、多音效并发）有哪些最佳实践？](#8--web-audio-api-在游戏音效中如空间音频多音效并发有哪些最佳实践)
- [9. 🤔 如何系统地处理 Web Audio API 在不同浏览器间的差异和兼容性问题？](#9--如何系统地处理-web-audio-api-在不同浏览器间的差异和兼容性问题)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 项目架构设计与模块划分
- 完整音频播放器功能实现
- 录音机应用（录制、回放、导出）
- 实时音频可视化仪表盘
- 浏览器合成器键盘 UI
- Web Audio API 性能优化策略
- 音频资源懒加载与内存管理
- 跨浏览器兼容性测试策略
- Tone.js / Howler.js 等第三方库定位
- 游戏音频应用最佳实践

## 2. 🫧 评价

- todo

## 3. 🤔 如何设计一个同时支持播放列表、均衡器和可视化的完整音频播放器？

一个完整的音频播放器需要将「播放列表管理」、「均衡器控制」和「实时可视化」三个模块整合到同一张音频图中。

整体架构如下：

```
AudioBufferSourceNode / MediaElementAudioSourceNode
        │
    GainNode（音量控制）
        │
    BiquadFilterNode × N（均衡器链）
        │
    AnalyserNode（可视化数据源）
        │
    GainNode（主音量 / Master Gain）
        │
  AudioContext.destination
```

关键设计要点：

「播放列表管理」层面，维护一个数组存储音频元数据（标题、时长、文件路径等），当前播放索引指向正在播放的曲目。切换曲目时需要先 stop() 当前的 AudioBufferSourceNode，然后创建新的 SourceNode 并 connect 到音频图。由于 AudioBufferSourceNode 是一次性的，每次切歌都需要重新实例化。可以用一个「音频池」预解码若干首歌的 AudioBuffer，避免切歌时出现解码延迟。

「均衡器」层面，串联多个 BiquadFilterNode 构建参数均衡器。典型配置为 5~10 段，每段对应一个频段（如 60Hz、250Hz、1kHz、4kHz、16kHz）。每段的 type 设为 peaking，通过 UI 上的滑块控制每个滤波器的 gain 参数。所有滤波器串联连接，顺序从低频到高频排列。

「可视化」层面，在均衡器链的末端插入 AnalyserNode。使用 requestAnimationFrame 循环读取 getByteFrequencyData() 或 getByteTimeDomainData() 数据，绘制到 Canvas 上。需要注意 AnalyserNode 应放在音量控制 GainNode 之前，这样即使音量为零，分析器仍能获取数据（可用于静音状态下仍然展示可视化）。

「播放控制」层面，播放/暂停使用 AudioContext 的 suspend()/resume() 或 SourceNode 的 start()/stop()。进度条使用 AudioContext.currentTime 和 buffer.duration 计算百分比。拖拽进度时需要 stop 当前 SourceNode，以新的 offset 重新 start()。

「模块间通信」可以使用发布-订阅模式或简单的事件总线，让播放列表模块、均衡器模块、可视化模块彼此解耦。

## 4. 🤔 如何构建一个带钢琴键盘 UI 的浏览器合成器，实现按键发声和音色切换？

这个合成器需要分为「UI 层」和「音频引擎层」两个部分。

UI 层：

用 HTML/CSS 绘制钢琴键盘。白键用 div 元素按比例排列，黑键用绝对定位覆盖在白键之间的缝隙上。每个键绑定 data-note 属性存储 MIDI 音符编号（如 C4 = 60，D4 = 62）。键盘支持鼠标点击和电脑键盘映射（如 A 键对应 C4，W 键对应 C#4，S 键对应 D4 等）。

鼠标事件用 pointerdown / pointerup（支持触摸），在 pointerdown 时触发音符开始，pointerup 时触发音符释放。支持多指触控，需要对每个 pointerId 追踪状态。

音频引擎层：

每个正在发声的音符维护一组节点：OscillatorNode + GainNode（用于 ADSR 包络控制）。用一个 Map 结构以音符编号为 key，存储对应的节点组，用于后续停止和清理。

MIDI 音符编号转换为频率的公式：`frequency = 440 * Math.pow(2, (note - 69) / 12)`。其中 note 是 MIDI 编号，69 对应 A4 = 440Hz。

ADSR 包络实现：按下键时，gain 从 0 在 attack 时间内线性上升到 1（linearRampToValueAtTime），然后在 decay 时间内下降到 sustain level。松开键时，gain 在 release 时间内从 sustain level 线性衰减到 0，衰减完成后再 stop() 并 disconnect() OscillatorNode。

音色切换功能：

提供波形选择按钮（sine、square、sawtooth、triangle），切换时遍历当前所有正在发声的 OscillatorNode 并修改 type 属性。如果需要更复杂的音色，可以用 PeriodicWave 自定义波形，或叠加多个 OscillatorNode（如一个基频 + 一个 2 倍频泛音，调整各自的 GainNode 比例）来模拟更丰富的音色。

实现代码结构示例：

```javascript
const activeNotes = new Map() // Map<noteNumber, {osc, gain}>

function noteOn(note) {
  const freq = 440 * Math.pow(2, (note - 69) / 12)
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = currentWaveform
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, audioCtx.currentTime)
  gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.02)
  osc.connect(gain).connect(analyser).connect(audioCtx.destination)
  osc.start()
  activeNotes.set(note, { osc, gain })
}

function noteOff(note) {
  const entry = activeNotes.get(note)
  if (!entry) return
  entry.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3)
  entry.osc.stop(audioCtx.currentTime + 0.35)
  activeNotes.delete(note)
}
```

## 5. 🤔 在持续创建和销毁音频节点时，如何避免内存泄漏和性能退化？

Web Audio API 的节点如果处理不当，很容易造成内存泄漏。以下是关键策略：

第一，及时 disconnect 和 stop。AudioBufferSourceNode 播放结束后务必调用 stop() 和 disconnect()。很多开发者只调了 stop() 却忘了 disconnect()，导致已停止的节点仍然留在音频图中，占用内存。

第二，避免在循环中密集创建节点。例如在高频调用的函数中每次都 new OscillatorNode，应改为复用节点。可以用「节点池」模式：预创建一组节点，需要时从池中取出并 reset，用完后归还而非销毁。

第三，管理 AudioBuffer。加载的音频文件会以 AudioBuffer 形式占用内存。不再需要时应将引用设为 null（`buffer = null`），让 GC 回收。对于大型应用，实现 LRU 缓存策略，只保留最近使用过的 N 个 AudioBuffer。

第四，谨慎使用 addEventListener。对音频节点或 DOM 元素绑定了事件监听器后，要在节点销毁时 removeEventListener，否则监听器持有节点引用会阻止 GC。

第五，AudioContext 单例。不要频繁创建和销毁 AudioContext，浏览器对同时存在的 AudioContext 数量有硬性限制（Chrome 通常为 6 个）。整个应用应该共用一个 AudioContext。如果需要重置状态，调用 close() 后再新建，而不是反复创建。

第六，使用性能分析工具。Chrome DevTools 的 Performance 面板可以录制内存快照，检查是否有 detached AudioNode 或未释放的 ArrayBuffer。在 Performance Monitor 中观察 JS 堆大小的趋势，如果持续增长说明有泄漏。

第七，注意闭包陷阱。在事件回调或定时器中形成的闭包如果引用了音频节点，会导致节点无法被回收。确保回调在节点销毁后被清除。

## 6. 🤔 Tone.js 和原生 Web Audio API 之间的关系是什么，什么场景下应该引入第三方库？

「Tone.js」是建立在 Web Audio API 之上的高级封装库，它不替代 Web Audio API，而是简化其使用方式。两者的关系类似于 jQuery 之于原生 DOM API。

Tone.js 解决的原生 API 痛点包括：

「时间调度」—— 原生 AudioParam 的时间调度方法（setValueAtTime、linearRampToValueAtTime 等）参数抽象且容易出错。Tone.js 提供了人性化的音乐时间表达（如 "4n" 表示四分音符，"8t" 表示八分三连音），并内置 Transport 播放时间轴系统，类似 DAW 中的播放头。

「节点管理」—— 原生 API 需要手动创建节点并 connect/disconnect，容易遗漏导致泄漏。Tone.js 自动管理节点链路，对象 dispose() 时自动清理所有内部节点。

「乐器抽象」—— 原生 API 中合成一个钢琴音色需要自己组合多个 OscillatorNode、GainNode、BiquadFilterNode 并编写 ADSR 包络。Tone.js 提供 Tone.Synth、Tone.PolySynth、Tone.FMSynth 等开箱即用的乐器类。

「效果器」—— Tone.js 封装了 Tone.Reverb、Tone.Delay、Tone.Chorus、Tone.Compressor 等常用效果器，一行代码即可接入。

「采样器」—— Tone.Sampler 可以将音频文件映射到 MIDI 音符，自动处理播放速率调整。

什么时候应该引入第三方库：

「快速原型开发」—— 需要在短时间内搭建可运行的音频应用时，Tone.js 大幅降低开发成本。

「音乐类应用」—— 如果做的是音序器、合成器、节拍器等与音乐节奏强相关的应用，Tone.js 的 Transport 和音乐时间模型是巨大优势。

「效果器链复杂的场景」—— 需要串联大量效果器时，Tone.js 的链式 API（`synth.chain(chorus, delay, reverb, destination)`）比原生 connect 链清晰得多。

什么时候应该用原生 API：

「自定义音频处理」—— 需要使用 AudioWorklet 进行底层采样级别的处理时，第三方库无法替代原生能力。

「极致性能要求」—— 游戏引擎等对音频延迟和内存占用极其敏感的场景，原生 API 有更细粒度的控制。

「学习目的」—— 理解底层原理必须从原生 API 开始，直接使用封装库会屏蔽大量细节。

「其他常见库」：Howler.js 专注于音频播放（支持 sprite 音频切片，适合游戏音效），Phaser 等游戏框架内置了音频管理。相比 Tone.js 的音乐合成定位，Howler.js 更偏向「高效地播放已有音频文件」。

## 7. 🤔 如何实现一个支持多种可视化模式（频谱、波形、圆形）的实时分析仪表盘？

核心思路是用一个 AnalyserNode 作为数据源，多个 Canvas 各自以不同方式渲染同一份数据。

步骤一：建立音频图。将 AnalyserNode 插入音频链中（位于音量控制之前，确保静音时仍可获取数据）。配置 fftSize（如 2048），frequencyBinCount 就会是 1024。

步骤二：数据获取。在 requestAnimationFrame 循环中分别调用 getByteFrequencyData()（频率数据，用于频谱图）和 getByteTimeDomainData()（时域数据，用于波形图）。这两份数据共享同一个 AnalyserNode，可以同一次动画帧中同时获取。

步骤三：频谱柱状图（Frequency Bars）。遍历 frequencyData 数组，每个元素的值（0~255）映射为柱状图的高度。可以用渐变色从底部（低音）的蓝色过渡到顶部（高音）的红色。为了视觉效果，不需要绘制全部 1024 个频率条，取前 256 或 512 个即可。

步骤四：波形图（Waveform / Oscilloscope）。遍历 timeDomainData 数组，以 Canvas 的 moveTo/lineTo 绘制连续曲线。y 轴以 128 为中位线（静音时），值大于 128 向上，小于 128 向下。

步骤五：圆形可视化（Circular / Radial）。以 Canvas 中心为圆点，将频率数据映射为从圆心向外辐射的线条或弧段。将 360 度均匀分配给各频率条，每条的长度由对应的频率强度决定。可以进一步美化：使用极坐标绘制闭合曲线、添加渐变发光效果、或者用点阵模式绘制。

```javascript
function drawCircular(ctx, frequencyData, centerX, centerY, radius) {
  const bars = frequencyData.length
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
    const barLength = (frequencyData[i] / 255) * radius
    const x1 = centerX + Math.cos(angle) * radius * 0.3
    const y1 = centerY + Math.sin(angle) * radius * 0.3
    const x2 = centerX + Math.cos(angle) * (radius * 0.3 + barLength)
    const y2 = centerY + Math.sin(angle) * (radius * 0.3 + barLength)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = `hsl(${(i / bars) * 360}, 80%, 60%)`
    ctx.lineWidth = 2
    ctx.stroke()
  }
}
```

步骤六：模式切换。提供切换按钮，在 Canvas 上调用对应的绘制函数。同一帧的 requestAnimationFrame 中根据当前模式调用对应的 render 函数。

步骤七：UI 设计。仪表盘可以使用分屏布局（多个 Canvas 并列）或单 Canvas 切换模式。每种模式可以附加参数控制（如频谱的柱子数量、波形线条宽度、圆形的半径比例等）。使用 smoothingTimeConstant 控制数据的平滑度（0~1，值越大波形越平滑但响应越慢）。

## 8. 🤔 Web Audio API 在游戏音效中（如空间音频、多音效并发）有哪些最佳实践？

游戏音频场景的核心挑战是「低延迟触发」、「多音效并发」和「空间音效定位」。

低延迟触发：

使用 AudioBuffer 预解码所有音效文件，存储为 AudioBuffer 对象。当需要播放时直接创建 AudioBufferSourceNode 并 start(0)，省去解码延迟。避免使用 MediaElement 播放音效，其延迟通常高于 BufferSource 方式。

音频精灵（Audio Sprite）模式：

将多个短音效合并到一个 AudioBuffer 中（类似 CSS Sprite），通过 start(time, offset, duration) 的 offset 和 duration 参数选取其中某一段播放。这减少了 HTTP 请求数和 AudioBuffer 数量。

多音效并发管理：

维护一个「活跃音效池」，记录当前正在播放的所有 AudioBufferSourceNode。每个音效播放结束（onended 事件）后从池中移除并 disconnect。设置并发上限（如同时最多 20 个音效），超出时优先停止最早触发的或优先级最低的音效，防止音频节点过多导致性能问题。

音效分类与优先级：

将音效分为不同类别：UI 音效（按钮点击）、环境音效（风声、水声）、动作音效（射击、爆炸）、语音。每个类别分配独立的 GainNode 进行音量控制。高优先级音效（如对话语音）在并发冲突时不应被截断。

空间音频实现：

使用 PannerNode 实现 3D 空间音效。每个可发声的游戏对象关联一个 PannerNode，在游戏循环中根据对象的坐标实时更新 PannerNode 的 positionX/Y/Z。监听者（玩家）的位置通过 AudioContext.listener 的 positionX/Y/Z 设置。如果游戏是 2D 的，可以使用 StereoPannerNode 简化实现，只需根据对象相对玩家的水平位置设置 pan 值（-1 到 1）。

环境音效循环：

背景音乐和环境音（如鸟鸣、风声）使用 loop 属性循环播放。环境音可以叠加多个图层（一个层放持续的底噪，另一层随机触发间歇性音效如鸟叫），营造丰富的声场。

音效资源管理策略：

游戏加载时预解码所有短音效（如爆炸、射击，通常 < 5 秒），存入 Map。较长的背景音乐可以使用 MediaElement 流式播放以节省内存。使用 AudioContext 的 state 管理：页面切换到后台时 suspend 音频上下文，返回时 resume，避免后台持续消耗资源。

音量衰减与距离模型：

使用 PannerNode 的 distanceModel（inverse、linear、exponential）控制距离衰减曲线。设置 refDistance 和 maxDistance 确定音效可听范围。超出 maxDistance 的音效不创建 SourceNode，节省性能。

## 9. 🤔 如何系统地处理 Web Audio API 在不同浏览器间的差异和兼容性问题？

浏览器兼容性问题主要集中在「API 命名前缀」、「功能实现差异」和「行为边界情况」三个层面。

API 前缀问题：

Safari 长期使用 webkitAudioContext 而非标准 AudioContext。兼容写法：`const AudioCtx = window.AudioContext || window.webkitAudioContext;`。同样，SpeechRecognition 在 Chrome 中为 webkitSpeechRecognition。建议在应用初始化时做一次特性检测并缓存构造函数引用。

getUserMedia 前缀与旧接口：

旧版浏览器使用 navigator.webkitGetUserMedia 或 navigator.mozGetUserMedia。现代标准为 navigator.mediaDevices.getUserMedia()。推荐只支持标准接口，对不支持的浏览器给出明确的降级提示。

AudioWorklet 支持检测：

Safari 对 AudioWorklet 的支持较晚。检测方式：`if (audioCtx.audioWorklet)` 存在则使用 AudioWorklet，否则回退到已废弃的 ScriptProcessorNode。回退代码中应标注未来移除计划。

MediaRecorder 格式差异：

不同浏览器支持的 mimeType 不同。Chrome 支持 audio/webm;codecs=opus，Safari 支持 audio/mp4。检测可用格式：`MediaRecorder.isTypeSupported('audio/webm;codecs=opus')`，遍历优先级列表找到第一个支持的格式。

autoplay 策略差异：

所有现代浏览器都要求用户交互后才能启动 AudioContext。统一做法是提供一个"开始"按钮，在其 click 事件中创建或 resume AudioContext。某些移动端浏览器（如 iOS Safari）更严格，甚至需要在 touchstart 事件中触发而非 click。

采样率差异：

AudioContext 默认的 sampleRate 因设备和浏览器而异（常见 44100 或 48000）。解码的 AudioBuffer 如果采样率与 AudioContext 不匹配，浏览器会自动重采样，但可能引入额外的 CPU 开销和音质损失。可以在创建 AudioContext 时显式指定 sampleRate：`new AudioContext({ sampleRate: 44100 })`（需确认浏览器支持该参数）。

Safari 特有坑：

Safari 的 decodeAudioData 不支持 Promise 形式（部分旧版本）。Safari 的 PannerNode 对某些 distanceModel 的行为与 Chrome 有细微差异。iOS Safari 在后台时会暂停 AudioContext 的时钟。这些都需要针对性测试。

特性检测策略：

不使用 User-Agent 字符串判断浏览器，而是检测具体 API 是否存在：

```javascript
function checkSupport() {
  return {
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    audioWorklet: !!(
      window.AudioContext && AudioContext.prototype.audioWorklet
    ),
    mediaRecorder: !!window.MediaRecorder,
    mediaDevices: !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ),
    speechRecognition: !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
    ),
    speechSynthesis: !!window.speechSynthesis,
    mediaSession: !!navigator.mediaSession,
  }
}
```

根据检测结果，对不支持的功能提供优雅降级（如不支持 MediaRecorder 则隐藏录音按钮并提示用户），而不是让应用直接崩溃。

测试工具推荐：使用 BrowserStack 或 LambdaTest 进行跨浏览器云端测试。Can I Use 网站查询各 API 的浏览器支持情况。Chrome 的 WebAudio Inspector 扩展可以可视化音频图。
