var x1 = undefined
var x2 = null

console.log(x1 == x2) // true
console.log(x1 === x2) // false

// 可以将变量显示地设置为 null 或 undefined
// null与undefined都可以表示“没有”，含义非常相似。
// 使用 == 运算符判断它们之间的关系是相等的，因为它们的值都是“空”。
// 但是使用 === 运算符判断它们之间的关系是不相等的，因为它们的类型不同。
