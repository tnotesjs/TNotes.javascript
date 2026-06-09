# [0200. 生成器](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0200.%20%E7%94%9F%E6%88%90%E5%99%A8)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 生成器本质上是什么？](#3-生成器本质上是什么)
- [4. `yield` 到底做了什么？](#4-yield-到底做了什么)
- [5. 为什么 `next()` 还能往生成器里传值？](#5-为什么-next-还能往生成器里传值)
- [6. `yield*` 和普通 `yield` 有什么区别？](#6-yield-和普通-yield-有什么区别)
- [7. 为什么说生成器特别适合拿来实现默认迭代器？](#7-为什么说生成器特别适合拿来实现默认迭代器)
- [8. 生成器怎样被提前终止？](#8-生成器怎样被提前终止)

<!-- endregion:toc -->

## 1. 本节内容

- 生成器函数的基本语法
- `yield` 的暂停与产出能力
- 通过 `next()` 传值
- `yield*` 的委托能力
- 生成器作为默认迭代器
- `return()` 与 `throw()` 的终止方式

## 2. 评价

- 生成器最迷人的地方，在于它把“迭代状态机”从手写对象逻辑变成了函数执行流本身。你不再需要自己维护那么多显式状态，而是可以直接利用 `yield` 把暂停点写在最自然的位置上。

## 3. 生成器本质上是什么？

生成器是一种可以暂停和恢复执行的特殊函数。定义方式是在函数关键字后面加星号：

```js
function* generatorFn() {}
```

调用生成器函数，不会立刻把函数体跑完，而是先得到一个生成器对象：

```js
function* generatorFn() {
  console.log('run')
}

const g = generatorFn()
```

只有等你调用 `g.next()` 时，函数才真正开始或继续执行。

## 4. `yield` 到底做了什么？

`yield` 会让生成器在当前位置暂停，并把一个值产出给外部。

```js
function* generatorFn() {
  yield 'foo'
  yield 'bar'
  return 'baz'
}

const g = generatorFn()

console.log(g.next())
console.log(g.next())
console.log(g.next())
```

这里你可以把 `yield` 理解成“中间返回”，但它和 `return` 不同：

- `yield` 之后还可以继续恢复执行
- `return` 则表示生成器彻底结束

## 5. 为什么 `next()` 还能往生成器里传值？

因为 `yield` 不只是输出点，也可以是输入点。

```js
function* generatorFn(initial) {
  console.log(initial)
  console.log(yield)
  console.log(yield)
}

const g = generatorFn('foo')

g.next()
g.next('baz')
g.next('qux')
```

这里第一次 `next()` 主要是启动生成器；后续传给 `next()` 的值，会作为上一个暂停点 `yield` 表达式的结果进入函数内部。

这也是为什么生成器既能“产出值”，也能“接收外部输入”。

## 6. `yield*` 和普通 `yield` 有什么区别？

普通 `yield` 产出一个值，`yield*` 则把另一个可迭代对象整体委托出去，按顺序逐个产出它里面的值。

```js
function* generatorFn() {
  yield* [1, 2, 3]
}

for (const x of generatorFn()) {
  console.log(x)
}
```

这在几个场景里特别好用：

- 把已有可迭代对象接入当前生成器
- 拼接多个迭代来源
- 写递归生成逻辑

例如递归地产生一段数字序列：

```js
function* nTimes(n) {
  if (n > 0) {
    yield* nTimes(n - 1)
    yield n - 1
  }
}
```

## 7. 为什么说生成器特别适合拿来实现默认迭代器？

因为生成器对象本身就是可迭代的，而 `yield` 又天然适合按顺序产出内容。

```js
class Foo {
  constructor() {
    this.values = [1, 2, 3]
  }

  *[Symbol.iterator]() {
    yield* this.values
  }
}
```

这种写法的好处是，你不用手写 `next()` 状态机，也不用自己维护复杂的内部游标，逻辑会比自定义迭代器对象自然很多。

## 8. 生成器怎样被提前终止？

生成器对象除了 `next()`，还提供：

- `return()`
- `throw()`

`return()` 会强制生成器进入关闭状态：

```js
function* generatorFn() {
  yield 1
  yield 2
  yield 3
}

const g = generatorFn()
console.log(g.next())
console.log(g.return(4))
console.log(g.next())
```

`throw()` 则会把一个错误注入到当前暂停位置。如果生成器内部没有处理，这个错误会让生成器关闭；如果内部捕获了它，生成器还可以继续运行。

所以生成器不只是“能暂停的函数”，还是一种可以被外部驱动、接收输入、提前终止的执行模型。
