# [0307. 浏览器对XML DOM的支持](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0307.%20%E6%B5%8F%E8%A7%88%E5%99%A8%E5%AF%B9XML%20DOM%E7%9A%84%E6%94%AF%E6%8C%81)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 DOM Level 2 Core 如何创建 XML 文档？](#3--dom-level-2-core-如何创建-xml-文档)
- [4. 🤔 `DOMParser` 如何解析 XML 字符串？](#4--domparser-如何解析-xml-字符串)
- [5. 🤔 如何检测 XML 解析错误？](#5--如何检测-xml-解析错误)
- [6. 🤔 `XMLSerializer` 如何序列化 DOM？](#6--xmlserializer-如何序列化-dom)
- [7. 🤔 XML DOM 和 HTML DOM 有什么使用差异？](#7--xml-dom-和-html-dom-有什么使用差异)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- DOM Level 2 Core 创建 XML 文档
- `document.implementation.createDocument()`
- `DOMParser` 解析 XML 字符串
- XML 解析错误检测
- `XMLSerializer` 序列化 DOM 文档

## 2. 🫧 评价

- XML DOM 的 API 看起来像在操作普通 DOM，这正是它的价值；只要文档被解析成节点树，后续读写就回到了熟悉的 DOM 编程模型。

## 3. 🤔 DOM Level 2 Core 如何创建 XML 文档？

DOM Level 2 Core 在 `document.implementation` 上提供了 `createDocument()`，可以创建一个新的 XML 文档。

```js
const xmlDocument = document.implementation.createDocument('', 'root', null)

console.log(xmlDocument.documentElement.tagName) // 'root'
```

`createDocument()` 接收三个参数：

| 参数            | 说明                                                 |
| --------------- | ---------------------------------------------------- |
| `namespaceURI`  | 文档元素的命名空间 URI，不使用命名空间时传空字符串。 |
| `qualifiedName` | 文档元素的标签名。                                   |
| `doctype`       | 文档类型，不需要时传 `null`。                        |

创建出的对象是一个 XML `Document`，可以使用常见 DOM 方法操作。

```js
const child = xmlDocument.createElement('child')

xmlDocument.documentElement.appendChild(child)
```

实践中，凭空创建 XML 文档再一点点拼节点并不常见。更常见的需求是把已有 XML 字符串解析成 DOM，或者把 DOM 序列化回 XML 字符串。

## 4. 🤔 `DOMParser` 如何解析 XML 字符串？

`DOMParser` 用于把字符串解析成 DOM 文档。

```js
const parser = new DOMParser()
const xmlDocument = parser.parseFromString('<root><child/></root>', 'text/xml')

console.log(xmlDocument.documentElement.tagName) // 'root'
console.log(xmlDocument.documentElement.firstElementChild.tagName) // 'child'
```

解析完成后，就可以像操作普通 DOM 一样读取和修改 XML DOM。

```js
const anotherChild = xmlDocument.createElement('child')

xmlDocument.documentElement.appendChild(anotherChild)

const children = xmlDocument.getElementsByTagName('child')

console.log(children.length) // 2
```

解析 XML 时，内容类型应该使用 `text/xml`、`application/xml` 或具体 XML MIME 类型。不要把 XML 解析当成 HTML 解析；XML 要求格式良好，标签闭合、大小写、嵌套结构都更严格。

## 5. 🤔 如何检测 XML 解析错误？

`DOMParser` 只能可靠解析格式良好的 XML。解析失败时，不同浏览器的历史行为并不完全一致：有的会返回包含 `parsererror` 元素的文档，有的早期实现可能直接抛错。

比较稳妥的做法是结合 `try/catch` 和 `parsererror` 检查。

```js
function parseXml(xmlText) {
  const parser = new DOMParser()
  const xmlDocument = parser.parseFromString(xmlText, 'text/xml')
  const errors = xmlDocument.getElementsByTagName('parsererror')

  if (errors.length > 0) {
    throw new Error(errors[0].textContent || 'XML parsing failed')
  }

  return xmlDocument
}

try {
  parseXml('<root>')
} catch (error) {
  console.log(error.message)
}
```

这里的重点不是完全统一所有浏览器的错误格式，而是不要在解析失败后继续把错误文档当成正常 XML 使用。

## 6. 🤔 `XMLSerializer` 如何序列化 DOM？

`XMLSerializer` 做的是 `DOMParser` 的反向工作：把 DOM 节点序列化成 XML 字符串。

```js
const serializer = new XMLSerializer()
const xmlText = serializer.serializeToString(xmlDocument)

console.log(xmlText)
```

`serializeToString()` 可以接收 XML 文档、元素节点、普通 DOM 节点，甚至 HTML 文档。传入 HTML 文档时，会按照 XML 规则序列化，因此结果会是格式良好的 XML 风格字符串。

需要注意的是，如果传入的不是 DOM 对象，会抛出错误。

```js
const serializer = new XMLSerializer()

try {
  serializer.serializeToString({})
} catch (error) {
  console.log('只能序列化 DOM 节点')
}
```

## 7. 🤔 XML DOM 和 HTML DOM 有什么使用差异？

XML DOM 和 HTML DOM 都是节点树，但 XML 的规则更严格。

| 差异       | XML DOM        | HTML DOM                          |
| ---------- | -------------- | --------------------------------- |
| 标签大小写 | 区分大小写。   | HTML 元素名通常不敏感。           |
| 标签闭合   | 必须格式良好。 | 浏览器会容错修复。                |
| 自定义标签 | 天然允许。     | HTML 有自己的元素语义和解析规则。 |
| 命名空间   | 很常见。       | 普通 HTML 中较少直接处理。        |

因此，处理 XML 时要更重视格式正确性和命名空间。如果 XML 来自外部系统，解析前后都要考虑错误处理和兼容性。
