// 问：下面的代码输出什么？

function User() {}
User.prototype.sayHello = function () {}

var u1 = new User()
var u2 = new User()

console.log('1.', u1.sayHello === u2.sayHello)
console.log('2.', User.prototype === Function.prototype)
console.log('3.', User.__proto__ === Function.prototype)
console.log('4.', User.__proto__ === Function.__proto__)
console.log('5.', u1.__proto__ === u2.__proto__)
console.log('6.', u1.__proto__ === User.__proto__)
console.log('7.', Function.__proto__ === Object.__proto__)
console.log('8.', Function.prototype.__proto__ === Object.prototype.__proto__)
console.log('9.', Function.prototype.__proto__ === Object.prototype)
