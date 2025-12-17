// Service Worker 中的流分叉示例
// 将 fetch 响应同时发送给浏览器和缓存

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const response = await fetch(event.request)

      // 分流 - 将响应流分成两个副本
      const [responseForBrowser, responseForCache] = response.body.tee()

      // 副本1：发送给浏览器
      const browserResponse = new Response(responseForBrowser, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      })

      // 副本2：存入缓存
      const cache = await caches.open('my-cache')
      await cache.put(
        event.request,
        new Response(responseForCache, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        })
      )

      return browserResponse
    })()
  )
})
