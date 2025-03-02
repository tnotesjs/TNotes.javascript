// 假值（falsy）：在 Boolean 上下文中认定为 false 的值，JS 中只有以下这些值是 falsy：
// 1. undefined
// 2. null
// 3. false
// 4. 0、-0、0n
// 5. NaN
// 6. ""或''（空字符串）
// 7. document.all（JS 中只有这一个对象类型是 falsy）

// 可以使用 !!x 或 Boolean(x) 将 x 转换为布尔值来验证

console.log(!!undefined) // false
console.log(Boolean(undefined)) // false

console.log(!!null) // false
console.log(Boolean(null)) // false

console.log(!!0, !!-0, !!0n); // false false false
console.log(Boolean(0), Boolean(-0), Boolean(0n)); // false false false

console.log(!!NaN); // false
console.log(Boolean(NaN)); // false

console.log(!!""); // false
console.log(Boolean("")); // false

console.log(!!''); // false
console.log(Boolean('')); // false

// document.all 是浏览器环境中的 API（见 3.html）
// console.log(!!document.all); // false
// console.log(Boolean(document.all)); // false