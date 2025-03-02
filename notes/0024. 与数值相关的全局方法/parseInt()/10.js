console.log(parseInt(011, 2)) // NaN
// 等同于
console.log(parseInt(String(011), 2)) // NaN
// 等同于
console.log(parseInt(String(9), 2)) // NaN

// 上面代码中，第一行的 011 会被先转为字符串 9，
// 再因为 9 不是二进制的有效字符，所以返回 NaN。
// JavaScript 不再允许将带有前缀 0 的数字视为八进制数，而是要求忽略这个 0。
// 但是，为了保证兼容性，大部分浏览器并没有部署这一条规定，浏览器依旧认为 011 是八进制数。

console.log(parseInt('011', 2)) // 3
// 如果直接计算 parseInt('011', 2)，011 则是会被当作二进制处理，返回 3。

// 011
// 当你在 nodejs 环境中直接这么写数字，就会得到一个警告。
// Octal literals are not allowed. Use the syntax '0o11'.
// 中文：八进制字面量不允许，请使用语法 '0o11'。