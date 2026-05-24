# [0256. HTML5](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0256.%20HTML5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 HTML5 为什么会扩展 DOM？](#3--html5-为什么会扩展-dom)
- [4. 🤔 `getElementsByClassName()` 怎么用？](#4--getelementsbyclassname-怎么用)
- [5. 🤔 `classList` 比 `className` 好在哪里？](#5--classlist-比-classname-好在哪里)
- [6. 🤔 如何管理页面焦点？](#6--如何管理页面焦点)
- [7. 🤔 `HTMLDocument` 有哪些常用扩展？](#7--htmldocument-有哪些常用扩展)
- [8. 🤔 如何读取文档字符集？](#8--如何读取文档字符集)
- [9. 🤔 自定义数据属性怎么用？](#9--自定义数据属性怎么用)
- [10. 🤔 `innerHTML` 有什么特点？](#10--innerhtml-有什么特点)
- [11. 🤔 `outerHTML` 和 `innerHTML` 有什么不同？](#11--outerhtml-和-innerhtml-有什么不同)
- [12. 🤔 `insertAdjacentHTML()` 和 `insertAdjacentText()` 怎么用？](#12--insertadjacenthtml-和-insertadjacenttext-怎么用)
- [13. 🤔 插入标记有哪些性能和内存注意点？](#13--插入标记有哪些性能和内存注意点)
- [14. 🤔 `scrollIntoView()` 有什么用？](#14--scrollintoview-有什么用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- HTML5 DOM 扩展概览
- CSS 类扩展
- 焦点管理
- `HTMLDocument` 扩展
- 字符集属性
- 自定义数据属性
- 插入标记
- `scrollIntoView()`
- 安全、内存和性能注意点

## 2. 🫧 评价

- HTML5 的 DOM 扩展把大量日常需求变成了标准能力。写现代 DOM 代码时，`classList`、`dataset`、`querySelector`、`scrollIntoView` 这类 API 往往比底层节点操作更贴近你的真实意图。

## 3. 🤔 HTML5 为什么会扩展 DOM？

HTML5 不只定义标记，也定义了很多和页面开发相关的 JavaScript API。

其中一部分 API 专门扩展 DOM，让开发者更方便地处理类名、焦点、文档状态、字符集、自定义属性、标记插入和滚动定位。

很多能力在进入 HTML5 之前，已经是浏览器长期支持的事实标准。HTML5 的作用是把它们整理进更统一的规范里。

## 4. 🤔 `getElementsByClassName()` 怎么用？

`getElementsByClassName()` 可以按类名查找元素。它可以在 `document` 上调用，也可以在元素上调用。

```js
const selectedItems = document.getElementsByClassName('selected')
const buttons = toolbar.getElementsByClassName('button')
```

参数可以包含多个类名，表示元素必须同时拥有这些类名。

```js
const activeCards = document.getElementsByClassName('card active')
```

类名顺序不重要。

需要注意，它返回的是集合，不是单个元素。不同浏览器和场景下，这类集合通常具有实时集合特征，遍历时仍然要注意 DOM 修改带来的影响。

## 5. 🤔 `classList` 比 `className` 好在哪里？

`className` 把全部类名当作一个字符串处理。添加、删除某个类名时，很容易写出重复类名或误删其他类名。

`classList` 提供了更直接的类名操作方式。它的类型是 `DOMTokenList`。

```js
element.classList.add('is-active')
element.classList.remove('is-hidden')
element.classList.toggle('is-open')
console.log(element.classList.contains('is-active'))
```

常用方法包括：

| 方法         | 作用             |
| ------------ | ---------------- |
| `add()`      | 添加类名         |
| `remove()`   | 删除类名         |
| `toggle()`   | 有则删、无则加   |
| `contains()` | 判断类名是否存在 |

如果只是局部增删类名，优先使用 `classList`。只有需要整体重写类名字符串时，才考虑直接设置 `className`。

## 6. 🤔 如何管理页面焦点？

`document.activeElement` 指向当前拥有焦点的元素。

```js
console.log(document.activeElement)
```

可以配合元素的 `focus()` 方法使用。

```js
const input = document.querySelector('input[name="email"]')
input.focus()
console.log(document.activeElement === input)
```

页面刚加载完成时，焦点通常在 `document.body` 上；页面加载前，`activeElement` 也可能是 `null`。

`document.hasFocus()` 用来判断当前文档是否拥有焦点。

```js
if (document.hasFocus()) {
  console.log('用户正在当前页面中')
}
```

焦点管理对表单、弹窗、键盘操作和无障碍体验都很重要。

## 7. 🤔 `HTMLDocument` 有哪些常用扩展？

`document.readyState` 表示文档加载状态。

```js
console.log(document.readyState)
```

常见值包括：

| 值         | 含义         |
| ---------- | ------------ |
| `loading`  | 文档正在加载 |
| `complete` | 文档加载完成 |

现代浏览器中还常见 `interactive`，表示文档已经解析完成，但子资源可能仍在加载。

`document.compatMode` 表示浏览器渲染模式。

```js
console.log(document.compatMode)
```

常见值包括：

| 值           | 含义     |
| ------------ | -------- |
| `CSS1Compat` | 标准模式 |
| `BackCompat` | 混杂模式 |

`document.head` 指向文档的 `head` 元素。

```js
document.head.appendChild(document.createElement('meta'))
```

它和 `document.body` 一样，是访问常用文档区域的快捷方式。

## 8. 🤔 如何读取文档字符集？

现代浏览器通常使用 `document.characterSet` 读取文档实际字符集。

```js
console.log(document.characterSet)
```

历史上还存在 `defaultCharset` 等兼容属性，用来表示默认字符集。

在现代页面中，字符集通常由响应头或 `meta` 信息决定。实际开发里更常见的做法是确保文档统一使用 `UTF-8`，而不是在运行时频繁修改字符集。

## 9. 🤔 自定义数据属性怎么用？

HTML5 允许使用 `data-*` 属性存放和页面元素相关的自定义数据。

```html
<button data-action="save" data-user-id="42">保存</button>
```

在 JavaScript 中可以通过 `dataset` 访问。

```js
const button = document.querySelector('button')

console.log(button.dataset.action)
console.log(button.dataset.userId)

button.dataset.state = 'loading'
```

命名转换规则是：`data-user-id` 会映射为 `dataset.userId`。

需要注意，`dataset` 中的值本质上是字符串。复杂对象不适合直接塞进属性里，更适合放在 JavaScript 状态或数据层中。

## 10. 🤔 `innerHTML` 有什么特点？

读取 `innerHTML` 时，会得到元素后代对应的 HTML 字符串。

```js
console.log(container.innerHTML)
```

写入 `innerHTML` 时，浏览器会把字符串解析为 DOM 子树，并替换元素原有的所有子节点。

```js
container.innerHTML = '<p>新的内容</p>'
```

它适合一次性插入大量标记，通常比逐个创建节点更快。

但它也有明显风险：

- 会替换原有子节点。
- 被移除节点上的事件处理和对象引用需要注意清理。
- 不同浏览器序列化 HTML 字符串的结果可能不完全一致。
- 不能直接写入未处理的用户输入，否则可能造成 XSS。

::: tip 安全提醒

即使动态插入的 `&lt;script&gt;` 标记通常不会按你期待的方式执行，`innerHTML` 仍然可能通过事件属性、链接协议等方式引入安全风险。用户输入必须先转义或净化。

:::

## 11. 🤔 `outerHTML` 和 `innerHTML` 有什么不同？

`innerHTML` 操作的是元素内部。

`outerHTML` 操作的是元素自身以及它的后代。

```js
const message = document.querySelector('.message')
console.log(message.outerHTML)

message.outerHTML = '<section class="message">已替换</section>'
```

写入 `outerHTML` 会用解析后的新节点替换调用元素本身。替换后，原元素会从文档树中脱离。

如果你还保存着原元素变量，它仍然引用旧对象，但这个旧对象已经不在页面中。

## 12. 🤔 `insertAdjacentHTML()` 和 `insertAdjacentText()` 怎么用？

`insertAdjacentHTML()` 可以在相对于当前元素的指定位置插入 HTML。

```js
container.insertAdjacentHTML('beforeend', '<p>追加内容</p>')
```

第一个参数是插入位置：

| 位置          | 含义                             |
| ------------- | -------------------------------- |
| `beforebegin` | 当前元素前面，作为前一个兄弟节点 |
| `afterbegin`  | 当前元素内部，作为第一个子节点   |
| `beforeend`   | 当前元素内部，作为最后一个子节点 |
| `afterend`    | 当前元素后面，作为后一个兄弟节点 |

`insertAdjacentText()` 位置参数相同，但第二个参数会作为纯文本插入，不会被解析成 HTML。

```js
container.insertAdjacentText('beforeend', '<p>这会作为文本出现</p>')
```

如果你要插入的是用户可控内容，优先使用文本方式或先做严格净化。

## 13. 🤔 插入标记有哪些性能和内存注意点？

一次性设置 `innerHTML` 通常比循环创建大量节点更快，因为 HTML 解析器由浏览器底层实现。

但不要在循环里反复拼接并写回 `innerHTML`。

```js
let html = ''

for (const item of items) {
  html += `<li>${item}</li>`
}

list.innerHTML = html
```

这比下面这种反复读取、拼接、解析、重建的方式更好：

```js
for (const item of items) {
  list.innerHTML += `<li>${item}</li>`
}
```

如果被替换的 DOM 子树上绑定了事件或保存了外部引用，替换前要考虑清理，避免旧节点仍被引用。

## 14. 🤔 `scrollIntoView()` 有什么用？

`scrollIntoView()` 可以滚动页面或滚动容器，让目标元素进入可见区域。

```js
const errorField = document.querySelector('.field-error')
errorField.scrollIntoView()
```

传入布尔值时：

| 参数    | 含义               |
| ------- | ------------------ |
| `true`  | 顶部对齐，默认行为 |
| `false` | 底部对齐           |

现代浏览器还支持对象参数。

```js
errorField.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
})
```

常见配置包括：

- `behavior`：`auto` 或 `smooth`。
- `block`：垂直方向的对齐方式。
- `inline`：水平方向的对齐方式。

它适合表单校验失败、目录跳转、搜索定位等场景。
