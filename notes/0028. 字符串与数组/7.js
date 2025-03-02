Array.prototype.forEach.call('hello', (char) => {
  console.log(char)
})
// 输出：
// h
// e
// l
// l
// o

// 通过 Array.prototype.真数组API.call(字符串, cb) 的写法，
// 能够将真数组的 API 嫁接到字符串上使用。