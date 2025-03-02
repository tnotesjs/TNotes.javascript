// 写法 1
// var arr = []
// arr.length = 3

// 写法 2（和写法 1 等效）
var arr = [, , ,]

console.log(arr.length) // 3

arr.forEach((x, i) => {
  console.log(i + '. ' + x)
})
// 不产生任何输出

for (var i in arr) {
  console.log(i)
}
// 不产生任何输出

console.log(Object.keys(arr)) // []

// 数组的某个位置是空位，与某个位置是undefined，是不一样的。
// 如果是空位，使用数组的 forEach 方法、for...in 结构、以及
// Object.keys 方法进行遍历，空位都会被跳过。
// 因此上述操作，都相当于在处理一个空数组。
