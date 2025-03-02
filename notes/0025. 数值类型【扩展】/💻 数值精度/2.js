var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1
console.log(MAX_SAFE_INTEGER) // 9007199254740991
console.log(9007199254740991111) // 9007199254740991000

// 大于 2 的 53 次方以后，多出来的有效数字（最后三位的 111）都会无法保存，变成 0。