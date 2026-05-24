# [0321. Beacon API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0321.%20Beacon%20API)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么需要 Beacon API？](#3--为什么需要-beacon-api)
- [4. 🤔 `sendBeacon()` 如何使用？](#4--sendbeacon-如何使用)
- [5. 🤔 什么时候发送信标更合适？](#5--什么时候发送信标更合适)
- [6. 🤔 Beacon 请求有哪些限制？](#6--beacon-请求有哪些限制)
- [7. 🤔 Beacon 和 `fetch keepalive` 怎么取舍？](#7--beacon-和-fetch-keepalive-怎么取舍)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Beacon API 的使用场景
- `navigator.sendBeacon()`
- 页面卸载时普通异步请求的问题
- 信标请求的限制
- 与 `fetch(..., { keepalive: true })` 的关系

## 2. 🫧 评价

- Beacon API 很小，但解决的问题很具体：页面快要离开时，别为了上报数据卡住用户，也别让请求轻易被取消。

## 3. 🤔 为什么需要 Beacon API？

分析、埋点和遥测系统经常希望在页面生命周期末尾发送最后一批数据。例如用户停留时长、点击路径、实验分组、错误摘要等。

问题是，页面即将卸载时，普通异步请求很可能被浏览器取消。过去有人用同步 XHR 强制发送，但同步请求会阻塞页面跳转，影响用户体验。

Beacon API 的目标就是：让浏览器在不阻塞页面卸载的情况下，尽量可靠地把少量数据发送给服务器。

## 4. 🤔 `sendBeacon()` 如何使用？

`navigator.sendBeacon(url, data)` 会发送一个 POST 请求。

```js
const data = JSON.stringify({
  page: location.href,
  duration: 1200,
})

const queued = navigator.sendBeacon('/analytics', data)

console.log(queued)
```

返回值是布尔值，表示请求是否成功进入浏览器的发送队列。它不表示服务器已经收到，也不表示响应状态成功。

`data` 可以是字符串、`Blob`、`ArrayBufferView`、`FormData` 等类型。

## 5. 🤔 什么时候发送信标更合适？

早期常见做法是在 `unload` 事件中发送。但现代浏览器中，更推荐结合 `visibilitychange` 或 `pagehide`。

```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const data = JSON.stringify({
      page: location.href,
      hiddenAt: Date.now(),
    })

    navigator.sendBeacon('/analytics', data)
  }
})
```

`visibilitychange` 能覆盖更多页面进入后台的场景，也更适合移动端浏览器的生命周期模型。

## 6. 🤔 Beacon 请求有哪些限制？

Beacon API 不是通用请求替代品。它的限制包括：

- 只能发送 POST 请求。
- 不能自定义完整请求流程。
- 不能读取响应体。
- 不能可靠获知状态码。
- 失败原因对脚本不可见。
- 适合小型数据，不适合大文件或关键业务提交。

信标请求会携带调用时相关的 Cookie，因此服务端仍然要正确处理身份、权限和 CSRF 风险。

## 7. 🤔 Beacon 和 `fetch keepalive` 怎么取舍？

现代 Fetch 也支持 `keepalive`。

```js
fetch('/analytics', {
  method: 'POST',
  body: JSON.stringify({ page: location.href }),
  keepalive: true,
})
```

`keepalive` 的目标和 Beacon 类似：允许请求在页面生命周期结束后继续发送。它比 `sendBeacon()` 更像普通 Fetch，但同样有生命周期和数据大小限制。

简单选择：

- 只需要发送遥测，不关心响应，优先 `sendBeacon()`。
- 需要更接近 Fetch 的配置方式，可以考虑 `keepalive`。
- 关键业务提交不要依赖页面卸载阶段的上报，应在用户操作当下完成。
