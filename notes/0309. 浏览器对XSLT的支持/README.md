# [0309. 浏览器对XSLT的支持](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0309.%20%E6%B5%8F%E8%A7%88%E5%99%A8%E5%AF%B9XSLT%E7%9A%84%E6%94%AF%E6%8C%81)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 XSLT 解决什么问题？](#3--xslt-解决什么问题)
- [4. 🤔 `XSLTProcessor` 如何执行转换？](#4--xsltprocessor-如何执行转换)
- [5. 🤔 `transformToDocument()` 返回什么？](#5--transformtodocument-返回什么)
- [6. 🤔 `transformToFragment()` 适合什么场景？](#6--transformtofragment-适合什么场景)
- [7. 🤔 XSLT 输出纯文本时怎么处理？](#7--xslt-输出纯文本时怎么处理)
- [8. 🤔 如何给 XSLT 传参数？](#8--如何给-xslt-传参数)
- [9. 🤔 为什么要重置 `XSLTProcessor`？](#9--为什么要重置-xsltprocessor)
- [10. 🤔 使用浏览器 XSLT 时要注意什么？](#10--使用浏览器-xslt-时要注意什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- XSLT 的用途
- `XSLTProcessor` 的基本使用
- `importStylesheet()`
- `transformToDocument()` 与 `transformToFragment()`
- 文本输出的处理方式
- XSLT 参数和处理器重置

## 2. 🫧 评价

- XSLT 是一种很有时代特征的 XML 转换技术；今天不一定高频，但理解 `XSLTProcessor` 能帮助你读懂旧系统里大量 XML 到 HTML 的转换逻辑。

## 3. 🤔 XSLT 解决什么问题？

XSLT 全称是可扩展样式表语言转换，用于把 XML 文档转换成另一种表示形式。

常见转换目标包括：

- XML 到 HTML。
- XML 到另一个 XML 结构。
- XML 到纯文本。

XSLT 通常配合 XPath 使用。XPath 用来选择 XML 中的节点，XSLT 用模板规则描述这些节点应该被转换成什么结果。

在现代前端中，很多 XML 转换任务已经被后端、构建工具或 JSON 数据流取代。但在老系统、文档系统和企业集成场景里，XSLT 仍可能出现。

## 4. 🤔 `XSLTProcessor` 如何执行转换？

浏览器没有统一的正式 DOM XSLT API。`XSLTProcessor` 最早由 Mozilla 实现，后来成为主流浏览器中通过 JavaScript 执行 XSLT 的事实标准。

使用流程通常是：

1. 准备 XML DOM。
2. 准备 XSLT DOM。
3. 创建 `XSLTProcessor`。
4. 调用 `importStylesheet()` 导入样式表。
5. 调用转换方法得到结果。

```js
const processor = new XSLTProcessor()

processor.importStylesheet(xsltDocument)
```

这里的 `xsltDocument` 是已经解析好的 XSLT 文档，通常也可以通过 `DOMParser` 或网络请求得到。

## 5. 🤔 `transformToDocument()` 返回什么？

`transformToDocument()` 会把 XML DOM 转换成一个新的完整 DOM 文档。

```js
const resultDocument = processor.transformToDocument(xmlDocument)
const serializer = new XMLSerializer()

console.log(serializer.serializeToString(resultDocument))
```

如果转换结果本身就是完整文档，例如输出 XML 或 HTML，这种方式比较自然。你可以继续使用 DOM API 查询、修改或序列化结果文档。

## 6. 🤔 `transformToFragment()` 适合什么场景？

`transformToFragment()` 返回文档片段。它接收两个参数：要转换的 XML DOM，以及最终拥有这个片段的目标文档。

```js
const fragment = processor.transformToFragment(xmlDocument, document)
const container = document.getElementById('result')

container.appendChild(fragment)
```

当你想把转换结果插入当前页面时，文档片段很方便。第二个参数传 `document`，可以确保生成的节点属于当前页面文档，能够直接插入页面。

## 7. 🤔 XSLT 输出纯文本时怎么处理？

如果 XSLT 的输出方法是文本，理论上你想拿到的是字符串。但浏览器的 `XSLTProcessor` 并没有直接返回文本的方法。

比较稳妥的方式是使用 `transformToFragment()`，再读取片段中的文本节点。

```js
const fragment = processor.transformToFragment(xmlDocument, document)
const text = fragment.firstChild?.nodeValue ?? ''

console.log(text)
```

这种方式比依赖 `transformToDocument()` 的文本输出结构更稳定，因为不同浏览器历史上对文本输出包装方式并不完全一致。

## 8. 🤔 如何给 XSLT 传参数？

`XSLTProcessor` 提供了 `setParameter()`，可以在转换前设置 XSLT 参数。

```js
const processor = new XSLTProcessor()

processor.importStylesheet(xsltDocument)
processor.setParameter(null, 'message', 'Hello World!')

const resultDocument = processor.transformToDocument(xmlDocument)
```

`setParameter()` 接收三个参数：

| 参数           | 说明                              |
| -------------- | --------------------------------- |
| `namespaceURI` | 参数命名空间 URI，通常传 `null`。 |
| `localName`    | 参数名称。                        |
| `value`        | 参数值。                          |

还可以使用 `getParameter()` 和 `removeParameter()` 读取或移除参数。

```js
console.log(processor.getParameter(null, 'message'))

processor.removeParameter(null, 'message')
```

参数必须在转换前设置。转换完成后再设置，只会影响下一次转换。

## 9. 🤔 为什么要重置 `XSLTProcessor`？

同一个 `XSLTProcessor` 可以复用，但如果要换一套样式表或清空参数，就可以调用 `reset()`。

```js
const processor = new XSLTProcessor()

processor.importStylesheet(firstXsltDocument)
processor.transformToDocument(xmlDocument)

processor.reset()
processor.importStylesheet(secondXsltDocument)
processor.transformToDocument(xmlDocument)
```

`reset()` 会删除当前处理器中的参数和样式表。对于需要多次转换、但样式表不同的场景，复用处理器可以减少重复创建对象的开销。

## 10. 🤔 使用浏览器 XSLT 时要注意什么？

第一，XSLT 是 XML 技术栈的一部分，输入的 XML 和 XSLT 都必须格式良好。

第二，浏览器中的 XSLT 支持有历史兼容性差异。现代项目如果强依赖 XSLT，最好在目标浏览器中实测。

第三，转换结果可能是 XML、HTML 或文本，读取方式要跟输出类型匹配。

第四，XSLT 更适合已有 XML 数据和样式表的场景。如果只是现代前端组件渲染，通常直接用模板、框架或服务端转换会更直观。
