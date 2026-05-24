# [0239. navigator对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0239.%20navigator%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `navigator` 对象是什么？](#3--navigator-对象是什么)
- [4. 🤔 `navigator` 常见属性能说明什么？](#4--navigator-常见属性能说明什么)
- [5. 🤔 如何检测插件？](#5--如何检测插件)
- [6. 🤔 旧版 IE 为什么要用 ActiveX 检测插件？](#6--旧版-ie-为什么要用-activex-检测插件)
- [7. 🤔 `registerProtocolHandler()` 有什么用？](#7--registerprotocolhandler-有什么用)
- [8. 🤔 使用 `navigator` 时应该注意什么？](#8--使用-navigator-时应该注意什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `navigator` 对象的定位
- 浏览器和设备信息属性
- 插件检测
- 旧版 IE 的 ActiveX 插件检测
- `registerProtocolHandler()`
- 使用 `navigator` 的注意点

## 2. 🫧 评价

- `navigator` 适合了解运行环境，但不适合把业务逻辑死死绑在某个浏览器名字上。它提供的信息多、杂、还可能不准，真正可靠的判断通常还是能力检测。

## 3. 🤔 `navigator` 对象是什么？

`navigator` 最早来自 Netscape Navigator，现在已经成为浏览器环境中用于描述客户端信息的标准对象。

只要浏览器启用了 JavaScript，通常就会存在 `navigator`。

```js
console.log(navigator.userAgent)
console.log(navigator.language)
```

它提供的信息包括浏览器标识、语言、联网状态、硬件能力、媒体设备、插件、权限、服务工作者线程等。不同浏览器支持的属性和方法并不完全一样。

## 4. 🤔 `navigator` 常见属性能说明什么？

可以把常见属性按用途分成几类：

| 类型         | 示例                                                    |
| ------------ | ------------------------------------------------------- |
| 浏览器标识   | `userAgent`、`appName`、`appVersion`、`vendor`          |
| 语言和区域   | `language`、`languages`                                 |
| 网络和存储   | `onLine`、`connection`、`storage`                       |
| 硬件能力     | `hardwareConcurrency`、`deviceMemory`、`maxTouchPoints` |
| 媒体和权限   | `mediaDevices`、`permissions`、`geolocation`            |
| 插件与 MIME  | `plugins`、`mimeTypes`                                  |
| 自动化和平台 | `platform`、`webdriver`                                 |

这些信息看起来很丰富，但要注意两点：

- 不同浏览器支持情况不同。
- 出于兼容、隐私或反指纹考虑，有些值可能不准确或被弱化。

所以，不要只根据 `navigator.userAgent` 决定核心逻辑。能做能力检测时，通常应该优先检测能力。

## 5. 🤔 如何检测插件？

早期浏览器常通过 `navigator.plugins` 检测插件。

```js
function hasPlugin(name) {
  const normalizedName = name.toLowerCase()

  for (const plugin of navigator.plugins) {
    if (plugin.name.toLowerCase().includes(normalizedName)) {
      return true
    }
  }

  return false
}

console.log(hasPlugin('Flash'))
```

`plugins` 数组里的每一项通常包含插件名称、描述、文件名和支持的 MIME 类型数量。

不过，插件体系已经明显退场。Flash 等传统插件被淘汰后，这类检测在现代 Web 开发中已经不再常用。

## 6. 🤔 旧版 IE 为什么要用 ActiveX 检测插件？

IE10 及更早版本不支持 Netscape 式插件体系，很多插件以 ActiveX 控件形式存在。

旧代码会通过尝试创建 `ActiveXObject` 来判断插件是否存在。

```js
function hasIEPlugin(name) {
  try {
    new ActiveXObject(name)
    return true
  } catch (error) {
    return false
  }
}
```

例如 Flash 的 ActiveX 标识符曾经是 `ShockwaveFlash.ShockwaveFlash`。

这部分主要用于理解历史代码。现代浏览器已经不再依赖 ActiveX，IE11 以后也逐渐支持 `plugins` 和 `mimeTypes` 一类属性。

## 7. 🤔 `registerProtocolHandler()` 有什么用？

`navigator.registerProtocolHandler()` 可以把 Web 应用注册为某种协议的处理程序。

```js
navigator.registerProtocolHandler(
  'mailto',
  'https://mail.example.com/?url=%s',
  'Example Mail',
)
```

这个例子表示让某个 Web 邮件应用处理 `mailto` 链接。第二个参数中的 `%s` 会被替换成原始请求地址。

这个能力让 Web 应用可以更像桌面应用一样参与系统级链接处理。不过它通常会受到浏览器权限、协议白名单和用户确认的限制。

## 8. 🤔 使用 `navigator` 时应该注意什么？

最重要的是不要过度依赖浏览器身份。

例如，与其根据 `userAgent` 判断是否支持某个 API，不如直接判断 API 是否存在。

```js
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(console.log, console.error)
}
```

`navigator` 更适合回答环境信息类问题，例如用户语言、是否在线、触摸点数量、是否有媒体设备访问能力等。

如果问题是“当前浏览器能不能做某件事”，优先使用能力检测；如果问题是“当前环境大概是什么样”，再考虑读取 `navigator` 信息。
