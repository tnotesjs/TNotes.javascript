# [0152. AudioWorklet 自定义音频处理器](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0152.%20AudioWorklet%20%E8%87%AA%E5%AE%9A%E4%B9%89%E9%9F%B3%E9%A2%91%E5%A4%84%E7%90%86%E5%99%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 AudioWorklet 相比已废弃的 ScriptProcessorNode 在架构上有什么根本性优势？](#3--audioworklet-相比已废弃的-scriptprocessornode-在架构上有什么根本性优势)
- [4. 🤔 AudioWorkletProcessor 的 process() 方法接收的三个参数分别是什么？](#4--audioworkletprocessor-的-process-方法接收的三个参数分别是什么)
- [5. 🤔 process() 方法返回 false 会触发什么行为？](#5--process-方法返回-false-会触发什么行为)
- [6. 🤔 如何在 AudioWorkletProcessor 和主线程之间通过 port 传递自定义消息？](#6--如何在-audioworkletprocessor-和主线程之间通过-port-传递自定义消息)
- [7. 🤔 AudioWorklet 运行在哪个线程上，这对音频处理的实时性有什么意义？](#7--audioworklet-运行在哪个线程上这对音频处理的实时性有什么意义)
- [8. 🤔 如何在 AudioWorklet 中实现一个自定义的音量增益效果器？](#8--如何在-audioworklet-中实现一个自定义的音量增益效果器)
- [9. 🤔 AudioWorklet 不支持 DOM 访问，遇到需要获取 DOM 状态的场景应如何处理？](#9--audioworklet-不支持-dom-访问遇到需要获取-dom-状态的场景应如何处理)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- AudioWorklet 替代 ScriptProcessorNode 的背景
- AudioWorkletNode 主线程端
- AudioWorkletProcessor 工作线程端
- registerProcessor() 注册处理器
- process() 方法与音频块回调
- MessagePort 双向消息通信
- AudioWorkletNode.port.postMessage()
- AudioParam 在 AudioWorklet 中的使用
- SharedArrayBuffer 共享内存
- 实时音频处理性能与限制

## 2. 🫧 评价

- todo

## 3. 🤔 AudioWorklet 相比已废弃的 ScriptProcessorNode 在架构上有什么根本性优势？

ScriptProcessorNode 运行在主线程（Main Thread）上，AudioWorkletProcessor 运行在独立的音频渲染线程（Audio Worklet Thread）上。这一架构差异是两者根本性的区别。

ScriptProcessorNode 的问题：

`ScriptProcessorNode` 通过 `onaudioprocess` 回调在 JavaScript 主线程上处理音频数据。主线程同时负责 DOM 渲染、事件处理、网络请求、动画计算等所有 UI 相关工作。当主线程被一个复杂的 DOM 布局重计算或一个大型 JSON 解析阻塞时，`onaudioprocess` 回调无法及时执行，导致音频处理出现卡顿、爆音或间断。

这种架构存在一个无法调和的矛盾：音频处理要求极低延迟和精确的时间调度（通常每 2.9ms 处理一次 128 采样帧，采样率 44100Hz），而主线程的工作负载是不可预测的。一旦主线程有任何阻塞，音频处理就会受到影响。

```javascript
// ScriptProcessorNode 的旧写法（已废弃）
const processor = ctx.createScriptProcessor(4096, 1, 1)
processor.onaudioprocess = (e) => {
  // 这个回调在主线程上执行
  // 如果主线程正在执行一个耗时操作，这个回调会延迟
  const input = e.inputBuffer.getChannelData(0)
  const output = e.outputBuffer.getChannelData(0)
  for (let i = 0; i < input.length; i++) {
    output[i] = input[i] * 0.5
  }
}
```

AudioWorklet 的解决方案：

AudioWorklet 将音频处理逻辑移至专用的音频渲染线程。这个线程独立于主线程，拥有独立的事件循环，不会被 DOM 操作或 JavaScript 计算阻塞。音频处理回调可以以更稳定的节奏执行，延迟更低且抖动更小。

缓冲区大小方面，ScriptProcessorNode 的最小缓冲区为 256 采样（约 5.8ms），且必须是 2 的幂次方。AudioWorklet 固定使用 128 采样帧（约 2.9ms），这是浏览器音频引擎的标准处理单元，延迟更低。

多实例隔离方面，ScriptProcessorNode 的所有实例共享同一个主线程的 JavaScript 执行环境。AudioWorklet 中注册的处理器可以在音频渲染线程中被多个 `AudioWorkletNode` 实例复用，每个实例独立处理自己的音频数据。

内存管理方面，ScriptProcessorNode 每次回调都会创建新的 `AudioBuffer` 对象（inputBuffer 和 outputBuffer），产生频繁的内存分配和垃圾回收，GC 暂停期间可能导致音频卡顿。AudioWorklet 的 `process()` 方法中传入的缓冲区是固定的，重复使用，不会产生额外的内存分配。

```javascript
// AudioWorklet 的写法
// worklet-processor.js
class MyProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // 这个方法在音频渲染线程上执行
    // 不受主线程阻塞的影响
    const input = inputs[0][0]
    const output = outputs[0][0]
    if (input) {
      for (let i = 0; i < input.length; i++) {
        output[i] = input[i] * 0.5
      }
    }
    return true
  }
}
registerProcessor('my-processor', MyProcessor)
```

一个需要注意的权衡：AudioWorklet 虽然将处理逻辑移到了独立线程，但这个线程中不能访问 DOM、不能使用大部分 Web API（如 XMLHttpRequest、Canvas、localStorage 等）。音频处理线程的设计目标是尽可能纯粹和可预测，任何非确定性的操作（如网络请求、存储读写）都被排除在外。

---

## 4. 🤔 AudioWorkletProcessor 的 process() 方法接收的三个参数分别是什么？

`process(inputs, outputs, parameters)` 是 `AudioWorkletProcessor` 的核心方法，每处理一帧（128 采样）调用一次。

第一个参数 `inputs` —— 输入音频数据。类型为三维数组：`Float32Array[][][]`。结构为 `inputs[输入节点索引][通道索引][采样索引]`。

```
inputs[0]           → 第一个输入端口的所有通道
inputs[0][0]        → 第一个输入端口的第一个通道（通常为左声道）
inputs[0][0][0]     → 第一个采样点的值（-1.0 到 1.0 之间的浮点数）
inputs[0][0].length → 128（固定为一帧的采样数）
```

当没有上游节点连接到输入时，`inputs[0][0]` 为 `undefined`，需要在使用前检查：

```javascript
process(inputs, outputs) {
  const input = inputs[0][0]; // 可能为 undefined
  const output = outputs[0][0];

  if (input) {
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i];
    }
  }
  return true;
}
```

`inputs` 的长度取决于创建 `AudioWorkletNode` 时指定的输入端口数量。例如 `new AudioWorkletNode(ctx, 'processor', { numberOfInputs: 2 })` 会有 `inputs[0]` 和 `inputs[1]` 两个输入端口。

第二个参数 `outputs` —— 输出音频数据。类型与 `inputs` 相同：`Float32Array[][][]`。结构为 `outputs[输出节点索引][通道索引][采样索引]`。处理器需要将处理后的音频数据写入 `outputs` 数组。如果什么都不写入，输出默认为全零（静音）。

```javascript
process(inputs, outputs, parameters) {
  const input = inputs[0][0];
  const outputLeft = outputs[0][0];  // 输出的左声道
  const outputRight = outputs[0][1]; // 输出的右声道

  if (input) {
    for (let i = 0; i < 128; i++) {
      outputLeft[i] = input[i] * 0.5;
      outputRight[i] = input[i] * 0.5;
    }
  }
  return true;
}
```

创建 `AudioWorkletNode` 时可以通过 `numberOfInputs`、`numberOfOutputs`、`outputChannelCount` 配置端口和通道数。

第三个参数 `parameters` —— 自定义的 AudioParam 参数值。类型为对象，键为参数名，值为 `Float32Array`。如果在 `AudioWorkletProcessor` 的 `parameterDescriptors` 中声明了静态参数描述器，这里会包含每个参数当前帧的值。

```javascript
class MyProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'gain', defaultValue: 1, minValue: 0, maxValue: 1 }]
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0][0]
    const output = outputs[0][0]
    const gainValues = parameters.gain

    if (input && output) {
      for (let i = 0; i < input.length; i++) {
        // gainValues 可能是长度为 1 的数组（整帧使用同一个值）
        // 也可能是长度为 128 的数组（每个采样点一个值，AudioParam 自动化时）
        const gain = gainValues.length > 1 ? gainValues[i] : gainValues[0]
        output[i] = input[i] * gain
      }
    }
    return true
  }
}
registerProcessor('gain-processor', MyProcessor)
```

`parameters` 中每个参数的值数组长度有两种情况：长度为 1 表示整个帧内该参数值不变（a-rate 参数在该帧内为常量），长度为 128 表示每个采样点一个独立的值（k-rate 或正在执行自动化的 a-rate 参数）。处理代码应兼容这两种情况。

---

## 5. 🤔 process() 方法返回 false 会触发什么行为？

`process()` 方法的返回值控制处理器是否继续被调用。返回 `true` 表示继续处理，返回 `false` 表示处理器可以被回收，之后不再调用。

返回 `false` 后的行为：

浏览器会停止调用该处理器实例的 `process()` 方法。与该 `AudioWorkletNode` 相关的音频渲染资源会被释放。节点在音频图中的位置保留，但不再进行任何处理——相当于变成了一个直通信号的空节点（输入信号仍然传递，但不经过任何处理）。节点连接关系不变，不会自动 disconnect。

```javascript
class OneShotProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.triggered = false
  }

  process(inputs, outputs, parameters) {
    if (!this.triggered) {
      const input = inputs[0][0]
      const output = outputs[0][0]
      if (input) {
        for (let i = 0; i < input.length; i++) {
          output[i] = input[i] * 2 // 只处理一次，倍增信号
        }
      }
      this.triggered = true
      return true // 第一帧处理完后继续（需要一帧来确认触发）
    }

    return false // 第二帧开始停止处理
  }
}
```

返回 `false` 后如果需要重新启用处理器，目前没有直接的方法。只能重新创建一个新的 `AudioWorkletNode` 实例并重新连接到音频图。

为什么不使用 `false` 的典型场景：

大多数音频效果器和合成器都需要持续处理，因此 `process()` 通常始终返回 `true`。返回 `false` 的使用场景比较有限：

一次性音频事件——只需要处理一次的音频变换（如单次音高偏移或一次性滤波）。

资源优化——某些处理器只在特定条件下需要工作（如侧链压缩器只在信号超过阈值时需要处理）。但实际上持续返回 `true` 让浏览器决定何时调用更为合理。

需要注意的是，`process()` 默认应该返回 `true`。很多初学者编写的处理器没有显式返回值，在严格模式下隐式返回 `undefined`（falsy 值），导致处理器被意外回收，节点停止工作。这是一个常见的调试陷阱：

```javascript
// 错误：没有返回值，隐式返回 undefined（falsy），处理器会被回收
process(inputs, outputs) {
  const output = outputs[0][0];
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.sin(this.phase) * 0.5;
    this.phase += 0.1;
  }
  // 忘记 return true → 浏览器会在几帧后停止调用此方法
}

// 正确：显式返回 true
process(inputs, outputs) {
  const output = outputs[0][0];
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.sin(this.phase) * 0.5;
    this.phase += 0.1;
  }
  return true; // 保持处理器持续运行
}
```

---

## 6. 🤔 如何在 AudioWorkletProcessor 和主线程之间通过 port 传递自定义消息？

每个 `AudioWorkletNode` 和对应的 `AudioWorkletProcessor` 之间共享一个双向消息通道，通过 `port`（MessagePort）通信。

`AudioWorkletProcessor` 端使用 `this.port`：

```javascript
class MessageProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.gain = 1

    // 监听主线程发来的消息
    this.port.onmessage = (e) => {
      if (e.data.type === 'setGain') {
        this.gain = e.data.value
      }
      if (e.data.type === 'ping') {
        // 回复主线程
        this.port.postMessage({ type: 'pong', timestamp: currentTime })
      }
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0][0]
    const output = outputs[0][0]
    if (input && output) {
      for (let i = 0; i < input.length; i++) {
        output[i] = input[i] * this.gain
      }
    }
    return true
  }
}
registerProcessor('message-processor', MessageProcessor)
```

主线程端使用 `AudioWorkletNode` 的 `port`：

```javascript
const node = new AudioWorkletNode(ctx, 'message-processor')

// 向处理器发送消息
node.port.postMessage({ type: 'setGain', value: 0.5 })

// 监听处理器发来的消息
node.port.onmessage = (e) => {
  if (e.data.type === 'pong') {
    console.log('处理器响应时间：', e.data.timestamp)
  }
}
```

消息传递的特性：

消息传递是异步的。`postMessage` 调用后消息不会立即到达对端，而是被放入消息队列，在两个线程各自的空闲时间被处理。这意味着不能依赖消息传递来实现帧级别的实时控制——如果需要每帧精确控制参数，应使用 `AudioParam` 而非消息传递。

传递的数据遵循结构化克隆算法（Structured Clone）。可以传递大部分 JavaScript 对象，但不能传递函数、DOM 节点等。如果需要传递大量二进制数据（如音频采样），可以使用 `Transferable` 接口来避免复制开销：

```javascript
// 主线程发送 ArrayBuffer（使用 Transferable 避免复制）
const buffer = new Float32Array(44100)
node.port.postMessage(
  { type: 'loadSample', data: buffer.buffer },
  [buffer.buffer], // 转移所有权，buffer 在主线程中变为不可用
)

// 处理器端接收
this.port.onmessage = (e) => {
  if (e.data.type === 'loadSample') {
    this.sample = new Float32Array(e.data.data)
  }
}
```

典型的通信场景：

加载自定义波形数据到处理器中（如采样音频数据）。

从处理器向主线程发送分析结果（如检测到的音高、峰值音量）。

传递复杂的配置参数（对象、数组等不能通过 AudioParam 传递的数据）。

处理器的初始化——在 `AudioWorkletNode` 创建后、音频开始处理前发送初始配置：

```javascript
// 注册处理器后加载
await ctx.audioWorklet.addModule('processor.js')
const node = new AudioWorkletNode(ctx, 'message-processor')

// 发送初始化配置
node.port.postMessage({
  type: 'init',
  config: {
    sampleRate: ctx.sampleRate,
    bufferSize: 128,
  },
})
```

使用 `addEventListener` 代替 `onmessage` 可以注册多个监听器：

```javascript
node.port.addEventListener('message', handler1)
node.port.addEventListener('message', handler2)
node.port.start() // 使用 addEventListener 时必须调用 start()
```

---

## 7. 🤔 AudioWorklet 运行在哪个线程上，这对音频处理的实时性有什么意义？

AudioWorkletProcessor 运行在音频渲染线程（Audio Rendering Thread）上。这是一个由浏览器音频引擎创建和管理的专用线程，与 JavaScript 主线程完全独立。

线程模型对比：

主线程负责 UI 渲染、DOM 操作、事件处理、网络回调、JavaScript 执行等所有用户可感知的交互工作。工作线程（Web Worker）负责后台计算，不能访问 DOM，但可以使用大多数 Web API。音频渲染线程专门负责音频数据的处理和输出，不能访问 DOM，不能使用大部分 Web API，运行节奏由音频引擎以采样率（如 44100Hz）精确控制。

实时性的意义：

「实时」在音频领域有一个专门的含义：必须在截止时间（Deadline）之前完成处理，否则就会出现音频断裂。一帧 128 采样在 44100Hz 采样率下对应约 2.9ms。`process()` 方法必须在这 2.9ms 内完成执行，否则下一帧到来时当前帧还没处理完，就会出现音频间隙（glitch）。

音频渲染线程的调度优先级高于主线程。浏览器的操作系统级音频子系统（如 CoreAudio on macOS、AudioGraph on Windows）会以高优先级驱动音频线程。即使主线程正在执行一个耗时的 JavaScript 计算或 DOM 布局操作，音频线程仍然能以相对稳定的节奏被调度执行。

这意味着在 `process()` 中编写的代码必须严格保证执行时间：

不能执行任何可能阻塞的操作（如同步的大量计算、递归深度过大）。

不能调用任何可能导致线程等待的 API（如 `Atomics.wait()`）。

不能分配大量内存（避免触发 GC 停顿）。`process()` 中应避免创建新对象或数组，尽量复用已有的数据结构。

循环迭代次数应可控且有限。128 次迭代（一帧的采样数）加上外层循环的常数因子开销必须在 2.9ms 以内完成。

浏览器对 `process()` 的保护机制：

如果 `process()` 的执行时间持续超过截止时间，浏览器可能会发出警告（Chrome DevTools 的控制台会输出类似 `AudioWorkletProcessor process() took Xms which exceeds deadline` 的消息）。极端情况下，浏览器可能会丢弃当前帧的输出（输出静音）以避免影响后续帧。

性能测试建议：

在 `process()` 开始和结束时使用 `currentTime`（AudioWorklet 中的全局变量，与 AudioContext.currentTime 同步）来粗略估算处理耗时。更精确的测量可以用 `performance.now()`，但注意 `performance.now()` 的调用本身也有开销。

```javascript
process(inputs, outputs, parameters) {
  const start = performance.now();

  // ... 处理逻辑 ...

  const elapsed = performance.now() - start;
  if (elapsed > 2.5) {
    // 接近 2.9ms 截止时间，需要优化
    this.port.postMessage({ type: 'warning', processTime: elapsed });
  }

  return true;
}
```

SharedArrayBuffer 是音频线程与主线程之间实现零拷贝实时通信的方式。将一个 `SharedArrayBuffer` 同时映射到两个线程中，通过 `Atomics` API 进行同步读写。这比 `postMessage` 的异步消息传递更实时，但使用 `SharedArrayBuffer` 需要页面启用跨源隔离（Cross-Origin Isolation）安全策略。

---

## 8. 🤔 如何在 AudioWorklet 中实现一个自定义的音量增益效果器？

一个最基础的增益效果器只需要将输入信号的每个采样值乘以增益系数，写入输出即可。

首先编写处理器代码，保存为 `gain-processor.js` 文件：

```javascript
class GainProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'gain',
        defaultValue: 1,
        minValue: 0,
        maxValue: 10,
        automationRate: 'a-rate', // 每个采样点一个值
      },
    ]
  }

  constructor() {
    super()
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]

    // 检查是否有输入连接
    if (!input || input.length === 0) return true

    const inputChannel = input[0]
    const outputChannel = output[0]
    const gainValues = parameters.gain

    // gainValues 可能长度为 1（整帧同一个值）或 128（每个采样点不同值）
    for (let i = 0; i < inputChannel.length; i++) {
      const gain = gainValues.length > 1 ? gainValues[i] : gainValues[0]
      outputChannel[i] = inputChannel[i] * gain
    }

    // 处理多声道（如果有的话）
    for (let ch = 1; ch < input.length; ch++) {
      const inputCh = input[ch]
      const outputCh = output[ch]
      for (let i = 0; i < inputCh.length; i++) {
        const gain = gainValues.length > 1 ? gainValues[i] : gainValues[0]
        outputCh[i] = inputCh[i] * gain
      }
    }

    return true
  }
}

registerProcessor('gain-processor', GainProcessor)
```

然后在主线程中加载并使用：

```javascript
await ctx.audioWorklet.addModule('gain-processor.js')

const gainNode = new AudioWorkletNode(ctx, 'gain-processor', {
  numberOfInputs: 1,
  numberOfOutputs: 1,
  outputChannelCount: [2], // 立体声输出
})

// 通过 AudioParam 控制增益（实时自动化）
const gainParam = gainNode.parameters.get('gain')
gainParam.value = 0.5 // 设置为 50% 音量

// 也可以通过 AudioParam 做渐变
gainParam.setValueAtTime(0, ctx.currentTime)
gainParam.linearRampToValueAtTime(1, ctx.currentTime + 2)

// 连接到音频图
source.connect(gainNode)
gainNode.connect(ctx.destination)
```

进阶版本：添加平滑过渡防止突变噪声。当增益值突然改变时（如从 1 跳到 0），波形会出现不连续的跳变，产生可听的「咔嗒」声。在处理器内部做平滑处理可以避免这个问题：

```javascript
class SmoothGainProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'gain', defaultValue: 1, minValue: 0, maxValue: 10 }]
  }

  constructor() {
    super()
    this.smoothGain = 1
    this.smoothingFactor = 0.01 // 越小越平滑
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    if (!input || input.length === 0) return true

    const gainValues = parameters.gain

    for (let i = 0; i < input[0].length; i++) {
      const targetGain = gainValues.length > 1 ? gainValues[i] : gainValues[0]

      // 一阶指数平滑
      this.smoothGain += (targetGain - this.smoothGain) * this.smoothingFactor

      for (let ch = 0; ch < input.length; ch++) {
        output[ch][i] = input[ch][i] * this.smoothGain
      }
    }

    return true
  }
}

registerProcessor('smooth-gain-processor', SmoothGainProcessor)
```

`smoothingFactor` 越小，增益变化越平滑但响应越慢；越大则响应越快但可能出现可感知的阶梯。0.01 到 0.05 是常用的范围。

多声道处理的注意事项：上面的代码中每个声道使用相同的增益系数。如果需要独立控制左右声道的音量（如立体声平衡），可以声明两个 AudioParam：`gainLeft` 和 `gainRight`，分别应用于对应的声道。

---

## 9. 🤔 AudioWorklet 不支持 DOM 访问，遇到需要获取 DOM 状态的场景应如何处理？

AudioWorkletProcessor 运行在音频渲染线程中，这个线程没有 DOM 的概念，所有与 DOM 相关的 API（`document`、`window`、`Element`、`fetch`、`XMLHttpRequest`、`Canvas`、`localStorage` 等）都不可用。

核心解决方案是通过消息传递（`postMessage` / `onmessage`）在主线程和音频线程之间同步状态。

方案一：主线程推送 DOM 状态到处理器。

在主线程监听 DOM 事件，将相关状态通过 `port.postMessage` 发送给处理器：

```javascript
// 主线程
const slider = document.getElementById('volume')
const node = new AudioWorkletNode(ctx, 'my-processor')

slider.addEventListener('input', () => {
  node.port.postMessage({
    type: 'volume',
    value: parseFloat(slider.value),
  })
})

const playBtn = document.getElementById('play')
playBtn.addEventListener('click', () => {
  node.port.postMessage({ type: 'play' })
})
```

```javascript
// 处理器端
class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.volume = 1
    this.playing = false

    this.port.onmessage = (e) => {
      if (e.data.type === 'volume') {
        this.volume = e.data.value
      }
      if (e.data.type === 'play') {
        this.playing = true
      }
    }
  }

  process(inputs, outputs) {
    if (!this.playing) return true
    const output = outputs[0][0]
    for (let i = 0; i < output.length; i++) {
      output[i] = (Math.random() * 2 - 1) * this.volume
    }
    return true
  }
}
```

这种方式的局限性在于消息是异步的，从 DOM 事件发生到处理器收到消息之间有不确定的延迟（通常在几毫秒到几十毫秒之间）。对于音量控制、波形选择这类不需要毫秒级精确度的交互，这种延迟完全可以接受。

方案二：使用 SharedArrayBuffer 共享状态。

当需要主线程和音频线程之间以极低延迟共享数据时，可以使用 `SharedArrayBuffer`。它允许两个线程直接读写同一块内存，不需要通过消息传递。

```javascript
// 主线程
const sharedBuffer = new SharedArrayBuffer(4) // 4 字节存一个 Float32
const sharedValue = new Float32Array(sharedBuffer)
sharedValue[0] = 1.0

const node = new AudioWorkletNode(ctx, 'shared-processor', {
  processorOptions: { sharedBuffer },
})

// 直接修改共享内存，处理器下一帧就能读到
slider.addEventListener('input', () => {
  sharedValue[0] = parseFloat(slider.value)
})
```

```javascript
// 处理器端
class SharedProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    this.sharedValue = new Float32Array(options.processorOptions.sharedBuffer)
  }

  process(inputs, outputs) {
    const gain = this.sharedValue[0] // 实时读取主线程写入的值
    const output = outputs[0][0]
    const input = inputs[0][0]
    if (input && output) {
      for (let i = 0; i < input.length; i++) {
        output[i] = input[i] * gain
      }
    }
    return true
  }
}
```

使用 `SharedArrayBuffer` 需要页面启用跨源隔离安全策略。服务器需要设置以下 HTTP 响应头：

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

如果不满足这些安全头，`SharedArrayBuffer` 在浏览器中将不可用。

方案三：对于简单的参数控制，优先使用 AudioParam。

AudioParam 是 Web Audio API 专门为实时参数控制设计的接口，支持从主线程设置精确的自动化调度，数据在音频线程中以采样级别的精度执行。相比消息传递，AudioParam 没有异步延迟问题。

```javascript
// 声明 AudioParam
static get parameterDescriptors() {
  return [{ name: 'gain', defaultValue: 1 }];
}

// 主线程直接控制（实时、精确）
const param = node.parameters.get('gain');
param.value = 0.5;
param.linearRampToValueAtTime(1, ctx.currentTime + 2);
```

选择策略总结：

简单的数值参数（音量、频率、截止频率）→ 使用 AudioParam，精确且无延迟。

事件型消息（开始播放、切换模式、加载数据）→ 使用 postMessage，简单直观。

高频共享数据（实时波形数据、帧级状态同步）→ 使用 SharedArrayBuffer，零拷贝低延迟，但有安全策略要求。
