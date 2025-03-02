console.log(isNaN('Hello')) // true
// 相当于
console.log(isNaN(Number('Hello'))) // true

console.log(isNaN('1')) // false
// 相当于
console.log(isNaN(Number('1'))) // false

// isNaN 只对数值有效，如果传入其他值，会被先转成数值。
// 传入字符串的时候，字符串会被先转成数字
// 如果转换结果是 NaN 那么最后返回 true
// 如果转换结果是正常数字，那么返回 false
// 也就是说，isNaN 为 true 的值，有可能不是 NaN，而是一个字符串。
