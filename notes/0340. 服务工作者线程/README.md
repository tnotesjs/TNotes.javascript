# [0340. 服务工作者线程](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0340.%20%E6%9C%8D%E5%8A%A1%E5%B7%A5%E4%BD%9C%E8%80%85%E7%BA%BF%E7%A8%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 服务工作者线程是什么？](#3--服务工作者线程是什么)
- [4. 🤔 如何注册服务工作者线程？](#4--如何注册服务工作者线程)
- [5. 🤔 服务工作者线程相关对象怎么分工？](#5--服务工作者线程相关对象怎么分工)
- [6. 🤔 服务工作者线程有什么安全限制？](#6--服务工作者线程有什么安全限制)
- [7. 🤔 服务工作者线程的作用域怎么理解？](#7--服务工作者线程的作用域怎么理解)
- [8. 🤔 `ServiceWorkerGlobalScope` 有哪些能力？](#8--serviceworkerglobalscope-有哪些能力)
- [9. 🤔 服务工作者线程缓存和普通 HTTP 缓存有什么不同？](#9--服务工作者线程缓存和普通-http-缓存有什么不同)
- [10. 🤔 服务工作者线程如何跟客户端交互？](#10--服务工作者线程如何跟客户端交互)
- [11. 🤔 为什么服务工作者线程特别强调一致性？](#11--为什么服务工作者线程特别强调一致性)
- [12. 🤔 服务工作者线程生命周期有哪些状态？](#12--服务工作者线程生命周期有哪些状态)
- [13. 🤔 如何强制服务工作者线程尽快接管页面？](#13--如何强制服务工作者线程尽快接管页面)
- [14. 🤔 如何管理服务脚本更新缓存？](#14--如何管理服务脚本更新缓存)
- [15. 🤔 如何拦截 `fetch` 请求？](#15--如何拦截-fetch-请求)
- [16. 🤔 服务工作者线程如何支持推送通知？](#16--服务工作者线程如何支持推送通知)
- [17. 🤔 使用服务工作者线程时要避免哪些误区？](#17--使用服务工作者线程时要避免哪些误区)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 服务工作者线程的定位
- `ServiceWorkerContainer`、`ServiceWorkerRegistration` 和 `ServiceWorker`
- 安全限制与作用域
- `ServiceWorkerGlobalScope` 和事件模型
- CacheStorage 与 Cache
- 客户端、版本一致性和生命周期
- 请求拦截、消息通信和推送通知

## 2. 🫧 评价

- 服务工作者线程最不像普通 Worker：它更像浏览器给网页配的可编程网络层，能力很强，但生命周期和缓存一致性也最容易让人踩坑。

## 3. 🤔 服务工作者线程是什么？

服务工作者线程是运行在浏览器后台的特殊 Worker。它最重要的能力是拦截页面发出的网络请求，并决定返回网络响应、缓存响应还是动态构造的响应。

你可以把它理解成浏览器里的可编程代理层。

服务工作者线程常用于：

- 离线缓存。
- 请求拦截和响应改写。
- PWA 离线体验。
- 推送通知。
- 后台同步。
- 多页面共享的网络策略。

它和专用 Worker、共享 Worker 一样运行在独立环境中，不能直接访问 DOM，只能通过消息和客户端通信。但它的生命周期由浏览器管理，不应该依赖长期存在的全局状态。

## 4. 🤔 如何注册服务工作者线程？

服务工作者线程没有 `new ServiceWorker()` 这样的全局构造函数。它通过 `navigator.serviceWorker` 管理。

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}
```

`register()` 返回一个期约，成功时解决为 `ServiceWorkerRegistration` 对象，失败时拒绝。

```js
navigator.serviceWorker
  .register('/service-worker.js')
  .then((registration) => {
    console.log(registration.scope)
  })
  .catch((error) => {
    console.error(error)
  })
```

通常会等页面 `load` 后再注册，避免注册和首屏资源加载抢占网络。但如果服务工作者线程负责尽早接管缓存策略，也可以更早注册。

## 5. 🤔 服务工作者线程相关对象怎么分工？

服务工作者线程生态中有三个常见对象。

| 对象 | 所在位置 | 作用 |
| --- | --- | --- |
| `ServiceWorkerContainer` | 页面中的 `navigator.serviceWorker` | 顶层管理入口，用于注册、查询注册、接收消息。 |
| `ServiceWorkerRegistration` | `register()` 的结果 | 表示某次注册，管理作用域、安装中/等待中/活动的 Worker。 |
| `ServiceWorker` | 具体工作者线程实例 | 表示某个服务工作者线程，可查看脚本 URL、状态并发送消息。 |

`ServiceWorkerContainer` 常见属性和方法：

| 成员 | 说明 |
| --- | --- |
| `controller` | 当前页面正在被哪个活动服务工作者线程控制，没有则为 `null`。 |
| `ready` | 当前页面拥有活动服务工作者线程后解决的期约。 |
| `register()` | 注册或更新服务工作者线程。 |
| `getRegistration()` | 获取匹配作用域的注册对象。 |
| `getRegistrations()` | 获取相关注册对象列表。 |
| `startMessages()` | 开始传送服务工作者线程发给客户端的消息。 |

`ServiceWorkerRegistration` 常见状态属性：

| 属性         | 说明                                 |
| ------------ | ------------------------------------ |
| `installing` | 正在安装的新服务工作者线程。         |
| `waiting`    | 安装完成、等待激活的服务工作者线程。 |
| `active`     | 正在激活或已经激活的服务工作者线程。 |

`ServiceWorker` 本身继承自 `Worker`，但没有 `terminate()`。它的生命周期由浏览器控制。

## 6. 🤔 服务工作者线程有什么安全限制？

服务工作者线程可以拦截和改写网络请求，能力非常敏感，因此只能在安全上下文中使用。

常见限制包括：

- 页面通常必须通过 HTTPS 加载。
- 本地开发中的 `localhost` 和 `127.0.0.1` 通常被视为安全上下文。
- 服务脚本必须遵守同源限制。
- 服务工作者线程只能控制其作用域内的客户端和请求。

可以用 `window.isSecureContext` 判断当前页面是否处于安全上下文。

```js
console.log(window.isSecureContext)
```

## 7. 🤔 服务工作者线程的作用域怎么理解？

服务工作者线程只能拦截其作用域内的请求。默认作用域由服务脚本所在路径决定。

```js
navigator.serviceWorker.register('/service-worker.js')
```

如果服务脚本位于根目录，默认作用域通常是整个站点根路径。

```js
navigator.serviceWorker.register('/app/service-worker.js')
```

如果服务脚本位于 `/app/` 下，默认作用域通常是 `/app/`。

也可以通过 `scope` 指定更小的范围。

```js
navigator.serviceWorker.register('/service-worker.js', {
  scope: '/docs/',
})
```

作用域遵循目录权限模型。一般情况下，脚本只能控制自己所在路径及其子路径，不能随意扩大到上级目录。若确实要扩展作用域，需要服务端通过 `Service-Worker-Allowed` 响应头授权。

## 8. 🤔 `ServiceWorkerGlobalScope` 有哪些能力？

服务工作者线程内部的全局对象是 `ServiceWorkerGlobalScope`，同样通过 `self` 访问。

常见成员包括：

| 成员            | 说明                                     |
| --------------- | ---------------------------------------- |
| `caches`        | 访问 `CacheStorage`，管理缓存。          |
| `clients`       | 访问和操作受控客户端。                   |
| `registration`  | 当前服务工作者线程的注册对象。           |
| `skipWaiting()` | 强制等待中的服务工作者线程进入激活流程。 |
| `fetch()`       | 从服务工作者线程内发起网络请求。         |

服务工作者线程主要通过事件工作。常见事件包括：

| 事件                | 用途                           |
| ------------------- | ------------------------------ |
| `install`           | 安装时触发，常用于预缓存资源。 |
| `activate`          | 激活时触发，常用于清理旧缓存。 |
| `fetch`             | 拦截作用域内的网络请求。       |
| `message`           | 接收页面或其他客户端消息。     |
| `push`              | 接收服务器推送消息。           |
| `notificationclick` | 用户点击通知时触发。           |
| `notificationclose` | 用户关闭通知时触发。           |

这些事件让服务工作者线程更像事件驱动的后台代理，而不是一直运行的后台脚本。

## 9. 🤔 服务工作者线程缓存和普通 HTTP 缓存有什么不同？

服务工作者线程缓存通过 Cache API 管理。它和 HTTP 缓存不同：

- 不会自动缓存任何请求，必须显式写入。
- 没有自动过期时间，除非你主动删除。
- 缓存版本需要手动维护。
- 更新和删除策略由服务工作者线程代码决定。
- 浏览器只会在存储压力下按策略逐出内容。

缓存模型可以看成两层字典：

- `CacheStorage`：顶层字典，通过 `caches` 访问，键是缓存名。
- `Cache`：具体缓存对象，键是请求，值是响应。

```js
const CACHE_KEY = 'v1'

self.oninstall = (event) => {
  event.waitUntil(
    caches.open(CACHE_KEY).then((cache) => {
      return cache.addAll(['/index.html', '/styles.css', '/main.js'])
    }),
  )
}
```

`CacheStorage` 常用方法：

| 方法             | 说明                   |
| ---------------- | ---------------------- |
| `open(name)`     | 打开或创建指定缓存。   |
| `has(name)`      | 判断缓存是否存在。     |
| `delete(name)`   | 删除指定缓存。         |
| `keys()`         | 获取缓存名列表。       |
| `match(request)` | 在所有缓存中查找响应。 |

`Cache` 常用方法：

| 方法                     | 说明                 |
| ------------------------ | -------------------- |
| `put(request, response)` | 写入请求和响应。     |
| `add(request)`           | 请求资源并缓存响应。 |
| `addAll(requests)`       | 批量请求并缓存响应。 |
| `match(request)`         | 查找单个响应。       |
| `matchAll(request)`      | 查找多个响应。       |
| `delete(request)`        | 删除指定缓存项。     |
| `keys()`                 | 获取缓存中的请求键。 |

Cache API 主要适合缓存 GET 请求。涉及用户数据变更的 POST、PUT、DELETE 等请求，不应该简单缓存。

## 10. 🤔 服务工作者线程如何跟客户端交互？

服务工作者线程通过 `Client` 和 `Clients` 接口跟页面、Worker 或共享 Worker 这样的客户端交互。

`Client` 常见成员：

| 成员            | 说明                                                  |
| --------------- | ----------------------------------------------------- |
| `id`            | 客户端唯一标识。                                      |
| `type`          | 客户端类型，例如 `window`、`worker`、`sharedworker`。 |
| `url`           | 客户端 URL。                                          |
| `postMessage()` | 向客户端发送消息。                                    |

`Clients` 常见方法：

| 方法                | 说明                                         |
| ------------------- | -------------------------------------------- |
| `get(id)`           | 获取指定客户端。                             |
| `matchAll(options)` | 获取匹配的客户端列表。                       |
| `openWindow(url)`   | 打开新窗口。                                 |
| `claim()`           | 让当前服务工作者线程立即控制作用域内客户端。 |

页面可以给活动服务工作者线程发消息。

```js
navigator.serviceWorker.ready.then((registration) => {
  registration.active.postMessage({ type: 'ping' })
})
```

服务工作者线程可以通过消息事件的 `source` 回应客户端。

```js
self.onmessage = (event) => {
  event.source.postMessage({ type: 'pong' })
}
```

## 11. 🤔 为什么服务工作者线程特别强调一致性？

服务工作者线程的目标之一，是让网页表现得更像原生应用。原生应用通常以一个完整版本运行，而网页由 HTML、CSS、JavaScript、图片、JSON 等大量资源组成。

如果两个打开的页面分别使用不同版本的资源，就可能出现不可预测的问题。例如：

- 页面 A 使用旧版 JavaScript。
- 页面 B 使用新版缓存资源。
- 两个页面同时写入同一个 IndexedDB，但数据结构不一致。

服务工作者线程通过谨慎的生命周期设计避免这种不一致：

- 安装失败就不会接管页面。
- 新版本安装后通常会等待旧版本控制的页面全部关闭。
- 活动的服务工作者线程会继续粘住已有客户端。
- 新版本不会因为一次普通刷新就一定立刻替换旧版本。

这种保守策略会让调试看起来有点反直觉，但它是在保护资源和数据版本的一致性。

## 12. 🤔 服务工作者线程生命周期有哪些状态？

Service Worker 规范定义了多个状态。常见流程如下：

| 状态 | 说明 |
| --- | --- |
| `parsed` | 脚本已解析，规范状态，但 `ServiceWorker.state` 通常不会返回它。 |
| `installing` | 正在安装，适合预缓存资源。 |
| `installed` | 已安装，也称等待中，等待激活机会。 |
| `activating` | 正在激活，适合清理旧缓存。 |
| `activated` | 已激活，可以处理 `fetch`、`push` 等事件。 |
| `redundant` | 已失效，不再接收事件。 |

安装阶段通常用 `waitUntil()` 延长生命周期，直到预缓存完成。

```js
const CACHE_KEY = 'v1'

self.oninstall = (event) => {
  event.waitUntil(
    caches.open(CACHE_KEY).then((cache) => {
      return cache.addAll(['/index.html', '/main.js'])
    }),
  )
}
```

激活阶段常用于删除旧缓存。

```js
const CACHE_KEY = 'v2'

self.onactivate = (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_KEY)
          .map((key) => caches.delete(key)),
      )
    }),
  )
}
```

如果安装或激活过程中传给 `waitUntil()` 的期约拒绝，服务工作者线程可能进入失效状态。

## 13. 🤔 如何强制服务工作者线程尽快接管页面？

默认生命周期为了保证一致性，会让新服务工作者线程等待旧客户端关闭。但有时你希望新版本尽快生效，可以配合使用 `skipWaiting()` 和 `clients.claim()`。

```js
const CACHE_KEY = 'v1'

self.oninstall = (event) => {
  event.waitUntil(
    caches
      .open(CACHE_KEY)
      .then((cache) => cache.addAll(['/index.html', '/main.js']))
      .then(() => self.skipWaiting()),
  )
}

self.onactivate = (event) => {
  event.waitUntil(self.clients.claim())
}
```

这样做可以让新服务工作者线程更快进入活动状态并控制客户端，但也可能带来资源版本不一致。因此只有在你明确知道缓存和页面版本可以承受这种切换时才适合使用。

## 14. 🤔 如何管理服务脚本更新缓存？

浏览器会对服务脚本执行更新检查，例如：

- 调用 `register()` 时。
- 导航到服务工作者线程作用域内页面时。
- 某些功能性事件触发且一段时间内没有检查更新时。

如果新服务脚本和当前脚本不同，浏览器会开始安装新版本。

服务脚本本身也会受到 HTTP 缓存影响。为了尽快传播更新，常见做法是在服务端给服务脚本设置较短缓存，例如 `Cache-Control: max-age=0`。

注册时还可以使用 `updateViaCache` 控制浏览器如何对待服务脚本及其 `importScripts()` 依赖。

```js
navigator.serviceWorker.register('/service-worker.js', {
  updateViaCache: 'none',
})
```

常见取值：

| 值        | 说明                                                   |
| --------- | ------------------------------------------------------ |
| `imports` | 默认值，顶级服务脚本不走 HTTP 缓存，导入脚本可走缓存。 |
| `all`     | 顶级服务脚本和导入脚本都按 HTTP 缓存处理。             |
| `none`    | 顶级服务脚本和导入脚本都不走 HTTP 缓存。               |

也可以通过 `registration.update()` 主动触发更新检查。

```js
navigator.serviceWorker.register('/service-worker.js').then((registration) => {
  setInterval(() => registration.update(), 1000 * 60 * 30)
})
```

## 15. 🤔 如何拦截 `fetch` 请求？

服务工作者线程最关键的能力是监听 `fetch` 事件，并通过 `respondWith()` 决定响应。

直接走网络：

```js
self.onfetch = (event) => {
  event.respondWith(fetch(event.request))
}
```

直接走缓存：

```js
self.onfetch = (event) => {
  event.respondWith(caches.match(event.request))
}
```

网络优先，缓存兜底：

```js
self.onfetch = (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  )
}
```

缓存优先，网络兜底：

```js
self.onfetch = (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
}
```

缓存和网络都失败时返回通用后备页面：

```js
self.onfetch = (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('/fallback.html')),
  )
}
```

不同策略适合不同资源。HTML 页面、接口数据、静态资源、图片和字体通常不应该一刀切使用同一种缓存策略。

## 16. 🤔 服务工作者线程如何支持推送通知？

服务工作者线程可以在页面不处于前台时接收推送事件，并显示系统通知。这是 PWA 模拟原生应用体验的重要能力。

完整推送通知通常涉及几步：

1. 请求通知权限。
2. 通过 `PushManager` 订阅推送。
3. 服务端保存订阅信息并发送推送。
4. 服务工作者线程处理 `push` 事件。
5. 用户点击通知时处理 `notificationclick`。

请求权限并订阅：

```js
navigator.serviceWorker.register('/service-worker.js').then((registration) => {
  return Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      return registration.pushManager.subscribe({
        applicationServerKey: key,
        userVisibleOnly: true,
      })
    }
  })
})
```

服务工作者线程中处理推送并显示通知：

```js
self.onpush = (event) => {
  const text = event.data?.text() || '你有一条新消息'

  event.waitUntil(self.registration.showNotification(text))
}
```

处理通知点击：

```js
self.onnotificationclick = (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow('/'))
}
```

`push` 事件继承自 `ExtendableEvent`，所以要把显示通知的期约传给 `waitUntil()`，让浏览器保持服务工作者线程存活直到操作完成。

## 17. 🤔 使用服务工作者线程时要避免哪些误区？

服务工作者线程能力强，但也有几个常见误区。

- 不要依赖全局变量长期保存状态，浏览器可能随时终止并重新启动服务工作者线程。
- 不要忘记版本化缓存，否则旧资源会长期残留。
- 不要在不了解后果时滥用 `skipWaiting()` 和 `clients.claim()`。
- 不要把所有请求都用同一种缓存策略处理。
- 调试时要注意强制刷新、DevTools 设置和服务工作者线程缓存都会影响结果。
- 更新服务脚本时，要同时考虑 HTTP 缓存头和 `updateViaCache`。

简单来说，服务工作者线程的核心不是把代码放到后台，而是把网络请求、缓存和页面版本一致性纳入可编程控制。
