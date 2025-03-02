var obj = {
  length: 0,
}
obj[3] = 'abc'
console.log(obj.length) // 0

var arr = []
arr[3] = 'abc'
console.log(arr.length) // 4

// “类似数组的对象”是具有length属性。
// 但是和数组不同，length属性不是动态值，不会随着成员的变化而变化。

// 上面代码为对象 obj 添加了一个数字键，但是 length 属性没有动态发生变话。
// 这就说明了 obj 不是数组。