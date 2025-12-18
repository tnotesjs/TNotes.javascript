const logEl = document.getElementById('log')
const stats = {
  total: 0,
  success: 0,
  error: 0,
  skipped: 0,
}

function log(message, type = 'info') {
  const entry = document.createElement('div')
  entry.className = `log-entry ${type}`
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
  logEl.appendChild(entry)
  logEl.scrollTop = logEl.scrollHeight
}

function updateStats() {
  document.getElementById('totalItems').textContent = stats.total
  document.getElementById('successItems').textContent = stats.success
  document.getElementById('errorItems').textContent = stats.error
  document.getElementById('skippedItems').textContent = stats.skipped
}

function resetStats() {
  stats.total = 0
  stats.success = 0
  stats.error = 0
  stats.skipped = 0
  updateStats()
}

// 数据验证错误演示
async function runValidationError() {
  log('=== 数据验证错误演示 ===')
  resetStats()

  const testData = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob' }, // ❌ 缺少 age
    { id: 3, name: 'Charlie', age: 'invalid' }, // ❌ age 类型错误
    { id: 4, name: 'Diana', age: 200 }, // ❌ age 超出范围
    { id: 5, name: 'Eve', age: 30 },
  ]

  const source = new ReadableStream({
    start(controller) {
      testData.forEach((item) => controller.enqueue(item))
      controller.close()
    },
  })

  const validationStream = new TransformStream({
    transform(chunk, controller) {
      stats.total++

      try {
        // 验证必填字段
        if (!chunk.id || !chunk.name) {
          throw new Error(`缺少必填字段: ${JSON.stringify(chunk)}`)
        }

        // 验证类型
        if (chunk.age !== undefined && typeof chunk.age !== 'number') {
          throw new TypeError(`age 必须是数字: ${chunk.age}`)
        }

        // 验证范围
        if (chunk.age !== undefined && (chunk.age < 0 || chunk.age > 150)) {
          throw new RangeError(`age 超出范围: ${chunk.age}`)
        }

        log(`✅ 验证通过: ${chunk.name}`, 'success')
        stats.success++
        controller.enqueue(chunk)
      } catch (error) {
        log(`❌ 验证失败: ${error.message}`, 'error')
        stats.error++
        // 跳过错误数据，继续处理
      }
    },
  })

  await source.pipeThrough(validationStream).pipeTo(
    new WritableStream({
      write(chunk) {
        log(`💾 保存数据: ${JSON.stringify(chunk)}`)
      },
    })
  )

  updateStats()
  log('验证流程完成', 'success')
}

// 网络错误演示
async function runNetworkError() {
  log('=== 网络错误演示 ===')
  resetStats()

  let requestCount = 0

  const networkStream = new ReadableStream({
    async pull(controller) {
      requestCount++
      stats.total++

      try {
        // 模拟网络请求
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // 模拟 30% 失败率
            if (Math.random() < 0.3) {
              reject(new Error('Network timeout'))
            } else {
              resolve()
            }
          }, 100)
        })

        const data = { id: requestCount, value: Math.random() }
        log(`✅ 请求成功: 请求 #${requestCount}`, 'success')
        stats.success++
        controller.enqueue(data)

        if (requestCount >= 10) {
          controller.close()
        }
      } catch (error) {
        log(`❌ 网络错误: ${error.message}`, 'error')
        stats.error++

        // 继续尝试下一个请求
        if (requestCount < 10) {
          return this.pull(controller)
        } else {
          controller.close()
        }
      }
    },
  })

  await networkStream.pipeTo(
    new WritableStream({
      write(chunk) {
        log(`📥 接收数据: ${JSON.stringify(chunk)}`)
      },
    })
  )

  updateStats()
  log('网络流程完成', 'success')
}

// 解析错误演示
async function runParseError() {
  log('=== 解析错误演示 ===')
  resetStats()

  const jsonStrings = [
    '{"id":1,"name":"Alice"}',
    '{"id":2,"name":"Bob"', // ❌ 不完整的 JSON
    'invalid json', // ❌ 完全无效
    '{"id":3,"name":"Charlie"}',
    '{"id":4,"name":', // ❌ 截断的 JSON
    '{"id":5,"name":"Eve"}',
  ]

  const source = new ReadableStream({
    start(controller) {
      jsonStrings.forEach((str) => controller.enqueue(str))
      controller.close()
    },
  })

  const parseStream = new TransformStream({
    transform(chunk, controller) {
      stats.total++

      try {
        const parsed = JSON.parse(chunk)
        log(`✅ 解析成功: ${parsed.name}`, 'success')
        stats.success++
        controller.enqueue(parsed)
      } catch (error) {
        log(`❌ JSON 解析失败: ${chunk.substring(0, 30)}...`, 'error')
        stats.error++
        // 发送错误标记
        controller.enqueue({
          _error: true,
          message: error.message,
          data: chunk,
        })
      }
    },
  })

  await source.pipeThrough(parseStream).pipeTo(
    new WritableStream({
      write(chunk) {
        if (chunk._error) {
          log(`⚠️ 错误数据: ${chunk.message}`, 'warning')
        } else {
          log(`✅ 有效数据: ${JSON.stringify(chunk)}`)
        }
      },
    })
  )

  updateStats()
  log('解析流程完成', 'success')
}

