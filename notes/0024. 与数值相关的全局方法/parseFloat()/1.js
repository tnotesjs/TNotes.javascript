console.log(parseFloat('3.14')) // 3.14
// parseFloat 方法用于将一个字符串转为浮点数。

console.log(parseFloat('3.14more non-digit characters')) // 3.14
// 如果字符串包含不能转为浮点数的字符，则不再进行往后转换，返回已经转好的部分。

console.log(parseFloat('\t\v\r12.34\n ')) // 12.34
// parseFloat 方法会自动过滤字符串前导的空格。
