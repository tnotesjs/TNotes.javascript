# [0298. Web Cryptography API](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0298.%20Web%20Cryptography%20API)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么不能用 `Math.random()` 做加密随机数？](#3--为什么不能用-mathrandom-做加密随机数)
- [4. 🤔 `crypto.subtle` 是什么？](#4--cryptosubtle-是什么)
- [5. 🤔 如何计算摘要？](#5--如何计算摘要)
- [6. 🤔 `CryptoKey` 和 `keyUsages` 如何配合？](#6--cryptokey-和-keyusages-如何配合)
- [7. 🤔 如何导入、导出和派生密钥？](#7--如何导入导出和派生密钥)
- [8. 🤔 如何加密、解密、签名和验证？](#8--如何加密解密签名和验证)
- [9. 🤔 包装和解包密钥是什么？](#9--包装和解包密钥是什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Web Crypto 的安全随机数能力
- `crypto.getRandomValues()`
- `crypto.subtle` 和安全上下文
- 摘要、密钥生成、导入和导出
- 派生、签名、验证、加密、解密、包装和解包

## 2. 🫧 评价

- Web Crypto 是浏览器里少数真正安全敏感的 API；它能做很多事，但前提是你理解算法参数、密钥用途和随机数边界。

## 3. 🤔 为什么不能用 `Math.random()` 做加密随机数？

`Math.random()` 不是密码学安全随机数生成器。它适合普通随机效果，例如简单抽样或 UI 随机展示，但不适合生成密钥、令牌、nonce 或验证码。

Web Cryptography API 提供了密码学安全随机数：`crypto.getRandomValues()`。

```js
const randomBytes = new Uint8Array(16)

crypto.getRandomValues(randomBytes)

console.log(randomBytes)
```

它会把安全随机值写入你提供的整数定型数组。常用数组包括 `Uint8Array`、`Uint16Array`、`Uint32Array`。

## 4. 🤔 `crypto.subtle` 是什么？

`crypto.subtle` 暴露的是 `SubtleCrypto` 对象，提供摘要、加密、解密、签名、验证、密钥生成、密钥导入导出、密钥派生、密钥包装和解包等能力。

```js
console.log(crypto.subtle)
```

这些方法大多返回 `Promise`，并且通常要求安全上下文，也就是 HTTPS 或本地开发环境。

Web Crypto 的很多输入输出都是 `ArrayBuffer` 或定型数组，因此它经常和 Encoding API 配合使用。

## 5. 🤔 如何计算摘要？

摘要会把任意长度数据转换成固定长度哈希值。常见算法包括 `SHA-256`、`SHA-384` 和 `SHA-512`。`SHA-1` 只适合历史说明，不建议用于新安全方案。

```js
async function digestMessage(message) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const digestBuffer = await crypto.subtle.digest('SHA-256', data)
  const digestArray = Array.from(new Uint8Array(digestBuffer))

  return digestArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
```

摘要不是加密。摘要不能还原原文，主要用于完整性校验、指纹、签名输入等场景。

## 6. 🤔 `CryptoKey` 和 `keyUsages` 如何配合？

Web Crypto 使用 `CryptoKey` 表示密钥。生成密钥时，需要指定算法、是否可导出，以及密钥用途。

```js
const key = await crypto.subtle.generateKey(
  {
    name: 'AES-GCM',
    length: 256,
  },
  true,
  ['encrypt', 'decrypt'],
)
```

第三个参数 `keyUsages` 很重要。它限制密钥能做什么，例如：

- `encrypt`：加密。
- `decrypt`：解密。
- `sign`：签名。
- `verify`：验证签名。
- `deriveKey`：派生密钥。
- `deriveBits`：派生比特。
- `wrapKey`：包装密钥。
- `unwrapKey`：解包密钥。

密钥用途越窄越好。不要给一个密钥多余权限。

## 7. 🤔 如何导入、导出和派生密钥？

如果密钥生成时 `extractable` 是 `true`，可以导出。

```js
const rawKey = await crypto.subtle.exportKey('raw', key)
```

也可以导入已有密钥材料。

```js
const importedKey = await crypto.subtle.importKey(
  'raw',
  rawKey,
  'AES-GCM',
  true,
  ['encrypt', 'decrypt'],
)
```

派生密钥常用于从密码或共享秘密中生成真正用于加密的密钥。例如 PBKDF2 会结合盐值和迭代次数派生密钥。

```js
const passwordKey = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode('password'),
  'PBKDF2',
  false,
  ['deriveKey'],
)

const derivedKey = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: crypto.getRandomValues(new Uint8Array(16)),
    iterations: 100000,
    hash: 'SHA-256',
  },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt'],
)
```

派生参数会直接影响安全性，不能随意降低迭代次数或复用盐值。

## 8. 🤔 如何加密、解密、签名和验证？

加密和解密需要算法参数、密钥和数据。以 `AES-GCM` 为例，`iv` 或 nonce 必须保证同一密钥下唯一。

```js
async function encryptText(text, key) {
  const initializationVector = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(text)
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: initializationVector,
    },
    key,
    data,
  )

  return { initializationVector, encryptedData }
}
```

解密必须使用相同算法、密钥和初始化向量。

签名和验证通常用于确认数据来源和完整性。不同算法需要不同密钥类型和参数，例如 `HMAC`、`RSASSA-PKCS1-v1_5`、`ECDSA` 等。

```js
const signature = await crypto.subtle.sign('HMAC', key, data)
const verified = await crypto.subtle.verify('HMAC', key, signature, data)
```

## 9. 🤔 包装和解包密钥是什么？

包装密钥就是用一个密钥保护另一个密钥，常用于安全传输或存储密钥。

```js
const wrappedKey = await crypto.subtle.wrapKey(
  'raw',
  keyToWrap,
  wrappingKey,
  'AES-KW',
)
```

解包则是把被包装的密钥还原成 `CryptoKey`。

```js
const unwrappedKey = await crypto.subtle.unwrapKey(
  'raw',
  wrappedKey,
  wrappingKey,
  'AES-KW',
  'AES-GCM',
  true,
  ['encrypt', 'decrypt'],
)
```

Web Crypto 很强，但也很容易因为参数选择错误而变得不安全。真实项目里，优先使用经过审查的协议和库；直接使用底层加密 API 时，要严格遵循当前安全实践。
