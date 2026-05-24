# [0334. 使用ES6模块](https://github.com/tnotesjs/TNotes.javascript/tree/main/notes/0334.%20%E4%BD%BF%E7%94%A8ES6%E6%A8%A1%E5%9D%97)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何在浏览器中使用 ES6 模块？](#3--如何在浏览器中使用-es6-模块)
- [4. 🤔 ES6 模块如何加载依赖图？](#4--es6-模块如何加载依赖图)
- [5. 🤔 ES6 模块有哪些执行行为？](#5--es6-模块有哪些执行行为)
- [6. 🤔 如何导出模块成员？](#6--如何导出模块成员)
- [7. 🤔 如何导入模块成员？](#7--如何导入模块成员)
- [8. 🤔 模块标识符有什么限制？](#8--模块标识符有什么限制)
- [9. 🤔 什么是转移导出？](#9--什么是转移导出)
- [10. 🤔 Worker 可以使用模块吗？](#10--worker-可以使用模块吗)
- [11. 🤔 如何兼容不支持模块的浏览器？](#11--如何兼容不支持模块的浏览器)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `type="module"` 和模块入口
- ES6 模块加载过程
- 模块作用域和执行行为
- 命名导出与默认导出
- 命名导入、默认导入和副作用导入
- 转移导出
- Worker 模块和向后兼容

## 2. 🫧 评价

- ES6 模块的强大不只在语法漂亮，而在于它把依赖关系变成可静态分析的语言结构，这是现代打包、按需加载和摇树优化的基础。

## 3. 🤔 如何在浏览器中使用 ES6 模块？

浏览器通过 `type="module"` 把脚本当作 ES6 模块执行。

```html
<script type="module" src="./main.js"></script>
```

也可以写内嵌模块。

```html
<script type="module">
  import { start } from './app.js'

  start()
</script>
```

不过，内嵌模块不能被其他模块通过 `import` 加载。实际项目中，通常把模块写在独立文件里。

模块脚本默认类似 `defer`：浏览器会尽早下载模块文件，但会等文档解析完成后再按顺序执行入口模块。给模块脚本加 `async` 后，执行顺序就不再受页面中脚本标签顺序约束，但入口模块仍然要等依赖加载完成。

## 4. 🤔 ES6 模块如何加载依赖图？

浏览器从入口模块出发解析依赖图。

```js
// main.js
import { render } from './view.js'
import { loadData } from './api.js'

render(await loadData())
```

浏览器会下载 `main.js`，解析出 `./view.js` 和 `./api.js`，继续下载和解析它们的依赖，直到整个依赖图都准备好，再按照依赖关系执行模块。

同一个模块无论被多少入口或依赖引用，通常只会加载和执行一次。后续导入拿到的是同一个模块实例的导出绑定。

原生模块加载不需要额外加载器，但深层依赖图可能带来多轮网络请求。大型项目通常仍会配合构建工具，把模块打包、分块、预加载或做缓存优化。

## 5. 🤔 ES6 模块有哪些执行行为？

ES6 模块有一些和传统脚本不同的行为：

- 模块默认在严格模式下执行。
- 模块有自己的模块作用域，不污染全局命名空间。
- 模块顶级 `this` 是 `undefined`。
- 模块中的 `var` 不会成为 `window` 属性。
- 模块只执行一次，并以单例形式被复用。
- 模块支持循环依赖。

```js
// module.js
var name = 'module'

console.log(window.name) // 不会因为上面的 var 自动变成 'module'
console.log(this) // undefined
```

这些规则让模块更适合组织大型代码，也减少了传统脚本中常见的全局污染。

## 6. 🤔 如何导出模块成员？

ES6 模块用 `export` 暴露公共接口。导出必须出现在模块顶级，不能写在 `if`、函数或循环内部。

命名导出适合导出多个成员。

```js
export const version = '1.0.0'

export function add(a, b) {
  return a + b
}
```

也可以先声明，再统一导出。

```js
const version = '1.0.0'

function add(a, b) {
  return a + b
}

export { version, add }
```

导出时可以起别名。

```js
const add = (a, b) => a + b

export { add as sum }
```

默认导出表示模块的主导出。每个模块最多只能有一个默认导出。

```js
export default class Calculator {
  add(a, b) {
    return a + b
  }
}
```

命名导出和默认导出可以同时存在。

```js
export const version = '1.0.0'

export default function createApp() {
  return {}
}
```

## 7. 🤔 如何导入模块成员？

导入使用 `import`。和 `export` 一样，静态 `import` 必须出现在模块顶级。

命名导入：

```js
import { version, add } from './math.js'
```

命名导入可以起别名：

```js
import { add as sum } from './math.js'
```

批量导入命名导出：

```js
import * as math from './math.js'

console.log(math.add(1, 2))
```

默认导入：

```js
import Calculator from './Calculator.js'
```

同时导入默认导出和命名导出：

```js
import createApp, { version } from './app.js'
```

只为了执行模块副作用，可以只导入模块路径。

```js
import './setup-global-listeners.js'
```

导入绑定是只读的。你不能给导入变量重新赋值，也不能修改命名空间对象上的导出属性。如果导入的是对象，可以通过对象自身的方法或属性修改它的内部状态，但这要看模块设计是否允许。

## 8. 🤔 模块标识符有什么限制？

浏览器原生 ES 模块中的模块标识符通常是字符串路径。

```js
import { foo } from './foo.js'
import { bar } from '../bar.js'
import { baz } from '/modules/baz.js'
```

它必须是静态字符串，不能是拼接出来的表达式。

```js
const name = './foo.js'

// 静态 import 不允许这样写
// import { foo } from name
```

如果确实需要运行时决定模块路径，可以使用动态 `import()`。

```js
const module = await import(`./features/${name}.js`)

module.run()
```

在浏览器原生模块中，相对路径通常要写完整文件扩展名，例如 `./foo.js`。构建工具可能允许省略扩展名，但那是工具解析规则，不是浏览器原生行为。

## 9. 🤔 什么是转移导出？

转移导出是把另一个模块的导出继续从当前模块导出去。它常用于创建统一入口文件。

```js
// index.js
export * from './math.js'
export { default as Calculator } from './Calculator.js'
```

也可以明确转移部分导出并改名。

```js
export { add, minus as subtract } from './math.js'
```

把命名导出转成默认导出：

```js
export { createApp as default } from './app.js'
```

转移导出不会复制值，而是继续传递原模块的导出绑定。使用 `export *` 时要注意命名冲突，也要注意它不会默认转移默认导出。

## 10. 🤔 Worker 可以使用模块吗？

Worker 可以使用模块脚本。创建时传入 `{ type: 'module' }`。

```js
const worker = new Worker('./worker.js', {
  type: 'module',
})
```

模块 Worker 内部使用 `import` 加载依赖，不应再用传统脚本 Worker 中常见的 `importScripts()`。

```js
// worker.js
import { calculate } from './calculate.js'

self.addEventListener('message', (event) => {
  self.postMessage(calculate(event.data))
})
```

## 11. 🤔 如何兼容不支持模块的浏览器？

可以同时提供模块版本和传统脚本版本。支持模块的浏览器执行 `type="module"`，不支持模块的浏览器会忽略它。

为了避免支持模块的浏览器重复执行传统脚本，可以给回退脚本添加 `nomodule`。

```html
<script type="module" src="./modern.js"></script>
<script nomodule src="./legacy.js"></script>
```

支持模块的浏览器会执行 `modern.js`，忽略 `legacy.js`。不支持模块的浏览器会忽略 `type="module"`，执行 `legacy.js`。

现代项目中，也可以通过构建工具把 ES6 模块转换为兼容旧环境的脚本产物。
