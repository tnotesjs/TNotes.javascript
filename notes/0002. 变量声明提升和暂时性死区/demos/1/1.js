console.log(a) // => undefined
var a = 1
console.log(a) // => 5

/*
使用 var 关键字声明的变量会提升其声明，但不会提升它们的初始化（赋值）。
如果在声明之前访问变量，则该变量的值为 undefined。

实际上执行的代码如下：
var a
console.log(a)
a = 1
console.log(a)

js 引擎的工作方式是：
  先解析代码
  获取所有被声明的变量
  然后再一行一行地运行

这种工作方式所造成的结果：
  所有的变量的声明语句都会被提升到代码的头部
  这就叫做变量提升（hoisting）
*/