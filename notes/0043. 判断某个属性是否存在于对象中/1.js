var obj = { p: 1 }
console.log('p' in obj) // true
console.log('toString' in obj) // true

// in 运算符用于检查对象是否包含某个 key
// 如果包含就返回 true
// 否则返回 false

// in 的左边是一个字符串，表示属性名。
// in 的右边是一个对象。

// in 运算符的一个问题是，它不能识别哪些属性是对象自身的，哪些属性是继承的。
// 上面代码中，对象 obj 本身并没有 toString 属性，但是 in 运算符会返回 true，
// 因为这个属性是继承得到的。

console.log(obj.toString === Object.prototype.toString) // true
// 继承、原型、原型链等的内容，会在其他文档中详细介绍。