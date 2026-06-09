# [0249. 节点层级](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0249.%20%E8%8A%82%E7%82%B9%E5%B1%82%E7%BA%A7)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. DOM 节点树由什么组成？](#3-dom-节点树由什么组成)
- [4. `Node` 类型提供了哪些基础能力？](#4-node-类型提供了哪些基础能力)
- [5. 如何增删改节点？](#5-如何增删改节点)
- [6. 复制和规范化节点要注意什么？](#6-复制和规范化节点要注意什么)
- [7. `Document` 类型表示什么？](#7-document-类型表示什么)
- [8. `Document` 有哪些常用查询和写入方法？](#8-document-有哪些常用查询和写入方法)
- [9. `Element` 类型表示什么？](#9-element-类型表示什么)
- [10. 如何操作元素属性？](#10-如何操作元素属性)
- [11. 如何创建元素并处理子节点？](#11-如何创建元素并处理子节点)
- [12. `Text` 类型有什么特点？](#12-text-类型有什么特点)
- [13. `Comment` 和 `CDATASection` 有什么用？](#13-comment-和-cdatasection-有什么用)
- [14. `DocumentType` 表示什么？](#14-documenttype-表示什么)
- [15. `DocumentFragment` 适合做什么？](#15-documentfragment-适合做什么)
- [16. `Attr` 类型还重要吗？](#16-attr-类型还重要吗)

<!-- endregion:toc -->

## 1. 本节内容

- DOM 节点树与节点关系
- `Node` 类型的属性和方法
- `Document` 类型与文档信息
- `Element` 类型与元素属性
- `Text`、`Comment`、`CDATASection`
- `DocumentType`、`DocumentFragment`、`Attr`
- 节点创建、移动、复制和规范化

## 2. 评价

- 节点层级是 DOM 的骨架。只要你能清楚地区分节点类型、节点关系和节点操作，后面的 DOM 编程就不会只停留在选择器和改样式的层面。

## 3. DOM 节点树由什么组成？

DOM 把文档表示成节点树。树中的每一部分都是节点，比如文档、元素、文本、注释和文档类型声明。

最顶层通常是 `Document` 节点，也就是全局的 `document` 对象。页面根元素是 `document.documentElement`，HTML 文档中通常对应 `html` 元素。

常见节点类型包括：

| 节点类型           | `nodeType` | 说明                     |
| ------------------ | ---------- | ------------------------ |
| `Element`          | `1`        | 元素节点                 |
| `Attr`             | `2`        | 属性节点                 |
| `Text`             | `3`        | 文本节点                 |
| `CDATASection`     | `4`        | CDATA 节点，主要用于 XML |
| `Comment`          | `8`        | 注释节点                 |
| `Document`         | `9`        | 文档节点                 |
| `DocumentType`     | `10`       | 文档类型节点             |
| `DocumentFragment` | `11`       | 文档片段节点             |

实际开发中最常接触的是 `Document`、`Element`、`Text` 和 `DocumentFragment`。

## 4. `Node` 类型提供了哪些基础能力？

`Node` 是很多 DOM 节点类型的基础接口。每个节点都有一些通用属性。

```js
console.log(node.nodeType)
console.log(node.nodeName)
console.log(node.nodeValue)
```

`nodeType` 用数字表示节点类型。判断元素节点时，常用写法是：

```js
if (node.nodeType === Node.ELEMENT_NODE) {
  console.log('这是元素节点')
}
```

节点关系属性用于在树中导航：

| 属性              | 含义           |
| ----------------- | -------------- |
| `childNodes`      | 子节点集合     |
| `parentNode`      | 父节点         |
| `previousSibling` | 前一个兄弟节点 |
| `nextSibling`     | 后一个兄弟节点 |
| `firstChild`      | 第一个子节点   |
| `lastChild`       | 最后一个子节点 |
| `ownerDocument`   | 节点所属文档   |

需要注意，`childNodes` 是实时的 `NodeList`，并且可能包含空白文本节点。

## 5. 如何增删改节点？

`Node` 提供了几组常用方法。

`appendChild()` 会把节点追加为最后一个子节点。

```js
parent.appendChild(child)
```

如果 `child` 已经在文档中，它不会被复制，而是会从原位置移动到新位置。

`insertBefore()` 可以把节点插入到指定参照节点之前。

```js
parent.insertBefore(newNode, referenceNode)
```

`replaceChild()` 用新节点替换旧节点。

```js
parent.replaceChild(newNode, oldNode)
```

`removeChild()` 会从父节点中移除子节点。

```js
parent.removeChild(child)
```

这些方法返回被插入、替换或移除的节点。移除节点只是让它离开 DOM 树，并不代表变量引用也消失。

## 6. 复制和规范化节点要注意什么？

`cloneNode()` 用于复制节点。

```js
const shallowCopy = element.cloneNode(false)
const deepCopy = element.cloneNode(true)
```

传入 `true` 表示深复制，会复制当前节点及其后代。传入 `false` 表示浅复制，只复制当前节点。

需要注意，`cloneNode()` 通常不会复制通过 JavaScript 添加到对象上的属性，也不会复制通过事件监听器绑定的处理程序。

`normalize()` 用于规范化节点的文本子节点。它会合并相邻文本节点，并移除空文本节点。

```js
element.normalize()
```

这个方法在你频繁拆分、追加文本节点之后比较有用。

## 7. `Document` 类型表示什么？

`Document` 表示整个文档。浏览器中的 `document` 对象通常是 `HTMLDocument` 的实例。

常用属性包括：

| 属性                       | 含义                         |
| -------------------------- | ---------------------------- |
| `document.documentElement` | 文档根元素，HTML 中是 `html` |
| `document.body`            | `body` 元素                  |
| `document.doctype`         | 文档类型声明                 |
| `document.title`           | 页面标题                     |
| `document.URL`             | 当前页面完整 URL             |
| `document.domain`          | 当前页面域名                 |
| `document.referrer`        | 来源页面 URL                 |

`document.domain` 可以被设置为当前域的父域，用于同源策略下某些子域通信场景。但它只能放宽到共同父域，不能随意设置，也不能再收紧。

## 8. `Document` 有哪些常用查询和写入方法？

常见查询方法包括：

```js
const element = document.getElementById('app')
const items = document.getElementsByTagName('li')
const radios = document.getElementsByName('color')
```

`getElementById()` 返回单个元素或 `null`。`getElementsByTagName()` 和 `getElementsByName()` 返回实时集合。

HTML 文档还提供一些特殊集合：

| 集合               | 含义                      |
| ------------------ | ------------------------- |
| `document.anchors` | 带 `name` 属性的 `a` 元素 |
| `document.forms`   | 所有表单                  |
| `document.images`  | 所有图片                  |
| `document.links`   | 带 `href` 属性的 `a` 元素 |

`document.write()` 和 `document.writeln()` 可以向文档输出流写入内容。但页面加载完成后调用它们，可能会重写整个页面，因此现代开发中应尽量避免。

## 9. `Element` 类型表示什么？

`Element` 表示元素节点，是 DOM 编程中最常操作的节点类型。

元素的 `nodeName` 和 `tagName` 通常表示标签名。

```js
console.log(element.tagName)
console.log(element.nodeName)
```

在 HTML 文档中，标签名通常以大写形式返回。跨 HTML 和 XML 文档比较标签名时，更稳妥的方式是统一大小写。

```js
if (element.tagName.toLowerCase() === 'div') {
  console.log('这是 div 元素')
}
```

HTML 元素还常见这些属性：

- `id`
- `title`
- `lang`
- `dir`
- `className`

这些属性既可以通过 DOM 对象访问，也可以通过属性方法访问。

## 10. 如何操作元素属性？

元素属性常用三个方法：

```js
element.getAttribute('id')
element.setAttribute('data-role', 'dialog')
element.removeAttribute('data-role')
```

大多数情况下，属性方法和 DOM 属性访问结果相近。

```js
element.id = 'app'
console.log(element.getAttribute('id'))
```

但也有差异。例如 `style` 通过 DOM 属性访问时是样式对象，通过 `getAttribute('style')` 访问时通常是属性字符串。事件处理属性也可能存在类似差异。

元素还有一个 `attributes` 属性，表示实时的 `NamedNodeMap`。它适合遍历属性或做序列化，但日常开发更推荐使用 `getAttribute()`、`setAttribute()` 和 `removeAttribute()`。

## 11. 如何创建元素并处理子节点？

`document.createElement()` 可以创建元素。

```js
const button = document.createElement('button')
button.textContent = '保存'
document.body.appendChild(button)
```

创建元素只是创建节点对象，只有插入文档后才会影响页面。

遍历元素子节点时要注意空白文本节点。

```js
for (const child of element.childNodes) {
  if (child.nodeType === Node.ELEMENT_NODE) {
    console.log(child.tagName)
  }
}
```

如果你只关心元素节点，现代 DOM 中更常用 `children`、`firstElementChild`、`nextElementSibling` 等属性。但本章的重点仍然是理解通用节点层级。

## 12. `Text` 类型有什么特点？

`Text` 表示文本节点。元素中的文字内容通常就是文本节点。

```js
const text = document.createTextNode('Hello DOM')
element.appendChild(text)
```

文本节点的 `nodeValue` 和 `data` 都可以读写文本内容。

常用字符数据方法包括：

| 方法              | 作用             |
| ----------------- | ---------------- |
| `appendData()`    | 追加文本         |
| `deleteData()`    | 删除指定范围文本 |
| `insertData()`    | 插入文本         |
| `replaceData()`   | 替换指定范围文本 |
| `splitText()`     | 拆分文本节点     |
| `substringData()` | 截取文本         |

通过 `createTextNode()` 创建的内容会作为文本处理，即使里面包含 HTML 片段，也不会被解析成元素。

## 13. `Comment` 和 `CDATASection` 有什么用？

`Comment` 表示注释节点，`nodeType` 为 `8`。它和文本节点一样属于字符数据，但没有 `splitText()`。

```js
const comment = document.createComment('构建时标记')
document.body.appendChild(comment)
```

实际业务中很少主动操作注释节点，但某些框架或工具会用注释作为占位标记。

`CDATASection` 主要用于 XML 文档，用来表示不需要被解析的字符数据。HTML 中通常不需要直接操作它。

## 14. `DocumentType` 表示什么？

`DocumentType` 表示文档类型声明，通常通过 `document.doctype` 访问。

```js
console.log(document.doctype?.name)
```

对 HTML 文档来说，最常用的信息是 `name`。`entities`、`notations` 等属性在普通 HTML 文档中通常没有实际价值。

开发中一般只读取它，不会动态创建或修改它。

## 15. `DocumentFragment` 适合做什么？

`DocumentFragment` 是轻量级文档片段。它可以临时保存一组节点，但自身不会作为真实节点插入页面。

```js
const fragment = document.createDocumentFragment()

for (const item of ['A', 'B', 'C']) {
  const li = document.createElement('li')
  li.textContent = item
  fragment.appendChild(li)
}

list.appendChild(fragment)
```

把 `fragment` 插入页面时，真正转移到页面中的是它的子节点，`fragment` 本身会变空。

它常用于批量构建 DOM，减少多次插入带来的额外成本。

## 16. `Attr` 类型还重要吗？

`Attr` 表示属性节点，`nodeType` 为 `2`。

属性节点有 `name`、`value`、`specified` 等属性。但它不属于 DOM 文档树，`parentNode` 通常是 `null`。

虽然可以用 `document.createAttribute()` 创建属性节点，再通过 `setAttributeNode()` 设置到元素上，但现代开发中更常用简单的属性方法。

```js
element.setAttribute('aria-label', '关闭')
```

理解 `Attr` 有助于完整认识 DOM 类型体系，但日常代码不必优先直接操作属性节点。
