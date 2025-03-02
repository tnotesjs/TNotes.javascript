var arr1 = []
arr1.length = 3 // 将会导致数组的长度变成 3
console.log(arr1) // [ <3 empty items> ]

// var arr2 = []
// arr2.length = Math.pow(2, 32)
// 会报错：
// RangeError: Invalid array length
// 因为数组长度超出了 JavaScript 的限制

var arr3 = []
arr3.length = Math.pow(2, 32) - 1
// 不会报错，因为数组长度没有超出 JavaScript 的限制