const row = 5
for (let num = 1; num <= row; num++) {
  // 输出一行星号，数量为 i
  let str = ''
  for (let j = 0; j < num; j++) {
    str += '*'
  }
  console.log(str)
}
