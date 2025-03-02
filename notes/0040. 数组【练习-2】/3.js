var arr = [1, 2, 3]
var sum = 0
for (var i = 0; i < arr.length; i++) {
  sum += arr[i]
}
console.log(sum) // => 6

// 逻辑很简单，就是遍历数组的每一项，然后将每一项累加到一个变量中。