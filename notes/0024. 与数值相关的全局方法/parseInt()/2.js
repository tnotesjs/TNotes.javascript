console.log(parseInt('8a')) // 8
console.log(parseInt('12**')) // 12
console.log(parseInt('12.34')) // 12
console.log(parseInt('15e2')) // 15
console.log(parseInt('15px')) // 15
// 字符串转为整数的时候，是一个个字符依次转换，如果遇到不能转为数字的字符，就不再进行下去，返回已经转好的部分。
// 上面代码中，parseInt 的参数都是字符串，结果只返回字符串头部可以转为数字的部分。

console.log(parseInt('abc')) // NaN
console.log(parseInt('.3')) // NaN
console.log(parseInt('')) // NaN
console.log(parseInt('+')) // NaN
console.log(parseInt('+1')) // 1
// 如果字符串的第一个字符不能转化为数字（后面跟着数字的正负号除外），返回 NaN。
