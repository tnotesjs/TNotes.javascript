// ----------------------------------------
// 🤔 可以采用分块拷贝流数据的方案吗？
// ----------------------------------------

// 可以
// 但是这么做还不如直接使用分流器 tee()

// ⚠️ 方案3. 手动分块读取并分发
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const response = await fetch(event.request)
      const reader = response.body.getReader()

      // 创建两个流来接收数据
      let browserController, cacheController

      const browserStream = new ReadableStream({
        start(controller) {
          browserController = controller
        },
      })

      const cacheStream = new ReadableStream({
        start(controller) {
          cacheController = controller
        },
      })

      // 后台任务：读取数据并分发到两个流
      ;(async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              browserController.close()
              cacheController.close()
              break
            }

            // 关键：需要拷贝数据，因为同一个 Uint8Array 不能被两个流共享
            // 否则可能出现竞态条件
            const browserChunk = new Uint8Array(value)
            const cacheChunk = new Uint8Array(value)

            browserController.enqueue(browserChunk)
            cacheController.enqueue(cacheChunk)
          }
        } catch (error) {
          browserController.error(error)
          cacheController.error(error)
        }
      })()

      // 发送给浏览器
      const browserResponse = new Response(browserStream, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      })

      // 存入缓存
      const cache = await caches.open('my-cache')
      await cache.put(
        event.request,
        new Response(cacheStream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
      )

      return browserResponse
    })()
  )
})
