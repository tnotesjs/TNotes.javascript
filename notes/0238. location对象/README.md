# [0238. location对象](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0238.%20location%E5%AF%B9%E8%B1%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `location` 对象是什么？](#3--location-对象是什么)
- [4. 🤔 `location` 能拆出 URL 的哪些部分？](#4--location-能拆出-url-的哪些部分)
- [5. 🤔 如何解析查询字符串？](#5--如何解析查询字符串)
- [6. 🤔 `URLSearchParams` 如何使用？](#6--urlsearchparams-如何使用)
- [7. 🤔 如何通过 `location` 导航到新地址？](#7--如何通过-location-导航到新地址)
- [8. 🤔 修改 `location` 属性会发生什么？](#8--修改-location-属性会发生什么)
- [9. 🤔 `replace()` 和普通导航有什么不同？](#9--replace-和普通导航有什么不同)
- [10. 🤔 `reload()` 有什么注意点？](#10--reload-有什么注意点)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `location` 对象的双重访问入口
- URL 各组成部分对应的属性
- 查询字符串解析
- `URLSearchParams`
- 地址导航和属性修改
- `assign()`、`replace()`、`reload()`

## 2. 🫧 评价

- `location` 是读 URL 和改 URL 的核心入口。它看起来只是几个字符串属性，但一旦写入这些属性，就可能触发真实导航，这一点尤其要谨慎。

## 3. 🤔 `location` 对象是什么？

`location` 是 BOM 中非常常用的对象，它保存当前窗口加载文档的 URL 信息，并提供导航能力。

它既是 `window` 的属性，也是 `document` 的属性。

```js
console.log(window.location === document.location) // true
```

因此，`window.location` 和 `document.location` 指向同一个对象。实际开发中通常直接写 `location`。

## 4. 🤔 `location` 能拆出 URL 的哪些部分？

假设当前地址是：

```txt
https://user:pass@example.com:8080/path/page.html?q=javascript#content
```

常见属性可以这样理解：

| 属性       | 示例值                     | 含义             |
| ---------- | -------------------------- | ---------------- |
| `hash`     | `#content`                 | 井号后的片段标识 |
| `host`     | `example.com:8080`         | 主机名和端口     |
| `hostname` | `example.com`              | 主机名           |
| `href`     | 完整 URL                   | 当前完整地址     |
| `pathname` | `/path/page.html`          | 路径             |
| `port`     | `8080`                     | 端口             |
| `protocol` | `https:`                   | 协议             |
| `search`   | `?q=javascript`            | 查询字符串       |
| `username` | `user`                     | 用户名           |
| `password` | `pass`                     | 密码             |
| `origin`   | `https://example.com:8080` | 源，只读         |

`location.toString()` 通常返回的也是完整 URL，效果接近读取 `location.href`。

## 5. 🤔 如何解析查询字符串？

`location.search` 会返回从问号开始的查询字符串。

```js
console.log(location.search) // ?q=javascript&num=10
```

如果手动解析，需要去掉开头的问号，再按 `&` 和 `=` 拆分，并处理 URL 解码。

```js
function getQueryStringArgs() {
  const query = location.search.length > 0 ? location.search.slice(1) : ''

  const args = {}

  for (const pair of query.split('&')) {
    if (!pair) continue

    const [rawName, rawValue = ''] = pair.split('=')
    const name = decodeURIComponent(rawName)
    const value = decodeURIComponent(rawValue)

    args[name] = value
  }

  return args
}
```

这种写法能说明原理，但真实项目里更推荐使用标准 API。

## 6. 🤔 `URLSearchParams` 如何使用？

`URLSearchParams` 提供了处理查询字符串的标准方法。

```js
const searchParams = new URLSearchParams('?q=javascript&num=10')

console.log(searchParams.has('num')) // true
console.log(searchParams.get('q')) // javascript

searchParams.set('page', '3')
searchParams.delete('num')

console.log(searchParams.toString()) // q=javascript&page=3
```

它也可以迭代：

```js
for (const [name, value] of searchParams) {
  console.log(name, value)
}
```

相比手写解析，`URLSearchParams` 更安全、可读，也更少出错。

## 7. 🤔 如何通过 `location` 导航到新地址？

最直接的方法是 `assign()`。

```js
location.assign('https://example.com')
```

设置 `window.location` 或 `location.href` 也会触发类似导航。

```js
window.location = 'https://example.com'
location.href = 'https://example.com'
```

这几种方式都会在浏览器历史记录中新增一条记录。用户通常可以通过后退按钮回到原页面。

## 8. 🤔 修改 `location` 属性会发生什么？

修改 `location` 的部分属性，也会更新当前 URL。

```js
location.hash = '#section1'
location.search = '?q=javascript'
location.pathname = '/docs/'
location.hostname = 'example.com'
location.port = '8080'
```

除了只改 `hash` 这类片段标识的情况，修改多数地址属性都会导致页面重新加载。

`hash` 的变化也可能向浏览器历史记录中增加新条目，这也是早期单页应用常用它实现路由的原因。

## 9. 🤔 `replace()` 和普通导航有什么不同？

`replace()` 会导航到新地址，但不会新增历史记录，而是替换当前历史记录。

```js
location.replace('https://example.com')
```

调用后，用户不能通过后退按钮回到被替换的页面。

这个方法常用于：

- 登录后替换登录页。
- 旧地址永久跳转到新地址。
- 不希望用户回到中间过渡页。

## 10. 🤔 `reload()` 有什么注意点？

`reload()` 用于重新加载当前页面。

```js
location.reload()
```

不传参数时，浏览器可能会使用缓存。传入 `true` 可以提示浏览器从服务器重新加载，不过这个参数在现代规范和实现中已经不再推荐依赖。

```js
location.reload(true)
```

调用 `reload()` 之后，后续脚本是否继续执行取决于浏览器和加载时机。实际写代码时，通常把它放在逻辑末尾。
