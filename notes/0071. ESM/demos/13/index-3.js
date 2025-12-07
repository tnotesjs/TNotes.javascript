// index-3.js - 使用 default as 别名
import { default as method, a } from './a.js'

console.log('方式 3 - default as 别名：')
console.log('a =', a)
method()
