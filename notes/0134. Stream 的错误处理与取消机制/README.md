# [0134. Stream 的错误处理与取消机制](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0134.%20Stream%20%E7%9A%84%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86%E4%B8%8E%E5%8F%96%E6%B6%88%E6%9C%BA%E5%88%B6)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 🤔 流处理中可能出现哪些类型的错误 ？](#3--流处理中可能出现哪些类型的错误-)
  - [3.1. 数据验证错误](#31-数据验证错误)
  - [3.2. 网络错误](#32-网络错误)
  - [3.3. 解析错误](#33-解析错误)
  - [3.4. 资源耗尽错误](#34-资源耗尽错误)
  - [3.5. 业务逻辑错误](#35-业务逻辑错误)
  - [3.6. 错误类型对比](#36-错误类型对比)
- [4. 🤔 如何在流的不同阶段捕获和处理错误 ？](#4--如何在流的不同阶段捕获和处理错误-)
  - [4.1. ReadableStream 的错误处理](#41-readablestream-的错误处理)
  - [4.2. TransformStream 的错误处理](#42-transformstream-的错误处理)
  - [4.3. WritableStream 的错误处理](#43-writablestream-的错误处理)
  - [4.4. 管道错误处理](#44-管道错误处理)
  - [4.5. 错误恢复策略](#45-错误恢复策略)
  - [4.6. 分段错误处理](#46-分段错误处理)
- [5. 🤔 取消操作如何在管道链中传播 ？](#5--取消操作如何在管道链中传播-)
  - [5.1. 基本取消传播](#51-基本取消传播)
  - [5.2. 取消传播顺序](#52-取消传播顺序)
  - [5.3. 管道选项控制传播](#53-管道选项控制传播)
  - [5.4. 多分支取消](#54-多分支取消)
  - [5.5. 选择性取消](#55-选择性取消)
  - [5.6. 级联取消](#56-级联取消)
  - [5.7. 超时取消](#57-超时取消)
- [6. 🤔 cancel() 方法的 reason 参数有什么作用 ？](#6--cancel-方法的-reason-参数有什么作用-)
  - [6.1. 基本用法](#61-基本用法)
  - [6.2. 通过 AbortController 传递 reason](#62-通过-abortcontroller-传递-reason)
  - [6.3. 结构化 reason](#63-结构化-reason)
  - [6.4. 条件性清理](#64-条件性清理)
  - [6.5. 调试和日志](#65-调试和日志)
  - [6.6. 错误 vs 取消](#66-错误-vs-取消)
  - [6.7. reason 的最佳实践](#67-reason-的最佳实践)
- [7. 🤔 如何确保流取消后正确清理资源 ？](#7--如何确保流取消后正确清理资源-)
  - [7.1. 定时器清理](#71-定时器清理)
  - [7.2. 网络连接清理](#72-网络连接清理)
  - [7.3. 文件句柄清理](#73-文件句柄清理)
  - [7.4. 事件监听器清理](#74-事件监听器清理)
  - [7.5. 内存清理](#75-内存清理)
  - [7.6. 级联清理](#76-级联清理)
  - [7.7. 检查清理完成](#77-检查清理完成)
- [8. 💻 demos.1 - 处理流中的各类错误场景](#8--demos1---处理流中的各类错误场景)
- [9. 💻 demos.2 - 实现可恢复的错误处理机制](#9--demos2---实现可恢复的错误处理机制)
- [10. 💻 demos.3 - 正确清理带有外部资源的流](#10--demos3---正确清理带有外部资源的流)
- [11. 引用](#11-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 流中的错误类型与来源
- controller.error() 方法的使用
- 取消传播机制（cancel propagation）
- reason 参数的传递与使用
- 错误恢复策略
- 资源清理与内存释放

## 2. 评价

错误处理是流式处理的重要环节，包括数据错误、网络错误、解析错误等多种类型。controller.error() 会立即终止流并传播错误，而 try-catch 适合处理可恢复的错误。取消操作通过 AbortController 触发，会自动沿管道链传播。cancel() 的 reason 参数携带取消原因，便于调试和记录。资源清理需在 cancel() 回调中执行，确保连接关闭、定时器清除、内存释放。

## 3. 🤔 流处理中可能出现哪些类型的错误 ？

包括数据验证错误、网络错误、解析错误、资源耗尽错误和业务逻辑错误。

### 3.1. 数据验证错误

```js
const validationStream = new TransformStream({
  transform(chunk, controller) {
    // 类型检查
    if (typeof chunk !== 'object') {
      controller.error(new TypeError(`期望对象，收到 ${typeof chunk}`))
      return
    }

    // 必填字段检查
    if (!chunk.id) {
      controller.error(new Error('缺少必填字段: id'))
      return
    }

    // 值范围检查
    if (chunk.age < 0 || chunk.age > 150) {
      controller.error(new RangeError(`年龄超出范围: ${chunk.age}`))
      return
    }

    controller.enqueue(chunk)
  },
})
```

### 3.2. 网络错误

```js
async function fetchWithRetry(url, maxRetries = 3) {
  let attempt = 0

  return new ReadableStream({
    async pull(controller) {
      while (attempt < maxRetries) {
        try {
          const response = await fetch(url)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          controller.enqueue(data)
          controller.close()
          return
        } catch (error) {
          attempt++
          console.warn(`尝试 ${attempt}/${maxRetries} 失败:`, error.message)

          if (attempt >= maxRetries) {
            controller.error(new Error(`网络请求失败，已重试 ${maxRetries} 次`))
            return
          }

          // 等待后重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    },
  })
}
```

### 3.3. 解析错误

```js
const jsonParseStream = new TransformStream({
  transform(chunk, controller) {
    try {
      const parsed = JSON.parse(chunk)
      controller.enqueue(parsed)
    } catch (error) {
      // 选项 1：跳过错误数据
      console.error('JSON 解析失败:', chunk, error)

      // 选项 2：传播错误（终止流）
      // controller.error(error)

      // 选项 3：发送错误标记
      controller.enqueue({
        _error: true,
        message: error.message,
        data: chunk,
      })
    }
  },
})
```

### 3.4. 资源耗尽错误

```js
const memoryLimitStream = new TransformStream({
  transform(chunk, controller) {
    const size = new Blob([chunk]).size

    // 检查内存使用
    if (
      performance.memory &&
      performance.memory.usedJSHeapSize > 100 * 1024 * 1024
    ) {
      controller.error(new Error('内存使用超过限制'))
      return
    }

    // 检查数据块大小
    if (size > 10 * 1024 * 1024) {
      controller.error(
        new Error(`数据块过大: ${(size / 1024 / 1024).toFixed(2)} MB`),
      )
      return
    }

    controller.enqueue(chunk)
  },
})
```

### 3.5. 业务逻辑错误

```js
const businessValidationStream = new TransformStream({
  transform(order, controller) {
    // 库存检查
    if (order.quantity > order.stock) {
      controller.error(
        new Error(`库存不足: 需要 ${order.quantity}，仅剩 ${order.stock}`),
      )
      return
    }

    // 权限检查
    if (order.amount > 10000 && !order.approved) {
      controller.error(new Error('大额订单需要审批'))
      return
    }

    // 状态检查
    if (order.status === 'cancelled') {
      controller.error(new Error('订单已取消'))
      return
    }

    controller.enqueue(order)
  },
})
```

### 3.6. 错误类型对比

| 错误类型           | 典型场景       | 处理策略     | 是否可恢复  |
| ------------------ | -------------- | ------------ | ----------- |
| TypeError          | 数据类型不匹配 | 跳过或转换   | ✅ 可恢复   |
| RangeError         | 值超出允许范围 | 截断或拒绝   | ✅ 可恢复   |
| SyntaxError        | JSON 解析失败  | 记录并跳过   | ✅ 可恢复   |
| NetworkError       | 网络请求失败   | 重试或降级   | ✅ 可恢复   |
| QuotaExceededError | 存储空间不足   | 清理或报错   | ⚠️ 部分恢复 |
| Error              | 业务逻辑错误   | 根据业务决定 | ⚠️ 视情况   |

## 4. 🤔 如何在流的不同阶段捕获和处理错误 ？

在 ReadableStream 的 start/pull 中捕获，在 TransformStream 的 transform 中处理，在 pipeTo 的 Promise 中捕获管道错误。

### 4.1. ReadableStream 的错误处理

```js
const source = new ReadableStream({
  async start(controller) {
    try {
      // 初始化可能失败的操作
      const connection = await connectToDatabase()
      this.connection = connection
    } catch (error) {
      console.error('初始化失败:', error)
      controller.error(error)
    }
  },

  async pull(controller) {
    try {
      const data = await this.connection.fetchNext()

      if (data) {
        controller.enqueue(data)
      } else {
        controller.close()
      }
    } catch (error) {
      console.error('读取数据失败:', error)
      controller.error(error)
    }
  },

  cancel(reason) {
    console.log('流被取消:', reason)
    // 清理资源
    this.connection?.close()
  },
})

// 消费流时捕获错误
try {
  const reader = source.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    processData(value)
  }
} catch (error) {
  console.error('读取流时出错:', error)
}
```

### 4.2. TransformStream 的错误处理

```js
const robustTransform = new TransformStream({
  transform(chunk, controller) {
    try {
      // 可能抛出异常的操作
      const result = processChunk(chunk)
      controller.enqueue(result)
    } catch (error) {
      // 策略 1：记录并跳过
      console.error('处理失败，跳过:', error)

      // 策略 2：发送错误数据
      controller.enqueue({ error: error.message, original: chunk })

      // 策略 3：终止流
      // controller.error(error)
    }
  },

  flush(controller) {
    try {
      // 清理操作
      const summary = this.generateSummary()
      controller.enqueue(summary)
    } catch (error) {
      console.error('flush 失败:', error)
      controller.error(error)
    }
  },
})
```

### 4.3. WritableStream 的错误处理

```js
const safeSink = new WritableStream({
  async write(chunk) {
    try {
      await saveToDatabase(chunk)
    } catch (error) {
      console.error('写入失败:', error)
      // ⚠️ 在 write 中抛出异常会中止流
      throw error
    }
  },

  async close() {
    try {
      await finalizeDatabase()
    } catch (error) {
      console.error('关闭失败:', error)
      throw error
    }
  },

  abort(reason) {
    console.log('流被中止:', reason)
    // 清理操作
    cleanupResources()
  },
})
```

### 4.4. 管道错误处理

```js
async function pipelineWithErrorHandling() {
  try {
    await source.pipeThrough(transform1).pipeThrough(transform2).pipeTo(sink)

    console.log('✅ 管道完成')
  } catch (error) {
    console.error('❌ 管道错误:', error)

    // 根据错误类型处理
    if (error.name === 'AbortError') {
      console.log('管道被取消')
    } else if (error.message.includes('网络')) {
      console.log('网络错误，稍后重试')
    } else {
      console.log('未知错误:', error)
    }
  } finally {
    // 清理资源
    cleanupResources()
  }
}
```

### 4.5. 错误恢复策略

```js
class RetryableStream {
  constructor(sourceFactory, maxRetries = 3) {
    this.sourceFactory = sourceFactory
    this.maxRetries = maxRetries
  }

  createStream() {
    let retries = 0

    return new ReadableStream({
      async pull(controller) {
        while (retries < this.maxRetries) {
          try {
            const source = this.sourceFactory()
            const reader = source.getReader()
            const { done, value } = await reader.read()

            if (done) {
              controller.close()
              return
            }

            controller.enqueue(value)
            retries = 0 // 成功后重置计数
            return
          } catch (error) {
            retries++
            console.warn(`重试 ${retries}/${this.maxRetries}:`, error)

            if (retries >= this.maxRetries) {
              controller.error(new Error(`失败次数过多: ${error.message}`))
              return
            }

            await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
          }
        }
      },
    })
  }
}
```

### 4.6. 分段错误处理

```js
async function segmentedPipeline(source) {
  let stage1Result
  let stage2Result

  // 阶段 1
  try {
    stage1Result = await source.pipeThrough(parseTransform).getReader().read()
  } catch (error) {
    console.error('阶段 1 失败:', error)
    return handleStage1Error(error)
  }

  // 阶段 2
  try {
    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue(stage1Result.value)
        controller.close()
      },
    })

    stage2Result = await stream2
      .pipeThrough(validateTransform)
      .getReader()
      .read()
  } catch (error) {
    console.error('阶段 2 失败:', error)
    return handleStage2Error(error)
  }

  return stage2Result.value
}
```

关键是在合适的位置捕获错误，并决定是恢复、跳过还是终止流。

## 5. 🤔 取消操作如何在管道链中传播 ？

使用 AbortController 的 signal 传递给 pipeTo()，取消会自动从下游传播到上游，触发所有流的 cancel/abort 回调。

### 5.1. 基本取消传播

```js
const controller = new AbortController()

const pipeline = source
  .pipeThrough(transform1)
  .pipeThrough(transform2)
  .pipeTo(sink, { signal: controller.signal })

// 触发取消
setTimeout(() => {
  controller.abort('超时')
}, 5000)

try {
  await pipeline
} catch (error) {
  console.log(error.name) // AbortError
  console.log(error.message) // 超时
}
```

### 5.2. 取消传播顺序

```js
const source = new ReadableStream({
  start(controller) {
    console.log('1. Source started')
    this.interval = setInterval(() => {
      controller.enqueue(Date.now())
    }, 100)
  },
  cancel(reason) {
    console.log('4. Source cancelled:', reason)
    clearInterval(this.interval)
  },
})

const transform = new TransformStream({
  start() {
    console.log('2. Transform started')
  },
  transform(chunk, controller) {
    controller.enqueue(chunk * 2)
  },
  flush() {
    console.log('3. Transform flushing')
  },
})

const sink = new WritableStream({
  start() {
    console.log('3. Sink started')
  },
  write(chunk) {
    console.log('Writing:', chunk)
  },
  abort(reason) {
    console.log('5. Sink aborted:', reason)
  },
})

const abortController = new AbortController()

source
  .pipeThrough(transform)
  .pipeTo(sink, { signal: abortController.signal })
  .catch((error) => {
    console.log('6. Pipeline error:', error.message)
  })

// 取消操作
setTimeout(() => {
  console.log('--- 触发取消 ---')
  abortController.abort('用户取消')
}, 500)

// 输出顺序：
// 1. Source started
// 2. Transform started
// 3. Sink started
// Writing: ...
// --- 触发取消 ---
// 5. Sink aborted: 用户取消
// 4. Source cancelled: 用户取消
// 6. Pipeline error: 用户取消
```

### 5.3. 管道选项控制传播

```js
const options = {
  signal: controller.signal,
  preventCancel: false, // false: 下游取消时取消上游（默认）
  preventAbort: false, // false: 上游错误时中止下游（默认）
  preventClose: false, // false: 上游关闭时关闭下游（默认）
}

await source.pipeTo(sink, options)

// 示例：防止取消传播到源流
await source.pipeTo(sink, {
  signal: controller.signal,
  preventCancel: true, // 下游取消，但源流继续
})
```

### 5.4. 多分支取消

```js
const abortController = new AbortController()

const [branch1, branch2] = source.tee()

// 两个分支共享同一个取消信号
const pipeline1 = branch1.pipeTo(sink1, { signal: abortController.signal })
const pipeline2 = branch2.pipeTo(sink2, { signal: abortController.signal })

// 取消会影响两个分支
abortController.abort('停止所有分支')

await Promise.allSettled([pipeline1, pipeline2])
```

### 5.5. 选择性取消

```js
// 为每个分支创建独立的控制器
const controller1 = new AbortController()
const controller2 = new AbortController()

const [branch1, branch2] = source.tee()

const pipeline1 = branch1.pipeTo(sink1, { signal: controller1.signal })
const pipeline2 = branch2.pipeTo(sink2, { signal: controller2.signal })

// 只取消分支 1
controller1.abort('停止分支 1')

// 分支 2 继续运行
await pipeline2
```

### 5.6. 级联取消

```js
async function cascadingCancel() {
  const parentController = new AbortController()

  // 子任务监听父取消信号
  const childController1 = new AbortController()
  const childController2 = new AbortController()

  parentController.signal.addEventListener('abort', () => {
    console.log('父级取消，级联到子任务')
    childController1.abort(parentController.signal.reason)
    childController2.abort(parentController.signal.reason)
  })

  const task1 = source1.pipeTo(sink1, { signal: childController1.signal })
  const task2 = source2.pipeTo(sink2, { signal: childController2.signal })

  // 取消父级会取消所有子任务
  setTimeout(() => {
    parentController.abort('根任务取消')
  }, 1000)

  await Promise.allSettled([task1, task2])
}
```

### 5.7. 超时取消

```js
function timeoutSignal(ms) {
  const controller = new AbortController()

  setTimeout(() => {
    controller.abort(`超时: ${ms}ms`)
  }, ms)

  return controller.signal
}

// 使用
try {
  await source.pipeTo(sink, { signal: timeoutSignal(5000) })
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('操作超时')
  }
}
```

取消传播是自动的，从下游到上游，触发所有流的清理回调。

## 6. 🤔 cancel() 方法的 reason 参数有什么作用 ？

reason 参数携带取消原因，用于日志记录、调试和条件性清理，会传递到 cancel/abort 回调中。

### 6.1. 基本用法

```js
const stream = new ReadableStream({
  start(controller) {
    this.interval = setInterval(() => {
      controller.enqueue(Date.now())
    }, 100)
  },

  cancel(reason) {
    console.log('流被取消，原因:', reason)
    // reason 可以是任何值：字符串、错误对象、自定义对象

    clearInterval(this.interval)

    // 根据原因执行不同的清理
    if (reason === 'timeout') {
      console.log('超时取消，保存进度')
      saveProgress()
    } else if (reason === 'user-action') {
      console.log('用户取消，不保存')
    }
  },
})

const reader = stream.getReader()

// 使用 reason 参数
reader.cancel('timeout')
// 或
reader.cancel(new Error('网络错误'))
// 或
reader.cancel({ type: 'user-action', timestamp: Date.now() })
```

### 6.2. 通过 AbortController 传递 reason

```js
const controller = new AbortController()

const pipeline = source.pipeTo(sink, { signal: controller.signal })

// abort() 的参数会作为 reason
controller.abort('用户点击取消按钮')

// 在流中接收
const stream = new ReadableStream({
  cancel(reason) {
    console.log(reason) // 用户点击取消按钮
  },
})
```

### 6.3. 结构化 reason

```js
class CancelReason {
  constructor(type, message, metadata = {}) {
    this.type = type
    this.message = message
    this.metadata = metadata
    this.timestamp = Date.now()
  }
}

const reasons = {
  TIMEOUT: new CancelReason('timeout', '操作超时', { limit: 5000 }),
  USER_CANCEL: new CancelReason('user', '用户取消'),
  ERROR: (error) => new CancelReason('error', error.message, { error }),
}

// 使用
const stream = new ReadableStream({
  cancel(reason) {
    if (reason.type === 'timeout') {
      console.log(`${reason.message}, 限制: ${reason.metadata.limit}ms`)
    } else if (reason.type === 'error') {
      console.error('错误导致取消:', reason.metadata.error)
    }

    logCancellation(reason)
  },
})

reader.cancel(reasons.TIMEOUT)
```

### 6.4. 条件性清理

```js
const fileStream = new ReadableStream({
  async start(controller) {
    this.fileHandle = await openFile('large-file.dat')
    this.tempFile = await createTempFile()
  },

  cancel(reason) {
    // 根据取消原因决定清理策略
    if (reason?.keepProgress) {
      console.log('保留临时文件以便恢复')
      this.tempFile.keep()
    } else {
      console.log('删除临时文件')
      this.tempFile.delete()
    }

    // 总是关闭文件句柄
    this.fileHandle.close()
  },
})

// 保留进度的取消
reader.cancel({ type: 'pause', keepProgress: true })

// 彻底取消
reader.cancel({ type: 'abort', keepProgress: false })
```

### 6.5. 调试和日志

```js
const debugStream = new ReadableStream({
  start() {
    this.startTime = Date.now()
    this.itemsProcessed = 0
  },

  pull(controller) {
    this.itemsProcessed++
    controller.enqueue(this.itemsProcessed)
  },

  cancel(reason) {
    const duration = Date.now() - this.startTime

    // 详细的取消日志
    console.log('=== 流取消报告 ===')
    console.log('取消原因:', reason)
    console.log('运行时长:', duration, 'ms')
    console.log('已处理项目:', this.itemsProcessed)
    console.log('平均速率:', (this.itemsProcessed / duration) * 1000, 'items/s')

    // 发送到监控系统
    analytics.trackCancellation({
      reason,
      duration,
      itemsProcessed: this.itemsProcessed,
    })
  },
})
```

### 6.6. 错误 vs 取消

```js
const stream = new ReadableStream({
  async pull(controller) {
    try {
      const data = await fetchData()
      controller.enqueue(data)
    } catch (error) {
      // ❌ 错误：使用 controller.error()
      controller.error(error)
    }
  },

  cancel(reason) {
    // ✅ 取消：正常的中止操作
    console.log('用户主动取消:', reason)
  },
})

// 区别：
// - error(): 异常情况，流出错
// - cancel(): 正常中止，用户或系统主动取消
```

### 6.7. reason 的最佳实践

```js
// ✅ 好的 reason
reader.cancel('timeout')
reader.cancel(new Error('Network failed'))
reader.cancel({ type: 'user-action', button: 'cancel' })

// ⚠️ 不推荐的 reason
reader.cancel() // undefined，不提供信息
reader.cancel(null) // 空值，无意义
reader.cancel(42) // 数字，含义不明

// 推荐的模式
const CancelReasons = {
  TIMEOUT: 'timeout',
  USER_CANCEL: 'user-cancel',
  NETWORK_ERROR: 'network-error',
  QUOTA_EXCEEDED: 'quota-exceeded',
}

reader.cancel(CancelReasons.TIMEOUT)
```

reason 参数让取消操作更可追溯和可调试，应提供有意义的值。

## 7. 🤔 如何确保流取消后正确清理资源 ？

在 cancel/abort 回调中执行清理，包括关闭连接、清除定时器、释放文件句柄、取消订阅等操作。

### 7.1. 定时器清理

```js
const timerStream = new ReadableStream({
  start(controller) {
    this.interval = setInterval(() => {
      controller.enqueue(Date.now())
    }, 1000)

    this.timeout = setTimeout(() => {
      controller.close()
    }, 10000)
  },

  cancel() {
    // ✅ 清除所有定时器
    clearInterval(this.interval)
    clearTimeout(this.timeout)
    console.log('定时器已清理')
  },
})
```

### 7.2. 网络连接清理

```js
const websocketStream = new ReadableStream({
  start(controller) {
    this.ws = new WebSocket('wss://example.com')

    this.ws.onmessage = (event) => {
      controller.enqueue(event.data)
    }

    this.ws.onerror = (error) => {
      controller.error(error)
    }
  },

  cancel(reason) {
    console.log('关闭 WebSocket:', reason)

    // ✅ 关闭连接
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, String(reason))
    }

    // 移除事件监听
    this.ws.onmessage = null
    this.ws.onerror = null
  },
})
```

### 7.3. 文件句柄清理

```js
const fileStream = new ReadableStream({
  async start(controller) {
    // 假设的文件 API
    this.fileHandle = await navigator.storage
      .getDirectory()
      .then((dir) => dir.getFileHandle('data.txt'))
    this.file = await this.fileHandle.getFile()
    this.reader = this.file.stream().getReader()
  },

  async pull(controller) {
    const { done, value } = await this.reader.read()

    if (done) {
      controller.close()
      return
    }

    controller.enqueue(value)
  },

  async cancel(reason) {
    console.log('取消文件读取:', reason)

    // ✅ 释放文件读取器
    if (this.reader) {
      await this.reader.cancel()
      this.reader = null
    }

    // 清理其他引用
    this.file = null
    this.fileHandle = null
  },
})
```

### 7.4. 事件监听器清理

```js
const eventStream = new ReadableStream({
  start(controller) {
    this.handler = (event) => {
      controller.enqueue(event.data)
    }

    window.addEventListener('message', this.handler)

    // 存储其他监听器
    this.listeners = new Map()
    this.listeners.set('resize', () => controller.enqueue({ type: 'resize' }))
    this.listeners.set('online', () => controller.enqueue({ type: 'online' }))

    this.listeners.forEach((handler, event) => {
      window.addEventListener(event, handler)
    })
  },

  cancel(reason) {
    console.log('移除事件监听:', reason)

    // ✅ 移除所有监听器
    window.removeEventListener('message', this.handler)

    this.listeners.forEach((handler, event) => {
      window.removeEventListener(event, handler)
    })

    this.listeners.clear()
  },
})
```

### 7.5. 内存清理

```js
const cacheStream = new ReadableStream({
  start(controller) {
    this.cache = new Map()
    this.buffer = new ArrayBuffer(1024 * 1024) // 1MB
    this.largeData = []
  },

  pull(controller) {
    const data = generateData()
    this.cache.set(data.id, data)
    this.largeData.push(data)
    controller.enqueue(data)
  },

  cancel(reason) {
    console.log('清理内存:', reason)

    // ✅ 清空缓存
    this.cache.clear()
    this.cache = null

    // 释放大数组
    this.largeData.length = 0
    this.largeData = null

    // 释放 ArrayBuffer
    this.buffer = null

    console.log('内存已释放')
  },
})
```

### 7.6. 级联清理

```js
class ManagedStream {
  constructor() {
    this.resources = []
  }

  registerResource(resource) {
    this.resources.push(resource)
  }

  createStream() {
    return new ReadableStream({
      start: (controller) => {
        // 注册需要清理的资源
        const ws = new WebSocket('wss://example.com')
        this.registerResource({ type: 'websocket', resource: ws })

        const interval = setInterval(() => {}, 1000)
        this.registerResource({ type: 'interval', resource: interval })

        const eventHandler = () => {}
        window.addEventListener('resize', eventHandler)
        this.registerResource({
          type: 'event',
          resource: { event: 'resize', handler: eventHandler },
        })
      },

      cancel: (reason) => {
        console.log(`清理 ${this.resources.length} 个资源`)

        // ✅ 统一清理所有资源
        this.resources.forEach((item) => {
          switch (item.type) {
            case 'websocket':
              item.resource.close()
              break
            case 'interval':
              clearInterval(item.resource)
              break
            case 'timeout':
              clearTimeout(item.resource)
              break
            case 'event':
              window.removeEventListener(
                item.resource.event,
                item.resource.handler,
              )
              break
          }
        })

        this.resources = []
      },
    })
  }
}
```

### 7.7. 检查清理完成

```js
const stream = new ReadableStream({
  start(controller) {
    this.cleanedUp = false
    this.interval = setInterval(() => {
      if (!this.cleanedUp) {
        controller.enqueue(Date.now())
      }
    }, 100)
  },

  cancel(reason) {
    if (this.cleanedUp) {
      console.warn('⚠️ 重复清理')
      return
    }

    console.log('开始清理...')
    clearInterval(this.interval)
    this.interval = null

    // 标记已清理
    this.cleanedUp = true
    console.log('✅ 清理完成')
  },
})

// 验证清理
const reader = stream.getReader()
await reader.cancel('test')
await reader.cancel('test') // 应该检测到重复清理
```

资源清理是防止内存泄漏的关键，必须在 cancel/abort 中执行。

## 8. 💻 demos.1 - 处理流中的各类错误场景

演示数据验证错误、网络错误、解析错误、错误恢复、管道错误传播和容错处理等多种错误场景。

**运行方式**：在浏览器中打开 [demos/1/1.html](demos/1/1.html)

**核心功能**：

- 数据验证错误（类型检查、必填字段、范围验证）
- 网络错误处理（模拟请求失败和重试）
- JSON 解析错误处理（跳过无效数据）
- 错误恢复策略（跳过空值继续处理）
- 管道错误传播演示
- 带重试机制的容错流

## 9. 💻 demos.2 - 实现可恢复的错误处理机制

演示可配置的重试机制，包括错误率、最大重试次数和重试延迟的调整。

**运行方式**：在浏览器中打开 [demos/2/2.html](demos/2/2.html)

**核心功能**：

- 可调节的错误率模拟
- 可配置的重试策略
- 实时统计图表（成功、重试成功、失败）
- 指数退避重试延迟
- 成功率计算

**关键代码**：

```js
async pull(controller) {
  let attempt = 0
  while (attempt < maxRetries) {
    try {
      const data = await unreliableOperation()
      controller.enqueue(data)
      return
    } catch (error) {
      attempt++
      if (attempt >= maxRetries) {
        // 记录失败但继续处理
        return this.pull(controller)
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}
```

## 10. 💻 demos.3 - 正确清理带有外部资源的流

演示流取消时如何清理定时器、事件监听器、WebSocket、缓存和内存缓冲区等资源。

**运行方式**：在浏览器中打开 [demos/3/3.html](demos/3/3.html)

**核心功能**：

- 多种资源类型管理（定时器、监听器、连接、缓存、内存）
- 资源状态可视化
- 正常取消和错误取消
- 内存使用监控
- 防止资源泄漏

**关键代码**：

```js
cancel(reason) {
  // 清理定时器
  this.timers.forEach(timer => clearInterval(timer))

  // 移除事件监听器
  this.listeners.forEach(({ event, handler }) => {
    window.removeEventListener(event, handler)
  })

  // 关闭连接
  this.ws?.close()

  // 清空缓存
  this.cache.clear()

  // 释放内存
  this.buffer = null
}
```

## 11. 引用

- [Streams Standard - Error Handling][1]
- [MDN - ReadableStreamDefaultController.error()][2]
- [MDN - AbortController][3]
- [MDN - AbortSignal][4]

[1]: https://streams.spec.whatwg.org/#error-handling
[2]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultController/error
[3]: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
[4]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
