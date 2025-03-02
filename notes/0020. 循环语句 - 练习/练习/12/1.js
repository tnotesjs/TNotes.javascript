var sum = 0 // 记录和
for (var num = 2; num <= 100; num++) {
  // i 是不是素数
  var isFind = false // 默认没有找到能被 1 和自身整数的其余的除数 是素数
  for (var j = 2; j <= Math.sqrt(num); j++) {
    if (num % j === 0) {
      isFind = true // 找到能被 1 和自身整数的其余的除数 不是素数
      break
    }
  }
  if (!isFind) {
    sum += num
  }
}

console.log(sum) // 1060