// 写法 1：var 的情况
console.log(foo) // undefined
var foo = 2

// 由于 var 声明的变量提升，所以 foo 变量声明提升到顶部，所以 foo 变量在声明之前就存在，值为 undefined。
/*
上述写法 1，等效于下面这种写法：
var foo
console.log(foo)
foo = 2
*/

// 写法 2：let 的情况
console.log(bar) // ❌ 报错 ReferenceError
let bar = 2

// let 声明的变量有暂时性死区，虽然变量声明提升了，但无法在声明语句之前访问变量。
