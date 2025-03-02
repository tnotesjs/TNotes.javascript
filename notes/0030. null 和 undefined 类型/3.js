var x1 = Number(null)
var x2 = 5 + null

console.log(x1, x2) // 0 5

var x3 = Number(undefined)
var x4 = 5 + undefined

console.log(x3, x4) // NaN

// null 转为数字时，自动变成 0。
// undefined 转为数字时，为 NaN。