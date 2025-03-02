console.log(isNaN({})) // true
// 等同于
console.log(isNaN(Number({}))) // true

console.log(isNaN(['xzy'])) // true
// 等同于
console.log(isNaN(Number(['xzy']))) // true
// 对于对象和数组，isNaN 也返回 true。