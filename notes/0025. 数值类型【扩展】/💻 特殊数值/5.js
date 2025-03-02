console.log(Infinity === -Infinity) // false

console.log(1 / 0) // Infinity
// 非零正数除以 0，会得到 Infinity

console.log(1 / -0) // -Infinity
// 非零正数除以 -0，会得到 -Infinity

console.log(-1 / -0) // Infinity
// 负数除以 -0，会得到 Infinity