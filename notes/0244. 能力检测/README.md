# [0244. 能力检测](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0244.%20%E8%83%BD%E5%8A%9B%E6%A3%80%E6%B5%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是能力检测？](#3-什么是能力检测)
- [4. 能力检测有哪两个基本原则？](#4-能力检测有哪两个基本原则)
- [5. 什么是安全能力检测？](#5-什么是安全能力检测)
- [6. `typeof` 检测一定可靠吗？](#6-typeof-检测一定可靠吗)
- [7. 能力检测可以提前集中做吗？](#7-能力检测可以提前集中做吗)
- [8. 能力检测能用来识别浏览器吗？](#8-能力检测能用来识别浏览器吗)
- [9. 能力检测有哪些局限？](#9-能力检测有哪些局限)

<!-- endregion:toc -->

## 1. 本节内容

- 能力检测的基本模式
- 优先检测最常用方案
- 检测真正需要的能力
- 安全能力检测
- `typeof` 与宿主对象差异
- 基于能力检测进行浏览器分析
- 能力检测的局限

## 2. 评价

- 能力检测最值得记住的一句话是：不要问浏览器是谁，要问它会不会做这件事。这个思路比浏览器分支更稳定，也更接近渐进增强的精神。

## 3. 什么是能力检测？

能力检测也叫特性检测，指在运行时检测当前环境是否支持某个具体能力。

基本模式是：

```js
if (object.propertyInQuestion) {
  // 使用 object.propertyInQuestion
}
```

它不需要提前知道当前浏览器是什么，只需要关心你要使用的功能是否存在。

例如，早期浏览器获取元素时可以按能力分支：

```js
function getElement(id) {
  if (document.getElementById) {
    return document.getElementById(id)
  }

  if (document.all) {
    return document.all[id]
  }

  throw new Error('无法获取元素')
}
```

这段代码不是判断浏览器版本，而是判断当前环境是否支持某种获取元素的方式。

## 4. 能力检测有哪两个基本原则？

第一，先检测最常用、最标准的方案。

```js
if (document.getElementById) {
  // 优先使用标准方法
} else if (document.all) {
  // 再使用旧式兼容方案
}
```

这样大多数现代环境可以快速走标准路径，避免无意义的兼容分支。

第二，只检测你真正要使用的能力。

错误示例是：检测到 `document.all` 就假设当前浏览器是旧版 IE，然后使用另一个并未检测的能力。

```js
function getWindowWidth() {
  if (document.all) {
    return document.documentElement.clientWidth
  }

  return window.innerWidth
}
```

问题是，`document.all` 存在并不等于 `window.innerWidth` 不存在，也不等于当前浏览器一定是某个 IE 版本。

能力检测的判断对象应该尽量和后续要使用的能力保持一致。

## 5. 什么是安全能力检测？

只检测属性是否存在有时不够，还要确认它是否具备预期行为。

比如，下面的检测并不安全：

```js
function isSortable(object) {
  return !!object.sort
}
```

如果对象只是有一个名为 `sort` 的布尔属性，这个函数也会返回 `true`。

```js
console.log(isSortable({ sort: true })) // true
```

更合理的写法是检测 `sort` 是否为函数。

```js
function isSortable(object) {
  return typeof object.sort === 'function'
}
```

也就是说，能力检测不只是检查名字是否存在，还应该尽量确认这个能力能不能按你预期的方式调用。

## 6. `typeof` 检测一定可靠吗？

`typeof` 通常适合用来检测函数能力。

```js
function hasCreateElement() {
  return typeof document.createElement === 'function'
}
```

但书中提醒过，宿主对象不一定完全遵循普通 ECMAScript 对象的行为。

旧版 IE 中，某些 DOM 方法由 COM 对象实现，`typeof document.createElement` 可能返回 `object` 而不是 `function`。

现代浏览器已经基本不需要为这类历史问题专门分支，但理解这个例子有助于记住：能力检测也要结合目标环境验证，不能只看一条规则。

## 7. 能力检测可以提前集中做吗？

可以。

如果应用中多处都要根据某些能力分支，可以在初始化阶段集中检测，再复用结果。

```js
const support = {
  plugins: !!(navigator.plugins && navigator.plugins.length),
  dom1: !!(
    document.getElementById &&
    document.createElement &&
    document.getElementsByTagName
  ),
}
```

这样后续代码可以直接读取 `support.dom1`，不用反复执行同样的检测。

不过，集中检测也要克制。只检测项目确实需要的能力，不要为了建立一个“环境画像”而检测一堆不会使用的特性。

## 8. 能力检测能用来识别浏览器吗？

有时可以用一组非常特殊的能力推断浏览器，但这不是能力检测最推荐的用途。

书中给过一个思路：通过某些浏览器独有 API 或行为组合，推断 IE、Edge、Firefox、Chrome、Safari、Opera 等浏览器身份。

这种方式比用户代理字符串更难伪造，但仍然有维护成本。浏览器会变化，某些曾经独有的能力可能被其他浏览器实现，也可能被原浏览器废弃。

因此，能力检测更适合决定代码逻辑，而不是给浏览器贴永久标签。

## 9. 能力检测有哪些局限？

能力检测的主要局限是：某个能力存在，不一定能准确说明浏览器身份。

例如，下面这类写法假设太多：

```js
const isFirefox = !!(navigator.vendor && navigator.vendorSub)
const isIE = !!(document.all && document.uniqueID)
```

这些属性曾经可能对应某些浏览器，但未来浏览器可能改变实现，其他浏览器也可能实现相似属性。

更稳的结论是：

- 要使用某个 API，就检测这个 API。
- 要判断某个行为，就检测这个行为。
- 不要把一个或几个能力强行等同于浏览器身份。

能力检测的目标应该是让代码正确运行，而不是证明当前浏览器叫什么。
