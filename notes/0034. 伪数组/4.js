var arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
}

console.log(arrayLike, Array.isArray(arrayLike)) // { '0': 'a', '1': 'b', '2': 'c', length: 3 } false

var arr = Array.prototype.slice.call(arrayLike)

console.log(arr, Array.isArray(arr)) // [ 'a', 'b', 'c' ] true

// 提示：以下内容涉及到 this 指向以及原型链等知识点。

// 思考：
// Array.prototype.slice.call(arrayLike) 和
// Array.prototype.slice(arrayLike) 之间有什么区别呢？
// 为什么需要多一个 call 呢？

// 如果不使用 call，直接 Array.prototype.slice(arrayLike) 是无效的，
// 因为 slice 方法需要一个数组对象作为上下文（即 this）来访问当前操作的数组。