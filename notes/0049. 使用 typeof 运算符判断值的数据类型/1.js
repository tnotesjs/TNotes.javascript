console.log(typeof 123)
// "number"

console.log(typeof '123')
// "string"

console.log(typeof false)
// "boolean"

console.log(typeof Symbol('foo'))
// "symbol"
// 这是 ES6 新增的符号类型

function f() {}
console.log(typeof f)
// "function"

console.log(typeof {})
// "object"

console.log(typeof [])
// "object"

console.log(typeof null)
// "object"

console.log({} instanceof Array)
// false

console.log([] instanceof Array)
// true

console.log(typeof undefined)
// "undefined"

console.log(typeof val) // 注意，虽然 val 没有声明，但是这里并不会报错。
// "undefined"