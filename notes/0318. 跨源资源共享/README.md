# [0318. 跨源资源共享](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0318.%20%E8%B7%A8%E6%BA%90%E8%B5%84%E6%BA%90%E5%85%B1%E4%BA%AB)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 为什么浏览器默认限制跨源请求？](#3-为什么浏览器默认限制跨源请求)
- [4. CORS 的基本流程是什么？](#4-cors-的基本流程是什么)
- [5. 什么是简单请求？](#5-什么是简单请求)
- [6. 什么情况下会触发预检请求？](#6-什么情况下会触发预检请求)
- [7. 带 Cookie 的跨源请求为什么更严格？](#7-带-cookie-的跨源请求为什么更严格)
- [8. CORS 不是什么？](#8-cors-不是什么)

<!-- endregion:toc -->

## 1. 本节内容

- 同源策略和跨源限制
- CORS 的基本请求流程
- `Origin` 和 `Access-Control-Allow-Origin`
- 预检请求
- 凭据请求和 Cookie
- CORS 的能力边界

## 2. 评价

- CORS 不是“前端打开跨域开关”，而是浏览器和服务器共同执行的访问控制协议；真正决定能不能读响应的是服务器的授权头。

## 3. 为什么浏览器默认限制跨源请求？

XHR 和 Fetch 都运行在浏览器安全模型里。默认情况下，脚本只能读取同源资源。同源要求协议、域名和端口都相同。

例如，下面三个来源互相都不是同源：

| URL                        | 差异       |
| -------------------------- | ---------- |
| `https://example.com`      | 基准来源。 |
| `http://example.com`       | 协议不同。 |
| `https://api.example.com`  | 域名不同。 |
| `https://example.com:8443` | 端口不同。 |

限制跨源读取可以防止恶意站点利用用户浏览器中的登录态读取其他站点的数据。

## 4. CORS 的基本流程是什么？

CORS 通过 HTTP 头部让服务器明确授权浏览器读取跨源响应。

简单请求中，浏览器会自动添加 `Origin` 请求头：

```http
Origin: https://app.example.com
```

如果服务器允许这个来源访问，就返回 `Access-Control-Allow-Origin`：

```http
Access-Control-Allow-Origin: https://app.example.com
```

如果资源公开，也可以返回：

```http
Access-Control-Allow-Origin: *
```

浏览器收到响应后，会检查 CORS 响应头。如果缺少允许头，或来源不匹配，浏览器会阻止 JavaScript 读取响应。

## 5. 什么是简单请求？

简单请求不会先发送预检请求。常见条件包括：

- 方法是 `GET`、`HEAD` 或 `POST`。
- 没有使用非安全列表中的自定义请求头。
- `Content-Type` 是安全列表中的类型，例如 `text/plain`、`application/x-www-form-urlencoded` 或 `multipart/form-data`。

例如：

```js
fetch('https://api.example.com/public-data')
  .then((response) => response.json())
  .then(console.log)
```

这段代码能不能读到响应，不取决于前端代码本身，而取决于服务器是否返回了正确 CORS 头。

## 6. 什么情况下会触发预检请求？

如果请求使用了复杂条件，浏览器会先发送 `OPTIONS` 预检请求，询问服务器是否允许真正请求。

常见触发条件包括：

- 使用 `PUT`、`PATCH`、`DELETE` 等方法。
- 设置自定义请求头。
- 使用非简单 `Content-Type`，例如 `application/json`。

预检请求会包含：

```http
Origin: https://app.example.com
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: Content-Type, X-CSRF-Token
```

服务器允许时，可以返回：

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PATCH
Access-Control-Allow-Headers: Content-Type, X-CSRF-Token
Access-Control-Max-Age: 86400
```

`Access-Control-Max-Age` 可以让浏览器缓存预检结果，减少后续重复预检。

## 7. 带 Cookie 的跨源请求为什么更严格？

默认情况下，跨源请求不会随便把凭据交给脚本读取。凭据包括 Cookie、HTTP 认证信息和客户端证书。

Fetch 中需要显式配置：

```js
fetch('https://api.example.com/user', {
  credentials: 'include',
})
```

XHR 中对应的是：

```js
const request = new XMLHttpRequest()

request.open('GET', 'https://api.example.com/user', true)
request.withCredentials = true
request.send(null)
```

服务器也必须返回：

```http
Access-Control-Allow-Credentials: true
```

并且带凭据时，`Access-Control-Allow-Origin` 不能使用 `*`，必须是明确来源。

## 8. CORS 不是什么？

CORS 不是认证机制。它只是浏览器决定是否把跨源响应交给 JavaScript 的规则。

服务器仍然必须自己判断：

- 用户是否已登录。
- 用户是否有权访问对应资源。
- 请求是否携带有效 CSRF token。
- 接口是否允许当前操作。

也就是说，CORS 解决的是“浏览器脚本能不能读取跨源响应”，不是“用户有没有权限执行业务操作”。
