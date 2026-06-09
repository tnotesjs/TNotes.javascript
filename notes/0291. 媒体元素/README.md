# [0291. 媒体元素](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0291.%20%E5%AA%92%E4%BD%93%E5%85%83%E7%B4%A0)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 媒体元素解决了什么问题？](#3-媒体元素解决了什么问题)
- [4. 媒体元素有哪些常用属性？](#4-媒体元素有哪些常用属性)
- [5. 媒体播放有哪些常用事件？](#5-媒体播放有哪些常用事件)
- [6. 如何实现自定义媒体播放器？](#6-如何实现自定义媒体播放器)
- [7. 如何检测浏览器能否播放某种格式？](#7-如何检测浏览器能否播放某种格式)
- [8. `Audio` 构造函数适合什么场景？](#8-audio-构造函数适合什么场景)

<!-- endregion:toc -->

## 1. 本节内容

- `audio` 和 `video` 元素的定位
- 媒体元素的常用属性和事件
- `play()`、`pause()` 与自定义播放器
- `canPlayType()` 编解码器检测
- `Audio` 构造函数和自动播放限制

## 2. 评价

- 媒体元素把音视频从插件时代带回了浏览器原生能力，但现代使用时要特别注意自动播放策略、格式兼容和异步播放失败。

## 3. 媒体元素解决了什么问题？

HTML5 之前，网页播放音频和视频经常依赖插件。`audio` 和 `video` 元素让浏览器原生支持媒体嵌入、播放控制和状态事件。

```html
<video id="movie" controls width="480">
  <source src="movie.webm" type="video/webm" />
  <source src="movie.mp4" type="video/mp4" />
  当前浏览器不支持 video 元素。
</video>
```

多个 `source` 可以为不同浏览器提供不同格式。浏览器会选择自己能够播放的资源。

媒体元素既可以使用浏览器默认控制条，也可以隐藏默认控制条后用 JavaScript 自己实现播放器界面。

## 4. 媒体元素有哪些常用属性？

音频和视频元素共享很多属性。

| 属性           | 作用                          |
| -------------- | ----------------------------- |
| `currentTime`  | 当前播放位置，单位是秒。      |
| `duration`     | 媒体总时长，单位是秒。        |
| `paused`       | 是否暂停。                    |
| `ended`        | 是否播放结束。                |
| `muted`        | 是否静音。                    |
| `volume`       | 音量，范围通常是 `0` 到 `1`。 |
| `playbackRate` | 播放速度。                    |
| `readyState`   | 当前可播放状态。              |
| `buffered`     | 已缓冲的时间范围。            |

```js
const video = document.getElementById('movie')

console.log(video.duration)
console.log(video.currentTime)

video.volume = 0.5
video.muted = false
```

很多属性会随着媒体加载和播放持续变化，因此通常要配合事件使用。

## 5. 媒体播放有哪些常用事件？

常见媒体事件包括：

| 事件             | 触发时机                               |
| ---------------- | -------------------------------------- |
| `loadedmetadata` | 元数据加载完成，可以读取时长、尺寸等。 |
| `canplay`        | 浏览器可以开始播放。                   |
| `canplaythrough` | 浏览器估计可以顺利播放到结束。         |
| `play`           | 开始播放。                             |
| `pause`          | 暂停。                                 |
| `timeupdate`     | 播放位置更新。                         |
| `ended`          | 播放结束。                             |
| `volumechange`   | 音量或静音状态改变。                   |

```js
const video = document.getElementById('movie')
const progress = document.querySelector('.progress')

video.addEventListener('loadedmetadata', () => {
  console.log(video.duration)
})

video.addEventListener('timeupdate', () => {
  progress.value = video.currentTime / video.duration
})
```

`timeupdate` 适合更新进度条，但它不是高频动画事件。如果需要非常细腻的渲染，可以结合 `requestAnimationFrame()` 做 UI 更新。

## 6. 如何实现自定义媒体播放器？

自定义播放器通常围绕 `play()`、`pause()`、`currentTime`、`volume` 等属性和方法实现。

```js
const video = document.getElementById('movie')
const playButton = document.querySelector('.play')

playButton.addEventListener('click', async () => {
  if (video.paused) {
    await video.play()
    playButton.textContent = '暂停'
  } else {
    video.pause()
    playButton.textContent = '播放'
  }
})
```

现代浏览器中，`play()` 通常返回 `Promise`。如果没有用户手势、页面策略不允许或资源加载失败，`play()` 可能被拒绝。

```js
try {
  await video.play()
} catch (error) {
  console.warn('播放失败', error)
}
```

这也是今天写媒体代码时很重要的现代差异：不能假设调用 `play()` 一定会立即成功。

## 7. 如何检测浏览器能否播放某种格式？

`canPlayType()` 可以检测媒体元素是否可能播放某种 MIME 类型或编解码器组合。

```js
const audio = document.createElement('audio')

console.log(audio.canPlayType('audio/ogg; codecs="vorbis"'))
console.log(audio.canPlayType('audio/mpeg'))
```

返回值通常是：

| 返回值     | 含义                 |
| ---------- | -------------------- |
| `probably` | 浏览器很可能能播放。 |
| `maybe`    | 浏览器可能能播放。   |
| 空字符串   | 浏览器认为不能播放。 |

实际项目中，通常还是提供多个 `source`，把最终选择交给浏览器。

## 8. `Audio` 构造函数适合什么场景？

`Audio` 构造函数可以创建音频对象，而不必先把元素写进页面。

```js
const notificationSound = new Audio('/sounds/notice.mp3')

async function playNotice() {
  try {
    await notificationSound.play()
  } catch (error) {
    console.warn('音频播放被浏览器阻止')
  }
}
```

这适合短音效、提示音或无需展示控制条的音频。但它同样受自动播放策略影响。用户未与页面交互前，浏览器可能阻止播放。

媒体元素本质上是带状态机的 DOM 元素。写媒体相关逻辑时，最好围绕状态和事件组织，而不是只靠一次性命令。
