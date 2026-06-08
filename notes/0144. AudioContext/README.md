# [0144. AudioContext](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0144.%20AudioContext)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 🤔 AudioContext 是什么，它在 Web Audio API 中扮演什么角色？](#3--audiocontext-是什么它在-web-audio-api-中扮演什么角色)
- [4. 🤔 如何创建一个 AudioContext，构造函数接受哪些参数？](#4--如何创建一个-audiocontext构造函数接受哪些参数)
- [5. 🤔 AudioContext 的 state 有哪几种状态，分别在什么情况下切换？](#5--audiocontext-的-state-有哪几种状态分别在什么情况下切换)
- [6. 🤔 为什么浏览器会阻止 AudioContext 自动运行，如何解决自动播放策略（autoplay policy）的问题？](#6--为什么浏览器会阻止-audiocontext-自动运行如何解决自动播放策略autoplay-policy的问题)
- [7. 🤔 AudioContext 的 currentTime 是什么，它是如何推进的，能否手动修改？](#7--audiocontext-的-currenttime-是什么它是如何推进的能否手动修改)
- [8. 🤔 AudioNode 之间是如何连接的，connect() 和 disconnect() 的用法是什么？](#8--audionode-之间是如何连接的connect-和-disconnect-的用法是什么)
- [9. 🤔 什么是音频处理图（Audio Graph），一个典型的节点拓扑结构长什么样？](#9--什么是音频处理图audio-graph一个典型的节点拓扑结构长什么样)
- [10. 🤔 如何使用 OscillatorNode 创建不同波形（sine、square、sawtooth、triangle）的声音？](#10--如何使用-oscillatornode-创建不同波形sinesquaresawtoothtriangle的声音)
- [11. 🤔 如何使用 AudioBuffer 和 AudioBufferSourceNode 播放一段已有的音频数据？](#11--如何使用-audiobuffer-和-audiobuffersourcenode-播放一段已有的音频数据)
- [12. 🤔 如何通过 fetch 获取音频文件并用 decodeAudioData 解码成 AudioBuffer？](#12--如何通过-fetch-获取音频文件并用-decodeaudiodata-解码成-audiobuffer)
- [13. 🤔 GainNode 是什么，如何用它控制音量和实现淡入淡出效果？](#13--gainnode-是什么如何用它控制音量和实现淡入淡出效果)
- [14. 🤔 BiquadFilterNode 有哪些滤波器类型（lowpass、highpass、bandpass 等），各自什么效果？](#14--biquadfilternode-有哪些滤波器类型lowpasshighpassbandpass-等各自什么效果)
- [15. 🤔 AnalyserNode 的 fftSize、frequencyBinCount 是什么关系，如何获取频域和时域数据？](#15--analysernode-的-fftsizefrequencybincount-是什么关系如何获取频域和时域数据)
- [16. 🤔 getByteFrequencyData 和 getFloatFrequencyData 有什么区别，分别适合什么场景？](#16--getbytefrequencydata-和-getfloatfrequencydata-有什么区别分别适合什么场景)
- [17. 🤔 如何用 AnalyserNode + Canvas 实现一个基础的音频频谱可视化？](#17--如何用-analysernode--canvas-实现一个基础的音频频谱可视化)
- [18. 🤔 如何实现波形（oscilloscope）可视化和频谱柱状图（bar chart）可视化？](#18--如何实现波形oscilloscope可视化和频谱柱状图bar-chart可视化)
- [19. 🤔 DelayNode 如何使用，怎样实现回声（echo）效果？](#19--delaynode-如何使用怎样实现回声echo效果)
- [20. 🤔 ConvolverNode 是什么，如何用它实现混响（reverb）效果？](#20--convolvernode-是什么如何用它实现混响reverb效果)
- [21. 🤔 DynamicsCompressorNode 的作用是什么，各个参数（threshold、knee、ratio 等）怎么调？](#21--dynamicscompressornode-的作用是什么各个参数thresholdkneeratio-等怎么调)
- [22. 🤔 StereoPannerNode 和 PannerNode 有什么区别，如何实现立体声或 3D 空间音效？](#22--stereopannernode-和-pannernode-有什么区别如何实现立体声或-3d-空间音效)
- [23. 🤔 ChannelMergerNode 和 ChannelSplitterNode 的用途是什么？](#23--channelmergernode-和-channelsplitternode-的用途是什么)
- [24. 🤔 WaveShaperNode 是什么，如何用它实现失真（distortion）效果？](#24--waveshapernode-是什么如何用它实现失真distortion效果)
- [25. 🤔 如何用 OscillatorNode + GainNode + LFO 模拟颤音（vibrato）和震音（tremolo）效果？](#25--如何用-oscillatornode--gainnode--lfo-模拟颤音vibrato和震音tremolo效果)
- [26. 🤔 如何通过修改 AudioParam 的 value 实现参数自动化（automation），setValueAtTime、linearRampToValueAtTime 等方法怎么用？](#26--如何通过修改-audioparam-的-value-实现参数自动化automationsetvalueattimelinearramptovalueattime-等方法怎么用)
- [27. 🤔 AudioParam 的 cancelScheduledValues 和 cancelAndHoldAtTime 如何使用？](#27--audioparam-的-cancelscheduledvalues-和-cancelandholdattime-如何使用)
- [28. 🤔 如何使用 ConstantSourceNode 作为参数调制源？](#28--如何使用-constantsourcenode-作为参数调制源)
- [29. 🤔 MediaElementAudioSourceNode 如何将 `<audio>` 元素接入音频图？](#29--mediaelementaudiosourcenode-如何将-audio-元素接入音频图)
- [30. 🤔 MediaStreamAudioSourceNode 如何将麦克风输入接入音频图？](#30--mediastreamaudiosourcenode-如何将麦克风输入接入音频图)
- [31. 🤔 MediaStreamAudioDestinationNode 的用途是什么，如何将音频图的输出录制下来？](#31--mediastreamaudiodestinationnode-的用途是什么如何将音频图的输出录制下来)
- [32. 🤔 MediaRecorder API 如何与 AudioContext 配合实现录音功能？](#32--mediarecorder-api-如何与-audiocontext-配合实现录音功能)
- [33. 🤔 AudioWorklet 是什么，它和已废弃的 ScriptProcessorNode 有什么区别？](#33--audioworklet-是什么它和已废弃的-scriptprocessornode-有什么区别)
- [34. 🤔 如何编写一个自定义 AudioWorkletProcessor，在独立线程中处理音频？](#34--如何编写一个自定义-audioworkletprocessor在独立线程中处理音频)
- [35. 🤔 AudioWorklet 中的 MessagePort 通信机制怎么用？](#35--audioworklet-中的-messageport-通信机制怎么用)
- [36. 🤔 多个 AudioContext 之间有什么限制，一个页面建议创建几个？](#36--多个-audiocontext-之间有什么限制一个页面建议创建几个)
- [37. 🤔 如何正确释放 AudioContext 资源，close() 之后还能重新创建吗？](#37--如何正确释放-audiocontext-资源close-之后还能重新创建吗)
- [38. 🤔 iOS Safari 上 AudioContext 有哪些已知的坑和兼容性问题？](#38--ios-safari-上-audiocontext-有哪些已知的坑和兼容性问题)
- [39. 🤔 AudioContext 的 sampleRate 对音质和性能有什么影响？](#39--audiocontext-的-samplerate-对音质和性能有什么影响)
- [40. 🤔 如何用 AudioContext 实现一个简单的合成器（synthesizer），支持键盘弹奏？](#40--如何用-audiocontext-实现一个简单的合成器synthesizer支持键盘弹奏)
- [41. 🤔 如何用 AudioContext 实现节拍器（metronome），做到精确的定时调度？](#41--如何用-audiocontext-实现节拍器metronome做到精确的定时调度)
- [42. 🤔 如何实现音频的变速不变调（time stretch）或变调不变速（pitch shift）？](#42--如何实现音频的变速不变调time-stretch或变调不变速pitch-shift)
- [43. 🤔 如何用 Web Audio API 生成 DTMF 拨号音？](#43--如何用-web-audio-api-生成-dtmf-拨号音)
- [44. 🤔 如何实现音频的实时降噪处理？](#44--如何实现音频的实时降噪处理)
- [45. 🤔 AudioContext 和 Web Workers 之间如何协作，offscreen audio processing 该怎么做？](#45--audiocontext-和-web-workers-之间如何协作offscreen-audio-processing-该怎么做)
- [46. 🤔 有哪些第三方库对 AudioContext 做了封装（如 Tone.js、Howler.js），各自的适用场景是什么？](#46--有哪些第三方库对-audiocontext-做了封装如-tonejshowlerjs各自的适用场景是什么)
- [47. 🤔 如何对音频可视化做性能优化，避免 requestAnimationFrame 掉帧？](#47--如何对音频可视化做性能优化避免-requestanimationframe-掉帧)
- [48. 引用](#48-引用)

<!-- endregion:toc -->

## 1. 本节内容

- todo

## 2. 评价

- todo

## 3. 🤔 AudioContext 是什么，它在 Web Audio API 中扮演什么角色？

## 4. 🤔 如何创建一个 AudioContext，构造函数接受哪些参数？

## 5. 🤔 AudioContext 的 state 有哪几种状态，分别在什么情况下切换？

## 6. 🤔 为什么浏览器会阻止 AudioContext 自动运行，如何解决自动播放策略（autoplay policy）的问题？

## 7. 🤔 AudioContext 的 currentTime 是什么，它是如何推进的，能否手动修改？

## 8. 🤔 AudioNode 之间是如何连接的，connect() 和 disconnect() 的用法是什么？

## 9. 🤔 什么是音频处理图（Audio Graph），一个典型的节点拓扑结构长什么样？

## 10. 🤔 如何使用 OscillatorNode 创建不同波形（sine、square、sawtooth、triangle）的声音？

## 11. 🤔 如何使用 AudioBuffer 和 AudioBufferSourceNode 播放一段已有的音频数据？

## 12. 🤔 如何通过 fetch 获取音频文件并用 decodeAudioData 解码成 AudioBuffer？

## 13. 🤔 GainNode 是什么，如何用它控制音量和实现淡入淡出效果？

## 14. 🤔 BiquadFilterNode 有哪些滤波器类型（lowpass、highpass、bandpass 等），各自什么效果？

## 15. 🤔 AnalyserNode 的 fftSize、frequencyBinCount 是什么关系，如何获取频域和时域数据？

## 16. 🤔 getByteFrequencyData 和 getFloatFrequencyData 有什么区别，分别适合什么场景？

## 17. 🤔 如何用 AnalyserNode + Canvas 实现一个基础的音频频谱可视化？

## 18. 🤔 如何实现波形（oscilloscope）可视化和频谱柱状图（bar chart）可视化？

## 19. 🤔 DelayNode 如何使用，怎样实现回声（echo）效果？

## 20. 🤔 ConvolverNode 是什么，如何用它实现混响（reverb）效果？

## 21. 🤔 DynamicsCompressorNode 的作用是什么，各个参数（threshold、knee、ratio 等）怎么调？

## 22. 🤔 StereoPannerNode 和 PannerNode 有什么区别，如何实现立体声或 3D 空间音效？

## 23. 🤔 ChannelMergerNode 和 ChannelSplitterNode 的用途是什么？

## 24. 🤔 WaveShaperNode 是什么，如何用它实现失真（distortion）效果？

## 25. 🤔 如何用 OscillatorNode + GainNode + LFO 模拟颤音（vibrato）和震音（tremolo）效果？

## 26. 🤔 如何通过修改 AudioParam 的 value 实现参数自动化（automation），setValueAtTime、linearRampToValueAtTime 等方法怎么用？

## 27. 🤔 AudioParam 的 cancelScheduledValues 和 cancelAndHoldAtTime 如何使用？

## 28. 🤔 如何使用 ConstantSourceNode 作为参数调制源？

## 29. 🤔 MediaElementAudioSourceNode 如何将 `<audio>` 元素接入音频图？

## 30. 🤔 MediaStreamAudioSourceNode 如何将麦克风输入接入音频图？

## 31. 🤔 MediaStreamAudioDestinationNode 的用途是什么，如何将音频图的输出录制下来？

## 32. 🤔 MediaRecorder API 如何与 AudioContext 配合实现录音功能？

## 33. 🤔 AudioWorklet 是什么，它和已废弃的 ScriptProcessorNode 有什么区别？

## 34. 🤔 如何编写一个自定义 AudioWorkletProcessor，在独立线程中处理音频？

## 35. 🤔 AudioWorklet 中的 MessagePort 通信机制怎么用？

## 36. 🤔 多个 AudioContext 之间有什么限制，一个页面建议创建几个？

## 37. 🤔 如何正确释放 AudioContext 资源，close() 之后还能重新创建吗？

## 38. 🤔 iOS Safari 上 AudioContext 有哪些已知的坑和兼容性问题？

## 39. 🤔 AudioContext 的 sampleRate 对音质和性能有什么影响？

## 40. 🤔 如何用 AudioContext 实现一个简单的合成器（synthesizer），支持键盘弹奏？

## 41. 🤔 如何用 AudioContext 实现节拍器（metronome），做到精确的定时调度？

## 42. 🤔 如何实现音频的变速不变调（time stretch）或变调不变速（pitch shift）？

## 43. 🤔 如何用 Web Audio API 生成 DTMF 拨号音？

## 44. 🤔 如何实现音频的实时降噪处理？

## 45. 🤔 AudioContext 和 Web Workers 之间如何协作，offscreen audio processing 该怎么做？

## 46. 🤔 有哪些第三方库对 AudioContext 做了封装（如 Tone.js、Howler.js），各自的适用场景是什么？

## 47. 🤔 如何对音频可视化做性能优化，避免 requestAnimationFrame 掉帧？

## 48. 引用

- [MDN AudioContext][1]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
