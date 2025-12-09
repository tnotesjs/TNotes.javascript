// 1.js - 模块 1
// 每个 ESM 模块都有独立的作用域

const message = '来自模块 1 的消息'
let count = 100

function sayHello() {
  console.log('Hello from 模块 1')
}

// 导出一些内容
export { count, message, sayHello }

// 模块内的变量不会污染全局
console.log('模块 1 加载完成')
console.log('模块 1 中的 message:', message)
