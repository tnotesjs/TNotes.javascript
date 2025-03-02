var r = 5
for (var i = 1; i <= r; i++) { // 循环一次，意味着输出 1 行。
  var str = ''
  for (var j = 0; j < r - i; j++) str += ' ' // 1. 拼接空格，数量为 r - i
  for (var j = 0; j < 2 * i - 1; j++) str += '*' // 2. 拼接星号，数量为 2 * i - 1
  console.log(str)
}
