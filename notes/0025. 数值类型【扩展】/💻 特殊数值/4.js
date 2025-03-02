// 场景 1
console.log(Math.pow(2, 1024)) // Infinity
// 表达式的计算结果太大，超出了能够表示的范围，因此返回Infinity。

// 场景 2
console.log(0 / 0) // NaN
console.log(1 / 0) // Infinity
// 0 除以 0 会得到 NaN，而非 0 数值除以 0，会返回 Infinity。
