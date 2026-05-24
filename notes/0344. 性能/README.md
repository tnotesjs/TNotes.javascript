# [0344. 性能](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0344.%20%E6%80%A7%E8%83%BD)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 JavaScript 性能优化应该先看什么？](#3--javascript-性能优化应该先看什么)
- [4. 🤔 为什么要避免频繁全局查找？](#4--为什么要避免频繁全局查找)
- [5. 🤔 为什么不要使用 `with`？](#5--为什么不要使用-with)
- [6. 🤔 为什么要避免不必要的属性查找？](#6--为什么要避免不必要的属性查找)
- [7. 🤔 循环应该怎么优化？](#7--循环应该怎么优化)
- [8. 🤔 什么是循环展开？](#8--什么是循环展开)
- [9. 🤔 为什么要避免重复解释 JavaScript 字符串？](#9--为什么要避免重复解释-javascript-字符串)
- [10. 🤔 为什么要减少语句数量？](#10--为什么要减少语句数量)
- [11. 🤔 为什么 DOM 交互通常很慢？](#11--为什么-dom-交互通常很慢)
- [12. 🤔 `innerHTML` 为什么快，但也危险？](#12--innerhtml-为什么快但也危险)
- [13. 🤔 为什么事件委托有助于性能？](#13--为什么事件委托有助于性能)
- [14. 🤔 为什么要小心 `HTMLCollection`？](#14--为什么要小心-htmlcollection)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- JavaScript 性能优化的背景
- 作用域链和全局查找
- 属性查找和算法复杂度
- 循环优化和循环展开
- 避免重复解释
- 减少语句数量
- 优化 DOM 交互
- 事件委托和 `HTMLCollection`

## 2. 🫧 评价

- 性能优化最怕只记技巧不看场景；真正要紧的是先识别热点，再减少查找、循环、解释和 DOM 实时更新这些高频成本。

## 3. 🤔 JavaScript 性能优化应该先看什么？

现代 JavaScript 引擎已经很快，但仍然可能写出慢代码。性能问题通常来自几个方向：

- 算法复杂度不合适。
- 重复做昂贵查询。
- 循环里做了太多无关工作。
- 频繁解释字符串形式的代码。
- 语句和对象创建过多。
- DOM 实时更新次数太多。

优化时不要盲目套技巧。更稳妥的顺序是：先定位热点，再优化热点；先保证可读性，再处理确实影响体验的性能问题。

## 4. 🤔 为什么要避免频繁全局查找？

JavaScript 查找变量时会沿作用域链向外查找。访问全局变量通常比访问局部变量慢，因为它需要走到作用域链末端。

如果一个函数频繁使用同一个全局对象，可以先保存到局部变量中。

```js
function updateImages() {
  const doc = document
  const images = doc.getElementsByTagName('img')

  for (let index = 0, length = images.length; index < length; index += 1) {
    images[index].title = `${doc.title} image ${index}`
  }

  doc.getElementById('message').textContent = 'Update complete.'
}
```

经验上，如果函数中引用某个全局对象超过两次，就可以考虑把它缓存到局部变量中。现代引擎可能已经做了很多优化，但这个原则仍能提醒你减少不必要的查找和重复访问。

## 5. 🤔 为什么不要使用 `with`？

`with` 会创建新的作用域，让其中的标识符查找更复杂，也会让代码含义不清楚。

不推荐：

```js
function updateBody() {
  with (document.body) {
    console.log(tagName)
    innerHTML = 'Hello world!'
  }
}
```

推荐使用局部变量：

```js
function updateBody() {
  const body = document.body

  console.log(body.tagName)
  body.textContent = 'Hello world!'
}
```

局部变量既能减少全局查找，也让属性属于谁更加明确。现代代码中应避免使用 `with`，严格模式也禁止使用它。

## 6. 🤔 为什么要避免不必要的属性查找？

读取变量和数组索引通常很快；访问对象属性则可能涉及属性查找和原型链查找。单次属性访问通常不是问题，但在高频代码中重复访问同一路径就会浪费。

不推荐：

```js
const query = window.location.href.substring(window.location.href.indexOf('?'))
```

更好：

```js
const url = window.location.href
const query = url.substring(url.indexOf('?'))
```

类似地，在循环里应该避免重复读取同一个属性。

```js
for (let index = 0, length = items.length; index < length; index += 1) {
  process(items[index])
}
```

这类优化的核心是：如果某个值会被重复使用，就先保存起来。

## 7. 🤔 循环应该怎么优化？

循环会重复执行同一段代码，因此循环中的每一点成本都会被放大。

优化循环可以从三个角度入手：

- 简化终止条件，避免每次循环都做属性查找或复杂计算。
- 简化循环体，把无关计算移到循环外。
- 在确实合适时使用后测试循环，例如 `do...while`。

不推荐在循环条件里重复做昂贵操作：

```js
for (let index = 0; index < getItems().length; index += 1) {
  process(getItems()[index])
}
```

更好：

```js
const items = getItems()

for (let index = 0, length = items.length; index < length; index += 1) {
  process(items[index])
}
```

原书提到倒序循环、后测试循环和循环展开等技巧。这些技巧在旧浏览器或超大数据处理中可能有意义；在现代浏览器里，正序还是倒序通常不会有明显差异。优先选择最符合逻辑、最清楚的写法，然后只在性能数据证明有必要时做更激进优化。

## 8. 🤔 什么是循环展开？

循环展开是把多次循环变成多条直接语句，以减少循环控制开销。

如果数组长度固定，可以这样写：

```js
process(values[0])
process(values[1])
process(values[2])
```

而不是：

```js
for (let index = 0; index < 3; index += 1) {
  process(values[index])
}
```

对于大型数据集，也可以一次循环处理多个元素。

```js
for (let index = 0; index < values.length; index += 4) {
  process(values[index])
  process(values[index + 1])
  process(values[index + 2])
  process(values[index + 3])
}
```

但循环展开会降低可读性，也容易处理不好边界。只有当数据量很大、逻辑简单且性能收益明确时，才值得考虑。

## 9. 🤔 为什么要避免重复解释 JavaScript 字符串？

`eval()`、`Function` 构造函数和字符串形式的 `setTimeout()` 都会把字符串当作 JavaScript 代码再次解析。这样会带来额外解析成本，也会增加安全风险。

不推荐：

```js
eval("console.log('Hello world!')")

const sayHi = new Function("console.log('Hello world!')")

setTimeout("console.log('Hello world!')", 500)
```

推荐直接写代码或传函数：

```js
console.log('Hello world!')

const sayHi = function () {
  console.log('Hello world!')
}

setTimeout(() => {
  console.log('Hello world!')
}, 500)
```

除非有非常明确的需求，否则不要把字符串交给 JavaScript 引擎再次解释。

## 10. 🤔 为什么要减少语句数量？

语句数量会影响脚本执行速度。能用一条清晰语句完成的事情，不必拆成多条机械语句。

多个变量可以合并声明。

```js
const count = 5
const color = 'blue'
const values = [1, 2, 3]
const now = new Date()
```

在现代项目里，为了可读性也可以保留多行声明；构建工具会处理压缩。原书强调的重点是不要写出明显冗余、机械重复的语句。

可以把迭代值合并到使用它的语句中。

```js
const name = names[index++]
```

也应该优先使用数组和对象字面量，而不是先创建再逐项赋值。

```js
const values = [123, 456, 789]

const user = {
  name: 'Nicholas',
  age: 29,
  sayName() {
    console.log(this.name)
  },
}
```

减少语句数量不应该变成把所有逻辑挤进一行。可读性和性能之间要保持平衡。

## 11. 🤔 为什么 DOM 交互通常很慢？

DOM 操作不仅是 JavaScript 执行问题，还可能触发布局、样式计算和页面重新绘制。只要操作影响页面显示，就可能发生实时更新。

不推荐在循环中逐个更新真实 DOM：

```js
const list = document.querySelector('#list')

for (let index = 0; index < 10; index += 1) {
  const item = document.createElement('li')

  item.textContent = `Item ${index}`
  list.appendChild(item)
}
```

更好的方式是先在文档片段中构建，再一次性插入。

```js
const list = document.querySelector('#list')
const fragment = document.createDocumentFragment()

for (let index = 0; index < 10; index += 1) {
  const item = document.createElement('li')

  item.textContent = `Item ${index}`
  fragment.appendChild(item)
}

list.appendChild(fragment)
```

核心原则是减少真实 DOM 的实时更新次数。

## 12. 🤔 `innerHTML` 为什么快，但也危险？

大量创建 DOM 节点时，`innerHTML` 往往比多次调用 DOM 方法更快，因为浏览器可以用原生 HTML 解析器批量创建节点。

```js
const list = document.querySelector('#list')
let html = ''

for (let index = 0; index < 10; index += 1) {
  html += `<li>Item ${index}</li>`
}

list.innerHTML = html
```

关键是只赋值一次，不要在循环里反复读写 `innerHTML`。

```js
// 不推荐
for (let index = 0; index < 10; index += 1) {
  list.innerHTML += `<li>Item ${index}</li>`
}
```

同时要特别注意：如果内容来自用户输入或不可信数据，使用 `innerHTML` 可能导致 XSS。处理不可信内容时，应优先使用 `textContent` 或可靠的 HTML 清理方案。

## 13. 🤔 为什么事件委托有助于性能？

页面中事件处理程序越多，占用的内存和注册成本就越高。事件委托利用事件冒泡，把多个子元素的事件交给一个祖先元素处理。

```js
const list = document.querySelector('#list')

list.addEventListener('click', (event) => {
  const item = event.target.closest('li')

  if (!item || !list.contains(item)) {
    return
  }

  selectItem(item)
})
```

相比给每个 `li` 都绑定处理程序，事件委托只需要一个处理程序，更适合动态列表和大量节点。

## 14. 🤔 为什么要小心 `HTMLCollection`？

`HTMLCollection` 通常是实时集合。访问它的属性或方法，可能触发浏览器重新查询文档。

常见返回 `HTMLCollection` 或类似实时集合的场景包括：

- `getElementsByTagName()`。
- 某些元素集合属性。
- `document.forms`、`document.images` 等特殊集合。

不推荐在循环条件里反复读取实时集合长度。

```js
const images = document.getElementsByTagName('img')

for (let index = 0; index < images.length; index += 1) {
  process(images[index])
}
```

更好：

```js
const images = document.getElementsByTagName('img')

for (let index = 0, length = images.length; index < length; index += 1) {
  const image = images[index]

  process(image)
}
```

如果不需要实时性，也可以把集合转换为数组快照。

```js
const images = Array.from(document.getElementsByTagName('img'))
```

这样可以避免后续操作不断触发实时集合查询。
