{
  let a = 10
  var b = 1
}

// console.log(a) // ❌ ReferenceError: a is not defined.
console.log(b) // 1

// let 具有块级作用域

// ES6 新增了 let 命令，用来声明变量。
// let 的用法类似于 var，但是所声明的变量，只在 let 命令所在的代码块内有效。

// 上面代码在代码块之中，分别用 let 和 var 声明了两个变量。
// 然后在代码块之外调用这两个变量，结果 let 声明的变量报错，var 声明的变量返回了正确的值。
// 这表明，let 声明的变量只在它所在的代码块有效。
