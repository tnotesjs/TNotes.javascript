var obj1 = {}
var obj2 = obj1

obj1.a = 1
console.log(obj2.a) // 1

obj2.b = 2
console.log(obj1.b) // 2

// obj1 和 obj2 指向同一块内存空间。
// 因此为其中任何一个变量添加属性，另一个变量都可以读写该属性。
