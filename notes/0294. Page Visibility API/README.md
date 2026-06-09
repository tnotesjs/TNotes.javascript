# [0294. Page Visibility API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0294.%20Page%20Visibility%20API)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么需要页面可见性？](#3-为什么需要页面可见性)
- [4. `visibilityState` 有哪些状态？](#4-visibilitystate-有哪些状态)
- [5. 如何监听页面可见性变化？](#5-如何监听页面可见性变化)
- [6. 隐藏页面时应该暂停哪些任务？](#6-隐藏页面时应该暂停哪些任务)

<!-- endregion:toc -->

## 1. 本节内容

- 页面可见性的使用场景
- `document.visibilityState`
- `visibilitychange` 事件
- 页面隐藏时暂停任务
- `document.hidden` 的兼容意义

## 2. 评价

- Page Visibility API 很小，却非常实用；它让页面知道自己是否还被用户看着，从而少做无意义的工作。

## 3. 为什么需要页面可见性？

用户打开一个页面后，可能切换到其他标签页、最小化窗口或锁屏。此时页面仍然在运行，但用户并没有看到它。

如果页面继续播放视频、执行动画、轮询接口或做昂贵计算，就会浪费 CPU、电量和网络资源。Page Visibility API 让页面可以知道自己是否可见，从而暂停或恢复任务。

典型场景包括：

- 页面隐藏时暂停视频或动画。
- 页面隐藏时降低轮询频率。
- 页面重新可见时刷新数据。
- 统计用户实际可见时长。

## 4. `visibilityState` 有哪些状态？

主要通过 `document.visibilityState` 读取当前状态。

```js
console.log(document.visibilityState)
```

现代浏览器中最常用的状态是：

| 状态      | 含义               |
| --------- | ------------------ |
| `visible` | 页面至少部分可见。 |
| `hidden`  | 页面不可见。       |

历史规范和旧浏览器还出现过预渲染、预览等状态，但实际开发中通常围绕 `visible` 和 `hidden` 处理即可。

`document.hidden` 是一个布尔值兼容属性，页面不可见时为 `true`。

```js
if (document.hidden) {
  console.log('页面当前不可见')
}
```

## 5. 如何监听页面可见性变化？

监听页面可见性变化使用 `visibilitychange` 事件。

```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    pauseExpensiveWork()
  } else {
    resumeExpensiveWork()
  }
})
```

例如，页面隐藏时暂停视频：

```js
const video = document.querySelector('video')

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    video.pause()
  }
})
```

如果要在页面重新可见时恢复播放，需要确认是否是用户此前主动播放的，而不是强行自动播放。现代浏览器对自动播放有限制，恢复逻辑要尊重用户意图。

## 6. 隐藏页面时应该暂停哪些任务？

适合在页面隐藏时暂停或降频的任务包括：

- `setInterval()` 轮询。
- `requestAnimationFrame()` 驱动的视觉更新。
- 非必要的 WebSocket 心跳外处理。
- 音视频播放。
- 大量 DOM 更新或图表刷新。

```js
let pollingTimer = 0

function startPolling() {
  pollingTimer = window.setInterval(fetchLatestData, 10000)
}

function stopPolling() {
  window.clearInterval(pollingTimer)
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    stopPolling()
  } else {
    fetchLatestData()
    startPolling()
  }
})
```

很多浏览器本身也会对后台标签页限流，但主动处理可见性仍然更可靠，也更符合应用语义。
