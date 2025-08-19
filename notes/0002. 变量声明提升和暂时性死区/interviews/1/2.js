var a
var b
function c() {}

console.log(a, b, c) // 在此时，a 和 b 是 undefined，c 是函数
// undefined undefined [Function: c]

a = 1
b = function () {}

/*
JavaScript 中，变量和函数声明会被提升（Hoisting）到其作用域的顶部，但赋值操作不会提升。

代码的实际执行顺序如下：
1. 变量 a 被提升，但其赋值 1 保持在原位置。
2. 变量 b 被提升，但其赋值 function () {} 保持在原位置。
3. 函数声明 c 被提升，整个函数定义被提升。
提升后的代码等价于上述这种写法。

因此，执行 console.log(a, b, c); 时，a 和 b 是 undefined，而 c 是已定义的函数。
*/
