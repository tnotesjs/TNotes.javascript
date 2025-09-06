# [0013. 转义符](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0013.%20%E8%BD%AC%E4%B9%89%E7%AC%A6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 📒 转义符的含义和作用](#3--转义符的含义和作用)
- [4. 🔍 查看 wiki 对转义符的介绍](#4--查看-wiki-对转义符的介绍)
- [5. 🤔 转义符的英文为啥叫 `escape character`？](#5--转义符的英文为啥叫-escape-character)
- [6. 💻 exercises.1 - 按照指定格式打印系统时间](#6--exercises1---按照指定格式打印系统时间)
- [7. 🤔 在 js 的字符串中，`\` 反斜杠表示转义，如何不转义，输入反斜杠呢？](#7--在-js-的字符串中-反斜杠表示转义如何不转义输入反斜杠呢)
- [8. ⌛️ 旧版打字机 - 转义符 `\r\n` 诞生的背景](#8-️-旧版打字机---转义符-rn-诞生的背景)
- [9. 🔗 References](#9--references)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 转义符

## 2. 🫧 评价

- 需要知道转义符是什么，转义符有什么用。
- 当你在程序中需要输出一些特殊字符的时候，能够想要“转义符”这个知识点即可。

## 3. 📒 转义符的含义和作用

- 转义字符是编程语言中一种非常重要的机制，它 **允许开发者在字符串中安全地使用特殊字符**。
  - **有些字符在字符串文本中有特殊的含义**，例如：
    - 引号：
      - `
      - `'`
      - `"`
    - 换行符：`\n`
    - 制表符：`\t`
    - …… 等等。
  - 如果你想在字符串中包含这些特殊字符，而不是它们的特殊功能，就需要一种方法来告诉编程语言这些字符应该被视为普通文本。
  - **转义字符允许你插入这些特殊字符而不触发它们的特殊行为。**

| 转义符 | 含义           |
| ------ | -------------- |
| `\'`   | 普通英文单引号 |
| `\"`   | 普通英文双引号 |
| `\r`   | 回车           |
| `\n`   | 换行           |
| ……     | ……             |

## 4. 🔍 查看 wiki 对转义符的介绍

- [维基百科 - Escape character][1]
- In computing and telecommunication, an **escape character** is a character that invokes an alternative interpretation on the following characters in a character sequence. An escape character is a particular case of metacharacters. Generally, the judgement of whether something is an escape character or not depends on the context.
- 中文：
- **在计算机和通信领域中，转义字符是一种字符，它会对其后的字符序列中的字符进行替代解释**。转义字符是元字符的一种特殊情况。通常，判断某个字符是否为转义字符取决于上下文环境。

## 5. 🤔 转义符的英文为啥叫 `escape character`？

- **`escape` 表示逃离的意思，`escape character` 表示转义字符（可以理解为逃离计算机的翻译）**。
- 在编程中，转义符的作用是让某些字符“逃脱”其正常的解释方式，从而被解释为特殊含义或符号。这种机制与“逃脱”或“避开”字符的原始含义非常相似，因此“escape”这个词非常贴切。
- 在阅读外文文档的时候，需要知道这个短语 `escape character` 表示的是转义符的含义。

## 6. 💻 exercises.1 - 按照指定格式打印系统时间

::: code-group

<<< ./exercises/1/1.js {}

:::

- 输出示例
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-28-12-09-17.png)

::: details 参考答案

<<< ./exercises/1/2.js {}

:::

## 7. 🤔 在 js 的字符串中，`\` 反斜杠表示转义，如何不转义，输入反斜杠呢？

- 在 JavaScript 中，如果你想要在字符串中包含一个实际的反斜杠（`\`），你需要使用双反斜杠（`\\`）来表示。
- 可能的应用场景：
  - 在普通字符串和模板字符串中，使用两个斜杠 `\\` 来表示一个实际的反斜杠。
  - 在正则表达式中，同样使用两个斜杠 `\\` 来表示一个实际的反斜杠。

```javascript
// 在字符串中表示一个包含反斜杠的文件路径
const filePath = 'C:\\Program Files\\MyApp\\config.ini'
console.log(filePath)
// 输出: C:\Program Files\MyApp\config.ini

// 在正则表达式中匹配包含反斜杠的路径
const pathPattern = /C:\\Program Files\\MyApp\\/
console.log(pathPattern.test(filePath))
// 输出: true

// 使用模板字符串时也需要转义反斜杠
const message = `The config file is located at: C:\\Program Files\\MyApp\\config.ini`
console.log(message)
// 输出: The config file is located at: C:\Program Files\MyApp\config.ini
```

## 8. ⌛️ 旧版打字机 - 转义符 `\r\n` 诞生的背景

- ![图 0](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2025-08-19-21-52-20.png)
- `\r\n` 的诞生背景，和历史上的打字机有关。
  - 回车换行 `\r\n`
  - 回车 `\r`
  - 换行 `\n`
  - `\r\n` 的由来与历史上的 **打字机** 和早期计算机终端的工作方式有关。理解这些字符的背景，需要回顾计算机文本处理的早期历史。
  - `\r\n` 的使用是一个从早期打字机操作演变而来的历史遗留问题，它体现了计算机技术发展过程中的连续性和兼容性考虑。
- 打字机的工作原理
  - 在早期的打字机上，当打字员达到一行的末尾时，需要执行两个动作来开始新的一行：
    1. **回车（Carriage Return, CR）** - 这个操作使打字机的打印头回到左边界的起始位置。
    2. **换行（Line Feed, LF）** - 这个操作使纸张向上滚动一行。
  - 这 **两个动作** 分别对应于 `\r` （回车符）和 `\n` （换行符）。
- 电传打字机和早期计算机
  - 随着电传打字机（Teletypes）和早期计算机终端的使用，这些设备也采用了类似的机械操作方式。
  - 在这些设备中，`CR` 和 `LF` 同样是控制字符，用于文本的格式化和定位。
- 操作系统
  - 随着计算机操作系统的发展，不同系统采纳了不同的约定来表示文本中的行结束。
  - **Unix 和后来的 Linux 及 macOS**：
    - **采用简单的 `\n` 来表示行结束**，这可能是因为它简化了处理逻辑，并且节省了存储空间。
  - **Windows（及之前的 DOS）**：
    - **采用 `\r\n` 组合来模仿早期电传打字机的行为**，保持与之前技术的兼容性。
    - 在这些系统中，`\r\n` 确保了文本在编辑和显示时的一致性，尤其是在涉及多种设备和上下文（如网络传输和文本文件处理）时。
- 评论
  - 从这个历史小片段来看，其实也反映出了 macOS 和 Windows 系统在设计上的一些策略：
  - Windows：保留技术债 - 比如在做系统升级（比如 win10 -> win11）的时候，会尽可能去考虑之前软件的兼容性。对于早期系统设计上一些不太合理的地方，从技术角度来看是可以优化处理掉的，可是却没有这么做，一些历史问题被保留了一下。
  - macOS：舍弃技术债 - 系统一升级，很多旧版软件可能压根就打不开了。
- 现代应用
  - 尽管现代计算机和打印技术不再需要物理的“回车”和“换行”操作，`\r\n` 作为行结束符的约定仍然在 Windows 系统中保留。这种历史遗留的特性意味着跨平台软件开发和网络通信协议（如 HTTP 和电子邮件标准）中仍需考虑不同的行结束符处理。

## 9. 🔗 References

- [维基百科 - Escape character][1]

[1]: https://en.wikipedia.org/wiki/Escape_character