// 错误恢复演示
async function runRecovery() {
  log('=== 错误恢复演示 ===')
  resetStats()

  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    value: i % 5 === 0 ? null : i * 10, // 每 5 个有一个错误
  }))

  const source = new ReadableStream({
    start(controller) {
      items.forEach((item) => controller.enqueue(item))
      controller.close()
    },
  })

  const recoveryStream = new TransformStream({
    transform(chunk, controller) {
      stats.total++

      if (chunk.value === null) {
        log(`⚠️ 跳过空值: ID ${chunk.id}`, 'warning')
        stats.skipped++
        return
      }

      try {
        const result = chunk.value * 2
        stats.success++
        controller.enqueue({ id: chunk.id, result })
      } catch (error) {
        log(`❌ 处理错误: ${error.message}`, 'error')
        stats.error++
      }
    },
  })

  await source.pipeThrough(recoveryStream).pipeTo(
    new WritableStream({
      write(chunk) {
        log(`✅ 处理完成: ID ${chunk.id} = ${chunk.result}`)
      },
    })
  )

  updateStats()
  log('恢复流程完成', 'success')
}

// 管道错误传播演示
async function runPipelineError() {
  log('=== 管道错误传播演示 ===')
  resetStats()

  const source = new ReadableStream({
    start(controller) {
      for (let i = 1; i <= 10; i++) {
        controller.enqueue(i)
      }
      controller.close()
    },
  })

  const transform1 = new TransformStream({
    transform(chunk, controller) {
      log(`阶段 1: 处理 ${chunk}`)
      if (chunk === 5) {
        // 在第 5 项触发错误
        log('❌ 阶段 1 检测到错误', 'error')
        controller.error(new Error('阶段 1 失败: 数据无效'))
        return
      }
      controller.enqueue(chunk * 2)
    },
  })

  const transform2 = new TransformStream({
    transform(chunk, controller) {
      log(`阶段 2: 处理 ${chunk}`)
      controller.enqueue(chunk + 1)
    },
  })

  try {
    await source
      .pipeThrough(transform1)
      .pipeThrough(transform2)
      .pipeTo(
        new WritableStream({
          write(chunk) {
            stats.success++
            log(`✅ 最终输出: ${chunk}`)
          },
        })
      )
  } catch (error) {
    log(`❌ 管道错误被捕获: ${error.message}`, 'error')
  }

  updateStats()
  log('管道流程结束', 'warning')
}

// 容错处理演示
async function runFaultTolerant() {
  log('=== 容错处理演示 ===')
  resetStats()

  class RetryableStream {
    constructor(maxRetries = 3) {
      this.maxRetries = maxRetries
    }

    createStream() {
      let retries = 0

      return new ReadableStream({
        async pull(controller) {
          stats.total++

          while (retries < this.maxRetries) {
            try {
              // 模拟可能失败的操作
              if (Math.random() < 0.5) {
                throw new Error('操作失败')
              }

              const data = { id: stats.total, value: Math.random() }
              log(`✅ 操作成功（尝试 ${retries + 1}）`, 'success')
              stats.success++
              controller.enqueue(data)
              retries = 0
              return
            } catch (error) {
              retries++
              log(`⚠️ 尝试 ${retries}/${this.maxRetries} 失败`, 'warning')

              if (retries >= this.maxRetries) {
                log(`❌ 超过最大重试次数`, 'error')
                stats.error++
                retries = 0
                return
              }

              await new Promise((resolve) => setTimeout(resolve, 100 * retries))
            }
          }

          if (stats.total >= 10) {
            controller.close()
          }
        },
      })
    }
  }

  const retryable = new RetryableStream(3)
  const stream = retryable.createStream()

  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        log(`📥 接收: ${JSON.stringify(chunk)}`)
      },
    })
  )

  updateStats()
  log('容错流程完成', 'success')
}

// 事件监听
document
  .getElementById('validationError')
  .addEventListener('click', runValidationError)
document
  .getElementById('networkError')
  .addEventListener('click', runNetworkError)
document.getElementById('parseError').addEventListener('click', runParseError)
document.getElementById('recovery').addEventListener('click', runRecovery)
document
  .getElementById('pipelineError')
  .addEventListener('click', runPipelineError)
document
  .getElementById('faultTolerant')
  .addEventListener('click', runFaultTolerant)
document.getElementById('clear').addEventListener('click', () => {
  logEl.innerHTML = ''
  resetStats()
})
