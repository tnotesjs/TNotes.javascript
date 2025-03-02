var s1 = 'hello'
console.log(s1.length) // 5

s1.length = 3
console.log(s1.length) // 5

s1.length = 7
console.log(s1.length) // 5

// 上面代码表示字符串的 length 属性无法改变，但是不会报错。
