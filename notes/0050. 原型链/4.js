/*
特殊情况
1. Object.prototype.__proto__ === null
2. Function.__proto__ === Function.prototype
*/

console.log(Object.prototype.__proto__)
// null

console.log(Function.prototype === Function.__proto__)
// true