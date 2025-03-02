console.log(hello) // 输出：undefined
var hello = function () {
  console.log('Hello, world!')
}

/*
如果函数是通过函数表达式创建的
那么只有变量名被提升
而函数的实体不会被提升
*/