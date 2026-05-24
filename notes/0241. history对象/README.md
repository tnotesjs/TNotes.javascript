# [0241. history对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0241.%20history%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `history` 对象是什么？](#3--history-对象是什么)
- [4. 🤔 如何用 `history` 前进和后退？](#4--如何用-history-前进和后退)
- [5. 🤔 `history.length` 表示什么？](#5--historylength-表示什么)
- [6. 🤔 URL 散列为什么会影响历史记录？](#6--url-散列为什么会影响历史记录)
- [7. 🤔 `pushState()` 如何修改历史记录？](#7--pushstate-如何修改历史记录)
- [8. 🤔 `popstate` 事件什么时候触发？](#8--popstate-事件什么时候触发)
- [9. 🤔 `replaceState()` 和 `pushState()` 有什么区别？](#9--replacestate-和-pushstate-有什么区别)
- [10. 🤔 使用历史状态管理要注意什么？](#10--使用历史状态管理要注意什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `history` 对象的定位
- `go()`、`back()`、`forward()` 导航
- `history.length`
- 散列变化与历史记录
- `pushState()` 和 `replaceState()`
- `popstate` 事件
- 单页应用中的历史状态管理

## 2. 🫧 评价

- `history` 的关键不是让你窥探用户访问过哪些页面，而是在不暴露具体 URL 的前提下，给当前窗口提供受控的前进、后退和状态管理能力。

## 3. 🤔 `history` 对象是什么？

`history` 表示当前窗口从打开以来的会话历史记录。

```js
console.log(window.history === history) // true
```

出于安全考虑，浏览器不会让脚本读取历史记录里的具体 URL。你不能遍历用户访问过哪些地址，但可以让浏览器前进、后退，或向当前会话历史中加入状态。

## 4. 🤔 如何用 `history` 前进和后退？

`go()` 可以沿历史记录前进或后退。

```js
history.go(-1) // 后退一页
history.go(1) // 前进一页
history.go(2) // 前进两页
```

负数表示后退，正数表示前进。

还有两个语义更清晰的简写方法：

```js
history.back()
history.forward()
```

这些方法相当于用户点击浏览器的后退和前进按钮，但能否真的跳转取决于当前历史记录中是否存在对应条目。

## 5. 🤔 `history.length` 表示什么？

`history.length` 表示当前会话历史记录中的条目数量。

```js
console.log(history.length)
```

如果一个窗口或标签页中只加载了第一个页面，那么这个值通常是 `1`。

```js
if (history.length === 1) {
  console.log('这是当前标签页中的第一个历史条目')
}
```

它只能告诉你条目数量，不能告诉你每条记录对应的 URL。

## 6. 🤔 URL 散列为什么会影响历史记录？

在现代浏览器中，修改 URL 的散列值通常会增加一条历史记录。

```js
location.hash = '#section1'
```

这意味着用户可以通过后退按钮回到前一个散列状态。

早期单页应用常利用这个特性实现路由：页面不刷新，但地址变化，后退和前进按钮也能配合使用。

后来 HTML5 的历史状态管理 API 提供了更灵活的方案。

## 7. 🤔 `pushState()` 如何修改历史记录？

`history.pushState()` 可以新增一条历史记录，并改变地址栏显示的 URL，但不会立即向服务器请求新页面。

```js
const state = { page: 'detail', id: 1 }

history.pushState(state, '', '/detail/1')
```

它接收 3 个参数：

| 参数    | 含义                             |
| ------- | -------------------------------- |
| `state` | 和历史记录关联的状态对象         |
| `title` | 标题参数，当前浏览器通常忽略     |
| `url`   | 可选的新 URL，通常是同源相对地址 |

调用后，地址栏会变化，历史记录会新增，但页面不会自动重新加载。

这正是单页应用路由的基础能力之一。

## 8. 🤔 `popstate` 事件什么时候触发？

用户点击后退或前进按钮，切换到由 `pushState()` 创建的状态时，会触发 `popstate` 事件。

```js
window.addEventListener('popstate', (event) => {
  console.log(event.state)
})
```

事件对象的 `state` 属性就是当初传给 `pushState()` 的状态对象。

浏览器只负责切换历史条目和触发事件，不会自动帮你恢复页面内容。你需要根据 `event.state` 自己重新渲染对应状态。

## 9. 🤔 `replaceState()` 和 `pushState()` 有什么区别？

`replaceState()` 会替换当前历史记录的状态，而不是新增一条记录。

```js
history.replaceState({ page: 'list' }, '', '/list')
```

适合用于：

- 修正当前 URL。
- 初始化当前页面状态。
- 替换临时状态。
- 不希望用户后退回中间状态的场景。

如果你希望用户能后退到上一个状态，用 `pushState()`；如果只是更新当前状态，用 `replaceState()`。

## 10. 🤔 使用历史状态管理要注意什么？

传给 `pushState()` 和 `replaceState()` 的 `state` 对象应该只包含可序列化信息，不适合放 DOM 元素、函数或大量复杂对象。

另外，`pushState()` 创建出来的 URL 看起来像真实地址。用户刷新页面或直接访问这个 URL 时，浏览器会向服务器请求它。

因此，单页应用必须配置服务器兜底，让这些前端路由地址也能返回应用入口页面。否则刷新后可能出现 404。

简单来说，`history` 能让你把应用状态放进浏览器历史里，但页面如何根据状态恢复，仍然是应用自己的责任。
