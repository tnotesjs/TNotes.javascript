// main.js - 重命名导入
import { name, age, getInfo } from './moduleA.js'

// 导入时再次重命名
import { name as username, age as userage } from './moduleA.js'

console.log('姓名:', name)
console.log('年龄:', age)
console.log('信息:', getInfo())
console.log('重命名后:', username, userage)
