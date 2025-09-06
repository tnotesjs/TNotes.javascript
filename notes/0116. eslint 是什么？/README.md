# [0116. eslint 是什么？](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0116.%20eslint%20%E6%98%AF%E4%BB%80%E4%B9%88%EF%BC%9F)

<!-- region:toc -->

- [1. 🔗 links](#1--links)
- [2. 📒 eslint 简介](#2--eslint-简介)
- [3. 📒 eslint 的一些主要功能和用途](#3--eslint-的一些主要功能和用途)
- [4. 💻 demo - 基础示例 - 尝试添加规则：程序中的引号必须使用单引号](#4--demo---基础示例---尝试添加规则程序中的引号必须使用单引号)

<!-- endregion:toc -->

## 1. 🔗 links

- https://eslint.org/ - eslint 官网
- https://github.com/eslint/eslint - eslint GitHub

## 2. 📒 eslint 简介

- ESLint 是一个 **开源** 的 JavaScript 代码检查工具，它可以帮助开发者发现代码中的问题，并 **强制执行一致的编码风格**。ESLint 可以识别并报告关于你代码的问题，无论是语法错误还是不符合特定编码规范的情况。
- ESLint 是一个用于识别和报告在 ECMAScript/JavaScript 代码中发现的模式匹配问题的工具，它的主要目标是帮助开发者确保代码的一致性，并且减少错误的发生。它是一个完全 **可插拔** 的工具，这意味着每条规则都是一个独立的插件，用户可以根据自己的需求在运行时添加更多的规则。
- ESLint 不仅可以作为单独的命令行工具使用，还可以集成到大多数现代的集成开发环境（IDE）中，如 Visual Studio Code、WebStorm 等，从而实现实时的代码质量反馈。通过配置 ESLint 插件，比如 VS Code 的 ESLint 插件，可以在编辑器内直接提示代码格式错误，并且可以通过执行 `eslint . --fix` 命令来检查并自动修复一些常见的代码风格问题。
- ESLint 提供了高度自定义的能力，允许用户根据项目的需求配置不同的规则。这些规则可以是内置的，也可以是通过社区插件提供的，甚至用户自己编写。这样的灵活性使得 ESLint 可以适应从个人项目到大型企业应用的各种规模的 JavaScript 项目。
- 除了帮助保持一致的编码风格，ESLint 还能够检测潜在的错误，例如未使用的变量、不安全的操作等。这有助于提高代码的质量，减少 bug，并促进团队成员之间的协作。此外，由于其开源特性，ESLint 拥有一个活跃的社区，持续更新和改进规则集，确保它可以跟上 JavaScript 和相关技术的发展步伐。
- ESLint 是一个强大的代码检查工具，对于任何想要提升代码质量和维护性的 JavaScript 开发者来说都是不可或缺的工具。通过合理地配置和使用 ESLint，可以显著提高开发效率和最终产品的稳定性。

## 3. 📒 eslint 的一些主要功能和用途

1. **可配置性**：ESLint 提供了非常灵活的配置选项，允许用户自定义规则。你可以选择遵循流行的风格指南（如 Airbnb、Google 或者 StandardJS）或者创建自己的规则集。
2. **插件系统**：ESLint 支持插件，这意味着社区可以扩展它的功能。例如，有插件支持 React、Vue.js 和 TypeScript 等框架和技术。
3. **自动修复**：对于某些类型的错误或不一致，ESLint 能够自动修复这些问题，这可以节省大量的时间。
4. **提高代码质量**：通过强制实施良好的编程实践，ESLint 有助于减少 bug 并保持代码库的一致性和可读性。
5. **集成开发环境 (IDE) 支持**：大多数现代 IDE 和编辑器都支持 ESLint，可以在编写代码时实时显示警告和错误信息。
6. **团队协作**：在一个团队中使用 ESLint 可以确保所有成员遵循相同的编码标准，从而降低代码审查过程中的摩擦。

要开始使用 ESLint，你需要首先安装它。可以通过 npm（Node 包管理器）来安装 ESLint。安装完成后，你可以初始化一个配置文件，然后在你的项目中运行 ESLint 来检查代码。

安装 ESLint 的基本命令如下：

```bash
npm install eslint --save-dev
```

然后初始化配置文件：

```bash
npx eslint --init
```

`eslint --init` 命令会引导你完成一系列的选择题，帮助你设置最适合项目的 ESLint 配置。根据你的选择，它可能会生成一个 `.eslintrc` 文件，该文件包含了所有的规则设定。之后，你可以在你的构建流程中加入 `eslint` 命令来定期检查代码。

## 4. 💻 demo - 基础示例 - 尝试添加规则：程序中的引号必须使用单引号

```js
// demo/eslint.config.cjs
module.exports = {
  rules: {
    quotes: ['error', 'single'],
    // 引号必须使用单引号，否则会报错。
  },
}
```

```js
// demo/1.js
const str = 'Hello World'
// 报错：
// Strings must use singlequote.eslintquotes
```

- ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-09-29-10-29-42.png)
- 可以通过 eslint 命令来快速修复一个模块中不符合规范的代码，能够减少手动修改代码的工作量。不过这个功能仅限于那些可以自动化修复的错误，比如这个示例中的引号错误使用而引起的错误。对于那些无法自动一键修复的错误，依旧是需要根据 IDE 的提示，手动去修改的。
- ![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs@main/2024-09-29-10-32-20.png)
- 命令 `eslint --fix` 可用来一键修复模块中的一些能够被自动修复的错误。
- eslint 规则未生效的原因可能是因为 eslint 配置文件没有被正确加载，或者是 eslint 服务出现问题。测试时如果出现这样的异常现象“已明确代码没问题，但是 VSCode 并没有提供错误提示”，可以通过重启 VSCode 来尝试解决。
