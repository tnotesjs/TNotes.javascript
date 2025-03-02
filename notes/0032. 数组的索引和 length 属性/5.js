// 如果人为设置 length 为不合法的值，JavaScript 会报错。

// 设置负值
[].length = -1
// RangeError: Invalid array length

// 数组元素个数大于等于 2 的 32 次方（数组长度的上限是 2^32）
// [].length = Math.pow(2, 32)
// RangeError: Invalid array length

// 设置字符串
// [].length = 'abc'
// RangeError: Invalid array length