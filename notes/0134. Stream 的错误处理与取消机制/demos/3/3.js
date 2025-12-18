const logEl = document.getElementById('log')

let currentStream = null
let currentReader = null

function log(message, type = 'info') {
  const div = document.createElement('div')
  div.className = `log-entry ${type}`
  div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
  logEl.appendChild(div)
  logEl.scrollTop = logEl.scrollHeight
}

function updateResourceStatus(resource, status, info = {}) {
  const card = document.getElementById(`${resource}Card`)
  const statusEl = document.getElementById(`${resource}Status`)
  const infoEl = document.getElementById(`${resource}Info`)

  card.className = `resource-card ${status}`
  statusEl.className = `resource-status ${
    status === 'active' ? 'active' : 'inactive'
  }`
  statusEl.textContent = {
    active: '✅ 激活',
    cleaning: '🔄 清理中',
    cleaned: '✔️ 已清理',
    inactive: '❌ 未激活',
  }[status]

  if (info.text) {
    infoEl.textContent = info.text
  }
}

// 模拟 WebSocket
class MockWebSocket {
  constructor() {
    this.readyState = 0 // CONNECTING
    this.listeners = new Map()

    setTimeout(() => {
      this.readyState = 1 // OPEN
      log('WebSocket 连接已建立', 'success')
      updateResourceStatus('ws', 'active', { text: '连接状态: open' })
    }, 100)
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(handler)
  }

  removeEventListener(event, handler) {
    const handlers = this.listeners.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  close() {
    this.readyState = 3 // CLOSED
    log('WebSocket 连接已关闭', 'warning')
    updateResourceStatus('ws', 'cleaned', { text: '连接状态: closed' })
  }

  send(data) {
    if (this.readyState === 1) {
      log(`WebSocket 发送: ${data}`)
    }
  }
}

// 创建带资源管理的流
function createManagedStream() {
  const resources = {
    timers: [],
    listeners: [],
    ws: null,
    cache: new Map(),
    buffer: null,
    itemCount: 0,
  }

  return new ReadableStream({
    start(controller) {
      log('=== 初始化资源 ===', 'info')

      // 定时器
      const interval = setInterval(() => {
        resources.itemCount++
        controller.enqueue({ id: resources.itemCount, timestamp: Date.now() })
        updateResourceStatus('stream', 'active', {
          text: `数据项: ${resources.itemCount}`,
        })
      }, 500)

      resources.timers.push(interval)
      updateResourceStatus('timer', 'active', {
        text: `定时器 ID: ${interval}`,
      })
      log('✅ 定时器已创建', 'success')

      // 事件监听器
      const resizeHandler = () => log('窗口大小改变')
      const clickHandler = () => log('页面点击')

      window.addEventListener('resize', resizeHandler)
      window.addEventListener('click', clickHandler)

      resources.listeners.push({ event: 'resize', handler: resizeHandler })
      resources.listeners.push({ event: 'click', handler: clickHandler })

      updateResourceStatus('listener', 'active', {
        text: `监听器数: ${resources.listeners.length}`,
      })
      log('✅ 事件监听器已注册', 'success')

      // WebSocket
      resources.ws = new MockWebSocket()
      log('✅ WebSocket 正在连接...', 'info')

      // 缓存
      for (let i = 0; i < 100; i++) {
        resources.cache.set(`key_${i}`, { data: Math.random() })
      }
      updateResourceStatus('cache', 'active', {
        text: `缓存项: ${resources.cache.size}`,
      })
      log('✅ 缓存已初始化', 'success')

      // 内存缓冲区
      resources.buffer = new ArrayBuffer(1024 * 1024) // 1MB
      updateResourceStatus('buffer', 'active', { text: '大小: 1024 KB' })
      log('✅ 内存缓冲区已分配', 'success')

      updateResourceStatus('stream', 'active', { text: '数据项: 0' })

      // 存储到 controller 以便 cancel 访问
      controller.resources = resources
    },

    pull(controller) {
      // 数据由定时器推送
    },

    cancel(reason) {
      log(`=== 开始清理资源（原因: ${reason}）===`, 'warning')

      const resources = this.resources

      // 清理定时器
      updateResourceStatus('timer', 'cleaning')
      resources.timers.forEach((timer) => {
        clearInterval(timer)
        log('🧹 定时器已清除', 'warning')
      })
      resources.timers = []
      updateResourceStatus('timer', 'cleaned', { text: '定时器 ID: -' })

      // 清理事件监听器
      updateResourceStatus('listener', 'cleaning')
      resources.listeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler)
        log(`🧹 事件监听器已移除: ${event}`, 'warning')
      })
      resources.listeners = []
      updateResourceStatus('listener', 'cleaned', { text: '监听器数: 0' })

      // 关闭 WebSocket
      if (resources.ws) {
        updateResourceStatus('ws', 'cleaning')
        resources.ws.close()
        resources.ws = null
      }

      // 清空缓存
      updateResourceStatus('cache', 'cleaning')
      const cacheSize = resources.cache.size
      resources.cache.clear()
      log(`🧹 缓存已清空（${cacheSize} 项）`, 'warning')
      updateResourceStatus('cache', 'cleaned', { text: '缓存项: 0' })

      // 释放内存缓冲区
      updateResourceStatus('buffer', 'cleaning')
      resources.buffer = null
      log('🧹 内存缓冲区已释放', 'warning')
      updateResourceStatus('buffer', 'cleaned', { text: '大小: 0 KB' })

      updateResourceStatus('stream', 'cleaned', {
        text: `最终数据项: ${resources.itemCount}`,
      })

      log('✅ 所有资源已清理完成', 'success')
    },
  })
}

// 启动流
async function startStream() {
  if (currentReader) {
    log('⚠️ 流已在运行中', 'warning')
    return
  }

  logEl.innerHTML = ''
  log('启动流...', 'info')

  currentStream = createManagedStream()
  currentReader = currentStream.getReader()

  // 读取数据
  ;(async () => {
    try {
      while (true) {
        const { done, value } = await currentReader.read()
        if (done) {
          log('流正常结束', 'success')
          break
        }
        // 处理数据
      }
    } catch (error) {
      log(`读取错误: ${error.message}`, 'error')
    } finally {
      currentReader = null
      currentStream = null
    }
  })()
}

// 正常取消
async function cancelNormal() {
  if (!currentReader) {
    log('⚠️ 没有活动的流', 'warning')
    return
  }

  log('用户请求取消...', 'info')
  await currentReader.cancel('user-cancel')
  currentReader = null
  currentStream = null
}

// 错误取消
async function cancelError() {
  if (!currentReader) {
    log('⚠️ 没有活动的流', 'warning')
    return
  }

  log('模拟错误取消...', 'error')
  await currentReader.cancel(new Error('模拟错误'))
  currentReader = null
  currentStream = null
}

// 检查内存
function checkMemory() {
  if (performance.memory) {
    const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
    const limit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)

    log(`内存使用: ${used} MB / ${total} MB (限制: ${limit} MB)`, 'info')
  } else {
    log('⚠️ 浏览器不支持 performance.memory', 'warning')
  }
}

// 事件监听
document.getElementById('startStream').addEventListener('click', startStream)
document.getElementById('cancelNormal').addEventListener('click', cancelNormal)
document.getElementById('cancelError').addEventListener('click', cancelError)
document.getElementById('checkMemory').addEventListener('click', checkMemory)
