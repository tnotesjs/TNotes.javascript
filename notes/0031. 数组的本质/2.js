var arr = ['a', 'b', 'c']
var objArr = { 0: 'a', 1: 'b', 2: 'c', length: 3 }

console.log(Object.keys(arr)) // ["0", "1", "2"]
console.log(Object.keys(objArr)) // ["0", "1", "2", "length"]

console.log(arr.length, objArr.length) // 3 3

console.log(arr[0], objArr[0]) // a a
console.log(arr[1], objArr[1]) // b b
console.log(arr[2], objArr[2]) // c c

// 数组的特殊性体现在：
// 1. 键名是按次序排列的一组整数（0，1，2...）。
// 2. 这个对象有一个 length 属性，表示成员的数量。

// objArr 是一个对象，arr 是一个数组
// 你会发现 objArr 和 arr 是非常类似的
// 那是因为数组其实就是一个特殊点儿的对象，很多对象上的支持的操作，都可以直接用到数组上。

// arr ≈ objArr
// 你可以认为 arr 就是 objArr 的简写形式