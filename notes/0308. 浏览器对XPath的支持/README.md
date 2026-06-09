# [0308. 浏览器对XPath的支持](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0308.%20%E6%B5%8F%E8%A7%88%E5%99%A8%E5%AF%B9XPath%E7%9A%84%E6%94%AF%E6%8C%81)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. XPath 解决什么问题？](#3-xpath-解决什么问题)
- [4. DOM Level 3 XPath 提供了哪些核心 API？](#4-dom-level-3-xpath-提供了哪些核心-api)
- [5. `XPathResult` 有哪些常见结果类型？](#5-xpathresult-有哪些常见结果类型)
- [6. 如何读取节点迭代器结果？](#6-如何读取节点迭代器结果)
- [7. 如何读取单个节点和简单类型结果？](#7-如何读取单个节点和简单类型结果)
- [8. `ANY_TYPE` 有什么用？](#8-any_type-有什么用)
- [9. 带命名空间的 XML 如何使用 XPath？](#9-带命名空间的-xml-如何使用-xpath)

<!-- endregion:toc -->

## 1. 本节内容

- XPath 的用途
- DOM Level 3 XPath
- `document.evaluate()` 的参数
- `XPathResult` 结果类型
- 节点迭代器、快照、单节点和简单类型结果
- 命名空间解析器

## 2. 评价

- XPath 的价值在于表达力：当 XML 结构层级较深、查询条件较复杂时，用路径表达式定位节点往往比手写 DOM 遍历清楚得多。

## 3. XPath 解决什么问题？

XPath 是一种在 XML 文档中定位节点和计算结果的表达式语言。它可以用路径、条件和函数描述你要找的内容。

例如，假设 XML 中有多个 `employee`，每个员工下有 `name`，那么 XPath 表达式 `employee/name` 可以表示当前上下文下所有员工姓名节点。

如果只用 DOM 方法，你可能需要多层 `getElementsByTagName()` 或手写遍历。XPath 则把查询逻辑集中到表达式里，尤其适合 XML 结构固定、查询路径清晰的场景。

## 4. DOM Level 3 XPath 提供了哪些核心 API？

DOM Level 3 XPath 标准化了在 DOM 中执行 XPath 查询的接口。现代浏览器通常可以直接在 `Document` 对象上调用 `evaluate()`。

```js
const result = xmlDocument.evaluate(
  'employee/name',
  xmlDocument.documentElement,
  null,
  XPathResult.ORDERED_NODE_ITERATOR_TYPE,
  null,
)
```

`evaluate()` 接收五个参数：

| 参数                | 说明                                |
| ------------------- | ----------------------------------- |
| `expression`        | XPath 表达式。                      |
| `contextNode`       | 查询上下文节点。                    |
| `namespaceResolver` | 命名空间解析器，不需要时传 `null`。 |
| `resultType`        | 期望返回的结果类型。                |
| `result`            | 可复用的结果对象，通常传 `null`。   |

另外，`XPathEvaluator` 还定义了 `createExpression()` 和 `createNSResolver()`。前者适合编译重复执行的 XPath 表达式，后者适合根据文档节点创建命名空间解析器。

## 5. `XPathResult` 有哪些常见结果类型？

`evaluate()` 的第四个参数决定返回结果怎么读取。常见类型包括：

| 结果类型 | 读取方式 | 适合场景 |
| --- | --- | --- |
| `ORDERED_NODE_ITERATOR_TYPE` | `iterateNext()` | 按文档顺序逐个读取节点。 |
| `ORDERED_NODE_SNAPSHOT_TYPE` | `snapshotLength`、`snapshotItem()` | 读取一组稳定快照节点。 |
| `FIRST_ORDERED_NODE_TYPE` | `singleNodeValue` | 只需要第一个匹配节点。 |
| `BOOLEAN_TYPE` | `booleanValue` | 判断是否匹配。 |
| `NUMBER_TYPE` | `numberValue` | 获取数值结果。 |
| `STRING_TYPE` | `stringValue` | 获取字符串结果。 |
| `ANY_TYPE` | `resultType` 后再分支处理 | 让浏览器按表达式返回默认类型。 |

结果类型选错时，读取属性和方法也会不对。因此，写 XPath 查询时要先明确自己需要的是节点集合、单个节点，还是简单值。

## 6. 如何读取节点迭代器结果？

节点迭代器适合按顺序读取所有匹配节点。

```js
const result = xmlDocument.evaluate(
  'employee/name',
  xmlDocument.documentElement,
  null,
  XPathResult.ORDERED_NODE_ITERATOR_TYPE,
  null,
)

let node = result.iterateNext()

while (node) {
  console.log(node.textContent)
  node = result.iterateNext()
}
```

`ORDERED_NODE_ITERATOR_TYPE` 会按文档顺序返回节点。没有更多节点时，`iterateNext()` 返回 `null`。

如果查询结果需要在文档修改后仍保持稳定，快照结果更合适。

```js
const result = xmlDocument.evaluate(
  'employee/name',
  xmlDocument.documentElement,
  null,
  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  null,
)

for (let index = 0; index < result.snapshotLength; index++) {
  console.log(result.snapshotItem(index).textContent)
}
```

快照会捕获查询当时的节点集合，后续文档修改不会改变这个快照。

## 7. 如何读取单个节点和简单类型结果？

只需要第一个匹配节点时，可以使用 `FIRST_ORDERED_NODE_TYPE`。

```js
const result = xmlDocument.evaluate(
  'employee/name',
  xmlDocument.documentElement,
  null,
  XPathResult.FIRST_ORDERED_NODE_TYPE,
  null,
)

console.log(result.singleNodeValue?.textContent)
```

XPath 也可以返回布尔值、数值和字符串。

```js
const hasName = xmlDocument.evaluate(
  'boolean(employee/name)',
  xmlDocument.documentElement,
  null,
  XPathResult.BOOLEAN_TYPE,
  null,
)

console.log(hasName.booleanValue)
```

```js
const count = xmlDocument.evaluate(
  'count(employee/name)',
  xmlDocument.documentElement,
  null,
  XPathResult.NUMBER_TYPE,
  null,
)

console.log(count.numberValue)
```

```js
const firstName = xmlDocument.evaluate(
  'employee/name',
  xmlDocument.documentElement,
  null,
  XPathResult.STRING_TYPE,
  null,
)

console.log(firstName.stringValue)
```

字符串结果通常取第一个匹配节点的文本内容。数值结果常配合 `count()` 等 XPath 函数使用。

## 8. `ANY_TYPE` 有什么用？

`XPathResult.ANY_TYPE` 让浏览器根据 XPath 表达式自动选择合适的结果类型。

```js
const result = xmlDocument.evaluate(
  'employee/name',
  xmlDocument.documentElement,
  null,
  XPathResult.ANY_TYPE,
  null,
)

switch (result.resultType) {
  case XPathResult.STRING_TYPE:
    console.log(result.stringValue)
    break
  case XPathResult.NUMBER_TYPE:
    console.log(result.numberValue)
    break
  case XPathResult.BOOLEAN_TYPE:
    console.log(result.booleanValue)
    break
  case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
    console.log(result.iterateNext())
    break
}
```

`ANY_TYPE` 写起来灵活，但读取结果时要多一层判断。业务代码里如果结果类型明确，通常直接指定具体类型更清楚。

## 9. 带命名空间的 XML 如何使用 XPath？

XML 使用命名空间时，XPath 表达式里的前缀必须能解析到对应 URI。否则，即使文档里确实有节点，查询也可能失败。

示例 XML：

```xml
<?xml version="1.0"?>
<wrox:books xmlns:wrox="http://www.wrox.com/">
  <wrox:book>
    <wrox:title>Professional JavaScript for Web Developers</wrox:title>
    <wrox:author>Nicholas C. Zakas</wrox:author>
  </wrox:book>
</wrox:books>
```

可以根据文档元素创建命名空间解析器：

```js
const namespaceResolver = xmlDocument.createNSResolver(
  xmlDocument.documentElement,
)
const result = xmlDocument.evaluate(
  'wrox:book/wrox:author',
  xmlDocument.documentElement,
  namespaceResolver,
  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
  null,
)

console.log(result.snapshotLength)
```

也可以自己提供前缀到 URI 的映射函数：

```js
const namespaceResolver = (prefix) => {
  if (prefix === 'wrox') return 'http://www.wrox.com/'
  return null
}

const result = xmlDocument.evaluate(
  'count(wrox:book/wrox:author)',
  xmlDocument.documentElement,
  namespaceResolver,
  XPathResult.NUMBER_TYPE,
  null,
)

console.log(result.numberValue)
```

当你清楚前缀和 URI 的对应关系时，手写解析函数往往最直接。
