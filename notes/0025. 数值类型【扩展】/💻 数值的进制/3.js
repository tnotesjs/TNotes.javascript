console.log(0888) // 888 ❌ Decimals with leading zeros are not allowed.
console.log(0777) // 511 ❌ Octal literals are not allowed. Use the syntax '0o777'.

// 通常来说，有前导 0 的数值会被视为八进制，但是如果前导 0 后面有数字 8 和 9，则该数值被视为十进制。
// 前导 0 表示八进制，处理时很容易造成混乱。
// ES5 的严格模式和 ES6，已经废除了这种表示法，但是浏览器为了兼容以前的代码，目前还继续支持这种表示法。