var i = 0

while (i < 10) {
  i++
  if (i % 2 === 0) continue // 若执行 continue 将会跳过后续的代码，直接开启下一轮循环。
  console.log('i 当前为：' + i)
}

// 上面代码只有在 i 为奇数时，才会输出 i 的值。
// 如果 i 为偶数，则直接进入下一轮循环。