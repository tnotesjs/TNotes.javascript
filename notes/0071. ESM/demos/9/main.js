// main.js - ESM 实时绑定演示
import { count, increment, getCount } from './counter.js'

console.log('初始 count:', count) // 0

increment() // counter.js 内部 count: 1
console.log('调用 increment 后，main.js 中的 count:', count) // 1

increment() // counter.js 内部 count: 2
console.log('再次调用后，main.js 中的 count:', count) // 2
console.log('getCount():', getCount()) // 2

// ❌ 不能修改导入的绑定
// count = 10 // TypeError: Assignment to constant variable
