var x = 1

switch (x) {
  case true: // x === true 不成立
    console.log('x 发生类型转换')
    break
  default:
    console.log('x 没有发生类型转换')
}

// 这部分是隐式类型转换的相关知识。
console.log(1 == true) // => true
console.log(1 === true) // => false

// 由于变量 x 没有发生类型转换，所以不会执行 case true 的情况。
// 这表明，switch 语句内部采用的是“严格相等运算符”。

// 最终结果：
// x 没有发生类型转换
// true
// false