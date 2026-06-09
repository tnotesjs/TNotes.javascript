# [0240. screen对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0240.%20screen%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `screen` 对象是什么？](#3-screen-对象是什么)
- [4. `screen` 有哪些常见属性？](#4-screen-有哪些常见属性)
- [5. `screen` 和视口尺寸有什么区别？](#5-screen-和视口尺寸有什么区别)
- [6. `screen.orientation` 能做什么？](#6-screenorientation-能做什么)
- [7. 什么时候会用到 `screen`？](#7-什么时候会用到-screen)

<!-- endregion:toc -->

## 1. 本节内容

- `screen` 对象的定位
- 屏幕尺寸和可用区域
- 颜色深度和像素深度
- 屏幕方向
- `screen` 对象的使用边界

## 2. 评价

- `screen` 是 BOM 里存在感比较低的对象。它能告诉你显示器层面的信息，但真正做布局时，视口尺寸和 CSS 响应式能力通常更重要。

## 3. `screen` 对象是什么？

`screen` 是 `window` 的属性，用于描述浏览器窗口之外的客户端显示器信息。

```js
console.log(window.screen === screen) // true
```

它保存的是屏幕层面的信息，而不是页面视口信息。也就是说，`screen.width` 描述的是屏幕宽度，`window.innerWidth` 描述的是当前浏览器视口宽度。

## 4. `screen` 有哪些常见属性？

常见属性可以分成几类：

| 属性                        | 含义                     |
| --------------------------- | ------------------------ |
| `width`、`height`           | 屏幕像素宽度和高度       |
| `availWidth`、`availHeight` | 扣除系统组件后的可用宽高 |
| `availLeft`、`availTop`     | 可用区域左侧和顶部位置   |
| `colorDepth`                | 屏幕颜色位数             |
| `pixelDepth`                | 屏幕像素深度             |
| `orientation`               | 屏幕方向信息             |

```js
console.log(screen.width)
console.log(screen.height)
console.log(screen.availWidth)
console.log(screen.availHeight)
```

这些属性通常是只读信息，不能通过它们直接改变用户屏幕。

## 5. `screen` 和视口尺寸有什么区别？

`screen` 关注显示器，`window` 的视口属性关注当前页面可见区域。

```js
console.log(screen.width) // 屏幕宽度
console.log(window.innerWidth) // 当前视口宽度
```

在桌面端，浏览器窗口可能只占屏幕的一部分；在移动端，还可能受缩放、浏览器 UI、地址栏显示隐藏等因素影响。

因此，如果你要做页面布局，通常不应该优先用 `screen.width` 判断，而应该使用 CSS 媒体查询或视口相关属性。

## 6. `screen.orientation` 能做什么？

`screen.orientation` 可以返回屏幕方向相关信息，不同浏览器支持程度可能不同。

```js
if (screen.orientation) {
  console.log(screen.orientation.type)
  console.log(screen.orientation.angle)
}
```

这类信息在全屏应用、游戏、视频播放、横竖屏适配中可能有用。

不过实际项目中，很多横竖屏布局问题仍然更适合通过 CSS 媒体查询和响应式布局处理。

## 7. 什么时候会用到 `screen`？

`screen` 常见用途包括：

- 了解用户设备大致显示能力。
- 辅助统计屏幕尺寸分布。
- 判断可用屏幕区域。
- 与弹窗位置、全屏体验或多屏场景配合。

但它不是布局主工具。页面真正能用的空间取决于视口，而不是整块屏幕。

简单来说，`screen` 能告诉你用户屏幕长什么样；真正决定页面怎么摆的，通常还是视口、容器和 CSS。
