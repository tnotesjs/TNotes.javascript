# [0228. 立即调用的函数表达式](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0228.%20%E7%AB%8B%E5%8D%B3%E8%B0%83%E7%94%A8%E7%9A%84%E5%87%BD%E6%95%B0%E8%A1%A8%E8%BE%BE%E5%BC%8F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是 IIFE？](#3-什么是-iife)
- [4. IIFE 为什么能模拟块级作用域？](#4-iife-为什么能模拟块级作用域)
- [5. IIFE 如何锁定循环变量？](#5-iife-如何锁定循环变量)
- [6. ES6 之后还需要 IIFE 吗？](#6-es6-之后还需要-iife-吗)
- [7. IIFE 使用时要注意什么？](#7-iife-使用时要注意什么)

<!-- endregion:toc -->

## 1. 本节内容

- IIFE 的基本形式
- IIFE 与函数表达式
- 使用 IIFE 模拟块级作用域
- IIFE 锁定循环变量
- ES6 块级作用域对 IIFE 的替代

## 2. 评价

- IIFE 是 ES6 之前非常实用的作用域工具。现在有了 `let` 和 `const`，它没那么常用了，但理解它仍然有助于读懂旧代码和模块模式。

## 3. 什么是 IIFE？

IIFE 是立即调用的函数表达式，英文是 `Immediately Invoked Function Expression`。

基本形式如下：

```js
;(function () {
  console.log('run immediately')
})()
```

外层括号让函数声明变成函数表达式，后面的 `()` 立即调用这个函数。

箭头函数也可以写 IIFE：

```js
;(() => {
  console.log('run immediately')
})()
```

## 4. IIFE 为什么能模拟块级作用域？

ES6 之前，`var` 没有块级作用域，只有函数作用域。

IIFE 可以临时创建一个函数作用域，让变量不泄漏到外部。

```js
;(function () {
  var value = 1
  console.log(value)
})()

console.log(value) // ReferenceError
```

这个模式在旧代码里很常见，尤其用于隔离临时变量。

## 5. IIFE 如何锁定循环变量？

使用 `var` 声明循环变量时，循环不会为每次迭代创建新绑定。

```js
const divs = document.querySelectorAll('div')

for (var i = 0; i < divs.length; i++) {
  divs[i].addEventListener('click', function () {
    console.log(i)
  })
}
```

点击时输出的往往是循环结束后的最终值。

早期写法会用 IIFE 把每次循环的 `i` 传进去，锁定当次值。

```js
for (var i = 0; i < divs.length; i++) {
  divs[i].addEventListener(
    'click',
    (function (index) {
      return function () {
        console.log(index)
      }
    })(i),
  )
}
```

这里每次迭代都会创建一个新的函数作用域，`index` 保存的是当次传入的值。

## 6. ES6 之后还需要 IIFE 吗？

很多场景不再需要。

`let` 和 `const` 提供了块级作用域：

```js
{
  const value = 1
  console.log(value)
}

console.log(value) // ReferenceError
```

循环中使用 `let` 也会为每次迭代创建独立绑定。

```js
for (let i = 0; i < divs.length; i++) {
  divs[i].addEventListener('click', function () {
    console.log(i)
  })
}
```

所以现代代码里，IIFE 更多用于立即初始化、兼容旧代码或构建模块模式，而不是单纯为了模拟块级作用域。

## 7. IIFE 使用时要注意什么？

IIFE 执行完后，如果没有把内部函数或对象返回给外部，里面的局部变量通常可以被回收。

但如果 IIFE 返回了闭包或对象方法，并且这些函数引用了内部变量，那么这些变量仍会被保留。

这也是模块模式能保存私有状态的原因。
