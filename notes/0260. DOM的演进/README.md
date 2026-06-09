# [0260. DOM的演进](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0260.%20DOM%E7%9A%84%E6%BC%94%E8%BF%9B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. DOM2 和 DOM3 为什么要继续扩展 Core？](#3-dom2-和-dom3-为什么要继续扩展-core)
- [4. XML 命名空间解决什么问题？](#4-xml-命名空间解决什么问题)
- [5. `Node` 有哪些命名空间属性？](#5-node-有哪些命名空间属性)
- [6. `Document` 如何创建和查询命名空间节点？](#6-document-如何创建和查询命名空间节点)
- [7. `Element` 和 `NamedNodeMap` 有哪些命名空间方法？](#7-element-和-namednodemap-有哪些命名空间方法)
- [8. `DocumentType` 和 `Document` 还增加了哪些能力？](#8-documenttype-和-document-还增加了哪些能力)
- [9. `Node` 新增了哪些比较和数据能力？](#9-node-新增了哪些比较和数据能力)
- [10. `iframe.contentDocument` 有什么用？](#10-iframecontentdocument-有什么用)

<!-- endregion:toc -->

## 1. 本节内容

- DOM Level 2 和 DOM Level 3 的变化
- XML 命名空间
- `Node` 的命名空间属性和方法
- `Document`、`Element`、`NamedNodeMap` 的命名空间 API
- `DocumentType`、`Document`、`Node` 的新增能力
- `iframe.contentDocument`

## 2. 评价

- DOM 的演进里最关键的线索是 XML 生态的影响。命名空间相关 API 在普通 HTML 中不常写，但它解释了为什么 DOM 能同时承载 XHTML、SVG 和 MathML 这类不同语言。

## 3. DOM2 和 DOM3 为什么要继续扩展 Core？

DOM1 Core 定义了节点和文档树的基础能力，但它还不足以完整覆盖 XML 生态中的需求。

DOM2 Core 的重点是扩展 DOM1 Core，尤其是支持 XML 命名空间，并补充更完整的文档创建、导入和特性检测能力。

DOM3 Core 又继续增强原有类型，例如节点比较、节点相等判断，以及给节点附加用户数据等能力。

这些变化在普通 HTML 页面里不一定每天用到，但它们构成了现代 DOM 类型体系的一部分。

## 4. XML 命名空间解决什么问题？

XML 命名空间用于避免不同 XML 语言的标签名冲突。

例如，同一个文档中可能同时出现 XHTML 和 SVG。它们都在同一棵 DOM 树里，但属于不同的命名空间。

```xml
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
      <rect width="120" height="80" />
    </svg>
  </body>
</html>
```

默认命名空间通过 `xmlns` 指定，带前缀的命名空间通过 `xmlns:prefix` 指定。

命名空间的核心价值是：同名元素也能根据所属 URI 区分身份。

## 5. `Node` 有哪些命名空间属性？

DOM2 为 `Node` 增加了几个和命名空间相关的属性。

| 属性           | 含义                                  |
| -------------- | ------------------------------------- |
| `localName`    | 不带前缀的节点名                      |
| `namespaceURI` | 节点所属命名空间 URI，没有则为 `null` |
| `prefix`       | 命名空间前缀，没有则为 `null`         |

如果节点有前缀，`nodeName` 通常等于前缀加本地名。

```txt
prefix: svg
localName: rect
nodeName: svg:rect
```

DOM3 还增加了几个查找命名空间的方法。

| 方法                         | 作用                            |
| ---------------------------- | ------------------------------- |
| `isDefaultNamespace(uri)`    | 判断给定 URI 是否为默认命名空间 |
| `lookupNamespaceURI(prefix)` | 根据前缀查找命名空间 URI        |
| `lookupPrefix(uri)`          | 根据命名空间 URI 查找前缀       |

## 6. `Document` 如何创建和查询命名空间节点？

`Document` 提供了带命名空间版本的创建和查询方法。

```js
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

svg.appendChild(rect)
```

常见方法包括：

| 方法                                             | 作用                     |
| ------------------------------------------------ | ------------------------ |
| `createElementNS(namespaceURI, tagName)`         | 创建指定命名空间下的元素 |
| `createAttributeNS(namespaceURI, attributeName)` | 创建指定命名空间下的属性 |
| `getElementsByTagNameNS(namespaceURI, tagName)`  | 查找指定命名空间下的元素 |

这些 API 对创建 SVG、MathML 或 XML 文档尤其重要。

## 7. `Element` 和 `NamedNodeMap` 有哪些命名空间方法？

`Element` 的命名空间方法基本对应普通属性操作，只是多了命名空间参数。

| 方法                       | 作用                             |
| -------------------------- | -------------------------------- |
| `getAttributeNS()`         | 读取指定命名空间下的属性值       |
| `setAttributeNS()`         | 设置指定命名空间下的属性         |
| `removeAttributeNS()`      | 删除指定命名空间下的属性         |
| `hasAttributeNS()`         | 判断指定命名空间下的属性是否存在 |
| `getAttributeNodeNS()`     | 读取指定命名空间下的属性节点     |
| `setAttributeNodeNS()`     | 设置指定命名空间下的属性节点     |
| `getElementsByTagNameNS()` | 查找指定命名空间下的后代元素     |

`NamedNodeMap` 也有对应方法：

- `getNamedItemNS()`
- `setNamedItemNS()`
- `removeNamedItemNS()`

不过实际开发中，很少直接操作 `NamedNodeMap`，更多是通过元素的方法读写属性。

## 8. `DocumentType` 和 `Document` 还增加了哪些能力？

`DocumentType` 增加了几个只读属性：

| 属性             | 含义       |
| ---------------- | ---------- |
| `publicId`       | 公共标识符 |
| `systemId`       | 系统标识符 |
| `internalSubset` | 内部子集   |

`Document` 的变化更多。

`importNode()` 可以把其他文档中的节点导入当前文档，并修正 `ownerDocument`。

```js
const imported = document.importNode(otherDocument.documentElement, true)
document.body.appendChild(imported)
```

`document.defaultView` 指向拥有当前文档的窗口对象。

`document.implementation` 也提供了创建文档相关的方法：

- `createDocumentType()`
- `createDocument()`
- `createHTMLDocument()`

这些能力主要用于构造独立文档、XML 文档或导入跨文档节点。

## 9. `Node` 新增了哪些比较和数据能力？

DOM3 为 `Node` 增加了节点比较方法。

`isSameNode()` 判断两个引用是否指向同一个节点。

```js
node.isSameNode(otherNode)
```

`isEqualNode()` 判断两个节点结构和值是否相等。

```js
node.isEqualNode(clonedNode)
```

简单来说，`isSameNode()` 比较身份，`isEqualNode()` 比较内容和结构。

DOM3 还提供过 `setUserData()` 和 `getUserData()`，用于给 DOM 节点附加用户数据。但现代开发中很少使用，通常会用普通对象、`WeakMap` 或框架状态管理来维护额外数据。

## 10. `iframe.contentDocument` 有什么用？

`iframe.contentDocument` 可以访问内嵌窗格中的文档对象。

```js
const frame = document.querySelector('iframe')
const frameDocument = frame.contentDocument
```

对应的 `contentWindow` 则返回内嵌窗格的窗口对象。

```js
const frameWindow = frame.contentWindow
```

这些访问会受到同源策略限制。如果 iframe 加载的是跨源页面，脚本通常不能读取其中的文档内容。

这也是 DOM 演进里很重要的一点：能力存在不代表任意场景都能访问，安全模型始终会约束 DOM 访问范围。
