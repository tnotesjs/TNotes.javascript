# [0339. 共享工作者线程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0339.%20%E5%85%B1%E4%BA%AB%E5%B7%A5%E4%BD%9C%E8%80%85%E7%BA%BF%E7%A8%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 共享工作者线程是什么？](#3--共享工作者线程是什么)
- [4. 🤔 如何创建共享工作者线程？](#4--如何创建共享工作者线程)
- [5. 🤔 `SharedWorker` 为什么不一定创建新线程？](#5--sharedworker-为什么不一定创建新线程)
- [6. 🤔 `SharedWorker` 对象怎么通信？](#6--sharedworker-对象怎么通信)
- [7. 🤔 共享工作者线程内部如何接收连接？](#7--共享工作者线程内部如何接收连接)
- [8. 🤔 共享工作者线程的生命周期有什么特别？](#8--共享工作者线程的生命周期有什么特别)
- [9. 🤔 连接断开为什么要特别处理？](#9--连接断开为什么要特别处理)
- [10. 🤔 什么时候应该选择共享工作者线程？](#10--什么时候应该选择共享工作者线程)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 共享工作者线程的定位
- `SharedWorker` 的创建与标识
- `SharedWorker` 对象和 `port`
- `SharedWorkerGlobalScope`
- 共享工作者线程生命周期
- 连接、端口和断开清理

## 2. 🫧 评价

- 共享工作者线程像是同源页面之间的后台联络员，适合共享连接和状态，但端口管理和生命周期边界要比专用 Worker 更细心。

## 3. 🤔 共享工作者线程是什么？

共享工作者线程和专用工作者线程很像：它也运行在独立 JavaScript 环境中，也不能直接访问 DOM，也通过异步消息与外部通信。

区别在于，专用工作者线程只服务于创建它的上下文；共享工作者线程可以被多个同源上下文连接。

典型场景包括：

- 多个同源标签页共享一个 WebSocket 连接。
- 多个页面共享一份后台计算结果。
- 多个同源上下文通过一个中心线程通信。
- 减少重复创建 Worker 带来的计算和内存成本。

```js
const sharedWorker = new SharedWorker('./shared-worker.js')
```

## 4. 🤔 如何创建共享工作者线程？

创建共享工作者线程使用 `SharedWorker` 构造函数。

```js
// main.js
const sharedWorker = new SharedWorker('./shared-worker.js')

console.log(sharedWorker)
```

它和 `Worker` 一样，会在后台异步加载脚本。创建选项、安全限制和经典脚本中的 `importScripts()` 行为也与专用 Worker 类似。

共享 Worker 也可以用行内 `Blob` 创建，但通常意义不大。因为每次创建的对象 URL 都是唯一的，这会让共享 Worker 失去共享意义。

## 5. 🤔 `SharedWorker` 为什么不一定创建新线程？

`Worker()` 每次调用通常都会创建新的专用工作者线程。`SharedWorker()` 不同，它会先检查是否已经存在匹配的共享工作者线程。

共享工作者线程的标识主要由三部分决定：

- 解析后的脚本 URL。
- 可选的工作者线程名称。
- 当前文档的源。

如果标识相同，新的 `SharedWorker()` 调用会连接到已有线程，而不是创建新线程。

```js
new SharedWorker('./shared-worker.js')
new SharedWorker('./shared-worker.js')
new SharedWorker('shared-worker.js')
```

在同源且 URL 解析结果一致、名称一致的情况下，这些调用会连接到同一个共享工作者线程。

如果名称不同，就会创建不同的共享工作者线程。

```js
new SharedWorker('./shared-worker.js', { name: 'foo' })
new SharedWorker('./shared-worker.js', { name: 'bar' })
```

如果 URL 不同，即使脚本内容相同，也会被视为不同的共享工作者线程。

```js
new SharedWorker('./shared-worker.js')
new SharedWorker('./shared-worker.js?version=1')
```

## 6. 🤔 `SharedWorker` 对象怎么通信？

`SharedWorker()` 返回的对象不是直接通过自身 `postMessage()` 通信，而是通过它的 `port` 属性通信。

```js
// main.js
const sharedWorker = new SharedWorker('./shared-worker.js')

sharedWorker.port.onmessage = (event) => {
  console.log(event.data)
}

sharedWorker.port.postMessage('hello')
```

`sharedWorker.port` 是一个 `MessagePort`。它是当前页面和共享工作者线程之间的专属连接。

`SharedWorker` 对象本身常用属性很少，最重要的是：

| 属性      | 说明                                             |
| --------- | ------------------------------------------------ |
| `port`    | 当前上下文与共享工作者线程通信的 `MessagePort`。 |
| `onerror` | 共享工作者线程内部发生错误时触发。               |

如果使用 `addEventListener('message', handler)` 监听端口消息，通常需要显式调用 `sharedWorker.port.start()` 开始派发消息；使用 `port.onmessage = handler` 时，浏览器会自动启动端口。

## 7. 🤔 共享工作者线程内部如何接收连接？

共享工作者线程内部的全局对象是 `SharedWorkerGlobalScope`。它通过 `connect` 事件接收新连接。

```js
// shared-worker.js
self.onconnect = (event) => {
  const port = event.ports[0]

  port.onmessage = (messageEvent) => {
    port.postMessage(`received: ${messageEvent.data}`)
  }
}
```

每次外部调用 `new SharedWorker()` 并连接到这个共享线程，都会触发一次 `connect` 事件。事件对象的 `ports` 数组中通常只有一个 `MessagePort`，表示这次连接的通信端点。

可以保存所有连接端口，实现广播。

```js
const ports = new Set()

self.onconnect = (event) => {
  const port = event.ports[0]

  ports.add(port)

  port.onmessage = (messageEvent) => {
    for (const currentPort of ports) {
      currentPort.postMessage(messageEvent.data)
    }
  }
}
```

## 8. 🤔 共享工作者线程的生命周期有什么特别？

共享工作者线程和专用工作者线程一样，也会经历初始化、活动和终止。但它和页面的绑定关系不同。

专用 Worker 只和一个页面关联。页面关闭时，对应专用 Worker 会被终止。

共享 Worker 可以被多个同源上下文连接。只要还有一个连接存在，共享工作者线程就会继续存在。最后一个连接消失后，浏览器才会终止它。

| 场景 | 专用 Worker | 共享 Worker |
| --- | --- | --- |
| 三个标签页分别创建 | 创建三个线程。 | 可能只创建一个线程，三个标签页都连接它。 |
| 关闭一个标签页 | 对应专用线程终止。 | 断开一个连接，线程可能继续存在。 |
| 关闭最后一个标签页 | 最后一个专用线程终止。 | 没有连接后，共享线程终止。 |

共享 Worker 没有 `terminate()` 方法。你不能像专用 Worker 那样从某个页面直接终止共享线程。浏览器根据连接数量管理它的生命周期。

## 9. 🤔 连接断开为什么要特别处理？

每次连接共享 Worker，线程内部都能拿到一个新的 `MessagePort`。但页面关闭时，并没有一个对称的断开事件自动告诉共享 Worker 某个端口已经失效。

如果你在共享 Worker 里保存了端口集合，长期运行后可能会留下死端口。一个常见做法是在页面即将卸载时主动发送断开消息。

```js
// main.js
const sharedWorker = new SharedWorker('./shared-worker.js')

window.addEventListener('beforeunload', () => {
  sharedWorker.port.postMessage({ type: 'disconnect' })
})
```

```js
// shared-worker.js
const ports = new Set()

self.onconnect = (event) => {
  const port = event.ports[0]

  ports.add(port)

  port.onmessage = (messageEvent) => {
    if (messageEvent.data?.type === 'disconnect') {
      ports.delete(port)
    }
  }
}
```

这个清理逻辑并不是绝对可靠，因为页面崩溃、进程被杀或某些浏览器行为可能不会触发 `beforeunload`。但它能处理常规页面卸载场景。

## 10. 🤔 什么时候应该选择共享工作者线程？

共享工作者线程适合多个同源上下文确实需要共享后台能力的场景。如果只是单个页面想把计算移出主线程，专用 Worker 更简单。

可以优先考虑共享 Worker 的场景：

- 多个标签页共享一个连接，例如 WebSocket。
- 多个页面需要共享缓存的计算结果。
- 多个同源页面之间需要中心化消息路由。
- 希望减少重复创建后台线程的成本。

不太适合共享 Worker 的场景：

- 任务只属于当前页面。
- 通信协议很简单，专用 Worker 足够。
- 需要严格控制线程终止时机。
- 需要支持兼容性较差的旧环境。

共享 Worker 的核心收益是跨上下文共享，核心成本是端口管理和生命周期更复杂。
