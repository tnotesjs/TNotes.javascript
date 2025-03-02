var arr = ['a', 'b', 'c']
console.log(arr.length) // 3

arr.length = 2
console.log(arr) // ['a', 'b']

// length 属性是可写的。
// 如果人为设置一个小于当前成员个数的值，该数组的成员数量会自动减少到 length 设置的值。