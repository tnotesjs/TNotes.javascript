for (let i = 0; i < 10; i++) {
  // ...
  // 在这里可以正常访问 i
}

// 出了块级作用域之后，将无法访问到 i。
// console.log(i)
// ❌ ReferenceError: i is not defined

// for 循环的计数器，就很合适使用 let 命令。
// 上面代码中，计数器 i 只在 for 循环体内有效，在循环体外引用就会报错。
// 这种行为，也是更加符合我们认知的。