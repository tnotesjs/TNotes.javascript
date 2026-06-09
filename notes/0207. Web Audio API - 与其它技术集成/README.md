# [0207. Web Audio API - 与其它技术集成](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0207.%20Web%20Audio%20API%20-%20%E4%B8%8E%E5%85%B6%E5%AE%83%E6%8A%80%E6%9C%AF%E9%9B%86%E6%88%90)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么要把 Web Audio API 和其它技术集成？](#3-为什么要把-web-audio-api-和其它技术集成)
- [4. 什么时候应该继续使用 `<audio>`？](#4-什么时候应该继续使用-audio)
- [5. 如何把 `<audio>` 接入音频图？](#5-如何把-audio-接入音频图)
- [6. 如何接入麦克风实时输入？](#6-如何接入麦克风实时输入)
- [7. WebRTC 音频流能和 Web Audio API 做什么组合？](#7-webrtc-音频流能和-web-audio-api-做什么组合)
- [8. Page Visibility API 为什么会影响音频？](#8-page-visibility-api-为什么会影响音频)
- [9. 自动播放策略会带来哪些工程限制？](#9-自动播放策略会带来哪些工程限制)

<!-- endregion:toc -->

## 1. 本节内容

- 理解 Web Audio API 与其它 Web 平台能力的集成方式。
- 掌握用 `MediaElementAudioSourceNode` 接入 `<audio>`，处理长音频和背景音乐。
- 了解媒体元素接入 Web Audio API 时的复用、CORS 和播放策略限制。
- 掌握用 `getUserMedia()` 和 `MediaStreamAudioSourceNode` 接入麦克风实时音频。
- 了解 WebRTC 音频流进入 Web Audio API 后可以做的处理。
- 掌握 Page Visibility API 对音频播放状态管理的意义。
- 理解现代浏览器自动播放策略和 `AudioContext.resume()` 的关系。

## 2. 评价

- 这一章很实用，因为真实项目里的音频往往不只来自音频文件。`<audio>`、麦克风、WebRTC、页面可见性和自动播放策略一起出现时，Web Audio API 才真正进入应用工程问题。

## 3. 为什么要把 Web Audio API 和其它技术集成？

Web Audio API 很强，但它不是孤立存在的。真实应用里的声音可能来自很多地方：

- 已有的 `<audio>` 或 `<video>` 元素。
- 用户麦克风。
- WebRTC 远端音频流。
- 长时间播放的背景音乐。
- 页面可见性、用户手势和浏览器播放策略。

Web Audio API 的价值在于：这些不同来源的声音一旦进入音频图，就可以继续使用同一套节点处理，例如增益、滤波、分析、混响、空间化和压缩。

## 4. 什么时候应该继续使用 `<audio>`？

`<audio>` 不适合复杂实时音频处理，但它非常适合长音频和流式播放。例如背景音乐、播客、长音频课程、网络电台，通常不应该先完整下载并解码成一个巨大的 `AudioBuffer`。

`<audio>` 的优势包括：

- 浏览器原生处理缓冲和流式加载。
- 可以使用浏览器内置媒体控件。
- 对长音频更省内存。
- 适合普通播放、暂停、进度控制和媒体会话集成。

如果你只是播放一首背景音乐，`<audio>` 本身就够了。如果你还想对它加滤波、分析、混响或接入统一混音总线，就可以把它接入 Web Audio API。

## 5. 如何把 `<audio>` 接入音频图？

可以使用 `createMediaElementSource()` 把一个媒体元素包装成 `MediaElementAudioSourceNode`。

```js
const audio = new Audio('/music/theme.mp3')
const source = audioContext.createMediaElementSource(audio)
const filter = audioContext.createBiquadFilter()

filter.type = 'lowpass'
filter.frequency.value = 1200

source.connect(filter)
filter.connect(audioContext.destination)

playButton.addEventListener('click', async () => {
  await audioContext.resume()
  await audio.play()
})
```

这样，`<audio>` 负责加载和播放长音频，Web Audio API 负责处理和输出。

使用时有几个注意点：

- 同一个媒体元素通常只能创建一个 `MediaElementAudioSourceNode`，不要反复创建。
- 如果音频跨域加载，需要服务器提供合适的 CORS 头，并设置 `audio.crossOrigin`。
- 媒体元素接入音频图后，输出路径会变成 Web Audio API 的图结构，要确保最终连接到 `context.destination`。
- 现代浏览器限制自动播放，首次播放通常需要用户手势。

## 6. 如何接入麦克风实时输入？

麦克风输入通过 `navigator.mediaDevices.getUserMedia()` 获取。拿到 `MediaStream` 后，可以用 `createMediaStreamSource()` 把它接入音频图。

```js
async function connectMicrophone() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const input = audioContext.createMediaStreamSource(stream)
  const filter = audioContext.createBiquadFilter()
  const analyser = audioContext.createAnalyser()

  filter.type = 'notch'
  filter.frequency.value = 60
  filter.Q.value = 10

  input.connect(filter)
  filter.connect(analyser)

  return { stream, input, analyser }
}
```

麦克风输入通常用于：

- 实时波形和频谱显示。
- 录音前的电平检测。
- 语音聊天效果处理。
- 音高、节奏或响度驱动的交互。
- 教学和实验性音频应用。

现代浏览器通常要求页面运行在 HTTPS 或 localhost，并且必须由用户授权。结束使用时，也要停止输入流，避免麦克风一直占用。

```js
function stopStream(stream) {
  for (const track of stream.getTracks()) {
    track.stop()
  }
}
```

## 7. WebRTC 音频流能和 Web Audio API 做什么组合？

WebRTC 可以建立浏览器之间的实时音视频通信。它得到的远端音频流同样可以进入 Web Audio API。

一旦接入音频图，就可以做很多事情：

- 给不同说话人单独调音量。
- 给多人语音做空间化，让不同用户听起来来自不同方向。
- 对远端音频做频谱分析或说话检测。
- 给语音加压缩、滤波或降噪前后的可视化。
- 把实时通信音频和应用内音效统一混音。

概念上，WebRTC 的远端流和麦克风输入类似，都是 `MediaStream`：

```js
function connectRemoteStream(remoteStream) {
  const remoteSource = audioContext.createMediaStreamSource(remoteStream)
  const panner = audioContext.createPanner()

  panner.positionX.value = -1
  panner.positionY.value = 0
  panner.positionZ.value = -0.5

  remoteSource.connect(panner)
  panner.connect(audioContext.destination)
}
```

实际 WebRTC 项目会更复杂，因为还涉及回声消除、自动增益、噪声抑制、设备切换和网络延迟。Web Audio API 主要负责本地音频图处理。

## 8. Page Visibility API 为什么会影响音频？

如果一个网页切到后台后继续播放声音，用户可能很难找到声音来自哪个标签页。对音乐播放器来说，后台继续播放是合理的；对游戏、互动演示和练习工具来说，切后台时暂停通常更符合预期。

Page Visibility API 可以告诉你页面是否可见。

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audioContext.suspend()
  } else {
    audioContext.resume()
  }
})
```

对于 Web Audio API，暂停整个 `AudioContext` 往往比停止某个 source 更稳妥。因为 `AudioBufferSourceNode` 一旦 `stop()`，就不能再次 `start()`；如果你停止 source，再恢复时需要重建播放状态。

当然，不是所有应用都应该隐藏时暂停。判断依据是产品语义：

| 应用类型   | 隐藏页面后的合理行为                         |
| ---------- | -------------------------------------------- |
| 音乐播放器 | 通常继续播放。                               |
| 播客或课程 | 通常继续播放。                               |
| 游戏       | 通常暂停游戏和音频。                         |
| 音频编辑器 | 视当前播放状态和用户设置决定。               |
| 实时会议   | 通常不能直接暂停，需要更细的静音或降噪策略。 |

## 9. 自动播放策略会带来哪些工程限制？

书中的很多旧示例会在页面加载后直接创建上下文并播放声音。现代浏览器为了避免网页自动发声，通常要求音频播放由用户手势触发。

因此真实项目里要注意：

- 创建 `AudioContext` 后，它可能处于 `suspended` 状态。
- 首次播放声音前，最好在点击、触摸或键盘事件里调用 `audioContext.resume()`。
- `<audio>.play()` 返回 Promise，可能因为自动播放策略失败。
- 不要假设页面加载完成就能立即发声。

一个更稳的入口写法是：

```js
async function unlockAudio() {
  if (audioContext.state !== 'running') {
    await audioContext.resume()
  }
}

startButton.addEventListener('click', async () => {
  await unlockAudio()
  await audio.play()
})
```

Web Audio API 和其它 Web 技术集成时，难点往往不是某个节点怎么创建，而是状态管理：用户授权、页面可见性、媒体加载、播放失败、跨域限制和资源释放都要一起考虑。
