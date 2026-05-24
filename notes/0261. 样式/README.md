# [0261. 样式](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0261.%20%E6%A0%B7%E5%BC%8F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 DOM Style 关注哪些样式来源？](#3--dom-style-关注哪些样式来源)
- [4. 🤔 `element.style` 表示什么？](#4--elementstyle-表示什么)
- [5. 🤔 `CSSStyleDeclaration` 有哪些常用方法？](#5--cssstyledeclaration-有哪些常用方法)
- [6. 🤔 如何读取计算样式？](#6--如何读取计算样式)
- [7. 🤔 如何访问样式表？](#7--如何访问样式表)
- [8. 🤔 如何操作 CSS 规则？](#8--如何操作-css-规则)
- [9. 🤔 偏移尺寸是什么？](#9--偏移尺寸是什么)
- [10. 🤔 客户端尺寸和滚动尺寸有什么区别？](#10--客户端尺寸和滚动尺寸有什么区别)
- [11. 🤔 `getBoundingClientRect()` 有什么用？](#11--getboundingclientrect-有什么用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- DOM Style 概览
- 元素内联样式和 `CSSStyleDeclaration`
- 计算样式
- 样式表和 CSS 规则
- 样式规则插入与删除
- 偏移尺寸、客户端尺寸、滚动尺寸
- `getBoundingClientRect()`

## 2. 🫧 评价

- DOM 样式 API 最重要的分界是“你读的是哪一层样式”。内联样式、计算样式、样式表规则看起来都和 CSS 有关，但读写权限、结果含义和性能成本完全不同。

## 3. 🤔 DOM Style 关注哪些样式来源？

页面样式通常来自三个地方：

- 外部样式表。
- 文档中的样式块。
- 元素自身的 `style` 属性。

DOM Style 提供了访问这些样式的 API。你可以修改元素内联样式，读取计算后的最终样式，也可以访问样式表和 CSS 规则。

这几类能力看起来都在操作 CSS，但要区分清楚：

| API                    | 代表什么         | 能否直接修改 |
| ---------------------- | ---------------- | ------------ |
| `element.style`        | 元素内联样式     | 可以         |
| `getComputedStyle()`   | 计算后的最终样式 | 不可以       |
| `document.styleSheets` | 文档样式表       | 部分可以     |

## 4. 🤔 `element.style` 表示什么？

元素的 `style` 属性是一个 `CSSStyleDeclaration` 对象。它只表示写在元素内联 `style` 属性中的样式。

```js
element.style.backgroundColor = 'tomato'
element.style.width = '120px'
```

CSS 中带连字符的属性，在 JavaScript 中通常改成驼峰形式。

| CSS 属性            | DOM 样式属性      |
| ------------------- | ----------------- |
| `background-color`  | `backgroundColor` |
| `font-size`         | `fontSize`        |
| `border-left-width` | `borderLeftWidth` |
| `float`             | `cssFloat`        |

设置尺寸时通常要带单位。

```js
element.style.width = '20px'
```

标准模式下，没有单位的长度值可能会被忽略。

## 5. 🤔 `CSSStyleDeclaration` 有哪些常用方法？

`CSSStyleDeclaration` 可以按属性名读写样式。

`cssText` 表示整个内联样式字符串。

```js
element.style.cssText = 'color: red; background-color: yellow;'
```

赋值给 `cssText` 会覆盖原有内联样式。

常用方法包括：

| 方法                                 | 作用                           |
| ------------------------------------ | ------------------------------ |
| `getPropertyValue(name)`             | 读取指定 CSS 属性值            |
| `getPropertyPriority(name)`          | 读取是否有 `!important` 优先级 |
| `setProperty(name, value, priority)` | 设置属性值和优先级             |
| `removeProperty(name)`               | 删除内联样式中的属性           |
| `item(index)`                        | 按索引读取属性名               |

示例：

```js
element.style.setProperty('color', 'red', 'important')
console.log(element.style.getPropertyValue('color'))
element.style.removeProperty('color')
```

`length` 表示当前内联样式中实际设置的属性数量。

## 6. 🤔 如何读取计算样式？

`getComputedStyle()` 用来读取元素最终计算后的样式。

```js
const computed = getComputedStyle(element)

console.log(computed.display)
console.log(computed.marginTop)
```

计算样式包含内联样式、文档样式、外部样式、继承和浏览器默认样式共同作用后的结果。

它返回的 `CSSStyleDeclaration` 是只读的，不能通过它修改样式。

```js
const computed = getComputedStyle(element)
computed.color = 'red' // 不应这样做
```

第二个参数可以传入伪元素。

```js
const beforeStyle = getComputedStyle(element, '::before')
```

需要注意，浏览器返回颜色、简写属性等值的字符串格式可能不完全一致。读取计算样式时，拆分属性通常比简写属性更可靠。

## 7. 🤔 如何访问样式表？

`document.styleSheets` 返回文档中的样式表集合。

```js
for (const sheet of document.styleSheets) {
  console.log(sheet.href)
}
```

样式表通常是 `CSSStyleSheet` 对象。它继承自 `StyleSheet`，常见属性包括：

| 属性               | 含义                     |
| ------------------ | ------------------------ |
| `disabled`         | 是否禁用样式表，可读写   |
| `href`             | 外部样式表地址           |
| `media`            | 媒体列表                 |
| `ownerNode`        | 关联的 `link` 或样式元素 |
| `parentStyleSheet` | 父样式表                 |
| `title`            | 标题                     |
| `type`             | 类型                     |

关联样式元素上也可以通过 `sheet` 取得样式表。

```js
const sheet = document.querySelector('style').sheet
```

访问跨源样式表的规则时，浏览器可能因为安全限制抛出异常。

## 8. 🤔 如何操作 CSS 规则？

`CSSStyleSheet.cssRules` 保存样式表中的规则集合。

```js
const sheet = document.styleSheets[0]
const rule = sheet.cssRules[0]
```

常见规则是 `CSSStyleRule`，它包含：

| 属性               | 含义         |
| ------------------ | ------------ |
| `cssText`          | 规则完整文本 |
| `selectorText`     | 选择符文本   |
| `style`            | 规则声明对象 |
| `parentRule`       | 父规则       |
| `parentStyleSheet` | 所属样式表   |
| `type`             | 规则类型     |

修改规则会影响所有匹配该选择器的元素。

```js
rule.style.setProperty('color', 'rebeccapurple')
```

可以用 `insertRule()` 插入规则，用 `deleteRule()` 删除规则。

```js
sheet.insertRule('.notice { color: red; }', sheet.cssRules.length)
sheet.deleteRule(0)
```

动态操作规则时要注意层叠顺序和影响范围。复杂主题切换通常更适合切换类名或动态加载样式表。

## 9. 🤔 偏移尺寸是什么？

偏移尺寸描述元素在页面布局中占据的可见空间。

常见属性包括：

| 属性           | 含义                         |
| -------------- | ---------------------------- |
| `offsetWidth`  | 元素可见宽度                 |
| `offsetHeight` | 元素可见高度                 |
| `offsetLeft`   | 相对 `offsetParent` 的左偏移 |
| `offsetTop`    | 相对 `offsetParent` 的上偏移 |
| `offsetParent` | 用于计算偏移的祖先元素       |

`offsetWidth` 和 `offsetHeight` 通常包含内容、内边距、边框和滚动条，不包含外边距。

如果要计算元素相对页面的偏移，可以沿 `offsetParent` 逐级累加。

```js
function getElementLeft(element) {
  let left = element.offsetLeft
  let current = element.offsetParent

  while (current) {
    left += current.offsetLeft
    current = current.offsetParent
  }

  return left
}
```

## 10. 🤔 客户端尺寸和滚动尺寸有什么区别？

客户端尺寸通常表示元素内容区加内边距，不包含边框和滚动条。

| 属性           | 含义       |
| -------------- | ---------- |
| `clientWidth`  | 客户端宽度 |
| `clientHeight` | 客户端高度 |

滚动尺寸描述元素内容的实际滚动范围和滚动位置。

| 属性           | 含义                 |
| -------------- | -------------------- |
| `scrollWidth`  | 内容实际宽度         |
| `scrollHeight` | 内容实际高度         |
| `scrollLeft`   | 水平滚动偏移，可读写 |
| `scrollTop`    | 垂直滚动偏移，可读写 |

```js
container.scrollTop = 0
```

这些属性常用于自定义滚动、虚拟列表、回到顶部、判断是否滚到底等场景。

## 11. 🤔 `getBoundingClientRect()` 有什么用？

`getBoundingClientRect()` 返回元素相对视口的位置和尺寸。

```js
const rect = element.getBoundingClientRect()

console.log(rect.left)
console.log(rect.top)
console.log(rect.width)
console.log(rect.height)
```

返回对象通常包含 `left`、`top`、`right`、`bottom`、`width`、`height` 等属性。

它适合做碰撞检测、浮层定位、拖拽、滚动监听和可见性判断。

尺寸和位置读取可能触发布局计算。实际项目中应避免在高频循环里反复交错读取尺寸和修改样式。
