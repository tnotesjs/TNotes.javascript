var a = []

console.log(a.length) // 0

a['p'] = 'abc' // 添加一个属性

console.log(a.length) // 0

a[2.1] = 'abc' // 再添加一个属性

console.log(a.length) // 0

// 由于数组本质上是一种对象，所以可以为数组添加属性，但是这不影响 length 属性的值。

a[2] = 'abc' // 如果加的是整数作为 key，那么 length 将会改变

console.log(a.length) // 3