# [0234. 异步函数](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0234.%20%E5%BC%82%E6%AD%A5%E5%87%BD%E6%95%B0)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `async` 函数怎么定义？](#3--async-函数怎么定义)
- [4. 🤔 异步函数会返回什么？](#4--异步函数会返回什么)
- [5. 🤔 异步函数里抛错会发生什么？](#5--异步函数里抛错会发生什么)
- [6. 🤔 `await` 到底做了什么？](#6--await-到底做了什么)
- [7. 🤔 `await` 如何处理拒绝？](#7--await-如何处理拒绝)
- [8. 🤔 `await` 有哪些使用限制？](#8--await-有哪些使用限制)
- [9. 🤔 为什么 `await` 会改变执行顺序？](#9--为什么-await-会改变执行顺序)
- [10. 🤔 如何用异步函数实现 `sleep()`？](#10--如何用异步函数实现-sleep)
- [11. 🤔 连续 `await` 一定好吗？](#11--连续-await-一定好吗)
- [12. 🤔 异步函数如何简化串行期约？](#12--异步函数如何简化串行期约)
- [13. 🤔 异步函数对调试有什么帮助？](#13--异步函数对调试有什么帮助)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `async` 函数的定义形式
- 异步函数的返回值规则
- `await` 的暂停和恢复
- `await` 的错误处理
- `await` 的使用限制
- 异步函数的执行顺序
- `sleep()`、并行执行和串行执行策略
- 异步函数与栈追踪

## 2. 🫧 评价

- `async`/`await` 最容易让人误会的一点是看起来同步，实际上仍然完全建立在期约之上。把这层看清楚，才能写出顺序清晰又不牺牲并行能力的异步代码。

## 3. 🤔 `async` 函数怎么定义？

`async` 可以用在函数声明、函数表达式、箭头函数和对象方法上。

```js
async function loadUser() {}

const loadPost = async function () {}

const loadComments = async () => {}

const service = {
  async load() {},
}
```

`async` 让函数具备异步函数特征，但函数体开始执行时仍然是同步求值的。

```js
async function foo() {
  console.log(1)
}

foo()
console.log(2)

// 1
// 2
```

没有遇到 `await` 之前，它和普通函数的同步执行部分并没有太大差别。

## 4. 🤔 异步函数会返回什么？

异步函数始终返回期约。

如果你在异步函数里返回普通值，这个值会被 `Promise.resolve()` 包装。

```js
async function getValue() {
  return 3
}

getValue().then(console.log) // 3
```

如果没有显式 `return`，返回的期约会兑现为 `undefined`。

如果返回的是期约或 thenable 对象，异步函数会等待并解包它的结果。

```js
async function getUser() {
  return Promise.resolve({ name: 'Jake' })
}

getUser().then((user) => console.log(user.name))
```

## 5. 🤔 异步函数里抛错会发生什么？

异步函数中抛出错误，会让它返回的期约进入拒绝状态。

```js
async function fail() {
  throw new Error('failed')
}

fail().catch((error) => {
  console.error(error.message)
})
```

但如果你只是创建了一个拒绝期约，并没有 `return` 或 `await` 它，这个拒绝不会自动变成当前异步函数返回期约的拒绝原因。

```js
async function fail() {
  Promise.reject(new Error('failed'))
}

fail().catch(() => {
  console.log('这里不会捕获内部那个拒绝')
})
```

需要让错误进入当前异步函数的控制流，就要 `return` 或 `await` 这个期约。

## 6. 🤔 `await` 到底做了什么？

`await` 会暂停当前异步函数后续代码的执行，等待右侧值被解包，然后在未来恢复函数执行。

```js
async function load() {
  const value = await Promise.resolve(3)
  console.log(value)
}

load()
```

如果右侧是期约，`await` 会等待它落定。如果右侧是普通值，这个值会被当作已兑现的结果。

```js
async function foo() {
  console.log(await 'foo')
}
```

关键是：`await` 暂停的是当前异步函数，不是阻塞整个 JavaScript 主线程。

## 7. 🤔 `await` 如何处理拒绝？

如果 `await` 等到的是拒绝期约，它会把拒绝理由抛出到当前异步函数中。

```js
async function load() {
  try {
    await Promise.reject(new Error('failed'))
  } catch (error) {
    console.error(error.message)
  }
}
```

如果没有在函数内部捕获，这个错误会让异步函数返回的期约拒绝。

```js
async function load() {
  await Promise.reject(new Error('failed'))
}

load().catch((error) => console.error(error.message))
```

因此，`await` 是把期约错误重新带回局部控制流的重要桥梁。

## 8. 🤔 `await` 有哪些使用限制？

书中强调 `await` 必须出现在异步函数内部，不能出现在普通函数里。

```js
function invalid() {
  // SyntaxError
  await Promise.resolve(1)
}
```

异步函数的特征也不会自动传给嵌套函数。

```js
async function outer() {
  function inner() {
    // SyntaxError
    await Promise.resolve(1)
  }
}
```

如果嵌套函数也要使用 `await`，它自己也必须声明为 `async`。

```js
async function outer() {
  async function inner() {
    return await Promise.resolve(1)
  }

  return inner()
}
```

现代 JavaScript 模块已经支持顶层 `await`，但普通脚本和非模块上下文中仍然不能随意在顶层使用。写通用示例时，把逻辑放进 `async` 函数里仍然最稳。

## 9. 🤔 为什么 `await` 会改变执行顺序？

遇到 `await` 时，运行时会记录暂停位置，并把恢复执行排到之后的任务中。即使等待的是立即可用的值，`await` 后面的代码也会延后执行。

```js
async function foo() {
  console.log(2)
  await null
  console.log(4)
}

console.log(1)
foo()
console.log(3)

// 1
// 2
// 3
// 4
```

这说明 `await` 不只是取值语法，它还切分了当前异步函数的执行过程。

如果多个异步函数交错执行，输出顺序可能和调用顺序不同。判断这类代码时，要看每个函数在哪个 `await` 处暂停，以及恢复任务何时入队。

## 10. 🤔 如何用异步函数实现 `sleep()`？

可以把计时器包装成期约，再用 `await` 等待它。

```js
function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

async function run() {
  const start = Date.now()

  await sleep(1000)

  console.log(Date.now() - start)
}

run()
```

这种暂停不会阻塞主线程，只是让当前异步函数在计时器完成之后继续执行。

## 11. 🤔 连续 `await` 一定好吗？

不一定。

如果多个异步任务互相依赖，连续 `await` 是合理的。

```js
const user = await loadUser()
const posts = await loadPosts(user.id)
```

如果这些任务互不依赖，连续 `await` 会把它们写成串行，浪费并行机会。

```js
const userPromise = loadUser()
const postsPromise = loadPosts()

const user = await userPromise
const posts = await postsPromise
```

也可以使用 `Promise.all()` 一次等待多个任务。

```js
const [user, posts] = await Promise.all([loadUser(), loadPosts()])
```

判断标准很简单：有依赖就串行，没有依赖就尽量并行。

## 12. 🤔 异步函数如何简化串行期约？

期约连锁可以写成 `then()` 链，异步函数可以把它改写成更像普通循环的形式。

```js
const addTwo = async (value) => value + 2
const addThree = async (value) => value + 3
const addFive = async (value) => value + 5

async function addTen(value) {
  for (const fn of [addTwo, addThree, addFive]) {
    value = await fn(value)
  }

  return value
}

addTen(9).then(console.log) // 19
```

这种写法把串行异步逻辑变成了普通控制流：循环、条件、提前返回和 `try...catch` 都可以自然使用。

## 13. 🤔 异步函数对调试有什么帮助？

书中提到，纯期约链为了生成有用的错误栈，运行时可能需要保留更多创建期约时的调用信息。

异步函数则能把暂停中的函数保留在异步调用关系里，错误栈往往更接近你写出来的代码结构。

这也是实际项目中偏向 `async`/`await` 的原因之一：它不仅让流程更清晰，也让错误位置和调用关系更容易追踪。

当然，`async`/`await` 不是替代期约。它建立在期约之上，遇到并行、超时、竞速、批量任务时，仍然要和 `Promise.all()`、`Promise.race()` 等期约工具配合使用。
