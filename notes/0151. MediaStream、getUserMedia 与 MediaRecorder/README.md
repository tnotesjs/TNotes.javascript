# [0151. MediaStream、getUserMedia 与 MediaRecorder](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0151.%20MediaStream%E3%80%81getUserMedia%20%E4%B8%8E%20MediaRecorder)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 getUserMedia 请求麦克风权限时，如何设置只获取音频而不获取视频？](#3--getusermedia-请求麦克风权限时如何设置只获取音频而不获取视频)
- [4. 🤔 echoCancellation、noiseSuppression、autoGainControl 这三个约束分别有什么作用？](#4--echocancellationnoisesuppressionautogaincontrol-这三个约束分别有什么作用)
- [5. 🤔 如何将 getUserMedia 获取的麦克风流接入 Web Audio API 音频图中进行实时处理？](#5--如何将-getusermedia-获取的麦克风流接入-web-audio-api-音频图中进行实时处理)
- [6. 🤔 MediaRecorder 的 mimeType 应如何指定，不同浏览器支持的编码格式有哪些差异？](#6--mediarecorder-的-mimetype-应如何指定不同浏览器支持的编码格式有哪些差异)
- [7. 🤔 如何在录制过程中同时获取音频数据用于实时可视化？](#7--如何在录制过程中同时获取音频数据用于实时可视化)
- [8. 🤔 MediaRecorder 的 timeslice 参数有什么作用，适用于什么场景？](#8--mediarecorder-的-timeslice-参数有什么作用适用于什么场景)
- [9. 🤔 如何实现录音的暂停与恢复，并最终导出为可下载的音频文件？](#9--如何实现录音的暂停与恢复并最终导出为可下载的音频文件)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- navigator.mediaDevices.getUserMedia() 用法
- constraints 约束对象配置
- audio 约束（sampleRate、channelCount、echoCancellation、noiseSuppression、autoGainControl）
- MediaStream 与 MediaStreamTrack
- getAudioTracks() 音频轨道
- createMediaStreamSource() 接入音频图
- MediaRecorder 构造函数与 mimeType
- start()、stop()、pause()、resume() 录制控制
- ondataavailable 事件与 Blob 数据收集
- URL.createObjectURL() 音频导出与下载
- timeslice 参数与分片录制

## 2. 🫧 评价

- todo

## 3. 🤔 getUserMedia 请求麦克风权限时，如何设置只获取音频而不获取视频？

`getUserMedia` 的第一个参数是一个 constraints（约束）对象，其中 `audio` 和 `video` 分别控制是否请求音频和视频轨道。只获取音频时，将 `video` 设为 `false` 即可：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false,
})
```

`audio: true` 表示请求音频轨道，使用浏览器的默认音频设备和默认参数。如果需要更精细的控制，可以将 `audio` 设为一个约束对象：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: false,
})
```

如果完全省略 `video` 属性或将其设为 `false`，浏览器只会请求麦克风权限，不会弹出摄像头选择提示。如果将 `video` 设为 `true` 或传入视频约束对象，浏览器会同时请求摄像头和麦克风权限。

一个常见错误是误将约束对象写成字符串：

```javascript
// 错误：constraints 必须是对象，不能是字符串
navigator.mediaDevices.getUserMedia('audio') // ❌ 类型错误

// 正确
navigator.mediaDevices.getUserMedia({ audio: true }) // ✅
```

获取到的 `MediaStream` 对象可以通过 `getAudioTracks()` 返回只包含音频轨道的数组：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
const audioTracks = stream.getAudioTracks()
console.log(`音频轨道数量：${audioTracks.length}`) // 通常为 1

const track = audioTracks[0]
console.log(`设备标签：${track.label}`) // 如 "Default - MacBook Pro Microphone"
console.log(`是否静音：${track.muted}`)
console.log(`轨道状态：${track.readyState}`) // "live" 或 "ended"
```

`track.label` 返回设备名称，但只有在用户授予权限后才能读取，否则返回空字符串。

音频轨道支持运行时切换参数。某些约束（如 `echoCancellation`）可以通过 `applyConstraints` 动态修改，无需重新获取流：

```javascript
const track = stream.getAudioTracks()[0]
await track.applyConstraints({
  echoCancellation: false,
})
```

不过并非所有约束都支持动态修改，部分约束（如 `sampleRate`）只能在获取流时设定。可以调用 `track.getCapabilities()` 查看当前设备支持哪些约束以及它们的可调范围。

释放资源：使用完毕后应停止所有轨道以释放麦克风硬件：

```javascript
stream.getTracks().forEach((track) => track.stop())
```

不调用 `stop()` 的话，浏览器标签页上会持续显示麦克风图标，表示仍在使用麦克风。

---

## 4. 🤔 echoCancellation、noiseSuppression、autoGainControl 这三个约束分别有什么作用？

这三个约束控制浏览器对麦克风输入信号的实时预处理。它们由浏览器内置的音频处理管线实现，在信号进入 Web Audio API 之前就已经被处理过了。

`echoCancellation`（回声消除）—— 消除扬声器播放的声音被麦克风重新采集形成的回声。当扬声器播放音频时，麦克风会捕获到这些声音并再次送入系统，形成回声循环。回声消除算法会检测扬声器的输出信号，从麦克风输入中减去这部分信号。

开启时适用场景：语音通话、视频会议——用户通过扬声器播放对方的语音，同时用麦克风说话，必须消除回声避免对方听到自己声音的回传。

关闭时适用场景：录音棚录音、吉他效果器、音乐制作——不需要消除回声，且关闭后可以获得更纯净、未处理的原始音频信号。回声消除算法可能对音乐信号引入失真或异常处理。

```javascript
echoCancellation: true // 开启（默认值）
echoCancellation: false // 关闭
```

`noiseSuppression`（噪声抑制）—— 降低麦克风输入中的背景噪声（如风扇声、键盘声、空调声）。算法会识别并压制持续性的稳态噪声，保留语音等有用信号。

开启时适用场景：语音识别、语音通话——需要干净的人声信号。

关闭时适用场景：音乐录制、环境声采集——噪声抑制可能误将音乐中的某些成分（如持续的贝斯音、pad 音色）识别为噪声并压制，导致音质损失。

```javascript
noiseSuppression: true // 开启（默认值）
noiseSuppression: false // 关闭
```

`autoGainControl`（自动增益控制）—— 自动调节麦克风的输入音量。当说话声音较小时自动提升增益，声音过大时自动降低增益，使输出音量保持在一个相对稳定的水平。

开启时适用场景：语音通话——确保远近不同的人说话时音量大致一致。

关闭时适用场景：音乐录制、音频测量——自动增益会破坏音频的原始动态范围。例如录制乐器时，轻柔的段落和强烈的段落之间的音量差异是音乐表现力的一部分，自动增益会抹平这些差异。音频测量需要原始的信号幅度数据，自动增益会让测量结果失去参考意义。

```javascript
autoGainControl: true // 开启（默认值）
autoGainControl: false // 关闭
```

音乐类应用的通用建议是将三者全部关闭，以获取最原始的音频信号：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
  video: false,
})
```

需要注意的是，这三个处理都依赖浏览器和操作系统的底层实现。不同浏览器（甚至同一浏览器在不同操作系统上）的处理质量可能有差异。某些浏览器可能不支持禁用这些选项，即使设为 `false` 仍然会生效。可以通过 `track.getSettings()` 检查实际生效的值来确认：

```javascript
const track = stream.getAudioTracks()[0]
const settings = track.getSettings()
console.log(settings.echoCancellation) // 实际是否生效
console.log(settings.noiseSuppression)
console.log(settings.autoGainControl)
```

---

## 5. 🤔 如何将 getUserMedia 获取的麦克风流接入 Web Audio API 音频图中进行实时处理？

将麦克风流接入 Web Audio API 需要使用 `createMediaStreamSource()` 方法。它接收一个 `MediaStream` 对象，返回一个 `MediaStreamAudioSourceNode`，之后就可以像其他音频节点一样连接到音频图中。

```javascript
const ctx = new AudioContext()
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
})

// 将麦克风流接入音频图
const source = ctx.createMediaStreamSource(stream)

// 连接到分析器用于可视化
const analyser = ctx.createAnalyser()
source.connect(analyser)

// 通常不直接连接到 destination（会听到自己说话的实时回传）
// analyser.connect(ctx.destination);
```

一个关键注意点：是否连接到 `ctx.destination` 取决于使用场景。

如果只需要做音频分析（可视化、音量检测、语音识别后处理），不需要将信号送到扬声器，那就不连接 `destination`。这样可以避免麦克风采集扬声器输出的声音形成回声循环。

如果需要实时监听（如录音棚监听），可以连接到 `destination`，但务必确保使用耳机而非扬声器，否则会产生刺耳的反馈啸叫。

接入后的实时处理示例——实时音量表（VU Meter）：

```javascript
function monitorVolume(analyser) {
  const dataArray = new Float32Array(analyser.fftSize)

  function update() {
    requestAnimationFrame(update)
    analyser.getFloatTimeDomainData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    const db = 20 * Math.log10(Math.max(rms, 1e-10))

    // 更新 UI
    vuMeter.style.width = `${Math.max(0, ((db + 60) / 60) * 100)}%`
  }

  update()
}
```

接入后的实时处理示例——实时变声效果（音高偏移）：

```javascript
const pitchShift = ctx.createBiquadFilter()
// 简易变声：通过滤波器塑形模拟
// 精确的音高偏移需要用 AudioWorklet 实现

// 也可以用 playbackRate 近似（对 MediaStream 不适用）
// 最佳方案是用 Grain-based pitch shifting 的 AudioWorklet
```

多麦克风设备选择。如果用户有多个音频输入设备，可以通过 `navigator.mediaDevices.enumerateDevices()` 列出所有设备，然后在 constraints 中指定 `deviceId`：

```javascript
const devices = await navigator.mediaDevices.enumerateDevices()
const audioInputs = devices.filter((d) => d.kind === 'audioinput')

// 让用户选择设备
const selectedDeviceId = audioInputs[0].deviceId

const stream = await navigator.mediaDevices.getUserMedia({
  audio: { deviceId: { exact: selectedDeviceId } },
})
```

轨道事件监听。麦克风可能在使用过程中被拔出或静音，需要监听轨道的 `mute`、`unmute` 和 `ended` 事件：

```javascript
const track = stream.getAudioTracks()[0]

track.addEventListener('mute', () => {
  console.log('麦克风被静音')
})

track.addEventListener('unmute', () => {
  console.log('麦克风已取消静音')
})

track.addEventListener('ended', () => {
  console.log('麦克风断开连接')
})
```

---

## 6. 🤔 MediaRecorder 的 mimeType 应如何指定，不同浏览器支持的编码格式有哪些差异？

`MediaRecorder` 构造函数接受一个可选的 `options` 参数，其中 `mimeType` 指定录制的编码格式和容器格式。格式表达为 MIME 类型字符串，如 `audio/webm;codecs=opus`。

```javascript
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
})
```

mimeType 的结构为「容器格式;codecs=编码格式」。常见组合：

`audio/webm;codecs=opus` —— WebM 容器 + Opus 编码。压缩率高、音质优秀，是 Web 上最推荐的音频录制格式。Opus 在低比特率下的表现尤其出色。

`audio/webm` —— WebM 容器，浏览器自动选择默认编码（通常为 Opus）。

`audio/ogg;codecs=opus` —— OGG 容器 + Opus 编码。功能上与 WebM 版本类似，但容器不同。

`audio/mp4;codecs=mp4a.40.2` —— MP4 容器 + AAC 编码。Safari 的首选格式。

`audio/webm;codecs=vp8` —— 通常用于视频录制，音频录制不推荐。

浏览器支持差异：

Chrome 和 Edge 支持 `audio/webm;codecs=opus`，这是最佳选择。也支持 `audio/webm`、`audio/ogg;codecs=opus`。

Firefox 支持 `audio/webm;codecs=opus`、`audio/ogg;codecs=opus`。Firefox 在 OGG 格式上的支持历史更长。

Safari 不支持 WebM 容器（直到较新版本才部分支持）。Safari 支持 `audio/mp4;codecs=mp4a.40.2`。如果需要兼容 Safari，必须提供 AAC/MP4 作为备选格式。

跨浏览器兼容的做法是在运行时检测支持情况：

```javascript
function getSupportedMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
  ]

  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }

  return '' // 不指定，让浏览器选择默认格式
}

const mimeType = getSupportedMimeType()
const recorder = mimeType
  ? new MediaRecorder(stream, { mimeType })
  : new MediaRecorder(stream)
```

`MediaRecorder.isTypeSupported()` 返回 `true` 表示该浏览器可以使用此格式录制，`false` 表示不支持。

不指定 mimeType 时的行为：浏览器会使用其默认格式。Chrome 默认使用 `audio/webm;codecs=opus`，Safari 默认使用 `audio/mp4`。这种做法简单但不保证输出格式一致性，如果后续需要服务端处理录制文件，建议显式指定格式。

比特率控制：可以通过 `audioBitsPerSecond` 参数控制录制比特率，影响文件大小和音质：

```javascript
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000, // 128kbps
})
```

典型的比特率参考：语音录制 32kbps 即可，音乐录制建议 128kbps 到 256kbps。不设置时浏览器使用默认值（通常为 Opus 约 128kbps）。

录制完成后的文件格式取决于 mimeType，后缀名要对应：WebM 容器用 `.webm`，OGG 容器用 `.ogg`，MP4 容器用 `.m4a` 或 `.mp4`。

---

## 7. 🤔 如何在录制过程中同时获取音频数据用于实时可视化？

录制和可视化的数据来源是同一个 `MediaStream`。两种操作互不冲突，可以同时进行。

核心思路：将 `MediaStream` 同时接入两个路径——一条通过 `MediaRecorder` 进行录制，另一条通过 `MediaStreamAudioSourceNode` 接入 Web Audio API 音频图进行实时分析。

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

// 路径一：录制
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
})
const chunks = []
recorder.ondataavailable = (e) => {
  if (e.data.size > 0) chunks.push(e.data)
}
recorder.start(1000) // 每秒产生一个数据块

// 路径二：实时可视化
const ctx = new AudioContext()
const source = ctx.createMediaStreamSource(stream)
const analyser = ctx.createAnalyser()
analyser.fftSize = 256
source.connect(analyser)

// 可视化循环
const canvas = document.getElementById('visualizer')
const canvasCtx = canvas.getContext('2d')
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

function draw() {
  requestAnimationFrame(draw)
  analyser.getByteFrequencyData(dataArray)

  canvasCtx.fillStyle = '#0d0d0d'
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

  const barWidth = canvas.width / bufferLength
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height
    canvasCtx.fillStyle = `hsl(${(i / bufferLength) * 360}, 80%, 55%)`
    canvasCtx.fillRect(
      i * barWidth,
      canvas.height - barHeight,
      barWidth - 1,
      barHeight,
    )
  }
}

draw()
```

这两条路径完全独立，不会互相影响。`MediaRecorder` 从 `MediaStream` 底层读取编码后的音频数据用于录制，`MediaStreamAudioSourceNode` 从同一个流中读取原始 PCM 数据用于分析。两者使用同一个流，不需要获取两次麦克风权限。

同时显示录制状态和实时音量的完整 UI：

```javascript
function updateRecordingUI(analyser, recorder) {
  const dataArray = new Float32Array(analyser.fftSize)

  function update() {
    requestAnimationFrame(update)

    // 计算实时音量
    analyser.getFloatTimeDomainData(dataArray)
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)

    // 更新音量条
    const level = Math.min(1, rms * 3)
    volumeBar.style.height = `${level * 100}%`

    // 录制状态指示
    if (recorder.state === 'recording') {
      recordDot.classList.add('active')
      elapsedTime.textContent = formatTime(Date.now() - startTime)
    }
  }

  update()
}
```

录制波形显示的进阶方案：除了频谱可视化，还可以在录制过程中实时绘制时域波形。将 `analyser` 的时域数据不断追加到一个环形缓冲区中，用 Canvas 绘制滚动波形图：

```javascript
const waveformData = []
const maxPoints = canvas.width

