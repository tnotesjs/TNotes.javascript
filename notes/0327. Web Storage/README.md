# [0327. Web Storage](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0327.%20Web%20Storage)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Web Storage 解决了什么问题？](#3-web-storage-解决了什么问题)
- [4. `Storage` 类型提供哪些 API？](#4-storage-类型提供哪些-api)
- [5. Web Storage 为什么只能算字符串存储？](#5-web-storage-为什么只能算字符串存储)
- [6. `sessionStorage` 适合保存什么？](#6-sessionstorage-适合保存什么)
- [7. `localStorage` 适合保存什么？](#7-localstorage-适合保存什么)
- [8. `storage` 事件有什么用？](#8-storage-事件有什么用)
- [9. Web Storage 有哪些限制？](#9-web-storage-有哪些限制)

<!-- endregion:toc -->

## 1. 本节内容

- Web Storage 的设计目标
- `Storage` 类型的 API
- `sessionStorage` 和 `localStorage`
- 字符串存储与 JSON 序列化
- `storage` 事件
- Web Storage 的容量和安全限制

## 2. 评价

- Web Storage 的好处是简单直接，坏处也是简单直接：同步、字符串、容量有限，所以它适合小型状态，不适合当数据库用。

## 3. Web Storage 解决了什么问题？

Web Storage 的目标，是为浏览器提供一套不依赖 `cookie` 的本地名值存储机制。

`cookie` 会自动随 HTTP 请求发送，因此不适合保存只给前端使用的数据。Web Storage 不会自动发送到服务器，更适合保存页面状态、用户偏好、小型缓存和临时草稿。

Web Storage 包含两个主要对象：

- `sessionStorage`：保存当前页面会话中的数据。
- `localStorage`：跨会话持久保存数据。

早期规范中出现过 `globalStorage`，现在已经废弃，实际开发中不再使用。

## 4. `Storage` 类型提供哪些 API？

`sessionStorage` 和 `localStorage` 都是 `Storage` 类型的实例。常用属性和方法包括：

| API                    | 说明                   |
| ---------------------- | ---------------------- |
| `length`               | 当前保存的键值对数量。 |
| `setItem(name, value)` | 设置值。               |
| `getItem(name)`        | 读取值。               |
| `removeItem(name)`     | 删除指定值。           |
| `clear()`              | 清空所有值。           |
| `key(index)`           | 取得指定位置的键名。   |

示例：

```js
localStorage.setItem('theme', 'dark')

const theme = localStorage.getItem('theme')

localStorage.removeItem('theme')
```

虽然也可以用属性方式访问：

```js
localStorage.theme = 'dark'
console.log(localStorage.theme)
```

但更推荐使用 `setItem()`、`getItem()` 和 `removeItem()`，这样可以避免和已有属性或方法名冲突。

## 5. Web Storage 为什么只能算字符串存储？

`Storage` 只能保存字符串。非字符串值会在保存时被转换为字符串。

```js
localStorage.setItem('count', 1)

console.log(localStorage.getItem('count')) // '1'
```

保存对象时，需要自己序列化和反序列化。

```js
const settings = {
  theme: 'dark',
  compact: true,
}

localStorage.setItem('settings', JSON.stringify(settings))

const savedSettings = JSON.parse(localStorage.getItem('settings'))
```

如果读取结果可能为空，要先判断再解析，避免 `JSON.parse(null)` 造成逻辑误判。

## 6. `sessionStorage` 适合保存什么？

`sessionStorage` 保存的是当前页面会话的数据。刷新页面不会清除它，但关闭标签页或浏览器会话结束后，它通常会消失。

它还和源、标签页上下文绑定。同一个源下，不同标签页通常不会共享同一个 `sessionStorage`。

适合保存：

- 当前标签页的临时筛选条件。
- 表单分步骤过程中的临时状态。
- 单页应用在当前会话内的轻量状态。

示例：

```js
sessionStorage.setItem('draft:title', '客户端存储')

const title = sessionStorage.getItem('draft:title')

sessionStorage.removeItem('draft:title')
```

## 7. `localStorage` 适合保存什么？

`localStorage` 保存的数据会持续存在，直到脚本删除、用户清除站点数据，或浏览器因策略回收数据。

同一个源下的页面可以访问同一份 `localStorage`。这里的同源要求协议、域名和端口一致，子域也不算同一个源。

适合保存：

- 主题、语言、布局等偏好。
- 不敏感的小型配置。
- 最近使用的功能入口。
- 可以重新生成的小型缓存。

```js
localStorage.setItem('ui.theme', 'dark')

const theme = localStorage.getItem('ui.theme') ?? 'light'
```

`localStorage` 是同步 API。读写数据会阻塞主线程，因此不适合保存大量数据或频繁写入。大量结构化数据应考虑 IndexedDB。

## 8. `storage` 事件有什么用？

当同源页面中的 Web Storage 发生变化时，其他相关文档可以收到 `storage` 事件。常见用途是让多个标签页同步状态。

```js
window.addEventListener('storage', (event) => {
  if (event.key === 'ui.theme') {
    applyTheme(event.newValue)
  }
})
```

事件对象常用属性包括：

- `key`：发生变化的键。
- `oldValue`：旧值。
- `newValue`：新值，删除时为 `null`。
- `url`：触发变化的页面 URL。
- `storageArea`：发生变化的 `Storage` 对象。

触发修改的当前页面通常不会收到自己的 `storage` 事件。也就是说，它更适合跨标签页通知，不适合替代当前页面内部状态管理。

## 9. Web Storage 有哪些限制？

Web Storage 的限制主要有三类。

第一，容量有限。不同浏览器限制不同，常见经验值是每个源几 MB。超出配额时，`setItem()` 可能抛出异常。

```js
try {
  localStorage.setItem('cache', largeText)
} catch (error) {
  console.log('写入失败，可能是容量超限或存储不可用')
}
```

第二，它是同步 API。小数据很方便，大数据和高频写入会影响页面响应。

第三，它不适合保存敏感信息。只要同源脚本可以运行，就可以读取 Web Storage。发生 XSS 时，里面的 token、个人信息或隐私数据都可能被窃取。

结论很简单：Web Storage 适合小型、非敏感、可丢失或可重新生成的数据。
