# [0328. IndexedDB](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0328.%20IndexedDB)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 IndexedDB 适合解决什么问题？](#3--indexeddb-适合解决什么问题)
- [4. 🤔 如何打开数据库？](#4--如何打开数据库)
- [5. 🤔 对象存储是什么？](#5--对象存储是什么)
- [6. 🤔 事务如何组织读写操作？](#6--事务如何组织读写操作)
- [7. 🤔 如何增删改查对象？](#7--如何增删改查对象)
- [8. 🤔 游标有什么用？](#8--游标有什么用)
- [9. 🤔 键范围和游标方向怎么控制查询？](#9--键范围和游标方向怎么控制查询)
- [10. 🤔 索引如何加速查询？](#10--索引如何加速查询)
- [11. 🤔 IndexedDB 有哪些并发和限制问题？](#11--indexeddb-有哪些并发和限制问题)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- IndexedDB 的定位和异步模型
- 数据库、版本和对象存储
- 事务与常见增删改查操作
- 游标、键范围和游标方向
- 索引查询
- 并发、配额和安全限制

## 2. 🫧 评价

- IndexedDB 是浏览器端真正接近数据库的存储能力；它的 API 有点啰嗦，但换来的是大容量、结构化、异步和可索引查询。

## 3. 🤔 IndexedDB 适合解决什么问题？

IndexedDB 是浏览器中的结构化数据存储方案。它用于保存 JavaScript 对象，并支持通过键、游标和索引进行查询。

和 Web Storage 相比，IndexedDB 更适合：

- 保存大量数据。
- 保存结构化对象。
- 离线应用数据。
- 客户端缓存列表、文档、消息等记录。
- 需要按字段查询的数据。

IndexedDB 几乎完全是异步 API。大多数操作都会返回请求对象，再通过 `success` 和 `error` 事件得到结果。

## 4. 🤔 如何打开数据库？

使用 `indexedDB.open(name, version)` 打开数据库。如果数据库不存在，浏览器会创建它；如果版本号升高，会触发升级流程。

```js
let database

const request = indexedDB.open('notes-app', 1)

request.onerror = () => {
  console.log(request.error)
}

request.onsuccess = () => {
  database = request.result
}
```

版本号必须是整数。旧资料中可能出现过 `setVersion()`，它已经废弃，现代代码应该在 `open()` 时传入版本号。

## 5. 🤔 对象存储是什么？

IndexedDB 不使用传统关系型数据库中的表，而使用对象存储。一个数据库可以包含多个对象存储，每个对象存储保存一类对象。

对象存储通常在 `upgradeneeded` 事件中创建，因为数据库结构只能在版本升级事务中修改。

```js
const request = indexedDB.open('notes-app', 1)

request.onupgradeneeded = () => {
  const database = request.result

  if (!database.objectStoreNames.contains('notes')) {
    database.createObjectStore('notes', {
      keyPath: 'id',
    })
  }
}
```

`keyPath` 表示使用对象中的哪个属性作为主键。

```js
const note = {
  id: 'n-001',
  title: '客户端存储',
  updatedAt: Date.now(),
}
```

这里的 `id` 就可以作为对象存储的键。

## 6. 🤔 事务如何组织读写操作？

IndexedDB 的读写都通过事务完成。事务指定要访问的对象存储，以及访问模式。

```js
const transaction = database.transaction('notes', 'readwrite')
const store = transaction.objectStore('notes')

store.put({
  id: 'n-001',
  title: '客户端存储',
  updatedAt: Date.now(),
})

transaction.oncomplete = () => {
  console.log('写入完成')
}

transaction.onerror = () => {
  console.log(transaction.error)
}
```

常见模式包括：

| 模式            | 说明                       |
| --------------- | -------------------------- |
| `readonly`      | 默认模式，只读取数据。     |
| `readwrite`     | 可以读取和修改数据。       |
| `versionchange` | 版本升级时修改数据库结构。 |

一个事务中可以包含多个请求。事务完成并不等于某个具体请求返回了数据，读取结果仍然要在请求的 `onsuccess` 中处理。

## 7. 🤔 如何增删改查对象？

对象存储常用方法包括：

| 方法          | 说明                         |
| ------------- | ---------------------------- |
| `add(value)`  | 添加新对象，键已存在时失败。 |
| `put(value)`  | 添加或更新对象。             |
| `get(key)`    | 按键读取对象。               |
| `delete(key)` | 按键删除对象。               |
| `clear()`     | 清空对象存储。               |

读取单条记录：

```js
const transaction = database.transaction('notes')
const store = transaction.objectStore('notes')
const request = store.get('n-001')

request.onsuccess = () => {
  console.log(request.result)
}

request.onerror = () => {
  console.log(request.error)
}
```

`add()` 更像插入，`put()` 更像保存。初始化数据时可以用 `add()`，允许覆盖时用 `put()`。

## 8. 🤔 游标有什么用？

如果只知道主键，可以直接 `get()`。如果要遍历多条记录，就需要游标。

游标不会一次性把所有结果收集出来，而是指向当前记录，并通过 `continue()` 或 `advance()` 继续移动。

```js
const transaction = database.transaction('notes')
const store = transaction.objectStore('notes')
const request = store.openCursor()

request.onsuccess = () => {
  const cursor = request.result

  if (!cursor) {
    console.log('遍历完成')
    return
  }

  console.log(cursor.key, cursor.value)
  cursor.continue()
}
```

游标对象常用属性包括：

- `key`：当前游标位置的键。
- `value`：当前记录的值。
- `primaryKey`：当前记录的主键。
- `direction`：游标方向。

游标还可以调用 `update()` 更新当前记录，或调用 `delete()` 删除当前记录，但事务必须有写权限。

## 9. 🤔 键范围和游标方向怎么控制查询？

`IDBKeyRange` 可以限制游标遍历范围。

```js
const range = IDBKeyRange.bound('n-001', 'n-099')
const request = store.openCursor(range)
```

常见范围方法包括：

| 方法                                                    | 说明             |
| ------------------------------------------------------- | ---------------- |
| `IDBKeyRange.only(key)`                                 | 只匹配一个键。   |
| `IDBKeyRange.lowerBound(key, open)`                     | 设置下限。       |
| `IDBKeyRange.upperBound(key, open)`                     | 设置上限。       |
| `IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen)` | 同时设置上下限。 |

`open` 为 `true` 表示不包含边界值。

`openCursor()` 的第二个参数可以设置方向。

```js
store.openCursor(null, 'prev')
store.openCursor(null, 'nextunique')
```

常见方向有 `next`、`nextunique`、`prev` 和 `prevunique`。

## 10. 🤔 索引如何加速查询？

如果需要按主键之外的字段查询，可以创建索引。索引也必须在版本升级期间创建。

```js
request.onupgradeneeded = () => {
  const database = request.result
  const store = database.createObjectStore('notes', {
    keyPath: 'id',
  })

  store.createIndex('byUpdatedAt', 'updatedAt')
  store.createIndex('byTitle', 'title', {
    unique: false,
  })
}
```

使用索引读取：

```js
const transaction = database.transaction('notes')
const store = transaction.objectStore('notes')
const index = store.index('byTitle')
const request = index.get('客户端存储')

request.onsuccess = () => {
  console.log(request.result)
}
```

索引也可以打开游标，适合按某个字段遍历或范围查询。

## 11. 🤔 IndexedDB 有哪些并发和限制问题？

IndexedDB 数据库版本升级时，可能遇到多个标签页同时打开同一个数据库的问题。一个标签页想升级数据库，另一个标签页还占用旧连接，升级就可能被阻塞。

成功打开数据库后，应该处理 `versionchange`，在其他页面需要升级时关闭当前连接。

```js
request.onsuccess = () => {
  const database = request.result

  database.onversionchange = () => {
    database.close()
  }
}
```

打开请求也可以监听 `blocked`，提示用户关闭其他页面。

```js
request.onblocked = () => {
  console.log('数据库升级被其他标签页阻塞')
}
```

IndexedDB 也受同源策略和浏览器配额限制。不同源不能共享数据库，用户清除站点数据也会删除 IndexedDB 内容。虽然容量通常比 Web Storage 大，但它仍然不是无限空间。

最后，IndexedDB 中的数据默认不加密。它适合保存离线和缓存数据，但敏感信息仍然要谨慎处理，必要时应由服务端保护或在客户端做额外加密。
