# [0145. AudioContext 与音频节点图模型](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0145.%20AudioContext%20%E4%B8%8E%E9%9F%B3%E9%A2%91%E8%8A%82%E7%82%B9%E5%9B%BE%E6%A8%A1%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AudioContext 为什么必须在用户交互事件中创建或恢复？](#3--audiocontext-为什么必须在用户交互事件中创建或恢复)
- [4. 🤔 connect() 方法的调用顺序对音频处理有影响吗？](#4--connect-方法的调用顺序对音频处理有影响吗)
- [5. 🤔 AudioContext 的状态有哪些，如何从 suspended 切换到 running？](#5--audiocontext-的状态有哪些如何从-suspended-切换到-running)
- [6. 🤔 OfflineAudioContext 和普通 AudioContext 有什么区别，适用于什么场景？](#6--offlineaudiocontext-和普通-audiocontext-有什么区别适用于什么场景)
- [7. 🤔 音频图中一个节点可以同时连接多个下游节点吗？](#7--音频图中一个节点可以同时连接多个下游节点吗)
- [8. 🤔 如何正确销毁一个 AudioContext 以释放系统资源？](#8--如何正确销毁一个-audiocontext-以释放系统资源)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AudioContext 创建与生命周期
- suspended、running、closed 状态
- resume() / suspend() / close() 状态切换
- AudioNode 接口与节点类型分类
- 音频图（Audio Graph）概念
- connect() 与 disconnect() 节点连接
- 输入节点、输出节点与处理节点
- OfflineAudioContext 离线渲染
- 浏览器自动播放策略与用户手势要求
- currentTime 只读时钟与 sampleRate

## 2. 🫧 评价

- todo

## 3. 🤔 AudioContext 为什么必须在用户交互事件中创建或恢复？

这是由浏览器的自动播放策略决定的。Chrome 从 2018 年起率先实施了严格的自动播放限制，随后其他浏览器纷纷跟进。

背景原因：很多网站会在页面加载时自动播放音频广告或背景音乐，严重干扰用户体验。为了遏制这种行为，浏览器规定：在没有发生用户交互（点击、触摸、键盘按下等）之前，AudioContext 会处于 `suspended` 状态，此时所有音频处理节点都不会输出任何声音。

具体行为：

如果在页面加载时直接创建 AudioContext 并尝试播放音频，不会报错，但不会发出任何声音。控制台会看到一条警告信息：`The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.`

音频节点的调度会正常进行，内部时钟也会运行，但音频输出会被静音，直到 AudioContext 被 resume。

合规的处理方式：

方式一：在用户交互事件中创建 AudioContext。

```javascript
document.getElementById('playBtn').addEventListener('click', () => {
  const ctx = new AudioContext()
  // 在此处开始音频操作
})
```

方式二：页面加载时创建 AudioContext（处于 suspended 状态），在用户交互时调用 `resume()`。

```javascript
const ctx = new AudioContext() // 状态为 suspended

document.getElementById('playBtn').addEventListener('click', async () => {
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
  // 开始播放音频
})
```

方式二更推荐，因为 AudioContext 的创建有一定开销（需要初始化音频处理线程、分配缓冲区），提前创建可以在用户点击时更快响应。

需要注意的是，`user gesture` 的定义比严格。`click` 和 `touchstart` 事件被所有浏览器认可。`keydown` 事件在大多数浏览器中也被认可。但 `scroll`、`mousemove`、`mouseenter` 等事件不被视为用户手势，无法用来激活 AudioContext。某些移动端浏览器（如 iOS Safari）要求手势事件必须是同步触发的，异步回调中的手势不被认可。

一个常见的陷阱：在 `setTimeout` 或 `Promise.then` 中调用 `resume()`，即使这些异步操作最初由用户点击触发，也可能被部分浏览器拦截。所以 `resume()` 应该直接在事件处理函数的同步部分调用。

---

## 4. 🤔 connect() 方法的调用顺序对音频处理有影响吗？

`connect()` 方法定义的是音频数据的流动方向，调用顺序本身不会影响音频处理结果，但会影响节点之间的拓扑关系。

从数据流的角度理解：音频数据从源节点（Source）开始，沿着 `connect()` 建立的路径向下游流动，最终到达目标节点（Destination）。音频图是一个有向图，数据流动的路径完全由 `connect()` 的调用决定。

连接顺序不会改变音频处理逻辑的情况：

```javascript
// 这两种写法最终的音频图拓扑完全一致
source.connect(filter).connect(gain).connect(ctx.destination)
// 等价于
gain.connect(ctx.destination)
filter.connect(gain)
source.connect(filter)
```

因为无论是先连接下游还是先连接上游，只要拓扑关系一致，音频数据的流动路径就是相同的。节点之间通过内部端口（input/output）相连，连接建立后音频数据就会沿路径流动。

但 connect 的调用顺序确实会影响以下场景：

「动态修改音频图」—— 如果在音频播放过程中修改连接关系，调用顺序决定了中间状态的音频图结构。例如先 disconnect 一个节点再 connect 到新位置，中间可能产生瞬间的音频断裂。

「分支连接」—— 一个节点同时连接到多个下游节点时，连接的先后顺序决定了下游节点的索引顺序，这在使用 ChannelSplitterNode 等按索引访问输出的场景中有影响。

```javascript
// source 同时连接到两个处理链
source.connect(filterA) // 路径 A
source.connect(filterB) // 路径 B
filterA.connect(ctx.destination)
filterB.connect(ctx.destination)
// 最终效果：A 和 B 的输出混合到 destination
```

总结：对于静态的音频图，connect 的调用顺序无关紧要。对于运行时动态修改的音频图，需要注意连接操作的时序以避免音频断裂。

---

## 5. 🤔 AudioContext 的状态有哪些，如何从 suspended 切换到 running？

AudioContext 有三种状态，通过 `state` 属性读取当前值：

`suspended` —— 音频上下文被暂停。此时内部时钟停止，所有节点不处理音频数据。可能的原因有三种：尚未被用户交互激活、调用了 `suspend()` 方法、操作系统层面暂停了音频（如移动端浏览器进入后台）。

`running` —— 音频上下文正常运行。内部时钟在走，节点正常处理音频数据，声音正常输出。这是播放音频所需的状态。

`closed` —— 音频上下文已关闭。释放了底层的音频处理资源，无法再恢复到其他状态，也无法再创建新的音频节点。这是一个不可逆的终态。

状态切换的方法：

从 `suspended` 切换到 `running`：调用 `resume()` 方法，返回一个 Promise，在状态成功切换到 running 后 resolve。

```javascript
async function ensureRunning(ctx) {
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}
```

从 `running` 切换到 `suspended`：调用 `suspend()` 方法，返回一个 Promise。暂停后所有音频停止输出，但音频图的结构保留，resume 后可以继续播放。

```javascript
async function pauseAudio(ctx) {
  if (ctx.state === 'running') {
    await ctx.suspend()
  }
}
```

切换到 `closed`：调用 `close()` 方法，返回一个 Promise。关闭后不可恢复。

```javascript
async function destroyContext(ctx) {
  if (ctx.state !== 'closed') {
    await ctx.close()
  }
}
```

状态变化事件：可以监听 `statechange` 事件来响应状态变化，而不是反复轮询 `ctx.state`：

```javascript
ctx.addEventListener('statechange', () => {
  console.log('AudioContext 状态变为：', ctx.state)
})
```

iOS Safari 的特殊行为：当用户切换到其他应用或锁屏时，iOS Safari 会自动将 AudioContext 设为 `suspended`。返回页面后需要在用户交互事件中重新调用 `resume()`。这意味着在移动端单页应用中，需要在页面可见性变化时检测并恢复 AudioContext 状态：

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && ctx.state === 'suspended') {
    ctx.resume()
  }
})
```

---

## 6. 🤔 OfflineAudioContext 和普通 AudioContext 有什么区别，适用于什么场景？

两者的核心区别在于：AudioContext 连接到硬件设备实时输出音频，而 OfflineAudioContext 在后台以最快速度（比实时更快）渲染音频，不输出到扬声器。

AudioContext 是实时音频引擎。音频处理按照真实时间推进，`currentTime` 随时间增长。音频数据经过处理后输出到 `destination`（扬声器）。适用于所有需要实时播放音频的场景。

OfflineAudioContext 是离线渲染引擎。创建时需要指定三个参数：通道数、采样帧数和采样率。调用 `startRendering()` 后，浏览器会以尽可能快的速度处理完所有音频数据，完成后返回一个 `AudioBuffer`。

```javascript
const offlineCtx = new OfflineAudioContext(
  2, // 通道数（2 = 立体声）
  44100 * 5, // 总帧数（44100Hz 采样率下 5 秒的帧数）
  44100, // 采样率
)

// 构建音频图（和普通 AudioContext 完全一样）
const osc = offlineCtx.createOscillator()
osc.frequency.value = 440
osc.connect(offlineCtx.destination)
osc.start(0)
osc.stop(5)

// 离线渲染
const renderedBuffer = await offlineCtx.startRendering()
// renderedBuffer 是一个 AudioBuffer，包含渲染完成的音频数据
```

OfflineAudioContext 的 `currentTime` 不是真实时间，而是从 0 开始递增到指定的总时长。渲染过程中没有实时约束，浏览器可以全速处理，因此 5 秒的音频可能在几十毫秒内就渲染完成。

OfflineAudioContext 的典型使用场景：

「音频预处理」—— 需要对一段音频应用一系列效果（如混响、均衡）后保存为新的 AudioBuffer。在 OfflineAudioContext 中渲染完成后，得到处理后的 AudioBuffer，可以用于后续的实时播放或导出为文件。

「合成音色」—— 用多个振荡器和效果器合成一个复杂的音色，渲染后存储为 AudioBuffer。之后用 AudioBufferSourceNode 播放，比每次都重建复杂的音频图效率更高。

「音频拼接与混合」—— 将多段音频拼接或混合为一段，例如将背景音乐和音效混合为一个文件。

「生成 impulse response」—— 为 ConvolverNode 生成自定义的脉冲响应数据，用于创建混响效果。

```javascript
// 生成混响的 impulse response
function createReverbIR(duration, decay) {
  const sampleRate = 44100
  const length = sampleRate * duration
  const offCtx = new OfflineAudioContext(2, length, sampleRate)

  const buffer = offCtx.createBuffer(2, length, sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return buffer
}
```

---

## 7. 🤔 音频图中一个节点可以同时连接多个下游节点吗？

可以。一个节点的输出可以同时 `connect()` 到多个下游节点的输入，音频数据会被复制到每条连接路径上。这类似于音频信号的分路器，一份音频数据同时送往多个处理分支。

```javascript
const source = ctx.createOscillator()

// source 同时连接到三个节点
source.connect(filter) // 路径 A：经过滤波器
source.connect(analyser) // 路径 B：送往分析器做可视化
source.connect(ctx.destination) // 路径 C：直接输出

filter.connect(ctx.destination)
```

在这个例子中，source 的音频数据同时流经三条路径：一条经过滤波器处理后再输出，一条用于可视化分析，一条直接输出。三条路径的音频会在 destination 处混合叠加。

关键特性：

音频数据是「复制」而非「移动」。连接多个下游节点不会影响原始信号的质量或音量。每个下游节点接收到的都是完整的原始信号副本。

一个节点也可以从多个上游节点接收输入。多个上游节点的输出连接到同一个下游节点时，信号会在该节点的输入端混合叠加：

```javascript
osc1.connect(gainNode)
osc2.connect(gainNode)
osc3.connect(gainNode)
// gainNode 接收到的是三个振荡器的混合信号
```

这种多对一的连接在实现混音器时非常常见。

需要注意的潜在问题：

回路（Feedback Loop）—— 如果节点的输出通过一系列连接最终又回到了自身的输入，会形成音频回路，可能导致无限反馈和刺耳的啸叫。浏览器通常不会阻止这种情况，开发者需要自行避免。

信号叠加导致削波（Clipping）—— 当多个信号叠加后总幅度超过 1.0（或 -1.0），会产生数字削波失真。解决方法是在汇聚节点前插入 GainNode 进行衰减：

```javascript
osc1.connect(preGain)
osc2.connect(preGain)
preGain.gain.value = 0.3 // 衰减防止削波
preGain.connect(ctx.destination)
```

disconnect 的精确控制 —— 当一个节点连接了多个下游时，调用 `disconnect()`（无参数）会断开所有连接。如果只想断开其中一条，需要传入具体的节点参数：`node.disconnect(specificTarget)`。

---

## 8. 🤔 如何正确销毁一个 AudioContext 以释放系统资源？

AudioContext 会占用系统级的音频处理资源（底层音频线程、硬件音频缓冲区等），如果不正确销毁，这些资源不会被 JavaScript 的垃圾回收机制自动释放。

调用 `close()` 方法是销毁 AudioContext 的标准方式：

```javascript
async function destroyAudioContext(ctx) {
  if (ctx.state !== 'closed') {
    await ctx.close()
  }
}
```

`close()` 返回一个 Promise，在资源释放完成后 resolve。调用后 AudioContext 的状态变为 `closed`，此后无法再创建新的音频节点、无法 resume、无法重新打开。如果还需要使用音频功能，必须创建一个全新的 AudioContext 实例。

`close()` 调用后的行为：

- `state` 变为 `closed`
- `currentTime` 停止递增
- 已连接的音频节点全部停止处理
- 底层音频线程被终止，硬件资源被释放
- 已经 `start()` 的 `AudioBufferSourceNode` 和 `OscillatorNode` 会停止发声

仅依赖垃圾回收的误区：

如果 AudioContext 没有被 `close()` 且仍然被 JavaScript 引用（即使没有任何音频节点连接），它会一直持有系统资源。JavaScript 垃圾回收器回收的是 JavaScript 对象，但底层的音频线程和硬件缓冲区不归 JavaScript GC 管理，必须通过 `close()` 显式释放。

Chrome 对同时存在的 AudioContext 数量有硬性限制（通常为 6 个）。超出限制后创建新的 AudioContext 会抛出警告，且新创建的上下文可能无法正常工作。如果应用中需要频繁创建和销毁 AudioContext（虽然不推荐这种模式），务必在不需要时及时 `close()`。

完整的清理流程：

在单页应用（SPA）中，路由切换时需要销毁上一个页面的音频资源：

```javascript
class AudioService {
  constructor() {
    this.ctx = null
    this.nodes = []
  }

  init() {
    this.ctx = new AudioContext()
  }

  addNode(node) {
    this.nodes.push(node)
    return node
  }

  async dispose() {
    // 先断开所有节点
    this.nodes.forEach((node) => {
      try {
        node.disconnect()
      } catch (e) {}
    })
    this.nodes = []

    // 再关闭 AudioContext
    if (this.ctx && this.ctx.state !== 'closed') {
      await this.ctx.close()
    }
    this.ctx = null
  }
}
```

注意 `disconnect()` 的调用应在 `close()` 之前。虽然 `close()` 会隐式断开所有连接，但显式 `disconnect()` 可以清除节点之间的引用关系，有助于 JavaScript GC 回收这些节点对象。如果在组件中使用了事件监听器（如 `analyser` 的数据轮询），也需要在 `dispose()` 中清除对应的 `requestAnimationFrame` 循环和事件监听器，避免闭包持有节点引用导致内存泄漏。
