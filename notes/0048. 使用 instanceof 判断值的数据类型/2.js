/*
注意：instanceof 检查的是整个原型链。
因此，对于同一个实例对象，可能会对多个构造函数都返回 true。
*/
var d = new Date()

console.log(d instanceof Date)
// true

console.log(d instanceof Object)
// true
