/*
在加法运算中，如果运算子是对象，必须先转成原始类型的值，然后再相加。

var obj = { p: 1 };
obj + 2 // "[object Object]2"

上面代码中，对象 obj 转成原始类型的值是字符串 "[object Object]"。
字符串 "[object Object]" 然后再拼接上 2 就得到了上面的结果 "[object Object]2"。
*/

var obj = { p: 1 }
console.log(obj + 2)
// "[object Object]2"
