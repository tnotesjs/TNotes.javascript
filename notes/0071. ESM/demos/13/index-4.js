// index-4.js - 命名空间导入
import * as moduleA from './a.js'

console.log('方式 4 - 命名空间导入：')
console.log('a =', moduleA.a)
moduleA.default()
