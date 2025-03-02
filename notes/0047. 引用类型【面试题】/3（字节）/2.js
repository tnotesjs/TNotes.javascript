var foo = { bar: 1 }
// foo 是一个对象，属性 bar 的值为 1

var arr1 = [1, 2, foo]
// arr1 是一个数组，包含三个元素：数值 1，数值 2，以及对象 foo

var arr2 = arr1.slice(1)
// arr2 是 arr1 的一个子数组，从索引 1 开始，即 [2, foo]

arr2[0]++
// arr2[0] 是 2，执行 arr2[0]++ 后变为 3

arr2[1].bar++
// arr2[1] 是 foo，foo.bar 从 1 增加到 2

foo.bar++
// foo.bar 从 2 增加到 3

arr1[2].bar++
// arr1[2] 是 foo，foo.bar 从 3 增加到 4

console.log(arr1[1] === arr2[0])
// arr1[1] 是 2，arr2[0] 是 3，因此结果为 false

console.log(arr1[2] === arr2[1])
// arr1[2] 是 foo，arr2[1] 也是 foo，因此结果为 true

console.log(foo.bar)
// foo.bar 的最终值是 4

console.log('foo:', foo)
console.log('arr1:', arr1)
console.log('arr2:', arr2)
// 输出：
// foo: { bar: 4 }
// arr1: [ 1, 2, { bar: 4 } ]
// arr2: [ 3, { bar: 4 } ]