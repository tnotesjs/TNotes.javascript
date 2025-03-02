var colors = ['red', 'green', 'blue']
colors.forEach((color, i) => {
  console.log(color, i)
})
// 输出：
// red
// green
// blue

// 数组的遍历，也可以考虑使用数组的 forEach 方法。
// 该方法接收一个回调函数作为参数，并往回调中注入参数：
// 1. 第一个参数是当前遍历到的元素
// 2. 第二个参数是当前遍历到的元素的索引

// forEach 的回调函数还有第 3 个参数，表示当前遍历到的数组本身。
// 不过我们通常不会用到它，平时开发往往使用前面两个就够了。
// 有关 forEach 的更多内容，会在介绍 Array 类时再介绍。
