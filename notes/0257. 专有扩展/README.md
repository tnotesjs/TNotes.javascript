# [0257. 专有扩展](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0257.%20%E4%B8%93%E6%9C%89%E6%89%A9%E5%B1%95)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是专有扩展？](#3-什么是专有扩展)
- [4. `children` 有什么用？](#4-children-有什么用)
- [5. 如何判断一个节点是否包含另一个节点？](#5-如何判断一个节点是否包含另一个节点)
- [6. `innerText` 和 `textContent` 有什么区别？](#6-innertext-和-textcontent-有什么区别)
- [7. `outerText` 为什么不常用？](#7-outertext-为什么不常用)
- [8. 有哪些滚动相关专有扩展？](#8-有哪些滚动相关专有扩展)
- [9. 专有扩展在现代代码里应该怎么用？](#9-专有扩展在现代代码里应该怎么用)

<!-- endregion:toc -->

## 1. 本节内容

- 专有扩展的历史背景
- `children`
- `contains()` 和 `compareDocumentPosition()`
- `innerText` 与 `outerText`
- 滚动相关专有扩展
- 专有扩展的现代使用边界

## 2. 评价

- 专有扩展最值得学习的不是“照着用”，而是看清 Web API 的演进方式。能成为标准的能力继续用标准写法，没成为标准的能力就当兼容性背景。

## 3. 什么是专有扩展？

专有扩展是浏览器厂商在标准之外提供的 API。它们通常是为了解决实际开发中标准 API 不够方便的问题。

专有扩展有三种常见结局：

- 被多个浏览器跟进，逐渐成为事实标准。
- 被正式规范吸收，变成标准 API。
- 长期停留在少数浏览器中，最终不再推荐使用。

因此，学习专有扩展时不能只记住“某浏览器支持过”，还要判断它今天是否标准、是否兼容、是否仍值得使用。

## 4. `children` 有什么用？

`children` 返回元素的子元素集合，不包含文本节点和注释节点。

```js
const items = list.children

for (const item of items) {
  console.log(item.tagName)
}
```

它的出现背景和元素遍历类似：开发者经常只想处理元素，而不想被空白文本节点干扰。

`children` 返回的是 `HTMLCollection`。如果某个元素的所有子节点本来都是元素节点，那么 `children` 和 `childNodes` 看起来可能差不多；但只要存在空白文本或注释，两者就会不同。

现代代码中，`children`、`firstElementChild`、`nextElementSibling` 等能力可以一起使用。

## 5. 如何判断一个节点是否包含另一个节点？

`contains()` 可以判断某个节点是否是另一个节点的后代。

```js
console.log(document.documentElement.contains(document.body))
```

在正常 HTML 文档中，`body` 是 `html` 的后代，所以结果是 `true`。

DOM Level 3 还提供了 `compareDocumentPosition()`，它返回位掩码来描述两个节点的关系。

```js
const result = document.documentElement.compareDocumentPosition(document.body)
```

常见掩码包括：

| 掩码   | 含义                   |
| ------ | ---------------------- |
| `0x1`  | 两个节点断开           |
| `0x2`  | 目标节点在参考节点之前 |
| `0x4`  | 目标节点在参考节点之后 |
| `0x8`  | 目标节点包含参考节点   |
| `0x10` | 目标节点被参考节点包含 |

如果只是判断包含关系，`contains()` 更直观；如果需要更完整的节点位置关系，可以使用 `compareDocumentPosition()`。

## 6. `innerText` 和 `textContent` 有什么区别？

`innerText` 表示元素子树中的文本内容。读取时，它更接近页面渲染后的可见文本。

```js
console.log(element.innerText)
```

写入 `innerText` 时，会移除原有子节点，并插入一个文本节点。字符串中的 HTML 语法字符会作为文本处理，不会被解析为元素。

```js
element.innerText = '<strong>不会变成加粗元素</strong>'
```

`textContent` 更接近 DOM 节点中的文本内容，不太关心渲染可见性。现代开发中，两者都常见：

- 要读取或设置节点文本内容，通常优先考虑 `textContent`。
- 要接近用户看到的文本表现时，可以考虑 `innerText`。

具体选择要看需求和兼容性。

## 7. `outerText` 为什么不常用？

`outerText` 读取时通常和 `innerText` 类似。

写入时，它会用新的文本节点替换调用元素本身，而不只是替换元素内部内容。

```js
element.outerText = '替换整个元素'
```

执行后，原元素会从文档树中脱离。

`outerText` 不是现代标准实践中的常用 API，不适合依赖它实现关键逻辑。如果只是设置文本，通常使用 `textContent`；如果要替换节点，使用更明确的 DOM 操作会更清楚。

## 8. 有哪些滚动相关专有扩展？

历史上，一些浏览器提供过滚动相关专有方法。

`scrollIntoViewIfNeeded()` 只在元素不可见时滚动到可见区域。

```js
element.scrollIntoViewIfNeeded?.()
```

它不是标准 API。现代开发中更推荐使用标准的 `scrollIntoView()`。

```js
element.scrollIntoView({
  block: 'nearest',
  inline: 'nearest',
})
```

还有 `scrollByLines()`、`scrollByPages()` 这类按行或按页滚动的方法。它们兼容性有限，现代开发中很少作为首选。

滚动控制更推荐使用标准 DOM 滚动 API、CSS 滚动属性和浏览器原生行为组合完成。

## 9. 专有扩展在现代代码里应该怎么用？

可以按三类处理：

| 类型                 | 建议                               |
| -------------------- | ---------------------------------- |
| 已标准化能力         | 使用标准名称和现代行为             |
| 兼容性有限但项目需要 | 先做能力检测，再提供降级方案       |
| 非标准且可替代       | 只作为历史背景了解，不写入核心逻辑 |

例如：

```js
if ('scrollIntoView' in element) {
  element.scrollIntoView({ block: 'nearest' })
}
```

比起直接依赖某个专有方法，能力检测和标准 API 通常更稳。

专有扩展的学习价值在于理解 Web 平台如何演进，而不是把旧 API 都搬进新项目。
