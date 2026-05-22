# [0154. 音频应用综合项目实战](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0154.%20%E9%9F%B3%E9%A2%91%E5%BA%94%E7%94%A8%E7%BB%BC%E5%90%88%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%88%98)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Media Session API 的核心作用是什么，它解决了什么用户体验问题？](#3--media-session-api-的核心作用是什么它解决了什么用户体验问题)
- [4. 🤔 如何通过 Media Session API 在系统通知栏显示当前播放的歌曲封面和信息？](#4--如何通过-media-session-api-在系统通知栏显示当前播放的歌曲封面和信息)
- [5. 🤔 setActionHandler 注册的回调函数在什么条件下会被系统触发？](#5--setactionhandler-注册的回调函数在什么条件下会被系统触发)
- [6. 🤔 seekto action handler 的 fastSeek 参数为 true 和 false 有什么区别？](#6--seekto-action-handler-的-fastseek-参数为-true-和-false-有什么区别)
- [7. 🤔 Media Session API 在桌面浏览器和移动端浏览器上的表现有什么差异？](#7--media-session-api-在桌面浏览器和移动端浏览器上的表现有什么差异)
- [8. 🤔 如何实现通知栏中上一曲 / 下一曲按钮与自定义播放列表的联动？](#8--如何实现通知栏中上一曲--下一曲按钮与自定义播放列表的联动)
- [9. 🤔 如果不使用 Media Session API，浏览器默认的媒体控制行为是怎样的？](#9--如果不使用-media-session-api浏览器默认的媒体控制行为是怎样的)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- navigator.mediaSession 接口
- MediaMetadata（title、artist、album、artwork）
- setActionHandler() 媒体动作注册
- 媒体动作类型（play、pause、previoustrack、nexttrack、seekto、seekbackward、seekforward）
- 系统通知栏 / 锁屏界面媒体控制
- 桌面浏览器与移动端浏览器差异
- MediaSession.playbackState 属性
- 与 HTMLMediaElement 的自动集成机制
- artwork 图片尺寸与格式要求

## 2. 🫧 评价

- todo

## 3. 🤔 Media Session API 的核心作用是什么，它解决了什么用户体验问题？

## 4. 🤔 如何通过 Media Session API 在系统通知栏显示当前播放的歌曲封面和信息？

## 5. 🤔 setActionHandler 注册的回调函数在什么条件下会被系统触发？

## 6. 🤔 seekto action handler 的 fastSeek 参数为 true 和 false 有什么区别？

## 7. 🤔 Media Session API 在桌面浏览器和移动端浏览器上的表现有什么差异？

## 8. 🤔 如何实现通知栏中上一曲 / 下一曲按钮与自定义播放列表的联动？

## 9. 🤔 如果不使用 Media Session API，浏览器默认的媒体控制行为是怎样的？
