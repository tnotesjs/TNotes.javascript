// 变量声明了，但没有赋值
var i

// 调用函数时，应该提供的参数没有提供，该参数等于 undefined
function f(x) {
  return x
}

// 对象没有赋值的属性
var o = new Object()

// 函数没有返回值时，默认返回 undefined
function f() {}

console.log(i) // undefined
console.log(f()) // undefined
console.log(o.p) // undefined
console.log(f()) // undefined
