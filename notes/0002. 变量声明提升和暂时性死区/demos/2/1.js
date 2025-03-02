console.log(x) // ❌ ReferenceError
let x = 10

/*
let x = 10
在变量 x 被声明之前的区域属于 x 的 TDZ
在这块区域中访问 x 将会抛出 ReferenceError 错误

let 和 const 关键字声明的变量表现得就像它们没有被提升一样。
实际上，它们被提升了，但是在初始化之前不能访问它们，这被称为“暂时性死区”（Temporal Dead Zone, TDZ）。
尝试在声明之前访问这些变量将会导致 ReferenceError。
*/