var s = 'abc'
var arr = ['a', 'b', 'c']

console.log(s[3]) // undefined
console.log(s[-1]) // undefined
console.log(s['x']) // undefined

console.log(arr[3]) // undefined
console.log(arr[-1]) // undefined
console.log(arr['x']) // undefined

// 和数组一样，如果方括号中的数字超过字符串的长度，
// 或者方括号中根本不是数字，则返回undefined。
