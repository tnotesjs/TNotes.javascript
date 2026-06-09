# [0338. 专用工作者线程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0338.%20%E4%B8%93%E7%94%A8%E5%B7%A5%E4%BD%9C%E8%80%85%E7%BA%BF%E7%A8%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 专用工作者线程是什么？](#3-专用工作者线程是什么)
- [4. 如何创建专用工作者线程？](#4-如何创建专用工作者线程)
- [5. 专用工作者线程有什么安全限制？](#5-专用工作者线程有什么安全限制)
- [6. `Worker` 对象能做什么？](#6-worker-对象能做什么)
- [7. `DedicatedWorkerGlobalScope` 提供了什么？](#7-dedicatedworkerglobalscope-提供了什么)
- [8. 专用工作者线程的生命周期是什么？](#8-专用工作者线程的生命周期是什么)
- [9. 可以不用独立文件创建 Worker 吗？](#9-可以不用独立文件创建-worker-吗)
- [10. `importScripts()` 和子工作者线程怎么用？](#10-importscripts-和子工作者线程怎么用)
- [11. 如何处理工作者线程错误？](#11-如何处理工作者线程错误)
- [12. 如何和专用工作者线程通信？](#12-如何和专用工作者线程通信)
- [13. Worker 间传输数据有哪些方式？](#13-worker-间传输数据有哪些方式)
- [14. 什么时候需要线程池？](#14-什么时候需要线程池)

<!-- endregion:toc -->

## 1. 本节内容

- 专用工作者线程的基本概念
- `Worker` 构造函数和安全限制
- `Worker` 对象与 `DedicatedWorkerGlobalScope`
- 生命周期和终止方式
- 行内 Worker、`importScripts()`、子工作者线程
- 错误处理和通信方式
- 数据传输、共享内存和线程池

## 2. 评价

- 专用工作者线程最适合承接单个页面的重活；真正难的不是创建它，而是设计清楚消息协议、数据传输方式和生命周期。

## 3. 专用工作者线程是什么？

专用工作者线程是最常见的 Web Worker。它由某个页面或工作者线程创建，只能被创建它的上下文使用。

它适合处理不应该放在页面主线程里的任务，例如：

- 大量计算。
- 批量数据处理。
- 图片或二进制数据处理。
- 文件读取和转换。
- 不需要直接操作 DOM 的后台任务。

```js
// main.js
const worker = new Worker('./worker.js')

worker.postMessage(10)
worker.onmessage = (event) => {
  console.log(event.data)
}
```

```js
// worker.js
self.onmessage = (event) => {
  self.postMessage(event.data * 2)
}
```

主线程通过 `Worker` 对象和工作者线程通信；工作者线程内部通过 `self` 访问自己的全局环境。

## 4. 如何创建专用工作者线程？

最常见的创建方式是把脚本路径传给 `Worker` 构造函数。

```js
const worker = new Worker('./worker.js')
```

`Worker()` 会在后台异步加载脚本并创建独立环境。构造函数会立即返回 `Worker` 对象，但此时工作者线程脚本可能还没加载完成。

创建 Worker 时要注意几个点：

- 脚本路径可以是相对路径，也可以是绝对 URL。
- 工作者线程脚本通常必须与父页面同源。
- Worker 在后台加载，不会阻塞主线程继续执行。
- 主线程不能直接访问 Worker 内部变量，只能通过消息通信。

工作者线程也支持第二个配置参数。

```js
const worker = new Worker('./worker.js', {
  name: 'image-processor',
  type: 'module',
  credentials: 'same-origin',
})
```

常见选项包括：

| 选项          | 说明                                            |
| ------------- | ----------------------------------------------- |
| `name`        | 可在工作者线程内部通过 `self.name` 读取的名称。 |
| `type`        | `classic` 表示经典脚本，`module` 表示模块脚本。 |
| `credentials` | 模块 Worker 获取脚本时的凭证策略。              |

## 5. 专用工作者线程有什么安全限制？

Worker 脚本默认要受同源限制。页面不能直接通过 `new Worker()` 加载其他源的脚本。

```js
new Worker('./worker.js') // 通常允许
new Worker('https://example.org/worker.js') // 通常不允许
```

这个限制很重要，因为工作者线程和页面之间没有 `targetOrigin` 这样的消息过滤参数。浏览器通过限制 Worker 脚本来源，降低了跨源脚本进入后台执行环境的风险。

需要注意，经典 Worker 内部可以使用 `importScripts()` 加载脚本，脚本请求仍然受到 CORS 等规则影响。模块 Worker 则应该使用标准模块的 `import`。

## 6. `Worker` 对象能做什么？

`Worker()` 返回的 `Worker` 对象是主线程和专用工作者线程之间的连接点。

常见事件处理程序：

| 事件           | 说明                               |
| -------------- | ---------------------------------- |
| `message`      | 工作者线程向主线程发送消息时触发。 |
| `messageerror` | 收到无法反序列化的消息时触发。     |
| `error`        | 工作者线程内部抛出错误时触发。     |

常见方法：

| 方法            | 说明                       |
| --------------- | -------------------------- |
| `postMessage()` | 向工作者线程发送异步消息。 |
| `terminate()`   | 从外部立即终止工作者线程。 |

```js
const worker = new Worker('./worker.js')

worker.onmessage = (event) => {
  console.log('from worker:', event.data)
}

worker.onerror = (event) => {
  console.error(event.message)
}

worker.postMessage({ type: 'start' })
```

在终止 Worker 之前，要保留好 `Worker` 对象引用。没有引用之后，代码无法再恢复对同一个 Worker 的控制。

## 7. `DedicatedWorkerGlobalScope` 提供了什么？

专用工作者线程内部的全局对象是 `DedicatedWorkerGlobalScope`。它继承自 `WorkerGlobalScope`，可以通过 `self` 访问。

```js
// worker.js
console.log(self.name)

self.postMessage('ready')

self.onmessage = (event) => {
  console.log(event.data)
}
```

`DedicatedWorkerGlobalScope` 常见能力包括：

| 成员              | 说明                           |
| ----------------- | ------------------------------ |
| `name`            | Worker 创建时传入的名称。      |
| `postMessage()`   | 向父上下文发送消息。           |
| `close()`         | 从内部终止当前工作者线程。     |
| `importScripts()` | 在经典 Worker 中同步导入脚本。 |

专用工作者线程和主线程之间的通信本质上可以理解为隐式使用了 `MessagePort`。所以两侧都有 `postMessage()`、`message`、`messageerror` 等接口，只是你通常不需要直接创建端口。

## 8. 专用工作者线程的生命周期是什么？

专用工作者线程通常可以粗略分为三个阶段。

| 阶段   | 说明                                                       |
| ------ | ---------------------------------------------------------- |
| 初始化 | 调用 `new Worker()` 后，浏览器开始请求脚本并准备环境。     |
| 活动   | 脚本加载完成，可以处理消息和执行任务。                     |
| 终止   | 通过 `self.close()`、`worker.terminate()` 或页面销毁结束。 |

主线程拿到 `Worker` 对象时，线程可能还在初始化。但你可以提前发送消息，这些消息会排队，等 Worker 活动后再处理。

```js
const worker = new Worker('./worker.js')

worker.postMessage('first')
worker.postMessage('second')
```

终止方式有两种：

- `self.close()`：工作者线程内部主动关闭自己。
- `worker.terminate()`：主线程从外部终止它。

`close()` 和 `terminate()` 都是幂等操作，重复调用通常不会产生额外问题。但它们会让线程停止处理后续任务，因此应该在任务完成、页面卸载或不再需要后台能力时调用。

## 9. 可以不用独立文件创建 Worker 吗？

可以。可以通过 `Blob` 和对象 URL 创建行内 Worker。

```js
const source = `
  self.onmessage = (event) => {
    self.postMessage(event.data * 2)
  }
`

const blob = new Blob([source], { type: 'text/javascript' })
const worker = new Worker(URL.createObjectURL(blob))

worker.onmessage = (event) => console.log(event.data)
worker.postMessage(21)
```

这种方式省掉了额外脚本请求，但也有缺点：代码不容易调试、缓存和复用，构建工具处理起来也更麻烦。它适合小型临时脚本，不适合大型 Worker 逻辑。

还有一种做法是把函数序列化成字符串再放进 Worker。要特别注意，序列化后的函数不能依赖闭包变量，也不能依赖 `window`，因为它会在另一个全局环境中执行。

## 10. `importScripts()` 和子工作者线程怎么用？

经典 Worker 可以用 `importScripts()` 动态加载脚本。

```js
// worker.js
importScripts('./math.js', './format.js')

self.postMessage('scripts loaded')
```

`importScripts()` 会同步执行导入脚本。多个脚本的下载顺序不保证，但执行顺序会按参数顺序进行。被导入脚本共享同一个 Worker 全局作用域。

Worker 里也可以创建子 Worker。

```js
// worker.js
const subWorker = new Worker('./subworker.js')
```

子 Worker 的脚本路径相对于父 Worker 脚本解析，而不是相对于页面解析。顶级 Worker 和子 Worker 的脚本通常都必须与主页面同源。

## 11. 如何处理工作者线程错误？

Worker 内部抛出的错误不会被主线程包裹 `new Worker()` 的 `try...catch` 捕获，因为 Worker 在独立上下文中异步执行。

```js
// main.js
const worker = new Worker('./worker.js')

worker.onerror = (event) => {
  console.error(event.message)
}
```

```js
// worker.js
throw new Error('boom')
```

错误会作为 `ErrorEvent` 暴露给 `Worker` 对象。实际开发中，除了监听 `error`，更常见的是在 Worker 内部捕获业务错误，并用约定好的消息格式返回给主线程。

```js
// worker.js
self.onmessage = (event) => {
  try {
    self.postMessage({ ok: true, data: heavyTask(event.data) })
  } catch (error) {
    self.postMessage({ ok: false, message: error.message })
  }
}
```

## 12. 如何和专用工作者线程通信？

最常用方式是 `postMessage()`。

```js
// main.js
const worker = new Worker('./factorial-worker.js')

worker.onmessage = (event) => {
  console.log(event.data)
}

worker.postMessage(5)
```

```js
// factorial-worker.js
function factorial(number) {
  let result = 1

  for (let value = 2; value <= number; value += 1) {
    result *= value
  }

  return result
}

self.onmessage = (event) => {
  self.postMessage(factorial(event.data))
}
```

如果要建立明确的通信通道，可以使用 `MessageChannel`，把一个 `MessagePort` 转移给 Worker。

```js
const channel = new MessageChannel()
const worker = new Worker('./worker.js')

worker.postMessage({ type: 'connect' }, [channel.port1])

channel.port2.onmessage = (event) => {
  console.log(event.data)
}

channel.port2.postMessage('hello')
```

`MessageChannel` 对主线程和单个 Worker 通信来说不一定必要，但它很适合让两个 Worker 直接通信。

如果多个同源上下文需要广播消息，可以使用 `BroadcastChannel`。

```js
const channel = new BroadcastChannel('worker-channel')
const worker = new Worker('./worker.js')

channel.onmessage = (event) => console.log(event.data)
channel.postMessage('hello')
```

`BroadcastChannel` 没有端口所有权概念，发送消息时如果对方还没监听，就可能错过消息。因此初始化顺序要设计清楚。

## 13. Worker 间传输数据有哪些方式？

主线程和 Worker 是独立上下文，传输数据会有成本。常见方式有三类。

| 方式 | 特点 | 适合场景 |
| --- | --- | --- |
| 结构化克隆 | 复制数据到目标上下文。 | 普通对象、数组、`Map`、`Set` 等中小数据。 |
| 可转移对象 | 把所有权转移过去，不复制底层资源。 | 大型 `ArrayBuffer`、`MessagePort`、`ImageBitmap`、`OffscreenCanvas`。 |
| `SharedArrayBuffer` | 多个上下文共享同一块内存。 | 高性能并行计算，需要配合 `Atomics` 控制并发。 |

结构化克隆是 `postMessage()` 的默认行为。

```js
worker.postMessage({ items: [1, 2, 3] })
```

发送大块二进制数据时，可以转移 `ArrayBuffer`。

```js
const buffer = new ArrayBuffer(1024)

worker.postMessage(buffer, [buffer])

console.log(buffer.byteLength) // 0，所有权已经转移
```

使用 `SharedArrayBuffer` 时，多个线程可以看到同一块内存。这样性能更高，但也会产生竞争条件，需要用 `Atomics` 保证操作的原子性。

```js
// worker.js
self.onmessage = (event) => {
  const view = new Int32Array(event.data)

  Atomics.add(view, 0, 1)
  self.postMessage('done')
}
```

现代浏览器中，`SharedArrayBuffer` 还和跨源隔离等安全要求有关。实际项目要结合当前浏览器兼容性和响应头配置一起判断。

## 14. 什么时候需要线程池？

创建 Worker 的成本不低。如果任务很多、每个任务都重新创建 Worker，会浪费初始化成本。线程池的思路是维护固定数量的 Worker，任务来了就派给空闲 Worker。

线程池通常需要维护：

- Worker 列表。
- 待处理任务队列。
- Worker 是否空闲的状态。
- 任务完成后的 `resolve` 和失败后的 `reject`。
- 关闭线程池时统一调用 `terminate()`。

线程池大小没有绝对标准，可以参考 `navigator.hardwareConcurrency`，把可用核心数量作为上限。

```js
const poolSize = Math.max(1, navigator.hardwareConcurrency - 1)
```

不过，并行不一定更快。线程池是否值得使用，取决于任务粒度、数据传输成本、CPU 核心数量和调度开销。只有计算收益明显大于通信成本时，Worker 线程池才真正划算。
