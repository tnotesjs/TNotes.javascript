# [0251. MutationObserver接口](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0251.%20MutationObserver%E6%8E%A5%E5%8F%A3)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `MutationObserver` 是什么？](#3-mutationobserver-是什么)
- [4. 如何创建观察者？](#4-如何创建观察者)
- [5. `MutationRecord` 里有什么？](#5-mutationrecord-里有什么)
- [6. 如何停止观察和读取剩余记录？](#6-如何停止观察和读取剩余记录)
- [7. `MutationObserverInit` 如何配置观察范围？](#7-mutationobserverinit-如何配置观察范围)
- [8. 如何观察属性变化？](#8-如何观察属性变化)
- [9. 如何观察文本变化？](#9-如何观察文本变化)
- [10. 如何观察子节点变化？](#10-如何观察子节点变化)
- [11. `MutationObserver` 的回调为什么是异步的？](#11-mutationobserver-的回调为什么是异步的)
- [12. 使用 `MutationObserver` 有哪些性能和内存注意点？](#12-使用-mutationobserver-有哪些性能和内存注意点)

<!-- endregion:toc -->

## 1. 本节内容

- `MutationObserver` 的基本用法
- `observe()`、`disconnect()`、`takeRecords()`
- `MutationRecord` 记录对象
- `MutationObserverInit` 配置项
- 属性、字符数据、子节点和子树观察
- 异步回调与记录队列
- 性能、内存和垃圾回收注意点

## 2. 评价

- `MutationObserver` 的价值在于把 DOM 变化变成可观察的异步记录。它很好用，但观察范围越大、记录越多，你越需要有意识地控制成本。

## 3. `MutationObserver` 是什么？

`MutationObserver` 用于观察 DOM 变化。当目标节点的属性、子节点或文本发生变化时，浏览器会把变化记录下来，并在之后异步调用回调函数。

它用来替代早期的 DOM 变更事件。相比同步触发的变更事件，`MutationObserver` 会把变化放入记录队列，再异步批量通知，因此性能更好，也更适合观察频繁变化。

适合使用它的场景包括：

- 监听某个容器内是否插入新节点。
- 观察组件根节点属性变化。
- 在第三方脚本修改 DOM 后做补充处理。
- 调试或统计页面结构变化。

## 4. 如何创建观察者？

创建观察者需要传入回调函数。

```js
const observer = new MutationObserver((records, observerInstance) => {
  for (const record of records) {
    console.log(record.type)
  }
})
```

回调接收两个参数：

| 参数               | 含义                         |
| ------------------ | ---------------------------- |
| `records`          | 按发生顺序排列的变化记录数组 |
| `observerInstance` | 当前观察者实例               |

创建观察者之后，还需要调用 `observe()` 指定目标节点和观察配置。

```js
observer.observe(document.body, {
  childList: true,
})
```

## 5. `MutationRecord` 里有什么？

每条变化都会形成一个 `MutationRecord`。

常见属性包括：

| 属性 | 含义 |
| --- | --- |
| `type` | 变化类型，可能是 `attributes`、`characterData`、`childList` |
| `target` | 发生变化的目标节点 |
| `addedNodes` | 新增节点集合 |
| `removedNodes` | 移除节点集合 |
| `previousSibling` | 变化前一个兄弟节点 |
| `nextSibling` | 变化后一个兄弟节点 |
| `attributeName` | 变化的属性名 |
| `attributeNamespace` | 属性命名空间 |
| `oldValue` | 旧值，需要配置才会记录 |

例如，观察子节点变化时可以读取新增节点。

```js
const observer = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === 'childList') {
      console.log(record.addedNodes)
    }
  }
})

observer.observe(document.body, { childList: true })
```

## 6. 如何停止观察和读取剩余记录？

`disconnect()` 会停止当前观察者对所有目标的观察。

```js
observer.disconnect()
```

需要注意，`disconnect()` 会丢弃已经排队但尚未交给回调的记录。

如果你想在断开前处理这些记录，可以先调用 `takeRecords()`。

```js
const pendingRecords = observer.takeRecords()
handleRecords(pendingRecords)
observer.disconnect()
```

`takeRecords()` 会返回当前队列中的记录，并清空队列。

同一个观察者可以多次调用 `observe()` 观察多个目标。断开之后，也可以再次调用 `observe()` 重新开始观察。

## 7. `MutationObserverInit` 如何配置观察范围？

`observe()` 的第二个参数是 `MutationObserverInit` 配置对象。

常用配置包括：

| 配置                    | 作用                   |
| ----------------------- | ---------------------- |
| `attributes`            | 观察属性变化           |
| `attributeFilter`       | 限定要观察的属性名     |
| `attributeOldValue`     | 记录属性旧值           |
| `characterData`         | 观察字符数据变化       |
| `characterDataOldValue` | 记录字符数据旧值       |
| `childList`             | 观察子节点添加和移除   |
| `subtree`               | 观察目标节点及全部后代 |

`attributes`、`characterData`、`childList` 至少要有一个为真。否则浏览器不知道要观察什么，调用 `observe()` 会抛出错误。

某些配置会间接开启对应观察能力。例如设置 `attributeOldValue: true` 通常意味着需要观察属性变化。

## 8. 如何观察属性变化？

观察属性变化时，使用 `attributes: true`。

```js
const target = document.querySelector('#app')
const observer = new MutationObserver((records) => {
  for (const record of records) {
    console.log(record.attributeName)
  }
})

observer.observe(target, {
  attributes: true,
})
```

如果只关心少数属性，可以使用 `attributeFilter`。

```js
observer.observe(target, {
  attributeFilter: ['class', 'data-state'],
})
```

如果需要知道修改前的值，可以使用 `attributeOldValue`。

```js
observer.observe(target, {
  attributes: true,
  attributeOldValue: true,
})
```

记录中的 `oldValue` 是旧值，新值可以从 `record.target` 上读取。

## 9. 如何观察文本变化？

文本节点、注释节点等字符数据节点可以使用 `characterData` 观察。

```js
const textNode = document.createTextNode('旧文本')
document.body.appendChild(textNode)

const observer = new MutationObserver((records) => {
  for (const record of records) {
    console.log(record.oldValue)
    console.log(record.target.nodeValue)
  }
})

observer.observe(textNode, {
  characterData: true,
  characterDataOldValue: true,
})

textNode.nodeValue = '新文本'
```

如果你观察的是元素节点，并希望捕捉它内部文本节点的变化，可以配合 `subtree: true`。

## 10. 如何观察子节点变化？

观察子节点添加和移除时，使用 `childList: true`。

```js
const list = document.querySelector('ul')
const observer = new MutationObserver((records) => {
  for (const record of records) {
    console.log(record.addedNodes)
    console.log(record.removedNodes)
  }
})

observer.observe(list, {
  childList: true,
})
```

节点重排通常会产生移除和添加记录，因为对 DOM 来说，节点确实从一个位置离开并进入另一个位置。

如果要观察整个子树，可以开启 `subtree`。

```js
observer.observe(document.body, {
  childList: true,
  subtree: true,
})
```

`subtree: true` 的观察范围很大，应该谨慎使用。它适合确实需要监控整个区域变化的场景，不适合无差别观察整个页面。

## 11. `MutationObserver` 的回调为什么是异步的？

DOM 变化发生后，浏览器不会马上同步执行观察者回调，而是先把变化记录加入观察者的记录队列。

随后，浏览器会在微任务阶段调用回调，并把当前队列中的记录一起传入。

这意味着：

- 一次回调可能收到多条记录。
- 多次连续 DOM 修改可能被合并到同一轮回调里处理。
- 回调执行前，可以用 `takeRecords()` 主动取出队列。

这种异步模型可以减少频繁 DOM 变化导致的同步回调开销。

## 12. 使用 `MutationObserver` 有哪些性能和内存注意点？

`MutationObserver` 比早期变更事件更高效，但它仍然有成本。

使用时建议：

- 观察范围尽量小。
- 只开启确实需要的观察类型。
- 使用 `attributeFilter` 缩小属性观察范围。
- 不再需要时调用 `disconnect()`。
- 不长期保存完整的 `MutationRecord`。

内存方面也要注意引用关系。观察者不会强行阻止目标节点被回收，但目标节点和记录对象可能持有相关引用。如果你把大量 `MutationRecord` 长期保存在数组里，也可能间接保留很多 DOM 节点。

更稳妥的方式是：在回调中提取你真正需要的数据，然后丢弃原始记录。

```js
const changes = []

const observer = new MutationObserver((records) => {
  for (const record of records) {
    changes.push({
      type: record.type,
      targetId: record.target.id || null,
    })
  }
})
```

也就是说，`MutationObserver` 很适合做 DOM 变化的入口，但不要把它当成无限制的全页面变更日志。
