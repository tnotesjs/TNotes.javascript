// 写法 1 ❌ 执行前就会报错
// function func() {
//   let a = 10
//   var a = 1
// }

// 写法 2 ❌ 执行前就会报错
// function func() {
//   let a = 10
//   let a = 1
// }

// 写法 3
// function func(arg) {
//   let arg;
// }
// func() // ❌ 执行时报错

// 写法 4 ok
function func(arg) {
  // 这里相当于新开了一个块作用域
  {
    let arg;
  }
}
func() // ok

// let 不允许在相同作用域内，重复声明同一个变量。
// 这也意味着不能在函数内部重新声明参数。
