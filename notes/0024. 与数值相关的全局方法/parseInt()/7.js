console.log(parseInt('10', 37)) // NaN
console.log(parseInt('10', 1)) // NaN
console.log(parseInt('10', 0)) // 10
console.log(parseInt('10', null)) // 10
console.log(parseInt('10', undefined)) // 10
// 如果第二个参数不是数值，会被自动转为一个整数。
// 这个整数只有在 2 到 36 之间，才能得到有意义的结果，超出这个范围，则返回 NaN。
// 如果第二个参数是 0、undefined 和 null，则直接忽略，相当于啥也没传。