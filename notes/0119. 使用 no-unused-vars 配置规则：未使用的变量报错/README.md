# [0119. 使用 no-unused-vars 配置规则：未使用的变量报错](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0119.%20%E4%BD%BF%E7%94%A8%20no-unused-vars%20%E9%85%8D%E7%BD%AE%E8%A7%84%E5%88%99%EF%BC%9A%E6%9C%AA%E4%BD%BF%E7%94%A8%E7%9A%84%E5%8F%98%E9%87%8F%E6%8A%A5%E9%94%99)

<!-- region:toc -->

- [1. eslint 官方文档 > no-unused-vars](#1-eslint-官方文档--no-unused-vars)
- [2. `no-unused-vars` 简介](#2-no-unused-vars-简介)
- [3. demo - `'no-unused-vars': 'error'`](#3-demo---no-unused-vars-error)
- [4. 忽略模式概述](#4-忽略模式概述)

<!-- endregion:toc -->

## 1. eslint 官方文档 > no-unused-vars

- https://eslint.org/docs/latest/rules/no-unused-vars

## 2. `no-unused-vars` 简介

- `no-unused-vars` 用于检测代码中未使用的变量、函数参数或导入的模块。
- 默认情况下，对于一个模块中未使用的变量，程序中是不会报错的。
- 未被使用的变量对程序的逻辑并不会造成影响，并且这些变量在后续可能会被用到。因此在开发的过程中，有时候会刻意将 `no-unused-vars` 配置给关闭掉，让未使用的变量保留下来，以便后续使用。
  - 补充：虽然在开发过程中这些未被使用的变量被保留下来，但是这些变量在打包构建后是会被构建工具给自动移除掉的，在最终的打包产物中是不存在的，因此无需担心它们对打包结果造成影响。
- 如果想要确保程序中不存在未使用的变量，可以通过 `no-unused-vars` 规则来检测并报错提示，然后再将这些提示的变量处理掉。

## 3. demo - `'no-unused-vars': 'error'`

```js
module.exports = {
  rules: {
    'no-unused-vars': 'error',
  },
}
```

- `'no-unused-vars': 'error'` 表示启用 `no-unused-vars` 规则，并设置为错误级别。这意味着，如果代码中出现未使用的变量，ESLint 将会报出警告或错误。
- 下面是一个报错的例子：
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-09-29-13-03-19.png)
- 除了 `error` 还可以配置为 `warn` 如果设置为 `'no-unused-vars': 'error'`，则会在错误的位置通过黄色的下划线来警告出错。
  - ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-11-28-17-33-23.png)

## 4. 忽略模式概述

```javascript
// 如果你希望忽略某些特定的变量名或模式，可以使用 varsIgnorePattern 和 argsIgnorePattern 选项：
module.exports = {
  rules: {
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    // 所有以 _ 开头的变量和函数参数将被忽略，不会触发 no-unused-vars 错误。
  },
}
```

假设你有如下 JavaScript 代码：

```javascript
function example(a, b) {
  console.log(a)
}

const unusedVar = 42
```

如果没有配置 `no-unused-vars` 规则，这段代码会被认为是有效的。但是，当你启用了 `no-unused-vars` 规则后，ESLint 会报告 `b` 和 `unusedVar` 未被使用。

如果你想要忽略以 `_` 开头的变量，可以配置如下：

```javascript
module.exports = {
  rules: {
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
}
```

然后修改代码：

```javascript
function example(_a, _b) {
  console.log(_a)
}

const _unusedVar = 42
```

此时，ESLint 将不会报告 `_b` 和 `_unusedVar` 未被使用。

通过这样的配置，你可以根据项目的具体需求灵活地应用 `no-unused-vars` 规则。

---

```javascript
// 忽略函数参数
// 有时候你可能需要保留一些函数参数，即使它们没有被使用，比如回调函数中的默认参数。你可以通过设置 args 选项来调整这一点：
module.exports = {
  rules: {
    'no-unused-vars': ['error', { args: 'none' }],
    // 这会禁用对函数参数的检查。
  },
}
```

```javascript
// 检查已解构的变量
// 默认情况下，no-unused-vars 不会检查解构赋值中的未使用变量。
// 如果你想启用这项检查，可以设置 destructuredArrayIgnorePattern 和 ignoreRestSiblings 选项：
module.exports = {
  rules: {
    'no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_' }],
    // 除了那些匹配模式的解构变量外，其他未使用的解构变量都会触发错误。
  },
}
```

```javascript
// 忽略导出的变量
// 有时你可能需要导出一些变量，即使它们在当前文件中没有被使用。你可以通过设置 vars 选项来调整这一点：
module.exports = {
  rules: {
    'no-unused-vars': ['error', { vars: 'local' }],
    // 这会只检查局部变量，而忽略全局变量和导出的变量。
  },
}
```
