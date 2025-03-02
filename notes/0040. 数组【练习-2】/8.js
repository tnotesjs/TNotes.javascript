var arr = [234, 2, 6, 23, 211, 23]
for (var index in arr) {
  // 判断arr[index]是不是素数
  var isFind = false
  for (var i = 2; i < arr[index] - 1; i++) {
    if (arr[index] % i === 0) {
      isFind = true
      break
    }
  }
  if (!isFind && arr[index] >= 2) {
    console.log(arr[index])
  }
}

// 输出：
// 2
// 23
// 211
// 23