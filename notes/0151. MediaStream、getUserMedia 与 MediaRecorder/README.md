# [0151. MediaStream、getUserMedia 与 MediaRecorder](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0151.%20MediaStream%E3%80%81getUserMedia%20%E4%B8%8E%20MediaRecorder)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 getUserMedia 请求麦克风权限时，如何设置只获取音频而不获取视频？](#3--getusermedia-请求麦克风权限时如何设置只获取音频而不获取视频)
- [4. 🤔 echoCancellation、noiseSuppression、autoGainControl 这三个约束分别有什么作用？](#4--echocancellationnoisesuppressionautogaincontrol-这三个约束分别有什么作用)
- [5. 🤔 如何将 getUserMedia 获取的麦克风流接入 Web Audio API 音频图中进行实时处理？](#5--如何将-getusermedia-获取的麦克风流接入-web-audio-api-音频图中进行实时处理)
- [6. 🤔 MediaRecorder 的 mimeType 应如何指定，不同浏览器支持的编码格式有哪些差异？](#6--mediarecorder-的-mimetype-应如何指定不同浏览器支持的编码格式有哪些差异)
- [7. 🤔 如何在录制过程中同时获取音频数据用于实时可视化？](#7--如何在录制过程中同时获取音频数据用于实时可视化)
- [8. 🤔 MediaRecorder 的 timeslice 参数有什么作用，适用于什么场景？](#8--mediarecorder-的-timeslice-参数有什么作用适用于什么场景)
- [9. 🤔 如何实现录音的暂停与恢复，并最终导出为可下载的音频文件？](#9--如何实现录音的暂停与恢复并最终导出为可下载的音频文件)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- navigator.mediaDevices.getUserMedia() 用法
- constraints 约束对象配置
- audio 约束（sampleRate、channelCount、echoCancellation、noiseSuppression、autoGainControl）
- MediaStream 与 MediaStreamTrack
- getAudioTracks() 音频轨道
- createMediaStreamSource() 接入音频图
- MediaRecorder 构造函数与 mimeType
- start()、stop()、pause()、resume() 录制控制
- ondataavailable 事件与 Blob 数据收集
- URL.createObjectURL() 音频导出与下载
- timeslice 参数与分片录制

## 2. 🫧 评价

- todo

## 3. 🤔 getUserMedia 请求麦克风权限时，如何设置只获取音频而不获取视频？

## 4. 🤔 echoCancellation、noiseSuppression、autoGainControl 这三个约束分别有什么作用？

## 5. 🤔 如何将 getUserMedia 获取的麦克风流接入 Web Audio API 音频图中进行实时处理？

## 6. 🤔 MediaRecorder 的 mimeType 应如何指定，不同浏览器支持的编码格式有哪些差异？

## 7. 🤔 如何在录制过程中同时获取音频数据用于实时可视化？

## 8. 🤔 MediaRecorder 的 timeslice 参数有什么作用，适用于什么场景？

## 9. 🤔 如何实现录音的暂停与恢复，并最终导出为可下载的音频文件？
