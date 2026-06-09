# [0131. Stream 管道操作与组合模式](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0131.%20Stream%20%E7%AE%A1%E9%81%93%E6%93%8D%E4%BD%9C%E4%B8%8E%E7%BB%84%E5%90%88%E6%A8%A1%E5%BC%8F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. eTo 和 pipeThrough 方法的主要区别是什么？](#3-eto-和-pipethrough-方法的主要区别是什么)
  - [3.1. 基本用法对比](#31-基本用法对比)
  - [3.2. 返回值差异](#32-返回值差异)
  - [3.3. 对比表格](#33-对比表格)
  - [3.4. 链式调用示例](#34-链式调用示例)
  - [3.5. TransformStream 的结构](#35-transformstream-的结构)
  - [3.6. 实战：HTTP 响应处理](#36-实战http-响应处理)
- [4. 一个流的数据同时发送到多个目标？](#4-一个流的数据同时发送到多个目标)
  - [4.1. tee() 的基本用法](#41-tee-的基本用法)
  - [4.2. tee() 的特性](#42-tee-的特性)
  - [4.3. 实战：同时保存和显示](#43-实战同时保存和显示)
  - [4.4. 三个或更多目标](#44-三个或更多目标)
  - [4.5. 性能考虑](#45-性能考虑)
  - [4.6. 自定义广播流](#46-自定义广播流)
- [5. 操作中如何处理中间流的错误？](#5-操作中如何处理中间流的错误)
  - [5.1. 错误自动传播](#51-错误自动传播)
  - [5.2. 在 TransformStream 中处理错误](#52-在-transformstream-中处理错误)
  - [5.3. 管道选项控制错误传播](#53-管道选项控制错误传播)
  - [5.4. 完整错误处理示例](#54-完整错误处理示例)
  - [5.5. 使用 AbortController 取消管道](#55-使用-abortcontroller-取消管道)
  - [5.6. 分段错误处理](#56-分段错误处理)
- [6. 现多个流的并行处理和结果合并？](#6-现多个流的并行处理和结果合并)
  - [6.1. 并行处理多个独立流](#61-并行处理多个独立流)
  - [6.2. 合并多个流的输出](#62-合并多个流的输出)
  - [6.3. 实现流的 zip 操作](#63-实现流的-zip-操作)
  - [6.4. 竞态处理：最快的流获胜](#64-竞态处理最快的流获胜)
  - [6.5. 扇入模式：多个源合并到一个流](#65-扇入模式多个源合并到一个流)
  - [6.6. 实战：聚合多个 API 响应](#66-实战聚合多个-api-响应)
- [7. os.1 - 构建完整的 ETL 数据处理管道](#7-os1---构建完整的-etl-数据处理管道)
- [8. os.2 - 实现流的扇出和扇入模式](#8-os2---实现流的扇出和扇入模式)

<!-- endregion:toc -->

## 1. 本节内容

- pipeTo() 方法的用法与返回值
- pipeThrough() 方法的用法与链式调用
- 管道选项（preventClose、preventAbort、preventCancel）
- tee() 方法实现流分支
- 多流合并的实现策略
- 管道中的错误传播机制

## 2. 评价

管道操作是 Web Streams 的核心能力，pipeTo() 连接源与目标，pipeThrough() 串联转换流。tee() 方法实现流分支，支持扇出模式。理解管道选项（preventClose、preventAbort、preventCancel）对控制流生命周期至关重要。组合多个转换流可构建复杂数据处理管道，错误会自动沿管道传播，需在适当位置捕获处理。

## 3. eTo 和 pipeThrough 方法的主要区别是什么？

pipeTo() 连接到终点并返回 Promise，pipeThrough() 通过转换流并返回新的 ReadableStream。

### 3.1. 基本用法对比

```js
// pipeTo：连接到 WritableStream（终点）
const readable = new ReadableStream({
  start(controller) {
    controller.enqueue('data')
    controller.close()
  },
})

const writable = new WritableStream({
  write(chunk) {
    console.log('写入:', chunk)
  },
})

await readable.pipeTo(writable) // 返回 Promise
console.log('管道完成')

// pipeThrough：通过 TransformStream（中间节点）
const transform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase())
  },
})

const newReadable = readable.pipeThrough(transform) // 返回 ReadableStream
// 可以继续链式调用
```

### 3.2. 返回值差异

```js
// pipeTo 返回 Promise
const pipeline1 = source.pipeTo(sink)
console.log(pipeline1) // Promise<undefined>

pipeline1
  .then(() => console.log('✅ 管道成功完成'))
  .catch((error) => console.error('❌ 管道错误:', error))

// pipeThrough 返回 ReadableStream
const pipeline2 = source.pipeThrough(transformer)
console.log(pipeline2) // ReadableStream
console.log(pipeline2.constructor.name) // ReadableStream

// 可以继续管道
await pipeline2.pipeTo(sink)
```

### 3.3. 对比表格

| 特性     | `pipeTo()`                  | `pipeThrough()`                   |
| -------- | --------------------------- | --------------------------------- |
| 目标类型 | `WritableStream`            | `TransformStream`                 |
| 返回值   | `Promise<void>`             | `ReadableStream`                  |
| 用途     | 终点连接，完成管道          | 中间转换，继续管道                |
| 链式调用 | 不支持（返回 Promise）      | 支持（返回流）                    |
| 参数结构 | `pipeTo(writable, options)` | `pipeThrough(transform, options)` |
| 典型位置 | 管道末端                    | 管道中间                          |

### 3.4. 链式调用示例

```js
// 使用 pipeThrough 构建处理链
const result = await source
  .pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk.trim()) // 步骤 1：去空格
      },
    }),
  )
  .pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase()) // 步骤 2：转大写
      },
    }),
  )
  .pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(`[${chunk}]`) // 步骤 3：加括号
      },
    }),
  )
  .pipeTo(
    new WritableStream({
      write(chunk) {
        console.log('最终结果:', chunk) // 步骤 4：输出
      },
    }),
  )

// 等价于嵌套写法（但可读性差）
await source.pipeTo(
  new WritableStream({
    async write(chunk) {
      const step1 = chunk.trim()
      const step2 = step1.toUpperCase()
      const step3 = `[${step2}]`
      console.log('最终结果:', step3)
    },
  }),
)
```

### 3.5. TransformStream 的结构

```js
// pipeThrough 接收一个对象，必须有 readable 和 writable 属性
const customTransform = {
  readable: new ReadableStream({
    /* ... */
  }),
  writable: new WritableStream({
    /* ... */
  }),
}

source.pipeThrough(customTransform) // ✅ 有效

// TransformStream 本身就实现了这个接口
const transform = new TransformStream()
console.log(transform.readable) // ReadableStream
console.log(transform.writable) // WritableStream

source.pipeThrough(transform) // ✅ 有效
```

### 3.6. 实战：HTTP 响应处理

```js
// 使用 pipeThrough 处理响应流
const response = await fetch('/api/data')

const processedStream = response.body
  .pipeThrough(new TextDecoderStream()) // 字节流 → 文本流
  .pipeThrough(
    new TransformStream({
      transform(line, controller) {
        if (line.startsWith('data:')) {
          const json = JSON.parse(line.slice(5))
          controller.enqueue(json)
        }
      },
    }),
  )

// 最终写入
await processedStream.pipeTo(
  new WritableStream({
    write(data) {
      updateUI(data)
    },
  }),
)
```

核心区别：pipeTo 是终点，pipeThrough 是中继站。

## 4. 一个流的数据同时发送到多个目标？

使用 tee() 方法将流分成两个独立分支，然后各自处理。

### 4.1. tee() 的基本用法

```js
const source = new ReadableStream({
  start(controller) {
    controller.enqueue('data1')
    controller.enqueue('data2')
    controller.enqueue('data3')
    controller.close()
  },
})

// 分成两个流
const [stream1, stream2] = source.tee()

// 独立消费
stream1.pipeTo(
  new WritableStream({
    write(chunk) {
      console.log('目标 1:', chunk)
    },
  }),
)

stream2.pipeTo(
  new WritableStream({
    write(chunk) {
      console.log('目标 2:', chunk)
    },
  }),
)

// 输出：
// 目标 1: data1
// 目标 2: data1
// 目标 1: data2
// 目标 2: data2
// ...
```

### 4.2. tee() 的特性

```js
const original = new ReadableStream({
  pull(controller) {
    controller.enqueue(Math.random())
  },
})

const [branch1, branch2] = original.tee()

// ⚠️ 原始流被锁定，无法再读取
try {
  original.getReader()
} catch (error) {
  console.log(error.message) // ReadableStream is locked
}

// ✅ 两个分支独立
const reader1 = branch1.getReader()
const reader2 = branch2.getReader()

const result1 = await reader1.read()
const result2 = await reader2.read()

console.log(result1.value === result2.value) // true（相同数据）
```

### 4.3. 实战：同时保存和显示

```js
async function fetchAndProcess(url) {
  const response = await fetch(url)
  const [saveStream, displayStream] = response.body.tee()

  // 分支 1：保存到文件
  const savePromise = saveStream.pipeTo(
    new WritableStream({
      async write(chunk) {
        await saveToIndexedDB(chunk)
      },
    }),
  )

  // 分支 2：实时显示
  const displayPromise = displayStream
    .pipeThrough(new TextDecoderStream())
    .pipeTo(
      new WritableStream({
        write(text) {
          appendToUI(text)
        },
      }),
    )

  // 等待两个分支完成
  await Promise.all([savePromise, displayPromise])
}
```

### 4.4. 三个或更多目标

```js
// tee() 只能分成两个，需多次调用
const [stream1, temp] = source.tee()
const [stream2, stream3] = temp.tee()

// 或封装为工具函数
function multiTee(stream, count) {
  const branches = []
  let current = stream

  for (let i = 0; i < count - 1; i++) {
    const [branch, remaining] = current.tee()
    branches.push(branch)
    current = remaining
  }

  branches.push(current)
  return branches
}

const [s1, s2, s3, s4] = multiTee(source, 4)
```

### 4.5. 性能考虑

```js
// ⚠️ tee() 会缓冲数据
const [fast, slow] = source.tee()

// 快速消费
fast.pipeTo(
  new WritableStream({
    write(chunk) {
      console.log('快:', chunk)
    },
  }),
)

// 慢速消费（会导致缓冲堆积）
slow.pipeTo(
  new WritableStream({
    async write(chunk) {
      await sleep(1000)
      console.log('慢:', chunk)
    },
  }),
)

// 解决方案：使用背压协调
```

### 4.6. 自定义广播流

```js
class BroadcastStream {
  constructor(source) {
    this.source = source
    this.branches = []
  }

  addBranch() {
    if (this.branches.length === 0) {
      const [branch, remaining] = this.source.tee()
      this.branches.push(branch)
      this.source = remaining
      return branch
    }

    const lastIndex = this.branches.length - 1
    const [newBranch, remaining] = this.source.tee()
    this.branches.push(newBranch)
    this.source = remaining
    return newBranch
  }
}

const broadcaster = new BroadcastStream(originalStream)
const branch1 = broadcaster.addBranch()
const branch2 = broadcaster.addBranch()
const branch3 = broadcaster.addBranch()
```

tee() 是扇出模式的核心，但需注意内存和背压问题。

## 5. 操作中如何处理中间流的错误？

错误会自动传播到管道末端，可在 pipeTo() 的 Promise 中捕获，或使用管道选项控制传播。

### 5.1. 错误自动传播

```js
const source = new ReadableStream({
  pull(controller) {
    controller.enqueue('data')
    controller.error(new Error('源流错误')) // 触发错误
  },
})

const transform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase())
  },
})

const sink = new WritableStream({
  write(chunk) {
    console.log('写入:', chunk)
  },
})

try {
  await source.pipeThrough(transform).pipeTo(sink)
} catch (error) {
  console.log('捕获到错误:', error.message) // 源流错误
}
```

### 5.2. 在 TransformStream 中处理错误

```js
const safeTransform = new TransformStream({
  transform(chunk, controller) {
    try {
      const result = JSON.parse(chunk)
      controller.enqueue(result)
    } catch (error) {
      // 选项 1：跳过错误数据
      console.warn('解析失败，跳过:', chunk)

      // 选项 2：传播错误
      // controller.error(error)

      // 选项 3：发送错误标记
      controller.enqueue({ error: error.message, original: chunk })
    }
  },
})

await source.pipeThrough(safeTransform).pipeTo(sink)
```

### 5.3. 管道选项控制错误传播

```js
const pipelineOptions = {
  preventClose: false, // false：上游关闭时关闭下游
  preventAbort: false, // false：下游中止时中止上游
  preventCancel: false, // false：下游取消时取消上游
  signal: abortController.signal, // 外部取消信号
}

// 示例：防止错误关闭下游
await source.pipeTo(sink, {
  preventClose: true, // 即使源流关闭，目标流保持打开
  preventAbort: true, // 即使目标中止，源流继续
})
```

### 5.4. 完整错误处理示例

```js
async function robustPipeline(sourceURL) {
  const response = await fetch(sourceURL)

  const errorHandler = new TransformStream({
    transform(chunk, controller) {
      try {
        // 处理数据
        const processed = processChunk(chunk)
        controller.enqueue(processed)
      } catch (error) {
        // 记录错误但继续
        console.error('处理错误:', error, '数据:', chunk)
        controller.enqueue({ error: true, message: error.message })
      }
    },
  })

  const pipeline = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(errorHandler)
    .pipeTo(
      new WritableStream({
        write(chunk) {
          if (chunk.error) {
            console.log('错误数据:', chunk.message)
          } else {
            updateUI(chunk)
          }
        },
      }),
    )

  try {
    await pipeline
    console.log('✅ 管道完成')
  } catch (error) {
    console.error('❌ 管道失败:', error)
    // 清理资源
  }
}
```

### 5.5. 使用 AbortController 取消管道

```js
const controller = new AbortController()

const pipeline = source
  .pipeThrough(transform)
  .pipeTo(sink, { signal: controller.signal })

// 5 秒后取消
setTimeout(() => {
  controller.abort('超时')
}, 5000)

try {
  await pipeline
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('管道被取消:', error.message)
  }
}
```

### 5.6. 分段错误处理

```js
async function pipelineWithStageErrors() {
  const source = createSource()

  // 阶段 1：解码
  let stage1
  try {
    stage1 = source.pipeThrough(new TextDecoderStream())
  } catch (error) {
    console.error('解码失败:', error)
    throw error
  }

  // 阶段 2：解析
  const parseTransform = new TransformStream({
    transform(chunk, controller) {
      try {
        controller.enqueue(JSON.parse(chunk))
      } catch (error) {
        console.error('JSON 解析失败:', chunk)
        controller.enqueue(null) // 发送 null 表示错误
      }
    },
  })

  const stage2 = stage1.pipeThrough(parseTransform)

  // 阶段 3：过滤错误值
  const filterTransform = new TransformStream({
    transform(chunk, controller) {
      if (chunk !== null) {
        controller.enqueue(chunk)
      }
    },
  })

  await stage2.pipeThrough(filterTransform).pipeTo(sink)
}
```

错误处理的关键是在合适的位置捕获、记录或恢复，避免整个管道崩溃。

## 6. 现多个流的并行处理和结果合并？

使用 Promise.all() 并行处理多个管道，自定义合并逻辑聚合结果。

### 6.1. 并行处理多个独立流

```js
async function processMultipleStreams(urls) {
  const pipelines = urls.map(async (url) => {
    const response = await fetch(url)
    const results = []

    await response.body.pipeThrough(new TextDecoderStream()).pipeTo(
      new WritableStream({
        write(chunk) {
          results.push(chunk)
        },
      }),
    )

    return results
  })

  // 等待所有管道完成
  const allResults = await Promise.all(pipelines)
  console.log('所有结果:', allResults)
  return allResults
}
```

### 6.2. 合并多个流的输出

```js
async function mergeStreams(streams) {
  const results = []

  // 为每个流创建消费者
  const consumers = streams.map((stream, index) =>
    stream.pipeTo(
      new WritableStream({
        write(chunk) {
          results.push({ source: index, data: chunk })
        },
      }),
    ),
  )

  await Promise.all(consumers)
  return results
}

// 使用
const [stream1, stream2, stream3] = await Promise.all([
  fetch('/api/1').then((r) => r.body),
  fetch('/api/2').then((r) => r.body),
  fetch('/api/3').then((r) => r.body),
])

const merged = await mergeStreams([stream1, stream2, stream3])
```

### 6.3. 实现流的 zip 操作

```js
function zipStreams(stream1, stream2) {
  const reader1 = stream1.getReader()
  const reader2 = stream2.getReader()

  return new ReadableStream({
    async pull(controller) {
      const [result1, result2] = await Promise.all([
        reader1.read(),
        reader2.read(),
      ])

      if (result1.done || result2.done) {
        controller.close()
        reader1.releaseLock()
        reader2.releaseLock()
        return
      }

      controller.enqueue([result1.value, result2.value])
    },
  })
}

// 使用
const numbers = new ReadableStream({
  start(controller) {
    for (let i = 1; i <= 5; i++) controller.enqueue(i)
    controller.close()
  },
})

const letters = new ReadableStream({
  start(controller) {
    for (const letter of ['a', 'b', 'c', 'd', 'e']) controller.enqueue(letter)
    controller.close()
  },
})

const zipped = zipStreams(numbers, letters)
// 输出: [1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']
```

### 6.4. 竞态处理：最快的流获胜

```js
async function raceStreams(streams) {
  const results = []
  let finished = false

  const racers = streams.map((stream, index) =>
    stream
      .pipeTo(
        new WritableStream({
          write(chunk) {
            if (!finished) {
              results.push({ source: index, data: chunk })
            }
          },
        }),
      )
      .then(() => {
        finished = true
        return index
      }),
  )

  const winner = await Promise.race(racers)
  console.log('获胜者:', winner)
  return results
}
```

### 6.5. 扇入模式：多个源合并到一个流

```js
function combineStreams(streams) {
  const readers = streams.map((s) => s.getReader())
  let activeReaders = readers.length

  return new ReadableStream({
    async pull(controller) {
      const reads = readers.map((reader, index) =>
        reader.read().then((result) => ({ index, result })),
      )

      const { index, result } = await Promise.race(reads)

      if (result.done) {
        readers[index] = null
        activeReaders--

        if (activeReaders === 0) {
          controller.close()
        }
      } else {
        controller.enqueue({ source: index, data: result.value })
      }
    },
  })
}

// 使用
const combined = combineStreams([stream1, stream2, stream3])
await combined.pipeTo(
  new WritableStream({
    write(chunk) {
      console.log(`来自流 ${chunk.source}:`, chunk.data)
    },
  }),
)
```

### 6.6. 实战：聚合多个 API 响应

```js
async function aggregateAPIs(endpoints) {
  const streams = endpoints.map((url) => fetch(url).then((r) => r.body))

  const aggregated = []

  await Promise.all(
    streams.map(async (streamPromise, index) => {
      const stream = await streamPromise

      await stream
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(
          new TransformStream({
            transform(chunk, controller) {
              try {
                controller.enqueue(JSON.parse(chunk))
              } catch {
                // 忽略错误
              }
            },
          }),
        )
        .pipeTo(
          new WritableStream({
            write(data) {
              aggregated.push({ api: index, data })
            },
          }),
        )
    }),
  )

  return aggregated
}
```

并行处理的关键是 Promise.all/race，合并策略根据业务需求自定义。

## 7. os.1 - 构建完整的 ETL 数据处理管道

## 8. os.2 - 实现流的扇出和扇入模式
