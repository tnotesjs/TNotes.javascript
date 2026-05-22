# [0153. Speech Synthesis 与 Speech Recognition](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0153.%20Speech%20Synthesis%20%E4%B8%8E%20Speech%20Recognition)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 SpeechSynthesisUtterance 的 rate 和 pitch 属性的取值范围和默认值分别是什么？](#3--speechsynthesisutterance-的-rate-和-pitch-属性的取值范围和默认值分别是什么)
- [4. 🤔 getVoices() 返回空数组的常见原因是什么，如何等待语音列表加载完成？](#4--getvoices-返回空数组的常见原因是什么如何等待语音列表加载完成)
- [5. 🤔 如何实现一段长文本的分段朗读并追踪每段的朗读进度？](#5--如何实现一段长文本的分段朗读并追踪每段的朗读进度)
- [6. 🤔 SpeechRecognition 的 interimResults 设为 true 和 false 有什么行为差异？](#6--speechrecognition-的-interimresults-设为-true-和-false-有什么行为差异)
- [7. 🤔 如何处理语音识别的 continuous 模式以实现持续监听？](#7--如何处理语音识别的-continuous-模式以实现持续监听)
- [8. 🤔 语音识别结果中的 confidence 值代表什么，通常多高才算可靠？](#8--语音识别结果中的-confidence-值代表什么通常多高才算可靠)
- [9. 🤔 在移动端浏览器上使用 Speech API 有哪些需要注意的限制和兼容性问题？](#9--在移动端浏览器上使用-speech-api-有哪些需要注意的限制和兼容性问题)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- SpeechSynthesis 接口与 window.speechSynthesis
- SpeechSynthesisUtterance 对象
- text、lang、rate、pitch、volume 属性
- getVoices() 可用语音列表
- speak()、cancel()、pause()、resume() 控制
- voiceschanged 事件
- SpeechRecognition（webkitSpeechRecognition）
- continuous、interimResults、lang 配置
- onresult、onerror、onend 事件
- 识别结果 transcript 与 confidence
- 浏览器兼容性限制

## 2. 🫧 评价

- todo

## 3. 🤔 SpeechSynthesisUtterance 的 rate 和 pitch 属性的取值范围和默认值分别是什么？

## 4. 🤔 getVoices() 返回空数组的常见原因是什么，如何等待语音列表加载完成？

## 5. 🤔 如何实现一段长文本的分段朗读并追踪每段的朗读进度？

## 6. 🤔 SpeechRecognition 的 interimResults 设为 true 和 false 有什么行为差异？

## 7. 🤔 如何处理语音识别的 continuous 模式以实现持续监听？

## 8. 🤔 语音识别结果中的 confidence 值代表什么，通常多高才算可靠？

## 9. 🤔 在移动端浏览器上使用 Speech API 有哪些需要注意的限制和兼容性问题？
