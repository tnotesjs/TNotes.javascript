# [0081. postMessage](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0081.%20postMessage)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评论](#2-评论)
- [3. `postMessage`](#3-postmessage)
- [4. demos.1 - 使用 postMessage 实现跨标签页通信](#4-demos1---使用-postmessage-实现跨标签页通信)
- [5. 引用](#5-引用)

<!-- endregion:toc -->

## 1. 本节内容

- `postMessage`

## 2. 评论

- 面试题可能会遇到：你都知道哪些实现跨标签通信的方式？
  - 要知道，使用 `postMessage` 是实现跨标签页通信的一种方案。
- demos.1 通过 `postMessage` 来模拟了两个页面之间的通信效果。

## 3. `postMessage`

- `postMessage` API 可用于实现不同窗口、标签页或 iframe 之间的安全通信。
- `postMessage` 允许你向另一个浏览上下文（如新打开的窗口、iframe 等）发送消息，并可以接收来自这些上下文的消息。

## 4. demos.1 - 使用 postMessage 实现跨标签页通信

::: code-group

<<< ./demos/1/send.html {}

<<< ./demos/1/send.js {}

<<< ./demos/1/receive.html {}

<<< ./demos/1/receive.js {}

:::

- 这是一个简单的示例，演示了如何使用 `postMessage` 在两个不同的标签页之间进行通信。这个例子分为两部分：一个页面 `send.html` 用来发送消息，另一个页面 `receive.html` 用来接收消息。
- 测试流程
  - 1️⃣ 打开 `send.html` 页面（注意，以 Live server 的形式启动）
  - 2️⃣ 点击按钮 `Open Win`，此时会打开 `receive.html` 页面，此时 `send.html` 还没通过 `postMessage` 给 `receive.html` 发送消息
  - 3️⃣ 在输入框中输入任意内容，然后点击 `Send Message` 按钮
  - 4️⃣ 切换到 `receive.html` 页面，查看收到的消息

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-03-22-17-27.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-03-22-17-41.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-03-22-17-48.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-09-03-22-19-41.png)

:::

- 一些注意事项
  - **安全性问题**，始终检查 `event.origin`，确保消息来自你信任的源。这可以防止恶意网站发送伪造消息。也可以通过其它自定义方案，加上身份验证的逻辑。
  - **跨域限制问题**，`postMessage` 支持跨域通信，但需要正确设置 `targetOrigin` 参数，确保只将消息发送给正确的接收者。
  - **性能问题**，频繁的跨窗口通信可能会对性能产生影响，特别是当涉及大量数据传输时。

## 5. 引用

- [mdn - window.postMessage][1]

[1]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage
