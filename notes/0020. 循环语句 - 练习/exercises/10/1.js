const num = 233
let isFind = false
for (let i = 2; i <= num - 1; i++) {
  if (num % i === 0) {
    isFind = true
    break
  }
}
if (num <= 1 || isFind) {
  console.log(`${num} 不是一个素数`)
} else {
  console.log(`${num} 是一个素数`)
}

// 最终输出结果：
// 233 是一个素数
