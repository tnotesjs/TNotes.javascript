console.log(NaN === NaN) // false
// NaN 不等于任何值，包括它本身。

console.log([NaN].indexOf(NaN)) // -1
// 比如，数组的 indexOf 方法内部使用的是严格相等运算符，所以该方法对 NaN 不成立。

console.log(Boolean(NaN)) // false
// NaN 在布尔运算时被当作 false。

console.log(NaN + 1) // NaN
console.log(NaN - NaN) // NaN
console.log(NaN * 2) // NaN
console.log(NaN / NaN) // NaN
// NaN 与任何数（包括它自己）的运算，得到的都是 NaN。
