# [0262. 遍历](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0262.%20%E9%81%8D%E5%8E%86)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 DOM Traversal 解决什么问题？](#3--dom-traversal-解决什么问题)
- [4. 🤔 如何创建 `NodeIterator`？](#4--如何创建-nodeiterator)
- [5. 🤔 `whatToShow` 怎么控制节点类型？](#5--whattoshow-怎么控制节点类型)
- [6. 🤔 `NodeFilter` 如何过滤节点？](#6--nodefilter-如何过滤节点)
- [7. 🤔 `NodeIterator` 如何移动？](#7--nodeiterator-如何移动)
- [8. 🤔 `TreeWalker` 和 `NodeIterator` 有什么不同？](#8--treewalker-和-nodeiterator-有什么不同)
- [9. 🤔 `TreeWalker` 中 `FILTER_SKIP` 和 `FILTER_REJECT` 有什么区别？](#9--treewalker-中-filter_skip-和-filter_reject-有什么区别)
- [10. 🤔 什么时候选 `NodeIterator`，什么时候选 `TreeWalker`？](#10--什么时候选-nodeiterator什么时候选-treewalker)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- DOM Traversal 的遍历模型
- `NodeIterator`
- `whatToShow`
- `NodeFilter`
- `TreeWalker`
- `FILTER_SKIP` 与 `FILTER_REJECT`
- 遍历器的使用边界

## 2. 🫧 评价

- DOM Traversal 的价值在于把手写递归变成可配置的遍历器。`NodeIterator` 适合一路往前扫，`TreeWalker` 则适合在节点关系之间更灵活地移动。

## 3. 🤔 DOM Traversal 解决什么问题？

手动遍历 DOM 子树通常需要递归，还要判断节点类型、过滤不需要的节点。

DOM Traversal 提供了两个遍历器：`NodeIterator` 和 `TreeWalker`。它们都从指定根节点开始，按深度优先顺序访问 DOM 子树，并且不会越过创建时指定的根节点。

如果以 `document` 为根，可以遍历整个文档；如果以某个元素为根，就只遍历该元素的子树。

## 4. 🤔 如何创建 `NodeIterator`？

`NodeIterator` 通过 `document.createNodeIterator()` 创建。

```js
const iterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  null,
)
```

参数含义如下：

| 参数                       | 含义                                |
| -------------------------- | ----------------------------------- |
| `root`                     | 遍历根节点                          |
| `whatToShow`               | 要访问的节点类型位掩码              |
| `filter`                   | 过滤器对象或函数                    |
| `entityReferenceExpansion` | 是否展开实体引用，HTML 中基本用不到 |

创建后，内部指针位于根节点之前。第一次调用 `nextNode()` 通常会返回根节点本身，前提是它能通过节点类型和过滤器筛选。

## 5. 🤔 `whatToShow` 怎么控制节点类型？

`whatToShow` 是一个位掩码，用来指定遍历时关注哪些节点类型。

常见常量包括：

| 常量                                | 含义         |
| ----------------------------------- | ------------ |
| `NodeFilter.SHOW_ALL`               | 所有节点     |
| `NodeFilter.SHOW_ELEMENT`           | 元素节点     |
| `NodeFilter.SHOW_TEXT`              | 文本节点     |
| `NodeFilter.SHOW_COMMENT`           | 注释节点     |
| `NodeFilter.SHOW_DOCUMENT`          | 文档节点     |
| `NodeFilter.SHOW_DOCUMENT_TYPE`     | 文档类型节点 |
| `NodeFilter.SHOW_DOCUMENT_FRAGMENT` | 文档片段节点 |

除 `SHOW_ALL` 外，可以用按位或组合多个类型。

```js
const iterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
)
```

## 6. 🤔 `NodeFilter` 如何过滤节点？

过滤器可以是带 `acceptNode()` 方法的对象，也可以是函数。

```js
const filter = {
  acceptNode(node) {
    return node.tagName === 'P'
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  },
}

const iterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  filter,
)
```

返回值包括：

| 返回值                     | 含义         |
| -------------------------- | ------------ |
| `NodeFilter.FILTER_ACCEPT` | 接受当前节点 |
| `NodeFilter.FILTER_SKIP`   | 跳过当前节点 |
| `NodeFilter.FILTER_REJECT` | 拒绝当前节点 |

在 `NodeIterator` 中，`FILTER_SKIP` 和 `FILTER_REJECT` 的效果基本相同，都是当前节点不出现在结果中。

## 7. 🤔 `NodeIterator` 如何移动？

`nextNode()` 向前移动，返回下一个符合条件的节点。结束时返回 `null`。

```js
let node

while ((node = iterator.nextNode())) {
  console.log(node.nodeName)
}
```

`previousNode()` 向后移动，返回上一个符合条件的节点。退到开头前也会返回 `null`。

```js
const previous = iterator.previousNode()
```

如果遍历过程中 DOM 结构发生变化，遍历器会根据当前 DOM 状态继续工作。这一点在动态页面中要留意。

## 8. 🤔 `TreeWalker` 和 `NodeIterator` 有什么不同？

`TreeWalker` 通过 `document.createTreeWalker()` 创建，参数和 `createNodeIterator()` 基本相同。

```js
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
```

它也支持 `nextNode()` 和 `previousNode()`，但额外提供了方向性导航方法。

| 方法                | 作用                 |
| ------------------- | -------------------- |
| `parentNode()`      | 移动到父节点         |
| `firstChild()`      | 移动到第一个子节点   |
| `lastChild()`       | 移动到最后一个子节点 |
| `nextSibling()`     | 移动到下一个兄弟节点 |
| `previousSibling()` | 移动到上一个兄弟节点 |

`currentNode` 表示当前节点，也可以手动设置它来改变后续遍历起点。

```js
walker.currentNode = document.querySelector('main')
```

## 9. 🤔 `TreeWalker` 中 `FILTER_SKIP` 和 `FILTER_REJECT` 有什么区别？

在 `TreeWalker` 中，`FILTER_SKIP` 和 `FILTER_REJECT` 的区别更明显。

`FILTER_SKIP` 表示跳过当前节点，但仍然可能访问它的子节点。

`FILTER_REJECT` 表示跳过当前节点以及它的整个子树。

```js
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  (node) => {
    if (node.matches('.ignore-subtree')) {
      return NodeFilter.FILTER_REJECT
    }

    if (node.matches('.skip-self')) {
      return NodeFilter.FILTER_SKIP
    }

    return NodeFilter.FILTER_ACCEPT
  },
)
```

这个差异让 `TreeWalker` 更适合需要精确控制子树访问的场景。

## 10. 🤔 什么时候选 `NodeIterator`，什么时候选 `TreeWalker`？

如果你只是想按顺序扫描一棵 DOM 子树，`NodeIterator` 更简单。

如果你需要在父节点、子节点、兄弟节点之间来回移动，或者需要更精细地控制跳过节点和跳过子树，`TreeWalker` 更合适。

现代项目中，这些 API 不一定高频出现，但在编写编辑器、文档处理器、代码高亮、目录生成、搜索替换等工具时，它们会比手写递归更清晰。
