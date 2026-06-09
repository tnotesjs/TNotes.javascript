# [0113. 学习 prettier 基本配置字段的书写](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0113.%20%E5%AD%A6%E4%B9%A0%20prettier%20%E5%9F%BA%E6%9C%AC%E9%85%8D%E7%BD%AE%E5%AD%97%E6%AE%B5%E7%9A%84%E4%B9%A6%E5%86%99)

<!-- region:toc -->

- [1. 认识一些常见的基本配置字段](#1-认识一些常见的基本配置字段)
- [2. demos.1 - `singleQuote` - 使用单引号](#2-demos1---singlequote---使用单引号)
- [3. demos.2 - `semi` - 配置 js 语句结尾是否加分号](#3-demos2---semi---配置-js-语句结尾是否加分号)
- [4. demos.3 - 缩进配置 `tabWidth`](#4-demos3---缩进配置-tabwidth)
- [5. 将 prettier 配置的书写位置](#5-将-prettier-配置的书写位置)
- [6. demos.4 - 将 prettier 配置写到项目根目录中的 `.vscode/settings.json` 文件中](#6-demos4---将-prettier-配置写到项目根目录中的-vscodesettingsjson-文件中)

<!-- endregion:toc -->

## 1. 认识一些常见的基本配置字段

- `singleQuote` 默认值是 `false`，表示格式化后默认使用的是双引号。如果你想要使用单引号，可以将 `singleQuote` 设置为 `true`。
- `semi` 默认值为 `true`，表示格式化之后，语句结尾会自动加上分号。如果你想要让代码看起来更简洁一些，想要把语句结尾的分号给去掉，可以将 `semi` 配置给手动设置为 `false`。
- `tabWidth` 配置缩进长度。

## 2. demos.1 - `singleQuote` - 使用单引号

::: code-group

```json [.prettierrc]
{
  "singleQuote": true
}
```

```js [测试文件内容]
console.log('semi singleQuote')
```

```js [格式化之后的效果]
console.log('semi singleQuote')
```

:::

## 3. demos.2 - `semi` - 配置 js 语句结尾是否加分号

::: code-group

```json [.prettierrc]
{
  "semi": true
}
```

```js [测试文件内容]
console.log('semi test')
```

```js [格式化之后的效果]
console.log('semi test')
```

:::

- 如果将 `semi` 配置为 `false`，格式化之后的效果如下：

```js
console.log('semi test')
```

## 4. demos.3 - 缩进配置 `tabWidth`

::: code-group

```json [.prettierrc]
{
  "tabWidth": 2
}
```

```js [格式化前]
function sum(a, b) {
  return a + b
}
```

```js [格式化后]
function sum(a, b) {
  return a + b
}
```

:::

## 5. 将 prettier 配置的书写位置

- 除了写在 `.prettierrc` 文件中，还可以写到项目根目录中的 `.vscode/settings.json` 文件中。

## 6. demos.4 - 将 prettier 配置写到项目根目录中的 `.vscode/settings.json` 文件中

::: code-group

```json [.vscode/settings.json]
{
  "prettier.singleQuote": true,
  "prettier.semi": false
}
```

```js [格式化前]
console.log('test .vscode/settings.json')
```

```js [格式化后]
console.log('test .vscode/settings.json')
```

:::
