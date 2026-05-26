# [0141. TNotes.javascript](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0141.%20TNotes.javascript)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤖 Prompt - 精读笔记生成 DEMO](#3--prompt---精读笔记生成-demo)
- [4. 🔗 引用](#4--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- TNotes.javascript 知识库简介

## 2. 🫧 评价

TNotes.javascript 是一个基于 [@tnotesjs/core][1] 实现的一个 javascript 开源知识库。

接下来主要会在这个知识库中记录一些和 JS、HTML、CSS 相关的知识点。

## 3. 🤖 Prompt - 精读笔记生成 DEMO

::: tip 使用场景

在笔记完成之后让 AI 来根据笔记的核心知识点快速生成一些 DEMO 示例。

:::

````md
# 精读笔记生成 DEMO

要求：

- 精读这篇笔记，提炼出笔记中的核心知识点
- 一个核心知识点生成一个 DEMO
- 高频核心知识点排在前面，低频核心知识点排在后面
- DEMO 的呈现形式：
  - 可以是一个 HTML 文件，要求可以使用浏览器打开直接查看效果
  - 可以是一个 JS 片段，要求可以直接在浏览器控制台执行验证
- DEMO 的样式不要太重，能不需要样式就不要使用样式，除非样式是知识点的一部分
- DEMO 中不允许出现对外部 API 的依赖，如果需要模拟一些数据，可以直接在组件中写死一些 mock 数据，利用 setTimeout 模拟异步请求的时机
- DEMO 如果需要一些必要的前置资源，比如图片、视频、音频等，可以事先提醒我自行准备必要的资源
- 知识点的解释说明直接通过注释的形式写入到示例中，不要啰嗦，精简明了地解释每个知识点的核心概念和关键细节
- 具体格式要求：

## 💻 demos.1 - 知识点 1 的名称

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>demo - {demo 标题}</title>
  </head>
  <!-- 在此填写 DEMO 内容 -->
  <body></body>
</html>
```

或者：

```js
// DEMO 的内容
```

## 💻 ...

## 💻 demos.n - 知识点 n 的名称

---

笔记内容：

<!-- 在此复制笔记内容 -->
````

## 4. 🔗 引用

- [@tnotesjs/core][1]

[1]: https://github.com/tnotesjs/core
