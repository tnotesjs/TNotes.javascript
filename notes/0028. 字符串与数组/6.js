var s = 'hello'
var a = Array.prototype.slice.call(s)

console.log(Array.isArray(s)) // false
console.log(Array.isArray(a)) // true

// 伪数组没法使用真数组的 API
// ❌ TypeError: s.forEach is not a function
// s.forEach((char) => {
//   console.log(char)
// })

// ✅ 真数组可以正常访问数组的 API
a.forEach((char) => {
  console.log(char)
})