function drawWaveform() {
  requestAnimationFrame(drawWaveform)
  analyser.getByteTimeDomainData(dataArray)

  // 取当前帧的平均值作为波形上的一个点
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i]
  }
  const avg = sum / dataArray.length
  waveformData.push(avg)
  if (waveformData.length > maxPoints) waveformData.shift()

  canvasCtx.fillStyle = '#0d0d0d'
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
  canvasCtx.strokeStyle = '#4ade80'
  canvasCtx.lineWidth = 1.5
  canvasCtx.beginPath()

  waveformData.forEach((val, i) => {
    const y = (val / 255) * canvas.height
    i === 0 ? canvasCtx.moveTo(i, y) : canvasCtx.lineTo(i, y)
  })

  canvasCtx.stroke()
}
```

---

## 8. 🤔 MediaRecorder 的 timeslice 参数有什么作用，适用于什么场景？

`start()` 方法接受一个可选的 `timeslice` 参数（单位为毫秒），指定 `dataavailable` 事件的触发间隔。不传 timeslice 时，录制数据只在 `stop()` 时一次性返回。

```javascript
// 不使用 timeslice：录制结束后才触发一次 dataavailable
recorder.start()

// 使用 timeslice：每秒触发一次 dataavailable
recorder.start(1000)

// 每 500ms 触发一次
recorder.start(500)
```

不指定 timeslice 的行为：调用 `start()` 后不会立刻触发 `dataavailable`。只有当调用 `stop()` 或 `pause()` 时，才会触发 `dataavailable` 事件，返回整个录制期间的全部数据。这意味着如果录制了 10 分钟的音频，在调用 `stop()` 之前没有任何数据可用。

指定 timeslice 的行为：`dataavailable` 事件以指定间隔定期触发。每次触发时，`event.data` 包含自上次触发以来的音频数据（一个 Blob 对象）。调用 `stop()` 时会触发最后一次 `dataavailable`，返回剩余的数据。

```javascript
const chunks = []

