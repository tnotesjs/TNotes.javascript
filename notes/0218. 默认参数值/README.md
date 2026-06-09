# [0218. 默认参数值](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0218.%20%E9%BB%98%E8%AE%A4%E5%8F%82%E6%95%B0%E5%80%BC)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. ES6 之前怎么写默认参数？](#3-es6-之前怎么写默认参数)
- [4. ES6 默认参数怎么写？](#4-es6-默认参数怎么写)
- [5. 默认参数会改变 `arguments` 吗？](#5-默认参数会改变-arguments-吗)
- [6. 默认参数什么时候求值？](#6-默认参数什么时候求值)
- [7. 默认参数作用域有什么规则？](#7-默认参数作用域有什么规则)

<!-- endregion:toc -->

## 1. 本节内容

- ES5 时代的默认参数写法
- ES6 默认参数语法
- `undefined` 与默认值触发
- 默认参数与 `arguments`
- 默认参数表达式的求值时机
- 默认参数作用域与暂时性死区

## 2. 评价

- 默认参数看起来只是少写几行判断，但它真正重要的地方在于求值时机和参数作用域。这里一旦模糊，复杂默认值就容易写出隐蔽问题。

## 3. ES6 之前怎么写默认参数？

ES5 及更早版本通常要手动判断参数是不是 `undefined`。

```js
function makeKing(name) {
  name = typeof name !== 'undefined' ? name : 'Henry'
  return `King ${name}`
}

console.log(makeKing()) // King Henry
```

这种写法能用，但样板代码比较多，而且多个参数时会变得不够清晰。

## 4. ES6 默认参数怎么写？

ES6 可以直接在形参后面写默认值。

```js
function makeKing(name = 'Henry') {
  return `King ${name}`
}

console.log(makeKing()) // King Henry
console.log(makeKing('Louis')) // King Louis
```

如果传入 `undefined`，也会触发默认值。

```js
function makeKing(name = 'Henry', numerals = 'VIII') {
  return `King ${name} ${numerals}`
}

console.log(makeKing(undefined, 'VI')) // King Henry VI
```

## 5. 默认参数会改变 `arguments` 吗？

不会。

`arguments` 只反映调用函数时实际传入的参数，不会补上默认值。

```js
function makeKing(name = 'Henry') {
  console.log(name)
  console.log(arguments[0])
}

makeKing()
// Henry
// undefined
```

另外，使用默认参数后，命名参数和 `arguments` 之间不会像非严格模式旧写法那样保持同步。

## 6. 默认参数什么时候求值？

默认参数在函数被调用时求值，不是在函数定义时求值。

```js
let count = 0

function nextValue(value = count++) {
  return value
}

console.log(nextValue()) // 0
console.log(nextValue()) // 1
```

而且只有对应参数没有传值或传入 `undefined` 时，默认值表达式才会执行。

```js
function createId(id = crypto.randomUUID()) {
  return id
}
```

这让默认参数可以接收函数调用结果，但也意味着默认值表达式里不要放难以察觉的副作用。

## 7. 默认参数作用域有什么规则？

默认参数会按照参数顺序依次初始化，类似一组按顺序声明的 `let` 变量。

后面的参数可以引用前面的参数：

```js
function makeKing(name = 'Henry', title = name) {
  return `${title} ${name}`
}
```

但前面的参数不能引用后面的参数，因为后面的参数还处在暂时性死区中。

```js
function makeKing(name = title, title = 'King') {
  return `${title} ${name}`
}

makeKing() // ReferenceError
```

默认参数也不能访问函数体内部后面才声明的变量。

```js
function fn(value = inner) {
  const inner = 1
  return value
}
```

简单来说，默认参数有自己的初始化作用域，不要把它和函数体作用域混在一起理解。
