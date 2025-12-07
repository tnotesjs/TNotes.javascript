// b.js
let executeCount = 0
executeCount++
console.log(`b.js called (第 ${executeCount} 次执行)`)
export const b = 'b'
export { executeCount }