recorder.ondataavailable = (e) => {
  if (e.data.size > 0) {
    chunks.push(e.data)
    console.log(`收到数据块：${e.data.size} 字节，累计 ${chunks.length} 个`)
  }
}

recorder.start(2000) // 每 2 秒一个数据块
```

timeslice 的典型使用场景：

场景一：实时上传到服务器。录制的音频需要实时传输到后端进行处理（如语音识别、直播），可以每秒或每几秒发送一个数据块：

```javascript
recorder.ondataavailable = async (e) => {
  if (e.data.size > 0) {
    const formData = new FormData()
    formData.append('audio', e.data)
    await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData,
    })
  }
}

recorder.start(1000)
```

场景二：录制时间很长时避免内存溢出。不使用 timeslice 时，所有数据累积在内存中的 chunks 数组里。录制 30 分钟的音频可能占用数百 MB 内存。使用 timeslice 可以将数据定期写入 IndexedDB 或上传到服务器，释放内存。

场景三：提供录制进度指示。通过 timeslice 定期触发回调，可以更新 UI 显示已录制的时长和数据量：

```javascript
let totalSize = 0
recorder.ondataavailable = (e) => {
  if (e.data.size > 0) {
    totalSize += e.data.size
    updateSizeDisplay(totalSize)
  }
}
```

场景四：允许中途取消而不丢失已录制数据。如果用户在录制过程中突然关闭页面，不使用 timeslice 的话所有数据都会丢失。使用 timeslice 可以将已录制的数据块定期保存，在 `beforeunload` 事件中即使 recorder 还没 stop，已触发过的数据块也不会丢失。

timeslice 的值选择建议：

1000ms（1 秒）是较常用的值，平衡了数据块粒度和事件触发频率。频繁触发（如 100ms）会产生大量小数据块，增加事件处理开销。间隔过长（如 30 秒）则失去了实时性的优势。

需要注意的是，timeslice 只是一个「提示」，浏览器可能会在 slightly 不同的时间点触发 `dataavailable`，不一定精确到毫秒。各数据块的时间长度也可能不完全相等。

---

## 9. 🤔 如何实现录音的暂停与恢复，并最终导出为可下载的音频文件？

`MediaRecorder` 提供了 `pause()` 和 `resume()` 方法来控制录制的暂停与恢复。

```javascript
let recorder
let chunks = []

