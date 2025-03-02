var arr = [1, 2, 3]

console.log(arr[1]) // 2

delete arr[1]

console.log(arr[1]) // undefined

// 上面代码用delete命令删除了数组的第二个元素，
// 这个位置就形成了空位，形成了一个稀松数组。