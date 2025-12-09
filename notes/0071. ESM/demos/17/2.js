// 2.js - 模块 2
// 即使变量名相同,也不会冲突,因为有独立的模块作用域

const message = '来自模块 2 的消息' // 与模块 1 中的 message 不冲突
let count = 200 // 与模块 1 中的 count 不冲突

function sayHello() {
  // 与模块 1 中的 sayHello 不冲突
  console.log('Hello from 模块 2')
}

// 导入模块 1
import { count as count1, sayHello as hello1, message as msg1 } from './1.js'

console.log('模块 2 加载完成')
console.log('模块 2 中的 message:', message)
console.log('从模块 1 导入的 message:', msg1)
console.log('模块 2 中的 count:', count)
console.log('从模块 1 导入的 count:', count1)

// 调用各自的函数
sayHello() // 调用模块 2 的函数
hello1() // 调用从模块 1 导入的函数
