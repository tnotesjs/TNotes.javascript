console.log(parseFloat([])) // NaN
console.log(parseFloat('FF2')) // NaN
console.log(parseFloat('')) // NaN
// 如果字符串的第一个字符不能转化为浮点数，则返回 NaN。
// 上面代码中，尤其值得注意，parseFloat 会将空字符串转为 NaN。