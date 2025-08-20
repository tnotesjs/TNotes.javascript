const row = 5
for (let i = 1; i <= row; i++) {
  // 循环一次，意味着输出 1 行。
  let str = ''
  for (let j = 0; j < row - i; j++) str += ' ' // 1. 拼接空格，数量为 r - i
  for (let k = 0; k < 2 * i - 1; k++) str += '*' // 2. 拼接星号，数量为 2 * i - 1
  console.log(str)
}
