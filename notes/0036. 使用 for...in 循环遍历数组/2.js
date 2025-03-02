var a = [1, 2, 3]

// for 循环
for (var i = 0; i < a.length; i++) {
  console.log(a[i])
}
// 输出：
// 1
// 2
// 3

// while 循环
var i = 0
while (i < a.length) {
  console.log(a[i])
  i++
}
// 输出：
// 1
// 2
// 3

// 上述两种写法都是 ok 的，
// 其中 for 循环的写法，在开发中相对更为常见一些。