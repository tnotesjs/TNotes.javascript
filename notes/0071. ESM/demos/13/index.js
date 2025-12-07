// index.js - 默认导入的多种写法
// 获取 a.js 中的基本导出与默认导出
import { a } from './a.js'
import method from './a.js'
// 等效：
// import method, { a } from './a.js'
// 等效：
// import { default as method, a } from './a.js'
// 等效：
// import * as moduleA from './a.js'
// moduleA.default()
// console.log(moduleA.a)

console.log(a)
method()
