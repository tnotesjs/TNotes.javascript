let sum = 0 // 记录和
for (let num = 2; num <= 100; num++) {
  // i 是不是素数
  let isFind = false // 默认没有找到能被 1 和自身整数的其余的除数 是素数
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      isFind = true // 找到能被 1 和自身整数的其余的除数 不是素数
      break
    }
  }
  if (!isFind) {
    sum += num
  }
}

console.log(sum) // 1060
