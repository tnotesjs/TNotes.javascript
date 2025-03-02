// 写法 1
function logArgs() {
  Array.prototype.forEach.call(arguments, function (elem, i) {
    console.log(i + '. ' + elem)
  })
}

// 写法 2【和写法 1 等效】
// function logArgs() {
//   for (var i = 0; i < arguments.length; i++) {
//     console.log(i + '. ' + arguments[i])
//   }
// }

logArgs('a', 'b', 'c')
// 输出：
// 0. a
// 1. b
// 2. c

// 嫁接数组方法到伪数组上使用：Array.prototype.数组方法.call(arrayLike, 数组方法参数)
// 通过这种方法，在 arguments 对象上面调用 forEach 方法。
