// 在 JavaScript 的 64 位浮点数之中，有一个二进制位是符号位。
// 这意味着，任何一个数都有一个对应的负值，就连 0 也不例外。

console.log(-0 === +0) // true
console.log(0 === -0) // true
console.log(0 === +0) // true

console.log(+0) // 0
console.log(-0) // 0
console.log((-0).toString()) // '0'
console.log((+0).toString()) // '0'
// JavaScript 内部实际上存在 2 个 0：
// 一个是 +0
// 一个是 -0
// 区别就是 64 位浮点数表示法的符号位不同。
// 几乎所有场合，正零和负零都会被当作正常的 0。

console.log(Boolean(+0)) // false
console.log(Boolean(-0)) // false
// +0 和 -0 在布尔运算时被当作 false 处理，它们都是 falsy。

console.log(1 / +0 === 1 / -0) // false
// 唯一有区别的场合是，+0 或 -0 当作分母，返回的值是不相等的。

// 上面的代码之所以出现这样结果，是因为除以正零得到 +Infinity，除以负零得到 -Infinity，这两者是不相等的。
