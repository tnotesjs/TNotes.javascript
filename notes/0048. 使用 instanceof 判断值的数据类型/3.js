/*
任意对象（除了 null）都是 Object 的实例
*/
var obj = { foo: 123 }

console.log(obj instanceof Object)
// true

console.log(null instanceof Object)
// false