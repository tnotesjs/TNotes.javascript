// main.js - 从聚合模块导入
import { add, capitalize, sum } from './index.js'

console.log('5 + 3 =', add(5, 3))
console.log('5 + 3 =', sum(5, 3)) // 使用重命名的导出
console.log('hello ->', capitalize('hello'))
