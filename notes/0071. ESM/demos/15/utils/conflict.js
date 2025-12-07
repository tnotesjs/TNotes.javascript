// conflict.js - 演示命名冲突
export const add = (a, b) => {
  console.log('⚠️ 这是 conflict.js 中的 add 函数')
  return a + b + 100
}

console.log('utils/conflict.js called')
