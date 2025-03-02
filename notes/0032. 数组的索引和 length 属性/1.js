var arr = ['a', 'b']
console.log(arr.length) // 2

arr[2] = 'c'
console.log(arr.length) // 3

arr[9] = 'd'
console.log(arr.length) // 10

console.log(arr) // [ 'a', 'b', 'c', <6 empty items>, 'd' ]

console.log(arr[5]) // undefined

// 数组是一种动态的数据结构，可以随时增减数组的成员，length 是最大索引值加1。

// 通过这个示例，不难发现：
// 数组的数字键可以是不连续的，对于这种不连续的数组，我们称为稀疏数组。