/*
所有原型对象都是由 new Object 创建的
*/

function User() {}

console.log(User.prototype.__proto__ === Object.prototype)
// true

console.log(Function.prototype.__proto__ === Object.prototype)
// true