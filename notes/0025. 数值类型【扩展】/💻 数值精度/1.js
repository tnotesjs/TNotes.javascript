var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1
console.log(Number.MAX_SAFE_INTEGER) // 9007199254740991
console.log(MAX_SAFE_INTEGER) // 9007199254740991
console.log(MAX_SAFE_INTEGER + 1) // 9007199254740992
console.log(MAX_SAFE_INTEGER + 2) // 9007199254740992
console.log(MAX_SAFE_INTEGER + 3) // 9007199254740994
console.log(MAX_SAFE_INTEGER + 4) // 9007199254740996

// 上面代码中，大于 2 的 53 次方以后，整数运算的结果开始出现错误。
// 所以，大于 2 的 53 次方的数值，都无法保持精度。
// 由于 2 的 53 次方是一个 16 位的十进制数值，所以简单的法则就是，JavaScript 对 15 位的十进制数都可以精确处理。
