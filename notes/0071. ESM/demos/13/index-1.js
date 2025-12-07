// index-1.js - 分别导入默认和具名
import { a } from './a.js'
import method from './a.js'

console.log('方式 1 - 分别导入：')
console.log('a =', a)
method()
