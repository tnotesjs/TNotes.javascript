// index.js
// 获取 a.js 中的基本导出的成员，以及默认导出的成员
import { a } from './a.js'
import method from './a.js'
// 等效：
// import method, { a } from './a.js';
// 等效：
// import { default as method, a } from './a.js';
// 等效：
// import * as moduleA from './a.js';

// 通过 moduleA.default 访问 a.js 模块中的 method 方法
// 通过 moduleA.a 访问 a.js 模块中的 a 变量
// console.log(moduleA.a)
// moduleA.default()

console.log(a)
method()
