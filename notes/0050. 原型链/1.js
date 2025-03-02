/*
所有的实例对象都是由对应的构造函数 new 出来的。
*/
function User() {}

const u1 = new User()

console.log(u1.__proto__ === User.prototype)
// true