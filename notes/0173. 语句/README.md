# [0173. 语句](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0173.%20%E8%AF%AD%E5%8F%A5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `if` 语句怎样决定分支？](#3--if-语句怎样决定分支)
- [4. 🤔 `while`、`do-while` 和 `for` 有什么区别？](#4--whiledo-while-和-for-有什么区别)
- [5. 🤔 `for-in` 和 `for-of` 分别遍历什么？](#5--for-in-和-for-of-分别遍历什么)
- [6. 🤔 标签、`break` 和 `continue` 应该怎样使用？](#6--标签break-和-continue-应该怎样使用)
- [7. 🤔 为什么不推荐使用 `with`？](#7--为什么不推荐使用-with)
- [8. 🤔 `switch` 和连续 `if` 有什么不同？](#8--switch-和连续-if-有什么不同)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 条件语句
- 循环语句
- `for-in` 与 `for-of`
- 标签语句、`break` 和 `continue`
- `with` 语句的风险
- `switch` 语句的比较规则

## 2. 🫧 评价

语句决定代码的执行路径。这里不只是认识 `if`、`for`、`switch` 的语法，更重要的是理解条件会被转成布尔值、循环变量应该限制作用域、跳转语句不要把控制流写得过度复杂。

## 3. 🤔 `if` 语句怎样决定分支？

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
```

这样即使后续增加语句，也不容易出现“看起来在分支里，实际不在分支里”的问题。

## 4. 🤔 `while`、`do-while` 和 `for` 有什么区别？

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

`for` 能做的事，`while` 通常也能做；`for` 的优势是把循环相关状态集中在头部，更适合计数型循环。

## 5. 🤔 `for-in` 和 `for-of` 分别遍历什么？

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

如果目标值不可迭代，`for-of` 会抛出错误。关于可迭代对象和迭代器，后续章节会专门展开。

## 6. 🤔 标签、`break` 和 `continue` 应该怎样使用？

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

## 7. 🤔 为什么不推荐使用 `with`？

`with` 可以临时把某个对象放到作用域链前端，从而少写对象前缀。

```js
with (location) {
  const url = href
}
```

问题是，这会让标识符解析变得不清楚。你很难一眼判断某个名字来自局部变量，还是来自 `with` 指向的对象。

`with` 还会影响性能和可调试性。严格模式直接禁止使用 `with`，因此现代代码中应该避免它。

## 8. 🤔 `switch` 和连续 `if` 有什么不同？

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
- 比较时使用全等规则，不会做强制类型转换。

因此，字符串 `'10'` 不会匹配数值 `10`。
