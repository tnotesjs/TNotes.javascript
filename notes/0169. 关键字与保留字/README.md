# [0169. 关键字与保留字](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0169.%20%E5%85%B3%E9%94%AE%E5%AD%97%E4%B8%8E%E4%BF%9D%E7%95%99%E5%AD%97)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是关键字？](#3--什么是关键字)
- [4. 🤔 什么是保留字？](#4--什么是保留字)
- [5. 🤔 `true`、`false` 和 `null` 属于哪一类？](#5--truefalse-和-null-属于哪一类)
- [6. 🤔 命名时最实用的规则是什么？](#6--命名时最实用的规则是什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 关键字的含义
- 保留字的含义
- 严格模式和模块中的额外保留词
- 为什么不应用关键字和保留字命名

## 2. 🫧 评价

关键字和保留字不需要死背成表，但要知道它们是语言语法的一部分。真正重要的是命名时避开这些词，别把变量名写成未来会和语言演进打架的样子。

## 3. 🤔 什么是关键字？

关键字是 ECMAScript 语法已经占用的词。它们有明确用途，常用于控制流程、声明变量、定义类、导入导出模块或执行特定操作。

比如下面这些都是常见关键字：

```txt
break case catch class const continue debugger default delete do
else export extends finally for function if import in instanceof
new return super switch this throw try typeof var void while with yield
```

关键字不能作为变量名、函数名或参数名：

```js
// 语法错误
const return = 1
```

如果一个词已经被语言语法占用，你就应该把它看作“不能拿来命名”的词。

## 4. 🤔 什么是保留字？

保留字是当前可能还没有具体语法用途，但规范预留给未来使用的词。它们存在的目的，是避免今天写出的代码阻碍未来语言扩展。

书里提到的例子包括：

```txt
enum
```

严格模式下还会保留更多词，例如：

```txt
implements interface let package private protected public static
```

模块代码中还会保留：

```txt
await
```

不同版本的规范和运行环境对保留字的处理可能存在差异。为了代码长期稳定，命名时最好主动避开它们。

## 5. 🤔 `true`、`false` 和 `null` 属于哪一类？

`true`、`false` 和 `null` 不是普通变量名，而是语言中的字面量。

它们同样不能作为标识符使用：

```js
// 都是错误写法
let true = 1
let false = 0
let null = 'empty'
```

这三个词分别表示布尔值和空对象指针语义，是语言核心的一部分。即使某些上下文里看起来像普通单词，也不要拿来命名。

## 6. 🤔 命名时最实用的规则是什么？

命名时可以遵循一个简单规则：凡是看起来像语言语法、控制流程或未来标准词汇的单词，都不要用作标识符。

更稳妥的做法是使用带业务含义的组合词：

```js
const userType = 'admin'
const currentClassName = 'active'
const packageInfo = { name: 'demo' }
```

这样既能避开关键字和保留字，也能让代码语义更清楚。

虽然现代 JavaScript 对对象属性名的限制比早期宽松，但为了兼容性和可读性，依然不建议故意使用关键字或保留字作为属性名。
