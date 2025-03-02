// 创建一个数组，并填充 4294967295 个元素
const arr = new Array(4294967295).fill(0)

console.log(arr.length) // 输出 4294967295

// 尝试再添加一个元素
arr.push(1)

console.log(arr.length) // 输出 0，超过了最大长度

// 尝试访问索引为 4294967294 的元素
console.log(arr[4294967294]) // 输出 0

// 尝试访问索引为 4294967295 的元素
console.log(arr[4294967295]) // 输出 undefined，超过了最大索引
