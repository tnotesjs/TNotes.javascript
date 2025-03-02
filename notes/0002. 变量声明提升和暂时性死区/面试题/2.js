// 问：下面的代码输出的结果是什么？
let x = 20,
  y = 10

let result = add(x)
console.log('result1 ' + result)

var add = function (x, y) {
  return x + y
}

function add(x) {
  return x + 40
}