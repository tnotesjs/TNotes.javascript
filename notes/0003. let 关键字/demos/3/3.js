if (true) {
  // TDZ 开始
  tmp = 'abc' // ❌ ReferenceError
  console.log(tmp) // ❌ ReferenceError
  typeof tmp // ❌ ReferenceError

  let tmp // TDZ 结束
  console.log(tmp) // undefined

  tmp = 123
  console.log(tmp) // 123
}

// 上面代码中，在 let 命令声明变量 tmp 之前，都属于变量 tmp 的“死区”。

// ES6 明确规定，如果区块中存在 let 和 const 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。
// 在代码块内，使用 let 命令声明变量之前，该变量都是不可用的。
// 这在语法上，称为“暂时性死区”（temporal dead zone，简称 TDZ）。

// typeof undeclared_variable // "undefined"
// 虽然使用 typeof 可以去检测一个还没有声明的变量。（得到结果是 undefined）
// 但是在 “暂时性死区” 中，typeof 是会报错的。