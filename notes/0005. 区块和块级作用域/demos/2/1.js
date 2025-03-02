// 在 JavaScript 语言中，单独使用区块并不常见
// 区块往往用来构成其他更复杂的语法结构
// 比如 for、if、while、function 等

if (true) {
  var varVariable = "Hello";
  let letVariable = "World";
}
console.log(varVariable)
// 输出 "Hello"

console.log(letVariable)
// ❌ 报错 ReferenceError: letVariable is not defined

// 虽然 block 对于 var 而言，写了跟没写一样
// 但是如果我们在 block 内使用 const、let 来声明变量
// 那么这些变量是具备块级作用域的
// 即这些使用 const、let 声明的变量只能在 block 内部被访问