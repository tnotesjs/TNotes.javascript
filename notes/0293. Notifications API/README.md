# [0293. Notifications API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0293.%20Notifications%20API)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Notifications API 解决什么问题？](#3-notifications-api-解决什么问题)
- [4. 如何申请通知权限？](#4-如何申请通知权限)
- [5. 如何显示和关闭通知？](#5-如何显示和关闭通知)
- [6. 通知有哪些生命周期回调？](#6-通知有哪些生命周期回调)
- [7. Notifications API 和 Service Worker 有什么关系？](#7-notifications-api-和-service-worker-有什么关系)

<!-- endregion:toc -->

## 1. 本节内容

- Notifications API 的用途和权限模型
- `Notification.requestPermission()`
- 创建、关闭通知和通知选项
- 通知生命周期回调
- 与 Service Worker 通知的关系

## 2. 评价

- 通知 API 是典型的“能力越强，约束越多”的浏览器接口；它可以把消息带到页面之外，但前提是明确获得用户许可。

## 3. Notifications API 解决什么问题？

Notifications API 允许网页显示系统级通知。通知可以出现在浏览器窗口之外，用于提醒用户有新消息、任务完成、同步失败等。

这类能力会打扰用户，因此浏览器不会允许页面随便弹通知。使用前必须经过权限授权，而且现代浏览器通常要求在安全上下文中使用，并倾向于让权限请求由用户手势触发。

## 4. 如何申请通知权限？

可以通过 `Notification.permission` 查看当前权限状态：

| 值        | 含义               |
| --------- | ------------------ |
| `default` | 用户尚未决定。     |
| `granted` | 用户允许显示通知。 |
| `denied`  | 用户拒绝显示通知。 |

申请权限使用 `Notification.requestPermission()`。

```js
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  const permission = await Notification.requestPermission()

  return permission === 'granted'
}
```

不要在页面加载时立刻请求权限。更好的做法是在用户点击“开启通知”之类的按钮后再请求，这样用户更容易理解授权目的。

## 5. 如何显示和关闭通知？

获得授权后，可以使用 `Notification` 构造函数创建通知。

```js
async function showMessageNotification() {
  const allowed = await requestNotificationPermission()

  if (!allowed) return

  const notification = new Notification('新消息', {
    body: '你有一条未读消息。',
    icon: '/icons/message.png',
  })

  setTimeout(() => {
    notification.close()
  }, 5000)
}
```

常见选项包括：

| 选项    | 作用                                 |
| ------- | ------------------------------------ |
| `body`  | 通知正文。                           |
| `icon`  | 通知图标。                           |
| `image` | 通知图片。                           |
| `tag`   | 通知分组标识，相同标签可替换旧通知。 |
| `data`  | 附加数据。                           |

通知显示多久、样式如何，最终由浏览器和操作系统共同决定。

## 6. 通知有哪些生命周期回调？

通知对象支持几个常见事件：

| 事件    | 触发时机         |
| ------- | ---------------- |
| `show`  | 通知显示时。     |
| `click` | 用户点击通知时。 |
| `close` | 通知关闭时。     |
| `error` | 通知显示失败时。 |

```js
const notification = new Notification('构建完成', {
  body: '点击查看构建结果。',
})

notification.addEventListener('click', () => {
  window.focus()
})

notification.addEventListener('close', () => {
  console.log('通知已关闭')
})
```

生命周期回调适合做轻量交互，但不要把关键业务逻辑只放在通知回调里。用户可能关闭权限、系统可能合并通知，通知也可能根本没有成功显示。

## 7. Notifications API 和 Service Worker 有什么关系？

页面中的 `new Notification()` 只能在页面活动时直接创建通知。PWA 和后台推送更常通过 Service Worker 显示通知。

```js
const registration = await navigator.serviceWorker.ready

await registration.showNotification('同步完成', {
  body: '离线数据已经上传。',
})
```

Service Worker 通知更适合离线、后台推送和 PWA 场景。普通页面通知适合页面运行期间的即时提醒。

无论哪种方式，尊重用户授权和减少打扰都是第一原则。
