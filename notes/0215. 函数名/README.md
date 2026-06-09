# [0215. 函数名](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0215.%20%E5%87%BD%E6%95%B0%E5%90%8D)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 函数名为什么说是指针？](#3-函数名为什么说是指针)
- [4. `name` 属性保存什么？](#4-name-属性保存什么)
- [5. 为什么有些函数名会带前缀？](#5-为什么有些函数名会带前缀)

<!-- endregion:toc -->

## 1. 本节内容

- 函数名与函数对象引用
- 一个函数对应多个变量名
- 只读 `name` 属性
- 匿名函数与构造函数的名称
- `bind()`、获取函数和设置函数的名称前缀

## 2. 评价

- 函数名这一节看似小，其实是在纠正一个基础误区：函数名不是函数本体，而是指向函数对象的变量。

## 3. 函数名为什么说是指针？

函数名保存的是对函数对象的引用，而不是函数对象本身。

```js
function sum(a, b) {
  return a + b
}

const anotherSum = sum

console.log(sum(1, 2)) // 3
console.log(anotherSum(1, 2)) // 3
```

这里 `sum` 和 `anotherSum` 指向同一个函数对象。调用函数时要加括号；不加括号时，访问的是函数引用。

```js
const fn = sum
const result = sum(1, 2)
```

把原来的函数名设为 `null`，不会影响另一个变量里保存的函数引用。

```js
let add = sum
sum = null

console.log(add(1, 2)) // 3
```

## 4. `name` 属性保存什么？

ES6 开始，函数对象会暴露一个只读的 `name` 属性，用于表示函数名称。

```js
function foo() {}
const bar = function () {}
const baz = () => {}

console.log(foo.name) // foo
console.log(bar.name) // bar
console.log(baz.name) // baz
```

即使函数表达式本身没有显式名称，JavaScript 也可能根据赋值目标推断出名称。

匿名函数如果没有赋值上下文，`name` 通常是空字符串。

```js
console.log((() => {}).name) // 空字符串
```

通过 `Function` 构造函数创建的函数，名称会是 `anonymous`。

```js
console.log(new Function().name) // anonymous
```

## 5. 为什么有些函数名会带前缀？

有些函数不是普通函数定义直接得到的，`name` 属性会带上额外前缀。

`bind()` 创建的新函数会带 `bound` 前缀：

```js
function foo() {}

const boundFoo = foo.bind(null)

console.log(boundFoo.name) // bound foo
```

获取函数和设置函数会带 `get` 或 `set` 前缀：

```js
const user = {
  value: 1,
  get age() {
    return this.value
  },
  set age(value) {
    this.value = value
  },
}

const descriptor = Object.getOwnPropertyDescriptor(user, 'age')

console.log(descriptor.get.name) // get age
console.log(descriptor.set.name) // set age
```

这些名称主要用于调试、日志和栈追踪，不应该作为业务逻辑判断依据。
