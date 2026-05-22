# [0146. 音频资源加载、解码与播放](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0146.%20%E9%9F%B3%E9%A2%91%E8%B5%84%E6%BA%90%E5%8A%A0%E8%BD%BD%E3%80%81%E8%A7%A3%E7%A0%81%E4%B8%8E%E6%92%AD%E6%94%BE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 AudioBufferSourceNode 是一次性的，播放结束后不能重新 start？](#3--为什么-audiobuffersourcenode-是一次性的播放结束后不能重新-start)
- [4. 🤔 如何使用 fetch + decodeAudioData 加载并播放一个音频文件？](#4--如何使用-fetch--decodeaudiodata-加载并播放一个音频文件)
- [5. 🤔 MediaElementAudioSourceNode 和 AudioBufferSourceNode 各适用于什么场景？](#5--mediaelementaudiosourcenode-和-audiobuffersourcenode-各适用于什么场景)
- [6. 🤔 decodeAudioData 解码失败的常见原因有哪些？](#6--decodeaudiodata-解码失败的常见原因有哪些)
- [7. 🤔 AudioBuffer 的 sampleRate 与 AudioContext 的 sampleRate 不一致会怎样？](#7--audiobuffer-的-samplerate-与-audiocontext-的-samplerate-不一致会怎样)
- [8. 🤔 如何实现音频资源的预加载和缓存以提升播放体验？](#8--如何实现音频资源的预加载和缓存以提升播放体验)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- decodeAudioData() 方法
- ArrayBuffer 与音频二进制数据
- AudioBuffer 数据结构
- AudioBufferSourceNode 一次性播放特性
- start() / stop() 方法与 offset 参数
- fetch API 加载音频文件
- MediaElementAudioSourceNode 桥接 HTMLMediaElement
- 多 AudioBuffer 管理与音频池模式
- 采样率匹配与重采样

## 2. 🫧 评价

- todo

## 3. 🤔 为什么 AudioBufferSourceNode 是一次性的，播放结束后不能重新 start？

这是 Web Audio API 的设计决策，背后有两个核心原因。

第一个原因是性能优化。AudioBufferSourceNode 在 `start()` 时会将音频数据一次性发送到底层音频渲染线程的缓冲区中，播放完成后这些缓冲区被释放。这种「用完即弃」的设计避免了节点长期占用内存，对于游戏中频繁触发的短音效（如爆炸声、枪声）尤为重要——每次触发创建新节点、播放、自动销毁，不会产生资源累积。

第二个原因是设计哲学。Web Audio API 借鉴了硬件音频设备的模型。在硬件世界中，一个音频播放通道触发一次播放是不可逆的，你不能「倒回去重新触发一个已经完成的播放」。AudioBufferSourceNode 模拟了这种一次性触发器的行为。

如果尝试在 `stop()` 之后再次调用 `start()`，会抛出 `InvalidStateError` 异常：

```javascript
const source = ctx.createBufferSource()
source.buffer = myBuffer
source.connect(ctx.destination)
source.start(0)

// 等待播放结束或手动停止后
source.stop()

// 再次 start 会报错：InvalidStateError: cannot call start on a stopped source
source.start(0) // ❌ 抛出异常
```

正确的做法是每次需要播放时创建一个新的 AudioBufferSourceNode：

```javascript
function playBuffer(buffer) {
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
  return source
}

// 多次播放同一个 AudioBuffer，每次都是新节点
playBuffer(myBuffer)
playBuffer(myBuffer)
```

值得注意的是，`AudioBuffer` 本身不是一次性的。同一个 AudioBuffer 可以被多个 AudioBufferSourceNode 复用。`AudioBuffer` 只是存储音频数据的容器，可以被反复引用。所以最佳实践是：解码一次得到 AudioBuffer，然后多次创建 SourceNode 来播放它。

可以监听 `ended` 事件来得知播放何时结束，以便清理引用：

```javascript
source.addEventListener('ended', () => {
  source.disconnect()
  // 从活跃节点池中移除
})
```

---

## 4. 🤔 如何使用 fetch + decodeAudioData 加载并播放一个音频文件？

`fetch` 负责从网络获取音频文件的二进制数据，`decodeAudioData` 负责将二进制数据解码为 AudioBuffer。两者配合构成了最常用的音频加载方式。

完整流程分为四步：发起请求、获取 ArrayBuffer、解码为 AudioBuffer、创建 SourceNode 播放。

```javascript
async function loadAndPlay(url) {
  // 第一步：fetch 获取音频文件
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`音频加载失败：${response.status}`)
  }

  // 第二步：读取为 ArrayBuffer
  const arrayBuffer = await response.arrayBuffer()

  // 第三步：解码为 AudioBuffer
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

  // 第四步：创建 SourceNode 并播放
  const source = ctx.createBufferSource()
  source.buffer = audioBuffer
  source.connect(ctx.destination)
  source.start(0)

  return source
}

// 使用
loadAndPlay('/audio/track.mp3')
```

几个关键细节：

`decodeAudioData` 返回一个 Promise，也可以使用回调风格（第三个和第四个参数分别传成功和失败回调），但 Promise 风格更现代且便于错误处理。

`decodeAudioData` 接收的必须是完整的 ArrayBuffer，不能是流式的。这意味着音频文件必须完全下载完成后才能开始解码，大文件会有明显的等待时间。

`decodeAudioData` 是异步操作，解码过程中不会阻塞主线程。解码工作在后台音频线程中完成。但解码有一定耗时，通常几百毫秒到几秒不等，取决于文件大小和采样率。

`arrayBuffer` 在传给 `decodeAudioData` 后会被「转移」（transfer），之后不能再使用该 ArrayBuffer。如果需要保留原始数据用于其他用途（如缓存），需要先复制：

```javascript
const arrayBuffer = await response.arrayBuffer()
const copy = arrayBuffer.slice(0) // 复制一份
const audioBuffer = await ctx.decodeAudioData(copy) // 用副本解码
```

更完整的实现通常包含加载进度显示和错误处理：

```javascript
async function loadAudioWithProgress(url, onProgress) {
  const response = await fetch(url)
  const contentLength = response.headers.get('content-length')
  const total = parseInt(contentLength, 10)

  const reader = response.body.getReader()
  const chunks = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (onProgress && total) {
      onProgress(received / total)
    }
  }

  const blob = new Blob(chunks)
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  return audioBuffer
}
```

---

## 5. 🤔 MediaElementAudioSourceNode 和 AudioBufferSourceNode 各适用于什么场景？

这两种节点虽然都能作为音频源接入 Web Audio API 的音频图，但底层机制和适用场景有明显差异。

`MediaElementAudioSourceNode` 桥接了 HTMLMediaElement（`<audio>` 或 `<video>` 元素）和 Web Audio API。它从已有的 DOM 媒体元素中提取音频流，接入音频图进行处理。

```javascript
const audio = document.querySelector('audio')
const source = ctx.createMediaElementSource(audio)
source.connect(analyser)
analyser.connect(ctx.destination)
```

特点：

- 音频文件由浏览器原生的媒体引擎负责加载和解码，支持流式播放和边下边播
- 可以使用 `<audio>` 元素的所有播放控制（播放、暂停、进度拖拽、播放速率等）
- 一个 `<audio>` 元素只能创建一个 MediaElementAudioSourceNode，重复创建会报错
- 支持较大的音频文件（如几小时的播客），因为不需要将整个文件加载到内存中
- 有浏览器原生的缓存和缓冲机制

`AudioBufferSourceNode` 需要预先将音频文件解码为 `AudioBuffer` 后才能播放。

特点：

- 整个音频文件在播放前必须完整解码到内存中
- 支持精确的偏移和时长控制（`start(when, offset, duration)`）
- 适合短音效的快速触发
- 每次播放需要创建新节点（一次性）

适用场景对比：

`MediaElementAudioSourceNode` 适用于：

- 长音频播放（音乐播放器、播客、电台）
- 需要浏览器原生 UI 控件（播放栏、进度条）的场景
- 需要流式播放的场景（边听边加载）
- 只需要对音频做简单处理（如可视化、音量调节）的场景

`AudioBufferSourceNode` 适用于：

- 游戏音效（爆炸声、脚步声等需要快速触发的短音效）
- 需要精确时间控制的场景（音序器、节拍器）
- 需要对音频数据做逐样本处理的场景（与 AudioWorklet 配合）
- 需要离线渲染（OfflineAudioContext）的场景
- 同一个音频需要以不同音高或速率多次播放的场景

实际项目中两者常配合使用：主播放器用 MediaElementAudioSourceNode，游戏音效用 AudioBufferSourceNode，共享同一个 AudioContext 的音频图。

---

## 6. 🤔 decodeAudioData 解码失败的常见原因有哪些？

`decodeAudioData` 失败时 Promise 会被 reject，或者在回调风格中调用错误回调。以下是常见的失败原因：

第一，音频格式不被支持。不同浏览器支持的编码格式不同。例如 Safari 不支持 OGG Vorbis，某些浏览器不支持 FLAC。传入一个当前浏览器无法解码的格式，`decodeAudioData` 会抛出 `EncodingError`。

第二，文件损坏或不完整。如果网络传输中断导致文件下载不完整，或者传入的数据本身不是合法的音频文件（如 HTML 页面的 404 错误页面内容被当作音频解码），解码会失败。这种情况在 fetch 时如果不检查 `response.ok` 就很容易发生。

```javascript
const response = await fetch(url)
// 必须检查状态码，否则 404 的 HTML 内容会被当作音频数据传给解码器
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`)
}
```

第三，AudioContext 已关闭。如果在调用 `decodeAudioData` 之前 AudioContext 已经 `close()`，解码会失败。解码工作依赖 AudioContext 的后台线程，上下文关闭后该线程已终止。

第四，传入的数据类型错误。`decodeAudioData` 要求参数必须是 `ArrayBuffer`。如果错误地传入了 `Blob`、`Uint8Array` 或字符串，会直接报错。

```javascript
// 错误：直接传 Blob
const blob = await response.blob()
ctx.decodeAudioData(blob) // ❌ 类型错误

// 正确：先转换为 ArrayBuffer
const arrayBuffer = await blob.arrayBuffer()
ctx.decodeAudioData(arrayBuffer) // ✅
```

第五，ArrayBuffer 被转移（neutered）。`ArrayBuffer` 被传入 `decodeAudioData` 后会被转移所有权，变为长度为 0 的 neutered 状态。如果同一个 `ArrayBuffer` 被传给两次 `decodeAudioData`，第二次会失败。解决方案是先 `.slice(0)` 复制。

第六，采样率极端不兼容。虽然大多数浏览器会处理采样率转换，但极端情况（如 8kHz 的低质量语音文件在某些实现中）可能导致解码失败。

第七，文件实际内容与扩展名不匹配。例如一个 `.mp3` 文件实际上是一个 AAC 编码的文件，某些浏览器的解码器可能会拒绝。

防御性写法：

```javascript
async function safeDecode(arrayBuffer, ctx) {
  try {
    return await ctx.decodeAudioData(arrayBuffer)
  } catch (err) {
    if (err.name === 'EncodingError') {
      console.error('音频格式不支持或文件损坏')
    } else if (err.name === 'InvalidStateError') {
      console.error('AudioContext 已关闭')
    } else {
      console.error('解码失败：', err.message)
    }
    return null
  }
}
```

---

## 7. 🤔 AudioBuffer 的 sampleRate 与 AudioContext 的 sampleRate 不一致会怎样？

当两者不一致时，浏览器会自动进行「重采样」（Resampling），将 AudioBuffer 的采样率转换为 AudioContext 的采样率后再进行处理。

例如 AudioBuffer 的采样率是 22050Hz，而 AudioContext 的采样率是 44100Hz。播放时浏览器会自动将 22050Hz 的数据上采样（Upsampling）到 44100Hz，插值算法由浏览器内部实现。

这种自动重采样带来两个影响：

第一，额外的 CPU 开销。重采样需要计算插值，对于频繁创建和播放 SourceNode 的场景（如游戏中同时触发大量音效），这些计算会累积成可观的 CPU 负担。

第二，潜在的音质损失。上采样（低采样率到高采样率）通常影响较小，因为需要插入的采样点可以通过插值计算得到。下采样（高采样率到低采样率）可能会引入混叠失真（Aliasing），因为需要丢弃高频信息。不过浏览器的重采样算法通常带有抗混叠滤波器，实际影响一般不大。

一个容易被忽视的细节是：`decodeAudioData` 返回的 AudioBuffer 的 `sampleRate` 与源文件的原始采样率一致，它不会在解码阶段就做重采样。重采样发生在 AudioBufferSourceNode 的音频数据被送入 AudioContext 处理管线的那一刻。

```javascript
const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
console.log('AudioBuffer 采样率：', audioBuffer.sampleRate)
console.log('AudioContext 采样率：', ctx.sampleRate)
// 两者可能不同，播放时浏览器会自动适配
```

如何避免重采样的开销和音质损失：

在创建 AudioContext 时显式指定与 AudioBuffer 一致的采样率：

```javascript
const ctx = new AudioContext({ sampleRate: 48000 })
```

如果无法控制 AudioContext 的采样率（比如多个来源的音频采样率各不相同），可以使用 OfflineAudioContext 将不同采样率的 AudioBuffer 统一转换为目标采样率：

```javascript
async function resampleBuffer(buffer, targetSampleRate) {
  if (buffer.sampleRate === targetSampleRate) return buffer

  const offCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    Math.ceil((buffer.length * targetSampleRate) / buffer.sampleRate),
    targetSampleRate,
  )

  const source = offCtx.createBufferSource()
  source.buffer = buffer
  source.connect(offCtx.destination)
  source.start(0)

  return await offCtx.startRendering()
}
```

这种方法在加载阶段就完成重采样并缓存结果，避免每次播放时重复重采样。

---

## 8. 🤔 如何实现音频资源的预加载和缓存以提升播放体验？

音频资源的预加载和缓存策略直接影响用户的播放体验。未经优化的实现会在用户点击播放后才开始下载和解码音频，导致明显的等待延迟。

第一层优化：使用 `fetch` 预加载并缓存 ArrayBuffer。

```javascript
const audioCache = new Map()

async function preloadAudio(url) {
  if (audioCache.has(url)) return audioCache.get(url)

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  audioCache.set(url, arrayBuffer)
  return arrayBuffer
}
```

`ArrayBuffer` 相比 `AudioBuffer` 更节省内存，因为它存储的是压缩后的二进制数据（MP3/AAC 等），而 `AudioBuffer` 存储的是解码后的 PCM 原始数据，体积通常是前者的数倍到数十倍。在预加载阶段只缓存 `ArrayBuffer`，在需要播放时再解码为 `AudioBuffer`。

第二层优化：缓存解码后的 AudioBuffer。

对于高频使用的短音效（如游戏中的射击声、爆炸声），解码延迟也是不可接受的。可以将 `AudioBuffer` 也缓存起来，避免重复解码。

```javascript
const bufferCache = new Map()

async function getAudioBuffer(url, ctx) {
  const cacheKey = `${url}_${ctx.sampleRate}`
  if (bufferCache.has(cacheKey)) return bufferCache.get(cacheKey)

  const arrayBuffer = await preloadAudio(url)
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
  bufferCache.set(cacheKey, audioBuffer)
  return audioBuffer
}
```

注意 `cacheKey` 中包含了 `ctx.sampleRate`。如果应用中有多个不同采样率的 AudioContext，同一个音频文件在不同采样率下解码得到的 AudioBuffer 是不同的，需要分别缓存。

第三层优化：批量预加载与加载队列。

页面加载时批量预加载常用的音频资源，但需要控制并发数量，避免同时发起过多请求阻塞网络：

```javascript
async function preloadAll(urls, maxConcurrent = 4) {
  const queue = [...urls]
  const results = new Map()

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()
      try {
        const buffer = await preloadAudio(url)
        results.set(url, buffer)
      } catch (err) {
        console.error(`预加载失败：${url}`, err)
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(maxConcurrent, urls.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}
```

第四层优化：使用 Cache API 实现持久化缓存。

上述内存缓存在页面刷新后会丢失。对于 PWA 或需要离线播放的场景，可以使用浏览器的 Cache API 将音频文件持久化存储：

```javascript
async function loadWithCacheAPI(url) {
  const cache = await caches.open('audio-cache')
  let response = await cache.match(url)

  if (!response) {
    response = await fetch(url)
    await cache.put(url, response.clone())
  }

  return await response.arrayBuffer()
}
```

Cache API 存储的是 HTTP Response 对象，数据持久化在浏览器的存储中，刷新或关闭页面后仍然存在。配合 Service Worker 可以实现完全离线的音频播放。

第五层优化：LRU 缓存淘汰策略。

当缓存的 AudioBuffer 数量过多时，需要淘汰最久未使用的条目以控制内存占用：

```javascript
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return undefined
    const value = this.cache.get(key)
    // 访问后移到最新位置
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 淘汰最久未使用的（Map 的第一个条目）
      const oldest = this.cache.keys().next().value
      this.cache.delete(oldest)
    }
    this.cache.set(key, value)
  }
}
```

在内存敏感的移动端场景中，建议 AudioBuffer 缓存上限设为 10 到 20 个短音效，长音频文件只缓存 ArrayBuffer 而不缓存 AudioBuffer。
