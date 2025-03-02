console.log(5 - 'x') // NaN
// NaN是 JavaScript 的特殊值，表示“非数字”（Not a Number），主要出现在将字符串解析成数字出错的场合。
// 上面代码运行时，会自动将字符串 x 转为数值，但是由于 x 不是数值，所以最后得到结果为 NaN，表示它是“非数字”（NaN）。

console.log(Math.acos(2)) // NaN
console.log(Math.log(-1)) // NaN
console.log(Math.sqrt(-1)) // NaN
// 另外，一些非法的数学函数的运算结果会出现 NaN。

console.log(0 / 0) // NaN
// 0 除以 0 也会得到 NaN。

console.log(typeof NaN) // 'number'
// 需要注意的是，NaN 不是独立的数据类型，而是一个特殊数值，它的数据类型依然属于 Number。
// 使用 typeof 运算符读取其类型，得到的结果是 'number'。
