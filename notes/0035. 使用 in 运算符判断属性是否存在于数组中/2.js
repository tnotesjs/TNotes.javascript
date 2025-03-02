var arr = []
arr[5] = 'a'

console.log(arr) // [ <5 empty items>, 'a' ]
console.log(5 in arr) // true
console.log(1 in arr) // false
// 数组 arr 只有一个成员 arr[5]
// 如果你使用 in 来检查 <5 empty items> 这些成员，得到的结果都将是 false。
// 即：如果 in 检测的是稀松数组的空位，得到的结果将是 false。