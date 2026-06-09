# [0296. 计时API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0296.%20%E8%AE%A1%E6%97%B6API)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么不用 `Date.now()` 做精确性能测量？](#3-为什么不用-datenow-做精确性能测量)
- [4. High Resolution Time API 提供了什么？](#4-high-resolution-time-api-提供了什么)
- [5. Performance Timeline API 是什么？](#5-performance-timeline-api-是什么)
- [6. `mark()` 和 `measure()` 怎么做自定义计时？](#6-mark-和-measure-怎么做自定义计时)
- [7. 计时 API 适合用来做什么？](#7-计时-api-适合用来做什么)

<!-- endregion:toc -->

## 1. 本节内容

- `performance` 对象的定位
- `performance.now()` 与 `timeOrigin`
- High Resolution Time API
- Performance Timeline API
- `mark()`、`measure()`、导航计时和资源计时

## 2. 评价

- 计时 API 的关键价值是让性能测量从“差不多”变成“有依据”；不过现代浏览器会为了安全降低精度，所以测量也要理解边界。

## 3. 为什么不用 `Date.now()` 做精确性能测量？

`Date.now()` 返回的是系统时间戳。系统时间可能被用户或系统同步机制调整，因此不一定单调递增。性能测量更需要稳定、单调、相对页面生命周期的时间。

`performance.now()` 更适合测量耗时。

```js
const startTime = performance.now()

runTask()

const endTime = performance.now()

console.log(`耗时 ${endTime - startTime} ms`)
```

`performance.now()` 返回相对于 `performance.timeOrigin` 的高精度时间，单位是毫秒。

```js
const absoluteTime = performance.timeOrigin + performance.now()
```

需要注意，出于安全原因，现代浏览器可能会降低计时精度或加入扰动，以缓解侧信道攻击风险。

## 4. High Resolution Time API 提供了什么？

High Resolution Time API 的核心就是更适合性能测量的时间来源。

它有几个特点：

- 相对时间，不直接依赖系统时钟。
- 单调递增，更适合计算耗时。
- 精度通常高于毫秒级，但会受浏览器安全策略影响。

典型用法是包住一段操作：

```js
function measureTask(callback) {
  const startTime = performance.now()

  callback()

  return performance.now() - startTime
}
```

这类测量适合比较代码路径、定位慢操作或记录用户端性能数据。

## 5. Performance Timeline API 是什么？

Performance Timeline API 把性能事件抽象为 `PerformanceEntry`。每个条目通常有这些通用字段：

| 字段        | 含义       |
| ----------- | ---------- |
| `name`      | 条目名称。 |
| `entryType` | 条目类型。 |
| `startTime` | 起始时间。 |
| `duration`  | 持续时间。 |

可以读取所有性能条目：

```js
const entries = performance.getEntries()

for (const entry of entries) {
  console.log(entry.entryType, entry.name, entry.duration)
}
```

也可以按类型读取：

```js
const navigationEntries = performance.getEntriesByType('navigation')
const resourceEntries = performance.getEntriesByType('resource')
```

导航计时用于分析页面加载过程，资源计时用于分析脚本、样式、图片、请求等资源加载。

## 6. `mark()` 和 `measure()` 怎么做自定义计时？

`performance.mark()` 可以创建自定义时间标记，`performance.measure()` 可以计算两个标记之间的耗时。

```js
performance.mark('render-start')

renderPage()

performance.mark('render-end')
performance.measure('render', 'render-start', 'render-end')

const renderMeasure = performance.getEntriesByName('render')[0]

console.log(renderMeasure.duration)
```

这种方式比手动保存多个时间变量更适合复杂流程，也能和浏览器性能面板里的时间线概念对齐。

如果不再需要标记和测量结果，可以清理：

```js
performance.clearMarks('render-start')
performance.clearMarks('render-end')
performance.clearMeasures('render')
```

## 7. 计时 API 适合用来做什么？

常见用途包括：

- 测量函数或任务耗时。
- 记录首屏、路由切换、组件渲染时间。
- 分析页面导航和资源加载。
- 统计用户真实环境下的性能数据。
- 与 `PerformanceObserver` 配合持续观察性能条目。

计时 API 能提供数据，但不能直接告诉你原因。性能优化时，还需要结合浏览器开发者工具、网络面板、火焰图和业务指标一起判断。
