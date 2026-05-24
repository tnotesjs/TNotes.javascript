# [0246. 软件与硬件检测](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0246.%20%E8%BD%AF%E4%BB%B6%E4%B8%8E%E7%A1%AC%E4%BB%B6%E6%A3%80%E6%B5%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 软件与硬件检测主要从哪里获取信息？](#3--软件与硬件检测主要从哪里获取信息)
- [4. 🤔 如何识别浏览器和操作系统信息？](#4--如何识别浏览器和操作系统信息)
- [5. 🤔 `screen` 能提供哪些显示信息？](#5--screen-能提供哪些显示信息)
- [6. 🤔 Geolocation API 能做什么？](#6--geolocation-api-能做什么)
- [7. 🤔 定位请求可以配置吗？](#7--定位请求可以配置吗)
- [8. 🤔 如何检测网络连接状态？](#8--如何检测网络连接状态)
- [9. 🤔 Battery Status API 还能用吗？](#9--battery-status-api-还能用吗)
- [10. 🤔 浏览器能暴露哪些硬件信息？](#10--浏览器能暴露哪些硬件信息)
- [11. 🤔 使用软件硬件信息 API 时要注意什么？](#11--使用软件硬件信息-api-时要注意什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `navigator` 和 `screen` 暴露的环境信息
- 浏览器与操作系统识别
- `oscpu`、`vendor`、`platform`
- 屏幕颜色深度和屏幕方向
- Geolocation API
- 网络连接状态和 Network Information API
- Battery Status API
- 处理器核心数、设备内存和最大触点数
- 使用环境信息 API 的注意点

## 2. 🫧 评价

- 软件与硬件检测能拿到的信息很多，但你要始终记得它们是在权限、隐私和浏览器支持的夹缝里工作的。使用前先检测，使用后也别把结果当成绝对事实。

## 3. 🤔 软件与硬件检测主要从哪里获取信息？

现代浏览器会通过 `navigator` 和 `screen` 暴露一部分软件、硬件和设备状态信息。

```js
console.log(navigator.platform)
console.log(screen.colorDepth)
```

这些信息可能包括：

- 浏览器厂商和平台。
- 操作系统或系统架构。
- 屏幕颜色深度和屏幕方向。
- 地理位置。
- 网络连接状态。
- 电池状态。
- 逻辑处理器数量、设备内存、触摸点数量。

但这些 API 的支持程度并不一致，而且很多信息会受到权限、安全上下文和隐私策略影响。使用前必须先检测 API 是否存在。

## 4. 🤔 如何识别浏览器和操作系统信息？

`navigator.oscpu` 通常表示操作系统或系统架构信息。

```js
console.log(navigator.oscpu)
```

但并非所有浏览器都支持它。

`navigator.vendor` 通常表示浏览器厂商。

```js
console.log(navigator.vendor)
```

`navigator.platform` 通常表示浏览器所在平台。

```js
console.log(navigator.platform)
```

这些属性都只能作为参考。现代浏览器为了降低指纹识别风险，可能会冻结、泛化或弱化这类信息。

## 5. 🤔 `screen` 能提供哪些显示信息？

`screen.colorDepth` 和 `screen.pixelDepth` 表示屏幕每像素颜色位深。

```js
console.log(screen.colorDepth)
console.log(screen.pixelDepth)
```

`screen.orientation` 可以提供屏幕方向信息。

```js
if (screen.orientation) {
  console.log(screen.orientation.type)
  console.log(screen.orientation.angle)
}
```

常见方向类型包括：

- `portrait-primary`
- `portrait-secondary`
- `landscape-primary`
- `landscape-secondary`

这些信息适合辅助判断设备状态，但布局适配仍然应该优先交给 CSS 媒体查询和响应式方案。

## 6. 🤔 Geolocation API 能做什么？

`navigator.geolocation` 暴露地理定位能力，可以请求当前设备位置。

```js
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => console.log(position.coords),
    (error) => console.error(error),
  )
}
```

它通常只在安全上下文中可用，也就是 HTTPS 页面或本地开发环境。浏览器会向用户请求授权，用户拒绝时会进入错误回调。

定位结果里常见信息包括：

| 属性                      | 含义               |
| ------------------------- | ------------------ |
| `coords.latitude`         | 纬度               |
| `coords.longitude`        | 经度               |
| `coords.accuracy`         | 精度，单位通常是米 |
| `coords.altitude`         | 海拔，可能为空     |
| `coords.altitudeAccuracy` | 海拔精度，可能为空 |
| `coords.heading`          | 移动方向，可能为空 |
| `coords.speed`            | 移动速度，可能为空 |
| `timestamp`               | 定位时间戳         |

失败时的错误码通常包括：

- `PERMISSION_DENIED`：用户拒绝或当前环境不允许定位。
- `POSITION_UNAVAILABLE`：无法获得位置信息。
- `TIMEOUT`：超时。

## 7. 🤔 定位请求可以配置吗？

`getCurrentPosition()` 的第三个参数可以传入配置对象。

```js
navigator.geolocation.getCurrentPosition(console.log, console.error, {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
})
```

`enableHighAccuracy` 表示是否尽量获取高精度位置。高精度可能调用 GPS，通常更耗时、耗电。

`timeout` 表示超时时间。

`maximumAge` 表示可接受的缓存位置最大年龄。设置为 `0` 表示尽量不要使用缓存，设置为 `Infinity` 则表示可以直接使用缓存。

定位属于高敏感能力，实际项目中要明确告诉用户为什么需要位置，并做好拒绝授权后的降级体验。

## 8. 🤔 如何检测网络连接状态？

浏览器通过 `navigator.onLine` 暴露联网状态，并在 `window` 上触发 `online` 和 `offline` 事件。

```js
function handleConnectionChange() {
  console.log(navigator.onLine)
}

window.addEventListener('online', handleConnectionChange)
window.addEventListener('offline', handleConnectionChange)
```

这个值只表示浏览器或系统认为当前是否在线，不一定能证明真实互联网可用。

部分浏览器还支持 Network Information API，可以通过 `navigator.connection` 读取连接信息。

```js
if ('connection' in navigator) {
  console.log(navigator.connection.effectiveType)
  console.log(navigator.connection.saveData)
}
```

常见信息包括下行带宽估计、往返时间、有效网络类型、连接技术和省流量模式。这个 API 支持度有限，使用前必须检测。

## 9. 🤔 Battery Status API 还能用吗？

书中介绍了 `navigator.getBattery()`，它会返回一个期约，解决为 `BatteryManager` 对象。

```js
if ('getBattery' in navigator) {
  navigator.getBattery().then((battery) => {
    console.log(battery.charging)
    console.log(battery.level)
  })
}
```

`BatteryManager` 中常见属性包括：

- `charging`：是否正在充电。
- `chargingTime`：距离充满还有多少秒。
- `dischargingTime`：距离耗尽还有多少秒。
- `level`：电量比例。

它还可以监听 `chargingchange`、`levelchange` 等事件。

不过，电池信息可能带来隐私和指纹识别风险，现代浏览器对这个 API 的支持并不稳定。实际使用时必须做能力检测和降级处理。

## 10. 🤔 浏览器能暴露哪些硬件信息？

浏览器能直接暴露的硬件信息很有限，常见属性包括：

| 属性                            | 含义                       |
| ------------------------------- | -------------------------- |
| `navigator.hardwareConcurrency` | 浏览器可用的逻辑处理器数量 |
| `navigator.deviceMemory`        | 设备内存的大致 GB 数       |
| `navigator.maxTouchPoints`      | 触摸屏支持的最大触点数量   |

```js
console.log(navigator.hardwareConcurrency)
console.log(navigator.deviceMemory)
console.log(navigator.maxTouchPoints)
```

这些值通常是粗略信息，不一定等于真实硬件参数。例如 `hardwareConcurrency` 更接近浏览器愿意暴露给页面的并行能力，而不一定是真实 CPU 核心数。

## 11. 🤔 使用软件硬件信息 API 时要注意什么？

这类 API 的共同特点是：信息有用，但边界很多。

使用时建议遵循几条规则：

- 先检测 API 是否存在。
- 不把结果当作绝对真实值。
- 不用这些信息做不必要的用户识别。
- 对权限拒绝、API 不支持、返回空值做好降级。
- 能用能力检测解决的问题，不要改成设备检测。

这些 API 更适合作为优化和体验增强，例如网络较慢时减少资源加载、设备内存较低时降低效果复杂度、触摸点存在时优化交互方式。

它们不适合作为核心功能是否可用的唯一判断依据。
