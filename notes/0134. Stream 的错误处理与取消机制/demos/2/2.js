const logEl = document.getElementById('log')
const errorRateInput = document.getElementById('errorRate')
const maxRetriesInput = document.getElementById('maxRetries')
const retryDelayInput = document.getElementById('retryDelay')

let abortController = null
let stats = {
  success: 0,
  retrySuccess: 0,
  fail: 0,
  total: 0,
}

// 更新显示值
errorRateInput.addEventListener('input', (e) => {
  document.getElementById('errorRateValue').textContent = `${e.target.value}%`
})

maxRetriesInput.addEventListener('input', (e) => {
  document.getElementById('maxRetriesValue').textContent = e.target.value
})

retryDelayInput.addEventListener('input', (e) => {
  document.getElementById('retryDelayValue').textContent = e.target.value
})

function log(message, type = 'info') {
  const div = document.createElement('div')
  div.className = type
  div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
  logEl.appendChild(div)
  logEl.scrollTop = logEl.scrollHeight

  // 限制日志数量
  while (logEl.children.length > 100) {
    logEl.removeChild(logEl.firstChild)
  }
}

function updateChart() {
  const maxValue = Math.max(stats.total, 1)

  document.getElementById('successBar').style.width = `${
    (stats.success / maxValue) * 100
  }%`
  document.getElementById('successValue').textContent = stats.success

  document.getElementById('retryBar').style.width = `${
    (stats.retrySuccess / maxValue) * 100
  }%`
  document.getElementById('retryValue').textContent = stats.retrySuccess

  document.getElementById('failBar').style.width = `${
    (stats.fail / maxValue) * 100
  }%`
  document.getElementById('failValue').textContent = stats.fail

  document.getElementById('totalBar').style.width = '100%'
  document.getElementById('totalValue').textContent = stats.total
}

function resetStats() {
  stats = { success: 0, retrySuccess: 0, fail: 0, total: 0 }
  updateChart()
}

// 模拟可能失败的异步操作
async function unreliableOperation(errorRate) {
  await new Promise((resolve) => setTimeout(resolve, 50))

  if (Math.random() * 100 < errorRate) {
    throw new Error('操作失败')
  }

  return { id: stats.total, value: Math.random(), timestamp: Date.now() }
}

// 带重试的流
function createRetryableStream(errorRate, maxRetries, retryDelay) {
  return new ReadableStream({
    async pull(controller) {
      if (abortController?.signal.aborted) {
        controller.close()
        return
      }

      stats.total++
      let attempt = 0
      let lastError = null

      while (attempt < maxRetries) {
        try {
          const data = await unreliableOperation(errorRate)

          if (attempt === 0) {
            log(`✅ 项目 ${stats.total}: 一次成功`, 'success')
            stats.success++
          } else {
            log(`✅ 项目 ${stats.total}: 重试 ${attempt} 次后成功`, 'retry')
            stats.retrySuccess++
          }

          controller.enqueue(data)
          updateChart()
          return
        } catch (error) {
          attempt++
          lastError = error

          if (attempt < maxRetries) {
            log(
              `⚠️ 项目 ${stats.total}: 尝试 ${attempt}/${maxRetries} 失败，等待重试...`,
              'retry'
            )
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * attempt)
            )
          }
        }
      }

      // 所有重试都失败
      log(`❌ 项目 ${stats.total}: ${maxRetries} 次重试后仍然失败`, 'error')
      stats.fail++
      updateChart()

      // 继续处理下一项（不中断流）
      if (stats.total < 50) {
        return this.pull(controller)
      } else {
        controller.close()
      }
    },
  })
}

// 启动处理
async function startProcessing() {
  if (abortController) {
    log('⚠️ 已在运行中', 'retry')
    return
  }

  abortController = new AbortController()
  resetStats()
  logEl.innerHTML = ''

  const errorRate = parseInt(errorRateInput.value)
  const maxRetries = parseInt(maxRetriesInput.value)
  const retryDelay = parseInt(retryDelayInput.value)

  log(
    `开始处理：错误率 ${errorRate}%，最大重试 ${maxRetries} 次，延迟 ${retryDelay}ms`
  )

  const stream = createRetryableStream(errorRate, maxRetries, retryDelay)

  try {
    await stream.pipeTo(
      new WritableStream({
        write(chunk) {
          // 处理成功的数据
        },
        close() {
          log('=== 流处理完成 ===', 'success')
          log(
            `总计: ${stats.total} | 成功: ${stats.success} | 重试成功: ${stats.retrySuccess} | 失败: ${stats.fail}`
          )

          const successRate = (
            ((stats.success + stats.retrySuccess) / stats.total) *
            100
          ).toFixed(1)
          log(`成功率: ${successRate}%`, 'success')
        },
      }),
      { signal: abortController.signal }
    )
  } catch (error) {
    if (error.name === 'AbortError') {
      log('处理被用户停止', 'retry')
    } else {
      log(`错误: ${error.message}`, 'error')
    }
  } finally {
    abortController = null
  }
}

// 停止处理
function stopProcessing() {
  if (abortController) {
    log('停止处理...', 'retry')
    abortController.abort('用户停止')
    abortController = null
  }
}

// 事件监听
document.getElementById('start').addEventListener('click', startProcessing)
document.getElementById('stop').addEventListener('click', stopProcessing)
