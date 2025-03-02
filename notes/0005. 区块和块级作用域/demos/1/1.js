// 对于var命令来说，JavaScript 的区块不构成单独的作用域（scope）。
{
  var a = 1
  console.log(a) // 1
}

console.log(a) // 1

// 上面代码在区块内部，使用 var 命令声明并赋值了变量 a
// 然后在区块外部，变量 a 依然有效
// 区块对于 var 命令不构成单独的作用域
// 与不使用区块的情况没有任何区别

// 对于 let 和 const 命令来说
// JavaScript 的区块构成单独的作用域（scope）
{
  let a2 = 2
  const a3 = 3

  console.log(a2) // 2
  console.log(a3) // 3
}

// 在这里无法访问到 a2、a3
// 对于未定义的变量，如果直接访问的话会报错。
// 不过可以使用 typeof 来检测其类型
console.log(typeof a2) // undefined
console.log(typeof a3) // undefined