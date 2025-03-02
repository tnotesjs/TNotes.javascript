var arr = [1, , 1]

console.log(arr.length) // 3
// 虽然这个位置没有值，引擎依然认为这个位置是有效的。
// 所以读取 arr.length 的结果是 3

console.log(arr[1]) // undefined
// 读取数组空位的值，将得到 undefined。