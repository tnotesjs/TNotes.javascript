// 3*3的二维数组
var arr = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

// 对二维数组求和
var sum = 0
for (var i = 0; i < arr.length; i++) {
  for (var j = 0; j < arr[i].length; j++) {
    sum += arr[i][j]
  }
}
console.log(sum) // 45
