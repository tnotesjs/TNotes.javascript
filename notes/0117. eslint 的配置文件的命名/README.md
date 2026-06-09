# [0117. eslint 的配置文件的命名](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0117.%20eslint%20%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E7%9A%84%E5%91%BD%E5%90%8D)

<!-- region:toc -->

- [1. 官方文档 > Configuration File](#1-官方文档--configuration-file)
- [2. eslint 的配置文件名称的更多写法](#2-eslint-的配置文件名称的更多写法)

<!-- endregion:toc -->

## 1. 官方文档 > Configuration File

- https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file

> 下面是来自官方文档的描述。

The ESLint configuration file may be named any of the following:

- eslint.config.js
- eslint.config.mjs
- eslint.config.cjs
- eslint.config.ts (requires additional setup)
- eslint.config.mts (requires additional setup)
- eslint.config.cts (requires additional setup)

It should be placed in the root directory of your project and export an array of configuration objects. Here’s an example:

```js
// eslint.config.js
export default [
  {
    rules: {
      semi: 'error',
      'prefer-const': 'error',
    },
  },
]
```

> 注意：官方文档罗列的这些名称，并非全部，eslint 的配置文件命名还有很多种写法。

## 2. eslint 的配置文件名称的更多写法

- eslint 的配置文件命名有多种写法，比如 eslint.config |.js|.mjs|.cjs|.ts|.mts|.cts 或者 .eslintrc |.js|.json|.yml|.cjs|.mjs 或者 package.json 等等。需要知道 eslint 配置文件的命名是非常灵活的，这决定了 eslint 配置信息应该书写在什么位置，我们需要知道在哪查看 eslint 的配置信息。
- eslint 的配置文件可以有多种命名方式，而不仅仅是官方列出的那些。实际上，ESLint 支持多种配置文件格式和命名约定。

1. **`.eslintrc.js`** - JavaScript 格式的配置文件。
2. **`.eslintrc.json`** - JSON 格式的配置文件。
3. **`.eslintrc.yaml`** - YAML 格式的配置文件。
4. **`.eslintrc.yml`** - YAML 格式的配置文件（与 `.yaml` 同义）。
5. **`.eslintrc.cjs`** - CommonJS 格式的配置文件。
6. **`.eslintrc.mjs`** - ECMAScript 模块格式的配置文件。
7. **`package.json`** - 在项目的 `package.json` 文件中添加 `"eslintConfig"` 字段。

此外，从 ESLint v8 开始，还支持以下新的配置文件名：

- **`eslint.config.js`** - JavaScript 格式的配置文件。
- **`eslint.config.cjs`** - CommonJS 格式的配置文件。
- **`eslint.config.mjs`** - ECMAScript 模块格式的配置文件。
- **`eslint.config.ts`** - TypeScript 格式的配置文件（需要额外设置）。
- **`eslint.config.mts`** - TypeScript 模块格式的配置文件（需要额外设置）。
- **`eslint.config.cts`** - TypeScript CommonJS 格式的配置文件（需要额外设置）。

这些新的命名约定是为了更好地与其他工具保持一致，并且更明确地表示它们是 ESLint 的配置文件。

**如何选择？**

- 如果你的项目已经使用了 `.eslintrc.js` 或其他传统命名，你可以继续使用它。
- 如果你在创建新项目或希望采用最新标准，可以考虑使用 `eslint.config.js` 或相应的其他扩展名。

**注意事项：**

- 如果在同一目录下存在多个配置文件，ESLint 会根据上面列出的顺序选择第一个找到的配置文件。
- 对于 TypeScript 配置文件（如 `eslint.config.ts`），你需要确保安装了 `@typescript-eslint/parser` 和相关的插件，并且在你的项目中正确配置了 TypeScript。
