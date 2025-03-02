/*
所有函数都是由 new Function 创建的
*/
function User() {}

console.log(User.__proto__ === Function.prototype)
// true

console.log(Object.__proto__ === Function.prototype)
// true