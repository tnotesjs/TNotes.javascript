var a = [undefined, undefined, undefined]

a.forEach(function (x, i) {
  console.log(i + '. ' + x)
})
// 0. undefined
// 1. undefined
// 2. undefined

for (var i in a) {
  console.log(i)
}
// 0
// 1
// 2

console.log(Object.keys(a)) // ['0', '1', '2']
// 如果某个位置是 undefined，遍历的时候就不会被跳过。

/* 结论：
数组的某个位置是空位，与某个位置是undefined，是不一样的。
如果是空位，使用数组的forEach方法、for...in结构、以及Object.keys方法进行遍历，空位都会被跳过。
空位就是数组没有这个元素，所以不会被遍历到，而undefined则表示数组有这个元素，值是undefined，所以遍历不会跳过。 */