async function startRecording(stream) {
  const mimeType = getSupportedMimeType()
  recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream)

  chunks = []

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: recorder.mimeType })
    downloadBlob(blob)
  }

  recorder.start(1000) // 每秒一个数据块
}

function pauseRecording() {
  if (recorder && recorder.state === 'recording') {
    recorder.pause()
  }
}

function resumeRecording() {
  if (recorder && recorder.state === 'paused') {
    recorder.resume()
  }
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop()
  }
}
```

`MediaRecorder` 的三种状态：`inactive`（未录制）、`recording`（正在录制）、`paused`（已暂停）。状态转换规则：`inactive` → `start()` → `recording`，`recording` → `pause()` → `paused`，`paused` → `resume()` → `recording`，`recording` 或 `paused` → `stop()` → `inactive`。

暂停期间的行为：`pause()` 调用后，`dataavailable` 事件暂停触发，音频数据停止积累。`resume()` 调用后，录制从暂停处继续。最终的音频文件中不会包含暂停期间的静音，录制的音频是连续的（除去暂停的间隔）。这与录音机的暂停行为一致。

如果需要在暂停期间保留静音（使最终音频的时间线与真实时间对应），需要自己处理：在 `pause()` 时记录时间戳，在 `resume()` 时插入对应长度的静音 AudioBuffer。

导出为可下载文件：

```javascript
function downloadBlob(blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url

  // 根据 mimeType 设置文件后缀名
  const ext = getExtensionFromMimeType(recorder.mimeType)
  a.download = `recording-${Date.now()}.${ext}`

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // 释放 URL 占用的内存
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

function getExtensionFromMimeType(mimeType) {
  if (mimeType.includes('webm')) return 'webm'
  if (mimeType.includes('ogg')) return 'ogg'
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('mpeg')) return 'mp3'
  return 'webm'
}
```

完整的录音应用需要处理的边界情况：

页面卸载保护。用户在录制过程中误关闭页面会丢失数据。可以监听 `beforeunload` 事件提醒用户：

```javascript
window.addEventListener('beforeunload', (e) => {
  if (recorder && recorder.state !== 'inactive') {
    e.preventDefault()
    e.returnValue = '正在录制中，确定要离开吗？'
  }
})
```

权限被撤销。用户可能在录制过程中通过浏览器设置手动撤销麦克风权限。监听音频轨道的 `ended` 事件来处理这种情况：

```javascript
stream.getAudioTracks()[0].addEventListener('ended', () => {
  if (recorder.state === 'recording') {
    recorder.stop() // 触发 ondataavailable 和 onstop
    showNotification('麦克风已断开，录制已自动停止')
  }
})
```

录制完成后的回放。将录制得到的 Blob 赋给一个 `<audio>` 元素的 `src` 即可回放：

```javascript
function playRecording(blob) {
  const url = URL.createObjectURL(blob)
  const audio = document.createElement('audio')
  audio.src = url
  audio.controls = true
  document.body.appendChild(audio)
  audio.play()
}
```

如果录制格式与 `<audio>` 元素的播放支持不一致（例如 Safari 录制的 mp4 可能在某些环境下无法在 `<audio>` 中播放），可以先将 Blob 通过 Web Audio API 解码再播放，实现格式无关的回放。
