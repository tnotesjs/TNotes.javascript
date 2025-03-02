var tmp = 123

if (true) {
  tmp = 'abc' // ❌ ReferenceError
  let tmp
}

// 只要块级作用域内存在 let 命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。
// 虽然存在全局变量 tmp，但是块级作用域内 let 又声明了一个局部变量 tmp，
// 这意味着在 if 语句块内，起作用的是块级作用域内的 let 声明的 tmp，和全局的没有关系，你可以认为全局的 var tmp = 123 这一条语句不存在。
// 因此，在 let 声明变量前，对 tmp 赋值会报错。