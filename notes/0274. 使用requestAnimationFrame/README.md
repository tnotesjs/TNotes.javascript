# [0274. 使用requestAnimationFrame](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0274.%20%E4%BD%BF%E7%94%A8requestAnimationFrame)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 早期 JavaScript 动画是怎么做的？](#3--早期-javascript-动画是怎么做的)
- [4. 🤔 为什么计时器不适合高质量动画？](#4--为什么计时器不适合高质量动画)
- [5. 🤔 `requestAnimationFrame()` 是怎么工作的？](#5--requestanimationframe-是怎么工作的)
- [6. 🤔 如何取消已经排队的动画帧？](#6--如何取消已经排队的动画帧)
- [7. 🤔 如何用 `requestAnimationFrame()` 做节流？](#7--如何用-requestanimationframe-做节流)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 早期定时动画的实现方式
- 计时器精度、任务队列和后台标签页限流
- `requestAnimationFrame()` 的调用时机和时间戳参数
- `cancelAnimationFrame()` 与动画停止
- 使用 `requestAnimationFrame()` 做 UI 更新节流

## 2. 🫧 评价

- `requestAnimationFrame()` 的价值不只是更顺滑的动画，它真正解决的是让视觉更新服从浏览器渲染节奏，这一点在任何高频 UI 场景里都很有用。

## 3. 🤔 早期 JavaScript 动画是怎么做的？

在 `requestAnimationFrame()` 出现之前，JavaScript 动画通常用 `setInterval()` 或递归的 `setTimeout()` 实现。基本思路是按固定时间间隔执行一个更新函数，在函数里修改元素样式或绘制画布。

```js
const timerId = setInterval(() => {
  updateProgressBar()
  updateSpritePosition()
}, 16)

function stopAnimation() {
  clearInterval(timerId)
}
```

如果屏幕刷新率是 60Hz，那么一秒大约会重绘 60 次，理想的帧间隔大约是 `1000 / 60`，也就是 `16.7ms`。所以很多早期动画会把间隔设为 `16ms` 或 `17ms`。

这个方案的问题是：计时器并不真正知道浏览器什么时候重绘。它只知道到了指定时间后，把回调加入任务队列。至于回调什么时候执行，还取决于主线程是否空闲、前面是否还有其他任务、页面是否在后台等因素。

## 4. 🤔 为什么计时器不适合高质量动画？

计时器用于动画主要有三个问题。

第一，延时参数不是执行时间保证。`setTimeout(callback, 16)` 的意思不是 16ms 后一定执行 `callback`，而是至少 16ms 后把它放入任务队列。主线程如果正在执行其他任务，回调就会延后。

第二，浏览器计时器存在精度差异。早期浏览器的计时器精度可能只有几毫秒到十几毫秒，对动画来说这个误差已经很明显。即便现代浏览器更精确，也仍然会受事件循环和系统调度影响。

第三，浏览器会限制后台页面的计时器。标签页切到后台后，计时器往往会被降频，这对省电和性能很好，但对依赖固定间隔的动画逻辑来说就不可靠。

所以，动画更好的做法不是猜浏览器什么时候要重绘，而是让浏览器在准备重绘前通知你。

## 5. 🤔 `requestAnimationFrame()` 是怎么工作的？

`requestAnimationFrame()` 接收一个回调函数，并请求浏览器在下一次重绘之前调用它。这个回调只会执行一次，如果你要持续动画，需要在回调内部再次调用 `requestAnimationFrame()`。

```js
const progress = document.querySelector('.progress')
let width = 0
let animationId = 0

function updateProgress() {
  width += 5
  progress.style.width = `${width}%`

  if (width < 100) {
    animationId = requestAnimationFrame(updateProgress)
  }
}

animationId = requestAnimationFrame(updateProgress)
```

这种写法有两个特点：

- 浏览器会把回调安排在适合重绘的时机。
- 动画循环由你自己决定是否继续。

回调函数还会收到一个高精度时间戳参数，它的语义接近 `performance.now()`，表示浏览器计划执行本次重绘的时间点。动画逻辑最好基于这个时间戳计算进度，而不是假设每一帧都是固定间隔。

```js
const box = document.querySelector('.box')
const duration = 600
let startTime = 0

function move(timestamp) {
  if (startTime === 0) {
    startTime = timestamp
  }

  const elapsed = timestamp - startTime
  const ratio = Math.min(elapsed / duration, 1)

  box.style.transform = `translateX(${ratio * 200}px)`

  if (ratio < 1) {
    requestAnimationFrame(move)
  }
}

requestAnimationFrame(move)
```

这样即使某一帧被延后，动画也会根据真实经过时间推进，而不是简单地每帧加固定距离。

## 6. 🤔 如何取消已经排队的动画帧？

`requestAnimationFrame()` 会返回一个请求 ID。你可以把这个 ID 传给 `cancelAnimationFrame()`，取消尚未执行的回调。

```js
const animationId = requestAnimationFrame(() => {
  console.log('下一次重绘前执行')
})

cancelAnimationFrame(animationId)
```

这和 `setTimeout()` / `clearTimeout()` 的配合很像。需要注意的是，它只能取消还在队列里的那次回调；如果回调已经开始执行，就需要在自己的动画状态里判断是否继续下一帧。

```js
let running = false
let animationId = 0

function tick() {
  if (!running) return

  updateScene()
  animationId = requestAnimationFrame(tick)
}

function start() {
  if (running) return

  running = true
  animationId = requestAnimationFrame(tick)
}

function stop() {
  running = false
  cancelAnimationFrame(animationId)
}
```

## 7. 🤔 如何用 `requestAnimationFrame()` 做节流？

`requestAnimationFrame()` 不只服务于动画。它也可以把高频事件中的视觉更新合并到下一次重绘前执行，例如滚动、拖拽、窗口尺寸变化等。

如果直接在 `scroll` 事件里执行昂贵操作，事件触发频率可能远高于浏览器实际重绘频率：

```js
window.addEventListener('scroll', () => {
  updateStickyHeader()
})
```

更好的做法是使用一个布尔标志，确保同一帧内最多只排队一次更新：

```js
let scheduled = false

function updateStickyHeader() {
  scheduled = false
  document.body.classList.toggle('is-scrolled', window.scrollY > 0)
}

window.addEventListener('scroll', () => {
  if (scheduled) return

  scheduled = true
  requestAnimationFrame(updateStickyHeader)
})
```

这种方式可以避免每个滚动事件都立即改 DOM。不过它还不是真正意义上按固定时间间隔节流，因为浏览器重绘本身仍然很频繁。如果你希望限制为每 `50ms` 最多执行一次，可以再配合计时器控制开关。

```js
let enabled = true

window.addEventListener('scroll', () => {
  if (!enabled) return

  enabled = false

  requestAnimationFrame(updateStickyHeader)
  setTimeout(() => {
    enabled = true
  }, 50)
})
```

简单来说：`requestAnimationFrame()` 负责把视觉更新放到合适的渲染阶段，计时器负责控制更新频率。两者配合起来，才是更稳定的高频 UI 更新策略。
