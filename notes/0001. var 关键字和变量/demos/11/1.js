function example() {
  console.log(x) // undefined
  var x = 10
  if (true) {
    var x = 20 // 重新声明同一变量
    console.log(x) // 20
  }
  console.log(x) // 20
}

example()
// undefined
// 20
// 20