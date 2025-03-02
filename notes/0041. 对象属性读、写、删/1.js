var obj = {
  p: 'Hello World',
}

console.log(obj.p) // "Hello World"
console.log(obj['p']) // "Hello World"

// 读取对象的属性，有两种方法，一种是使用点运算符，还有一种是使用方括号运算符。
// 上面代码分别采用点运算符和方括号运算符，读取属性p。
// 最终效果都是一样的，都能够正常访问到 p 属性值。