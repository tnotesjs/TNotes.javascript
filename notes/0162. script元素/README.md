# [0162. script元素](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0162.%20script%E5%85%83%E7%B4%A0)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. script 元素到底负责什么？](#3-script-元素到底负责什么)
- [4. script 元素常见属性都有哪些？](#4-script-元素常见属性都有哪些)
- [5. 浏览器解析 script 时为什么会阻塞页面？](#5-浏览器解析-script-时为什么会阻塞页面)
- [6. 行内脚本中的 `</script>` 陷阱是什么？](#6-行内脚本中的-script-陷阱是什么)
- [7. script 应该放在页面什么位置？](#7-script-应该放在页面什么位置)
- [8. `defer` 和 `async` 到底怎么选？](#8-defer-和-async-到底怎么选)
- [9. 动态创建 script 有什么特点？](#9-动态创建-script-有什么特点)
  - [9.1. 显式设置 `async = false` 有什么用？](#91-显式设置-async--false-有什么用)
  - [9.2. 「浏览器预加载器通常看不到它」是什么意思？](#92-浏览器预加载器通常看不到它是什么意思)
  - [9.3. `preload` 预加载动态脚本](#93-preload-预加载动态脚本)
- [10. XHTML 和旧式注释语法今天还需要了解吗？](#10-xhtml-和旧式注释语法今天还需要了解吗)
  - [10.1. 先给结论](#101-先给结论)
  - [10.2. 在《JavaScript高级程序设计（第4版）》书中提到两类遗留问题](#102-在javascript高级程序设计第4版书中提到两类遗留问题)

<!-- endregion:toc -->

## 1. 本节内容

- script 元素的职责
- 常见属性及其作用
- 脚本解析时的阻塞特征
- 行内脚本中的 `</script>` 陷阱
- 标签放置位置的影响
- `defer` 与 `async` 的区别
- 动态加载脚本的行为
- XHTML 与旧式写法的历史包袱

## 2. 评价

script 元元素用于在 HTML 文档中嵌入或引用可执行的 JavaScript 代码，使网页具备动态交互能力。

## 3. script 元素到底负责什么？

script 元素是浏览器识别 JavaScript 的正式入口。它告诉浏览器：这里有一段脚本需要处理，可能是当前文档里的代码，也可能是一个外部文件。

它的核心职责可以概括成三件事：

- 标记脚本边界，让浏览器切换到脚本解析逻辑
- 指定脚本来源，是行内代码还是 `src` 指向的外部资源
- 提供执行控制信息，例如是否延迟、是否异步、是否校验完整性

在默认情况下，浏览器解析到 script 元素就会停下来处理它。也正因为如此，script 元素不是普通内容标签，而是会直接改变页面解析流程的控制点。

## 4. script 元素常见属性都有哪些？

| 属性 | 作用 | 备注 |
| --- | --- | --- |
| `src` | 指向外部脚本文件 | 只要用了它，脚本主体通常就不再写行内代码 |
| `defer` | 立即下载，延后到文档解析完成后执行 | 主要用于外部脚本 |
| `async` | 立即下载，下载完成后尽快执行 | 不保证和别的脚本保持顺序 |
| `type` | 说明脚本内容类型 | 现代 HTML 下通常可以省略；`module` 例外 |
| `crossorigin` | 配置跨源请求模式 | 常与错误上报、凭据策略配合 |
| `integrity` | 校验外部资源完整性 | 用于防止 CDN 或中间链路投毒 |
| `charset` | 指定字符集 | 现在很少单独依赖它 |
| `language` | 旧时代的脚本语言声明 | 已废弃，不应再使用 |

其中有两个点尤其容易被忽略：

- 第一，`type="module"` 会把脚本当成 ES 模块处理，这时脚本的加载和作用域规则都会和传统脚本不同。
- 第二，`src` 和行内代码不应该混用。如果你既写了 `src`，又在标签中间放了脚本，浏览器通常只会下载并执行外部文件，而忽略中间那段代码。

## 5. 浏览器解析 script 时为什么会阻塞页面？

浏览器默认边解析 HTML，边构建 DOM。当它遇到普通脚本时，必须停下来先执行它 => 因为脚本可能通过 `document.write()` 等手段读取、修改甚至重写当前文档，解析器无法预判结果。

由此带来两个后果：

- HTML 解析中断，DOM 构建随之停滞
- 未解析的内容不会被渲染，用户可能看到空白或不完整的页面

不只是行内脚本会这样，外部脚本同样阻塞，区别仅在于多了一段网络下载的时间。

## 6. 行内脚本中的 `</script>` 陷阱是什么？

行内脚本还有一个经典陷阱：HTML 解析器不理解 JavaScript 的字符串语义，它只按字符状态机匹配 script 元素的结束标签文本 => `</script>`。如果脚本中直接写入这个字符串，解析器会把第一次出现当作标签结束符，导致脚本提前截断、语法报错。通常用转义字符绕过：

<<< ./assets/1.html

如果你使用了错误的写法，在一些 IDE（比如 VSCode） 中会立刻抛出提示：`Unterminated string literal.javascript`，同时页面也会渲染出异常的结果，控制台也会抛出语法错误。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-15-37-47.png)

正确的写法应该是 `<\/script>`，这样浏览器就不会把它当成结束标签了。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-15-39-36.png)

`<\/script>` 中的反斜杠让 HTML 解析器跳过这一处匹配，而 JavaScript 引擎在字符串中会忽略这个反斜杠，输出值仍然是 `</script>`。

这个细节有点像历史遗留，但它恰好说明一件事：浏览器看到的不是「纯 JavaScript 文件」，而是「HTML 里的脚本片段」 => 解析规则始终是 HTML 的规则。浏览器在把内容交给 JavaScript 引擎之前，HTML 解析器会先过一遍。

## 7. script 应该放在页面什么位置？

早期页面习惯把所有 script 元素都放在 head 元素里，因为 CSS 和 JavaScript 资源会被集中管理。但这种写法有一个明显代价：浏览器解析到这些脚本时会阻塞，必须等它们下载并执行完毕，`<body>` 才开始解析和渲染。网络越慢或脚本越大，用户看到空白页面的时间就越长。

因此，现代页面更常见的做法是：把指执行时机不敏感的脚本放在 body 结束标签 `</body>` 之前：

<<< ./assets/2.html

「指执行时机不敏感的脚本」表示这个脚本的执行时机可以晚一些，不需要抢占在页面内容之前。大多数脚本都属于这一类。

执行时机不敏感 => 适合放在末尾：

```html
<script>
  document.getElementById('btn').addEventListener('click', handler)
  // 这个脚本只需要在用户点击之前绑定事件就行，页面先渲染再执行，完全没问题。
  // 通常放在 </body> 结束标签前更合适
  // 让页面内容更早被渲染到屏幕上，减少用户感知到的白屏时间
</script>
```

执行时机敏感 => 放在末尾可能出问题：

```html
<script>
  window.__CONFIG__ = { apiBase: '/api' }
  // 后续脚本可能读取 __CONFIG__
  // 需要保证它在依赖它的脚本之前执行，位置取决于具体的页面结构
</script>
```

## 8. `defer` 和 `async` 到底怎么选？

`defer` 和 `async` 都会告诉浏览器：脚本可以先下载，不必像普通脚本那样在当前位置立刻执行。但它们的执行约束不同。

| 维度     | `defer`                  | `async`                        |
| -------- | ------------------------ | ------------------------------ |
| 下载时机 | 尽快下载                 | 尽快下载                       |
| 执行时机 | 文档解析完成后           | 下载完成后尽快执行             |
| 顺序保证 | 通常按出现顺序           | 不保证顺序                     |
| 典型场景 | 多个彼此有先后关系的脚本 | 彼此独立的统计、广告、插件脚本 |

可以把它们理解成两种不同承诺：

- `defer` 说的是：我晚一点执行，但尽量保住顺序。
- `async` 说的是：我不拦着页面，也不等别人，谁先下好谁先跑。

所以只要脚本之间存在依赖关系，你就要对 `async` 更谨慎。

## 9. 动态创建 script 有什么特点？

除了在 HTML 里静态声明 script 元素，你也可以在运行时通过 DOM 创建它：

```js
const script = document.createElement('script')
script.src = 'gibberish.js'
script.async = false
document.head.appendChild(script)
```

这种方式常用于按需加载脚本、插件系统或运行时注入资源。

不过它有两个特点需要记住：

- 动态创建的脚本默认按异步方式加载，如果你需要更可控的顺序，通常要显式设置 `script.async = false`。
- 浏览器预加载器通常看不到它，因此资源优先级可能更低，如果你很在意性能，还可能会配合 `preload` 提前告诉浏览器相关资源的存在。

### 9.1. 显式设置 `async = false` 有什么用？

动态插入的脚本默认是异步的，这意味着浏览器会尽快下载、下载完立刻执行，不等别的脚本。如果同时插入多个动态脚本，执行顺序就不可预测：

```js
const s1 = document.createElement('script')
s1.src = 'jquery.js'

const s2 = document.createElement('script')
s2.src = 'plugin.js' // 依赖 jquery.js

document.head.appendChild(s1)
document.head.appendChild(s2)
```

两个脚本同时开始下载，谁先下好谁先执行。如果 `plugin.js` 体积小，它可能先执行，但此时 `jquery.js` 还没加载完，就会报错。

显式设置 `async = false` 后：

```js
const s1 = document.createElement('script')
s1.src = 'jquery.js'
s1.async = false

const s2 = document.createElement('script')
s2.src = 'plugin.js'
s2.async = false

document.head.appendChild(s1)
document.head.appendChild(s2)
```

浏览器仍然会尽早下载它们，但执行时会「按插入顺序来执行」：

1. 先等 `jquery.js` 下载并执行完
2. 再执行 `plugin.js`

这样顺序就有了保证。

`async = false` 把动态脚本的执行行为从「谁先下好谁先跑」变成了「按我插入的顺序排队」，实现可控的执行流程。

### 9.2. 「浏览器预加载器通常看不到它」是什么意思？

浏览器有两种扫描 HTML 的机制：

1. 主解析器（HTML Parser）

按顺序逐行解析 HTML，构建 DOM 树。这是常规的解析流程，速度受到脚本阻塞等因素的制约。

2. 预加载扫描器（Preload Scanner）

当主解析器被脚本阻塞停下来的间隙，预加载扫描器会“偷看后面的 HTML 文本”，提前发现其中引用的资源（CSS、图片、脚本等），尽早发起网络请求。

举个例子：

```html
<script src="app.js"></script>
<img src="hero.jpg" />
```

主解析器遇到 `<script src="app.js">` 后阻塞了，但它停下来的这段时间里，预加载扫描器会扫到后面的 `hero.jpg`，提前发起下载。等 `app.js` 执行完，`hero.jpg` 可能已经下好了。

关键在于：预加载扫描器只扫描“已经写在 HTML 文本里的”资源标记。动态脚本是 JavaScript 在运行时才通过 `document.createElement('script')` 创建的，此时扫描器根本不知道它的存在。

```js
// 这行代码运行时才创建脚本，预加载扫描器的扫描窗口早已过去
const script = document.createElement('script')
script.src = 'plugin.js'
document.head.appendChild(script)
```

所以“看不到”的后果是：资源发现的时机晚了，浏览器没有机会提前发起请求，加载效率不如静态声明的脚本。

### 9.3. `preload` 预加载动态脚本

前面说过，动态脚本是运行时才创建的，预加载扫描器扫不到它。这意味着浏览器要等到那段 JavaScript 代码真正运行、创建出 `<script>` 元素并插入 DOM 之后，才会发现“哦，原来还需要下载这个文件”。

`preload` 的作用就是提前通知浏览器：这个资源马上会用到，现在就开始下载。

```html
<head>
  <!-- 告诉浏览器：后面会用到 plugin.js，现在就下载 -->
  <link rel="preload" href="plugin.js" as="script" />
</head>
```

`<link rel="preload">` 是写在 HTML 文本里的静态标记，预加载扫描器可以直接看到它。浏览器在主解析器被阻塞的间隙就会提前发起 `plugin.js` 的下载请求。

等到运行时 JavaScript 真正创建动态脚本并设置 `src` 为 `plugin.js` 时，这个文件可能已经下好了，省去了一段等待时间。

整个流程的对比：

```
没有 preload
-> 主解析器阻塞
-> 扫描器扫不到任何东西
-> JS 运行
-> 创建 script 元素
-> 发现需要下载 plugin.js
-> 开始下载
-> 等待

有 preload
-> 主解析器阻塞
-> 扫描器发现 <link rel="preload" href="plugin.js">
-> 提前下载 plugin.js
-> JS 运行
-> 创建 script 元素
-> plugin.js 可能已经下好了
-> 直接执行
```

`preload` 预加载动态脚本的作用是弥补动态脚本「被发现时机过晚」这个痛点，让浏览器尽早知道有哪些资源需要提前下载好。

## 10. XHTML 和旧式注释语法今天还需要了解吗？

### 10.1. 先给结论

基本不需要。除非你在维护十几年前的老项目，遇到了 `application/xhtml+xml` 这种罕见的 MIME 类型，或者在阅读一些历史代码时碰到了用 HTML 注释包裹脚本的写法。在现代项目中，这些都是过时的遗留问题，不应该继续使用。

唯一值得知道的一件事：如果有人给你看这样的代码，你能认出它是历史上用来隐藏脚本的写法、不是真正的注释，就够了。不需要主动使用它。

如果你感兴趣，可以继续查看下文，了解一下这里指的历史问题是什么。

### 10.2. 在《JavaScript高级程序设计（第4版）》书中提到两类遗留问题

- XHTML 中脚本内容会受 XML 规则影响，因此曾经需要 `CDATA` 或把 `<` 改写成实体
- 很早期为了兼容不支持 JavaScript 的浏览器，开发者会把脚本包进 HTML 注释里

这些写法在现代 HTML 里都不应该继续作为默认方案。你知道它们存在，是为了理解历史代码和一些书籍里的背景解释；真正写新页面时，使用标准 HTML5 文档、正常的 script 声明就够了。

对应书中的描述：

::: swiper

![P16](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-16-49-40.png)

![P17](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-24-16-49-58.png)

:::
