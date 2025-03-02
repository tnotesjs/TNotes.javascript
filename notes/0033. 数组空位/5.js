var arr = [1]

console.log(arr) // [1]

arr.length = 3

console.log(arr) // [ 1, <2 empty items> ]

// 上述做法将导致数组的后两个成员位置变为空位。
// 直接给 length 赋一个大于数组当前长度的值，也会产生空位。
// 此时也产生了稀松数组。