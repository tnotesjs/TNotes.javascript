# [0173. 语句](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0173.%20%E8%AF%AD%E5%8F%A5)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `if` 语句](#3-if-语句)
- [4. `while`、`do-while` 和 `for` 语句](#4-whiledo-while-和-for-语句)
- [5. `for-in` 和 `for-of` 语句](#5-for-in-和-for-of-语句)
- [6. 标签、`break` 和 `continue` 语句](#6-标签break-和-continue-语句)
- [7. `switch` 语句](#7-switch-语句)
- [8. `with` 语句](#8-with-语句)
- [9. 你如何看待 JS 中的“标签”？实战项目中真的会用到它吗？还是说它默认是被禁止使用的呢？【AI】](#9-你如何看待-js-中的标签实战项目中真的会用到它吗还是说它默认是被禁止使用的呢ai)
  - [9.1. 它什么时候有价值？](#91-它什么时候有价值)
  - [9.2. 为什么实际项目中很少见？](#92-为什么实际项目中很少见)
  - [9.3. 它是否默认被禁止？](#93-它是否默认被禁止)
    - [JavaScript 语言层面](#javascript-语言层面)
    - [ESLint / 团队规范层面](#eslint--团队规范层面)
  - [9.4. 需要知道的语法区别](#94-需要知道的语法区别)
  - [9.5. 我的实践建议](#95-我的实践建议)
- [10. 你知道 with 语句吗【AI】](#10-你知道-with-语句吗ai)
  - [10.1. 为什么不推荐使用？](#101-为什么不推荐使用)
    - [标识符的来源不明确](#标识符的来源不明确)
    - [不利于静态分析和优化](#不利于静态分析和优化)
    - [严格模式中直接禁止](#严格模式中直接禁止)
    - [ESLint 通常也会禁止](#eslint-通常也会禁止)
  - [10.2. 应该怎样替代？](#102-应该怎样替代)
    - [使用明确的对象引用](#使用明确的对象引用)
    - [使用解构赋值](#使用解构赋值)
    - [使用较短的对象别名](#使用较短的对象别名)
  - [10.3. 与标签语句的区别](#103-与标签语句的区别)

<!-- endregion:toc -->

## 1. 本节内容

- 条件语句
- 循环语句
- `for-in` 与 `for-of`
- 标签语句、`break` 和 `continue`
- `with` 语句的风险
- `switch` 语句

## 2. 评价

这一节主要介绍 JS 中的一些基础语句，其中标签语法在业务代码中很少见，了解用途即可；`with` 已被严格模式禁止，只需认识、不要使用。

## 3. `if` 语句

`if` 是最常见的条件语句。它的条件表达式不一定直接是布尔值，ECMAScript 会把表达式结果转换成布尔值后再判断。

```js
if (message) {
  console.log('has message')
} else {
  console.log('empty message')
}
```

语句体可以是一条语句，也可以是代码块。实践中建议始终使用代码块：

```js
if (count > 10) {
  console.log('greater than 10')
}

// 如果语句体只有一条语句，可以省略大括号：
// if (count > 10) console.log('greater than 10')
// 但是项目实战中不推荐省略大括号
```

这样即使后续增加语句，也不容易出现“看起来在分支里，实际不在分支里”的问题。

## 4. `while`、`do-while` 和 `for` 语句

这三类语句都能表达循环，但测试条件的位置不同。

`while` 是先测试循环，条件为真才执行循环体：

```js
let i = 0

while (i < 10) {
  i += 2
}
```

`do-while` 是后测试循环，循环体至少执行一次：

```js
let i = 0

do {
  i += 2
} while (i < 10)
```

`for` 把初始化、条件和循环后表达式放在一起：

```js
for (let i = 0; i < 10; i++) {
  console.log(i)
}
```

- `for` 能做的事，`while` 一定也能做，反之也是一定的
- `for` 的优势是把循环相关状态集中在头部，更适合计数型循环
- `while` 的优势是只关心「条件是否成立」，更适合次数未知或条件驱动的循环

## 5. `for-in` 和 `for-of` 语句

`for-in` 用来枚举对象中的非符号可枚举属性键：

```js
const user = { name: 'Ada', age: 28 }

for (const key in user) {
  console.log(key)
}
```

对象属性本身是无序的，因此不要依赖 `for-in` 的枚举顺序。

`for-of` 用来遍历可迭代对象产生的值：

```js
for (const value of [2, 4, 6, 8]) {
  console.log(value)
}
```

如果目标值不可迭代，`for-of` 会抛出错误。

::: tip

关于可迭代对象和迭代器，后续笔记会专门展开。

:::

## 6. 标签、`break` 和 `continue` 语句

`break` 会立即退出循环，继续执行循环后面的代码；`continue` 会结束当前这一次循环，进入下一次迭代。

```js
for (let i = 1; i < 10; i++) {
  if (i % 5 === 0) {
    break
  }
  console.log(i)
}
```

标签语句可以给一条语句加名字，常和嵌套循环中的 `break`、`continue` 配合。

```js
outermost: for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    if (i === 5 && j === 5) {
      break outermost
    }
  }
}
```

这类写法能解决嵌套循环跳出问题，但也会让控制流变复杂。标签名应该有明确语义，嵌套层级也不要太深。

## 7. `switch` 语句

`switch` 适合根据同一个表达式的不同值进入不同分支。

```js
switch (type) {
  case 'success':
    console.log('success')
    break
  case 'error':
    console.log('error')
    break
  default:
    console.log('unknown')
}
```

每个 `case` 后通常都要写 `break`，否则会继续执行后面的分支。如果确实要故意贯穿多个分支，应该写注释说明。

ECMAScript 的 `switch` 有两个特点：

- 条件值可以是任意类型，不限于数值。
- 比较时使用全等规则，不会做隐式类型转换。

因此，字符串 `'10'` 不会匹配数值 `10`。

## 8. `with` 语句

`with` 可以临时把某个对象放到作用域链前端，从而少写对象前缀。

```js
with (location) {
  const url = href
}

// 等价于：
const url = location.href
```

问题是，这会让标识符解析变得不清楚。你很难一眼判断某个名字来自局部变量，还是来自 `with` 指向的对象。

`with` 还会影响性能和可调试性。严格模式直接禁止使用 `with`，因此现代代码中应该避免它。

## 9. 你如何看待 JS 中的“标签”？实战项目中真的会用到它吗？还是说它默认是被禁止使用的呢？【AI】

JS 的“标签”是**合法但少用的控制流工具**。它既不是语言层面默认禁止的，也不应该被一概视为坏代码；不过在多数业务项目中，通常会被 lint 规则限制，因为它容易让控制流变得难以追踪。

### 9.1. 它什么时候有价值？

最典型的场景就是：**直接跳出多层循环**。

```js
search: for (let row = 0; row < matrix.length; row++) {
  for (let col = 0; col < matrix[row].length; col++) {
    if (matrix[row][col] === target) {
      console.log(row, col)
      break search
    }
  }
}
```

这里 `break search` 的含义非常明确：结束整个搜索。相比使用状态变量：

```js
let found = false

for (let row = 0; row < matrix.length && !found; row++) {
  for (let col = 0; col < matrix[row].length; col++) {
    if (matrix[row][col] === target) {
      found = true
      break
    }
  }
}
```

标签有时反而更直接。

`continue` 标签也有实际用途，例如跳过当前外层迭代：

```js
nextUser: for (const user of users) {
  for (const permission of requiredPermissions) {
    if (!user.permissions.includes(permission)) {
      continue nextUser
    }
  }

  enableAccount(user)
}
```

这表示：只要缺少任意权限，就直接检查下一个用户。

### 9.2. 为什么实际项目中很少见？

主要不是因为它“不能用”，而是因为：

1. **容易产生类似 `goto` 的阅读体验**

   ```js
   break outer
   continue retry
   ```

   阅读者需要回头寻找标签位置。

2. **嵌套过深通常意味着代码应该拆分** 多层循环可能可以提取成函数，然后使用 `return`：

   ```js
   function findPosition(matrix, target) {
     for (let row = 0; row < matrix.length; row++) {
       for (let col = 0; col < matrix[row].length; col++) {
         if (matrix[row][col] === target) {
           return { row, col }
         }
       }
     }

     return null
   }
   ```

   在很多场景中，`return` 比带标签的 `break` 更自然。

3. **数组方法通常可以表达业务意图** `find`、`some`、`every` 等方法有时比手写循环更清晰：

   ```js
   const invalidUser = users.find((user) =>
     requiredPermissions.some(
       (permission) => !user.permissions.includes(permission),
     ),
   )
   ```

   不过也不要为了避免标签而强行写出多层、难读的高阶函数。

### 9.3. 它是否默认被禁止？

分两个层面：

#### JavaScript 语言层面

没有禁止。浏览器、Node.js 和 TypeScript 都支持标签：

```js
outer: for (;;) {
  break outer
}
```

严格模式下也不是整体禁止标签。

#### ESLint / 团队规范层面

有些项目会启用 ESLint 的 `no-labels` 规则：

```json
{
  "rules": {
    "no-labels": "error"
  }
}
```

也可以只允许标签用于循环或 `switch`：

```json
{
  "rules": {
    "no-labels": [
      "error",
      {
        "allowLoop": true,
        "allowSwitch": true
      }
    ]
  }
}
```

所以“默认禁止”更多是**特定脚手架、公司规范或 ESLint 配置的选择**，不是 JavaScript 本身的规定。

### 9.4. 需要知道的语法区别

标签实际上可以标记一般语句，不只是循环：

```js
section: {
  if (condition) {
    break section
  }

  doSomething()
}
```

但：

- `break label` 可以跳出对应的带标签语句；
- `continue label` 的目标必须是循环语句；
- 不建议用标签组织普通业务代码块，那样更接近难维护的跳转控制流。

### 9.5. 我的实践建议

可以采用这样的原则：

- 单层循环：直接使用 `break` / `continue`；
- 多层搜索逻辑：优先考虑提取函数并使用 `return`；
- 如果拆函数会割裂一段紧密的算法逻辑，标签可以使用；
- 标签只用于跳出或继续循环，不用于构造复杂跳转；
- 标签名表达意图，例如 `search`、`nextUser`、`retryRequest`，不要使用 `outer1`、`loop2`；
- 一旦出现多个标签、交叉跳转或三层以上嵌套，应考虑重构。

简而言之：**标签不是禁忌，而是一种“低频但有正当用途”的语法。** 在普通 CRUD 业务中几乎用不到；在矩阵遍历、解析器、图搜索、组合搜索等算法代码中，合理使用标签有时比状态变量更清晰。是否允许，最终应由团队的 ESLint 规则和代码可读性标准决定。

## 10. 你知道 with 语句吗【AI】

知道。`with` 是 JavaScript 早期提供的一种语句，用来把某个对象临时加入当前作用域链，从而省略重复的对象前缀。

```js
const user = {
  name: 'Alice',
  age: 20,
}

with (user) {
  console.log(name) // 相当于 user.name
  console.log(age) // 相当于 user.age
}
```

### 10.1. 为什么不推荐使用？

#### 标识符的来源不明确

```js
const name = 'global'

with (user) {
  console.log(name)
}
```

只看代码无法立即确定 `name` 来自 `user.name`，还是外部作用域中的 `name`。

更麻烦的是，对象结构发生变化时，代码含义也可能跟着改变：

```js
const config = {}

let timeout = 1000

with (config) {
  timeout = 3000
}
```

如果 `config` 没有 `timeout` 属性，这里修改的是外部变量；如果后来增加了该属性，代码就可能改为操作 `config.timeout`。

因此，相同的代码会因为对象形状不同而产生不同的变量解析结果。

#### 不利于静态分析和优化

编译器、编辑器以及 ESLint 很难静态判断 `with` 代码块中的标识符究竟指向：

- 对象属性；
- 局部变量；
- 外层变量；
- 全局变量。

这会影响自动补全、重构、类型检查、压缩以及引擎优化。

#### 严格模式中直接禁止

```js
'use strict'

const user = { name: 'Alice' }

with (user) {
  console.log(name)
}
```

这会产生 `SyntaxError`。

由于 ES Modules 和 JavaScript `class` 的代码默认处于严格模式，所以现代模块代码中无法使用 `with`：

```js
// ES Module 默认是严格模式
with (user) {
} // SyntaxError
```

#### ESLint 通常也会禁止

ESLint 有 `no-with` 规则：

```json
{
  "rules": {
    "no-with": "error"
  }
}
```

不过与标签不同，`with` 不只是“团队风格上不推荐”，而是已经被现代 JavaScript 开发实践实质性淘汰。

### 10.2. 应该怎样替代？

#### 使用明确的对象引用

```js
console.log(user.name)
console.log(user.age)
```

这是最清楚的方式。

#### 使用解构赋值

```js
const { name, age } = user

console.log(name)
console.log(age)
```

解构会明确创建局部变量，标识符的来源可以被静态确定。

但要注意，解构通常是读取当时的值，并不是给属性创建动态别名：

```js
const { age } = user
user.age = 21

console.log(age) // 仍然是解构时的值
```

#### 使用较短的对象别名

对于较长的属性路径，可以给对象取一个局部别名：

```js
const settings = application.configuration.settings

console.log(settings.theme)
console.log(settings.language)
```

### 10.3. 与标签语句的区别

两者都属于现代项目中不常见的旧式语法，但性质不同：

- **标签**：仍有合理用途，尤其适合跳出多层循环；是否禁止主要取决于团队规范。
- **`with`**：会让名字解析变得动态且含糊，严格模式直接禁止，现代代码基本不应使用。

所以我的建议非常明确：

> 阅读旧代码时需要认识 `with`，但编写新代码时不要使用它。

补充一点：对象的 `Symbol.unscopables` 可以控制哪些属性不会被 `with` 暴露为作用域变量。这套机制主要是为了维持旧代码兼容性，而不是鼓励现代代码继续使用 `with`。
