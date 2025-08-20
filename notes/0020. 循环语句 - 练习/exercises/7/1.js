const row = 3
const col = 5
for (let i = 0; i < row; i++) {
  // 循环r次
  // 在一行内输出 c 个 * 号
  let str = ''
  for (let j = 0; j < col; j++) {
    str += '*'
  }
  console.log(str)
}
