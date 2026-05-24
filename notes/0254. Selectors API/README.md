# [0254. Selectors API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0254.%20Selectors%20API)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `Selectors API` 是什么？](#3--selectors-api-是什么)
- [4. 🤔 `querySelector()` 怎么用？](#4--queryselector-怎么用)
- [5. 🤔 `querySelectorAll()` 和 `querySelector()` 有什么区别？](#5--queryselectorall-和-queryselector-有什么区别)
- [6. 🤔 `querySelectorAll()` 返回的是实时集合吗？](#6--queryselectorall-返回的是实时集合吗)
- [7. 🤔 `matches()` 有什么用？](#7--matches-有什么用)
- [8. 🤔 使用选择符查询时要注意什么？](#8--使用选择符查询时要注意什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `Selectors API` 的作用
- `querySelector()`
- `querySelectorAll()`
- 静态 `NodeList`
- `matches()`
- 选择符异常和使用边界

## 2. 🫧 评价

- `Selectors API` 的好处是把你在 CSS 里已经会写的选择符直接带进 DOM 查询。它让查找元素这件事更自然，但选择符仍然要写得清晰、可维护。

## 3. 🤔 `Selectors API` 是什么？

`Selectors API` 让浏览器可以用 CSS 选择符查询 DOM 元素。

在它出现之前，常见 DOM 查询主要依赖 `getElementById()`、`getElementsByTagName()` 等方法。复杂查询通常要自己组合多个 API，或者依赖库解析选择符。

有了 `Selectors API`，你可以直接写 CSS 选择符。

```js
const main = document.querySelector('main')
const selectedItems = document.querySelectorAll('.item.is-selected')
```

这套 API 的优势是表达力强，而且由浏览器原生实现。

## 4. 🤔 `querySelector()` 怎么用？

`querySelector()` 接收一个 CSS 选择符字符串，返回匹配的第一个元素。如果没有匹配项，返回 `null`。

```js
const body = document.querySelector('body')
const app = document.querySelector('#app')
const firstSelected = document.querySelector('.selected')
```

它可以在 `document` 上调用，也可以在某个元素上调用。

```js
const container = document.querySelector('.list')
const button = container.querySelector('button.primary')
```

在元素上调用时，查询范围限制在该元素的后代中。

如果选择符语法错误，或者浏览器不支持某个选择符，调用会抛出异常。

```js
try {
  document.querySelector('???')
} catch (error) {
  console.log('选择符无效')
}
```

## 5. 🤔 `querySelectorAll()` 和 `querySelector()` 有什么区别？

`querySelectorAll()` 返回所有匹配元素组成的 `NodeList`。如果没有匹配项，返回空集合，而不是 `null`。

```js
const buttons = document.querySelectorAll('button')

for (const button of buttons) {
  console.log(button.textContent)
}
```

它可以在 `Document`、`DocumentFragment` 和 `Element` 上调用。

```js
const form = document.querySelector('form')
const fields = form.querySelectorAll('input, select, textarea')
```

访问结果时，可以使用索引，也可以使用 `item()`。

```js
console.log(buttons[0])
console.log(buttons.item(0))
```

和 `querySelector()` 一样，选择符无效时也会抛出异常。

## 6. 🤔 `querySelectorAll()` 返回的是实时集合吗？

不是。

`querySelectorAll()` 返回的是静态 `NodeList` 快照。调用之后，即使 DOM 发生变化，之前拿到的结果也不会自动更新。

```js
const items = document.querySelectorAll('.item')
console.log(items.length)

const item = document.createElement('div')
item.className = 'item'
document.body.appendChild(item)

console.log(items.length) // 仍然是查询时的数量
```

这和 `getElementsByTagName()`、`getElementsByClassName()` 等返回的实时集合不同。

静态快照在遍历时更稳定，因为你不用担心循环过程中 DOM 修改导致集合内容同步变化。

## 7. 🤔 `matches()` 有什么用？

`matches()` 用于判断当前元素是否匹配某个 CSS 选择符。

```js
const button = document.querySelector('button')

if (button.matches('.primary')) {
  console.log('主按钮')
}
```

它返回布尔值：匹配返回 `true`，不匹配返回 `false`。

`matches()` 常用于事件委托。

```js
document.addEventListener('click', (event) => {
  if (event.target.matches('button[data-action]')) {
    console.log(event.target.dataset.action)
  }
})
```

早期浏览器曾经需要带前缀的实现。现代浏览器通常直接支持标准的 `matches()`。

## 8. 🤔 使用选择符查询时要注意什么？

选择符查询很好用，但也有几个边界。

第一，选择符要保持可读。过长、过深的选择符会让 JavaScript 和页面结构强绑定。

```js
document.querySelector('.page > .content > ul > li:nth-child(3) button')
```

这类代码一旦结构变化就很容易失效。

第二，外部输入不能直接拼进选择符。选择符语法有特殊字符，用户输入可能导致异常或错误匹配。

第三，查询结果要按返回类型处理。`querySelector()` 可能返回 `null`，使用前要判断；`querySelectorAll()` 返回集合，即使为空也可以安全遍历。

```js
const dialog = document.querySelector('#dialog')

if (dialog) {
  dialog.classList.add('is-open')
}
```

`Selectors API` 的核心价值是让查询意图更清晰，而不是让所有逻辑都依赖复杂选择符。
