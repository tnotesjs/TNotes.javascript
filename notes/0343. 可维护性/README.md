# [0343. 可维护性](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0343.%20%E5%8F%AF%E7%BB%B4%E6%8A%A4%E6%80%A7)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么样的代码算可维护？](#3--什么样的代码算可维护)
- [4. 🤔 编码规范为什么重要？](#4--编码规范为什么重要)
- [5. 🤔 命名应该遵循哪些原则？](#5--命名应该遵循哪些原则)
- [6. 🤔 JavaScript 中如何让变量类型更透明？](#6--javascript-中如何让变量类型更透明)
- [7. 🤔 为什么要解耦 HTML 和 JavaScript？](#7--为什么要解耦-html-和-javascript)
- [8. 🤔 为什么要解耦 CSS 和 JavaScript？](#8--为什么要解耦-css-和-javascript)
- [9. 🤔 为什么事件处理程序不应该承载完整业务逻辑？](#9--为什么事件处理程序不应该承载完整业务逻辑)
- [10. 🤔 什么是尊重对象所有权？](#10--什么是尊重对象所有权)
- [11. 🤔 为什么要避免声明全局变量？](#11--为什么要避免声明全局变量)
- [12. 🤔 为什么不要只比较 `null`？](#12--为什么不要只比较-null)
- [13. 🤔 为什么要使用常量？](#13--为什么要使用常量)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 可维护代码的特征
- 编码规范与可读性
- 命名规则和类型透明化
- HTML、CSS、JavaScript 的松散耦合
- 应用程序逻辑与事件处理程序解耦
- 尊重对象所有权
- 避免全局变量
- 类型检查和常量管理

## 2. 🫧 评价

- 可维护性的核心不是格式漂亮，而是让代码的意图、边界和变化点清楚到后来的人敢改、能改、改得稳。

## 3. 🤔 什么样的代码算可维护？

可维护代码不是只看当前能不能运行，而是看它在未来需求变化、人员交接和线上问题出现时是否还能被可靠修改。

通常，可维护代码具备这些特点：

| 特征     | 说明                                             |
| -------- | ------------------------------------------------ |
| 容易理解 | 不需要找原作者，其他开发者也能看懂代码在做什么。 |
| 符合常识 | 命名、结构和流程都顺理成章。                     |
| 容易适配 | 数据结构或需求变化时，不需要整体重写。           |
| 容易扩展 | 新功能能自然接入现有结构。                       |
| 容易调试 | 出错时能提供清晰线索，方便定位问题。             |

很多开发者的大部分时间都在维护别人写的代码。让自己的代码可维护，本质上是在降低整个团队未来的成本。

## 4. 🤔 编码规范为什么重要？

JavaScript 非常灵活，可以写成面向对象、函数式、声明式，甚至混合多种风格。如果团队没有统一规范，同一个项目里很容易出现多套写法，理解成本会迅速上升。

编码规范至少应该覆盖：

- 缩进和格式。
- 注释策略。
- 命名规则。
- 文件组织。
- 类型表达方式。
- 禁用或慎用的语言特性。

缩进是最基础的可读性要求。团队应统一使用空格或制表符，并保持一致。由于制表符在不同编辑器中显示宽度可能不同，很多团队会选择固定数量的空格。

注释也很重要，但注释应解释意图、约束和复杂算法，而不是重复代码本身。

适合写注释的场景包括：

- 函数和方法的用途、参数和返回值。
- 较大的代码块要完成的任务。
- 复杂算法的思路。
- 浏览器兼容性处理或特殊技巧的原因。

## 5. 🤔 命名应该遵循哪些原则？

变量和函数命名直接影响代码可读性。像 `foo`、`bar`、`doSomething()` 这样的名字通常不能提供足够信息。

常见命名建议：

- 变量名通常使用名词，例如 `user`、`cartItems`。
- 函数名通常以动词开始，例如 `getUser()`、`saveOrder()`。
- 返回布尔值的函数可以使用 `is`、`has`、`can` 等前缀，例如 `isVisible()`。
- 变量、函数和方法使用小驼峰，例如 `getUserName()`。
- 类名使用大驼峰，例如 `UserService`。
- 常量使用全大写和下划线，例如 `REQUEST_TIMEOUT`。

不要害怕名字稍长。源码中的长名字有助于理解，部署阶段可以通过压缩工具缩短标识符。

```js
// 不清楚
const d = 3000

// 更清楚
const REQUEST_TIMEOUT = 3000
```

好的命名会让代码接近自然语言，读者可以顺着名称理解数据和行为。

## 6. 🤔 JavaScript 中如何让变量类型更透明？

JavaScript 是松散类型语言，变量没有固定类型声明。为了降低误解，可以通过几种方式表达变量意图。

第一种是初始化为预期类型。

```js
let isLoaded = false
let retryCount = 0
let userName = ''
let currentUser = null
```

第二种是通过命名表达类型或语义。

```js
const userList = []
const userMap = new Map()
const isEnabled = true
```

第三种是使用类型系统或类型注释。在现代项目中，更常见的做法是使用 TypeScript 或 JSDoc，而不是旧式匈牙利命名法。

```js
/** @type {HTMLButtonElement | null} */
const submitButton = document.querySelector('#submit')
```

关键不是选择哪一种形式，而是团队保持一致，让变量的预期类型和用途更容易被看出来。

## 7. 🤔 为什么要解耦 HTML 和 JavaScript？

HTML 表达内容和结构，JavaScript 表达行为。把 JavaScript 写进 HTML，会让结构和行为紧密耦合。

```html
<!-- 不推荐：行为直接写在 HTML 中 -->
<button onclick="submitForm()">提交</button>
```

更好的做法是让 HTML 只提供结构，JavaScript 通过 DOM 绑定行为。

```html
<button id="submitButton">提交</button>
```

```js
const submitButton = document.querySelector('#submitButton')

submitButton.addEventListener('click', submitForm)
```

反过来，也要避免在 JavaScript 里拼大量 HTML。大量模板字符串混在业务逻辑中，会让结构问题藏在脚本里，调试和修改都更困难。

如果需要渲染复杂结构，可以考虑：

- 使用模板文件或组件。
- 使用隐藏模板节点并克隆。
- 从服务端或模板系统获得 HTML。
- 只在 JavaScript 中填充数据，而不是混合大量标记。

## 8. 🤔 为什么要解耦 CSS 和 JavaScript？

CSS 负责外观，JavaScript 负责行为。JavaScript 直接修改大量行内样式，会让显示逻辑散落到脚本中。

```js
// 不推荐：样式细节进入 JavaScript
element.style.color = 'red'
element.style.backgroundColor = 'blue'
```

更好的做法是让 JavaScript 修改状态类名，由 CSS 负责具体外观。

```js
element.classList.add('is-error')
```

```css
.is-error {
  color: red;
  background-color: blue;
}
```

这样一来，交互状态由 JavaScript 控制，具体显示仍然归 CSS 管理。将来如果样式要变，只需要改 CSS。

## 9. 🤔 为什么事件处理程序不应该承载完整业务逻辑？

事件处理程序应该处理事件，把真正的应用逻辑交给独立函数。否则业务逻辑只能通过事件触发，既难测试，也难复用。

```js
// 不推荐：事件处理和业务逻辑混在一起
function handleInput(event) {
  if (event.key === 'Enter') {
    const value = Number(event.target.value)

    if (value * 5 > 10) {
      document.querySelector('#errorMessage').hidden = false
    }
  }
}
```

可以改成这样：

```js
function validateValue(rawValue) {
  return Number(rawValue) * 5 <= 10
}

function showErrorMessage() {
  document.querySelector('#errorMessage').hidden = false
}

function handleInput(event) {
  if (event.key === 'Enter' && !validateValue(event.target.value)) {
    showErrorMessage()
  }
}
```

解耦时可以遵守三条原则：

- 不要把完整 `event` 对象传给业务函数，只传必要数据。
- 应用程序中的操作不应该必须依赖事件才能执行。
- 事件处理程序只负责事件解析和调度。

这样业务逻辑可以被测试、被其他入口复用，也更容易定位问题。

## 10. 🤔 什么是尊重对象所有权？

尊重对象所有权，就是不要修改不属于你的对象。如果你不负责创建和维护某个对象、构造函数或原型，就不应该给它添加属性、添加方法或重定义已有行为。

不推荐：

```js
Array.prototype.first = function () {
  return this[0]
}
```

这样做可能和浏览器未来实现、第三方库或团队其他代码冲突。

更安全的方式是创建自己的工具函数或类型。

```js
function getFirstItem(items) {
  return items[0]
}
```

这条规则适用于原生对象、浏览器对象、第三方库对象，也适用于别人维护的业务对象。JavaScript 允许你修改很多东西，但团队开发中应该主动克制。

## 11. 🤔 为什么要避免声明全局变量？

全局变量会污染共享环境，容易与浏览器 API、第三方库或其他团队代码冲突。

不推荐：

```js
var name = 'Nicholas'

function sayName() {
  console.log(name)
}
```

更好的方式是尽量使用模块作用域。如果是旧式非模块代码，也最多暴露一个全局命名空间。

```js
const MyApplication = {
  name: 'Nicholas',

  sayName() {
    console.log(this.name)
  },
}
```

在现代 JavaScript 中，ES 模块已经天然提供模块作用域。

```js
// user.js
const name = 'Nicholas'

export function sayName() {
  console.log(name)
}
```

全局暴露越少，代码越容易和其他代码共存。

## 12. 🤔 为什么不要只比较 `null`？

只判断一个值不是 `null`，通常不能证明它是你真正需要的类型。

```js
function sortArray(values) {
  if (values != null) {
    values.sort()
  }
}
```

这段代码只排除了 `null` 和 `undefined`，但字符串、数字、普通对象仍可能进入分支并导致错误。

更好的做法是检查真正需要的能力或类型。

```js
function sortArray(values) {
  if (Array.isArray(values)) {
    values.sort()
  }
}
```

常见检查方式：

- 引用类型可以使用 `instanceof` 或更具体的 API，例如 `Array.isArray()`。
- 原始类型可以使用 `typeof`。
- 如果只要求某个方法存在，可以检查 `typeof value.methodName === 'function'`。

类型检查应该表达正向意图：它是什么，而不是它不是什么。

## 13. 🤔 为什么要使用常量？

常量可以把容易变化的数据从业务逻辑中分离出来，减少修改时引入错误的概率。

适合提取为常量的内容包括：

- 重复出现的值。
- UI 文案。
- URL。
- CSS 类名。
- 配置项。
- 任何将来可能变化的字面量。

```js
const ERROR_CLASS = 'is-error'
const API_BASE_URL = '/api'
const REQUEST_TIMEOUT = 5000

function showError(element) {
  element.classList.add(ERROR_CLASS)
}
```

常量的价值不只是少写几遍，而是让变化点集中。将来接口地址、文案或类名变化时，不需要到业务逻辑里到处搜索替换。
