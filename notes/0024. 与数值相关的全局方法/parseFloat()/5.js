console.log(parseFloat(true)) // NaN
console.log(Number(true)) // 1

console.log(parseFloat(null)) // NaN
console.log(Number(null)) // 0

console.log(parseFloat('')) // NaN
console.log(Number('')) // 0

console.log(parseFloat('123.45#')) // 123.45
console.log(Number('123.45#')) // NaN
// parseFloat 的转换结果不同于 Number 函数。
