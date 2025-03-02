var arr = ['a']

console.log(arr) // [ 'a' ]
arr.length = 3
console.log(arr) // [ 'a', <2 empty items> ]

console.log(arr[1]) // undefined

// 当 length 属性设为大于数组个数时，读取新增的位置都会返回 undefined。
// <2 empty items> 这些部分都是 undefined