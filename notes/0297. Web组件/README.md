# [0297. Web组件](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0297.%20Web%E7%BB%84%E4%BB%B6)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Web 组件包含哪些能力？](#3-web-组件包含哪些能力)
- [4. HTML 模板有什么用？](#4-html-模板有什么用)
- [5. Shadow DOM 提供了什么封装？](#5-shadow-dom-提供了什么封装)
- [6. 插槽如何把外部内容投射进组件？](#6-插槽如何把外部内容投射进组件)
- [7. 如何定义自定义元素？](#7-如何定义自定义元素)
- [8. 元素升级和兼容性要注意什么？](#8-元素升级和兼容性要注意什么)

<!-- endregion:toc -->

## 1. 本节内容

- Web Components 的三项核心技术
- HTML 模板与 `DocumentFragment`
- Shadow DOM 的封装、模式和插槽
- 自定义元素和生命周期回调
- 属性观察、元素升级和兼容性边界

## 2. 评价

- Web 组件是浏览器原生组件化路线，概念上很漂亮；真正落地时，要同时理解封装能力、样式边界和框架生态之间的取舍。

## 3. Web 组件包含哪些能力？

Web Components 不是单个 API，而是一组浏览器原生组件化技术，主要包括：

| 技术       | 作用                                |
| ---------- | ----------------------------------- |
| HTML 模板  | 用 `template` 声明惰性 DOM 片段。   |
| Shadow DOM | 为组件创建封装的 DOM 和样式作用域。 |
| 自定义元素 | 定义新的 HTML 元素和生命周期。      |

这三者组合起来，可以实现不依赖具体框架的可复用组件。

## 4. HTML 模板有什么用？

`template` 元素中的内容不会立即渲染，也不会立即执行资源加载。它更像一段可复制的 DOM 蓝图。

```html
<template id="userCardTemplate">
  <article class="card">
    <h2 class="name"></h2>
    <p class="email"></p>
  </article>
</template>
```

通过 `template.content` 可以取得一个 `DocumentFragment`，再克隆使用。

```js
const template = document.getElementById('userCardTemplate')
const fragment = template.content.cloneNode(true)

fragment.querySelector('.name').textContent = 'Ada'
fragment.querySelector('.email').textContent = 'ada@example.com'

document.body.append(fragment)
```

`DocumentFragment` 插入文档后，它的子节点会移动到文档中，片段本身不会成为额外包裹节点。

## 5. Shadow DOM 提供了什么封装？

Shadow DOM 可以给元素附加一棵影子树，组件内部 DOM 和样式可以与外部页面隔离。

```js
const host = document.querySelector('#userCard')
const shadowRoot = host.attachShadow({ mode: 'open' })

shadowRoot.innerHTML = `
  <style>
    .name { color: teal; }
  </style>
  <p class="name">Ada</p>
`
```

`mode` 有两个常见值：

| 模式     | 含义                                           |
| -------- | ---------------------------------------------- |
| `open`   | 外部可以通过 `element.shadowRoot` 访问影子根。 |
| `closed` | 外部不能通过 `element.shadowRoot` 访问影子根。 |

Shadow DOM 不是安全边界，而是封装边界。它帮助组件隔离 DOM 结构和样式，减少命名冲突。

## 6. 插槽如何把外部内容投射进组件？

`slot` 用于在 Shadow DOM 中预留外部内容的位置。

```html
<user-card>
  <span slot="name">Ada</span>
  <span slot="email">ada@example.com</span>
</user-card>
```

组件内部可以定义命名槽位：

```js
shadowRoot.innerHTML = `
  <article>
    <h2><slot name="name"></slot></h2>
    <p><slot name="email"></slot></p>
  </article>
`
```

没有 `name` 的 `slot` 是默认槽位。插槽让组件既能封装内部结构，又能接收外部传入的内容。

事件从 Shadow DOM 传播到外部时，浏览器会做事件重定向。外部代码看到的目标可能是宿主元素，而不是影子树内部的真实节点。这有助于维持组件封装。

## 7. 如何定义自定义元素？

自定义元素通常继承 `HTMLElement`，再通过 `customElements.define()` 注册。

```js
class UserCard extends HTMLElement {
  connectedCallback() {
    this.textContent = '用户卡片'
  }
}

customElements.define('user-card', UserCard)
```

自定义元素名称必须包含连字符，例如 `user-card`。这是为了避免和未来标准 HTML 元素重名。

常见生命周期回调包括：

| 回调                         | 触发时机               |
| ---------------------------- | ---------------------- |
| `connectedCallback()`        | 元素插入文档时。       |
| `disconnectedCallback()`     | 元素从文档移除时。     |
| `adoptedCallback()`          | 元素被移动到新文档时。 |
| `attributeChangedCallback()` | 被观察属性变化时。     |

观察属性需要声明 `observedAttributes`。

```js
class UserBadge extends HTMLElement {
  static get observedAttributes() {
    return ['name']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'name' && oldValue !== newValue) {
      this.textContent = newValue
    }
  }
}

customElements.define('user-badge', UserBadge)
```

## 8. 元素升级和兼容性要注意什么？

页面中可以先出现 `<user-card>`，再等脚本加载后注册定义。注册后，浏览器会把已有元素升级为自定义元素。

```js
customElements.whenDefined('user-card').then(() => {
  console.log('user-card 已定义')
})
```

`customElements.upgrade()` 可以主动升级某个还未连接到文档的子树。

自治自定义元素，也就是继承 `HTMLElement` 并使用新标签名的方式，兼容性最好。自定义内置元素，也就是使用 `extends` 和 `is` 的方式，兼容性不如前者。

HTML Imports 曾经被认为是 Web Components 的一部分，但现在已经废弃。现代项目通常使用 ES 模块、构建工具或框架集成 Web 组件。
