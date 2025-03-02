var arr = [undefined, , 2]

console.log(0 in arr) // true
console.log(1 in arr) // false
console.log(2 in arr) // true

// 上述定义的 arr 是一个稀松数组
// 其中第 2 个位置是空 empty
// 所以 1 in arr 得到的结果是 false

// 但是第一个位置是一个 undefined，并非空 empty
// 所以 0 in arr 得到的结果是 true