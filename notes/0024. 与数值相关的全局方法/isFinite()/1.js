console.log(isFinite(Infinity)) // false
console.log(isFinite(-Infinity)) // false
console.log(isFinite(NaN)) // false
console.log(isFinite(undefined)) // false
// Infinity、-Infinity、NaN 和 undefined 这几个值会返回 false。

console.log(isFinite(null)) // true
console.log(isFinite(-1)) // true
console.log(isFinite('123')) // true
// isFinite 对于其他的能够被 Number 转为数值的入参，都会返回 true。
