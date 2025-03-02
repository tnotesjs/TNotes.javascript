var arr = ['a', 'b', 'c']
console.log(2 in arr) // true
console.log('2' in arr) // true
console.log(4 in arr) // false

// 由于键名都是字符串，所以数值 2 会自动转成字符串。
// 2 in arr 这种写法和 '2' in arr 是等价的。