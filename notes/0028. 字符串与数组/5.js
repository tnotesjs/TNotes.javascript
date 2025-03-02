var s = 'hello'

delete s[0]
console.log(s) // "hello"

s[1] = 'a'
console.log(s) // "hello"

s[5] = '!'
console.log(s) // "hello"

// 字符串内部的单个字符无法改变和增删，这些操作会默默地失败。
// 这也是和数组之间不同的一个点。
