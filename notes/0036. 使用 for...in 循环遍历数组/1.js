var arr = [1, 2, 3]
arr.foo = true

for (var key in arr) {
  console.log('key:', key, 'val:', arr[key])
}
// 输出：
// key: 0 val: 1
// key: 1 val: 2
// key: 2 val: 3
// key: foo val: true

// for...in循环不仅可以遍历对象，也可以遍历数组，毕竟数组只是一种特殊对象。
// for...in不仅会遍历数组所有的数字键，还会遍历非数字键。
// 我们在便利数组的时候，往往只希望遍历数字键，因此，不推荐使用for...in遍历数组。