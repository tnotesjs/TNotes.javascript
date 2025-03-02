console.log('1.', {} instanceof Object)
console.log('4.', Function instanceof Object)
// Object 的原型是原型链的终点。

console.log('2.', {}.toString instanceof Function)
console.log('3.', Object instanceof Function)
// 所有函数（包括 Object 函数）都是由 Function 创建的。
