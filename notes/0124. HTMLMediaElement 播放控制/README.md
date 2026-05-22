# [0124. HTMLMediaElement 播放控制](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0124.%20HTMLMediaElement%20%E6%92%AD%E6%94%BE%E6%8E%A7%E5%88%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 HTMLMediaElement 是什么？](#3--htmlmediaelement-是什么)
  - [3.1. 继承关系](#31-继承关系)
  - [3.2. 核心属性](#32-核心属性)
  - [3.3. 核心方法](#33-核心方法)
  - [3.4. 常用事件](#34-常用事件)
  - [3.5. 典型应用场景](#35-典型应用场景)
- [4. 🤔 HTMLMediaElement 的 preload 属性有哪些取值，分别代表什么含义？](#4--htmlmediaelement-的-preload-属性有哪些取值分别代表什么含义)
- [5. 🤔 如何使用 JavaScript 实现音频的播放、暂停和跳转到指定时间？](#5--如何使用-javascript-实现音频的播放暂停和跳转到指定时间)
- [6. 🤔 audio 元素 的 timeupdate 事件的触发频率是多少？](#6--audio-元素-的-timeupdate-事件的触发频率是多少)
- [7. 🤔 如何检测音频是否播放完毕并自动播放下一首？](#7--如何检测音频是否播放完毕并自动播放下一首)
- [8. 🤔 playbackRate 属性设置为负值会发生什么？](#8--playbackrate-属性设置为负值会发生什么)
- [9. 🤔 如何处理音频加载失败的情况并给出用户提示？](#9--如何处理音频加载失败的情况并给出用户提示)
- [10. 🤔 不同浏览器对音频格式的支持有何差异，如何做兼容性处理？](#10--不同浏览器对音频格式的支持有何差异如何做兼容性处理)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- audio / video 元素的创建与 src 属性
- autoplay、loop、preload、controls 属性
- play()、pause()、load() 方法
- currentTime、duration、volume、playbackRate 属性
- muted、paused、ended 状态属性
- loadedmetadata、canplay、play、pause、ended、timeupdate 事件
- MediaError 错误处理
- 音频格式兼容性（MP3、OGG、WAV、AAC）
- buffered 与预加载缓冲区

## 2. 🫧 评价

- todo

## 3. 🤔 HTMLMediaElement 是什么？

`HTMLMediaElement` 是 Web API 中的一个基础接口，为 `<audio>` 和 `<video>` 这两个 HTML 媒体元素提供了通用的属性、方法和事件。它本身不会被直接使用，而是作为 `HTMLAudioElement` 和 `HTMLVideoElement` 的父接口存在。

简单来说，`HTMLMediaElement` 就是浏览器给所有媒体元素提供的统一操控面板，它跟 Web 上音视频交互的基础能力密切相关。

### 3.1. 继承关系

```
EventTarget
  └── Node
        └── Element
              └── HTMLElement
                    └── HTMLMediaElement
                          ├── HTMLAudioElement
                          └── HTMLVideoElement
```

### 3.2. 核心属性

| 属性           | 说明                                       |
| -------------- | ------------------------------------------ |
| `src`          | 媒体资源的 URL                             |
| `currentTime`  | 当前播放时间（秒），可读可写               |
| `duration`     | 媒体总时长（秒）                           |
| `paused`       | 是否处于暂停状态                           |
| `muted`        | 是否静音                                   |
| `volume`       | 音量（0.0 ~ 1.0）                          |
| `playbackRate` | 播放速率（1.0 为正常速度）                 |
| `readyState`   | 媒体就绪程度（0~4）                        |
| `networkState` | 网络状态                                   |
| `ended`        | 是否已播放结束                             |
| `loop`         | 是否循环播放                               |
| `autoplay`     | 是否自动播放                               |
| `preload`      | 预加载策略（`none` / `metadata` / `auto`） |
| `buffered`     | 已缓冲的时间范围（`TimeRanges` 对象）      |

### 3.3. 核心方法

| 方法                | 说明                               |
| ------------------- | ---------------------------------- |
| `play()`            | 开始播放，返回 `Promise`           |
| `pause()`           | 暂停播放                           |
| `load()`            | 重新加载媒体                       |
| `canPlayType(type)` | 检测浏览器是否能播放指定 MIME 类型 |

```js
const video = document.querySelector('video')

// 播放
await video.play()

// 暂停
video.pause()

// 跳转到第 30 秒
video.currentTime = 30

// 2 倍速播放
video.playbackRate = 2.0

// 检测兼容性
video.canPlayType('video/mp4; codecs="avc1.42E01E"')
// 返回: "probably" | "maybe" | ""
```

### 3.4. 常用事件

| 事件                 | 触发时机                                |
| -------------------- | --------------------------------------- |
| `loadstart`          | 开始加载资源                            |
| `loadedmetadata`     | 元数据加载完成（时长、尺寸等已知）      |
| `loadeddata`         | 首帧数据已加载                          |
| `canplay`            | 可以开始播放（但可能还需缓冲）          |
| `canplaythrough`     | 预计可以不间断播放到底                  |
| `play`               | 开始播放                                |
| `pause`              | 暂停                                    |
| `timeupdate`         | `currentTime` 改变时触发（约每秒 4 次） |
| `ended`              | 播放结束                                |
| `volumechange`       | 音量或静音状态改变                      |
| `seeking` / `seeked` | 跳转开始 / 完成                         |
| `waiting`            | 因缓冲而暂停                            |
| `error`              | 加载或播放出错                          |

```js
const audio = new Audio('song.mp3')

audio.addEventListener('loadedmetadata', () => {
  console.log(`总时长: ${audio.duration}秒`)
})

audio.addEventListener('timeupdate', () => {
  const progress = (audio.currentTime / audio.duration) * 100
  console.log(`进度: ${progress.toFixed(1)}%`)
})

audio.addEventListener('ended', () => {
  console.log('播放完毕')
})

audio.play()
```

### 3.5. 典型应用场景

1. 自定义播放器 UI — 隐藏浏览器默认控件，用 `currentTime`、`play()`、`pause()` 等自行构建进度条、播放按钮。
2. 音视频同步 — 监听 `timeupdate` 实现字幕、歌词同步。
3. 流媒体控制 — 通过 `buffered`、`readyState` 监控缓冲状态，做自适应码率切换。
4. Web Audio API 桥接 — 将 `HTMLMediaElement` 作为 `AudioContext.createMediaElementSource()` 的输入源，进行音频可视化或实时处理。

```js
// Web Audio API 桥接示例
const audioCtx = new AudioContext()
const source = audioCtx.createMediaElementSource(audioElement)
const analyser = audioCtx.createAnalyser()
source.connect(analyser)
analyser.connect(audioCtx.destination)
// 现在可以通过 analyser 获取频谱数据做可视化
```

## 4. 🤔 HTMLMediaElement 的 preload 属性有哪些取值，分别代表什么含义？

preload 属性用于提示浏览器是否应在页面加载时预加载音频资源。它有三个可选值：

「none」—— 不预加载任何音频数据。浏览器在用户触发播放之前不会发起任何网络请求。适用于用户不太可能播放该音频的场景，或者页面上有大量音频需要节省带宽的情况。

「metadata」—— 仅预加载音频的元数据（时长、尺寸、轨道信息等），不下载实际的音频数据。浏览器会发起请求获取文件头部信息后停止下载。适用于需要显示音频时长等信息但用户不一定立即播放的场景，如播客列表页。

「auto」（或不设置该属性）—— 浏览器自动决定是否预加载整个音频文件。在带宽充足的情况下，浏览器通常会在页面加载时就开始下载完整音频。适用于用户大概率会播放的场景，如页面的主播放器。

需要注意的几点：

preload 是一个「提示」而非强制指令。浏览器可以忽略该设置，例如在省流模式下即使设为 auto 也可能不预加载，或者在某些移动端浏览器中默认行为与桌面端不同。

当设置了 autoplay 属性时，preload 的设置会被覆盖，浏览器无论如何都需要加载音频数据。

可以通过 audio.buffered 属性（返回一个 TimeRanges 对象）来检查已缓冲的音频范围，从而得知预加载的实际执行情况：

```javascript
const audio = document.querySelector('audio')
audio.addEventListener('progress', () => {
  const buffered = audio.buffered
  if (buffered.length > 0) {
    const loadedEnd = buffered.end(buffered.length - 1)
    const duration = audio.duration
    const percent = ((loadedEnd / duration) * 100).toFixed(1)
    console.log(`已缓冲：${percent}%`)
  }
})
```

---

## 5. 🤔 如何使用 JavaScript 实现音频的播放、暂停和跳转到指定时间？

HTMLMediaElement 提供了直观的方法和属性来控制音频播放。

播放与暂停：

play() 方法返回一个 Promise。在自动播放策略被阻止时，该 Promise 会被 reject，需要捕获异常：

```javascript
const audio = document.querySelector('audio')

async function togglePlay() {
  if (audio.paused) {
    try {
      await audio.play()
    } catch (err) {
      console.error('播放被阻止：', err.message)
    }
  } else {
    audio.pause()
  }
}
```

跳转到指定时间：

通过设置 currentTime 属性（单位为秒）可以实现跳转。currentTime 是可读写的，赋值时浏览器会跳转到对应位置并从该处继续播放：

```javascript
// 跳转到第 30 秒
audio.currentTime = 30

// 跳转到音频的中间位置
audio.currentTime = audio.duration / 2
```

配合 input range 滑块实现进度条控制：

```javascript
const seekBar = document.getElementById('seek')

// 更新滑块显示当前进度
audio.addEventListener('timeupdate', () => {
  seekBar.value = audio.currentTime / audio.duration
})

// 拖拽滑块跳转
seekBar.addEventListener('input', () => {
  audio.currentTime = seekBar.value * audio.duration
})
```

load() 方法用于重新加载音频资源。典型场景是更换了 audio 元素的 src 属性后，需要调用 load() 使新资源生效：

```javascript
audio.src = 'new-track.mp3'
audio.load()
audio.play()
```

此外，fastSeek() 方法可以实现快速跳转（部分浏览器支持），它比直接设置 currentTime 更高效，因为它会跳过中间的解码步骤。但浏览器支持度不如 currentTime 赋值广泛。

---

## 6. 🤔 audio 元素 的 timeupdate 事件的触发频率是多少？

timeupdate 事件在 currentTime 属性改变时由浏览器触发，但其触发频率并非由开发者控制，也没有统一的标准规定。

规范层面，HTML 规范没有定义 timeupdate 的具体触发间隔，仅要求在播放期间「以合理的频率」触发。这意味着不同浏览器有不同的实现：

- Chrome 和 Edge 通常每 250 毫秒触发一次
- Firefox 通常每 200~250 毫秒触发一次
- Safari 的间隔可能更长，有时约 250~500 毫秒

这些间隔都不是精确的，会受到系统负载、浏览器节流策略等因素影响。

对精度要求不高的场景（如更新进度条、显示当前播放时间），timeupdate 完全够用。

如果需要更高精度的定时更新，可以使用 requestAnimationFrame 自行轮询 currentTime：

```javascript
function updateProgress() {
  if (!audio.paused) {
    const progress = audio.currentTime / audio.duration
    progressBar.style.width = `${progress * 100}%`
    timeDisplay.textContent = formatTime(audio.currentTime)
  }
  requestAnimationFrame(updateProgress)
}
requestAnimationFrame(updateProgress)
```

这种方式每帧（约 16ms / 60fps）更新一次，远比 timeupdate 频繁。

需要注意的另一个细节：timeupdate 在 seek 操作（拖拽进度条改变 currentTime）时也会触发。如果需要区分「正常播放推进」和「用户拖拽跳转」，可以结合 seeking 事件来判断：

```javascript
audio.addEventListener('seeking', () => {
  console.log('用户正在拖拽跳转')
})
```

此外，音频暂停期间 timeupdate 不会触发。如果需要在暂停状态下也响应 currentTime 的变化（比如用户拖拽进度条），应监听 seeked 事件而非 timeupdate。

---

## 7. 🤔 如何检测音频是否播放完毕并自动播放下一首？

检测音频播放完毕使用 ended 事件。当音频播放到末尾（currentTime 达到 duration）时，浏览器会自动触发 ended 事件并设置 paused 为 true。

实现自动播放下一首的基本逻辑：

```javascript
const playlist = ['track1.mp3', 'track2.mp3', 'track3.mp3']
let currentIndex = 0
const audio = document.querySelector('audio')

audio.addEventListener('ended', () => {
  currentIndex++
  if (currentIndex < playlist.length) {
    audio.src = playlist[currentIndex]
    audio.load()
    audio.play()
  } else {
    // 播放列表结束
    console.log('全部播放完毕')
  }
})
```

如果需要循环播放整个列表，在列表末尾时将 currentIndex 重置为 0。

如果需要单曲循环（loop 属性），ended 事件不会触发，因为浏览器会自动从头播放。此时应使用 loop 属性而非在 ended 中处理：

```javascript
// 单曲循环
audio.loop = true

// 列表循环（不用 loop 属性，在 ended 中切歌）
audio.loop = false
audio.addEventListener('ended', playNext)
```

更完整的播放列表实现需要处理以下边界情况：

播放到最后一首后的行为（停止、循环回到第一首、随机播放）。可以维护一个 playMode 变量来切换模式。

切换曲目时的过渡体验。在切换 src 和 load() 之间可能有短暂的静音，可以在 ended 事件中预先解码下一首的 AudioBuffer（如果用 Web Audio API），或者利用预加载：给 audio 元素设置 preload="auto" 让浏览器提前加载下一首。

随机播放（Shuffle）的实现需要维护一个打乱顺序的索引数组，避免同一首歌连续播放。可以使用 Fisher-Yates 洗牌算法生成随机顺序。

---

## 8. 🤔 playbackRate 属性设置为负值会发生什么？

playbackRate 属性接受一个浮点数来控制播放速率。默认值为 1.0（正常速度），大于 1 为快进，0 到 1 之间为慢放，0 为暂停（静止），等于 -1 为反向播放。

但实际情况是：大多数浏览器不支持负值的 playbackRate。

在 Chrome、Firefox、Safari 中，将 playbackRate 设置为负值时，浏览器会抛出 InvalidStateError 或直接忽略该设置，playbackRate 保持为之前的值。这是因为 HTML 规范本身对于负值的处理没有强制要求，且反向播放需要解码器支持反向解码，实现复杂度较高。

如果赋值为负数：

```javascript
audio.playbackRate = -1
console.log(audio.playbackRate) // 仍然是 1 或上一次的正值
```

规范中提到如果设置的值为负数，浏览器应该抛出 NotSupportedError，但实际行为因实现而异。

如果确实需要实现倒放效果，可以考虑以下替代方案：

「Web Audio API 方案」—— 将音频文件解码为 AudioBuffer，将 buffer.getChannelData() 返回的 Float32Array 进行 reverse()，然后用新的 AudioBuffer 播放：

```javascript
const buffer = await audioCtx.decodeAudioData(arrayBuffer)
const reversed = audioCtx.createBuffer(
  buffer.numberOfChannels,
  buffer.length,
  buffer.sampleRate,
)
for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
  const original = buffer.getChannelData(ch)
  const data = reversed.getChannelData(ch)
  for (let i = 0; i < original.length; i++) {
    data[i] = original[original.length - 1 - i]
  }
}
```

「playbackRate 的正常范围」一般在 0.0625 到 16.0 之间。超出范围浏览器会抛出异常。典型的使用场景：1.5x 或 2x 加速播放播客，0.75x 慢速播放教学音频。

---

## 9. 🤔 如何处理音频加载失败的情况并给出用户提示？

HTMLMediaElement 提供了 error 事件和 error 属性来捕获和诊断加载失败。

当音频加载或播放过程中发生错误时，浏览器会触发 error 事件。此时 audio.error 属性返回一个 MediaError 对象，其 code 属性表示错误类型：

MEDIA_ERR_ABORTED（code = 1）—— 用户中止了音频加载过程（如在加载过程中跳转页面或调用 load()）。

MEDIA_ERR_NETWORK（code = 2）—— 网络错误，音频文件下载过程中发生网络故障（如断网、服务器返回 404）。

MEDIA_ERR_DECODE（code = 3）—— 解码错误，音频文件已下载但解码失败（如文件损坏、编码格式不被支持）。

MEDIA_ERR_SRC_NOT_SUPPORTED（code = 4）—— 不支持的音频源，浏览器无法识别音频格式或 src 属性为空。

```javascript
const audio = document.querySelector('audio')

audio.addEventListener('error', () => {
  const error = audio.error
  let message = ''

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      message = '音频加载被中止'
      break
    case MediaError.MEDIA_ERR_NETWORK:
      message = '网络错误，无法下载音频'
      break
    case MediaError.MEDIA_ERR_DECODE:
      message = '音频文件损坏，无法解码'
      break
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      message = '不支持的音频格式'
      break
    default:
      message = '未知错误'
  }

  showError(message)
})

function showError(msg) {
  const el = document.getElementById('error-display')
  el.textContent = msg
  el.style.display = 'block'
}
```

除了 error 事件外，还应该处理以下几个防御性场景：

src 属性设置为空字符串或无效 URL 时，audio 元素不会触发 error 事件，但 play() 会返回一个被 reject 的 Promise。应在调用 play() 时用 catch 捕获：

```javascript
audio.play().catch((err) => {
  if (err.name === 'NotSupportedError') {
    showError('当前音频源不支持播放')
  }
})
```

提供 fallback 机制。可以在 error 事件中尝试加载备选格式的音频文件（如 mp3 失败后尝试 ogg）。但需要注意避免无限重试，应设置重试次数上限。

对于依赖网络的音频，监听 window 的 online/offline 事件，在网络恢复时自动重新加载：

```javascript
window.addEventListener('online', () => {
  if (audio.error) {
    audio.load()
  }
})
```

---

## 10. 🤔 不同浏览器对音频格式的支持有何差异，如何做兼容性处理？

浏览器对音频格式的支持差异是音频开发中最常见的兼容性问题。各浏览器支持的格式取决于其内置的解码器：

「MP3」（MPEG-1 Audio Layer III）—— 所有现代浏览器都支持，包括 Chrome、Firefox、Safari、Edge。MP3 是兼容性最好的格式，适合作为最低保障格式。

「AAC」（Advanced Audio Coding）—— 封装格式通常为 .m4a 或 .mp4。Chrome、Safari、Edge 支持良好，Firefox 在部分平台上可能需要操作系统级别的解码器支持。AAC 在 Apple 生态（Safari、iOS）中是最优选择。

「OGG Vorbis」—— Chrome、Firefox、Edge 支持，Safari 不支持。对于需要支持 Safari 的项目不能仅提供 OGG 格式。

「WAV」—— 大部分浏览器支持，但文件体积过大，不适合网络传输，通常仅用于短音效或 Web Audio API 的 decodeAudioData 输入。

「WebM (Opus)」—— Chrome 和 Firefox 支持，Safari 从 15+ 版本开始支持。Opus 编码器在低比特率下音质优秀，适合语音通话类应用。

「FLAC」—— Chrome 和 Safari 支持，Firefox 从 51 版本开始支持。适用于无损音频需求。

兼容性处理的最佳实践是使用 <source> 标签提供多个格式的候选源，浏览器会从上到下依次尝试，使用第一个它能解码的格式：

```html
<audio controls>
  <source src="audio.opus" type="audio/ogg; codecs=opus" />
  <source src="audio.aac" type="audio/mp4; codecs=mp4a.40.2" />
  <source src="audio.mp3" type="audio/mpeg" />
  <p>您的浏览器不支持音频播放</p>
</audio>
```

推荐的格式优先级策略：先提供压缩率高且音质好的格式（如 Opus），再提供兼容性最广的兜底格式（MP3）。如果需要同时兼顾 Safari 和其他浏览器，至少准备 AAC + MP3 两种格式。

运行时检测格式支持：

```javascript
const audio = document.createElement('audio');

const support = {
  mp3: audio.canPlayType('audio/mpeg') !== '',
  aac: audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '',
  ogg: audio.canPlayType('audio/ogg; codecs="vorbis"') !== '',
  opus: audio.canPlayType('audio/ogg; codecs="opus") !== '',
  wav: audio.canPlayType('audio/wav; codecs="1"') !== '',
  webm: audio.canPlayType('audio/webm; codecs="opus"') !== '',
};

console.log('浏览器音频格式支持情况：', support);
```

canPlayType() 返回三个值："" （空字符串，不支持）、"maybe"（可能支持，但无法确定能否完整播放）、"probably"（很可能支持，浏览器对格式和编码都有信心）。在实际判断中，只要不为空字符串就认为可能支持，优先选择返回 "probably" 的格式。
