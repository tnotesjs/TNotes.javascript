# [0013. 转义符](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0013.%20%E8%BD%AC%E4%B9%89%E7%AC%A6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 💻 exercises.1 - 按照指定格式打印系统时间](#3--exercises1---按照指定格式打印系统时间)
- [4. 🤔 在 js 的字符串中，`\` 反斜杠表示转义，如何不转义，输入反斜杠呢？](#4--在-js-的字符串中-反斜杠表示转义如何不转义输入反斜杠呢)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 转义符

## 2. 🫧 评价

- 需要知道转义符是什么，转义符有什么用。
- 当你在程序中需要输出一些特殊字符的时候，能够想要“转义符”这个知识点即可。

## 3. 💻 exercises.1 - 按照指定格式打印系统时间

::: code-group

<<< ./exercises/1/1.js {}

:::

- 输出示例
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-12-28-12-09-17.png)

::: details 参考答案

<<< ./exercises/1/2.js {}

:::

## 4. 🤔 在 js 的字符串中，`\` 反斜杠表示转义，如何不转义，输入反斜杠呢？

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
