if (true) {
  console.log(typeof tmp) // ✅ 不会报错，可以正常打印出 undefined
}

if (true) {
  console.log(typeof tmp) // ❌ ReferenceError: Cannot access 'tmp' before initialization
  let tmp
}

// typeof undeclared_variable // "undefined"
// 虽然使用 typeof 可以去检测一个还没有声明的变量。（得到结果是 undefined）
// 但是在 “暂时性死区” 中，typeof 是会报错的。
