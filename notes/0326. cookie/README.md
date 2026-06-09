# [0326. cookie](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0326.%20cookie)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `cookie` 的基本工作流程是什么？](#3-cookie-的基本工作流程是什么)
- [4. `cookie` 有哪些常见限制？](#4-cookie-有哪些常见限制)
- [5. 一个 `cookie` 由哪些部分组成？](#5-一个-cookie-由哪些部分组成)
- [6. 如何用 JavaScript 读写 `cookie`？](#6-如何用-javascript-读写-cookie)
- [7. 什么是子 `cookie`？](#7-什么是子-cookie)
- [8. 使用 `cookie` 时要注意什么？](#8-使用-cookie-时要注意什么)

<!-- endregion:toc -->

## 1. 本节内容

- HTTP `cookie` 的基本流程
- `Set-Cookie` 和 `Cookie` 请求头
- `cookie` 的作用域、过期时间和安全属性
- `document.cookie` 的读写方式
- 子 `cookie` 的历史用途
- 使用 `cookie` 的限制和注意事项

## 2. 评价

- `cookie` 是客户端存储里最容易被误用的一种：它既是存储机制，也是 HTTP 请求状态机制，所以大小、作用域和安全属性都必须格外克制。

## 3. `cookie` 的基本工作流程是什么？

HTTP `cookie` 最初是为保存会话信息设计的。服务器通过响应头设置 `cookie`，浏览器保存后，会在后续匹配的请求中自动把它带回服务器。

服务器设置：

```http
HTTP/1.1 200 OK
Content-Type: text/html
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
```

浏览器后续请求：

```http
GET /profile HTTP/1.1
Cookie: sessionId=abc123
```

这个自动往返能力让 `cookie` 很适合保存会话标识，但也意味着它会增加请求头大小，并且可能引入 CSRF、泄露和滥存数据的问题。

## 4. `cookie` 有哪些常见限制？

`cookie` 会绑定到特定域，并受浏览器限制。原书中给出的经验值包括：总数量有限、单个 `cookie` 通常约 4KB、每个域能保存的数量和总大小也有限。

这些数字会随浏览器实现变化，但结论一直成立：`cookie` 不是大容量存储。

如果 `cookie` 超过数量或大小限制，浏览器可能拒绝写入，也可能删除旧数据。更麻烦的是，这些行为在不同浏览器中并不完全一致。

因为 `cookie` 会自动随请求发送，保存得越多，请求头越大。对同一个域下的每个请求来说，这都是额外成本。

## 5. 一个 `cookie` 由哪些部分组成？

一个 `cookie` 至少包含名称和值，还可以包含一组属性。

| 部分                  | 说明                                      |
| --------------------- | ----------------------------------------- |
| 名称                  | 唯一标识这个 `cookie`，通常需要编码。     |
| 值                    | 保存的字符串值，通常也需要编码。          |
| `Domain`              | 指定哪些域可以接收这个 `cookie`。         |
| `Path`                | 指定哪些路径下的请求会携带这个 `cookie`。 |
| `Expires` / `Max-Age` | 指定过期时间或存活秒数。                  |
| `Secure`              | 只在 HTTPS 请求中发送。                   |
| `HttpOnly`            | 禁止 JavaScript 读取，通常由服务器设置。  |
| `SameSite`            | 控制跨站请求是否携带 `cookie`。           |

例如：

```http
Set-Cookie: theme=dark; Max-Age=2592000; Path=/; Secure; SameSite=Lax
```

`Domain`、`Path`、过期时间和安全属性用于告诉浏览器何时保存、删除、发送或隐藏这个 `cookie`。真正发回服务器的通常只有名值对。

## 6. 如何用 JavaScript 读写 `cookie`？

浏览器提供的接口是 `document.cookie`。读取它时，会得到当前页面可访问的所有非 `HttpOnly` `cookie`，格式是分号分隔的字符串。

```js
console.log(document.cookie)
// name=Nicholas; theme=dark
```

写入它时，是追加或更新一个 `cookie`，不是替换整个字符串。

```js
document.cookie = `${encodeURIComponent('name')}=${encodeURIComponent('Nicholas')}; Path=/`
```

删除 `cookie` 的本质，是用相同名称、路径和域重新设置一次，并把过期时间设为过去。

```js
document.cookie = 'name=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/'
```

因为 `document.cookie` 只是字符串接口，直接操作很容易出错。可以封装一个小工具：

```js
const Cookie = {
  get(name) {
    const prefix = `${encodeURIComponent(name)}=`
    const item = document.cookie
      .split('; ')
      .find((row) => row.startsWith(prefix))

    return item ? decodeURIComponent(item.slice(prefix.length)) : null
  },

  set(name, value, options = {}) {
    const {
      expires,
      path = '/',
      domain,
      secure = false,
      sameSite = 'Lax',
    } = options

    let text = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    if (expires instanceof Date) {
      text += `; Expires=${expires.toUTCString()}`
    }

    if (path) text += `; Path=${path}`
    if (domain) text += `; Domain=${domain}`
    if (secure) text += '; Secure'
    if (sameSite) text += `; SameSite=${sameSite}`

    document.cookie = text
  },

  remove(name, options = {}) {
    this.set(name, '', {
      ...options,
      expires: new Date(0),
    })
  },
}
```

::: tip 注意

`HttpOnly` 不能通过 `document.cookie` 设置。它必须由服务器通过 `Set-Cookie` 响应头设置，用于防止脚本读取敏感 `cookie`。

:::

## 7. 什么是子 `cookie`？

子 `cookie` 是一种历史技巧：把多个小型名值对塞进同一个 `cookie` 的值里。

```txt
data=name=Nicholas&book=Professional%20JavaScript
```

这样可以绕开每个域 `cookie` 数量较少的问题，把多项数据放进一个 `cookie`。它的格式类似查询字符串，读取时先解析外层 `cookie`，再解析内部子项。

但子 `cookie` 仍然受单个 `cookie` 大小限制，而且整个值仍然会随请求发送。现代开发中，如果数据只给前端使用，通常应该改用 Web Storage 或 IndexedDB。

## 8. 使用 `cookie` 时要注意什么？

第一，不要把大量数据放入 `cookie`。它会随着匹配请求自动发送，数据越大，请求负担越重。

第二，不要在可被 JavaScript 读取的 `cookie` 中保存敏感信息。XSS 一旦发生，脚本就可以读取这些值。认证会话类 `cookie` 应尽量由服务端设置 `HttpOnly`、`Secure` 和合适的 `SameSite`。

第三，删除或更新 `cookie` 时，名称、路径和域要匹配。否则你可能只是创建了另一个同名但作用域不同的 `cookie`。

第四，`cookie` 是 HTTP 状态机制，不是通用本地数据库。需要保存前端偏好、草稿、缓存或结构化数据时，应优先考虑 Web Storage 或 IndexedDB。
