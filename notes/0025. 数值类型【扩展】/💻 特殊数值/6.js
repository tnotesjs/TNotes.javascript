console.log(Infinity > 1000) // true
console.log(-Infinity < -1000) // true

console.log(Infinity > NaN) // false
console.log(-Infinity > NaN) // false

console.log(Infinity < NaN) // false
console.log(-Infinity < NaN) // false

// Infinity 大于一切数值（除了 NaN），-Infinity 小于一切数值（除了 NaN）。
// Infinity 与 NaN 比较，总是返回 false。