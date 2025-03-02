console.log(parseInt('123')) // 123
// parseInt 方法用于将字符串转为整数。

console.log(parseInt('   81')) // 81
// 如果字符串头部有空格，空格会被自动去除。

// 写法 1
console.log(parseInt(1.23)) // 1
// 写法 2（等同于写法 1）
console.log(parseInt('1.23')) // 1
// 如果 parseInt 的参数不是字符串，则会先转为字符串再转换。