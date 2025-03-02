console.log(parseFloat([1.23])) // 1.23
// 等同于
console.log(parseFloat(String([1.23]))) // 1.23
// 如果参数不是字符串，则会先转为字符串再转换。

console.log(String([1.23])) // '1.23'
// [1.23] 数组 转为 字符串，结果是 '1.23'。