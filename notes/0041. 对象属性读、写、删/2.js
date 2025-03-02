var foo = 'bar'

var obj = {
  foo: 1,
  bar: 2,
}

console.log(obj.foo) // 1
console.log(obj[foo]) // 2

// 如果使用方括号运算符，键名必须放在引号里面，否则会被当作变量处理。
// obj.foo 等价于 obj['foo']
// obj[foo] 等价于 obj['bar'] 因为 foo 变量的值为 'bar'