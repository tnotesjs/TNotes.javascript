function User() {} // 定义构造函数 User
User.prototype.sayHello = function () {} // 在 User 的原型上添加方法 sayHello

var u1 = new User() // 创建 User 的实例 u1
var u2 = new User() // 创建 User 的实例 u2

console.log('1.', u1.sayHello === u2.sayHello)
// 1. true
// 因为 sayHello 是定义在 User.prototype 上的共享方法
// u1 和 u2 都是 User 的实例

console.log('2.', User.prototype === Function.prototype)
// 2. false
// 因为所有函数的原型 prototype 都是一个普通对象
// 这个普通对象是由 new Object 创建的
// User.prototype = new Object()
// Function.prototype = new Object()
// 它们是俩独立的 Object 实例对象，是不相等的。

console.log('3.', User.__proto__ === Function.prototype)
// 3. true
// 因为 User 本身是一个函数
// 所有自定义函数都是由 new Function 创建的

console.log('4.', User.__proto__ === Function.__proto__)
// 4. true
// 因为 Function.prototype === Function.__proto__
// Function 的原型 prototype 和隐式原型 __proto__ 是同一个对象
// 这是原型链中的一种特殊情况

console.log('5.', u1.__proto__ === u2.__proto__)
// 5. true
// 因为 u1 和 u2 都是通过 new User() 创建的，它们的原型都是 User.prototype。


console.log('6.', u1.__proto__ === User.__proto__)
// 6. false
// 因为 u1.__proto__ 是 User.prototype
// User.__proto__ 是 Function.prototype

console.log('7.', Function.__proto__ === Object.__proto__)
// 7. true
// 因为 Function.__proto__ === Function.prototype
// Object.__proto__ 是 Function.prototype

console.log('8.', Function.prototype.__proto__ === Object.prototype.__proto__)
// 8. false
// 因为 Object.prototype.__proto__ 是 null
// Function.prototype.__proto__ 是 Object.prototype

console.log('9.', Function.prototype.__proto__ === Object.prototype)
// 9. true
// 因为所有函数的 prototype 都是一个普通对象 - Function.prototype
// 这个普通对象是由 new Object 创建的 - Function.prototype = new Object()
// Function.prototype.__proto__ === Object.prototype
