# [0153. Speech Synthesis 与 Speech Recognition](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0153.%20Speech%20Synthesis%20%E4%B8%8E%20Speech%20Recognition)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 🤔 SpeechSynthesisUtterance 的 rate 和 pitch 属性的取值范围和默认值分别是什么？](#3--speechsynthesisutterance-的-rate-和-pitch-属性的取值范围和默认值分别是什么)
- [4. 🤔 getVoices() 返回空数组的常见原因是什么，如何等待语音列表加载完成？](#4--getvoices-返回空数组的常见原因是什么如何等待语音列表加载完成)
- [5. 🤔 如何实现一段长文本的分段朗读并追踪每段的朗读进度？](#5--如何实现一段长文本的分段朗读并追踪每段的朗读进度)
- [6. 🤔 SpeechRecognition 的 interimResults 设为 true 和 false 有什么行为差异？](#6--speechrecognition-的-interimresults-设为-true-和-false-有什么行为差异)
- [7. 🤔 如何处理语音识别的 continuous 模式以实现持续监听？](#7--如何处理语音识别的-continuous-模式以实现持续监听)
- [8. 🤔 语音识别结果中的 confidence 值代表什么，通常多高才算可靠？](#8--语音识别结果中的-confidence-值代表什么通常多高才算可靠)
- [9. 🤔 在移动端浏览器上使用 Speech API 有哪些需要注意的限制和兼容性问题？](#9--在移动端浏览器上使用-speech-api-有哪些需要注意的限制和兼容性问题)

<!-- endregion:toc -->

## 1. 本节内容

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

## 2. 评价

- todo

## 3. 🤔 SpeechSynthesisUtterance 的 rate 和 pitch 属性的取值范围和默认值分别是什么？

`rate` 属性控制语速，类型为浮点数。根据 W3C 规范，取值范围为 0.1 到 10，默认值为 1。值 1 代表正常语速，0.1 是最慢的语速（约为正常的十分之一），10 是最快的语速（约为正常的十倍）。

实际效果因语音引擎和操作系统而异。大多数语音引擎在极端值附近的表现并不线性。通常实用范围在 0.5 到 2 之间。低于 0.5 的语速听起来非常缓慢且不自然，高于 3 的语速可能变得难以理解。

```javascript
const utterance = new SpeechSynthesisUtterance('这是一段测试文本')

utterance.rate = 0.5 // 慢速朗读
utterance.rate = 1 // 正常语速（默认值）
utterance.rate = 1.5 // 稍快
utterance.rate = 2 // 快速朗读
utterance.rate = 0.1 // 极慢，几乎逐字停顿
utterance.rate = 10 // 极快，可能被浏览器钳制到最大支持值
```

`pitch` 属性控制音高，类型为浮点数。取值范围为 0 到 2，默认值为 1。值 0 是最低音高，2 是最高音高，1 是正常音高。

与 `rate` 类似，极端值的效果不一定符合预期。0 通常听起来非常低沉且不自然，2 则会变得尖锐。实用范围通常在 0.5 到 1.5 之间。需要注意 `pitch` 不是改变播放速率来实现音高变化的，而是语音合成引擎独立控制的参数，不会影响语速。

```javascript
utterance.pitch = 0.5 // 低沉
utterance.pitch = 1 // 正常音高（默认值）
utterance.pitch = 1.5 // 较高
```

其他常用的 `SpeechSynthesisUtterance` 属性：

`volume` 属性控制音量，取值范围为 0 到 1，默认值为 1。0 为静音，1 为最大音量。

`lang` 属性设置语言，值为 BCP 47 语言标签字符串，如 `"zh-CN"`（简体中文）、`"en-US"`（美式英语）、`"ja-JP"`（日语）。语言设置会影响语音合成引擎选择哪种语音来朗读。如果设为中文但当前系统没有中文语音，可能回退到默认语言。

`text` 属性是要朗读的文本字符串。单次朗读的文本长度有上限（通常为 200 到 300 个字符，具体取决于浏览器和操作系统），超出部分可能会被截断。这正是后续分段朗读方案需要解决的问题。

`voice` 属性指定使用哪种语音，值为 `SpeechSynthesisVoice` 对象，需要从 `getVoices()` 返回的列表中选取。

---

## 4. 🤔 getVoices() 返回空数组的常见原因是什么，如何等待语音列表加载完成？

`getVoices()` 在首次调用时经常返回空数组，这是最让开发者困惑的问题之一。原因在于语音列表的加载是异步的，浏览器需要时间从操作系统获取已安装的语音数据，`getVoices()` 的调用可能早于加载完成。

根本原因：`getVoices()` 是同步方法，但它依赖底层操作系统的语音引擎。浏览器在初始化语音系统时需要扫描操作系统中安装的所有语音包，这个过程是异步的。在语音列表加载完成之前调用 `getVoices()` 会得到空数组。

解决方案一：监听 `voiceschanged` 事件。

```javascript
function getVoicesWhenReady() {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices)
      return
    }

    speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        voices = speechSynthesis.getVoices()
        resolve(voices)
      },
      { once: true },
    )
  })
}

// 使用
const voices = await getVoicesWhenReady()
console.log(`可用语音数量：${voices.length}`)
```

`voiceschanged` 事件在语音列表首次加载完成时触发一次。如果在事件触发之前已经调用过 `getVoices()` 并得到了空数组，事件触发后再调用 `getVoices()` 就能获得完整的列表。

解决方案二：轮询检查（备用方案）。

某些浏览器的 `voiceschanged` 事件可能不触发或触发时机不可靠，轮询是一种更健壮的备用方案：

```javascript
async function waitForVoices(timeout = 3000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) return voices
    await new Promise((r) => setTimeout(r, 100))
  }
  return [] // 超时返回空数组
}
```

其他返回空数组的原因：

浏览器不支持语音合成。某些浏览器（特别是移动端的第三方浏览器）可能完全不支持 `SpeechSynthesis` API。可以通过检查 `window.speechSynthesis` 是否存在来判断。

操作系统未安装语音包。在某些精简的 Linux 发行版或容器化的环境中，操作系统可能没有安装任何 TTS 语音包。

浏览器需要用户交互后才能访问语音列表。某些浏览器的安全策略要求必须先发生用户交互（如点击事件），才能触发语音列表的加载。

筛选特定语言的语音：

```javascript
const voices = await getVoicesWhenReady()

// 筛选中文语音
const chineseVoices = voices.filter((v) => v.lang.startsWith('zh'))

// 筛选英文语音
const englishVoices = voices.filter((v) => v.lang.startsWith('en'))

// 列出所有可用语音及其信息
voices.forEach((v) => {
  console.log(`${v.name} (${v.lang}) ${v.default ? '[默认]' : ''}`)
})
```

每个 `SpeechSynthesisVoice` 对象包含 `name`（语音名称）、`lang`（语言标签）、`default`（是否为默认语音）、`localService`（是否为本地语音，false 表示需要网络下载）等属性。

---

## 5. 🤔 如何实现一段长文本的分段朗读并追踪每段的朗读进度？

长文本分段朗读的核心动机有两个：浏览器对单次朗读的文本长度有限制（超过 200 到 300 个字符可能被截断），以及需要在每段朗读完成时执行回调（如高亮当前段落、更新进度条）。

分段策略：按句号、问号、感叹号等标点符号拆分文本为句子，然后将若干句子合并为合理的段落长度。

```javascript
function splitText(text, maxLength = 200) {
  // 先按中文和英文的句末标点拆分为句子
  const sentences = text
    .replace(/([。！？.!?])/g, '$1\n')
    .split('\n')
    .filter((s) => s.trim().length > 0)

  // 将句子合并为不超过 maxLength 的段落
  const segments = []
  let currentSegment = ''

  for (const sentence of sentences) {
    if (
      (currentSegment + sentence).length > maxLength &&
      currentSegment.length > 0
    ) {
      segments.push(currentSegment.trim())
      currentSegment = ''
    }
    currentSegment += sentence
  }

  if (currentSegment.trim()) {
    segments.push(currentSegment.trim())
  }

  return segments
}
```

顺序朗读与进度追踪：

```javascript
class TextReader {
  constructor() {
    this.segments = []
    this.currentIndex = 0
    this.onProgress = null // 进度回调
    this.onSegmentStart = null
    this.onComplete = null
    this.isPaused = false
  }

  async read(text, voice, rate = 1) {
    this.segments = splitText(text)
    this.currentIndex = 0

    for (let i = 0; i < this.segments.length; i++) {
      if (this.isStopped) break

      // 如果处于暂停状态，等待恢复
      while (this.isPaused) {
        await new Promise((r) => setTimeout(r, 100))
        if (this.isStopped) return
      }

      this.currentIndex = i
      if (this.onSegmentStart) {
        this.onSegmentStart(i, this.segments[i])
      }

      await this.speakSegment(this.segments[i], voice, rate)

      if (this.onProgress) {
        this.onProgress(i + 1, this.segments.length)
      }
    }

    if (!this.isStopped && this.onComplete) {
      this.onComplete()
    }
  }

  speakSegment(text, voice, rate) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = voice
      utterance.rate = rate
      utterance.lang = 'zh-CN'

      utterance.onend = () => resolve()
      utterance.onerror = (e) => {
        if (e.error === 'canceled') {
          resolve() // 被取消不算错误
        } else {
          console.error('朗读错误：', e.error)
          resolve() // 出错后继续下一段
        }
      }

      speechSynthesis.speak(utterance)
    })
  }

  pause() {
    this.isPaused = true
    speechSynthesis.pause()
  }

  resume() {
    this.isPaused = false
    speechSynthesis.resume()
  }

  stop() {
    this.isStopped = true
    speechSynthesis.cancel()
  }
}
```

使用方式：

```javascript
const reader = new TextReader()

reader.onSegmentStart = (index, text) => {
  highlightSegment(index)
}

reader.onProgress = (current, total) => {
  progressBar.style.width = `${(current / total) * 100}%`
  progressText.textContent = `${current} / ${total}`
}

reader.onComplete = () => {
  console.log('全部朗读完毕')
}

const voices = await getVoicesWhenReady()
const chineseVoice = voices.find((v) => v.lang.startsWith('zh'))
reader.read(longText, chineseVoice, 1.2)
```

一个需要注意的问题：某些浏览器的 `SpeechSynthesis` 在连续朗读多个 `SpeechSynthesisUtterance` 时，相邻两段之间可能会出现间断（静音间隙）。Chrome 的一个已知 Bug 是在朗读大约 15 秒后会自动暂停。社区常用的解决方法是在 `onend` 回调中先调用 `speechSynthesis.cancel()` 再 `speak()` 下一段，或者在朗读过程中定时触发一个空的 `SpeechSynthesisUtterance` 来保持引擎活跃：

```javascript
// Chrome 的 Workaround：定期触发空朗读防止引擎休眠
const keepAliveInterval = setInterval(() => {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause()
    speechSynthesis.resume()
  }
}, 10000)
```

---

## 6. 🤔 SpeechRecognition 的 interimResults 设为 true 和 false 有什么行为差异？

`interimResults` 是 `SpeechRecognition` 的一个重要配置属性，控制是否返回中间识别结果（尚未确认的临时结果）。

设为 `false`（默认值）时的行为：

只有当用户说完一段话并且引擎认为语句完整（检测到较长的静音或语法断句）时，才会触发 `onresult` 事件。每次触发的结果都是「最终结果」（`isFinal` 为 `true`）。结果更准确但延迟更高——用户说完后需要等待引擎处理完成才能看到结果。

```javascript
const recognition = new (
  window.SpeechRecognition || window.webkitSpeechRecognition
)()
recognition.interimResults = false

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      console.log('最终结果：', event.results[i][0].transcript)
    }
  }
}
```

设为 `true` 时的行为：

在用户说话过程中持续触发 `onresult` 事件，每次返回当前的识别进度。同一个识别段落会多次触发事件，前面几次的 `isFinal` 为 `false`（临时结果），最后一次的 `isFinal` 为 `true`（最终确认结果）。临时结果会随着更多语音输入而不断修正——之前的临时结果可能在后续事件中被替换或修改。

```javascript
recognition.interimResults = true

recognition.onresult = (event) => {
  let interimTranscript = ''
  let finalTranscript = ''

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript
    if (event.results[i].isFinal) {
      finalTranscript += transcript
    } else {
      interimTranscript += transcript
    }
  }

  // 临时结果用不同样式显示，表示尚未确认
  displayElement.innerHTML =
    `<span>${finalTranscript}</span>` +
    `<span style="color: gray;">${interimTranscript}</span>`
}
```

核心差异总结：

实时性方面，`interimResults: true` 在用户说话过程中就能看到文字输出，体验类似语音输入法的实时转写。`interimResults: false` 需要等待语句结束才能看到结果。

准确性方面，临时结果的准确性较低，可能会随着更多语音输入而改变。最终结果经过引擎的完整语言模型分析，准确率更高。

使用场景方面，`interimResults: true` 适合实时字幕、语音输入框等需要即时反馈的场景。`interimResults: false` 适合语音命令识别、表单填写等只需要最终确定结果的场景。

性能方面，`interimResults: true` 会更频繁地触发 `onresult` 事件，带来更多的事件处理开销。在移动端上可能会影响电池续航。

`event.results` 是一个 `SpeechRecognitionResultList`，每个 `SpeechRecognitionResult` 包含多个候选转写结果（按置信度排序）。通常只使用 `[0]`（最可能的结果），但也可以遍历所有候选以获取备选转写：

```javascript
for (let i = 0; i < event.results[resultIndex].length; i++) {
  const alternative = event.results[resultIndex][i]
  console.log(
    `候选 ${i}：${alternative.transcript}（置信度：${alternative.confidence}）`,
  )
}
```

---

## 7. 🤔 如何处理语音识别的 continuous 模式以实现持续监听？

`continuous` 属性控制语音识别是否在检测到语句结束后继续监听。默认值为 `false`，表示识别完一段话后自动停止。

默认模式（`continuous: false`）的行为：用户开始说话，引擎持续识别。用户停止说话（出现较长的静音），引擎完成当前语句的识别并触发最后一次 `onresult` 事件。引擎自动停止，触发 `onend` 事件。之后不再监听，需要手动调用 `recognition.start()` 重新开始。

持续监听模式（`continuous: true`）的行为：引擎在识别完一段话后不会停止，而是继续监听后续的语音输入。每次识别完一段话就触发一次 `onresult` 事件（`isFinal` 为 `true`），然后继续等待下一段话。直到手动调用 `recognition.stop()` 才会停止。

```javascript
const recognition = new (
  window.SpeechRecognition || window.webkitSpeechRecognition
)()
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'zh-CN'

let fullTranscript = ''

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      fullTranscript += event.results[i][0].transcript
      console.log('完整文本：', fullTranscript)
    }
  }
}
```

但 `continuous: true` 并不意味着引擎永远不会意外停止。浏览器可能因为以下原因触发 `onend` 事件：

网络超时——远程语音识别服务（如 Google 的语音识别）可能会因长时间无语音输入而断开连接。

浏览器策略——某些浏览器限制单次识别的最长持续时间（如约 60 秒），超时后自动停止。

静音超时——长时间没有检测到语音输入时，引擎可能自行终止。

错误恢复——发生网络错误或服务端错误时，引擎会停止并触发 `onerror` 事件。

因此需要在 `onend` 和 `onerror` 事件中实现自动重连逻辑：

```javascript
let isListening = false
let shouldListen = true

recognition.onend = () => {
  isListening = false
  // 如果用户期望持续监听，自动重新启动
  if (shouldListen) {
    restartRecognition()
  }
}

recognition.onerror = (event) => {
  console.error('识别错误：', event.error)

  if (event.error === 'not-allowed') {
    // 麦克风权限被拒绝，不能自动重连
    shouldListen = false
    showPermissionError()
    return
  }

  if (event.error === 'network') {
    // 网络错误，延迟后重试
    setTimeout(() => restartRecognition(), 1000)
    return
  }

  // 其他错误直接重启
  restartRecognition()
}

function restartRecognition() {
  if (!shouldListen) return

  try {
    recognition.start()
  } catch (e) {
    // 如果已经处于 started 状态会抛异常
    setTimeout(() => restartRecognition(), 200)
  }
}

function startListening() {
  shouldListen = true
  restartRecognition()
}

function stopListening() {
  shouldListen = false
  recognition.stop()
}
```

`onstart` 和 `onend` 事件用于维护状态标记。`recognition.start()` 如果在已启动的状态下调用会抛出 `InvalidStateError` 异常，因此需要一个状态标记来避免重复启动，或者用 `try/catch` 包裹。

`recognition.abort()` 与 `recognition.stop()` 的区别：`stop()` 会先完成当前正在识别的语句并触发最终结果后再停止。`abort()` 立即停止，丢弃当前未完成的识别结果。在需要立即停止监听的场景（如用户主动关闭功能）应使用 `abort()`。

---

## 8. 🤔 语音识别结果中的 confidence 值代表什么，通常多高才算可靠？

`confidence` 是语音识别引擎对当前转写结果的确信程度，取值范围为 0 到 1。1 表示引擎完全确信，0 表示完全不确信。

`confidence` 的含义：

它反映的是引擎的语言模型和声学模型对该转写结果的综合评估。语言模型评估的是该文本序列在语言中的合理性（例如「今天天气很好」比「今天天气很方」更合理）。声学模型评估的是该文本对应的发音与实际音频信号的匹配程度。两者综合得到最终的置信度。

```javascript
recognition.onresult = (event) => {
  const result = event.results[event.results.length - 1]
  const bestMatch = result[0]

  console.log(`转写文本：${bestMatch.transcript}`)
  console.log(`置信度：${bestMatch.confidence}`)
  console.log(`是否最终结果：${result.isFinal}`)

  // 查看备选结果
  for (let i = 0; i < result.length; i++) {
    console.log(`备选 ${i}：${result[i].transcript}（${result[i].confidence}）`)
  }
}
```

可靠程度的参考标准：

confidence 大于 0.9 通常表示高度可靠，识别结果与实际语音高度吻合。这类结果可以直接使用，无需人工校验。

confidence 在 0.7 到 0.9 之间表示较为可靠，可能存在个别字词的错误。对于语音命令识别来说通常可以接受，但对于需要精确记录的场景（如语音笔记、医疗记录）建议标注或人工确认。

confidence 在 0.5 到 0.7 之间表示引擎不太确定，结果可能有明显错误。应提示用户确认或重新说一遍。

confidence 低于 0.5 表示引擎基本在猜测，结果很可能不正确。这类结果通常不应直接使用。

需要注意的局限性：

`confidence` 值不是所有浏览器都返回。某些浏览器或识别引擎可能始终返回 0 或 1，或者不提供该属性。不能依赖 `confidence` 做关键的业务决策。

不同浏览器的置信度计算方式不同，Chrome 和 Safari 的 `confidence` 值不可直接比较。同一个语音输入在不同浏览器中可能得到不同的置信度。

最终结果（`isFinal` 为 `true`）的置信度通常高于临时结果（`interimResults` 为 `true` 时的 `isFinal` 为 `false`）。因为最终结果经过了更完整的语言模型分析。

中文语音识别的置信度通常比英文低一些，因为中文没有明确的词边界，分词的不确定性会降低置信度。

根据置信度做不同处理的实用模式：

```javascript
function handleRecognitionResult(transcript, confidence) {
  if (confidence > 0.9) {
    // 高置信度，直接执行
    executeCommand(transcript)
  } else if (confidence > 0.7) {
    // 中等置信度，执行但显示确认提示
    executeCommand(transcript)
    showNotification(`已识别为「${transcript}」，如有误请重新说一遍`)
  } else {
    // 低置信度，要求确认
    showConfirmDialog(
      `识别结果不确定：「${transcript}」，是否正确？`,
      () => executeCommand(transcript),
      () => askUserToRepeat(),
    )
  }
}
```

---

## 9. 🤔 在移动端浏览器上使用 Speech API 有哪些需要注意的限制和兼容性问题？

移动端的 Speech API 使用环境与桌面端有显著差异，涉及浏览器支持、权限管理、系统资源、网络依赖等多个层面。

Speech Synthesis（语音合成）方面的移动端限制：

iOS Safari 对语音合成的支持有较多限制。在 iOS 16 之前，`speechSynthesis.speak()` 必须在用户交互事件（如 `click`）的同步调用栈中执行，异步调用会被静默忽略。iOS 16 之后这一限制有所放宽，但仍建议在用户交互事件中调用。

移动端浏览器可能只有少数几个预装语音。Android 设备通常有 Google TTS 引擎的中文和英文语音。iOS 设备的语音包取决于用户在系统设置中下载了哪些 Siri 语音。可以通过系统设置（iOS 的「辅助功能」→「朗读内容」，Android 的「无障碍」→「文字转语音」）下载更多语音包。

语音合成在移动端可能消耗较多电量。持续的 TTS 朗读会占用 CPU 和音频硬件资源，在电量较低时应提示用户。

屏幕锁定或切换到后台时，语音合成可能被打断。iOS Safari 在页面进入后台后会暂停语音合成。Android Chrome 的行为取决于设备厂商的省电策略。需要在 `visibilitychange` 事件中处理页面回到前台时是否恢复朗读。

Speech Recognition（语音识别）方面的移动端限制：

iOS Safari 直到 iOS 14.5 才开始支持 `SpeechRecognition` API（以 `webkitSpeechRecognition` 的形式）。更早版本的 iOS 完全不支持。即使是支持的版本，识别引擎的可用性和质量也与桌面端 Chrome 有差距。

Android Chrome 的语音识别依赖 Google 的远程语音识别服务，需要网络连接。离线语音识别仅在部分 Android 设备上且需要用户预先下载离线语音包时才可用。

移动端的麦克风权限管理更加严格。Android 和 iOS 都会在浏览器首次请求麦克风时弹出系统级权限对话框。用户拒绝后，后续的 `getUserMedia` 或 `SpeechRecognition.start()` 会直接失败，且不会再次弹出权限请求。用户需要手动到系统设置中重新授权。

移动端浏览器对语音识别的持续时间限制更严格。连续识别通常在 60 秒左右就会自动停止，比桌面端更短。长文本的持续识别需要配合自动重连逻辑。

网络环境的影响在移动端更加突出。移动网络的不稳定可能导致识别过程中断。需要在网络状态变化时做适当的错误处理和重试。

WebView 中的兼容性问题：

Android 的 WebView 对 Speech API 的支持取决于 WebView 版本和 Android 系统版本。某些应用内嵌的 WebView 可能不支持或限制 Speech API。微信内置浏览器和支付宝内置浏览器对 Speech API 的支持非常有限或完全不支持。

iOS 的 WKWebView 对 `SpeechRecognition` 的支持与 Safari 不完全一致。某些 WKWebView 配置下可能无法使用语音识别。

检测和降级策略：

```javascript
const speechSupport = {
  synthesis: !!window.speechSynthesis,
  recognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
}

if (!speechSupport.synthesis) {
  // 降级方案：显示文字代替语音朗读
  showTextNotification(message)
}

if (!speechSupport.recognition) {
  // 降级方案：显示文字输入框代替语音输入
  showTextInput()
}
```

移动端最佳实践总结：

语音合成调用放在用户交互事件的同步上下文中。始终在 `onend` 和 `onerror` 事件中处理异常和状态重置。语音识别实现自动重连机制应对意外断开。在页面不可见时暂停或取消语音操作。提供文字输入作为语音功能的降级方案。在调用前检测 API 是否可用，避免在不支持的环境中直接调用导致报错。
