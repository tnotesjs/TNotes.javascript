console.log(parseInt('314e-2')) // 314
console.log(parseInt('0.0314E+2')) // 0
// 科学计数法在 parseInt 中就是一个普通的字符串，不会先进行计算，再进行转换。

console.log(parseFloat('314e-2')) // 3.14
console.log(parseFloat('0.0314E+2')) // 3.14
// parseFloat 和 parseInt 不同，如果字符串符合科学计数法，则会计算，再进行相应的转换。
