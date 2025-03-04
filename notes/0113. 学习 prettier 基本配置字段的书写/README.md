# [0113. 学习 prettier 基本配置字段的书写](https://github.com/Tdahuyou/TNotes.html-css-js/tree/main/notes/0113.%20%E5%AD%A6%E4%B9%A0%20prettier%20%E5%9F%BA%E6%9C%AC%E9%85%8D%E7%BD%AE%E5%AD%97%E6%AE%B5%E7%9A%84%E4%B9%A6%E5%86%99)

<!-- region:toc -->
- [1. 💻 demos.1 - `singleQuote` - 使用单引号](#1--demos1---singlequote---使用单引号)
<!-- endregion:toc -->

## 1. 💻 demos.1 - `singleQuote` - 使用单引号

- singleQuote 默认值是 false，表示格式化后默认使用的是双引号，如果你想要使用单引号，可以将 singleQuote 设置为 true。
- prettier 配置文件 .prettierrc 文件内容如下：

```json
{
  "singleQuote": true
}
```

- 测试文件内容如下：

```js
console.log("semi singleQuote");
```

- 格式化之后的效果如下：

```js
console.log('semi singleQuote');
```