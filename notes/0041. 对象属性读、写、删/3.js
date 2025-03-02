var obj = {
  'hello world': '123',
  6: 'abc', // 等价于 '6': 'abc'
}

console.log(obj['hello' + ' world']) // '123'
console.log(obj[3 + 3]) // 'abc'

// 方括号运算符内部可以使用表达式。
// obj['hello' + ' world'] 等价于 obj['hello world']
// obj[3 + 3] 等价于 obj[6] 等价于 obj['6']

// 注意：方括号运算符的表达式只支持字符串和数字，不能使用其他类型的值。
// 例如 obj[true] 等价于 obj['true']，但 obj[undefined] 等价于 obj[undefined]，会报错。