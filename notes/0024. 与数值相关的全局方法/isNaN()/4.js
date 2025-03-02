console.log(isNaN([])) // false
console.log(isNaN([123])) // false
console.log(isNaN(['123'])) // false

// 对于空数组和只有一个数值成员的数组，isNaN 返回 false。
// 上面代码之所以返回 false，原因是这些数组能被 Number 函数转成数值，请参见《数据类型转换》一章。
