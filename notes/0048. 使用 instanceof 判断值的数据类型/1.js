/*
1. v instanceof Vehicle
2. Vehicle.prototype.isPrototypeOf(v)
两种写法等效
都返回一个 boolean 值
都表示 Vehicle 的原型对象（Vehicle.prototype）是否在 v 的原型链上。
*/
function Vehicle() {}
var v = new Vehicle()

console.log(v instanceof Vehicle)
// true

console.log(Vehicle.prototype.isPrototypeOf(v))
// true